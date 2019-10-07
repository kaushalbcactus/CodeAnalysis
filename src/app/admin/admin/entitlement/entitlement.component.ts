import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-entitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.css']
})
export class EntitlementComponent implements OnInit {
  public navLinks = [];
  constructor() { }

  ngOnInit() {
    this.navLinks = [
      { routerLink: ['/admin/entitlement/userRoleMapping'], label: 'User to Role Mapping', value: 'UserToRoleMapping' },
      { routerLink: ['/admin/entitlement/roleUserMapping'], label: 'Role to User Mapping', value: 'RoleToUserMapping' },
      { routerLink: ['/admin/entitlement/copyPermission'], label: 'Copy Permission', value: 'Copy Permission' },
      { routerLink: ['/admin/entitlement/addUserToSow'], label: 'Add User To Sow', value: 'AddUserToSow' },
      { routerLink: ['/admin/entitlement/addUserToProjects'], label: 'Add User To Projects', value: 'AddUserToProjects' },
      { routerLink: ['/admin/entitlement/addGroupDescription'], label: 'Add Group Description', value: 'Add Group Description' }
    ];
  }

}
