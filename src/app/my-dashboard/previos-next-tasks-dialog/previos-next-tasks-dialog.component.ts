import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-previos-next-tasks-dialog',
  templateUrl: './previos-next-tasks-dialog.component.html',
  styleUrls: ['./previos-next-tasks-dialog.component.css']
})
export class PreviosNextTasksDialogComponent implements OnInit {
  data: any;
  modalloaderenable: boolean;
  tasks: any;

  constructor(
    public config: DynamicDialogConfig
  ) { }

  ngOnInit() {
    this.data = this.config.data;
    if (this.data !== undefined) {
      const localTasks = this.data.allTasks;
      localTasks.sort((a, b) => <any>new Date(a.StartDate) - <any>new Date(b.StartDate));
      this.tasks = localTasks;
      this.modalloaderenable = true;
    }

  }


}
