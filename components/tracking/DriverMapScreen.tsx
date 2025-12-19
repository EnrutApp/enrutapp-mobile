/**
 * Pantalla de mapa para conductor - Tracking GPS en tiempo real
 * Muestra la ubicación del conductor y envía actualizaciones al servidor
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Icon } from "@/components/ui/icon";
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSizes,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocation } from "@/hooks/useLocation";
import socketService from "@/services/socketService";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Callout,
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

// Constantes para el mapa
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;

// Región inicial (Colombia como fallback)
const DEFAULT_REGION: Region = {
  latitude: 4.711,
  longitude: -74.0721,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

interface TrackingStats {
  isConnected: boolean;
  lastUpdate: Date | null;
  updatesCount: number;
}

export default function DriverMapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  // Hooks de ubicación
  const {
    location,
    error: locationError,
    isLoading: locationLoading,
    hasPermission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  } = useLocation({
    enableHighAccuracy: true,
    distanceInterval: 10,
    timeInterval: 3000,
  });

  // Referencias
  const mapRef = useRef<MapView>(null);
  const isInitialMount = useRef(true);
  const lastSentLocation = useRef<{ lat: number; lng: number } | null>(null);

  // Estados
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [isFollowing, setIsFollowing] = useState(true);
  const [stats, setStats] = useState<TrackingStats>({
    isConnected: false,
    lastUpdate: null,
    updatesCount: 0,
  });

  // AppState para reconectar al volver a primer plano
  const appStateRef = useRef(AppState.currentState);

  /**
   * Inicializar conexión de socket
   */
  useEffect(() => {
    const socket = socketService.connect();

    // Actualizar estado de conexión
    socket.on("connect", () => {
      setStats((prev) => ({ ...prev, isConnected: true }));
    });

    socket.on("disconnect", () => {
      setStats((prev) => ({ ...prev, isConnected: false }));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  /**
   * En iOS/Android, al ir a background el JS puede pausarse y el servidor
   * termina cerrando el socket por `ping timeout`. Al volver a primer plano,
   * forzamos un reconnect para recuperar el tracking.
   */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState.match(/inactive|background/) && nextState === "active") {
        console.log("📱 App en primer plano");
        const socket = socketService.connect();
        setStats((prev) => ({ ...prev, isConnected: socket.connected }));

        if (user?.idUsuario) {
          socketService.registerDriver(user.idUsuario);
        }
      }

      if (nextState === "background") {
        console.log("📱 App en segundo plano");
      }
    });

    return () => sub.remove();
  }, [user?.idUsuario]);

  /**
   * Registrar conductor cuando el socket esté conectado
   */
  useEffect(() => {
    console.log("Estado de registro:", {
      isConnected: stats.isConnected,
      user: user,
      idUsuario: user?.idUsuario,
    });

    if (stats.isConnected && user?.idUsuario) {
      console.log("Registrando conductor con ID:", user.idUsuario);
      socketService.registerDriver(user.idUsuario);
    } else if (stats.isConnected && !user?.idUsuario) {
      console.warn("Socket conectado pero no hay idUsuario disponible");
    }
  }, [stats.isConnected, user?.idUsuario]);

  /**
   * Solicitar permisos e iniciar tracking
   */
  useEffect(() => {
    const initTracking = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Permisos requeridos",
            "Para usar el mapa, necesitas habilitar los permisos de ubicación en la configuración.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      await startTracking();
    };

    initTracking();

    return () => {
      stopTracking();
    };
  }, []);

  /**
   * Enviar ubicación al servidor cuando cambie
   */
  useEffect(() => {
    if (!location || !user?.idUsuario || !stats.isConnected) return;

    // Evitar enviar la misma ubicación
    if (
      lastSentLocation.current &&
      lastSentLocation.current.lat === location.latitude &&
      lastSentLocation.current.lng === location.longitude
    ) {
      return;
    }

    // Enviar actualización de ubicación
    socketService.updateLocation({
      driverId: user.idUsuario,
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading ?? undefined,
      speed: location.speed ?? undefined,
    });

    // Guardar última ubicación enviada
    lastSentLocation.current = {
      lat: location.latitude,
      lng: location.longitude,
    };

    // Actualizar estadísticas
    setStats((prev) => ({
      ...prev,
      lastUpdate: new Date(),
      updatesCount: prev.updatesCount + 1,
    }));

    console.log("📤 Ubicación enviada:", {
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
    });
  }, [location, user?.idUsuario, stats.isConnected]);

  /**
   * Centrar mapa en la ubicación inicial
   */
  useEffect(() => {
    if (location && isInitialMount.current && mapRef.current) {
      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      mapRef.current.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
      isInitialMount.current = false;
    }
  }, [location]);

  /**
   * Animar a la ubicación actual cuando cambie (si isFollowing está activo)
   */
  useEffect(() => {
    if (location && isFollowing && mapRef.current && !isInitialMount.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        500
      );
    }
  }, [location, isFollowing]);

  /**
   * Centrar mapa en la ubicación actual
   */
  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        500
      );
      setIsFollowing(true);
    }
  }, [location]);

  /**
   * Toggle tracking
   */
  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  // Mostrar pantalla de carga de permisos
  if (locationLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>
          Verificando permisos de ubicación...
        </ThemedText>
      </ThemedView>
    );
  }

  // Mostrar error si no hay permisos
  if (!hasPermission) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Icon name="location-off" size={64} color={colors.red} />
        <ThemedText style={[styles.errorTitle, { color: colors.text }]}>
          Permisos de ubicación requeridos
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
          Para usar el tracking de conductores, necesitas permitir el acceso a
          tu ubicación.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <ThemedText
            style={[styles.buttonText, { color: colors.textOnPrimary }]}
          >
            Habilitar ubicación
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          // Si el usuario mueve el mapa manualmente, desactivar seguimiento
          if (!isInitialMount.current) {
            setIsFollowing(false);
          }
        }}
        showsUserLocation={false} // Usamos nuestro propio marker
        showsMyLocationButton={false}
        showsCompass={true}
        mapType="standard"
      >
        {/* Círculo de precisión */}
        {location && location.accuracy && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={location.accuracy}
            fillColor="rgba(0, 113, 227, 0.1)"
            strokeColor="rgba(0, 113, 227, 0.3)"
            strokeWidth={1}
          />
        )}

        {/* Marker del conductor */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={location.heading ?? 0}
            flat={true}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.headingArrow,
                  { borderBottomColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.driverMarker,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Icon name="directions-car" size={24} color={colors.primary} />
              </View>
            </View>

            <Callout tooltip>
              <View
                style={[
                  styles.calloutContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.calloutHeader}>
                  <ThemedText style={styles.calloutTitle}>
                    Tu Ubicación
                  </ThemedText>
                  <Icon name="my-location" size={14} color={colors.primary} />
                </View>

                <View style={styles.calloutDivider} />

                <View style={styles.calloutRow}>
                  <ThemedText style={styles.calloutLabel}>
                    Precisión:
                  </ThemedText>
                  <ThemedText style={styles.calloutValue}>
                    {location.accuracy?.toFixed(0) || "N/A"} m
                  </ThemedText>
                </View>

                {location.speed !== null && location.speed >= 0 && (
                  <View style={styles.calloutRow}>
                    <ThemedText style={styles.calloutLabel}>
                      Velocidad:
                    </ThemedText>
                    <ThemedText style={styles.calloutValue}>
                      {(location.speed * 3.6).toFixed(1)} km/h
                    </ThemedText>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      {/* Panel de estado superior */}
      <View
        style={[
          styles.statusPanel,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <View style={styles.statusRow}>
          {/* Estado de conexión */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: stats.isConnected
                    ? colors.primary
                    : colors.red,
                },
              ]}
            />
            <ThemedText
              style={[styles.statusText, { color: colors.textSecondary }]}
            >
              {stats.isConnected ? "Conectado" : "Desconectado"}
            </ThemedText>
          </View>

          {/* Estado de tracking */}
          <View style={styles.statusItem}>
            <Icon
              name={isTracking ? "gps-fixed" : "gps-off"}
              size={16}
              color={isTracking ? colors.primary : colors.textSecondary}
            />
            <ThemedText
              style={[styles.statusText, { color: colors.textSecondary }]}
            >
              {isTracking ? "GPS Activo" : "GPS Inactivo"}
            </ThemedText>
          </View>

          {/* Contador de actualizaciones */}
          <View style={styles.statusItem}>
            <Icon name="sync" size={16} color={colors.primary} />
            <ThemedText
              style={[styles.statusText, { color: colors.textSecondary }]}
            >
              {stats.updatesCount}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Botones flotantes */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            styles.trackingButton,
            { backgroundColor: colors.fill, borderColor: colors.border },
          ]}
          onPress={centerOnUser}
        >
          <Icon
            name={isFollowing ? "my-location" : "location-searching"}
            size={22}
            color={isFollowing ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Botón de toggle tracking */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            styles.trackingButton,
            { backgroundColor: isTracking ? colors.red : colors.green },
          ]}
          onPress={toggleTracking}
        >
          <Icon
            name={isTracking ? "stop" : "play-arrow"}
            size={24}
            style={{ color: isTracking ? colors.texOnRed : colors.textOnGreen }}
          />
        </TouchableOpacity>
      </View>

      {/* Error de ubicación */}
      {locationError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.red }]}>
          <Icon name="error" size={20} color="#ffffff" />
          <ThemedText style={styles.errorBannerText}>
            {locationError}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.body1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSizes.h5,
    fontWeight: "600",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  errorText: {
    fontSize: FontSizes.body1,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    fontSize: FontSizes.button,
    fontWeight: "600",
  },
  statusPanel: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
  },
  coordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  coordsText: {
    fontSize: FontSizes.caption,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  speedText: {
    fontSize: FontSizes.caption,
    fontWeight: "600",
  },
  floatingButtons: {
    position: "absolute",
    right: Spacing.lg,
    bottom: 110,
    gap: Spacing.sm,
  },
  floatingButton: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  trackingButton: {
    borderWidth: 0,
  },
  markerContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  headingArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginBottom: -2, // Conectar visualmente con el círculo
    transform: [{ translateY: -2 }], // Ajuste fino de posición
  },
  driverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
  },
  calloutContainer: {
    width: 180,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.xs,
  },
  calloutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  calloutTitle: {
    fontSize: FontSizes.body2,
    fontWeight: "600",
  },
  calloutDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: Spacing.xs,
  },
  calloutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  calloutLabel: {
    fontSize: FontSizes.caption,
    opacity: 0.6,
  },
  calloutValue: {
    fontSize: FontSizes.caption,
    fontWeight: "500",
  },
  errorBanner: {
    position: "absolute",
    bottom: 100,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  errorBannerText: {
    color: "#ffffff",
    fontSize: FontSizes.body2,
    flex: 1,
  },
});
