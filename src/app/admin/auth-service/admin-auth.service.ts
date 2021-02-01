import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminConstantService } from '../services/admin-constant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  constructor(
    private globalObject: GlobalService,
    private spOperationsServices: SPOperationService,
    private adminConstantService: AdminConstantService,
    private constantsService: ConstantsService,
    public commonService: CommonService
  ) { }

  async getUserRole() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.commonService.SetNewrelic('admin', 'admin-auth', 'getUserRole', "GET");
    this.globalObject.userInfo = await this.spOperationsServices.getUserInfo(this.globalObject.currentUser.userId);
    console.log('this.globalObject.userInfo ', this.globalObject.userInfo);
    if (this.globalObject.userInfo.Groups.results.length) {
      const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
      console.log('groups ', groups);
      this.adminConstantService.DefaultMenu.List = [];
      this.adminConstantService.DefaultMenu.List = [
        { label: 'Client Master', routerLink: 'clientMasterData' , command: (event) => {
          this.adminConstantService.mainRouter = event.item;
        } },
        { label: 'User Profile', routerLink: 'userProfile' , command: (event) => {
          this.adminConstantService.mainRouter = event.item;
        } }
      ]
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Attribute_Admin') > -1) {
        if (groups.indexOf('Attribute_Admin') > -1) {
          this.adminConstantService.userRole.SPMAA = true;
        }
        this.adminConstantService.DefaultMenu.List.push(
          { label: 'Attribute', routerLink: 'attribute' , command: (event) => {
            this.adminConstantService.mainRouter = event.item;
          } }
        )
      }
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Entitlement_Admin') > -1 || groups.indexOf('Permission_Admin') > -1) {
        this.adminConstantService.DefaultMenu.List.push(
          { label: 'Entitlement', routerLink: 'entitlement'  , command: (event) => {
            this.adminConstantService.mainRouter = event.item;
          }}
        )

        this.adminConstantService.EntitleMentMenu.List = [];
        if (groups.indexOf('Entitlement_Admin') > -1) {
          this.adminConstantService.userRole.SPMEA = true;
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'User to Role Mapping', routerLink: 'userRoleMapping'  , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },
            { label: 'Role to User Mapping', routerLink: 'roleUserMapping' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },
            { label: 'Copy Permission', routerLink: 'copyPermission' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },
          )
        }

        if (groups.indexOf('Permission_Admin') > -1) {
          this.adminConstantService.userRole.SPMPA = true;
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'Add Access', routerLink: 'addAccess'  , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            }},
            { label: 'Remove Access', routerLink: 'removeAccess' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },

            // { label: 'Add User To SOW', routerLink: ['addUserToSow'] },
            // { label: 'Add User To Projects', routerLink: ['addUserToProjects'] },

          )
        }

        if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1) {
          this.adminConstantService.userRole.SPMEA = true;
          this.adminConstantService.userRole.SPMPA = true;
          this.adminConstantService.userRole.SPMAA = true;
          this.adminConstantService.EntitleMentMenu.List = [];
          this.adminConstantService.EntitleMentMenu.List.push(
            { label: 'User to Role Mapping', routerLink: 'userRoleMapping' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },
            { label: 'Role to User Mapping', routerLink: 'roleUserMapping' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },
            { label: 'Copy Permission', routerLink: 'copyPermission' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },

            { label: 'Add Access', routerLink: 'addAccess' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            }},
            { label: 'Remove Access', routerLink: 'removeAccess' , command: (event) => {
              this.adminConstantService.internalRouter = event.item;
            } },


            // { label: 'Add User To SOW', routerLink: ['addUserToSow'] },
            // { label: 'Add User To Projects', routerLink: ['addUserToProjects'] },
          )
          if (groups.indexOf('SPTeam') > -1) {
            this.adminConstantService.userRole.SPTeam = true;
            this.adminConstantService.EntitleMentMenu.List.push(
              { label: 'Add Group Description', routerLink: 'addGroupDescription' , command: (event) => {
                this.adminConstantService.internalRouter = event.item;
              } }
            )
          }
          if (groups.indexOf('Managers') > -1) {
            this.adminConstantService.userRole.MTeam = true;
          }
        }

        console.log('this.adminConstantService.EntitleMentMenu.List ', this.adminConstantService.EntitleMentMenu.List);

      }

      // this.constantsService.loader.isPSInnerLoaderHidden = true;
      return true;
    } else {
      return false;
    }
  }
}
