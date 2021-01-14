import { Component, OnDestroy, ViewChild, ApplicationRef, NgZone, ChangeDetectorRef, OnInit, DoCheck } from '@angular/core';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { ConstantsService } from '../../../../Services/constants.service';
import { GlobalService } from '../../../../Services/global.service';
import { CommonService } from '../../../../Services/common.service';
import { DataService } from '../../../../Services/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { QMSCommonService } from '../../services/qmscommon.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.css']
})
export class ExternalComponent implements OnInit, OnDestroy, DoCheck {
  public filterObj = {};
  public cdNavigationSubscription;
  public filterSubscription;

  @ViewChild('qc', { static: true }) pfTable: Table;
  constructor(
    public global: GlobalService,
    public commonService: CommonService,
    public data: DataService,
    private router: Router,
    private qmsCommon: QMSCommonService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    _applicationRef: ApplicationRef,
    private ref: ChangeDetectorRef,
    zone: NgZone
  ) {
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    this.cdNavigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
  }

  ngOnInit() {
    this.qmsCommon.selectedComponent = this;
    this.initialisePFCD();
  }

  ngDoCheck() {
    this.ref.markForCheck();
  }
  initialisePFCD() {
    this.filterSubscription = this.data.filterObj.subscribe(filter => this.filterObj = filter);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.cdNavigationSubscription) {
      this.cdNavigationSubscription.unsubscribe();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }
  downloadExcel(qc) {
    qc.cdTable.exportCSV();
  }
}
