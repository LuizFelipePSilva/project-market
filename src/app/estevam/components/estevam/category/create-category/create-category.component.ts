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
import { CategoryService } from '../../../../services/category-service/category.service';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorPopupComponent,
    NavbarComponent,
  ],
  templateUrl: './create-category.component.html',
  styleUrl: './create-category.component.scss',
})
export class CreateCategoryComponent {
  errorMessage: string | null = null;
  categoryGroup: FormGroup;
  showSuccessPopup = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryGroup = this.fb.group({
      name: ['', [Validators.required]],
    });
  }
  onSubmit(): void {
    if (this.categoryGroup.invalid) return;
    const { name } = this.categoryGroup.value;
    this.categoryService.createCategory(name).subscribe({
      next: (value) => {
        this.showSuccessPopup = true;
        setTimeout(() => (this.showSuccessPopup = false), 3000);
        this.categoryGroup.reset();
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
      },
    });
  }
  closeErrorPopup(): void {
    this.errorMessage = null;
  }
}
