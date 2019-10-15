import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CaComponent } from './ca.component';
import { UnallocatedAllocatedTasksComponent } from './unallocated-allocated-tasks/unallocated-allocated-tasks.component';
const appRoutes: Routes = [
  {
    path: '',
    component: CaComponent,
    children: [
      { path: '', redirectTo: 'unallocated', pathMatch: 'prefix' },
      {
        path: 'unallocated', component: UnallocatedAllocatedTasksComponent,
        runGuardsAndResolvers: 'always', data: { type: 'unallocated' }
      },
      {
        path: 'allocated', component: UnallocatedAllocatedTasksComponent,
        runGuardsAndResolvers: 'always', data: { type: 'allocated' }
      },
    ]
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
