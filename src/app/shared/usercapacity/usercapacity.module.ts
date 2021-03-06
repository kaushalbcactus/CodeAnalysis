import { NgModule } from '@angular/core';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CommonModule } from '@angular/common';
import { UsercapacityComponent } from './usercapacity.component';
import { MilestoneTasksDialogComponent } from './milestone-tasks-dialog/milestone-tasks-dialog.component';
import { CapacityTasksComponent } from './capacity-tasks/capacity-tasks.component';

@NgModule({
  declarations: [UsercapacityComponent, MilestoneTasksDialogComponent, CapacityTasksComponent],
  imports: [
    CommonModule,
    PrimengModule,

  ],
  exports: [
    UsercapacityComponent,
    CapacityTasksComponent
  ],
  entryComponents: [MilestoneTasksDialogComponent],
})
export class UserCapacityModule {
}
