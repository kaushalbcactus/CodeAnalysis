import { TestBed } from '@angular/core/testing';

import { SpOperationsService } from './sp-operations.service';

describe('SpOperationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpOperationsService = TestBed.get(SpOperationsService);
    expect(service).toBeTruthy();
  });
});
