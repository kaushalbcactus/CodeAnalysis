import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter, AfterViewChecked } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { IConflictTask, IPopupConflictData, IConflictResource, IQueryOptions } from './interface/conflict-allocation';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationCommonService } from '../../task-allocation/services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { TaskAllocationConstantsService } from '../../task-allocation/services/task-allocation-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { UserCapacitycommonService } from '../usercapacity/service/user-capacitycommon.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-conflict-allocation',
  templateUrl: './conflict-allocation.component.html',
  styleUrls: ['./conflict-allocation.component.css'],
  providers: [UsercapacityComponent, DialogService]
})
export class ConflictAllocationComponent implements OnInit, AfterViewChecked {
  cols = [];
  public activeIndex = -1;
  public conflicTasks: any;
  public node: TreeNode;
  public milestoneData: TreeNode[];
  public projectCodes: string[];
  public hideLoader: boolean;
  public allResources: any;
  @ViewChild('UserCapacity', { static: false }) userCapacity: UsercapacityComponent;
  constructor(public popupData: DynamicDialogConfig, public globalService: GlobalService,
    public popupConfig: DynamicDialogRef, public allocationCommon: TaskAllocationCommonService,
    public commonService: CommonService, private usercapacityComponent: UsercapacityComponent,
    private allocationConstant: TaskAllocationConstantsService, private spServices: SPOperationService,
    private globalConstant: ConstantsService, private userCapacityCommon: UserCapacitycommonService) { }
  public conflictResolved = false;
  ngOnInit() {
    this.cols = [
      { field: 'allocatedHrs', header: 'Hours Allocated' },
      { field: 'allocationDate', header: 'Dates' },
      { field: 'Project Code', header: 'Project Code' },
      { field: 'shortTitle', header: 'Short Title' },
      { field: 'allocatedhrs', header: 'Hrs allocated with 10 hrs' }
    ];
    this.conflicTasks = this.popupData.data.conflictDetail ? this.popupData.data.conflictDetail : [];
    this.node = this.popupData.data.node ? this.popupData.data.node : {};
    this.milestoneData = this.popupData.data.originalData ? this.popupData.data.originalData : {};
    this.projectCodes = this.popupData.data.project ? this.popupData.data.project : [];
    this.allResources = this.popupData.data.resources ? this.popupData.data.resources : [];
    this.popupData.data = null;
    this.hideLoader = true;
  }

  ngAfterViewChecked() {
    this.activeIndex = 0;
  }

  goToProjectDetails(data: any): string {
    if (this.projectCodes.indexOf(data.projectCode) < 0) {
      return this.globalService.url + '/taskAllocation?ProjectCode=' + data.projectCode;
    }
    return '';
  }

  save(): void {
    this.hideLoader = false;
    // setTimeout(() => {
    this.conflictResolved = this.conflicTasks.filter(t => t.tasks.length).length > 0 ? false : true;
    const obj: IPopupConflictData = { conflictResolved: this.conflictResolved, action: 'save' };
    this.popupConfig.close(obj);
    this.hideLoader = true;
    // }, 300);
  }

  close(): void {
    // setTimeout(() => {
    const obj: IPopupConflictData = { conflictResolved: this.conflictResolved, action: 'close' };
    this.popupConfig.close(obj);
    // }, 300);
  }

  async refresh(): Promise<void> {
    this.hideLoader = false;
    // setTimeout(async () => {
    if (this.allResources.length) {
      this.conflicTasks = await this.bindConflictDetails(null, [], this.milestoneData, this.allResources);
    } else {
      // tslint:disable-next-line: max-line-length
      this.conflicTasks = await this.bindConflictDetails(this.node, this.milestoneData, [], this.globalService.oTaskAllocation.oResources);
    }
    this.hideLoader = true;
    // }, 100);
  }

