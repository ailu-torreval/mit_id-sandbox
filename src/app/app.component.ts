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

	initializeApp() {
		App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
			this.zone.run(() => {
				const domain = 'devdactic.com';

				const pathArray = event.url.split(domain);
				// Get the last element with pop()
				const appPath = pathArray.pop();
				if (appPath) {
					console.log('App opened with URL: ' + appPath);
				}
			});
		});
	}

}
