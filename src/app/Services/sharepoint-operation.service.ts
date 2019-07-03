import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';

// After installing jszip. Please change the code from
// module.exports = require("stream");
// to
// module.exports = require("readable-stream");
// in ./node_modules/jszip/lib/readable-stream-browser.js
import * as JSZip from 'jszip'; // npm install jszip
import * as FileSaver from 'file-saver'; // npm install file-saver
import { ConstantsService } from './constants.service';
declare const $: any;
@Injectable({
    providedIn: 'root'
})
export class SharepointoperationService {
    jsonHeader = 'application/json; odata=verbose';
    // tslint:disable-next-line:object-literal-key-quotes
    headers = new Headers({ 'Content-Type': this.jsonHeader, 'Accept': this.jsonHeader });
    options = new RequestOptions({ headers: this.headers });
    baseUrl: string;
    apiUrl: string;
    apiArchiveUrl: string;
    currentUser: string;
    login: string;
    constructor(private http: Http, private globalService: GlobalService, private httpClient: HttpClient, private constants: ConstantsService) {
        this.setBaseUrl(null);
    }
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
                this.baseUrl = this.globalService.sharePointPageObject.webAbsoluteUrl;
            }
        }
        // Default to local web URL
        this.apiUrl = this.baseUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
        this.apiArchiveUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/web/lists/GetByTitle(\'{0}\')/items';
    }

    // HTTP Error handling
    private handleError(error: Response | any) {
        // Generic from https://angular.io/docs/ts/latest/guide/server-communication.html
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status || ''} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return throwError(errMsg);
    }

    // String ends with
    private endsWith(str: string, suffix: string) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    // Refresh digest token
    refreshDigest(): Promise<any> {
        const svc = this;
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(this.baseUrl + '/_api/contextinfo', null, this.options).toPromise().then((res: Response) => {
            svc.headers.delete('X-RequestDigest');
            svc.headers.append('X-RequestDigest', res.json().d.GetContextWebInformation.FormDigestValue);
        });
    }

    // Send email
    sendMail(to: string, ffrom: string, subj: string, body: string): Promise<any> {
        // Append metadata
        const tos: string[] = to.split(',');
        const recip: string[] = (tos instanceof Array) ? tos : [tos];
        const message = {
            properties: {
                __metadata: {
                    type: 'SP.Utilities.EmailProperties'
                },
                To: {
                    results: recip
                },
                From: ffrom,
                Subject: subj,
                Body: body
            }
        };
        const url = this.baseUrl + '/_api/SP.Utilities.Utility.SendEmail';
        const data = JSON.stringify(message);
        return this.http.post(url, data, this.options).toPromise();
    }

    // ----------SHAREPOINT USER PROFILES----------
    // Lookup SharePoint current web user
    getCurrentUser(): Promise<any> {
        const url = this.baseUrl + '/_api/web/currentuser?$expand=Groups';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.get(url, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Lookup my SharePoint profile
    getMyProfile(): Promise<any> {
        const url = this.baseUrl + '/_api/SP.UserProfiles.PeopleManager/GetMyProperties?select=*';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.get(url, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Lookup any SharePoint profile
    getProfile(login: string): Promise<any> {
        const url = this.baseUrl + '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=\'' + login + '\'&select=*';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.get(url, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Lookup any SharePoint UserInfo
    getUserInfo(id: string): Promise<any> {
        const url = this.baseUrl + '/_api/web/getUserById(' + id + ')';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.get(url).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Ensure SPUser exists in target web
    ensureUser(login: string): Promise<any> {
        const url = this.baseUrl + '/_api/web/ensureuser';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, login, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // ----------SHAREPOINT LIST AND FIELDS----------
    // Create list
    createList(title: string, baseTemplate: string, description: string): Promise<any> {
        const data = {
            __metadata: { type: 'SP.List' },
            BaseTemplate: baseTemplate,
            Description: description,
            Title: title
        };
        const url = this.baseUrl + '/_api/web/lists';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, data, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Create field
    createField(listTitle: string, fieldName: string, fieldType: string): Promise<any> {
        const data = {
            __metadata: { type: 'SP.Field' },
            Type: fieldType,
            Title: fieldName
        };
        const url = this.baseUrl + '/_api/web/lists/GetByTitle(\'' + listTitle + '\')/fields';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, data, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // ----------SHAREPOINT FILES AND FOLDERS----------
    // Create folder
    createFolder(folderUrl: string): Promise<any> {
        const data = {
            __metadata: {
                type: 'SP.Folder'
            },
            ServerRelativeUrl: folderUrl
        };
        const url = this.baseUrl + '/_api/web/folders';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, data, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Upload file to folder
    // https://kushanlahiru.wordpress.com/2016/05/14/file-attach-to-sharepoint-2013-list-custom-using-angular-js-via-rest-api/
    // http://stackoverflow.com/questions/17063000/ng-model-for-input-type-file
    // var binary = new Uint8Array(FileReader.readAsArrayBuffer(file[0]));
    uploadFile(folderUrl: string, fileName: string, binary: any): Promise<any> {
        const url = this.baseUrl + '/_api/web/GetFolderByServerRelativeUrl(\''
            + folderUrl + '\')/files/add(overwrite=true, url=\'' + fileName + '\')';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, binary, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Upload attachment to item
    uploadAttach(listName: string, id: string, fileName: string, binary: any, overwrite?: boolean): Promise<any> {
        let url = this.baseUrl + '/_api/web/lists/GetByTitle(\'' + listName + '\')/items(' + id;
        const options = this.options;
        if (overwrite) {
            // Append HTTP header PUT for UPDATE scenario
            options.headers.append('X-HTTP-Method', 'PUT');
            url += ')/AttachmentFiles(\'' + fileName + '\')/$value';
        } else {
            // CREATE scenario
            url += ')/AttachmentFiles/add(FileName=\'' + fileName + '\')';
        }
        // tslint:disable-next-line:only-arrow-functions
        return this.http.post(url, binary, options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Get attachment for item
    getAttach(listName: string, id: string): Promise<any> {
        const url = this.baseUrl + '/_api/web/lists/GetByTitle(\'' + listName + '\')/items(' + id + ')/AttachmentFiles';
        // tslint:disable-next-line:only-arrow-functions
        return this.http.get(url, this.options).toPromise().then((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    // Copy file
    copyFile(batchGuid, sourceUrl: string, destinationUrl: string): Observable<any> {

        // tslint:disable-next-line:max-line-length
        const url = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/web/GetFileByServerRelativeUrl(\'' + sourceUrl + '\')/copyto(strnewurl=\'' + destinationUrl + '\',boverwrite=true)';
        const headers = new Headers();
        headers.append('Content-Type', 'multipart/mixed; boundary="batch_' + batchGuid + '"');
        headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
        const options = new RequestOptions({ headers });
        // create the request endpoint
        const endpoint = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/$batch/';
        return this.http.post(url, options).
            pipe(
                map((res: Response) => {
                    return res;
                }),
                catchError((err, caught) => {
                    console.log('Error ', err);
                    return err;
                })
            );
        // return this.http.post(url, options).toPromise().then(function (res: Response) {
        //     return res.json();
        // }).catch(this.handleError);
    }
    //tslint:disable
    copyFiless(sourceUrlArr: Array<string>, destinationUrlArr: Array<string>) {
        for (var index in sourceUrlArr) {
            const sourceUrl = sourceUrlArr[index];
            const destinationUrl = destinationUrlArr[index];
            var oUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/web/getfilebyserverrelativeurl(\'' + sourceUrl + '\')/copyto(strnewurl=\'' + destinationUrl + '\',boverwrite=true)';
            $.ajax({
                url: oUrl,
                async: false,
                type: 'POST',
                headers: {
                    // tslint:disable-next-line:quotemark
                    'Accept': "application/json; odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    console.log(data);
                },
                error: function (data) {
                    console.log(data);
                }
            });
        }
    }
    // ----------SHAREPOINT LIST CORE----------
    // CREATE item - SharePoint list name, and JS object to stringify for save
    create(listName: string, jsonBody: any, type: string): Promise<any> {
        const url = this.apiUrl.replace('{0}', listName);
        // append metadata
        if (!jsonBody.__metadata) {
            jsonBody.__metadata = {
                type: type
            };
        }
        const data = JSON.stringify(jsonBody);
        return this.http.post(url, data, this.options).toPromise().then(function (res: Response) {
            return res.json();
        }).catch(this.handleError);
    }

    async createAndMove(listName: string, jsonBody: any, folderUrl): Promise<any> {
        const url = this.apiUrl.replace('{0}', listName);
        // append metadata
        debugger;
        const data = JSON.stringify(jsonBody);
        let headers = new Headers();
        headers.append('Content-Type', this.jsonHeader);
        headers.append('Accept', this.jsonHeader);
        if ($('#__REQUESTDIGEST').val()) {
            headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
        }

        const options = new RequestOptions({ headers: headers });
        var response = await this.http.post(url, data, options).toPromise().then(function (res: Response) {
            return res.json();
        }).catch(this.handleError);

        if (response) {
            const urlobj = {
                select: 'FileDirRef,FileRef'
            }

            var urlRef = this.getReadURLWithId(this.constants.listNames.Schedules.name, response.d.ID, urlobj);
            var currentRef: any = await this.http.get(urlRef, options).toPromise().then(function (res: Response) {
                return res.json();
            }).catch(this.handleError);
            if (currentRef) {
                var fileUrl = currentRef.d.FileRef;
                var fileDirRef = currentRef.d.FileDirRef;
                var moveFileUrl = fileUrl.replace(fileDirRef, folderUrl);
                var urlMove = this.baseUrl + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
                await this.http.post(urlMove, null, options).toPromise().then(function (res: Response) {
                    return res.json();
                }).catch(this.handleError);
            }
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
    read(listName: string, options?: any): Promise<any> {
        // Build URL syntax
        // https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#bk_support
        let url = this.apiUrl.replace('{0}', listName);
        url = this.readBuilder(url, options);
        /*return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
          return resp.json();
        });*/
        /*return this.http.get(url,options).pipe(
         map(
           (resp:Response)=>{
             return resp.json();
           }
         )
       )*/
        return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
            return resp.json().d.results;
        });
    }

    getReadURLWithId(listName: string, id: string, options?: any) {
        let url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
        url = this.readBuilder(url, options);
        return url;
    }

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
    // READ single item - SharePoint list name, and item ID number
    readItem(listName: string, id: string): Promise<any> {
        let url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
        url = this.readBuilder(url, null);
        return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
            return [resp.json().d];
        });
    }

    readFiles(folderName): Promise<any> {
        let url = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/web/GetFolderByServerRelativeUrl(\'' + folderName + '\')/Files?$expand=ListItemAllFields'
        url = this.readBuilder(url, null);
        return this.http.get(url, this.options).toPromise().then(function (resp: Response) {
            return resp.json().d.results;
        });
    }


    /// UPDATE item - SharePoint list name, item ID number, and JS object to stringify for save
    update(listName: string, id: string, jsonBody: any, type: string): Promise<any> {
        // Append HTTP header MERGE for UPDATE scenario
        const localOptions: RequestOptions = this.options;
        const isHeaderPresent = localOptions.headers.has('X-HTTP-Method');
        if (!isHeaderPresent) {
            localOptions.headers.append('X-HTTP-Method', 'MERGE');
            localOptions.headers.append('If-Match', '*');
            localOptions.headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
        }
        // Append metadata
        if (!jsonBody.__metadata) {
            jsonBody.__metadata = {
                type: type
            };
        }
        const data = JSON.stringify(jsonBody);
        const url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
        return this.http.post(url, data, localOptions).toPromise().then(function (res: Response) {
            return res.json();
        }).catch(this.handleError);
    }

    updateBatchURL(listName: string, id: string) {
        const url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
        return url;
    }
    // DELETE item - SharePoint list name and item ID number
    del(listName: string, id: string): Promise<any> {
        // append HTTP header DELETE for DELETE scenario
        const localOptions: RequestOptions = this.options;
        localOptions.headers.append('X-HTTP-Method', 'DELETE');
        localOptions.headers.append('If-Match', '*');
        const url = this.apiUrl.replace('{0}', listName) + '(' + id + ')';
        return this.http.post(url, localOptions).toPromise().then(function (resp: Response) {
            return resp.json();
        });
    }

    // JSON blob read from SharePoint list - SharePoint list name
    jsonRead(listName: string): Promise<any> {
        const svc = this;
        return this.getCurrentUser().then(function (res: any) {
            // GET SharePoint Current User
            svc.currentUser = res.d;
            svc.login = res.d.LoginName.toLowerCase();
            if (svc.login.indexOf('\\')) {
                // Parse domain prefix
                svc.login = svc.login.split('\\')[1];
            }

            // GET SharePoint List Item
            const url = svc.apiUrl.replace('{0}', listName) + '?$select=JSON,Id,Title&$filter=Title+eq+\'' + svc.login + '\'';
            return svc.http.get(url, svc.options).toPromise().then(function (res2: Response) {

                // Parse JSON response
                const d2 = res2.json().d;
                if (d2.results.length) {
                    return d2.results[0];
                } else {
                    return null;
                }

            }).catch(svc.handleError);
        });
    }

    // JSON blob upsert write to SharePoint list - SharePoint list name and JS object to stringify for save
    jsonWrite(listName: string, jsonBody: any) {
        const svc = this;
        return this.refreshDigest().then(function (res: Response) {
            return svc.jsonRead(listName).then(function (item: any) {
                // HTTP 200 OK
                if (item) {
                    // update if found
                    item.JSON = JSON.stringify(jsonBody);
                    return svc.update(listName, item.Id, item, 'SP.ListItem');
                } else {
                    // create if missing
                    item = {
                        __metadata: {
                            type: 'SP.ListItem'
                        },
                        Title: svc.login,
                        JSON: JSON.stringify(jsonBody)
                    };
                    return svc.create(listName, item, 'SP.ListItem');
                }
            });
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

    /**
     * This funtion is used to execute the batch request by using rest api.
     * @param batchGuid Provide the unique GUID.
     * @param batchBody Provide the batch body.
     */
    testing() {
        console.log('in testing fun ', this.globalService.sharePointPageObject);
    }
    executeBatchPostRequestByRestAPI(batchGuid, batchBody) {
        // this.getData(batchGuid, batchBody);
        let resp = '';
        // create the request endpoint
        const endpoint = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';

        // batches need a specific header
        const batchRequestHeader = {
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
        };

        // create request
        $.ajax({
            url: endpoint,
            type: 'POST',
            async: false,
            headers: batchRequestHeader,
            data: batchBody,
            // tslint:disable
            success: function (response) {
                resp = response;
            },
            fail: function (error) {
            }
            // tslint:enable
        });
        return resp;
    }

    createBatchReq(listName) {
        const batchContents = new Array();
        const batchGuid = this.generateUUID();
        for (let index = 0; index < listName.length; index++) {
            const element = listName[index];
            const projectInfoEndpoint = this.getReadURL('' + listName[index].name + '', listName[index].query);
            this.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
        }
        console.log(batchContents);
        // const projectContactEndPoint = this.spServices.getReadURL('' + listName + '', query);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectContactEndPoint);
        batchContents.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchContents.join('\r\n');
        let obj = {
            userBatchBody, batchGuid
        }
        return obj;

    }

    apiReqRes: any = [];
    getData(batchGuid, batchBody) {
        const arrResults = [];

        // batches need a specific header
        // let headers = new Headers();
        // headers.append('Content-Type', 'multipart/mixed; boundary="batch_' + batchGuid + '"');
        // headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
        // let options = new RequestOptions({ headers: headers });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"',
                "Accept": "application/json; odata=verbose",
                'X-RequestDigest': $("#__REQUESTDIGEST").val() ? $("#__REQUESTDIGEST").val() : ''
            })
        };

        // create the request endpoint
        const endpoint = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
        return this.httpClient.post(endpoint, batchBody, { ...httpOptions, responseType: 'text' }).
            pipe(
                map((res) => {
                    if (res) {
                        this.apiReqRes = res;
                        // const arrResults = [];
                        const responseInLines = this.apiReqRes.split('\n');
                        for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                            if (this.IsJsonString(responseInLines[currentLine])) {
                                const tryParseJson = JSON.parse(responseInLines[currentLine]);
                                arrResults.push(tryParseJson.d.results);
                            }
                        }
                        return arrResults;
                    }
                }),
                catchError((err, caught) => {
                    console.log('Error ', err)
                    return err;
                })
            );
    }

    // For FD Only

    apiReqRes1: any = [];
    async getFDData(batchGuid, batchBody): Promise<any> {
        // const arrResults = [];
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"',
                "Accept": "application/json; odata=verbose",
                'X-RequestDigest': $("#__REQUESTDIGEST").val() ? $("#__REQUESTDIGEST").val() : ''
            })
        };

        // create the request endpoint
        const endpoint = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
        const res = await this.httpClient.post(endpoint, batchBody, { ...httpOptions, responseType: 'text' })
            .toPromise().catch((err: HttpErrorResponse) => {
                var error = err.error;
                return error;
            });

        const arrResults = this.parseBatchRet(res);
        return arrResults;
    }

    parseBatchRet(res) {
        const arrResults = [];
        if (res) {
            const responseInLines = res.split('\r\n');
            for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                try {
                    const tryParseJson = JSON.parse(responseInLines[currentLine]);
                    let retVal: any;
                    if (tryParseJson.hasOwnProperty('d')) {
                        if (tryParseJson.d.hasOwnProperty('results')) {
                            retVal = tryParseJson.d.results;
                        }
                        else {
                            retVal = tryParseJson.d;
                        }
                    }
                    else if (tryParseJson.hasOwnProperty('error')) {
                        retVal = tryParseJson.error;
                        retVal.hasError = true;
                    }
                    else {
                        retVal = {
                            hasError: true,
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

    async getDataByApi(batchGuid, batchBody) {

         
        batchBody.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchBody.join('\r\n');
         const arrResults = [];


        let headers = new Headers();
        headers.append('Content-Type', 'multipart/mixed; boundary="batch_' + batchGuid + '"');
        headers.append('X-RequestDigest', $('#__REQUESTDIGEST').val());
        let options = new RequestOptions({ headers: headers });

        let apiURL = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/$batch';
        const res = await  this.http.post(apiURL, userBatchBody, options).toPromise();


       if (res["_body"]) {
              const responseInLines = res["_body"].split('\r\n');
            //   console.log(responseInLines);
              for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                  try {
                      const tryParseJson = JSON.parse(responseInLines[currentLine]);
                      arrResults.push(tryParseJson.d.hasOwnProperty('results') ? tryParseJson.d.results: tryParseJson.d);
                  } catch (e) {
                  }
              }

            }
           return arrResults;
        }

    IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
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
    getBatchBodyPost(batchBody, batchGuid, changeSetId) {
        const batchContents = new Array();
        batchContents.push('--batch_' + batchGuid);
        batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"');
        batchContents.push('Content-Length: ' + batchBody.length);
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push(batchBody);
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
    getChangeSetBody(changeSetId, endPoint, data, isPostMethod) {
        const batchContents = new Array();
        batchContents.push('--changeset_' + changeSetId);
        batchContents.push('Content-Type: application/http');
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push('PATCH ' + endPoint + ' HTTP/1.1');
        batchContents.push('Content-Type: application/json;odata=verbose');
        batchContents.push('Accept: application/json;odata=verbose');
        batchContents.push(isPostMethod ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
        if (data !== '{}') {
            batchContents.push('If-Match: *');
            batchContents.push('');
            batchContents.push(data);
        }
        batchContents.push('');
        return batchContents;
    }

    getChangeSetBodySC(batchContents, changeSetId, endPoint, data, createFolder) {
        batchContents.push('--changeset_' +  changeSetId);
        batchContents.push('Content-Type: application/http');
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push(createFolder ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
        batchContents.push('Content-Type: application/json;odata=verbose');
        batchContents.push('Accept: application/json;odata=verbose');
        batchContents.push('If-Match: *');
        batchContents.push('');
        batchContents.push(data);
        batchContents.push('');
      }

      getChangeSetBodyMove(batchContents, changeSetId, endPoint) {
        batchContents.push('--changeset_' +  changeSetId);
        batchContents.push('Content-Type: application/http');
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push('POST ' + endPoint + ' HTTP/1.1');
        batchContents.push('Content-Type: application/json;odata=verbose');
        batchContents.push('Accept: application/json;odata=verbose');
        batchContents.push('');
      }

    getChangeSetBody1(changeSetId, endPoint, data, isPostMethod) {
        const batchContents = new Array();
        batchContents.push('--changeset_' + changeSetId);
        batchContents.push('Content-Type: application/http');
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push(isPostMethod ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
        batchContents.push('Content-Type: application/json;odata=verbose');
        batchContents.push('Accept: application/json;odata=verbose');
        if (data !== '{}') {
            batchContents.push('If-Match: *');
            batchContents.push('');
            batchContents.push(data);
        }
        batchContents.push('');
        return batchContents;
    }


    getFileBody(changeSetId, endPoint, data, isPostMethod) {
        const batchContents = new Array();
        batchContents.push('--changeset_' + changeSetId);
        batchContents.push('Content-Type: application/http');
        batchContents.push('Content-Transfer-Encoding: binary');
        batchContents.push('');
        batchContents.push('Content-Type: application/json;odata=verbose');
        batchContents.push('Accept: application/json;odata=verbose');
        batchContents.push(isPostMethod ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
        batchContents.push('Accept: application/json;odata=verbose');
        return batchContents;
    }
    /**
     * This function is used to execute the get Batch request.
     * @param batchGuid Provide the GUID.
     * @param sBatchData Provide the Batch data.
     */
    executeGetBatchRequest(batchGuid, sBatchData) {
        const arrResults = [];
        const response = this.executeBatchPostRequestByRestAPI(batchGuid, sBatchData);
        const responseInLines = response.split('\n');
        // tslint:disable-next-line:prefer-for-of
        for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
            try {
                const tryParseJson = JSON.parse(responseInLines[currentLine]);
                arrResults.push(tryParseJson.d.results);
            } catch (e) {
            }
        }
        return arrResults;
    }
    // tslint:disable
    getUserPropertiesById() {
        let returnValue;
        const URL = this.globalService.sharePointPageObject.webAbsoluteUrl + '/_api/Web/GetUserById(' + this.globalService.sharePointPageObject.userId + ')';
        $.ajax({
            url: URL,
            type: 'GET',
            async: false,
            headers: { 'Accept': 'application/json;odata=verbose' },
            success: function (data) {
                const dataResults = data.d;
                returnValue = dataResults;
            }
        });
        return returnValue;
    }

    fetchTaskDocumentsByRestAPI(url, prevTask) {
        let arrPrevTasks = [];
        if (prevTask === null || prevTask === undefined) //changed on 9.8.17
            arrPrevTasks = [];
        else {
            if (prevTask.indexOf(";#") > -1) {
                arrPrevTasks = prevTask.split(";#");
            } else {
                arrPrevTasks.push(prevTask)
            }
        }
        let tempObject: any = {};
        let tempArray = [];
        let arrUsers = [];
        $.ajax({
            url: this.globalService.sharePointPageObject.webAbsoluteUrl + url,
            type: "GET",
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    for (var index in data.d.results) {
                        tempObject = data.d.results[index];
                        // var user;
                        // var arrUser = arrUsers.filter(function (obj) {
                        //     return obj.Id === tempObject.ListItemAllFields.EditorId;
                        // });
                        // if(arrUser.length){
                        //     user = arrUser[0];
                        // }
                        // else{
                        //     user = this.getUser(tempObject.ListItemAllFields.EditorId);
                        //     arrUsers.push(user);
                        // }                           
                        tempObject.fileUrl = tempObject.ServerRelativeUrl;
                        tempObject.status = tempObject.ListItemAllFields.Status != null ? tempObject.ListItemAllFields.Status : "";
                        tempObject.taskName = tempObject.ListItemAllFields.TaskName != null ? tempObject.ListItemAllFields.TaskName : "";
                        if ((tempObject.status.split(" ").splice(-1)[0] == "Complete" || tempObject.status.split(" ").splice(-1)[0] == "Completed") && arrPrevTasks.indexOf(tempObject.taskName) > -1)
                            tempObject.visiblePrevTaskDoc = true;
                        else
                            tempObject.visiblePrevTaskDoc = false;
                        tempObject.modified = tempObject.ListItemAllFields.Modified;
                        tempObject.isFileMarkedAsFinal = tempObject.status.split(" ").splice(-1)[0] === "Complete" ? true : false; //changed on 8.8.17
                        //tempObject.modifiedUserName = user.name!=null?user.name:"";
                        tempObject.modifiedUserID = tempObject.ListItemAllFields.EditorId;
                        tempObject.fileName = tempObject.Name;
                        tempArray.push(tempObject);
                    }
                }
            },
            error: function (error) {

            }
        });
        if (tempArray.length > 0)
            tempArray = tempArray.sort(function (a, b) {
                return a.modified < b.modified ? -1 : 1;
            });
        return tempArray;
    }
    getUser(id) {
        var returnValue;
        $.ajax({
            url: this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/Web/GetUserById(" + id + ")",
            type: "GET",
            async: false,
            headers: { "Accept": "application/json;odata=verbose" },
            success: function (data) {
                var user: any = {};
                var dataResults = data.d;
                user.Id = dataResults.Id
                user.emailId = dataResults.Email;
                user.name = dataResults.Title;
                returnValue = user;
            },
            error: function () {
                return false;
            }
        });
        return returnValue;
    }
    downloadFiles(restUrl) {
        this.getFile('' + restUrl + '').subscribe(fileData => {
            let b: any = new Blob([fileData], { type: '' + fileData.type + '' });
            var url = window.URL.createObjectURL(b);
            window.open(url);
        }
        );
    }
    public getFile(path: string): Observable<any> {
        let options = new RequestOptions({ responseType: ResponseContentType.Blob });
        return this.http.get(path, options).pipe(
            map(
                (resp: Response) => {
                    return resp.json();
                }
            )
        )
    }

    downloadMultipleFiles(fileArray, zipName) {
        const zip = new JSZip();
        let count = 0;
        const name = zipName + ".zip";
        fileArray.forEach(element => {
            this.getFile(element.url)
                .subscribe(fileData => {
                    let b: any = new Blob([fileData], { type: '' + fileData.type + '' });
                    zip.file(element.fileName, b);
                    count++;
                    if (count == fileArray.length) {
                        zip.generateAsync({ type: 'blob' }).then(function (content) {
                            FileSaver.saveAs(content, name);
                        });
                    }
                })
        });
    }


    executeBatchRequest(batchGuid, sBatchData) {
        const arrResults = [];
        const response = this.executeBatchPostRequestByRestAPI(batchGuid, sBatchData);
        const responseInLines = response.split('\n');
        for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
            try {
                const tryParseJson = JSON.parse(responseInLines[currentLine]);
                arrResults.push(tryParseJson.d.results ? tryParseJson.d.results : tryParseJson.d);
            } catch (e) {
            }
        }
        return arrResults;
    }

    fetchListItemsByRestAPI(url?: string, objectArray?: [{ key: string, value: string }]) {
        let tempObject = {};
        const tempArray = [];
        try {
            $.ajax({
                url: this.globalService.sharePointPageObject.webAbsoluteUrl + url,
                type: 'GET',
                async: false,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                },
                success: function (data) {
                    if (data.d && !data.d.results) {
                        tempArray.push(true);
                    } else if (data.d.results.length > 0) {
                        for (const index in data.d.results) {
                            if (data.d.results.hasOwnProperty(index)) {
                                tempObject = data.d.results[index];
                                for (const obj in objectArray) {
                                    if (objectArray.hasOwnProperty(obj)) {
                                        tempObject[objectArray[obj].key] = objectArray[obj].value != null ? objectArray[obj].value : '';
                                    }
                                }
                                tempArray.push(tempObject);
                            }
                        }
                    }
                },
                error: function (error) {
                    return false;
                }
            });
        } catch (Ex) {
        }
        return tempArray;
    }



    triggerMail(fromEmail, templateName, objEmailBody, mailSubject, arrayTo, errorDetail) {
        const mailContent = this.constants.listNames.MailContent.name;
        //tslint:disable
        const url = "/_api/web/lists/GetByTitle('" + mailContent + "')/items?$select=Content&$filter=Title eq '" + templateName + "'";
        // tslint:enable
        const body = this.fetchListItemsByRestAPI(url);
        let mailBody = body[0].Content;
        for (const data of objEmailBody) {
            mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
        }
        const cc = [];
      //  cc = [fromEmail];
        this.sendEmail(fromEmail, arrayTo, mailBody, mailSubject, errorDetail, cc);
      }
    
      sendEmail(from, to, body, subject, errorDetail, cc) {
        // Get the relative url of the site
        //   const listName = this.constants.listNames.EmailDetails;
        //   const updateInformationEmail = [];
        //   updateInformationEmail.push({'key': 'Title', 'value': 'Entered send mail function'});
        //   updateInformationEmail.push({'key': 'MoreDetails', 'value': 'Subject:' + subject + '\nFrom:' + from + '\nTo:' + to});
        //   updateInformationEmail.push({'key': 'FileName', 'value': errorDetail});
        //   try {
        //       this.addListItem(listName, updateInformationEmail);
        //   } catch (e) {
        //   }
          const siteurl =  this.globalService.sharePointPageObject.serverRelativeUrl;
          const urlTemplate = siteurl + '/_api/SP.Utilities.Utility.SendEmail';
          const ccUser  = cc != null || cc !== undefined ? cc : [];
          if (ccUser.length > 0 && cc.indexOf(from) === -1) {
              ccUser.push(from);
          }
          $.ajax({
              contentType: 'application/json',
              url: urlTemplate,
              type: 'POST',
              data: JSON.stringify({
                  'properties': {
                      '__metadata': {
                          'type': 'SP.Utilities.EmailProperties'
                      },
                      'From': from,
                      'To': {
                          'results': to
                      },
                      'CC': {
                          'results': ccUser
                      },
                      'Body': body,
                      'Subject': subject
                  }
              }),
              headers: {
                  'Accept': 'application/json;odata=verbose',
                  'content-type': 'application/json;odata=verbose',
                  'X-RequestDigest': $('#__REQUESTDIGEST').val()
              },
              success: function(data) {
              },
              error: function(err) {
                  const errorListName = 'ErrorLog';
                  const updateInformation = [];
                  updateInformation.push({'key': 'Title', 'value': 'Error While Sending Mail'});
                  updateInformation.push({'key': 'Description', 'value': JSON.stringify(err)});
                  updateInformation.push({'key': 'MoreDetails', 'value': 'Subject:' + subject +
                                                                         '\nFrom:' + from + '\nTo:' + to + '\nCC:' + ccUser});
                  updateInformation.push({'key': 'FileName', 'value': errorDetail});
                  this.addListItem(errorListName, updateInformation);
              }
          });
      }



    /*****************************************************************
    Maxwell
    Task Allocation
    checkIfUserPresentInGroup()
    purpose : this method will check if user presentt in group
    *******************************************************************/
   checkIfUserPresentInGroup(groupName, userId) {

        return this.http.get(  this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/sitegroups/getByName('" + groupName + "')/Users?$filter=Id eq " + userId,  this.options);

    }
    

    updateListItemRestApi(sListName, arrProperties, sID, sType, bAsync, onSuccess, oError) {
        const oBj = {
           __metadata: {
              type: sType
           }
        };
        for (const index in arrProperties) {
          if (arrProperties.hasOwnProperty(index)) {
           const oVal = arrProperties[index]['value'];
           if ($.isArray(oVal)) {
               oBj[arrProperties[index]['key']] = { results: oVal};
           } else {
               oBj[arrProperties[index]['key']] = oVal;
           }
         }
        }
        $.ajax({
           // tslint:disable
           url: this.baseUrl + "/_api/web/lists/GetByTitle('"+sListName+"')/items("+sID+")", // list item ID
           // tslint:enable
           type: 'POST',
           data: JSON.stringify(oBj),
           async: bAsync ? true : false,
           headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'IF-MATCH': '*',
                'X-HTTP-Method': 'MERGE'
            },
            success: function(data, status, xhr) {
               onSuccess();
            },
            error: function(xhr, status, error) {
               oError();
            }
        });
     }



      /*****************************************************************
     Maxwell
     My Dashboard
     GetDocumentsOf Current Task
    purpose : this method will return documents
    *******************************************************************/


    // getPostDataUrl(batchContents,changeSetId,createFolder,endPoint,data,batchGuid)
    // {
    //     batchContents.push('--changeset_' +  changeSetId);
    //     batchContents.push('Content-Type: application/http');
    //     batchContents.push('Content-Transfer-Encoding: binary');
    //     batchContents.push('');
    //     batchContents.push(createFolder ? 'POST ' + endPoint + ' HTTP/1.1' : 'PATCH ' + endPoint + ' HTTP/1.1');
    //     batchContents.push('Content-Type: application/json;odata=verbose');
    //     batchContents.push('Accept: application/json;odata=verbose');
    //     batchContents.push('If-Match: *');
    //     batchContents.push('');
    //     batchContents.push(data);
    //     batchContents.push('');
    //     batchContents.push('--changeset_' + changeSetId + '--');
    //     batchContents.join('\r\n');





    //     const batchContentsData = new Array();
    //     batchContentsData.push('--batch_' + batchGuid);
    //     batchContentsData.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"');
    //     batchContentsData.push('Content-Length: ' + batchContents.length);
    //     batchContentsData.push('Content-Transfer-Encoding: binary');
    //     batchContentsData.push('');
    //     batchContentsData.push(batchContents);
    //     batchContentsData.push('');





    //     batchContentsData.push('--batch_' + batchGuid + '--');
    //     const batchBodyContents = batchContentsData.join('\r\n');



    // }

   
 

}
