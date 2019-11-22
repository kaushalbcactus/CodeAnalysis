import { TestBed } from '@angular/core/testing';

import { TaskAllocationCommonService } from './task-allocation-common.service';

describe('TaskAllocationCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskAllocationCommonService = TestBed.get(TaskAllocationCommonService);
    expect(service).toBeTruthy();
  });
});
