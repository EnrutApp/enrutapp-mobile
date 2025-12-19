import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
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
import { User } from "@/services/authService";
import catalogService, { City, DocumentType } from "@/services/catalogService";
import userService from "@/services/userService";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [idCiudad, setIdCiudad] = useState<number | null>(null);
  const [tipoDoc, setTipoDoc] = useState("");
  const [numDocumento, setNumDocumento] = useState("");

  // Catalog state
  const [cities, setCities] = useState<City[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);

  // Picker modals state
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDocTypePicker, setShowDocTypePicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
      if (user) {
        setNombre(user.nombre || "");
        setTelefono(user.telefono || "");
        setDireccion(user.direccion || "");
        setIdCiudad(user.ciudad?.idCiudad || null);
        setTipoDoc(user.tipoDocumento?.idTipoDoc || "");
        setNumDocumento(user.numDocumento || ""); // Read only usually
      }
    }
  }, [isOpen, user]);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const [citiesRes, docTypesRes] = await Promise.all([
        catalogService.getCities(),
        catalogService.getDocumentTypes(),
      ]);

      if (citiesRes.success && citiesRes.data) {
        setCities(citiesRes.data);
      }
      if (docTypesRes.success && docTypesRes.data) {
        setDocTypes(docTypesRes.data);
      }
    } catch (err) {
      console.error("Error loading catalogs:", err);
      setError("Error al cargar datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !idCiudad || !tipoDoc) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await userService.updateUser(user.idUsuario, {
        nombre,
        telefono,
        direccion,
        idCiudad,
        tipoDoc,
      });

      if (response.success) {
        await refreshUser();
        onSuccess();
        onClose();
      } else {
        setError(response.message || "Error al actualizar perfil");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const getCityName = (id: number | null) => {
    if (!id) return "Selecciona una ciudad";
    const city = cities.find((c) => c.idCiudad === id);
    return city ? city.nombreCiudad : "Ciudad no encontrada";
  };

  const getDocTypeName = (id: string) => {
    if (!id) return "Selecciona tipo de documento";
    const docType = docTypes.find((d) => d.idTipoDoc === id);
    return docType ? docType.nombreTipoDoc : "Tipo no encontrado";
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Editar Perfil</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.red + "20" }]}>
                <ThemedText style={[styles.errorText, { color: colors.red }]}>{error}</ThemedText>
              </View>
            )}

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nombre completo *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.fill,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <ThemedText style={styles.label}>Tipo Documento *</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.pickerButton,
                    {
                      backgroundColor: colors.fill,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowDocTypePicker(true)}
                >
                  <ThemedText style={{ color: tipoDoc ? colors.text : colors.textSecondary }}>
                    {getDocTypeName(tipoDoc)}
                  </ThemedText>
                  <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <ThemedText style={styles.label}>No. Documento</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.fill + "80", // Disabled look
                      color: colors.textSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={numDocumento}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Teléfono *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.fill,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Tu número de teléfono"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Ciudad *</ThemedText>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.pickerButton,
                  {
                    backgroundColor: colors.fill,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCityPicker(true)}
              >
                <ThemedText style={{ color: idCiudad ? colors.text : colors.textSecondary }}>
                  {getCityName(idCiudad)}
                </ThemedText>
                <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Dirección *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.fill,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Tu dirección completa"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={onClose}
                disabled={saving}
              >
                <ThemedText style={{ color: colors.text }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <ThemedText style={{ color: colors.textOnPrimary, fontWeight: "600" }}>
                    Guardar Cambios
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.pickerTitle}>Selecciona una ciudad</ThemedText>
              <FlatList
                data={cities}
                keyExtractor={(item) => item.idCiudad.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setIdCiudad(item.idCiudad);
                      setShowCityPicker(false);
                    }}
                  >
                    <ThemedText style={{ color: colors.text }}>{item.nombreCiudad}</ThemedText>
                    {idCiudad === item.idCiudad && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[styles.closePickerButton, { backgroundColor: colors.fill }]}
                onPress={() => setShowCityPicker(false)}
              >
                <ThemedText style={{ color: colors.text }}>Cerrar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Doc Type Picker Modal */}
        <Modal visible={showDocTypePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.pickerTitle}>Tipo de documento</ThemedText>
              <FlatList
                data={docTypes}
                keyExtractor={(item) => item.idTipoDoc}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setTipoDoc(item.idTipoDoc);
                      setShowDocTypePicker(false);
                    }}
                  >
                    <ThemedText style={{ color: colors.text }}>{item.nombreTipoDoc}</ThemedText>
                    {tipoDoc === item.idTipoDoc && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[styles.closePickerButton, { backgroundColor: colors.fill }]}
                onPress={() => setShowDocTypePicker(false)}
              >
                <ThemedText style={{ color: colors.text }}>Cerrar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.body2,
    fontFamily: FontFamily.medium,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.body1,
    fontFamily: FontFamily.regular,
    borderWidth: 1,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  pickerModal: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    maxHeight: "60%",
  },
  pickerTitle: {
    fontSize: FontSizes.h5,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closePickerButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
