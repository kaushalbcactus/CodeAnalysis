import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimelineHistoryComponent } from './timeline-history/timeline-history.component';
import { PrimengModule } from '../primeng/primeng.module';

@NgModule({
  declarations: [TimelineHistoryComponent],
  imports: [
    CommonModule,
    PrimengModule
  ],
  exports: [
    TimelineHistoryComponent
  ]
})
export class TimelineModule { }
