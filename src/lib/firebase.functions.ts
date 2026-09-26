import { createServerFn } from "@tanstack/react-start";

export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async () => ({
  apiKey: process.env["GOOGLE_API_KEY"] ?? "",
  authDomain: "dinero-lengua.firebaseapp.com",
  projectId: "dinero-lengua",
  storageBucket: "dinero-lengua.firebasestorage.app",
  messagingSenderId: "37761742593",
  appId: "1:37761742593:web:ee4e29b3803e864a0f8d00",
  measurementId: process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "",
}));