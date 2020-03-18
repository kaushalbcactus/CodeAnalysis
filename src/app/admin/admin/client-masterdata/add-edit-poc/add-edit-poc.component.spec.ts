import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPocComponent } from './add-edit-poc.component';

describe('AddEditPocComponent', () => {
  let component: AddEditPocComponent;
  let fixture: ComponentFixture<AddEditPocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditPocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditPocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
