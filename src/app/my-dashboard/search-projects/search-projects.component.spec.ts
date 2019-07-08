import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProjectsComponent } from './search-projects.component';

describe('SearchProjectsComponent', () => {
  let component: SearchProjectsComponent;
  let fixture: ComponentFixture<SearchProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
