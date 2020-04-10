import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { PubsupportRoutingModule } from './pubsupport-routing.module';
import { PubsupportComponent } from './pubsupport/pubsupport.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CreateConferenceComponent } from './pubsupport/create-conference/create-conference.component';
import { CreateJournalComponent } from './pubsupport/create-journal/create-journal.component';
import { AddAuthorComponent } from './pubsupport/add-author/add-author.component';
import { AuthorDetailsComponent } from './pubsupport/author-details/author-details.component';
import { FileUploadProgressDialogComponent } from '../shared/file-upload-progress-dialog/file-upload-progress-dialog.component';

@NgModule({
  declarations: [PubsupportComponent, CreateConferenceComponent, CreateJournalComponent, AddAuthorComponent, AuthorDetailsComponent],
  imports: [
    CommonModule,
    PubsupportRoutingModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    // FileUploadModule
  ],
  entryComponents: [CreateConferenceComponent, CreateJournalComponent, AddAuthorComponent, AuthorDetailsComponent,FileUploadProgressDialogComponent],
  providers: [DatePipe, TitleCasePipe]
})
export class PubsupportModule { }
