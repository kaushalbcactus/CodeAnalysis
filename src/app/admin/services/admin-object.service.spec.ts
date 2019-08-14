import { TestBed } from '@angular/core/testing';

import { AdminObjectService } from './admin-object.service';

describe('AdminObjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminObjectService = TestBed.get(AdminObjectService);
    expect(service).toBeTruthy();
  });
});
