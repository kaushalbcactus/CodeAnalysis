import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { IConflictTask, IPopupConflictData, IConflictResource } from '../../interface/allocation';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationCommonService } from '../../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';

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
  public node: Node;
  public milestoneData: Node;
  public hideLoader: boolean;
  @ViewChild('UserCapacity', { static: false }) userCapacity: UsercapacityComponent;
  constructor(public popupData: DynamicDialogConfig, public globalService: GlobalService,
    public popupConfig: DynamicDialogRef, public allocationCommon: TaskAllocationCommonService,
    public commonService: CommonService, private usercapacityComponent: UsercapacityComponent) { }
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

  }

  ngAfterViewInit() {
  }

  goToProjectDetails(data: any): string {
    return this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/taskAllocation?ProjectCode=' + data.projectCode;
  }

  save() {
    this.hideLoader = false;
    setTimeout(() => {
      const obj: IPopupConflictData = { conflict: this.conflictResolved, action: 'save' };
      this.conflictResolved = this.conflicTasks.filter(t => t.tasks.length).length > 0 ? false : true;
      this.popupConfig.close(obj);
      this.hideLoader = true;
    }, 100);
  }

  close() {
    const obj: IPopupConflictData = { conflict: this.conflictResolved, action: 'close' };
    this.popupConfig.close(obj);
  }

  async refresh() {
    this.conflicTasks = await this.checkConflictsAllocations(this.node, this.milestoneData);
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

  async checkConflictsAllocations(milSubMil, originalData): Promise<any[]> {
    let allTasks = [];
    const conflictDetails = [];
    allTasks = this.getAllTasks(milSubMil, originalData);
    let capacity;
    const maxHrs = 10;
    for (const element of allTasks) {
      element.resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return objt.UserName.ID === element.AssignedTo.ID;
      });
      element.resources = this.commonService.unique(element.resources, 'UserName.ID');
      if (milSubMil) {
        capacity = await this.usercapacityComponent.afterMilestoneTaskModified(element, element.start_date,
          element.end_date, element.resources, []);
      } else {
        capacity = await this.usercapacityComponent.factoringTimeForAllocation(element.start_date, element.end_date,
          element.resources, [], [], this.allocationCommon.adhocStatus);
      }

      for (const user of capacity.arrUserDetails) {
        const oExistingResource: IConflictResource = conflictDetails.length ? conflictDetails.find(ct => ct.userId === user.uid) : {};
        const dates = user.dates.filter(d => d.totalTimeAllocated >= maxHrs && d.userCapacity !== 'Leave');
        const tasks = [];
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
              const projectDetail = {
                projectCode: task.projectCode,
                shortTitle: task.shortTitle,
                allocatedhrs: this.commonService.convertFromHrsMins(task.timeAllocatedPerDay)
              };
              conflictTask.projects.push(projectDetail);
            });
            tasks.push(conflictTask);
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

