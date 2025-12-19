/**
 * Colores y fuentes para la aplicación EnrutApp.
 * Soporta modo claro y oscuro.
 * Basado en los estilos del frontend web.
 */

import { Platform } from "react-native";

export const Colors = {
  // Modo claro - igual que .light en el frontend
  light: {
    // Colores principales
    primary: "#0071e3",
    secondary: "#f2f2f7",
    background: "#ffffff",
    black: "#fffffff",
    fill: "#f2f2f7",
    border: "#d1d1d6",

    // Textos
    text: "#000000",
    textPrimary: "#000000",
    textSecondary: "#8e8e93",
    textOnPrimary: "#ffffff",
    texOnRed: "#4f1e1e",
    textOnGreen: "#1e4f25",

    // Estados
    red: "#ff3b30",
    green: "#34c759",
    yellow: "#ffcc00",
    textGreen: "#28a745",
    textRed: "#dc3545",
    textYellow: "#ff9500",

    // UI
    tint: "#0071e3",
    icon: "#8e8e93",
    tabIconDefault: "#8e8e93",
    tabIconSelected: "#0071e3",
    card: "#f2f2f7",
  },
  // Modo oscuro - igual que :root en el frontend
  dark: {
    // Colores principales
    primary: "#b4c7ed",
    secondary: "#1e304f",
    background: "#131316",
    black: "#000000",
    fill: "#1b1b1e",
    border: "#292a2c",

    // Textos
    text: "#e4e2e5",
    textPrimary: "#e4e2e5",
    textSecondary: "#8e9098",
    textOnPrimary: "#1e304f",
    texOnRed: "#4f1e1e",
    textOnGreen: "#1e4f25",

    // Estados
    red: "#edb4b4",
    green: "#b4edb8",
    yellow: "#e3edb4",
    textGreen: "#1e4f25",
    textRed: "#4f1e1e",
    textYellow: "#4c4f1e",

    // UI
    tint: "#b4c7ed",
    icon: "#8e9098",
    tabIconDefault: "#8e9098",
    tabIconSelected: "#b4c7ed",
    card: "#1b1b1e",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Familia de fuentes DM Sans
export const FontFamily = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

export const FontSizes = {
  h1: 60,
  h2: 48,
  h3: 34,
  h4: 24,
  h5: 20,
  subtitle1: 16,
  subtitle2: 14,
  body1: 16,
  body2: 14,
  button: 16,
  caption: 12,
  overline: 10,
  badge: 8,
};

export const FontWeights = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const Spacing = {
  xs: 4,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 9,
  md: 12,
  lg: 20,
  xl: 16,
  xxl: 24,
  full: 9999,
};
