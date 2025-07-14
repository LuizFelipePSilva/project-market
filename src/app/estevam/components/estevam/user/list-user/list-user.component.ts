import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../../../../app.component';
import { CommonModule } from '@angular/common';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { environment } from '../../../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';
import { IUser } from '../domain/IUser';
import { IUserPaginate } from '../domain/IUserPaginate';
import { ICreateUser } from '../domain/ICreateUser';
import { CreateUserService } from '../../../../services/user-service/create-user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { RoleTranslatePipe } from '../../../../../shared/pipes/role-translate.pipe';
import { UpdateUserService } from '../../../../services/user-service/update-user.service';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [
    RoleTranslatePipe,
    FormsModule,
    CommonModule,
    ErrorPopupComponent,
    NavbarComponent,
  ],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss',
})
export class ListUserComponent {
  constructor(
    private http: HttpClient,
    private userService: CreateUserService,
    private updateRoleService: UpdateUserService
  ) {}

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
  selectedUser: string | null = null; // Para detalhes
  selectedUserForUpdate: IUser | null = null; // Para atualização de cargo
  showCreateSidebar = false;
  showUpdateSidebar = false;
  loading = false; // Para criação
  loadingUpdate = false; // Para atualização de cargo
  newRole = ''; // Nova role selecionada

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
          this.errorMessage = err.error.message || 'Erro ao carregar usuários';
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

  // Ações do usuário - MODIFICADO
  editUser(userId: string) {
    // Buscar o usuário diretamente da lista carregada
    const user = this.init.find((u) => u.id === userId);

    if (user) {
      this.selectedUserForUpdate = user;
      this.newRole = user.role; // Preenche com a role atual
      this.openUpdateSidebar();
    } else {
      this.errorMessage = 'Usuário não encontrado na lista atual';
    }
  }

  deleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.http.delete(`${this.url_API}/remove/${userId}`).subscribe({
        next: () => {
          this.loadUser(this.currentPage);
          this.errorMessage = null;
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = err.error.message || 'Erro ao excluir usuário';
        },
      });
    }
  }

  createUser(userData: ICreateUser, form: NgForm) {
    this.userService.registerUser(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadUser(this.currentPage);
        this.closeCreateSidebar(); // Fecha o sidebar após sucesso
        form.resetForm(); // Limpa o formulário
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Erro ao criar usuário';
      },
    });
  }

  updateRole() {
    if (!this.selectedUserForUpdate?.id || !this.newRole) {
      return;
    }

    this.loadingUpdate = true;
    this.errorMessage = null;

    const userId = this.selectedUserForUpdate.id;
    this.updateRoleService.updateRole(userId, this.newRole).subscribe({
      next: (response) => {
        this.loadingUpdate = false;
        this.loadUser(this.currentPage); // Recarrega a página atual
        this.closeUpdateSideBar();
      },
      error: (err) => {
        this.loadingUpdate = false;
        this.errorMessage = err.error.message || 'Erro ao atualizar cargo';
      },
    });
  }

  trackByUserId(index: number, user: IUser): string {
    return user.id!;
  }

  ngOnInit() {
    this.loadUser();
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
  openCreateSidebar() {
    this.showCreateSidebar = true;
  }

  closeCreateSidebar() {
    this.showCreateSidebar = false;
    this.errorMessage = null;
  }
  openUpdateSidebar() {
    this.showUpdateSidebar = true;
  }
  closeUpdateSideBar() {
    this.showUpdateSidebar = false;
    this.errorMessage = null;
    this.selectedUserForUpdate = null;
    this.newRole = '';
  }
  handleCreateUser(form: NgForm) {
    if (form.invalid) return;

    this.loading = true;
    this.createUser(form.value, form);
  }
}
