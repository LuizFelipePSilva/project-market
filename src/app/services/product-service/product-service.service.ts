import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-services/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

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
  urlDefaultForProxy = '/v1/api/';
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
        this.urlDefaultForProxy + 'v1/api/product/',
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
