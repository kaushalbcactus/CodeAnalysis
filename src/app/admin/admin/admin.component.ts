import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AdminObjectService } from '../services/admin-object.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
  /**
   * @description
   * Entry point for all admin module.
   */
  public navLinks = [
    { routerLink: ['/admin/attribute'], label: 'Attribute Management', value: 'AttributeManagement' },
    { routerLink: ['/admin/userProfile'], label: 'User Profile Management', value: 'UserProfileManagement' },
    { routerLink: ['/admin/entitlement'], label: 'Entitlement Management', value: 'EntitlementManagement' },
    { routerLink: ['/admin/clientMasterData'], label: 'Client Master Data', value: 'ClientMasterData' },
    { routerLink: ['/admin/rules'], label: 'Rules', value: 'Rules' },
    { routerLink: ['/admin/referenceData'], label: 'Reference Data', value: 'ReferenceData' }
  ];
  constructor(
    public adminObject: AdminObjectService
  ) { }
  ngOnInit() {
  }

}
