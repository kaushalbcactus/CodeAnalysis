import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadProgressDialogComponent } from './file-upload-progress-dialog.component';

describe('FileUploadProgressDialogComponent', () => {
  let component: FileUploadProgressDialogComponent;
  let fixture: ComponentFixture<FileUploadProgressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadProgressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
