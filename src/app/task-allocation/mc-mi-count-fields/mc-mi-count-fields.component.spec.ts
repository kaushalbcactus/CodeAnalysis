import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MCMICountFieldsComponent } from './mc-mi-count-fields.component';

describe('MCMICountFieldsComponent', () => {
  let component: MCMICountFieldsComponent;
  let fixture: ComponentFixture<MCMICountFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MCMICountFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MCMICountFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
