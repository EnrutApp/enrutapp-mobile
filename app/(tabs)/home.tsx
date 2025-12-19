import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BorderRadius, Colors, FontFamily, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const getFormattedDate = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('es-ES', { month: 'long' });
  const weekday = today.toLocaleString('es-ES', { weekday: 'long' });
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalizedWeekday}, ${day} de ${capitalizedMonth}`;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.greeting}>
            Hola, {user?.nombre?.split(' ')[0] || "Usuario"}
          </ThemedText>
          <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
            {getFormattedDate()}
          </ThemedText>
        </View>

        {/* Card de Ingresos */}
        <View style={[styles.incomeCard, { backgroundColor: colors.primary }]}>
          <ThemedText style={[styles.incomeLabel, { color: colors.textOnPrimary }]}>
            Servicios para hoy
          </ThemedText>
          <ThemedText style={[styles.incomeAmount, { color: colors.textOnPrimary }]}>
            2 Servicios
          </ThemedText>
        </View>

        {/* Viajes de hoy */}
        <View style={[styles.sectionCard, { borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Viajes de hoy
            </ThemedText>
            <ThemedText style={styles.sectionTitle}>
              {getFormattedDate()}
            </ThemedText>
            <View style={styles.sectionButtons}>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.btnText, { color: colors.textOnPrimary }]}>
                  Pendientes
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.fill }]}>
                <ThemedText style={[styles.btnText, { color: colors.textSecondary }]}>
                  Completados
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip Card 1 */}
          <View style={[styles.tripCard, { borderColor: colors.border, backgroundColor: colors.fill }]}>
            <View style={styles.tripInfo}>
              <ThemedText style={[styles.tripTime, { color: colors.textSecondary }]}>
                Alaskan
              </ThemedText>
              <View style={styles.from}>
                <ThemedText style={styles.tripName}>
                  Quibdo
                </ThemedText>
                <Icon name="play-arrow" size={13} color={colors.textSecondary} />
                <ThemedText style={styles.tripName}>
                  Medellin
                </ThemedText>
              </View>
            </View>
            <View style={styles.tripActions}>
              <TouchableOpacity style={[styles.btnSmall, { backgroundColor: colors.primary, paddingInline: 14  }]}>
                <ThemedText style={[styles.btnTextSmall, { color: colors.textOnPrimary }]}>
                  4:00AM
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.tripCard, { borderColor: colors.border, backgroundColor: colors.fill }]}>
            <View style={styles.tripInfo}>
              <ThemedText style={[styles.tripTime, { color: colors.textSecondary }]}>
                Alaskan
              </ThemedText>
              <View style={styles.from}>
                <ThemedText style={styles.tripName}>
                  Quibdo
                </ThemedText>
                <Icon name="play-arrow" size={13} color={colors.textSecondary} />
                <ThemedText style={styles.tripName}>
                  Medellin
                </ThemedText>
              </View>
            </View>
            <View style={styles.tripActions}>
              <TouchableOpacity style={[styles.btnSmall, { backgroundColor: colors.primary, paddingInline: 14  }]}>
                <ThemedText style={[styles.btnTextSmall, { color: colors.textOnPrimary }]}>
                  4:00AM
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
  },
  dateText: {
    fontSize: FontSizes.subtitle2,
  },
  // Income Card
  incomeCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  incomeLabel: {
    fontSize: FontSizes.subtitle1,
    fontFamily: FontFamily.regular,
  },
  incomeAmount: {
    fontSize: FontSizes.h3,
    fontFamily: FontFamily.bold,
    lineHeight: FontSizes.h3 * 1.2,
  },
  // Section Card
  sectionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: FontSizes.subtitle2,
  },
  sectionTitle: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.bold,
  },
  sectionButtons: {
    flexDirection: "row",
    marginTop: 5,
    gap: 5,
  },
  summaryTitle: {
    fontSize: FontSizes.h4,
    fontFamily: FontFamily.regular,
  },
  // Trip Card
  tripCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tripInfo: {
    marginBottom: Spacing.sm,
  },
  from: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  tripTime: {
    fontSize: FontSizes.subtitle2,
  },
  tripName: {
    fontSize: FontSizes.h5,
    fontFamily: FontFamily.bold,
  },
  tripActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  btnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  btnText: {
    fontSize: FontSizes.subtitle2,
    fontWeight: '400',
  },
  btnTextOutline: {
    fontSize: FontSizes.button,
  },
  btnPrimarySmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  btnTextSmall: {
    fontSize: FontSizes.caption,
    fontWeight: '400',
  },
  // Stat Card
  statCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.subtitle2,
    fontWeight: '300',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
    lineHeight: FontSizes.h3 * 1.3,
  },
});
