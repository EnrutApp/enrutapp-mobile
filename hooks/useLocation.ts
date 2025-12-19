/**
 * Hook personalizado para manejo de ubicación GPS en tiempo real
 * Utiliza expo-location con watchPositionAsync para tracking continuo
 */

import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

export interface LocationData {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  distanceInterval?: number; // Metros mínimos entre actualizaciones
  timeInterval?: number; // Milisegundos mínimos entre actualizaciones
  showsBackgroundLocationIndicator?: boolean;
}

export interface UseLocationReturn {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
}

const defaultOptions: UseLocationOptions = {
  enableHighAccuracy: true,
  distanceInterval: 10, // Actualizar cada 10 metros
  timeInterval: 5000, // O cada 5 segundos
  showsBackgroundLocationIndicator: true,
};

export function useLocation(
  options: UseLocationOptions = {}
): UseLocationReturn {
  const mergedOptions = { ...defaultOptions, ...options };

  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const appState = useRef(AppState.currentState);

  /**
   * Solicitar permisos de ubicación
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero solicitar permiso de ubicación en primer plano
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setError("Permiso de ubicación denegado");
        setHasPermission(false);
        setIsLoading(false);
        return false;
      }

      // En iOS, solicitar también permiso de ubicación en segundo plano
      if (Platform.OS === "ios") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== "granted") {
          console.warn("Permiso de ubicación en segundo plano denegado");
          // No es crítico, continuamos con el permiso de primer plano
        }
      }

      setHasPermission(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al solicitar permisos";
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Iniciar tracking de ubicación
   */
  const startTracking = useCallback(async () => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Verificar si los servicios de ubicación están habilitados
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setError("Los servicios de ubicación están deshabilitados");
        return;
      }

      // Intentar obtener ubicación inicial (puede fallar en simulador)
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Usar Balanced en vez de High para más compatibilidad
        });

        setLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          heading: initialLocation.coords.heading,
          speed: initialLocation.coords.speed,
          accuracy: initialLocation.coords.accuracy,
          timestamp: initialLocation.timestamp,
        });
      } catch (initialError) {
        // En simulador puede fallar, continuamos con watchPosition
        console.warn(
          "No se pudo obtener ubicación inicial, continuando con watch:",
          initialError
        );
      }

      // Iniciar watch de ubicación
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: mergedOptions.enableHighAccuracy
            ? Location.Accuracy.BestForNavigation
            : Location.Accuracy.Balanced,
          distanceInterval: mergedOptions.distanceInterval,
          timeInterval: mergedOptions.timeInterval,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          });
          setError(null);
        }
      );

      setIsTracking(true);
      setError(null);
      console.log("📍 Tracking de ubicación iniciado");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar tracking";
      setError(errorMessage);
      console.error("Error al iniciar tracking:", err);
    }
  }, [hasPermission, requestPermission, mergedOptions]);

  /**
   * Detener tracking de ubicación
   */
  const stopTracking = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
      console.log("📍 Tracking de ubicación detenido");
    }
  }, []);

  /**
   * Manejar cambios en el estado de la app (background/foreground)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // La app volvió al primer plano
          console.log("📱 App en primer plano");
        } else if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // La app pasó a segundo plano
          console.log("📱 App en segundo plano");
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Verificar permisos al montar el componente
   */
  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === "granted");
      setIsLoading(false);
    };

    checkPermission();
  }, []);

  /**
   * Limpiar suscripción al desmontar
   */
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    location,
    error,
    isLoading,
    hasPermission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  };
}

export default useLocation;
