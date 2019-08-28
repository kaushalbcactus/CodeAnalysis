import { TestBed } from '@angular/core/testing';

import { QMSCommonService } from './qmscommon.service';

describe('QMSCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QMSCommonService = TestBed.get(QMSCommonService);
    expect(service).toBeTruthy();
  });
});
