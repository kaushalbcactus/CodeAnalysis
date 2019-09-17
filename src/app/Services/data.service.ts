import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { GlobalService } from './global.service';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private subjects = new Subject<any>();
  private filter = {
    isDateFilter: false,
    startDate: new Date(),
    endDate: new Date(),
    count: 10,
    dateRange: {},
    userId: this.global.sharePointPageObject.userId,
    hideQuarters: true,
    hideDateRange: true,
    hideYears: true,
    yearSelected: { Year: 'Current', value: new Date().getFullYear()},
    quarterSelected: '',
    filterSelectedValue: { type: 'Last 10', value: 10 },
    years: [{ Year: 'Current', value: new Date().getFullYear() },
    { Year: 'Previous', value: new Date().getFullYear() - 1 }
    ],
    quarters: [],
    filterBy: [
      { type: 'Date Range', value: 'DateRange' },
      { type: 'Year', value: 'Quarter' },
      { type: 'Last 10', value: 10 },
      { type: 'Last 20', value: 20 },
      { type: 'Last 30', value: 30 }
    ]
  };
  private filterObjSource = new BehaviorSubject(this.filter);
  filterObj = this.filterObjSource.asObservable();
  constructor(public global: GlobalService) { }

  changeFilterObj(obj) {
    this.filterObjSource.next(obj);
  }
  publish(eventName: string) {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new Subject();
    // publish event
    this.subjects[eventName].next();
  }
  on(eventName: string): any {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new Subject();
    // return observable
    return this.subjects[eventName].asObservable();
  }
}
