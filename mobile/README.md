# SignAI Mobile App 📱

A React Native (Expo) companion app for the SignAI web platform.

## Features
- 🔤 Full ASL A–Z alphabet reference (26 letters)
- 💬 10 common word signs (Hello, Thank You, Please, Sorry, Yes, No…)
- 🇮🇳 ISL (Indian Sign Language) visual reference (16 signs)
- 🏅 Progress tracker with 8 learning badges
- 👤 Profile screen with usage stats
- 🎨 Calm teal + amber design (matches web app)

## Prerequisites
- Node.js 18+
- Expo Go app on your Android or iOS device
- Or an Android/iOS emulator

## Run It

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Screens

| Screen | Description |
|--------|-------------|
| 🏠 Home | Dashboard, stats, quick actions, recent signs |
| 📚 Learn | A-Z alphabet & common word signs with instructions |
| 🤚 Reference | ASL word cards + full ISL reference grid |
| 👤 Profile | Stats, badges, account info |

## Coming in v2
- Live camera detection using MediaPipe WASM
- Backend authentication (Spring Boot)
- Offline sign detection model
- ISL live detection

## Color Palette
Matches the web app exactly:
- **Primary**: Teal `#2dd4bf`
- **Secondary**: Amber `#f59e0b`  
- **Background**: Deep charcoal `#0c0f16`
