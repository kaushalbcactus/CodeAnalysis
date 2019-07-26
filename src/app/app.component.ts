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
    private _ngZone: NgZone,
  ) { }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    if (environment.production) { if (window) { window.console.log = function () { }; } }
    this.globalObject.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.globalObject.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1
      ? '/sites/medcomcdn/PublishingImages/Images' : '/sites/medcomcdn/PublishingImages/Images';

    this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 112 : _spPageContextInfo.userId;
    this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/Medcomqa'
      : _spPageContextInfo.webAbsoluteUrl;
    this.globalObject.sharePointPageObject.webRelativeUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/Medcomqa'
      : _spPageContextInfo.siteServerRelativeUrl;
    this.globalObject.sharePointPageObject.serverRelativeUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
    this.globalObject.sharePointPageObject.rootsite = window.origin;
    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
    // tslint:disable-next-line:no-string-literal
    window['fdComponentReference'] = { component: this, zone: this._ngZone, loadFD: () => this.goToFD(), };
    window['pmComponentReference'] = { component: this, zone: this._ngZone, loadPM: () => this.goToPM(), };
    window['myDashboardComponentReference'] = { component: this, zone: this._ngZone, loadMyDashboard: () => this.goToMyDashboard(), };
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

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = null;
    window['fdComponentReference'] = null;
    window['pmComponentReference'] = null;
    window['myDashboardComponentReference'] = null;
  }
}
