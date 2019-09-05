import { NgModule } from '@angular/core';
import { ViewUploadDocumentDialogComponent } from './view-upload-document-dialog.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ViewUploadDocumentDialogComponent],
  imports: [
    CommonModule,
    PrimengModule,

  ],
  exports: [
    ViewUploadDocumentDialogComponent
  ]
})
export class ViewUploadDocumentModule {
}
