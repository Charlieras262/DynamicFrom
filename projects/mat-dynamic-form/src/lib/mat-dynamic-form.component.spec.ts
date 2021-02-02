import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDynamicFormComponent } from './mat-dynamic-form.component';

describe('MatDynamicFormComponent', () => {
  let component: MatDynamicFormComponent;
  let fixture: ComponentFixture<MatDynamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatDynamicFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
