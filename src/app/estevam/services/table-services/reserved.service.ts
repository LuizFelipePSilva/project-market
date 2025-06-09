import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth-services/auth.service';
export interface IReserveTable {
  NameClientReserve: string;
  PhoneReserve: string;
  numberTable: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservedService {
  private baseUrl = `${environment.apiUrl}/table`;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  reservedSubmit(
    NameClientReserve: string,
    PhoneReserve: string,
    numberTable: number
  ) {
    return this.http
      .post<IReserveTable>(
        `${this.baseUrl}/reserved/${numberTable}`,
        {
          NameClientReserve,
          PhoneReserve,
        },
        { withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
