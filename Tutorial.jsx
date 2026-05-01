import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rw, rh, rf } from "./configs/responsive";

const STEPS = [
  {
    title: "ניהול עובדים",
    icon: "account-cog",
    iconColor: "#1e1e1e",
    body: "הכפתור בראש המסך פותח תפריט לניהול עובדים: אפשר להוסיף עובד חדש, לערוך עובד קיים (שם וצבע) או למחוק עובד מהמערכת.",
    bullets: [
      { icon: "account-plus", color: "#10b981", text: "הוספת עובד חדש" },
      { icon: "account-edit", color: "#6366f1", text: "עריכת עובד קיים" },
      { icon: "account-remove", color: "#ef4444", text: "מחיקת עובד" },
    ],
  },
  {
    title: "שיבוץ משמרות",
    icon: "calendar-account",
    iconColor: "#6366f1",
    body: "כל יום בסידור מציג שתי משמרות. לחיצה על אחד הכפתורים פותחת רשימת עובדים לבחירה. ניתן לנקות שיבוץ קיים מתוך אותה רשימה.",
    bullets: [
      { icon: "weather-sunny", color: "#2d6a4f", text: "משמרת בוקר" },
      { icon: "weather-night", color: "#7209b7", text: "משמרת לילה" },
    ],
    note: "המערכת תחסום שיבוץ של אותו עובד במשמרות סמוכות (לילה ואז בוקר למחרת).",
  },
  {
    title: "כפתורי הפעולה התחתונים",
    icon: "gesture-tap-button",
    iconColor: "#1e1e1e",
    body: "שורת הכפתורים שבתחתית המסך מאפשרת לבצע את כל הפעולות העיקריות על הסידור הנוכחי.",
    bullets: [
      { icon: "chevron-right", color: "#6366f1", text: "מעבר לשבוע הקודם" },
      { icon: "whatsapp", color: "#25D366", text: "שיתוף הסידור כתמונה" },
      {
        icon: "content-copy",
        color: "#6366f1",
        text: "שכפול הסידור לשבוע הבא",
      },
      { icon: "trash-can", color: "#E53935", text: "מחיקת כל המשמרות בשבוע" },
      { icon: "chevron-left", color: "#6366f1", text: "מעבר לשבוע הבא" },
    ],
  },
  {
    title: "מחוות מסך",
    icon: "gesture-swipe",
    iconColor: "#6366f1",
    body: "ניתן לנווט ולפעול בסידור גם באמצעות החלקות על המסך:",
    bullets: [
      {
        icon: "gesture-swipe-left",
        color: "#6366f1",
        text: "החלקה שמאלה — מעבר לשבוע הקודם",
      },
      {
        icon: "gesture-swipe-right",
        color: "#6366f1",
        text: "החלקה ימינה — מעבר לשבוע הבא",
      },
      {
        icon: "gesture-swipe-up",
        color: "#25D366",
        text: "החלקה למעלה — שיתוף הסידור",
      },
      {
        icon: "gesture-swipe-down",
        color: "#10b981",
        text: "משיכה למטה — רענון וטעינת הסידור העדכני ביותר",
      },
    ],
  },
];

const STEP_COUNT = STEPS.length;

export default function Tutorial({ visible, onClose }) {
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setStep(0);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [step, visible]);

  function next() {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
    } else {
      AsyncStorage.setItem("tutorialCompleted", "true").catch(() => {});
      onClose?.();
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!visible) return null;
  const data = STEPS[step];
  const isLast = step === STEP_COUNT - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.skipBtn, { top: insets.top + rh(10) }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>דלג</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.card, { opacity: fade }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={data.icon}
              size={32}
              color={data.iconColor}
            />
          </View>

          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.body}>{data.body}</Text>

          {data.bullets && (
            <View style={styles.bullets}>
              {data.bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <MaterialCommunityIcons
                    name={b.icon}
                    size={20}
                    color={b.color}
                  />
                  <Text style={styles.bulletText}>{b.text}</Text>
                </View>
              ))}
            </View>
          )}

          {data.note && <Text style={styles.note}>{data.note}</Text>}

          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === step && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
              onPress={back}
              disabled={step === 0}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={step === 0 ? "#CFD8DC" : "#6366f1"}
              />
              <Text
                style={[styles.navText, step === 0 && { color: "#CFD8DC" }]}
              >
                הקודם
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextText}>{isLast ? "סיום" : "הבא"}</Text>
              {!isLast && (
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={20}
                  color="#FFF"
                />
              )}
              {isLast && (
                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rw(20),
  },
  skipBtn: {
    position: "absolute",
    right: rw(20),
    paddingVertical: rh(6),
    paddingHorizontal: rw(14),
    borderRadius: rw(50),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  skipText: {
    color: "#FFF",
    fontSize: rf(13),
    fontWeight: "600",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: rw(25),
    padding: rw(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  iconCircle: {
    width: rw(60),
    height: rw(60),
    borderRadius: rw(50),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rh(10),
  },
  title: {
    fontSize: rf(18),
    fontWeight: "800",
    color: "#1e1e1e",
    textAlign: "center",
    marginBottom: rh(8),
  },
  body: {
    fontSize: rf(14),
    color: "#374151",
    textAlign: "center",
    lineHeight: rf(20),
    marginBottom: rh(10),
  },
  bullets: {
    width: "100%",
    gap: rh(6),
    marginBottom: rh(8),
  },
  bulletRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: rw(10),
    backgroundColor: "#F9FAFB",
    paddingVertical: rh(6),
    paddingHorizontal: rw(12),
    borderRadius: rw(50),
  },
  bulletText: {
    fontSize: rf(13),
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
  },
  note: {
    fontSize: rf(12),
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: rh(8),
    paddingHorizontal: rw(6),
  },
  dotsRow: {
    flexDirection: "row",
    gap: rw(6),
    marginVertical: rh(10),
  },
  dot: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(50),
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    backgroundColor: "#6366f1",
    width: rw(20),
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: rw(10),
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rh(10),
    paddingHorizontal: rw(14),
    borderRadius: rw(50),
    borderWidth: 1.5,
    borderColor: "#6366f1",
    gap: rw(4),
  },
  navBtnDisabled: {
    borderColor: "#CFD8DC",
  },
  navText: {
    color: "#6366f1",
    fontSize: rf(14),
    fontWeight: "700",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rh(11),
    paddingHorizontal: rw(18),
    borderRadius: rw(50),
    backgroundColor: "#6366f1",
    gap: rw(4),
  },
  nextText: {
    color: "#FFF",
    fontSize: rf(15),
    fontWeight: "800",
  },
});
