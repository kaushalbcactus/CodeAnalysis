import { TestBed } from '@angular/core/testing';

import { CACommonService } from './cacommon.service';

describe('CACommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CACommonService = TestBed.get(CACommonService);
    expect(service).toBeTruthy();
  });
});
