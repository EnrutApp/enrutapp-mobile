/**
 * Modal de confirmación para cerrar sesión
 * Diseño basado en el frontend web
 */

import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSizes,
  Spacing,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LogoutModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.black }]}>
        {/* Icono - Pequeño y azul claro como en el frontend */}
        <View style={styles.iconContainer}>
          <Icon name="logout" size={20} color={colors.primary} />
        </View>

        {/* Título - Blanco/texto principal */}
        <ThemedText style={styles.title}>Cerrar sesión</ThemedText>

        {/* Descripción */}
        <ThemedText
          style={[styles.description, { color: colors.textSecondary }]}
        >
          ¿Estás seguro de que quieres cerrar tu sesión?
        </ThemedText>

        {/* Botones - Alineados a la derecha como en el frontend */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <ThemedText
              style={[styles.cancelText, { color: colors.textSecondary }]}
            >
              Cancelar
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: colors.red },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textRed} size="small" />
            ) : (
              <ThemedText
                style={[styles.confirmText, { color: colors.textRed }]}
              >
                Cerrar sesión
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.body1,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    lineHeight: FontSizes.body1 * 1.5,
    marginBottom: Spacing.lg,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  confirmButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 130,
    alignItems: "center",
  },
  confirmText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
