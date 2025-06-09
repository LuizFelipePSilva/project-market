import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductServiceService } from '../../../../services/product-service/product-service.service';
import { Router } from '@angular/router';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import {
  CategoryService,
  ICategory,
} from '../../../../services/category-service/category.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorPopupComponent,
    NavbarComponent,
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
})
export class CreateProductComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  productForm: FormGroup;
  errorMessage: string | null = null;
  showSuccessPopup = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  categoryGroup: ICategory[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductServiceService,
    private categoryService: CategoryService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: [null, [Validators.required]],
    });
  }
  ngOnInit() {
    this.searchCategory();
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.productForm.patchValue({ image: file });
      this.productForm.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('value', this.productForm.value.value);
    formData.append('categoryId', this.productForm.value.categoryId);
    formData.append('description', this.productForm.value.description);
    formData.append('image', this.selectedFile);
    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        this.showSuccessPopup = true;
        setTimeout(() => (this.showSuccessPopup = false), 3000);
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao criar produto';
      },
    });
  }

  private resetForm(): void {
    this.productForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileInput.nativeElement.value = '';
  }

  closeErrorPopup(): void {
    this.errorMessage = null;
  }
}
