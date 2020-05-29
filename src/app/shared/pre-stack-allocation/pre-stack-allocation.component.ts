import { Component, OnInit } from '@angular/core';
import { DailyAllocationTask, DailyAllocationObject } from './interface/prestack';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { TaskAllocationCommonService } from 'src/app/task-allocation/services/task-allocation-common.service'

@Component({
  selector: 'app-pre-stack-allocation',
  templateUrl: './pre-stack-allocation.component.html',
  styleUrls: ['./pre-stack-allocation.component.css'],
  providers: [UsercapacityComponent]
})
export class PreStackAllocationComponent implements OnInit {
  public cols: any[];
  public resourceCapacity: any;
  public newAllocation = [];
  public allocationType = '';
  public hideTable = false;
  public hideLoader = false;
  public hideTasks = true;
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
    public allocationCommon: TaskAllocationCommonService, public messageService: MessageService) { }

  ngOnInit() {
    this.cols = [
      { field: 'Date', header: 'Date' },
      { field: 'Allocation', header: 'Hours' }
    ];
    const allocationData: DailyAllocationTask = this.popupData.data;
    this.resourceCapacity = {};
    if (allocationData && allocationData.resource.length && allocationData.startDate && allocationData.endDate) {
      this.showLoader();
      setTimeout(async () => {
        this.resourceCapacity = await this.getResourceCapacity(allocationData);

        await this.initialize(this.resourceCapacity, allocationData);
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
    if (allocationData.strAllocation && !allocationData.allocationType) {
      this.getAllocation(resource, allocationData.strAllocation);
    } else {
      objAllocation = await this.performAllocation(resource, allocationData);
    }
    return objAllocation;
  }

  async performAllocation(resource, allocationData) {
    let objAllocation = {
      allocationPerDay: '',
      allocationAlert: false,
      allocationType: ''
    };
    const isDailyAllocationValid = !allocationData.allocationType ? this.checkDailyAllocation(resource, allocationData) : false;
    if (!isDailyAllocationValid) {
      await this.equalSplitAllocation(allocationData);
      this.allocationType = objAllocation.allocationType = 'Over allocation';
    } else {
      this.allocationType = objAllocation.allocationType = 'Daily Allocation';
    }
    objAllocation = this.getAllocationPerDay(allocationData);
    return objAllocation;
  }

  getAllocation(resource, strAllocation): void {
    this.newAllocation.length = 0;
    const sliderMaxHrs: number = resource.maxHrs ? resource.maxHrs + 3 : 0;
    const allocationDays = strAllocation.split(/\n/);
    allocationDays.forEach(day => {
      if (day) {
        const resourceDailyAllocation: any[] = resource.dates;
        const allocation = this.common.getDateTimeFromString(day);
        const allocatedDate: any = resourceDailyAllocation.find(d => d.date.getTime() === allocation.date.getTime());
        let resourceSliderMaxHrs: string = this.getResourceMaxHrs(sliderMaxHrs, allocatedDate, allocation.value.hours);
        resourceSliderMaxHrs = resourceSliderMaxHrs.indexOf('-') > -1 ? '0:0' : resourceSliderMaxHrs;
        const obj: DailyAllocationObject = {
          Date: allocation.date,
          Allocation: {
            valueHrs: allocation.value.hours,
            valueMins: allocation.value.mins,
            maxHrs: this.common.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
            maxMins: 45
          },
          tasks: allocatedDate.tasksDetails,
          hideTasksTable: true
        };
        this.newAllocation.push(obj);
      }
    });
  }

  checkDailyAllocation(resource, allocationData): boolean {
    const autoAllocateAddHrs = '0:30';
    let extraHrs = '0:0';
    const maxLimit = resource.maxHrs + 2;
    const budgetHrs: number = allocationData.budgetHrs;
    let maxAvailableHrs = resource.maxHrs;
    let remainingBudgetHrs: string;
    while (maxAvailableHrs <= maxLimit) {
      remainingBudgetHrs = '' + budgetHrs;
      remainingBudgetHrs = this.checkResourceAvailability(resource, extraHrs, remainingBudgetHrs, allocationData);
      if (remainingBudgetHrs.indexOf('-') > -1) {
        extraHrs = this.common.addHrsMins([extraHrs, autoAllocateAddHrs]);
        maxAvailableHrs = maxAvailableHrs + 0.5;
      } else {
        break;
      }
    }
    return remainingBudgetHrs.indexOf('-') < 0 ? true : false;
  }

  async getResourceCapacity(task: DailyAllocationTask) {
    let taskStatus = [];
    taskStatus = task.status === 'Not Confirmed' || task.status === 'Not Saved' ? this.allocationCommon.taskStatus : [];
    const oCapacity = await this.usercapacityComponent.factoringTimeForAllocation(task.startDate, task.endDate, task.resource, [task], taskStatus, this.allocationCommon.adhocStatus);
    const resource = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    return resource;
  }

  checkResourceAvailability(resource, extraHrs, taskBudgetHrs, allocationData): string {
    const startTime = allocationData.startTime ? this.common.convertTo24Hour(allocationData.startTime) : '0:0';
    const endTime = allocationData.endTime ? this.common.convertTo24Hour(allocationData.endTime) : '0:0';
    const availableStartDayHrs = this.common.subtractHrsMins(startTime, '24:00', false);
    const availableEndDayHrs = this.common.convertTo24Hour(endTime);
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
    const resourceSliderMaxHrs = resource.maxHrs + 3;
    let newBudgetHrs = '0';
    this.newAllocation.length = 0;
    let flag = true;
    let i = 0;
    for (const detail of resourceDailyDetails) {
      const obj: DailyAllocationObject = {
        Date: detail.date,
        Allocation: {
          valueHrs: 0,
          valueMins: 0,
          maxHrs: this.common.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
          maxMins: 45
        },
        tasks: detail.tasksDetails,
        hideTasksTable: true
      };
      if (flag) {
        if (i === 0) {
          detail.availableHrs = this.compareHrs(availableStartDayHrs, detail) ? availableStartDayHrs : detail.availableHrs;
        } else if (i === resourceDailyDetails.length - 1) {
          detail.availableHrs = this.compareHrs(availableEndDayHrs, detail) ? availableEndDayHrs : detail.availableHrs;
        }
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs ? availableHrs : this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        const strAllocation = this.popupData.data && this.popupData.data.strAllocation ? this.popupData.data.strAllocation : '';
        const preAllocatedHrs = this.common.getAllocationByDate(detail.date, strAllocation, resourceSliderMaxHrs);
        const numhrs = this.getResourceMaxHrs(resourceSliderMaxHrs, detail, preAllocatedHrs);
        obj.Allocation.maxHrs = this.common.getHrsMinsObj(numhrs, true).hours;
        obj.Allocation.maxMins = 45;
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
    day.mandatoryHrs = result ? true : false;
    return result;
  }

  getResourceMaxHrs(defaultResourceMaxHrs, day, allocatedHours) {
    const numtotalAllocated = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    const availableHrs = defaultResourceMaxHrs - numtotalAllocated;
    const maxHrs = availableHrs < allocatedHours ? (defaultResourceMaxHrs + allocatedHours) - numtotalAllocated : availableHrs;
    const maxHrsMins = this.common.roundToPrecision(maxHrs, 0.25);
    return this.common.convertToHrsMins('' + maxHrsMins);
  }

  getDailyAvailableHours(resourceAvailableHrs: string, budgetHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  async equalSplitAllocation(allocationData: DailyAllocationTask) {
    this.newAllocation.length = 0;

    const businessDays = this.common.calcBusinessDays(allocationData.startDate, allocationData.endDate);
    const budgetHours = +allocationData.budgetHrs;
    let allocationPerDay = this.common.roundToPrecision(budgetHours / businessDays, 0.25);
    const resource = Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(allocationData);
    const resourceSliderMaxHrs = resource.maxHrs + 3;
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
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
      const obj: DailyAllocationObject = {
        Date: detail.date,
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
      allocationPerDay = allocationPerDay + this.datePipe.transform(element.Date, 'EE,MMMd,y') + ':' +
        element.Allocation.valueHrs + ':' + element.Allocation.valueMins + '\n';
    });
    const resourceCapacity = this.resourceCapacity.totalUnAllocated;
    const allocationAlert = (new Date(allocationData.startDate).getTime() === new Date(allocationData.endDate).getTime()
      && +allocationData.budgetHrs < 1 && +resourceCapacity < +allocationData.budgetHrs) ? true : false;
    return ({
      allocationPerDay,
      allocationAlert,
      allocationType: this.allocationType
    });
  }

  saveAllocation(): void {
    const allocationData: DailyAllocationTask = this.popupData.data;
    const objAllocation = this.getAllocationPerDay(allocationData);
    const allocationPerDay = objAllocation.allocationPerDay;
    const allocationAlert = objAllocation.allocationAlert;
    const allocationType = objAllocation.allocationType;
    this.popupConfig.close({ allocationPerDay, allocationAlert, allocationType });
  }

  async checkAllocation(event, changedDate) {
    const objData = this.popupData.data;
    objData.allocationType = '';
    this.resourceCapacity = Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(objData);
    const resourceDailyAllocation = this.resourceCapacity.dates;
    const resourceChangedDate = resourceDailyAllocation.find(d => d.date.getTime() === changedDate.Date.getTime());
    event.value = event.type ? event.value : event.selectedHour.time + ':' + event.selectedMinute.time;
    const strChangedValue = event.type ? event.type === 'hrs' ?
      event.value + ':' + changedDate.Allocation.valueMins :
      changedDate.Allocation.valueHrs + ':' + event.value : event.value;
    resourceChangedDate.availableHrs = strChangedValue;
    resourceChangedDate.mandatoryHrs = true;
    await this.performAllocation(this.resourceCapacity, objData);
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
}
