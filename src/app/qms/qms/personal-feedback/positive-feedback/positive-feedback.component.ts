import { QMSCommonService } from './../../services/qmscommon.service';
import { Component, OnInit, OnDestroy, ApplicationRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation, LocationStrategy } from '@angular/common';
import { DataService } from '../../../../Services/data.service';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-positive-feedback',
  templateUrl: './positive-feedback.component.html',
  styleUrls: ['./positive-feedback.component.css']
})
export class PositiveFeedbackComponent implements OnInit, OnDestroy {

  public extPFNavigationSubscription;
  public filterObj = {};
  // tslint:disable: max-line-length
  constructor(
    private router: Router,
    public data: DataService,
    private qmsCommon: QMSCommonService,
    public global: GlobalService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.extPFNavigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });

  }

  ngOnInit() {
    this.qmsCommon.selectedComponent = this;
    this.initialisePFPositive();
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.extPFNavigationSubscription) {
      this.extPFNavigationSubscription.unsubscribe();
    }
  }

  protected initialisePFPositive() {
      this.data.filterObj.subscribe(filter => this.filterObj = filter);
  }
}
