import { TestBed } from '@angular/core/testing';

import { CAGlobalService } from './caglobal.service';

describe('CAGlobalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CAGlobalService = TestBed.get(CAGlobalService);
    expect(service).toBeTruthy();
  });
});
