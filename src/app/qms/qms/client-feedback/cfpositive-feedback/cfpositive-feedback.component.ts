
import { Component, OnInit, ViewChild, OnDestroy, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {PlatformLocation, LocationStrategy } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { PfsComponent } from 'src/app/shared/sqms/pfs/pfs.component';
@Component({
  selector: 'app-cfpositive-feedback',
  templateUrl: './cfpositive-feedback.component.html',
  styleUrls: ['./cfpositive-feedback.component.css']
})
export class CFPositiveFeedbackComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
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

    this.cfPFNavigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
  }
  tempClick: any;
  CFColumns = [];
  CFRows = [];
  items: MenuItem[];
  private cfPFNavigationSubscription;
  @ViewChild('cfp1', { static: false }) cfpositive: PfsComponent;

  public hideLoader = true;
  public hideTable = false;
  public pfs = [];
  public CFPositiveColArray = {
    ID: [],
    Title: [],
    SentDate: [],
    SentBy: [],
    Status: [],
    Resources: []
  };


  isOptionFilter: boolean;

  async ngOnInit() {
  }


  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.cfPFNavigationSubscription) {
      this.cfPFNavigationSubscription.unsubscribe();
    }
  }

  async applyFilters(filterObj) {
    await this.cfpositive.applyFilters(filterObj);
  }

  downloadExcel(cfp) {
    cfp.cfpositiveTable.exportCSV();
  }
}
