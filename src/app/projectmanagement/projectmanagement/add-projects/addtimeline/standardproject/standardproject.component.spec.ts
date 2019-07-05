import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardprojectComponent } from './standardproject.component';

describe('StandardprojectComponent', () => {
  let component: StandardprojectComponent;
  let fixture: ComponentFixture<StandardprojectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardprojectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
