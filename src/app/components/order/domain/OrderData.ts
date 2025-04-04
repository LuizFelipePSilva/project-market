import { CartItem } from './CarItem';

export interface OrderData {
  nameClient: string;
  payment: string;
  obs: string | null;
  products: CartItem[];
  numberTable: number | null;
}
