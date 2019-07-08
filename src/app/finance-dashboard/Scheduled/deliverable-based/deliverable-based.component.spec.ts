import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableBasedComponent } from './deliverable-based.component';

describe('DeliverableBasedComponent', () => {
  let component: DeliverableBasedComponent;
  let fixture: ComponentFixture<DeliverableBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableBasedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
