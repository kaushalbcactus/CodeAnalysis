import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CommonService } from '../../../../Services/common.service';

@Component({
  selector: 'app-bucket-masterdata',
  templateUrl: './bucket-masterdata.component.html',
  styleUrls: ['./bucket-masterdata.component.css']
})
export class BucketMasterdataComponent implements OnInit {
  bucketDataColumns = [];
  bucketDataRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  found;
  bucketDataColArray = {
    Bucket: [],
    Client: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    Action: [],
    SubAction: [],
    ActionBy: [],
    Date: [],
  };
  items = [
    { label: 'Delete' }
  ];
  bucketData: any;
  constructor(private datepipe: DatePipe, private messageService: MessageService, private commonService: CommonService) { }

  ngOnInit() {
    this.bucketDataColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Bucket', header: 'Bucket' , visibility: true},
      { field: 'Client', header: 'Client' , visibility: true},
      { field: 'LastUpdated', header: 'Last Updated' , visibility: true, exportable: false},
      { field: 'LastUpdatedBy', header: 'Last Updated By' , visibility: true},
    ];

    this.bucketDataRows = [
      {
        // Sr: 1,
        Bucket: 'Test',
        Client: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    this.auditHistoryColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Action', header: 'Action' },
      { field: 'SubAction', header: 'Sub Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
    ];

    this.auditHistoryRows = [
      {
        // Sr: 1,
        Action: '',
        SubAction: '',
        ActionBy: '',
        ActionDate: '',
      }
    ];

    this.colFilters(this.bucketDataRows);
    this.colFilters1(this.auditHistoryRows);
  }

  colFilters(colData) {
    this.bucketDataColArray.Bucket = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Bucket, value: a.Bucket }; return b; }));
    this.bucketDataColArray.Client = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Client, value: a.Client }; return b; }));
    this.bucketDataColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
      // tslint:disable-next-line: align
      value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.bucketDataColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(colData.map
      (a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.SubAction = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.SubAction, value: a.SubAction }; return b; }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
  }

  addBucketData(bucketData) {
    // var type = 'Bucket';
    if (bucketData.trim() !== '') {
      this.checkUniqueData(bucketData);
      // this.found = this.commonService.checkUniqueData(this.bucketDataRows, bucketData , type);
      // console.log(this.found);
    }
  }

  checkUniqueData(data) {
    const found = this.bucketDataRows.find((item) => {
      if ((item.Bucket).toLowerCase() === data.trim().toLowerCase()) {
        return item;
      }
    });
    return found ? this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Data Already Exist in Table' })
     : this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data Submitted' });
  }


  downloadExcel(bmd) {
    bmd.exportCSV();
  }
}
