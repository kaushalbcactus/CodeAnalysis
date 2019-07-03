import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProTableAttributeComponent } from './pro-table-attribute.component';

describe('ProTableAttributeComponent', () => {
  let component: ProTableAttributeComponent;
  let fixture: ComponentFixture<ProTableAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProTableAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProTableAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
