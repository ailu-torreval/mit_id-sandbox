import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dk.ionic.mitIdTester',
  appName: 'mit_id-sandbox',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    hostname: 'mitid-test-99d1b.web.app',
    iosScheme: 'https'
  },
  ios: {
    scheme: 'mit_id-sandbox'
  },
  plugins: {
    CapacitorURLScheme: {
      schemes: ['mit_id-sandbox']
    }
  }
};

export default config;