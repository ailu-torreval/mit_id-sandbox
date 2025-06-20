package dk.nykapital.capacitor_customtabs;

import android.content.ComponentName;
import android.content.Intent;
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
    private CustomTabsIntent customTabsIntent;

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

        try {
            Uri uri = Uri.parse(url);
            openCustomTab(uri);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open URL: " + e.getMessage());
        }
    }

    @PluginMethod
    public void closeCustomTab(PluginCall call) {
        // Note: Chrome Custom Tabs don't have a direct close method
        // This is a limitation of the API
        call.resolve();
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
                    customTabsSession = customTabsClient.newSession(new CustomTabsCallback());
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

    private void openCustomTab(Uri uri) {
        CustomTabsIntent.Builder customTabsIntentBuilder = new CustomTabsIntent.Builder(customTabsSession);

        // Customize the Custom Tab
        customTabsIntentBuilder.setShowTitle(true);
        customTabsIntentBuilder.setUrlBarHidingEnabled(false);
        customTabsIntentBuilder.setStartAnimations(getContext(), android.R.anim.slide_in_left, android.R.anim.slide_out_right);
        customTabsIntentBuilder.setExitAnimations(getContext(), android.R.anim.slide_in_left, android.R.anim.slide_out_right);

        customTabsIntent = customTabsIntentBuilder.build();
        customTabsIntent.launchUrl(getContext(), uri);
    }

    private String getCustomTabsPackageName() {
        android.content.pm.PackageManager pm = getContext().getPackageManager();
        Intent activityIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com"));
        java.util.List<android.content.pm.ResolveInfo> resolvedActivities = pm.queryIntentActivities(activityIntent, 0);

        java.util.List<String> packagesSupportingCustomTabs = new java.util.ArrayList<>();

        for (android.content.pm.ResolveInfo info : resolvedActivities) {
            Intent serviceIntent = new Intent();
            serviceIntent.setAction("android.support.customtabs.action.CustomTabsService");
            serviceIntent.setPackage(info.activityInfo.packageName);

            if (pm.resolveService(serviceIntent, 0) != null) {
                packagesSupportingCustomTabs.add(info.activityInfo.packageName);
            }
        }

        if (packagesSupportingCustomTabs.contains("com.android.chrome")) {
            return "com.android.chrome";
        } else if (packagesSupportingCustomTabs.contains("com.chrome.beta")) {
            return "com.chrome.beta";
        } else if (packagesSupportingCustomTabs.contains("com.chrome.dev")) {
            return "com.chrome.dev";
        } else if (packagesSupportingCustomTabs.contains("com.chrome.canary")) {
            return "com.chrome.canary";
        } else if (!packagesSupportingCustomTabs.isEmpty()) {
            return packagesSupportingCustomTabs.get(0);
        } else {
            return null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (customTabsServiceConnection != null) {
            getContext().unbindService(customTabsServiceConnection);
        }
    }
}