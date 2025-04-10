import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import {
  AuthService,
  UserRole,
} from '../../../services/auth-services/auth.service';
import { Observable } from 'rxjs';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../environments/environment.development';

interface IProduct {
  id: string;
  name: string;
  value: number;
  category: string;
  description: string;
  status: 'Disponivel' | 'Indisponivel';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

interface IProductPaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: IProduct[];
  last_page: number;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ErrorPopupComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  constructor(private http: HttpClient, public AppComponent: AppComponent) {}

  title = 'meu-app-cafeteria';
  url_API = '/product';
  init: IProduct[] = [];
  logado: boolean = true;
  errorMessage: string | null = null;

  dataSource: IProductPaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };

  currentPage: number = 1;
  selectedProduct: string | null = null;

  loadProducts(page = 1) {
    const url = `${environment.apiUrl}${this.url_API}?limit=1000`;
    this.http
      .get<IProductPaginate>(url, { withCredentials: true })
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.init = this.dataSource.data;
      });
  }

  deleteProduct(productId: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const url = `${environment.apiUrl}${this.url_API}/delete/${productId}`;
      this.http.delete(url, { withCredentials: true }).subscribe(
        () => {
          this.init = this.init.filter((product) => product.id !== productId);
        },
        (error) => {
          this.errorMessage = error.error.message;
        }
      );
    }
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
  toggleProductDetails(productId: string) {
    this.selectedProduct =
      this.selectedProduct === productId ? null : productId;
  }

  nextPage() {
    if (this.currentPage < this.dataSource.last_page) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  ngOnInit() {
    this.loadProducts(this.currentPage);
  }

  trackByProductId(index: number, product: IProduct): string | undefined {
    return product.id;
  }
}
