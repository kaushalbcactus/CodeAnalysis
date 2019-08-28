import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackBymeComponent } from './feedback-byme.component';

describe('FeedbackBymeComponent', () => {
  let component: FeedbackBymeComponent;
  let fixture: ComponentFixture<FeedbackBymeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackBymeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackBymeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
