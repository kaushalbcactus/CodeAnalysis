import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTimelineComponent } from './project-timeline.component';

describe('ProjectTimelineComponent', () => {
  let component: ProjectTimelineComponent;
  let fixture: ComponentFixture<ProjectTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
