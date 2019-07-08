import { TestBed } from '@angular/core/testing';

import { SharepointoperationService } from './sharepoint-operation.service';

describe('SharepointOperationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharepointoperationService = TestBed.get(SharepointoperationService);
    expect(service).toBeTruthy();
  });
});
