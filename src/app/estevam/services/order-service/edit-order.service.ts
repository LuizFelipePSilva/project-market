import { Injectable } from '@angular/core';
import { IChangeItensOrders } from '../../components/estevam/order/domain/IChangeItensOrders';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { catchError, Observable, throwError } from 'rxjs';
import { IOrderResponse } from '../../components/estevam/order/domain/OrderData';

@Injectable({
  providedIn: 'root',
})
export class EditOrderService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  editOrder(data: IChangeItensOrders) {
    return this.http
      .patch(`${this.apiUrl}/orders/removeItens`, data, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
  findOrderbyId(id: number): Observable<IOrderResponse> {
    return this.http
      .get<IOrderResponse>(`${this.apiUrl}/orders/view/${id}`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
