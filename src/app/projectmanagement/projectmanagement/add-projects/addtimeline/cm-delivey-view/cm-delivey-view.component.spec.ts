import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmDeliveyViewComponent } from './cm-delivey-view.component';

describe('CmDeliveyViewComponent', () => {
  let component: CmDeliveyViewComponent;
  let fixture: ComponentFixture<CmDeliveyViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmDeliveyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmDeliveyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
