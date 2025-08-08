import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';
import { CashierService } from '../../../services/cashier-service/cashier.service';
import { Subscription, forkJoin } from 'rxjs';
import { IOrder } from './domain/IOrder';
import { IOrderResponse } from './domain/IOrderResponse';
import { IOrderPaginate } from './domain/IOrderPaginate';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

interface PaymentModalData {
  paymentType: 'Dinheiro' | 'Cartao' | 'Pix' | null;
  receivedValue?: number;
  change: number;
  isCash: boolean;
}

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent, NavbarComponent],
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.scss',
})
export class CashierComponent implements OnInit, OnDestroy {
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
  private subscriptions: Subscription[] = [];
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
  orderDetailsMap: { [id: number]: IOrderResponse } = {};

  constructor(
    private orderService: CashierService,
    private route: ActivatedRoute,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['searchTerm'] || '';
      this.loadOrders(1);
    });

    this.intervalId = setInterval(() => {
      this.loadOrders(this.currentPage);
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadOrders(page: number): void {
    const sub = this.orderService
      .getOrders(page, 'Pronto', this.searchTerm)
      .subscribe({
        next: (response) => {
          this.dataSource = response;
          this.currentPage = response.current_page;
          this.orders = response.data;
          if (response.data.length >= 1) {
            this.loadOrderDetails();
          }
        },
        error: (error) => this.showError(error.error.message),
      });
    this.subscriptions.push(sub);
  }

  private loadOrderDetails(): void {
    const ids = this.orders.filter((o) => o.id).map((o) => o.id!);
    const sub = this.orderService.getAllDetailsOfOrders(ids).subscribe({
      next: (response) => {
        response.data.forEach((order) => {
          this.orderDetailsMap[order.id] = order;
        });
      },
      error: (error) => this.showError(error.error.message),
    });
    this.subscriptions.push(sub);
  }

  openEditModal(order: IOrder): void {
    this.selectedOrderForEdit = order;
    this.editFormData.nameClient = order.nameClient;
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (this.selectedOrderForEdit?.id) {
      const sub = this.orderService
        .updateOrderInfo(this.selectedOrderForEdit.id, {
          nameClient: this.editFormData.nameClient,
        })
        .subscribe({
          next: () => {
            this.loadOrders(this.currentPage);
            this.showEditModal = false;
          },
          error: (error) => this.showError(error.error.message),
        });
      this.subscriptions.push(sub);
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

  calculateChange(): void {
    if (this.selectedOrderForPayment?.id) {
      const total =
        this.orderDetailsMap[this.selectedOrderForPayment.id]?.valorTotal || 0;
      const received = this.paymentData.receivedValue || 0;
      this.paymentData.change = received - total;
    }
  }

  updatePaymentType(): void {
    this.paymentData.isCash = this.paymentData.paymentType === 'Dinheiro';
    this.paymentData.receivedValue = 0;
    this.paymentData.change = 0;
  }

  submitCloseOrder(): void {
    if (!this.selectedOrderForPayment?.id) return;

    const total =
      this.orderDetailsMap[this.selectedOrderForPayment.id]?.valorTotal;
    const requests = [
      this.orderService.updateOrderInfo(this.selectedOrderForPayment.id, {
        payment: this.paymentData.paymentType,
      }),
      this.orderService.updateOrderStatus(
        this.selectedOrderForPayment.id,
        'Concluido'
      ),
    ];

    const sub = forkJoin(requests).subscribe({
      next: () => {
        this.loadOrders(this.currentPage);
        this.Router.navigate(['estevam/casher']);
        this.showCloseModal = false;
      },
      error: (error) => this.showError(error.error.message),
    });
    this.subscriptions.push(sub);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = null), 5000);
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
  trackByOrderId(index: number, order: IOrder): number {
    return order.id!;
  }
}
