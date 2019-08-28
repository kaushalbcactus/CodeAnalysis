import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableTypesComponent } from './deliverable-types.component';

describe('DeliverableTypesComponent', () => {
  let component: DeliverableTypesComponent;
  let fixture: ComponentFixture<DeliverableTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
