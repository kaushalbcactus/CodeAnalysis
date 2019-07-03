import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PubsupportComponent } from './pubsupport/pubsupport.component';

const routes: Routes = [
  // { path: 'dashboard', redirectTo: 'pubSupport', pathMatch: 'full' },
  { path: '', component: PubsupportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PubsupportRoutingModule { }
