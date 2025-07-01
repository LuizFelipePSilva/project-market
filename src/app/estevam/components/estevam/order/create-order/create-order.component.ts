import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartItem } from '../domain/CarItem';
import { IProduct } from '../domain/IProduct';
import { OrderData } from '../domain/OrderData';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';
import {
  CategoryService,
  ICategory,
} from '../../../../services/category-service/category.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AdditionalService,
  IAditional,
} from '../../../../services/additional-service/additional.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique',
  standalone: true,
})
export class UniquePipe implements PipeTransform {
  transform(value: any[], property: string): any[] {
    if (!value || !property) return value;

    const uniqueMap = new Map();
    value.forEach((item) => {
      const key = item[property];
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    return Array.from(uniqueMap.values());
  }
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ErrorPopupComponent,
    NavbarComponent,
    UniquePipe,
  ],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
})
export class CreateOrderComponent {
  constructor(
    private http: HttpClient,
    private categoryService: CategoryService,
    private additionalService: AdditionalService
  ) {}

  additonalbyCategory: IAditional[] = [];
  productsAdditionals: { [productId: string]: IAditional[] } = {};
  categories: ICategory[] = [];
  productsByCategory: { [key: string]: IProduct[] } = {};
  cartItems: CartItem[] = [];
  allProducts: IProduct[] = [];
  errorMessage: string | null = null;
  showSuccessPopup = false;
  showCartSidebar = false;
  showAdditionalModal = false;
  currentProduct: IProduct | null = null;
  currentAdditionals: IAditional[] = [];
  selectedAdditionals: { [additionalId: string]: number } = {};

  // Novo estado para controlar o popup pós-adicionais
  showPostAdditionalPopup = false;

  orderData: OrderData = {
    nameClient: '',
    payment: 'Pix',
    phone: null,
    obs: null,
    products: [],
    numberTable: null,
  };

