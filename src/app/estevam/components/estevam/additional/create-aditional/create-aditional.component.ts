import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import {
  CategoryService,
  ICategory,
} from '../../../../services/category-service/category.service';
import { AdditionalService } from '../../../../services/additional-service/additional.service';

@Component({
  selector: 'app-create-aditional',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorPopupComponent,
    NavbarComponent,
  ],
  templateUrl: './create-aditional.component.html',
  styleUrl: './create-aditional.component.scss',
})
export class CreateAditionalComponent {
  errorMessage: string | null = null;
  additionalGroup: FormGroup;
  categoryGroup: ICategory[] = [];
  showSuccessPopup: boolean = false;
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private additionalService: AdditionalService
  ) {
    this.additionalGroup = this.fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]],
      maxAdd: [''],
      categoryId: ['', [Validators.required]],
    });
  }
  ngOnInit() {
    this.searchCategory();
  }
  onSubmit() {
    if (this.additionalGroup.invalid) return;
    const { name, maxAdd, categoryId } = this.additionalGroup.value;
    const value = parseFloat(this.additionalGroup.value.value);
    this.additionalService
      .createAdditional({
        name,
        value,
        maxAdd,
        categoryId,
      })
      .subscribe({
        next: (next) => {
          this.showSuccessPopup = true;
          setTimeout(() => {
            this.showSuccessPopup = false;
          }, 3000);
          this.additionalGroup.reset();
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        },
      });
  }
  searchCategory(): void {
    this.categoryService.listCategorys().subscribe({
      next: (response) => {
        this.categoryGroup = response;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao criar produto';
      },
    });
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
}
