import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  reportTypes: string[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  selectedType: string = 'Monthly';
  errorMessage: string = '';
  url_API = `/v1/api/reports/create`;
  constructor(private http: HttpClient) {}

  generateReport(): void {
    if (!this.selectedType) {
      this.errorMessage = 'Por favor selecione um tipo de relatório';
      return;
    }

    const reportRequest = { type: this.selectedType };

    this.http
      .post('/v1/api' + this.url_API, reportRequest, {
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
