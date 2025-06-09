import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CategoryService } from '../../../../services/category-service/category.service';
import { firstValueFrom } from 'rxjs';

interface IProduct {
  id: string;
  name: string;
  value: number;
  categoryId: string;
  description: string;
  status: 'Disponivel' | 'Indisponivel';
  image: string;
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
  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  url_API = '/product';
  init: IProduct[] = [];
  groupedProducts: IGroupedProducts[] = [];
  logado: boolean = true;
  errorMessage: string | null = null;
  showStatusPopup: boolean = false;
  showDeletePopup: boolean = false;
  selectedProductDelete: string | null = null;
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

  async loadProducts(page = 1) {
    const url = `${environment.apiUrl}${this.url_API}/show?limit=1000`;
    this.http
      .get<IProductPaginate>(url, { withCredentials: true })
      .subscribe(async (response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.init = this.dataSource.data;

        const categoriesMap = new Map<string, string>();
        for (const product of this.init) {
          if (!categoriesMap.has(product.categoryId)) {
            const res = await firstValueFrom(
              this.categoryService.findCategory(product.categoryId)
            );
            categoriesMap.set(product.categoryId, res.name);
          }
        }

        this.groupedProducts = this.groupProducts(categoriesMap);
      });
  }

  private groupProducts(
    categoriesMap: Map<string, string>
  ): IGroupedProducts[] {
    const grouped = new Map<string, IProduct[]>();
    for (const product of this.init) {
      const categoryName =
        categoriesMap.get(product.categoryId) || 'Desconhecido';
      if (!grouped.has(categoryName)) grouped.set(categoryName, []);
      grouped.get(categoryName)!.push(product);
    }

    return Array.from(grouped.entries())
      .map(([category, products]) => ({ category, products }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }
  confirmDelete(productId: string) {
    this.selectedProductDelete = productId;
    this.showDeletePopup = true;
  }

  deleteProduct() {
    const url = `${environment.apiUrl}${this.url_API}/delete/${this.selectedProductDelete}`;
    this.http.delete(url, { withCredentials: true }).subscribe(
      async () => {
        this.init = this.init.filter(
          (product) => product.id !== this.selectedProductDelete
        );
        const categoriesMap = await this.buildCategoriesMap();
        this.groupedProducts = this.groupProducts(categoriesMap);
        this.closeDeletePopup();
      },
      (error) => {
        this.closeDeletePopup();
        this.errorMessage = error.error.message;
      }
    );
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
          async () => {
            this.init = this.init.map((p) =>
              p.id === this.selectedProductId
                ? { ...p, status: this.desiredAction! }
                : p
            );
            const categoriesMap = await this.buildCategoriesMap();
            this.groupedProducts = this.groupProducts(categoriesMap);
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

  closeDeletePopup() {
    this.showDeletePopup = false;
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
  private async buildCategoriesMap(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    for (const product of this.init) {
      if (!map.has(product.categoryId)) {
        const res = await firstValueFrom(
          this.categoryService.findCategory(product.categoryId)
        );
        map.set(product.categoryId, res.name);
      }
    }
    return map;
  }
}
