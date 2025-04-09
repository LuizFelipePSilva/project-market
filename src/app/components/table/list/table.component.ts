import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IRequestOrderForTable } from '../domain/IRequestOrderForTable';
import { ITable } from '../domain/ITable';
import { ITablePaginate } from '../domain/ITablePaginate';
import { ISwitchOrderTable } from '../domain/ISwitchOrderTable';
import { Router } from '@angular/router';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { TransferServiceService } from '../../../services/table-services/transfer-service.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorPopupComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  tableTransfer: FormGroup;
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
  transferTable: boolean = false;
  errorMessage: string | null = null;
  urlAPi = '/table';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public appComponent: AppComponent,
    private Router: Router,
    private transferService: TransferServiceService
  ) {
    this.tableTransfer = this.fb.group({
      tableNumberOrigin: ['', [Validators.required]],
      orderId: ['', [Validators.required]],
      tableNumberFinal: ['', [Validators.required]],
    });
  }

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
    const url = `${environment.apiUrl}${this.urlAPi}/show?page=${page}&limit=20`;
    this.http
      .get<ITablePaginate>(url, {
        withCredentials: true,
      })
      .subscribe((response) => {
        this.dataSource = response;
        this.currentPage = response.current_page;
        this.tables = response.data;
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
      const url = `${environment.apiUrl}${this.urlAPi}/orders/${table.numberTable}`;
      this.http
        .get<IRequestOrderForTable>(url, { withCredentials: true })
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
    const url = `${environment.apiUrl}${this.urlAPi}/change/${tableId}`;
    this.http
      .patch<any>(
        url,
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
    const url = `${environment.apiUrl}${this.urlAPi}/change/${tableId}`;
    this.http
      .patch<any>(
        url,
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
  OpenTranfer() {
    if (this.selectedTableDetails) {
      this.tableTransfer.patchValue({
        tableNumberOrigin: this.selectedTableDetails.numberTable,
        orderId: this.selectedTableDetails.order.id,
        tableNumberFinal: '',
      });
    }
    this.transferTable = true;
  }
  CloseTranfer() {
    this.transferTable = false;
    this.tableTransfer.reset();
  }
  onSubmit() {
    if (this.tableTransfer.invalid || !this.selectedTableDetails) return;
    this.errorMessage = null;
    const { tableNumberOrigin, orderId, tableNumberFinal } =
      this.tableTransfer.value;

    this.transferService
      .transferSubmit(tableNumberOrigin, orderId, tableNumberFinal)
      .subscribe({
        next: () => {
          this.transferTable = false;
          this.showSidebar = false;
          this.tableTransfer.reset();
          this.loadTable(this.currentPage);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message ||
            'Ocorreu um erro inesperado. Tente novamente.';
        },
      });
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
}
