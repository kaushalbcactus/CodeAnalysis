import { Injectable } from '@angular/core';
import { PeoplePickerQuery } from '../peoplePickerModel/people-picker.query';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FormDigestResponse } from '../peoplePickerModel/people-picker.response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/Services/global.service';
const PEOPLE_PICKER_URL =
  '_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser';
@Injectable({
  providedIn: 'root'
})
export class AdminCommonService {
  constructor(
    private httpClient: HttpClient,
    private globalObject: GlobalService
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
}
