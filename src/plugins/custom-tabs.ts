import { registerPlugin } from '@capacitor/core';

export interface CustomTabsPlugin {
  openUrl(options: { url: string }): Promise<void>;
  closeCustomTab(): Promise<void>;
  isAvailable(): Promise<{ available: boolean; packageName?: string }>;
}

const CustomTabs = registerPlugin<CustomTabsPlugin>('CustomTabs');

export { CustomTabs };