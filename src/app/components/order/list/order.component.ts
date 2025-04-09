import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../environments/environment.development';

export interface IOrder {
  id?: number;
  nameClient: string;
  payment: 'Dinheiro' | 'Cartao' | 'Pix' | null;
  status: 'Aberto' | 'Pendente' | 'Concluido' | 'Cancelado';
  obs: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IOrderPaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: IOrder[];
  last_page: number;
}

export interface IOrderResponse {
  Comanda: {
    id: number;
    Cliente: string;
    TipoPagamento: string;
    StatusDoPedido: string;
    Observaçoes: string | null;
    HoraDoPedido: Date;
    ValorTotalDaComanda: number;
    Produtos: Array<{
      Produto: string;
      Quantidade: number;
      ValorUnitario: number;
      ValorTotal: number;
    }>;
    Mesa: number;
  };
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  constructor(private http: HttpClient) {}

  url_API = `/orders/show`;
  orders: IOrder[] = [];
  dataSource: IOrderPaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };
  currentPage: number = 1;
  private intervalId: any;
  selectedOrderDetails: IOrderResponse | null = null;
  showSidebar: boolean = false;
  searchTerm: string = '';
  selectedStatus: string = 'Aberto';
  errorMessage: string | null = null;
  closeErrorPopup() {
    this.errorMessage = null;
  }
  ngOnInit(): void {
    this.loadOrders(this.currentPage);
    this.intervalId = setInterval(() => {
      this.loadOrders(this.currentPage);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changeStatus(status: string): void {
    this.selectedStatus = status;
    this.loadOrders(1);
  }

  loadOrders(page: number): void {
    const query = this.searchTerm ? `&nameClient=${this.searchTerm}` : '';

    const url = `${environment.apiUrl}${this.url_API}?page=${page}&status=${this.selectedStatus}${query}&limit=20`;
    this.http.get<IOrderPaginate>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.orders = response.data;
      },
      error: (error) => {
        this.errorMessage = error.error.message;
      },
    });
  }

  onSearch(): void {
    this.loadOrders(1);
  }

  nextPage(): void {
    if (this.currentPage < this.dataSource.last_page) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  trackByOrderId(index: number, order: IOrder): number | undefined {
    return order.id;
  }

  openOrderDetails(orderId: number): void {
    this.http
      .get<IOrderResponse>(`${environment.apiUrl}/orders/view/${orderId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.selectedOrderDetails = response;
          this.showSidebar = true;
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
  }

  Cancelar(orderId: Number) {
    this.http
      .patch<any>(
        `${environment.apiUrl}/orders/change/${orderId}`,
        { status: 'Cancelado' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
  }

  Aprovar(orderId: Number) {
    this.http
      .patch<any>(
        `${environment.apiUrl}/orders/change/${orderId}`,
        { status: 'Pendente' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
  }
  Concluir(orderId: Number) {
    this.http
      .patch<any>(
        `${environment.apiUrl}/orders/change/${orderId}`,
        { status: 'Pronto' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
  }
  closeOrderDetails(): void {
    this.showSidebar = false;
  }
}
