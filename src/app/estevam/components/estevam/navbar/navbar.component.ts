import { Component } from '@angular/core';
import {
  AuthService,
  UserRole,
} from '../../../services/auth-services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  isMenuOpen = false;
  userRole$: Observable<UserRole | null>;
  openSubMenu: string | null = null;

  constructor(public authService: AuthService, private router: Router) {
    this.userRole$ = this.authService.user$;
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
        this.router.navigate(['estevam/login']).then(() => {
          this.authService.setLoading(false);
        });
      },
      error: () => {
        this.authService.setLoading(false);
      },
    });
  }
}
