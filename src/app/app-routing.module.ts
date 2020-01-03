import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { FdAuthGuard } from './finance-dashboard/fd-AuthGuard/fd-auth.guard';
import { AdminAuthGuard } from './admin/auth/admin-auth.guard';
import { QmsAuthGuard } from './qms/auth/qms-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'accessleveldashboard', loadChildren: () => import('./accessleveldashboard/accessleveldashboard.module').then(m => m.AccessleveldashboardModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) , data: {title: 'Medcom | Dashboard'}},
  { path: 'pubSupport', loadChildren: () => import('./pubsupport/pubsupport.module').then(m => m.PubsupportModule) , data: {title: 'Medcom | Publication Support'},},
  { path: 'admin', canLoad: [AdminAuthGuard], loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) , data: {title: 'Medcom | Admin'}},
  { path: 'projectMgmt', canLoad: [AuthGuard], loadChildren: () => import('./projectmanagement/projectmanagement.module').then(m => m.ProjectmanagementModule) , data: {title: 'Medcom | Project Management'},},
  { path: 'myDashboard', loadChildren: () => import('./my-dashboard/my-dashboard.module').then(m => m.MyDashboardModule) , data: {title: 'Medcom | My Dashboard'}},
  { path: 'taskAllocation', canLoad: [AuthGuard], loadChildren: () => import('./task-allocation/task-allocation.module').then(m => m.TaskAllocationModule) , data: {title: 'Medcom | Task Allocation'}},
  { path: 'financeDashboard', canLoad: [FdAuthGuard], loadChildren: () => import('./finance-dashboard/finance-dashboard.module').then(m => m.FinanceDashboardModule) , data: {title: 'Medcom | Finance Dashboard'}},
  { path: 'qms', canLoad: [QmsAuthGuard], loadChildren: () => import('./qms/qms.module').then(m => m.QmsModule) , data: {title: 'Medcom | QMS'} },
  { path: 'centralallocation', loadChildren: () => import('./ca/ca.module').then(m => m.CAModule) , data: {title: 'Medcom | Central Allocation'}},
  { path: 'capacityDashboard', loadChildren: () => import('./capacity-dashboard/capacity-dashboard.module').then(m => m.CapacityDashboardModule) , data: {title: 'Medcom | Capacity Dashboard'} },
  { path: 'leaveCalendar', loadChildren: () => import('./leave-calendar/leave-calendar.module').then(m => m.LeaveCalendarModule) , data: {title: 'Medcom | Leave Calendar'}},
  { path: '**', redirectTo: '/404' },
  { path: '404', component: PageNotFoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
