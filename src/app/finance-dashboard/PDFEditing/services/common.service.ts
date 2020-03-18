import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare const newrelic;

@Injectable({
  providedIn: 'root'
})

export class CommonService {
  url = 'https://htmlpdfapi.com/api/v1/pdf';
  authToken = 'Token NLystrJ22wtPLevxsHYe-ySdJUJkzO1L';
  constructor(private http: HttpClient) { }

  saveData(data) {
    console.log(data);
    const fd = new FormData();
    fd.append('file', data);

    // var fd = '--------------------------cef5a1b691b954b0\r\n' +
    // 'Content-Disposition: form-data; name="file"; filename="invoice_content.html"\r\n' +
    // 'Content-Type: text/html\r\n\r\n'
    //  + data +
    // '\r\n\r\n--------------------------cef5a1b691b954b0--';
    const httpHeaders = new HttpHeaders({
      Authentication: this.authToken,
      Accept: '*/*',
      // 'Content-Type' : 'multipart/form-data' // ; boundary=--------------------------cef5a1b691b954b0',
      // Expect : '100-continue'
    });

    return this.http.post(this.url, fd, {
      headers: httpHeaders,
    });
  }

  createPdf(obj) {

    const httpOptions = {

      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
        Accept: 'application/json; odata=verbose',
      })
    };
    // console.log(obj);
    obj.Code = 'AM601-0109-0128';
    obj.WebUrl = '/sites/medcomdev';
    obj.ID = '92';
    obj.Type = 'Proforma';
    obj.ListName = 'AAA01';
    // obj = {
    //   Code : 'AM601-0109-0126'
    // }
    console.log(obj);
    return this.http.post('https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF',
      JSON.stringify(obj), httpOptions);
    // return this.http.get('https://cactusspofinance.cactusglobal.com/PROD/Services/FinanceDashboard.svc/AddProforma/2157');

  }

  SetNewrelic(moduleType, routeType, value) {
    if (typeof newrelic === 'object') {
      newrelic.setCustomAttribute('spModuleType', moduleType);
      newrelic.setCustomAttribute('spRouteType', routeType);
      newrelic.setCustomAttribute('spCallType', value);
    }
  }
}
