import { TestBed, async, inject } from '@angular/core/testing';

import { FdAuthGuard } from './fd-auth.guard';

describe('FdAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FdAuthGuard]
    });
  });

  it('should ...', inject([FdAuthGuard], (guard: FdAuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
