import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { DefaultSystemBrowserOptions, InAppBrowser } from '@capacitor/inappbrowser';
import { AlertController } from '@ionic/angular';
import { Base64 } from 'js-base64';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  url = 'https://nykapital-group-aps.sandbox.signicat.com';
  // url = 'https://nykapital-group-aps.app.signicat.com';
  // signicat_secret = 'rXbA5fvDVbQdXNuKLvFUfzTd7P7xl9GtnKbKMDxtfc3VIJD7';
  // client_id = 'prod-lively-tray-727';
  client_id = 'sandbox-high-train-160';
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
        // ? 'https://mitid-test-99d1b.web.app'
        : 'https://mitid-test-99d1b.web.app/app-switch';

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
        this.checkForState(state);
        await InAppBrowser.openInSystemBrowser({
          url: url,
          options: DefaultSystemBrowserOptions
        });

        InAppBrowser.addListener('browserClosed', () => {
          console.log('Browser closed - checking for OAuth completion');
        });
  
        // Also listen for app state changes (when returning from browser)
        App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            console.log('App became active - checking for OAuth completion');
          }
        });
        
      }
    } catch (error) {
      // Handle errors during code generation or URL construction
      console.error('Error initiating Signicat login:', error);
      // Display an error message to the user
    }
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
        })
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

  async checkForState(state: string) {
    try {
        // Wait for the initial 20 seconds before starting the loop
        await new Promise(resolve => setTimeout(resolve, 20000));

        const pollInterval = 10000; // 10 seconds
        let polling = true;

        while (polling) {
            console.log(`Polling for state: ${state}`);
            
            const response = await fetch(`https://api2.nykapital.dk/oauth/poll/${state}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🍓🍓🍓 Response received:', data);

                // Stop polling if session is found (not an error response)
                if (!data.error) {
                    polling = false;
                    // Handle the response data here
                    this.handleOAuthResponse(data);
                    return;
                }
            } else {
                console.log(`Polling failed with status: ${response.status}`);
            }

            // Wait for 10 seconds before the next poll
            if (polling) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }
    } catch (error) {
        console.error('Error checking state:', error);
    }
}

private handleOAuthResponse(data: any) {
    // Process the response - session was found
    console.log('Session found, processing:', data);
    if (data.code && data.state) {
        this.code = data.code;
        this.state = data.state;
        // Continue with your OAuth flow
        this.getToken();
        InAppBrowser.close();
    }
}
  async redirect() {
    await InAppBrowser.openInSystemBrowser({
      url: "https://cms.nykapital.dk",
      options: DefaultSystemBrowserOptions
    });
    // window.location.href = "https://cms.nykapital.dk";
  }
  redirect2() {
    window.location.href = "https://cms.nykapital.dk/login";
  }
  redirect3() {
    window.location.href = "dk.nykapital.client://login";
  }
}
