import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { TaskAllocationConstantsService } from 'src/app/task-allocation/services/task-allocation-constants.service';
import { IUserCapacity } from '../../usercapacity/interface/usercapacity';
import { IDailyAllocationTask, IDailyAllocationObject, IPreStack, IPerformAllocationObject } from '../interface/prestack';
import { IMilestoneTask } from 'src/app/task-allocation/interface/allocation';
import { UserCapacitycommonService } from '../../usercapacity/service/user-capacitycommon.service';
import { abort } from 'process';

@Injectable({
  providedIn: 'root'
})
export class PreStackcommonService {

  constructor(
    private global: GlobalService,
    private common: CommonService, private datePipe: DatePipe,
    private allocationConstant: TaskAllocationConstantsService,
    private constants: ConstantsService,
    private userCapacityCommon: UserCapacitycommonService

  ) { }

  /**
  * Generate task data
  */
  getData(milestoneTask): any {
    const task = {
      ID: milestoneTask.id,
      task: milestoneTask.taskFullName,
      taskType: milestoneTask.Task ? milestoneTask.Task : milestoneTask.itemType,
      // tslint:disable: max-line-length
      startDatePart: milestoneTask.pUserStartDatePart ? milestoneTask.pUserStartDatePart : milestoneTask.UserStartDatePart ? milestoneTask.UserStartDatePart : milestoneTask.StartDatePart,
      endDatePart: milestoneTask.pUserEndDatePart ? milestoneTask.pUserEndDatePart : milestoneTask.UserEndDatePart ? milestoneTask.UserEndDatePart : milestoneTask.EndDatePart,
      startDate: milestoneTask.pUserStart ? milestoneTask.pUserStart : milestoneTask.UserStart ? milestoneTask.UserStart : milestoneTask.StartDate,
      endDate: milestoneTask.pUserEnd ? milestoneTask.pUserEnd : milestoneTask.UserEnd ? milestoneTask.UserEnd : milestoneTask.EndDate,
      budgetHrs: milestoneTask.budgetHours ? milestoneTask.budgetHours : milestoneTask.EstimatedTime ? milestoneTask.EstimatedTime : milestoneTask.Hours,
      startTime: milestoneTask.pUserStartTimePart ? milestoneTask.pUserStartTimePart : milestoneTask.UserStartTimePart ? milestoneTask.UserStartTimePart : milestoneTask.StartTimePart,
      endTime: milestoneTask.pUserEndTimePart ? milestoneTask.pUserEndTimePart : milestoneTask.UserEndTimePart ? milestoneTask.UserEndTimePart : milestoneTask.EndTimePart,
      status: milestoneTask.Status ? milestoneTask.Status : milestoneTask.status
    };
    return task;
  }

