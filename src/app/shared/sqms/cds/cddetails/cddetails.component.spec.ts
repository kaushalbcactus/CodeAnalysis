import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CddetailsComponent } from './cddetails.component';

describe('CddetailsComponent', () => {
  let component: CddetailsComponent;
  let fixture: ComponentFixture<CddetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CddetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
