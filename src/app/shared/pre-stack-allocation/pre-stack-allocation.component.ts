import { Component, OnInit } from '@angular/core';
import { IDailyAllocationTask, IDailyAllocationObject } from './interface/prestack';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { TaskAllocationCommonService } from 'src/app/task-allocation/services/task-allocation-common.service';
import { MilestoneTreeNode } from 'src/app/task-allocation/timeline/timeline.component';
import { IMilestoneTask } from 'src/app/task-allocation/interface/allocation';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-pre-stack-allocation',
  templateUrl: './pre-stack-allocation.component.html',
  styleUrls: ['./pre-stack-allocation.component.css'],
  providers: [UsercapacityComponent]
})
export class PreStackAllocationComponent implements OnInit {
  public resourceCapacity: any;
  public newAllocation = [];
  public allocationType = '';
  public hideTable = false;
  public hideLoader = false;
  public hideTasks = true;
  public projects = [];
  public resourceCapacityCopy: any;
  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#C53E3E ',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
  constructor(private usercapacityComponent: UsercapacityComponent, private popupData: DynamicDialogConfig,
    public common: CommonService, private datePipe: DatePipe, public popupConfig: DynamicDialogRef,
    public allocationCommon: TaskAllocationCommonService, public messageService: MessageService,
    public global: GlobalService) { }

  ngOnInit() {
    // retrieve data on popup open
    const allocationData: IDailyAllocationTask = this.popupData.data;
    this.resourceCapacity = this.resourceCapacityCopy = {};
    if (allocationData && allocationData.resource.length && allocationData.startDate && allocationData.endDate) {
      this.showLoader();
      setTimeout(async () => {
        this.resourceCapacityCopy = await this.getResourceCapacity(allocationData);
        const resourceCapacity = JSON.parse(JSON.stringify(this.resourceCapacityCopy));
        await this.initialize(resourceCapacity, allocationData);
        this.hideTable = false;
        this.showTable();
      }, 300);
    }
  }

  async initialize(resource, allocationData): Promise<{ allocationPerDay, allocationAlert, allocationType }> {
    let objAllocation = {
      allocationPerDay: '',
      allocationAlert: false,
      allocationType: ''
    };
    this.resourceCapacity = resource;
    this.resourceCapacityCopy = JSON.parse(JSON.stringify(this.resourceCapacity));
    if (allocationData.strAllocation && !allocationData.allocationType) {
      this.getAllocation(resource, allocationData.strAllocation);
    } else {
      objAllocation = await this.performAllocation(resource, allocationData, false, null, null);
    }
    return objAllocation;
  }

