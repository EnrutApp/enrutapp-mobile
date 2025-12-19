/**
 * Servicio de autenticación para EnrutApp Mobile
 * Solo para conductores: login y recuperación de contraseña
 */

import * as SecureStore from "expo-secure-store";
import { apiClient, ApiResponse } from "./api";

// Tipos
export interface User {
  idUsuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  numDocumento?: string;
  foto?: string; // Propiedad real del backend
  fotoUrl?: string; // Mantener por compatibilidad si es necesario
  rol: {
    idRol: string;
    nombreRol: string;
  };
  tipoDocumento?: {
    idTipoDoc: string;
    nombreTipoDoc: string;
  };
  ciudad?: {
    idCiudad: number;
    nombreCiudad: string;
  };
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Keys para SecureStore
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

// Servicio de autenticación
export const authService = {
  /**
   * Iniciar sesión - Solo para conductores
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      correo: credentials.email,
      contrasena: credentials.password,
    });

    if (response.success && response.data) {
      const { access_token, refresh_token, user } = response.data;

      // Verificar que el usuario sea conductor
      if (user.rol.nombreRol.toLowerCase() !== "conductor") {
        return {
          success: false,
          message: "Esta aplicación es solo para conductores",
        };
      }

      // Guardar tokens de forma segura
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);

      if (refresh_token) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          refresh_token
        );
      }

      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

      // Configurar el token en el cliente API
      apiClient.setToken(access_token);
    }

    return response;
  },

  /**
   * Solicitar código de recuperación de contraseña
   */
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiClient.post("/auth/forgot-password", {
      correo: email,
    });
  },

  /**
   * Restablecer contraseña con código
   */
  resetPassword: async (
    code: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.post("/auth/reset-password", {
      code,
      newPassword,
    });
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    apiClient.setToken(null);
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) return false;

    // Verificar si el token es válido (no expirado)
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        // Token expirado, limpiar
        await authService.logout();
        return false;
      }

      // Configurar token en el cliente
      apiClient.setToken(token);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtener usuario guardado
   */
  getCurrentUser: async (): Promise<User | null> => {
    const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    console.log("💾 Leyendo usuario de storage:", userStr);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Obtener token actual
   */
  getToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Obtener perfil del usuario desde el servidor
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get("/auth/profile");
  },

  /**
   * Obtener datos completos del usuario desde el servidor
   */
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get("/auth/me");
  },

  /**
   * Cambiar contraseña (requiere estar autenticado)
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.patch("/auth/change-password", {
      contrasenaActual: currentPassword,
      nuevaContrasena: newPassword,
    });
  },
  /**
   * Actualizar usuario guardado en storage
   */
  updateStoredUser: async (user: User): Promise<void> => {
    console.log("💾 Guardando usuario en storage:", JSON.stringify(user));
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

export default authService;
