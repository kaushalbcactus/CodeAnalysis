import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PubsuportConstantsService } from '../pubsupport/Services/pubsuport-constants.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    data: any = [];
    constructor(private _authService: AuthService, private _router: Router,
        public pubsupportService: PubsuportConstantsService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this._authService.isUserManager || this._authService.isUserExpenseApprovers) {
            console.log(this._router.url);
            if (this._authService.isUserManager) {
                console.log('User is manager');
            } else if (this._authService.isUserExpenseApprovers) {
                if (state.url.includes('confirmed') || state.url.includes('outstanding-invoices') || state.url.includes('proforma') || state.url.includes('paid-invoices')) {
                    alert('You dont have access.Please contact to admin');
                    this._router.navigateByUrl('financeDashboard/expenditure/pending');
                    return false;
                }
            }
            return true;
        } else {
            alert('You dont have access.Please contact to admin')
            return false;
        }
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this._authService.isUserManager || this._authService.isUserExpenseApprovers) {
            console.log(this._router.url);
            return true;
        } else {
            alert('You dont have access.Please contact to admin')
            return false;
        }
    }

    async canLoad(route: Route, segments: UrlSegment[]) {
        if (true) {
            return true;
        } else {
            alert('You dont have access.Please contact to admin')
            return false;
        }
    }
}
