import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService, Message, ConfirmationService } from 'primeng/api';
import { CommonService } from '../../../../Services/common.service';

@Component({
  selector: 'app-bucket-masterdata',
  templateUrl: './bucket-masterdata.component.html',
  styleUrls: ['./bucket-masterdata.component.css']
})
export class BucketMasterdataComponent implements OnInit {
  bucketDataColumns = [];
  bucketDataRows: any = [];
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
  items = [];
  rowIndex;
  rowData;

  cols;
  editClient = false;
  clientList: any;
  bucketData: any;
  msgs: Message[] = [];
  selectedClient: any = [];
  selectedRowItems: any = [];
  isCheckboxDisabled = [];
  constructor(private datepipe: DatePipe, private messageService: MessageService, private commonService: CommonService,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.cols = [
      { field: 'client', header: 'Client' },
      // { field: 'color', header: '' }
    ];

    this.clientList = [{ client: 'Client 1' },
    { client: 'Client 2' },
    { client: 'Client 3' },
    { client: 'Client 4' },
    { client: 'Client 5' },
    { client: 'Client 6' },
    { client: 'Client 7' },
    { client: 'Client 8' },
    { client: 'Client 9' },
    { client: 'Client 10' }];

    this.bucketDataColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Bucket', header: 'Bucket', visibility: true },
      { field: 'Client', header: 'Client', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];
    const clients = ['Client 1' , 'Client 2' , 'Client 6' , 'Client 9'];
    this.bucketDataRows = [
      {
        // Sr: 1,
        Bucket: 'Test',
        Client: clients,
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
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
          // tslint:disable-next-line: align
        }; return b;
      }));
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
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
          // tslint:disable-next-line: align
        }; return b;
      }));
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

    if (found) {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Data Already Exist in Table' });
    } else {
      const obj = {
        Bucket: data,
        Client: '',
        LastUpdated: 'Sep 2, 2019',
        LastUpdatedBy: 'Aditya Joshi'
      };
      this.bucketDataRows[this.bucketDataRows.length] = obj;
      this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data Submitted' });
    }
  }

  editClientData(data) {
    this.selectedClient = [];
    this.selectedRowItems = [];
    this.isCheckboxDisabled = [];
    console.log(data);
    this.editClient = true;
    this.clientList.forEach((e, i) => {
      if (data.Client !== '') {
      data.Client.forEach((e1, j) => {
        if (e1 !== undefined && e1 !== '') {
          if (e.client === e1) {
            this.selectedRowItems.push(e);
            this.isCheckboxDisabled[i] = true;
          }
        }
      });
    }
    });
    this.selectedClient = this.selectedRowItems;
  }

  bucketMenu(data, rowIndex) {
    this.rowIndex = rowIndex;
    this.rowData = data;
    this.items = [
      { label: 'Edit', command: (e) => this.editClientData(data) },
      { label: 'Delete', command: (e) => this.delete() , visible: data.Client !== '' ? false : true}
    ];
  }

  headerCheck(event) {
    console.log(event);
    if (this.selectedClient.length === 0) {
      this.selectedClient = this.selectedRowItems;
    }
  }

  delete() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' }];
      },
      reject: () => {
        this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
      }
    });
  }

  update() {
    const clients = [];
    this.selectedClient.forEach((e) => {
      clients.push(e.client);
    });
    const obj = {
      Bucket: this.rowData.Bucket,
      Client: clients,
      LastUpdated: this.rowData.LastUpdated,
      LastUpdatedBy: this.rowData.LastUpdatedBy
    };
    this.bucketDataRows[this.rowIndex] = obj;
    this.editClient = false;
  }

  downloadExcel(bmd) {
    bmd.exportCSV();
  }
}
