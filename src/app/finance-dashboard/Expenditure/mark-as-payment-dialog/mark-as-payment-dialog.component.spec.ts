import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkAsPaymentDialogComponent } from './mark-as-payment-dialog.component';

describe('MarkAsPaymentDialogComponent', () => {
  let component: MarkAsPaymentDialogComponent;
  let fixture: ComponentFixture<MarkAsPaymentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkAsPaymentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkAsPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
