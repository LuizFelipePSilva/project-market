// routes.ts
import { Routes } from '@angular/router';
import { HomeBaseComponent } from './shared/home/home.component';
import { estevamRoutes } from './estevam/estevam.routes';

export const routes: Routes = [
  ...estevamRoutes, // Importa todas as rotas do cliente "estevam"
  {
    path: '**',
    component: HomeBaseComponent, // Rota curinga global
  },
];
