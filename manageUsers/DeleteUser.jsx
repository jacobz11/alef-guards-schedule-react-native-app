import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../configs/FirebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import { rw, rh, rf } from "../configs/responsive";

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
 * DeleteUser
 * Props:
 *   visible  — whether the user-selection list modal is open
 *   onClose  — called when the flow is dismissed
 *   users    — array of { id, order, name, color } from Firestore
 */
export default function DeleteUser({ visible, onClose, users }) {
  function confirmDelete(user) {
    onClose();
    Alert.alert("מחיקת עובד", `האם למחוק את ${user.name}?`, [
      { text: "בטל", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Guards", user.id));
            Toast.show({ type: "success", text1: "העובד נמחק בהצלחה" });
          } catch (e) {
            Toast.show({ type: "error", text1: "שגיאה במחיקה" });
          }
        },
      },
    ]);
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>מחק עובד</Text>
            {[...users]
              .sort((a, b) => a.order - b.order)
              .map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.pickerItem,
                    { borderColor: user.color, borderWidth: 1 },
                  ]}
                  onPress={() => confirmDelete(user)}
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
  cancelBtnText: {
    color: "#546E7A",
    fontSize: rf(14),
    fontWeight: "600",
  },
});
