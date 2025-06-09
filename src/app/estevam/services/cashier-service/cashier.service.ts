import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IOrderPaginate } from '../../components/estevam/order/list/order.component';
import { IOrderResponse } from '../../components/estevam/order/domain/OrderData';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CashierService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(
    page: number,
    status: string,
    searchTerm: string = ''
  ): Observable<IOrderPaginate> {
    const query = searchTerm ? `&nameClient=${searchTerm}` : '';
    return this.http.get<IOrderPaginate>(
      `${this.baseUrl}/show?page=${page}&status=${status}${query}&limit=20`,
      { withCredentials: true }
    );
  }

  getOrderDetails(id: number): Observable<IOrderResponse> {
    return this.http.get<IOrderResponse>(`${this.baseUrl}/view/${id}`, {
      withCredentials: true,
    });
  }

  updateOrderInfo(
    id: number,
    data: {
      nameClient?: string;
      payment?: 'Dinheiro' | 'Cartao' | 'Pix' | null;
    }
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/change/info/${id}`, data, {
      withCredentials: true,
    });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/change/${id}`,
      { status },
      { withCredentials: true }
    );
  }
}
