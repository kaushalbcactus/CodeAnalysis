import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AllocatedComponent } from './allocated/allocated.component';
// import { ModelComponent } from './model/model.component';
// import { UnallocatedComponent } from './unallocated/unallocated.component';

import { PrimengModule } from '../primeng/primeng.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CaRoutingModule } from './ca-routing.module';
// import { CaComponent } from './ca.component';
import { DynamicDialogRef, DynamicDialogConfig, ConfirmationService } from 'primeng/api';
import { UnallocatedAllocatedTasksComponent } from './unallocated-allocated-tasks/unallocated-allocated-tasks.component';
import { UserCapacityModule } from '../shared/usercapacity/usercapacity.module';
import { UsercapacityComponent } from '../shared/usercapacity/usercapacity.component';
import { CaDragdropComponent } from './ca-dragdrop/ca-dragdrop.component';
import { CustomMaterialModule } from '../shared/material.module';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';



@NgModule({
  declarations: [UnallocatedAllocatedTasksComponent, CaDragdropComponent],
  imports: [
    CommonModule,
    PrimengModule,
    NgbModule,
    FormsModule,
    CaRoutingModule,
    UserCapacityModule,
    CustomMaterialModule,
    NgxGraphModule,
    NgxChartsModule,
    NgxMaterialTimepickerModule,
  ],
  providers: [DynamicDialogConfig, DynamicDialogRef, ConfirmationService],
  entryComponents: [UsercapacityComponent, CaDragdropComponent],
})
export class CAModule { }
