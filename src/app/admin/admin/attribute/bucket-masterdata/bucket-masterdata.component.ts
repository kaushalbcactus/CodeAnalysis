import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService, Message, ConfirmationService } from 'primeng/api';
import { CommonService } from '../../../../Services/common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';

@Component({
  selector: 'app-bucket-masterdata',
  templateUrl: './bucket-masterdata.component.html',
  styleUrls: ['./bucket-masterdata.component.css'],
  encapsulation: ViewEncapsulation.None
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to bucket into `Focus Group` list.
 *
 */
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
  viewClient = false;
  editClient = false;
  clientList: any;
  bucketData: any;
  msgs: Message[] = [];
  selectedClient: any = [];
  selectedRowItems: any = [];
  isCheckboxDisabled = [];
  viewClientArray: any = [];
  constructor(
    private datepipe: DatePipe,
    private messageService: MessageService,
    private commonService: CommonService,
    private confirmationService: ConfirmationService,
    private adminObject: AdminObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'client', header: 'Client' },
      // { field: 'color', header: '' }
    ];

    this.clientList = [];
    this.bucketDataColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Bucket', header: 'Bucket', visibility: true },
      { field: 'Client', header: 'Client', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];
    const clients = ['Client 1', 'Client 2', 'Client 6', 'Client 9'];
    this.bucketDataRows = [
      {
        // Sr: 1,
        Bucket: 'Test',
        Client: clients,
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    // this.auditHistoryColumns = [
    //   // { field: 'Sr', header: 'Sr.No.' },
    //   { field: 'Action', header: 'Action' },
    //   { field: 'SubAction', header: 'Sub Action' },
    //   { field: 'ActionBy', header: 'Action By' },
    //   { field: 'Date', header: 'Date' },
    // ];

    // this.auditHistoryRows = [
    //   {
    //     // Sr: 1,
    //     Action: '',
    //     SubAction: '',
    //     ActionBy: '',
    //     ActionDate: '',
    //   }
    // ];
    this.loadBucketTable();
    this.colFilters(this.bucketDataRows);
    this.colFilters1(this.auditHistoryRows);
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination, edit and delete the bucket.
   *
   */
  async loadBucketTable() {
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const results = await this.getInitData();
    console.log(results);
    if (results && results.length) {
      const bucketArray = results[0].retItems;
      const clientArray = results[1].retItems;
      this.clientList = clientArray;
      bucketArray.forEach(item => {
        const obj = Object.assign({}, this.adminObject.bucketObj);
        const clientFilteredArray = clientArray.filter(x => x.Bucket === item.Title);
        obj.RowClientsArray = clientFilteredArray;
        obj.ID = item.ID;
        obj.Bucket = item.Title;
        obj.LastUpdated = item.Modified;
        obj.LastUpdatedBy = item.Editor.Title;
        obj.Clients = clientFilteredArray && clientFilteredArray.length ? clientFilteredArray.map(x => x.Title).join(', ') : '';
        if (obj.Clients.length > 30) {
          obj.PatClients = obj.Clients.substring(0, 30) + '...';
        }
        tempArray.push(obj);
      });
      this.bucketDataRows = tempArray;
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. Bucket  - Get data from `Focus Group` list based on filter `IsActive='Yes'`.
   * 2. ClientLegalEntity - Get data from `ClientLegalEntity` list based on filter `IsActive='Yes'`.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Bucket value  from FocusGroup list ##0;
    const bucketGet = Object.assign({}, options);
    const bucketFilter = Object.assign({}, this.adminConstants.QUERY.GET_FOCUS_GROUP_BY_ACTIVE);
    bucketFilter.filter = bucketFilter.filter.replace(/{{isActive}}/gi, '1');
    bucketGet.url = this.spServices.getReadURL(this.constants.listNames.FocusGroup.name,
      bucketFilter);
    bucketGet.type = 'GET';
    bucketGet.listName = this.constants.listNames.FocusGroup.name;
    batchURL.push(bucketGet);

    // Get Practice Area from ClientLegalEntity list ##1;
    const getClientLegalEntity = Object.assign({}, options);
    const clientLegalEntityFilter = Object.assign({}, this.adminConstants.QUERY.GET_CLIENTLEGALENTITY_BY_ACTIVE);
    clientLegalEntityFilter.filter = clientLegalEntityFilter.filter.replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES);
    getClientLegalEntity.url = this.spServices.getReadURL(this.constants.listNames.ClientLegalEntity.name,
      clientLegalEntityFilter);
    getClientLegalEntity.type = 'GET';
    getClientLegalEntity.listName = this.constants.listNames.ClientLegalEntity.name;
    batchURL.push(getClientLegalEntity);
    const sResults = await this.spServices.executeBatch(batchURL);
    return sResults;
  }
  /**
   * construct a method to trigger when user click on hpyer-link and
   * display the client legal entity into dialog.
   *
   * @description
   *
   * This method will display all the clientlegal entity for particular bucket.
   *
   * @param clientArray An clientLegalEntity array required as parameter.
   */
  displayClient(clientArray) {
    this.viewClientArray = clientArray;
    this.viewClient = true;
    console.log(this.viewClientArray);
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
      { label: 'Delete', command: (e) => this.delete(), visible: data.Client !== '' ? false : true }
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
