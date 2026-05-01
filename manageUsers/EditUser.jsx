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
import { useState } from "react";
import Toast from "react-native-toast-message";
import { db } from "../configs/FirebaseConfig";
import { updateDoc, doc } from "firebase/firestore";
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
 * EditUser
 * Props:
 *   visible  — whether the user-selection list modal is open
 *   onClose  — called when the flow is dismissed
 *   users    — array of { id, order, name, color } from Firestore
 */
export default function EditUser({ visible, onClose, users }) {
  const [editingUser, setEditingUser] = useState(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [editSelectedColor, setEditSelectedColor] = useState(null);
  const [colorWarning, setColorWarning] = useState(null);

  function openEditDetail(user) {
    setEditingUser(user);
    setEditNameInput(user.name);
    setEditSelectedColor(user.color);
    setColorWarning(null);
    onClose(); // close the list modal first
  }

  function closeEditDetail() {
    setEditingUser(null);
    setColorWarning(null);
  }

  async function saveEditUser() {
    if (!editingUser) return;
    const trimmedName = editNameInput.trim();
    if (!trimmedName) {
      Toast.show({ type: "error", text1: "שם העובד לא יכול להיות ריק" });
      return;
    }

    const colorOwner = users.find(
      (u) => u.color === editSelectedColor && u.id !== editingUser.id,
    );

    const performUpdate = async (swapWith) => {
      try {
        const updates = [
          updateDoc(doc(db, "Guards", editingUser.id), {
            name: trimmedName,
            color: editSelectedColor,
          }),
        ];
        if (swapWith) {
          updates.push(
            updateDoc(doc(db, "Guards", swapWith.id), {
              color: editingUser.color,
            }),
          );
        }
        await Promise.all(updates);

        Toast.show({ type: "success", text1: "העובד עודכן בהצלחה" });
        setColorWarning(null);
        setEditingUser(null);
      } catch (e) {
        Toast.show({ type: "error", text1: "שגיאה בעדכון" });
      }
    };

    if (colorOwner) {
      Alert.alert(
        "החלפת צבע",
        `הצבע הזה שייך כבר ל${colorOwner.name}.\nהאם להחליף את הצבעים ביניהם?`,
        [
          { text: "בטל", style: "cancel" },
          { text: "החלף", onPress: () => performUpdate(colorOwner) },
        ],
      );
      return;
    }

    await performUpdate(null);
  }

  return (
    <>
      {/* User Selection List Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>ערוך עובד</Text>
            {[...users]
              .sort((a, b) => a.order - b.order)
              .map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.pickerItem,
                    { borderColor: user.color, borderWidth: 1 },
                  ]}
                  onPress={() => openEditDetail(user)}
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
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>בטל</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Guard Detail Modal */}
      <Modal
        visible={!!editingUser}
        transparent
        animationType="fade"
        onRequestClose={closeEditDetail}
      >
        <Pressable style={styles.overlay} onPress={closeEditDetail}>
          <Pressable style={styles.editGuardBox} onPress={() => {}}>
            <Text style={[styles.pickerTitle, { marginBottom: 8 }]}>
              שנה שם עובד
            </Text>
            <TextInput
              style={[
                styles.editNameInput,
                editSelectedColor && {
                  borderColor: editSelectedColor,
                  backgroundColor: editSelectedColor + "18",
                  color: editSelectedColor,
                  fontWeight: "700",
                },
              ]}
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="שם עובד"
              placeholderTextColor={editSelectedColor ?? "#90A4AE"}
              textAlign="center"
            />
            <Text style={styles.editColorLabel}>בחר צבע</Text>
            {colorWarning && (
              <View
                style={[
                  styles.colorWarningBox,
                  { backgroundColor: editSelectedColor + "18" },
                ]}
              >
                <Entypo name="info" size={13} color={editSelectedColor} />
                <Text
                  style={[
                    styles.colorWarningText,
                    { color: editSelectedColor },
                  ]}
                >
                  {`הצבע שייך ל${colorWarning}, שמירה תחליף ביניהם.`}
                </Text>
              </View>
            )}
            <View style={styles.colorRow}>
              {USER_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    editSelectedColor === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => {
                    const owner = users.find(
                      (u) => u.color === color && u.id !== editingUser?.id,
                    );
                    setColorWarning(owner ? owner.name : null);
                    setEditSelectedColor(color);
                  }}
                />
              ))}
            </View>
            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={saveEditUser}>
                <Text style={styles.clearBtnText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={closeEditDetail}
              >
                <Text style={styles.cancelBtnText}>בטל</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
        <Toast config={toastConfig} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBox: {
    backgroundColor: "#FFF",
    borderRadius: rw(25),
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
    fontSize: rf(18),
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
    borderColor: "#0077b6",
    borderRadius: rw(50),
    paddingVertical: rh(8),
    paddingHorizontal: rw(20),
    backgroundColor: "#FFF",
  },
  cancelBtn: {
    borderColor: "#90A4AE",
  },
  clearBtnText: {
    color: "#0077b6",
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
    borderRadius: rw(50),
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#1e1e1e",
    transform: [{ scale: 1.2 }],
  },
  colorWarningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(5),
    borderRadius: rw(25),
    paddingVertical: rh(5),
    paddingHorizontal: rw(10),
    marginBottom: rh(10),
  },
  colorWarningText: {
    fontSize: rf(12),
    color: "#4338ca",
    fontWeight: "600",
    flexShrink: 1,
  },
});
