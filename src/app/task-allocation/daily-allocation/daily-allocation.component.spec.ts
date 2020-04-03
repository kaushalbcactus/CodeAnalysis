import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAllocationComponent } from './daily-allocation.component';

describe('DailyAllocationComponent', () => {
  let component: DailyAllocationComponent;
  let fixture: ComponentFixture<DailyAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
