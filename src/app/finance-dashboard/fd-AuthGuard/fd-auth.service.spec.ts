import { TestBed } from '@angular/core/testing';

import { FdAuthService } from './fd-auth.service';

describe('FdAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FdAuthService = TestBed.get(FdAuthService);
    expect(service).toBeTruthy();
  });
});
