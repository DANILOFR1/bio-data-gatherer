
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/context/DataContext";
import { Download, Database, Trash2, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { observations, exportData } = useData();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [locationAlwaysEnabled, setLocationAlwaysEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [highQualityImages, setHighQualityImages] = useState(false);

  useEffect(() => {
    // Calculate approximate storage usage
    const calculateStorageUsage = () => {
      try {
        const storageData = localStorage.getItem("biodataObservations");
        if (storageData) {
          // Convert length to MB
          setStorageUsage(storageData.length / (1024 * 1024));
        }
      } catch (error) {
        console.error("Error calculating storage usage:", error);
      }
    };

    calculateStorageUsage();

    // Check if the app is already installed (display-mode: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event to detect if the app is installable
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [observations]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        toast.success("App installed successfully!");
      }
    } catch (error) {
      console.error("Installation error:", error);
      toast.error("Failed to install the app");
    }
  };

  const handleClearAllData = () => {
    try {
      localStorage.removeItem("biodataObservations");
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    }
  };

  const handleToggleLocation = (enabled: boolean) => {
    setLocationAlwaysEnabled(enabled);
    toast.success(`Location services ${enabled ? "enabled" : "disabled"}`);
    // Here you would typically update some actual application settings
  };

  const handleToggleOfflineMode = (enabled: boolean) => {
    setOfflineMode(enabled);
    toast.success(`Offline mode ${enabled ? "enabled" : "disabled"}`);
    // Here you would typically update some actual application settings
  };

  const handleToggleImageQuality = (enabled: boolean) => {
    setHighQualityImages(enabled);
    toast.success(`High quality images ${enabled ? "enabled" : "disabled"}`);
    // Here you would typically update some actual application settings
  };

  return (
    <div className="space-y-6 page-transition pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure app preferences and manage data</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Control how your data is stored and managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offline Storage</Label>
              <p className="text-sm text-muted-foreground">Keep data available when offline</p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={handleToggleOfflineMode} />
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Storage Usage</Label>
                <p className="text-sm text-muted-foreground">
                  {observations.length} observations ({storageUsage.toFixed(2)} MB)
                </p>
              </div>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => exportData("excel")}
              disabled={observations.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Export as Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => exportData("json")}
              disabled={observations.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Export as JSON
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={observations.length === 0}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all your observations. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize how the app works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location Services</Label>
              <p className="text-sm text-muted-foreground">Always enable location for observations</p>
            </div>
            <Switch checked={locationAlwaysEnabled} onCheckedChange={handleToggleLocation} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Quality Images</Label>
              <p className="text-sm text-muted-foreground">Store images in higher quality (uses more storage)</p>
            </div>
            <Switch checked={highQualityImages} onCheckedChange={handleToggleImageQuality} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
          <CardDescription>Install the app on your device</CardDescription>
        </CardHeader>
        <CardContent>
          {isInstalled ? (
            <div className="flex items-center text-primary">
              <Info className="mr-2 h-4 w-4" />
              <p>App is already installed on this device</p>
            </div>
          ) : isInstallable ? (
            <Button
              onClick={handleInstallClick}
              className="w-full"
            >
              Install as App
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can install this app by adding it to your home screen from your browser menu
              or visit the site in a supported browser.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Version</Label>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>
          <div>
            <Label>Build</Label>
            <p className="text-sm text-muted-foreground">{new Date().toISOString().split('T')[0]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
