import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUploadDocumentDialogComponent } from './view-upload-document-dialog.component';

describe('ViewUploadDocumentDialogComponent', () => {
  let component: ViewUploadDocumentDialogComponent;
  let fixture: ComponentFixture<ViewUploadDocumentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUploadDocumentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUploadDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
