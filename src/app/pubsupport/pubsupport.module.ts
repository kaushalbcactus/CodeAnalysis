import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PubsupportRoutingModule } from './pubsupport-routing.module';
import { PubsupportComponent } from './pubsupport/pubsupport.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// FIle upload
import { FileUploadModule } from 'ng2-file-upload';

import { SharedModule } from '../shared/shared.module';
import { CreateConferenceComponent } from './pubsupport/create-conference/create-conference.component';
import { CreateJournalComponent } from './pubsupport/create-journal/create-journal.component';
import { AddAuthorComponent } from './pubsupport/add-author/add-author.component';
import { AuthorDetailsComponent } from './pubsupport/author-details/author-details.component';

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
  entryComponents: [CreateConferenceComponent, CreateJournalComponent, AddAuthorComponent, AuthorDetailsComponent],
  providers: [DatePipe]
})
export class PubsupportModule { }
