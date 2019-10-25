import { TestBed } from '@angular/core/testing';
import { LeaveCalendarConstantsService } from './leave-calendar-constants.service';



describe('LeaveCalendarConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeaveCalendarConstantsService = TestBed.get(LeaveCalendarConstantsService);
    expect(service).toBeTruthy();
  });
});
