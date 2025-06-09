import { Component } from '@angular/core';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import {
  CategoryService,
  ICategory,
} from '../../../../services/category-service/category.service';
import {
  AdditionalService,
  IAditional,
} from '../../../../services/additional-service/additional.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-additional',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ErrorPopupComponent, FormsModule],
  templateUrl: './additional.component.html',
  styleUrl: './additional.component.scss',
})
export class AdditionalComponent {
  errorMessage: string | null = null;
  categoryGroup: ICategory[] = [];
  listAdditional: IAditional[] = [];
  selectedCategoryId!: string;
  showList: boolean = false;
  showSuccessPopup: boolean = false;

  // Novas variáveis para controle do popup
  showDeletePopup: boolean = false;
  additionalIdToDelete: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private additionalService: AdditionalService
  ) {}

  ngOnInit() {
    this.showList = false;
    this.searchCategory();
  }

  searchCategory(): void {
    this.categoryService.listCategorys().subscribe({
      next: (response) => {
        this.categoryGroup = response;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao buscar categorias';
      },
    });
  }

  listAdditionalByCategory(categoryId: string): void {
    this.additionalService.listAdditionalByCategory(categoryId).subscribe({
      next: (next) => {
        this.showList = true;
        this.listAdditional = next;
      },
      error: (error) => {
        this.errorMessage = error.error.message;
      },
    });
  }

  // Métodos para controle do popup de exclusão
  openDeletePopup(additionalId: string): void {
    this.additionalIdToDelete = additionalId;
    this.showDeletePopup = true;
  }

  closeDeletePopup(): void {
    this.showDeletePopup = false;
    this.additionalIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.additionalIdToDelete) {
      this.additionalService
        .deleteAdditional(this.additionalIdToDelete)
        .subscribe({
          next: () => {
            this.showDeletePopup = false;
            this.showSuccessPopup = true;

            // Atualiza a lista após exclusão
            if (this.selectedCategoryId) {
              this.listAdditionalByCategory(this.selectedCategoryId);
            }

            setTimeout(() => {
              this.showSuccessPopup = false;
            }, 3000);
          },
          error: (error) => {
            this.errorMessage = error.error.message;
            this.showDeletePopup = false;
          },
        });
    }
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
}
