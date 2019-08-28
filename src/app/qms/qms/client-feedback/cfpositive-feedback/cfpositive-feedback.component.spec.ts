import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CFPositiveFeedbackComponent } from './cfpositive-feedback.component';

describe('CFPositiveFeedbackComponent', () => {
  let component: CFPositiveFeedbackComponent;
  let fixture: ComponentFixture<CFPositiveFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CFPositiveFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CFPositiveFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
