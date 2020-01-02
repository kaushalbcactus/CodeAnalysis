import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToProjectsComponent } from './add-user-to-projects.component';

describe('AddUserToProjectsComponent', () => {
  let component: AddUserToProjectsComponent;
  let fixture: ComponentFixture<AddUserToProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserToProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserToProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
