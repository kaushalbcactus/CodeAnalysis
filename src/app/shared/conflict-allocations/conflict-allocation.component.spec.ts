import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictAllocationComponent } from './conflict-allocation.component';

describe('ConflictAllocationComponent', () => {
  let component: ConflictAllocationComponent;
  let fixture: ComponentFixture<ConflictAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConflictAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
