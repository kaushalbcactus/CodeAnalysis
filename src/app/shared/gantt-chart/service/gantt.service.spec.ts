import { TestBed } from '@angular/core/testing';

import { GanttService } from './gantt.service';

describe('GanttService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GanttService = TestBed.get(GanttService);
    expect(service).toBeTruthy();
  });
});