  getAllTasks(milSubMil, originalData) {
    let allTasks = [];
    if (milSubMil) {
      allTasks = this.allocationCommon.getTasksFromMilestones(milSubMil, false, originalData, false);
    } else {
      const currentMilestone = originalData.find(e => e.data.type === 'milestone'
        && e.data.isCurrent === true);
      if (currentMilestone) {
        if (currentMilestone.data.subMilestonePresent) {
          currentMilestone.children.forEach(element => {
            if (element.data.status === 'In Progress') {
              allTasks = [...allTasks, ...this.allocationCommon.getTasksFromMilestones(element, false, originalData, false)];
            }
          });
        } else {
          allTasks = this.allocationCommon.getTasksFromMilestones(currentMilestone, false, originalData, false);
        }
      }
    }
    allTasks = allTasks.filter(e => e.itemType !== 'Client Review' && e.itemType !== 'Send to client' &&
      e.slotType !== 'Slot' && e.AssignedTo && e.AssignedTo.ID && e.AssignedTo.ID !== -1);
    return allTasks;
  }

  // tslint:disable-next-line: max-line-length
  async bindConflictDetails(milSubMil: TreeNode, originalData: TreeNode[], arrTasks: any[], allResources: any[]): Promise<IConflictResource[]> {
    const conflictDetails = await this.checkConflictsAllocations(milSubMil, originalData, arrTasks, allResources);
    conflictDetails.forEach(resource => {
      const allDates = resource.tasks.map(t => t.allocation);
      resource.userCapacity = this.recalculateUserCapacity(resource.user, allDates);
    });
    return conflictDetails;
  }

  // tslint:disable-next-line: max-line-length
  async checkConflictsAllocations(milSubMil: TreeNode, originalData: TreeNode[], arrTasks: any[], allResources: any[]): Promise<IConflictResource[]> {
    let allTasks = [];
    const conflictDetails = [];
    let projectInformation = [];
    allTasks = arrTasks.length ? arrTasks : this.getAllTasks(milSubMil, originalData);
    let capacity;
    for (const element of allTasks) {
      capacity = await this.getResourceCapacity(element, milSubMil, allResources);
      for (const user of capacity.arrUserDetails) {
        // let allDates = [];
        const maxHrs = +user.maxHrs + 2;
        const oExistingResource: IConflictResource = conflictDetails.length ? conflictDetails.find(ct => ct.user.uid === user.uid) : {};
        this.updateUserCapacity(element, user);
        const dates = user.dates.filter(d => d.totalTimeAllocated > maxHrs && d.userCapacity !== 'Leave');
        const tasks = [];
        if (dates.length) {
          const projectCodes = this.getProjectCodes(dates);
          projectInformation = await this.getProjectShortTitle(projectCodes, projectInformation);
          for (const date of dates) {
            // tslint:disable-next-line: max-line-length
            const resourceDateExists = oExistingResource && Object.keys(oExistingResource).length && conflictDetails.findIndex(ct => ct.tasks.find(t => t.allocation.date.getTime() === date.date.getTime())) > -1 ? true : false;
            if (!resourceDateExists) {
              const conflictTask: IConflictTask = {
                allocatedHrs: '' + +date.totalTimeAllocated.toFixed(2),
                allocation: date,
                projects: [],
              };
              date.tasksDetails.forEach(task => {
                const project = projectInformation.find(p => p.ProjectCode === task.projectCode);
                const projectExists = conflictTask.projects.find(p => p.projectCode === task.projectCode);
                if (!projectExists) {
                  const projectTitle = this.getTaskTitle(task);
                  const numAllocatedHrs = this.commonService.convertFromHrsMins(task.timeAllocatedPerDay);
                  const projectDetail = {
                    projectCode: projectTitle,
                    shortTitle: project ? project.WBJID : '',
                    allocatedhrs: +(numAllocatedHrs).toFixed(2),
                    showProjectLink: task.TaskType !== 'Adhoc' && task.TaskType !== 'ResourceBlocking' ? true : false
                  };
                  if (numAllocatedHrs > 0) {
                    conflictTask.projects.push(projectDetail);
                  }
                } else {
                  const preallocatedHrs: number = +(+projectExists.allocatedhrs).toFixed(2);
                  const currentAllocatedHrs: number = this.commonService.convertFromHrsMins(task.timeAllocatedPerDay);
                  projectExists.allocatedhrs = +(+preallocatedHrs + +currentAllocatedHrs).toFixed(2);
                }
              });
              tasks.push(conflictTask);
            }
          }
        }
        if (tasks.length) {
          if (oExistingResource && Object.keys(oExistingResource).length) {
            oExistingResource.tasks = [...oExistingResource.tasks, ...tasks];
          } else {
            const conflictResouce: IConflictResource = {
              user,
              userCapacity: this.recalculateUserCapacity(user, dates),
              tasks
            };
            conflictDetails.push(conflictResouce);
          }
        }
      }
    }
    return conflictDetails;
  }

