import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercapacityComponent } from './usercapacity.component';

describe('UsercapacityComponent', () => {
  let component: UsercapacityComponent;
  let fixture: ComponentFixture<UsercapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsercapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsercapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
