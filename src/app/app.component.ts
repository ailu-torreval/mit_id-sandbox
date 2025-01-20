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
			console.log('DEBUG: ====== App URL Open Event ======');
			console.log('DEBUG: Full event:', event);
			console.log('DEBUG: URL received:', event.url);
			
			if (event.url.includes('/home')) {
			  console.log('DEBUG: Home URL detected');
			  try {
				const url = new URL(event.url);
				console.log('DEBUG: URL parts:', {
				  protocol: url.protocol,
				  host: url.host,
				  pathname: url.pathname,
				  search: url.search
				});
				
				const urlParams = new URLSearchParams(url.search);
				const params: {[key: string]: string} = {};
				urlParams.forEach((value, key) => {
				  params[key] = value;
				  console.log('DEBUG: Parameter:', key, '=', value);
				});
				console.log('DEBUG: All parameters:', params);
				
				// Navigate to home with the parameters
				this.router.navigate(['/home'], { queryParams: params });
			  } catch (error) {
				console.error('DEBUG: Error processing URL:', error);
			  }
			} else {
			  console.log('DEBUG: URL does not contain /home path');
			}
			console.log('DEBUG: ==============================');
		  });

	  }

}
