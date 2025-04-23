// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp1eUiVAcFPxjN9FFx2-iVPOA25b2C4SI",
  authDomain: "event-booking-e7ddc.firebaseapp.com",
  projectId: "event-booking-e7ddc",
  storageBucket: "event-booking-e7ddc.firebasestorage.app",
  messagingSenderId: "871250606579",
  appId: "1:871250606579:web:b6a1ccbb9ee7eb0e01fa86",
  measurementId: "G-6H2QY5GHXK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };