import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AppTheme, SoundMode, useSettings } from '@/context/SettingsContext';

const themeOptions: { value: AppTheme; label: string }[] = [
  { value: 'system', label: 'تلقائي' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
];
const modeOptions: { value: SoundMode; label: string; sample: string }[] = [
  { value: 'fatha', label: 'فتحة', sample: 'بَ' },
  { value: 'kasra', label: 'كسرة', sample: 'بِ' },
  { value: 'damma', label: 'ضمة', sample: 'بُ' },
  { value: 'sukun', label: 'سكون', sample: 'بْ' },
];

function SettingRow({ title, description, children, colors }: { title: string; description: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.row, { borderBottomColor: colors.border }]}><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.rowDescription, { color: colors.mutedForeground }]}>{description}</Text></View>{children}</View>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();

  const openKeyboardSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('android.settings.INPUT_METHOD_SETTINGS').catch(() => Alert.alert('الإعدادات', 'افتح إعدادات النظام ثم اللغات والإدخال ثم لوحة المفاتيح على الشاشة.'));
    } else {
      Alert.alert('تفعيل اللوحة', 'تفعيل لوحة نَطِق متاح على أندرويد بعد تثبيت ملف APK.');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="arrow-right" size={20} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>الإعدادات</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>خصّص تجربة نَطِق كما تحب</Text></View></View>
        <View style={[styles.activation, { backgroundColor: colors.primary }]}><View style={styles.activationIcon}><Feather name="command" size={22} color={colors.primaryForeground} /></View><View style={styles.activationCopy}><Text style={styles.activationTitle}>لوحة المفاتيح النظامية</Text><Text style={styles.activationBody}>استخدم نَطِق داخل أي تطبيق على هاتفك</Text></View><Pressable onPress={openKeyboardSettings} style={styles.activationButton}><Text style={[styles.activationButtonText, { color: colors.primary }]}>تفعيل</Text></Pressable></View>

        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>النطق</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow title="النطق التلقائي" description="انطق صوت كل حرف عند كتابته" colors={colors}><Switch value={settings.autoSpeak} onValueChange={(value) => updateSettings({ autoSpeak: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor="#FFFFFF" /></SettingRow>
          <SettingRow title="السرعة" description={`${settings.rate === 0.65 ? 'بطيء' : settings.rate === 1.1 ? 'سريع' : 'طبيعي'} · ${settings.rate.toFixed(2)}`} colors={colors}><View style={styles.choiceRow}>{[0.65, 0.85, 1.1].map((rate) => <Pressable key={rate} onPress={() => updateSettings({ rate })} style={[styles.choice, { backgroundColor: settings.rate === rate ? colors.secondary : colors.muted }]}><Text style={[styles.choiceText, { color: settings.rate === rate ? colors.primary : colors.mutedForeground }]}>{rate === 0.65 ? 'بطيء' : rate === 1.1 ? 'سريع' : 'طبيعي'}</Text></Pressable>)}</View></SettingRow>
          <SettingRow title="مقطع الحرف" description="الصوت الذي تسمعه عند الضغط" colors={colors}><View style={styles.modeRow}>{modeOptions.map((mode) => <Pressable key={mode.value} onPress={() => updateSettings({ soundMode: mode.value })} style={[styles.modeChoice, { backgroundColor: settings.soundMode === mode.value ? colors.secondary : colors.muted }]}><Text style={[styles.modeSample, { color: colors.foreground }]}>{mode.sample}</Text><Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>{mode.label}</Text></Pressable>)}</View></SettingRow>
        </View>

        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>المظهر والتفاعل</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow title="المظهر" description="اختَر مظهر التطبيق" colors={colors}><View style={styles.choiceRow}>{themeOptions.map((theme) => <Pressable key={theme.value} onPress={() => updateSettings({ theme: theme.value })} style={[styles.choice, { backgroundColor: settings.theme === theme.value ? colors.secondary : colors.muted }]}><Text style={[styles.choiceText, { color: settings.theme === theme.value ? colors.primary : colors.mutedForeground }]}>{theme.label}</Text></Pressable>)}</View></SettingRow>
          <SettingRow title="اهتزاز المفاتيح" description="استجابة لمسية عند الضغط" colors={colors}><Switch value={settings.haptic} onValueChange={(value) => updateSettings({ haptic: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor="#FFFFFF" /></SettingRow>
          <SettingRow title="إظهار English" description="عرض الحروف الإنجليزية في اللوحة" colors={colors}><Switch value={settings.showEnglish} onValueChange={(value) => updateSettings({ showEnglish: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor="#FFFFFF" /></SettingRow>
        </View>

        <View style={styles.about}><Text style={[styles.aboutTitle, { color: colors.foreground }]}>عن نَطِق</Text><Text style={[styles.aboutBody, { color: colors.mutedForeground }]}>أداة بسيطة تساعدك على ربط شكل الحرف بصوته، مع لوحة مفاتيح عربية مصممة للتعلّم والكتابة اليومية.</Text><Text style={[styles.version, { color: colors.primary }]}>الإصدار 1.0 · صنع من قبل KHALID OUASSI</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20, marginBottom: 22 },
  back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 12, marginTop: 3, textAlign: 'right' },
  activation: { marginHorizontal: 20, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activationIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF2B', alignItems: 'center', justifyContent: 'center' },
  activationCopy: { flex: 1, alignItems: 'flex-end' },
  activationTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  activationBody: { color: '#D7FFFA', fontSize: 11, marginTop: 4, textAlign: 'right' },
  activationButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11 },
  activationButtonText: { fontSize: 12, fontWeight: '700' },
  groupLabel: { fontSize: 12, fontWeight: '700', textAlign: 'right', marginHorizontal: 20, marginTop: 25, marginBottom: 8 },
  group: { marginHorizontal: 20, borderRadius: 19, borderWidth: 1, paddingHorizontal: 14 },
  row: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowCopy: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  rowDescription: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  choiceRow: { flexDirection: 'row', gap: 4 },
  choice: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 7 },
  choiceText: { fontSize: 10, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 4 },
  modeChoice: { borderRadius: 9, paddingHorizontal: 6, paddingVertical: 5, alignItems: 'center' },
  modeSample: { fontSize: 15, fontWeight: '600' },
  modeLabel: { fontSize: 8, marginTop: 2 },
  about: { marginHorizontal: 20, marginTop: 30, alignItems: 'center' },
  aboutTitle: { fontSize: 15, fontWeight: '700' },
  aboutBody: { fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  version: { fontSize: 10, fontWeight: '600', marginTop: 12 },
});