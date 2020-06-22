import { Component, OnInit } from '@angular/core';
import { IDailyAllocationTask, IDailyAllocationObject, IPreStack, IPerformAllocationObject } from './interface/prestack';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { TaskAllocationCommonService } from 'src/app/task-allocation/services/task-allocation-common.service';
import { IMilestoneTask } from 'src/app/task-allocation/interface/allocation';
import { GlobalService } from 'src/app/Services/global.service';
import { IUserCapacity } from '../usercapacity/interface/usercapacity';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-pre-stack-allocation',
  templateUrl: './pre-stack-allocation.component.html',
  styleUrls: ['./pre-stack-allocation.component.css'],
  providers: [UsercapacityComponent]
})
export class PreStackAllocationComponent implements OnInit {
  public resourceCapacity: IUserCapacity;
  public allocationSplit = [];
  public allocationType = '';
  public hideTable = false;
  public hideLoader = false;
  public hideTasks = true;
  public projects = [];
  public resourceCapacityCopy: IUserCapacity;
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
    public allocationCommon: TaskAllocationCommonService,
    public global: GlobalService, public constants: ConstantsService) { }

  ngOnInit() {
    // retrieve data on popup open
    const allocationData: IDailyAllocationTask = this.popupData.data;
    // this.resourceCapacity = this.resourceCapacityCopy = {};
    if (allocationData && allocationData.resource.length && allocationData.startDate && allocationData.endDate) {
      this.showLoader();
      setTimeout(async () => {
        this.resourceCapacityCopy = await this.getResourceCapacity(allocationData);
        this.resourceCapacity = {...this.resourceCapacityCopy};
        this.allocationSplit = await this.initialize(this.resourceCapacity, allocationData);
        this.hideTable = false;
        this.showTable();
      }, 300);
    }
  }

  /**
   * Fetch preallocated allocation per day for each task or perform allocation
   */
  async initialize(resource: IUserCapacity, allocationData: IDailyAllocationTask): Promise<IDailyAllocationObject[]> {
    let allocationSplit: IDailyAllocationObject[];
    if (allocationData.strAllocation && !allocationData.allocationType) {
      allocationSplit = this.showAllocation(resource, allocationData.strAllocation);
    } else {
      const arrAllocation: IPerformAllocationObject = await this.performAllocation(resource, allocationData, false, null, null);
      allocationSplit = arrAllocation.arrAllocation;
    }
    return allocationSplit;
  }

  /**
   * Perform prestack allocation or equal split allocation
   */
  async performAllocation(resource: IUserCapacity, allocationData: IDailyAllocationTask,
                          allocationChanged: boolean, oldValue, oldAllocation): Promise<IPerformAllocationObject> {
    let arrAllocation = [...this.allocationSplit];
    const isDailyAllocationValid = !allocationData.allocationType ? this.checkDailyAllocation(resource, allocationData) : false;
    if (!isDailyAllocationValid) {
      if (allocationChanged) {
        this.common.confirmMessageDialog('Confirmation','Cant accommodate pending hours on the subsequent days so equal allocation will be done. Should we do equal allocation ?',null,
          ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
              arrAllocation = await this.equalSplitAllocation(resource, allocationData, true);
              allocationData.allocationType = 'Equal allocation per day';
            } else {
              const dateIndex = resource.dates.findIndex(d => new Date(d.date).getTime() === new Date(oldValue.date).getTime());
              // tslint:disable-next-line: max-line-length
              const allocationIndex = arrAllocation.findIndex(d => new Date(d.Date).getTime() === new Date(oldAllocation.Date).getTime());
              resource.dates.splice(dateIndex, 1, oldValue);
              arrAllocation.splice(allocationIndex, 1, oldAllocation);
            }
          });
      } else {
        arrAllocation = await this.equalSplitAllocation(resource, allocationData, false);
        allocationData.allocationType = 'Equal allocation per day';
      }
    } else {
      arrAllocation = [...this.allocationSplit];
      allocationData.allocationType = 'Daily Allocation';
    }
    return {
      arrAllocation,
      allocationType: allocationData.allocationType
    };
  }

  /**
   * show allocation per day in popup with slider
   */
  showAllocation(resource: IUserCapacity, strAllocation: string): IDailyAllocationObject[] {
    const arrAllocation = [];
    const sliderMaxHrs: number = resource.maxHrs ? +resource.maxHrs + 3 : 0;
    const allocationDays = strAllocation.split(/\n/);
    allocationDays.forEach((day, index) => {
      if (day) {
        const betweenDays = index > 0 && index < allocationDays.length - 1 ? true : false;
        const resourceDailyAllocation: any[] = resource.dates;
        const allocation = this.common.getDateTimeFromString(day);
        const allocatedDate: any = resourceDailyAllocation.find(d => new Date(d.date).getTime() === allocation.date.getTime());
        if (allocatedDate) {
          let resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, allocatedDate, index, allocation.value.hours);
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
          arrAllocation.push(obj);
        }
      }
    });
    return arrAllocation;
  }

  /**
   * Perform daily allocation - part 1
   * It will return boolean value based on prestack allocation success or not
   */
  checkDailyAllocation(resource: IUserCapacity, allocationData: IDailyAllocationTask): boolean {
    const autoAllocateAddHrs = '0:30';
    let extraHrs = '0:0';
    const maxLimit = +resource.maxHrs + 2;
    const budgetHrs: number = +allocationData.budgetHrs;
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

  /**
   * Fetch user capacity based task start and end date
   */
  async getResourceCapacity(task: IDailyAllocationTask): Promise<IUserCapacity> {
    const taskStatus: string[] = this.allocationCommon.taskStatus.indexOf(task.status) > -1 ? this.allocationCommon.taskStatus : [];
    // tslint:disable-next-line: max-line-length
    const oCapacity = await this.usercapacityComponent.factoringTimeForAllocation(task.startDate, task.endDate, task.resource, [task], taskStatus, this.allocationCommon.adhocStatus);
    const resource: IUserCapacity = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    return resource;
  }

  /**
   * Main method performing pre stack allocation
   */
  checkResourceAvailability(resource: IUserCapacity, extraHrs: string, taskBudgetHrs: string,
                            allocationData: IDailyAllocationTask, maxLimit: number): string {
    const startTime = allocationData.startTime ? this.common.convertTo24Hour(allocationData.startTime) : '0:0';
    const endTime = allocationData.endTime ? this.common.convertTo24Hour(allocationData.endTime) : '0:0';
    const availableStartDayHrs: string = this.common.subtractHrsMins(startTime, '24:00', false);
    const availableEndDayHrs: string = this.common.convertTo24Hour(endTime);
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
    const resourceSliderMaxHrs: number = +resource.maxHrs + 3;
    let newBudgetHrs = '0';
    this.allocationSplit.length = 0;
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
        let availableHrs: string = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs || detail.totalTimeAllocated >= maxLimit ? availableHrs :
          this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        // const numhrs = this.getResourceSliderMaxHrs(resourceSliderMaxHrs, detail, betweenDays);
        const numhrs = this.getResourceMaxHrs(resourceSliderMaxHrs, detail, betweenDays);
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
      this.allocationSplit.push(obj);
      i++;
    }
    return newBudgetHrs;
  }

  /**
   * This checks if budget hours for task is less than available hours for day
   */
  compareHrs(firstElement: string, day: any): boolean {
    const secondElement = day.availableHrs;
    const result = this.common.convertFromHrsMins(firstElement) <= this.common.convertFromHrsMins(secondElement) ? true : false;
    day.mandatoryHrs = result ? true : day.mandatoryHrs;
    return result;
  }

  /**
   * Fetch maximum hours for slider
   */
  // getResourceSliderMaxHrs(defaultResourceMaxHrs: number, day: any, betweenDays: boolean): string {
  //   const numtotalAllocated: number = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
  //   const maxHrsMins = this.common.roundToPrecision(defaultResourceMaxHrs - numtotalAllocated, 0.25);
  //   const sliderMaxHrs = betweenDays ? maxHrsMins > -1 && (24 - maxHrsMins < 12) ?
  //     24 - maxHrsMins : defaultResourceMaxHrs : maxHrsMins;
  //   return this.common.convertToHrsMins('' + sliderMaxHrs);
  // }

  /**
   * Fetch maximum hours for slider
   */
  getResourceMaxHrs(defaultResourceMaxHrs: number, day: any, betweenDays: number|boolean, allocatedHours?: number): string {
    const numtotalAllocated: number = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    const availableHrs: number = defaultResourceMaxHrs - numtotalAllocated;
    const maxHrs: number = availableHrs < allocatedHours ? allocatedHours : availableHrs;
    const maxHrsMins: number = this.common.roundToPrecision(maxHrs, 0.25);
    const sliderMaxHrs: number = betweenDays ? maxHrsMins > -1 && (24 - maxHrsMins < 12) ?
      24 - maxHrsMins : defaultResourceMaxHrs : maxHrsMins;
    return this.common.convertToHrsMins('' + sliderMaxHrs);
  }

  /**
   * Subtracts remaining budget hours from available hours in day
   * @param resourceAvailableHrs - available hours in day
   * @param budgetHrs - remaining budget of task in day
   */
  getDailyAvailableHours(resourceAvailableHrs: string, budgetHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  /**
   * Perform equal split to allocation per day
   */
  async equalSplitAllocation(resourceCapacityCopy: IUserCapacity, allocationData: IDailyAllocationTask,
                             allocationChanged: boolean): Promise<IPerformAllocationObject[]> {
    const arrAllocation = [];
    const businessDays = this.common.calcBusinessDays(allocationData.startDate, allocationData.endDate);
    const budgetHours = +allocationData.budgetHrs;
    let allocationPerDay = this.common.roundToPrecision(budgetHours / businessDays, 0.25);
    this.resourceCapacity = {...resourceCapacityCopy};
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

      arrAllocation.push(obj);
      i++;
    }
    if (allocationChanged) {
      this.common.showToastrMessage(this.constants.MessageType.info,'Equal allocation performed. Please assign budget hours from first row if change is needed.',true);
    }
    return arrAllocation;
  }

  /**
   * Check if equal splitted hours is available on start and end day
   */
  equalSplitAvailibilty(allocationData: IDailyAllocationTask, allocationPerDay: number) {
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

  /**
   * generate string of allocationperday from array of allocation
   */
  getAllocationPerDay(resourceCapacity: IUserCapacity, allocationData: IDailyAllocationTask): IPreStack {
    let allocationPerDay = '';
    this.allocationSplit.forEach(element => {
      allocationPerDay = allocationPerDay + this.datePipe.transform(new Date(element.Date), 'EE,MMMd,y') + ':' +
        element.Allocation.valueHrs + ':' + element.Allocation.valueMins + '\n';
    });
    const availableHours = resourceCapacity.totalUnAllocated;
    const allocationAlert = (new Date(allocationData.startDate).getTime() === new Date(allocationData.endDate).getTime()
      && +availableHours < +allocationData.budgetHrs) ? true : false;
    return ({
      allocationPerDay,
      allocationAlert,
      allocationType: allocationData.allocationType ? allocationData.allocationType : 'Equal allocation per day'
    });
  }

  /**
   * Generate string of allocation per day and close edit allocation popup
   */
  saveAllocation(): void {
    const allocationData: IDailyAllocationTask = this.popupData.data;
    const objAllocation: IPreStack = this.getAllocationPerDay(this.resourceCapacity, allocationData);
    this.popupConfig.close(objAllocation);
  }

  /**
   * Event is fired when hours or mins are changed
   */
  async checkAllocation(event: any, changedDate: IDailyAllocationObject) {
    const objData = this.popupData.data;
    objData.allocationType = '';
    this.resourceCapacity = Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(objData);
    const resourceDailyAllocation = this.resourceCapacity.dates;
    const resourceChangedDate = resourceDailyAllocation.find(d => new Date(d.date).getTime() === new Date(changedDate.Date).getTime());
    const oldValue = {...resourceChangedDate};
    const oldAllocation = this.allocationSplit.find(d => new Date(d.Date).getTime() === new Date(changedDate.Date).getTime());
    event.value = event.type ? event.value : event.selectedHour.time + ':' + event.selectedMinute.time;
    const strChangedValue = event.type ? event.type === 'hrs' ?
      event.value + ':' + changedDate.Allocation.valueMins :
      changedDate.Allocation.valueHrs + ':' + event.value : event.value;
    resourceChangedDate.availableHrs = strChangedValue;
    resourceChangedDate.mandatoryHrs = true;
    this.allocationSplit = (await this.performAllocation(this.resourceCapacity, objData, true, oldValue, oldAllocation)).arrAllocation;
  }

  /**
   * show table and hide loader
   */
  showTable(): void {
    this.hideLoader = true;
    this.hideTable = false;
  }

  /**
   * show loader and hide table
   */
  showLoader(): void {
    this.hideLoader = false;
    this.hideTable = true;
  }

  /**
   * cancel edit allocation changes and close popup
   */
  cancel(): void {
    this.popupConfig.close({ allocationPerDay: this.popupData.data.strAllocation, allocationAlert: false });
  }

  /**
   * displays all tasks for user on clicked date
   */
  showTasks(rowData): void {
    if (rowData.tasks.length) {
      rowData.hideTasksTable = !rowData.hideTasksTable;
    } else {
      this.common.showToastrMessage(this.constants.MessageType.info,'No Tasks found',false);
    }
  }

  /**
   * Generate task data
   */
  getData(milestoneTask): any {
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

  /**
   * Action is performed to recalculate daily allocation on changes to either resource, dates or budget hours
   */
  async calcPrestackAllocation(resource: IUserCapacity[], milestoneTask) {
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
      const resourceCapacity: IUserCapacity = await this.recalculateUserCapacity(allocationData);
      this.allocationSplit = (await this.performAllocation(resourceCapacity, allocationData, false, null, null)).arrAllocation;
      const objDailyAllocation: IPreStack = this.getAllocationPerDay(resourceCapacity, allocationData);
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

  /**
   * It calculates user capacity from existing array of capacity or generate new request if data does not exists
   */
  async recalculateUserCapacity(allocationData: IDailyAllocationTask): Promise<IUserCapacity> {
    const taskStatus = this.allocationCommon.taskStatus.indexOf(allocationData.status) > -1 ? this.allocationCommon.taskStatus : [];
    const adhoc = this.allocationCommon.adhocStatus;
    const resource = allocationData.resource.length ? allocationData.resource[0].UserNamePG.ID : -1;
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

  /**
   * Update task with new generated allocationperday string and other properties
   */
  setAllocationPerDay(allocation: IPreStack, task: IMilestoneTask): void {
    task.allocationPerDay = allocation.allocationPerDay;
    task.showAllocationSplit = new Date(task.pUserStartDatePart).getTime() !== new Date(task.pUserEndDatePart).getTime() ? true : false;
    task.edited = true;
    task.allocationColor = allocation.allocationType === 'Equal allocation per day' ? 'indianred' : '';
  }
}
