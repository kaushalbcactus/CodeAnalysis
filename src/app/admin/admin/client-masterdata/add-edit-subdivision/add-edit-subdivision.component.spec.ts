import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSubdivisionComponent } from './add-edit-subdivision.component';

describe('AddEditSubdivisionComponent', () => {
  let component: AddEditSubdivisionComponent;
  let fixture: ComponentFixture<AddEditSubdivisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditSubdivisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSubdivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
