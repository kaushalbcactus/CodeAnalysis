import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, TreeNode } from 'primeng';
import { IConflictTask, IPopupConflictData, IConflictResource, IQueryOptions } from '../../interface/allocation';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationCommonService } from '../../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { TaskAllocationConstantsService } from '../../services/task-allocation-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-conflict-allocations',
  templateUrl: './conflict-allocations.component.html',
  styleUrls: ['./conflict-allocations.component.css']
})
export class ConflictAllocationsComponent implements OnInit, AfterViewInit {
  resources: any;
  cols = [];
  activeIndex = -1;
  public conflicTasks: any;
  public node: TreeNode;
  public milestoneData: TreeNode[];
  public hideLoader: boolean;
  @ViewChild('UserCapacity', { static: false }) userCapacity: UsercapacityComponent;
  constructor(public popupData: DynamicDialogConfig, public globalService: GlobalService,
              public popupConfig: DynamicDialogRef, public allocationCommon: TaskAllocationCommonService,
              public commonService: CommonService, private usercapacityComponent: UsercapacityComponent,
              private allocationConstant: TaskAllocationConstantsService, private spServices: SPOperationService,
              private globalConstant: ConstantsService) { }
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
    this.popupData.data = null;
    this.activeIndex = 0;
    this.hideLoader = true;
  }

  ngAfterViewInit() {
  }

  goToProjectDetails(data: any): string {
    return this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/taskAllocation?ProjectCode=' + data.projectCode;
  }

  save(): void {
    this.hideLoader = false;
    setTimeout(() => {
      const obj: IPopupConflictData = { conflict: this.conflictResolved, action: 'save' };
      this.conflictResolved = this.conflicTasks.filter(t => t.tasks.length).length > 0 ? false : true;
      this.popupConfig.close(obj);
      this.hideLoader = true;
    }, 100);
  }

  close(): void {
    const obj: IPopupConflictData = { conflict: this.conflictResolved, action: 'close' };
    this.popupConfig.close(obj);
  }

  refresh(): void {
    this.hideLoader = false;
    setTimeout(async () => {
      this.conflicTasks = await this.checkConflictsAllocations(this.node, this.milestoneData);
      this.hideLoader = true;
    }, 100);
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

  async checkConflictsAllocations(milSubMil: TreeNode, originalData: TreeNode[]): Promise<IConflictResource[]> {
    let allTasks = [];
    const conflictDetails = [];
    let projectInformation = [];
    allTasks = this.getAllTasks(milSubMil, originalData);
    let capacity;
    const maxHrs = 10;
    for (const element of allTasks) {
      capacity = this.getResourceCapacity(element, milSubMil);
      for (const user of capacity.arrUserDetails) {
        const oExistingResource: IConflictResource = conflictDetails.length ? conflictDetails.find(ct => ct.userId === user.uid) : {};
        this.updateUserCapacity(element, user);
        const dates = user.dates.filter(d => d.totalTimeAllocated > maxHrs && d.userCapacity !== 'Leave');
        const tasks = [];
        if (dates.length) {
          const projectCodes = this.getProjectCodes(dates);
          projectInformation = await this.getProjectShortTitle(projectCodes, projectInformation);
          for (const date of dates) {
            // tslint:disable-next-line: max-line-length
            const resourceDateExists = oExistingResource && Object.keys(oExistingResource).length && conflictDetails.findIndex(ct => ct.tasks.find(t => t.allocationDate.getTime() === date.date.getTime())) > -1 ? true : false;
            if (!resourceDateExists) {
              const conflictTask: IConflictTask = {
                allocatedHrs: date.totalTimeAllocated,
                allocationDate: date.date,
                projects: [],
              };
              date.tasksDetails.forEach(task => {
                const project = projectInformation.find(p => p.ProjectCode === task.projectCode);
                const projectDetail = {
                  projectCode: task.projectCode,
                  shortTitle: project ? project.WBJID : '',
                  allocatedhrs: this.commonService.convertFromHrsMins(task.timeAllocatedPerDay)
                };
                conflictTask.projects.push(projectDetail);
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
              userName: user.userName,
              userId: user.uid,
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

  async getResourceCapacity(task, milSubMil) {
    let capacity: any;
    task.resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserName.ID === task.AssignedTo.ID;
    });
    task.resources = this.commonService.unique(task.resources, 'UserName.ID');
    if (milSubMil) {
      capacity = await this.usercapacityComponent.afterResourceChange(task, task.start_date,
        task.end_date, task.resources, [], false);
    } else {
      capacity = await this.usercapacityComponent.factoringTimeForAllocation(task.start_date, task.end_date,
        task.resources, [], [], this.allocationCommon.adhocStatus);
    }
    return capacity;
  }

  updateUserCapacity(currentTask, user) {
    const matchedTask = user.tasks.find(t => t.Title === currentTask.taskFullName && currentTask.edited);
    if (matchedTask) {
      const strAllocationPerDay = matchedTask && currentTask ? currentTask.allocationPerDay : '';
      matchedTask.AllocationPerDay = strAllocationPerDay;
      matchedTask.ExpectedTime = matchedTask.TotalAllocated = currentTask.budgetHours;
      this.usercapacityComponent.fetchUserCapacity(user);
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

  async getProjectShortTitle(projectCodes, existingProjectInfo)   {
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
    this.commonService.SetNewrelic('Allocation', 'Conflict Check component', 'GetProjectShortTitle');
    const arrResults = await this.spServices.executeBatch(batchUrl);
    const projects = arrResults.length > 0 ? arrResults.map(a => a.retItems.length ? a.retItems[0] : []) : [];
    projectInformation = [...projectInformation, ...projects];
    return projectInformation;
  }

  recalculateUserCapacity(user, dates) {
    user.dates = dates;
    const businessDays = dates.map(d => d.date);
    const newUserCapacity = this.usercapacityComponent.fetchUserCapacity(user);
    const oCapacity = {
      arrUserDetails: [newUserCapacity],
      arrDateRange: businessDays,
      arrResources: [],
      arrDateFormat: businessDays,
    };
    return oCapacity;
  }
}

