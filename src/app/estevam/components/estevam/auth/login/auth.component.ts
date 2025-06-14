import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorPopupComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  onSubmit() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.router
          .navigateByUrl('estevam/home', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['estevam/home']);
          });
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loginForm.get('password')?.reset();
      },
    });
  }

  closeErrorPopup() {
    this.errorMessage = null;
  }
}
