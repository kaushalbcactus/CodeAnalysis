import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFeedbackComponent } from './personal-feedback.component';

describe('PersonalFeedbackComponent', () => {
  let component: PersonalFeedbackComponent;
  let fixture: ComponentFixture<PersonalFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
