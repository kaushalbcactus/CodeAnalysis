import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QMSComponent } from './qms.component';

describe('QMSComponent', () => {
  let component: QMSComponent;
  let fixture: ComponentFixture<QMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QMSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
