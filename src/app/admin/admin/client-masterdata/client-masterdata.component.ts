import { Component, OnInit, ApplicationRef, NgZone, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm, ControlContainer } from '@angular/forms';
import { AdminCommonService } from '../../services/admin-common.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { AdminObjectService } from '../../services/admin-object.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router } from '@angular/router';
import { removeSummaryDuplicates } from '@angular/compiler';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { Table, DialogService } from 'primeng';
import { AddEditClientlegalentityDialogComponent } from './add-edit-clientlegalentity-dialog/add-edit-clientlegalentity-dialog.component';
import { AddEditSubdivisionComponent } from './add-edit-subdivision/add-edit-subdivision.component';
import { AddEditPocComponent } from './add-edit-poc/add-edit-poc.component';
import { AddEditPoDialogComponent } from './add-edit-po-dialog/add-edit-po-dialog.component';
import { ChangeBudgetDialogComponent } from './change-budget-dialog/change-budget-dialog.component';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';


@Component({
  selector: 'app-client-masterdata',
  templateUrl: './client-masterdata.component.html',
  styleUrls: ['./client-masterdata.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add Client Legal Entity into `ClientLegalEntity` list.
 *
 */
export class ClientMasterdataComponent implements OnInit {
  modalloaderenable: boolean;
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param frmbuilder This is instance referance of `FormBuilder` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param globalObject This is instance referance of `GlobalService` component.
   * @param common This is instance referance of `CommonService` component.
   */
  constructor(
    private datepipe: DatePipe,
    private frmbuilder: FormBuilder,
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private globalObject: GlobalService,
    private common: CommonService,
    private cdr: ChangeDetectorRef,
    public dialogService: DialogService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });

    if (this.adminConstants.toastMsg.SPMAA || this.adminConstants.toastMsg.SPMAD || this.adminConstants.toastMsg.EAPA) {
      setTimeout(() => {

        this.common.showToastrMessage(this.constantsService.MessageType.warn, 'You don\'\t have permission,please contact SP Team.', true);
        this.adminConstants.toastMsg.SPMAD = false;
        this.adminConstants.toastMsg.EAPA = false;
      }, 300);
    }
  }
  isUserSPMCA: boolean;
  isUserPO: boolean;
  clientList = [];

  clientMasterDataColumns = [];
  clientMasterDataRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  auditHistorySelectedColumns = [];
  auditHistorySelectedRows = [];
  subDivisionDetailsColumns = [];
  subDivisionDetailsRows = [];
  POCColumns = [];
  POCRows = [];
  POColumns = [];
  PORows = [];
  PORightRows = [];
  items = [];
  subDivisionItems = [];
  pocItems = [];
  poItems = [];
  poValue;

  buttonLabel;

  currClientObj: any;
  currSubDivisionObj: any;
  currPOCObj: any;
  currPOObj: any;

  filePathUrl: any;
  showaddClientModal = false;
  showEditClient = false;
  showSubDivisionDetails = false;
  showaddSubDivision = false;
  showeditSubDivision = false;
  fileReader = new FileReader();
  showPointofContact = false;
  showaddPOC = false;
  showeditPOC = false;
  minDateValue = new Date();
  showPurchaseOrder = false;
  showaddPO = false;
  showeditPO = false;
  editPo = false;



  @ViewChild('cmd', { static: false }) clientMasterTable: Table;

  cleNameInputPattern = /[^a-zA-Z0-9\s_-]*/g;


  isOptionFilter: boolean;
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  ngOnInit() {
    this.clientMasterDataColumns = [
      { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
      { field: 'BillingEntity', header: 'Billing Entity', visibility: true },
      { field: 'Bucket', header: 'Bucket', visibility: true },
      { field: 'Acronym', header: 'Acronym', visibility: true },
      { field: 'Market', header: 'Market', visibility: true },
      { field: 'InvoiceName', header: 'Invoice Name', visibility: true },
      // { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      // { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.subDivisionDetailsColumns = [
      { field: 'SubDivision', header: 'Sub-Division', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.POCColumns = [
      { field: 'FName', header: 'First Name', visibility: true },
      { field: 'LName', header: 'Last Name', visibility: true },
      { field: 'EmailAddress', header: 'Email', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.POColumns = [
      { field: 'PoName', header: 'Po Name', visibility: true },
      { field: 'PoNumber', header: 'Po Number', visibility: true },
      { field: 'AmountRevenue', header: 'Revenue', visibility: true },
      { field: 'AmountOOP', header: 'OOP', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.loadClientTable();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination, edit and delete the client legal entity.
   *
   */
  async loadClientTable() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    // this.constantsService.loader.isPSInnerLoaderHidden = false;
    const tempArray = [];
    let getClientLegalInfo: any = {};
    if (this.globalObject.userInfo.Groups.results.length) {
      const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
      if (groups.indexOf('PO_Admin') > -1) {
        // this.isUserSPMCA = false;
        this.isUserPO = true;
      } else {
        this.isUserPO = false;
      }
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Client_Admin') > -1) {
        this.isUserSPMCA = true;
        getClientLegalInfo = Object.assign({}, this.adminConstants.QUERY.GET_ALL_CLIENT_LEGAL_ENTITY_BY_ACTIVE);
        getClientLegalInfo.filter = getClientLegalInfo.filter.replace(/{{isActive}}/gi,
          this.adminConstants.LOGICAL_FIELD.YES);
      } else {
        this.isUserSPMCA = false;
        getClientLegalInfo = Object.assign({}, this.adminConstants.QUERY.GET_ACCESS_CLIENT_LEGAL_ENTITY_BY_ACTIVE);
        getClientLegalInfo.filter = getClientLegalInfo.filter.replace(/{{isActive}}/gi,
          this.adminConstants.LOGICAL_FIELD.YES).replace(/{{UserId}}/gi,
            this.globalObject.currentUser.userId);
      }
    }
    // const getClientLegalInfo = Object.assign({}, this.adminConstants.QUERY.GET_ALL_CLIENT_LEGAL_ENTITY_BY_ACTIVE);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getCLE');
    const results = await this.spServices.readItems(this.constantsService.listNames.ClientLegalEntity.name, getClientLegalInfo);
    if (results && results.length) {
      this.adminObject.resultResponse.ClientLegalEntityArray = results;
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.clientObj);
        obj.ID = item.ID;
        obj.ClientLegalEntity = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
        obj.LastUpdatedBy = item.Editor.Title;
        obj.Acronym = item.Acronym;
        // obj.Geography = item.Geography;
        obj.ListName = item.ListName;
        obj.Market = item.Market;
        obj.ClientGroup = item.ClientGroup;
        obj.InvoiceName = item.InvoiceName;
        obj.Currency = item.Currency;
        obj.APAddress = item.APAddress;
        obj.APEmail = item.APEmail;
        obj.Template = item.Template;
        obj.DistributionList = item.DistributionList;
        obj.Realization = item.Realization;
        obj.TimeZone = item.TimeZoneNM;
        obj.Notes = item.NotesMT;
        obj.PORequired = item.PORequired;
        obj.BillingEntity = item.BillingEntity;
        obj.Bucket = item.Bucket;
        // obj.IsCentrallyAllocated = item.IsCentrallyAllocated;
        obj.IsActive = item.IsActiveCH;
        obj.CMLevel1 = item.CMLevel1;
        obj.CMLevel2 = item.CMLevel2;
        obj.DeliveryLevel1 = item.DeliveryLevel1;
        obj.DeliveryLevel2 = item.DeliveryLevel2;
        tempArray.push(obj);
      });
      this.clientMasterDataRows = tempArray;
      this.colFilters(this.clientMasterDataRows);
    }
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    this.adminConstants.toastMsg.SPMAA = false;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the ClientLegalEntity,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.adminObject.clientMasterDataColArray.ClientLegalEntity = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.adminObject.clientMasterDataColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.adminObject.clientMasterDataColArray.LastModifiedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));

    this.adminObject.clientMasterDataColArray.BillingEntity = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.BillingEntity, value: a.BillingEntity }; return b;
    })));

    this.adminObject.clientMasterDataColArray.Bucket = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Bucket, value: a.Bucket }; return b;
    })));

    this.adminObject.clientMasterDataColArray.Acronym = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Acronym, value: a.Acronym }; return b;
    })));

    this.adminObject.clientMasterDataColArray.Market = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Market, value: a.Market }; return b;
    })));

    this.adminObject.clientMasterDataColArray.InvoiceName = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.InvoiceName, value: a.InvoiceName }; return b;
    })));
  }


  /**
   * Construct a method to load the newly created item into the table without refreshing the whole page.
   * @param item ID the item which is created or updated recently.
   *
   * @param isUpdate Pass the isUpdate as true/false for update and create item respectively.
   *
   * @description
   *
   * This method will load newly created item or updated item as first row in the table;
   *  Pass `false` to add the new created item at position 0 in the array.
   *  Pass `true` to replace the item in the array
   */
  async loadRecentRecords(ID, isUpdate) {
    const resGet = Object.assign({}, this.adminConstants.QUERY.GET_CLIENT_LEGAL_ENTITY_BY_ID);
    resGet.filter = resGet.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES).replace(/{{Id}}/gi, ID);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'GetCLE');
    const result = await this.spServices.readItems(this.constantsService.listNames.ClientLegalEntity.name, resGet);
    if (result && result.length) {
      const item = result[0];
      const obj = Object.assign({}, this.adminObject.clientObj);
      obj.ID = item.ID;
      obj.ClientLegalEntity = item.Title;
      obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
      obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
      obj.LastUpdatedBy = item.Editor.Title;
      obj.Acronym = item.Acronym;
      //obj.Geography = item.Geography;
      obj.ListName = item.ListName;
      obj.Market = item.Market;
      obj.ClientGroup = item.ClientGroup;
      obj.InvoiceName = item.InvoiceName;
      obj.Currency = item.Currency;
      obj.APAddress = item.APAddress;
      obj.APEmail = item.APEmail;
      obj.Template = item.Template;
      obj.DistributionList = item.DistributionList;
      obj.Realization = item.Realization;
      obj.TimeZone = item.TimeZoneNM;
      obj.Notes = item.NotesMT;
      obj.PORequired = item.PORequired;
      obj.BillingEntity = item.BillingEntity;
      obj.Bucket = item.Bucket;
      // obj.IsCentrallyAllocated = item.IsCentrallyAllocated;
      obj.IsActive = item.IsActiveCH;
      obj.CMLevel1 = item.CMLevel1;
      obj.CMLevel2 = item.CMLevel2;
      obj.DeliveryLevel1 = item.DeliveryLevel1;
      obj.DeliveryLevel2 = item.DeliveryLevel2;
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      if (isUpdate) {
        const index = this.clientMasterDataRows.findIndex(x => x.ID === obj.ID);
        this.clientMasterDataRows.splice(index, 1);
        this.clientMasterDataRows.unshift(obj);
      } else {
        this.clientMasterDataRows.unshift(obj);
      }
      this.colFilters(this.clientMasterDataRows);
    }
  }
  /**
   * Construct a method to store current selected row data into variable `currClientObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currClientObj`.
   * It will dynamically add the submenu in the table.
   */
  openMenuPopup(data) {
    this.items = [];
    this.currClientObj = data;
    this.items = [
      { label: 'Edit', command: (e) => this.addEditClentLegalEntity('Edit Client Legal Entity', data) },
      { label: 'Sub-Division Details', command: (e) => this.showSubDivision() },
      { label: 'Point of Contact', command: (e) => this.showPOC() },
      { label: 'Purchase Order', command: (e) => this.showPO() }
    ];
    if (this.isUserSPMCA) {
      this.items.join();
      this.items.splice(1, 0, { label: 'Delete', command: (e) => this.deleteClient() });
      this.items.join();
    }
  }

  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the Client legal entity as `IsActiveCH='NO'` in `ClientLegalEntity` list so that it is not visible in table.
   *
   */
  deleteClient() {
    console.log(this.currClientObj);

    this.common.confirmMessageDialog('Delete Confirmation', 'Do you want to delete this record?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(this.currClientObj, updateData, this.constantsService.listNames.ClientLegalEntity.name,
          this.constantsService.listNames.ClientLegalEntity.type, this.adminConstants.DELETE_LIST_ITEM.CLIENT_LEGAL_ENTITY);
      }
    });
  }
  /**
   * Construct a method to save the update the data.
   * @param data Pass data as parameter which have Id in it.
   * @param updateData Pass the data which wants to update it.
   * @param listName pass the list name.
   * @param type pass the list type.
   * @param itemName pass the item name from which list we want to delete record.
   */
  async confirmUpdate(data, updateData, listName, type, itemName) {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'UpdateCLE');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);
    switch (itemName) {
      case this.adminConstants.DELETE_LIST_ITEM.CLIENT_LEGAL_ENTITY:
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The client legal entity ' + data.ClientLegalEntity + ' has deleted successfully.', true);
        const clientIndex = this.clientMasterDataRows.findIndex(x => x.ID === data.ID);
        this.clientMasterDataRows.splice(clientIndex, 1);
        this.colFilters(this.clientMasterDataRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.SUB_DIVISION:
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The sub division ' + data.SubDivision + ' has deleted successfully.', true);
        const subDivisionindex = this.subDivisionDetailsRows.findIndex(x => x.ID === data.ID);
        this.subDivisionDetailsRows.splice(subDivisionindex, 1);
        this.subDivisionFilters(this.subDivisionDetailsRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.POINT_OF_CONTACT:
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The point of contact ' + data.FullName + ' has deleted successfully.', true);
        const pocindex = this.POCRows.findIndex(x => x.ID === data.ID);
        this.POCRows.splice(pocindex, 1);
        this.POCFilters(this.POCRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.PURCHASE_ORDER:
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The po ' + data.PoNumber + ' has deleted successfully.', true);
        const poindex = this.PORows.findIndex(x => x.ID === data.ID);
        this.PORows.splice(poindex, 1);
        this.POFilters(this.PORows);
        break;
    }
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination, edit and delete the Sub Division.
   *
   */
  async showSubDivision() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    const tempArray = [];
    this.subDivisionDetailsRows = [];
    const getSubDivisionInfo = Object.assign({}, this.adminConstants.QUERY.GET_SUB_DIVISION_BY_ACTIVE);
    getSubDivisionInfo.filter = getSubDivisionInfo.filter
      .replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'GetClientSubdivision');
    const results = await this.spServices.readItems(this.constantsService.listNames.ClientSubdivision.name, getSubDivisionInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.subDivisionObj);
        obj.ID = item.ID;
        obj.SubDivision = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
        obj.LastUpdatedBy = item.Editor.Title;
        obj.IsActive = item.IsActiveCH;
        obj.CMLevel1 = item.CMLevel1;
        obj.DeliveryLevel1 = item.DeliveryLevel1;
        obj.DistributionList = item.DistributionList;
        obj.ClientLegalEntity = item.ClientLegalEntity;
        tempArray.push(obj);
      });
      this.subDivisionDetailsRows = tempArray;
      this.subDivisionFilters(this.subDivisionDetailsRows);
    }
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    this.showSubDivisionDetails = true;
  }

  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the SubDivision,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  subDivisionFilters(colData) {
    this.adminObject.subDivisionDetailsColArray.SubDivision = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.SubDivision, value: a.SubDivision }; return b; })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.adminObject.subDivisionDetailsColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.adminObject.subDivisionDetailsColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));
  }
  /**
   * Construct a method to store current selected row data into variable `currSubDivisionObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currSubDivisionObj`.
   * It will dynamically add the submenu in the table.
   */
  subDivisionMenu(data) {
    this.currSubDivisionObj = data;
    this.subDivisionItems = [];
    this.subDivisionItems.push(
      { label: 'Edit', command: (e) => this.addEditSubDivision('Edit SubDivision', data) }
    );
    if (this.isUserSPMCA) {
      this.subDivisionItems.push(
        { label: 'Delete', command: (e) => this.deleteSubDivision() }
      );
    }
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the ClientSubDivision as `IsActiveCH='NO'` in `ClientSubDivision` list so that it is not visible in table.
   *
   */
  deleteSubDivision() {
    console.log(this.currClientObj);

    this.common.confirmMessageDialog('Delete Confirmation', 'Do you want to delete this record?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(this.currSubDivisionObj, updateData, this.constantsService.listNames.ClientSubdivision.name,
          this.constantsService.listNames.ClientSubdivision.type, this.adminConstants.DELETE_LIST_ITEM.SUB_DIVISION);
      }
    });
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   * This method will query `ProjectContacts` list based on `Status='Active'`.
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination, edit and delete the poc.
   *
   */
  async showPOC() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    const tempArray = [];
    this.POCRows = [];
    const getPocInfo = Object.assign({}, this.adminConstants.QUERY.GET_POC_BY_ACTIVE);
    getPocInfo.filter = getPocInfo.filter
      .replace(/{{active}}/gi, this.adminConstants.LOGICAL_FIELD.ACTIVE)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getProjectContacts');
    const results = await this.spServices.readItems(this.constantsService.listNames.ProjectContacts.name, getPocInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.pocObj);
        obj.ID = item.ID;
        obj.Title = item.Title ? item.Title : '';
        obj.ClientLegalEntity = item.ClientLegalEntity;
        obj.FName = item.FName;
        obj.LName = item.LName;
        obj.EmailAddress = item.EmailAddress;
        obj.Designation = item.Designation;
        obj.Phone = item.Phone ? item.Phone : '';
        obj.Address = item.AddressMT ? item.AddressMT : '';
        obj.FullName = item.FullNameCC ? item.FullNameCC : '';
        obj.Department = item.DepartmentST ? item.DepartmentST : '';
        obj.ReferralSource = item.ReferralSource;
        obj.Status = item.Status;
        obj.RelationshipStrength = item.RelationshipStrength ? item.RelationshipStrength : '';
        obj.EngagementPlan = item.EngagementPlan ? item.EngagementPlan : '';
        obj.Comments = item.CommentsMT ? item.CommentsMT : '';
        obj.ProjectContactsType = item.ProjectContactsType;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
        obj.LastUpdatedBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.POCRows = tempArray;
      this.POCFilters(this.POCRows);
    }
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    this.showPointofContact = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the FName,LName,EmailAddress,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  POCFilters(colData) {
    this.adminObject.POCColArray.FName = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.FName, value: a.FName }; return b; })));
    this.adminObject.POCColArray.LName = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LName, value: a.LName }; return b; })));
    this.adminObject.POCColArray.EmailAddress = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.EmailAddress, value: a.EmailAddress }; return b; })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.adminObject.POCColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.adminObject.POCColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));
  }
  /**
   * Construct a method to store current selected row data into variable `currPOCObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currPOCObj`.
   * It will dynamically add the submenu in the table.
   */
  pocMenu(data) {
    this.currPOCObj = data;
    if (this.isUserSPMCA) {
      this.pocItems = [
        { label: 'Edit', command: (e) => this.addEditPOC('Edit Point Of Contact', data) },
        { label: 'Delete', command: (e) => this.deletePOC() }
      ];
    } else {
      this.pocItems = [
        { label: 'Edit', command: (e) => this.addEditPOC('Edit Point Of Contact', data) }
      ];
    }
  }
  /**
  * Construct a method to remove the item from table.
  *
  * @description
  *
  * This method mark the point of Contact as `Status='Inactive'` in `ProjectContact` list so that it is not visible in table.
  *
  */
  deletePOC() {
    console.log(this.currPOCObj);



    this.common.confirmMessageDialog('Delete Confirmation', 'Do you want to delete this record?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          Status: this.adminConstants.LOGICAL_FIELD.INACTIVE
        };
        this.confirmUpdate(this.currPOCObj, updateData, this.constantsService.listNames.ProjectContacts.name,
          this.constantsService.listNames.ProjectContacts.type, this.adminConstants.DELETE_LIST_ITEM.POINT_OF_CONTACT);
      }
    });
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination, edit and delete the po.
   *
   */
  async showPO() {
    ;
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    const tempArray = [];
    this.PORows = [];
    const getPOInfo = Object.assign({}, this.adminConstants.QUERY.GET_PO_BY_ACTIVE);
    getPOInfo.filter = getPOInfo.filter
      .replace(/{{active}}/gi, this.adminConstants.LOGICAL_FIELD.ACTIVE)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getPO');
    const results = await this.spServices.readItems(this.constantsService.listNames.PO.name, getPOInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.poObj);
        obj.ID = item.ID;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
        obj.LastUpdatedBy = item.Editor.Title;
        obj.ClientLegalEntity = item.ClientLegalEntity;
        obj.Title = item.Title;
        obj.Amount = item.Amount;
        obj.AmountOOP = item.AmountOOP;
        obj.AmountRevenue = item.AmountRevenue;
        obj.AmountTax = item.AmountTax;
        //obj.BillOOPFromRevenue = item.BillOOPFromRevenue;
        obj.BuyingEntity = item.BuyingEntity;
        obj.Currency = item.Currency;
        obj.InvoicedOOP = item.InvoicedOOP;
        obj.InvoicedRevenue = item.InvoicedRevenue;
        obj.InvoicedTax = item.InvoicedTax;
        obj.Link = item.Link;
        if(item.Link){

          obj.poDocLink = this.globalObject.sharePointPageObject.webRelativeUrl + '/' +this.currClientObj.ListName +
          '/' + this.adminConstants.FOLDER_LOCATION.PO + '/' + item.Link
        }
        obj.Molecule = item.Molecule;
        obj.PoName = item.NameST;
        obj.PoNumber = item.Number;
        obj.OOPLinked = item.OOPLinked;
        // obj.PO_x0020_Geography = item.PO_x0020_Geography;
        obj.POCategory = item.POCategory;
        obj.POCLookup = item.POCLookup;
        obj.POExpiryDate = new Date(item.POExpiryDate);
        // obj.PoProposalID = item.PoProposalID;
        obj.RevenueLinked = item.RevenueLinked;
        obj.ScheduledOOP = item.ScheduledOOP;
        obj.ScheduledRevenue = item.ScheduledRevenue;
        // obj.SOWLookup = item.SOWLookup;
        obj.Status = item.Status;
        obj.TA = item.TA;
        obj.TaxLinked = item.TaxLinked;
        obj.TotalInvoiced = item.TotalInvoiced;
        obj.TotalLinked = item.TotalLinked;
        obj.TotalScheduled = item.TotalScheduled;
        obj.CMLevel2 = item.CMLevel2;
        tempArray.push(obj);
      });
      this.PORows = tempArray;
      this.POFilters(this.PORows);
    }
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    this.showPurchaseOrder = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the PoName,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  POFilters(colData) {
    this.adminObject.POColArray.PoName = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.PoName, value: a.PoName }; return b; })));
    this.adminObject.POColArray.PoNumber = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.PoNumber, value: a.PoNumber }; return b; })));
    this.adminObject.POColArray.AmountRevenue = this.common.sortNumberArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.AmountRevenue, value: a.AmountRevenue }; return b; })));
    this.adminObject.POColArray.AmountOOP = this.common.sortNumberArray(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.AmountOOP, value: a.AmountOOP };
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
    this.adminObject.POColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.adminObject.POColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));
  }


  // /**
  //  * Construct a method to trigger whenever we change the file for file upload.
  //  *
  //  * @description
  //  *
  //  * This method will trigger whenever we change the file for file upload and save the file into
  //  * `selectedFile` variable.
  //  */
  // onFileChange(event) {
  //   this.selectedFile = null;
  //   this.fileReader = new FileReader();
  //   if (event.target.files && event.target.files.length > 0) {
  //     this.selectedFile = event.target.files[0];
  //     this.fileReader.readAsArrayBuffer(this.selectedFile);
  //   }
  // }


  /**
   * Construct a method to create an object of `POBudgetBreak`.
   *
   * @description
   *
   * This method is used to create an object of `POBudgetBreak`.
   * @param poResult Pass poResult as parameter as it contains the POLookup value.
   *
   * @return It will return an object of `POBudgetBreak`.
   */
  getPOBudgetBreakUPData(poResult, poDetails) {
    const data: any = {
      POLookup: poResult.ID,
      Currency: this.showeditPO ? this.currPOObj.Currency : poDetails.value.currency,
      Amount: this.adminObject.po.total,
      CreateDate: new Date(),
      AmountRevenue: this.adminObject.po.revenue,
      AmountOOP: this.adminObject.po.oop,
      AmountTax: this.adminObject.po.tax
    };
    return data;
  }
  /**
   * Construct a method to store current selected row data into variable `currPOObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currPOObj`.
   * It will dynamically add the submenu in the table.
   */
  poMenu(data) {
    this.currPOObj = data;
    if (this.isUserSPMCA || this.isUserPO) {
      this.poItems = [
        { label: 'Change Budget', command: (e) => this.changeBudgetDialog(data) },
        { label: 'Edit', command: (e) => this.addEditPO('Edit Purchase Order', data) },
        { label: 'Delete', command: (e) => this.deletePO(data) }
      ];
    } else {
      this.poItems = [
        { label: 'Edit', command: (e) => this.addEditPO('Edit Purchase Order', data) },
      ];
    }
  }
  /**
   * Construct a method to load the newly created item into the table without refreshing the whole page.
   * @param item ID the item which is created or updated recently.
   *
   * @param action Pass the action as parameter to which action should want to execute.
   *
   * If `Action = 'Add'`  - It will add the item in the array at first position.
   * If `Action = 'Edit`  - It will edit the item and place that item at first position in array.
   * If `Action = 'Get'`  - It will return an array of `PO` object.
   *
   * @retrun It will return an array of PO object in case Action is `Get`
   *
   * @description
   *
   * This method will load newly created item or updated item as first row in the table;
   *  Pass `false` to add the new created item at position 0 in the array.
   *  Pass `true` to replace the item in the array
   */
  async loadRecentPORecords(ID, action) {
    const tempArray = [];
    ;
    const poGet = Object.assign({}, this.adminConstants.QUERY.GET_PO_BY_ID);
    poGet.filter = poGet.filter
      .replace(/{{active}}/gi, this.adminConstants.LOGICAL_FIELD.ACTIVE)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity)
      .replace(/{{Id}}/gi, ID);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getPO');
    const result = await this.spServices.readItems(this.constantsService.listNames.PO.name, poGet);
    if (result && result.length) {
      const item = result[0];
      const obj = Object.assign({}, this.adminObject.poObj);
      obj.ID = item.ID;
      obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
      obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
      obj.LastUpdatedBy = item.Editor.Title;
      obj.ClientLegalEntity = item.ClientLegalEntity;
      obj.Title = item.Title;
      obj.Amount = item.Amount;
      obj.AmountOOP = item.AmountOOP;
      obj.AmountRevenue = item.AmountRevenue;
      obj.AmountTax = item.AmountTax;
      // obj.BillOOPFromRevenue = item.BillOOPFromRevenue;
      obj.BuyingEntity = item.BuyingEntity;
      obj.Currency = item.Currency;
      obj.InvoicedOOP = item.InvoicedOOP;
      obj.InvoicedRevenue = item.InvoicedRevenue;
      obj.InvoicedTax = item.InvoicedTax;
      obj.Link = item.Link;
      if(item.Link){
        obj.poDocLink = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + this.currClientObj.ListName +
        '/' + this.adminConstants.FOLDER_LOCATION.PO + '/' + item.Link
      }
      obj.Molecule = item.Molecule;
      obj.PoName = item.NameST;
      obj.PoNumber = item.Number;
      obj.OOPLinked = item.OOPLinked;
      // obj.PO_x0020_Geography = item.PO_x0020_Geography;
      obj.POCategory = item.POCategory;
      obj.POCLookup = item.POCLookup;
      obj.POExpiryDate = new Date(item.POExpiryDate);
      // obj.PoProposalID = item.PoProposalID;
      obj.RevenueLinked = item.RevenueLinked;
      obj.ScheduledOOP = item.ScheduledOOP;
      obj.ScheduledRevenue = item.ScheduledRevenue;
      // obj.SOWLookup = item.SOWLookup;
      obj.Status = item.Status;
      obj.TA = item.TA;
      obj.TaxLinked = item.TaxLinked;
      obj.TotalInvoiced = item.TotalInvoiced;
      obj.TotalLinked = item.TotalLinked;
      obj.TotalScheduled = item.TotalScheduled;
      obj.CMLevel2 = item.CMLevel2;
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      switch (action) {
        case this.adminConstants.ACTION.ADD:
          this.PORows.unshift(obj);
          this.POFilters(this.PORows);
          break;
        case this.adminConstants.ACTION.EDIT:
          const index = this.PORows.findIndex(x => x.ID === obj.ID);
          this.PORows.splice(index, 1);
          this.PORows.unshift(obj);
          this.POFilters(this.PORows);
          break;
        case this.adminConstants.ACTION.GET:
          tempArray.push(obj);
          break;
      }
    }
    if (tempArray.length) {
      return tempArray;
    }

    this.modalloaderenable = false;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the po as `Status='Inactive'` in `PO` list so that it is not visible in table.
   * @note
   *
   * It will first confirm from user to delete or not.
   */
  deletePO(Obj) {

    this.common.confirmMessageDialog('Delete Confirmation', 'Do you want to delete this record?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          Status: this.adminConstants.LOGICAL_FIELD.INACTIVE
        };
        this.confirmUpdate(Obj, updateData, this.constantsService.listNames.PO.name,
          this.constantsService.listNames.PO.type, this.adminConstants.DELETE_LIST_ITEM.PURCHASE_ORDER);
      }
    });
  }
  /**
   * Construct a method to call REST API based on query `ID='this.currPOObj.ID'`to show the all the properties in right overlay.
   *
   * @description
   *
   * This method is used to show the selected item in right side overlay.
   *
   */
  // async viewPO() {
  //   this.constantsService.loader.isPSInnerLoaderHidden = false;
  //   this.PORightRows = [this.currPOObj];
  //   this.adminObject.po.isRightVisible = true;
  //   this.constantsService.loader.isPSInnerLoaderHidden = true;
  // }
  /**
   * Construct a function to open the form to add, subtract and restructure the amount.
   *
   * @description
   *
   * This method is used to open the form to perform an action like add, subtract and restructure the amount.
   *
   */
  // showchangeBudgetModal() {
  //   this.selectedValue = [];
  //   this.checkBudgetValue = false;
  //   this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
  //   this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
  //   this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
  //   this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
  //   this.adminObject.oldBudget.LastUpdated = this.currPOObj.LastUpdated;
  //   this.changeBudgetForm.controls.total.disable();
  //   this.initAddBudgetForm();
  //   this.showaddBudget = true;
  //   this.isBudgetFormSubmit = false;
  //   this.constantsService.loader.isPSInnerLoaderHidden = true;
  // }


  downloadExcel(cmd) {
    cmd.exportCSV();
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterViewChecked() {
    if (this.clientMasterDataRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.clientMasterTable,
        colFields: this.adminObject.clientMasterDataColArray
      };
      if (obj.tableData.filteredValue) {
        this.common.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }





  /**
   * Construct a method to save or update the client legal entity into `ClientLegalEntity` list.
   * It will construct a REST-API Call to create item or update item into `ClientLegalEntity` list.
   *
   * @description
   *
   * This method is used to validate and save the client legal entity into `ClientLegalEntity` list.
   *
   * @Note
   *
   * 1. Duplicate Client legal Entity is not allowed.
   * 2. Only 2 special character are allowed.
   * 3. `Client Legal Entity` name cannot start or end with special character.
   * 4. Acronym can have maximum 5 alphanumberic character.
   *
   */
  async saveClient(clientDetails) {

    // write the save logic using rest api.
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    const clientData = await this.getClientData(clientDetails);

    console.log("printclientData")
    console.log(clientData)
    if (!this.showEditClient) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'CreateCLE');
      const results = await this.spServices.createItem(this.constantsService.listNames.ClientLegalEntity.name,
        clientData, this.constantsService.listNames.ClientLegalEntity.type);

      if (!results.hasOwnProperty('hasError') && !results.hasError) {
        await this.createCLEMapping(clientDetails);
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Client ' + clientDetails.value.name + ' is created successfully.', false);
        if (!this.adminObject.dropdown.ClientGroupArray.some(a =>
          a.label && a.label.toLowerCase() === clientDetails.value.group.toLowerCase())) {
          const clientGroupdata = {
            Title: clientDetails.value.group,
            IsActiveCH: this.adminConstants.LOGICAL_FIELD.YES
          };
          // tslint:disable-next-line: max-line-length
          const newClientGroup = await this.spServices.createItem(this.constantsService.listNames.ClientGroup.name, clientGroupdata, this.constantsService.listNames.ClientGroup.type);

          this.adminObject.dropdown.ClientGroupArray.push({ label: clientDetails.value.group, value: clientDetails.value.group });
        }
        await this.loadRecentRecords(results.ID, this.showEditClient);
      }
    }
    if (this.showEditClient) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'UpdateCLE');
      const results = await this.spServices.updateItem(this.constantsService.listNames.ClientLegalEntity.name, this.currClientObj.ID,
        clientData, this.constantsService.listNames.ClientLegalEntity.type);
      if (this.currClientObj.Bucket !== clientDetails.value.bucket) {
        await this.updateCLEMapping(clientDetails);
      }
      this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Client ' + this.currClientObj.ClientLegalEntity + ' is updated successfully.', false);

      if (!this.adminObject.dropdown.ClientGroupArray.some(a =>
        a.label && a.label.toLowerCase() === clientDetails.value.group.toLowerCase())) {
        const clientGroupdata = {
          Title: clientDetails.value.group,
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.YES
        };
        const newClientGroup = await this.spServices.createItem(this.constantsService.listNames.ClientGroup.name,
          clientGroupdata, this.constantsService.listNames.ClientGroup.type);

        this.adminObject.dropdown.ClientGroupArray.push({ label: clientDetails.value.group, value: clientDetails.value.group });
      }
      await this.loadRecentRecords(this.currClientObj.ID, this.showEditClient);
    }
    this.showaddClientModal = false;
    this.constantsService.loader.isPSInnerLoaderHidden = true;

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
  async createCLEMapping(clientDetails) {
    const data = {
      Title: !this.showEditClient ? clientDetails.value.name : this.currClientObj.ClientLegalEntity,
      CLEName: !this.showEditClient ? clientDetails.value.name : this.currClientObj.ClientLegalEntity,
      Bucket: clientDetails.value.bucket,
      StartDate: !this.showEditClient ? new Date() : clientDetails.value.bucketEffectiveDate
    };
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'CreateCLEBucketMapping');
    const results = await this.spServices.createItem(this.constantsService.listNames.CLEBucketMapping.name,
      data, this.constantsService.listNames.CLEBucketMapping.type);
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
  async updateCLEMapping(clientDetails) {
    const cleMappingGet = Object.assign({}, this.adminConstants.QUERY.GET_CLE_MAPPING_BY_ID);
    cleMappingGet.filter = cleMappingGet.filter.replace(/{{clientLegalEntity}}/gi,
      this.currClientObj.ClientLegalEntity);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'GetCLEBucketMapping');
    const result = await this.spServices.readItems(this.constantsService.listNames.CLEBucketMapping.name, cleMappingGet);
    if (result && result.length) {
      const tempDate = clientDetails.value.bucketEffectiveDate;
      const updateItem = {
        EndDateDT: new Date(new Date(tempDate).setDate(new Date(tempDate).getDate() - 1))
      };
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'UpdateCLEBucketMapping');
      const updateResult = await this.spServices.updateItem(this.constantsService.listNames.CLEBucketMapping.name, result[0].ID,
        updateItem, this.constantsService.listNames.CLEBucketMapping.type);
      this.createCLEMapping(clientDetails);
    }
  }


  /**
   * Construct a method to prepare the client legal entity object value.
   *
   * @description This method is used to prepare the object of ClientLegalEntity Object.
   *
   * @returns It will return an object of `ClientLegalEntity` Object.
   */
  getClientData(clientDetails) {
    const data: any = {
      ClientGroup: clientDetails.value.group,
      InvoiceName: clientDetails.value.invoiceName,
      Realization: + clientDetails.value.realization,
      Market: clientDetails.value.market,
      PORequired: clientDetails.value.poRequired,
      CMLevel1Id: {
        results: clientDetails.value.cmLevel1
      },
      CMLevel2Id: clientDetails.value.cmLevel2,
      DeliveryLevel2Id: clientDetails.value.deliveryLevel2,
      Bucket: clientDetails.value.bucket
    };
    if (!this.showEditClient) {
      data.ListName = clientDetails.value.name ? clientDetails.value.name.replace(/[^a-zA-Z]/g, '').substring(0, 20) : '',
        data.Title = clientDetails.value.name;
      data.Acronym = clientDetails.value.acronym.toUpperCase();
      data.BillingEntity = clientDetails.value.billingEntry;
      data.TimeZoneNM = +clientDetails.value.timeZone;
      data.Currency = clientDetails.value.currency;
      data.IsActiveCH = this.adminConstants.LOGICAL_FIELD.YES
    }
    data.DistributionList = clientDetails.value.distributionList ? clientDetails.value.distributionList : '';
    if (clientDetails.value.deliveryLevel1) {
      data.DeliveryLevel1Id = {
        results: clientDetails.value.deliveryLevel1
      };
    }

    data.APEmail = clientDetails.value.APEmail ? clientDetails.value.APEmail : '';
    data.NotesMT = clientDetails.value.notes ? clientDetails.value.notes : '';
    const ap1 = clientDetails.value.address1 ? clientDetails.value.address1 : '';
    const ap2 = clientDetails.value.address2 ? clientDetails.value.address2 : '';
    const ap3 = clientDetails.value.address3 ? clientDetails.value.address3 : '';
    const ap4 = clientDetails.value.address4 ? clientDetails.value.address4 : '';
    data.APAddress = ap1 + ';#' + ap2 + ';#' + ap3 + ';#' + ap4;
    return data;
  }

  // **************************************************************************************************
  // Sub division Details start
  // **************************************************************************************************

  async saveSubdivision(subDivisionDetails) {
    // write the save logic using rest api.
    const subDivisionData = await this.getSubDivisionData(subDivisionDetails);
    if (!this.showeditSubDivision) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'createClientSubdivision');
      const results = await this.spServices.createItem(this.constantsService.listNames.ClientSubdivision.name,
        subDivisionData, this.constantsService.listNames.ClientSubdivision.type);
      if (!results.hasOwnProperty('hasError') && !results.hasError) {
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The subdivision ' + subDivisionDetails.value.subDivision_Name + ' is created successfully.', false);
        await this.loadRecentSubDivisionRecords(results.ID, this.showeditSubDivision);
      }
    }
    if (this.showeditSubDivision) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'updateClientSubdivision');
      const results = await this.spServices.updateItem(this.constantsService.listNames.ClientSubdivision.name, this.currSubDivisionObj.ID,
        subDivisionData, this.constantsService.listNames.ClientSubdivision.type);
      this.common.showToastrMessage(this.constantsService.MessageType.success, 'The subdivision ' + this.currSubDivisionObj.SubDivision + ' is updated successfully.', false);
      await this.loadRecentSubDivisionRecords(this.currSubDivisionObj.ID, this.showeditSubDivision);
    }
  }

  /**
* Construct a method to create an object of clientSubsdivision.
*
* @description
*
* This method is used to create an object of clientSubDivision.
*
* @return It will return an object of clientSubDivision.
*/
  getSubDivisionData(subDivisionDetails) {
    const data: any = {};
    if (!this.showeditSubDivision) {
      data.Title = subDivisionDetails.value.subDivision_Name;
      data.ClientLegalEntity = this.currClientObj.ClientLegalEntity;
      data.IsActiveCH = this.adminConstants.LOGICAL_FIELD.YES;
    }
    data.DeliveryLevel1Id = subDivisionDetails.value.deliveryLevel1 ? { results: subDivisionDetails.value.deliveryLevel1 } :
      { results: [] };
    data.CMLevel1Id = subDivisionDetails.value.cmLevel1 ? { results: subDivisionDetails.value.cmLevel1 } : { results: [] };
    data.DistributionList = subDivisionDetails.value.distributionList ? subDivisionDetails.value.distributionList : '';
    return data;
  }

  /**
   * Construct a method to load the newly created item into the table without refreshing the whole page.
   * @param item ID the item which is created or updated recently.
   *
   * @param isUpdate Pass the isUpdate as true/false for update and create item respectively.
   *
   * @description
   *
   * This method will load newly created item or updated item as first row in the table;
   *  Pass `false` to add the new created item at position 0 in the array.
   *  Pass `true` to replace the item in the array
   */
  async loadRecentSubDivisionRecords(ID, isUpdate) {
    const subDivisionGet = Object.assign({}, this.adminConstants.QUERY.GET_SUB_DIVISION_BY_ID);
    subDivisionGet.filter = subDivisionGet.filter
      .replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity)
      .replace(/{{Id}}/gi, ID);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getClientSubdivision');
    const result = await this.spServices.readItems(this.constantsService.listNames.ClientSubdivision.name, subDivisionGet);
    if (result && result.length) {
      const item = result[0];
      const obj = Object.assign({}, this.adminObject.subDivisionObj);
      obj.ID = item.ID;
      obj.SubDivision = item.Title;
      obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
      obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
      obj.LastUpdatedBy = item.Editor.Title;
      obj.IsActive = item.IsActiveCH;
      obj.CMLevel1 = item.CMLevel1;
      obj.DeliveryLevel1 = item.DeliveryLevel1;
      obj.DistributionList = item.DistributionList;
      obj.ClientLegalEntity = item.ClientLegalEntity;
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      if (isUpdate) {
        const index = this.subDivisionDetailsRows.findIndex(x => x.ID === obj.ID);
        this.subDivisionDetailsRows.splice(index, 1);
        this.subDivisionDetailsRows.unshift(obj);
      } else {
        this.subDivisionDetailsRows.unshift(obj);
      }
      this.subDivisionFilters(this.subDivisionDetailsRows);
    }
  }


  // **************************************************************************************************
  // Sub division Details end
  // **************************************************************************************************


  // **************************************************************************************************
  // POC Details start
  // **************************************************************************************************

  async savePOC(pocDetails) {

    // write the save logic using rest api.
    const pocData = await this.getPOCData(pocDetails);
    if (!this.showeditPOC) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'CreateProjectContacts');
      const results = await this.spServices.createItem(this.constantsService.listNames.ProjectContacts.name,
        pocData, this.constantsService.listNames.ProjectContacts.type);
      if (!results.hasOwnProperty('hasError') && !results.hasError) {
        this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Poc ' + pocDetails.value.fname + ' ' + pocDetails.value.lname + ' is created successfully.', false);
        await this.loadRecentPOCRecords(results.ID, this.showeditPOC);
      }
    }
    if (this.showeditPOC) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'updateProjectContacts');
      const results = await this.spServices.updateItem(this.constantsService.listNames.ProjectContacts.name, this.currPOCObj.ID,
        pocData, this.constantsService.listNames.ProjectContacts.type);
      this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Poc ' + pocDetails.value.fname + ' ' + pocDetails.value.lname +
        ' is updated successfully.', false);
      await this.loadRecentPOCRecords(this.currPOCObj.ID, this.showeditPOC);
    }
  }
  /**
   * Construct a method to create an object of `ProjectContacts`.
   *
   * @description
   *
   * This method is used to create an object of `ProjectContacts`.
   *
   * @return It will return an object of `ProjectContacts`.
   */
  getPOCData(pocDetails) {
    const data: any = {
      FName: pocDetails.value.fname,
      LName: pocDetails.value.lname,
      Designation: pocDetails.value.designation,
      EmailAddress: pocDetails.value.email,
      ReferralSource: pocDetails.value.referralSource,
      Status: this.adminConstants.LOGICAL_FIELD.ACTIVE,
      ProjectContactsType: pocDetails.value.contactsType,
      ClientLegalEntity: this.currClientObj.ClientLegalEntity,
      Title: this.currClientObj.ClientLegalEntity,
      FullNameCC: pocDetails.value.fname + ' ' + pocDetails.value.lname
    };
    data.Phone = pocDetails.value.phone ? pocDetails.value.phone : '';
    const ap1 = pocDetails.value.address1 ? pocDetails.value.address1 : '';
    const ap2 = pocDetails.value.address2 ? pocDetails.value.address2 : '';
    const ap3 = pocDetails.value.address3 ? pocDetails.value.address3 : '';
    const ap4 = pocDetails.value.address4 ? pocDetails.value.address4 : '';
    data.AddressMT = ap1 + ';#' + ap2 + ';#' + ap3 + ';#' + ap4;
    data.DepartmentST = pocDetails.value.department ? pocDetails.value.department : '';
    data.RelationshipStrength = pocDetails.value.relationshipStrength ? pocDetails.value.relationshipStrength : '';
    data.EngagementPlan = pocDetails.value.engagementPlan ? pocDetails.value.engagementPlan : '';
    data.CommentsMT = pocDetails.value.comments ? pocDetails.value.comments : '';
    return data;
  }

  /**
   * Construct a method to load the newly created item into the table without refreshing the whole page.
   * @param item ID the item which is created or updated recently.
   *
   * @param isUpdate Pass the isUpdate as true/false for update and create item respectively.
   *
   * @description
   *
   * This method will load newly created item or updated item as first row in the table;
   *  Pass `false` to add the new created item at position 0 in the array.
   *  Pass `true` to replace the item in the array
   */
  async loadRecentPOCRecords(ID, isUpdate) {
    const pocGet = Object.assign({}, this.adminConstants.QUERY.GET_POC_BY_ID);
    pocGet.filter = pocGet.filter
      .replace(/{{active}}/gi, this.adminConstants.LOGICAL_FIELD.ACTIVE)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity)
      .replace(/{{Id}}/gi, ID);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getProjectContacts');
    const result = await this.spServices.readItems(this.constantsService.listNames.ProjectContacts.name, pocGet);
    if (result && result.length) {
      const item = result[0];
      const obj = Object.assign({}, this.adminObject.pocObj);
      obj.ID = item.ID;
      obj.Title = item.Title ? item.Title : '';
      obj.ClientLegalEntity = item.ClientLegalEntity;
      obj.FName = item.FName;
      obj.LName = item.LName;
      obj.EmailAddress = item.EmailAddress;
      obj.Designation = item.Designation;
      obj.Phone = item.Phone ? item.Phone : '';
      obj.Address = item.AddressMT ? item.AddressMT : '';
      obj.FullName = item.FullNameCC ? item.FullNameCC : '';
      obj.Department = item.DepartmentST ? item.DepartmentST : '';
      obj.ReferralSource = item.ReferralSource;
      obj.Status = item.Status;
      obj.RelationshipStrength = item.RelationshipStrength ? item.RelationshipStrength : '';
      obj.EngagementPlan = item.EngagementPlan ? item.EngagementPlan : '';
      obj.Comments = item.CommentsMT ? item.CommentsMT : '';
      obj.ProjectContactsType = item.ProjectContactsType;
      obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
      obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd ,yyyy');
      obj.LastUpdatedBy = item.Editor.Title;
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      if (isUpdate) {
        const index = this.POCRows.findIndex(x => x.ID === obj.ID);
        this.POCRows.splice(index, 1);
        this.POCRows.unshift(obj);
      } else {
        this.POCRows.unshift(obj);
      }
      this.POCFilters(this.POCRows);
    }
  }


  // **************************************************************************************************
  // POC Details end
  // **************************************************************************************************

  // **************************************************************************************************
  // PO Details start
  // **************************************************************************************************
  /**
    * Construct a method to save or update the po into `PO` list.
    * It will construct a REST-API Call to create item or update item into `PO` list.
    *
    * @description
    *
    * This method is used to validate and save the po into `PO` list.
    *
    * @summary
    * While creating new PO it will create new item into `PO` and `POBudgetBreakup` list.
    * While updating the PO it will update the item in `PO` list and new item will be created in `POBudgetBreakup` list.
    *
    * @Note
    *
    * 1. Duplicate PONumber is not allowed.
    * 2. Only 2 special character are allowed in PoNumber and POName.
    * 3. `POName` and `PoNumber` name cannot start or end with special character.
    * 4. `POExpiryDate` cannot have less than today's date.
    *
    */


  async savePO(poDetails, selectedFile) {
    const tempFiles = [new Object({ name: selectedFile[0].name, file: selectedFile[0] })];
    this.common.SetNewrelic('Admin-ClientMasterData', 'SavePO', 'UploadFile');
    this.common.UploadFilesProgress(tempFiles, this.currClientObj.ListName + '/' + this.adminConstants.FOLDER_LOCATION.PO, true).then(async uploadedfile => {
      if (selectedFile.length > 0 && selectedFile.length === uploadedfile.length) {
        if (!uploadedfile[0].hasOwnProperty('odata.error')) {
          this.modalloaderenable = true;
          this.common.showToastrMessage(this.constantsService.MessageType.success, 'File uploaded sucessfully.', false);
          const poData = await this.getPOData(poDetails, selectedFile[0]);
          if (!this.showeditPO) {
            this.common.SetNewrelic('admin', 'client-masterdata', 'savePO');
            const results = await this.spServices.createItem(this.constantsService.listNames.PO.name,
              poData, this.constantsService.listNames.PO.type);
            if (!results.hasOwnProperty('hasError') && !results.hasError) {
              const poBreakUPData = await this.getPOBudgetBreakUPData(results, poDetails);
              this.common.SetNewrelic('admin', 'admin-clientMaster', 'createPOBudgetreakup');
              const poBreakUPResult = await this.spServices.createItem(this.constantsService.listNames.POBudgetBreakup.name,
                poBreakUPData, this.constantsService.listNames.POBudgetBreakup.type);
              if (!poBreakUPResult.hasOwnProperty('hasError') && !poBreakUPResult.hasError) {
                this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Po ' + poDetails.value.poNumber + ' is created successfully.', false);
              }
              await this.loadRecentPORecords(results.ID, this.adminConstants.ACTION.ADD);
            }
          }
          if (this.showeditPO) {
            this.common.SetNewrelic('admin', 'admin-clientMaster', 'updatePO');
            const results = await this.spServices.updateItem(this.constantsService.listNames.PO.name, this.currPOObj.ID,
              poData, this.constantsService.listNames.PO.type);
            this.common.showToastrMessage(this.constantsService.MessageType.success, 'The Po ' + this.currPOObj.PoNumber + ' is updated successfully.', false);
            await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
          }
        }
        else {
          this.common.showToastrMessage(this.constantsService.MessageType.error, 'Error while uploading file.', false);
        }
      }
    }).catch(error => {
      console.log("Error while uploading" + error)
      this.common.showToastrMessage(this.constantsService.MessageType.error, 'Error while uploading file.', false);

    });
  }

  /**
   * Construct a method to create an object of `PO`.
   *
   * @description
   *
   * This method is used to create an object of `PO`.
   *
   * @return It will return an object of `PO`.
   */
  getPOData(poDetails, selectedFile) {
    const data: any = {
      NameST: poDetails.value.poName,
      POExpiryDate: poDetails.value.poExpiryDate,
      POCLookup: poDetails.value.poc,
      TA: poDetails.value.ta,
      Molecule: poDetails.value.molecule,
      CMLevel2Id: poDetails.value.cmLevel2,
      BuyingEntity: poDetails.value.poBuyingEntity,
      Link: selectedFile.name
    };
    if (!this.showeditPO) {
      data.Currency = poDetails.value.currency;
      data.CreateDate = new Date();
      data.ClientLegalEntity = this.currClientObj.ClientLegalEntity;
      data.Number = poDetails.value.poNumber;
      data.Amount = this.adminObject.po.total;
      data.AmountRevenue = this.adminObject.po.revenue;
      data.AmountOOP = this.adminObject.po.oop;
      data.AmountTax = this.adminObject.po.tax;
      data.Status = this.adminConstants.LOGICAL_FIELD.ACTIVE;
      data.POCategory = 'Client PO';
    }
    return data;
  }


  // **************************************************************************************************
  // PO Details end
  // **************************************************************************************************


  /**
  * Construct a method to execute the `BATCH` request using SharePoint REST-API to add/update the
  * data into `PO` and `POBudgetBreakup` list.
  *
  * @description
  *
  * This method is used to add/update record into `PO` and `POBudgetBreakup` list using REST-API call.
  * It will update the current item in `PO` list and add item into `POBudgetBreakup` list.
  *
  * @Note
  *
  * 1. If `Action='Add'` it will add budget to the existing budget.
  * 2. If `Action='Reduce'` it will subtract budget from the existing budget.
  * 3. If `Action='Restructure'` it will adjust budget from one category to another category with total as zero.
  */
  async confirmBudgetUpdate() {
    this.adminObject.finalBudget.Amount = this.adminObject.oldBudget.Amount + this.adminObject.newBudget.Amount;
    this.adminObject.finalBudget.AmountRevenue = this.adminObject.oldBudget.AmountRevenue + this.adminObject.newBudget.AmountRevenue;
    this.adminObject.finalBudget.AmountOOP = this.adminObject.oldBudget.AmountOOP + this.adminObject.newBudget.AmountOOP;
    this.adminObject.finalBudget.AmountTax = this.adminObject.oldBudget.AmountTax + this.adminObject.newBudget.AmountTax;
    const poData = {
      __metadata: { type: this.constantsService.listNames.PO.type },
      Amount: this.adminObject.finalBudget.Amount,
      AmountRevenue: this.adminObject.finalBudget.AmountRevenue,
      AmountOOP: this.adminObject.finalBudget.AmountOOP,
      AmountTax: this.adminObject.finalBudget.AmountTax,
    };
    const poBudgetBreakupData = {
      __metadata: { type: this.constantsService.listNames.POBudgetBreakup.type },
      POLookup: this.currPOObj.ID,
      Currency: this.currPOObj.Currency,
      CreateDate: new Date(),
      Amount: this.adminObject.newBudget.Amount,
      AmountRevenue: this.adminObject.newBudget.AmountRevenue,
      AmountOOP: this.adminObject.newBudget.AmountOOP,
      AmountTax: this.adminObject.newBudget.AmountTax
    };
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const updatePOData = Object.assign({}, options);
    updatePOData.data = poData;
    updatePOData.listName = this.constantsService.listNames.PO.name;
    updatePOData.type = 'PATCH';
    updatePOData.url = this.spServices.getItemURL(this.constantsService.listNames.PO.name, this.currPOObj.ID);
    batchURL.push(updatePOData);

    const createPOBudgetBreakupObj = Object.assign({}, options);
    createPOBudgetBreakupObj.url = this.spServices.getReadURL(this.constantsService.listNames.POBudgetBreakup.name, null);
    createPOBudgetBreakupObj.data = poBudgetBreakupData;
    createPOBudgetBreakupObj.type = 'POST';
    createPOBudgetBreakupObj.listName = this.constantsService.listNames.POBudgetBreakup.name;
    batchURL.push(createPOBudgetBreakupObj);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getPOPOBudgetBreakup');
    await this.spServices.executeBatch(batchURL);

    this.common.showToastrMessage(this.constantsService.MessageType.success, 'The budget updated sucessfully for ' + this.currPOObj.PoName, true);
    await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
  }


  addEditClentLegalEntity(title, ClientObject) {

    this.showEditClient = ClientObject ? true : false;
    const ref = this.dialogService.open(AddEditClientlegalentityDialogComponent, {
      header: title,
      width: '92vw',
      data: {
        clientObject: ClientObject,
        clientMasterDataRows: this.clientMasterDataRows

      },
      contentStyle: { 'max-height': '82vh', 'overflow-y': 'auto' },
      closable: false,
    });

    ref.onClose.subscribe((clientDetails: any) => {
      if (clientDetails) {
        this.saveClient(clientDetails);
      }
    });
  }

  addEditSubDivision(title, SubDivisionObject) {

    this.showeditSubDivision = SubDivisionObject ? true : false;
    const ref = this.dialogService.open(AddEditSubdivisionComponent, {
      header: title,
      width: '70vw',
      data: {
        SubDivisionObject: SubDivisionObject,
        subDivisionDetailsRows: this.subDivisionDetailsRows,
        currClientObj: this.currClientObj
      },
      contentStyle: { 'overflow-y': 'visible' },
      closable: false,
    });

    ref.onClose.subscribe((subDivisionDetails: any) => {
      if (subDivisionDetails) {
        this.saveSubdivision(subDivisionDetails);
      }
    });
  }

  addEditPOC(title, pocObject) {
    this.showeditPOC = pocObject ? true : false;
    const ref = this.dialogService.open(AddEditPocComponent, {
      header: title,
      width: '92vw',
      data: {
        PocObject: pocObject,
        PocRows: this.POCRows,
        currClientObj: this.currClientObj
      },
      contentStyle: { 'max-height': '75vh', 'overflow-y': 'auto' },
      closable: false,
    });

    ref.onClose.subscribe((pocDetails: any) => {
      if (pocDetails) {
        this.savePOC(pocDetails);
      }
    });
  }

  addEditPO(title, POObject) {

    this.showeditPO = POObject ? true : false;
    const ref = this.dialogService.open(AddEditPoDialogComponent, {
      header: title,
      width: '70vw',
      data: {
        poObject: POObject,
        poRows: this.PORows,
        currClientObj: this.currClientObj

      },
      contentStyle: { 'overflow-y': 'visible' },
      closable: false,
    });

    ref.onClose.subscribe((poDetails: any) => {
      if (poDetails) {

        this.savePO(poDetails.poDetails, poDetails.selectedFile);
      }
    });
  }

  changeBudgetDialog(POObject) {
    const ref = this.dialogService.open(ChangeBudgetDialogComponent, {
      header: 'Change Budget',
      width: '70vw',
      data: {
        poObject: POObject,
        // poRows: this.PORows,
        // currClientObj: this.currClientObj
      },
      contentStyle: { 'overflow-y': 'visible', 'background-color': '#f4f3ef' },
      closable: false,
    });

    ref.onClose.subscribe((budgetDetails: any) => {
      if (budgetDetails) {
        this.modalloaderenable = true;
        this.confirmBudgetUpdate();
      }
    });
  }
}
