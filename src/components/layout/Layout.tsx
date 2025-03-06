
import { Outlet } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

export const Layout = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOSStandalone, setIsIOSStandalone] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
      toast.success("Você está online novamente");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.message("Modo offline ativado", {
        description: "Os dados serão salvos localmente e podem ser sincronizados mais tarde.",
        icon: "📱"
      });
    };

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Show initial offline toast only if not first app load
    if (!navigator.onLine && !isFirstLoad) {
      toast.message("Modo offline ativado", {
        description: "Os dados serão salvos localmente e podem ser sincronizados mais tarde.",
        icon: "📱"
      });
    }

    // Show welcome message on first load if offline
    if (!navigator.onLine && isFirstLoad) {
      toast.message("Aplicativo em modo offline", {
        description: "BioData Gatherer está funcionando sem internet. Todos os dados serão salvos localmente.",
        icon: "📱",
        duration: 5000
      });
      setIsFirstLoad(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isFirstLoad]);

  // This effect is for the very first load of the app
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
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
