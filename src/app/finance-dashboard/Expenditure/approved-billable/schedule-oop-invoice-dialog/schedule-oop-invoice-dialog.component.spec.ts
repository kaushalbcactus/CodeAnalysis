import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleOopInvoiceDialogComponent } from './schedule-oop-invoice-dialog.component';

describe('ScheduleOopInvoiceDialogComponent', () => {
  let component: ScheduleOopInvoiceDialogComponent;
  let fixture: ComponentFixture<ScheduleOopInvoiceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleOopInvoiceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleOopInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
