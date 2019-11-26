import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { QmsAuthService } from './qms-auth.service';
import { QMSConstantsService } from '../qms/services/qmsconstants.service';

@Injectable({
  providedIn: 'root'
})
export class QmsAuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private qmsAuthService: QmsAuthService,
    private _router: Router,
    private qmsConstatsService: QMSConstantsService
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.qmsAuthService.hideManager && !this.qmsAuthService.hideAdmin && !this.qmsAuthService.hideReviewerTaskPending) {
      return true;
    } else if (this.qmsAuthService.hideManager && this.qmsAuthService.hideAdmin && this.qmsAuthService.hideReviewerTaskPending) {
      if (state.url.includes('managerView') || state.url.includes('pendingFeedback') || state.url.includes('scorecards') || state.url.includes('retrospectiveFeedback')) {
        this.qmsConstatsService.qmsToastMsg.hideManager = true;
        this.qmsConstatsService.qmsToastMsg.hideAdmin = true;
        this.qmsConstatsService.qmsToastMsg.hideReviewerTaskPending = true;
      }
      this._router.navigate(['qms']);
      // this._router.navigateByUrl('/qms/personalFeedback/internalFeedback');
      return true;
    } else if (this.qmsAuthService.hideManager) {
      // this.checkManagerUser(next, state);
      if (state.url.includes('managerView')) {
        this.qmsConstatsService.qmsToastMsg.hideManager = true;
        this._router.navigate(['qms']);
        return true;
      } else if (this.qmsAuthService.hideAdmin) {
        if (state.url.includes('scorecards') || state.url.includes('retrospectiveFeedback')) {
          this.qmsConstatsService.qmsToastMsg.hideAdmin = true;
          this._router.navigate(['qms']);
        }
        return true;
      } else if (this.qmsAuthService.hideReviewerTaskPending) {
        if (state.url.includes('pendingFeedback')) {
          this.qmsConstatsService.qmsToastMsg.hideReviewerTaskPending = true;
          this._router.navigate(['qms']);
        }
        return true;
      } else if (!this.qmsAuthService.hideAdmin && !this.qmsAuthService.hideReviewerTaskPending) {
        return true;
      }
    } else {
      if (this.qmsAuthService.hideAdmin) {
        if (state.url.includes('scorecards') || state.url.includes('retrospectiveFeedback')) {
          this.qmsConstatsService.qmsToastMsg.hideAdmin = true;
          this._router.navigate(['qms']);
        }
      }
      if (this.qmsAuthService.hideReviewerTaskPending) {
        if (state.url.includes('pendingFeedback')) {
          this.qmsConstatsService.qmsToastMsg.hideReviewerTaskPending = true;
          this._router.navigate(['qms']);
        }
      }
      return true;
    }

  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  async canLoad(route: Route, segments: UrlSegment[]) {
    const res = await this.qmsAuthService.initialize();
    if (res) {
      return true;
    } else {
      alert('Some thing wrong with initialize() function.Please debug & check.');
      return false;
    }
  }

}
