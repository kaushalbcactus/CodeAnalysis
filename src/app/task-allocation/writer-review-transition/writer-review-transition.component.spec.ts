import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriterReviewTransitionComponent } from './writer-review-transition.component';

describe('WriterReviewTransitionComponent', () => {
  let component: WriterReviewTransitionComponent;
  let fixture: ComponentFixture<WriterReviewTransitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriterReviewTransitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriterReviewTransitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
