import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../domain/CarItem';
import { IProduct } from '../domain/IProduct';
import { OrderData } from '../domain/OrderData';
import { IProductPaginate } from '../domain/IProductPaginate';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
})
export class CreateOrderComponent {
  constructor(private http: HttpClient) {}

  url_API = 'v1/api/product';
  productsByCategory: { [key: string]: IProduct[] } = {};
  categories: string[] = [];
  cartItems: CartItem[] = [];
  allProducts: IProduct[] = [];
  errorMessage: string | null = null;
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
    this.http
      .get<IProductPaginate>(`/v1/api/${this.url_API}?limit=1000`)
      .subscribe({
        next: (response) => {
          this.allProducts = response.data;
          this.productsByCategory = this.groupByCategory(response.data);
          this.categories = Object.keys(this.productsByCategory);
        },
        error: (err) => console.error('Error loading products:', err),
      });
  }

  getCartQuantity(productId: string): string | number {
    const item = this.cartItems.find((i) => i.id === productId);
    return item?.quantity || 'Adicionar';
  }

  addToCart(product: IProduct) {
    const existing = this.cartItems.find((i) => i.id === product.id);
    existing
      ? existing.quantity++
      : this.cartItems.push({ id: product.id, quantity: 1 });
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

    this.http.post('/v1/api/v1/api/orders/create', orderPayload).subscribe({
      next: () => {
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
