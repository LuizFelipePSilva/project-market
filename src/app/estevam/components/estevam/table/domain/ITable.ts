export interface ITable {
  id?: string;
  numberTable: number;
  orderId: number;
  status: 'Aberto' | 'Reservado' | 'Pedido' | 'Inutilizavel';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
