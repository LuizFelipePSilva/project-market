export interface IOrder {
  id?: number;
  nameClient: string;
  payment: 'Dinheiro' | 'Cartao' | 'Pix' | null;
  status: 'Aberto' | 'Pendente' | 'Concluido' | 'Cancelado' | 'Pronto';
  obs: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
