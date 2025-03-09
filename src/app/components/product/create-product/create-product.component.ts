import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductServiceService } from '../service/product-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
})
export class CreateProductComponent {
  productForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductServiceService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]],
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.errorMessage = null;
    const { name, value, category, description } = this.productForm.value;
    this.productService
      .createProduct(name, Number(value), category, description)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/product']);
        },
        error: (err) => {
          console.error('Request error:', err);
          this.errorMessage =
            err.error?.message ||
            'Ocorreu um erro inesperado. Tente novamente.';
        },
      });
  }
}
