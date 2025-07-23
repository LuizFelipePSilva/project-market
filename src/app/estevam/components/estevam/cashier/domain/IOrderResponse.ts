export interface IOrderResponse {
  id: number;
  cliente: {
    nome: string;
    celular?: string;
  };
  pagamento: string;
  status: string;
  observacoes: string | null;
  dataPedido: Date;
  valorTotal: number;
  produtos: Array<{
    id: string | undefined; // Ou `string`
    nome: string;
    valorUnitario: number;
    orderId: string;
    adicionais: Array<{
      id: string | undefined; // Ou `string`
      nome: string;
      valor: number;
      orderAdditionalId: string;
    }> | null;
  }>;
  mesa: number | null;
}
