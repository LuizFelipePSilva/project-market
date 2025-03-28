import { Component, OnInit } from '@angular/core';
import { AuthService, UserRole } from './service/auth.service';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading$!: Observable<boolean>;
  isMenuOpen = false;
  userRole$: Observable<UserRole | null>;
  openSubMenu: string | null = null;

  constructor(public authService: AuthService, private router: Router) {
    this.userRole$ = this.authService.user$;
  }

  ngOnInit(): void {
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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSubMenu(menu: string) {
    this.openSubMenu = this.openSubMenu === menu ? null : menu;
  }

  logout(): void {
    this.authService.setLoading(true);
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']).then(() => {
          this.authService.setLoading(false);
        });
      },
      error: () => {
        this.authService.setLoading(false);
      },
    });
  }
}
