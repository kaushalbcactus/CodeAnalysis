import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedBillableComponent } from './approved-billable.component';

describe('ApprovedBillableComponent', () => {
  let component: ApprovedBillableComponent;
  let fixture: ComponentFixture<ApprovedBillableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovedBillableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedBillableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
