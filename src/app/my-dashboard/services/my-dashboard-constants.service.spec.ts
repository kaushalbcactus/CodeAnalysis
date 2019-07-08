import { TestBed } from '@angular/core/testing';

import { MyDashboardConstantsService } from './my-dashboard-constants.service';

describe('MyDashboardConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyDashboardConstantsService = TestBed.get(MyDashboardConstantsService);
    expect(service).toBeTruthy();
  });
});
