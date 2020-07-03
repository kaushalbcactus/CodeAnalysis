import { TestBed } from '@angular/core/testing';

import { PreStackcommonService } from './pre-stackcommon.service';

describe('PreStackcommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreStackcommonService = TestBed.get(PreStackcommonService);
    expect(service).toBeTruthy();
  });
});
