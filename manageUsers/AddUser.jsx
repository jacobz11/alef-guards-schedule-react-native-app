import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { db } from "../configs/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { rw, rh, rf } from "../configs/responsive";

const USER_COLORS = [
  "#2d6a4f",
  "#0077b6",
  "#7209b7",
  "#99582a",
  "#c1121f",
  "#7cb518",
];

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
        source={require("../assets/logoInApp.jpg")}
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
        source={require("../assets/logoInApp.jpg")}
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
};

/**
 * AddUser
 * Props:
 *   visible  — whether the modal should open
 *   onClose  — called when the flow is dismissed
 *   users    — array of { id, order, name, color } from Firestore
 */
export default function AddUser({ visible, onClose, users }) {
  const [nameInput, setNameInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorWarning, setColorWarning] = useState(null);

  // Compute available colors (not taken by any existing user)
  function getAvailableColors() {
    const taken = new Set(users.map((u) => u.color));
    return USER_COLORS.filter((c) => !taken.has(c));
  }

  // When the modal opens, pick a random available color or show "team full" alert
  useEffect(() => {
    if (!visible) return;
    const available = getAvailableColors();
    if (available.length === 0) {
      onClose();
      Alert.alert("הצוות מלא", "מחק אחד העובדים כדי להוסיף עובד חדש", [
        { text: "אישור" },
      ]);
      return;
    }
    const random = available[Math.floor(Math.random() * available.length)];
    setNameInput("");
    setSelectedColor(random);
    setColorWarning(null);
  }, [visible]);

  function close() {
    setNameInput("");
    setSelectedColor(null);
    setColorWarning(null);
    onClose();
  }

  async function saveNewUser() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      Toast.show({ type: "error", text1: "שם העובד לא יכול להיות ריק" });
      return;
    }
    const colorTakenBy = users.find((u) => u.color === selectedColor);
    if (colorTakenBy) {
      Alert.alert(
        "הצבע תפוס",
        `הצבע הזה שייך כבר ל${colorTakenBy.name}.\nבחר צבע פנוי כדי להוסיף את העובד.`,
        [{ text: "אישור" }],
      );
      return;
    }

    const maxId = users.length > 0 ? Math.max(...users.map((u) => u.order)) : 0;
    const nextIdStr = String(maxId + 1);

    try {
      await addDoc(collection(db, "Guards"), {
        name: trimmedName,
        color: selectedColor,
        id: nextIdStr,
      });
      Toast.show({ type: "success", text1: "העובד נוסף בהצלחה" });
      close();
    } catch (e) {
      Toast.show({ type: "error", text1: "שגיאה בהוספה" });
    }
  }

  const availableColors = getAvailableColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.editGuardBox} onPress={() => {}}>
          <Text style={[styles.pickerTitle, { marginBottom: 8 }]}>
            הוסף עובד
          </Text>
          <TextInput
            style={[
              styles.editNameInput,
              selectedColor && {
                borderColor: selectedColor,
                backgroundColor: selectedColor + "18",
                color: selectedColor,
                fontWeight: "700",
              },
            ]}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="שם עובד"
            placeholderTextColor={selectedColor ?? "#90A4AE"}
            textAlign="center"
          />
          <Text style={styles.editColorLabel}>בחר צבע</Text>
          {colorWarning && (
            <View
              style={[
                styles.colorWarningBox,
                { backgroundColor: selectedColor + "18" },
              ]}
            >
              <Entypo name="info" size={13} color={selectedColor} />
              <Text style={[styles.colorWarningText, { color: selectedColor }]}>
                {`הצבע תפוס על ידי ${colorWarning}`}
              </Text>
            </View>
          )}
          <View style={styles.colorRow}>
            {USER_COLORS.map((color) => {
              const isTaken =
                users.some((u) => u.color === color) && color !== selectedColor;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSwatchSelected,
                    isTaken && styles.colorSwatchTaken,
                  ]}
                  onPress={() => {
                    const owner = users.find((u) => u.color === color);
                    setColorWarning(owner ? owner.name : null);
                    setSelectedColor(color);
                  }}
                />
              );
            })}
          </View>
          <View style={styles.pickerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={saveNewUser}>
              <Text style={styles.clearBtnText}>הוסף</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={close}
            >
              <Text style={styles.cancelBtnText}>בטל</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
      <Toast config={toastConfig} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: rf(18),
    fontWeight: "700",
    textAlign: "center",
    color: "#1e1e1e",
    marginBottom: rh(12),
  },
  pickerActions: {
    flexDirection: "row",
    gap: rw(10),
    marginTop: rh(12),
  },
  actionBtn: {
    borderWidth: 1.5,
    borderColor: "#10b981",
    borderRadius: rw(50),
    paddingVertical: rh(8),
    paddingHorizontal: rw(20),
    backgroundColor: "#FFF",
  },
  cancelBtn: {
    borderColor: "#90A4AE",
  },
  clearBtnText: {
    color: "#10b981",
    fontSize: rf(14),
    fontWeight: "600",
  },
  cancelBtnText: {
    color: "#546E7A",
    fontSize: rf(14),
    fontWeight: "600",
  },
  editGuardBox: {
    backgroundColor: "#FFF",
    borderRadius: rw(25),
    paddingVertical: rh(16),
    paddingHorizontal: rw(28),
    minWidth: rw(260),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: "center",
  },
  editNameInput: {
    fontSize: rf(16),
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: rw(50),
    paddingHorizontal: rw(15),
    paddingVertical: rh(8),
    backgroundColor: "#F5F5F5",
    minWidth: rw(125),
  },
  editColorLabel: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#90A4AE",
    alignSelf: "center",
    marginBlock: rh(8),
  },
  colorRow: {
    flexDirection: "row",
    gap: rw(10),
    marginBottom: rh(4),
  },
  colorSwatch: {
    width: rw(30),
    height: rw(30),
    borderRadius: rw(15),
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#1e1e1e",
    transform: [{ scale: 1.2 }],
  },
  colorSwatchTaken: {
    opacity: 0.3,
  },
  colorWarningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(5),
    borderRadius: rw(50),
    paddingVertical: rh(5),
    paddingHorizontal: rw(10),
    marginBottom: rh(10),
  },
  colorWarningText: {
    fontSize: rf(12),
    fontWeight: "600",
    flexShrink: 1,
  },
});
