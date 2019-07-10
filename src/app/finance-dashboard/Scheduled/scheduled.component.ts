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
    public fdConstantsService : FdConstantsService
  ) {
    // router.events.subscribe((event: RouterEvent) => {
    //   // this.navigationInterceptor(event)
    // })

  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      console.log('NavigationStart ', NavigationStart)
    }
    if (event instanceof NavigationEnd) {
      console.log('NavigationEnd ', NavigationEnd);
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      console.log('NavigationCancel ', NavigationCancel);
    }
    if (event instanceof NavigationError) {
      console.log('NavigationError ', NavigationError);
    }
  }

  scheduleMenuList: any = [];

  ngOnInit() {

    // SetDefault Values
    const next3Months = this.commonService.getNextWorkingDay(65, new Date());
    const last1Year = this.commonService.getLastWorkingDay(260, new Date());
    this.rangeDates = [last1Year, next3Months];


    // Default Routing
    // this.router.navigate(['/financeDashboard/scheduled/deliverable-based']);

    // Tabs list
    this.scheduleMenuList = [
      { label: 'Deliverable Based', routerLink: ['deliverable-based'] },
      { label: 'Hourly Based', routerLink: ['hourly-based'] },
      { label: 'OOP', routerLink: ['oop'] },
    ];

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
    let startDate = new Date(this.datePipe.transform(dates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
    let endDate = new Date(this.datePipe.transform(dates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
    let obj = {
      startDate: startDate,
      endDate: endDate
    }
    this.fdDataShareServie.scheduleDateRange = obj;
    this.fdDataShareServie.setScheduleAddObj(obj);
  }

  setDefaultDateRange() {
    // SetDefault Values
    if (this.rangeDates) {
      let startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
      let endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
      let obj = {
        startDate: startDate,
        endDate: endDate
      }
      this.fdDataShareServie.scheduleDateRange = obj;
      this.fdDataShareServie.setScheduleAddObj(obj);
      console.log('startDate ' + startDate + ' endDate' + endDate)
    }
  }

}
