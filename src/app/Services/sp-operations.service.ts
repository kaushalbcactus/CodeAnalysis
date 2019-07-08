import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { GlobalService } from "./global.service";
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
// After installing jszip. Please change the code from
// module.exports = require("stream");
// to
// module.exports = require("readable-stream")
// in ./node_modules/jszip/lib/readable-stream-browser.j
import * as JSZip from 'jszip'; // npm install jszip
import * as FileSaver from 'file-saver'; // npm install file-saver
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class SpOperationsService {
  jsonHeader = 'application/json; odata=verbose';
  headers = { 'Content-Type': this.jsonHeader, 'Accept': this.jsonHeader };
  baseUrl: String;
  baseArchiveUrl: String;
  apiUrl: String;
  apiArchiveUrl: String;
  currentUser: String;
  login: String;
  constructor(private globalService: GlobalService, private httpClient: HttpClient) { this.setBaseUrl(null); }

  setBaseUrl(webUrl?: string) {
    if (webUrl) {
      // user provided target Web URL
      this.baseUrl = webUrl;
    } else {
      // default local SharePoint context
      const ctx = window['_spPageContextInfo'];
      if (ctx) {
        this.baseUrl = ctx.webAbsoluteUrl;
      } else {
        this.baseUrl = this.globalService.sharePointPageObject.webAbsoluteUrl;
      }
    }
    // Default to local web URL
    this.apiUrl = this.baseUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
    this.apiArchiveUrl = this.globalService.sharePointPageObject.webAbsoluteArchiveUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
    this.baseArchiveUrl = this.globalService.sharePointPageObject.webAbsoluteArchiveUrl;
  }

  getHeaders(bAddContext, returnOp) {
    var headerCopy: any = Object.assign({}, this.headers);
    if (bAddContext) {
      var context: any = document.getElementById('__REQUESTDIGEST');
      if (context) {
        headerCopy['X-RequestDigest'] = context.value;
      }
    }
    if (returnOp) {
      const httpOptions = {
        headers: new HttpHeaders(headerCopy)
      };
      return httpOptions;
    }
    else {
      return headerCopy;
    }

  }

  // Refresh digest token
  async refreshDigest() {
    var res: any = await this.httpClient.post(this.getContxtURL(), null, this.getHeaders(false, true)).toPromise();
    var context: any = document.getElementById('__REQUESTDIGEST');
    if (context) {
      context.value = res.d.GetContextWebInformation.FormDigestValue;
    }
  }

    // Send email
    // async sendMail(to: string, ffrom: string, subj: string, body: string) {
    //     const data = this.getEmailData(to, ffrom, subj, body);
    //     const url = this.getEmailURL();

    //     var res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
    //         var error = err.error;
    //         return error;
    //     });
    //     return this.parseRetSingle(res);
    // }

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
              results: []
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
    // Send email
      async sendMail(to: string, ffrom: string, subj: string, body: string, cc?) {
        const data = this.getEmailData(to, ffrom, subj, body, cc);
        const url = this.getEmailURL();
    
        const res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
          const error = err.error;
          return error;
        });
        return this.parseRetSingle(res);
      }
    

  // ----------SHAREPOINT USER PROFILES----------

    // Lookup any SharePoint UserInfo
    async getUserInfo(id: string) {
        const url = this.getUserURL(id);
        var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
            var error = err.error;
            return error;
        });
        return this.parseRetSingle(res);
    }

    // Group Info
    async getGroupInfo(groupName: string) {
        const url = this.getGroupURL(groupName);
        var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
            var error = err.error;
            return error;
        });
        return this.parseRetSingle(res);
    }

    // Invoice Team
    async getITGroupInfo(groupName: string) {
        const url = this.getGroupURL(groupName);
        var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
            var error = err.error;
            return error;
        });
        return this.parseRetSingle(res);
    }

  // ----------SHAREPOINT FILES AND FOLDERS----------
  // Create folder
  async createFolder(folderUrl: string) {
    const data = this.getFolderCreationData(folderUrl);
    const url = this.getFolderCreationURL();
    var res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  async uploadFile(url: string, binary: any) {
    var res = await this.httpClient.post(url, binary, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

    async executePost(url, data) {
        var res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
            var error = err.error;
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
                // createProformaRequestInProgress = false;
                console.log(error);
            }
        });
    }

  async copyFiles(sourceUrlArr: Array<string>, destinationUrlArr: Array<string>) {
    for (var index in sourceUrlArr) {
      const sourceUrl = sourceUrlArr[index];
      const destinationUrl = destinationUrlArr[index];
      var oUrl = this.getCopyFileURL(sourceUrl, destinationUrl);
      await this.executePost(oUrl, null);
    }
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


  getReadURL(listName: string, options?: any) {
    let url = this.apiUrl.replace('{0}', listName);
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
    return this.baseUrl + '/_api/web/folders';
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
    return this.baseUrl + '/_api/web/getfilebyserverrelativeurl(\'' + sourceUrl + '\')/copyto(strnewurl=\'' + destinationUrl + '\',boverwrite=true)';
  }

  getFilesFromFoldersURL(folderName: string) {
    return this.baseUrl + '/_api/web/GetFolderByServerRelativeUrl(\'' + folderName + '\')/Files?$expand=ListItemAllFields'
  }

  async readFiles(folderName) {
    let url = this.getFilesFromFoldersURL(folderName);
    var res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }

  async readItems(listName: string, options?: any) {
    let url = this.getReadURL(listName, options);
    var res;
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetMultiple(res);
  }
  // READ single item - SharePoint list name, and item ID number
  async readItem(listName: string, id: any, options?: any) {
    let url = this.getItemURL(listName, id, options);
    let res; 
    res = await this.httpClient.get(url, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }
  async createItem(listName: string, jsonBody: any, type: string) {
    const url = this.getReadURL(listName, null);
    // append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        'type': type
      };
    }
    const data = JSON.stringify(jsonBody);
    var res = await this.httpClient.post(url, data, this.getHeaders(true, true)).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }

  /// UPDATE item - SharePoint list name, item ID number, and JS object to stringify for save
  async updateItem(listName: string, id: any, jsonBody: any, type: string) {
    // Append HTTP header MERGE for UPDATE scenario
    const localOptions = this.getHeaders(true, false);
    localOptions['X-HTTP-Method'] = 'MERGE';
    localOptions['If-Match'] = '*';
    // Append metadata
    if (!jsonBody.__metadata) {
      jsonBody.__metadata = {
        'type': type
      };
    }
    const data = JSON.stringify(jsonBody);
    const url = this.getItemURL(listName, id);
    const httpOptions = {
      headers: new HttpHeaders(localOptions)
    };
    await this.httpClient.post(url, data, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
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
      if(res.hasOwnProperty('d')) {
        return res.d;
      }
      else if(res.hasOwnProperty('error')) {
        var obj : any = res.error;
        obj.hasError = true;
        return obj;
      }
      else {
        return {
          hasError : true,
          comments: res
        }
      }
    }
    else {
      return {
        hasError : true,
        comments: 'Check the response in network trace'
      }
    }
  }

  parseRetMultiple(res) {
    if (res)  { 
      if(res.hasOwnProperty('d') && res.d.hasOwnProperty('results')) {
        return res.d.results;
      }
      else if(res.hasOwnProperty('error')) {
        var obj : any = res.error;
        obj.hasError = true;
        return obj;
      }
      else {
        return  {
          hasError : true,
          comments: res
        };
      }
    }
    else {
      return  {
        hasError : true,
        comments: 'Check the response in network trace'
      };
    }
  }

  parseBatchRet(res) {
    const arrResults = [];
    if (res) {
      const responseInLines = res.split('\r\n');
      for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
        try {
          const tryParseJson = JSON.parse(responseInLines[currentLine]);
          let retVal : any;
          if(tryParseJson.hasOwnProperty('d')) {
            if(tryParseJson.d.hasOwnProperty('results')) {
              retVal = tryParseJson.d.results;
            }
            else {
              retVal = tryParseJson.d;
            }
          }
          else if(tryParseJson.hasOwnProperty('error')) {
            retVal = tryParseJson.error;
            retVal.hasError = true;
          }
          else {
            retVal = {
              hasError : true,
              comments: 'Check the response in network trace'
            }
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
          this.getChangeSetBody(batchContents, changesetId, url.url, JSON.stringify(url.data), url.type);
          arrReturnType.push(url.listName);
          break;
        case 'PATCH':
          isUpdateActive = this.setPostBody(batchContents, batchGuid, changesetId, isUpdateActive);
          this.getChangeSetBody(batchContents, changesetId, url.url, JSON.stringify(url.data), url.type);
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
    let headers = {}
    var context: any = document.getElementById('__REQUESTDIGEST');
    headers['Content-Type'] = 'multipart/mixed; boundary="batch_' + batchGuid + '"';
    headers['Accept'] = 'application/json; odata=verbose';
    if (context) {
      headers['X-RequestDigest'] = context.value;
    }

    let options = { headers: new HttpHeaders(headers) };

    let apiURL = (bCurrent ? this.baseUrl : this.baseArchiveUrl) + '/_api/$batch';
    const res = await this.httpClient.post(apiURL, userBatchBody, { ...options, responseType: 'text' }).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });

    var retVal = this.parseBatchRet(res);
    const arrRetData = [];
    var oRetObj = {
      listName: '',
      retItems: null
    }
    for (let count = 0; count < retVal.length; count++) {
      var oNewObj = Object.assign({}, oRetObj);
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
    batchContents.push(data);
    batchContents.push('');
    return batchContents;
  }

    // getEmailData(to: string, ffrom: string, subj: string, body: string) {
    //     const tos: string[] = to.split(',');
    //     const recip: string[] = (tos instanceof Array) ? tos : [tos];
    //     const message = {
    //         'properties': {
    //             '__metadata': {
    //                 'type': 'SP.Utilities.EmailProperties'
    //             },
    //             'To': {
    //                 'results': recip
    //             },
    //             'From': ffrom,
    //             'Subject': subj,
    //             'Body': body
    //         }
    //     };
    //     const data = JSON.stringify(message);
    //     return data;
    // }

  getFolderCreationData(folderUrl: string) {
    const data = {
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
    var res = await this.httpClient.get(url, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      var error = err.error;
      return error;
    });
    return res;
  }

  async createZip(files: any[], zipName: string) {
    var zip = new JSZip();
    const name = zipName + ".zip";
    for (let counter = 0; counter < files.length; counter++) {
      var element = files[counter];
      var fileData: any = await this.getFile(element);
      let b: any = new Blob([fileData], { type: '' + fileData.type + '' });
      zip.file(element.substring(element.lastIndexOf('/') + 1), b);
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      if (content) {
        FileSaver.saveAs(content, name);
      }
    });
  }
}
