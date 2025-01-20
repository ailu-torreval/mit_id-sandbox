import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Debug logging for launch
        print("DEBUG: App launching with options:", launchOptions ?? [:])
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        print("DEBUG: Application will resign active")
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        print("DEBUG: Application did enter background")
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        print("DEBUG: Application will enter foreground")
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        print("DEBUG: Application did become active")
    }

    func applicationWillTerminate(_ application: UIApplication) {
        print("DEBUG: Application will terminate")
    }

    // Universal Links & Deep Links handling
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        print("DEBUG: ====== App opened with URL ======")
        print("DEBUG: Complete URL:", url.absoluteString)
        print("DEBUG: URL scheme:", url.scheme ?? "no scheme")
        print("DEBUG: URL host:", url.host ?? "no host")
        print("DEBUG: URL path:", url.path)
        print("DEBUG: Query parameters:", url.query ?? "no query")
        print("DEBUG: URL options:", options)
        print("DEBUG: ================================")
        
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    // Universal Links handling
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        print("DEBUG: ====== Universal Link Activity ======")
        print("DEBUG: Activity Type:", userActivity.activityType)
        
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb {
            if let webpageURL = userActivity.webpageURL {
                print("DEBUG: Received Universal Link URL:", webpageURL.absoluteString)
                print("DEBUG: URL scheme:", webpageURL.scheme ?? "no scheme")
                print("DEBUG: URL host:", webpageURL.host ?? "no host")
                print("DEBUG: URL path:", webpageURL.path)
                print("DEBUG: Query parameters:", webpageURL.query ?? "no query")
            } else {
                print("DEBUG: No webpage URL found in activity")
            }
        } else {
            print("DEBUG: Activity is not a browsing activity")
        }
        
        print("DEBUG: Activity userInfo:", userActivity.userInfo ?? [:])
        print("DEBUG: Activity title:", userActivity.title ?? "No title")
        print("DEBUG: ===================================")
        
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // Push Notifications registration handling
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("DEBUG: Successfully registered for push notifications with token:", deviceToken.map { String(format: "%02.2hhx", $0) }.joined())
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("DEBUG: Failed to register for push notifications:", error.localizedDescription)
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    // Additional Universal Links support
    func application(_ application: UIApplication, willContinueUserActivityWithType userActivityType: String) -> Bool {
        print("DEBUG: Will continue user activity of type:", userActivityType)
        return true
    }

    func application(_ application: UIApplication, didFailToContinueUserActivityWithType userActivityType: String, error: Error) {
        print("DEBUG: Failed to continue user activity of type:", userActivityType)
        print("DEBUG: Error:", error.localizedDescription)
    }

    func application(_ application: UIApplication, didUpdate userActivity: NSUserActivity) {
        print("DEBUG: Did update user activity:", userActivity)
    }
}