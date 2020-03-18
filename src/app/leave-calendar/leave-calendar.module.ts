import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveCalendarRoutingModule } from './leave-calendar-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from '../primeng/primeng.module';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LeaveCalendarComponent } from './leave-calendar.component';


@NgModule({
  declarations: [LeaveCalendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LeaveCalendarRoutingModule,
    PrimengModule,
    ReactiveFormsModule,
  ],

  providers: [DialogService, DynamicDialogConfig, DynamicDialogRef],
  entryComponents: [
  ]
})
export class LeaveCalendarModule { }
