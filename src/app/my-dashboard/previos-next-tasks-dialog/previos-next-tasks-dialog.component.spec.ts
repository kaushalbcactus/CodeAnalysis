import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviosNextTasksDialogComponent } from './previos-next-tasks-dialog.component';

describe('PreviosNextTasksDialogComponent', () => {
  let component: PreviosNextTasksDialogComponent;
  let fixture: ComponentFixture<PreviosNextTasksDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviosNextTasksDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviosNextTasksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
