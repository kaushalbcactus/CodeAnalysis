import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimelineHistoryComponent } from './timeline-history/timeline-history.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule } from '@angular/forms'
@NgModule({
  declarations: [TimelineHistoryComponent],
  imports: [
    CommonModule,
    PrimengModule,
    FormsModule
  ],
  exports: [
    TimelineHistoryComponent
  ]
})
export class TimelineModule { }
