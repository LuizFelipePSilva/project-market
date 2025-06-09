import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../auth-services/auth.service';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IProduct } from '../../components/estevam/order/domain/IProduct';
import { error } from 'console';

export interface ICategory {
  id: string;
  name: string;
}
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = `${environment.apiUrl}/category`;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  listCategorys(): Observable<ICategory[]> {
    return this.http
      .get<ICategory[]>(`${this.baseUrl}/show`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  getProductByCategory(categoryId: string): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${environment.apiUrl}/product/category/${categoryId}`)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  createCategory(name: string): Observable<ICategory> {
    return this.http
      .post<ICategory>(
        `${this.baseUrl}/create`,
        { name },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  deleteCategory(categoryId: string) {
    return this.http
      .delete(`${this.baseUrl}/delete/${categoryId}`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  findCategory(categoryId: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.baseUrl}/find/${categoryId}`).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
