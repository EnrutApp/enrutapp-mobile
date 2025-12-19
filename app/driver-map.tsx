import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { io, Socket } from 'socket.io-client';

// Reemplaza con tu IP local si usas dispositivo físico o Android Emulator (10.0.2.2)
// Para iOS Simulator, localhost suele funcionar.
const BACKEND_URL = 'http://192.168.1.4:3000'; 

export default function DriverMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<any>(null); // Referencia para animar el marcador si se desea suavidad extra

  // ID del conductor (simulado, debería venir de tu contexto de auth)
  const DRIVER_ID = 'driver-123';

  useEffect(() => {
    // 1. Configurar Socket.io con el namespace correcto
    const newSocket = io(`${BACKEND_URL}/tracking`);
    
    newSocket.on('connect', () => {
      console.log('Conectado al servidor Socket.io /tracking', newSocket.id);
      
      // Registrar al conductor al conectar
      newSocket.emit('registerDriver', { driverId: DRIVER_ID });
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor');
    });

    setSocket(newSocket);

    // 2. Solicitar permisos y comenzar tracking
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para el conductor.');
        return;
      }

      // Obtener ubicación inicial para centrar el mapa
      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Iniciar seguimiento en tiempo real
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Actualizar cada 2 segundos
          distanceInterval: 10, // O cada 10 metros
        },
        (newLocation) => {
          setLocation(newLocation);
          
          // Emitir evento al backend usando el formato UpdateLocationDto
          if (newSocket.connected) {
            newSocket.emit('updateLocation', {
              driverId: DRIVER_ID,
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              heading: newLocation.coords.heading,
              speed: newLocation.coords.speed,
              timestamp: new Date().toISOString(),
            });
          }
        }
      );
    })();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // Google Maps en Android, Apple Maps en iOS (para Expo Go)
        showsUserLocation={true} // Muestra el punto azul del sistema también
        initialRegion={{
          latitude: 3.4516, // Coordenadas por defecto (ej. Cali, Colombia)
          longitude: -76.5320,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Mi Ubicación"
            description="Conductor en ruta"
            // Puedes usar una imagen personalizada para el auto
            // image={require('../../assets/car-icon.png')} 
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
