import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { MilestoneTasksDialogComponent } from '../milestone-tasks-dialog/milestone-tasks-dialog.component';
import { DialogService } from 'primeng';
import { TaskAllocationConstantsService } from 'src/app/task-allocation/services/task-allocation-constants.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-capacity-tasks',
  templateUrl: './capacity-tasks.component.html',
  styleUrls: ['./capacity-tasks.component.css'],
  providers: [DialogService]
})
export class CapacityTasksComponent implements OnInit {
  @Input() tasks: any;
  @Input() disableCamera: boolean;
  @Input() componentName: string;
  @Output() collapse = new EventEmitter<boolean>();

  @Output() updateBlocking = new EventEmitter();
  today: Date;
  constructor(public globalService: GlobalService, public allocationConstant: TaskAllocationConstantsService,
    public capacityDialogService: DialogService, public globalConstant: ConstantsService,
    public spServices: SPOperationService, public commonService: CommonService,
    public datepipe: DatePipe) { }

  async ngOnInit() {
    this.today = new Date(this.datepipe.transform(new Date(), 'MM/dd/yyyy'));
    this.disableCamera = this.disableCamera;
    this.componentName = this.componentName;
    await this.updateShortTitle(this.tasks);
    this.tasks = [...this.tasks];
  }

  async updateShortTitle(tasks) {
    if (tasks) {
      const projectCodes = this.getProjectCodes(tasks);
      const projectInformation = await this.getProjectShortTitle(projectCodes, []);
      tasks.forEach(task => {
        const project = projectInformation.find(p => p.ProjectCode === task.projectCode);
        task.shortTitle = project ? project.WBJID : '';
      });
    }
  }

  goToProjectDetails(data: any): string {
    return this.globalService.url + '/taskAllocation?ProjectCode=' + data.projectCode;
  }

  collapseTable(param) {
    this.collapse.emit(param);
  }

  UpdateBlocking(rowData, type) {
    this.updateBlocking.emit({
      task: rowData,
      type: type
    });
  }

  getMilestoneTasks(task) {
    const ref = this.capacityDialogService.open(MilestoneTasksDialogComponent, {
      data: {
        task
      },
      header: task.title,
      width: '90vw',
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
    });
    ref.onClose.subscribe((tasks: any) => {
    });
  }

  getProjectCodes(tasks) {
    if (tasks) {
      const projectCodes = tasks.map(task => task.projectCode);
      const uniqueProjectCodes = [...new Set(projectCodes)];
      return uniqueProjectCodes;
    }
    return [];
  }

  async getProjectShortTitle(projectCodes, existingProjectInfo) {
    const batchUrl = [];
    let projectInformation = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    projectCodes.forEach(projectCode => {
      const existingProject = existingProjectInfo.find(p => p.ProjectCode === projectCode);
      if (existingProject) {
        projectInformation.push(existingProject);
      } else {
        const projObj = Object.assign({}, options);
        const projFilter = Object.assign({}, this.allocationConstant.taskallocationComponent.projectShortTitle);
        projFilter.filter = projFilter.filter.replace('{{projectCode}}', projectCode);
        projObj.url = this.spServices.getReadURL(this.globalConstant.listNames.ProjectInformation.name, projFilter);
        projObj.listName = this.globalConstant.listNames.ProjectInformation.name;
        projObj.type = 'GET';
        batchUrl.push(projObj);
      }
    });
    this.commonService.SetNewrelic('Allocation', 'Conflict Check component', 'GetProjectShortTitle');
    const arrResults = await this.spServices.executeBatch(batchUrl);
    const projects = arrResults.length > 0 ? arrResults.map(a => a.retItems.length ? a.retItems[0] : []) : [];
    projectInformation = [...projectInformation, ...projects];
    return projectInformation;
  }


}
