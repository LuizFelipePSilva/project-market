import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-services/auth.service';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateUserService {
  private baseUrl = `${environment.apiUrl}/user/`;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  updateRole(id: string, role: string) {
    return this.http
      .patch(
        `${this.baseUrl}/updateRole`,
        { id, role },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
