import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CascadeDialogComponent } from './cascade-dialog.component';

describe('CascadeDialogComponent', () => {
  let component: CascadeDialogComponent;
  let fixture: ComponentFixture<CascadeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CascadeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CascadeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
