import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReduceSowbudgetDialogComponent } from './add-reduce-sowbudget-dialog.component';

describe('AddReduceSowbudgetDialogComponent', () => {
  let component: AddReduceSowbudgetDialogComponent;
  let fixture: ComponentFixture<AddReduceSowbudgetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddReduceSowbudgetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReduceSowbudgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
