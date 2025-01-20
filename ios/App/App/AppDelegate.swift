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
        print("DEBUG: Scheme:", url.scheme ?? "no scheme")
        print("DEBUG: Host:", url.host ?? "no host")
        print("DEBUG: Path:", url.path)
        print("DEBUG: Query:", url.query ?? "no query")
        print("DEBUG: ============================")
        
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        print("DEBUG: ====== Universal Link Activity ======")
        print("DEBUG: Activity Type:", userActivity.activityType)
        
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb {
            guard let url = userActivity.webpageURL else {
                print("DEBUG: No URL found in activity")
                return false
            }
            
            print("DEBUG: Universal Link URL:", url.absoluteString)
            print("DEBUG: Scheme:", url.scheme ?? "no scheme")
            print("DEBUG: Host:", url.host ?? "no host")
            print("DEBUG: Path:", url.path)
            print("DEBUG: Query:", url.query ?? "no query")
            
            if url.path.contains("home") {
                print("DEBUG: Home path detected")
                if let components = URLComponents(url: url, resolvingAgainstBaseURL: true) {
                    print("DEBUG: Query Items:", components.queryItems ?? [])
                }
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