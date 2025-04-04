import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CreateTableService } from '../../../services/table-services/create-table.service';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';

@Component({
  selector: 'app-create-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorPopupComponent],
  templateUrl: './create-table.component.html',
  styleUrl: './create-table.component.scss',
})
export class CreateTableComponent {
  tableForm: FormGroup;
  manyTableForm: FormGroup;
  errorMessage: string | null = null;
  oneTable: boolean = true;
  manyTable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tableService: CreateTableService
  ) {
    this.tableForm = this.fb.group({
      numberTable: ['', [Validators.required]],
    });
    this.manyTableForm = this.fb.group({
      numberTableInital: ['', [Validators.required]],
      numberTableFinal: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.tableForm.invalid) return;
    this.errorMessage = null;
    const { numberTable } = this.tableForm.value;
    this.tableService.createTable(numberTable).subscribe({
      next: (value) => {
        this.router.navigate(['/table']);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
      },
    });
  }
  onSubmitMany() {
    if (this.manyTableForm.invalid) return;
    this.errorMessage = null;
    const { numberTableInital, numberTableFinal } = this.manyTableForm.value;
    this.tableService
      .createManyTable(numberTableInital, numberTableFinal)
      .subscribe({
        next: (value) => {
          this.router.navigate(['/table']);
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
  showOne() {
    this.oneTable = true;
    this.manyTable = false;
    console.log(this.oneTable, this.manyTable);
  }
  showMany() {
    this.oneTable = false;
    this.manyTable = true;
    console.log(this.oneTable, this.manyTable);
  }
  get isTableLimitExceeded(): boolean {
    const initial = this.manyTableForm.get('numberTableInital')?.value || 0;
    const final = this.manyTableForm.get('numberTableFinal')?.value || 0;
    return final - initial > 20;
  }
}
