import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-entitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.css']
})
export class EntitlementComponent implements OnInit {
  public navLinks = [ {routerLink: ['/admin/entitlement/userRoleMapping'], label: 'User to Group Mapping', value: 'UserToGroupMapping'},
  {routerLink: ['/admin/entitlement/roleUserMapping'], label: 'Group Management', value: 'GroupManagement'},
  {routerLink: ['/admin/entitlement/copyPermission'], label: 'Copy Permission', value: 'Copy Permission'},
  {routerLink: ['/admin/entitlement/addUserToSow'], label: 'Add User To Sow', value: 'AddUserToSow'},
  {routerLink: ['/admin/entitlement/addUserToProjects'], label: 'Add User To Projects', value: 'AddUserToProjects'}];

  constructor() { }

  ngOnInit() {
  }

}
