import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IliTableAttributeComponent } from './ili-table-attribute.component';

describe('IliTableAttributeComponent', () => {
  let component: IliTableAttributeComponent;
  let fixture: ComponentFixture<IliTableAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IliTableAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IliTableAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
