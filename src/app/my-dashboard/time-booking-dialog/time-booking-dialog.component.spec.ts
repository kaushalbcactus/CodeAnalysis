import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeBookingDialogComponent } from './time-booking-dialog.component';

describe('TimeBookingDialogComponent', () => {
  let component: TimeBookingDialogComponent;
  let fixture: ComponentFixture<TimeBookingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeBookingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeBookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
