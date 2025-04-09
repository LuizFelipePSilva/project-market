import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { CommonModule } from '@angular/common';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../environments/environment.development'; // ajuste isso para .ts ou .prod.ts conforme necessário

interface IUser {
  id: string;
  name: string;
  role: 'admin' | 'clerk' | 'employee' | 'user';
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface IUserPaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: IUser[];
  last_page: number;
}

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, ErrorPopupComponent],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss',
})
export class ListUserComponent {
  constructor(private http: HttpClient, public AppComponent: AppComponent) {}

  dataSource: IUserPaginate = {
    per_page: 0,
    total: 0,
    current_page: 0,
    data: [],
    last_page: 0,
  };

  currentPage: number = 1;
  init: IUser[] = [];
  url_API = `${environment.apiUrl}/user`;
  errorMessage: string | null = null;
  selectedUser: string | null = null;

  loadUser(page = 1) {
    this.http
      .get<IUserPaginate>(`${this.url_API}/show?page=${page}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.dataSource = response;
          this.currentPage = response.current_page;
          this.init = this.dataSource.data;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erro ao carregar usuários';
        },
      });
  }

  // Métodos de paginação
  nextPage() {
    if (this.currentPage < this.dataSource.last_page) {
      this.loadUser(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadUser(this.currentPage - 1);
    }
  }

  // Controle de detalhes do usuário
  toggleUserDetails(userId: string) {
    this.selectedUser = this.selectedUser === userId ? null : userId;
  }

  // Ações do usuário
  editUser(userId: string) {
    console.log('Editar usuário:', userId);
  }

  deleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.http.delete(`${this.url_API}/remove/${userId}`).subscribe({
        next: () => {
          this.loadUser(this.currentPage);
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erro ao excluir usuário';
        },
      });
    }
  }

  trackByUserId(index: number, user: IUser): string {
    return user.id;
  }

  ngOnInit() {
    this.loadUser();
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
}
