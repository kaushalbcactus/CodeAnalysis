import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfTableAttributeComponent } from './pf-table-attribute.component';

describe('PfTableAttributeComponent', () => {
  let component: PfTableAttributeComponent;
  let fixture: ComponentFixture<PfTableAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfTableAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfTableAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
