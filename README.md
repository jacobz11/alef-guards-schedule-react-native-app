# Alef Guards — Work Schedule Manager

A React Native (Expo) app for managing weekly work schedules for security guards. Built with Hebrew RTL support and real-time Firebase sync.

---

## Features

- **Weekly schedule** — view and assign day/night shifts for each day of the week
- **Multi-week navigation** — swipe left/right or use arrow buttons to browse saved weeks
- **Conflict detection** — prevents assigning a guard to back-to-back shifts (same day + adjacent day)
- **Duplicate schedule** — copy the current week's assignments to the upcoming week
- **Clear schedule** — wipe all assignments for the displayed week
- **Share as image** — capture the schedule as a PNG and share it (e.g. via WhatsApp); swipe up to trigger instantly
- **User management** — add, edit, and delete guards from within the app
- **Real-time sync** — all changes are persisted to Firebase Firestore and shared across devices
- **Offline banner** — detects internet connectivity changes and notifies the user
- **First-launch tutorial** — walkthrough shown automatically on first open
- **Hebrew RTL** — fully right-to-left UI

---

## Tech Stack

| Layer        | Library                                     |
| ------------ | ------------------------------------------- |
| Framework    | React Native + Expo ~54                     |
| Database     | Firebase Firestore (v12)                    |
| Storage      | AsyncStorage                                |
| Screenshot   | react-native-view-shot                      |
| Sharing      | expo-sharing                                |
| Icons        | @expo/vector-icons (MaterialCommunityIcons) |
| Connectivity | @react-native-community/netinfo             |
| Toast        | react-native-toast-message                  |
| Safe area    | react-native-safe-area-context              |

---

## Project Structure

```
├── App.jsx                  # Main screen — schedule grid, gestures, modals
├── Tutorial.jsx             # First-launch tutorial overlay
├── index.js                 # Expo entry point
├── app.json                 # Expo config
├── eas.json                 # EAS Build config
├── assets/                  # Images and icons
├── configs/
│   ├── FirebaseConfig.js    # Firebase initialization (env-based)
│   └── responsive.js        # rw / rh / rf responsive helpers
└── manageUsers/
    ├── AddUser.jsx
    ├── EditUser.jsx
    └── DeleteUser.jsx
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Firestore enabled

### Installation

```bash
git clone <repo-url>
cd alef-guards-version-4-swipes
npm install
```

### Environment Variables

Create a `.env` file in the project root with your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Run

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## Firebase Data Model

### Collection: `Guards`

| Field   | Type   | Description         |
| ------- | ------ | ------------------- |
| `id`    | number | Display order index |
| `name`  | string | Guard's name        |
| `color` | string | Hex color for UI    |

### Collection: `Shifts`

| Field       | Type      | Description                                               |
| ----------- | --------- | --------------------------------------------------------- |
| `weekStart` | string    | Sunday date of the week (`DD.MM.YYYY`)                    |
| `savedAt`   | timestamp | Last save time                                            |
| `days`      | map       | Keyed by date string → `{ day: guardId, night: guardId }` |

The app retains the **7 most recent weeks** and automatically deletes older records.

---

## Gestures

| Gesture     | Action                  |
| ----------- | ----------------------- |
| Swipe left  | Go to previous week     |
| Swipe right | Go to next week         |
| Swipe up    | Share schedule as image |

---

## Build (EAS)

```bash
eas build --platform android
eas build --platform ios
```

See `eas.json` for build profiles.
