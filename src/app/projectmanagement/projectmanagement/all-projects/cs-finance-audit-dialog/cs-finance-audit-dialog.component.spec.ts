import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsFinanceAuditDialogComponent } from './cs-finance-audit-dialog.component';

describe('CsFinanceAuditDialogComponent', () => {
  let component: CsFinanceAuditDialogComponent;
  let fixture: ComponentFixture<CsFinanceAuditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsFinanceAuditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsFinanceAuditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
