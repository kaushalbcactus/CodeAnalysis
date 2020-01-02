import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyPermissionComponent } from './copy-permission.component';

describe('CopyPermissionComponent', () => {
  let component: CopyPermissionComponent;
  let fixture: ComponentFixture<CopyPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
