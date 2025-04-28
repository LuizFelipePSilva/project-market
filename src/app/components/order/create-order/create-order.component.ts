import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../domain/CarItem';
import { IProduct } from '../domain/IProduct';
import { OrderData } from '../domain/OrderData';
import { IProductPaginate } from '../domain/IProductPaginate';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
})
export class CreateOrderComponent {
  constructor(private http: HttpClient) {}
  url_API = '/product';
  productsByCategory: { [key: string]: IProduct[] } = {};
  categories: string[] = [];
  cartItems: CartItem[] = [];
  allProducts: IProduct[] = [];
  errorMessage: string | null = null;
  showSuccessPopup = false;
  showCartSidebar = false;
  showConfirmationPopup = false;
  orderData: OrderData = {
    nameClient: '',
    payment: 'Pix',
    obs: null,
    products: [],
    numberTable: null,
  };

  ngOnInit() {
    this.loadProducts();
  }

  toggleConfirmationPopup() {
    this.showConfirmationPopup = !this.showConfirmationPopup;
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
  private groupByCategory(products: IProduct[]): { [key: string]: IProduct[] } {
    return products.reduce((acc: { [key: string]: IProduct[] }, product) => {
      const category = product.category;
      acc[category] = acc[category] || [];
      acc[category].push(product);
      return acc;
    }, {});
  }

  loadProducts() {
    const url = `${environment.apiUrl}${this.url_API}?limit=1001&status=Disponivel`;

    this.http.get<IProductPaginate>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allProducts = response.data;
        this.productsByCategory = this.groupByCategory(response.data);
        this.categories = Object.keys(this.productsByCategory);
      },
      error: (err) => (this.errorMessage = err.error.message),
    });
  }

  getCartQuantity(productId: string): number {
    const item = this.cartItems.find((i) => i.id === productId);
    return item?.quantity || 0;
  }

  addToCart(product: IProduct) {
    const existing = this.cartItems.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ id: product.id, quantity: 1 });
    }
  }

  updateQuantity(productId: string, newQuantity: number) {
    const item = this.cartItems.find((i) => i.id === productId);
    if (!item) return;

    newQuantity < 1
      ? (this.cartItems = this.cartItems.filter((i) => i.id !== productId))
      : (item.quantity = newQuantity);
  }

  get totalCart() {
    return this.cartItems.reduce((total, item) => {
      const product = this.allProducts.find((p) => p.id === item.id);
      return total + (product?.value || 0) * item.quantity;
    }, 0);
  }

  getProductName(productId: string) {
    return (
      this.allProducts.find((p) => p.id === productId)?.name ||
      'Produto desconhecido'
    );
  }

  confirmOrder() {
    const orderPayload = {
      ...this.orderData,
      products: this.cartItems,
    };
    const url = `${environment.apiUrl}/orders/create`;
    this.http.post(url, orderPayload, { withCredentials: true }).subscribe({
      next: () => {
        this.showSuccessPopup = true;

        setTimeout(() => {
          this.showSuccessPopup = false;
        }, 3000);
        this.showCartSidebar = false;
        this.cartItems = [];
        this.orderData = {
          nameClient: '',
          payment: 'Pix',
          obs: null,
          products: [],
          numberTable: null,
        };
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }
}
