import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-add-user-to-projects',
  templateUrl: './add-user-to-projects.component.html',
  styleUrls: ['./add-user-to-projects.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to projects.
 */
export class AddUserToProjectsComponent implements OnInit {
  clients: any = [];
  cols;
  isTypeDisabled: any = [];
  disableTableHeader = false;
  users = [];
  accessType = [
    { label: this.adminConstants.ACCESS_TYPE.ACCESS, value: this.adminConstants.ACCESS_TYPE.ACCESS },
    { label: this.adminConstants.ACCESS_TYPE.ACCOUNTABLE, value: this.adminConstants.ACCESS_TYPE.ACCOUNTABLE }
  ];
  projectList: any = [];
  selectedUser: any;
  selectedClient: any;
  selectedProject: any = [];
  /**
   * Construct a method to create an instance of required component.
   *
   * @param messageService This is instance referance of `MessageService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminCommon This is instance referance of `AdminCommonService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   */
  constructor(
    private messageService: MessageService,
    private spServices: SPOperationService,
    private adminObject: AdminObjectService,
    private adminConstants: AdminConstantService,
    private constants: ConstantsService,
    private adminCommon: AdminCommonService,
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
    this.loadUsers();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request in dropdown format group array and
   * pushing the data to a particular dropdown array and group array.
   */
  async loadUsers() {
    this.adminObject.isMainLoaderHidden = false;
    const results = this.adminObject.resourceCatArray && this.adminObject.resourceCatArray.length ?
      this.adminObject.resourceCatArray : await this.adminCommon.getResourceCatData();
    if (results && results.length) {
      // empty the array.
      this.users = [];
      // load Users dropdown.
      const userResults = this.adminObject.resourceCatArray && this.adminObject.resourceCatArray.length ?
        this.adminObject.resourceCatArray : results[0].retItems;
      if (userResults && userResults.length) {
        userResults.forEach(element => {
          if (element.RoleCH === this.adminConstants.FILTER.CM_LEVEL_1 || element.RoleCH === this.adminConstants.FILTER.CM_LEVEL_2 || element.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_1 || element.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_2) {
            this.users.push({ label: element.UserNamePG.Title, value: element });
          }
        });
      }
      // Added resouce to global variable.
      this.adminObject.resourceCatArray = userResults;
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Consturct a method to trigger when user dropdown value changes and
   * get the client form `ClientLegalEntity` list based on selected user role.
   *
   * @description
   *
   * This method will get all the client of the user's selected role from `ClientLegalEntity` list.
   * It will add client into client dropdown value.
   *
   */
  async userChange() {
    this.adminObject.isMainLoaderHidden = false;
    const userObj = this.selectedUser;
    this.clients = [];
    this.projectList = [];
    const results = await this.adminCommon.getClients(userObj);
    if (results && results.length) {
      results.forEach(element => {
        this.clients.push({ label: element.Title, value: element.Title });
      });
      this.adminObject.isMainLoaderHidden = true;
    }
  }
  /**
   * Construct a method to trigger when user changes client dropdown value and
   * get all the projects which belongs to the selected client.
   *
   * @description
   *
   * This method will get all the projects belongs to the selected client
   * and show into the table.
   *
   * @Note
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `ProjectInformation` list.
   * 2. By defualt `Access` option is selected in dropdown if user is not accountable and editing is allowed.
   * 3. By defualt `Accountable` option is selected in dropdown if user is accountable and editing is not allowed.
   * 4. If selected user is only present in `CMLevel1` then moving to `CMLevel2` is not possible where as
   * for delivery level it is possible. In another words making accountable for that user in not possible.
   *
   */
  async clientChange() {
    this.adminObject.isMainLoaderHidden = false;
    const userObj = this.selectedUser;
    const tempArray = [];
    this.projectList = [];
    this.selectedProject = [];
    const getProjInfo = Object.assign({}, this.adminConstants.QUERY.GET_PROJECT_BY_CLIENT);
    getProjInfo.filter = getProjInfo.filter.replace(/{{clientLegalEntity}}/gi,
      this.selectedClient);
    this.common.SetNewrelic('admin', 'admin-entitlement-adduserToProject', 'getProjectInformation');
    const sResult = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, getProjInfo);
    if (sResult && sResult.length) {
      let disableCount = 0;
      sResult.forEach(item => {
        const obj = Object.assign({}, this.adminObject.projObj);
        obj.CMLevel1 = item.CMLevel1 && item.CMLevel1.results && item.CMLevel1.results.length ? item.CMLevel1.results : [];
        obj.CMLevel2 = item.CMLevel2 && item.CMLevel2.hasOwnProperty('ID') ? item.CMLevel2 : '';
        obj.AllOperationresources = item.AllOperationresources && item.AllOperationresources.results && item.AllOperationresources.results.length ? item.AllOperationresources.results : [];

        obj.DeliveryLevel1 = item.DeliveryLevel1 && item.DeliveryLevel1.results && item.DeliveryLevel1.results.length ?
          item.DeliveryLevel1.results : [];
        obj.DeliveryLevel2 = item.DeliveryLevel2 && item.DeliveryLevel2.hasOwnProperty('ID') ? item.DeliveryLevel2 : '';
        obj.ClientLegalEntity = item.ClientLegalEntity ? item.ClientLegalEntity : '';
        obj.ID = item.ID;
        obj.Title = item.Title;
        obj.SOWCode = item.SOWCode ? item.SOWCode : '';
        obj.ProjectCode = item.ProjectCode ? item.ProjectCode : '';
        obj.WBJID = item.WBJID ? item.WBJID : '';
        if (item.CMLevel2 && item.CMLevel2.hasOwnProperty('ID')
          && userObj.UserNamePG.ID === item.CMLevel2.ID ||
          item.DeliveryLevel2 && item.DeliveryLevel2.hasOwnProperty('ID')
          && userObj.UserNamePG.ID === item.DeliveryLevel2.ID) {
          obj.IsTypeChangedDisabled = true;
          disableCount++;
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCOUNTABLE;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.ACCOUNTABLE;
        } else if (item.CMLevel1 && item.CMLevel1.hasOwnProperty('results') && item.CMLevel1.results.length
          && item.CMLevel1.results.some(a => a.ID === userObj.UserNamePG.ID) ||
          item.DeliveryLevel1 && item.DeliveryLevel1.hasOwnProperty('results') && item.DeliveryLevel1.results.length
          && item.DeliveryLevel1.results.some(a => a.ID === userObj.UserNamePG.ID)) {
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.ACCESS;
          obj.IsTypeChangedDisabled = false;
        } else {
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.NO_ACCESS;
          obj.IsTypeChangedDisabled = false;
        }
        tempArray.push(obj);
      });
      this.projectList = tempArray;
      if (disableCount === sResult.length) {
        this.disableTableHeader = true;
      } else {
        this.disableTableHeader = false;
      }
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to trigger when user changes accessType dropdown value
   *
   * @description
   *
   * This method will check whether user can become accountable or not.
   * If selected user is not valid for `Accountable` then access type will automatically selected as `Access`.
   *
   * @Note
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `ProjectInformation` list.
   * 2. To make selected user as accountable then atleast another user should also present along with selected user.
   * 3. If selected user is single user in `CMLevel1` then moving to `CMLevel2` is not possible where as
   * for delivery level it is possible. In another words making accountable for that user in not possible.
   * 4. If selected user is single user in `CMLevel1` and user tries to make accontable then the accessType
   * will be automatically changes to `Access`
   *
   * @param projObj It required projObj as a parameter to check the user access type.
   */
  typeChange(projObj) {
    this.messageService.clear();
    const userObj = this.selectedUser;
    if (projObj && projObj.CMLevel1 && projObj.CMLevel1.length && projObj.CMLevel1[0].ID === userObj.UserNamePG.ID) {
      if (projObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', sticky: true,
          summary: 'Error Message', detail: 'The user ' + userObj.UserNamePG.Title + ' cannot be made accountable.'
            + ' Since he is only available in Access. Hence resetting the accessType to Access'
        });
        setTimeout(() => {
          projObj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
        }, 500);
      }
    }
  }
  /**
   * Construct a method to save the user into the selected sow's.
   *
   * @description
   *
   * This method will add user into the `CMLevel1` or `CMLevel2` or `DeliveryLevel1` or `DeliveryLevel2` field
   * of `ProjectInformation` list depending upon select user role.
   *
   * @Note Please note the following conditions
   *
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `ProjectInformation` list.
   * 2. If selected user role is `CMLevel1` or `CMLevel2` then
   *
   * 3. he can be added into either in `CMLevel1` or `CMLevel2` field of `ProjectInformation` list.
   *
   * 4. If not valid `Accountable`- then can only be added into `CMLevel1` field of `ProjectInformation` list.
   *
   * 5. If valid `Accountable`- and selected accessType is `Access` then he can added into `CMLevel1` field of `ProjectInformation` list.
   *
   * 6. If valid `Accountable`- and selected accessType is `Accountable` then he can added into `CMLevel2` field
   *  and removed from `CMLevel1` field of `ProjectInformation` list.
   *
   * 7. If selected user role is `DeliveryLevel1` or `DeliveryLevel2` then
   *
   * 8. he can added into either `DeliveryLevel1` or `DeliveryLevel2` field of `ProjectInformation` list.
   *
   * 9. If not valid `Accountable`- then can only be added into `DeliveryLevel1` field of `ProjectInformation` list.
   *
   * 10. If valid `Accountable`- and selected accessType is `Access` then he can added into `DeliveryLevel1` field
   * of `ProjectInformation` list.
   *
   * 11. If valid `Accountable`- and selected accessType is `Accountable` then he can added into `DeliveryLevel2` field
   *  and removed from `DeliveryLevel1` field of `ProjectInformation` list.
   */
  async save() {
    console.log(this.selectedUser);
    console.log(this.selectedClient);
    console.log(this.selectedProject);
    this.messageService.clear();
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    if (!this.selectedUser || !this.selectedUser.hasOwnProperty('UserNamePG')) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select the user.'
      });
      return false;
    }
    if (!this.selectedClient) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select the client'
      });
      return false;
    }
    if (!this.selectedProject.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select atleast one project.'
      });
      return false;
    }
    if (this.selectedProject.length) {
      this.adminObject.isMainLoaderHidden = false;
      this.selectedProject.forEach(element => {
        element.CMLevel1IDArray = [];
        element.DeliveryLevel1IDArray = [];
        element.AllOperationresourcesIDArray = [];
        if (element.CMLevel1 && element.CMLevel1.length) {
          element.CMLevel1IDArray = element.CMLevel1.map(x => x.ID);
        }
        if (element.AllOperationresources && element.AllOperationresources.length) {
          element.AllOperationresourcesIDArray = element.AllOperationresources.map(x => x.ID);
        }
        if (element.DeliveryLevel1 && element.DeliveryLevel1.length) {
          element.DeliveryLevel1IDArray = element.DeliveryLevel1.map(x => x.ID);
        }
        element.AllOperationresourcesIDArray.push(this.selectedUser.UserNamePG.ID);
        if (element.AccessType === this.adminConstants.ACCESS_TYPE.ACCESS) {
          element.CMLevel1IDArray.push(this.selectedUser.UserNamePG.ID);
          element.DeliveryLevel1IDArray.push(this.selectedUser.UserNamePG.ID);
        } else if (element.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
          // remove the current user if present in CMLevel1.
          const cmIndex = element.CMLevel1IDArray.indexOf(this.selectedUser.UserNamePG.ID);
          if (cmIndex > -1) {
            element.IsUserExistInCMLevel1 = true;
            element.CMLevel1IDArray.splice(cmIndex, 1);
          } else {
            element.IsUserExistInCMLevel1 = false;
          }
          // remove the current user if present in DeliveryLevel1.
          const delIndex = element.DeliveryLevel1IDArray.indexOf(this.selectedUser.UserNamePG.ID);
          if (delIndex > -1) {
            element.IsUserExistInDeliveryLevel1 = true;
            element.DeliveryLevel1IDArray.splice(delIndex, 1);
          } else {
            element.IsUserExistInDeliveryLevel1 = false;
          }
        }

        if (!element.IsTypeChangedDisabled && element.CurrentAccess !== element.AccessType) {
          const sowUpdateData = this.adminCommon.getListData(this.constants.listNames.ProjectInformation.type, this.selectedUser, element, 'projects');
          const sowUpdate = Object.assign({}, options);
          sowUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, element.ID);
          sowUpdate.data = sowUpdateData;
          sowUpdate.type = 'PATCH';
          sowUpdate.listName = this.constants.listNames.ProjectInformation.name;
          batchURL.push(sowUpdate);
        }
      });
      console.log(this.selectedProject);
      if (batchURL && batchURL.length) {
        this.common.SetNewrelic('admin', 'admin-entitlement-adduserToProject', 'updateProjectInformation');
        const updateResult = await this.spServices.executeBatch(batchURL);
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The user has been added into the selected Projects.'
        });
        setTimeout(() => {
          this.clientChange();
        }, 500);
      } else {
        this.messageService.add({
          key: 'adminCustom', severity: 'info', sticky: true,
          summary: 'Info Message', detail: 'The user NOT added into the selected Projects.'
        });
      }
    }
  }
}
