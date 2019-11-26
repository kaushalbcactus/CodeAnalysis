import { TestBed, async, inject } from '@angular/core/testing';

import { QmsAuthGuard } from './qms-auth.guard';

describe('QmsAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QmsAuthGuard]
    });
  });

  it('should ...', inject([QmsAuthGuard], (guard: QmsAuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
