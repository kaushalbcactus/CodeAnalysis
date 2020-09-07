import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleOverlayComponent } from './rule-overlay.component';

describe('RuleOverlayComponent', () => {
  let component: RuleOverlayComponent;
  let fixture: ComponentFixture<RuleOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
