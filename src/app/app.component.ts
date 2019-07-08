import { Component, NgZone } from '@angular/core';
import { GlobalService } from './Services/global.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
declare const _spPageContextInfo;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Medcom SPA';
  // tslint:disable-next-line:variable-name
  constructor(public globalObject: GlobalService, private router: Router, private _ngZone: NgZone) { }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.globalObject.sharePointPageObject.webAbsoluteArchiveUrl = environment.archiveURL;
    this.globalObject.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1 ?
      '/sites/medcomcdn/PublishingImages/Images' :
      '/sites/medcomcdn/PublishingImages/Images';
    this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 112 : _spPageContextInfo.userId;
    this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/Medcomqa'
      : _spPageContextInfo.webAbsoluteUrl;
    // this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 1426 : _spPageContextInfo.userId;
    // this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/MedicalWriting'
    // : _spPageContextInfo.webAbsoluteUrl;
    // this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 222 : _spPageContextInfo.userId;
    // this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomdev'
    //   : _spPageContextInfo.webAbsoluteUrl;
    // this.globalObject.sharePointPageObject.serverRelativeUrl = window.location.href.indexOf('localhost') > -1 ?
    //   '/sites/medcomdev' : _spPageContextInfo.webServerRelativeUrl,
      // this.globalObject.sharePointPageObject.publicCdn = window.location.href.indexOf('localhost') > -1 ?
      //   '/sites/medcomcdn/PublishingImages/Images' :
      //   '/sites/medcomcdn/PublishingImages/Images';
      // this.globalObject.sharePointPageObject.userId = window.location.href.indexOf('localhost') > -1 ? 88 : _spPageContextInfo.userId;
      // this.globalObject.sharePointPageObject.webAbsoluteUrl = window.location.href.indexOf('localhost') > -1 ? '/sites/medcomm'
      // : _spPageContextInfo.webAbsoluteUrl;
      // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = { component: this, zone: this._ngZone, loadPubSupport: () => this.goToPubSupport(), };
  }

  goToPubSupport() {
    this.router.navigate(['/pubSupport']);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = null;
  }


}
