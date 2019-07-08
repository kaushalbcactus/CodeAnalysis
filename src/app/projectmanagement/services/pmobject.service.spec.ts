import { TestBed } from '@angular/core/testing';

import { PMObjectService } from './pmobject.service';

describe('PMObjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PMObjectService = TestBed.get(PMObjectService);
    expect(service).toBeTruthy();
  });
});
