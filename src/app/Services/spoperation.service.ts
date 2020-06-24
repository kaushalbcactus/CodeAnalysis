import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
// import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConstantsService } from './constants.service';
import { GlobalService } from './global.service';
declare const $: any;


@Injectable({
  providedIn: 'root'
})
export class SPOperationService {
  jsonHeader = 'application/json; odata=verbose';
  headersOld = new Headers({ 'Content-Type': this.jsonHeader, Accept: this.jsonHeader });
  headers = { 'Content-Type': this.jsonHeader, Accept: this.jsonHeader };
  // options = new RequestOptions({ headers: this.headersOld });
  baseUrl: string;
  baseArchiveUrl: string;
  apiUrl: string;
  apiArchiveUrl: string;
  currentUser: string;
  login: string;
  constructor(private globalServices: GlobalService,
    private httpClient: HttpClient, private constants: ConstantsService) { this.setBaseUrl(null); }

  setBaseUrl(webUrl?: string) {
    if (webUrl) {
      // user provided target Web URL
      this.baseUrl = webUrl;
    } else {
      // default local SharePoint context
      // tslint:disable-next-line:no-string-literal
      const ctx = window['_spPageContextInfo'];
      if (ctx) {
        this.baseUrl = ctx.webAbsoluteUrl;
      } else {
        this.baseUrl = this.globalServices.sharePointPageObject.webAbsoluteUrl;
      }
    }
    // Default to local web URL
    this.apiUrl = this.baseUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
    this.apiArchiveUrl = this.globalServices.sharePointPageObject.webAbsoluteArchiveUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
    this.baseArchiveUrl = this.globalServices.sharePointPageObject.webAbsoluteArchiveUrl;
  }

  getHeaders(bAddContext, returnOp) {
    const headerCopy: any = Object.assign({}, this.headers);
    if (bAddContext) {
      const context: any = document.getElementById('__REQUESTDIGEST');
      if (context) {
        headerCopy['X-RequestDigest'] = context.value;
      }
    }
    if (returnOp) {
      const httpOptions = {
        headers: new HttpHeaders(headerCopy)
      };
      return httpOptions;
    } else {
      return headerCopy;
    }

  }

  // Refresh digest token
  async refreshDigest() {
    const res: any = await this.httpClient.post(this.getContxtURL(), null, this.getHeaders(false, true)).toPromise();
    const context: any = document.getElementById('__REQUESTDIGEST');
    if (context) {
      context.value = res.d.GetContextWebInformation.FormDigestValue;
    }
  }

  // Send email
  async sendMail(to: string, ffrom: string, subj: string, body: string, cc?: string) {
    // const data = this.getEmailData(to, ffrom, subj, body, cc);
    // const url = this.getEmailURL();

    // const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
    //   const error = err.error;
    //   return error;
    // });
    // return this.parseRetSingle(res);
    body = body.replace(RegExp("'", 'gi'), '');
    body = body.replace(/\\/g, '\\\\');
    subj = subj.replace(RegExp("'", 'gi'), '');
    const data = {
      Title: subj,
      MailBody: body,
      Subject: subj,
      ToEmailId: to,
      FromEmailId: ffrom,
      CCEmailId: cc
    };


    const result = await this.createItem(this.constants.listNames.SendEmail.name, data,
      this.constants.listNames.SendEmail.type);
    return this.parseRetSingle(result);
  }

  // ----------SHAREPOINT USER PROFILES----------

  // Lookup any SharePoint UserInfo
  async getUserInfo(id: number) {
    const url = this.getUserURL(id);
    const res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }


