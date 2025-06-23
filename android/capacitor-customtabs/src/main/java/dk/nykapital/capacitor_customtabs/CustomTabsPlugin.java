package dk.nykapital.capacitor_customtabs;

import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import androidx.browser.customtabs.CustomTabsCallback;
import androidx.browser.customtabs.CustomTabsClient;
import androidx.browser.customtabs.CustomTabsIntent;
import androidx.browser.customtabs.CustomTabsServiceConnection;
import androidx.browser.customtabs.CustomTabsSession;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CustomTabs")
public class CustomTabsPlugin extends Plugin {

    private CustomTabsClient customTabsClient;
    private CustomTabsSession customTabsSession;
    private CustomTabsServiceConnection customTabsServiceConnection;

    @Override
    public void load() {
        super.load();
        bindCustomTabsService();
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        
        if (url == null || url.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        // Optional customization parameters
        String toolbarColor = call.getString("toolbarColor");
        Boolean showTitle = call.getBoolean("showTitle", true);
        Boolean enableUrlBarHiding = call.getBoolean("enableUrlBarHiding", false);

        try {
            Uri uri = Uri.parse(url);
            openCustomTab(uri, toolbarColor, showTitle, enableUrlBarHiding);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open URL: " + e.getMessage());
        }
    }

    @PluginMethod
    public void closeCustomTab(PluginCall call) {
        // Note: Chrome Custom Tabs don't have a direct close method
        // This is a limitation of the API. The user must close it manually
        // or the tab will close when navigating back to the app
        JSObject result = new JSObject();
        result.put("message", "Custom Tabs cannot be programmatically closed");
        call.resolve(result);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        String packageName = getCustomTabsPackageName();
        boolean isAvailable = packageName != null;

        JSObject result = new JSObject();
        result.put("available", isAvailable);
        if (packageName != null) {
            result.put("packageName", packageName);
        }

        call.resolve(result);
    }

    private void bindCustomTabsService() {
        String packageName = getCustomTabsPackageName();
        if (packageName != null) {
            customTabsServiceConnection = new CustomTabsServiceConnection() {
                @Override
                public void onCustomTabsServiceConnected(ComponentName componentName, CustomTabsClient client) {
                    customTabsClient = client;
                    customTabsClient.warmup(0L);
                    customTabsSession = customTabsClient.newSession(new CustomTabsCallback() {
                        @Override
                        public void onNavigationEvent(int navigationEvent, android.os.Bundle extras) {
                            super.onNavigationEvent(navigationEvent, extras);
                            // You can handle navigation events here if needed
                        }
                    });
                }

                @Override
                public void onServiceDisconnected(ComponentName name) {
                    customTabsClient = null;
                    customTabsSession = null;
                }
            };

            CustomTabsClient.bindCustomTabsService(getContext(), packageName, customTabsServiceConnection);
        }
    }

    private void openCustomTab(Uri uri, String toolbarColor, Boolean showTitle, Boolean enableUrlBarHiding) {
        CustomTabsIntent.Builder customTabsIntentBuilder = new CustomTabsIntent.Builder(customTabsSession);

        // Customize the Custom Tab
        customTabsIntentBuilder.setShowTitle(showTitle);
        customTabsIntentBuilder.setUrlBarHidingEnabled(enableUrlBarHiding);
        
        // Set toolbar color if provided
        if (toolbarColor != null && !toolbarColor.isEmpty()) {
            try {
                int color = Color.parseColor(toolbarColor);
                customTabsIntentBuilder.setToolbarColor(color);
            } catch (IllegalArgumentException e) {
                // Invalid color format, use default
            }
        }

        // Set animations
        customTabsIntentBuilder.setStartAnimations(getContext(), 
            android.R.anim.slide_in_left, android.R.anim.slide_out_right);
        customTabsIntentBuilder.setExitAnimations(getContext(), 
            android.R.anim.slide_in_left, android.R.anim.slide_out_right);

        CustomTabsIntent customTabsIntent = customTabsIntentBuilder.build();
        customTabsIntent.launchUrl(getContext(), uri);
    }

    private String getCustomTabsPackageName() {
        android.content.pm.PackageManager pm = getContext().getPackageManager();
        Intent activityIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com"));
        java.util.List<android.content.pm.ResolveInfo> resolvedActivities = 
            pm.queryIntentActivities(activityIntent, 0);

        java.util.List<String> packagesSupportingCustomTabs = new java.util.ArrayList<>();

        for (android.content.pm.ResolveInfo info : resolvedActivities) {
            Intent serviceIntent = new Intent();
            serviceIntent.setAction("android.support.customtabs.action.CustomTabsService");
            serviceIntent.setPackage(info.activityInfo.packageName);

            if (pm.resolveService(serviceIntent, 0) != null) {
                packagesSupportingCustomTabs.add(info.activityInfo.packageName);
            }
        }

        // Prefer Chrome in order of preference
        String[] preferredPackages = {
            "com.android.chrome",
            "com.chrome.beta", 
            "com.chrome.dev",
            "com.chrome.canary"
        };

        for (String packageName : preferredPackages) {
            if (packagesSupportingCustomTabs.contains(packageName)) {
                return packageName;
            }
        }

        // If no preferred browser found, use the first available
        if (!packagesSupportingCustomTabs.isEmpty()) {
            return packagesSupportingCustomTabs.get(0);
        }

        return null;
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (customTabsServiceConnection != null && getContext() != null) {
            try {
                getContext().unbindService(customTabsServiceConnection);
            } catch (IllegalArgumentException e) {
                // Service was not bound, ignore
            }
        }
    }
}