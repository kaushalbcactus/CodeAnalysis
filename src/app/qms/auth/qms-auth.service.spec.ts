import { TestBed } from '@angular/core/testing';

import { QmsAuthService } from './qms-auth.service';

describe('QmsAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QmsAuthService = TestBed.get(QmsAuthService);
    expect(service).toBeTruthy();
  });
});