  ngOnInit() {
    this.categoryService.listCategorys().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadProductsByCategories();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao carregar categorias';
      },
    });
  }

  loadProductsByCategories() {
    const requests = this.categories.map((cat) =>
      this.categoryService
        .getProductByCategory(cat.id)
        .pipe(catchError(() => of([])))
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((products, index) => {
          const catName = this.categories[index].name;
          this.productsByCategory[catName] = products;
          this.allProducts.push(...products);
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao carregar produtos';
      },
    });
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }

  openAdditionalModal(product: IProduct) {
    this.currentProduct = product;
    this.selectedAdditionals = {};
    this.additionalService
      .listAdditionalByCategory(product.categoryId)
      .subscribe({
        next: (additionals) => {
          this.currentAdditionals = additionals;
          this.showAdditionalModal = true;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Erro ao carregar adicionais';
        },
      });
  }

  cancelAdditionalSelection() {
    this.showAdditionalModal = false;
    this.currentProduct = null;
    this.currentAdditionals = [];
    this.selectedAdditionals = {};
  }

  confirmAdditionalSelection() {
    if (this.currentProduct) {
      const additionalsArray = [];
      for (const [additionalId, quantity] of Object.entries(
        this.selectedAdditionals
      )) {
        for (let i = 0; i < quantity; i++) {
          additionalsArray.push({ id: additionalId });
        }
      }

      this.cartItems.push({
        id: this.currentProduct.id,
        additionals: additionalsArray,
      });

      this.showAdditionalModal = false;
      this.currentProduct = null;
      this.currentAdditionals = [];
      this.selectedAdditionals = {};

      // Mostrar popup de opções após adicionar
      this.showPostAdditionalPopup = true;
    }
  }

  // Métodos para o popup pós-adicionais
  continueShopping() {
    this.showPostAdditionalPopup = false;
  }

  goToCart() {
    this.showPostAdditionalPopup = false;
    this.openCartSidebar();
  }

  increaseAdditional(ad: IAditional) {
    if (!ad.id) return;
    const current = this.selectedAdditionals[ad.id] || 0;
    if (current < ad.maxAdd) {
      this.selectedAdditionals[ad.id] = current + 1;
    }
  }

  decreaseAdditional(ad: IAditional) {
    if (!ad.id) return;
    const current = this.selectedAdditionals[ad.id] || 0;
    if (current > 0) {
      this.selectedAdditionals[ad.id] = current - 1;
    }
  }

  getAdditionalCountInModal(additionalId: string): number {
    return this.selectedAdditionals[additionalId] || 0;
  }

  canAddMoreInModal(ad: IAditional): boolean {
    if (!ad.id) return false;
    return (this.selectedAdditionals[ad.id] || 0) < ad.maxAdd;
  }

  getTotalForCurrentProduct(): number {
    let total = this.currentProduct?.value || 0;
    for (const [additionalId, quantity] of Object.entries(
      this.selectedAdditionals
    )) {
      const ad = this.currentAdditionals.find((a) => a.id === additionalId);
      if (ad) {
        total += ad.value * quantity;
      }
    }
    return total;
  }

  getAdditionalName(additionalId: string): string {
    for (const productId in this.productsAdditionals) {
      const ad = this.productsAdditionals[productId].find(
        (a) => a.id === additionalId
      );
      if (ad) {
        return ad.name;
      }
    }
    return 'Adicional';
  }

  getAdditionalCountPerAdditional(
    additionalId: string,
    additionals: any[]
  ): number {
    return additionals.filter((a) => a.id === additionalId).length;
  }

  addAdditional(item: CartItem, additionalId: string) {
    item.additionals.push({ id: additionalId });
  }

  removeAdditional(item: CartItem, additionalId: string) {
    const index = item.additionals.findIndex((a) => a.id === additionalId);
    if (index > -1) {
      item.additionals.splice(index, 1);
    }
  }

  getAdditionalCount(item: CartItem, additionalId: string): number {
    return item.additionals.filter((a) => a.id === additionalId).length;
  }

  canAddMore(item: CartItem, ad: IAditional): boolean {
    if (!ad.id) return false;
    const count = this.getAdditionalCount(item, ad.id);
    return count < ad.maxAdd;
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  duplicateItem(item: CartItem) {
    this.cartItems.push({
      id: item.id,
      additionals: [...item.additionals],
    });
  }

  calculateItemPrice(item: CartItem): number {
    const product = this.allProducts.find((p) => p.id === item.id);
    if (!product) return 0;

    let total = product.value;

    item.additionals.forEach((additional) => {
      const ad = this.productsAdditionals[item.id]?.find(
        (a) => a.id === additional.id
      );
      if (ad) {
        total += ad.value;
      }
    });

    return total;
  }

  get totalCart() {
    return this.cartItems.reduce((total, item) => {
      return total + this.calculateItemPrice(item);
    }, 0);
  }

  getProductName(productId: string) {
    return (
      this.allProducts.find((p) => p.id === productId)?.name ||
      'Produto desconhecido'
    );
  }

  getAdditionalByCategory(categoryId: string): void {
    this.additionalService.listAdditionalByCategory(categoryId).subscribe({
      next: (additionals) => {
        this.additonalbyCategory = additionals;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Erro ao carregar adicionais';
      },
    });
  }

  private loadAdditionalsForCart(): void {
    const uniqueIds = Array.from(
      new Set(this.cartItems.map((item) => item.id))
    );

    uniqueIds.forEach((productId) => {
      const product = this.allProducts.find((p) => p.id === productId);
      if (product) {
        this.additionalService
          .listAdditionalByCategory(product.categoryId)
          .subscribe({
            next: (additionals) => {
              this.productsAdditionals[productId] = additionals;
            },
            error: () => {
              this.productsAdditionals[productId] = [];
            },
          });
      }
    });
  }

  getImageUrl(imageName: string): string {
    return `${environment.apiUrl}/product/image/${encodeURIComponent(
      imageName
    )}`;
  }

  openCartSidebar() {
    this.showCartSidebar = true;
    this.loadAdditionalsForCart();
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/imgs/itemNoImage.png';
  }

  confirmOrder() {
    const payload = {
      nameClient: this.orderData.nameClient,
      payment: this.orderData.payment,
      phone: this.orderData.phone,
      obs: this.orderData.obs,
      numberTable: this.orderData.numberTable,
      products: this.cartItems.map((item) => ({
        id: item.id,
        additionals: item.additionals.map((additional) => ({
          id: additional.id,
        })),
      })),
    };

    const url = `${environment.apiUrl}/orders/create`;
    this.http
      .post(url, payload, {
        withCredentials: true,
        headers: new HttpHeaders({
          'x-tenant-id': `${environment.adminApiKey}`,
        }),
      })
      .subscribe({
        next: () => {
          this.showSuccessPopup = true;
          setTimeout(() => (this.showSuccessPopup = false), 13000);
          this.showCartSidebar = false;
          this.cartItems = [];
          this.orderData = {
            nameClient: '',
            payment: 'Pix',
            phone: null,
            obs: null,
            products: [],
            numberTable: null,
          };
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao confirmar pedido';
        },
      });
  }
}
