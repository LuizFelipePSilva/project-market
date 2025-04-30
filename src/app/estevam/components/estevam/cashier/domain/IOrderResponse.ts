export interface IOrderResponse {
  Comanda: {
    id: number;
    Cliente: string;
    TipoPagamento: string;
    StatusDoPedido: string;
    Observaçoes: string | null;
    HoraDoPedido: Date;
    ValorTotalDaComanda: number;
    Produtos: Array<{
      Produto: string;
      Quantidade: number;
      ValorUnitario: number;
      ValorTotal: number;
    }>;
    Mesa: number;
  };
}
