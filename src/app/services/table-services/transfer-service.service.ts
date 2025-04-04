import { Injectable } from '@angular/core';
import { ISwitchOrderTable } from '../../components/table/domain/ISwitchOrderTable';
import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransferServiceService {
  urlDefaultForProxy = '/v1/api/';
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.verifySession().subscribe();
  }

  transferSubmit(
    tableNumberOrigin: number,
    orderId: number,
    tableNumberFinal: number
  ) {
    return this.http
      .post<ISwitchOrderTable>(
        this.urlDefaultForProxy + 'v1/api/table/switch',
        {
          tableNumberOrigin,
          orderId,
          tableNumberFinal,
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
