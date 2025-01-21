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
		console.log('Initializing app...');
		
		App.addListener('appUrlOpen', (event: any) => {
		  console.log('App opened with URL:', event);
		  
		  try {
			const urlString = event.url;
			let queryParams: {[key: string]: string} = {};
			
			if (urlString.startsWith('dk.ionic.mitIdTester://')) {
			  // Handle custom scheme
			  const withoutScheme = urlString.replace('dk.ionic.mitIdTester://', '');
			  const parts = withoutScheme.split('?');
			  const path = parts[0].replace('//', '/').replace(/^\//, '');
			  
			  if (parts.length > 1) {
				const searchParams = new URLSearchParams(parts[1]);
				searchParams.forEach((value, key) => {
				  queryParams[key] = value;
				});
			  }
			  
			  console.log('Custom URL - Navigating to:', path, 'with params:', queryParams);
			  this.zone.run(() => {
				this.router.navigate([`/${path}`], { queryParams });
			  });
			} else if (urlString.startsWith('https://')) {
			  // Handle Universal Links
			  const url = new URL(urlString);
			  url.searchParams.forEach((value, key) => {
				queryParams[key] = value;
			  });
			  
			  console.log('Universal Link - Navigating with params:', queryParams);
			  
			  // Since your auth redirect comes to root ('/'), navigate to home with params
			  this.zone.run(() => {
				this.router.navigate(['/home'], { queryParams });
			  });
			}
		  } catch (e) {
			console.error('Error handling URL:', e);
		  }
		});
	  }
	}