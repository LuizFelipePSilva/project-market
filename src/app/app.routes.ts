import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/list/product.component';
import { OrderComponent } from './components/order/list/order.component';
import { TableComponent } from './components/table/list/table.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './auth/auth.guard';
import { CreateOrderComponent } from './components/order/create-order/create-order.component';
import { CreateProductComponent } from './components/product/create-product/create-product.component';
import { ReportComponent } from './components/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'product',
    component: ProductComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'clerk', 'employee', 'user'] },
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
    path: 'relatorio',
    component: ReportComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  { path: 'login', component: AuthComponent },
  { path: '**', redirectTo: 'home' },
];
