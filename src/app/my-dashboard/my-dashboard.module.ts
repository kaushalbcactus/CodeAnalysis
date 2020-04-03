
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormsModule } from '@angular/forms';

import { MyDashboardComponent } from './my-dashboard.component';
import { MyTimelineComponent } from './my-timeline/my-timeline.component';
import { SearchProjectsComponent } from './search-projects/search-projects.component';
import { MyDashoardRoutingModule } from './my-dashoard-routing.module';
import { PrimengModule } from '../primeng/primeng.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddEditCommentComponent } from './add-edit-comment-dialog/add-edit-comment-dialog.component';
import { TimeSpentDialogComponent } from './time-spent-dialog/time-spent-dialog.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ConfirmationService, DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { MyCurrentCompletedTasksComponent } from './my-current-completed-tasks/my-current-completed-tasks.component';
import { PreviosNextTasksDialogComponent } from './previos-next-tasks-dialog/previos-next-tasks-dialog.component';
import { CustomMaterialModule } from '../shared/material.module';
import { BlockTimeDialogComponent } from './block-time-dialog/block-time-dialog.component';
import { TimeBookingDialogComponent } from './time-booking-dialog/time-booking-dialog.component';
import { NgxAutoScrollModule } from 'ngx-auto-scroll';
import { ProjectDraftsComponent } from './search-projects/project-drafts/project-drafts.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { DndModule } from 'ngx-drag-drop';

import { TreeTableModule, RatingModule } from 'primeng';
import { NgGanttEditorModule } from 'ng-gantt';
import { ProjectmanagementModule } from '../projectmanagement/projectmanagement.module';
import { TaskAllocationModule } from '../task-allocation/task-allocation.module';
import { QmsModule } from './../qms/qms.module';
// import { FeedbackPopupComponent } from '../qms/qms/reviewer-detail-view/feedback-popup/feedback-popup.component';
// import {QmsModule} from '../qms/qms.module';
import { MyprojectsComponent } from './myprojects/myprojects.component';
import { DisplayProjectsComponent } from './myprojects/display-projects/display-projects.component';
import { TimelineModule } from '../timeline/timeline.module';
import { SharedModule } from '../shared/shared.module';
import { ViewUploadDocumentDialogComponent } from '../shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { ViewUploadDocumentModule } from '../shared/view-upload-document-dialog/view-upload-document.module';
import { CreateTaskComponent } from './fte/create-task/create-task.component';
import { FileUploadProgressDialogComponent } from '../shared/file-upload-progress-dialog/file-upload-progress-dialog.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};



@NgModule({
  declarations: [
    MyCurrentCompletedTasksComponent,
    MyDashboardComponent,
    MyTimelineComponent,
    SearchProjectsComponent,
    AddEditCommentComponent,
    TimeSpentDialogComponent,
    PreviosNextTasksDialogComponent,
    BlockTimeDialogComponent,
    TimeBookingDialogComponent,
    ProjectDraftsComponent,
    MyprojectsComponent,
    DisplayProjectsComponent,
    CreateTaskComponent,
  ],
  imports: [
    NgxMaterialTimepickerModule,
    SharedModule,
    ViewUploadDocumentModule,
    CommonModule,
    FormsModule,
    MyDashoardRoutingModule,
    FlexLayoutModule,
    PrimengModule,
    PerfectScrollbarModule,
    CustomMaterialModule,
    NgxAutoScrollModule,
    NgGanttEditorModule,
    TreeTableModule,
    RatingModule,
    DndModule,
    NgxGraphModule,
    NgxChartsModule,
    ProjectmanagementModule,
    TaskAllocationModule,
    TimelineModule,
    QmsModule
  ],

  providers: [ConfirmationService, DatePipe, DialogService, DynamicDialogConfig, DynamicDialogRef, {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }],
  entryComponents: [
    TimeSpentDialogComponent,
    TimeBookingDialogComponent,
    AddEditCommentComponent,
    PreviosNextTasksDialogComponent,
    BlockTimeDialogComponent,
    ProjectDraftsComponent,
    ViewUploadDocumentDialogComponent,
    CreateTaskComponent,
    FileUploadProgressDialogComponent
  ]
})
export class MyDashboardModule { }
