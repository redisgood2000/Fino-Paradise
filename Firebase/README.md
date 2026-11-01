# Firebase setup

Create a Firebase project and enable Authentication plus Cloud Firestore. Add the Unity app using package ID com.finoparadise.game and follow Firebase's official Unity SDK setup for Auth and Firestore.

Do not commit google-services.json, service-account JSON or private keys. Keep them local or in a protected CI secret store.

The Firestore rules in this directory are intentionally restrictive. Client writes to wallets, inventory, homes, trades, catalog and ledger are denied. Implement trusted persistence and economy operations on the backend using Firebase Admin SDK and Firestore transactions before enabling those features.

Production Colyseus authentication must verify the Firebase ID token using Firebase Admin SDK and derive the UID from the verified token. Never trust a UID supplied by the client.
