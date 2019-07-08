import { TestBed } from '@angular/core/testing';

import { RouteInteceptorService } from './route-inteceptor.service';

describe('RouteInteceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouteInteceptorService = TestBed.get(RouteInteceptorService);
    expect(service).toBeTruthy();
  });
});
