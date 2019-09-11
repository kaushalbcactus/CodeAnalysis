import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessleveldashboardComponent } from './accessleveldashboard.component';

describe('AccessleveldashboardComponent', () => {
  let component: AccessleveldashboardComponent;
  let fixture: ComponentFixture<AccessleveldashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessleveldashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessleveldashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
