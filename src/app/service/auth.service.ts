import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export type UserRole = 'admin' | 'clerk' | 'employee' | 'user' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  urlDefaultForProxy = '/v1/api/';

  private userRoleSubject = new BehaviorSubject<UserRole>(null);
  user$ = this.userRoleSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.verifySession().subscribe();
  }

  setLoading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

  verifySession(): Observable<{ message: UserRole }> {
    return this.http
      .get<{ message: UserRole }>(
        this.urlDefaultForProxy + '/v1/api/session/verify',
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this.userRoleSubject.next(response.message);
        })
      );
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        this.urlDefaultForProxy + 'v1/api/session/login',
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.verifySession().subscribe();
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(
        this.urlDefaultForProxy + '/v1/api/session/logout',
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.userRoleSubject.next(null);
        })
      );
  }
}
