import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsPopupComponent } from './actions-popup.component';

describe('ActionsPopupComponent', () => {
  let component: ActionsPopupComponent;
  let fixture: ComponentFixture<ActionsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
