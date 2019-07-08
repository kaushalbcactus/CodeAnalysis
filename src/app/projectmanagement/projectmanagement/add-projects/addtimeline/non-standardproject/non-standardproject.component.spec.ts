import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonStandardprojectComponent } from './non-standardproject.component';

describe('NonStandardprojectComponent', () => {
  let component: NonStandardprojectComponent;
  let fixture: ComponentFixture<NonStandardprojectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonStandardprojectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonStandardprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
