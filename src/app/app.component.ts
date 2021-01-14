import { Component, NgZone, OnDestroy } from '@angular/core';
import { GlobalService } from './Services/global.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { environment } from '../environments/environment';
import { ConstantsService } from './Services/constants.service';
import { SPOperationService } from './Services/spoperation.service';
import { MenuItem, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { CommonService } from './Services/common.service';
// import { Environment } from '../environments/environment.prod';
declare const _spPageContextInfo;
declare const newrelic;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'Medcom SPA';
  items: MenuItem[];
  leftNavigation = [];
  visibleSidebar: boolean;
  // tslint:disable-next-line:variable-name
  constructor(
    public globalService: GlobalService,
    private router: Router,
    // tslint:disable-next-line: variable-name
    private _ngZone: NgZone,
    public constantsService: ConstantsService,
    private spService: SPOperationService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private common: CommonService
  ) { }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.visibleSidebar = false;

    const appTitle = this.titleService.getTitle();
    this.router
      .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;
          if (child.snapshot.data.title) {
            return child.snapshot.data.title;
          }
          return appTitle;
        })
      ).subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });

    // tslint:disable-next-line: only-arrow-functions
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    if (environment.production) { if (window) { window.console.log = () => { }; } }
    this.globalService.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.initSPPageObject();
    this.initSPLoggedInUser();
    this.initSPComponentRedirection();

    this.items = [{
      label: 'Misc',
      items: [
        { label: 'Site Contents', url: this.globalService.sharePointPageObject.webRelativeUrl + '/_layouts/15/viewlsts.aspx' }
      ]
    }];
  }

  goToEmpDashboard() {
    this.visibleSidebar = false;
    if (!this.router.url.includes('/myDashboard/my-current-tasks')) {
      this.router.navigate(['/myDashboard']);
    }
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
    this.globalService.url = window.location.href.indexOf('localhost') > -1 ? '#' : this.globalService.sharePointPageObject.webRelativeUrl + '/dashboard#';

    this.leftNavigation = [
      { title: 'My Dashboard', href: this.globalService.url + '/myDashboard', visible: true },
      { title: 'QMS', href: this.globalService.url + '/qms', visible: true },
      { title: 'Leave Calendar', href: this.globalService.url + '/leaveCalendar', visible: true },
      { title: 'Publication Support', href: this.globalService.url + '/pubSupport', visible: true },
    ];
  }

  async initSPLoggedInUser() {
    this.globalService.currentUser.userId = window.location.href.indexOf('localhost') > -1 ? 31

     : _spPageContextInfo.userId;
    this.globalService.currentUser.email = window.location.href.indexOf('localhost') > -1 ?
      'sneha.danduk@cactusglobal.com' : _spPageContextInfo.userEmail;
    this.globalService.currentUser.title = window.location.href.indexOf('localhost') > -1 ? 'Ashish' : _spPageContextInfo.userDisplayName;
    this.spService.setBaseUrl(null);
    this.common.SetNewrelic('RootApp', 'initSPLoggedInUser', 'getUserInfo');
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
      if (currentUserGroups.find(g => g === 'Managers' || g === 'ProjectManagement Members' || g === 'Invoice_Team')) {
        this.leftNavigation.push({ title: 'Project Management', href: this.globalService.url + '/projectMgmt', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'TaskAllocation Members')) {
        this.leftNavigation.push({ title: 'Allocation', href: this.globalService.url + '/taskAllocation', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'CentralAllocation Members')) {
        this.leftNavigation.push({ title: 'Central Allocation', href: this.globalService.url + '/centralallocation', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'CapacityDashboard Members' || g === 'CapacityLink Members')) {
        this.leftNavigation.push({ title: 'Capacity Dashboard', href: this.globalService.url + '/capacityDashboard', visible: true });
      }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'FinanceDashboard Members' || g === 'Invoice_Team')) {
        this.leftNavigation.push({ title: 'Finance Dashboard', href: this.globalService.url + '/financeDashboard', visible: true });
      }
      // if (currentUserGroups.find(g => g === 'Managers' || g === 'AttributeManagement Members')) {
      //   this.leftNavigation.push({ title: 'Attr Management', href: this.globalService.sharePointPageObject.webRelativeUrl + '/attribute', visible: true });
      // }
      if (currentUserGroups.find(g => g === 'Managers' || g === 'AttributeManagement Members')) {
        this.leftNavigation.push({ title: 'Admin', href: this.globalService.url + '/admin', visible: true });
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
    window['accessLevelDashboardComponentReference'] = {
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

    window['aldIfNotLinkComponentReference'] = {
      component: this, zone: this._ngZone,
      loadaldInNoLinkDashboard: () => this.goToAccessLevelDashboardIfNoLink(),
    };

    window['pageNotFoundComponentReference'] = {
      component: this, zone: this._ngZone,
      loadPageNotFound: () => this.goToPageNotFound(),
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

  goToAccessLevelDashboardIfNoLink() {
    if (window.location.href.includes('defaultDashboard') || !window.location.href.includes('#')) {
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

  goToPageNotFound() {
    if (!window.location.href.includes('pageNotFound')) {
      this.router.navigate(['/pageNotFound']);
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
    window['aldIfNotLinkComponentReference'] = null;
    window['pageNotFoundComponentReference'] = null;
  }
}
