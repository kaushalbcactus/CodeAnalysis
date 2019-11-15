import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneTasksDialogComponent } from './milestone-tasks-dialog.component';

describe('MilestoneTasksDialogComponent', () => {
  let component: MilestoneTasksDialogComponent;
  let fixture: ComponentFixture<MilestoneTasksDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneTasksDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneTasksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
