import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Base64 } from 'js-base64';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  url = 'https://nykapital-group-aps.sandbox.signicat.com';
  signicat_secret = 'rXbA5fvDVbQdXNuKLvFUfzTd7P7xl9GtnKbKMDxtfc3VIJD7';
  client_id = 'sandbox-high-train-160';
  redirectUri = 'https://api2.nykapital.dk/getAuthData';
  paramsLog: any = null;
  encoded_credentials: string = "";
  code: any = null;
  state: any = null;
  token: any = null;
  storedCodeVerifier: any = null;
  storedState: any = null;
  response_data: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const combined = this.client_id + ":" + this.signicat_secret;
    this.encoded_credentials = Base64.encode(combined);
    console.log(this.encoded_credentials);
    this.route.queryParams.subscribe(params => {
      console.log("PARAMS",params)
      this.code = params['code'];
      this.state = params['state'];
      // Handle the extracted code and state as needed
      this.paramsLog = params
      if (this.code && this.state) {
        this.storedCodeVerifier = sessionStorage.getItem('code_verifier');
        this.storedState = sessionStorage.getItem('state');
        console.log(this.paramsLog)
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

      const authorizationUrl = `${this.url}/auth/open/connect/authorize?` +
        `client_id=${this.client_id}&` +
        `response_type=code&` +
        `redirect_uri=${this.redirectUri}&` +
        `state=${state}&` +
        `scope=openid%20profile%20nin&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      window.location.href = authorizationUrl; 
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
          'Authorization': `Basic ${this.encoded_credentials}`
        },
        body: new URLSearchParams({
          'client_id': this.client_id,
          'redirect_uri': this.redirectUri,
          'grant_type': 'authorization_code',
          'code': `${this.code}`,
          'code_verifier': this.storedCodeVerifier
        })
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
            'Authorization': `Bearer ${this.token}`
        }
    });
    //We create json from the response we got from the GET request.
    const json = await response.json()
    //Check your browser console for a more detailed JSON object.
    console.log("DATA",json)
    this.response_data = json;
} 
}
