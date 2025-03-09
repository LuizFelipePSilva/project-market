import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthService, UserRole } from '../../../service/auth.service';
import { Observable } from 'rxjs';

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
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  constructor(private http: HttpClient, public AppComponent: AppComponent) {}

  title = 'meu-app-cafeteria';
  url_API = `/v1/api/product/`;
  init: IProduct[] = [];
  logado: boolean = true;

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
    this.http
      .get<IProductPaginate>(`/v1/api/${this.url_API}?page=${page}`)
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.init = this.dataSource.data;
      });
  }

  deleteProduct(productId: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.http.delete(`/v1/api/${this.url_API}/delete/${productId}`).subscribe(
        () => {
          this.init = this.init.filter((product) => product.id !== productId);
        },
        (error) => {
          console.error('Erro ao excluir produto:', error);
        }
      );
    }
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
