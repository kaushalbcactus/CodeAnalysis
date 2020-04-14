import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAllocationOverlayComponent } from './daily-allocation-overlay.component';

describe('DailyAllocationOverlayComponent', () => {
  let component: DailyAllocationOverlayComponent;
  let fixture: ComponentFixture<DailyAllocationOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyAllocationOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyAllocationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
