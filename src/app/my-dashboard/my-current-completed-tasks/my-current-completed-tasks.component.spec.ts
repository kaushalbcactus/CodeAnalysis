import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCurrentCompletedTasksComponent } from './my-current-completed-tasks.component';

describe('MyCurrentCompletedTasksComponent', () => {
  let component: MyCurrentCompletedTasksComponent;
  let fixture: ComponentFixture<MyCurrentCompletedTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCurrentCompletedTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCurrentCompletedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
