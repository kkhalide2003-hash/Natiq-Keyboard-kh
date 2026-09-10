import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { ThemeMode, useAppSettings } from '@/context/AppSettingsContext';

function Row({
  icon,
  title,
  description,
  right,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  right: React.ReactNode;
  onPress?: () => void;
}) {
  const { isDark } = useAppSettings();
  const palette = isDark ? colors.dark : colors.light;
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: palette.border }, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, { backgroundColor: palette.secondary }]}>
        <Feather name={icon} size={17} color={palette.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: palette.foreground }]}>{title}</Text>
        <Text style={[styles.rowDescription, { color: palette.mutedForeground }]}>{description}</Text>
      </View>
      {right}
    </Pressable>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { key: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const { isDark } = useAppSettings();
  const palette = isDark ? colors.dark : colors.light;
  return (
    <View style={[styles.segmented, { backgroundColor: palette.secondary }]}>
      {options.map((option) => (
        <Pressable key={option.key} onPress={() => onChange(option.key)} style={[styles.segment, value === option.key && { backgroundColor: palette.primary }]}>
          <Text style={[styles.segmentText, { color: value === option.key ? palette.primaryForeground : palette.mutedForeground }]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, rate, keySound, haptics, autoSpeakWords, updateSettings, resetSettings } = useAppSettings();
  const palette = isDark ? colors.dark : colors.light;
  const openKeyboardSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('intent:#Intent;action=android.settings.INPUT_METHOD_SETTINGS;end').catch(() =>
        Alert.alert('تفعيل لوحة نَطِق', 'افتح إعدادات النظام ثم اختر اللغات والإدخال > لوحة المفاتيح على الشاشة > نَطِق.'),
      );
    } else {
      Alert.alert('تفعيل لوحة نَطِق', 'بعد تثبيت APK افتح إعدادات النظام ثم اختر اللغات والإدخال > لوحة المفاتيح على الشاشة > نَطِق.');
    }
  };
  const confirmReset = () => Alert.alert('إعادة الإعدادات', 'سيعود التطبيق للإعدادات الافتراضية.', [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'إعادة', style: 'destructive', onPress: resetSettings },
  ]);

  return (
    <View style={[styles.root, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>تخصيص التجربة</Text>
            <Text style={[styles.title, { color: palette.foreground }]}>الإعدادات</Text>
          </View>
          <View style={[styles.settingsMark, { backgroundColor: palette.primary }]}>
            <Feather name="sliders" size={22} color={palette.primaryForeground} />
          </View>
        </View>

        <Pressable onPress={openKeyboardSettings} style={({ pressed }) => [styles.activationCard, { backgroundColor: palette.primary }, pressed && styles.rowPressed]}>
          <View style={styles.activationCopy}>
            <Text style={[styles.activationLabel, { color: palette.primaryForeground }]}>لوحة النظام</Text>
            <Text style={[styles.activationTitle, { color: palette.primaryForeground }]}>فعّل نَطِق ليعمل في كل مكان</Text>
            <Text style={[styles.activationBody, { color: palette.primaryForeground }]}>واتساب · المتصفح · الملاحظات · أي تطبيق</Text>
          </View>
          <View style={[styles.activationArrow, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Feather name="arrow-up-left" size={21} color={palette.primaryForeground} />
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>المظهر</Text>
          <Feather name="monitor" size={18} color={palette.primary} />
        </View>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Row icon="sun" title="الوضع" description="اختر كيف يظهر التطبيق" right={null} />
          <View style={styles.cardInset}>
            <Segmented value={themeMode} onChange={(value) => updateSettings({ themeMode: value as ThemeMode })} options={[{ key: 'system', label: 'النظام' }, { key: 'light', label: 'نهاري' }, { key: 'dark', label: 'ليلي' }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>الصوت والاستجابة</Text>
          <Feather name="volume-2" size={18} color={palette.primary} />
        </View>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Row
            icon="volume-1"
            title="نطق الحرف"
            description="اسمع المقطع عند لمس الحرف"
            right={<Switch value={keySound} onValueChange={(value) => updateSettings({ keySound: value })} trackColor={{ false: palette.secondary, true: palette.primary }} thumbColor={palette.card} />}
          />
          <Row
            icon="activity"
            title="اهتزاز اللمس"
            description="استجابة خفيفة عند لمس الأزرار"
            right={<Switch value={haptics} onValueChange={(value) => { if (value) Haptics.selectionAsync().catch(() => undefined); updateSettings({ haptics: value }); }} trackColor={{ false: palette.secondary, true: palette.primary }} thumbColor={palette.card} />}
          />
          <Row
            icon="message-circle"
            title="نطق الكلمة عند المسافة"
            description="اقرأ الكلمة الأخيرة تلقائيًا"
            right={<Switch value={autoSpeakWords} onValueChange={(value) => updateSettings({ autoSpeakWords: value })} trackColor={{ false: palette.secondary, true: palette.primary }} thumbColor={palette.card} />}
          />
          <Row icon="fast-forward" title="سرعة النطق" description={`${rate < 0.8 ? 'بطيء' : rate > 0.95 ? 'سريع' : 'طبيعي'} · ${rate.toFixed(2)}`} right={null} />
          <View style={styles.cardInset}>
            <Segmented value={String(rate)} onChange={(value) => updateSettings({ rate: Number(value) })} options={[{ key: '0.65', label: 'بطيء' }, { key: '0.85', label: 'طبيعي' }, { key: '1.1', label: 'سريع' }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>التفعيل والمساعدة</Text>
          <Feather name="help-circle" size={18} color={palette.primary} />
        </View>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Row icon="check-circle" title="حالة لوحة نَطِق" description="اضغط لفتح إعدادات لوحة المفاتيح" right={<Feather name="chevron-left" size={19} color={palette.mutedForeground} />} onPress={openKeyboardSettings} />
          <Row icon="book-open" title="عن نَطِق" description="لوحة عربية تساعدك على سماع صوت الحرف" right={<Text style={[styles.version, { color: palette.mutedForeground }]}>1.0</Text>} />
          <Row icon="rotate-ccw" title="إعادة الإعدادات" description="إرجاع كل الخيارات للوضع الافتراضي" right={<Feather name="chevron-left" size={19} color={palette.mutedForeground} />} onPress={confirmReset} />
        </View>

        <Text style={[styles.footer, { color: palette.mutedForeground }]}>نَطِق — تعلّم، اكتب، واسمع بشكل أوضح</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 18, gap: 17 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  settingsMark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activationCard: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 23, padding: 18, minHeight: 128 },
  activationCopy: { flex: 1, alignItems: 'flex-end' },
  activationLabel: { fontSize: 11, fontWeight: '700', opacity: 0.75 },
  activationTitle: { fontSize: 19, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  activationBody: { fontSize: 11, opacity: 0.78, marginTop: 7, textAlign: 'right' },
  activationArrow: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 13 },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  card: { borderRadius: 21, borderWidth: 1, overflow: 'hidden' },
  row: { minHeight: 70, flexDirection: 'row-reverse', alignItems: 'center', gap: 11, paddingHorizontal: 14, borderBottomWidth: 1 },
  rowPressed: { opacity: 0.76 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  rowDescription: { fontSize: 10, marginTop: 3, textAlign: 'right' },
  cardInset: { padding: 13 },
  segmented: { flexDirection: 'row-reverse', gap: 4, padding: 4, borderRadius: 13 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 9 },
  segmentText: { fontSize: 11, fontWeight: '700' },
  version: { fontSize: 11, fontWeight: '600' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 5 },
});