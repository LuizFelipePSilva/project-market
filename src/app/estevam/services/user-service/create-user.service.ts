import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-services/auth.service';
import { catchError, Observable, throwError } from 'rxjs';
import { IUser } from '../../components/estevam/user/domain/IUser';
import { ICreateUser } from '../../components/estevam/user/domain/ICreateUser';

@Injectable({
  providedIn: 'root',
})
export class CreateUserService {
  private baseUrl = `${environment.apiUrl}/session/`;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }
  registerUser({
    name,
    email,
    password,
    confirmPassword,
  }: ICreateUser): Observable<IUser> {
    return this.http
      .post<IUser>(
        `${this.baseUrl}/register`,
        { name, email, password, confirmPassword },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
