import { TestBed } from '@angular/core/testing';

import { SharedConstantsService } from './shared-constants.service';

describe('SharedConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharedConstantsService = TestBed.get(SharedConstantsService);
    expect(service).toBeTruthy();
  });
});
