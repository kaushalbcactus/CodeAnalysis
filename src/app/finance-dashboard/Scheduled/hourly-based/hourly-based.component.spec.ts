import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyBasedComponent } from './hourly-based.component';

describe('HourlyBasedComponent', () => {
  let component: HourlyBasedComponent;
  let fixture: ComponentFixture<HourlyBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HourlyBasedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HourlyBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
