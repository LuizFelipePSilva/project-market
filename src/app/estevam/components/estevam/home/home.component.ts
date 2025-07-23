// home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { environment } from '../../../../../environments/environment.development';
import { RouterModule } from '@angular/router';
import { IOrder } from '../cashier/domain/IOrder';

interface IOrderPaginate {
  current_page: number;
  data: IOrder[];
  last_page: number;
  per_page: number;
  total: number;
}
interface ResponseInfo {
  name: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  dataSource: IOrderPaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };
  dataResponse: ResponseInfo = {
    name: '',
  };

  private intervalId: any;
  errorMessage: string | null = null;
  totalOrder: number | null = null;
  enterpriseName: string | null = null;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getInfoEnterprise();
    this.getInfos();
    this.loadRecentOrders();
    this.setupAutoRefresh();
    this.getTotalOrders();

    setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.clearRefreshInterval();
  }

  private setupAutoRefresh(): void {
    this.intervalId = setInterval(() => {
      this.loadRecentOrders();
    }, 5000);
  }

  private clearRefreshInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private getInfos(): void {
    const url = `${environment.apiUrl}/user/info`;
    this.http.get<ResponseInfo>(url, { withCredentials: true }).subscribe({
      next: (response) => (
        console.log(response), (this.dataResponse = response)
      ),
    });
  }
  private getInfoEnterprise() {
    const url = `${environment.apiUrl}/enterprise/getName`;
    this.http
      .get<{ name: string }>(url, {
        withCredentials: true,
        headers: new HttpHeaders({
          'x-tenant-id': `${environment.adminApiKey}`,
        }),
      })
      .subscribe({
        next: (res) => {
          this.enterpriseName = res.name;
        },
      });
  }
  private getTotalOrders(): void {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;
    const url = `${environment.apiUrl}/orders/show?startDate=${dataFormatada}`;
    this.http.get<IOrderPaginate>(url, { withCredentials: true }).subscribe({
      next: (response) => (this.totalOrder = response.total),
    });
  }

  private loadRecentOrders(): void {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;
    const url = `${environment.apiUrl}/orders/show?status=Pronto&limit=5&startDate=${dataFormatada}`;
    this.http.get<IOrderPaginate>(url, { withCredentials: true }).subscribe({
      next: (response) => this.handleSuccessResponse(response),
      error: (error) => this.handleError(error),
    });
  }

  private handleSuccessResponse(response: IOrderPaginate): void {
    this.dataSource = {
      ...response,
      data: response.data.map((order) => ({
        id: order.id,
        nameClient: order.nameClient || 'Cliente não identificado',
        payment: order.payment,
        status: order.status,
        createdAt: order.createdAt,
        obs: order.obs || '',
        updatedAt: order.updatedAt,
        deletedAt: order.deletedAt,
      })),
    };
    this.errorMessage = null;
  }

  private handleError(error: any): void {
    this.clearRefreshInterval();
  }
  formatDateTime(isoString: Date): string {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Aberto: 'status-aberto',
      Pendente: 'status-pendente',
      Concluido: 'status-concluido',
      Cancelado: 'status-cancelado',
    };
    return statusClasses[status] || 'status-default';
  }

  updateTime() {
    const timeElement = document.getElementById('stat-value');
    if (!timeElement) return;

    const data = new Date();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    const timeStrng = `${dia}/${mes} ${horas}:${minutos}:${segundos}`;
    timeElement.textContent = timeStrng;
  }
}
