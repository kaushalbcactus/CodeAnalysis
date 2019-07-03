import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAllocationComponent } from './pending-allocation.component';

describe('PendingAllocationComponent', () => {
  let component: PendingAllocationComponent;
  let fixture: ComponentFixture<PendingAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
