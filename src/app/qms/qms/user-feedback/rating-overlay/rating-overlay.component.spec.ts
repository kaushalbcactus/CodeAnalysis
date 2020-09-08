import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingOverlayComponent } from './rating-overlay.component';

describe('RatingOverlayComponent', () => {
  let component: RatingOverlayComponent;
  let fixture: ComponentFixture<RatingOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
