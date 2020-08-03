import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalConferenceDetailsComponent } from './journal-conference-details.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { AuthorDetailsComponent } from 'src/app/pubsupport/pubsupport/author-details/author-details.component';



@NgModule({
  declarations: [JournalConferenceDetailsComponent],
  imports: [
    CommonModule,
    PrimengModule
  ],
  exports: [ JournalConferenceDetailsComponent ],
  entryComponents: [AuthorDetailsComponent]
})
export class JournalConferenceDetailsModule { }
