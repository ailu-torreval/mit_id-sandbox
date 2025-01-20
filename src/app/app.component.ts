import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router, private zone: NgZone) {
		this.initializeApp();
	}

	async initializeApp() {
		App.addListener('appUrlOpen', (event: any) => {
		  console.log('App opened with URL:', event);
		  
		  if (event.url.includes('/home')) {
			console.log('Home URL detected:', event.url);
			// Handle the URL parameters
			const urlParams = new URLSearchParams(new URL(event.url).search);
			const params: {[key: string]: string} = {};
			urlParams.forEach((value, key) => {
			  params[key] = value;
			});
			console.log('URL parameters:', params);
		  }
		});
	  }

}
