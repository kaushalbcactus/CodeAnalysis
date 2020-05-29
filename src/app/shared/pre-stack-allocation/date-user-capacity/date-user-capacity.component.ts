import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-date-user-capacity',
  templateUrl: './date-user-capacity.component.html',
  styleUrls: ['./date-user-capacity.component.css']
})
export class DateUserCapacityComponent implements OnInit {
  @Input() tasks: any;
  @Output() collapse = new EventEmitter<boolean>();
  constructor(public globalService: GlobalService) { }

  ngOnInit() {
    this.tasks = [...this.tasks];
  }

  goToProjectDetails(data: any): string {
    return this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/taskAllocation?ProjectCode=' + data.projectCode;
  }

  collapseTable() {
    this.collapse.emit(true);
  }
}
