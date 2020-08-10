import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttEdittaskComponent } from './gantt-edittask.component';

describe('GanttEdittaskComponent', () => {
  let component: GanttEdittaskComponent;
  let fixture: ComponentFixture<GanttEdittaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GanttEdittaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttEdittaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
