import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgsliderComponent } from './ngslider.component';

describe('NgsliderComponent', () => {
  let component: NgsliderComponent;
  let fixture: ComponentFixture<NgsliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgsliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgsliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
