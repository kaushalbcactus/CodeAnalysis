import { Component, OnInit } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-entitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.css']
})
export class EntitlementComponent implements OnInit {
  public navLinks = [];
  constructor(
    private spServices: SPOperationService,
    private globalObject: GlobalService) { }

  async ngOnInit() {
    this.navLinks = [
      { routerLink: ['/admin/entitlement/userRoleMapping'], label: 'User to Role Mapping', value: 'UserToRoleMapping' },
      { routerLink: ['/admin/entitlement/roleUserMapping'], label: 'Role to User Mapping', value: 'RoleToUserMapping' },
      { routerLink: ['/admin/entitlement/copyPermission'], label: 'Copy Permission', value: 'Copy Permission' },
      { routerLink: ['/admin/entitlement/addUserToSow'], label: 'Add User To Sow', value: 'AddUserToSow' },
      { routerLink: ['/admin/entitlement/addUserToProjects'], label: 'Add User To Projects', value: 'AddUserToProjects' }
    ];
    await this.checkUserPresentInGroup();
  }
  async checkUserPresentInGroup() {
    const isPresent = false;
    const userInfo = await this.spServices.getUserInfo(this.globalObject.sharePointPageObject.userId);
    if (userInfo && userInfo.hasOwnProperty('Groups')) {
      if (userInfo.Groups && userInfo.Groups.results && userInfo.Groups.results.length) {
        console.log(userInfo.Groups.results);
        if (userInfo.Groups.results.some(x => x.Title === 'SPTeam')) {
          this.navLinks.push({
            routerLink: ['/admin/entitlement/addGroupDescription'],
            label: 'Add Group Description', value: 'Add Group Description'
          });
        }
      }
    }
  }
}
