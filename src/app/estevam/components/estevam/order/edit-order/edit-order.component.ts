import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IOrderResponse, OrderProduct } from '../domain/OrderData';
import { IChangeItensOrders } from '../domain/IChangeItensOrders';
import { EditOrderService } from '../../../../services/order-service/edit-order.service';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { SelectableOrderProduct } from '../domain/SelectableOrderTypes';

@Component({
  selector: 'app-edit-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss'],
})
export class EditOrderComponent implements OnChanges {
  @Input() orderId: number = 0;
  @Output() closed = new EventEmitter<void>();

  data: IOrderResponse | null = null;
  errorMessage: string | null = null;

  // Armazenamos os produtos selecionáveis separadamente
  selectableProducts: SelectableOrderProduct[] = [];

  constructor(private editOrderService: EditOrderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderId']?.currentValue) {
      this.fetchOrder();
    }
  }

  fetchOrder(): void {
    this.editOrderService.findOrderbyId(this.orderId).subscribe({
      next: (res: IOrderResponse) => {
        this.data = res;
        this.selectableProducts = res.produtos.map(
          (p) => new SelectableOrderProduct(p)
        );
      },
      error: (err) => (this.errorMessage = err.error.message),
    });
  }

  sendEditOrder(): void {
    if (!this.data) return;

    const payload: IChangeItensOrders = {
      orderId: Number(this.orderId),
      itens: [],
    };

    // Processar cada produto selecionável
    this.selectableProducts.forEach((p) => {
      // Se o produto está marcado para remoção
      if (p._selected) {
        payload.itens.push({
          orderItemId: p.orderId,
          productId: p.id || '',
          action: 'remove',
        });
      }
      // Processar adicionais se o produto não estiver marcado
      else if (p.adicionais.length > 0) {
        const adicionaisToRemove = p.adicionais.filter((a) => a._selected);

        if (adicionaisToRemove.length > 0) {
          payload.itens.push({
            orderItemId: p.orderId,
            productId: p.id || '',
            action: 'update',
            additonals: adicionaisToRemove.map((a) => ({
              additionalId: a.id || '',
              additionalOrderId: a.orderAdditionalId,
              action: 'remove',
            })),
          });
        }
      }
    });

    if (payload.itens.length === 0) {
      this.errorMessage = 'Selecione itens para remover';
      return;
    }

    this.editOrderService.editOrder(payload).subscribe({
      next: () => {
        this.fetchOrder();
      },
      error: (err) => (
        (this.errorMessage = err.error.message), this.fetchOrder()
      ),
    });
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
  closeModal(): void {
    this.closed.emit();
  }
}
