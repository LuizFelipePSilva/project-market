import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-services/auth.service';
import { catchError, throwError } from 'rxjs';
import { ITable } from '../../components/table/domain/ITable';
import { ICreateManyTableResponse } from '../../components/table/domain/ICreateManyTable';

@Injectable({
  providedIn: 'root',
})
export class CreateTableService {
  urlDefaultForProxy = '/v1/api/';
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }
  createTable(numberTable: number) {
    return this.http
      .post<ITable>(
        this.urlDefaultForProxy + 'v1/api/table/create',
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
        this.urlDefaultForProxy + 'v1/api/table/createMany',
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
