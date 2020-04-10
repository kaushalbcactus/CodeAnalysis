import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NG5SliderComponent } from './ng5-slider.component';

describe('NG5SliderComponent', () => {
  let component: NG5SliderComponent;
  let fixture: ComponentFixture<NG5SliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NG5SliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NG5SliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
