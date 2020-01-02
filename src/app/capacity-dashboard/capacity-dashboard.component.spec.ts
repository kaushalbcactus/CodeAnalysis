import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityDashboardComponent } from './capacity-dashboard.component';

describe('CapacityDashboardComponent', () => {
  let component: CapacityDashboardComponent;
  let fixture: ComponentFixture<CapacityDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapacityDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
