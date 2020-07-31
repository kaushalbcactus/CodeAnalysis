import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalConferenceDetailsComponent } from './journal-conference-details.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';



@NgModule({
  declarations: [JournalConferenceDetailsComponent],
  imports: [
    CommonModule,
    PrimengModule
  ],
  exports: [ JournalConferenceDetailsComponent ]
})
export class JournalConferenceDetailsModule { }
