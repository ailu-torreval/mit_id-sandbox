package dk.ionic.mitIdTester;
 
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.epicshaggy.biometric.NativeBiometric;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeBiometric.class);
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        String action = intent.getAction();
        Uri data = intent.getData();

        Log.d("DeepLinkDebug", "Intent received");
        Log.d("DeepLinkDebug", "Action: " + action);

        if (data != null) {
            Log.d("DeepLinkDebug", "URI: " + data.toString());
            Log.d("DeepLinkDebug", "Scheme: " + data.getScheme());
            Log.d("DeepLinkDebug", "Host: " + data.getHost());
            Log.d("DeepLinkDebug", "Path: " + data.getPath());
            Log.d("DeepLinkDebug", "Query: " + data.getQuery());
        }
    }
}
