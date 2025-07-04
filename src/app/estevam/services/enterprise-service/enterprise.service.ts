import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnterpriseService {
  private baseUrl = `${environment.apiUrl}/enterprise`;

  constructor(private http: HttpClient) {}

  openEnterprise(): Observable<{ status: 'Aberto' | 'Fechado' }> {
    return this.http
      .post<{ status: 'Aberto' | 'Fechado' }>(
        `${this.baseUrl}/switchStatus`,
        { status: 'Aberto' },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  closeEnterprise(): Observable<{ status: 'Aberto' | 'Fechado' }> {
    return this.http
      .post<{ status: 'Aberto' | 'Fechado' }>(
        `${this.baseUrl}/switchStatus`,
        { status: 'Fechado' },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  verifyStatus(): Observable<{ message: string }> {
    return this.http
      .get<{ message: string }>(`${this.baseUrl}/verifyStatus`, {
        headers: new HttpHeaders({
          'x-tenant-id': `${environment.adminApiKey}`,
        }),
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
