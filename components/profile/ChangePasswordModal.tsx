import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
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
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await changePassword(currentPassword, newPassword);

      if (response.success) {
        setSuccess(response.message || "Contraseña actualizada exitosamente");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(response.message || "Error al cambiar contraseña");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Cambiar Contraseña</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View style={[styles.messageContainer, { backgroundColor: colors.red + "20" }]}>
              <ThemedText style={[styles.messageText, { color: colors.red }]}>{error}</ThemedText>
            </View>
          )}

          {success && (
            <View style={[styles.messageContainer, { backgroundColor: colors.green + "20" }]}>
              <ThemedText style={[styles.messageText, { color: colors.green }]}>{success}</ThemedText>
            </View>
          )}

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Contraseña actual *</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: colors.fill, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Tu contraseña actual"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeButton}>
                <Icon name={showCurrent ? "visibility" : "visibility-off"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Nueva contraseña *</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: colors.fill, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
                <Icon name={showNew ? "visibility" : "visibility-off"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Confirmar contraseña *</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: colors.fill, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <Icon name={showConfirm ? "visibility" : "visibility-off"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <ThemedText style={{ color: colors.text }}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <ThemedText style={{ color: colors.textOnPrimary, fontWeight: "600" }}>
                  Cambiar Contraseña
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.h5,
    fontFamily: FontFamily.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  messageContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  messageText: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: FontSizes.body1,
    fontFamily: FontFamily.regular,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
  },
});
