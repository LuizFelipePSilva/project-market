import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService, UserRole } from '../service/auth.service';
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.verifySession().pipe(
    map((response) => {
      const userRole: UserRole = response.message;
      const allowedRoles: UserRole[] = route.data['roles'];
      if (allowedRoles && allowedRoles.includes(userRole)) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError((error) => {
      return of(false);
    })
  );
};
