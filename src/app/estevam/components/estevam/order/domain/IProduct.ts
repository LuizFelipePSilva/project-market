export interface IProduct {
  id: string;
  name: string;
  value: number;
  categoryId: string;
  description: string;
  image: string;
  status: 'Disponivel' | 'Indisponivel';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  imageUrl: string;
}
