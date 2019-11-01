import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../auth-service/admin-auth.service';
import { AdminConstantService } from '../services/admin-constant.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private adminAuthSerivce: AdminAuthService,
    private adminConstantService: AdminConstantService,
    private _router: Router,
    private messageService: MessageService
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.adminConstantService.userRole.SPMAA) {
      return true;
    } else if (!this.adminConstantService.userRole.SPMEA) {
      if (state.url.includes('userRoleMapping') || state.url.includes('roleUserMapping') || state.url.includes('copyPermission')) {
        this._router.navigate(['/admin/clientMasterData']);
      }
      return true;
    } else if (!this.adminConstantService.userRole.SPMPA) {
      if (state.url.includes('addUserToSow') || state.url.includes('addUserToProjects')) {
        this._router.navigate(['/admin/clientMasterData']);
      }
      return true;
    } else {
      this._router.navigate(['/admin/clientMasterData']);
      return true;
    }
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.adminConstantService.userRole.SPMAA) {
      if (state.url.includes('bucketMasterData') || state.url.includes('projectTypes') || state.url.includes('deliverableTypes') || state.url.includes('therapeuticAreas') || state.url.includes('practiceAreas')) {
        this.adminConstantService.toastMsg.SPMAA = true;
        this._router.navigate(['admin/clientMasterData']);
        return true;
      } else if (!this.adminConstantService.userRole.SPMEA && !this.adminConstantService.userRole.SPMPA) {
        this.adminConstantService.toastMsg.EAPA = true;
        this._router.navigate(['admin/clientMasterData']);
        return true;
      }
    } else if (this.adminConstantService.userRole.SPMAA) {
      if (this.adminConstantService.userRole.SPMEA && this.adminConstantService.userRole.SPMPA) {
        return true;
      } else if (!this.adminConstantService.userRole.SPMEA && !this.adminConstantService.userRole.SPMPA) {
        this.adminConstantService.toastMsg.EAPA = true;
        if (state.url.includes('userRoleMapping') || state.url.includes('roleUserMapping') || state.url.includes('copyPermission') || state.url.includes('addUserToSow') || state.url.includes('addUserToProjects')) {
          this.adminConstantService.toastMsg.SPMAD = true;
          this._router.navigate(['admin/clientMasterData']);
          return true;
        }
        // this._router.navigate(['admin/clientMasterData']);
        return true;
      }
      // return true;
    }

    if (this.adminConstantService.userRole.SPMEA && this.adminConstantService.userRole.SPMPA) {
      return true;
    }


    if (this.adminConstantService.userRole.SPMEA) {
      if (state.url.includes('addUserToSow') || state.url.includes('addUserToProjects')) {
        this.adminConstantService.toastMsg.SPMAD = true;
        this._router.navigate(['admin/entitlement/userRoleMapping']);
      }
      return true;
    } else if (this.adminConstantService.userRole.SPMPA) {
      if (state.url.includes('userRoleMapping') || state.url.includes('roleUserMapping') || state.url.includes('copyPermission')) {
        this._router.navigate(['admin/entitlement/addUserToSow']);
      }
      return true;
    } else {
      this._router.navigate(['admin/clientMasterData']);
      return true;
    }
  }
  async canLoad(route: Route, segments: UrlSegment[]) {
    const res = await this.adminAuthSerivce.getUserRole();
    if (res) {
      return true;
    } else {
      alert('Some thing wrong with GetuserInfo function.Please debug & check.');
      false;
    }
    return true;
  }
}
