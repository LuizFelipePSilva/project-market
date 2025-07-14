import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTranslate',
  standalone: true,
})
export class RoleTranslatePipe implements PipeTransform {
  transform(role: string): string {
    const translations: { [key: string]: string } = {
      super: 'Super Administrador',
      admin: 'Gerente',
      clerk: 'Atendente',
      employee: 'Funcionario',
      user: 'Garçom',
    };

    return translations[role] || role;
  }
}
