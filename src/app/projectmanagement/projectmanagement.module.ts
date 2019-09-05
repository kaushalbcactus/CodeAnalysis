import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectmanagementComponent } from './projectmanagement/projectmanagement.component';
import { SendToClientComponent } from './projectmanagement/send-to-client/send-to-client.component';
import { PendingAllocationComponent } from './projectmanagement/pending-allocation/pending-allocation.component';
import { InactiveComponent } from './projectmanagement/inactive/inactive.component';
import { ClientReviewComponent } from './projectmanagement/client-review/client-review.component';
import { ProjectManagementRoutingModule } from './project-management-routing.module';
import { PrimengModule } from '../primeng/primeng.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AllProjectsComponent } from './projectmanagement/all-projects/all-projects.component';
import { SOWComponent } from './projectmanagement/sow/sow.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddProjectsComponent } from './projectmanagement/add-projects/add-projects.component';
import { SelectSOWComponent } from './projectmanagement/add-projects/select-sow/select-sow.component';
import { ProjectAttributesComponent } from './projectmanagement/add-projects/project-attributes/project-attributes.component';
// import { AddTimelineComponent } from './projectmanagement/add-projects/addtimeline/timeline.component';
import { AddTimelineComponent } from './projectmanagement/add-projects/addtimeline/addtimeline.component';
import { FinanceManagementComponent } from './projectmanagement/add-projects/finance-management/finance-management.component';
import { ManageFinanceComponent } from './projectmanagement/add-projects/manage-finance/manage-finance.component';
import { StandardprojectComponent } from './projectmanagement/add-projects/addtimeline/standardproject/standardproject.component';
// tslint:disable-next-line: max-line-length
import { NonStandardprojectComponent } from './projectmanagement/add-projects/addtimeline/non-standardproject/non-standardproject.component';
import { UsercapacityComponent } from './projectmanagement/add-projects/addtimeline/usercapacity/usercapacity.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PMResolve } from './PMResolve';
import { PMMainResolve } from './PMMainResolve';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';
import { TimelineModule } from '../timeline/timeline.module';
import { CustomMaterialModule } from '../shared/material.module';
import { TaskAllocationModule } from '../task-allocation/task-allocation.module';
import { ProjectTimelineComponent } from './projectmanagement/all-projects/project-timeline/project-timeline.component';
import { ViewUploadDocumentModule } from '../shared/view-upload-document-dialog/view-upload-document.module';
import { SharedModule } from 'primeng/primeng';
import { ViewUploadDocumentDialogComponent } from '../shared/view-upload-document-dialog/view-upload-document-dialog.component';

@NgModule({
  declarations: [
    ProjectmanagementComponent,
    SendToClientComponent,
    PendingAllocationComponent,
    InactiveComponent,
    ClientReviewComponent,
    AllProjectsComponent,
    SOWComponent,
    AddProjectsComponent,
    SelectSOWComponent,
    ProjectAttributesComponent,
    AddTimelineComponent,
    FinanceManagementComponent,
    ManageFinanceComponent,
    StandardprojectComponent,
    NonStandardprojectComponent,
    UsercapacityComponent,
    ProjectTimelineComponent],
  imports: [
    SharedModule,
    CommonModule,
    ViewUploadDocumentModule,
    ProjectManagementRoutingModule,
    PrimengModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    NgSelectModule,
    ReactiveFormsModule,
    TimelineModule,
    CustomMaterialModule,
    NgbModule,
    TaskAllocationModule
  ],
  exports: [
    AllProjectsComponent
  ],
  providers: [
    DatePipe,
    UsercapacityComponent,
    PMResolve,
    PMMainResolve,
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef
  ],
  entryComponents: [
    ProjectAttributesComponent,
    ManageFinanceComponent,
    AddProjectsComponent,
    ProjectTimelineComponent,
    ViewUploadDocumentDialogComponent
  ]
})
export class ProjectmanagementModule { }
