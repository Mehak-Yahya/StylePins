import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD4gBqMAbINfIEjZwpnfMBuxYCfi796gn8",
  authDomain: "stylepins-176d4.firebaseapp.com",
  projectId: "stylepins-176d4",
  storageBucket: "stylepins-176d4.firebasestorage.app",
  messagingSenderId: "629569433841",
  appId: "1:629569433841:web:26be8d938336a87242b950",
  measurementId: "G-X5M9CDSYX6"
};

const app = initializeApp(firebaseConfig);

// 🔥 AUTH (IMPORTANT)
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// optional
export const analytics = getAnalytics(app);