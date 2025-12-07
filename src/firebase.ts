// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import getFirestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCMSIB3IE2I54kLdTGtyXB1r2w5cSN5AE",
  authDomain: "flight-book-82ea4.firebaseapp.com",
  projectId: "flight-book-82ea4",
  storageBucket: "flight-book-82ea4.firebasestorage.app",
  messagingSenderId: "947843863844",
  appId: "1:947843863844:web:df542dbe61221660948fb1",
  measurementId: "G-DZRWHDJ91J",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth
export const db = getFirestore(app); // Export db
