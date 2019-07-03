import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PubsupportComponent } from './pubsupport.component';

describe('PubsupportComponent', () => {
  let component: PubsupportComponent;
  let fixture: ComponentFixture<PubsupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PubsupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PubsupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
