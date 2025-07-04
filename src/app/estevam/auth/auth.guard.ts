// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, UserRole } from '../services/auth-services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return firstValueFrom(
    authService.verifySession().pipe(
      map((response) => {
        const userRole = response.message;
        const allowedRoles = route.data['roles'] as UserRole[];

        return !allowedRoles || allowedRoles.includes(userRole)
          ? true
          : router.createUrlTree(['/estevam/login']);
      }),
      catchError(() => [router.createUrlTree(['/estevam/login'])])
    )
  );
};