  /**
   * Action is performed to recalculate daily allocation on changes to either resource, dates or budget hours
   */
  async calcPrestackAllocation(resource: IUserCapacity[], milestoneTask) {
    milestoneTask.allocationTypeLoader = true;
    const task = this.getData(milestoneTask);
    const eqgTasks = ['EditSlot', 'QualitySlot', 'GraphicsSlot', 'Client Review', 'Send to client'];
    if (!eqgTasks.find(t => t === task.taskType) && task.startDatePart &&
      resource.length && task.endDatePart && +task.budgetHrs &&
      task.endDate > task.startDate && resource.length
      && new Date(task.startDatePart).getTime() !== new Date(task.endDatePart).getTime()) {
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
        strTimeSpent: milestoneTask.timeSpentPerDay,
        allocationType: ''
      };
      const resourceCapacity: IUserCapacity = await this.recalculateUserCapacity(allocationData);
      const allocationSplit = await this.performAllocation(resourceCapacity, allocationData, false, null, null, []);
      const objDailyAllocation: IPreStack = this.getAllocationPerDay(resourceCapacity, allocationData, allocationSplit.arrAllocation);
      this.setAllocationPerDay(objDailyAllocation, milestoneTask);
      if (objDailyAllocation.allocationAlert) {
        milestoneTask.allocationAlert = true;
      }
    } else {
      milestoneTask.showAllocationSplit = false;
      milestoneTask.allocationColor = '';
      milestoneTask.allocationPerDay = '';
    }
    milestoneTask.allocationTypeLoader = false;
  }

  /**
   * It calculates user capacity from existing array of capacity or generate new request if data does not exists
   */
  async recalculateUserCapacity(allocationData: IDailyAllocationTask): Promise<IUserCapacity> {
    let newUserCapacity = this.calcCapacity(allocationData);
    if (!newUserCapacity) {
      newUserCapacity = await this.refetchUserCapacity(allocationData);
      this.global.oCapacity.arrUserDetails.push(newUserCapacity);
      newUserCapacity = this.calcCapacity(allocationData);
    } else if (!newUserCapacity.dates.length) {
      const resource = allocationData.resource.length ? allocationData.resource[0].UserNamePG.ID : -1;
      newUserCapacity = await this.refetchUserCapacity(allocationData);
      const capacity = this.global.oCapacity.arrUserDetails.find(u => u.uid === resource);
      capacity.dates = [...capacity.dates, ...newUserCapacity.dates];
      capacity.businessDays = [...capacity.businessDays, ...newUserCapacity.businessDays];
      capacity.dates = this.removeAndSort(capacity.dates, 'date');
      capacity.businessDays = this.removeAndSortDate(capacity.businessDays);
      newUserCapacity = this.calcCapacity(allocationData);
    }
    return newUserCapacity;
  }

  removeAndSortDate(arrValues) {
    let uniqueArray = arrValues
      .map(function (date) { return date.getTime() })
      .filter(function (date, i, array) {
        return array.indexOf(date) === i;
      })
      .map(function (time) { return new Date(time); });

    uniqueArray = uniqueArray.sort((a, b) => a - b);

    return uniqueArray
  }

  removeAndSort(arrValues, sColumnNames) {
    let uniqueArray = arrValues.sort((a, b) => a[sColumnNames] - b[sColumnNames]);

    const uniqueArrayNew = [];

    // Loop through array values
    for (var value of uniqueArray) {
      const findIndex = uniqueArrayNew.findIndex(e => e[sColumnNames].getTime() === value[sColumnNames].getTime())
      if (findIndex == -1) {
        uniqueArrayNew.push(value);
      } else {
        uniqueArrayNew[findIndex] = value;
      }
    }
    return uniqueArrayNew;
  }

  calcCapacity(allocationData): IUserCapacity {
    const taskStatus = this.allocationConstant.taskStatus;
    // const taskStatus = this.allocationConstant.taskStatus.indexOf(allocationData.status) > -1 ? this.allocationConstant.taskStatus : [];
    const adhoc = this.allocationConstant.adhocStatus;
    const resource = allocationData.resource.length ? allocationData.resource[0].UserNamePG.ID ? allocationData.resource[0].UserNamePG.ID : allocationData.resource[0].UserNamePG.Id : -1;
    const businessDays = this.userCapacityCommon.getDates(allocationData.startDate, allocationData.endDate, true);
    let newUserCapacity;
    if (this.global.oCapacity.arrUserDetails.length) {

      const resourceCapacity = this.global.oCapacity.arrUserDetails.find(u => u && u.uid === resource);
      if (resourceCapacity) {
        newUserCapacity = JSON.parse(JSON.stringify(resourceCapacity));
        newUserCapacity.businessDays = businessDays.dateArray;
        // tslint:disable-next-line: max-line-length
        const dates = newUserCapacity.dates.filter(u => businessDays.dateArray.find(b => new Date(b).getTime() === new Date(u.date).getTime()));
        for (const date of dates) {
          date.tasksDetails = this.filterTasks(date.tasksDetails, taskStatus, adhoc);
          // date.tasksDetails = date.tasksDetails.filter(t => (taskStatus.indexOf(t.status) < 0));
          // date.tasksDetails = date.tasksDetails.filter(t => ((t.TaskType === 'Adhoc' && adhoc.indexOf(t.comments) < 0)));
        }
        newUserCapacity.dates = [...new Set(dates)];
        newUserCapacity.tasks = this.filterTasks(newUserCapacity.tasks, taskStatus, adhoc);
        // newUserCapacity.tasks = newUserCapacity.tasks.filter(t => (taskStatus.indexOf(t.Status) < 0 || (t.Task === 'Adhoc' && adhoc.indexOf(t.CommentsMT) < 0))
        //                                                       && t.ID !== allocationData.ID);
        if (newUserCapacity.dates.length === newUserCapacity.businessDays.length) {
          newUserCapacity = this.userCapacityCommon.fetchUserCapacity(newUserCapacity);
        } else {
          newUserCapacity.dates = [];
        }
      }
    }
    return newUserCapacity;
  }

  filterTasks(tasks, taskFilter, adhocFilter) {
    tasks = tasks.filter(t => taskFilter.indexOf(t.status ? t.status : t.Status) < 0);
    tasks = tasks.filter(t => adhocFilter.indexOf(t.comments ? t.comments : t.CommentsMT) < 0);
    return tasks;

  }
  async refetchUserCapacity(allocationData) {
    const endDate = this.common.calcBusinessDate('Next', 90, allocationData.startDate).endDate;
    const newObj = JSON.parse(JSON.stringify(allocationData));
    newObj.endDate = endDate;
    const newUserCapacity = await this.getResourceCapacity(newObj);
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

  /**
   * Perform prestack allocation or equal split allocation
   */
  async performAllocation(resource: IUserCapacity, allocationData: IDailyAllocationTask,
    allocationChanged: boolean, oldValue, oldAllocation, allocationSplit): Promise<IPerformAllocationObject> {
    let arrAllocation = JSON.parse(JSON.stringify(allocationSplit));
    allocationSplit = !allocationData.allocationType ? await this.checkDailyAllocation(resource, allocationData) : [];
    if (!allocationSplit.length) {
      if (allocationChanged) {
        await this.common.confirmMessageDialog('Confirmation', 'Cant accommodate pending hours on the subsequent days so equal allocation will be done. Should we do equal allocation ?', null,
          ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
              arrAllocation = await this.equalSplitAllocation(resource, allocationData, true);
              allocationData.allocationType = 'Equal allocation per day';
            }
          });
      } else {
        arrAllocation = await this.equalSplitAllocation(resource, allocationData, false);
        allocationData.allocationType = 'Equal allocation per day';
      }
    } else {
      arrAllocation = [...allocationSplit];
      allocationData.allocationType = 'Daily Allocation';
    }
    return {
      arrAllocation,
      allocationType: allocationData.allocationType
    };
  }

  /**
   * Perform daily allocation - part 1
   *
   */
  async checkDailyAllocation(resource: IUserCapacity, allocationData: IDailyAllocationTask) {
    const autoAllocateAddHrs = '0:30';
    let extraHrs = '0:0';
    let allocationSplit = [];
    const maxLimit = +resource.maxHrs + 2;
    const budgetHrs: number = +allocationData.budgetHrs;
    let maxAvailableHrs = +resource.maxHrs;
    let remainingBudgetHrs: string;
    while (maxAvailableHrs <= maxLimit) {
      const resourceCapacity = JSON.parse(JSON.stringify(resource));
      remainingBudgetHrs = '' + budgetHrs;
      const obj = await this.checkResourceAvailability(resourceCapacity, extraHrs, remainingBudgetHrs, allocationData, maxLimit);
      remainingBudgetHrs = obj.newBudgetHrs;
      if (remainingBudgetHrs.indexOf('-') > -1) {
        extraHrs = this.common.addHrsMins([extraHrs, autoAllocateAddHrs]);
        maxAvailableHrs = maxAvailableHrs + 0.5;
      } else {
        allocationSplit = obj.allocationSplit;
        break;
      }
    }
    return remainingBudgetHrs.indexOf('-') < 0 ? allocationSplit : [];
  }
  /**
   * Fetch user capacity based task start and end date
   */
  async getResourceCapacity(task: IDailyAllocationTask): Promise<IUserCapacity> {
    // const taskStatus: string[] = this.allocationConstant.taskStatus.indexOf(task.status) > -1 ? this.allocationConstant.taskStatus : [];
    // tslint:disable-next-line: max-line-length
    const oCapacity = await this.userCapacityCommon.factoringTimeForAllocation(task.startDate, task.endDate, task.resource, [task], this.allocationConstant.taskStatus, this.allocationConstant.adhocStatus);
    const resource: IUserCapacity = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    return resource;
  }

  /**
   * Main method performing pre stack allocation
   */
  async checkResourceAvailability(resource: IUserCapacity, extraHrs: string, taskBudgetHrs: string,
    allocationData: IDailyAllocationTask, maxLimit: number) {
    const resourceDailyDetails = resource.dates.filter(d => [0, 6].indexOf(new Date(d.date).getDay()) < 0); // .filter(d => d.userCapacity !== 'Leave');
    const boundaries = this.getDayAvailibilty(resourceDailyDetails, allocationData, 0);
    const sliderMaxHrs: number = +resource.maxHrs + 3.75;
    const strsliderMaxHrs: string = this.common.convertToHrsMins(sliderMaxHrs);
    let newBudgetHrs = '0:0';
    const allocationSplit = [];
    let flag = true;
    let i = 0;
    for (const detail of resourceDailyDetails) {
      let availableHrs = '0:0';
      const isLast = i === resourceDailyDetails.length - 1 ? true : false;
      const resourceSliderMaxHrs: string = this.getResourceMaxHrs(strsliderMaxHrs, i, boundaries, isLast);
      const obj = this.getPrestackObject(detail, null, allocationData.strTimeSpent);
      this.setSliderValue(resourceSliderMaxHrs, obj.Allocation, true, '0');
      if (flag && (detail.userCapacity !== 'Leave' || detail.mandatoryHrs)) {
        if (i === 0) {
          availableHrs = this.getAvailableHours(boundaries.strFirstAvailablity, detail, maxLimit, extraHrs);
        } else if (i === resourceDailyDetails.length - 1) {
          availableHrs = this.getAvailableHours(boundaries.strLastAvailability, detail, maxLimit, extraHrs);
        } else {
          availableHrs = this.getAvailableHours(null, detail, maxLimit, extraHrs);
        }
        newBudgetHrs = this.getCalculatedRemainingHours(availableHrs, taskBudgetHrs);
        let sliderValue = availableHrs;
        if (newBudgetHrs.indexOf('-') > -1) {
          taskBudgetHrs = newBudgetHrs;
        } else {
          let budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          budgetHrs = budgetHrs.indexOf('.') > -1 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
          sliderValue = budgetHrs;
          flag = false;
        }
        this.setSliderValue(sliderValue, obj.Allocation, false, '0');
        this.setSliderValue(resourceSliderMaxHrs, obj.Allocation, true, sliderValue);
      }
      allocationSplit.push(obj);
      i++;
    }
    return { newBudgetHrs, allocationSplit };
  }

  getPrestackObject(resDayCapacity, valueHrsMin, strTimeSpent) {
    const timeSpent: number = this.common.getTimeSpent(strTimeSpent, resDayCapacity.date);
    const obj: IDailyAllocationObject = {
      Date: new Date(resDayCapacity.date),
      Allocation: {
        valueHrs: valueHrsMin ? valueHrsMin.hours : 0,
        valueMins: valueHrsMin ? valueHrsMin.mins : 0,
        maxHrs: 11,
        maxMins: 45
      },
      timeSpent,
      tasks: resDayCapacity.tasksDetails,
      hideTasksTable: true,
      leave: resDayCapacity.userCapacity === 'Leave' ? true : false
    };
    return obj;
  }

  getAvailableHours(dayAvailableHrs: string, dayResourceCapacity: any, maxLimit: number, extraHrs: string): string {
    let availableHrs = dayResourceCapacity.availableHrs;
    if (dayAvailableHrs) {
      const dateHrsAvailable = this.compareHrs(dayAvailableHrs, availableHrs);
      if (dateHrsAvailable <= 0.25) {
        availableHrs = dayAvailableHrs;
        dayResourceCapacity.mandatoryHrs = true;
      }
    }
    availableHrs = availableHrs.indexOf('-') > -1 ? '0:0' : availableHrs;
    availableHrs = dayResourceCapacity.mandatoryHrs || dayResourceCapacity.totalTimeAllocated >= maxLimit ? availableHrs :
      this.common.addHrsMins([availableHrs, extraHrs]);
    return availableHrs;
  }

  setSliderValue(budgetHrs: string, sliderObject: any, isMaxHrs: boolean, sliderValue: string) {
    const allocatedValue = this.common.getHrsMinsObj(budgetHrs, false);
    if (isMaxHrs) {
      const sliderHours = this.common.getHrsMinsObj(sliderValue, false);
      const show45Mins = sliderHours.hours < allocatedValue.hours ? true : false;
      sliderObject.maxHrs = allocatedValue.hours;
      sliderObject.maxMins = show45Mins ? 45 : allocatedValue.mins;
    } else {
      sliderObject.valueHrs = allocatedValue.hours;
      sliderObject.valueMins = allocatedValue.mins;
    }
  }

  /**
   * This return true if first parameter is less than equal to second element
   */
  compareHrs(firstElement: string, secondElement: string): number {
    // const result = this.common.convertFromHrsMins(firstElement) <= this.common.convertFromHrsMins(secondElement) ? true : false;
    // return result;
    const result = this.common.subtractHrsMins(firstElement, secondElement, true);
    return this.common.convertFromHrsMins(result);
  }

  /**
   * Subtracts remaining budget hours from available hours in day
   * @param resourceAvailableHrs - available hours in day
   * @param budgetHrs - remaining budget of task in day
   */
  getCalculatedRemainingHours(resourceAvailableHrs: string, budgetHrs: string): string {
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
    const budgetHours = +allocationData.budgetHrs;
    const resourceCapacity = JSON.parse(JSON.stringify(resourceCapacityCopy));
    const sliderMaxHrs = this.common.convertToHrsMins(resourceCapacity.maxHrs + 3.75);
    const resourceDailyDetails = resourceCapacity.dates.filter(d => [0, 6].indexOf(new Date(d.date).getDay()) < 0); // .filter(d => d.userCapacity !== 'Leave');
    const businessDays = resourceCapacity.dates.filter(d => d.userCapacity !== 'Leave').length; // resourceDailyDetails.length;
    const allocationPerDay = this.common.roundToPrecision(budgetHours / businessDays, 0.25);
    const availaibility = this.getDayAvailibilty(resourceDailyDetails, allocationData, allocationPerDay);
    const lastDayUnavailable = availaibility.lastDayAvailability < allocationPerDay ? true : false;
    const noOfDays = businessDays > availaibility.days ? (businessDays - availaibility.days) : businessDays;
    let calcBudgetHrs = lastDayUnavailable && noOfDays > 1 ? budgetHours - availaibility.lastDayAvailability : budgetHours;
    calcBudgetHrs = availaibility.firstDayAvailablity < allocationPerDay ? calcBudgetHrs - availaibility.firstDayAvailablity :
      calcBudgetHrs;
    const newAllocationPerDay = this.common.roundToPrecision(calcBudgetHrs / noOfDays, 0.25);
    // calcBudgetHrs !== budgetHours ? this.common.roundToPrecision(calcBudgetHrs / noOfDays, 0.25) : allocationPerDay;
    let remainingBudgetHrs = lastDayUnavailable ? calcBudgetHrs : budgetHours;
    let i = 0;
    for (const detail of resourceDailyDetails) {
      let totalHrs = 0;
      if (detail.userCapacity !== 'Leave') {
        if (i === 0) {
          totalHrs = availaibility.firstDayAvailablity < newAllocationPerDay ? availaibility.firstDayAvailablity : newAllocationPerDay;
          totalHrs = resourceDailyDetails.length === 2 && availaibility.lastDayAvailability < newAllocationPerDay ? remainingBudgetHrs - availaibility.lastDayAvailability : totalHrs;
        } else if (i === resourceDailyDetails.length - 1) {
          totalHrs = lastDayUnavailable ? availaibility.lastDayAvailability : remainingBudgetHrs;
          // totalHrs = availaibility.lastDayAvailability < remainingBudgetHrs ? availaibility.lastDayAvailability : remainingBudgetHrs;
        } else {
          totalHrs = newAllocationPerDay < remainingBudgetHrs ? newAllocationPerDay : remainingBudgetHrs <= 24 ? remainingBudgetHrs : 24;
        }
        remainingBudgetHrs = remainingBudgetHrs - totalHrs;
      }
      const strTotalHrs = this.common.convertToHrsMins(totalHrs);
      const valueHrsMins = this.common.getHrsMinsObj(strTotalHrs, false);
      const obj = this.getPrestackObject(detail, valueHrsMins, allocationData.strTimeSpent);
      const isLast = i === resourceDailyDetails.length - 1 ? true : false;
      const resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, i, availaibility, isLast);
      this.setSliderValue(resourceSliderMaxHrs, obj.Allocation, true, strTotalHrs);
      arrAllocation.push(obj);
      i++;
    }
    if (allocationChanged) {
      this.common.showToastrMessage(this.constants.MessageType.info, 'Equal allocation performed. Please assign budget hours from first row if change is needed.', true);
    }
    return arrAllocation;
  }

  /**
   * Check if equal splitted hours is available on start and end day
   */
  getDayAvailibilty(resDatesCapacity, allocationData: IDailyAllocationTask, allocationPerDay: number) {
    let count = 0;
    const resNoLeaveCapacity = resDatesCapacity.filter(leaveCap => leaveCap.userCapacity !== 'Leave');
    const startDate = resNoLeaveCapacity.find(rc => new Date(rc.date).getTime() === new Date(allocationData.startDate).getTime());
    const endDate = resNoLeaveCapacity.find(rc => new Date(rc.date).getTime() === new Date(allocationData.endDate).getTime());
    const startTime = allocationData.startTime ? this.common.convertFromHrsMins(this.common.convertTo24Hour(startDate ? allocationData.startTime : '0')) : 0;
    const endTime = allocationData.endTime ? this.common.convertFromHrsMins(this.common.convertTo24Hour(endDate ? allocationData.endTime : '0')) : 0;
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
      strFirstAvailablity: this.common.convertToHrsMins(availableStartDayHrs),
      strLastAvailability: this.common.convertToHrsMins(availableEndDayHrs),
      days: count
    };
  }

  /**
   * generate string of allocationperday from array of allocation
   */
  getAllocationPerDay(resourceCapacity: IUserCapacity, allocationData: IDailyAllocationTask, allocationSplit): IPreStack {
    let allocationPerDay = '';
    for (const element of allocationSplit) {
      allocationPerDay = allocationPerDay + this.datePipe.transform(new Date(element.Date), 'EE,MMMd,y') + ':' +
      element.Allocation.valueHrs + ':' + element.Allocation.valueMins + '\n';
    }
    const availableHours = this.common.convertFromHrsMins(resourceCapacity.totalUnAllocated);
    const allocationAlert =  +availableHours < +allocationData.budgetHrs ? true : false;
    // (new Date(allocationData.startDate).getTime() === new Date(allocationData.endDate).getTime()
    return ({
      allocationPerDay,
      allocationAlert,
      allocationType: allocationData.allocationType ? allocationData.allocationType : 'Equal allocation per day'
    });
  }

  /**
   * Fetch preallocated allocation per day for each task or perform allocation
   */
  async initialize(resource: IUserCapacity, allocationData: IDailyAllocationTask): Promise<IDailyAllocationObject[]> {
    let allocationSplit: IDailyAllocationObject[];
    if (allocationData.strAllocation && !allocationData.allocationType) {
      allocationSplit = this.showAllocation(resource, allocationData);
    } else {
      const arrAllocation: IPerformAllocationObject = await this.performAllocation(resource, allocationData, false, null, null, []);
      allocationSplit = arrAllocation.arrAllocation;
    }
    return allocationSplit;
  }

  /**
   * show allocation per day in popup with slider
   */
  showAllocation(resource: IUserCapacity, allocationData: IDailyAllocationTask): IDailyAllocationObject[] {
    const arrAllocation = [];
    const resourceDailyAllocation: any[] = resource.dates.filter(d => [0, 6].indexOf(new Date(d.date).getDay()) < 0);
    const sliderMaxHrs: string = resource.maxHrs ? this.common.convertToHrsMins(+resource.maxHrs + 3.75) : '0:0';
    const allocationDays = allocationData.strAllocation.split(/\n/).filter(Boolean);
    let index = 0;
    for (const day of allocationDays) {
      if (day) {
        const isLast = index === allocationDays.length - 1 ? true : false;
        const allocation = this.common.getDateTimeFromString(day);
        const strAllocatedValue = this.common.convertToHrsMins(allocation.value.hours + ':' + allocation.value.mins);
        const allocatedDate: any = resourceDailyAllocation.find(d => new Date(d.date).getTime() === allocation.date.getTime());
        const dayDetail = {
          date: allocation.date,
          tasksDetails: allocatedDate.tasksDetails,
          userCapacity: allocatedDate.userCapacity
        };
        if (allocatedDate) {
          const boundaries = this.getDayAvailibilty(resourceDailyAllocation, allocationData, 0);
          const resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, index, boundaries, isLast);
          const obj = this.getPrestackObject(dayDetail, allocation.value, allocationData.strTimeSpent);
          this.setSliderValue(resourceSliderMaxHrs, obj.Allocation, true, strAllocatedValue);
          arrAllocation.push(obj);
        }
      }
      index++;
    }
    // allocationDays.forEach((day, index) => {
    //   if (day) {
    //     const isLast = index === allocationDays.length - 1 ? true : false;
    //     const allocation = this.common.getDateTimeFromString(day);
    //     const strAllocatedValue = this.common.convertToHrsMins(allocation.value.hours + ':' + allocation.value.mins);
    //     const allocatedDate: any = resourceDailyAllocation.find(d => new Date(d.date).getTime() === allocation.date.getTime());
    //     const dayDetail = {
    //       date: allocation.date,
    //       tasksDetails: allocatedDate.tasksDetails,
    //       userCapacity: allocatedDate.userCapacity
    //     };
    //     if (allocatedDate) {
    //       const boundaries = this.getDayAvailibilty(resourceDailyAllocation, allocationData, 0);
    //       const resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, index, boundaries, isLast);
    //       const obj = this.getPrestackObject(dayDetail, allocation.value, allocationData.strTimeSpent);
    //       this.setSliderValue(resourceSliderMaxHrs, obj.Allocation, true, strAllocatedValue);
    //       arrAllocation.push(obj);
    //     }
    //   }
    // });
    return arrAllocation;
  }

  /**
   * Fetch maximum hours for slider
   */
  getResourceMaxHrs(defaultResourceMaxHrs: string, index: number, boundaries, isLast): string {
    let maxHrs = defaultResourceMaxHrs;
    if (index === 0) {
      maxHrs = this.compareHrs(boundaries.strFirstAvailablity, defaultResourceMaxHrs) < 0 ?
               boundaries.strFirstAvailablity : defaultResourceMaxHrs;
    } else if (isLast) {
      maxHrs = this.compareHrs(boundaries.strLastAvailability, defaultResourceMaxHrs) < 0 ?
               boundaries.strLastAvailability : defaultResourceMaxHrs;
    }
    return maxHrs;
  }
}
