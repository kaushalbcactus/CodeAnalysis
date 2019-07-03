import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvTableAttributeComponent } from './inv-table-attribute.component';

describe('InvTableAttributeComponent', () => {
  let component: InvTableAttributeComponent;
  let fixture: ComponentFixture<InvTableAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvTableAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvTableAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
