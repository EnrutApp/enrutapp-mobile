import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AssignmentsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Asignaciones</ThemedText>
      <ThemedText style={styles.subtitle}>
        Tus viajes asignados
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 10,
    opacity: 0.7,
  },
});
