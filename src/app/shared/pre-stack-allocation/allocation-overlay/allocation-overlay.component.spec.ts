import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationOverlayComponent } from './allocation-overlay.component';

describe('AllocationOverlayComponent', () => {
  let component: AllocationOverlayComponent;
  let fixture: ComponentFixture<AllocationOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
