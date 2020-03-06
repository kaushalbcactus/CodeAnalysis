import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditClientlegalentityDialogComponent } from './add-edit-clientlegalentity-dialog.component';

describe('AddEditClientlegalentityDialogComponent', () => {
  let component: AddEditClientlegalentityDialogComponent;
  let fixture: ComponentFixture<AddEditClientlegalentityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditClientlegalentityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditClientlegalentityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
