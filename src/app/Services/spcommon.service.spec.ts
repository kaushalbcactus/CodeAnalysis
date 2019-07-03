import { TestBed } from '@angular/core/testing';

import { SPCommonService } from './spcommon.service';

describe('SPCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SPCommonService = TestBed.get(SPCommonService);
    expect(service).toBeTruthy();
  });
});
