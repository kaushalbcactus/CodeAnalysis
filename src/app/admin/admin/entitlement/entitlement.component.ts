import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-entitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.css']
})
export class EntitlementComponent implements OnInit {
  public navLinks = [ {routerLink: ['/admin/entitlement/userRoleMapping'], label: 'User-Role Mapping', value: 'UserRoleMapping'},
  {routerLink: ['/admin/entitlement/roleUserMapping'], label: 'Role-User Mapping', value: 'RoleUserapping'}];
  constructor() { }

  ngOnInit() {
  }

}
