import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

type Step = 1 | 2 | 3;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { forgotPassword, resetPassword } = useAuth();

  // Estados
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs para los inputs del código
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleGoBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    } else if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  // Paso 1: Enviar código al correo
  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email.trim());

      if (result.success) {
        Alert.alert("Código enviado", "Revisa tu correo electrónico");
        setStep(2);
      } else {
        Alert.alert("Error", result.message || "No se pudo enviar el código");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar input del código
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (text && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // Paso 2: Verificar código
  const handleVerifyCode = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Por favor ingresa el código completo");
      return;
    }
    setStep(3);
  };

  // Paso 3: Cambiar contraseña
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar que tenga letras y números
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert("Error", "La contraseña debe incluir letras y números");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const fullCode = code.join("");
      const result = await resetPassword(fullCode, newPassword);

      if (result.success) {
        Alert.alert(
          "¡Listo!",
          "Tu contraseña ha sido actualizada correctamente",
          [
            {
              text: "Iniciar sesión",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "No se pudo restablecer la contraseña"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressWidth = () => {
    switch (step) {
      case 1:
        return "33%";
      case 2:
        return "66%";
      case 3:
        return "100%";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 1:
        return "Ingresa tu correo para recibir un código de verificación.";
      case 2:
        return "Ingresa el código de 6 dígitos que enviamos a tu correo.";
      case 3:
        return "Crea una nueva contraseña segura para tu cuenta.";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.fill }]}
          onPress={handleGoBack}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Restablecer contraseña</ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {getSubtitle()}
            </ThemedText>
          </View>

          {/* Indicador de progreso */}
          <View style={styles.stepIndicator}>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: getProgressWidth(),
                    },
                  ]}
                />
              </View>
            </View>
            <ThemedText
              style={[styles.stepText, { color: colors.textSecondary }]}
            >
              Paso {step} de 3
            </ThemedText>
          </View>

          {/* Paso 1: Email */}
          {step === 1 && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Correo electrónico
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.fill,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="tucorreo@ejemplo.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <ThemedText
                    style={[
                      styles.submitButtonText,
                      { color: colors.textOnPrimary },
                    ]}
                  >
                    Enviar código
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Paso 2: Código de verificación */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Código de verificación
                </ThemedText>
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        codeInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.codeInput,
                        {
                          borderColor: digit ? colors.primary : colors.border,
                          backgroundColor: colors.fill,
                          color: colors.text,
                        },
                      ]}
                      value={digit}
                      onChangeText={(text) =>
                        handleCodeChange(text.slice(-1), index)
                      }
                      onKeyPress={({ nativeEvent }) =>
                        handleCodeKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleVerifyCode}
              >
                <ThemedText
                  style={[
                    styles.submitButtonText,
                    { color: colors.textOnPrimary },
                  ]}
                >
                  Verificar código
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                <ThemedText
                  style={[styles.resendText, { color: colors.textSecondary }]}
                >
                  {isLoading
                    ? "Reenviando..."
                    : "¿No recibiste el código? Reenviar"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Nueva contraseña
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.fill,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Confirmar contraseña
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.fill,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={
                        showConfirmPassword ? "visibility-off" : "visibility"
                      }
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText
                style={[styles.passwordHint, { color: colors.textSecondary }]}
              >
                La contraseña debe tener al menos 6 caracteres, incluir letras y
                números.
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <ThemedText
                    style={[
                      styles.submitButtonText,
                      { color: colors.textOnPrimary },
                    ]}
                  >
                    Restablecer contraseña
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h3,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.xs,
    lineHeight: FontSizes.h3 * 1.2,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.body1,
    lineHeight: FontSizes.body1 * 1.4,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  stepText: {
    fontSize: FontSizes.caption,
    fontFamily: FontFamily.medium,
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.subtitle2,
    fontFamily: FontFamily.medium,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body1,
    fontFamily: FontFamily.regular,
    paddingVertical: Spacing.md,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  resendText: {
    fontSize: FontSizes.subtitle2,
    fontFamily: FontFamily.medium,
    textDecorationLine: "underline",
  },
  passwordHint: {
    fontSize: FontSizes.caption,
    fontFamily: FontFamily.regular,
    lineHeight: FontSizes.caption * 1.4,
  },
});
