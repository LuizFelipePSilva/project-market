import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/list/product.component';
import { OrderComponent } from './components/order/list/order.component';
import { TableComponent } from './components/table/list/table.component';
import { AuthComponent } from './components/auth/login/auth.component';
import { authGuard } from './auth/auth.guard';
import { CreateOrderComponent } from './components/order/create-order/create-order.component';
import { CreateProductComponent } from './components/product/create-product/create-product.component';
import { ReportComponent } from './components/report/report.component';
import { CreateTableComponent } from './components/table/create-table/create-table.component';
import { ListUserComponent } from './components/user/list-user/list-user.component';
import { CashierComponent } from './components/cashier/cashier.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'product',
    component: ProductComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'product/create',
    component: CreateProductComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'order',
    component: OrderComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'clerk', 'employee'] },
  },
  {
    path: 'order/create',
    component: CreateOrderComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'table',
    component: TableComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'clerk', 'employee'] },
  },
  {
    path: 'table/create',
    component: CreateTableComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'clerk'] },
  },
  {
    path: 'relatorio',
    component: ReportComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'user',
    component: ListUserComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'casher',
    component: CashierComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'clerk'] },
  },
  { path: 'login', component: AuthComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
