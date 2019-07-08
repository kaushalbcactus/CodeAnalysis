import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrimengModule } from "../primeng/primeng.module";
import { ListComponent } from './list/list.component';
@NgModule({
  declarations: [DashboardComponent, ListComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    PrimengModule
  ],
  providers:[]
})
export class DashboardModule { }
