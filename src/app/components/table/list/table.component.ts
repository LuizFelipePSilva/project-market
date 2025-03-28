import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { table } from 'console';

export interface ITable {
  id: string;
  numberTable: number;
  orderId: number;
  status: 'Aberto' | 'Reservado' | 'Pedido' | 'Inutilizavel';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ITablePaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: ITable[];
  last_page: number;
}

export interface IRequestOrderForTable {
  numberTable: number;
  order: {
    id: number;
    Cliente: string;
    TipoPagamento: string;
    StatusDoPedido: string;
    Observaçoes: string | null;
    HoraDoPedido: Date;
    ValorTotalDaComanda: number;
    Produtos: Array<{
      Produto: string;
      Quantidade: number;
      ValorUnitario: number;
      ValorTotal: number;
    }>;
  };
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  constructor(private http: HttpClient, public appComponent: AppComponent) {}

  tables: ITable[] = [];
  dataSource: ITablePaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };
  currentPage: number = 1;
  private intervalId: any;
  selectedTableDetails: IRequestOrderForTable | null = null;
  showSidebar: boolean = false;
  isProcessing: boolean = false;
  selectedTable: ITable | null = null;

  ngOnInit() {
    this.loadTable(this.currentPage);
    this.intervalId = setInterval(() => {
      this.loadTable(this.currentPage);
    }, 5000);
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  loadTable(page: number): void {
    this.http
      .get<ITablePaginate>(`/v1/api/v1/api/table/show?page=${page}&limit=20`, {
        withCredentials: true,
      })
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.tables = response.data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }

  nextPage(): void {
    if (this.currentPage < this.dataSource.last_page) {
      this.loadTable(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadTable(this.currentPage - 1);
    }
  }

  trackByTableId(index: number, table: ITable): string | undefined {
    return table.id;
  }

  openTableDetails(table: ITable): void {
    if (table.status === 'Pedido') {
      this.selectedTable = table;
      this.http
        .get<IRequestOrderForTable>(
          `/v1/api/v1/api/table/orders/${table.numberTable}`,
          { withCredentials: true }
        )
        .subscribe(
          (response) => {
            this.selectedTableDetails = response;
            this.showSidebar = true;
          },
          () => {
            console.error('Erro ao carregar detalhes do pedido');
          }
        );
    }
  }

  closeTableDetails(): void {
    this.showSidebar = false;
  }

  InutilzarMesa(tableId: string) {
    this.http
      .patch<any>(
        `/v1/api/v1/api/table/change/${tableId}`,
        {
          status: 'Inutilizavel',
        },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadTable(this.currentPage);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  AbrirMesa(tableId: string) {
    this.http
      .patch<any>(
        `/v1/api/v1/api/table/change/${tableId}`,
        {
          status: 'Aberto',
        },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.loadTable(this.currentPage);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
