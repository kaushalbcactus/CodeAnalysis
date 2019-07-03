import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSpentDialogComponent } from './time-spent-dialog.component';

describe('TimeSpentDialogComponent', () => {
  let component: TimeSpentDialogComponent;
  let fixture: ComponentFixture<TimeSpentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSpentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSpentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