  async getGroupInfo(groupName: string) {
    const url = this.getGroupURL(groupName);
    var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  // Invoice Team
  // async getITGroupInfo(groupName: string) {
  //   const url = this.getGroupURL(groupName);
  //   var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
  //     var error = err.error;
  //     return error;
  //   });
  //   return this.parseRetSingle(res);
  // }

  // ----------SHAREPOINT FILES AND FOLDERS----------
  // Create folder
  async createFolder(folderUrl: string) {
    const data = this.getFolderCreationData(folderUrl);
    const url = this.getFolderCreationURL();
    const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async uploadFile(url: string, binary: any) {
    const res = await this.httpClient.post(url, binary, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async executePost(url, data) {
    const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async executeJS(url, data) {
    $.ajax({
      headers: {
        "accept": "application/json;odata=verbose",
      },
      contentType: "application/json;charset=utf-8",
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      async: false,
      success: function (data) {
        console.log(data);
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  async copyFiles(sourceUrlArr: Array<string>, destinationUrlArr: Array<string>) {
    // tslint:disable
    for (var index in sourceUrlArr) {
      const sourceUrl = sourceUrlArr[index];
      const destinationUrl = destinationUrlArr[index];
      var oUrl = this.getCopyFileURL(sourceUrl, destinationUrl);
      await this.executePost(oUrl, null);
    }
    // tslint:enable
  }

  // Build URL string with OData parameters
  readBuilder(url: string, options: any): string {
    if (options) {
      if (options.select) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$select=' + options.select;
      }
      if (options.filter) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$filter=' + options.filter;
      }
      if (options.expand) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$expand=' + options.expand;
      }
      if (options.orderby) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$orderby=' + options.orderby;
      }
      if (options.top) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$top=' + options.top;
      }
      if (options.skip) {
        url += ((url.indexOf('?') === -1) ? '?' : '&') + '$skip=' + options.skip;
      }
    }
    return url;
  }

  // READ entire list - needs $http factory and SharePoint list name
  getAllGroupUrl() {
    const url = this.baseUrl + '/_api/web/sitegroups';
    return url;
  }
  getGroupByName(groupName: any) {
    const groupURl = this.baseUrl + '/_api/web/sitegroups/getbyname(\'{groupName}\')';
    const url = groupURl.replace('{groupName}', groupName);
    return url;
  }
  getGroupUrl(groupName: any, options?: any) {
    const groupURl = this.baseUrl + '/_api/web/sitegroups/getbyname(\'{groupName}\')/users';
    let url = groupURl.replace('{groupName}', groupName);
    url = this.readBuilder(url, options);
    return url;
  }
  removeUserFromGroupByLoginName(groupName: any) {
    const groupURl = this.baseUrl + '/_api/web/sitegroups/getbyname(\'{groupName}\')/users/removeByLoginName';
    const url = groupURl.replace('{groupName}', groupName);
    return url;
  }
  getChoiceFieldUrl(listName: string, options?: any) {
    const choiceUrl = this.baseUrl + '/_api/web/lists/GetByTitle(\'{listName}\')/fields';
    let url = choiceUrl.replace('{listName}', listName);
    url = this.readBuilder(url, options);
    return url;
  }
  getReadURL(listName: string, options?: any) {
    let url = this.apiUrl.replace('{0}', listName);
    url = this.readBuilder(url, options);
    return url;
  }

  getReadURLWithId(listName: string, id: string, options?: any) {
    let url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
    url = this.readBuilder(url, options);
    return url;
  }

  getReadURLArchive(listName: string, options?: any) {
    let url = this.apiArchiveUrl.replace('{0}', listName);
    url = this.readBuilder(url, options);
    return url;
  }

  getEmailURL() {
    return this.baseUrl + '/_api/SP.Utilities.Utility.SendEmail';
  }

  getFolderCreationURL() {
    return this.baseUrl + '/_api/web/Folders';
  }

  getFileUploadUrl(folderUrl: string, fileName: string, override: any) {
    return this.baseUrl + '/_api/web/GetFolderByServerRelativeUrl(\''
      + folderUrl + '\')/files/add(overwrite=' + override + ', url=\'' + fileName + '\')?$expand=ListItemAllFields';
  }

  getContxtURL() {
    return this.baseUrl + '/_api/contextinfo';
  }

  getUserURL(id: any) {
    return this.baseUrl + '/_api/web/getUserById(' + id + ')?$expand=Groups';
  }

  getGroupURL(groupName: any) {
    return this.baseUrl + '/_api/web/sitegroups/getByName(\'' + groupName + '\')/Users';
  }

  getItemURL(listName: string, id: any, options?: any) {
    let url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
    url = this.readBuilder(url, options);
    return url;
  }
  getItemVersionsURL(listName: string, id: any, options?: any) {
    let url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
    url = url + '/Versions';
    url = this.readBuilder(url, options);
    return url;
  }

  getCopyFileURL(sourceUrl: string, destinationUrl: string) {
    // tslint:disable-next-line:max-line-length
    return this.baseUrl + '/_api/web/getfilebyserverrelativeurl(\'' + sourceUrl + '\')/copyto(strnewurl=\'' + destinationUrl + '\',boverwrite=true)';
  }

  getMoveURL(sourceUrl: string, destinationUrl: string) {
    // tslint:disable-next-line:max-line-length
    return this.baseUrl + '/_api/web/getfilebyserverrelativeurl(\'' + sourceUrl + '\')/moveto(newurl=\'' + destinationUrl + '\', flags=1)';
  }

  getFilesFromFoldersURL(folderName: string) {
    return this.baseUrl + '/_api/web/GetFolderByServerRelativeUrl(\'' + folderName + '\')/Files?$expand=ListItemAllFields';
  }

  async readFiles(folderName) {
    const url = this.getFilesFromFoldersURL(folderName);
    const res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }

  getSubFolderFilesURL(folderName: string, count: number) {
    const files = 'Files/ModifiedBy';
    const folder = 'Folders/';
    let expandString = '';
    let temp = '';
    for (let i = 0; i < count; i++) {
      temp = temp + folder;
      expandString = i !== count - 1 ? expandString + temp + files + ',' : expandString + temp + files;
    }
    const url = this.baseUrl + '/_api/Web/GetFolderByServerRelativeUrl(\'' + folderName + '\')?$expand=' + expandString;
    return url;
  }

  async readSubFolderFiles(folderName, count: number) {
    const url = this.getSubFolderFilesURL(folderName, count);
    const res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }
  async getChoiceFieldItems(listName: string, options?: any) {
    const url = this.getChoiceFieldUrl(listName, options);
    let res;
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }
  async readItems(listName: string, options?: any) {
    const url = this.getReadURL(listName, options);
    let res;
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }
  async readGroupUsers(groupName: string, options?: any) {
    const url = this.getGroupUrl(groupName, options);
    let res;
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }
  // READ single item - SharePoint list name, and item ID number
  async readItem(listName: string, id: any, options?: any) {
    const url = this.getItemURL(listName, id, options);
    let res;
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async createItem(listName: string, jsonBody: any, type: string) {
    const url = this.getReadURL(listName, null);
    // append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        // tslint:disable-next-line:object-literal-key-quotes
        'type': type
      };
    }
    const data = JSON.stringify(jsonBody);
    const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  // Add User to group using login name
  async addUserToGroupByLoginName(groupName: any, jsonBody: any) {
    const url = this.getGroupUrl(groupName, null);
    // append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        // tslint:disable-next-line:object-literal-key-quotes
        'type': 'SP.User'
      };
    }
    const data = JSON.stringify(jsonBody);
    const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async createItemAndMove(listName: string, jsonBody: any, type: string, folderUrl: string): Promise<any> {
    const url = this.getReadURL(listName, null);
    // append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        // tslint:disable-next-line:object-literal-key-quotes
        'type': type
      };
    }
    const data = JSON.stringify(jsonBody);
    const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });

