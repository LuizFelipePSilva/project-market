import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';

export interface IOrder {
  id?: number;
  nameClient: string;
  payment: 'Dinheiro' | 'Cartao' | 'Pix' | null;
  status: 'Aberto' | 'Pendente' | 'Concluido' | 'Cancelado' | 'Pronto';
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

interface PaymentModalData {
  paymentType: 'Dinheiro' | 'Cartao' | 'Pix' | null;
  receivedValue?: number;
  change: number;
  isCash: boolean;
}

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.scss',
})
export class CashierComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient) {}
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
  searchTerm: string = '';
  showEditModal: boolean = false;
  showCloseModal: boolean = false;
  selectedOrderForEdit: IOrder | null = null;
  selectedOrderForPayment: IOrder | null = null;
  editFormData = { nameClient: '' };
  paymentData: PaymentModalData = {
    paymentType: null,
    isCash: false,
    receivedValue: 0,
    change: 0,
  };
  errorMessage: string | null = null;
  ngOnInit(): void {
    this.loadOrders(this.currentPage);
    this.intervalId = setInterval(() => {
      this.loadOrders(this.currentPage);
    }, 5000);
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadOrders(page: number): void {
    const query = this.searchTerm ? `&nameClient=${this.searchTerm}` : '';
    this.http
      .get<IOrderPaginate>(
        `/v1/api/v1/api/orders/show?page=${page}&status=Pronto${query}&limit=20`,
        { withCredentials: true }
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response;
          this.currentPage = response.current_page;
          this.orders = response.data;
          if (this.orders.length > 0) {
            this.openOrderDetails(this.orders[0].id!);
          }
        },
        error: (error) => (this.errorMessage = error.error.message),
      });
  }

  openOrderDetails(orderId: number): void {
    this.http
      .get<IOrderResponse>(`/v1/api/v1/api/orders/view/${orderId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => (this.selectedOrderDetails = response),
        error: (error) => (this.errorMessage = error.error.message),
      });
  }

  openEditModal(order: IOrder): void {
    this.selectedOrderForEdit = order;
    this.editFormData.nameClient = order.nameClient;
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (this.selectedOrderForEdit?.id) {
      this.http
        .patch(
          `/v1/api/v1/api/orders/change/info/${this.selectedOrderForEdit.id}`,
          { nameClient: this.editFormData.nameClient },
          { withCredentials: true }
        )
        .subscribe(() => {
          this.loadOrders(this.currentPage);
          this.showEditModal = false;
        });
    }
  }

  openCloseModal(order: IOrder): void {
    this.selectedOrderForPayment = order;
    this.paymentData = {
      paymentType: order.payment,
      isCash: order.payment === 'Dinheiro',
      receivedValue: 0,
      change: 0,
    };
    this.showCloseModal = true;
  }

  calculateChange(total: number): void {
    if (this.paymentData.receivedValue) {
      this.paymentData.change = this.paymentData.receivedValue - total;
    }
  }

  updatePaymentType(): void {
    this.paymentData.isCash = this.paymentData.paymentType === 'Dinheiro';
    this.paymentData.receivedValue = 0;
    this.paymentData.change = 0;
  }

  submitCloseOrder(): void {
    if (this.selectedOrderForPayment?.id && this.selectedOrderDetails) {
      const payload = {
        status: 'Concluido',
        payment: this.paymentData.paymentType,
        ...(this.paymentData.isCash && {
          receivedValue: this.paymentData.receivedValue,
          change: this.paymentData.change,
        }),
      };
      console.log(payload);
      this.http
        .patch(
          `/v1/api/v1/api/orders/change/info/${this.selectedOrderForPayment.id}`,
          { payment: payload.payment },
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: () => {
            this.loadOrders(this.currentPage);
            this.showCloseModal = false;
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = error.error.message;
          },
        });
      this.http
        .patch(
          `/v1/api/v1/api/orders/change/${this.selectedOrderForPayment.id}`,
          { status: payload.status },
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: () => {
            this.loadOrders(this.currentPage);
            this.showCloseModal = false;
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = error.error.message;
          },
        });
    }
  }

  // Métodos auxiliares
  onSearch(): void {
    this.loadOrders(1);
  }
  nextPage(): void {
    if (this.currentPage < this.dataSource.last_page)
      this.loadOrders(this.currentPage + 1);
  }
  prevPage(): void {
    if (this.currentPage > 1) this.loadOrders(this.currentPage - 1);
  }
  trackByOrderId(index: number, order: IOrder): number | undefined {
    return order.id;
  }
}
