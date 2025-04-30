import { Component } from '@angular/core';

import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterOutlet,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './estevam/services/auth-services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoading$!: Observable<boolean>;

  constructor(public authService: AuthService, private router: Router) {
    this.isLoading$ = this.authService.isLoading$;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.authService.setLoading(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.authService.setLoading(false);
      }
    });
  }
}
