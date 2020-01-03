import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-milestone-tasks-dialog',
  templateUrl: './milestone-tasks-dialog.component.html',
  styleUrls: ['./milestone-tasks-dialog.component.css']
})
export class MilestoneTasksDialogComponent implements OnInit {
  selectedTask: any;

  constructor(public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.selectedTask = this.config.data.task;
  }

}
