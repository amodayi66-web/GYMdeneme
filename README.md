# GYM — Training Planner

A static, GitHub Pages-ready training planner with a neobrutalist interface. Plan workouts, log sessions, track progress, and connect with friends.

## Features

### 📋 Pre-Made Plans (20+)
Browse plans by level (Beginner / Intermediate / Advanced):
- **Beginner:** Starter Strength, 5×5 Foundations, StrongLifts, Starting Strength, Dr. Swole Full Body, Greyskull LP
- **Intermediate:** PPL, PPL Advanced, Upper/Lower, Bro Split, PHUL, PHAT, GZCLP, nSuns
- **Advanced:** 5/3/1 BBB, 5/3/1 FSL, Smolov, Juggernaut, Sheiko, Westside, Dr. Swole Advanced

### 🔧 Build Your Own Workout
- **Search bar** — find exercises by name
- **Muscle group filter** — Chest, Back, Quads, etc.
- **Equipment filter** — Barbell, Dumbbell, Cable, Machine, Bodyweight, etc.
- **80+ exercises** in the library across all equipment types

### 🏋️ Live Session Logging
- Log reps and weight for each set
- **Workout duration timer** — tracks how long your session takes
- **Rest timer** — 60s / 90s / 120s options with auto-start, 3-2-1 countdown, and beep
- **Previous best display** — see your last logged reps & weight for each exercise
- **Volume goal** — set a target and track progress with a bar
- **Estimated 1RM** — calculated from your best set using the Epley formula
- **Progressive overload indicator** — green up arrow if beating previous, red if less

### 📊 Progress Page
- **Overview** — total sessions, volume, sets logged
- **Volume by Muscle Group** — bar chart showing which muscles you've trained most
- **Personal Records** — best volume (reps × weight) for each exercise
- **Estimated 1RM** — best estimated one-rep max per exercise
- **Weekly Performance** — volume, reps, and sets per week
- **Session History** — all completed sessions with details
- **🔥 Week Streak** — consecutive weeks you've trained

### 🌐 Social (Cloud Sync)
- Choose a username and sync workouts to the cloud
- Search for other users and view their recent workouts
- Powered by Firebase (free tier)

### 💾 Data
- All data saved to `localStorage` by default
- Optional Firebase cloud sync for cross-device and social features

## Setup

### Local Development
Just open `index.html` in a browser — no build step needed.

### GitHub Pages
In the GitHub repository, open **Settings → Pages**, set the source to **Deploy from a branch**, then choose `main` and `/ (root)`.

### Firebase Cloud Sync (Optional)
1. Go to https://console.firebase.google.com/ and create a FREE project
2. Go to **Project Settings → General → Your apps → Add web app**
3. Copy the config object and paste it into `firebase-config.js`
4. Enable **Authentication → Anonymous sign-in**
5. Enable **Firestore Database** (start in test mode)
6. That's it! The app will automatically sync to the cloud.

## File Structure
```
├── index.html              # Main HTML
├── style.css               # Neobrutalist styles
├── app.js                  # Main application logic
├── exercises.js            # 80+ exercise library
├── plans.js                # 20+ pre-made training plans
├── analytics.js            # Progress calculations
├── timers.js               # Workout & rest timers
├── sync.js                 # Firebase cloud sync
├── firebase-config.js      # Firebase configuration
└── README.md