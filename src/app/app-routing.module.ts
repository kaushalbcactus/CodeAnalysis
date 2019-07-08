import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
  { path: 'pubSupport', loadChildren: './pubsupport/pubsupport.module#PubsupportModule' },
  { path: 'projectMgmt', loadChildren: './projectmanagement/projectmanagement.module#ProjectmanagementModule' },
  { path: 'myDashboard', loadChildren: './my-dashboard/my-dashboard.module#MyDashboardModule' },
  { path: 'taskAllocation', loadChildren: './task-allocation/task-allocation.module#TaskAllocationModule' },
  { path: 'financeDashboard', loadChildren: './finance-dashboard/finance-dashboard.module#FinanceDashboardModule' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
