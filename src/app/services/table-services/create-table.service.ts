import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-services/auth.service';
import { catchError, throwError } from 'rxjs';
import { ITable } from '../../components/table/domain/ITable';
import { ICreateManyTableResponse } from '../../components/table/domain/ICreateManyTable';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class CreateTableService {
  private baseUrl = `${environment.apiUrl}/table`;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  createTable(numberTable: number) {
    return this.http
      .post<ITable>(
        `${this.baseUrl}/create`,
        { numberTable },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  createManyTable(numberTableInital: number, numberTableFinal: number) {
    return this.http
      .post<ICreateManyTableResponse>(
        `${this.baseUrl}/createMany`,
        { numberTableInital, numberTableFinal },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
