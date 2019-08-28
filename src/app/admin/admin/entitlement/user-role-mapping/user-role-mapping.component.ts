import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';

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
  users = [{label: 'User 1' , value: 'User 1'},
  {label: 'User 2' , value: 'User 2'},
  {label: 'User 3' , value: 'User 3'},
  {label: 'User 4' , value: 'User 4'},
  {label: 'User 5' , value: 'User 5'}];
  selectedUser: any;
  selectedRoles: any;
  userRoleColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  };
  roles = [{ label: 'Role 1', value: 'Role 1' },
  { label: 'Role 2', value: 'Role 2' },
  { label: 'Role 3', value: 'Role 3' },
  { label: 'Role 4', value: 'Role 4' },
  { label: 'Role 5', value: 'Role 5' }];

  constructor(private datepipe: DatePipe) { }


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
          this.users.push({ label: element.UserName.Title, value: element.UserName.ID });
        });
      }
      // load groups
      this.groups = results[1].retItems;
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

  userChange() {
    this.selectedRoles = ['Role 1',
      'Role 2'];
  }

  save() {
    console.log(this.selectedUser);
    console.log(this.selectedRoles);
  }
}

