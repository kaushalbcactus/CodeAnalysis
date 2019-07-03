

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FinanceDashboardRoutingModule } from './finance-dashboard-routing.module';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { PrimengModule } from '../primeng/primeng.module';
import { SharedModule } from '../shared/shared.module';
import { RejectExpenseComponent } from './Expenditure/reject-expense/reject-expense.component';
import { ApprovedNonBillableComponent } from './Expenditure/approved-non-billable/approved-non-billable.component';
import { ApprovedBillableComponent } from './Expenditure/approved-billable/approved-billable.component';
import { PendingExpenseComponent } from './Expenditure/pending-expense/pending-expense.component';
import { DeliverableBasedComponent } from './Scheduled/deliverable-based/deliverable-based.component';
import { HourlyBasedComponent } from './Scheduled/hourly-based/hourly-based.component';
import { OopComponent } from './Scheduled/oop/oop.component';
import { ConfirmedComponent } from './Confirmed/confirmed/confirmed.component';
import { ProformaComponent } from './Proforma/proforma/proforma.component';
import { OutstandingInvoicesComponent } from './Outstanding-Invoices/outstanding-invoices/outstanding-invoices.component';
import { PaidInvoicesComponent } from './Paid-Invoices/paid-invoices/paid-invoices.component';
import { SaveYourViewComponent } from './Paid-Invoices/save-your-view/save-your-view.component';
import { TimelineModule } from './../timeline/timeline.module';
import { ExpenditureComponent } from './Expenditure/expenditure.component';
import { FDResolve } from "./fd-resolve";
import { ScheduledComponent } from './Scheduled/scheduled.component';
import { SectionEditorComponent } from './PDFEditing/section-editor/section-editor.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditorComponent } from './PDFEditing/editor/editor.component';
import { TableAttributeComponent } from './Expenditure/table-attribute/table-attribute.component';
import { IliTableAttributeComponent } from './Scheduled/ili-table-attribute/ili-table-attribute.component';
import { PfTableAttributeComponent } from './Scheduled/pf-table-attribute/pf-table-attribute.component';
import { ProTableAttributeComponent } from './Proforma/pro-table-attribute/pro-table-attribute.component';
import { InvTableAttributeComponent } from './Outstanding-Invoices/inv-table-attribute/inv-table-attribute.component';

@NgModule({
  declarations: [
    FinanceDashboardComponent,
    RejectExpenseComponent,
    ApprovedNonBillableComponent,
    ApprovedBillableComponent,
    PendingExpenseComponent,
    DeliverableBasedComponent,
    HourlyBasedComponent,
    OopComponent,
    ConfirmedComponent,
    ProformaComponent,
    OutstandingInvoicesComponent,
    PaidInvoicesComponent,
    SaveYourViewComponent,
    ExpenditureComponent,
    ScheduledComponent,
    SectionEditorComponent,
    TableAttributeComponent,
    EditorComponent,
    IliTableAttributeComponent,
    PfTableAttributeComponent,
    ProTableAttributeComponent,
    InvTableAttributeComponent,
  ],
  imports: [
    CommonModule,
    FinanceDashboardRoutingModule,
    PrimengModule,
    SharedModule,
    TimelineModule,
    CKEditorModule
  ],
  entryComponents: [
    RejectExpenseComponent,
    ApprovedNonBillableComponent,
    ApprovedBillableComponent,
    PendingExpenseComponent,
    DeliverableBasedComponent,
    HourlyBasedComponent,
    OopComponent,
    ConfirmedComponent,
    ProformaComponent,
    OutstandingInvoicesComponent,
    PaidInvoicesComponent,
    SaveYourViewComponent,
    TableAttributeComponent,
    EditorComponent
  ],
  providers: [
    FDResolve,
    EditorComponent
  ]
})
export class FinanceDashboardModule { }
