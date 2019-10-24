import { NgModule } from '@angular/core';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CommonModule } from '@angular/common';
import { UsercapacityComponent } from './usercapacity.component';
import { MilestoneTasksDialogComponent } from './milestone-tasks-dialog/milestone-tasks-dialog.component';

@NgModule({
  declarations: [UsercapacityComponent, MilestoneTasksDialogComponent],
  imports: [
    CommonModule,
    PrimengModule,

  ],
  exports: [
    UsercapacityComponent
  ],
  entryComponents: [MilestoneTasksDialogComponent]
})
export class UserCapacityModule {
}
