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
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrimengModule } from '../primeng/primeng.module';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { DndModule } from 'ngx-drag-drop';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';
import { ResourcesComponent } from './resources/resources.component';
import { UserCapacityModule } from '../shared/usercapacity/usercapacity.module';
import { UsercapacityComponent } from '../shared/usercapacity/usercapacity.component';
import { GanttChartModule } from '../shared/gantt-chart/gantt-chart.module';
import { GanttChartComponent } from '../shared/gantt-chart/gantt-chart.component';
import { GanttEdittaskComponent } from './gantt-edittask/gantt-edittask.component';
import { Ng5SliderModule } from 'ng5-slider';
import { PreStackAllocationModule } from '../shared/pre-stack-allocation/pre-stack-allocation.module';
import { PreStackAllocationComponent } from '../shared/pre-stack-allocation/pre-stack-allocation.component';
import { ResourceSelectionComponent } from './resource-selection/resource-selection.component';
import { ConflictAllocationsModule } from '../shared/conflict-allocations/conflict-allocations.module';
import { ConflictAllocationComponent } from '../shared/conflict-allocations/conflict-allocation.component';
@NgModule({
  declarations: [TaskAllocationComponent, TimelineComponent, DragDropComponent,
    TaskDetailsDialogComponent, ResourcesComponent, GanttEdittaskComponent, ResourceSelectionComponent],
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
    DndModule,
    NgxGraphModule,
    NgxChartsModule,
    NgxMaterialTimepickerModule,
    UserCapacityModule,
    GanttChartModule,
    Ng5SliderModule,
    PreStackAllocationModule,
    ConflictAllocationsModule
  ],
  exports: [
    TimelineComponent
  ],
  providers: [DatePipe, DynamicDialogConfig, DynamicDialogRef],
  entryComponents: [UsercapacityComponent, DragDropComponent, TaskDetailsDialogComponent, GanttChartComponent, PreStackAllocationComponent,
    GanttEdittaskComponent, ResourceSelectionComponent, ConflictAllocationComponent]
})
export class TaskAllocationModule { }
