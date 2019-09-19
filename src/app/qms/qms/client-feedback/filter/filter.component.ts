import { ConstantsService } from '../../../../Services/constants.service';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
// import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() getCDStatus: Array<string>;
  @Output() callFilter = new EventEmitter<any>();
  @Output() searchFilter = new EventEmitter<any>();
  public location = '';
  value: Date[] = [new Date(new Date().setDate(new Date().getDate() - 180)), new Date()];
  filterObj: any = {
    cdStatus: [{ type: 'All' }, { type: this.constant.cdStatus.Created }, { type: this.constant.cdStatus.ValidationPending },
    { type: this.constant.cdStatus.Closed + ' - ' + this.constant.cdStatus.Valid },
    { type: this.constant.cdStatus.Closed + ' - ' + this.constant.cdStatus.InValid },
    { type: this.constant.cdStatus.Rejected }, { type: this.constant.cdStatus.Deleted }],
    selectedStatus: null,
    dateRange: Date,
    startDate: null,
    endDate: null,
  };
  constructor(public router: Router, public constant: ConstantsService) {
    this.location = router.url;
  }

  ngOnInit() {
  }

  /**
   * emits filter object
   */
  filterCD() {
    this.callFilter.emit(this.filterObj);
  }

  /**
   * emits inout value
   * @param event- input value typed
   */
  search(event) {
    this.searchFilter.emit(event);
  }

  /**
   * emits filter object when date range is selected
   * @param event- date range selectedd
   */
  filterByDateRange() {
    if (this.value) {
      const fromDate = new Date(this.value[0].setHours(0, 0, 0, 0));
      const toDate = new Date(this.value[1].setHours(23, 59, 59, 59));
      this.filterObj.startDate = fromDate;
      this.filterObj.endDate = toDate;
    } else {
      this.filterObj.startDate = null;
    }
    this.callFilter.emit(this.filterObj);
  }
}
