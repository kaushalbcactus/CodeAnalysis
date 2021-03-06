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
import { FdAuthGuard } from './fd-AuthGuard/fd-auth.guard';

const routes: Routes = [
    // { path: '', component: FinanceDashboardComponent },
    {
        path: '',
        component: FinanceDashboardComponent,
        canActivate: [FdAuthGuard],
        children: [
            { path: '', redirectTo: 'expenditure', pathMatch: 'full', loadChildren: () => import('./finance-dashboard.module').then(m => m.FinanceDashboardModule) },

            {
                path: 'expenditure',
                component: ExpenditureComponent,
                canActivateChild: [FdAuthGuard],
                children: [
                    { path: '', redirectTo: 'pending', pathMatch: 'full' },
                    { path: 'pending', component: PendingExpenseComponent },
                    { path: 'cancelled-reject', component: RejectExpenseComponent, },
                    { path: 'approvedBillable', component: ApprovedBillableComponent },
                    { path: 'approvedNonBillable', component: ApprovedNonBillableComponent },
                ]
            },

            // Scheduled
            { path: '', redirectTo: 'scheduled', pathMatch: 'full',  loadChildren: () => import('./finance-dashboard.module').then(m => m.FinanceDashboardModule) },
            {
                path: 'scheduled',
                component: ScheduledComponent,
                canActivateChild: [FdAuthGuard],
                children: [
                    { path: '', redirectTo: 'deliverablebased-fte', pathMatch: 'full' },
                    { path: 'deliverablebased-fte', component: DeliverableBasedComponent },
                    { path: 'hourly-based', component: HourlyBasedComponent },
                    { path: 'oop', component: OopComponent },
                    // { path: 'approvedNonBillable', component: ApprovedNonBillableComponent },
                ]
            },

            { path: 'confirmed', component: ConfirmedComponent, canActivate: [FdAuthGuard], },
            { path: 'proforma', component: ProformaComponent, canActivate: [FdAuthGuard], },
            { path: 'outstanding-invoices', component: OutstandingInvoicesComponent, canActivate: [FdAuthGuard], },
            { path: 'paid-invoices', component: PaidInvoicesComponent, canActivate: [FdAuthGuard], },

        ],
        resolve: { fdData: FDResolve },
        runGuardsAndResolvers: 'always'
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FinanceDashboardRoutingModule { }
