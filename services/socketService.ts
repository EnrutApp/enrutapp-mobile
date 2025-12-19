/**
 * Servicio de Socket.io para tracking en tiempo real
 * Maneja la conexión WebSocket con el backend para enviar/recibir ubicaciones
 */

import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

// Configuración de URLs
const getSocketUrl = () => {
  const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (ENV_API_URL) {
    // Remover /api del final para obtener la URL base
    return ENV_API_URL.replace("/api", "");
  }

  // Fallback según plataforma
  if (!__DEV__) {
    return "https://enrutapp-backend-g6gkdvavfmarhxdd.westus-01.azurewebsites.net";
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
};

const SOCKET_URL = getSocketUrl();

console.log("🔌 Socket URL:", SOCKET_URL);

// Interface para la ubicación del conductor
export interface DriverLocation {
  driverId: string; // UUID del usuario
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  isOnline?: boolean;
}

// Interface para datos de actualización de ubicación
export interface LocationUpdateData {
  driverId: string; // UUID del usuario
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

// Eventos del socket
export type SocketEvents = {
  // Eventos emitidos por el servidor
  locationUpdate: (data: DriverLocation) => void;
  driverLocationUpdate: (data: DriverLocation) => void;
  driverOnline: (data: { driverId: string }) => void;
  driverOffline: (data: { driverId: string }) => void;
  stats: (data: { totalConnections: number; onlineDrivers: number }) => void;

  // Eventos emitidos por el cliente
  updateLocation: (data: LocationUpdateData) => void;
  registerDriver: (data: { driverId: string }) => void;
  subscribeToDriver: (data: { driverId: string }) => void;
  unsubscribeFromDriver: (data: { driverId: string }) => void;
  getOnlineDrivers: () => void;
  getDriverLocation: (data: { driverId: string }) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private driverId: string | null = null;
  private listenersAttached = false;

  /**
   * Conectar al servidor de tracking
   */
  connect(): Socket {
    if (this.socket) {
      if (!this.listenersAttached) {
        this.setupEventListeners();
        this.listenersAttached = true;
      }

      if (this.socket.connected) {
        console.log("⚡ Socket ya está conectado");
        return this.socket;
      }

      console.log("🔄 Reintentando conexión al servidor de tracking...");
      this.socket.connect();
      return this.socket;
    }

    console.log("🔌 Conectando al servidor de tracking...");

    this.socket = io(`${SOCKET_URL}/tracking`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      // En móvil (iOS/Android) es común que al ir a background se corte el socket.
      // Permitimos más reintentos y además habilitamos reconexión manual (AppState).
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
    this.listenersAttached = true;

    return this.socket;
  }

  /**
   * Configurar listeners de eventos del socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Conectado al servidor de tracking");
      this.reconnectAttempts = 0;

      // Re-registrar al conductor si estaba registrado
      if (this.driverId) {
        this.registerDriver(this.driverId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Desconectado del servidor:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🚫 Error de conexión:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log("⚠️ Máximo de intentos de reconexión alcanzado");
      }
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.log("🔁 Intento de reconexión:", attempt);
    });

    this.socket.on("reconnect_failed", () => {
      console.log(
        "🛑 Reconexión fallida (se puede reintentar al volver a primer plano)"
      );
    });

    this.socket.on("stats", (data) => {
      console.log("📊 Estadísticas del servidor:", data);
    });
  }

  /**
   * Registrar conductor en el servidor
   */
  registerDriver(driverId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.warn("⚠️ Socket no conectado, registrando para reconexión");
        this.driverId = driverId;
        resolve({ success: false });
        return;
      }

      this.driverId = driverId;

      this.socket.emit(
        "registerDriver",
        { driverId },
        (response: { success: boolean }) => {
          console.log("📝 Registro de conductor:", response);
          resolve(response);
        }
      );
    });
  }

  /**
   * Enviar actualización de ubicación
   */
  updateLocation(data: LocationUpdateData): void {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket no conectado, ubicación no enviada");
      return;
    }

    this.socket.emit("updateLocation", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Suscribirse a las actualizaciones de un conductor
   */
  subscribeToDriver(
    driverId: string,
    callback: (location: DriverLocation) => void
  ): () => void {
    if (!this.socket) {
      console.warn("⚠️ Socket no inicializado");
      return () => {};
    }

    // Emitir suscripción
    this.socket.emit("subscribeToDriver", { driverId });

    // Escuchar actualizaciones
    const eventName = "driverLocationUpdate";
    this.socket.on(eventName, callback);

    // Retornar función de limpieza
    return () => {
      this.socket?.off(eventName, callback);
      this.socket?.emit("unsubscribeFromDriver", { driverId });
    };
  }

  /**
   * Escuchar todas las actualizaciones de ubicación (para mapa general)
   */
  onLocationUpdate(callback: (location: DriverLocation) => void): () => void {
    if (!this.socket) {
      console.warn("⚠️ Socket no inicializado");
      return () => {};
    }

    this.socket.on("locationUpdate", callback);

    return () => {
      this.socket?.off("locationUpdate", callback);
    };
  }

  /**
   * Escuchar cuando un conductor se conecta
   */
  onDriverOnline(callback: (data: { driverId: string }) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on("driverOnline", callback);
    return () => this.socket?.off("driverOnline", callback);
  }

  /**
   * Escuchar cuando un conductor se desconecta
   */
  onDriverOffline(callback: (data: { driverId: string }) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on("driverOffline", callback);
    return () => this.socket?.off("driverOffline", callback);
  }

  /**
   * Obtener ubicación actual de un conductor
   */
  getDriverLocation(
    driverId: string
  ): Promise<{ location: DriverLocation | null; isOnline: boolean }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ location: null, isOnline: false });
        return;
      }

      this.socket.emit("getDriverLocation", { driverId }, resolve);
    });
  }

  /**
   * Obtener todos los conductores online
   */
  getOnlineDrivers(): Promise<{ drivers: DriverLocation[] }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ drivers: [] });
        return;
      }

      this.socket.emit("getOnlineDrivers", {}, resolve);
    });
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.driverId = null;
      this.listenersAttached = false;
      console.log("🔌 Desconectado del servidor de tracking");
    }
  }

  /**
   * Obtener instancia del socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();
export default socketService;
