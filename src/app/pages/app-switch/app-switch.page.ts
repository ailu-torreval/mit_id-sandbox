import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-switch',
  templateUrl: './app-switch.page.html',
  styleUrls: ['./app-switch.page.scss'],
  standalone: false,
})
export class AppSwitchPage implements OnInit, OnDestroy {
  paramsLog: any = null;
  code: any = null;
  state: any = null;
  saved_state: string = '';
  code_challenge: string = '';
  step: 'init' | 'redirect' | 'error' = 'init';
  count: number = 10;
  
  // Add flags to prevent duplicate processing
  private isProcessing = false;
  private hasProcessedCallback = false;
  private hasStartedLogin = false;
  private paramsSubscription: Subscription | null = null;

  redirectUri = 'https://mitid-test-99d1b.web.app/app-switch';
  url = 'https://nykapital-group-aps.app.signicat.com';
  client_id = 'prod-lively-tray-727';
  // url = 'https://nykapital-group-aps.sandbox.signicat.com';
  // client_id = 'sandbox-high-train-160';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // alert('🔵 AppSwitchPage ngOnInit called');
    
    // Only subscribe once and add processing guards
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      // alert('🔵 Query params received: ' + JSON.stringify(params));
      
      if (this.isProcessing) {
        alert('🟡 Already processing, skipping params...');
        return;
      }

      this.code = params['code'];
      this.state = params['state'];
      this.code_challenge = params['code_challenge'] || '';
      this.saved_state = params['saved_state'] || '';
      this.paramsLog = params;

      const parsedParams = {
        code: this.code,
        state: this.state,
        code_challenge: this.code_challenge,
        saved_state: this.saved_state
      };
      // alert('🔵 Parsed params: ' + JSON.stringify(parsedParams));

      // First visit: has code_challenge and saved_state (start login)
      if (this.code_challenge && this.saved_state && !this.code && !this.state && !this.hasStartedLogin) {
        // alert('🟢 Starting MitID login flow');
        this.hasStartedLogin = true;
        this.startMitIDLogin();
      }
      
      // Second visit: has code and state (process callback)
      else if (this.code && this.state && !this.hasProcessedCallback) {
        // alert('🟢 Processing OAuth callback');
        this.hasProcessedCallback = true;
        this.step = 'redirect';
        this.sendDataToServer();
        this.startCounter();
      }
      
      else {
        alert('🟡 No action taken - conditions not met');
      }
    });
  }

  startCounter() {
    const intervalId = setInterval(() => {
      this.count--;
      if (this.count === 0) {
        clearInterval(intervalId);
      }
    }, 1000);
  }

  ngOnDestroy() {
    alert('🔴 AppSwitchPage ngOnDestroy called');
    this.step = 'init';
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
  }

  async startMitIDLogin() {
    if (this.isProcessing) {
      alert('🟡 Already processing login, skipping...');
      return;
    }
    
    this.isProcessing = true;
    const loginInfo = {
      code_challenge: this.code_challenge,
      saved_state: this.saved_state
    };
    // alert('🔵 Starting MitID Login with: ' + JSON.stringify(loginInfo));
    
    const authorizationUrl =
      `${this.url}/auth/open/connect/authorize?` +
      `client_id=${this.client_id}&` +
      `response_type=code&` +
      `redirect_uri=${this.redirectUri}&` +
      `state=${this.saved_state}&` +
      `scope=openid%20profile%20mitid-extra&` +
      `code_challenge=${this.code_challenge}&` +
      `code_challenge_method=S256`;

    // alert('🔵 Redirecting to: ' + authorizationUrl);
    
    // Add a small delay to prevent rapid redirects
    setTimeout(() => {
      window.location.href = authorizationUrl;
    }, 500);
  }

  async sendDataToServer() {
    if (this.isProcessing) {
      alert('🟡 Already processing server request, skipping...');
      return;
    }
    
    this.isProcessing = true;

    try {
      const payload = {
        code: this.code,
        state: this.state
      };

      // alert('🔵 Sending payload to server: ' + JSON.stringify(payload));

      const response = await fetch('https://api2.nykapital.dk/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // alert('🔵 Server response status: ' + response.status);
      
      if (response.status === 200 || response.status === 201) {
        // alert('✅ SUCCESS: ' + response.status);
        // const contentType = response.headers.get('content-type');
        // if (contentType && contentType.includes('application/json')) {
        //   const data = await response.json();
        //   alert('🟢 Server response data: ' + JSON.stringify(data));
        //   alert('✅ Data successfully sent to the server');
          
        //   // Close the browser after successful processing
        //   this.closeBrowserAndReturn();
        // } else {
        //   const text = await response.text();
        //   alert('🟡 Server response (non-JSON): ' + text);
        //   this.closeBrowserAndReturn();
        // }
      } else {
        const errorText = await response.text();
        alert('🔴 Failed to send data to server: ' + response.status + ' ' + response.statusText + ' ' + errorText);
      }
    } catch (error: any) {
      this.step = 'error';
      alert('🔴 Error sending data to server: ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }
}