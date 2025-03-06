import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/context/DataContext";
import { Download, Database, Trash2, Info, MapPin, Wifi, WifiOff } from "lucide-react";
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
    const calculateStorageUsage = () => {
      try {
        const storageData = localStorage.getItem("biodataObservations");
        if (storageData) {
          setStorageUsage(storageData.length / (1024 * 1024));
        }
      } catch (error) {
        console.error("Error calculating storage usage:", error);
      }
    };

    calculateStorageUsage();

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

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
    toast.success(`Serviços de localização ${enabled ? "ativados" : "desativados"}`);
    localStorage.setItem("locationAlwaysEnabled", enabled.toString());
  };

  const handleToggleOfflineMode = (enabled: boolean) => {
    setOfflineMode(enabled);
    toast.success(`Modo offline ${enabled ? "ativado" : "desativado"}`);
    localStorage.setItem("offlineMode", enabled.toString());
    
    if (enabled) {
      toast.message("Dica de modo offline", {
        description: "Seu app salvará todos os dados localmente, mesmo sem conexão à internet.",
        duration: 5000,
      });
    }
  };

  const handleToggleImageQuality = (enabled: boolean) => {
    setHighQualityImages(enabled);
    toast.success(`Imagens em alta qualidade ${enabled ? "ativadas" : "desativadas"}`);
    localStorage.setItem("highQualityImages", enabled.toString());
    
    if (enabled) {
      toast.message("Aviso de armazenamento", {
        description: "Imagens em alta qualidade ocupam mais espaço de armazenamento.",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const savedLocationEnabled = localStorage.getItem("locationAlwaysEnabled");
    const savedOfflineMode = localStorage.getItem("offlineMode");
    const savedImageQuality = localStorage.getItem("highQualityImages");
    
    if (savedLocationEnabled !== null) {
      setLocationAlwaysEnabled(savedLocationEnabled === "true");
    }
    
    if (savedOfflineMode !== null) {
      setOfflineMode(savedOfflineMode === "true");
    } else {
      setOfflineMode(true);
      localStorage.setItem("offlineMode", "true");
    }
    
    if (savedImageQuality !== null) {
      setHighQualityImages(savedImageQuality === "true");
    }
  }, []);

  const isCurrentlyOnline = navigator.onLine;

  return (
    <div className="space-y-6 page-transition pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Configure preferências do aplicativo e gerencie dados</p>
      </header>

      {!isCurrentlyOnline && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Você está atualmente offline. Seus dados estão sendo salvos localmente.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>Controle como seus dados são armazenados e gerenciados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Armazenamento Offline</Label>
              <p className="text-sm text-muted-foreground">Manter dados disponíveis quando offline</p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={handleToggleOfflineMode} />
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Uso de Armazenamento</Label>
                <p className="text-sm text-muted-foreground">
                  {observations.length} observações ({storageUsage.toFixed(2)} MB)
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
              <Download className="mr-2 h-4 w-4" /> Exportar Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => exportData("json")}
              disabled={observations.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar JSON
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
                <Trash2 className="mr-2 h-4 w-4" /> Limpar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente todas as suas observações. Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir Todos os Dados
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências do Aplicativo</CardTitle>
          <CardDescription>Personalize como o aplicativo funciona</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Serviços de Localização</Label>
              <p className="text-sm text-muted-foreground">Sempre ativar localização para observações</p>
            </div>
            <Switch checked={locationAlwaysEnabled} onCheckedChange={handleToggleLocation} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Imagens em Alta Qualidade</Label>
              <p className="text-sm text-muted-foreground">Armazenar imagens em maior qualidade (usa mais armazenamento)</p>
            </div>
            <Switch checked={highQualityImages} onCheckedChange={handleToggleImageQuality} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instalação</CardTitle>
          <CardDescription>Instale o aplicativo no seu dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          {isInstalled ? (
            <div className="flex items-center text-primary">
              <Info className="mr-2 h-4 w-4" />
              <p>Aplicativo já está instalado neste dispositivo</p>
            </div>
          ) : isInstallable ? (
            <Button
              onClick={handleInstallClick}
              className="w-full"
            >
              Instalar como Aplicativo
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você pode instalar este aplicativo adicionando-o à sua tela inicial a partir do menu do navegador
              ou visite o site em um navegador compatível.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Versão</Label>
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
