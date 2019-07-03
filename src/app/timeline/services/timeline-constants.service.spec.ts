import { TestBed } from '@angular/core/testing';

import { TimelineConstantsService } from './timeline-constants.service';

describe('TimelineConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimelineConstantsService = TestBed.get(TimelineConstantsService);
    expect(service).toBeTruthy();
  });
});
