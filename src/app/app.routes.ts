import { Routes } from '@angular/router';
import { HomeComponent } from './estevam/components/estevam/home/home.component';
import { ProductComponent } from './estevam/components/estevam/product/list/product.component';
import { OrderComponent } from './estevam/components/estevam/order/list/order.component';
import { TableComponent } from './estevam/components/estevam/table/list/table.component';
import { AuthComponent } from './estevam/components/estevam/auth/login/auth.component';
import { authGuard } from './estevam/auth/auth.guard';
import { CreateOrderComponent } from './estevam/components/estevam/order/create-order/create-order.component';
import { CreateProductComponent } from './estevam/components/estevam/product/create-product/create-product.component';
import { ReportComponent } from './estevam/components/estevam/report/report.component';
import { CreateTableComponent } from './estevam/components/estevam/table/create-table/create-table.component';
import { ListUserComponent } from './estevam/components/estevam/user/list-user/list-user.component';
import { CashierComponent } from './estevam/components/estevam/cashier/cashier.component';
import { ConnectWhatsappComponent } from './estevam/components/estevam/admin/connect-whatsapp/connect-whatsapp.component';
import { HomeBaseComponent } from './shared/home/home.component';

export const routes: Routes = [
  {
    path: 'estevam',
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard],
        data: { roles: ['admin', 'clerk', 'employee', 'user'] },
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
      {
        path: 'wpp',
        component: ConnectWhatsappComponent,
        canMatch: [authGuard],
        data: { roles: ['admin'] },
      },
      { path: 'login', component: AuthComponent },
      { path: '**', component: HomeBaseComponent },
    ],
  },
  {
    path: '**',
    component: HomeBaseComponent,
  },
];
