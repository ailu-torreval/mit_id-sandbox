import { Component, OnInit } from '@angular/core';
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  server = "mitid-test-99d1b.web.app";
  isToast = false;
  toastMessage!: string;
  result: any;
  credentials: any;

  constructor(private http: HttpClient, private router: Router) { }

  async ngOnInit() {
    this.result = await NativeBiometric.isAvailable({ useFallback: true });
  }

  login() {
    console.log('Login');
    this.saveCredentials({email: "email", password: "password"});
  }

  async performBiometricVerification() {
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      if (!result.isAvailable) return;

      const isFaceID = result.biometryType == BiometryType.FACE_ID;
      console.log("is face id?", isFaceID);

      const verified = await NativeBiometric.verifyIdentity({
        reason: 'Authentication',
        title: 'Log in',
        subtitle: isFaceID ? "FaceID" : 'Biometrics',
        description: `Your ${isFaceID ? "FaceID" : 'biometrics'} are needed for authorisation`,
        useFallback: true,
        maxAttempts: 3,
      })
        .then(() => true)
        .catch(() => false);

      if (!verified) {
        console.log("Not verified");
        return;
      } else {
        console.log("Verified");
      }

      // this.getCredentials();
    } catch (e) {
      console.log("ERROR 48", e);
    }
  }

  goHome() {
    this.router.navigate(['home'])
  }

  async saveCredentials(data: { email: string; password: string }) {
    try {
      // const result = await NativeBiometric.isAvailable();
      // if (!result.isAvailable) return;
      // Save user's credentials
      await NativeBiometric.setCredentials({
        username: data.email,
        password: data.password,
        server: this.server,
      });

      this.openToast('Login Successful');
    } catch (e) {
      console.log(e);
    }
  }

  async getCredentials() {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: this.server,
      });
      console.log(credentials);
      this.credentials = credentials;
      this.openToast(`Authorised! Credentials: ${credentials.username}, ${credentials.password}`);
    } catch (e) {
      console.log(e);
    }
  }

  deleteCredentials() {
    // Delete user's credentials
    NativeBiometric.deleteCredentials({
      server: this.server,
    }).then(() => {
      this.openToast('Credentials deleted');
    });
  }

  openToast(msg: string) {
    this.isToast = true;
    this.toastMessage = msg;
  }


  async challengeTest() {
    try {
      const obj = {
        amount: 'ALL THE MONEY IN THE WORLD',
        expiry: '2025-05-11T13:17:22.000Z',
        merchant: 'FAKE CHALLENGE CREATED BY AILIN',
        status: 'pending',
        uuid: '542b1ba6-3337-4928-aef1-ae2dce67f8f8',
        card_code: '113937194'
      };
  
      // Get your API URL from environment
      const url = 'https://api2.nykapital.dk/webhooks/rdx_challenge_notification';
      
      // Add any headers required by your webhook (e.g., for authentication)
      const headers = {
        'Content-Type': 'application/json'
        // Add any other headers your webhook expects
        // 'Authorization': 'Bearer your-token-if-needed'
      };
      
      // Make the POST request
      this.http.post(url, obj, { headers }).subscribe(
        (response) => {
          console.log('Challenge webhook test successful:', response);
        },
        (error) => {
          console.error('Challenge webhook test failed:', error);
        }
      );
    } catch(error) {
      console.log("ERROR ON CHALLENGE REQ", error);
    }
  }

}
