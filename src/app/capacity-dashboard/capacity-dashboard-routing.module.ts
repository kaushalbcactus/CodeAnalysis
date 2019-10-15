import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CapacityDashboardComponent } from './capacity-dashboard.component';

const routes: Routes = [
  { path: '', component: CapacityDashboardComponent },
  { path: 'capacityDashboard', component: CapacityDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
  declarations: [],

})
export class CapacityDashboardRoutingModule { }

