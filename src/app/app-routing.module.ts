import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { FdAuthGuard } from './finance-dashboard/fd-AuthGuard/fd-auth.guard';
import { AdminAuthGuard } from './admin/auth/admin-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'accessleveldashboard', loadChildren: './accessleveldashboard/accessleveldashboard.module#AccessleveldashboardModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
  { path: 'pubSupport', loadChildren: './pubsupport/pubsupport.module#PubsupportModule' },
  { path: 'projectMgmt', loadChildren: './projectmanagement/projectmanagement.module#ProjectmanagementModule' },
  { path: 'myDashboard', loadChildren: './my-dashboard/my-dashboard.module#MyDashboardModule' },
  { path: 'taskAllocation', loadChildren: './task-allocation/task-allocation.module#TaskAllocationModule' },
  { path: 'financeDashboard', loadChildren: './finance-dashboard/finance-dashboard.module#FinanceDashboardModule' },
  { path: 'admin', canLoad: [AdminAuthGuard], loadChildren: './admin/admin.module#AdminModule' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
