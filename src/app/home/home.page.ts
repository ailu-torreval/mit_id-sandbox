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
  // code = "c2FuZGJveC1saXR0bGUtZm9vdC05MDg6NW1aa2pkblFhbkJqNDRERTRHU1U4R0pKTnhzZTFxTFdWMHB1MXpoVTRrQ1NIa0F1";
  client_id = 'sandbox-high-train-160';
  redirectUri = 'https://api2.nykapital.dk/getAuthData';
  paramsLog: any = null;
  encoded_credentials: string = "";
  code: any = null;
  state: any = null;
  token: any = null;
  secret2 = "UD7GCjvDIKVtAsRhTqQVRczgfLn5zbaONL5406jviYsZ8Z8X"
  client_id2 = "sandbox-tricky-screw-504"

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const combined = this.client_id + ":" + this.signicat_secret;
    this.encoded_credentials = Base64.encode(combined);
    console.log(this.encoded_credentials);
    this.route.queryParams.subscribe(params => {
      console.log("PARAMS",params)
      // this.code = params['code'];
      // this.state = params['state'];
      // // Handle the extracted code and state as needed
      // this.paramsLog = params
      // if (this.code && this.state) {
      //   console.log(this.paramsLog)
      //   this.getToken();
      // }
    });

    const url3 = `${this.url}/auth/open/connect/authorize?&client_id=${this.client_id2}&response_type=code&redirect_uri=${this.redirectUri}&state=1734690827104-o8E&scope=openid%20profile&code_challenge=oQp88n_gdqc57RSQjJDe5k5aQy7FeAqP0RmVLKNOt_Q&code_challenge_method=S256`;
    // const url3 = `${this.url}/auth/open/connect/authorize?&client_id=${this.client_id}&response_type=code&redirect_uri=${this.redirectUri}&state=1734690827104-o8E&scope=openid%20profile&code_challenge=oQp88n_gdqc57RSQjJDe5k5aQy7FeAqP0RmVLKNOt_Q&code_challenge_method=S256`;

    this.paramsLog = url3;
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
    const clientId = 'sandbox-little-foot-908';
    const scope = 'openid profile email'; // Adjust scopes as needed
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const randomState = this.generateRandomState();

    const url2 = `${this.url}/auth/open/connect/authorize?
    &client_id=${clientId}
    &response_type=code
    &redirect_uri=${this.redirectUri}
    &state=${randomState}
    &scope=openid
    &code_challenge=${codeChallenge}
    &code_challenge_method=S256`;


    const url3 = `${this.url}/auth/open/connect/authorize?&client_id=${this.client_id2}&response_type=code&redirect_uri=${this.redirectUri}&state=1734690827104-o8E&scope=openid%20profile&code_challenge=oQp88n_gdqc57RSQjJDe5k5aQy7FeAqP0RmVLKNOt_Q&code_challenge_method=S256`;
    // const url3 = `${this.url}/auth/open/connect/authorize?&client_id=${this.client_id}&response_type=code&redirect_uri=${this.redirectUri}&state=1734690827104-o8E&scope=openid%20profile&code_challenge=oQp88n_gdqc57RSQjJDe5k5aQy7FeAqP0RmVLKNOt_Q&code_challenge_method=S256`;

    this.paramsLog = url3;
    // const url = `https://your-oidc-provider/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${randomState}`;
    window.location.href = url3;

    console.log(url2);
  }

  // final response should be:
  // {
  //   "sub" : "ACHtVyC-I7Smftn0W4rl-sZYY72DhDKmAKhW-twRK4M=",
  //   "birthdate" : "2010-12-24",
  //   "nin_issuing_country" : "DK",
  //   "mitid_ial" : "SUBSTANTIAL",
  //   "mitid_uuid" : "761b37f4-4315-4ae7-a9d6-f1f5d8663423",
  //   "idp_issuer" : "MitID",
  //   "idp_id" : "761b37f4-4315-4ae7-a9d6-f1f5d8663423",
  //   "mitid_fal" : "HIGH",
  //   "given_name" : "Sofia",
  //   "mitid_aal" : "SUBSTANTIAL",
  //   "nin" : "2412107422",
  //   "nin_type" : "PERSON",
  //   "mitid_has_cpr" : "true",
  //   "mitid_cpr_source" : "user",
  //   "name" : "Sofia Pedersen",
  //   "mitid_reference_text_body" : " ",
  //   "mitid_transaction_id" : "2847fbd9-5f12-4bd3-8632-c4ce9b5f3a2e",
  //   "family_name" : "Pedersen",
  //   "mitid_loa" : "SUBSTANTIAL"
  // }

//   async getToken() {
//     try {
//       const response = await fetch(`${this.url}/auth/open/connect/token`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Basic ${this.encoded_credentials}`
//         },
//         body: new URLSearchParams({
//           'client_id': this.client_id,
//           'redirect_uri': this.redirectUri,
//           'grant_type': 'authorization_code',
//           'code': `${this.code}`
//         })
//       });
  
//       // Log the response status and body for debugging
//       console.log('Response status:', response.status);
//       const responseBody = await response.text();
//       console.log('Response body:', responseBody);
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
  
//       const json = JSON.parse(responseBody);
//       const newToken = json.access_token;
//       console.log('Access token:', newToken);
  
//       if (newToken) {
//         this.token = newToken;
//         this.getUser();
//       } else {
//         console.log('Not a valid token');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }
//   async getUser() {
//     //Get the access token from localStorage which we stored in the last function, and store it in the "myToken" variable.
  
    
//     const response = await fetch(`${this.url}//auth/open/connect/userinfo`, {
//         method: 'GET',
//         //Headers uses Bearer authorization with the access token we extracted.
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${this.token}`
//         }
//     });
//     //We create json from the response we got from the GET request.
//     const json = await response.json()
//     //Check your browser console for a more detailed JSON object.
//     console.log("DATA",json)
// } 
}
