import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  I18nManager,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState, useEffect } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { db } from "./configs/FirebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import EditUser from "./manageUsers/EditUser";
import DeleteUser from "./manageUsers/DeleteUser";
import AddUser from "./manageUsers/AddUser";
import Tutorial from "./Tutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rw, rh, rf } from "./configs/responsive";

I18nManager.forceRTL(true);

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
        alignSelf: "center",
      }}
    >
      <Image
        source={require("./assets/logoInApp.jpg")}
        style={{ width: 28, height: 28, borderRadius: 14 }}
      />
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#10b981",
            textAlign: "center",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              marginTop: 2,
            }}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
        alignSelf: "center",
      }}
    >
      <Image
        source={require("./assets/logoInApp.jpg")}
        style={{ width: 28, height: 28, borderRadius: 14 }}
      />
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#ef4444",
            textAlign: "center",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              marginTop: 2,
            }}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  errorWithIcon: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
        alignSelf: "center",
      }}
    >
      <Image
        source={require("./assets/logoInApp.jpg")}
        style={{ width: 28, height: 28, borderRadius: 14 }}
      />
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#ef4444",
            textAlign: "center",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Entypo name="info" size={14} color="#6366f1" />
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                textAlign: "center",
              }}
            >
              {text2}
            </Text>
          </View>
        )}
      </View>
    </View>
  ),
  conflictError: ({ text1, text2, props }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
        alignSelf: "center",
      }}
    >
      <Image
        source={require("./assets/logoInApp.jpg")}
        style={{ width: 28, height: 28, borderRadius: 14 }}
      />
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 14, textAlign: "center" }}>
          <Text style={{ fontWeight: "700", color: props?.color }}>
            {text1}
          </Text>
          <Text style={{ fontWeight: "600", color: props?.color }}>
            {" "}
            {text2}
          </Text>
        </Text>
      </View>
    </View>
  ),
  swipeUpHint: ({ text1 }) => <SwipeUpHintToast text={text1} />,
};

function SwipeUpHintToast({ text }) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -6,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 50,
        paddingVertical: 6,
        paddingHorizontal: 14,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      <Animated.View style={{ transform: [{ translateY: bounce }] }}>
        <MaterialCommunityIcons name="chevron-up" size={18} color="#25D366" />
      </Animated.View>
      <Text style={{ fontSize: 12, color: "#25D366", fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}

const HEBREW_DAYS = [
  "יום א'",
  "יום ב'",
  "יום ג'",
  "יום ד'",
  "יום ה'",
  "יום ו'",
  "יום שבת",
];

function getWeekDates(offset = 0) {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + 7 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function formatDate(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    "." +
    String(date.getMonth() + 1).padStart(2, "0") +
    "." +
    date.getFullYear()
  );
}

function formatDateDisplay(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    "." +
    String(date.getMonth() + 1).padStart(2, "0") +
    "." +
    String(date.getFullYear()).slice(-2)
  );
}

function formatShort(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    "." +
    String(date.getMonth() + 1).padStart(2, "0")
  );
}

