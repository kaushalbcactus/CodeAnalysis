import { Component, OnInit, OnChanges, SimpleChange, ApplicationRef, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user-to-sow',
  templateUrl: './add-user-to-sow.component.html',
  styleUrls: ['./add-user-to-sow.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to SOW's.
 */
export class AddUserToSowComponent implements OnInit {
  isTypeDisabled: any = [];
  users = [];
  clients: any = [];
  disableTableHeader = false;
  accessType = [
    { label: this.adminConstants.ACCESS_TYPE.ACCESS, value: this.adminConstants.ACCESS_TYPE.ACCESS },
    { label: this.adminConstants.ACCESS_TYPE.ACCOUNTABLE, value: this.adminConstants.ACCESS_TYPE.ACCOUNTABLE }
  ];
  sowList: any = [];
  selectedSow: any = [];
  selectedUser: any;
  selectedClient: any;
  selectedRowItems: any;
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
  ngOnInit() {
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
      this.adminObject.resourceCatArray : await this.adminCommon.getResourceCatData();
    if (results && results.length) {
      // empty the array.
      this.users = [];
      // load Users dropdown.
      const userResults = this.adminObject.resourceCatArray && this.adminObject.resourceCatArray.length ?
        this.adminObject.resourceCatArray : results[0].retItems;
      if (userResults && userResults.length) {
        userResults.forEach(element => {
          this.users.push({ label: element.UserName.Title, value: element });
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
    this.sowList = [];
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
   * get all the sow which belongs to the selected client.
   *
   * @description
   *
   * This method will get all the sow belongs to the selected client and show into the table.
   *
   * @Note
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `SOW` list.
   * 2. By defualt `Access` option is selected in dropdown if user is not accountable and editing is allowed.
   * 3. By defualt `Accountable` option is selected in dropdown if user is accountable and editing is not allowed.
   * 4. If selected user is single user in `CMLevel1` then moving to `CMLevel2` is not possible where as
   * for delivery level it is possible. In another words making accountable for that user in not possible.
   */
  async clientChange() {
    this.adminObject.isMainLoaderHidden = false;
    this.sowList = [];
    this.selectedSow = [];
    const tempArray = [];
    const userObj = this.selectedUser;
    const getSOW = Object.assign({}, this.adminConstants.QUERY.GET_SOW_BY_CLIENT);
    getSOW.filter = getSOW.filter.replace(/{{clientLegalEntity}}/gi,
      this.selectedClient);
    const sResult = await this.spServices.readItems(this.constants.listNames.SOW.name, getSOW);
    if (sResult && sResult.length) {
      let disableCount = 0;
      sResult.forEach(item => {
        const obj = Object.assign({}, this.adminObject.sowObj);
        obj.CMLevel1 = item.CMLevel1 && item.CMLevel1.results && item.CMLevel1.results.length ?
          item.CMLevel1.results : [];
        obj.CMLevel2 = item.CMLevel2 && item.CMLevel2.hasOwnProperty('ID') ? item.CMLevel2 : '';
        obj.DeliveryLevel1 = item.DeliveryLevel1 && item.DeliveryLevel1.results && item.DeliveryLevel1.results.length ?
          item.DeliveryLevel1.results : [];
        obj.DeliveryLevel2 = item.DeliveryLevel2 && item.DeliveryLevel2.hasOwnProperty('ID') ? item.DeliveryLevel2 : '';
        obj.ClientLegalEntity = item.ClientLegalEntity ? item.ClientLegalEntity : '';
        obj.ID = item.ID;
        obj.Title = item.Title;
        obj.IsCheckBoxChecked = false;
        obj.SOWCode = item.SOWCode ? item.SOWCode : '';
        if (item.CMLevel2 && item.CMLevel2.hasOwnProperty('ID')
          && userObj.UserName.ID === item.CMLevel2.ID ||
          item.DeliveryLevel2 && item.DeliveryLevel2.hasOwnProperty('ID')
          && userObj.UserName.ID === item.DeliveryLevel2.ID) {
          obj.IsTypeChangedDisabled = true;
          disableCount++;
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCOUNTABLE;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.ACCOUNTABLE;
        } else if (item.CMLevel1 && item.CMLevel1.hasOwnProperty('results') && item.CMLevel1.results.length
          && item.CMLevel1.results.some(a => a.ID === userObj.UserName.ID) ||
          item.DeliveryLevel1 && item.DeliveryLevel1.hasOwnProperty('results') && item.DeliveryLevel1.results.length
          && item.DeliveryLevel1.results.some(a => a.ID === userObj.UserName.ID)) {
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
          obj.IsTypeChangedDisabled = false;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.ACCESS;
        } else {
          obj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
          obj.CurrentAccess = this.adminConstants.ACCESS_TYPE.NO_ACCESS;
          obj.IsTypeChangedDisabled = false;
        }
        tempArray.push(obj);
      });
      this.sowList = tempArray;
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
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `SOW` list.
   * 2. To make selected user as accountable then atleast another user should also present along with selected user.
   * 3. If selected user is single user in `CMLevel1` then moving to `CMLevel2` is not possible where as
   * for delivery level it is possible. In another words making accountable for that user in not possible.
   * 4. If selected user is single user in `CMLevel1` and user tries to make accontable then the accessType
   * will be automatically changes to `Access`
   *
   * @param sowObj It required sowObj as a parameter to check the user access type.
   */
  typeChange(sowObj) {
    this.messageService.clear();
    const userObj = this.selectedUser;
    if (sowObj && sowObj.CMLevel1 && sowObj.CMLevel1.length && sowObj.CMLevel1[0].ID === userObj.UserName.ID) {
      if (sowObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', sticky: true,
          summary: 'Error Message', detail: 'The user ' + userObj.UserName.Title + ' cannot be made accountable.'
            + ' Since he is only available in Access. Hence resetting the accessType to Access'
        });
        setTimeout(() => {
          sowObj.AccessType = this.adminConstants.ACCESS_TYPE.ACCESS;
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
   * of `SOW` list depending upon select user role.
   *
   * @Note Please note the following conditions
   *
   * 1. `Accountable` means user present either in `CMLevel2` or `DeliveryLevel2` field in `SOW` list.
   * 2. If selected user role is `CMLevel1` or `CMLevel2` then
   *
   * 3. he can be added into either in `CMLevel1` or `CMLevel2` field of `SOW` list.
   *
   * 4. If not valid `Accountable` then can only be added into `CMLevel1` field of `SOW` list.
   *
   * 5. If valid `Accountable` and selected accessType is `Access` then he can added into `CMLevel1` field of `SOW` list.
   *
   * 6. If valid `Accountable` and selected accessType is `Accountable` then he can added into `CMLevel2` field
   *  and removed from `CMLevel1` field of `SOW` list.
   *
   * 7. If selected user role is `DeliveryLevel1` or `DeliveryLevel2` then
   *
   * 8. he can added into either `DeliveryLevel1` or `DeliveryLevel2` field of `SOW` list.
   *
   * 9. If not valid `Accountable`- then can only be added into `DeliveryLevel1` field of `SOW` list.
   *
   * 10. If valid `Accountable` and selected accessType is `Access` then he can added into `DeliveryLevel1` field
   * of `SOW` list.
   *
   * 11. If valid `Accountable` and selected accessType is `Accountable` then he can added into `DeliveryLevel2` field
   *  and removed from `DeliveryLevel1` field of `SOW` list.
   *
   */
  async save() {
    this.messageService.clear();
    console.log(this.selectedUser);
    console.log(this.selectedClient);
    console.log(this.selectedSow);
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    if (!this.selectedUser || !this.selectedUser.hasOwnProperty('UserName')) {
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
    if (!this.selectedSow.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', sticky: true,
        summary: 'Error Message', detail: 'Please select atleast one SOW.'
      });
      return false;
    }
    if (this.selectedSow.length) {
      this.adminObject.isMainLoaderHidden = false;
      this.selectedSow.forEach(element => {
        if (element.CMLevel1 && element.CMLevel1.length) {
          element.CMLevel1IDArray = element.CMLevel1.map(x => x.ID);
        }
        if (element.DeliveryLevel1 && element.DeliveryLevel1.length) {
          element.DeliveryLevel1IDArray = element.DeliveryLevel1.map(x => x.ID);
        }
        if (element.AccessType === this.adminConstants.ACCESS_TYPE.ACCESS) {
          element.CMLevel1IDArray.push(this.selectedUser.UserName.ID);
          element.DeliveryLevel1IDArray.push(this.selectedUser.UserName.ID);
        } else if (element.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
          // remove the current user if present in CMLevel1.
          const cmIndex = element.CMLevel1IDArray.indexOf(this.selectedUser.UserName.ID);
          if (cmIndex > -1) {
            element.IsUserExistInCMLevel1 = true;
            element.CMLevel1IDArray.splice(cmIndex, 1);
          } else {
            element.IsUserExistInCMLevel1 = false;
          }
          // This is non mandatory field so first check whether records present in DeliveryLevel1
          // remove the current user if present in DeliveryLevel1.
          if (element.DeliveryLevel1IDArray && element.DeliveryLevel1IDArray.length) {
            const delIndex = element.DeliveryLevel1IDArray.indexOf(this.selectedUser.UserName.ID);
            if (delIndex > -1) {
              element.IsUserExistInDeliveryLevel1 = true;
              element.DeliveryLevel1IDArray.splice(delIndex, 1);
            } else {
              element.IsUserExistInDeliveryLevel1 = false;
            }
          }
        }
        if (!element.IsTypeChangedDisabled) {
          const sowUpdateData = this.adminCommon.getListData(this.constants.listNames.SOW.type, this.selectedUser, element);
          const sowUpdate = Object.assign({}, options);
          sowUpdate.url = this.spServices.getItemURL(this.constants.listNames.SOW.name, element.ID);
          sowUpdate.data = sowUpdateData;
          sowUpdate.type = 'PATCH';
          sowUpdate.listName = this.constants.listNames.SOW.name;
          batchURL.push(sowUpdate);
        }
      });
      if (batchURL && batchURL.length) {
        const updateResult = await this.spServices.executeBatch(batchURL);
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The user has been added into the selected SOW\'s\.'
        });
        setTimeout(() => {
          this.clientChange();
        }, 500);
      }
    }
  }
}
