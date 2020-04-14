import { Component, OnInit } from '@angular/core';
import { IDailyAllocationTask, ICapacity } from '../interface/allocation';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-daily-allocation',
  templateUrl: './daily-allocation.component.html',
  styleUrls: ['./daily-allocation.component.css']
})
export class DailyAllocationComponent implements OnInit {
  public cols: any[];
  public resourceCapacity: any;
  public newAllocation = [];
  public allocationType = '';
  public hideTable = false;
  public hideLoader = false;
  constructor(private usercapacityComponent: UsercapacityComponent, private popupData: DynamicDialogConfig,
    private common: CommonService, private datePipe: DatePipe, public popupConfig: DynamicDialogRef) { }

  ngOnInit() {
    this.cols = [
      { field: 'Date', header: 'Date' },
      { field: 'Allocation', header: 'Hours' }
    ];
    const allocationData: IDailyAllocationTask = this.popupData.data;
    this.resourceCapacity = {};
    if (allocationData) {
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
    const isDailyAllocationValid = !allocationData.allocationType ? this.checkDailyAllocation(resource, allocationData.budgetHrs) : false;
    if (!isDailyAllocationValid) {
      await this.equalSplitAllocation(allocationData);
      this.allocationType = objAllocation.allocationType = 'Equal Split';
    } else {
      this.allocationType = objAllocation.allocationType = 'Daily Allocation';
    }
    objAllocation = this.getAllocationPerDay(allocationData);
    return objAllocation;
  }

  getAllocation(resource, strAllocation): void {
    this.newAllocation.length = 0;
    const sliderMaxHrs: number = resource.maxHrs ? resource.maxHrs + 4 : 0;
    const allocationDays = strAllocation.split(/\n/);
    allocationDays.forEach(day => {
      if (day) {
        const arrDateTime: string[] = day.indexOf(':') > -1 ? day.split(':') : [];
        const date: Date = arrDateTime.length ? new Date(arrDateTime[0]) : new Date();
        const time: string = arrDateTime.length > 1 ? arrDateTime[1] + ':' + arrDateTime[2] : '';
        const resourceDailyAllocation: any[] = resource.dates;
        const allocatedDate: any = resourceDailyAllocation.find(d => d.date.getTime() === date.getTime());
        const resourceSliderMaxHrs: number = this.getResourceSliderMaxHrs(sliderMaxHrs, allocatedDate);
        const hrsMins = this.common.convertFromHrsMins(time);
        const obj = {
          Date: date,
          Allocation: {
            valueHrs: this.getHrsMinsObj(hrsMins, false).hours,
            valueMins: this.getHrsMinsObj(hrsMins, false).mins,
            maxHrs: this.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
            maxMins: 75
          }
        };
        this.newAllocation.push(obj);
      }
    });
  }

  getHrsMinsObj(hrs: number, isSliderRange: boolean): any {
    const strhrs = '' + hrs;
    const hours = strhrs.indexOf('.') > -1 ? +strhrs.split('.')[0] : +strhrs;
    const mins = strhrs.indexOf('.') > -1 ? +strhrs.split('.')[1] === 5 ? 50 : +strhrs.split('.')[1] : isSliderRange ? 75 : 0;
    return {
      hours, mins
    };
  }

  checkDailyAllocation(resource, budgetHrs: string): boolean {
    const maxLimit = resource.maxHrs + 2;
    let maxAvailableHrs = resource.maxHrs;
    let remainingBudgetHrs: string;
    let extraHrs = '0:0';
    while (maxAvailableHrs <= maxLimit) {
      remainingBudgetHrs = '' + budgetHrs;
      remainingBudgetHrs = this.checkResourceAvailability(resource, extraHrs, remainingBudgetHrs);
      if (remainingBudgetHrs.indexOf('-') > -1) {
        extraHrs = this.common.addHrsMins([extraHrs, '0:30']);
        maxAvailableHrs = maxAvailableHrs + 0.5;
      } else {
        break;
      }
    }
    return remainingBudgetHrs.indexOf('-') < 0 ? true : false;
  }

  async getResourceCapacity(task: IDailyAllocationTask) {
    const oCapacity = await this.usercapacityComponent.applyFilterReturn(task.startDate, task.endDate, task.resource, [task]);
    const resource = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    return resource;
  }

  checkResourceAvailability(resource, extraHrs, taskBudgetHrs): string {
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
    const resourceSliderMaxHrs = resource.maxHrs + 4;
    let newBudgetHrs = '0';
    this.newAllocation.length = 0;
    let flag = true;
    for (const detail of resourceDailyDetails) {
      const obj = {
        Date: detail.date,
        Allocation: {
          valueHrs: 0,
          valueMins: 0,
          maxHrs: this.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
          maxMins: 75 // this.getHrsMinsObj(resourceSliderMaxHrs, true).mins,
        }
      };
      if (flag) {
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs ? availableHrs : this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        const numhrs = this.getResourceSliderMaxHrs(resourceSliderMaxHrs, detail);
        obj.Allocation.maxHrs = this.getHrsMinsObj(numhrs, true).hours;
        obj.Allocation.maxMins = 75; // this.getHrsMinsObj(numhrs, true).mins;
        if (newBudgetHrs.indexOf('-') > -1) {
          const numAvailableHrs = this.common.convertFromHrsMins(availableHrs);
          obj.Allocation.valueHrs = this.getHrsMinsObj(numAvailableHrs, false).hours;
          obj.Allocation.valueMins = this.getHrsMinsObj(numAvailableHrs, false).mins;
          taskBudgetHrs = newBudgetHrs;
        } else {
          const budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          const value = this.common.convertFromHrsMins(budgetHrs);
          obj.Allocation.valueHrs = this.getHrsMinsObj(value, false).hours;
          obj.Allocation.valueMins = this.getHrsMinsObj(value, false).mins;
          flag = false;
        }
      }
      this.newAllocation.push(obj);
    }
    return newBudgetHrs;
  }

  getResourceSliderMaxHrs(defaultResourceMaxHrs, day): number {
    const numtotalAllocated = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    return this.common.roundToPrecision(defaultResourceMaxHrs - numtotalAllocated, 0.5);
  }

  getDailyAvailableHours(resourceAvailableHrs: string, budgetHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  async equalSplitAllocation(allocationData: IDailyAllocationTask) {
    this.newAllocation.length = 0;
    const businessDays = this.common.calcBusinessDays(allocationData.startDate, allocationData.endDate);
    const budgetHours = +allocationData.budgetHrs;
    const allocationPerDay = this.common.roundToPrecision(budgetHours / businessDays, 0.5);
    const resource = Object.keys(this.resourceCapacity).length ? this.resourceCapacity : await this.getResourceCapacity(allocationData);
    const resourceSliderMaxHrs = resource.maxHrs + 4;
    const resourceDailyDetails = resource.dates.filter(d => d.userCapacity !== 'Leave');
    let remainingBudgetHrs = budgetHours;
    for (const detail of resourceDailyDetails) {
      const totalHrs = allocationPerDay < remainingBudgetHrs ? allocationPerDay : remainingBudgetHrs;
      const maximumHrs = totalHrs < resourceSliderMaxHrs ? resourceSliderMaxHrs : totalHrs;
      remainingBudgetHrs = remainingBudgetHrs - allocationPerDay;
      const obj = {
        Date: detail.date,
        Allocation: {
          valueHrs: this.getHrsMinsObj(totalHrs, false).hours,
          valueMins: this.getHrsMinsObj(totalHrs, false).mins,
          maxHrs: this.getHrsMinsObj(maximumHrs, true).hours,
          maxMins: 75 // this.getHrsMinsObj(maximumHrs, true).mins,
        }
      };
      this.newAllocation.push(obj);
    }
  }

  getAllocationPerDay(allocationData): { allocationPerDay, allocationAlert, allocationType } {
    let allocationPerDay = '';
    this.newAllocation.forEach(element => {
      allocationPerDay = allocationPerDay + this.datePipe.transform(element.Date, 'EE,MMMd,y') + ':' +
        this.common.convertToHrsMins('' + (element.Allocation.valueHrs + element.Allocation.valueMins / 100)) + '\n';
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
    const allocationData: IDailyAllocationTask = this.popupData.data;
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
      const numHrsMins = event.type === 'hrs' ? +event.value + changedDate.Allocation.valueMins / 100 : // +oldAvailableMins
        + +event.value + changedDate.Allocation.valueHrs; // +oldAvailableHrs
      const strChangedValue = this.common.convertToHrsMins('' + numHrsMins);
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
}
