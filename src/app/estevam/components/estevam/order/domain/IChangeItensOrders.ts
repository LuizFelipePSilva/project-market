export interface IChangeItensOrders {
  orderId: number;
  itens: Array<{
    orderItemId?: string;
    productId?: string;
    action: 'remove' | 'add' | 'update';
    additonals?: Array<{
      additionalId: string;
      additionalOrderId?: string;
      action: 'remove' | 'add';
    }>;
  }>;
}
