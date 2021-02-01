import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Subscription } from 'rxjs';
import { FDDataShareService } from '../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { FdConstantsService } from '../fdServices/fd-constants.service';

@Component({
  selector: 'app-scheduled',
  templateUrl: './scheduled.component.html',
  styleUrls: ['./scheduled.component.css']
})
export class ScheduledComponent implements OnInit {

  // Date Range
  rangeDates: Date[];

  subscription: Subscription;
  DateRange: any = {
    startDate: '',
    endDate: '',
  };

  constructor(
    private router: Router,
    private commonService: CommonService,
    public fdDataShareServie: FDDataShareService,
    private datePipe: DatePipe,
    public fdConstantsService: FdConstantsService
  ) {

  }

  ngOnInit() {
    this.fdConstantsService.internalRouter = this.fdConstantsService.fdComponent.tabs.scheduleMenu.find(
      (c) => this.router.url.includes(c.routerLink)
    )
      ? this.fdConstantsService.fdComponent.tabs.scheduleMenu.find((c) =>
          this.router.url.includes(c.routerLink)
        )
      : this.fdConstantsService.fdComponent.tabs.scheduleMenu[0];

    // SetDefault Values
    const next3Months = this.commonService.getNextWorkingDay(65, new Date());
    const last1Year = this.commonService.getLastWorkingDay(260, new Date());
    this.rangeDates = [last1Year, next3Months];

  }

  // Date Range
  SelectedDateRange() {
    console.log('Selected Date Range ', this.rangeDates);
    if (this.rangeDates) {
      this.setDefaultDateRange();
    }
  }

  setDefault() {
    const next3Months = this.commonService.getNextWorkingDay(65, new Date());
    const last1Year = this.commonService.getLastWorkingDay(260, new Date());
    const dates = [last1Year, next3Months];
    const startDate = new Date(this.datePipe.transform(dates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
    const endDate = new Date(this.datePipe.transform(dates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
    const obj = {
      startDate: startDate,
      endDate: endDate
    };
    this.fdDataShareServie.scheduleDateRange = obj;
    this.fdDataShareServie.setScheduleAddObj(obj);
  }

  setDefaultDateRange() {
    // SetDefault Values
    if (this.rangeDates) {
      const startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
      const endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
      const obj = {
        startDate: startDate,
        endDate: endDate
      };
      this.fdDataShareServie.scheduleDateRange = obj;
      this.fdDataShareServie.setScheduleAddObj(obj);
      console.log('startDate ' + startDate + ' endDate' + endDate);
    }
  }

}
