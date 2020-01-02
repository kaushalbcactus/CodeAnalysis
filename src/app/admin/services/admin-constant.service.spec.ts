import { TestBed } from '@angular/core/testing';

import { AdminConstantService } from './admin-constant.service';

describe('AdminConstantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminConstantService = TestBed.get(AdminConstantService);
    expect(service).toBeTruthy();
  });
});
