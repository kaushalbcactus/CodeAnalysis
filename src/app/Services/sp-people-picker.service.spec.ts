import { TestBed, inject } from '@angular/core/testing';

import { SpPeoplePickerService } from './sp-people-picker.service';

describe('SpPeoplePickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpPeoplePickerService]
    });
  });

  it('should be created', inject([SpPeoplePickerService], (service: SpPeoplePickerService) => {
    expect(service).toBeTruthy();
  }));
});
