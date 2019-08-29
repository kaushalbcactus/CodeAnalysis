import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskAllocationRoutingModule } from './task-allocation-routing.module';
import { TaskAllocationComponent } from './task-allocation.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from '../shared/material.module';
import { TimelineComponent } from './timeline/timeline.component';
import { NgGanttEditorModule } from 'ng-gantt';
import { TreeTableModule } from 'primeng/treetable';
import { ConfirmationService } from 'primeng/api';
import { PrimengModule } from '../primeng/primeng.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserCapacityComponent } from './user-capacity/user-capacity.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { DndModule } from 'ngx-drag-drop';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { StickyModule } from 'ng2-sticky-kit';
import { ResourceSectionComponent } from './resource-section/resource-section.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';
import { ResourcesComponent } from './resources/resources.component';
@NgModule({
  declarations: [TaskAllocationComponent, TimelineComponent, UserCapacityComponent, DragDropComponent,
    ResourceSectionComponent, TaskDetailsDialogComponent, ResourcesComponent],
  imports: [
    CommonModule,
    TaskAllocationRoutingModule,
    FlexLayoutModule,
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgGanttEditorModule,
    TreeTableModule,
    PrimengModule,
    NgSelectModule,
    DndModule,
    NgxGraphModule,
    NgxChartsModule,
    StickyModule,
    NgxMaterialTimepickerModule
  ],
  exports: [
    TimelineComponent
  ],
  providers: [DatePipe, ConfirmationService],
  entryComponents: [UserCapacityComponent, DragDropComponent, TaskDetailsDialogComponent]
  // providers: [TaskAllocationAPI]
})
export class TaskAllocationModule { }
