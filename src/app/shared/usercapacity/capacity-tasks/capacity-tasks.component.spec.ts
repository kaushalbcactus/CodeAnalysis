import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityTasksComponent } from './capacity-tasks.component';

describe('CapacityTasksComponent', () => {
  let component: CapacityTasksComponent;
  let fixture: ComponentFixture<CapacityTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapacityTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacityTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
