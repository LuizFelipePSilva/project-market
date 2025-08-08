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
  selectedCategoryIdToSwitch!: string;
  showList: boolean = false;
  showSuccessPopup: boolean = false;
  showRenamePopup: boolean = false;
  showDeletePopup: boolean = false;
  showSwitchPopup: boolean = false;
  additionalIdToDelete: string | null = null;
  editId: string | null = null;
  editName: string = '';
  editValue: string = '';
  editMaxAdd: string = '';
  categoryIdFrom: string = '';
  categoryIdTo: string = '';
  categoryNameFrom: string = '';
  categoryNameTo: string = '';
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

  openDeletePopup(additionalId: string): void {
    this.additionalIdToDelete = additionalId;
    this.showDeletePopup = true;
  }
  closeDeletePopup(): void {
    this.showDeletePopup = false;
    this.additionalIdToDelete = null;
  }
  openSwitchPopupByCategory(categoryId: string): void {
    this.categoryIdFrom = categoryId;
    const selectedCategory = this.categoryGroup.find(
      (c) => c.id === categoryId
    );
    this.categoryNameFrom = selectedCategory?.name || '';
    this.showSwitchPopup = true;
  }
  closeSwitchPopup(): void {
    this.showSwitchPopup = false;
  }
  openRenameName(additional: IAditional): void {
    this.editId = additional.id!;
    this.editName = additional.name;
    this.editValue = additional.value.toString();
    this.editMaxAdd = additional.maxAdd.toString();
    this.showRenamePopup = true;
  }
  closeRenameName(): void {
    this.showRenamePopup = false;
  }
  update(id: string, name?: string, value?: string, maxAdd?: string): void {
    if (name || maxAdd) {
      const payloadName = name ? name : undefined;
      const payloadMaxAdd = maxAdd ? Number(maxAdd) : undefined;

      this.additionalService
        .updateNameMaxAdd(id, payloadName, payloadMaxAdd)
        .subscribe({
          next: () => {
            if (this.selectedCategoryId)
              this.listAdditionalByCategory(this.selectedCategoryId);
            this.showRenamePopup = false;
          },
          error: (error) =>
            (this.errorMessage =
              error.error?.message || 'Erro ao atualizar adicional'),
        });
    }

    if (value) {
      this.additionalService.updateValue(id, Number(value)).subscribe({
        next: () => {
          if (this.selectedCategoryId)
            this.listAdditionalByCategory(this.selectedCategoryId);
        },
        error: (error) =>
          (this.errorMessage =
            error.error?.message || 'Erro ao atualizar valor'),
      });
    }
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
  switchAdditionals(categoryIdFrom: string, categoryIdTo: string) {
    this.additionalService
      .switchAllAdditionalOfCategory(categoryIdFrom, categoryIdTo)
      .subscribe({
        next: () => {
          this.closeSwitchPopup();
          this.listAdditionalByCategory(categoryIdTo);
        },
        error: (error) => {
          console.log(error);
          this.errorMessage =
            error.error?.message || 'Erro ao atualizar adicional';
        },
      });
  }
  closeErrorPopup() {
    this.errorMessage = null;
  }
}
