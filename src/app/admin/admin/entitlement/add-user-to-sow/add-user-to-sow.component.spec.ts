import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToSowComponent } from './add-user-to-sow.component';

describe('AddUserToSowComponent', () => {
  let component: AddUserToSowComponent;
  let fixture: ComponentFixture<AddUserToSowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserToSowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserToSowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
