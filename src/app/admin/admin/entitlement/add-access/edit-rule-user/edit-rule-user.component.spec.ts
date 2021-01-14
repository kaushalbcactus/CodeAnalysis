import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRuleUserComponent } from './edit-rule-user.component';

describe('EditRuleUserComponent', () => {
  let component: EditRuleUserComponent;
  let fixture: ComponentFixture<EditRuleUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRuleUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRuleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
