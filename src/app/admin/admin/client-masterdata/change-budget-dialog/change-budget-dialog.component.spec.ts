import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeBudgetDialogComponent } from './change-budget-dialog.component';

describe('ChangeBudgetDialogComponent', () => {
  let component: ChangeBudgetDialogComponent;
  let fixture: ComponentFixture<ChangeBudgetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeBudgetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeBudgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
