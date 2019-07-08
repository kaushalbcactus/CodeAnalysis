import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TaskAllocationComponent } from './task-allocation.component';


const routes: Routes = [
  { path: '', component: TaskAllocationComponent },
  { path: 'taskallocation', component: TaskAllocationComponent }


//   const consentRoutes: Routes = [
//     { path: 'archived-list', component: ArchivedConsentListPageComponent },
//     { path: 'list-all', component: ConsentListPageComponent },
//     { path: 'add-new', component: AddConsentPageComponent },
//     { path: 'edit/:id', component: UpdateConsentPageComponent },
//     { path: 'detail/:id', component: ConsentDetailsPageComponent },
//     { path: 'status-detail/:id', component: ConsentStatusDetailsPageComponent },
//     { path: 'assign', component: AssignAdvisorPageComponent }
// ];
  
];


@NgModule({
  imports: [RouterModule.forChild(routes),CommonModule],
  exports: [RouterModule],
  declarations: [],
 
})
export class TaskAllocationRoutingModule { }
