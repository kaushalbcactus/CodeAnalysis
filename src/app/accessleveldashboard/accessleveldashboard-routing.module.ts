import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessleveldashboardComponent } from './accessleveldashboard.component';


const routes: Routes = [
  {
    path: '', component: AccessleveldashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessLevelDashboardRoutingModule { }
