import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDraftsComponent } from './project-drafts.component';

describe('ProjectDraftsComponent', () => {
  let component: ProjectDraftsComponent;
  let fixture: ComponentFixture<ProjectDraftsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDraftsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