  getTaskTitle(task) {
    let projectTitle = '';
    switch (task.TaskType) {
      case 'Adhoc':
        projectTitle = task.title;
        break;
      case 'ResourceBlocking':
        projectTitle = task.TaskType + ' (' + task.title + ')';
        break;
      default:
        projectTitle = task.projectCode;
        break;
    }
    return projectTitle;
  }

  async getResourceCapacity(task, milSubMil, allResources) {
    let capacity: any;
    task.resources = allResources.filter((objt) => {
      return objt.UserNamePG.ID === task.AssignedTo.ID;
    });
    task.resources = this.commonService.unique(task.resources, 'UserName.ID');
    if (milSubMil) {
      capacity = await this.userCapacityCommon.factoringTimeForAllocation(task.start_date, task.end_date,
        task.resources, [], [], this.allocationConstant.adhocStatus);
    } else {
      capacity = await this.usercapacityComponent.afterResourceChange(task, task.start_date,
        task.end_date, task.resources, [], false, []);
    }
    return capacity;
  }

  updateUserCapacity(currentTask, user) {
    const matchedTask = user.tasks.find(t => t.Title === currentTask.taskFullName && currentTask.edited);
    if (matchedTask) {
      const strAllocationPerDay = matchedTask && currentTask ? currentTask.allocationPerDay : '';
      matchedTask.AllocationPerDay = strAllocationPerDay;
      matchedTask.ExpectedTime = matchedTask.TotalAllocated ? matchedTask.TotalAllocated : currentTask.budgetHours ?
        currentTask.budgetHours : currentTask.EstimatedTime ? currentTask.EstimatedTime : '0.0';
      this.userCapacityCommon.fetchUserCapacity(user);
    }
  }

  getProjectCodes(dates) {
    const projectCodes = [];
    dates.forEach(date => {
      const projects = date.tasksDetails.map(t => t.projectCode);
      projectCodes.push(projects);
    });
    const mergedCodes = [].concat.apply([], projectCodes);
    const uniqueProjectCodes = [...new Set(mergedCodes)];
    return uniqueProjectCodes;
  }

  async getProjectShortTitle(projectCodes, existingProjectInfo) {
    const batchUrl = [];
    let projectInformation = [];
    const options: IQueryOptions = {
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
    this.commonService.SetNewrelic('TaskAllocation', 'Conflict Check component', 'GetProjectShortTitle', "GET-BATCH");
    const arrResults = await this.spServices.executeBatch(batchUrl);
    const projects = arrResults.length > 0 ? arrResults.map(a => a.retItems.length ? a.retItems[0] : []) : [];
    projectInformation = [...projectInformation, ...projects];
    return projectInformation;
  }

  recalculateUserCapacity(user, dates) {
    user.dates = dates;
    const businessDays = dates.map(d => d.date);
    const newUserCapacity = this.userCapacityCommon.fetchUserCapacity(user);
    const oCapacity = {
      arrUserDetails: [newUserCapacity],
      arrDateRange: businessDays,
      arrResources: [],
      arrDateFormat: businessDays,
    };
    return oCapacity;
  }
}
