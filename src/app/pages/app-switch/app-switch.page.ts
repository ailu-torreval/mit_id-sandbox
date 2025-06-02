import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-app-switch',
  templateUrl: './app-switch.page.html',
  styleUrls: ['./app-switch.page.scss'],
  standalone: false,
})
export class AppSwitchPage implements OnInit {
  paramsLog: any = null;
  code: any = null;
  state: any = null;
  saved_state: string = '';
  code_challenge: string = '';

  url = 'https://nykapital-group-aps.sandbox.signicat.com';
  // url = 'https://nykapital-group-aps.app.signicat.com';
  // signicat_secret = 'rXbA5fvDVbQdXNuKLvFUfzTd7P7xl9GtnKbKMDxtfc3VIJD7';
  // client_id = 'prod-lively-tray-727';
  client_id = 'sandbox-high-train-160';
  redirectUri = 'https://mitid-test-99d1b.web.app/app-switch';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log("PARAMS",params)
      this.code = params['code'];
      this.state = params['state'];
      this.code_challenge = params['code_challenge'] || '';
      this.saved_state = params['saved_state'] || '';
      // Handle the extracted code and state as needed
      this.paramsLog = params
      alert("App Switch Page: " + JSON.stringify(this.paramsLog));

      if (this.code_challenge && this.saved_state) {
        this.startMitIDLogin();
      }
      if (this.code && this.state) {
        alert("paramenters received" + JSON.stringify({ code: this.code, state: this.state }));
        this.sendDataToServer();
      }

    });
  }

  async startMitIDLogin() {
    alert("Starting MitID Login with code_challenge: " + this.code_challenge + " and saved_state: " + this.saved_state);
    const authorizationUrl =
    `${this.url}/auth/open/connect/authorize?` +
    `client_id=${this.client_id}&` +
    `response_type=code&` +
    `redirect_uri=${this.redirectUri}&` +
    `state=${this.saved_state}&` +
    `scope=openid%20profile%20mitid-extra&` +
    `code_challenge=${this.code_challenge}&` +
    `code_challenge_method=S256`;

    window.location.href = authorizationUrl;

  }

  async sendDataToServer() {
    try {
      const payload = {
        code: this.code,
        state: this.state
      };
  
      alert('Sending data to server:' + payload);
  
      const response = await fetch('https://api2.nykapital.dk/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Server response:'+ data);
  
        // Handle success
        alert('Data successfully sent to the server.');
      } else {
        console.error('Failed to send data to server:', response.status, response.statusText);
        alert('Failed to send data to the server.');
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
      alert('An error occurred while sending data to the server.' + JSON.stringify(error));
    }
  }

  redirect() {
    window.location.href = `dk.ionic.mitIdTester://home?code=${this.code}&state=${this.state}`;
  }

}
