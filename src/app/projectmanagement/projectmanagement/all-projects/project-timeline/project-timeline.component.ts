import { Component, OnInit } from '@angular/core';
import { TimelineComponent } from 'src/app/task-allocation/timeline/timeline.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
@Component({
  selector: 'app-project-timeline',
  templateUrl: './project-timeline.component.html',
  styleUrls: ['./project-timeline.component.css']
})
export class ProjectTimelineComponent implements OnInit {

  constructor(public config: DynamicDialogConfig) { }
  ProjectPopupDetails: any;
  ngOnInit() {
    this.ProjectPopupDetails = this.config.data.projectObj;
  }

}
