# Development setup

## Prerequisites

- Unity 6 LTS or Unity 2022.3 LTS with Android Build Support, Android SDK/NDK and OpenJDK.
- Node.js 20+ and npm.
- Git.
- Firebase project with Authentication and Cloud Firestore enabled.

## Unity client

1. Open the Unity project from the Unity/ directory once its project files are added.
2. In Package Manager, add the Colyseus Unity SDK from Git URL: https://github.com/colyseus/colyseus-unity-sdk.git#upm
3. Import Firebase Unity Auth and Firestore packages using the official Firebase Unity setup guide.
4. Set Android application ID to com.finoparadise.game.
5. Configure the realtime endpoint. Android emulator access to a host machine normally uses ws://10.0.2.2:2567. A physical device needs the host LAN IP. Deployed servers must use wss://.
6. Do not commit Firebase configuration or signing credentials.

## Realtime server

From Server/: copy .env.example to .env, run npm install, then npm run dev. The development port is 2567. Production must verify Firebase ID tokens with Firebase Admin SDK.

## Android build

Open the Unity project, switch to Android in Build Profiles, set package ID to com.finoparadise.game, and build a debug APK for device testing. Test sign-in, reconnect, room transitions, pause/resume and network loss on a physical Android device.

## Secrets

Keep Firebase service-account keys, Android upload keystores, passwords, production server secrets and database credentials outside Git.
