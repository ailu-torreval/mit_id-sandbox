import { registerPlugin } from '@capacitor/core';

interface CustomTabsPlugin {
  openUrl(options: { 
    url: string; 
    toolbarColor?: string; 
    showTitle?: boolean; 
    enableUrlBarHiding?: boolean; 
  }): Promise<void>;
  closeCustomTab(): Promise<{ message: string }>;
  isAvailable(): Promise<{ available: boolean; packageName?: string }>;
}

const CustomTabs = registerPlugin<CustomTabsPlugin>('CustomTabs');
// import { registerPlugin } from '@capacitor/core';

// export interface CustomTabsPlugin {
//   openUrl(options: { url: string }): Promise<void>;
//   closeCustomTab(): Promise<void>;
//   isAvailable(): Promise<{ available: boolean; packageName?: string }>;
// }

// const CustomTabs = registerPlugin<CustomTabsPlugin>('CustomTabs');

export { CustomTabs };