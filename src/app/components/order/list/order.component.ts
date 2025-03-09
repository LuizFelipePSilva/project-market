import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IOrder {
  id?: number;
  nameClient: string;
  payment: 'Dinheiro' | 'Cartao' | 'Pix';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  constructor(private http: HttpClient) {}

  url_API = `/v1/api/orders/show`;
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
    this.http
      .get<IOrderPaginate>(
        `/v1/api${this.url_API}?page=${page}&status=${this.selectedStatus}${query}`,
        { withCredentials: true }
      )
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.orders = response.data;
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
      .get<IOrderResponse>(`/v1/api/v1/api/orders/view/${orderId}`, {
        withCredentials: true,
      })
      .subscribe(
        (response) => {
          this.selectedOrderDetails = response;
          this.showSidebar = true;
        },
        (error) => {
          console.error('Erro ao carregar detalhes do pedido:', error);
        }
      );
  }

  Cancelar(orderId: Number) {
    this.http
      .patch<any>(
        `/v1/api/v1/api/orders/change/${orderId}`,
        { status: 'Cancelado' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  Aprovar(orderId: Number) {
    this.http
      .patch<any>(
        `/v1/api/v1/api/orders/change/${orderId}`,
        { status: 'Pendente' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  Concluir(orderId: Number) {
    this.http
      .patch<any>(
        `/v1/api/v1/api/orders/change/${orderId}`,
        { status: 'Concluido' },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadOrders(this.currentPage);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  closeOrderDetails(): void {
    this.showSidebar = false;
  }
}
