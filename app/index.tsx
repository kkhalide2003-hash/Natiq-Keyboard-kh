import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/context/SettingsContext';

const arabic = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'أ', 'إ', 'آ', 'ة', 'ى'];
const diacritics = ['َ', 'ً', 'ُ', 'ٌ', 'ِ', 'ٍ', 'ْ', 'ّ', 'ـ'];
const english = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function Logo({ size = 44 }: { size?: number }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <Image source={require('../assets/images/natiq-icon.png')} style={styles.logoImage} />
    </View>
  );
}

function Key({
  label,
  onPress,
  colors,
  wide,
  muted,
}: {
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  wide?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: muted ? colors.secondary : colors.card, borderColor: colors.border },
        wide && styles.wideKey,
        pressed && styles.pressedKey,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`إضافة ${label}`}
    >
      <Text style={[styles.keyText, { color: colors.foreground }, muted && styles.smallKeyText]}>{label}</Text>
    </Pressable>
  );
}

function speakText(text: string, rate: number, language: 'ar-SA' | 'en-US', onDone: () => void) {
  if (!text.trim()) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.onend = onDone;
    window.speechSynthesis.speak(utterance);
    return;
  }
  Speech.stop();
  Speech.speak(text, { language, rate, onDone });
}

export default function HomeScreen() {
  const { settings } = useSettings();
  const colors = useColors(settings.theme === 'system' ? undefined : settings.theme);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [status, setStatus] = useState('جاهز للاستكشاف');
  const [showSplash, setShowSplash] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<'ar' | 'en'>('ar');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;
  const palette = colors;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashOpacity, { toValue: 0, duration: 520, delay: 760, useNativeDriver: true }),
      Animated.spring(splashScale, { toValue: 1, delay: 120, useNativeDriver: true }),
    ]).start(() => setShowSplash(false));
  }, [splashOpacity, splashScale]);

  const updateSelection = (event: { nativeEvent: { selection: { start: number; end: number } } }) => {
    setSelection(event.nativeEvent.selection);
  };

  const insertAtCursor = (value: string) => {
    const start = selection.start;
    const end = selection.end;
    const next = text.slice(0, start) + value + text.slice(end);
    const cursor = start + value.length;
    setText(next);
    setSelection({ start: cursor, end: cursor });
    requestAnimationFrame(() => inputRef.current?.setNativeProps({ selection: { start: cursor, end: cursor } }));
  };

  const triggerHaptic = () => {
    if (settings.haptic && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
  };

  const contextualArabicSound = (character: string) => {
    const marks = { fatha: 'َ', kasra: 'ِ', damma: 'ُ', sukun: 'ْ' };
    return `${character}${marks[settings.soundMode]}`;
  };

  const addCharacter = (character: string, language: 'ar' | 'en') => {
    triggerHaptic();
    insertAtCursor(character);
    if (!settings.autoSpeak) return;
    if (language === 'ar') {
      const isMark = diacritics.includes(character);
      const previous = text.slice(0, selection.start).match(/([^\s])$/)?.[1];
      speakText(isMark && previous ? `${previous}${character}` : contextualArabicSound(character), settings.rate, 'ar-SA', () => setStatus('جاهز للاستكشاف'));
    } else {
      speakText(character, settings.rate, 'en-US', () => setStatus('جاهز للاستكشاف'));
    }
    setStatus(`ينطق: ${character}`);
  };

  const currentWord = () => text.slice(0, selection.start).match(/([^\s]+)$/)?.[1] ?? '';

  const addSpace = () => {
    triggerHaptic();
    const word = currentWord();
    insertAtCursor(' ');
    if (settings.autoSpeak && word) {
      const language = /[A-Za-z]/.test(word) ? 'en-US' : 'ar-SA';
      speakText(word, settings.rate, language, () => setStatus('جاهز للاستكشاف'));
      setStatus('ينطق الكلمة');
    }
  };

  const backspace = () => {
    triggerHaptic();
    if (selection.start !== selection.end) {
      const next = text.slice(0, selection.start) + text.slice(selection.end);
      setText(next);
      setSelection({ start: selection.start, end: selection.start });
      return;
    }
    if (selection.start === 0) return;
    const cursor = selection.start - 1;
    setText(text.slice(0, cursor) + text.slice(selection.start));
    setSelection({ start: cursor, end: cursor });
  };

  const copyText = async () => {
    await Clipboard.setStringAsync(text);
    setStatus('تم نسخ النص');
    triggerHaptic();
  };

  const readAll = () => {
    if (!text.trim()) {
      setStatus('اكتب شيئًا أولًا');
      return;
    }
    speakText(text, settings.rate, /^[^A-Za-z]*$/.test(text) ? 'ar-SA' : 'en-US', () => setStatus('جاهز للاستكشاف'));
    setStatus('يقرأ النص كاملًا');
  };

  const clearText = () => {
    setText('');
    setSelection({ start: 0, end: 0 });
    setStatus('تم مسح النص');
    triggerHaptic();
  };

  if (showSplash) {
    return (
      <Animated.View style={[styles.splash, { opacity: splashOpacity, backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: splashScale }], alignItems: 'center' }}>
          <Logo size={92} />
          <Text style={[styles.splashTitle, { color: colors.foreground }]}>نَطِق</Text>
          <Text style={[styles.splashCaption, { color: colors.mutedForeground }]}>صوت الحرف. قوة الكلمة.</Text>
          <View style={[styles.splashLine, { backgroundColor: colors.primary }]} />
          <Text style={[styles.creator, { color: colors.mutedForeground }]}>صنع من قبل</Text>
          <Text style={[styles.creatorName, { color: colors.primary }]}>KHALID OUASSI</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 34 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Logo />
            <View>
              <Text style={[styles.appName, { color: palette.foreground }]}>نَطِق</Text>
              <Text style={[styles.tagline, { color: palette.mutedForeground }]}>لوحة النطق والكتابة</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={[styles.iconButton, { backgroundColor: palette.card, borderColor: palette.border }]} accessibilityLabel="الإعدادات">
            <Feather name="sliders" size={20} color={palette.foreground} />
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: palette.primary }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>مساحة تدريب ذكية</Text>
            <Text style={styles.heroTitle}>اكتبها، اسمعها، أتقنها.</Text>
            <Text style={styles.heroBody}>صوت الحرف داخل المقطع، وليس اسمه فقط.</Text>
          </View>
          <View style={styles.soundOrb}><Feather name="volume-2" size={26} color={palette.primaryForeground} /></View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metric, { backgroundColor: palette.card, borderColor: palette.border }]}><Text style={[styles.metricValue, { color: palette.foreground }]}>{text.length}</Text><Text style={[styles.metricLabel, { color: palette.mutedForeground }]}>حرفًا الآن</Text></View>
          <View style={[styles.metric, { backgroundColor: palette.card, borderColor: palette.border }]}><Text style={[styles.metricValue, { color: palette.foreground }]}>{settings.autoSpeak ? 'مفعّل' : 'صامت'}</Text><Text style={[styles.metricLabel, { color: palette.mutedForeground }]}>النطق التلقائي</Text></View>
          <View style={[styles.metric, { backgroundColor: palette.card, borderColor: palette.border }]}><Text style={[styles.metricValue, { color: palette.foreground }]}>AR</Text><Text style={[styles.metricLabel, { color: palette.mutedForeground }]}>الوضع الحالي</Text></View>
        </View>

        <View style={[styles.editorCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.cardTitleRow}><Text style={[styles.sectionTitle, { color: palette.foreground }]}>المحرر الصوتي</Text><Text style={[styles.status, { color: palette.primary }]}>{status}</Text></View>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onSelectionChange={updateSelection}
            selection={selection}
            multiline
            textAlign="right"
            placeholder="اكتب هنا أو استخدم المفاتيح..."
            placeholderTextColor={palette.mutedForeground}
            style={[styles.editorInput, { color: palette.foreground }]}
            accessibilityLabel="منطقة الكتابة"
          />
          <View style={[styles.editorFooter, { borderTopColor: palette.border }]}>
            <Text style={[styles.counter, { color: palette.mutedForeground }]}>{text.length} حرف</Text>
            <View style={styles.quickActions}>
              <Pressable onPress={copyText} style={[styles.quickButton, { backgroundColor: palette.secondary }]}><Feather name="copy" size={15} color={palette.secondaryForeground} /><Text style={[styles.quickLabel, { color: palette.secondaryForeground }]}>نسخ</Text></Pressable>
              <Pressable onPress={readAll} style={[styles.quickButton, { backgroundColor: palette.accent }]}><Feather name="volume-2" size={15} color={palette.accentForeground} /><Text style={[styles.quickLabel, { color: palette.accentForeground }]}>قراءة</Text></Pressable>
              <Pressable onPress={clearText} style={[styles.quickButton, { backgroundColor: palette.muted }]}><Feather name="trash-2" size={15} color={palette.mutedForeground} /><Text style={[styles.quickLabel, { color: palette.mutedForeground }]}>مسح</Text></Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={[styles.sectionTitle, { color: palette.foreground }]}>لوحة الحروف</Text><Text style={[styles.sectionHint, { color: palette.mutedForeground }]}>اضغط الحرف لسماع صوته وإضافته</Text></View>
          <View style={[styles.segmented, { backgroundColor: palette.secondary }]}>{(settings.showEnglish ? (['ar', 'en'] as const) : (['ar'] as const)).map((lang) => <Pressable key={lang} onPress={() => setActiveLanguage(lang)} style={[styles.segment, activeLanguage === lang && { backgroundColor: palette.card }]}><Text style={[styles.segmentText, { color: activeLanguage === lang ? palette.primary : palette.mutedForeground }]}>{lang === 'ar' ? 'العربية' : 'English'}</Text></Pressable>)}</View>
        </View>
        <View style={styles.keyGrid}>{(activeLanguage === 'ar' ? arabic : english).map((character) => <Key key={character} label={character} colors={palette} onPress={() => addCharacter(character, activeLanguage)} />)}</View>

        {activeLanguage === 'ar' && (
          <>
            <View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, { color: palette.foreground }]}>الحركات والتشكيل</Text><Text style={[styles.sectionHint, { color: palette.mutedForeground }]}>جرّب مَ، مِ، مُ، مْ</Text></View><Feather name="edit-3" size={20} color={palette.primary} /></View>
            <View style={styles.keyGrid}>{diacritics.map((mark) => <Key key={mark} label={mark} colors={palette} muted onPress={() => addCharacter(mark, 'ar')} />)}</View>
          </>
        )}

        <View style={[styles.utilityCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>أدوات الكتابة</Text>
          <View style={styles.utilityRow}>
            <Key label="⌫" colors={palette} muted wide onPress={backspace} />
            <Key label="مسافة" colors={palette} wide onPress={addSpace} />
            <Key label="↵" colors={palette} muted wide onPress={() => insertAtCursor('\n')} />
          </View>
          <Text style={[styles.utilityHint, { color: palette.mutedForeground }]}>عند الضغط على مسافة، ينطق نَطِق الكلمة كاملة بنطق طبيعي.</Text>
        </View>

        <Pressable onPress={() => Linking.openURL('android.settings.INPUT_METHOD_SETTINGS').catch(() => router.push('/settings'))} style={[styles.keyboardBanner, { backgroundColor: palette.secondary }]}>
          <View style={[styles.bannerIcon, { backgroundColor: palette.primary }]}><Feather name="command" size={20} color={palette.primaryForeground} /></View>
          <View style={styles.bannerCopy}><Text style={[styles.bannerTitle, { color: palette.foreground }]}>فعّل لوحة نَطِق في هاتفك</Text><Text style={[styles.bannerBody, { color: palette.mutedForeground }]}>استخدمها داخل واتساب، الملاحظات، وكل تطبيق</Text></View>
          <Feather name="chevron-left" size={20} color={palette.primary} />
        </Pressable>

        <Text style={[styles.footer, { color: palette.mutedForeground }]}>صنع من قبل <Text style={{ color: palette.primary, fontWeight: '700' }}>KHALID OUASSI</Text></Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { overflow: 'hidden', backgroundColor: '#0D1B20', alignItems: 'center', justifyContent: 'center', shadowColor: '#00A99D', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  logoImage: { width: '100%', height: '100%' },
  splashTitle: { fontSize: 42, fontWeight: '700', marginTop: 18, letterSpacing: 1 },
  splashCaption: { fontSize: 15, marginTop: 4 },
  splashLine: { width: 42, height: 3, borderRadius: 4, marginVertical: 32 },
  creator: { fontSize: 12, letterSpacing: 1 },
  creatorName: { fontSize: 14, fontWeight: '700', marginTop: 5, letterSpacing: 1.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  appName: { fontSize: 25, fontWeight: '700', textAlign: 'right' },
  tagline: { fontSize: 12, marginTop: 2, textAlign: 'right' },
  iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { marginHorizontal: 20, borderRadius: 24, minHeight: 148, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  heroCopy: { flex: 1, alignItems: 'flex-end' },
  heroKicker: { color: '#B8F2EA', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '700', textAlign: 'right' },
  heroBody: { color: '#D7FFFA', fontSize: 13, marginTop: 8, textAlign: 'right' },
  soundOrb: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF2B', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  metricsRow: { flexDirection: 'row', gap: 9, marginHorizontal: 20, marginTop: 12 },
  metric: { flex: 1, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 7, borderWidth: 1, alignItems: 'center' },
  metricValue: { fontSize: 16, fontWeight: '700' },
  metricLabel: { fontSize: 10, marginTop: 4 },
  editorCard: { marginHorizontal: 20, marginTop: 18, borderRadius: 22, borderWidth: 1, padding: 15 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', textAlign: 'right' },
  status: { fontSize: 11, fontWeight: '600' },
  editorInput: { minHeight: 126, fontSize: 22, lineHeight: 34, textAlignVertical: 'top', paddingTop: 7 },
  editorFooter: { borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontSize: 11 },
  quickActions: { flexDirection: 'row', gap: 7 },
  quickButton: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  quickLabel: { fontSize: 11, fontWeight: '600' },
  sectionHeader: { marginHorizontal: 20, marginTop: 23, marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHint: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  segmented: { flexDirection: 'row', borderRadius: 11, padding: 3, gap: 2 },
  segment: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6 },
  segmentText: { fontSize: 11, fontWeight: '600' },
  keyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginHorizontal: 20, justifyContent: 'flex-end' },
  key: { minWidth: 38, height: 48, paddingHorizontal: 6, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B3330', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  wideKey: { flex: 1 },
  keyText: { fontSize: 21, fontWeight: '500' },
  smallKeyText: { fontSize: 18 },
  pressedKey: { opacity: 0.58, transform: [{ scale: 0.96 }] },
  utilityCard: { marginHorizontal: 20, marginTop: 23, borderRadius: 20, borderWidth: 1, padding: 15 },
  utilityRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  utilityHint: { fontSize: 11, lineHeight: 18, textAlign: 'right', marginTop: 11 },
  keyboardBanner: { marginHorizontal: 20, marginTop: 14, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  bannerIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bannerCopy: { flex: 1, alignItems: 'flex-end' },
  bannerTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  bannerBody: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 26 },
});