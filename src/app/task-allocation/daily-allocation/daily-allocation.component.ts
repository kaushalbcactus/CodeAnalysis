import { Component, OnInit } from '@angular/core';
import { IDailyAllocationTask, ICapacity } from '../interface/allocation';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { DynamicDialogConfig } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-daily-allocation',
  templateUrl: './daily-allocation.component.html',
  styleUrls: ['./daily-allocation.component.css']
})
export class DailyAllocationComponent implements OnInit {
  public cols: any[];
  public allocation: any[];
  constructor(private usercapacityComponent: UsercapacityComponent, private popupData: DynamicDialogConfig,
    private common: CommonService) { }

  ngOnInit() {
    const incomingData: IDailyAllocationTask = this.popupData.data;
    const isDailyAllocationValid = this.checkDailyAllocation(incomingData);
    this.cols = [
      { field: 'Date', header: 'Date' },
      { field: 'Allocation', header: 'Allocation' }
    ];
    this.allocation = [];
  }

  async checkDailyAllocation(task: IDailyAllocationTask): Promise<boolean> {
    const oCapacity = await this.usercapacityComponent.applyFilterReturn(task.startDate, task.endDate, task.resourceId, [task]);
    const resource = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : {};
    const maxLimit = resource.maxHrs + 2;
    let maxAvailableHrs = resource.maxHrs;
    let remainingBudgetHrs: string;
    let extraHrs = '0:0';
    while (maxAvailableHrs <= maxLimit) {
      remainingBudgetHrs = '' + task.budgetHrs;
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

  getDailyAvailableHours(resourceAvailableHrs: string, budgetHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  checkResourceAvailability(resource, extraHrs, taskBudgetHrs): string {
    const resourceDailyDetails = resource.dates;
    const resourceSliderMaxHrs = resource.maxHrs + 4;
    let newBudgetHrs = '0';
    this.allocation.length = 0;
    let flag = true;
    for (const detail of resourceDailyDetails) {
      const mins = this.common.calculateTotalMins(detail.totalTimeAllocatedPerDay);
      let totalMins = 0;
      const obj = {
        Date: detail.date,
        Allocation: {
          value: this.common.convertFromHrsMins(mins),
          maxHrs: resourceSliderMaxHrs
        }
      };
      if (flag) {
        let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
        availableHrs = this.common.addHrsMins([availableHrs, extraHrs]);
        newBudgetHrs = this.getDailyAvailableHours(availableHrs, taskBudgetHrs);
        if (newBudgetHrs.indexOf('-') > -1) {
          const allocatedMins = this.common.calculateTotalMins(extraHrs);
          const allocatedHrs =  resource.maxHrs + this.common.convertFromHrsMins(allocatedMins);
          obj.Allocation.value = allocatedHrs;
          taskBudgetHrs = newBudgetHrs;
        } else {
          const budgetHrs = taskBudgetHrs.indexOf('-') > -1 ? taskBudgetHrs.replace('-', '') : taskBudgetHrs;
          detail.totalTimeAllocatedPerDay = this.common.addHrsMins([detail.totalTimeAllocatedPerDay, budgetHrs]);
          const totalHrs = detail.totalTimeAllocatedPerDay.indexOf('-') > -1 ?
                           detail.totalTimeAllocatedPerDay.replace('-', '') : detail.totalTimeAllocatedPerDay;
          totalMins = this.common.calculateTotalMins(totalHrs);
          obj.Allocation.value = this.common.convertFromHrsMins(totalMins);
          flag = false;
        }
      }
      this.allocation.push(obj);
    }
    return newBudgetHrs;
  }
}
