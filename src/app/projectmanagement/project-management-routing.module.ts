import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendToClientComponent } from './projectmanagement/send-to-client/send-to-client.component';
import { ClientReviewComponent } from './projectmanagement/client-review/client-review.component';
import { InactiveComponent } from './projectmanagement/inactive/inactive.component';
import { ProjectmanagementComponent } from './projectmanagement/projectmanagement.component';
import { AllProjectsComponent } from './projectmanagement/all-projects/all-projects.component';
import { SOWComponent } from './projectmanagement/sow/sow.component';
import { PendingAllocationComponent } from './projectmanagement/pending-allocation/pending-allocation.component';
import { PMResolve } from './PMResolve';
import { PMMainResolve } from './PMMainResolve';
import { CommunicationComponent } from './projectmanagement/communication/communication.component';

const appRoutes: Routes = [
{
  path: '',
  component: ProjectmanagementComponent,
  resolve: {pmData: PMMainResolve},
  children: [
    {path: '', redirectTo: 'allSOW' , pathMatch: 'prefix' },
    {path: 'allSOW', component: SOWComponent, resolve: { pmData: PMResolve } },
    {path: 'allProjects', component: AllProjectsComponent, resolve: { pmData: PMResolve }},
    {path: 'sendToClient', component: SendToClientComponent, resolve: { pmData: PMResolve }},
    {path: 'clientReview', component: ClientReviewComponent, resolve: { pmData: PMResolve }},
    {path: 'pendingAllocation', component: PendingAllocationComponent, resolve: { pmData: PMResolve }},
    {path: 'inActive', component: InactiveComponent, resolve: { pmData: PMResolve }},
    {path: 'communication', component: CommunicationComponent}
  ]
}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ProjectManagementRoutingModule { }
