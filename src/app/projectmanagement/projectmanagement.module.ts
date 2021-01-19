import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectmanagementComponent } from './projectmanagement/projectmanagement.component';
import { SendToClientComponent } from './projectmanagement/send-to-client/send-to-client.component';
import { PendingAllocationComponent } from './projectmanagement/pending-allocation/pending-allocation.component';
import { InactiveComponent } from './projectmanagement/inactive/inactive.component';
import { ClientReviewComponent } from './projectmanagement/client-review/client-review.component';
import { ProjectManagementRoutingModule } from './project-management-routing.module';
import { PrimengModule } from '../primeng/primeng.module';
import { AllProjectsComponent } from './projectmanagement/all-projects/all-projects.component';
import { SOWComponent } from './projectmanagement/sow/sow.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddProjectsComponent } from './projectmanagement/add-projects/add-projects.component';
import { SelectSOWComponent } from './projectmanagement/add-projects/select-sow/select-sow.component';
import { ProjectAttributesComponent } from './projectmanagement/add-projects/project-attributes/project-attributes.component';
import { AddTimelineComponent } from './projectmanagement/add-projects/addtimeline/addtimeline.component';
import { FinanceManagementComponent } from './projectmanagement/add-projects/finance-management/finance-management.component';
import { ManageFinanceComponent } from './projectmanagement/add-projects/manage-finance/manage-finance.component';
import { StandardprojectComponent } from './projectmanagement/add-projects/addtimeline/standardproject/standardproject.component';
// tslint:disable-next-line: max-line-length
import { NonStandardprojectComponent } from './projectmanagement/add-projects/addtimeline/non-standardproject/non-standardproject.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PMResolve } from './PMResolve';
import { PMMainResolve } from './PMMainResolve';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TimelineModule } from '../timeline/timeline.module';
import { CustomMaterialModule } from '../shared/material.module';
import { TaskAllocationModule } from '../task-allocation/task-allocation.module';
import { ProjectTimelineComponent } from './projectmanagement/all-projects/project-timeline/project-timeline.component';
import { ViewUploadDocumentModule } from '../shared/view-upload-document-dialog/view-upload-document.module';
import { ViewUploadDocumentDialogComponent } from '../shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { UserCapacityModule } from '../shared/usercapacity/usercapacity.module';
import { UsercapacityComponent } from '../shared/usercapacity/usercapacity.component';
import { CsFinanceAuditDialogComponent } from './projectmanagement/all-projects/cs-finance-audit-dialog/cs-finance-audit-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuditProjectDialogComponent } from './projectmanagement/all-projects/audit-project-dialog/audit-project-dialog.component';
import { InvoiceLineitemsComponent } from './projectmanagement/all-projects/invoice-lineitems/invoice-lineitems.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { PreStackAllocationModule } from '../shared/pre-stack-allocation/pre-stack-allocation.module';
import { PreStackAllocationComponent } from '../shared/pre-stack-allocation/pre-stack-allocation.component';
import { AddReduceSowbudgetDialogComponent } from './projectmanagement/sow/add-reduce-sowbudget-dialog/add-reduce-sowbudget-dialog.component';
import { SqmsModule } from '../shared/sqms/sqms.module';
import { CdpfComponent } from '../shared/sqms/cdpf/cdpf.component';
import { JournalConferenceDetailsModule } from '../shared/journal-conference-details/journal-conference-details.module';
import { JournalConferenceDetailsComponent } from '../shared/journal-conference-details/journal-conference-details.component';
import { ProjectBudgetBreakupComponent } from './projectmanagement/all-projects/project-budget-breakup/project-budget-breakup.component';
import { CmDeliveyViewComponent } from './projectmanagement/add-projects/addtimeline/cm-delivey-view/cm-delivey-view.component';
import { PoChangeDialogComponent } from './projectmanagement/add-projects/manage-finance/po-change-dialog/po-change-dialog.component';
import { SharedModule } from '../shared/shared.module';

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
    ProjectTimelineComponent,
    CsFinanceAuditDialogComponent,
    AuditProjectDialogComponent,
    InvoiceLineitemsComponent,
    AddReduceSowbudgetDialogComponent,
    ProjectBudgetBreakupComponent,
    CmDeliveyViewComponent,
    PoChangeDialogComponent],
  imports: [
    SharedModule,
    CommonModule,
    ViewUploadDocumentModule,
    ProjectManagementRoutingModule,
    PrimengModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    ReactiveFormsModule,
    TimelineModule,
    CustomMaterialModule,
    TaskAllocationModule,
    UserCapacityModule,
    FlexLayoutModule,
    PreStackAllocationModule,
    SqmsModule,
    JournalConferenceDetailsModule
  ],
  exports: [
    AllProjectsComponent
  ],
  providers: [
    DatePipe,
    PMResolve,
    PMMainResolve,
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
  ],
  entryComponents: [
    ProjectAttributesComponent,
    ManageFinanceComponent,
    AddProjectsComponent,
    ProjectTimelineComponent,
    ViewUploadDocumentDialogComponent,
    UsercapacityComponent,
    CsFinanceAuditDialogComponent,
    AuditProjectDialogComponent,
    InvoiceLineitemsComponent,
    ConfirmationDialogComponent,
    PreStackAllocationComponent,
    AddReduceSowbudgetDialogComponent,
    CdpfComponent,
    JournalConferenceDetailsComponent,
    ProjectBudgetBreakupComponent,
    CmDeliveyViewComponent,
    PoChangeDialogComponent
  ]
})
export class ProjectmanagementModule { }
