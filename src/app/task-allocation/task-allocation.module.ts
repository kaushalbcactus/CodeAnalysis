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
import { ConfirmationService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
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
import { CascadeDialogComponent } from './cascade-dialog/cascade-dialog.component';
import { GanttChartModule } from '../shared/gantt-chart/gantt-chart.module';
import { GanttChartComponent } from '../shared/gantt-chart/gantt-chart.component';
import { DailyAllocationComponent } from './daily-allocation/daily-allocation.component';
import { NgsliderComponent } from './daily-allocation/ngslider/ngslider.component';
import { Ng5SliderModule } from 'ng5-slider';
@NgModule({
  declarations: [TaskAllocationComponent, TimelineComponent, DragDropComponent,
     TaskDetailsDialogComponent, ResourcesComponent, CascadeDialogComponent, DailyAllocationComponent, NgsliderComponent],
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
    Ng5SliderModule
  ],
  exports: [
    TimelineComponent
  ],
  providers: [DatePipe, DynamicDialogConfig, DynamicDialogRef, ConfirmationService],
  entryComponents: [UsercapacityComponent, DragDropComponent, TaskDetailsDialogComponent, GanttChartComponent,
                    DailyAllocationComponent]
  // providers: [TaskAllocationAPI]
})
export class TaskAllocationModule { }
