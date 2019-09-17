import { TestBed } from '@angular/core/testing';

import { CAConstantService } from './caconstant.service';

describe('CAConstantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CAConstantService = TestBed.get(CAConstantService);
    expect(service).toBeTruthy();
  });
});
