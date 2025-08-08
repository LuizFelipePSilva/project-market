import { CartItem } from './CarItem';

export interface OrderData {
  nameClient: string;
  payment: string;
  obs: string | null;
  phone: null;
  products: CartItem[];
  numberTable: number | null;
}

export interface OrderAdditional {
  id: string | undefined;
  nome: string;
  valor: number;
  orderAdditionalId: string;
}

export interface OrderProduct {
  id: string | undefined;
  nome: string;
  valorUnitario: number;
  orderId: string;
  adicionais: OrderAdditional[] | null;
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
  produtos: OrderProduct[];
  mesa: number | null;
}
