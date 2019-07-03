import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { ExpenditureComponent } from './Expenditure/expenditure.component';
import { PendingExpenseComponent } from './Expenditure/pending-expense/pending-expense.component';
import { RejectExpenseComponent } from './Expenditure/reject-expense/reject-expense.component';
import { ApprovedBillableComponent } from './Expenditure/approved-billable/approved-billable.component';
import { ApprovedNonBillableComponent } from './Expenditure/approved-non-billable/approved-non-billable.component';
import { FDResolve } from './fd-resolve';
import { ScheduledComponent } from './Scheduled/scheduled.component';
import { HourlyBasedComponent } from './Scheduled/hourly-based/hourly-based.component';
import { DeliverableBasedComponent } from './Scheduled/deliverable-based/deliverable-based.component';
import { OopComponent } from './Scheduled/oop/oop.component';
import { ConfirmedComponent } from './Confirmed/confirmed/confirmed.component';
import { ProformaComponent } from './Proforma/proforma/proforma.component';
import { OutstandingInvoicesComponent } from './Outstanding-Invoices/outstanding-invoices/outstanding-invoices.component';
import { PaidInvoicesComponent } from './Paid-Invoices/paid-invoices/paid-invoices.component';

const routes: Routes = [
    // { path: '', component: FinanceDashboardComponent },
    {
        path: '',
        component: FinanceDashboardComponent,
        children: [
            { path: '', redirectTo: 'expenditure', pathMatch: 'full' },
            {
                path: 'expenditure',
                component: ExpenditureComponent,
                children: [
                    { path: '', redirectTo: 'pending', pathMatch: 'full' },
                    { path: 'pending', component: PendingExpenseComponent, resolve: { fdData: FDResolve } },
                    { path: 'cancelled-reject', component: RejectExpenseComponent, resolve: { fdData: FDResolve } },
                    { path: 'approvedBillable', component: ApprovedBillableComponent, resolve: { fdData: FDResolve } },
                    { path: 'approvedNonBillable', component: ApprovedNonBillableComponent, resolve: { fdData: FDResolve } },
                ]
            },

            // Scheduled
            { path: '', redirectTo: 'scheduled', pathMatch: 'full' },
            {
                path: 'scheduled',
                component: ScheduledComponent,
                children: [
                    { path: '', redirectTo: 'deliverable-based', pathMatch: 'full' },
                    { path: 'deliverable-based', component: DeliverableBasedComponent, resolve: { fdData: FDResolve } },
                    { path: 'hourly-based', component: HourlyBasedComponent, resolve: { fdData: FDResolve } },
                    { path: 'oop', component: OopComponent, resolve: { fdData: FDResolve } },
                    // { path: 'approvedNonBillable', component: ApprovedNonBillableComponent, resolve: { fdData: FDResolve } },
                ]
            },

            { path: 'confirmed', component: ConfirmedComponent, resolve: { fdData: FDResolve } },
            { path: 'proforma', component: ProformaComponent, resolve: { fdData: FDResolve } },
            { path: 'outstanding-invoices', component: OutstandingInvoicesComponent, resolve: { fdData: FDResolve } },
            { path: 'paid-invoices', component: PaidInvoicesComponent, resolve: { fdData: FDResolve } },

        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinanceDashboardRoutingModule { }
