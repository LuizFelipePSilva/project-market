import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { catchError, Observable, throwError } from 'rxjs';
import { ICategory } from '../category-service/category.service';

interface formCreate {
  name: string;
  value: number;
  maxAdd?: number;
  categoryId: string;
}
export interface IAditional {
  id?: string;
  name: string;
  value: number;
  categoryId: string;
  maxAdd: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AdditionalService {
  private baseUrl = `${environment.apiUrl}/additional`;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  createAdditional({
    name,
    categoryId,
    value,
    maxAdd,
  }: formCreate): Observable<IAditional> {
    return this.http
      .post<IAditional>(
        `${this.baseUrl}/create`,
        { name, categoryId, value, maxAdd },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  listAdditionalByCategory(categoryId: string): Observable<IAditional[]> {
    return this.http
      .get<IAditional[]>(`${this.baseUrl}/show/category/${categoryId}`, {
        withCredentials: true,
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

  deleteAdditional(additionalId: string) {
    return this.http
      .delete(`${this.baseUrl}/delete/${additionalId}`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  updateValue(id: string, value: number): Observable<IAditional> {
    return this.http
      .patch<IAditional>(
        `${this.baseUrl}/changeValue/${id}`,
        {
          value: value,
        },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  updateNameMaxAdd(
    id: string,
    name?: string,
    maxAdd?: number
  ): Observable<IAditional> {
    return this.http
      .patch<IAditional>(
        `${this.baseUrl}/update/${id}`,
        { ...(name && { name }), ...(maxAdd !== undefined && { maxAdd }) },
        { withCredentials: true }
      )
      .pipe(catchError((error) => throwError(() => error)));
  }
}
