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
  public newAllocation = [];
  constructor(private usercapacityComponent: UsercapacityComponent, private popupData: DynamicDialogConfig,
    private common: CommonService, private datePipe: DatePipe, public popupConfig: DynamicDialogRef) { }

  async ngOnInit() {
    this.cols = [
      { field: 'Date', header: 'Date' },
      { field: 'Allocation', header: 'Hours' }
    ];
    const allocationData: IDailyAllocationTask = this.popupData.data;
    if (allocationData) {
      const resource = await this.getResourceCapacity(allocationData);
      this.initialize(resource, allocationData);
    }
  }

  async initialize(resource, allocationData): Promise<string> {
    let strAllocation = '';
    if (allocationData.strAllocation) {
      this.getAllocation(resource, allocationData.strAllocation);
    } else {
      const isDailyAllocationValid = this.checkDailyAllocation(resource, allocationData.budgetHrs);
      if (!isDailyAllocationValid) {
        await this.equalSplitAllocation(allocationData);
        this.popupData.header = this.popupData.header + '( Equal Split Allocation)';
      } else {
        this.popupData.header = this.popupData.header + '( Daily Allocation)';
      }
      strAllocation = this.getAllocationPerDay();
    }
    return strAllocation;
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
            maxMins: this.getHrsMinsObj(resourceSliderMaxHrs, true).mins
          }
        };
        this.newAllocation.push(obj);
      }
    });
  }

  getHrsMinsObj(hrs: number, isRange: boolean): any {
    const strhrs = '' + hrs;
    const hours = strhrs.indexOf('.') > -1 ? +strhrs.split('.')[0] : +strhrs;
    const mins = strhrs.indexOf('.') > -1 ? +('0.' + strhrs.split('.')[1]) :
      isRange ? 0.75 : 0;
    return {
      hours, mins
    };
  }

  checkDailyAllocation(resource, budgetHrs: string): boolean {
    const maxLimit = resource.maxHrs + 2;
    let maxAvailableHrs = resource.maxHrs;
    // const originalHeader = this.popupData.header;
    // this.popupData.header = originalHeader + '( Equal Split Allocation)';
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
    const resourceDailyDetails = resource.dates;
    const resourceSliderMaxHrs = resource.maxHrs + 4;
    let newBudgetHrs = '0';
    this.newAllocation.length = 0;
    let flag = true;
    for (const detail of resourceDailyDetails) {
      const mins = detail.totalTimeAllocatedPerDay;
      const hrsMins = this.common.convertFromHrsMins(mins);
      const obj = {
        Date: detail.date,
        Allocation: {
          valueHrs: this.getHrsMinsObj(hrsMins, false).hours,
          valueMins: this.getHrsMinsObj(hrsMins, false).mins,
          maxHrs: this.getHrsMinsObj(resourceSliderMaxHrs, true).hours,
          maxMins: this.getHrsMinsObj(resourceSliderMaxHrs, true).mins
        }
      };
      if (flag) {
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs ? availableHrs : this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        obj.Allocation.maxHrs = this.getResourceSliderMaxHrs(resourceSliderMaxHrs, detail);
        if (newBudgetHrs.indexOf('-') > -1) {
          // const availableMins = this.common.calculateTotalMins(availableHrs);
          const numAvailableHrs = this.common.convertFromHrsMins(availableHrs);
          obj.Allocation.valueHrs = this.getHrsMinsObj(numAvailableHrs, false).hours;
          obj.Allocation.valueMins = this.getHrsMinsObj(numAvailableHrs, false).mins;
          taskBudgetHrs = newBudgetHrs;
        } else {
          const budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          // totalMins = this.common.calculateTotalMins(budgetHrs);
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
    // const totalAllocatedMins = this.common.calculateTotalMins(day.totalTimeAllocatedPerDay);
    const numtotalAllocated = this.common.convertFromHrsMins(day.totalTimeAllocatedPerDay);
    return defaultResourceMaxHrs - numtotalAllocated;
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
    const resource = await this.getResourceCapacity(allocationData);
    const resourceSliderMaxHrs = resource.maxHrs + 4;
    const resourceDailyDetails = resource.dates;
    let remainingBudgetHrs = budgetHours;
    for (const detail of resourceDailyDetails) {
      remainingBudgetHrs = remainingBudgetHrs - allocationPerDay;
      const totalHrs = allocationPerDay < remainingBudgetHrs ? allocationPerDay : remainingBudgetHrs;
      const maximumHrs = totalHrs < resourceSliderMaxHrs ? resourceSliderMaxHrs : totalHrs;
      const obj = {
        Date: detail.date,
        Allocation: {
          // value: totalHrs,
          // maxHrs: totalHrs < resourceSliderMaxHrs ? resourceSliderMaxHrs : totalHrs,

          valueHrs: this.getHrsMinsObj(totalHrs, false).hours,
          valueMins: this.getHrsMinsObj(totalHrs, false).mins,
          maxHrs: this.getHrsMinsObj(maximumHrs, true).hours,
          maxMins: this.getHrsMinsObj(maximumHrs, true).mins
        }
      };
      this.newAllocation.push(obj);
    }
  }

  getAllocationPerDay(): string {
    let allocationPerDay = '';
    this.newAllocation.forEach(element => {
      allocationPerDay = allocationPerDay + this.datePipe.transform(element.Date, 'EE,MMMd,y') + ':' +
        this.common.convertToHrsMins('' + (element.Allocation.valueHrs + element.Allocation.valueMins)) + '\n';
    });
    return allocationPerDay;
  }

  saveAllocation(): void {
    const allocationPerDay = this.getAllocationPerDay();
    this.popupConfig.close(allocationPerDay);
  }

  async checkAllocation(event, changedDate) {
    const objDate = this.popupData.data;
    const resource = await this.getResourceCapacity(objDate);
    const resourceDailyAllocation = resource.dates;
    const resourceChangedDate = resourceDailyAllocation.find(d => d.date.getTime() === changedDate.Date.getTime());
    // const oldAvailable = '' + this.common.convertFromHrsMins(resourceChangedDate.availableHrs);
    // const oldAvailableHrs = oldAvailable.indexOf('.') > -1 ? oldAvailable.split('.')[0] : oldAvailable;
    // const oldAvailableMins = oldAvailable.indexOf('.') > -1 ? '0.' + oldAvailable.split('.')[1] : 0;
    const numHrsMins = event.type === 'hrs' ? +event.value + changedDate.Allocation.valueMins : // +oldAvailableMins
                                              + +event.value + changedDate.Allocation.valueHrs; // +oldAvailableHrs
    const strChangedValue = this.common.convertToHrsMins('' + numHrsMins);
    resourceChangedDate.availableHrs = strChangedValue;
    resourceChangedDate.mandatoryHrs = true;
    this.checkDailyAllocation(resource, objDate.budgetHrs);
  }

  async resetAndClose() {
    const allocationData: IDailyAllocationTask = this.popupData.data;
    const resource = await this.getResourceCapacity(allocationData);
    this.initialize(resource, allocationData);
    this.saveAllocation();
  }
}
