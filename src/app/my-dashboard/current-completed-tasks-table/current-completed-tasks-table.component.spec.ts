import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentCompletedTasksTableComponent } from './current-completed-tasks-table.component';

describe('CurrentCompletedTasksTableComponent', () => {
  let component: CurrentCompletedTasksTableComponent;
  let fixture: ComponentFixture<CurrentCompletedTasksTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentCompletedTasksTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentCompletedTasksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
