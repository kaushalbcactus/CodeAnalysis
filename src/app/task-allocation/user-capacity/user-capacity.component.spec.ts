import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCapacityComponent } from './user-capacity.component';

describe('UserCapacityComponent', () => {
  let component: UserCapacityComponent;
  let fixture: ComponentFixture<UserCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
