import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirebaseConfig } from "@/lib/firebase.functions";

export function FirebaseAnalytics() {
  const loadConfig = useServerFn(getFirebaseConfig);

  useEffect(() => {
    let active = true;
    void loadConfig().then(async (config) => {
      if (!active || !config.apiKey || !config.measurementId || !(await isSupported())) return;
      const app = getApps()[0] ?? initializeApp(config);
      getAnalytics(app);
    });
    return () => {
      active = false;
    };
  }, [loadConfig]);

  return null;
}