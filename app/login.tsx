import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animación para el header cuando aparece el teclado
  const headerOpacity = useState(new Animated.Value(1))[0];
  const headerTranslate = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerTranslate, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerTranslate, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email: email.trim(), password });

      if (result.success) {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Error", result.message || "Credenciales inválidas");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />

        <View style={styles.backgroundContainer}>
          <Image
            source={require("@/assets/images/login-bg.jpg")}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.2)", "transparent"]}
            locations={[0, 0.5, 1]}
            style={styles.statusBarGradient}
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(19, 19, 22, 0.2)",
              "rgba(19, 19, 22, 0.5)",
              "rgba(19, 19, 22, 0.85)",
              colors.background,
            ]}
            locations={[0, 0.3, 0.5, 0.75, 1]}
            style={styles.gradient}
          />
        </View>

        {/* Header animado que se oculta con el teclado */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          {colorScheme === "light" ? (
            <Image
              source={require("../assets/logoPositivo.png")}
              style={styles.logo}
            />
          ) : (
            <Image
              source={require("../assets/logoNegativo.png")}
              style={styles.logo}
            />
          )}
          <ThemedText style={styles.title}>EnrutApp</ThemedText>
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View
            style={[styles.bottomSheet, { backgroundColor: colors.background }]}
          >
            <View style={styles.handleContainer}>
              <View
                style={[styles.handle, { backgroundColor: colors.border }]}
              />
            </View>

            <View style={styles.form}>
              <ThemedText style={styles.formTitle}>Inicia sesión</ThemedText>

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
                    placeholder="Aquí tu correo"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Contraseña
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
                    placeholder="Aquí tu contraseña"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
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

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <ThemedText
                  style={[
                    styles.forgotPasswordText,
                    { color: colors.textSecondary },
                  ]}
                >
                  ¿Olvidaste tu contraseña?
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <ThemedText
                    style={[
                      styles.loginButtonText,
                      { color: colors.textOnPrimary },
                    ]}
                  >
                    Iniciar sesión
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.55,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  statusBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 2,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  header: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.16,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.xxl,
  },
  title: {
    fontSize: FontSizes.h2,
    fontFamily: FontFamily.bold,
    color: "#FFFFFF",
    lineHeight: FontSizes.h2 * 1.3,
  },
  sheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  form: {
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: FontSizes.h3,
    fontFamily: FontFamily.medium,
    lineHeight: FontSizes.h2,
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
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body1,
    paddingVertical: Spacing.sm,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: FontSizes.subtitle2,
    fontFamily: FontFamily.medium,
    textDecorationLine: "underline",
  },
  loginButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
