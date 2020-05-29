import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateUserCapacityComponent } from './date-user-capacity.component';

describe('DateUserCapacityComponent', () => {
  let component: DateUserCapacityComponent;
  let fixture: ComponentFixture<DateUserCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateUserCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateUserCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
