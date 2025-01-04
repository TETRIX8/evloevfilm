import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "./LoadingScreen";
import { OnboardingTour } from "./OnboardingTour";
import { AppRoutes } from "./AppRoutes";
import { getDeviceInfo } from "@/utils/deviceDetection";
import { requestNotificationPermission, scheduleNotification } from "@/utils/notifications";

export function AppInitializer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Save device info on first visit
      const hasVisited = localStorage.getItem("hasVisited");
      if (!hasVisited) {
        const deviceInfo = getDeviceInfo();
        localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
        localStorage.setItem("hasVisited", "true");
        
        // Request notification permission on first visit
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
          toast.success("Уведомления включены! Мы будем держать вас в курсе новинок.");
          scheduleNotification();
        }
      } else if (localStorage.getItem("notificationPermission") === "granted") {
        scheduleNotification();
      }

      // Simulate initial loading for 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialized(true);
      }, 2000);

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {isInitialized && (
        <BrowserRouter>
          <AppRoutes />
          <OnboardingTour />
        </BrowserRouter>
      )}
    </>
  );
}