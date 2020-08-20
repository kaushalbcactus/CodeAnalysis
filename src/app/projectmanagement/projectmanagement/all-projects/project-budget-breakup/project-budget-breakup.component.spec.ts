import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBudgetBreakupComponent } from './project-budget-breakup.component';

describe('ProjectBudgetBreakupComponent', () => {
  let component: ProjectBudgetBreakupComponent;
  let fixture: ComponentFixture<ProjectBudgetBreakupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBudgetBreakupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBudgetBreakupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
