import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { PeoplePickerQuery } from 'src/app/models/people-picker.query';
import { PeoplePickerUser } from 'src/app/models/people-picker.response';
import { SPOperationService } from 'src/app/Services/spoperation.service';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {

  @Output() reloadResources = new EventEmitter<string>();
  peoplePickerQuery: PeoplePickerQuery = {
    queryParams: {
      QueryString: '',
      MaximumEntitySuggestions: 10,
      AllowEmailAddresses: true,
      AllowOnlyEmailAddresses: false,
      PrincipalSource: 1,
      PrincipalType: 1,
      SharePointGroupID: 0
    }
  };
  public users: PeoplePickerUser[];
  public multipleUsers: PeoplePickerUser[];
  spuser: PeoplePickerUser;
  spusers: PeoplePickerUser[];
  writerusers: PeoplePickerUser[];
  constructor(
    public sharedObject: GlobalService,
    private spService: SPOperationService) { }


  ngOnInit() {
    this.sharedObject.resSectionShow = true;

    this.writerusers = [{ "Key": "i:0#.f|membership|maxwell.fargose@cactusglobal.com", "DisplayText": "Maxwell Fargose", "IsResolved": true, "Description": "maxwell.fargose@cactusglobal.com", "EntityType": "User", "EntityData": { "IsAltSecIdPresent": "False", "Title": "UI Developer", "Email": "maxwell.fargose@cactusglobal.com", "MobilePhone": "8793608868", "ObjectId": "80ed8178-a367-43ab-a134-b6aea6da67ac", "Department": "MedCom Delivery - Medical Communications" }, "MultipleMatches": [], "ProviderName": "Tenant", "ProviderDisplayName": "Tenant" }, { "Key": "i:0#.f|membership|kaushal.bagrodia@cactusglobal.com", "DisplayText": "Kaushal Bagrodia", "IsResolved": true, "Description": "kaushal.bagrodia@cactusglobal.com", "EntityType": "User", "EntityData": { "IsAltSecIdPresent": "False", "Title": "Lead Sharepoint Development", "Email": "kaushal.bagrodia@cactusglobal.com", "MobilePhone": "", "ObjectId": "674b31c4-db7d-4fbb-be43-bf94742c3fc2", "Department": "MedCom Delivery - Medical Communications" }, "MultipleMatches": [], "ProviderName": "Tenant", "ProviderDisplayName": "Tenant" }, { "Key": "i:0#.f|membership|maxwell.fargose@cactusglobal.com", "DisplayText": "Maxwell Fargose", "IsResolved": true, "Description": "maxwell.fargose@cactusglobal.com", "EntityType": "User", "EntityData": { "IsAltSecIdPresent": "False", "Title": "UI Developer", "Email": "maxwell.fargose@cactusglobal.com", "MobilePhone": "8793608868", "ObjectId": "80ed8178-a367-43ab-a134-b6aea6da67ac", "Department": "MedCom Delivery - Medical Communications" }, "MultipleMatches": [], "ProviderName": "Tenant", "ProviderDisplayName": "Tenant" }, { "Key": "i:0#.f|membership|maxwell.fargose@cactusglobal.com", "DisplayText": "Maxwell Fargose", "IsResolved": true, "Description": "maxwell.fargose@cactusglobal.com", "EntityType": "User", "EntityData": { "IsAltSecIdPresent": "False", "Title": "UI Developer", "Email": "maxwell.fargose@cactusglobal.com", "MobilePhone": "8793608868", "ObjectId": "80ed8178-a367-43ab-a134-b6aea6da67ac", "Department": "MedCom Delivery - Medical Communications" }, "MultipleMatches": [], "ProviderName": "Tenant", "ProviderDisplayName": "Tenant" }, { "Key": "i:0#.f|membership|maxwell.fargose@cactusglobal.com", "DisplayText": "Maxwell Fargose", "IsResolved": true, "Description": "maxwell.fargose@cactusglobal.com", "EntityType": "User", "EntityData": { "IsAltSecIdPresent": "False", "Title": "UI Developer", "Email": "maxwell.fargose@cactusglobal.com", "MobilePhone": "8793608868", "ObjectId": "80ed8178-a367-43ab-a134-b6aea6da67ac", "Department": "MedCom Delivery - Medical Communications" }, "MultipleMatches": [], "ProviderName": "Tenant", "ProviderDisplayName": "Tenant" }];
    // this.loadResources();
  }

  filterUsers(event, type) {
    this.peoplePickerQuery = Object.assign({
      queryParams: {
        QueryString: event.query,
        MaximumEntitySuggestions: 10,
        AllowEmailAddresses: true,
        AllowOnlyEmailAddresses: false,
        PrincipalSource: 1,
        PrincipalType: 1,
        SharePointGroupID: 0
      }
    });

    this.spService
      .getUserSuggestions(this.peoplePickerQuery)
      .subscribe((result: any) => {
        if (type === 'single') {
          this.users = [];
          const allUsers: PeoplePickerUser[] = JSON.parse(
            result.d.ClientPeoplePickerSearchUser
          );
          allUsers.forEach(user => {
            this.users = [...this.users, user];
          });
        } else {
          this.multipleUsers = [];
          const allUsers: PeoplePickerUser[] = JSON.parse(
            result.d.ClientPeoplePickerSearchUser
          );
          allUsers.forEach(user => {
            this.multipleUsers = [...this.multipleUsers, user];
          });
        }
      });
  }

  public callReloadRes() {
    this.reloadResources.next('callRes');
  }

}
