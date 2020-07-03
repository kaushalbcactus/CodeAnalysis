import { TestBed } from '@angular/core/testing';

import { UserCapacitycommonService } from './user-capacitycommon.service';

describe('UserCapacitycommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserCapacitycommonService = TestBed.get(UserCapacitycommonService);
    expect(service).toBeTruthy();
  });
});
