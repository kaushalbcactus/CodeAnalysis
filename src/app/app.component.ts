import { Component, NgZone } from '@angular/core';
import { GlobalService } from './Services/global.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ConstantsService } from './Services/constants.service';
// import { Environment } from '../environments/environment.prod';
declare const _spPageContextInfo;
declare const newrelic;

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
    if (environment.production) { if (window) { window.console.log = () => { }; } }
    this.globalService.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.initSPPageObject();
    this.initSPLoggedInUser();
    this.initSPComponentRedirection();
  }

  initSPPageObject() {
    this.globalService.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1
      ? '/sites/medcomcdn/PublishingImages/Images' : '/sites/medcomcdn/PublishingImages/Images';
    this.globalService.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/Medcomqa'
      : _spPageContextInfo.webAbsoluteUrl;
    this.globalService.sharePointPageObject.webRelativeUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/Medcomqa'
      : _spPageContextInfo.siteServerRelativeUrl;
    this.globalService.sharePointPageObject.serverRelativeUrl = this.globalService.sharePointPageObject.webRelativeUrl;
    this.globalService.sharePointPageObject.rootsite = window.origin;
  }

  initSPLoggedInUser() {
    this.globalService.currentUser.userId = window.location.href.indexOf('localhost') > -1 ? 103 : _spPageContextInfo.userId;
    this.globalService.currentUser.email = window.location.href.indexOf('localhost') > -1 ?
      'sneha.danduk@cactusglobal.com' : _spPageContextInfo.userEmail;
    this.globalService.currentUser.title = window.location.href.indexOf('localhost') > -1 ? 'Sneha' : _spPageContextInfo.userDisplayName;

    if (typeof newrelic === 'object') {
      newrelic.setCustomAttribute('spUserId', _spPageContextInfo.userId);
      newrelic.setCustomAttribute('spUserName', _spPageContextInfo.userDisplayName);
    }


  }
  initSPComponentRedirection() {
    // tslint:disable:no-string-literal
    window['pubSupportComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
    window['qmsComponentReference'] = { component: this, zone: this._ngZone, loadQMS: () => this.goToQMS(), };
    window['fdComponentReference'] = { component: this, zone: this._ngZone, loadFD: () => this.goToFD(), };
    // tslint:disable-next-line:no-string-literal
    window['pmComponentReference'] = { component: this, zone: this._ngZone, loadPM: () => this.goToPM(), };
    // tslint:disable-next-line:no-string-literal
    window['myDashboardComponentReference'] = { component: this, zone: this._ngZone, loadMyDashboard: () => this.goToMyDashboard(), };
    // tslint:disable-next-line:no-string-literal
    window['adminComponentReference'] = { component: this, zone: this._ngZone, loadAdmin: () => this.goToAdmin(), };
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
    window['caComponentReference'] = {
      component: this, zone: this._ngZone,
      loadCA: () => this.goToCA(),
    };
    window['capacityComponentReference'] = {
      component: this, zone: this._ngZone,
      loadCapacityDashboard: () => this.goToCapacityDashboard(),
    };

    window['leaveCalendarComponentReference'] = {
      component: this, zone: this._ngZone,
      loadLeaveCalendar: () => this.goToLeaveCalendar(),
    };
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

  goToAdmin() {
    if (!window.location.href.includes('admin')) {
      this.router.navigate(['/admin']);
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

  goToCapacityDashboard() {
    if (!window.location.href.includes('capacityDashboard')) {
      this.router.navigate(['/capacityDashboard']);
    }
  }

  goToLeaveCalendar() {
    if (!window.location.href.includes('leaveCalendar')) {
      this.router.navigate(['/leaveCalendar']);
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // tslint:disable-next-line:no-string-literal
    window['pubSupportComponentReference'] = null;
    // tslint:disable-next-line:no-string-literal
    window['fdComponentReference'] = null;
    // tslint:disable-next-line:no-string-literal
    window['pmComponentReference'] = null;
    // tslint:disable-next-line:no-string-literal
    window['myDashboardComponentReference'] = null;
    // tslint:disable-next-line:no-string-literal
    window['adminComponentReference'] = null;
    // tslint:disable-next-line: no-string-literal
    window['taskAllocationComponentReference'] = null;
    window['qmsComponentReference'] = null;
    window['accessLecelDashboardComponentReference'] = null;
    window['caComponentReference'] = null;
    window['capacityComponentReference'] = null;
    window['leaveCalendarComponentReference'] = null;

  }
}
