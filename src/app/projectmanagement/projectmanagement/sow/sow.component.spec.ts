import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SOWComponent } from './sow.component';

describe('SOWComponent', () => {
  let component: SOWComponent;
  let fixture: ComponentFixture<SOWComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SOWComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SOWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
