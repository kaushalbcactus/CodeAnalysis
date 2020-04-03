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
  public newAllocation: any[];
  constructor(private usercapacityComponent: UsercapacityComponent, private popupData: DynamicDialogConfig,
              private common: CommonService, private datePipe: DatePipe, public popupConfig: DynamicDialogRef) { }

  async ngOnInit() {
    this.cols = [
      { field: 'Date', header: 'Date' },
      { field: 'Allocation', header: 'Allocation' }
    ];
    this.newAllocation = [];
    const allocationData: IDailyAllocationTask = this.popupData.data;
    const resource = await this.getResourceCapacity(allocationData);
    const isDailyAllocationValid = this.checkDailyAllocation(resource, allocationData.budgetHrs);
    if (!isDailyAllocationValid) {
      await this.equalSplitAllocation(allocationData);
    }
    console.log(this.newAllocation);
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
    const oCapacity = await this.usercapacityComponent.applyFilterReturn(task.startDate, task.endDate, task.resourceId, [task]);
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
      const mins = this.common.calculateTotalMins(detail.totalTimeAllocatedPerDay);
      let totalMins = 0;
      const obj = {
        Date: detail.date,
        Allocation: {
          value: this.common.convertFromHrsMins(mins),
          maxHrs: resourceSliderMaxHrs,
          minHrs: this.common.convertFromHrsMins(mins)
        }
      };
      if (flag) {
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = detail.mandatoryHrs ? availableHrs : this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        const totalAllocatedMins = this.common.calculateTotalMins(detail.totalTimeAllocatedPerDay);
        const numtotalAllocated = this.common.convertFromHrsMins(totalAllocatedMins);
        obj.Allocation.maxHrs = resourceSliderMaxHrs - numtotalAllocated;
        if (newBudgetHrs.indexOf('-') > -1) {
          const availableMins = this.common.calculateTotalMins(availableHrs);
          const numAvailableHrs = this.common.convertFromHrsMins(availableMins);
          obj.Allocation.value = numAvailableHrs;
          taskBudgetHrs = newBudgetHrs;
        } else {
          const budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          totalMins = this.common.calculateTotalMins(budgetHrs);
          obj.Allocation.value = this.common.convertFromHrsMins(totalMins);
          flag = false;
        }
      }
      this.newAllocation.push(obj);
    }
    return newBudgetHrs;
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
    for (const detail of resourceDailyDetails) {
      // const totalMins = this.common.calculateTotalMins(detail.totalTimeAllocatedPerDay);
      const totalHrs = allocationPerDay; // this.common.convertFromHrsMins(totalMins) + allocationPerDay;
      const obj = {
        Date: detail.date,
        Allocation: {
          value: totalHrs,
          maxHrs: totalHrs < resourceSliderMaxHrs ? resourceSliderMaxHrs : totalHrs,
          minHrs: allocationPerDay
        }
      };
      this.newAllocation.push(obj);
    }
  }

  saveAllocation(): void {
    let allocationPerDay = '';
    this.newAllocation.forEach(element => {
      allocationPerDay = allocationPerDay + this.datePipe.transform(element.Date, 'EE, MMM d, y') + ':' +
        this.common.convertToHrsMins('' + element.Allocation.value) + '\n';
    });
    this.popupConfig.close(allocationPerDay);
  }

  async checkAllocation(event, changedDate) {
    const objDate = this.popupData.data;
    const strChangedValue = this.common.convertToHrsMins('' + event.value);
    const resource = await this.getResourceCapacity(objDate);
    const resourceDailyAllocation = resource.dates;
    const resourceChangedDate = resourceDailyAllocation.find(d => d.date.getTime() === changedDate.Date.getTime());
    resourceChangedDate.availableHrs = strChangedValue;
    resourceChangedDate.mandatoryHrs = true;
    this.checkDailyAllocation(resource, objDate.budgetHrs);
  }
}
