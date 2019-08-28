import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CDComponent } from './cd.component';

describe('CDComponent', () => {
  let component: CDComponent;
  let fixture: ComponentFixture<CDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
