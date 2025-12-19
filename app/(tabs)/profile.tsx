
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { LogoutModal } from "@/components/LogoutModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { EditPhotoModal } from "@/components/profile/EditPhotoModal";
import { EditUserModal } from "@/components/profile/EditUserModal";
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
import photoService from "@/services/photoService";

// URL base para las fotos (ajustar según tu backend)
const getPhotoUrl = (fotoUrl: string | undefined) => {
  if (!fotoUrl) {
    console.log("⚠️ No hay fotoUrl para generar URL");
    return null;
  }
  // Si ya es una URL completa, devolverla
  if (fotoUrl.startsWith("http")) return fotoUrl;
  // Si es una ruta relativa, agregar la base URL
  let baseUrl =
    process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:3000";
  
  // Asegurar que no haya doble slash o falte uno
  if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
  const path = fotoUrl.startsWith("/") ? fotoUrl : `/${fotoUrl}`;
  
  const finalUrl = `${baseUrl}${path}?t=${new Date().getTime()}`;
  console.log("🖼️ Generando URL de foto:", finalUrl);
  return finalUrl;
};

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Actualizar datos del usuario al entrar al perfil
  useEffect(() => {
    refreshUser();
  }, []);

  console.log("👤 Usuario en perfil:", JSON.stringify(user, null, 2));
  console.log("👤 Usuario en perfil:", JSON.stringify(user, null, 2));
  console.log("📸 Foto en usuario:", user?.foto);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutModalVisible(false);
    await logout();
    setIsLoggingOut(false);
  };

  const handleEditPhoto = () => {
    setShowEditPhotoModal(true);
  };

  const handleAddPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permiso requerido", "Se requiere acceso a la galería para cambiar la foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  const uploadPhoto = async (uri: string) => {
    setUploading(true);
    try {
      const response = await photoService.uploadProfilePhoto(uri);
      if (response.success) {
        await refreshUser();
        setShowEditPhotoModal(false);
        Alert.alert("Éxito", "Foto de perfil actualizada.");
      } else {
        Alert.alert("Error", response.message || "No se pudo actualizar la foto.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Error de conexión al subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setUploading(true);
    try {
      const response = await photoService.deleteProfilePhoto();
      if (response.success) {
        await refreshUser();
        setShowEditPhotoModal(false);
        Alert.alert("Éxito", "Foto de perfil eliminada.");
      } else {
        Alert.alert("Error", response.message || "No se pudo eliminar la foto.");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "Error de conexión al eliminar la foto.");
    } finally {
      setUploading(false);
    }
  };

  const photoUrl = getPhotoUrl(user?.foto || user?.fotoUrl);

  return (
    <ThemedView style={styles.container}>
      {/* Header con fondo de color */}
      <View
        style={[styles.headerBackground, { backgroundColor: colors.primary }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título de la pantalla */}
        <ThemedText style={[styles.screenTitle, { color: colors.textOnPrimary }]}>Perfil de Usuario</ThemedText>

          {/* Card del perfil */}
          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.fill, borderColor: colors.border },
            ]}
          >
            {/* Foto de perfil */}
            <View style={styles.avatarWrapper}>
              <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="person" size={50} color={colors.textSecondary} />
              )}
            </View>
            {/* Botón de editar foto */}
            <TouchableOpacity
              style={[styles.editPhotoButton, { borderColor: colors.primary, backgroundColor: colors.primary }]}
              onPress={handleEditPhoto}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Icon name="edit" size={16} color={colors.textOnPrimary} />
              )}
            </TouchableOpacity>
            </View>

            {/* Info del conductor */}
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.name, { color: colors.text }]}>
                {user?.nombre.split(" ")[0] || "Nombre del Conductor"}
              </ThemedText>
              
              {/* Badges */}
              <View style={styles.badgesContainer}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ThemedText
                    style={[styles.badgeText, { color: colors.textOnPrimary }]}
                  >
                    {user?.rol?.nombreRol || "Conductor"}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

        {/* Menú de opciones */}
        {/* Sección de detalles (Email) */}
        {/* Menú de opciones (Botones estilo web pero funcionales) */}
        <View style={styles.menuContainer}>
          {/* Datos Personales */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.fill, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => setShowEditUserModal(true)}
          >
            <View style={styles.menuButtonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Icon name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.menuTitle}>Datos personales</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Email, documento y dirección
                </ThemedText>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Mi Vehículo */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.fill, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuButtonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Icon name="directions-car" size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.menuTitle}>Mi vehículo</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Placa, modelo y color
                </ThemedText>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Seguridad */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.fill, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.menuButtonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Icon name="lock" size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.menuTitle}>Seguridad</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Cambiar contraseña
                </ThemedText>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Ayuda */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.fill, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuButtonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Icon name="help" size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.menuTitle}>Ayuda y soporte</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Contactar soporte
                </ThemedText>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.fill }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.logoutText, { color: colors.red }]}>
            Cerrar Sesión
          </ThemedText>
        </TouchableOpacity>

        {/* Versión */}
        <ThemedText style={[styles.version, { color: colors.textSecondary }]}>
          EnrutApp v1.0.0
        </ThemedText>
      </ScrollView>

      {/* Modal de confirmación */}
      <LogoutModal
        isOpen={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />

      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        user={user}
        onSuccess={() => {
          Alert.alert("Éxito", "Información actualizada correctamente.");
          refreshUser(); // Refresh user data after successful edit
        }}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <EditPhotoModal
        isOpen={showEditPhotoModal}
        onClose={() => setShowEditPhotoModal(false)}
        user={user}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
        uploading={uploading}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  screenTitle: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.lg,
    lineHeight: FontSizes.h4 + 2,
  },
  profileCard: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  avatarWrapper: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 25,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  name: {
    fontSize: FontSizes.h3,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.xs,
    textAlign: "center",
    lineHeight: FontSizes.h3 + 2,
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
  },
  menuContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    gap: 2,
  },
  menuTitle: {
    fontSize: FontSizes.body1,
    fontFamily: FontFamily.medium,
  },
  menuSubtitle: {
    fontSize: FontSizes.caption,
    fontFamily: FontFamily.regular,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  logoutText: {
    fontSize: FontSizes.button,
    fontFamily: FontFamily.medium,
  },
  version: {
    fontSize: FontSizes.caption,
    fontFamily: FontFamily.regular,
    textAlign: "center",
  },
});