function parseWeekStart(str) {
  const [day, month, year] = str.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function getWeekDatesFromStart(startStr) {
  const start = parseWeekStart(startStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function App() {
  const [availableWeeks, setAvailableWeeks] = useState(() => [
    formatDate(getWeekDates(0)[0]),
  ]);
  const [weekIdx, setWeekIdx] = useState(0);
  const currentWeekStart =
    availableWeeks[weekIdx] ??
    availableWeeks[availableWeeks.length - 1] ??
    formatDate(getWeekDates(0)[0]);
  const weekDates = getWeekDatesFromStart(currentWeekStart);
  const [users, setUsers] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [picker, setPicker] = useState(null);
  const shotRef = useRef(null);
  const [rawShiftDays, setRawShiftDays] = useState(null);
  const [scheduleInitialized, setScheduleInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [cogMenuOpen, setCogMenuOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const isConnectedRef = useRef(true);
  const cogBtnRef = useRef(null);
  const [cogMenuPos, setCogMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected && state.isInternetReachable !== false;
      if (!connected && isConnectedRef.current) {
        Toast.show({ type: "error", text1: "אין חיבור לאינטרנט" });
      } else if (connected && !isConnectedRef.current) {
        Toast.show({ type: "success", text1: "החיבור לאינטרנט חזר" });
      }
      isConnectedRef.current = !!connected;
    });
    return unsub;
  }, []);

  // Show the tutorial automatically on first launch
  useEffect(() => {
    AsyncStorage.getItem("tutorialCompleted")
      .then((value) => {
        if (value !== "true") setTutorialOpen(true);
      })
      .catch(() => {});
  }, []);

  const UserColors = [
    "#2d6a4f",
    "#0077b6",
    "#7209b7",
    "#99582a",
    "#c1121f",
    "#7cb518",
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Guards"), (snap) => {
      setUsers(
        snap.docs.map((doc) => ({
          id: doc.id,
          order: Number(doc.data().id),
          name: doc.data().name,
          color: doc.data().color,
        })),
      );
      setUsersLoaded(true);
    });
    return unsub;
  }, []);

  // Load all weeks that exist in the DB, plus the default next week
  useEffect(() => {
    const nextWS = formatDate(getWeekDates(0)[0]);
    getDocs(collection(db, "Shifts")).then((snap) => {
      const weekStarts = new Set([nextWS]);
      snap.docs.forEach((doc) => {
        if (doc.data().weekStart) weekStarts.add(doc.data().weekStart);
      });
      const sorted = Array.from(weekStarts).sort(
        (a, b) => parseWeekStart(a) - parseWeekStart(b),
      );
      const idx = sorted.lastIndexOf(nextWS);
      setAvailableWeeks(sorted);
      setWeekIdx(idx >= 0 ? idx : sorted.length - 1);
    });
  }, []);

  // Load shift data for the displayed week
  useEffect(() => {
    setScheduleInitialized(false);
    setRawShiftDays(null);
    setSchedule({});
    const q = query(
      collection(db, "Shifts"),
      where("weekStart", "==", currentWeekStart),
    );
    getDocs(q)
      .then((snap) => {
        if (snap.empty) {
          setRawShiftDays({});
          return;
        }
        const sorted = snap.docs
          .filter((d) => d.data().savedAt)
          .sort((a, b) => b.data().savedAt.seconds - a.data().savedAt.seconds);
        const best = sorted[0] ?? snap.docs[0];
        setRawShiftDays(best.data().days ?? {});
      })
      .catch(() => setRawShiftDays({}))
      .finally(() => setRefreshing(false));
  }, [refreshKey, currentWeekStart]);

  // Once both users and raw shift data are ready, build schedule with IDs
  useEffect(() => {
    if (scheduleInitialized || users.length === 0 || rawShiftDays === null)
      return;
    const newSchedule = {};
    Object.entries(rawShiftDays).forEach(([dateKey, shifts]) => {
      const dayUser = users.find((u) => u.id === shifts.day);
      const nightUser = users.find((u) => u.id === shifts.night);
      newSchedule[dateKey] = {
        day: dayUser?.id ?? null,
        night: nightUser?.id ?? null,
      };
    });
    setSchedule(newSchedule);
    setScheduleInitialized(true);
  }, [users, rawShiftDays, scheduleInitialized]);

  const isLoading = !usersLoaded || rawShiftDays === null;

  function onRefresh() {
    setRefreshing(true);
    const nextWS = formatDate(getWeekDates(0)[0]);
    getDocs(collection(db, "Shifts")).then((snap) => {
      const weekStarts = new Set([nextWS]);
      snap.docs.forEach((doc) => {
        if (doc.data().weekStart) weekStarts.add(doc.data().weekStart);
      });
      const sorted = Array.from(weekStarts).sort(
        (a, b) => parseWeekStart(a) - parseWeekStart(b),
      );
      const idx = sorted.lastIndexOf(nextWS);
      setAvailableWeeks(sorted);
      setWeekIdx(idx >= 0 ? idx : sorted.length - 1);
      setRefreshKey((k) => k + 1);
    });
  }

  async function shareSchedule() {
    try {
      setScreenshotMode(true);
      await new Promise((r) => setTimeout(r, 500));
      const uri = await shotRef.current.capture();
      setScreenshotMode(false);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "שתף סידור עבודה",
        });
      }
    } catch (e) {
      setScreenshotMode(false);
      console.warn("Share failed", e);
      Toast.show({ type: "error", text1: "שגיאה בשיתוף" });
    }
  }

  const shareScheduleRef = useRef(shareSchedule);
  shareScheduleRef.current = shareSchedule;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const isAnimatingRef = useRef(false);
  const weekIdxRef = useRef(weekIdx);
  weekIdxRef.current = weekIdx;
  const availableWeeksRef = useRef(availableWeeks);
  availableWeeksRef.current = availableWeeks;

  function animateWeekChange(direction) {
    // direction: -1 = previous (swipe right), +1 = next (swipe left)
    const idx = weekIdxRef.current;
    const weeks = availableWeeksRef.current;
    if (direction < 0 && idx <= 0) return;
    if (direction > 0 && idx >= weeks.length - 1) return;
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Slide current schedule off screen in the direction of the swipe.
    // Previous (direction=-1, swipe left)  -> content moves left  (negative X),
    //   new schedule slides in from the right.
    // Next     (direction=+1, swipe right) -> content moves right (positive X),
    //   new schedule slides in from the left.
    const offX = direction < 0 ? -400 : 400;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: offX,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setWeekIdx((i) => i + direction);
      // Position incoming schedule on the opposite side, then slide in.
      slideAnim.setValue(-offX);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
      });
    });
  }

  const swipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gs) => {
        const vertical = gs.dy < -20 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.5;
        const horizontal =
          Math.abs(gs.dx) > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
        return vertical || horizontal;
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > Math.abs(gs.dy)) {
          slideAnim.setValue(gs.dx);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -50 && Math.abs(gs.dy) > Math.abs(gs.dx)) {
          slideAnim.setValue(0);
          shareScheduleRef.current();
          return;
        }
        if (Math.abs(gs.dx) > 60 && Math.abs(gs.dx) > Math.abs(gs.dy)) {
          // swipe left  (dx < 0) => previous week (-1)
          // swipe right (dx > 0) => next week (+1)
          const direction = gs.dx > 0 ? 1 : -1;
          const idx = weekIdxRef.current;
          const weeks = availableWeeksRef.current;
          const canMove =
            (direction < 0 && idx > 0) ||
            (direction > 0 && idx < weeks.length - 1);
          if (canMove) {
            animateWeekChange(direction);
            return;
          }
        }
        // Snap back if no action taken
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const swipeHintShownRef = useRef(false);
  const filledCount = weekDates.reduce((acc, date) => {
    const s = schedule[formatDate(date)];
    if (s?.day) acc++;
    if (s?.night) acc++;
    return acc;
  }, 0);

  useEffect(() => {
    if (filledCount === 14 && !swipeHintShownRef.current) {
      swipeHintShownRef.current = true;
      Toast.show({
        type: "swipeUpHint",
        text1: strings.swipeUpToShare,
        position: "bottom",
        bottomOffset: rh(65),
        visibilityTime: 3000,
      });
    }
    swipeHintShownRef.current = false;
  }, [filledCount]);

  function getAssignment(dateKey, shift) {
    return schedule[dateKey]?.[shift] ?? null;
  }

  function assign(userId) {
    if (!picker) return;
    const { dateKey, shift } = picker;

    if (userId !== null) {
      const dateIndex = weekDates.findIndex((d) => formatDate(d) === dateKey);
      let conflict = false;

      if (shift === "day") {
        // same-day night shift
        if (schedule[dateKey]?.night === userId) conflict = true;
        // previous day's night shift
        if (!conflict && dateIndex > 0) {
          const prevKey = formatDate(weekDates[dateIndex - 1]);
          if (schedule[prevKey]?.night === userId) conflict = true;
        }
      } else {
        // same-day day shift
        if (schedule[dateKey]?.day === userId) conflict = true;
        // next day's day shift
        if (!conflict && dateIndex < weekDates.length - 1) {
          const nextKey = formatDate(weekDates[dateIndex + 1]);
          if (schedule[nextKey]?.day === userId) conflict = true;
        }
      }

      if (conflict) {
        setPicker(null);
        Toast.show({
          type: "conflictError",
          text1: getUserName(userId),
          text2: strings.assignmentConflict,
          props: { color: getUserColor(userId) },
        });
        return;
      }
    }

    const newSchedule = {
      ...schedule,
      [dateKey]: { ...(schedule[dateKey] || {}), [shift]: userId },
    };
    setSchedule(newSchedule);
    setPicker(null);
    saveScheduleToDb(newSchedule);
  }

  function getUserName(id) {
    if (!id) return "בחר עובד";
    return users.find((u) => u.id === id)?.name ?? "בחר עובד";
  }

  function getUserColor(id) {
    return users.find((u) => u.id === id)?.color ?? null;
  }

  async function saveScheduleToDb(newSchedule) {
    try {
      const newDays = {};
      weekDates.forEach((date) => {
        const dateKey = formatDate(date);
        const dayId = newSchedule[dateKey]?.day ?? null;
        const nightId = newSchedule[dateKey]?.night ?? null;
        newDays[dateKey] = {
          day: dayId ?? null,
          night: nightId ?? null,
        };
      });
      const q = query(
        collection(db, "Shifts"),
        where("weekStart", "==", currentWeekStart),
      );
      const snap = await getDocs(q);
      const sorted = snap.docs
        .filter((d) => d.data().savedAt)
        .sort((a, b) => b.data().savedAt.seconds - a.data().savedAt.seconds);
      const best = sorted[0] ?? snap.docs[0] ?? null;
      if (best) {
        await updateDoc(doc(db, "Shifts", best.id), {
          days: newDays,
          savedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "Shifts"), {
          weekStart: currentWeekStart,
          savedAt: serverTimestamp(),
          days: newDays,
        });
        await enforceShiftLimit();
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "שגיאה בשמירת הסידור" });
    }
  }

  async function enforceShiftLimit() {
    try {
      const numOfweeksToKeep = 7;
      const snap = await getDocs(collection(db, "Shifts"));
      const weekMap = new Map();
      snap.docs.forEach((d) => {
        const ws = d.data().weekStart;
        if (!weekMap.has(ws)) weekMap.set(ws, []);
        weekMap.get(ws).push(d.id);
      });
      const uniqueWeeks = Array.from(weekMap.keys()).sort(
        (a, b) => parseWeekStart(a) - parseWeekStart(b),
      );
      const deletedWeeks = [];
      while (uniqueWeeks.length > numOfweeksToKeep) {
        const oldest = uniqueWeeks.shift();
        for (const id of weekMap.get(oldest)) {
          await deleteDoc(doc(db, "Shifts", id));
        }
        deletedWeeks.push(oldest);
      }
      if (deletedWeeks.length > 0) {
        setAvailableWeeks((prev) =>
          prev.filter((w) => !deletedWeeks.includes(w)),
        );
      }
    } catch (e) {
      // silently ignore limit enforcement errors
    }
  }

  async function duplicateSchedule() {
    const allEmpty = weekDates.every((date) => {
      const s = schedule[formatDate(date)];
      return !s?.day && !s?.night;
    });
    if (allEmpty) {
      Toast.show({ type: "error", text1: strings.nothingToDuplicate });
      return;
    }

    // Target is always the upcoming week from today, regardless of which week is viewed
    const nextWeekStart = formatDate(getWeekDates(0)[0]);
    const nextWeekDates = getWeekDatesFromStart(nextWeekStart);

    // Map each day's assignments (by position) to the target week's dates
    const newDays = {};
    nextWeekDates.forEach((date, i) => {
      const srcKey = formatDate(weekDates[i]);
      const dstKey = formatDate(date);
      const dayId = schedule[srcKey]?.day ?? null;
      const nightId = schedule[srcKey]?.night ?? null;
      newDays[dstKey] = {
        day: dayId ?? null,
        night: nightId ?? null,
      };
    });

    try {
      const q = query(
        collection(db, "Shifts"),
        where("weekStart", "==", nextWeekStart),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const sorted = snap.docs
          .filter((d) => d.data().savedAt)
          .sort((a, b) => b.data().savedAt.seconds - a.data().savedAt.seconds);
        const best = sorted[0] ?? snap.docs[0];
        await updateDoc(doc(db, "Shifts", best.id), {
          days: newDays,
          savedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "Shifts"), {
          weekStart: nextWeekStart,
          savedAt: serverTimestamp(),
          days: newDays,
        });
        setAvailableWeeks((prev) => {
          if (prev.includes(nextWeekStart)) return prev;
          return [...prev, nextWeekStart].sort(
            (a, b) => parseWeekStart(a) - parseWeekStart(b),
          );
        });
        await enforceShiftLimit();
      }
      Toast.show({ type: "success", text1: strings.duplicateSuccess });
    } catch (e) {
      Toast.show({ type: "error", text1: strings.duplicateError });
    }
  }

  async function clearSchedule() {
    const allEmpty = weekDates.every((date) => {
      const s = schedule[formatDate(date)];
      return !s?.day && !s?.night;
    });
    if (allEmpty) {
      Toast.show({ type: "error", text1: strings.scheduleAlreadyEmpty });
      return;
    }
    Alert.alert(strings.scheduleDeleteTitle, strings.scheduleDeleteMessage, [
      { text: strings.cancel, style: "cancel" },
      {
        text: strings.delete,
        style: "destructive",
        onPress: async () => {
          try {
            const clearedDays = {};
            weekDates.forEach((date) => {
              clearedDays[formatDate(date)] = { day: null, night: null };
            });
            const q = query(
              collection(db, "Shifts"),
              where("weekStart", "==", currentWeekStart),
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const sorted = snap.docs
                .filter((d) => d.data().savedAt)
                .sort(
                  (a, b) => b.data().savedAt.seconds - a.data().savedAt.seconds,
                );
              const best = sorted[0] ?? snap.docs[0];
              await updateDoc(doc(db, "Shifts", best.id), {
                days: clearedDays,
                savedAt: serverTimestamp(),
              });
            }
            setSchedule({});
            Toast.show({ type: "success", text1: strings.scheduleDeleted });
          } catch (e) {
            Toast.show({ type: "error", text1: strings.scheduleDeleteError });
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={{ flex: 1 }} {...swipePanResponder.panHandlers}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                ref={cogBtnRef}
                style={styles.headerBtn}
                onPress={() => {
                  cogBtnRef.current.measure(
                    (x, y, width, height, pageX, pageY) => {
                      setCogMenuPos({
                        top: pageY + height + 2,
                        left: pageX,
                      });
                      setCogMenuOpen(true);
                    },
                  );
                }}
              >
                <MaterialCommunityIcons
                  name="account-cog"
                  size={24}
                  color="#1e1e1e"
                />
              </TouchableOpacity>
              <Text style={styles.title}>
                {strings.workSchedule}{" "}
                {"(" +
                  formatShort(weekDates[0]) +
                  "-" +
                  formatShort(weekDates[6]) +
                  ")"}
              </Text>
              <Image
                source={require("./assets/logoInApp.jpg")}
                style={styles.headerLogo}
              />
            </View>
            <Animated.View
              style={{
                flex: screenshotMode ? 0 : 1,
                transform: [{ translateX: slideAnim }],
                opacity: slideOpacity,
              }}
            >
              <ViewShot
                ref={shotRef}
                style={[
                  styles.scheduleContainer,
                  screenshotMode && { flex: 0 },
                ]}
                options={{ format: "png", quality: 1 }}
              >
                <View
                  style={[
                    { gap: 3 },
                    !screenshotMode && { flex: 1, justifyContent: "center" },
                  ]}
                >
                  {weekDates.map((date, i) => {
                    const dateKey = formatDate(date);
                    const dayWorker = getAssignment(dateKey, "day");
                    const nightWorker = getAssignment(dateKey, "night");
                    const dayColor = getUserColor(dayWorker);
                    const nightColor = getUserColor(nightWorker);

                    return (
                      <View key={dateKey} style={styles.card}>
                        {/* Header */}
                        <Text style={styles.headerCardText}>
                          {HEBREW_DAYS[i]} - {formatDateDisplay(date)}
                        </Text>

                        {/* Day & Night Shifts */}
                        <View style={styles.shiftRow}>
                          <View style={styles.dayColumn}>
                            <TouchableOpacity
                              style={[
                                styles.userBtn,
                                dayColor && {
                                  borderColor: dayColor,
                                  backgroundColor: dayColor + "18",
                                },
                                picker?.dateKey === dateKey &&
                                  picker?.shift === "day" &&
                                  styles.userBtnActiveDay,
                              ]}
                              onPress={() =>
                                setPicker({ dateKey, shift: "day" })
                              }
                            >
                              <View style={styles.userBtnInner}>
                                <Text
                                  style={[
                                    styles.userBtnText,
                                    dayColor && {
                                      color: dayColor,
                                      fontWeight: "700",
                                    },
                                  ]}
                                >
                                  {getUserName(dayWorker)}
                                </Text>
                                <MaterialCommunityIcons
                                  name="weather-sunny"
                                  size={22}
                                  color={dayColor || "#666"}
                                />
                              </View>
                            </TouchableOpacity>
                          </View>

                          {/* Night Shift */}
                          <View style={styles.dayColumn}>
                            <TouchableOpacity
                              style={[
                                styles.userBtn,
                                nightColor && {
                                  borderColor: nightColor,
                                  backgroundColor: nightColor + "18",
                                },
                                picker?.dateKey === dateKey &&
                                  picker?.shift === "night" &&
                                  styles.userBtnActiveNight,
                              ]}
                              onPress={() =>
                                setPicker({ dateKey, shift: "night" })
                              }
                            >
                              <View style={styles.userBtnInner}>
                                <Text
                                  style={[
                                    styles.userBtnText,
                                    nightColor && {
                                      color: nightColor,
                                      fontWeight: "700",
                                    },
                                  ]}
                                >
                                  {getUserName(nightWorker)}
                                </Text>
                                <MaterialCommunityIcons
                                  name="weather-night"
                                  size={20}
                                  color={nightColor || "#666"}
                                />
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ViewShot>
            </Animated.View>
            {/* <TestFillSchedule /> */}
            {/* Buttons Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.fab,
                  styles.fabNav,
                  styles.fabPrev,
                  weekIdx === 0 && styles.fabNavDisabled,
                ]}
                onPress={() => weekIdx > 0 && setWeekIdx((i) => i - 1)}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={weekIdx === 0 ? "#CFD8DC" : "#6366f1"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fab, styles.fabShare]}
                onPress={shareSchedule}
              >
                <Text style={styles.fabText}>{strings.share}</Text>
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={18}
                  color="#25D366"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fab, styles.fabDuplicate]}
                onPress={duplicateSchedule}
              >
                <Text style={styles.fabText}>{strings.duplicate}</Text>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={16}
                  color="#6366f1"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fab} onPress={clearSchedule}>
                <Text style={styles.fabText}>{strings.clearAll}</Text>
                <MaterialCommunityIcons
                  name="trash-can"
                  size={18}
                  color="#E53935"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.fab,
                  styles.fabNav,
                  styles.fabNext,
                  weekIdx >= availableWeeks.length - 1 && styles.fabNavDisabled,
                ]}
                onPress={() =>
                  weekIdx < availableWeeks.length - 1 &&
                  setWeekIdx((i) => i + 1)
                }
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color={
                    weekIdx >= availableWeeks.length - 1 ? "#CFD8DC" : "#6366f1"
                  }
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Cog Dropdown Menu — outside panHandler so pageY positions correctly */}
        {cogMenuOpen && (
          <>
            <Pressable
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.45)" },
              ]}
              onPress={() => setCogMenuOpen(false)}
            />
            <View
              style={[
                styles.cogMenu,
                { top: cogMenuPos.top, right: cogMenuPos.right },
              ]}
            >
              <TouchableOpacity
                style={styles.cogMenuItem}
                onPress={() => {
                  setCogMenuOpen(false);
                  setAddUserOpen(true);
                }}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={20}
                  color="#10b981"
                />
                <Text style={[styles.cogMenuItemText, { color: "#10b981" }]}>
                  {strings.addUser}
                </Text>
              </TouchableOpacity>
              <View style={styles.cogMenuDivider} />
              <TouchableOpacity
                style={styles.cogMenuItem}
                onPress={() => {
                  setCogMenuOpen(false);
                  setEditUserOpen(true);
                }}
              >
                <MaterialCommunityIcons
                  name="account-edit"
                  size={20}
                  color="#6366f1"
                />
                <Text style={[styles.cogMenuItemText, { color: "#6366f1" }]}>
                  {strings.editUser}
                </Text>
              </TouchableOpacity>
              <View style={styles.cogMenuDivider} />
              <TouchableOpacity
                style={styles.cogMenuItem}
                onPress={() => {
                  setCogMenuOpen(false);
                  setDeleteUserOpen(true);
                }}
              >
                <MaterialCommunityIcons
                  name="account-remove"
                  size={20}
                  color="#ef4444"
                />
                <Text style={[styles.cogMenuItemText, { color: "#ef4444" }]}>
                  {strings.deleteUser}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Edit User Component */}
        <EditUser
          visible={editUserOpen}
          onClose={() => setEditUserOpen(false)}
          users={users}
        />

        {/* Add User Component */}
        <AddUser
          visible={addUserOpen}
          onClose={() => setAddUserOpen(false)}
          users={users}
        />

        {/* Delete User Component */}
        <DeleteUser
          visible={deleteUserOpen}
          onClose={() => setDeleteUserOpen(false)}
          users={users}
        />

        {/* Tutorial Overlay */}
        <Tutorial
          visible={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
        />

        {/* User Picker Modal */}
        <Modal
          visible={!!picker}
          transparent
          animationType="fade"
          onRequestClose={() => setPicker(null)}
        >
          <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerTitle}>{strings.selectUser}</Text>
              {[...users]
                .sort((a, b) => a.order - b.order)
                .map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.pickerItem,
                      { borderColor: user.color, borderWidth: 1 },
                    ]}
                    onPress={() => assign(user.id)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: user.color, fontWeight: "700" },
                      ]}
                    >
                      {user.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => assign(null)}
                >
                  <Text style={styles.clearBtnText}>{strings.clear}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => setPicker(null)}
                >
                  <Text style={styles.cancelBtnText}>{strings.cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1e1e1e" />
          <Text style={{ marginTop: 12, color: "#1e1e1e", fontSize: 16 }}>
            {strings.loadingData}
          </Text>
        </View>
      )}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

const strings = {
  dayShift: "בוקר",
  nightShift: "לילה",
  selectUser: "בחר עובד",
  clear: "נקה",
  cancel: "בטל",
  share: "שתף",
  duplicate: "שכפל",
  clearAll: "מחק",
  workSchedule: "סידור עבודה",
  loadingData: "טוען נתונים...",
  addUser: "הוסף עובד",
  editUser: "ערוך עובד",
  deleteUser: "מחק עובד",
  scheduleDeleted: "הסידור נמחק",
  scheduleDeleteError: "שגיאה במחיקת הסידור",
  scheduleAlreadyEmpty: "הסידור כבר ריק",
  nothingToDuplicate: "אין סידור לשכפול",
  duplicateSuccess: "הסידור שוכפל",
  duplicateError: "שגיאה בשכפול הסידור",
  scheduleDeleteTitle: "מחיקת הסידור",
  scheduleDeleteMessage: "האם למחוק את כל המשמרות של השבוע הנוכחי?",
  delete: "מחק",
  assignmentConflict: "כבר משובץ במשמרת סמוכה",
  swipeUpToShare: "החלק למעלה לשיתוף",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e5e5", //"#E8EAF6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rw(10),
  },
  scheduleContainer: {
    flex: 1,
    gap: rh(3),
    paddingVertical: rh(10),
    backgroundColor: "#e5e5e5", //"#E8EAF6",
    paddingHorizontal: rw(25),
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },
  headerBtn: {
    width: rw(44),
    height: rw(44),
    borderRadius: rw(50),
    borderWidth: 1,
    borderColor: "#CFD8DC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  headerLogo: {
    width: rw(44),
    height: rw(44),
    borderWidth: 0.5,
    borderColor: "#CFD8DC",
    borderRadius: rw(50),
  },
  title: {
    flex: 1,
    fontSize: rf(18),
    fontWeight: "800",
    color: "#1e1e1e",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(5),
    paddingTop: rh(6),
    paddingHorizontal: rw(10),
  },
  card: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    borderRadius: rw(25),
    paddingTop: rh(4),
    paddingBottom: rh(9),
    justifyContent: "flex-start",
    gap: rh(4),
    borderWidth: 1,
    borderColor: "#B0BEC5",
  },
  headerCardText: {
    fontSize: rf(17),
    fontWeight: "700",
    color: "#1e1e1e", //"#1A237E",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rw(4),
  },
  shiftType: {
    fontSize: rf(15),
    color: "#1e1e1e",
    fontWeight: "600",
    textAlign: "right",
  },
  userBtn: {
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: rw(50),
    paddingHorizontal: rw(15),
    paddingVertical: rh(8), // responsive vertical padding
    backgroundColor: "#F5F5F5",
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  userBtnActiveDay: {
    borderWidth: 1,
    borderRadius: rw(50),
  },
  userBtnActiveNight: {
    borderWidth: 1,
  },
  userBtnText: {
    fontSize: rf(16),
    color: "#666",
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBox: {
    backgroundColor: "#FFF",
    borderRadius: rw(50),
    paddingVertical: rh(16),
    paddingHorizontal: rw(28),
    minWidth: rw(220),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    textAlign: "center",
    color: "#1e1e1e",
    marginBottom: rh(12),
  },
  pickerItem: {
    width: rw(160),
    borderRadius: rw(50),
    paddingVertical: rh(10),
    paddingHorizontal: rw(16),
    marginVertical: rh(4),
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  pickerItemText: {
    fontSize: rf(15),
    textAlign: "center",
    color: "#37474F",
  },
  pickerActions: {
    flexDirection: "row",
    gap: rw(10),
    marginTop: rh(12),
  },
  actionBtn: {
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: rw(50),
    paddingVertical: rh(8),
    paddingHorizontal: rw(20),
    backgroundColor: "#FFF",
  },
  cancelBtn: {
    borderColor: "#90A4AE",
  },
  clearBtnText: {
    color: "#E53935",
    fontSize: rf(14),
    fontWeight: "600",
  },
  cancelBtnText: {
    color: "#546E7A",
    fontSize: rf(14),
    fontWeight: "600",
  },
  fab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rw(4),
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: rw(50),
    paddingVertical: rh(8),
    paddingHorizontal: rw(8),
  },
  fabShare: {
    borderColor: "#25D366",
  },
  fabDuplicate: {
    borderColor: "#6366f1",
  },
  fabNav: {
    flex: 0,
    borderRadius: rw(50),
    borderColor: "#6366f1",
    width: rw(37),
    height: rw(37),
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
  },
  fabNavDisabled: {
    borderColor: "#CFD8DC",
    opacity: 0.5,
  },
  fabText: {
    color: "#212121",
    fontSize: rf(14),
    fontWeight: "900",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(229,229,229,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cogMenu: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderRadius: rw(25),
    borderWidth: 1,
    borderColor: "#CFD8DC",
    left: rw(10),
  },
  cogMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(10),
    paddingVertical: rh(12),
    paddingHorizontal: rw(16),
  },
  cogMenuItemText: {
    fontSize: rf(15),
    fontWeight: "600",
    textAlign: "right",
  },
  cogMenuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: rw(12),
  },
  swipeHintContainer: {
    position: "absolute",
    bottom: rh(40),
    alignSelf: "center",
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "none",
  },
  swipeHintText: {
    fontSize: rf(12),
    color: "#25D366",
    fontWeight: "600",
  },
});
