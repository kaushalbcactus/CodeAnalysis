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
import { JournalConferenceDetailsModule } from '../shared/journal-conference-details/journal-conference-details.module';
import { JournalConferenceDetailsComponent } from 'src/app/shared/journal-conference-details/journal-conference-details.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';

@NgModule({
  declarations: [PubsupportComponent, CreateConferenceComponent, CreateJournalComponent, AddAuthorComponent, AuthorDetailsComponent],
  imports: [
    CommonModule,
    PubsupportRoutingModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    JournalConferenceDetailsModule
    // FileUploadModule
  ],
  entryComponents: [CreateConferenceComponent, CreateJournalComponent, AddAuthorComponent, AuthorDetailsComponent, JournalConferenceDetailsComponent],
  providers: [DatePipe, TitleCasePipe,DynamicDialogConfig,DynamicDialogRef]
})
export class PubsupportModule { }
