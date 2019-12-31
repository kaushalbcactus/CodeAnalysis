import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent
  },
  {
    path: 'list', component: ListComponent
  },
  // { path: 'pubSupport', loadChildren: '../pubsupport/pubsupport.module#PubsupportModule' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
