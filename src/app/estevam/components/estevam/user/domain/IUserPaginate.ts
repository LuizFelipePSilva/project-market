import { IUser } from './IUser';

export interface IUserPaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: IUser[];
  last_page: number;
}
