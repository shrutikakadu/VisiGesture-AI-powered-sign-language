# 🤟 VisiGesture — AI Sign Language Recognition System

> **Real-time sign language recognition and lip-reading for people who cannot speak.**  
> Bridging communication gaps using AI computer vision and deep learning.

---

## 📌 Overview

**VisiGesture** is an AI-powered communication system that enables people with speech impairments to communicate naturally using:
- **Hand Gesture Recognition** — ASL (American Sign Language) A-Z detection in real time
- **Lip Reading** — Face mesh-based lip movement interpretation
- **Text-to-Speech** — Convert recognized signs to spoken audio
- **Speech-to-Text** — Convert incoming speech for two-way communication

This project is designed for **accessibility**, providing a seamless communication tool for the deaf and mute community.

---

## 🧠 How It Works

```
📷 Camera Feed
    ↓
🤚 MediaPipe Hand Landmark Detection (21 keypoints)
🧠 CNN + LSTM Model — Sign Classification
    ↓
📝 Text Output (Recognized Sign / Word)
    ↓
🔊 Text-to-Speech Engine
```

---

## 🗂️ Project Structure

```
AI-Sign-Language-System/                 ← VisiGesture
├── frontend/
│   ├── React Website/                   # Main web app (Vite + React)
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── LandingPage.jsx     # Home / marketing page
│   │       │   ├── LoginPage.jsx       # User authentication
│   │       │   ├── SignupPage.jsx       # User registration
│   │       │   └── Dashboard.jsx       # Main recognition dashboard
│   │       ├── components/             # Reusable UI components
│   │       ├── context/                # AuthContext
│   │       └── utils/
│   │           └── recognizer.js       # ASL gesture engine (MediaPipe)
│   └── Mobile App (Flutter)/           # React Native / Expo mobile app
│
├── AI_Model/                           # Deep Learning Models
│   ├── CNN/                            # Convolutional Neural Network
│   ├── LSTM/                           # Sequence recognition
│   ├── Dataset/                        # Training data
│   ├── Data Preprocessing/
│   ├── Model Training/
│   ├── Model Testing/
│   └── Saved Model/
│
├── ComputerVision/                     # Vision Processing
│   ├── MediaPipe/                      # Hand landmark detection
│   ├── OpenCV/                         # Video capture
│   ├── Hand Detection/
│   └── Landmark Extraction/
│
├── Voice/                              # Audio Processing
│   ├── Text to Speech/
│   ├── Speech to Text/
│   └── Language Translation/
│
├── backend/
│   ├── API/                            # Spring Boot Java REST API
│   └── Authentication/                 # User auth + JWT
│
├── Database/
│   └── MongoDB/                        # User data, session data
│
├── mobile/                             # Expo React Native App
│
├── Research/                           # Academic research & papers
│
└── Deployment/                         # Docker, AWS, CI/CD
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Real-time ASL A-Z recognition | ✅ Complete |
| MediaPipe hand landmark detection | ✅ Complete |
| Custom gesture recognizer (26 signs + words) | ✅ Complete |
| Web dashboard (React + Vite) | ✅ Complete |
| User authentication (Spring Boot + JWT) | ✅ Complete |
| Landing page with animations | ✅ Complete |
| Mobile app (Expo / React Native) | ✅ Complete |
| CNN/LSTM model training | 🔄 In Progress |
| Text-to-Speech integration | 🔄 In Progress |
| Lip reading (FaceMesh) | 🔄 In Progress |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, CSS3, GSAP |
| Mobile | React Native (Expo) |
| Gesture Recognition | MediaPipe Hands + Custom Classifier |
| AI Models | Python, TensorFlow/Keras (CNN + LSTM) |
| Backend API | Spring Boot (Java) |
| Database | MongoDB |
| Auth | JWT Tokens |
| Vision | OpenCV, MediaPipe |

---

## 🚀 Getting Started

### Web Frontend
```bash
cd "frontend/React Website"
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend (Spring Boot)
```bash
cd backend/API/api
./mvnw spring-boot:run
# Runs at http://localhost:8080
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

---

## 🌐 Sister Project

This system also has an IoT **Smart Home** branch, which uses sign language gestures to control home devices.

**Sign Language Smart Home** — Gesture-controlled smart home automation
→ [Sign-Language-SmartHome](https://github.com/himanshugulhane01/Sign-Language-SmartHome)

---

## 👨‍💻 Author

**Himanshu Gulhane**  
AI Sign Language Recognition System

---

## 📄 License

MIT License — Open source, use freely.
