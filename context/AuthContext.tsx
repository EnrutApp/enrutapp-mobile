/**
 * Contexto de autenticación para EnrutApp Mobile
 */

import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

import authService, { LoginCredentials, User } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (
    code: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Verificar autenticación al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  // Proteger rutas basado en autenticación
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const isProtectedRoute = inAuthGroup;

    if (!user && isProtectedRoute) {
      // No autenticado, redirigir a login
      router.replace("/login");
    } else if (user && !isProtectedRoute && segments[0] !== "forgot") {
      // Autenticado, redirigir a home
      router.replace("/(tabs)/home");
    }
  }, [user, segments, isLoading]);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        // Actualizar en storage también
        await authService.updateStoredUser(response.data);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || "Error al iniciar sesión",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Error de conexión. Intenta de nuevo.",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Código enviado al correo"
            : "Error al enviar código"),
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Error de conexión. Intenta de nuevo.",
      };
    }
  };

  const resetPassword = async (code: string, newPassword: string) => {
    try {
      const response = await authService.resetPassword(code, newPassword);

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Contraseña actualizada"
            : "Error al restablecer"),
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Error de conexión. Intenta de nuevo.",
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword
      );

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Contraseña actualizada exitosamente"
            : "Error al cambiar contraseña"),
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: "Error de conexión. Intenta de nuevo.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
