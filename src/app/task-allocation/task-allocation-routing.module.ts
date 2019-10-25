import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TaskAllocationComponent } from './task-allocation.component';


const routes: Routes = [
  { path: '', component: TaskAllocationComponent },
  { path: 'taskallocation', component: TaskAllocationComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes),CommonModule],
  exports: [RouterModule],
  declarations: [],
 
})
export class TaskAllocationRoutingModule { }
