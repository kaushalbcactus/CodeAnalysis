import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminConstantService } from '../services/admin-constant.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  constructor(
    private globalObject: GlobalService,
    private spOperationsServices: SPOperationService,
    private adminConstantService: AdminConstantService,
    private constantsService: ConstantsService
  ) { }

  async getUserRole() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.globalObject.userInfo = await this.spOperationsServices.getUserInfo(this.globalObject.currentUser.userId);
    console.log('this.globalObject.userInfo ', this.globalObject.userInfo);
    if (this.globalObject.userInfo.Groups.results.length) {
      const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
      console.log('groups ', groups);
      this.adminConstantService.DefaultMenu.List = [];
      this.adminConstantService.DefaultMenu.List = [
        { label: 'Client Master', routerLink: ['clientMasterData'] },
        { label: 'User Profile', routerLink: ['userProfile'] }
      ]
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Attribute_Admin ') > -1) {
        this.adminConstantService.DefaultMenu.List.push(
          { label: 'Attribute', routerLink: ['attribute'] }
        )
      }
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Entitlement_Admin ') > -1 || groups.indexOf('Permission_Admin ') > -1) {
        this.adminConstantService.DefaultMenu.List.push(
          { label: 'Entitlement', routerLink: ['entitlement'] }
        )

        // { routerLink: ['/admin/entitlement/userRoleMapping'], label: 'User to Role Mapping', value: 'UserToRoleMapping' },
        // { routerLink: ['/admin/entitlement/roleUserMapping'], label: 'Role to User Mapping', value: 'RoleToUserMapping' },
        // { routerLink: ['/admin/entitlement/copyPermission'], label: 'Copy Permission', value: 'Copy Permission' },
        // { routerLink: ['/admin/entitlement/addUserToSow'], label: 'Add User To Sow', value: 'AddUserToSow' },
        // { routerLink: ['/admin/entitlement/addUserToProjects'], label: 'Add User To Projects', value: 'AddUserToProjects' }
        this.adminConstantService.EntitleMentMenu.List = [];
        if (groups.indexOf('Entitlement_Admin ') > -1) {
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'User to Role Mapping', routerLink: ['userRoleMapping'] },
            { label: 'Role to User Mapping', routerLink: ['roleUserMapping'] },
            { label: 'Copy Permission', routerLink: ['copyPermission'] },
          )
        }

        if (groups.indexOf('Permission_Admin ') > -1) {
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'Add User To Sow', routerLink: ['addUserToSow'] },
            { label: 'Add User To Projects', routerLink: ['addUserToProjects'] },
          )
        }

        if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1) {
          this.adminConstantService.EntitleMentMenu.List = [];
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'User to Role Mapping', routerLink: ['userRoleMapping'] },
            { label: 'Role to User Mapping', routerLink: ['roleUserMapping'] },
            { label: 'Copy Permission', routerLink: ['copyPermission'] },
            { label: 'Add User To Sow', routerLink: ['addUserToSow'] },
            { label: 'Add User To Projects', routerLink: ['addUserToProjects'] },
          )
          if (groups.indexOf('SPTeam') > -1) {
            this.adminConstantService.EntitleMentMenu.List.push(
              { label: 'Add Group Description', routerLink: ['addGroupDescription'] }
            )
          }
        }

      }

      this.constantsService.loader.isPSInnerLoaderHidden = true;
      return true;
    } else {
      return false;
    }
  }
}
