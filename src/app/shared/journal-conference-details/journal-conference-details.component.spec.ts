import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalConferenceDetailsComponent } from './journal-conference-details.component';

describe('JournalConferenceDetailsComponent', () => {
  let component: JournalConferenceDetailsComponent;
  let fixture: ComponentFixture<JournalConferenceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalConferenceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalConferenceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
