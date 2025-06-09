import { CartItem } from './CarItem';

export interface OrderData {
  nameClient: string;
  payment: string;
  obs: string | null;
  phone: null;
  products: CartItem[];
  numberTable: number | null;
}

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
    adicionais: Array<{
      id: string | undefined; // Ou `string`
      nome: string;
      valor: number;
    }> | null;
  }>;
  mesa: number | null;
}
