import { NgModule } from '@angular/core';
import { ViewUploadDocumentDialogComponent } from './view-upload-document-dialog.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagDocumentComponent } from './tag-document/tag-document.component';
@NgModule({
  declarations: [ViewUploadDocumentDialogComponent, TagDocumentComponent],
  imports: [
    CommonModule,
    PrimengModule,
    FormsModule
  ],
  exports: [
    ViewUploadDocumentDialogComponent
  ],
  entryComponents: [
    TagDocumentComponent,
  ],
})
export class ViewUploadDocumentModule {
}
