import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ErrorPopupComponent } from '../../error-popup/error-popup.component';
import { CommonModule } from '@angular/common';
import { EnterpriseService } from '../../../../services/enterprise-service/enterprise.service';

@Component({
  selector: 'app-open-enterprise',
  imports: [CommonModule, NavbarComponent, ErrorPopupComponent],
  templateUrl: './open-enterprise.component.html',
  styleUrl: './open-enterprise.component.scss',
})
export class OpenEnterpriseComponent implements OnInit {
  errorMessage: string | null = null;
  statusEnterprise: string | null = null;
  constructor(private entepriseService: EnterpriseService) {}
  ngOnInit(): void {
    this.verifyStatusEnterprise();
  }
  verifyStatusEnterprise() {
    this.entepriseService.verifyStatus().subscribe({
      next: (response) => {
        this.statusEnterprise = response.message;
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
  openEnteprise() {
    this.entepriseService.openEnterprise().subscribe({
      next: () => {
        this.verifyStatusEnterprise();
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
  closeEnterprise() {
    this.entepriseService.closeEnterprise().subscribe({
      next: () => {
        this.verifyStatusEnterprise();
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
  closeErrorPopup(): void {
    this.errorMessage = null;
  }
}
