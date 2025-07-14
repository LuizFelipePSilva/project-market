import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../../../../app.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IRequestOrderForTable } from '../domain/IRequestOrderForTable';
import { ITable } from '../domain/ITable';
import { ITablePaginate } from '../domain/ITablePaginate';
import { Router } from '@angular/router';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { TransferServiceService } from '../../../../services/table-services/transfer-service.service';
import { environment } from '../../../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';
import {
  IReserveTable,
  ReservedService,
} from '../../../../services/table-services/reserved.service';
import {
  AuthService,
  UserRole,
} from '../../../../services/auth-services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorPopupComponent,
    NavbarComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  tableTransfer: FormGroup;
  userRole$: Observable<UserRole | null>;
  reservedTransfer: FormGroup;
  tables: ITable[] = [];
  dataSource: ITablePaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };
  showManagementSidebar: boolean = false;
  currentPage: number = 1;
  private intervalId: any;
  selectedTableDetails: IRequestOrderForTable | null = null;
  showSidebar: boolean = false;
  isProcessing: boolean = false;
  selectedTable: ITable | null = null;
  detailsOfTable: ITable | null = null;
  transferTable: boolean = false;
  reservedTable: boolean = false;
  errorMessage: string | null = null;
  dataReserved: IReserveTable | null = null;
  urlAPi = '/table';
  canManageTables = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public appComponent: AppComponent,
    private Router: Router,
    private transferService: TransferServiceService,
    private reservedService: ReservedService,
    private authService: AuthService
  ) {
    this.tableTransfer = this.fb.group({
      tableNumberOrigin: ['', [Validators.required]],
      orderId: ['', [Validators.required]],
      tableNumberFinal: ['', [Validators.required]],
    });
    this.reservedTransfer = this.fb.group({
      numberTable: ['', [Validators.required]],
      NameClientReserve: ['', [Validators.required]],
      PhoneReserve: ['', [Validators.required]],
      reservedTime: ['', [Validators.required]],
    });
    this.userRole$ = this.authService.user$;
  }

  ngOnInit() {
    this.userRole$.subscribe((role) => {
      this.canManageTables = [
        'super',
        'admin',
        'clerk',
        'employee',
        'user',
      ].includes(role!);
    });
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
          (error) => {
            this.errorMessage = 'Erro ao carregar detalhes do pedido';
          }
        );
    } else if (table.status === 'Reservado') {
      this.findReservedOfTable(table);
      this.showManagementSidebar = true;
    } else {
      this.findDetailsOfTable(table);
      this.showManagementSidebar = true;
    }
  }
  findDetailsOfTable(table: ITable): void {
    const url = `${environment.apiUrl}${this.urlAPi}/find/${table.id}`;
    this.http.get<ITable>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.detailsOfTable = response;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }
  findReservedOfTable(table: ITable): void {
    const url = `${environment.apiUrl}${this.urlAPi}/reserved/view/${table.numberTable}`;
    this.http.get<IReserveTable>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        console.log(response);
        this.dataReserved = response;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }
  closeTableDetails(): void {
    this.showSidebar = false;
  }

  InutilzarMesa(tableId: string) {
    if (this.detailsOfTable?.status === 'Pedido') {
      this.errorMessage = 'Mesa com pedido ativo não pode ser inutilizada';
      return;
    }
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
          this.closeManagementSidebar();
          this.detailsOfTable = null;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  AbrirMesa(tableId: string) {
    if (this.detailsOfTable?.status === 'Pedido') {
      this.errorMessage = 'Mesa com pedido ativo não pode ser reaberta';
      return;
    }
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
          this.closeManagementSidebar();
          this.detailsOfTable = null;
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
    console.log(tableNumberOrigin, orderId, tableNumberFinal);
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
  OpenReserved() {
    if (this.detailsOfTable) {
      this.reservedTransfer.patchValue({
        numberTable: this.detailsOfTable?.numberTable,
        NameClientReserve: '',
        PhoneReserve: '',
      });
    }
    this.reservedTable = true;
  }
  CloseReserved() {
    this.reservedTable = false;
    this.reservedTransfer.reset();
  }

  OnSubmitReserve() {
    if (this.reservedTransfer.invalid || !this.detailsOfTable) return;
    this.errorMessage = null;
    const { numberTable, NameClientReserve, PhoneReserve, reservedTime } =
      this.reservedTransfer.value;
    this.reservedService
      .reservedSubmit(
        NameClientReserve,
        PhoneReserve.toString(),
        numberTable,
        reservedTime
      )
      .subscribe({
        next: () => {
          this.reservedTable = false;
          this.closeManagementSidebar();
          this.reservedTransfer.reset();
          this.loadTable(this.currentPage);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message ||
            'Ocorreu um erro inesperado. Tente novamente.';
        },
      });
  }
  deleteTable(tableId: string) {
    const url = `${environment.apiUrl}${this.urlAPi}/delete/${tableId}`;
    this.http.delete(url, { withCredentials: true }).subscribe({
      next: () => {
        this.loadTable(this.currentPage);
        this.closeManagementSidebar();
        this.detailsOfTable = null;
      },
      error: (err) => {
        this.errorMessage =
          err.error.message || 'Ocorreu um erro inesperado. Tente novamente.';
      },
    });
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
  closeManagementSidebar(): void {
    this.showManagementSidebar = false;
    this.detailsOfTable = null;
    this.selectedTable = null;
    this.dataReserved = null;
  }

  navigateToCashier() {
    if (this.selectedTableDetails?.order?.id) {
      this.Router.navigate(['/estevam/casher'], {
        queryParams: { searchTerm: this.selectedTableDetails.order.Cliente },
      });
    }
  }
}
