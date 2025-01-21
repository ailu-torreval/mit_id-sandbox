import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

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
        let queryParams: { [key: string]: string } = {};
        const platform = Capacitor.getPlatform();

        if (urlString.match(/dk\.ionic\.mit[iI]d[tT]ester:\/\//)) {
          // Handle custom scheme (keep as is)
          const withoutScheme = urlString.replace(
            /dk\.ionic\.mit[iI]d[tT]ester:\/\//g,
            ''
          );
          const parts = withoutScheme.split('?');
          const path = parts[0].replace('//', '/').replace(/^\//, '');

          if (parts.length > 1) {
            const searchParams = new URLSearchParams(parts[1]);
            searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });
          }

          console.log(
            'Custom URL - Navigating to:',
            path,
            'with params:',
            queryParams
          );
          this.zone.run(() => {
            this.router.navigate([`/${path}`], { queryParams });
          });
        } else if (
          urlString.startsWith('https://') &&
          urlString.includes('/app-switch')
        ) {
          // Handle app-switch route
          const url = new URL(urlString);
          url.searchParams.forEach((value, key) => {
            queryParams[key] = value;
          });

          if (platform === 'web') {
            // Keep on app-switch for web
            this.zone.run(() => {
              this.router.navigate(['/app-switch'], { queryParams });
            });
          } else {
            // Redirect to home for mobile
            this.zone.run(() => {
              this.router.navigate(['/home'], { queryParams });
            });
          }
        } else if (urlString.startsWith('https://')) {
          // Handle regular https URLs
          const url = new URL(urlString);
          url.searchParams.forEach((value, key) => {
            queryParams[key] = value;
          });

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
