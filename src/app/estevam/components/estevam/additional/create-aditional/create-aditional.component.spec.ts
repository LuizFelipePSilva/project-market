import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAditionalComponent } from './create-aditional.component';

describe('CreateAditionalComponent', () => {
  let component: CreateAditionalComponent;
  let fixture: ComponentFixture<CreateAditionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAditionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAditionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
