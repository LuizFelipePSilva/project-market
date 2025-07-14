export interface IUser {
  id?: string;
  name: string;
  role: 'super' | 'admin' | 'clerk' | 'employee' | 'user';
  email: string;
  password: string;
  tenant_id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
