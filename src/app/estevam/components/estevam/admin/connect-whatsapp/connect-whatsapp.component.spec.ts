import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectWhatsappComponent } from './connect-whatsapp.component';

describe('ConnectWhatsappComponent', () => {
  let component: ConnectWhatsappComponent;
  let fixture: ComponentFixture<ConnectWhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectWhatsappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectWhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
