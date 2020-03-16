import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditProjectDialogComponent } from './audit-project-dialog.component';

describe('AuditProjectDialogComponent', () => {
  let component: AuditProjectDialogComponent;
  let fixture: ComponentFixture<AuditProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditProjectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
