import { TestBed } from '@angular/core/testing';

import { FdConstantsService } from './fd-constants.service';

describe('FdConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FdConstantsService = TestBed.get(FdConstantsService);
    expect(service).toBeTruthy();
  });
});
