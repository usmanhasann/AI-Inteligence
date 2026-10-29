import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.upgrademyself.app',
  appName: 'Upgrade Myself',
  webDir: 'dist',
  android: { backgroundColor: '#07070d' },
  plugins: {
    SplashScreen: { launchShowDuration: 900, backgroundColor: '#07070d', showSpinner: false },
    StatusBar: { style: 'DARK', backgroundColor: '#07070d' },
  },
}

export default config
