# 📱 EnrutApp Mobile

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="80" alt="React Logo" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.73-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-50-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Expo_Router-3.4-black?logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/github/license/EnrutApp/enrutapp-mobile" alt="License" />
</p>

---

## 📋 Descripción

**EnrutApp Mobile** es la aplicación móvil oficial para conductores y usuarios del sistema EnrutApp. Construida con **React Native** y **Expo**, ofrece una experiencia nativa fluida para la gestión de transporte.

### Funcionalidades Principales

- 🗺️ **Seguimiento en Tiempo Real**: Visualización de rutas y ubicación de conductores.
- 🚦 **Gestión de Estados**: Conductores pueden cambiar su estado (Disponible, En Ruta, etc.).
- 📅 **Turnos y Horarios**: Visualización y gestión de turnos asignados.
- 📦 **Encomiendas**: Gestión de entregas y recolecciones.
- 🔔 **Notificaciones**: Alertas en tiempo real sobre cambios en rutas o servicios.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- Expo Go en tu dispositivo móvil (Android/iOS) o Emulador

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/EnrutApp/enrutapp-mobile.git
cd enrutapp-mobile

# Instalar dependencias
npm install
```

### Configuración de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Ejecutar la Aplicación

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android (Emulador o Dispositivo USB)
npm run android

# Ejecutar en iOS (Simulador o Dispositivo USB - Solo Mac)
npm run ios

# Ejecutar en Web
npm run web
```

## 📱 Estructura del Proyecto

El proyecto utiliza **Expo Router** para la navegación basada en archivos.

```
app/
├── (tabs)/                 # Navegación principal por pestañas
├── _layout.tsx             # Layout raíz de la aplicación
├── index.tsx               # Pantalla inicial
├── login.tsx               # Pantalla de inicio de sesión
├── forgot.tsx              # Recuperación de contraseña
├── driver-map.tsx          # Mapa del conductor
│
components/                 # Componentes reutilizables
├── ui/                     # Componentes de UI básicos
├── tracking/               # Componentes de mapa y seguimiento
│
constants/                  # Constantes (Colores, Estilos, Config)
context/                    # Contextos de React (Auth, Socket)
hooks/                      # Custom Hooks
services/                   # Servicios de API y lógica de negocio
assets/                     # Imágenes, fuentes e íconos
```

## 🛠️ Stack Tecnológico

- **Framework**: React Native con Expo SDK 50
- **Navegación**: Expo Router v3
- **Lenguaje**: TypeScript
- **Mapas**: React Native Maps
- **Estilos**: StyleSheet estándar y constantes de diseño
- **Iconos**: Expo Vector Icons
- **HTTP Client**: Fetch API / Axios
- **Socket**: Socket.io-client

## 🤝 Desarrollo

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre el flujo de trabajo y estándares de código de mobile.

### Comandos Útiles

```bash
# Verificación de tipos y linting
npm run lint

# Resetear caché de Expo (si hay problemas de build)
npm start -- --clear
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **EnrutApp Team** - Desarrollo Móvil

---

<p align="center">
  Hecho con ❤️ por el equipo de EnrutApp
</p>
