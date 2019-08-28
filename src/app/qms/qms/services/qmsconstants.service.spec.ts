import { TestBed } from '@angular/core/testing';

import { QMSConstantsService } from './qmsconstants.service';

describe('QMSConstantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QMSConstantsService = TestBed.get(QMSConstantsService);
    expect(service).toBeTruthy();
  });
});
