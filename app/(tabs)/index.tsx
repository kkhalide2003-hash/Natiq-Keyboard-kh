import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { SoundMode, useAppSettings } from '@/context/AppSettingsContext';

const arabic = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي','ء','أ','إ','آ','ة','ى'];
const diacritics = ['َ','ً','ُ','ٌ','ِ','ٍ','ْ','ّ','ـ'];
const english = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const modeMarks: Record<SoundMode, string> = { fatha: 'َ', kasra: 'ِ', damma: 'ُ', sukun: 'ْ' };
const modeLabels: { key: SoundMode; label: string; sample: string }[] = [
  { key: 'fatha', label: 'فتحة', sample: 'بَ' },
  { key: 'kasra', label: 'كسرة', sample: 'بِ' },
  { key: 'damma', label: 'ضمة', sample: 'بُ' },
  { key: 'sukun', label: 'سكون', sample: 'بْ' },
];

function IconButton({
  icon,
  label,
  onPress,
  tone = 'neutral',
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'primary';
}) {
  const { isDark } = useAppSettings();
  const palette = isDark ? colors.dark : colors.light;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: tone === 'primary' ? palette.primary : palette.card, borderColor: palette.border },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={17} color={tone === 'primary' ? palette.primaryForeground : palette.foreground} />
      <Text style={[styles.iconButtonText, { color: tone === 'primary' ? palette.primaryForeground : palette.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, soundMode, rate, keySound, haptics, autoSpeakWords, updateSettings } = useAppSettings();
  const palette = isDark ? colors.dark : colors.light;
  const [text, setText] = useState('');
  const [status, setStatus] = useState('جاهز للتدريب');

  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);
  const speak = (value: string, language: 'ar-SA' | 'en-US' = 'ar-SA') => {
    if (!value.trim()) return;
    Speech.stop();
    Speech.speak(value, { language, rate, onStart: () => setStatus(`ينطق الآن: ${value}`), onDone: () => setStatus('جاهز للتدريب') });
  };
  const tapFeedback = () => {
    if (haptics) Haptics.selectionAsync().catch(() => undefined);
  };
  const insert = (value: string, speakValue?: string, language: 'ar-SA' | 'en-US' = 'ar-SA') => {
    tapFeedback();
    setText((current) => current + value);
    if (keySound && speakValue) speak(speakValue, language);
  };
  const speakWordBeforeSpace = () => {
    const word = text.trim().split(/\s+/).at(-1) ?? '';
    setText((current) => `${current} `);
    if (autoSpeakWords && word) speak(word, /[A-Za-z]/.test(word) ? 'en-US' : 'ar-SA');
  };
  const clear = () => {
    tapFeedback();
    setText('');
    setStatus('تم مسح النص');
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={[styles.logo, { backgroundColor: palette.primary }]}>
              <Feather name="volume-2" size={24} color={palette.primaryForeground} />
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: palette.primary }]}>نَطِق / Natiq</Text>
              <Text style={[styles.title, { color: palette.foreground }]}>لوحة النطق والكتابة</Text>
            </View>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: palette.accent }]}>
            <View style={[styles.liveDot, { backgroundColor: palette.success }]} />
            <Text style={[styles.liveText, { color: palette.accentForeground }]}>جاهز</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroKicker, { color: palette.gold }]}>تدريب عملي</Text>
            <Text style={[styles.heroTitle, { color: palette.foreground }]}>صوت الحرف داخل الكلمة</Text>
            <Text style={[styles.heroBody, { color: palette.mutedForeground }]}>
              اكتب أو اضغط الحرف لتسمع «بَ» بدل اسم الحرف «باء». نفس التجربة متاحة داخل أي تطبيق بعد تفعيل لوحة نَطِق.
            </Text>
          </View>
          <View style={[styles.heroMark, { backgroundColor: palette.secondary }]}>
            <Text style={[styles.heroLetter, { color: palette.primary }]}>ن</Text>
            <View style={[styles.soundLine, { backgroundColor: palette.gold }]} />
          </View>
        </View>

        <View style={[styles.editorCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.editorTop}>
            <View style={styles.statusLine}>
              <View style={[styles.statusDot, { backgroundColor: palette.success }]} />
              <Text style={[styles.statusText, { color: palette.mutedForeground }]}>{status}</Text>
            </View>
            <Text style={[styles.counter, { color: palette.mutedForeground }]}>{text.length} حرف · {wordCount} كلمة</Text>
          </View>
          <TextInput
            accessibilityLabel="منطقة التدريب والكتابة"
            multiline
            value={text}
            onChangeText={setText}
            placeholder="ابدأ بكتابة كلمة أو اضغط حرفًا..."
            placeholderTextColor={palette.mutedForeground}
            style={[styles.input, { color: palette.foreground }]}
            textAlign="right"
            textAlignVertical="top"
          />
          <View style={[styles.editorActions, { borderTopColor: palette.border }]}>
            <IconButton icon="copy" label="نسخ" onPress={() => Clipboard.setStringAsync(text).then(() => setStatus('تم نسخ النص')).catch(() => Alert.alert('تعذر النسخ'))} />
            <IconButton icon="trash-2" label="مسح" onPress={clear} />
            <IconButton icon="volume-2" label="قراءة" tone="primary" onPress={() => speak(text)} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إيقاف القراءة"
              onPress={() => { Speech.stop(); setStatus('تم إيقاف الصوت'); }}
              style={({ pressed }) => [styles.stopButton, { borderColor: palette.border }, pressed && styles.pressed]}
            >
              <Feather name="square" size={15} color={palette.destructive} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: palette.foreground }]}>الحركات الصوتية</Text>
            <Text style={[styles.sectionHint, { color: palette.mutedForeground }]}>اختر شكل المقطع الذي تسمعه مع كل حرف</Text>
          </View>
          <Feather name="sliders" size={19} color={palette.primary} />
        </View>
        <View style={styles.modeRow}>
          {modeLabels.map((mode) => (
            <Pressable
              key={mode.key}
              accessibilityRole="button"
              accessibilityLabel={`اختيار ${mode.label}`}
              onPress={() => { tapFeedback(); updateSettings({ soundMode: mode.key }); }}
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: soundMode === mode.key ? palette.primary : palette.card, borderColor: soundMode === mode.key ? palette.primary : palette.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modeSample, { color: soundMode === mode.key ? palette.primaryForeground : palette.foreground }]}>{mode.sample}</Text>
              <Text style={[styles.modeLabel, { color: soundMode === mode.key ? palette.primaryForeground : palette.mutedForeground }]}>{mode.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: palette.foreground }]}>العربية</Text>
            <Text style={[styles.sectionHint, { color: palette.mutedForeground }]}>اضغط الحرف لسماع صوته وإضافته للنص</Text>
          </View>
          <Text style={[styles.sectionCount, { color: palette.primary }]}>{arabic.length}</Text>
        </View>
        <View style={styles.keyGrid}>
          {arabic.map((letter) => (
            <Pressable
              key={letter}
              accessibilityRole="button"
              accessibilityLabel={`حرف ${letter}`}
              onPress={() => insert(letter, `${letter}${modeMarks[soundMode]}`)}
              style={({ pressed }) => [styles.key, { backgroundColor: palette.card, borderColor: palette.border }, pressed && [styles.keyPressed, { backgroundColor: palette.secondary }]]}
            >
              <Text style={[styles.keyText, { color: palette.foreground }]}>{letter}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionRow}>
          {[
            { icon: 'delete' as const, label: 'حذف', action: () => setText((current) => current.slice(0, -1)) },
            { icon: 'corner-down-left' as const, label: 'سطر جديد', action: () => insert('\n') },
            { icon: 'more-horizontal' as const, label: 'مسافة + نطق الكلمة', action: speakWordBeforeSpace },
          ].map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={item.action}
              style={({ pressed }) => [styles.actionButton, { backgroundColor: palette.secondary, borderColor: palette.border }, pressed && styles.pressed]}
            >
              <Feather name={item.icon} size={16} color={palette.primary} />
              <Text style={[styles.actionText, { color: palette.secondaryForeground }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.compactSection}>
          <Text style={[styles.compactTitle, { color: palette.foreground }]}>التشكيل</Text>
          <View style={styles.diacriticRow}>
            {diacritics.map((mark) => (
              <Pressable key={mark} onPress={() => insert(mark, mark)} style={({ pressed }) => [styles.diacritic, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
                <Text style={[styles.diacriticText, { color: palette.primary }]}>{mark}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.compactSection}>
          <View style={styles.inlineHeading}>
            <Text style={[styles.compactTitle, { color: palette.foreground }]}>English</Text>
            <Text style={[styles.sectionHint, { color: palette.mutedForeground }]}>Press a letter to hear it</Text>
          </View>
          <View style={styles.englishGrid}>
            {english.map((letter) => (
              <Pressable key={letter} onPress={() => insert(letter, letter, 'en-US')} style={({ pressed }) => [styles.englishKey, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
                <Text style={[styles.englishText, { color: palette.foreground }]}>{letter}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.tip, { backgroundColor: palette.accent, borderColor: palette.border }]}>
          <Feather name="info" size={17} color={palette.primary} />
          <Text style={[styles.tipText, { color: palette.accentForeground }]}>
            من الإعدادات فعّل لوحة نَطِق لتكتب بها في واتساب والمتصفح وأي مكان على الهاتف.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 18 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  logo: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 12, fontWeight: '700', textAlign: 'right', letterSpacing: 0.4 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  liveBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99 },
  liveDot: { width: 7, height: 7, borderRadius: 7 },
  liveText: { fontSize: 11, fontWeight: '700' },
  hero: { minHeight: 144, borderRadius: 24, borderWidth: 1, padding: 18, flexDirection: 'row-reverse', justifyContent: 'space-between', overflow: 'hidden' },
  heroCopy: { flex: 1, alignItems: 'flex-end', paddingLeft: 10 },
  heroKicker: { fontSize: 12, fontWeight: '700', marginBottom: 7 },
  heroTitle: { fontSize: 22, fontWeight: '700', textAlign: 'right', lineHeight: 29 },
  heroBody: { fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 7 },
  heroMark: { width: 88, height: 108, borderRadius: 24, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  heroLetter: { fontSize: 62, fontWeight: '700', lineHeight: 70 },
  soundLine: { width: 39, height: 3, borderRadius: 3, marginTop: 3 },
  editorCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  editorTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 13 },
  statusLine: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 7 },
  statusText: { fontSize: 11, fontWeight: '600' },
  counter: { fontSize: 10 },
  input: { minHeight: 135, paddingHorizontal: 16, paddingTop: 12, fontSize: 23, lineHeight: 35, textAlignVertical: 'top' },
  editorActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, borderTopWidth: 1, padding: 10 },
  iconButton: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  iconButtonText: { fontSize: 11, fontWeight: '700' },
  stopButton: { marginLeft: 'auto', width: 37, height: 37, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', textAlign: 'right' },
  sectionHint: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  sectionCount: { fontSize: 13, fontWeight: '700' },
  modeRow: { flexDirection: 'row-reverse', gap: 8 },
  modeCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 11, alignItems: 'center', gap: 4 },
  modeSample: { fontSize: 22, fontWeight: '700' },
  modeLabel: { fontSize: 10, fontWeight: '600' },
  keyGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 },
  key: { width: '11.1%', minWidth: 40, flexGrow: 1, height: 51, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 23, fontWeight: '600' },
  keyPressed: { transform: [{ scale: 0.94 }] },
  actionRow: { flexDirection: 'row-reverse', gap: 8 },
  actionButton: { flex: 1, minHeight: 47, paddingHorizontal: 8, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  compactSection: { gap: 10 },
  compactTitle: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  diacriticRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  diacritic: { width: 43, height: 43, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  diacriticText: { fontSize: 23, fontWeight: '700' },
  inlineHeading: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  englishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  englishKey: { width: '9.5%', minWidth: 29, flexGrow: 1, height: 39, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  englishText: { fontSize: 14, fontWeight: '700' },
  tip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9, borderRadius: 16, borderWidth: 1, padding: 13 },
  tipText: { flex: 1, textAlign: 'right', fontSize: 11, lineHeight: 18, fontWeight: '600' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});