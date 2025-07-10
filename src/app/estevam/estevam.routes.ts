// estevam-routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/estevam/home/home.component';
import { authGuard } from './auth/auth.guard';
import { ProductComponent } from './components/estevam/product/list/product.component';
import { CreateProductComponent } from './components/estevam/product/create-product/create-product.component';
import { OrderComponent } from './components/estevam/order/list/order.component';
import { CreateOrderComponent } from './components/estevam/order/create-order/create-order.component';
import { TableComponent } from './components/estevam/table/list/table.component';
import { CreateTableComponent } from './components/estevam/table/create-table/create-table.component';
import { ReportComponent } from './components/estevam/report/report.component';
import { ListUserComponent } from './components/estevam/user/list-user/list-user.component';
import { CashierComponent } from './components/estevam/cashier/cashier.component';
import { ConnectWhatsappComponent } from './components/estevam/admin/connect-whatsapp/connect-whatsapp.component';
import { AuthComponent } from './components/estevam/auth/login/auth.component';
import { HomeBaseComponent } from '../shared/home/home.component';
import { CreateCategoryComponent } from './components/estevam/category/create-category/create-category.component';
import { ListCategoryComponent } from './components/estevam/category/list-category/list-category.component';
import { AdditionalComponent } from './components/estevam/additional/list-additional/additional.component';
import { CreateAditionalComponent } from './components/estevam/additional/create-aditional/create-aditional.component';
import { OpenEnterpriseComponent } from './components/estevam/admin/open-enterprise/open-enterprise.component';

export const estevamRoutes: Routes = [
  {
    path: 'estevam',
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk', 'employee', 'user'] },
      },
      {
        path: 'category',
        component: CreateCategoryComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk'] },
      },
      {
        path: 'category/list',
        component: ListCategoryComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk'] },
      },
      {
        path: 'additional',
        component: AdditionalComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk'] },
      },
      {
        path: 'additional/create',
        component: CreateAditionalComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk'] },
      },
      {
        path: 'product',
        component: ProductComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk', 'employee'] },
      },
      {
        path: 'product/create',
        component: CreateProductComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      {
        path: 'order',
        component: OrderComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk', 'employee'] },
      },
      {
        path: 'order/create',
        component: CreateOrderComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk', 'employee', 'user'] },
      },
      {
        path: 'table',
        component: TableComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk', 'employee', 'user'] },
      },
      {
        path: 'table/create',
        component: CreateTableComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      {
        path: 'relatorio',
        component: ReportComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      {
        path: 'user',
        component: ListUserComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      {
        path: 'casher',
        component: CashierComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin', 'clerk'] },
      },
      {
        path: 'wpp',
        component: ConnectWhatsappComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      {
        path: 'config',
        component: OpenEnterpriseComponent,
        canActivate: [authGuard],
        data: { roles: ['super', 'admin'] },
      },
      { path: 'login', component: AuthComponent },
      { path: '**', component: HomeBaseComponent },
    ],
  },
];
