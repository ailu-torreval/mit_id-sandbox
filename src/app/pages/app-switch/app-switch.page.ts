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

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log("PARAMS",params)
      this.code = params['code'];
      this.state = params['state'];
      // Handle the extracted code and state as needed
      this.paramsLog = params
    });
  }

  redirect() {
    window.location.href = `dk.ionic.mitIdTester://home?code=${this.code}&state=${this.state}`;
  }

}
