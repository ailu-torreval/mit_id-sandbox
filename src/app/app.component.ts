import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  url = 'nykapital-group-aps.sandbox.signicat.com';
  signicat_secret = '5mZkjdnQanBj44DE4GSU8GJJNxse1qLWV0pu1zhU4kCSHkAu';

  constructor() {}

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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    for (let i = 0; i < 43; i++) {
      codeVerifier += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return codeVerifier;
  }
  
  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  handleSignicat() {
    const clientId = 'sandbox-little-foot-908';
    const redirectUri = 'http://localhost:8100/home';
    const scope = 'openid profile email'; // Adjust scopes as needed
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const randomState = this.generateRandomState();

    const url = `https://your-oidc-provider/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${randomState}`;
    window.location.href = url;
  }
}
