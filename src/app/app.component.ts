import { Component, NgZone, OnDestroy } from '@angular/core';
import { GlobalService } from './Services/global.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ConstantsService } from './Services/constants.service';
import { SPOperationService } from './Services/spoperation.service';
// import { Environment } from '../environments/environment.prod';
declare const _spPageContextInfo;
declare const newrelic;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  title = 'Medcom SPA';
  display = false;
  leftNavigation = [
    { title: 'My Dashboard', href: '', visible: true },
    { title: 'QMS', href: '', visible: true },
    { title: 'Leave Calendar', href: '', visible: true },
    { title: 'Publication Support', href: '', visible: true },
    { title: 'Allocation', href: '', visible: true },
    { title: 'Attr Management', href: '', visible: true }
  ];
  // tslint:disable-next-line:variable-name
  constructor(
    public globalService: GlobalService,
    private router: Router,
    // tslint:disable-next-line: variable-name
    private _ngZone: NgZone,
    public constantsService: ConstantsService,
    private spService: SPOperationService
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
    this.globalService.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomm'
      : _spPageContextInfo.webAbsoluteUrl;
    this.globalService.sharePointPageObject.webRelativeUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomm'
      : _spPageContextInfo.siteServerRelativeUrl;
    this.globalService.sharePointPageObject.serverRelativeUrl = this.globalService.sharePointPageObject.webRelativeUrl;
    this.globalService.sharePointPageObject.rootsite = window.origin;
  }

  async initSPLoggedInUser() {
    this.globalService.currentUser.userId = window.location.href.indexOf('localhost') > -1 ? 103 : _spPageContextInfo.userId;
    this.globalService.currentUser.email = window.location.href.indexOf('localhost') > -1 ?
      'sneha.danduk@cactusglobal.com' : _spPageContextInfo.userEmail;
    this.globalService.currentUser.title = window.location.href.indexOf('localhost') > -1 ? 'Sneha' : _spPageContextInfo.userDisplayName;
    this.spService.setBaseUrl(null);
    const currentUserInfo = await this.spService.getUserInfo(this.globalService.currentUser.userId);
    this.linkAccessForUsers(currentUserInfo.Groups);
    console.log(currentUserInfo);
    if (typeof newrelic === 'object') {
      newrelic.setCustomAttribute('spUserId', _spPageContextInfo.userId);
      newrelic.setCustomAttribute('spUserName', _spPageContextInfo.userDisplayName);
    }
  }

  linkAccessForUsers(groups) {
    const currentUserGroups = groups.results.map(g => g.LoginName);
    if (currentUserGroups.length > 0) {
      if (currentUserGroups.find(g => g === 'Managers' || g === 'CentralAllocation Members')) {
        this.leftNavigation.push({ title: 'Central Allocation', href: '', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'CapacityDashboard Members' || g === 'CapacityLink Members')) {
        this.leftNavigation.push({ title: 'Capacity Dashboard', href: '', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'FinanceDashboard Members' || g === 'Invoice_Team')) {
        this.leftNavigation.push({ title: 'Finance Dashboard', href: '', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'ProjectManagement Members' || g === 'Invoice_Team')) {
        this.leftNavigation.push({ title: 'Project Management', href: '', visible: true });
      }
    }
  }

  initSPComponentRedirection() {
    // tslint:disable:no-string-literal
    window['pubSupportComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
    window['qmsComponentReference'] = { component: this, zone: this._ngZone, loadQMS: () => this.goToQMS(), };
    window['fdComponentReference'] = { component: this, zone: this._ngZone, loadFD: () => this.goToFD(), };
    window['pmComponentReference'] = { component: this, zone: this._ngZone, loadPM: () => this.goToPM(), };
    window['myDashboardComponentReference'] = { component: this, zone: this._ngZone, loadMyDashboard: () => this.goToMyDashboard(), };
    window['adminComponentReference'] = { component: this, zone: this._ngZone, loadAdmin: () => this.goToAdmin(), };
    window['taskAllocationComponentReference'] = {
      component: this, zone: this._ngZone,
      loadTaskAllocation: () => this.goToTaskAllocation(),
    };
    window['accessLecelDashboardComponentReference'] = {
      component: this, zone: this._ngZone,
      loadAccessLevelDashboard: () => this.goToAccessLevelDashboard(),
    };
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

  ngOnDestroy() {
    window['pubSupportComponentReference'] = null;
    window['fdComponentReference'] = null;
    window['pmComponentReference'] = null;
    window['myDashboardComponentReference'] = null;
    window['adminComponentReference'] = null;
    window['taskAllocationComponentReference'] = null;
    window['qmsComponentReference'] = null;
    window['accessLecelDashboardComponentReference'] = null;
    window['caComponentReference'] = null;
    window['capacityComponentReference'] = null;
    window['leaveCalendarComponentReference'] = null;

  }
}
