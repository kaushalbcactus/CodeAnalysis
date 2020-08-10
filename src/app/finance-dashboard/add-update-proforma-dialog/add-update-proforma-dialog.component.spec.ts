import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateProformaDialogComponent } from './add-update-proforma-dialog.component';

describe('AddUpdateProformaDialogComponent', () => {
  let component: AddUpdateProformaDialogComponent;
  let fixture: ComponentFixture<AddUpdateProformaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateProformaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateProformaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
