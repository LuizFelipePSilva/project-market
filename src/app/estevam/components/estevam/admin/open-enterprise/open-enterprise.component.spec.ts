import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenEnterpriseComponent } from './open-enterprise.component';

describe('OpenEnterpriseComponent', () => {
  let component: OpenEnterpriseComponent;
  let fixture: ComponentFixture<OpenEnterpriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenEnterpriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenEnterpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
