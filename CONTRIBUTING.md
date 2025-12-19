# 🛠️ Guía de Desarrollo Mobile

Guía práctica para el equipo de desarrollo de **EnrutApp Mobile**.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Flujo de Trabajo Diario](#flujo-de-trabajo-diario)
- [Estándares de Código](#estándares-de-código)
- [Estructura de Expo Router](#estructura-de-expo-router)
- [Convenciones de Commits](#convenciones-de-commits)

---

## 🛠️ Configuración Inicial

### Prerrequisitos

- **Node.js**: >= 18.x
- **Expo Go**: Instalado en tu celular Android o iOS
- **Simuladores** (Opcional): Android Studio o Xcode para emulación local

### Instalación

```bash
# 1. Clonar
git clone https://github.com/EnrutApp/enrutapp-mobile.git
cd enrutapp-mobile

# 2. Instalar dependencias
npm install
```

### Ejecutar

```bash
# Iniciar Metro Bundler
npm start

# -> Escanea el código QR con Expo Go en tu celular
# -> Presiona 'a' para abrir en emulador Android
# -> Presiona 'i' para abrir en simulador iOS
```

---

## 🔄 Flujo de Trabajo Diario

### Trabajar en una nueva feature

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear branch
git checkout -b feature/nombre-pantalla

# 3. Desarrollar
# ... cambios ...

# 4. Verificar
npm run lint

# 5. Commit y Push
git add .
git commit -m "feat: implementar pantalla de perfil"
git push origin feature/nombre-pantalla
```

---

## 📝 Estándares de Código

### React Native & Expo

- ✅ **Componentes Funcionales**: Usa siempre Hooks y componentes funcionales.
- ✅ **Estilos**: Prefiere `StyleSheet.create` sobre estilos en línea.
- ✅ **Tipado**: Usa interfaces para Props y State.

```tsx
// ✅ Ejemplo de Componente
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
}

export const Header: React.FC<Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
```

### Expo Router

- ✅ **Navegación**: Usa el hook `useRouter` para navegar programáticamente.
- ✅ **Links**: Usa el componente `<Link />` para navegación declarativa.
- ✅ **Layouts**: Usa `_layout.tsx` para definir estructuras comunes (Tabs, Stacks).

```tsx
// ✅ Navegación
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/profile");
  };
};
```

---

## 📂 Estructura de Carpetas

```
app/
├── (tabs)/             # Grupo de rutas para Tabs
│   ├── home.tsx
│   ├── map.tsx
│   └── _layout.tsx     # Configuración del Tab Bar
├── index.tsx           # Ruta raíz
└── _layout.tsx         # Root Layout (Stack principal)

components/
├── common/             # Botones, Inputs genéricos
└── modules/            # Componentes específicos de un módulo
```

---

## 💬 Convenciones de Commits

Seguimos **Conventional Commits**:

- `feat`: Nueva pantalla o funcionalidad
- `fix`: Corrección de errores visuales o lógicos
- `style`: Cambios de estilos, colores, fuentes (sin cambio lógico)
- `refactor`: Mejoras de código, división de componentes
- `chore`: Configuración de Expo, assets, deps

**Ejemplos:**

```bash
git commit -m "feat: agregar pantalla de login"
git commit -m "style: actualizar colores del header"
git commit -m "fix: resolver crash en mapa"
```

---

## 📱 Tips para Mobile

1.  **Imágenes**: Usa siempre `expo-image` para mejor rendimiento.
2.  **Fuentes**: Carga las fuentes en el `_layout.tsx` raíz.
3.  **Haptics**: Agrega feedback táctil en botones importantes.
4.  **SafeArea**: Usa `SafeAreaView` o `useSafeAreaInsets` para evitar el notch.

---

<p align="center">
  📝 EnrutApp Mobile Team
</p>
