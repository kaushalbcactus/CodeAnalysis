import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OopComponent } from './oop.component';

describe('OopComponent', () => {
  let component: OopComponent;
  let fixture: ComponentFixture<OopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
