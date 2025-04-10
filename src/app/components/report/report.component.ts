import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  reportMap: { [key: string]: string } = {
    Diario: 'Daily',
    Semanal: 'Weekly',
    Mensal: 'Monthly',
    Anual: 'Yearly',
  };

  reportTypesBr: string[] = Object.keys(this.reportMap);
  selectedType: string = 'Diario';
  errorMessage: string | null = '';
  url_API = `reports/create`;

  constructor(private http: HttpClient) {}
  closeErrorPopup() {
    this.errorMessage = null;
  }
  generateReport(): void {
    if (!this.selectedType) {
      this.errorMessage = 'Por favor selecione um tipo de relatório';
      return;
    }
    const selectedTypeEn = this.reportMap[this.selectedType];
    const reportRequest = { type: selectedTypeEn };
    const url = `${environment.apiUrl}/${this.url_API}`;
    this.http
      .post(url, reportRequest, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe({
        next: (response: Blob) => {
          console.log(response);
          this.saveFile(response);
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Erro ao gerar relatório:', error);
          this.errorMessage = 'Falha ao gerar relatório. Tente novamente.';
        },
      });
  }
  private saveFile(blobData: Blob): void {
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `relatorio_${this.selectedType.toLowerCase()}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);
  }
}
