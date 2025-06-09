import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-connect-whatsapp',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './connect-whatsapp.component.html',
  styleUrl: './connect-whatsapp.component.scss',
})
export class ConnectWhatsappComponent {
  qrCodeUrl: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchQRCode();
    }
  }

  fetchQRCode(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http
      .post<{ qrCode: string }>(
        'http://localhost:3333/v1/api/whatsapp/connect',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.error.message || 'Erro ao carregar QR Code';
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.qrCodeUrl = response.qrCode;
        },
        error: () => {},
      });
  }

  regenerateQRCode(): void {
    this.qrCodeUrl = null;
    this.fetchQRCode();
  }
}
