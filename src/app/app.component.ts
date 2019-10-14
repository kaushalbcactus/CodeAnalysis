import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ConstantsService } from './Services/constants.service';
import { GlobalService } from './Services/global.service';
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
    public globalService: GlobalService,
    private router: Router,
    // tslint:disable-next-line: variable-name
    private _ngZone: NgZone,
    public constantsService: ConstantsService
  ) { }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    // tslint:disable-next-line: only-arrow-functions
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    if (environment.production) { if (window) { window.console.log = function() { }; } }
    this.globalService.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.globalService.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1
      ? '/sites/medcomcdn/PublishingImages/Images' : '/sites/medcomcdn/PublishingImages/Images';
    this.globalService.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 286 : _spPageContextInfo.userId;
    // this.globalService.sharePointPageObject.email = window.location.href.indexOf('localhost') > -1 ? 'kaushal.bagrodia@cactusglobal.com' : _spPageContextInfo.userEmail;
    // this.globalService.sharePointPageObject.title = window.location.href.indexOf('localhost') > -1 ? 'Kaushal' : _spPageContextInfo.userDisplayName;
    this.globalService.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomdev'
      : _spPageContextInfo.webAbsoluteUrl;
    this.globalService.sharePointPageObject.webRelativeUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomdev'
      : _spPageContextInfo.siteServerRelativeUrl;
    this.globalService.sharePointPageObject.serverRelativeUrl = this.globalService.sharePointPageObject.webRelativeUrl;
    this.globalService.sharePointPageObject.rootsite = window.origin;
    // tslint:disable:no-string-literal
    window['pubSupportComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
    window['qmsComponentReference'] = { component: this, zone: this._ngZone, loadQMS: () => this.goToQMS(), };
    window['fdComponentReference'] = { component: this, zone: this._ngZone, loadFD: () => this.goToFD(), };
    // tslint:disable-next-line: no-string-literal
    window['pmComponentReference'] = { component: this, zone: this._ngZone, loadPM: () => this.goToPM(), };
    // tslint:disable-next-line: no-string-literal
    window['myDashboardComponentReference'] = { component: this, zone: this._ngZone, loadMyDashboard: () => this.goToMyDashboard(), };
    // tslint:disable-next-line: no-string-literal
    window['taskAllocationComponentReference'] = {
      component: this, zone: this._ngZone,
      loadTaskAllocation: () => this.goToTaskAllocation(),
    };
    window['accessLecelDashboardComponentReference'] = {
      component: this, zone: this._ngZone,
      loadAccessLevelDashboard: () => this.goToAccessLevelDashboard(),
    };
    // tslint:disable-next-line: no-string-literal
    window['caComponentReference'] = { component: this, zone: this._ngZone,
      loadCA: () => this.goToCA(), };


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

  goToCA() {
    if (!window.location.href.includes('centralallocation')) {
      this.router.navigate(['/centralallocation']);
    }
  }
  goToTaskAllocation() {
    if (!window.location.href.includes('taskAllocation')) {
      this.router.navigate(['/taskAllocation']);
    }
  }

  goToAccessLevelDashboard() {
    if (!window.location.href.includes('accessleveldashboard')) {
      this.router.navigate(['/accessleveldashboard']);
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
    window['accessLecelDashboardComponentReference'] = null;
    window['caComponentReference'] = null;
    
  }
}
