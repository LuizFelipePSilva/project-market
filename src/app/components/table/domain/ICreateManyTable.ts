import { ITable } from './ITable';

export interface ICreateManyTableResponse {
  createdTables: ITable[];
  alertTables: { name: string }[];
}