    if (res) {
      const urlobj = {
        select: 'FileDirRef,FileRef'
      };
      const urlRef = this.getReadURLWithId(this.constants.listNames.Schedules.name, res.d.ID, urlobj);
      const currentRef: any = await this.httpClient.get(urlRef, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
        const error = err.error;
        return error;
      });
      if (currentRef) {
        const fileUrl = currentRef.d.FileRef;
        const fileDirRef = currentRef.d.FileDirRef;
        const moveFileUrl = fileUrl.replace(fileDirRef, folderUrl);
        // tslint:disable: quotemark
        // tslint:disable-next-line: max-line-length
        const urlMove = this.baseUrl + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
        await this.httpClient.post(urlMove, null, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
          const error = err.error;
          return error;
        });
      }
    }
  }

  /// UPDATE item - SharePoint list name, item ID number, and JS object to stringify for save
  async updateItem(listName: string, id: any, jsonBody: any, type?: string) {
    // Append HTTP header MERGE for UPDATE scenario
    const localOptions = this.getHeaders(true, false);
    localOptions['X-HTTP-Method'] = 'MERGE';
    localOptions['If-Match'] = '*';
    // Append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        // tslint:disable-next-line:object-literal-key-quotes
        'type': type
      };
    }
    const data = JSON.stringify(jsonBody);
    const url = this.getItemURL(listName, id);
    const httpOptions = {
      headers: new HttpHeaders(localOptions)
    };
    await this.httpClient.post(url, data, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
  }
  async updateGroupItem(groupName: string, jsonBody: any) {
    // Append HTTP header MERGE for UPDATE scenario
    const localOptions = this.getHeaders(true, false);
    localOptions['X-HTTP-Method'] = 'MERGE';
    localOptions['If-Match'] = '*';
    // Append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        // tslint:disable-next-line:object-literal-key-quotes
        'type': 'SP.Group'
      };
    }
    const data = JSON.stringify(jsonBody);
    const url = this.getGroupByName(groupName);
    const httpOptions = {
      headers: new HttpHeaders(localOptions)
    };
    await this.httpClient.post(url, data, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
  }
  /**
   * This function is used to generate the Random UID for batch Request.
   */
  generateUUID() {
    // tslint:disable
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
    // tslint:enable
  }

  parseRetSingle(res) {
    if (res) {
      if (res.hasOwnProperty('d')) {
        return res.d;
      } else if (res.hasOwnProperty('error')) {
        const obj: any = res.error;
        obj.hasError = true;
        return obj;
      } else if (res.valueOf('odata')) {
        return res;
      } else {
        return {
          hasError: true,
          comments: res
        };
      }
    } else {
      return {
        hasError: true,
        comments: 'Check the response in network trace'
      };
    }
  }

  parseRetMultiple(res) {
    if (res) {
      if (res.hasOwnProperty('d') && res.d.hasOwnProperty('results')) {
        return res.d.results;
      } else if (res.hasOwnProperty('error')) {
        const obj: any = res.error;
        obj.hasError = true;
        return obj;
      } else {
        return {
          hasError: true,
          comments: res
        };
      }
    } else {
      return {
        hasError: true,
        comments: 'Check the response in network trace'
      };
    }
  }

  parseBatchRet(res) {
    const arrResults = [];
    if (res) {
      const responseInLines = res.split('\r\n');
      // tslint:disable-next-line:prefer-for-of
      for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
        try {
          const tryParseJson = JSON.parse(responseInLines[currentLine]);
          let retVal: any;
          if (tryParseJson.hasOwnProperty('d')) {
            if (tryParseJson.d.hasOwnProperty('results')) {
              retVal = tryParseJson.d.results;
            } else {
              retVal = tryParseJson.d;
            }
          } else if (tryParseJson.hasOwnProperty('error')) {
            retVal = tryParseJson.error;
            retVal.hasError = true;
          } else {
            retVal = {
              hasError: true,
              comments: 'Check the response in network trace'
            };
          }
          arrResults.push(retVal);
        } catch (e) {
        }
      }
    }

    return arrResults;
  }

  setPostBody(batchContents, batchGuid, changeSetId, isUpdateActive) {
    if (!isUpdateActive) {
      this.getBatchBodyPost(batchContents, batchGuid, changeSetId);
    }
    return true;
  }

  closeChangeSection(batchContents, text, id, isUpdateActive) {
    if (isUpdateActive) {
      this.closeSection(batchContents, text, id);
      batchContents.push('');
    }
    return false;
  }
  closeSection(batchContents, text, id) {
    batchContents.push('--' + text + '_' + id + '--');
  }

  async executeBatch(arrUrl) {
    const batchContents = new Array();
    const batchGuid = this.generateUUID();
    const changesetId = this.generateUUID();
    const arrReturnType = [];
    let isUpdateActive = false;
    arrUrl.forEach(url => {

      switch (url.type) {
        case 'GET':
          isUpdateActive = this.closeChangeSection(batchContents, 'changeset', changesetId, isUpdateActive);
          this.getBatchBodyGet(batchContents, batchGuid, url.url);
          arrReturnType.push(url.listName);
          break;
        case 'POST':
          isUpdateActive = this.setPostBody(batchContents, batchGuid, changesetId, isUpdateActive);
          this.getChangeSetBody(batchContents, changesetId, url.url, url.data, url.type);
          arrReturnType.push(url.listName);
          break;
        case 'PATCH':
          isUpdateActive = this.setPostBody(batchContents, batchGuid, changesetId, isUpdateActive);
          this.getChangeSetBody(batchContents, changesetId, url.url, url.data, url.type);
          break;
      }
    });
    this.closeChangeSection(batchContents, 'changeset', changesetId, isUpdateActive);
    isUpdateActive = false;
    this.closeSection(batchContents, 'batch', batchGuid);
    const userBatchBody = batchContents.join('\r\n');
    return await this.executeBatchRequest(batchGuid, userBatchBody, true, arrReturnType);
  }

  async executeBatchRequest(batchGuid, userBatchBody, bCurrent, arrReturnType) {
    const headers = {};
    const context: any = document.getElementById('__REQUESTDIGEST');
    headers['Content-Type'] = 'multipart/mixed; boundary="batch_' + batchGuid + '"';
    // tslint:disable-next-line:no-string-literal
    headers['Accept'] = 'application/json; odata=verbose';
    if (context) {
      headers['X-RequestDigest'] = context.value;
    }
    const options = { headers: new HttpHeaders(headers) };
    const apiURL = (bCurrent ? this.baseUrl : this.baseArchiveUrl) + '/_api/$batch';
    // tslint:disable-next-line:max-line-length
    const res = await this.httpClient.post(apiURL, userBatchBody, { ...options, responseType: 'text' }).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    const retVal = this.parseBatchRet(res);
    const arrRetData = [];
    const oRetObj = {
      listName: '',
      retItems: null
    };
    for (let count = 0; count < retVal.length; count++) {
      const oNewObj = Object.assign({}, oRetObj);
      oNewObj.listName = arrReturnType[count];
      oNewObj.retItems = retVal[count];
      arrRetData.push(oNewObj);
    }

    return arrRetData;
  }

  /**
   * This function is used to get the BatchBodyGet Request
   * @param batchContents Provides the batch contents
   * @param batchGuid Provide the GUID.
   * @param endpoint Provide the endpoint.
   */
  getBatchBodyGet(batchContents, batchGuid, endpoint) {
    batchContents.push('--batch_' + batchGuid);
    batchContents.push('Content-Type: application/http');
    batchContents.push('Content-Transfer-Encoding: binary');
    batchContents.push('');
    batchContents.push('GET ' + endpoint + ' HTTP/1.1');
    batchContents.push('Accept: application/json;odata=verbose');
    batchContents.push('');
    return batchContents;
  }

  /**
   * This function is used to get the BatchBody for post request.
   * @param batchBody Provide the batch body.
   * @param batchGuid Provide the GUID.
   * @param changeSetId Provide the changesetId.
   */
  getBatchBodyPost(batchContents, batchGuid, changeSetId) {
    batchContents.push('--batch_' + batchGuid);
    batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"');
    batchContents.push('Content-Transfer-Encoding: binary');
    batchContents.push('');
    return batchContents;
  }

  /**
   * This function is used to get the changeset body for batch request.
   * @param batchContents Provide the batch request.
   * @param changeSetId Provide the changeset Id.
   * @param endPoint Provide the endpoint.
   * @param data Provide the data.
   */
  getChangeSetBody(batchContents, changeSetId, endPoint, data, type) {
    batchContents.push('--changeset_' + changeSetId);
    batchContents.push('Content-Type: application/http');
    batchContents.push('Content-Transfer-Encoding: binary');
    batchContents.push('');
    batchContents.push(type + ' ' + endPoint + ' HTTP/1.1');
    batchContents.push('Content-Type: application/json;odata=verbose');
    batchContents.push('Accept: application/json;odata=verbose');
    if (type === 'PATCH') {
      batchContents.push('If-Match: *');
    }
    batchContents.push('');
    if (data) {
      data = JSON.stringify(data);
      batchContents.push(data);
      batchContents.push('');
    }
    return batchContents;
  }

  getEmailData(to: string, ffrom: string, subj: string, body: string, cc?: string) {
    const tos: string[] = to.split(',');
    const recip: string[] = (tos instanceof Array) ? tos : [tos];
    const message = {
      // tslint:disable
      'properties': {
        '__metadata': {
          'type': 'SP.Utilities.EmailProperties'
        },
        'To': {
          'results': recip
        },
        'From': ffrom,
        'Subject': subj,
        'Body': body,
        'CC': {
          'results': []
        }
      }
      // tslint:enable
    };
    if (cc) {
      const ccs: string[] = cc.split(',');
      const recipcc: string[] = (ccs instanceof Array) ? ccs : [ccs];
      message.properties.CC = {
        results: recipcc
      };
    }
    const data = JSON.stringify(message);
    return data;
  }
  getFolderCreationData(folderUrl: string) {
    const data = {
      // tslint:disable:object-literal-key-quotes
      '__metadata': {
        'type': 'SP.Folder'
      },
      'ServerRelativeUrl': folderUrl
    };

    return data;
  }
  async getFile(url: string) {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    const res = await this.httpClient.get(url, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return res;
  }

  async createZip(files: any[], zipName: string) {
    const zip = new JSZip();
    const name = zipName + '.zip';
    // tslint:disable-next-line:prefer-for-of
    for (let counter = 0; counter < files.length; counter++) {
      const element = files[counter];
      const fileData: any = await this.getFile(element);
      const b: any = new Blob([fileData], { type: '' + fileData.type + '' });
      zip.file(element.substring(element.lastIndexOf('/') + 1), b);
    }
    zip.generateAsync({ type: 'blob' }).then((content) => {
      if (content) {
        FileSaver.saveAs(content, name);
      }
    });
  }

  async executePostForFileUpload(url, data, headers) {
    let header;
    if (!headers) {
      header = this.getHeaders(true, true);
    } else {
      const context: any = document.getElementById('__REQUESTDIGEST');
      if (context) {
        headers['X-RequestDigest'] = context.value;
      }
      header = { headers: new HttpHeaders(headers) };
    }
    const res = await this.httpClient.post(url, data, header).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  // check if file exist
  async checkFileExist(url: string) {
    const res = await this.httpClient.get<Response>(url).toPromise().catch((err: HttpErrorResponse) => {
      return err;
    });
    return res;
  }

  // postJson(endpointUrl, payload, success, failure) {
  //   $.ajax({
  //     type: "POST",
  //     headers: {
  //       "accept": "application/json;odata=verbose",
  //       "content-type": "application/json;odata=verbose",
  //       "X-RequestDigest": $("#__REQUESTDIGEST").val()
  //     },
  //     data: JSON.stringify(payload),
  //     url: endpointUrl,
  //     success: success,
  //     failure: failure
  //   });

  //   ;
  // }


  // // tslint:disable-next-line: whitespace
  // getListItems('Site', "<View><Query><Where><Contains><FieldRef Name='Keywords'/><Value Type='Note'>test</Value></Contains></Where></Query></View>",
  // function(items) {
  //   for (var i = 0; i < items.length; i++) {
  //     console.log(items);
  //   }
  // },
  // function(error) {
  //   console.log(JSON.stringify(error));
  // });

  // getListItems(success, failure) {
  //   var queryPayload = {
  //     'query': {
  //       '__metadata': { 'type': 'SP.CamlQuery' },
  //       'ViewXml': '<View><Query><Where><Contains><FieldRef Name="Tue,Feb4,2020"/><Value Type="TimeSpentPerday">test</Value></Contains></Where></Query></View>'
  //     }
  //   };

  //   ;
  //   var endpointUrl = this.baseUrl + "/_api/web/lists/getbytitle('Schedules')/getitems";
  //   this.postJson(endpointUrl, queryPayload,
  //     function (data) {
  //       success(data.d.results);
  //     }, failure);
  // }

}
  // added function From old sharepoint service


  // async getDataByApi(batchGuid, batchBody) {


  //   batchBody.push('--batch_' + batchGuid + '--');
  //   const userBatchBody = batchBody.join('\r\n');
  //   const arrResults = [];


  //   let headers = new Headers();
  //   headers.append('Content-Type', 'multipart/mixed; boundary="batch_' + batchGuid + '"');
  //   headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
  //   let options = new RequestOptions({ headers: headers });

  //   let apiURL = this.globalServices.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
  //   const res = await this.http.post(apiURL, userBatchBody, options).toPromise();


  //   if (res["_body"]) {
  //     const responseInLines = res["_body"].split('\r\n');
  //     //   console.log(responseInLines);
  //     for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
  //       try {
  //         const tryParseJson = JSON.parse(responseInLines[currentLine]);
  //         arrResults.push(tryParseJson.d.hasOwnProperty('results') ? tryParseJson.d.results : tryParseJson.d);
  //       } catch (e) {
  //       }
  //     }

  //   }
  //   return arrResults;
  // }
  // executeBatchPostRequestByRestAPI(batchGuid, batchBody) {
  //   // this.getData(batchGuid, batchBody);
  //   let resp = '';
  //   // create the request endpoint
  //   const endpoint = this.globalServices.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';

  //   // batches need a specific header
  //   const batchRequestHeader = {
  //     'X-RequestDigest': $('#__REQUESTDIGEST').val(),
  //     'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
  //   };

  //   // create request
  //   $.ajax({
  //     url: endpoint,
  //     type: 'POST',
  //     async: false,
  //     headers: batchRequestHeader,
  //     data: batchBody,
  //     // tslint:disable
  //     success: function (response) {
  //       resp = response;
  //     },
  //     fail: function (error) {
  //     }
  //     // tslint:enable
  //   });
  //   return resp;
  // }

  // async getFDData(batchGuid, batchBody): Promise<any> {
  //   // const arrResults = [];
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"',
  //       "Accept": "application/json; odata=verbose",
  //       'X-RequestDigest': $("#__REQUESTDIGEST").val() ? $("#__REQUESTDIGEST").val() : ''
  //     })
  //   };

  //   // create the request endpoint
  //   const endpoint = this.globalServices.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
  //   const res = await this.httpClient.post(endpoint, batchBody, { ...httpOptions, responseType: 'text' })
  //     .toPromise().catch((err: HttpErrorResponse) => {
  //       var error = err.error;
  //       return error;
  //     });

  //   const arrResults = this.parseBatchRet(res);
  //   return arrResults;
  // }

  // getChangeSetBody1(changeSetId, endPoint, data, isPostMethod) {
  //   const batchContents = new Array();
  //   batchContents.push('--changeset_' + changeSetId);
  //   batchContents.push('Content-Type: application/http');
  //   batchContents.push('Content-Transfer-Encoding: binary');
  //   batchContents.push('');
  //   batchContents.push(isPostMethod ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
  //   batchContents.push('Content-Type: application/json;odata=verbose');
  //   batchContents.push('Accept: application/json;odata=verbose');
  //   if (data !== '{}') {
  //     batchContents.push('If-Match: *');
  //     batchContents.push('');
  //     batchContents.push(data);
  //   }
  //   batchContents.push('');
  //   return batchContents;
  // }
  // getChangeSetBodySC(batchContents, changeSetId, endPoint, data, createFolder) {
  //   batchContents.push('--changeset_' + changeSetId);
  //   batchContents.push('Content-Type: application/http');
  //   batchContents.push('Content-Transfer-Encoding: binary');
  //   batchContents.push('');
  //   batchContents.push(createFolder ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
  //   batchContents.push('Content-Type: application/json;odata=verbose');
  //   batchContents.push('Accept: application/json;odata=verbose');
  //   batchContents.push('If-Match: *');
  //   batchContents.push('');
  //   batchContents.push(data);
  //   batchContents.push('');
  // }
  // getChangeSetBodyMove(batchContents, changeSetId, endPoint) {
  //   batchContents.push('--changeset_' + changeSetId);
  //   batchContents.push('Content-Type: application/http');
  //   batchContents.push('Content-Transfer-Encoding: binary');
  //   batchContents.push('');
  //   batchContents.push('POST ' + endPoint + ' HTTP/1.1');
  //   batchContents.push('Content-Type: application/json;odata=verbose');
  //   batchContents.push('Accept: application/json;odata=verbose');
  //   batchContents.push('');
  // }
  // getBatchBodyPost1(batchBody, batchGuid, changeSetId) {
  //   const batchContents = new Array();
  //   batchContents.push('--batch_' + batchGuid);
  //   batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"');
  //   batchContents.push('Content-Length: ' + batchBody.length);
  //   batchContents.push('Content-Transfer-Encoding: binary');
  //   batchContents.push('');
  //   batchContents.push(batchBody);
  //   batchContents.push('');
  //   return batchContents;
  // }
  // fetchTaskDocumentsByRestAPI(url, prevTask) {
  //   let arrPrevTasks = [];
  //   if (prevTask === null || prevTask === undefined) //changed on 9.8.17
  //     arrPrevTasks = [];
  //   else {
  //     if (prevTask.indexOf(";#") > -1) {
  //       arrPrevTasks = prevTask.split(";#");
  //     } else {
  //       arrPrevTasks.push(prevTask)
  //     }
  //   }
  //   let tempObject: any = {};
  //   let tempArray = [];
  //   let arrUsers = [];
  //   $.ajax({
  //     url: this.globalServices.sharePointPageObject.webAbsoluteUrl + url,
  //     type: "GET",
  //     async: false,
  //     headers: {
  //       "Accept": "application/json;odata=verbose",
  //     },
  //     success: function (data) {
  //       if (data.d.results.length > 0) {
  //         for (var index in data.d.results) {
  //           tempObject = data.d.results[index];
  //           tempObject.fileUrl = tempObject.ServerRelativeUrl;
  //           tempObject.status = tempObject.ListItemAllFields.Status != null ? tempObject.ListItemAllFields.Status : "";
  //           tempObject.taskName = tempObject.ListItemAllFields.TaskName != null ? tempObject.ListItemAllFields.TaskName : "";
  //           if ((tempObject.status.split(" ").splice(-1)[0] == "Complete" || tempObject.status.split(" ").splice(-1)[0] == "Completed") && arrPrevTasks.indexOf(tempObject.taskName) > -1)
  //             tempObject.visiblePrevTaskDoc = true;
  //           else
  //             tempObject.visiblePrevTaskDoc = false;
  //           tempObject.modified = tempObject.ListItemAllFields.Modified;
  //           tempObject.isFileMarkedAsFinal = tempObject.status.split(" ").splice(-1)[0] === "Complete" ? true : false; //changed on 8.8.17
  //           //tempObject.modifiedUserName = user.name!=null?user.name:"";
  //           tempObject.modifiedUserID = tempObject.ListItemAllFields.EditorId;
  //           tempObject.fileName = tempObject.Name;
  //           tempArray.push(tempObject);
  //         }
  //       }
  //     },
  //     error: function (error) {

  //     }
  //   });
  //   if (tempArray.length > 0)
  //     tempArray = tempArray.sort(function (a, b) {
  //       return a.modified < b.modified ? -1 : 1;
  //     });
  //   return tempArray;
  // }


  // executeBatchRequest1(batchGuid, sBatchData) {
  //   const arrResults = [];
  //   const response = this.executeBatchPostRequestByRestAPI(batchGuid, sBatchData);
  //   const responseInLines = response.split('\n');
  //   for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
  //     try {
  //       const tryParseJson = JSON.parse(responseInLines[currentLine]);
  //       arrResults.push(tryParseJson.d.results ? tryParseJson.d.results : tryParseJson.d);
  //     } catch (e) {
  //     }
  //   }
  //   return arrResults;
  // }

  // fetchListItemsByRestAPI(url?: string, objectArray?: [{ key: string, value: string }]) {
  //   let tempObject = {};
  //   const tempArray = [];
  //   try {
  //     $.ajax({
  //       url: this.globalServices.sharePointPageObject.webAbsoluteUrl + url,
  //       type: 'GET',
  //       async: false,
  //       headers: {
  //         'Accept': 'application/json;odata=verbose',
  //       },
  //       success: function (data) {
  //         if (data.d && !data.d.results) {
  //           tempArray.push(true);
  //         } else if (data.d.results.length > 0) {
  //           for (const index in data.d.results) {
  //             if (data.d.results.hasOwnProperty(index)) {
  //               tempObject = data.d.results[index];
  //               for (const obj in objectArray) {
  //                 if (objectArray.hasOwnProperty(obj)) {
  //                   tempObject[objectArray[obj].key] = objectArray[obj].value != null ? objectArray[obj].value : '';
  //                 }
  //               }
  //               tempArray.push(tempObject);
  //             }
  //           }
  //         }
  //       },
  //       error: function (error) {
  //         return false;
  //       }
  //     });
  //   } catch (Ex) {
  //   }
  //   return tempArray;
  // }


  // getCurrentUser(): Promise<any> {
  //   const url = this.baseUrl + '/_api/web/currentuser?$expand=Groups';
  //   // tslint:disable-next-line:only-arrow-functions
  //   return this.http.get(url, this.options).toPromise().then((res: Response) => {
  //     return res.json();
  //   }).catch(this.handleError);
  // }

  // private handleError(error: Response | any) {
  //   // Generic from https://angular.io/docs/ts/latest/guide/server-communication.html
  //   let errMsg: string;
  //   if (error instanceof Response) {
  //     const body = error.json() || '';
  //     const err = body.error || JSON.stringify(body);
  //     errMsg = `${error.status || ''} - ${error.statusText || ''} ${err}`;
  //   } else {
  //     errMsg = error.message ? error.message : error.toString();
  //   }
  //   console.error(errMsg);
  //   return throwError(errMsg);
  // }

  // getUserInfo1(id: string): Promise<any> {
  //   const url = this.baseUrl + '/_api/web/getUserById(' + id + ')';
  //   // tslint:disable-next-line:only-arrow-functions
  //   return this.http.get(url).toPromise().then((res: Response) => {
  //     return res.json();
  //   }).catch(this.handleError);
  // }

  // update(listName: string, id: string, jsonBody: any, type: string): Promise<any> {
  //   // Append HTTP header MERGE for UPDATE scenario
  //   const localOptions: RequestOptions = this.options;
  //   const isHeaderPresent = localOptions.headers.has('X-HTTP-Method');
  //   if (!isHeaderPresent) {
  //     localOptions.headers.append('X-HTTP-Method', 'MERGE');
  //     localOptions.headers.append('If-Match', '*');
  //     localOptions.headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
  //   }
  //   // Append metadata
  //   if (!jsonBody.__metadata) {
  //     jsonBody.__metadata = {
  //       type: type
  //     };
  //   }
  //   const data = JSON.stringify(jsonBody);
  //   const url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
  //   return this.http.post(url, data, localOptions).toPromise().then(function (res: Response) {
  //     return res.json();
  //   }).catch(this.handleError);
  // }

  // executePostPatchRequest(arrayOfData) {
  //   const batchGuid = this.generateUUID();
  //   const batchContents = new Array();
  //   const changeSetId = this.generateUUID();
  //   arrayOfData.forEach(element => {
  //     this.getChangeSetBodySC(batchContents, changeSetId, element.endPoint, JSON.stringify(element.data), element.isPostMethod);
  //   });
  //   batchContents.push('--changeset_' + changeSetId + '--');
  //   const batchBody = batchContents.join('\r\n');
  //   const batchBodyContent = this.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
  //   batchBodyContent.push('--batch_' + batchGuid + '--');
  //   const sBatchData = batchBodyContent.join('\r\n');
  //   const arrResults = this.executeBatchRequest1(batchGuid, sBatchData);
  //   return arrResults;
  // }

  // moveListItem(item, listName) {
  //   const currentYear = new Date().getFullYear();
  //   const currentMonth = this.getMonthName(new Date());
  //   const fileUrl =  this.globalServices.currentUser.serverRelativeUrl + '/Lists/' + listName + '/' + item.ID + '_.000';
  //   const moveFileUrl =  this.globalServices.currentUser.serverRelativeUrl + '/Lists/' + listName + '/' + currentYear + '/' +
  //                      currentMonth + '/' + item.ID + '_.000';
  //   const moveItemEndpoint = this.constants.feedbackPopupComponent.moveFileUrl.replace('{{FileUrl}}', fileUrl)
  //                                                                            .replace('{{NewFileUrl}}', moveFileUrl);
  //   return ({'endPoint': moveItemEndpoint, 'data': {}, 'isPostMethod': true});
  // }


  // getMonthName(date: Date): string {
  //   const d = new Date(date);
  //   const month = new Array();
  //   month[0] = 'January';
  //   month[1] = 'February';
  //   month[2] = 'March';
  //   month[3] = 'April';
  //   month[4] = 'May';
  //   month[5] = 'June';
  //   month[6] = 'July';
  //   month[7] = 'August';
  //   month[8] = 'September';
  //   month[9] = 'October';
  //   month[10] = 'November';
  //   month[11] = 'December';
  //   return month[d.getMonth()];
  // }

  // async create(listName: string, jsonBody: any, type: string): Promise<any> {
  //   const url = this.apiUrl.replace('{0}', listName);
  //   // append metadata
  //   if (!jsonBody.__metadata) {
  //     jsonBody.__metadata = {
  //       type: type
  //     };
  //   }
  //   const data = JSON.stringify(jsonBody);
  //   let headers = new Headers();
  //   headers.append('Content-Type', this.jsonHeader);
  //   headers.append('Accept', this.jsonHeader);
  //   if ($('#__REQUESTDIGEST').val()) {
  //     headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
  //   }
  //   const options = new RequestOptions({ headers: headers });
  //   return await this.http.post(url, data, options).toPromise().then(function (res: Response) {
  //     return res.json();
  //   }).catch(this.handleError);
  // }

  // read(listName: string, options?: any): Promise<any> {
  //   // Build URL syntax
  //   // https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#bk_support
  //   let url = this.apiUrl.replace('{0}', listName);
  //   url = this.readBuilder(url, options);
  //   /*return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
  //     return resp.json();
  //   });*/
  //   /*return this.http.get(url,options).pipe(
  //    map(
  //      (resp:Response)=>{
  //        return resp.json();
  //      }
  //    )
  //  )*/
  //   return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
  //     return resp.json().d.results;
  //   });
  // }

  // executeGetBatchRequest(batchGuid, sBatchData) {
  //   const arrResults = [];
  //   const response = this.executeBatchPostRequestByRestAPI(batchGuid, sBatchData);
  //   const responseInLines = response.split('\n');
  //   // tslint:disable-next-line:prefer-for-of
  //   for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
  //     try {
  //       const tryParseJson = JSON.parse(responseInLines[currentLine]);
  //       arrResults.push(tryParseJson.d.results);
  //     } catch (e) {
  //     }
  //   }
  //   return arrResults;
  // }

  // downloadMultipleFiles(fileArray, zipName) {
  //   const zip = new JSZip();
  //   let count = 0;
  //   const name = zipName + ".zip";
  //   fileArray.forEach(element => {
  //     this.getFile1(element.url)
  //       .subscribe(fileData => {
  //         let b: any = new Blob([fileData], { type: '' + fileData.type + '' });
  //         zip.file(element.fileName, b);
  //         count++;
  //         if (count == fileArray.length) {
  //           zip.generateAsync({ type: 'blob' }).then(function (content) {
  //             FileSaver.saveAs(content, name);
  //           });
  //         }
  //       })
  //   });
  // }

  // public getFile1(path: string): Observable<any> {
  //   let options = new RequestOptions({ responseType: ResponseContentType.Blob });
  //   return this.http.get(path, options).pipe(
  //     map(
  //       (resp: Response) => {
  //         return resp.json();
  //       }
  //     )
  //   )
  // }

  // copyFiless(sourceUrlArr: Array<string>, destinationUrlArr: Array<string>) {
  //   for (var index in sourceUrlArr) {
  //     const sourceUrl = sourceUrlArr[index];
  //     const destinationUrl = destinationUrlArr[index];
  //     var oUrl = this.globalServices.sharePointPageObject.webAbsoluteUrl + '/_api/web/getfilebyserverrelativeurl(\'' + sourceUrl + '\')/copyto(strnewurl=\'' + destinationUrl + '\',boverwrite=true)';
  //     $.ajax({
  //       url: oUrl,
  //       async: false,
  //       type: 'POST',
  //       headers: {
  //         // tslint:disable-next-line:quotemark
  //         'Accept': "application/json; odata=verbose",
  //         "X-RequestDigest": $("#__REQUESTDIGEST").val()
  //       },
  //       success: function (data) {
  //         console.log(data);
  //       },
  //       error: function (data) {
  //         console.log(data);
  //       }
  //     });
  //   }
  // }

  // apiReqRes: any = [];
  // getData(batchGuid, batchBody) {
  //   const arrResults = [];

  //   // batches need a specific header
  //   // let headers = new Headers();
  //   // headers.append('Content-Type', 'multipart/mixed; boundary="batch_' + batchGuid + '"');
  //   // headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
  //   // let options = new RequestOptions({ headers: headers });
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"',
  //       "Accept": "application/json; odata=verbose",
  //       'X-RequestDigest': $("#__REQUESTDIGEST").val() ? $("#__REQUESTDIGEST").val() : ''
  //     })
  //   };

  // create the request endpoint

  //   const endpoint = this.globalServices.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
  //   return this.httpClient.post(endpoint, batchBody, { ...httpOptions, responseType: 'text' }).
  //     pipe(
  //       map((res) => {
  //         if (res) {
  //           this.apiReqRes = res;
  //           // const arrResults = [];
  //           const responseInLines = this.apiReqRes.split('\n');
  //           for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
  //             if (this.IsJsonString(responseInLines[currentLine])) {
  //               const tryParseJson = JSON.parse(responseInLines[currentLine]);
  //               arrResults.push(tryParseJson.d.results);
  //             }
  //           }
  //           return arrResults;
  //         }
  //       }),
  //       catchError((err, caught) => {
  //         console.log('Error ', err)
  //         return err;
  //       })
  //     );
  // }

  // IsJsonString(str) {
  //   try {
  //     JSON.parse(str);
  //   } catch (e) {
  //     return false;
  //   }
  //   return true;
  // }

  // updateListItemRestApi(sListName, arrProperties, sID, sType, bAsync, onSuccess, oError) {
  //   const oBj = {
  //     __metadata: {
  //       type: sType
  //     }
  //   };
  //   for (const index in arrProperties) {
  //     if (arrProperties.hasOwnProperty(index)) {
  //       const oVal = arrProperties[index]['value'];
  //       if ($.isArray(oVal)) {
  //         oBj[arrProperties[index]['key']] = { results: oVal };
  //       } else {
  //         oBj[arrProperties[index]['key']] = oVal;
  //       }
  //     }
  //   }
  //   $.ajax({
  //     // tslint:disable
  //     url: this.baseUrl + "/_api/web/lists/GetByTitle('" + sListName + "')/items(" + sID + ")", // list item ID
  //     // tslint:enable
  //     type: 'POST',
  //     data: JSON.stringify(oBj),
  //     async: bAsync ? true : false,
  //     headers: {
  //       'Accept': 'application/json;odata=verbose',
  //       'Content-Type': 'application/json;odata=verbose',
  //       'X-RequestDigest': $('#__REQUESTDIGEST').val(),
  //       'IF-MATCH': '*',
  //       'X-HTTP-Method': 'MERGE'
  //     },
  //     success: function (data, status, xhr) {
  //       onSuccess();
  //     },
  //     error: function (xhr, status, error) {
  //       oError();
  //     }
  //   });
  // }



  // triggerMail(fromEmail, templateName, objEmailBody, mailSubject, arrayTo, errorDetail) {
  //   const mailContent = this.constants.listNames.MailContent.name;
  //   //tslint:disable
  //   const url = "/_api/web/lists/GetByTitle('" + mailContent + "')/items?$select=Content&$filter=Title eq '" + templateName + "'";
  //   // tslint:enable
  //   const body = this.fetchListItemsByRestAPI(url);
  //   let mailBody = body[0].Content;
  //   for (const data of objEmailBody) {
  //     mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
  //   }
  //   const cc = [];
  //   //  cc = [fromEmail];
  //   this.sendEmail(fromEmail, arrayTo, mailBody, mailSubject, errorDetail, cc);
  // }



  // sendEmail(from, to, body, subject, errorDetail, cc) {
  //   // Get the relative url of the site
  //   //   const listName = this.constants.listNames.EmailDetails;
  //   //   const updateInformationEmail = [];
  //   //   updateInformationEmail.push({'key': 'Title', 'value': 'Entered send mail function'});
  //   //   updateInformationEmail.push({'key': 'MoreDetails', 'value': 'Subject:' + subject + '\nFrom:' + from + '\nTo:' + to});
  //   //   updateInformationEmail.push({'key': 'FileName', 'value': errorDetail});
  //   //   try {
  //   //       this.addListItem(listName, updateInformationEmail);
  //   //   } catch (e) {
  //   //   }
  //   const siteurl = this.globalServices.sharePointPageObject.serverRelativeUrl;
  //   const urlTemplate = siteurl + '/_api/SP.Utilities.Utility.SendEmail';
  //   const ccUser = cc != null || cc !== undefined ? cc : [];
  //   if (ccUser.length > 0 && cc.indexOf(from) === -1) {
  //     ccUser.push(from);
  //   }
  //   $.ajax({
  //     contentType: 'application/json',
  //     url: urlTemplate,
  //     type: 'POST',
  //     data: JSON.stringify({
  //       'properties': {
  //         '__metadata': {
  //           'type': 'SP.Utilities.EmailProperties'
  //         },
  //         'From': from,
  //         'To': {
  //           'results': to
  //         },
  //         'CC': {
  //           'results': ccUser
  //         },
  //         'Body': body,
  //         'Subject': subject
  //       }
  //     }),
  //     headers: {
  //       'Accept': 'application/json;odata=verbose',
  //       'content-type': 'application/json;odata=verbose',
  //       'X-RequestDigest': $('#__REQUESTDIGEST').val()
  //     },
  //     success: function (data) {
  //     },
  //     error: function (err) {
  //       const errorListName = 'ErrorLog';
  //       const updateInformation = [];
  //       updateInformation.push({ 'key': 'Title', 'value': 'Error While Sending Mail' });
  //       updateInformation.push({ 'key': 'Description', 'value': JSON.stringify(err) });
  //       updateInformation.push({
  //         'key': 'MoreDetails', 'value': 'Subject:' + subject +
  //           '\nFrom:' + from + '\nTo:' + to + '\nCC:' + ccUser
  //       });
  //       updateInformation.push({ 'key': 'FileName', 'value': errorDetail });
  //       this.addListItem(errorListName, updateInformation);
  //     }
  //   });
  // }

  // triggerMail1(fromEmail, templateName, objEmailBody, mailSubject, arrayTo, errorDetail, cc) {
  //   const mailContent = this.constants.listNames.MailContent.name;
  //   //tslint:disable
  //   const url = "/_api/web/lists/GetByTitle('" + mailContent + "')/items?$select=Content&$filter=Title eq '" + templateName + "'";
  //   // tslint:enable
  //   const body = this.fetchListItemsByRestAPI(url);
  //   let mailBody = body[0].Content;
  //   for (const data of objEmailBody) {
  //     mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
  //   }
  //   // cc = [fromEmail];
  //   this.sendEmail(fromEmail, arrayTo, mailBody, mailSubject, errorDetail, cc);
  // }

