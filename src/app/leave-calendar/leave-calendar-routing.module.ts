import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LeaveCalendarComponent } from './leave-calendar.component';

const routes: Routes = [
  { path: '', component: LeaveCalendarComponent },
  { path: 'leavecalendar', component: LeaveCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
  declarations: [],

})
export class LeaveCalendarRoutingModule { }