  async performAllocation(resource, allocationData, allocationChanged: boolean, oldValue, oldAllocation) {
    let objAllocation = {
      allocationPerDay: '',
      allocationAlert: false,
      allocationType: ''
    };
    const isDailyAllocationValid = !allocationData.allocationType ? this.checkDailyAllocation(resource, allocationData) : false;
    if (!isDailyAllocationValid) {
      if (allocationChanged) {
        this.common.confirmMessageDialog('Cant accommodate pending hours on the subsequent days so equal allocation will be done. Should we do equal allocation ?',
          ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
              await this.equalSplitAllocation(allocationData, true);
              this.allocationType = objAllocation.allocationType = 'Equal allocation per day';
            } else {
              const dateIndex = resource.dates.findIndex(d => new Date(d.date).getTime() === new Date(oldValue.date).getTime());
              const allocationIndex = this.newAllocation.findIndex(d => new Date(d.Date).getTime() === new Date(oldAllocation.Date).getTime());
              resource.dates.splice(dateIndex, 1, oldValue);
              this.newAllocation.splice(allocationIndex, 1, oldAllocation);
            }
          });
      } else {
        await this.equalSplitAllocation(allocationData, false);
        this.allocationType = objAllocation.allocationType = 'Equal allocation per day';
      }
    } else {
      this.allocationType = objAllocation.allocationType = 'Daily Allocation';
    }
    objAllocation = this.getAllocationPerDay(allocationData);
    return objAllocation;
  }

  getAllocation(resource, strAllocation): void {
    this.newAllocation.length = 0;
    const sliderMaxHrs: number = resource.maxHrs ? +resource.maxHrs + 3 : 0;
    const allocationDays = strAllocation.split(/\n/);
    allocationDays.forEach((day, index) => {
      if (day) {
        const betweenDays = index > 0 && index < allocationDays.length - 1 ? true : false;
        const resourceDailyAllocation: any[] = resource.dates;
        const allocation = this.common.getDateTimeFromString(day);
        const allocatedDate: any = resourceDailyAllocation.find(d => new Date(d.date).getTime() === allocation.date.getTime());
        if (allocatedDate) {
          let resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, allocatedDate, allocation.value.hours, index);
          resourceSliderMaxHrs = resourceSliderMaxHrs.indexOf('-') > -1 ? '0:0' : resourceSliderMaxHrs;
          const obj: IDailyAllocationObject = {
            Date: allocation.date,
            Allocation: {
              valueHrs: allocation.value.hours,
              valueMins: allocation.value.mins,
              maxHrs: this.common.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
              maxMins: resourceSliderMaxHrs === '0:0' ? 0 : 45
            },
            tasks: allocatedDate.tasksDetails,
            hideTasksTable: true
          };
          this.newAllocation.push(obj);
        }
      }
    });
  }

  checkDailyAllocation(resource, allocationData): boolean {
    const autoAllocateAddHrs = '0:30';
    let extraHrs = '0:0';
    const maxLimit = +resource.maxHrs + 2;
    const budgetHrs: number = allocationData.budgetHrs;
    let maxAvailableHrs = +resource.maxHrs;
    let remainingBudgetHrs: string;
    while (maxAvailableHrs <= maxLimit) {
      remainingBudgetHrs = '' + budgetHrs;
      remainingBudgetHrs = this.checkResourceAvailability(resource, extraHrs, remainingBudgetHrs, allocationData, maxLimit);
      if (remainingBudgetHrs.indexOf('-') > -1) {
        extraHrs = this.common.addHrsMins([extraHrs, autoAllocateAddHrs]);
        maxAvailableHrs = maxAvailableHrs + 0.5;
      } else {
        break;
      }
    }
    return remainingBudgetHrs.indexOf('-') < 0 ? true : false;
  }

  async getResourceCapacity(task: IDailyAllocationTask) {
    const taskStatus: string[] = this.allocationCommon.taskStatus.indexOf(task.status) > -1 ? this.allocationCommon.taskStatus : [];
    // tslint:disable-next-line: max-line-length
    const oCapacity = await this.usercapacityComponent.factoringTimeForAllocation(task.startDate, task.endDate, task.resource, [task], taskStatus, this.allocationCommon.adhocStatus);
    const resource = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    return resource;
  }

  checkResourceAvailability(resource, extraHrs, taskBudgetHrs, allocationData, maxLimit): string {
    const startTime = allocationData.startTime ? this.common.convertTo24Hour(allocationData.startTime) : '0:0';
    const endTime = allocationData.endTime ? this.common.convertTo24Hour(allocationData.endTime) : '0:0';
    const availableStartDayHrs = this.common.subtractHrsMins(startTime, '24:00', false);
    const availableEndDayHrs = this.common.convertTo24Hour(endTime);
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
    const resourceSliderMaxHrs = +resource.maxHrs + 3;
    let newBudgetHrs = '0';
    this.newAllocation.length = 0;
    let flag = true;
    let i = 0;
    for (const detail of resourceDailyDetails) {
      let betweenDays = false;
      const obj: IDailyAllocationObject = {
        Date: new Date(detail.date),
        Allocation: {
          valueHrs: 0,
          valueMins: 0,
          maxHrs: 0,
          maxMins: 0
        },
        tasks: detail.tasksDetails,
        hideTasksTable: true
      };
      if (flag) {
        if (i === 0) {
          detail.availableHrs = this.compareHrs(availableStartDayHrs, detail) ? availableStartDayHrs : detail.availableHrs;
        } else if (i === resourceDailyDetails.length - 1) {
          detail.availableHrs = this.compareHrs(availableEndDayHrs, detail) ? availableEndDayHrs : detail.availableHrs;
        } else {
          betweenDays = true;
        }
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs || detail.totalTimeAllocated >= maxLimit ? availableHrs :
          this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        const numhrs = this.getResourceSliderMaxHrs(resourceSliderMaxHrs, detail, betweenDays);
        obj.Allocation.maxHrs = numhrs.indexOf('-') > -1 ? 0 : this.common.getHrsMinsObj(numhrs, true).hours;
        obj.Allocation.maxMins = availableHrs === '0:0' && detail.totalTimeAllocated >= maxLimit && !betweenDays ? 0 : 45;
        if (newBudgetHrs.indexOf('-') > -1) {
          obj.Allocation.valueHrs = this.common.getHrsMinsObj(availableHrs, false).hours;
          obj.Allocation.valueMins = this.common.getHrsMinsObj(availableHrs, false).mins;
          taskBudgetHrs = newBudgetHrs;
        } else {
          let budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          budgetHrs = budgetHrs.indexOf('.') > -1 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
          obj.Allocation.valueHrs = this.common.getHrsMinsObj(budgetHrs, false).hours;
          obj.Allocation.valueMins = this.common.getHrsMinsObj(budgetHrs, false).mins;
          flag = false;
        }
      }
      this.newAllocation.push(obj);
      i++;
    }
    return newBudgetHrs;
  }

  compareHrs(firstElement, day) {
    const secondElement = day.availableHrs;
    const result = this.common.convertFromHrsMins(firstElement) <= this.common.convertFromHrsMins(secondElement) ? true : false;
    day.mandatoryHrs = result ? true : day.mandatoryHrs;
    return result;
  }

  getResourceSliderMaxHrs(defaultResourceMaxHrs, day, betweenDays: boolean): string {
    const numtotalAllocated = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    const maxHrsMins = this.common.roundToPrecision(defaultResourceMaxHrs - numtotalAllocated, 0.25);
    const sliderMaxHrs = betweenDays ? maxHrsMins > -1 && (24 - maxHrsMins < 12) ?
      24 - maxHrsMins : defaultResourceMaxHrs : maxHrsMins;
    return this.common.convertToHrsMins('' + sliderMaxHrs);
  }

  getResourceMaxHrs(defaultResourceMaxHrs, day, allocatedHours, betweenDays) {
    const numtotalAllocated = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    const availableHrs = defaultResourceMaxHrs - numtotalAllocated;
    const maxHrs = availableHrs < allocatedHours ? allocatedHours : availableHrs;
    const maxHrsMins = this.common.roundToPrecision(maxHrs, 0.25);
    const sliderMaxHrs = betweenDays ? maxHrsMins > -1 && (24 - maxHrsMins < 12) ?
      24 - maxHrsMins : defaultResourceMaxHrs : maxHrsMins;
    return this.common.convertToHrsMins('' + sliderMaxHrs);
  }

  getDailyAvailableHours(resourceAvailableHrs: string, budgetHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  async equalSplitAllocation(allocationData: IDailyAllocationTask, allocationChanged: boolean) {
    this.newAllocation.length = 0;
    const businessDays = this.common.calcBusinessDays(allocationData.startDate, allocationData.endDate);
    const budgetHours = +allocationData.budgetHrs;
    let allocationPerDay = this.common.roundToPrecision(budgetHours / businessDays, 0.25);
    this.resourceCapacity = {...this.resourceCapacityCopy};
    // Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(allocationData);
    const resourceSliderMaxHrs = this.resourceCapacity.maxHrs + 3;
    const resourceDailyDetails = this.resourceCapacity.dates.filter(d => d.userCapacity !== 'Leave');
    let remainingBudgetHrs = budgetHours;
    const availaibility = this.equalSplitAvailibilty(allocationData, allocationPerDay);
    const noOfDays = businessDays > availaibility.days ? (businessDays - availaibility.days) : businessDays;
    let calcBudgetHrs = availaibility.lastDayAvailability < allocationPerDay && noOfDays > 1 ?
      budgetHours - availaibility.lastDayAvailability : budgetHours;
    calcBudgetHrs = availaibility.firstDayAvailablity < allocationPerDay ? calcBudgetHrs - availaibility.firstDayAvailablity :
      calcBudgetHrs;
    allocationPerDay = calcBudgetHrs !== budgetHours ? Math.ceil(calcBudgetHrs / noOfDays) : allocationPerDay;
    let i = 0;
    for (const detail of resourceDailyDetails) {
      let totalHrs = 0;
      if (i === 0) {
        totalHrs = availaibility.firstDayAvailablity < allocationPerDay ?
          availaibility.firstDayAvailablity : allocationPerDay; // noOfDays <= 1 ? availaibility.firstDayAvailablity :
      } else if (i === resourceDailyDetails.length - 1) {
        totalHrs = availaibility.lastDayAvailability < remainingBudgetHrs ? availaibility.lastDayAvailability : remainingBudgetHrs;
      } else {
        totalHrs = allocationPerDay < remainingBudgetHrs ? allocationPerDay : remainingBudgetHrs;
      }
      remainingBudgetHrs = remainingBudgetHrs - totalHrs;
      const maximumHrs = totalHrs < resourceSliderMaxHrs ? resourceSliderMaxHrs : totalHrs;
      const strTotalHrs = this.common.convertToHrsMins(totalHrs);
      const strMaximumHrs = this.common.convertToHrsMins(maximumHrs);
      const obj: IDailyAllocationObject = {
        Date: new Date(detail.date),
        Allocation: {
          valueHrs: this.common.getHrsMinsObj(strTotalHrs, false).hours,
          valueMins: this.common.getHrsMinsObj(strTotalHrs, false).mins,
          maxHrs: this.common.getHrsMinsObj(strMaximumHrs, true).hours,
          maxMins: 45
        },
        tasks: detail.tasksDetails,
        hideTasksTable: true
      };

      this.newAllocation.push(obj);
      i++;
    }
    if (allocationChanged) {
      this.messageService.add({ key: 'custom', severity: 'info', summary: 'Warning Message', detail: 'Equal allocation performed. Please assign budget hours from first row if change is needed.', sticky: true });
    }
  }

  equalSplitAvailibilty(allocationData, allocationPerDay) {
    let count = 0;
    const startTime = allocationData.startTime ? this.common.convertFromHrsMins(this.common.convertTo24Hour(allocationData.startTime)) : 0;
    const endTime = allocationData.endTime ? this.common.convertFromHrsMins(this.common.convertTo24Hour(allocationData.endTime)) : 0;
    const availableStartDayHrs = 24 - startTime;
    const availableEndDayHrs = endTime;
    if (availableEndDayHrs < allocationPerDay) {
      count++;
    }
    if (availableStartDayHrs < allocationPerDay) {
      count++;
    }
    return {
      firstDayAvailablity: availableStartDayHrs,
      lastDayAvailability: availableEndDayHrs,
      days: count
    };
  }

  getAllocationPerDay(allocationData): { allocationPerDay, allocationAlert, allocationType } {
    let allocationPerDay = '';
    this.newAllocation.forEach(element => {
      allocationPerDay = allocationPerDay + this.datePipe.transform(new Date(element.Date), 'EE,MMMd,y') + ':' +
        element.Allocation.valueHrs + ':' + element.Allocation.valueMins + '\n';
    });
    const resourceCapacity = this.resourceCapacity.totalUnAllocated;
    const allocationAlert = (new Date(allocationData.startDate).getTime() === new Date(allocationData.endDate).getTime()
      && +resourceCapacity < +allocationData.budgetHrs) ? true : false;
    return ({
      allocationPerDay,
      allocationAlert,
      allocationType: this.allocationType
    });
  }

  saveAllocation(): void {
    const allocationData: IDailyAllocationTask = this.popupData.data;
    const objAllocation = this.getAllocationPerDay(allocationData);
    const allocationPerDay = objAllocation.allocationPerDay;
    const allocationAlert = objAllocation.allocationAlert;
    const allocationType = objAllocation.allocationType;
    this.popupConfig.close({ allocationPerDay, allocationAlert, allocationType });
  }

  /**
   * Event is fired when hours or mins are changed
   */
  async checkAllocation(event, changedDate) {
    const objData = this.popupData.data;
    objData.allocationType = '';
    this.resourceCapacity = Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(objData);
    const resourceDailyAllocation = this.resourceCapacity.dates;
    const resourceChangedDate = resourceDailyAllocation.find(d => new Date(d.date).getTime() === new Date(changedDate.Date).getTime());
    const oldValue = {...resourceChangedDate};
    const oldAllocation = this.newAllocation.find(d => new Date(d.Date).getTime() === new Date(changedDate.Date).getTime());
    event.value = event.type ? event.value : event.selectedHour.time + ':' + event.selectedMinute.time;
    const strChangedValue = event.type ? event.type === 'hrs' ?
      event.value + ':' + changedDate.Allocation.valueMins :
      changedDate.Allocation.valueHrs + ':' + event.value : event.value;
    resourceChangedDate.availableHrs = strChangedValue;
    resourceChangedDate.mandatoryHrs = true;
    await this.performAllocation(this.resourceCapacity, objData, true, oldValue, oldAllocation);
  }

  showTable() {
    this.hideLoader = true;
    this.hideTable = false;
  }

  showLoader() {
    this.hideLoader = false;
    this.hideTable = true;
  }
  async cancel() {
    this.popupConfig.close({ allocationPerDay: this.popupData.data.strAllocation, allocationAlert: false });
  }
  showTasks(rowData) {
    if (rowData.tasks.length) {
      rowData.hideTasksTable = !rowData.hideTasksTable;
    } else {
      this.messageService.add({ key: 'custom', severity: 'info', summary: 'Warning Message', detail: 'No Tasks found' });
    }
  }

  getData(milestoneTask) {
    const task = {
      ID: milestoneTask.id,
      task: milestoneTask.taskFullName,
      taskType: milestoneTask.Task ? milestoneTask.Task : milestoneTask.itemType,
      startDatePart: milestoneTask.pUserStartDatePart ? milestoneTask.pUserStartDatePart : milestoneTask.StartDatePart,
      endDatePart: milestoneTask.pUserEndDatePart ? milestoneTask.pUserEndDatePart : milestoneTask.EndDatePart,
      startDate: milestoneTask.pUserStart ? milestoneTask.pUserStart : milestoneTask.StartDate,
      endDate: milestoneTask.pUserEnd ? milestoneTask.pUserEnd : milestoneTask.EndDate,
      budgetHrs: milestoneTask.budgetHours ? milestoneTask.budgetHours : milestoneTask.Hours,
      startTime: milestoneTask.pUserStartTimePart ? milestoneTask.pUserStartTimePart : milestoneTask.StartTimePart,
      endTime: milestoneTask.pUserEndTimePart ? milestoneTask.pUserEndTimePart : milestoneTask.EndTimePart,
      status: milestoneTask.Status ? milestoneTask.Status : milestoneTask.status
    };
    return task;
  }

  async calcPrestackAllocation(resource, milestoneTask) {
    const task = this.getData(milestoneTask);
    const eqgTasks = ['Edit', 'Quality', 'Graphics', 'Client Review', 'Send to client'];
    if (!eqgTasks.find(t => t === task.taskType) && task.startDatePart &&
      resource.length && task.endDatePart && task.budgetHrs &&
      task.endDate > task.startDate
      && new Date(task.startDatePart).getTime() !==  new Date(task.endDatePart).getTime()) {
      const allocationData: IDailyAllocationTask = {
        ID: task.ID,
        task: task.task,
        startDate: task.startDatePart,
        endDate: task.endDatePart,
        startTime: task.startTime,
        endTime: task.endTime,
        budgetHrs: task.budgetHrs,
        resource,
        status: task.status,
        strAllocation: '',
        allocationType: ''
      };
      const resourceCapacity = await this.recalculateUserCapacity(allocationData);
      const objDailyAllocation = await this.initialize(resourceCapacity, allocationData);
      this.setAllocationPerDay(objDailyAllocation, milestoneTask);
      if (objDailyAllocation.allocationAlert) {
        milestoneTask.allocationAlert = true;
      }
    } else {
      milestoneTask.showAllocationSplit = false;
      milestoneTask.allocationColor = '';
      milestoneTask.allocationPerDay = '';
    }
  }

  async recalculateUserCapacity(allocationData: IDailyAllocationTask) {
    const taskStatus = this.allocationCommon.taskStatus.indexOf(allocationData.status) > -1 ? this.allocationCommon.taskStatus : [];
    const adhoc = this.allocationCommon.adhocStatus;
    const resource = allocationData.resource.length ? allocationData.resource[0].UserName.ID : -1;
    const businessDays = this.usercapacityComponent.getDates(allocationData.startDate, allocationData.endDate, true);
    let newUserCapacity;
    if (this.global.oCapacity.arrUserDetails.length) {
      const resourceCapacity = this.global.oCapacity.arrUserDetails.find(u => u.uid === resource);
      if (resourceCapacity) {
        const userCapacity = {...resourceCapacity};
        userCapacity.businessDays = businessDays.dateArray;
        // tslint:disable-next-line: max-line-length
        const dates = userCapacity.dates.filter(u => businessDays.dateArray.find(b => new Date(b).getTime() === new Date(u.date).getTime()));
        dates.forEach(date => {
          date.tasksDetails = date.tasksDetails.filter(t => taskStatus.indexOf(t.status) < 0 &&
            adhoc.indexOf(t.comments) < 0 && t.ID !== allocationData.ID);
        });
        userCapacity.dates = dates;
        userCapacity.tasks = userCapacity.tasks.filter(t => taskStatus.indexOf(t.Status) < 0 &&
          adhoc.indexOf(t.Comments) < 0 && t.ID !== allocationData.ID);
        if (userCapacity.dates.length === userCapacity.businessDays.length) {
          newUserCapacity = this.usercapacityComponent.fetchUserCapacity(userCapacity);
        } else {
          allocationData.endDate = this.common.calcBusinessDate('Next', 90, allocationData.startDate).endDate;
          newUserCapacity = await this.getResourceCapacity(allocationData);
          const capacity = this.global.oCapacity.arrUserDetails.find(u => u.uid === resource);
          capacity.dates = [...capacity.dates, ...newUserCapacity.dates];
          capacity.businessDays = [...capacity.businessDays, ...newUserCapacity.businessDays];
        }
      } else {
        allocationData.endDate = this.common.calcBusinessDate('Next', 90, allocationData.startDate).endDate;
        newUserCapacity = await this.getResourceCapacity(allocationData);
        this.global.oCapacity.arrUserDetails.push(newUserCapacity);
      }
    } else {
      allocationData.endDate = this.common.calcBusinessDate('Next', 90, allocationData.startDate).endDate;
      newUserCapacity = await this.getResourceCapacity(allocationData);
      this.global.oCapacity.arrUserDetails.push(newUserCapacity);
    }
    return newUserCapacity;
  }

  setAllocationPerDay(allocation, task: IMilestoneTask) {
    task.allocationPerDay = allocation.allocationPerDay;
    task.showAllocationSplit = new Date(task.pUserStartDatePart).getTime() !== new Date(task.pUserEndDatePart).getTime() ? true : false;
    task.edited = true;
    task.allocationColor = allocation.allocationType === 'Equal allocation per day' ? 'indianred' : allocation.allocationType === 'Equal Allocation' ?
      '' : allocation.allocationType;
  }
}
