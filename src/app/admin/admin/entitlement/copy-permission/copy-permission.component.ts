import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { SelectItem, MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-copy-permission',
  templateUrl: './copy-permission.component.html',
  styleUrls: ['./copy-permission.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 * This class is used to copy and add permission to select users.
 */
export class CopyPermissionComponent implements OnInit {
  sourceUsersArray = [];
  destinationUsersArray = [];
  buttons: MenuItem[];
  permissions1: any;
  permissions2: any;
  sourceUsers: any[] = [];
  destinationUser: any;
  permission = {
    user: {},
    addGroups: [],
    removeGroups: [],
    sourceGroups: [],
    destinationGroups: []
  };
  viewArray = {
    sourceGroupsArray: [],
    destinationGroupsArray: [],
    finalResultArray: [],
  };
  /**
   * Construct a method to create an instance of required component.
   *
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param confirmationService This is instance referance of `ConfirmationService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   */
  constructor(
    private spServices: SPOperationService,
    private messageService: MessageService,
    private adminConstants: AdminConstantService,
    private adminObject: AdminObjectService,
    private constants: ConstantsService,
    private confirmationService: ConfirmationService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService
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
  ngOnInit() {
    this.buttons = [
      {
        label: 'Copy Permission', icon: 'pi pi-plus-circle', command: () => {
          this.copyPermission();
        }
      }
    ];
    this.loadUsers();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request in dropdown format group array and
   * pushing the data to a particular dropdown array and group array..
   */
  async loadUsers() {
    this.adminObject.isMainLoaderHidden = false;
    const results = this.adminObject.resourceCatArray && this.adminObject.resourceCatArray.length ?
      this.adminObject.resourceCatArray : await this.getInitData();
    if (results && results.length) {
      // empty the array.
      this.sourceUsersArray = [];
      this.destinationUsersArray = [];
      // load Users dropdown.
      const userResults = this.adminObject.resourceCatArray && this.adminObject.resourceCatArray.length ?
        this.adminObject.resourceCatArray : results[0].retItems;
      if (userResults && userResults.length) {
        userResults.forEach(element => {
          this.sourceUsersArray.push({ label: element.UserName.Title, value: element.UserName.ID });
          this.destinationUsersArray.push({ label: element.UserName.Title, value: element.UserName.ID });
        });
      }
      // Added resouce to global variable.
      this.adminObject.resourceCatArray = userResults;
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
    this.common.SetNewrelic('admin', 'admin-entitlement-copyPermission', 'GetRC');
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * Construct a method to change the destination user array depends on source user array.
   *
   * @description
   *
   * 1. If only `one` user selected in source user array then that user not available in destination array.
   * 2. If `multiple` user selected in source user array then source and destination array have same user.
   *
   */
  async onSourceUsersChange() {
    this.adminObject.isMainLoaderHidden = false;
    this.viewArray.destinationGroupsArray = [];
    this.viewArray.finalResultArray = [];
    this.destinationUsersArray = [];
    this.destinationUser = null;
    const selectedUsersArray = this.sourceUsers;
    if (selectedUsersArray && selectedUsersArray.length === 1) {
      const filterDestinationArray = this.sourceUsersArray.filter(x => !selectedUsersArray.includes(x.value));
      this.destinationUsersArray = filterDestinationArray;
    } else {
      this.destinationUsersArray = this.sourceUsersArray;
    }
    const result = await this.getSourceUsersGroups(selectedUsersArray);
    if (result && result.length) {
      this.viewArray.sourceGroupsArray = result;
    } else {
      this.viewArray.sourceGroupsArray = [];
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to show the destination user array depends on selected value.
   *
   * @description
   *
   * It will show all the groups name in which selected user presents.
   *
   */
  async onDestinationUserChange() {
    this.adminObject.isMainLoaderHidden = false;
    const destinationUserId = this.destinationUser;
    this.viewArray.finalResultArray = [];
    const result = await this.getDestinationUserGroups(destinationUserId);
    if (result && result.length) {
      this.viewArray.destinationGroupsArray = result;
    } else {
      this.viewArray.destinationGroupsArray = [];
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct the method to copy the source users permission to destination user.
   *
   * @description
   *
   * This method add the destination user to the same groups in which source users present by
   * removing the destination user from existing groups.
   * @note
   *
   * This method will remove user from groups in which he was present earlier.
   * i.e Source users group is equal to destination user group.
   */
  copyPermission() {
    this.messageService.clear();
    const isValid = this.validateForms();
    if (isValid) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to copy permission? '
          + '\nNote: It will remove all the previous permission and copy '
          + 'the same permission levels of all selected users.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        key: 'confirm',
        accept: () => {
          this.savePermission(this.adminConstants.ACTION.COPY);
        }
      });
    }
  }
  /**
   * Construct the method to add the source users permission to destination user.
   *
   * @description
   *
   * This method add the destination user to the same groups in which source users present
   * without removing the destination user from existing groups.
   * @note
   *
   * This method will add source user to the same group in which destination user present.
   * i.e Source users group is equal to destination user group plus existing groups.
   */
  addPermission() {
    // this.messageService.clear();
    const isValid = this.validateForms();
    if (isValid) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to add permission? '
          + '\n Note: It will not remove previous permission instead it will add '
          + 'additional permission of selected users.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        key: 'confirm',
        accept: () => {
          this.savePermission(this.adminConstants.ACTION.ADD);
        }
      });
    }
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to add/remove the user into groups.
   *
   * This method to add/remove the destination users from groups.
   *
   * @descrition
   *
   * If `Source User` not have any permission it will throw an error.
   *
   * If `Add` is passed into action - It will add destination user into the selected users group without
   * removing them from previous groups.
   *
   * If `Copy` is passed into action - It will add destination user into the selected users group with
   * removing them from previous groups.
   *
   * @param action Pass action as paramter to perform add or copy permission.
   */
  async savePermission(action) {
    this.adminObject.isMainLoaderHidden = false;
    this.permission.user = {};
    this.permission.addGroups = [];
    this.permission.removeGroups = [];
    this.permission.sourceGroups = [];
    this.permission.destinationGroups = [];
    const actionResult = await this.getAddCopyGroups(action);
    if (!actionResult.length) {
      this.adminObject.isMainLoaderHidden = true;
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'The selected source users doesn\'t\ have any permission.'
      });
      return false;
    }
    if (actionResult.length) {
      const destinationUser: any = this.permission.user;
      const addGroups = this.permission.addGroups;
      const removeGroups = this.permission.removeGroups;
      console.log(destinationUser);
      console.log(addGroups);
      console.log(removeGroups);
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      if (destinationUser && destinationUser.hasOwnProperty('LoginName')) {
        removeGroups.forEach(element => {
          const userData = {
            loginName: destinationUser.LoginName
          };
          const userRemove = Object.assign({}, options);
          userRemove.url = this.spServices.removeUserFromGroupByLoginName(element);
          userRemove.data = userData;
          userRemove.type = 'POST';
          userRemove.listName = element;
          batchURL.push(userRemove);
        });
        addGroups.forEach(element => {
          const userData = {
            __metadata: { type: 'SP.User' },
            LoginName: destinationUser.LoginName
          };
          const userCreate = Object.assign({}, options);
          userCreate.url = this.spServices.getGroupUrl(element, null);
          userCreate.data = userData;
          userCreate.type = 'POST';
          userCreate.listName = element;
          batchURL.push(userCreate);
        });
      }
      if (batchURL.length) {
        this.common.SetNewrelic('admin', 'admin-entitlement-copyPermission', 'AddorRemoveUserFromGroupByLoginName');
        const result = await this.spServices.executeBatch(batchURL);
        if (result && result.length && action === this.adminConstants.ACTION.ADD) {
          this.viewArray.finalResultArray = this.permission.addGroups.concat(this.permission.destinationGroups);
          this.messageService.add({
            key: 'adminCustom', severity: 'success', sticky: true,
            summary: 'Success Message', detail: 'The permission has added successfully to the user - ' + destinationUser.Title + '.'
          });
        }
        if (result && result.length && action === this.adminConstants.ACTION.COPY) {
          this.viewArray.finalResultArray = this.permission.addGroups;
          this.messageService.add({
            key: 'adminCustom', severity: 'success', sticky: true,
            summary: 'Success Message', detail: 'The permission has copied successfully to the user - ' + destinationUser.Title + '.'
          });
        }
      }
      this.adminObject.isMainLoaderHidden = true;
    }
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query and
   * returns all the groups in which source and destination user presents.
   *
   * If `Source User` doesn't present in any group then it will return as null.
   *
   * @description
   *
   * It will an object of user having an array of groups in which destination user will be add or remove.
   *
   * If `Add` is passed into action - It will add destination user into the selected users group without
   * removing them from previous groups.
   *
   * If `Copy` is passed into action - It will add destination user into the selected users group with
   * removing them from previous groups.
   *
   * @param Pass action as parameter to add or copy the user permission.
   * @returns It will an object of users having an array of groups in which user will add or remove.
   */
  async getAddCopyGroups(action) {
    const sourceUserIdArray = this.sourceUsers;
    const destinationUserId = this.destinationUser;
    if (this.permission.sourceGroups && this.permission.sourceGroups.length) {
      const retSourceGroups = this.permission.sourceGroups;
      const retDestinationGroups = this.permission.destinationGroups;
      // remove the group in which user alreay present.
      if (action === this.adminConstants.ACTION.ADD) {
        if (retDestinationGroups && retDestinationGroups.length) {
          const diffrenceGroups = retSourceGroups.filter(x => retDestinationGroups && !retDestinationGroups.includes(x));
          this.permission.addGroups = diffrenceGroups;
        } else {
          this.permission.addGroups = retSourceGroups;
        }
        this.permission.removeGroups = [];
      }
      if (action === this.adminConstants.ACTION.COPY) {
        this.permission.addGroups = retSourceGroups;
        this.permission.removeGroups = retDestinationGroups;
      }
    } else {
      const retSourceGroups = await this.getSourceUsersGroups(sourceUserIdArray);
      const retDestinationGroups = await this.getDestinationUserGroups(destinationUserId);
      if (action === this.adminConstants.ACTION.ADD) {
        if (retDestinationGroups && retDestinationGroups.length) {
          const diffrenceGroups = retSourceGroups.filter(x => retDestinationGroups && !retDestinationGroups.includes(x));
          this.permission.addGroups = diffrenceGroups;
        } else {
          this.permission.addGroups = retSourceGroups;
        }
        this.permission.removeGroups = [];
      }
      if (action === this.adminConstants.ACTION.COPY) {
        this.permission.addGroups = retSourceGroups;
        this.permission.removeGroups = retDestinationGroups;
      }
    }
    if (this.permission.addGroups && this.permission.addGroups.length ||
      this.permission.removeGroups && this.permission.removeGroups.length) {
      return this.permission.addGroups;
    } else {
      return null;
    }
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query and
   * returns all the groups in which source user presents.
   *
   * If `Source User` doesn't present in any group then it will return as null.
   *
   * @description
   *
   * This method will return the source users groups.
   *
   * @param sourceUserIdArray Pass sourceUserIdArray as parameter to get all the groups.
   *
   * @returns If source user belongs to any groups then it will an array of source users groups
   * else return null.
   */
  async getSourceUsersGroups(sourceUserIdArray) {
    this.messageService.clear();
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    if (sourceUserIdArray && sourceUserIdArray.length) {
      // Get all Groups for source users ##1
      sourceUserIdArray.forEach(element => {
        const sourceGet = Object.assign({}, options);
        sourceGet.url = this.spServices.getUserURL(element);
        sourceGet.type = 'GET';
        sourceGet.listName = 'Groups- ' + element;
        batchURL.push(sourceGet);
      });
    }
    const tempSourceArray = [];
    if (batchURL && batchURL.length) {
      this.common.SetNewrelic('admin', 'admin-entitlement-copyPermission', 'getSourceUsersGroups');
      const sResults = await this.spServices.executeBatch(batchURL);
      if (sResults && sResults.length) {
        sResults.forEach((element, index) => {
          // Iterate the groups and push into retSourceGroups &  retDestinationGroups Array.
          if (element.retItems && element.retItems.hasOwnProperty('Groups')
            && element.retItems.Groups.results && element.retItems.Groups.results.length) {
            const tempGroups = element.retItems.Groups.results;
            tempGroups.forEach(group => {
              // store into retSourceGroups
              if (tempSourceArray.findIndex(x => x === group.Title) === -1) {
                tempSourceArray.push(group.Title);
              }
            });
          }
        });
      }
    }
    if (tempSourceArray && tempSourceArray.length) {
      this.permission.sourceGroups = tempSourceArray;
      return tempSourceArray;
    } else {
      this.sourceUsers = [];
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'The selected source users doesn\'t\ have any permission. Kindly select another user'
      });
      return null;
    }
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the REST request to get the data based on query and
   * returns all the groups in which destination user presents.
   *
   * If `destinationUserId` doesn't present in any group then it will return as null.
   *
   * @param destinationUserId Pass the destinationUserId as paramter to get all the groups related to destination user.
   *
   * @return If destination user belongs to any groups then it will an array of destination users groups
   * else return null.
   */
  async getDestinationUserGroups(destinationUserId) {
    const tempSourceArray = [];
    this.common.SetNewrelic('Admin', 'CopyPermission', 'getUserInfo');
    const result = await this.spServices.getUserInfo(destinationUserId);
    console.log(result);
    if (result && result.hasOwnProperty('LoginName')) {
      this.permission.user = result;
    }
    if (result && result.hasOwnProperty('Groups') &&
      result.Groups.results && result.Groups.results.length) {
      const tempGroups = result.Groups.results;
      tempGroups.forEach(group => {
        // store into retSourceGroups
        if (tempSourceArray.findIndex(x => x === group.Title) === -1) {
          tempSourceArray.push(group.Title);
        }
      });
    }
    if (tempSourceArray && tempSourceArray.length) {
      this.permission.destinationGroups = tempSourceArray;
      return tempSourceArray;
    } else {
      return null;
    }
  }
  /**
   * Construct a method to validate the forms.
   * @description
   *
   * This method is used to validate the forms.
   * If `Valid` it will return `true`.
   * If `InValid` it will return `false`.
   *
   * @retun It will return the boolean value true/false.
   */
  validateForms() {
    if (!this.sourceUsers.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select atleast one user.'
      });
      return false;
    }
    if (!this.destinationUser) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select user to add/copy permission.'
      });
      return false;
    }
    return true;
  }
}
