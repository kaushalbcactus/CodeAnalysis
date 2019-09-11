import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessleveldashboardComponent } from './accessleveldashboard.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule } from '@angular/forms';
import { AccessLevelDashboardRoutingModule } from './accessleveldashboard-routing.module';

@NgModule({
  declarations: [AccessleveldashboardComponent],
  imports: [
    CommonModule,
    AccessLevelDashboardRoutingModule,
    PrimengModule,
    FormsModule
  ]
})
export class AccessleveldashboardModule { }

