import { Component, OnInit, ViewEncapsulation, ApplicationRef, NgZone } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { MessageService, Message, ConfirmationService } from 'primeng/api';
import { CommonService } from '../../../../Services/common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { Router } from '@angular/router';

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
  viewClient = false;
  editClient = false;
  clientList: any = [];
  bucketData: any;
  msgs: Message[] = [];
  selectedClient: any = [];
  selectedRowItems: any = [];
  selectedBucket: any;
  viewClientArray: any = [];
  bucketDataRows = [];
  bucketDataColumns = [];
  bucketArray = [];
  clientArray = [];
  minDateValue = new Date();
  min30Days = new Date();
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param confirmationService This is instance referance of `ConfirmationService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @common zone This is instance referance of `CommonService` component.
   *
   */
  constructor(
    private datepipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private adminObject: AdminObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private adminCommonService: AdminCommonService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });
  }
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  ngOnInit() {
    this.clientList = [];
    this.bucketDataColumns = [
      { field: 'Bucket', header: 'Bucket', visibility: true },
      { field: 'Client', header: 'Client', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false },
    ];
    this.loadBucketTable();
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
    if (results && results.length) {
      this.bucketArray = results[0].retItems;
      this.clientArray = results[1].retItems;
      this.clientList = this.clientArray;
      this.bucketArray.forEach(item => {
        const obj = Object.assign({}, this.adminObject.bucketObj);
        const clientFilteredArray = this.clientArray.filter(x => x.Bucket === item.Title);
        obj.RowClientsArray = clientFilteredArray;
        obj.ID = item.ID;
        obj.Bucket = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
        obj.LastUpdatedBy = item.Editor.Title;
        obj.Client = clientFilteredArray && clientFilteredArray.length ? clientFilteredArray.map(x => x.Title).join(', ') : '';
        if (obj.Client.length > 30) {
          obj.PatClients = obj.Client.substring(0, 30) + '...';
        } else {
          obj.PatClients = obj.Client;
        }
        tempArray.push(obj);
      });
      this.bucketDataRows = tempArray;
      this.colFilters(this.bucketDataRows);
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
    this.viewClientArray = [];
    const tempArray = [];
    clientArray.forEach(item => {
      const obj = Object.assign({}, this.adminObject.bucketClientObj);
      obj.ID = item.ID;
      obj.Title = item.Title;
      obj.Bucket = item.Bucket;
      obj.EffectiveDate = new Date();
      tempArray.push(obj);
    });
    this.viewClientArray = tempArray;
    this.viewClient = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the Bucket,Client,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.bucketDataColArray.Bucket = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.Bucket, value: a.Bucket
      };
      return b;
    })));
    this.bucketDataColArray.Client = this.common.sortData(this.adminCommonService.uniqueArrayObj(this.clientList.map(a => {
      const b = { label: a.Title, value: a.Title };
      return b;
    })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.bucketDataColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.bucketDataColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));
  }
  /**
   * Construct a method to append the menu in bucket table.
   *
   * @description
   *
   * This method will add menu in each row of table.
   *
   * @param data Pass data as parameter which contains table row value.
   */
  bucketMenu(data) {
    this.selectedBucket = data;
    this.items = [
      { label: 'Edit', command: (e) => this.editClientData(data) },
      { label: 'Delete', command: (e) => this.delete(data), visible: data.Client !== '' ? false : true }
    ];
  }
  /**
   * Construct a method to allow user to select or update client for particular bucket.
   *
   * @description
   *
   * If bucket have any client then that client will be `disabled` while updating the client.
   * This method will allow user to select or update the client for bucket.
   *
   * @param data Pass data as parameter which contains table row value.
   */
  editClientData(data) {
    this.adminObject.isMainLoaderHidden = false;
    this.min30Days = new Date(new Date().setDate(new Date().getDate() - 30));
    this.selectedClient = [];
    this.selectedRowItems = [];
    this.clientList.forEach(client => {
      client.isCheckboxDisabled = false;
      client.EffectiveDate = new Date();
      data.RowClientsArray.forEach(element => {
        if (client.ID === element.ID) {
          client.isCheckboxDisabled = true;
        }
      });
    });
    this.selectedClient = this.selectedRowItems;
    this.editClient = true;
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to add the new bucket into `Focus Group` list.
   *
   * @description
   *
   * This method will add bucket into `Focus Group list` and shows that bucket into the table.
   *
   * @Note
   *
   * If bucket is already present then system will throws error and return `false`.
   * If blank bucket is submitted then system will throws error and return `false`.
   * Alphabets and two special characters are only allowed and special characters cannot start or end the words.
   *
   */
  async addBucketData() {
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL;
    this.messageService.clear();
    if (!this.bucketData) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter bucket name.'
      });
      return false;
    }
    if (!this.bucketData.match(alphaExp)) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.'
      });
      return false;
    }
    if (this.bucketDataRows.some(a => a.Bucket.toLowerCase() === this.bucketData.toLowerCase())) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'This bucket is already exist. Please enter another bucket name.'
      });
      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const data = {
      Title: this.bucketData
    };
    const result = await this.spServices.createItem(this.constants.listNames.FocusGroup.name, data,
      this.constants.listNames.FocusGroup.type);
    console.log(result);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The bucket ' + this.bucketData + ' has added successfully.'
    });
    this.bucketData = '';
    await this.loadBucketTable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the bucket as `IsActive='NO'` in `FocusGroup` list so that it is not visible in table.
   *
   * @param data Pass data as parameter which contains value of bucket row.
   */
  delete(data) {
    console.log(data);
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          IsActive: false
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.FocusGroup.name, this.constants.listNames.FocusGroup.type);
      },
    });
  }
  /**
   * Construct a method to save the update the data.
   * @param data Pass data as parameter which have Id in it.
   * @param updateData Pass the data which wants to update it.
   * @param listName pass the list name.
   * @param type pass the list type.
   */
  async confirmUpdate(data, updateData, listName, type) {
    this.adminObject.isMainLoaderHidden = false;
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The bucket ' + data.Bucket + ' has deleted successfully.'
    });
    this.loadBucketTable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to update the records in `ClientLegalEntity` list.
   * This method will prepare the `Batch` to update the records in `ClientLegalEntity` list.
   *
   * @description
   *
   * This method will update the column `Bucket` in `ClientLegalEntity` list.
   *
   * @Note
   *
   * It will only update the Client which are selected.
   * If all Clients are selected then it will update the client which are not disabled.
   */
  async update() {
    console.log(this.selectedBucket);
    console.log(this.selectedRowItems);
    if (!this.selectedClient.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please select atleast one client.'
      });
      return false;
    }
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    this.adminObject.isMainLoaderHidden = false;
    this.selectedClient.forEach(element => {
      if (!element.isCheckboxDisabled) {
        const updatedData = {
          __metadata: {
            type: this.constants.listNames.ClientLegalEntity.type
          },
          Bucket: this.selectedBucket.Bucket
        };
        const updateClientData = Object.assign({}, options);
        updateClientData.data = updatedData;
        updateClientData.listName = this.constants.listNames.ClientLegalEntity.name;
        updateClientData.type = 'PATCH';
        updateClientData.url = this.spServices.getItemURL(this.constants.listNames.ClientLegalEntity.name, element.ID);
        batchURL.push(updateClientData);
      }
    });
    if (batchURL.length) {
      // const results = await this.spServices.executeBatch(batchURL);
      const updateResult = await this.updateCLEMapping(batchURL);
      this.editClient = false;
      this.messageService.add({
        key: 'adminCustom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'The selected clients are updated successfully.'
      });
      this.loadBucketTable();
      this.adminObject.isMainLoaderHidden = true;
    }
  }
  /**
   * Construct a method to add item into `CLEBucketMapping` list.
   *
   * @description
   *
   * This method will add item into `CLEBucketMapping` list.
   *
   * @note
   *
   * It will call both time while creating and updating the client legal entity.
   *
   * If Create - Start Date will be today's date.
   *
   * If update - Start Date will be the value `bucketEffictiveDate` field.
   */
  async createCLEMapping(batchURL) {
    // const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    this.selectedClient.forEach(element => {
      if (!element.isCheckboxDisabled) {
        const data = {
          __metadata: { type: this.constants.listNames.CLEBucketMapping.type },
          Title: element.Title,
          CLEName: element.Title,
          Bucket: this.selectedBucket.Bucket,
          StartDate: element.EffectiveDate
        };
        const createCleMapping = Object.assign({}, options);
        createCleMapping.data = data;
        createCleMapping.listName = this.constants.listNames.CLEBucketMapping.name;
        createCleMapping.type = 'POST';
        createCleMapping.url = this.spServices.getReadURL(this.constants.listNames.CLEBucketMapping.name, null);
        batchURL.push(createCleMapping);
      }
    });
    if (batchURL.length) {
      const results = await this.spServices.executeBatch(batchURL);
    }
  }
  /**
   * Construct a method is to update item in `CLEBucketMapping` list.
   *
   * @description
   *
   * This method is used to update the item in `CLEBucketMapping` list.
   *
   * @note
   *
   * This method only calls when bucket value changes.
   */
  async updateCLEMapping(batchURL) {
    // let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    this.selectedClient.forEach(element => {
      if (!element.isCheckboxDisabled) {
        const cleMappingGet = Object.assign({}, options);
        const cleFilter = Object.assign({}, this.adminConstants.QUERY.GET_CLE_MAPPING_BY_ID);
        cleFilter.filter = cleFilter.filter.replace(/{{clientLegalEntity}}/gi,
          element.Title);
        cleMappingGet.url = this.spServices.getReadURL(this.constants.listNames.CLEBucketMapping.name,
          cleFilter);
        cleMappingGet.type = 'GET';
        cleMappingGet.listName = this.constants.listNames.CLEBucketMapping.name;
        batchURL.push(cleMappingGet);
      }
    });
    if (batchURL.length) {
      const getCLEResults = await this.spServices.executeBatch(batchURL);
      console.log(getCLEResults);
      batchURL = [];
      if (getCLEResults && getCLEResults.length) {
        getCLEResults.forEach(element => {
          if (element.retItems && element.retItems.length) {
            const cleObj = element.retItems[0];
            const tempDate = this.selectedClient.filter(a => a.Title === cleObj.CLEName);
            const updateData = {
              __metadata: { type: this.constants.listNames.CLEBucketMapping.type },
              EndDate: new Date(new Date(tempDate[0].EffectiveDate).setDate(new Date(tempDate[0].EffectiveDate).getDate() - 1))
            };
            const updateCleMapping = Object.assign({}, options);
            updateCleMapping.data = updateData;
            updateCleMapping.listName = this.constants.listNames.CLEBucketMapping.name;
            updateCleMapping.type = 'PATCH';
            updateCleMapping.url = this.spServices.getItemURL(this.constants.listNames.CLEBucketMapping.name, cleObj.ID);
            batchURL.push(updateCleMapping);
          }
        });
        if (batchURL.length) {
          // const updateResult = await this.spServices.executeBatch(batchURL);
          await this.createCLEMapping(batchURL);
        }
      }
    }
  }
  downloadExcel(bmd) {
    bmd.exportCSV();
  }

}
