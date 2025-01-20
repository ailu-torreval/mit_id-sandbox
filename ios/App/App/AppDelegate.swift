import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        print("DEBUG: App launching with options:", launchOptions ?? [:])
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        print("DEBUG: ====== Deep Link Opened ======")
        print("DEBUG: URL:", url.absoluteString)
        print("DEBUG: Options:", options)
        
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        print("DEBUG: ====== Universal Link Activity ======")
        
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb {
            guard let url = userActivity.webpageURL else {
                print("DEBUG: No URL found in activity")
                return false
            }
            
            print("DEBUG: Received URL:", url.absoluteString)
            print("DEBUG: Host:", url.host ?? "no host")
            print("DEBUG: Path:", url.path)
            print("DEBUG: Query:", url.query ?? "no query")
            
            // Try to explicitly handle the home path with query parameters
            if url.path == "/home" {
                print("DEBUG: Matched /home path")
                // You might want to handle the URL parameters here
                let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
                print("DEBUG: URL Components:", components?.queryItems ?? [])
            }
        }
        
        print("DEBUG: ===================================")
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, willContinueUserActivityWithType userActivityType: String) -> Bool {
        print("DEBUG: Will continue activity type:", userActivityType)
        return true
    }

    func application(_ application: UIApplication, didFailToContinueUserActivityWithType userActivityType: String, error: Error) {
        print("DEBUG: Failed to continue activity:", userActivityType)
        print("DEBUG: Error:", error)
    }
}