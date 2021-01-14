import { TestBed } from '@angular/core/testing';

import { AddAccessService } from './add-access.service';

describe('AddAccessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddAccessService = TestBed.get(AddAccessService);
    expect(service).toBeTruthy();
  });
});
