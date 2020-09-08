import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfdetailsComponent } from './pfdetails.component';

describe('PfdetailsComponent', () => {
  let component: PfdetailsComponent;
  let fixture: ComponentFixture<PfdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
