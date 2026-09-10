const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const serviceClass = 'com.natiq.keyboard.NatiqKeyboardService';

function withServiceManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) return mod;
    application.service = application.service ?? [];
    application.service = application.service.filter((service) => service.$?.['android:name'] !== serviceClass);
    application.service.push({
      $: {
        'android:name': serviceClass,
        'android:label': 'نَطِق',
        'android:permission': 'android.permission.BIND_INPUT_METHOD',
        'android:exported': 'true',
      },
      'intent-filter': [
        { action: [{ $: { 'android:name': 'android.view.InputMethod' } }] },
      ],
      'meta-data': [
        { $: { 'android:name': 'android.view.im', 'android:resource': '@xml/method' } },
      ],
    });
    return mod;
  });
}

module.exports = function withNatiqKeyboard(config) {
  config = withServiceManifest(config);
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const androidRoot = mod.modRequest.platformProjectRoot;
      const javaRoot = path.join(androidRoot, 'app', 'src', 'main', 'java', 'com', 'natiq', 'keyboard');
      const xmlRoot = path.join(androidRoot, 'app', 'src', 'main', 'res', 'xml');
      const valuesRoot = path.join(androidRoot, 'app', 'src', 'main', 'res', 'values');
      fs.mkdirSync(javaRoot, { recursive: true });
      fs.mkdirSync(xmlRoot, { recursive: true });
      fs.mkdirSync(valuesRoot, { recursive: true });
      fs.writeFileSync(path.join(xmlRoot, 'method.xml'), `<?xml version="1.0" encoding="utf-8"?>
<input-method xmlns:android="http://schemas.android.com/apk/res/android">
  <subtype android:label="@string/keyboard_arabic" android:imeSubtypeLocale="ar" android:imeSubtypeMode="keyboard" />
</input-method>
`);
      fs.writeFileSync(path.join(valuesRoot, 'natiq_strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources><string name="keyboard_arabic">العربية</string></resources>
`);
      fs.writeFileSync(path.join(javaRoot, 'NatiqKeyboardService.kt'), `package com.natiq.keyboard

import android.graphics.Color
import android.inputmethodservice.InputMethodService
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.util.Locale

class NatiqKeyboardService : InputMethodService(), TextToSpeech.OnInitListener {
  private var tts: TextToSpeech? = null
  private var english = false
  private val navy = Color.rgb(12, 20, 36)
  private val key = Color.rgb(26, 41, 64)
  private val gold = Color.rgb(224, 166, 58)
  private val white = Color.rgb(246, 248, 252)
  private val arabic = listOf("ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","ء","أ","إ","آ","ة","ى")
  private val latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".map { it.toString() }

  override fun onCreate() {
    super.onCreate()
    tts = TextToSpeech(this, this)
  }

  override fun onDestroy() {
    tts?.stop()
    tts?.shutdown()
    super.onDestroy()
  }

  override fun onInit(status: Int) {
    if (status == TextToSpeech.SUCCESS) tts?.language = Locale("ar", "SA")
  }

  override fun onCreateInputView(): View {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(12, 10, 12, 10)
      setBackgroundColor(navy)
    }
    val toolbar = LinearLayout(this).apply {
      gravity = Gravity.CENTER_VERTICAL
      orientation = LinearLayout.HORIZONTAL
    }
    toolbar.addView(TextView(this).apply {
      text = "نَطِق"
      textSize = 16f
      setTextColor(white)
      gravity = Gravity.CENTER
      setTypeface(null, android.graphics.Typeface.BOLD)
      layoutParams = LinearLayout.LayoutParams(0, 48, 1f)
    })
    toolbar.addView(actionButton("⌫", 48) { currentInputConnection.deleteSurroundingText(1, 0) })
    toolbar.addView(actionButton(if (english) "ع" else "EN", 58) { english = !english; setInputView(onCreateInputView()) })
    root.addView(toolbar)
    addKeys(root, if (english) latin else arabic)
    val actions = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
    actions.addView(actionButton("َ", 44) { commitAndSpeak("َ") })
    actions.addView(actionButton("ِ", 44) { commitAndSpeak("ِ") })
    actions.addView(actionButton("ُ", 44) { commitAndSpeak("ُ") })
    actions.addView(actionButton("ْ", 44) { commitAndSpeak("ْ") })
    actions.addView(actionButton("مسافة", 0) {
      val before = currentInputConnection.getTextBeforeCursor(60, 0)?.toString().orEmpty()
      currentInputConnection.commitText(" ", 1)
      before.trim().split(Regex("\\\\s+")).lastOrNull()?.let { speak(it, if (it.any { char -> char in 'A'..'Z' || char in 'a'..'z' }) Locale.US else Locale("ar", "SA")) }
    })
    actions.addView(actionButton("↵", 48) { currentInputConnection.commitText("\\n", 1) })
    root.addView(actions)
    return root
  }

  private fun addKeys(root: LinearLayout, letters: List<String>) {
    var row: LinearLayout? = null
    letters.forEachIndexed { index, letter ->
      if (index % 7 == 0) {
        row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
        root.addView(row)
      }
      row?.addView(actionButton(letter, 0) { commitAndSpeak(letter) })
    }
  }

  private fun actionButton(label: String, width: Int, onClick: () -> Unit): Button {
    return Button(this).apply {
      text = label
      textSize = if (label.length > 3) 11f else 18f
      setTextColor(if (label == "مسافة") navy else white)
      setBackgroundColor(if (label == "مسافة") gold else key)
      setOnClickListener { onClick() }
      minHeight = 46
      minimumHeight = 46
      stateListAnimator = null
      layoutParams = LinearLayout.LayoutParams(if (width == 0) 0 else width, 48, if (width == 0) 1f else 0f).apply {
        setMargins(3, 3, 3, 3)
      }
    }
  }

  private fun commitAndSpeak(value: String) {
    currentInputConnection.commitText(value, 1)
    val sound = if (english) value else if (value.length == 1 && value !in listOf("َ","ِ","ُ","ْ")) value + "َ" else value
    speak(sound, if (english) Locale.US else Locale("ar", "SA"))
  }

  private fun speak(value: String, locale: Locale) {
    tts?.language = locale
    tts?.speak(value, TextToSpeech.QUEUE_FLUSH, null, "natiq-key")
  }

  override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
    super.onStartInput(attribute, restarting)
    english = false
  }
}
`);
      return mod;
    },
  ]);
};