
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ee684b0565294dae8675083e806fa71b',
  appName: 'BioData Gatherer',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#34C759",
      showSpinner: true,
      spinnerColor: "#ffffff",
      androidSpinnerStyle: "large"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#34C759"
    }
  },
  server: {
    url: "https://ee684b05-6529-4dae-8675-083e806fa71b.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
