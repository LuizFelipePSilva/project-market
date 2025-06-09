export interface IRequestOrderForTable {
  numberTable: number;
  order: {
    id: number;
    Cliente: string;
    TipoPagamento: string;
    StatusDoPedido: string;
    Observaçoes: string | null;
    HoraDoPedido: Date;
    ValorTotalDaComanda: number;
    Produtos: Array<{
      Produto: string;
      Valor: number;
      CategoryId: string;
      Adicionais: Array<{
        Nome: string;
        Valor: number;
      }>;
      ValorTotalItem?: number;
    }>;
  };
}
