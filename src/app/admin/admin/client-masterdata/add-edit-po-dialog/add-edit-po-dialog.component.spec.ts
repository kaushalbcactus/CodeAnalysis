import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPoDialogComponent } from './add-edit-po-dialog.component';

describe('AddEditPoDialogComponent', () => {
  let component: AddEditPoDialogComponent;
  let fixture: ComponentFixture<AddEditPoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditPoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditPoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
