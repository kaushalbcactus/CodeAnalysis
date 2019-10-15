import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnallocatedAllocatedTasksComponent } from './unallocated-allocated-tasks.component';

describe('UnallocatedAllocatedTasksComponent', () => {
  let component: UnallocatedAllocatedTasksComponent;
  let fixture: ComponentFixture<UnallocatedAllocatedTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnallocatedAllocatedTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnallocatedAllocatedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
