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
      remainingBudgetHrs = this.checkResourceAvailability(resource.dates, extraHrs, remainingBudgetHrs);
      if (remainingBudgetHrs.indexOf('-') > -1) {
        extraHrs = this.common.addHrsMins([extraHrs, '0:30']);
        maxAvailableHrs = maxAvailableHrs + 0.5;
      } else {
        break;
      }
    }
    return remainingBudgetHrs.indexOf('-') < 0 ? true : false;
  }

  getDailyAvailableHours(budgetHrs: string, resourceAvailableHrs: string): string {
    let budgetHours: string = budgetHrs.indexOf(':') < 0 ? this.common.convertToHrsMins(budgetHrs) : budgetHrs;
    budgetHours = budgetHours.indexOf('-') > -1 ? budgetHours.replace('-', '') : budgetHours;
    const newBudgetHrs: string = this.common.subtractHrsMins(resourceAvailableHrs, budgetHours, true);
    return newBudgetHrs;
  }

  checkResourceAvailability(resourceDailyDetails, extraHrs, taskBudgetHrs): string {
    let newBudgetHrs = '0';
    this.allocation.length = 0;
    for (const detail of resourceDailyDetails) {
      const obj = {
        Date: detail.date,
        Allocation: 0
      };
      let availableHrs = detail.availableHrs.indexOf('-') > -1 ? '0:0' : detail.availableHrs;
      availableHrs = this.common.addHrsMins([availableHrs, extraHrs]);
      newBudgetHrs = this.getDailyAvailableHours(taskBudgetHrs, availableHrs);
      if (newBudgetHrs.indexOf('-') > -1) {
        taskBudgetHrs = newBudgetHrs;
      } else {
        obj.Allocation = +newBudgetHrs;
        break;
      }
      this.allocation.push(obj);
    }
    return newBudgetHrs;
  }
}
