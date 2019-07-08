import { TestBed } from '@angular/core/testing';

import { PmconstantService } from './pmconstant.service';

describe('PmconstantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PmconstantService = TestBed.get(PmconstantService);
    expect(service).toBeTruthy();
  });
});
