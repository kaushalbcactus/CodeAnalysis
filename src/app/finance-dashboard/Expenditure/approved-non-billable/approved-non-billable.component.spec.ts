import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedNonBillableComponent } from './approved-non-billable.component';

describe('ApprovedNonBillableComponent', () => {
  let component: ApprovedNonBillableComponent;
  let fixture: ComponentFixture<ApprovedNonBillableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovedNonBillableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedNonBillableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
