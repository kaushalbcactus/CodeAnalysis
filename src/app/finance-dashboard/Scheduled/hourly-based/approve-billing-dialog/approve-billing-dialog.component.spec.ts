import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveBillingDialogComponent } from './approve-billing-dialog.component';

describe('ApproveBillingDialogComponent', () => {
  let component: ApproveBillingDialogComponent;
  let fixture: ComponentFixture<ApproveBillingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveBillingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveBillingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
