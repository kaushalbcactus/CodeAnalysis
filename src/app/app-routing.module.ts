import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { FdAuthGuard } from './finance-dashboard/fd-AuthGuard/fd-auth.guard';
import { AdminAuthGuard } from './admin/auth/admin-auth.guard';
import { QmsAuthGuard } from './qms/auth/qms-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'accessleveldashboard', loadChildren: './accessleveldashboard/accessleveldashboard.module#AccessleveldashboardModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' , data: {title: 'Medcom | Dashboard'}},
  { path: 'pubSupport', loadChildren: './pubsupport/pubsupport.module#PubsupportModule' , data: {title: 'Medcom | Publication Support'},},
  { path: 'admin', canLoad: [AdminAuthGuard], loadChildren: './admin/admin.module#AdminModule' , data: {title: 'Medcom | Admin'}},
  { path: 'projectMgmt', canLoad: [AuthGuard], loadChildren: './projectmanagement/projectmanagement.module#ProjectmanagementModule' , data: {title: 'Medcom | Project Management'},},
  { path: 'myDashboard', loadChildren: './my-dashboard/my-dashboard.module#MyDashboardModule' , data: {title: 'Medcom | My Dashboard'}},
  { path: 'taskAllocation', canLoad: [AuthGuard], loadChildren: './task-allocation/task-allocation.module#TaskAllocationModule' , data: {title: 'Medcom | Task Allocation'}},
  { path: 'financeDashboard', canLoad: [FdAuthGuard], loadChildren: './finance-dashboard/finance-dashboard.module#FinanceDashboardModule' , data: {title: 'Medcom | Finance Dashboard'}},
  { path: 'qms', canLoad: [QmsAuthGuard], loadChildren: './qms/qms.module#QmsModule' , data: {title: 'Medcom | QMS'} },
  { path: 'centralallocation', loadChildren: './ca/ca.module#CAModule' , data: {title: 'Medcom | Central Allocation'}},
  { path: 'capacityDashboard', loadChildren: './capacity-dashboard/capacity-dashboard.module#CapacityDashboardModule' , data: {title: 'Medcom | Capacity Dashboard'} },
  { path: 'leaveCalendar', loadChildren: './leave-calendar/leave-calendar.module#LeaveCalendarModule' , data: {title: 'Medcom | Leave Calendar'}},
  { path: '**', redirectTo: '/404' },
  { path: '404', component: PageNotFoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
