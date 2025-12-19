/**
 * Modal reutilizable para EnrutApp Mobile
 * Similar al modal del frontend web
 */

import React from "react";
import { Pressable, Modal as RNModal, StyleSheet, View } from "react-native";

import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlay?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnOverlay = true,
}: ModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={closeOnOverlay ? onClose : undefined}
        />

        <View
          style={[
            styles.content,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    overflow: "hidden",
  },
});
