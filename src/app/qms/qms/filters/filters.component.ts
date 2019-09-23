import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../Services/global.service';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { CommonService } from '../../../Services/common.service';
import { DataService } from '../../../Services/data.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})

export class FiltersComponent implements OnInit {
  // Declared custom event callApplyFilter to pass object to other component -- PersonalFeedback component
  @Output() callApplyFilter = new EventEmitter<any>();
  value: Date[] = [new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()];
  filter;
  // DateRange picker options
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
    disableUntil: { year: new Date().getFullYear() - 2, month: 12, day: 31 },
    showClearBtn: false
  };
  // selectedValue: {label: 'year', value: 2019};

  // Filter Object to be passed to filter data
  public filterObj: any = {
    isDateFilter: false,
    startDate: new Date(),
    endDate: new Date(),
    count: 10,
    dateRange: {},
    userId: this.global.currentUser.id,
    // variables declared to show hide quarter, daterange, year filter
    hideQuarters: true,
    hideDateRange: true,
    hideYears: true,
    years: [{ Year: 'Current', value: new Date().getFullYear() },
    { Year: 'Previous', value: new Date().getFullYear() - 1 }
    ],
    // Initialize filters-- Quarters will be based on year selected
    yearSelected: { Year: 'Current', value: new Date().getFullYear() },
    quarterSelected: '',
    filterSelectedValue: { type: 'Last 10', value: 10 },
    quarters: [],
    filterBy: [
      { type: 'Date Range', value: 'DateRange' },
      { type: 'Year', value: 'Year' },
      { type: 'Last 10', value: 10 },
      { type: 'Last 20', value: 20 },
      { type: 'Last 30', value: 30 }
    ]
  };

  constructor(public global: GlobalService, public common: CommonService, public data: DataService) {
    this.data.filterObj.subscribe(filter => this.filterObj = filter);
  }

  ngOnInit() {
  }

  /**
   * Emits filterObj with dates of year selected and fills quarters based on year selected
   *
   * @param year - Selected Year
   * @param  quarterFilter - Quarter filter refence
   *
   */
  filterByYear(year, quarterFilter) {
    const yearValue = year.value ? year.value : '';
    if (yearValue) {
      const date = this.common.getYearDates(yearValue);
      this.filterObj.isDateFilter = true;
      this.filterObj.startDate = date.fromDate;
      this.filterObj.endDate = date.toDate;
      // Emits obj to other component
      this.callApplyFilter.emit(this.filterObj);
      this.fillQuartersOptions(yearValue, quarterFilter);
    }
  }

  /**
   * Fill Quarter options based on year selected
   *
   * @param year - selected year
   * @param quarterFilter - quarter filter reference
   *
   */
  fillQuartersOptions(year, quarterFilter) {
    this.filterObj.quarters.length = 0;
    this.filterObj.quarters = this.common.getQuartersByYear(year);
    this.filterObj.hideQuarters = false;
    this.filterObj.hideDateRange = true;
  }

  /**
   * Emits filter object with dates based on quarter selected
   *
   * @param  quarter - quarter selected
   *
   */
  filterByQuarter(quarter) {
    if (quarter && this.filterObj.yearSelected) {
      const date = this.common.getQuarterDates(this.filterObj.yearSelected.value, quarter);
      this.filterObj.quarterSelected = quarter.value;
      this.filterObj.isDateFilter = true;
      this.filterObj.startDate = date.fromDate;
      this.filterObj.endDate = date.toDate;
      this.callApplyFilter.emit(this.filterObj);
    }
  }

  /**
   * Filter by number of drafts selected and hide other filters
   *
   * @param  filterBy - option selected
   * @param  yearFilter - filter refrence
   * @param  quarterFilter - filter reference
   *
   */
  filterByDrafts(filterBy, yearFilter, quarterFilter) {
    // Clear all filter by their reference
    this.filterObj.dateRange = '';
    // yearFilter.handleClearClick();
    // this.filterObj.yearSelected = new Date().getFullYear();
    if (filterBy) {
      this.filterObj.filterSelectedValue = filterBy;
      switch (filterBy.value) {
        case 'Quarter':
          this.filterObj.hideYears = false;
          this.filterObj.hideQuarters = false;
          this.filterObj.hideDateRange = true;
          this.filterByYear(this.filterObj.yearSelected, quarterFilter);
          break;
        case 'DateRange':
          this.filterObj.hideYears = true;
          this.filterObj.hideQuarters = true;
          this.filterObj.hideDateRange = false;
          this.filterByDateRange();
          break;
        default:
          this.filterObj.hideYears = true;
          this.filterObj.hideDateRange = true;
          this.filterObj.hideQuarters = true;
          this.filterObj.isDateFilter = false;
          this.filterObj.count = +filterBy.value;
          this.callApplyFilter.emit(this.filterObj);
          break;
      }
    }
  }

  filterByDateRange() {
    if (this.value) {
      const fromDate = new Date(this.value[0].setHours(0, 0, 0, 0));
      // tslint:disable: max-line-length
      const toDate = this.value[1] ? new Date(this.value[1].setHours(23, 59, 59, 0)) : fromDate ? new Date(this.value[0].setHours(23, 59, 59, 0)) : new Date();
      this.filterObj.isDateFilter = true;
      this.filterObj.startDate = fromDate;
      this.filterObj.endDate = toDate;
    } else {
      this.value = [new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()];
      this.filterObj.startDate = new Date(new Date().setMonth(new Date().getMonth() - 6));
      this.filterObj.endDate = new Date(new Date().setHours(23, 59, 59, 0));
    }
    this.callApplyFilter.emit(this.filterObj);
  }

  clearQuarterFilter(event, filter) {
    if (this.filterObj.yearSelected) {
      const date = this.common.getYearDates(this.filterObj.yearSelected);
      this.filterObj.isDateFilter = true;
      this.filterObj.startDate = date.fromDate;
      this.filterObj.endDate = date.toDate;
      // Emits obj to other component
      this.callApplyFilter.emit(this.filterObj);
    }
  }
}
