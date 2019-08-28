import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewerDetailViewComponent } from './reviewer-detail-view.component';

describe('ReviewerDetailViewComponent', () => {
  let component: ReviewerDetailViewComponent;
  let fixture: ComponentFixture<ReviewerDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewerDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewerDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
