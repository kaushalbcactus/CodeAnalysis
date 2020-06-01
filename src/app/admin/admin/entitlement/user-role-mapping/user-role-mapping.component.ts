import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-user-role-mapping',
  templateUrl: './user-role-mapping.component.html',
  styleUrls: ['./user-role-mapping.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 * This class is used to add user into multiple groups
 */
export class UserRoleMappingComponent implements OnInit {
  userRoleColumns = [];
  userRoleRows = [];
  users = [];
  groups = [];
  selectedUser: any;
  selectedRoles: string[] = [];
  userExistGroupArray: string[] = [];
  userRoleColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  };
  userInfo;
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   */
  constructor(
    private datepipe: DatePipe,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private adminObject: AdminObjectService,
    private adminCommonService: AdminCommonService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private common : CommonService,
    private applicationRef: ApplicationRef,
    private zone: NgZone
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
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  async ngOnInit() {
    this.loadUsersAndGroups();
    if (this.adminConstants.toastMsg.SPMAD) {
      this.showToastMsg();
    }
  }

  showToastMsg() {

    this.common.showToastrMessage(this.constants.MessageType.warn,'You don\'\t have permission,please contact SP Team.',true);
  }
  /**
   * Construct a request for calling the batches request and load the dropdown and groups values.
   * @description
   * Once the batch request completed and returns the value.
   * It will iterate all the batch array to cater the request in dropdown format and
   * pushing the data to a particular dropdown array and group array.
   */
  async loadUsersAndGroups() {
    this.adminObject.isMainLoaderHidden = false;
    const results = await this.getInitData();
    this.adminConstants.toastMsg.SPMAD = false;
    if (results && results.length) {
      // empty the array.
      this.users = [];
      this.groups = [];
      // load Users dropdown.
      const userResults = results[0].retItems;
      if (userResults && userResults.length) {
        userResults.forEach(element => {
          this.users.push({ label: element.UserName.Title, value: element.UserName });
        });
      }
      // load groups
      results[1].retItems.forEach(element => {
        if (element.Description && element.Description.indexOf(this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM) > -1) {
          element.Description = element.Description.replace(this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM, '');
          this.groups.push(element);
        }
      });
      // assign the value to global array.
      this.adminObject.resourceCatArray = userResults;
      this.adminObject.groupArray = this.groups;
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. Users           - Get data from `ResourceCategorization` list based on filter `IsActive='Yes'`.
   * 2. Groups          - Get data from Groups.
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

    // Get all user from ResourceCategorization list ##1
    const userGet = Object.assign({}, options);
    const userFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
    userFilter.filter = userFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    userGet.url = this.spServices.getReadURL(this.constants.listNames.ResourceCategorization.name,
      userFilter);
    userGet.type = 'GET';
    userGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(userGet);

    // Get all Groups from sites list ##2
    const groupGet = Object.assign({}, options);
    groupGet.url = this.spServices.getAllGroupUrl();
    groupGet.type = 'GET';
    groupGet.listName = 'Groups';
    batchURL.push(groupGet);
    this.common.SetNewrelic('admin', 'admin-entitlement-UserRole', 'GetResourceCategorization');
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * construct a method to get called whenever user dropdown values changes.
   *
   * @description
   * This method will get all the information about user.
   * It will highlight the group in which user is already presents.
   *
   */
  async onUserChange() {
    this.common.clearToastrMessage();
    this.adminObject.isMainLoaderHidden = false;
    const currentUserId = this.selectedUser.value.ID;
    await this.highlightGroups(currentUserId);
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * construct a method to pre-select the checkbox based on userId.
   *
   * @description
   * It will highlight the group in which user is already presents.
   *
   * @param userId Pass userId as parameter to get the information.
   *
   * @return It will return the group of array in which user is present.
   *
   */
  async highlightGroups(userId) {
    this.common.SetNewrelic('Admin', 'entitlement-user-role-mapping', 'getUserInfo');
    this.userInfo = await this.spServices.getUserInfo(userId);
    this.userExistGroupArray = [];
    if (this.userInfo && this.userInfo.hasOwnProperty('Groups')) {
      if (this.userInfo.Groups && this.userInfo.Groups.results && this.userInfo.Groups.results.length) {
        this.userExistGroupArray = this.userInfo.Groups.results.map(x => x.Title);
      } else {
        this.common.showToastrMessage(this.constants.MessageType.error,'User does not exist in any groups.',false);
      }
    }
    return this.selectedRoles = this.userExistGroupArray;
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
    this.userRoleColArray.User = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.User, value: a.User
      };
      return b;
    }));
    this.userRoleColArray.Role = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.Role, value: a.Role
      };
      return b;
    }));
    this.userRoleColArray.Action = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.Action, value: a.Action
      };
      return b;
    }));
    this.userRoleColArray.By = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.By, value: a.By
      };
      return b;
    }));
    this.userRoleColArray.Date = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM dd, yyyy'),
          value: a.Date
        };
        return b;
      }));
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
    if (!this.selectedUser) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Please select user.',true);
      return false;
    }
    const removeGroups = this.userExistGroupArray.filter(x => !this.selectedRoles.includes(x));
    const groups = this.selectedRoles;
    if (!groups.length && !removeGroups.length) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Please select any one group.',true);
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
    groups.forEach(element => {
      const userData = {
        __metadata: { type: 'SP.User' },
        LoginName: this.userInfo.LoginName
      };
      const userCreate = Object.assign({}, options);
      userCreate.url = this.spServices.getGroupUrl(element, null);
      userCreate.data = userData;
      userCreate.type = 'POST';
      userCreate.listName = element;
      batchURL.push(userCreate);
    });
    removeGroups.forEach(element => {
      const userData = {
        loginName: this.userInfo.LoginName
      };
      const userRemove = Object.assign({}, options);
      userRemove.url = this.spServices.removeUserFromGroupByLoginName(element);
      userRemove.data = userData;
      userRemove.type = 'POST';
      userRemove.listName = element;
      batchURL.push(userRemove);
    });
    if (batchURL.length) {
      this.common.SetNewrelic('admin', 'admin-entitlement-UserRole', 'GetUsersByName');
      const sResult = await this.spServices.executeBatch(batchURL);
      if (sResult && sResult.length) {
        this.adminObject.isMainLoaderHidden = true;
        this.common.showToastrMessage(this.constants.MessageType.success,'User - ' + this.userInfo.Title + ' has been updated successfully',true);
      }
    }
    this.adminObject.isMainLoaderHidden = true;
    this.highlightGroups(this.userInfo.Id);
  }
}


