
import { Component, OnInit, ViewChild, OnDestroy, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../../../Services/global.service';
import { CommonService } from '../../../../Services/common.service';
import { PlatformLocation, LocationStrategy } from '@angular/common';
import { DataService } from '../../../../Services/data.service';
import { Router } from '@angular/router';
import { CdsComponent } from 'src/app/shared/sqms/cds/cds.component';

@Component({
  selector: 'app-cd',
  templateUrl: './cd.component.html',
  styleUrls: ['./cd.component.css']
})
export class CDComponent implements OnInit, OnDestroy {
  @ViewChild('cd', { static: false }) cd: CdsComponent;
  public filterObj;
  public cdStatus = [];
  // tslint:disable: max-line-length
  private extNavigationSubscription;
  constructor(
    public global: GlobalService,
    public commonService: CommonService,
    public data: DataService,
    private router: Router,

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
    this.extNavigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
  }
  async ngOnInit() {
  }

  async applyFilters(cd, filterObj) {
    await cd.applyFilters(filterObj);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.extNavigationSubscription) {
      this.extNavigationSubscription.unsubscribe();
    }
  }

  /**
   * Search value from input text
   * @param filterValue - typed value
   */
  async search(cd, filterValue) {
    await cd.search(filterValue);
  }

  downloadExcel(cd) {
    cd.cdTable.exportCSV();
  }
}
