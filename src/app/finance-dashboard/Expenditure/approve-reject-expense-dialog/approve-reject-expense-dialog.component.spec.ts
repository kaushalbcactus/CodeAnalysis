import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRejectExpenseDialogComponent } from './approve-reject-expense-dialog.component';

describe('ApproveRejectExpenseDialogComponent', () => {
  let component: ApproveRejectExpenseDialogComponent;
  let fixture: ComponentFixture<ApproveRejectExpenseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRejectExpenseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRejectExpenseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
