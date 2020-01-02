import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { MessageService } from 'primeng/api';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { Router } from '@angular/router';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-role-user-mapping',
  templateUrl: './role-user-mapping.component.html',
  styleUrls: ['./role-user-mapping.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 * This class is used to remove the users from group
 */
export class RoleUserMappingComponent implements OnInit {
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   */
  constructor(
    private datepipe: DatePipe,
    private spServices: SPOperationService,
    private adminObject: AdminObjectService,
    private messageService: MessageService,
    private adminCommonService: AdminCommonService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService,
    private adminConstants: AdminConstantService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });
  }
  roleUserColumns = [];
  roleUserRows = [];
  groupsArray = [];
  usersArray = [];
  selectedGroup: any;
  selectedUsers: any;
  roleUserColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  };
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  ngOnInit() {
    this.loadGroups();
  }
  /**
   * Construct a request for calling the batches request and load the groups values.
   * @description
   * Once the batch request completed and returns the value.
   * It will iterate all the batch array to cater the request in group array.
   */
  async loadGroups() {
    this.adminObject.isMainLoaderHidden = false;
    const results = await this.getInitData();
    if (results && results.length) {
      this.groupsArray = [];
      // load Users dropdown.
      const groupResults = results[0].retItems;
      if (groupResults && groupResults.length) {
        groupResults.forEach(element => {
          if (element.Description && element.Description.indexOf(this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM) > -1) {
            element.Description = element.Description.replace(this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM, '');
            this.groupsArray.push({ label: element.Title, value: element.Title });
          }
        });
      }
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. Groups          - Get data from Groups.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get all Groups from sites list ##1
    const groupGet = Object.assign({}, options);
    groupGet.url = this.spServices.getAllGroupUrl();
    groupGet.type = 'GET';
    groupGet.listName = 'Groups';
    batchURL.push(groupGet);
    this.common.SetNewrelic('admin', 'admin-entitlement-RoleUserMapping', 'GetAllsitegroups');
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * Construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * This method will get all the users exist into the selected groups.
   */
  async onGroupsChange() {
    this.messageService.clear();
    this.adminObject.isMainLoaderHidden = false;
    const groupName = this.selectedGroup;
    const usersArrayResult = await this.spServices.readGroupUsers(groupName, null);
    if (usersArrayResult && usersArrayResult.length) {
      console.log(usersArrayResult);
      this.usersArray = usersArrayResult;
      this.adminObject.isMainLoaderHidden = true;
    } else {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Users does not exist in this group.'
      });
      this.usersArray = [];
      this.adminObject.isMainLoaderHidden = true;
    }
  }
  /**
   * construct a method to add/remove the user from the selected/unselected group.
   *
   * @description
   * This method will get all the information about user.
   * It will highlight the group in which user is already presents.
   *
   */
  async save() {
    const groupName = this.selectedGroup;
    const usersArray = this.selectedUsers;
    if (!groupName) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select group.'
      });
      return false;
    }
    if (!usersArray) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select atleast one user.'
      });
      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    usersArray.forEach(element => {
      const userData = {
        loginName: element
      };
      const userRemove = Object.assign({}, options);
      userRemove.url = this.spServices.removeUserFromGroupByLoginName(groupName);
      userRemove.data = userData;
      userRemove.type = 'POST';
      userRemove.listName = element;
      batchURL.push(userRemove);
    });
    if (batchURL.length) {
      this.common.SetNewrelic('admin', 'admin-entitlement-RoleUserMapping', 'RemoveUserByLoginName');
      const sResult = await this.spServices.executeBatch(batchURL);
      this.adminObject.isMainLoaderHidden = true;
      setTimeout(() => {
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'Selected User has been removed from \'' + groupName + '\' group  successfully.'
        });
      }, 500);
      this.onGroupsChange();
    }
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the User,Role,Action,By and Date column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.roleUserColArray.User = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.User, value: a.User
      };
      return b;
    }));
    this.roleUserColArray.Role = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.Role, value: a.Role
      };
      return b;
    }));
    this.roleUserColArray.Action = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Action, value: a.Action };
      return b;
    }));
    this.roleUserColArray.By = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.By, value: a.By
      };
      return b;
    }));
    this.roleUserColArray.Date = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM dd, yyyy'),
          value: this.datepipe.transform(a.Date)
        };
        return b;
      }));
  }
}

