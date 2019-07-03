import { TestBed } from '@angular/core/testing';

import { PMCommonService } from './pmcommon.service';

describe('PMCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PMCommonService = TestBed.get(PMCommonService);
    expect(service).toBeTruthy();
  });
});
