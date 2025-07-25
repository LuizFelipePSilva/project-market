import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

export type UserRole =
  | 'super'
  | 'admin'
  | 'clerk'
  | 'employee'
  | 'user'
  | undefined
  | null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private userRoleSubject = new BehaviorSubject<UserRole>(undefined);
  user$ = this.userRoleSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  public getCurrentUserRole(): UserRole {
    return this.userRoleSubject.value;
  }

  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  verifySession(): Observable<{ message: UserRole }> {
    return this.http
      .get<{ message: UserRole }>(`${this.apiUrl}/session/verify`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.userRoleSubject.next(response.message);
        })
      );
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/session/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          switchMap(() => this.verifySession());
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/session/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.userRoleSubject.next(null);
        })
      );
  }
}
