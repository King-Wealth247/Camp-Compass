# Camp-Compass Mobile 🎓📱

**Camp-Compass** is a comprehensive, native mobile application for university campus management. It provides role-based interactive dashboards for **Students**, **Staff**, **Admins**, and **Registrars** to manage timetables, interactive campus maps, classroom availability, and real-time notifications.

*(Note: This project was originally built on Next.js but has been completely ported to a high-performance **React Native (Expo)** mobile application.)*

---

## 🚀 Features

- **Role-based Authentication:** Secure portal access with tailored views depending on if you are a student, staff member, admin, or registrar.
- **Smart Timetables:** Automated scheduling and live updates for both students and lecturers.
- **Interactive Campus Maps:** Navigate indoor and outdoor spaces, view building floor plans, and locate specific lecture halls.
- **Availability Matrix:** Intuitive touch interfaces for staff members to declare their weekly availability and report constraints.
- **Real-time Notifications:** In-app alert system for timetable changes, system updates, and urgent messages.
- **Management Portals:** Complete user registration workflows and administrative oversight modules.

---

## 🛠️ Tech Stack & Key Dependencies

This project leverages the modern React Native ecosystem:

- **[React Native](https://reactnative.dev/) (v0.81.5)** — Core mobile framework for native iOS and Android components.
- **[Expo](https://expo.dev/) (SDK 54 / ~54.0.33)** — High-level toolchain for rapid React Native development.
- **[Expo Router](https://docs.expo.dev/router/introduction/) (~6.0.23)** — File-based routing for React Native, bringing the simplicity of web routing to mobile.
- **[React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** — Persistent offline storage used for session and state management.
- **[Lucide React Native](https://lucide.dev/)** — Beautiful, consistent iconography.
- **[Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** — Fluid animations and gesture-based interactions.

*Styling logic relies entirely on ultra-fast React Native `StyleSheet` objects, ensuring zero dependency bloat and high rendering speeds.*

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** v18+ 
- **npm** (comes with Node)
- **Expo Go** application installed on your physical mobile device (available on iOS and Android app stores).

### 2. Clone the repository

```bash
git clone https://github.com/King-Wealth247/Camp-Compass.git
cd Camp-Compass/camp-compass-mobile
```

### 3. Install Dependencies

To ensure maximum compatibility with the installed Expo SDK, always use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

### 4. Run the Development Server

Start the local Metro Bundler server. It's recommended to clear the cache on the first run to prevent any stale bundles:

```bash
npm start --clear
```

### 5. View the App
- **Physical Device:** Open the Expo Go app on your phone and scan the QR code displayed in your terminal.
- **Simulation:** Press `i` in the terminal to launch the iOS Simulator (macOS only) or `a` to launch the Android Emulator (requires Android Studio).
- **Web Browser:** If you don't have a mobile device, press `w` in the terminal. Expo will prompt you to install web dependencies (`react-native-web`, `react-dom`, `@expo/metro-runtime`) and then open the app in your local browser.

---

## 📁 Project Structure

```text
camp-compass-mobile/
├── app/                  # File-based routing via Expo Router
│   ├── (app)/            # Authenticated route group
│   │   ├── admin/        # Admin dashboard, map, and tools
│   │   ├── registrar/    # User registration pages
│   │   ├── staff/        # Staff schedule & availability
│   │   └── student/      # Student timetable & campus map
│   ├── index.tsx         # Entry point (handles Auth redirect)
│   ├── login.tsx         # Login authentication screen
│   └── _layout.tsx       # Root layout wrapping the AuthProvider
├── components/           # Reusable global UI components (AppShell, StatCard)
├── context/              # Context Providers (AuthContext using AsyncStorage)
├── data/                 # Mock database content (Campuses, Timetables, Users)
└── screens/              # Core UI screen components shared across various roles
```

---

## 🤝 How to Contribute

We welcome contributions to Camp-Compass! Follow these steps to contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch:** Let's keep things organized. 
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Write Code**: Ensure you use `StyleSheet.create` for styling and test your changes on both iOS and Android if possible. 
4. **Commit your changes:** Follow standard conventional commit formats.
   ```bash
   git commit -m 'feat: added amazing new campus mapping algorithm'
   ```
5. **Push to the Branch:**
   ```bash
   git push origin feature/amazing-new-feature
   ```
6. **Open a Pull Request:** Submit your PR against the `main` branch. Provide a clear description and screenshot/video of your changes!

---

## 📝 License

This project is proprietary and built specifically for internal university use. Please reach out to the project administrator before reusing the source code.
