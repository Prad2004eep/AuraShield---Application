# 🛡️ Aura Shield - Real-Time Threat Monitoring for VIPs

**A sophisticated mobile application for VIP threat detection and case management**

[![Expo Version](https://img.shields.io/badge/Expo-53.0.4-000.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

</div>

---

## 📋 Overview

**Aura Shield** is a cutting-edge mobile (and web) application designed to protect high-profile individuals and brands from online threats. It provides real-time monitoring, threat detection, and comprehensive case management capabilities in a user-friendly interface.

### 🎯 Key Features

- 🔍 **Real-time Threat Detection** - Automated monitoring of social platforms
- 📊 **Comprehensive Dashboard** - Statistics, recent alerts, and quick actions
- 🌐 **Network Visualization** - Interactive threat graph analysis
- 📱 **Cross-Platform** - Works on iOS, Android, and Web via Expo
- 🌍 **Multilingual Support** - Available in 6 languages (English, Hindi, Kannada, Malayalam, Tamil, Telugu)
- 🤖 **AI-Powered Analysis** - Gemini integration for image and URL analysis
- 📁 **Case Management** - Complete evidence tracking and resolution workflow
- 🔐 **Secure Authentication** - Local session management with AsyncStorage

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (LTS version recommended)
- **Expo CLI** or **Expo Go** app on your device
- **npm**, **yarn**, or **pnpm** for package management

### Installation

```bash
# Clone the repository
git clone https://github.com/Prad2004eep/AuraShield---Application.git
cd AuraShield---Application

# Install dependencies
npm install
# or
yarn install
```

### Running the App

```bash
# Start with tunnel (recommended for real devices)
npx expo start --tunnel

# Or use the predefined scripts
npm run start          # Mobile with tunnel
npm run start-web      # Web version
```

**📱 For Mobile Devices:**
1. Open Expo Go app on your iOS/Android device
2. Scan the QR code shown in the terminal
3. The app will load and be ready to use

**🌐 For Web:**
- Press `w` in the terminal or open `http://localhost:8081` in your browser

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Core Framework** | Expo + React Native | Cross-platform mobile development |
| **Language** | TypeScript | Type-safe development |
| **Navigation** | expo-router | File-system based routing |
| **State Management** | React Query + Zustand | Data fetching and global state |
| **UI Components** | NativeWind + Expo Icons | Styling and icons |
| **Storage** | AsyncStorage | Local data persistence |
| **Internationalization** | i18next | Multi-language support |
| **AI Integration** | Google Gemini | Image and text analysis |
| **Visualization** | React Native SVG | Network graphs |

### Project Structure

```
AuraShield/
├── app/                    # Navigation and screens
│   ├── _layout.tsx        # Root layout with auth guard
│   ├── login.tsx          # Authentication screen
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── alerts.tsx     # Alerts list
│   │   ├── graph.tsx      # Network visualization
│   │   └── settings.tsx   # Settings & profile
│   └── case/[id].tsx      # Case details
├── components/            # Reusable UI components
├── providers/             # Context providers
├── services/              # API and external services
├── locales/               # Translation files
├── types/                 # TypeScript definitions
└── assets/                # Images and static assets
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Note:** The app will work without the Gemini API key but will use fallback responses for AI analysis.

### Supported Languages

- 🇺🇸 English (en)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Kannada (kn)
- 🇮🇳 Malayalam (ml)
- 🇮🇳 Tamil (ta)
- 🇮🇳 Telugu (te)

---

## 📱 App Features in Detail

### 🔐 Authentication
- Simple demo login with session persistence
- Automatic redirects based on authentication status
- Secure logout with confirmation dialog

### 📊 Dashboard
- Real-time statistics overview
- Recent alerts with quick actions
- "Add Evidence" floating action button
- Quick access to all major features

### 🚨 Alerts Management
- Comprehensive alert list with search and filtering
- Severity-based color coding
- Pull-to-refresh functionality
- Real-time updates via React Query

### 🕸️ Network Graph
- Interactive visualization of threat networks
- Tap-to-drill functionality for detailed analysis
- Cluster and edge representation
- Responsive design for various screen sizes

### 📁 Case Management
- Detailed case view with evidence cards
- AI-powered threat analysis
- Action buttons (Download PDF, Share, Mark Resolved)
- Real-time status updates

### 🌍 Internationalization
- Complete UI translation support
- Language persistence in AsyncStorage
- RTL language support ready
- Easy addition of new languages

---

## 🤖 AI Integration

### Image Analysis
- Upload images for threat analysis
- Gemini 2.0 Flash integration
- Fallback responses for robust operation
- Sanitized AI output for consistent UI

### URL Analysis
- Analyze social media posts, articles, and videos
- Extract threat intelligence from web content
- Automatic alert creation from analysis results

---

## 🔧 Development

### Available Scripts

```bash
npm run start          # Start mobile app with tunnel
npm run start-web      # Start web version
npm run start-web-dev  # Debug mode for web
npm run lint           # Run ESLint
```

### Key Technologies Deep Dive

#### React Query Usage
- `['dashboard-stats']` - Main dashboard statistics
- `['recent-alerts']` - Recent alerts for dashboard
- `['alerts']` - Complete alerts list
- `['case', id]` - Individual case details
- `['network-graph']` - Network visualization data

#### Authentication Flow
1. App starts → Provider loads session from AsyncStorage
2. No session → Redirect to `/login`
3. Login successful → Store session → Redirect to `/(tabs)`
4. Logout → Clear session → Redirect to `/login`

#### Internationalization Setup
- i18next configuration with AsyncStorage backend
- Language files in `locales/` directory
- Automatic language detection from device settings
- Manual language picker in Settings

---

## 🚀 Deployment

### Expo Build

```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build
npx eas build --platform android
npx eas build --platform ios
```

### Web Deployment

The web version can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

---

## 🔒 Security Considerations

- 🔐 Local session management with AsyncStorage
- 🛡️ Input sanitization for AI responses
- 🔒 API key protection via environment variables
- 📱 Secure deep linking with expo-router
- 🚫 No sensitive data stored in app bundle

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add translations for new UI strings
- Test on both iOS and Android platforms
- Update documentation for new features

---

---

## 📞 Support

For questions, support, or feature requests:

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/Prad2004eep/AuraShield---Application/issues)
- 📖 Documentation: [Wiki](https://github.com/Prad2004eep/AuraShield---Application/wiki)

---

<div align="center">

**Built with ❤️ for digital protection**

[⭐ Star this repo](https://github.com/Prad2004eep/AuraShield---Application) • [🐛 Report Issues](https://github.com/Prad2004eep/AuraShield---Application/issues) • [📖 View Documentation](https://github.com/Prad2004eep/AuraShield---Application/wiki)

</div>

