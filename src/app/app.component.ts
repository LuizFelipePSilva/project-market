import { Component, OnInit } from '@angular/core';
import { AuthService, UserRole } from './service/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
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
    this.authService.verifySession().subscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSubMenu(menu: string) {
    this.openSubMenu = this.openSubMenu === menu ? null : menu;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
