import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBaseComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeBaseComponent;
  let fixture: ComponentFixture<HomeBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
