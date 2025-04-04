import { ITable } from './ITable';

export interface ITablePaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: ITable[];
  last_page: number;
}
