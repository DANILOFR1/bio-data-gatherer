
import { Outlet } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

export const Layout = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOSStandalone, setIsIOSStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is in standalone mode (PWA) on iOS
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      // @ts-ignore - This is a Safari-specific property
      (window.navigator.standalone === true);
    
    setIsIOSStandalone(isInStandaloneMode());

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Data will be saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 pb-16 pt-4 max-w-5xl">
        <Suspense fallback={<div className="p-8 flex justify-center">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <NavigationBar isOnline={isOnline} />
    </div>
  );
};
