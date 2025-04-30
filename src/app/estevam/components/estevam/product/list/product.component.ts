import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../../../../app.component';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';

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

interface IGroupedProducts {
  category: string;
  products: IProduct[];
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ErrorPopupComponent, NavbarComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  constructor(private http: HttpClient) {}

  title = 'meu-app-cafeteria';
  url_API = '/product';
  init: IProduct[] = [];
  groupedProducts: IGroupedProducts[] = [];
  logado: boolean = true;
  errorMessage: string | null = null;
  showStatusPopup: boolean = false;
  selectedProductId: string | null = null;
  desiredAction: 'Disponivel' | 'Indisponivel' | null = null;
  dataSource: IProductPaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };

  currentPage: number = 1;
  selectedProduct: string | null = null;

  private groupProducts(): IGroupedProducts[] {
    return this.init
      .reduce((acc: IGroupedProducts[], product) => {
        const category = product.category || 'Sem Categoria';
        const group = acc.find((g) => g.category === category);
        if (group) {
          group.products.push(product);
        } else {
          acc.push({ category, products: [product] });
        }
        return acc;
      }, [])
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  loadProducts(page = 1) {
    const url = `${environment.apiUrl}${this.url_API}?limit=1000`;
    this.http
      .get<IProductPaginate>(url, { withCredentials: true })
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.init = this.dataSource.data;
        this.groupedProducts = this.groupProducts();
      });
  }

  deleteProduct(productId: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const url = `${environment.apiUrl}${this.url_API}/delete/${productId}`;
      this.http.delete(url, { withCredentials: true }).subscribe(
        () => {
          this.init = this.init.filter((product) => product.id !== productId);
          this.groupedProducts = this.groupProducts();
        },
        (error) => {
          this.errorMessage = error.error.message;
        }
      );
    }
  }
  notDisponibilityProduct(productId: string) {
    this.selectedProductId = productId;
    this.desiredAction = 'Indisponivel';
    this.showStatusPopup = true;
  }

  disponibilityProduct(productId: string) {
    this.selectedProductId = productId;
    this.desiredAction = 'Disponivel';
    this.showStatusPopup = true;
  }

  handleStatusConfirmation() {
    if (this.selectedProductId && this.desiredAction) {
      const url = `${environment.apiUrl}${this.url_API}/update/status/${this.selectedProductId}`;
      this.http
        .patch(url, { status: this.desiredAction }, { withCredentials: true })
        .subscribe(
          () => {
            this.init = this.init.map((p) =>
              p.id === this.selectedProductId
                ? { ...p, status: this.desiredAction! }
                : p
            );
            this.groupedProducts = this.groupProducts();
            this.closeStatusPopup();
          },
          (error) => {
            this.errorMessage = error.error.message;
            this.closeStatusPopup();
          }
        );
    }
  }

  closeStatusPopup() {
    this.showStatusPopup = false;
    this.selectedProductId = null;
    this.desiredAction = null;
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
