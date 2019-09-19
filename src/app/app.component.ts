import { Component, NgZone } from '@angular/core';
import { GlobalService } from './Services/global.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../environments/environment';
// import { Environment } from '../environments/environment.prod';
declare const _spPageContextInfo;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Medcom SPA';
  // tslint:disable-next-line:variable-name
  constructor(
    public globalObject: GlobalService,
    private router: Router,
    // tslint:disable-next-line: variable-name
    private _ngZone: NgZone,
  ) { }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    // tslint:disable-next-line: only-arrow-functions
    if (environment.production) { if (window) { window.console.log = function() { }; } }
    this.globalObject.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.globalObject.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1
      ? '/sites/medcomcdn/PublishingImages/Images' : '/sites/medcomcdn/PublishingImages/Images';


    this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 79 : _spPageContextInfo.userId;


    this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomdev'
      : _spPageContextInfo.webAbsoluteUrl;
    this.globalObject.sharePointPageObject.webRelativeUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomdev'
      : _spPageContextInfo.siteServerRelativeUrl;
    this.globalObject.sharePointPageObject.serverRelativeUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
    this.globalObject.sharePointPageObject.rootsite = window.origin;
    // tslint:disable:no-string-literal
    window['angularComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
    window['qmsComponentReference'] = { component: this, zone: this._ngZone, loadQMS: () => this.goToQMS(), };
    window['fdComponentReference'] = { component: this, zone: this._ngZone, loadFD: () => this.goToFD(), };
     // tslint:disable-next-line: no-string-literal
    window['pmComponentReference'] = { component: this, zone: this._ngZone, loadPM: () => this.goToPM(), };
     // tslint:disable-next-line: no-string-literal
    window['myDashboardComponentReference'] = { component: this, zone: this._ngZone, loadMyDashboard: () => this.goToMyDashboard(), };
    // tslint:disable-next-line: no-string-literal
    window['taskAllocationComponentReference'] = { component: this, zone: this._ngZone,
      loadTaskAllocation: () => this.goToTaskAllocation(), };


  }
  goToQMS() {
    if (!window.location.href.includes('qms')) {
      this.router.navigate(['/qms']);
    }
  }

  goToPubSupport() {
    this.router.navigate(['/pubSupport']);
  }

  goToFD() {
    if (!window.location.href.includes('financeDashboard')) {
      this.router.navigate(['/financeDashboard']);
    }
  }

  goToPM() {
    if (!window.location.href.includes('projectMgmt')) {
      this.router.navigate(['/projectMgmt']);
    }
  }

  goToMyDashboard() {
    if (!window.location.href.includes('myDashboard')) {
      this.router.navigate(['/myDashboard']);
    }
  }

  goToTaskAllocation() {
    if (!window.location.href.includes('taskAllocation')) {
      this.router.navigate(['/taskAllocation']);
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = null;
     // tslint:disable-next-line: no-string-literal
    window['fdComponentReference'] = null;
     // tslint:disable-next-line: no-string-literal
    window['pmComponentReference'] = null;
     // tslint:disable-next-line: no-string-literal
    window['myDashboardComponentReference'] = null;
     // tslint:disable-next-line: no-string-literal
    window['taskAllocationComponentReference'] = null;
    window['qmsComponentReference'] = null;
  }
}
