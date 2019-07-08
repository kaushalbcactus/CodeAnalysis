import { TestBed } from '@angular/core/testing';

import { SPOperationService } from './spoperation.service';

describe('SPOperationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SPOperationService = TestBed.get(SPOperationService);
    expect(service).toBeTruthy();
  });
});
