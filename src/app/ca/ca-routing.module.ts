import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
// import { CaComponent } from './ca.component';
import { UnallocatedAllocatedTasksComponent } from './unallocated-allocated-tasks/unallocated-allocated-tasks.component';
const appRoutes: Routes = [
  {
    path: '',
    component: UnallocatedAllocatedTasksComponent,
    runGuardsAndResolvers: 'always',
  }
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes)
  ],
  exports: [RouterModule]
})
export class CaRoutingModule { }
