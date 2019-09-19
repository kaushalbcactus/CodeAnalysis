import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FdAuthService } from './fd-auth.service';
import { ConstantsService } from '../../Services/constants.service';

@Injectable({
    providedIn: 'root'
})
export class FdAuthGuard implements CanActivate, CanActivateChild, CanLoad {

    data: any = [];
    constructor(
        private _fdAuthService: FdAuthService,
        private _router: Router,
        public constantService: ConstantsService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this._fdAuthService.isUserManager || this._fdAuthService.isUserExpenseApprovers) {
            console.log(this._router.url);
            this.constantService.loader.isPSInnerLoaderHidden = true;
            if (this._fdAuthService.isUserManager) {
                this.constantService.userPermission.isFdUserManager = true;
                console.log('User is manager');
            } else if (this._fdAuthService.isUserExpenseApprovers) {
                if (state.url.includes('confirmed') || state.url.includes('outstanding-invoices') || state.url.includes('proforma') || state.url.includes('paid-invoices')) {
                    this.constantService.userPermission.userPermissionMsg = true;
                    // alert('You dont have access.Please contact to admin');
                    // this._router.navigateByUrl('financeDashboard/expenditure');
                    this._router.navigate(['financeDashboard/expenditure']);
                }
            }
            return true;
        } else if (!this.constantService.userPermission.isFDUserAdmin) {
            this.constantService.loader.isPSInnerLoaderHidden = true;
            if (state.url.includes('hourly-based') || state.url.includes('confirmed') || state.url.includes('outstanding-invoices') || state.url.includes('proforma') || state.url.includes('paid-invoices')) {
                this.constantService.userPermission.userPermissionMsg = true;
                this._router.navigate(['financeDashboard/expenditure']);
            }
            return true;
        } else {
            // alert('You dont have access.Please contact to admin');
            return false;
        }
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this._fdAuthService.isUserManager || this._fdAuthService.isUserExpenseApprovers) {
            console.log(this._router.url);
            this.constantService.loader.isPSInnerLoaderHidden = true;
            return true;
        } else if (!this.constantService.userPermission.isFDUserAdmin) {
            // this._router.navigate(['financeDashboard/expenditure']);
            this.constantService.loader.isPSInnerLoaderHidden = true;
            return true;
        } else {
            alert('You dont have access.Please contact to admin')
            return false;
        }
    }

    async canLoad(route: Route, segments: UrlSegment[]) {
        this.constantService.loader.isPSInnerLoaderHidden = false;
        const res = await this._fdAuthService.getUserInfo();
        if (res) {
            return true;
        } else {
            this.constantService.loader.isPSInnerLoaderHidden = true;
            alert('You dont have access.Please contact to admin')
            return false;
        }
    }
}