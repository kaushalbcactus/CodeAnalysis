import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreStackAllocationComponent } from './pre-stack-allocation.component';

describe('PreStackAllocationComponent', () => {
  let component: PreStackAllocationComponent;
  let fixture: ComponentFixture<PreStackAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreStackAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreStackAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
