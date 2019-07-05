import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MyDashboardComponent } from './my-dashboard.component';
import { MyTimelineComponent } from './my-timeline/my-timeline.component';
import { SearchProjectsComponent } from './search-projects/search-projects.component';
import { MyCurrentCompletedTasksComponent } from './my-current-completed-tasks/my-current-completed-tasks.component';
import { SOWComponent } from '../projectmanagement/projectmanagement/sow/sow.component';
import { PMResolve } from '../projectmanagement/PMResolve';
// import { AllProjectsComponent } from '../projectmanagement/projectmanagement/all-projects/all-projects.component';
import { MyprojectsComponent } from './myprojects/myprojects.component';

const routes: Routes = [

  {
    path: '', component: MyDashboardComponent,
    children: [
      { path: '', redirectTo: 'my-current-tasks', pathMatch: 'full' },
      { path: 'my-current-tasks', component: MyCurrentCompletedTasksComponent, data: { type: 'MyCurrentTask' } },
      { path: 'my-timeline', component: MyTimelineComponent },
      { path: 'my-projects', component: MyprojectsComponent, resolve: { pmData: PMResolve } },
      { path: 'my-sow', component: SOWComponent, resolve: { pmData: PMResolve } },
      { path: 'my-completed-tasks', component: MyCurrentCompletedTasksComponent, data: { type: 'MyCompletedTask' } },
      { path: 'search-projects', component: SearchProjectsComponent },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
  declarations: [],

})
export class MyDashoardRoutingModule { }


