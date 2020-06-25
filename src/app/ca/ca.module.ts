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
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';
import { UnallocatedAllocatedTasksComponent } from './unallocated-allocated-tasks/unallocated-allocated-tasks.component';
import { UserCapacityModule } from '../shared/usercapacity/usercapacity.module';
import { UsercapacityComponent } from '../shared/usercapacity/usercapacity.component';
import { CaDragdropComponent } from './ca-dragdrop/ca-dragdrop.component';
import { CustomMaterialModule } from '../shared/material.module';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CaComponent } from './ca.component';
import { PreStackAllocationModule } from '../shared/pre-stack-allocation/pre-stack-allocation.module';
import { PreStackAllocationComponent } from '../shared/pre-stack-allocation/pre-stack-allocation.component';
import { ConflictAllocationsModule } from '../Shared/conflict-allocations/conflict-allocations.module';
import { ConflictAllocationComponent } from '../shared/conflict-allocations/conflict-allocation.component';

@NgModule({
  declarations: [UnallocatedAllocatedTasksComponent, CaDragdropComponent, CaComponent],
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
    PreStackAllocationModule,
    ConflictAllocationsModule
  ],
  providers: [DynamicDialogConfig, DynamicDialogRef],
  entryComponents: [UsercapacityComponent, CaDragdropComponent, PreStackAllocationComponent,
    ConflictAllocationComponent],
})
export class CAModule { }
