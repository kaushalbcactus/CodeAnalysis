import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UnallocatedComponent } from './ca/unallocated/unallocated.component';
import { AllocatedComponent } from './ca/allocated/allocated.component';
import { CaComponent } from './ca/ca.component';
const appRoutes: Routes = [
  {
    path: '',
    component: CaComponent,
    children: [
      { path: '', redirectTo: 'unallocated', pathMatch: 'prefix' },
      { path: 'unallocated', component: UnallocatedComponent,  runGuardsAndResolvers: 'always' },
      { path: 'allocated', component: AllocatedComponent, runGuardsAndResolvers: 'always' },
    ]
  }
  // { path: '', redirectTo: 'ca', pathMatch: 'full'},
  // { path: 'unallocated', component: UnallocatedComponent},
  // { path: 'allocated', component: AllocatedComponent}
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
