import { Component, OnInit } from '@angular/core';
import {
  CategoryService,
  ICategory,
} from '../../../../services/category-service/category.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-category',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ErrorPopupComponent],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.scss',
})
export class ListCategoryComponent implements OnInit {
  errorMessage: string | null = null;
  showSuccessPopup = false;
  categorys: ICategory[] = [];
  showDeletePopup: boolean = false;
  selecteCateryDelete: string | null = null;
  constructor(private categoryService: CategoryService) {}
  ngOnInit() {
    this.searchCategorys();
  }

  searchCategorys(): void {
    this.categoryService.listCategorys().subscribe({
      next: (response) => {
        this.categorys = response;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }

  deleteCategory(): void {
    if (this.selecteCateryDelete === null) return;
    this.categoryService.deleteCategory(this.selecteCateryDelete).subscribe({
      next: (next) => {
        this.searchCategorys();
        this.showDeletePopup = false;
        this.selecteCateryDelete = null;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      },
    });
  }

  updateCategory(categoryId: string): void {}

  confirmDelete(productId: string) {
    this.selecteCateryDelete = productId;
    this.showDeletePopup = true;
  }
  closeDeletePopup() {
    this.showDeletePopup = false;
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
}
