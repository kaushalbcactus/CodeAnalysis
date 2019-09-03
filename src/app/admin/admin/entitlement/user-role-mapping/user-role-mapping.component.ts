import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { MessageService } from 'primeng/api';

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
  constructor(
    private datepipe: DatePipe,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private adminObject: AdminObjectService,
    private adminService: AdminCommonService,
    private messageService: MessageService
  ) { }
  ngOnInit() {
    this.userRoleColumns = [
      { field: 'User', header: 'User' },
      { field: 'Role', header: 'Role' },
      { field: 'Action', header: 'Action' },
      { field: 'By', header: 'By' },
      { field: 'Date', header: 'Date' }
    ];

    this.userRoleRows = [
      {
        User: 'Test',
        Role: 'Task Feedback',
        Action: 'Kaushal Bagrodia',
        By: 'Kaushal Bagrodia',
        Date: 'Jul 3, 2019'
      }
    ];
    this.loadUsersAndGroups();
    this.colFilters(this.userRoleRows);
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
      this.groups = results[1].retItems;
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
    this.messageService.clear();
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
    this.userInfo = await this.spServices.getUserInfo(userId);
    this.userExistGroupArray = [];
    if (this.userInfo && this.userInfo.hasOwnProperty('Groups')) {
      if (this.userInfo.Groups && this.userInfo.Groups.results && this.userInfo.Groups.results.length) {
        this.userExistGroupArray = this.userInfo.Groups.results.map(x => x.Title);
      } else {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'User does not exist in any groups.'
        });
      }
    }
    return this.selectedRoles = this.userExistGroupArray;
  }
  colFilters(colData) {
    this.userRoleColArray.User = this.uniqueArrayObj(colData.map(a => { const b = { label: a.User, value: a.User }; return b; }));
    this.userRoleColArray.Role = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Role, value: a.Role }; return b; }));
    this.userRoleColArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.userRoleColArray.By = this.uniqueArrayObj(colData.map(a => { const b = { label: a.By, value: a.By }; return b; }));
    this.userRoleColArray.Date = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          value: a.Date
        };
        return b;
      }));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
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
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select user.'
      });
      return false;
    }
    const removeGroups = this.userExistGroupArray.filter(x => !this.selectedRoles.includes(x));
    const groups = this.selectedRoles;
    if (!groups.length && !removeGroups.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select any one group.'
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
      const sResult = await this.spServices.executeBatch(batchURL);
      if (sResult && sResult.length) {
        this.adminObject.isMainLoaderHidden = true;
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'User - ' + this.userInfo.Title + ' has been updated sucessfully'
        });
      }
    }
    this.adminObject.isMainLoaderHidden = true;
    this.highlightGroups(this.userInfo.Id);
  }
}


