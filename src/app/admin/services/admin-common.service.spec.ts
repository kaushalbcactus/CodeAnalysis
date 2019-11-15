import { TestBed } from '@angular/core/testing';

import { AdminCommonService } from './admin-common.service';

describe('AdminCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminCommonService = TestBed.get(AdminCommonService);
    expect(service).toBeTruthy();
  });
});
