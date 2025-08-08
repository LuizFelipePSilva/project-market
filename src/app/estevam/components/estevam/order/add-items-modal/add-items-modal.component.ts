import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';
import { IProduct } from '../domain/IProduct';
import { ICategory } from '../../../../services/category-service/category.service';
import { IAditional } from '../../../../services/additional-service/additional.service';
import { CommonModule } from '@angular/common';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
@Component({
  selector: 'app-add-items-modal',
  standalone: true,
  imports: [CommonModule, ErrorPopupComponent],
  templateUrl: './add-items-modal.component.html',
  styleUrls: ['./add-items-modal.component.scss'],
})
export class AddItemsModalComponent {
  @Input() tenantId!: string;
  @Input() orderId!: number;
  @Output() itemsAdded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = true;
  categories: ICategory[] = [];
  allProducts: IProduct[] = [];
  productsByCategory: { [key: string]: IProduct[] } = {};
  showAdditionalModal = false;
  currentProduct: IProduct | null = null;
  currentAdditionals: IAditional[] = [];
  selectedAdditionals: { [key: string]: number } = {};
  showConfirmationPopup = false;
  lastAddedItem: any | null = null;
  errorMessage: string | null = null;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategoriesAndProducts();
  }

  loadCategoriesAndProducts(): void {
    // Carregar categorias
    this.http
      .get<ICategory[]>(`${environment.apiUrl}/category/show`, {
        headers: {
          'x-tenant-id': this.tenantId,
        },
      })
      .subscribe((categories) => {
        this.categories = categories;
        // Carregar produtos para cada categoria
        this.categories.forEach((category) => {
          this.http
            .get<IProduct[]>(
              `${environment.apiUrl}/product/category/${category.id}`,
              {
                headers: {
                  'x-tenant-id': this.tenantId,
                },
              }
            )
            .subscribe((products) => {
              // Filtrar produtos disponíveis
              const availableProducts = products.filter(
                (p) => p.status === 'Disponivel'
              );
              this.productsByCategory[category.id] = availableProducts;
              this.allProducts = [...this.allProducts, ...availableProducts];
            });
        });
      });
  }

  getProductsByCategory(categoryId: string): IProduct[] {
    return this.productsByCategory[categoryId] || [];
  }

  getImageUrl(imageName: string | null): string {
    if (!imageName) {
      return '/imgs/itemNoImage.png';
    }
    return `${environment.apiUrl}/product/image/${encodeURIComponent(
      imageName
    )}`;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/imgs/itemNoImage.png';
  }

  openAdditionalModal(product: IProduct) {
    this.currentProduct = product;
    this.http
      .get<IAditional[]>(
        `${environment.apiUrl}/additional/show/category/${product.categoryId}`,
        {
          headers: {
            'x-tenant-id': this.tenantId,
          },
        }
      )
      .subscribe((additionals) => {
        this.currentAdditionals = additionals;
        setTimeout(() => (this.showAdditionalModal = true), 10);
      });
  }

  increaseAdditional(ad: IAditional) {
    const current = this.selectedAdditionals[ad.id!] || 0;
    if (current < ad.maxAdd) {
      this.selectedAdditionals[ad.id!] = current + 1;
    }
  }

  decreaseAdditional(ad: IAditional) {
    const current = this.selectedAdditionals[ad.id!] || 0;
    if (current > 0) {
      this.selectedAdditionals[ad.id!] = current - 1;
    }
  }

  getAdditionalCountInModal(additionalId: string): number {
    return this.selectedAdditionals[additionalId] || 0;
  }

  canAddMoreInModal(ad: IAditional): boolean {
    return (this.selectedAdditionals[ad.id!] || 0) < ad.maxAdd;
  }

  getTotalForCurrentProduct(): number {
    if (!this.currentProduct) return 0;
    let total = this.currentProduct.value;
    for (const [adId, count] of Object.entries(this.selectedAdditionals)) {
      const ad = this.currentAdditionals.find((a) => a.id === adId);
      if (ad) {
        total += ad.value * count;
      }
    }
    return total;
  }

  confirmAdditionalSelection() {
    if (this.currentProduct) {
      const additionalsArray = [];
      for (const [adId, count] of Object.entries(this.selectedAdditionals)) {
        for (let i = 0; i < count; i++) {
          additionalsArray.push({ id: adId });
        }
      }

      // Enviar imediatamente para o backend
      this.addItemToOrder(this.currentProduct.id, additionalsArray);
    }
  }

  addItemToOrder(productId: string, additionals: { id: string }[]) {
    const payload = {
      orderId: this.orderId,
      itens: [
        {
          productId: productId,
          action: 'add',
          additonals: additionals.map((ad) => ({
            additionalId: ad.id,
            action: 'add',
          })),
        },
      ],
    };

    this.http
      .patch(`${environment.apiUrl}/orders/removeItens`, payload, {
        headers: {
          'x-tenant-id': this.tenantId,
          'Content-Type': 'application/json',
        },
      })
      .subscribe({
        next: () => {
          this.lastAddedItem = { productId, additionals };
          this.showAdditionalModal = false;
          this.selectedAdditionals = {};
          this.showConfirmationPopup = true;
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        },
      });
  }

  cancelAdditionalSelection() {
    this.showAdditionalModal = false;
    this.selectedAdditionals = {};
  }

  continueAdding() {
    this.showConfirmationPopup = false;
    this.currentProduct = null;
  }

  finishAdding() {
    this.showConfirmationPopup = false;
    this.itemsAdded.emit();
    this.closeModal();
  }

  closeModal() {
    this.isOpen = false;
    this.closed.emit();
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
}
