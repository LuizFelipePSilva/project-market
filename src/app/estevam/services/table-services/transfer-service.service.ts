import { Injectable } from '@angular/core';
import { ISwitchOrderTable } from '../../components/estevam/table/domain/ISwitchOrderTable';
import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-services/auth.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TransferServiceService {
  private baseUrl = `${environment.apiUrl}/table`;

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
        `${this.baseUrl}/switch`,
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
