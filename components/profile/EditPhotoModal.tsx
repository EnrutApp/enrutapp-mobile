import React from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Icon } from "@/components/ui/icon";
import {
    BorderRadius,
    Colors,
    FontFamily,
    FontSizes,
    Spacing,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { User } from "@/services/authService";

interface EditPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onAddPhoto: () => void;
  onDeletePhoto: () => void;
  uploading: boolean;
}

export function EditPhotoModal({
  isOpen,
  onClose,
  user,
  onAddPhoto,
  onDeletePhoto,
  uploading,
}: EditPhotoModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Editar foto</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Aquí podrás editar tu foto de perfil.
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={onAddPhoto}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <>
                  <Icon name="add-a-photo" size={20} color={colors.textOnPrimary} />
                  <ThemedText style={[styles.actionText, { color: colors.textOnPrimary }]}>
                    Agregar foto
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            {(user?.foto || user?.fotoUrl) && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.fill, marginTop: Spacing.md }]}
                onPress={onDeletePhoto}
                disabled={uploading}
              >
                <Icon name="delete" size={20} color={colors.red} />
                <ThemedText style={[styles.actionText, { color: colors.red }]}>
                  Eliminar foto
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={uploading}
          >
            <ThemedText style={{ color: colors.primary }}>Cancelar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.xs,
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.regular,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  cancelButton: {
    padding: Spacing.sm,
  },
});
