import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  DefaultSystemBrowserOptions,
  InAppBrowser,
} from '@capacitor/inappbrowser';
import { AlertController } from '@ionic/angular';
import { Base64 } from 'js-base64';
import { CustomTabs } from 'src/plugins/custom-tabs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  // url = 'https://nykapital-group-aps.sandbox.signicat.com';
  url = 'https://nykapital-group-aps.app.signicat.com';
  // signicat_secret = 'rXbA5fvDVbQdXNuKLvFUfzTd7P7xl9GtnKbKMDxtfc3VIJD7';
  client_id = 'prod-lively-tray-727';
  // client_id = 'sandbox-high-train-160';
  redirectUri = 'https://mitid-test-99d1b.web.app';
  message: string = '';

  paramsLog: any = null;
  encoded_credentials: string = '';
  code: any = null;
  state: any = null;
  token: any = null;
  storedCodeVerifier: any = null;
  storedState: any = null;
  response_data: any = null;
  user_data: any = null;
  pollingAbortController: AbortController | null = null;
  isPolling: boolean = false;
  broswerManuallyClosed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // const combined = this.client_id + ':' + this.signicat_secret;
    // this.encoded_credentials = Base64.encode(combined);
    console.log(this.encoded_credentials);
    const platform = Capacitor.getPlatform();
    this.redirectUri =
      platform === 'web'
        ? 'http://localhost:8100'
        : // ? 'https://mitid-test-99d1b.web.app'
          'https://mitid-test-99d1b.web.app/app-switch';

    this.route.queryParams.subscribe((params) => {
      this.message = params['state'];
      console.log('PARAMS', params);
      this.code = params['code'];
      this.state = params['state'];
      // Handle the extracted code and state as needed
      this.paramsLog = params;
      if (this.code && this.state) {
        this.storedCodeVerifier = sessionStorage.getItem('code_verifier');
        this.storedState = sessionStorage.getItem('state');
        console.log(this.paramsLog);
        this.getToken();
      }
    });
  }

  generateRandomState() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 32; i++) {
      state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
  }

  generateCodeVerifier() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    for (let i = 0; i < 43; i++) {
      codeVerifier += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return codeVerifier;
  }

  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64Digest
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async handleSignicat() {
    try {
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      const state = this.generateRandomState();

      // Store code_verifier and state securely (e.g., in session storage)
      sessionStorage.setItem('code_verifier', codeVerifier);
      sessionStorage.setItem('state', state);

      const authorizationUrl =
        `${this.url}/auth/open/connect/authorize?` +
        `client_id=${this.client_id}&` +
        `response_type=code&` +
        `redirect_uri=${this.redirectUri}&` +
        `state=${state}&` +
        `scope=openid%20profile%20mitid-extra&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      // {
      //   "name": "Saga Poulsen",
      //   "family_name": "Poulsen",
      //   "given_name": "Saga",
      //   "birthdate": "1932-02-09",
      //   "nin": "0902322779",
      //   "nin_type": "PERSON",
      //   "nin_issuing_country": "DK",
      //   "mitid_has_cpr": "true",
      //   "mitid_transaction_id": "b09eab99-85e0-41e4-beed-99e85520194d",
      //   "mitid_reference_text_body": " ",
      //   "mitid_cpr_source": "database",
      //   "mitid_ial": "SUBSTANTIAL",
      //   "mitid_loa": "SUBSTANTIAL",
      //   "mitid_aal": "SUBSTANTIAL",
      //   "mitid_fal": "HIGH",
      //   "mitid_uuid": "8314ab25-bf71-49ff-aee6-15e7d084cec1",
      //   "idp_issuer": "MitID",
      //   "sub": "raa2gRXppmWAK01yx6TDB4OExDK0oBQRjL-qR3MCx1E="
      // }
      // "8314ab25-bf71-49ff-aee6-15e7d084cec1"

      console.log('Authorization URL:', authorizationUrl);
      if (Capacitor.getPlatform() === 'web') {
        window.location.href = authorizationUrl;
      } else {
        const url = `${this.redirectUri}?saved_state=${state}&code_challenge=${codeChallenge}`;
        // Start polling with abort capability
        this.checkForState(state);

        await InAppBrowser.openInSystemBrowser({
          url: url,
          options: DefaultSystemBrowserOptions,
        });

        InAppBrowser.addListener('browserClosed', () => {
          console.log('Browser closed');
          if(!this.broswerManuallyClosed) {
            console.log("checking one last time and stop polling");
          this.stopPolling();
          this.checkOnce(state);
          }
        });

        App.addListener('appStateChange', (appState) => {
          if (appState.isActive) {
            console.log('App became active');
          }
        });
      }
    } catch (error) {
      console.error('Error initiating Signicat login:', error);
      this.stopPolling();
    }
  }

  stopPolling() {
    if (this.pollingAbortController) {
      console.log('🛑 Stopping polling loop');
      this.pollingAbortController.abort();
      this.pollingAbortController = null;
      this.isPolling = false;
    }
  }

  async checkForState(state: string) {
    // Create new abort controller for this polling session
    this.pollingAbortController = new AbortController();
    this.isPolling = true;

    const maxAttempts = 18; // 18 attempts × 10 seconds = 3 minutes
    const pollInterval = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check if polling was aborted
      if (this.pollingAbortController.signal.aborted) {
        console.log('🛑 Polling aborted');
        return;
      }

      try {
        console.log(
          `🔍 Checking OAuth status for state: ${state} (${attempt}/${maxAttempts})`
        );

        const response = await fetch(
          `https://api2.nykapital.dk/oauth/poll/${state}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: this.pollingAbortController.signal, // Add abort signal to fetch
          }
        );

        console.log(`📡 Response status: ${response.status}`);

        if (response.status === 201) {
          console.log('✅ OAuth session found:',response.status);
          this.broswerManuallyClosed = true;
          InAppBrowser.close();
          // const data = await response.json();

          // if (data.completed && data.code && data.state && !data.error) {
          //   console.log('✅ Valid OAuth data received, processing...');
          //   this.handleOAuthResponse(data);
          //   this.stopPolling(); // Clean up
          return;
          // } else {
          //   console.log('⚠️ OAuth session found but data is incomplete:', data);
          // }
        } else if (response.status === 200) {
          console.log('⏳ OAuth session not ready yet (404)');
        } else if (response.status >= 400) {
          console.log(`❌ OAuth polling failed with status ${response.status}`);
          // const errorText = await response.text();
          // console.log(`❌ Error details: ${errorText}`);
          this.stopPolling();
          return;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🛑 Fetch aborted');
          return;
        }
        console.error('❌ Error checking OAuth state:', error);
      }

      // Wait 10 seconds before next attempt (unless aborted or last attempt)
      if (
        attempt < maxAttempts &&
        !this.pollingAbortController.signal.aborted
      ) {
        console.log(`⏳ Waiting 10 seconds before next check...`);
        try {
          await this.delay(pollInterval);
        } catch (error) {
          if (this.pollingAbortController.signal.aborted) {
            console.log('🛑 Delay aborted');
            return;
          }
        }
      }
    }

    console.log('⏰ Polling timeout - 3 minutes reached');
    this.stopPolling();
  }

  async openCustomTab() {
    try {
      await CustomTabs.openUrl({ url: 'https://www.google.com' });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Helper method for abortable delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);

      if (this.pollingAbortController) {
        this.pollingAbortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Aborted'));
        });
      }
    });
  }

  // Check once without starting a loop
  async checkOnce(state: string = 'EXAMPLE_STATE') {
    try {
      console.log(`🔍 Final check for OAuth status: ${state}`);

      const response = await fetch(
        `https://api2.nykapital.dk/oauth/poll/${state}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`📡 Final check response status: ${response.status}`);

      if (response.status === 200 || response.status === 201) {
        console.log('✅ OAuth completed on final check!');
        // const data = await response.json();
        // if (data.completed && data.code && data.state && !data.error) {
          // this.handleOAuthResponse(data);
          return;
        // }
      }

      console.log('❌ OAuth not completed on final check');
    } catch (error) {
      console.error('❌ Error in final OAuth check:', error);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  async getToken() {
    try {
      const response = await fetch(`${this.url}/auth/open/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Authorization: `Basic ${this.encoded_credentials}`,
        },
        body: new URLSearchParams({
          client_id: this.client_id,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          code: `${this.code}`,
          code_verifier: this.storedCodeVerifier,
        }),
      });

      // Log the response status and body for debugging
      console.log('Response status:', response.status);
      const responseBody = await response.text();
      console.log('Response body:', responseBody);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = JSON.parse(responseBody);
      this.token = json.access_token;
      console.log('Access token:', this.token);

      if (this.token) {
        this.getUser();
      } else {
        console.log('Not a valid token');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  async getUser() {
    //Get the access token from localStorage which we stored in the last function, and store it in the "myToken" variable.

    const response = await fetch(`${this.url}//auth/open/connect/userinfo`, {
      method: 'GET',
      //Headers uses Bearer authorization with the access token we extracted.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });
    //We create json from the response we got from the GET request.
    const json = await response.json();
    //Check your browser console for a more detailed JSON object.
    console.log('DATA', json);
    this.response_data = json;
    if (this.response_data !== null) {
      this.getNyKuser();
    }
    this.cdr.detectChanges();
  }

  getNyKuser() {
    console.log({
      cpr: this.response_data.nin,
      mitid_uuid: this.response_data.mitid_uuid,
    });
    // this.http
    //   .post('https://api2.nykapital.dk/nyk_authenticate', {
    //     cpr: this.response_data.nin,
    //     mitid_uuid: this.response_data.mitid_uuid,
    //   })
    //   .subscribe((data) => {
    //     this.user_data = data;
    //     console.log("DATA FROM NYK", data);
    //   });
  }

  private handleOAuthResponse(data: any) {
    // Process the response - session was found
    console.log('✅ Session found, processing:', data);

    if (data.code && data.state) {
      this.code = data.code;
      this.state = data.state;

      // Store the values for getToken
      this.storedCodeVerifier = sessionStorage.getItem('code_verifier');
      this.storedState = sessionStorage.getItem('state');

      // Verify the state matches what we expect
      if (this.storedState === data.state) {
        console.log('✅ State verified, proceeding with token exchange');
        this.getToken();

        // Close the in-app browser
        try {
          InAppBrowser.close();
        } catch (e) {
          console.log('Could not close InAppBrowser:', e);
        }
      } else {
        console.error(
          '❌ State mismatch! Expected:',
          this.storedState,
          'Got:',
          data.state
        );
      }
    } else {
      console.error('❌ Invalid OAuth response data:', data);
    }
  }

  async redirect2() {
    try {
      const payload = {
        code: 'TESTINGCODE',
        state: 'TESTINGSTATE',
      };

      const response = await fetch('https://api2.nykapital.dk/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('🔵 Server response status: ' + response.status);

      if (response) {
        console.log('🔵 Server response received:', response);
        console.log('🔵 Server response received:', await response.json());
      }
    } catch (error: any) {
      console.log('🔴 Error sending data to server: ' + error.message);
    }
  }
  redirect3() {
    window.location.href = 'dk.nykapital.client://login';
  }
}
