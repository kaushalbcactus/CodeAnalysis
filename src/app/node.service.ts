import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { HttpClient, HttpResponse, HttpHeaders, HttpHeaderResponse, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { GlobalService } from './Services/global.service';
import { digest } from '@angular/compiler/src/i18n/serializers/xmb';

// import {RequestOptions, Request, RequestMethod} from '@angular/http';
declare const $: any;
@Injectable({
    providedIn: 'root'
})
export class NodeService {

    constructor(private http: HttpClient, private http1: Http, private globalService: GlobalService) { }

    getFilesystem(): Observable<any> {
        return this.http.get('assets/data/filesystem.json')
            .pipe(
                map((res: Response) => {
                    // console.log(res);
                    return res;
                })
            );
    }
    getFile(path: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                // tslint:disable-next-line:object-literal-key-quotes
                'Authorization': 'my-auth-token',
                responseType: 'blob'
            })
        };
        return this.http.get(path, httpOptions).pipe(
            map((res) => {
                return res;
            })
        );
    }

    // WOrking service
    getPdf(url: string): Observable<any> {
        const httpOptions = {
            responseType: 'blob' as 'json'
        };
        return this.http.get(url, httpOptions);
    }
    downloadfile(filePath: string) {
        return this.http.get(filePath, {
            responseType: 'arraybuffer'
        })
            .pipe(
                map(res => new Blob([res], { type: 'application/zip' })));
    }
    generatePdfFile(url: string): Observable<any> {
        const httpOptions = {
            responseType: 'blob' as 'json'
        };
        return this.http.get(url, httpOptions);
    }

    createZip(files: any[], zipName: string) {
        const zip = new JSZip();
        let count = 0;
        const name = zipName + '.zip';
        let zipData: any;
        // Add an top-level, arbitrary text file with contents
        files.forEach(element => {
            this.generatePdfFile(element).subscribe(fileData => {
                const b: any = new Blob([fileData], { type: '' + fileData.type + '' });
                zip.file(element.substring(element.lastIndexOf('/') + 1), b);
                count++;
                if (count === files.length) {
                    // tslint:disable-next-line:only-arrow-functions
                    zip.generateAsync({ type: 'blob' }).then(function(content) {
                        if (content) {
                            FileSaver.saveAs(content, name);
                        }
                    });
                }
            }, error => {
                zipData = error;
                console.log('Error is ', error);
            });
        });
    }
    downloadMultipleFiles(fileArray, zipName) {
        const zip = new JSZip();
        let count = 0;
        const name = zipName + '.zip';
        fileArray.forEach(element => {
            this.getFile(element.url)
                .subscribe(fileData => {
                    const b: any = new Blob([fileData], { type: '' + fileData.type + '' });
                    zip.file(element.fileName, b);
                    count++;
                    if (count === fileArray.length) {
                        // tslint:disable-next-line:only-arrow-functions
                        zip.generateAsync({ type: 'blob' }).then(function(content) {
                            FileSaver.saveAs(content, name);
                        });
                    }
                });
        });
    }

    uploadFIle(url, file: any): Observable<any> {
        console.log('$("#__REQUESTDIGEST").val() ', $('#__REQUESTDIGEST').val());
        const httpOptions = {
            headers: new HttpHeaders({
                // tslint:disable-next-line:object-literal-key-quotes
                'Accept': 'application/json; odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val() ? $('#__REQUESTDIGEST').val() : ''
            })
        };
        return this.http.post(url, file, httpOptions)
            .pipe(
                catchError(this.handleError())
            );
    }

    handleError<T>(serviceName = '', operation = 'operation', result = {} as T) {

        return (error: HttpErrorResponse): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            const message = (error.error instanceof ErrorEvent) ?
                error.error.message :
                `server returned code ${error.status} with body "${error.error}"`;

            // Let the app keep running by returning a safe result.
            return of(result);
        };

    }
}
