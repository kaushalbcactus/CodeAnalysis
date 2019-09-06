import { Injectable } from '@angular/core';
import { PeoplePickerQuery } from '../peoplePickerModel/people-picker.query';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FormDigestResponse } from '../peoplePickerModel/people-picker.response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/Services/global.service';
import { AdminConstantService } from './admin-constant.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
const PEOPLE_PICKER_URL =
  '_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser';
@Injectable({
  providedIn: 'root'
})
export class AdminCommonService {
  constructor(
    private httpClient: HttpClient,
    private globalObject: GlobalService,
    private adminConstants: AdminConstantService,
    private spServices: SPOperationService,
    private constants: ConstantsService
  ) { }
  public getUserSuggestions(query: PeoplePickerQuery): Observable<any> {
    return this.httpClient.post('' + this.globalObject.sharePointPageObject.webAbsoluteUrl + '/_api/contextinfo', '').pipe(
      mergeMap((xRequest: FormDigestResponse) => {
        const digest = xRequest.FormDigestValue;
        const headers = new HttpHeaders({
          accept: 'application/json;odata=verbose',
          'X-RequestDigest': digest
        });
        const httpOptions = {
          headers
        };
        return this.httpClient.post(
          this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + PEOPLE_PICKER_URL,
          query,
          httpOptions
        );
      })
    );
  }
  /**
   * /**
   * Construct a method to get the Id's from array.
   *
   * @param array Pass the array as paramater for getting Lookup Id's.
   *
   * @return It will return an array of lookup Id's.
   */
  getIds(array) {
    const tempArray = [];
    array.forEach(element => {
      tempArray.push(element.ID);
    });
    return tempArray;
  }

  /**
   * This function is used to extract the FUll name from Id.
   * @param array Pass the array as paramter for getting full name or title.
   * @param arrayOfIds array of Id's
   *
   * @return It will return an array of Full name or Title.
   */
  extractNamefromId(array, ids, prop) {
    const tempArray = [];
    array.forEach((element) => {
      ids.forEach(tempOjb => {
        if (element.ID === tempOjb) {
          tempArray.push(element[prop]);
        }
      });
    });
    return tempArray;
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
  async getResourceCatData() {
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
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * Consturct a method to get the client form `ClientLegalEntity` list based on selected user role.
   *
   * @description
   *
   * This method will get all the client of the user's selected role from `ClientLegalEntity` list.
   * @param userObj Pass the userObj as parameter which contains the user information.
   *
   * @return An array response which contains the ClientlegalEntity information.
   *
   */
  async getClients(userObj) {
    const cleGet = Object.assign({}, this.adminConstants.QUERY.GET_CLIENTLEGALENTITY_BY_USER_ROLE);
    if (userObj.Role && userObj.Role === this.adminConstants.FILTER.CM_LEVEL_1) {
      cleGet.filter = 'CMLevel1/ID eq ' + userObj.UserName.ID + '';
    }
    if (userObj.Role && userObj.Role === this.adminConstants.FILTER.CM_LEVEL_2) {
      cleGet.filter = 'CMLevel2/ID eq ' + userObj.UserName.ID + '';
    }
    if (userObj.Role && userObj.Role === this.adminConstants.FILTER.DELIVERY_LEVEL_1) {
      cleGet.filter = 'DeliveryLevel1/ID eq ' + userObj.UserName.ID + '';
    }
    if (userObj.Role && userObj.Role === this.adminConstants.FILTER.DELIVERY_LEVEL_2) {
      cleGet.filter = 'DeliveryLevel2/ID eq ' + userObj.UserName.ID + '';
    }
    const results = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, cleGet);
    return results;
  }
  /**
   * Consturct a method to get update list data for `SOW` or `ProjectInformation` list.
   *
   * @description
   *
   * This method to get to get update list data for `SOW` or `ProjectInformation` list.
   * @param listType Pass the listType as parameter contains the list type information.
   * @param userObj Pass the userObj as parameter contains user information like Role, Id.
   * @param listObj pass the listObj as parameter contains the access type.
   *
   * @return An object as response which contains the list data required to update in `SOW` or `ProjectInformation` list.
   *
   */
  getListData(listType, userObj, listObj) {
    const data: any = {
      __metadata: { type: listType },
    };
    if (userObj.Role === this.adminConstants.FILTER.CM_LEVEL_1 ||
      userObj.Role === this.adminConstants.FILTER.CM_LEVEL_2) {
      if (listObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCESS) {
        data.CMLevel1Id = {
          results: listObj.CMLevel1IDArray
        };
      }
      if (listObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
        // If user is present in CMLevel1 then remove from it.
        if (listObj.IsUserExistInCMLevel1) {
          data.CMLevel1Id = {
            results: listObj.CMLevel1IDArray
          };
        }
        data.CMLevel2Id = userObj.UserName.ID;
      }
    }
    if (userObj.Role === this.adminConstants.FILTER.DELIVERY_LEVEL_1 ||
      userObj.Role === this.adminConstants.FILTER.DELIVERY_LEVEL_2) {
      if (listObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCESS) {
        data.DeliveryLevel1Id = {
          results: listObj.DeliveryLevel1IDArray
        };
      }
      if (listObj.AccessType === this.adminConstants.ACCESS_TYPE.ACCOUNTABLE) {
        // If user is present in DeliveryLevel1 then remove from it.
        if (listObj.IsUserExistInDeliveryLevel1) {
          data.DeliveryLevel1Id = {
            results: listObj.DeliveryLevel1IDArray
          };
        }
        data.DeliveryLevel2Id = userObj.UserName.ID;
      }
    }
    return data;
  }
}
