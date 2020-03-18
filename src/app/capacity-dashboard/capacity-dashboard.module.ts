import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { CapacityDashboardComponent } from './capacity-dashboard.component';
import { CapacityDashboardRoutingModule } from './capacity-dashboard-routing.module';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserCapacityModule } from '../shared/usercapacity/usercapacity.module';


@NgModule({
  declarations: [CapacityDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CapacityDashboardRoutingModule,
    PrimengModule,
    ReactiveFormsModule,
    UserCapacityModule
  ],

  providers: [DialogService, DynamicDialogConfig, DynamicDialogRef],
  entryComponents: [
  ]
})
export class CapacityDashboardModule { }
