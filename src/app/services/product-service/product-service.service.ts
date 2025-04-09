import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-services/auth.service';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface IProduct {
  id: string;
  name: string;
  value: number;
  category: string;
  description: string;
  status: 'Disponivel' | 'Indisponivel';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductServiceService {
  private baseUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  createProduct(
    name: string,
    value: number,
    category: string,
    description: string
  ): Observable<IProduct> {
    return this.http
      .post<IProduct>(
        `${this.baseUrl}/`,
        { name, value, category, description },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating product:', error);
          return throwError(() => error);
        })
      );
  }
}
