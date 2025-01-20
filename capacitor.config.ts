import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dk.ionic.mitIdTester',
  appName: 'mit_id-sandbox',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    hostname: 'mitid-test-99d1b.web.app',
    iosScheme: 'https',
    cleartext: true
  },
  ios: {
    scheme: 'mit_id-sandbox',
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    App: {
      appUrlOpen: {
        enabled: true
      }
    }
  }
};

export default config;