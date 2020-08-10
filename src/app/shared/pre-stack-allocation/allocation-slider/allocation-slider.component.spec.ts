import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationSliderComponent } from './allocation-slider.component';

describe('AllocationSliderComponent', () => {
  let component: AllocationSliderComponent;
  let fixture: ComponentFixture<AllocationSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
