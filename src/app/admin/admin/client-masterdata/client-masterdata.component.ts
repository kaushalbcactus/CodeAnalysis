import { Component, OnInit, ApplicationRef, NgZone, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm, ControlContainer } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
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
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param frmbuilder This is instance referance of `FormBuilder` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param confirmationService This is instance referance of `ConfirmationService` component.
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
    private messageService: MessageService,
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private confirmationService: ConfirmationService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private globalObject: GlobalService,
    private common: CommonService,
    private cdr: ChangeDetectorRef,
    public dialogService: DialogService
  ) {

    this.initAddPOForm();
    this.initAddBudgetForm();

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });

    if (this.adminConstants.toastMsg.SPMAA || this.adminConstants.toastMsg.SPMAD || this.adminConstants.toastMsg.EAPA) {
      // this.messageService.clear();
      setTimeout(() => {
        this.messageService.add({
          key: 'adminAuth1', severity: 'info', sticky: true,
          summary: 'Info Message', detail: 'You don\'\t have permission,please contact SP Team.'
        });
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
  selectedValue: any;
  buttonLabel;
  checkBudgetValue = false;
  currClientObj: any;
  currSubDivisionObj: any;
  currPOCObj: any;
  currPOObj: any;
  selectedFile: any;
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
  showaddBudget = false;
  editPo = false;
  budgetType = [
    { label: this.adminConstants.ACTION.ADD, value: this.adminConstants.ACTION.ADD },
    { label: this.adminConstants.ACTION.REDUCE, value: this.adminConstants.ACTION.REDUCE },
    { label: this.adminConstants.ACTION.RESTRUCTURE, value: this.adminConstants.ACTION.RESTRUCTURE }
  ];
  cmObject = {
    isClientFormSubmit: false,
    isBudgetFormSubmit: false,
    isPOFormSubmit: false,
  };

  PoForm: FormGroup;
  changeBudgetForm: FormGroup;


  @ViewChild('cmd', { static: false }) clientMasterTable: Table;

  cleNameInputPattern = /[^a-zA-Z0-9\s_-]*/g;


  isOptionFilter: boolean;
  /**
   * This is used to initialize the PO form.
   */
  initAddPOForm() {
    this.PoForm = this.frmbuilder.group({
      poNumber: ['', [Validators.required, Validators.pattern(this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL_NUMERIC)]],
      poName: ['', [Validators.required]],
      currency: ['', Validators.required],
      poExpiryDate: ['', Validators.required],
      poc: ['', Validators.required],
      poFile: ['', Validators.required],
      ta: ['', Validators.required],
      molecule: ['', Validators.required],
      cmLevel2: ['', Validators.required],
      poBuyingEntity: ['', Validators.required],
      total: [0, [Validators.required, this.adminCommonService.lessThanZero]],
      revenue: [0, [Validators.required, this.adminCommonService.checkPositiveNumber]],
      oop: [0, [Validators.required, this.adminCommonService.checkPositiveNumber]],
      tax: [0, [Validators.required, this.adminCommonService.checkPositiveNumber]],
    });
  }
  /**
   * This is used to initialize the Budget form.
   */
  initAddBudgetForm() {
    this.changeBudgetForm = this.frmbuilder.group({
      total: [0, Validators.required],
      revenue: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
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
   * Construct a method to separate the user based on thier roles.
   *
   * @description
   *
   * This method is used seperate the resource categorization user based on thier roles.
   * It will load the respective dropdown based on role.
   *
   * @param array Pass the resource Categorization array results.
   */
  separateResourceCat(array) {
    this.adminObject.dropdown.CMLevel1Array = [];
    this.adminObject.dropdown.CMLevel2Array = [];
    this.adminObject.dropdown.DeliveryLevel1Array = [];
    this.adminObject.dropdown.DeliveryLevel2Array = [];
    array.forEach(element => {
      const role = element.Role;
      switch (role) {
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.CMLevel1:
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.CMLevel2:
          this.adminObject.dropdown.CMLevel1Array.push({ label: element.UserNamePG.Title, value: element.UserNamePG.ID });
          break;
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_1:
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_2:
          this.adminObject.dropdown.DeliveryLevel1Array.push({ label: element.UserNamePG.Title, value: element.UserNamePG.ID });
          break;
      }
      switch (role) {
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.CMLevel2:
          this.adminObject.dropdown.CMLevel2Array.push({ label: element.UserNamePG.Title, value: element.UserNamePG.ID });
          break;
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_2:
          this.adminObject.dropdown.DeliveryLevel2Array.push({ label: element.UserNamePG.Title, value: element.UserNamePG.ID });
          break;
      }
    });
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
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(this.currClientObj, updateData, this.constantsService.listNames.ClientLegalEntity.name,
          this.constantsService.listNames.ClientLegalEntity.type, this.adminConstants.DELETE_LIST_ITEM.CLIENT_LEGAL_ENTITY);
      },
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
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The client legal entity ' + data.ClientLegalEntity + ' has deleted successfully.'
        });
        const clientIndex = this.clientMasterDataRows.findIndex(x => x.ID === data.ID);
        this.clientMasterDataRows.splice(clientIndex, 1);
        this.colFilters(this.clientMasterDataRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.SUB_DIVISION:
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The sub division ' + data.SubDivision + ' has deleted successfully.'
        });
        const subDivisionindex = this.subDivisionDetailsRows.findIndex(x => x.ID === data.ID);
        this.subDivisionDetailsRows.splice(subDivisionindex, 1);
        this.subDivisionFilters(this.subDivisionDetailsRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.POINT_OF_CONTACT:
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The point of contact ' + data.FullNameCC + ' has deleted successfully.'
        });
        const pocindex = this.POCRows.findIndex(x => x.ID === data.ID);
        this.POCRows.splice(pocindex, 1);
        this.POCFilters(this.POCRows);
        break;
      case this.adminConstants.DELETE_LIST_ITEM.PURCHASE_ORDER:
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'The po ' + data.PoNumber + ' has deleted successfully.'
        });
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
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(this.currSubDivisionObj, updateData, this.constantsService.listNames.ClientSubdivision.name,
          this.constantsService.listNames.ClientSubdivision.type, this.adminConstants.DELETE_LIST_ITEM.SUB_DIVISION);
      },
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
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          Status: this.adminConstants.LOGICAL_FIELD.INACTIVE
        };
        this.confirmUpdate(this.currPOCObj, updateData, this.constantsService.listNames.ProjectContacts.name,
          this.constantsService.listNames.ProjectContacts.type, this.adminConstants.DELETE_LIST_ITEM.POINT_OF_CONTACT);
      },
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
  /**
   * Construct a method show the form to add new Purchase Order.
   *
   * @description
   *
   * This method is used to show the form to add new Purchase Order.
   *
   */
  async showAddPO() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.editPo = true;
    this.PoForm.controls.poNumber.enable();
    this.PoForm.controls.currency.enable();
    this.PoForm.controls.total.disable();
    this.PoForm.controls.oop.enable();
    this.PoForm.controls.revenue.enable();
    this.PoForm.controls.tax.enable();
    this.buttonLabel = 'Submit';
    await this.loadPODropdown();
    this.showaddPO = true;
    this.showeditPO = false;
    this.initAddPOForm();
    this.cmObject.isPOFormSubmit = false;
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
  /**
   * Construct a method to load all the dropdown of purchase order form.
   * @description
   *
   * This method will load the purchase order form dropdown as per following sequences.
   *  1. POC                   - Get data for `Point of Contact` form `ProjectContact` list.
   *  2. TA                    - Get data for `TA` from `TA` list.
   *  3. Molecule              - Get data for `Molecule` from `Molecule` list.
   *  4. PO Buying Entity      - Get choice field data for `BuyingEntity` from `PO` list.
   *  5. CM Level 2            - Get data for `CM Level 2` from `ResourceCategorization` list based on filter `Role='CM Level 2'`.
   *  6. Currency              - Get data for `Currency` from `Currency` list.
   * @Note
   * 1. If `dropdown.CurrencyArray` & `dropdown.CMLevel2Array` is not null then it will not query the `Currency` and
   * `ResourceCategorization` list.
   *
   * 2. If `dropdown.CurrencyArray`,`dropdown.CMLevel2Array`,`dropdown.POTAArray`,`dropdown.POMoleculeArray`,
   * `dropdown.POPointOfContactArray` & `dropdown.POMoleculeArray` is null then it will make a REST call to
   * respective list and iterate the result to load the respective dropdown.
   */
  async loadPODropdown() {
    const sResults = await this.getPODropdownRecords();
    if (sResults && sResults.length) {
      const pocArray = sResults[0].retItems;
      const taArray = sResults[1].retItems;
      const moleculeArray = sResults[2].retItems;
      const poBuyingEntityArray = sResults[3].retItems;
      if (pocArray && pocArray.length) {
        this.adminObject.dropdown.POPointOfContactArray = [];
        pocArray.forEach(element => {
          this.adminObject.dropdown.POPointOfContactArray.push({ label: element.FullNameCC, value: element.ID });
        });
      }
      if (taArray && taArray.length) {
        this.adminObject.dropdown.POTAArray = [];
        taArray.forEach(element => {
          this.adminObject.dropdown.POTAArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (moleculeArray && moleculeArray.length) {
        this.adminObject.dropdown.POMoleculeArray = [];
        moleculeArray.forEach(element => {
          this.adminObject.dropdown.POMoleculeArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (poBuyingEntityArray && poBuyingEntityArray.length) {
        const tempArray = poBuyingEntityArray[0].Choices.results;
        this.adminObject.dropdown.POBuyingEntityArray = [];
        tempArray.forEach(element => {
          this.adminObject.dropdown.POBuyingEntityArray.push({ label: element, value: element });
        });
      }
      if (!this.adminObject.dropdown.CMLevel2Array.length) {
        const cmLevelArray = sResults[4].retItems;
        this.separateResourceCat(cmLevelArray);
      }
      if (!this.adminObject.dropdown.CurrencyArray.length) {
        const currencyArray = sResults[5].retItems;
        this.adminObject.dropdown.CurrencyArray = [];
        currencyArray.forEach(element => {
          this.adminObject.dropdown.CurrencyArray.push({ label: element.Title, value: element.Title });
        });
      }
    }
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   * @description
   *
   * 1. POC                   - Get data for `Point of Contact` form `ProjectContact` list.
   * 2. TA                    - Get data for `TA` from `TA` list.
   * 3. Molecule              - Get data for `Molecule` from `Molecule` list.
   * 4. PO Buying Entity      - Get choice field data for `BuyingEntity` from `PO` list.
   * 5. CM Level 2            - Get data for `CM Level 2` from `ResourceCategorization` list based on filter `Role='CM Level 2'`.
   * 6. Currency              - Get data for `Currency` from `Currency` list.
   *
   * @Note
   * 1. If data alreay present in `dropdown.CurrencyArray` & `dropdown.CMLevel2Array` then it will not query the `Currency` and
   * `ResourceCategorization` list again for getting records.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getPODropdownRecords() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get POC from ProjectContacts list ##1
    const pocGet = Object.assign({}, options);
    const pocFilter = Object.assign({}, this.adminConstants.QUERY.GET_POC_ORDER_BY_Title);
    pocFilter.filter = pocFilter.filter
      .replace(/{{active}}/gi, this.adminConstants.LOGICAL_FIELD.ACTIVE)
      .replace(/{{clientLegalEntity}}/gi, this.currClientObj.ClientLegalEntity);
    pocGet.url = this.spServices.getReadURL(this.constantsService.listNames.ProjectContacts.name,
      pocFilter);
    pocGet.type = 'GET';
    pocGet.listName = this.constantsService.listNames.ProjectContacts.name;
    batchURL.push(pocGet);

    // Get TA from TA list ##2
    const taGet = Object.assign({}, options);
    const taFilter = Object.assign({}, this.adminConstants.QUERY.GET_TA);
    taFilter.filter = taFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    taGet.url = this.spServices.getReadURL(this.constantsService.listNames.TA.name,
      taFilter);
    taGet.type = 'GET';
    taGet.listName = this.constantsService.listNames.TA.name;
    batchURL.push(taGet);

    // Get Molecule from Molecule list ##3
    const moleculeGet = Object.assign({}, options);
    const moleculeFilter = Object.assign({}, this.adminConstants.QUERY.GET_MOLECULES_ORDER_BY_TITLE);
    moleculeFilter.filter = moleculeFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    moleculeGet.url = this.spServices.getReadURL(this.constantsService.listNames.Molecules.name,
      moleculeFilter);
    moleculeGet.type = 'GET';
    moleculeGet.listName = this.constantsService.listNames.Molecules.name;
    batchURL.push(moleculeGet);

    // Get PO Buying Entity from PO list ##4
    const poBuyingEntityGet = Object.assign({}, options);
    const poBuyingEntityFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    poBuyingEntityFilter.filter = poBuyingEntityFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.PO_BUYING_ENTITY);
    poBuyingEntityGet.url = this.spServices.getChoiceFieldUrl(this.constantsService.listNames.PO.name,
      poBuyingEntityFilter);
    poBuyingEntityGet.type = 'GET';
    poBuyingEntityGet.listName = this.constantsService.listNames.PO.name;
    batchURL.push(poBuyingEntityGet);
    if (!this.adminObject.dropdown.CMLevel2Array.length) {
      // Get resource from ResourceCategorization list ##5;
      const resourceGet = Object.assign({}, options);
      const resourceFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
      resourceFilter.filter = resourceFilter.filter.replace(/{{isActive}}/gi,
        this.adminConstants.LOGICAL_FIELD.YES);
      resourceGet.url = this.spServices.getReadURL(this.constantsService.listNames.ResourceCategorization.name,
        resourceFilter);
      resourceGet.type = 'GET';
      resourceGet.listName = this.constantsService.listNames.ResourceCategorization.name;
      batchURL.push(resourceGet);
    }
    if (!this.adminObject.dropdown.CurrencyArray.length) {
      // Get currency from Currency list ##6;
      const currencyGet = Object.assign({}, options);
      const currencyFilter = Object.assign({}, this.adminConstants.QUERY.GET_CURRENCY_BY_ACTIVE);
      currencyFilter.filter = currencyFilter.filter.replace(/{{isActive}}/gi,
        this.adminConstants.LOGICAL_FIELD.YES);
      currencyGet.url = this.spServices.getReadURL(this.constantsService.listNames.Currency.name,
        currencyFilter);
      currencyGet.type = 'GET';
      currencyGet.listName = this.constantsService.listNames.Currency.name;
      batchURL.push(currencyGet);
    }
    if (batchURL.length) {
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'getProjectContactsTAMoleculeListNameRCCurrencyPO');
      const result = await this.spServices.executeBatch(batchURL);
      return result;
    } else {
      return null;
    }
  }
  /**
   * Construct a method to trigger whenever we change the file for file upload.
   *
   * @description
   *
   * This method will trigger whenever we change the file for file upload and save the file into
   * `selectedFile` variable.
   */
  onFileChange(event) {
    this.selectedFile = null;
    this.fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }
  /**
   * Construct a method to trigger when revenue, oop or tax field changes to calculate the total amount for PO.
   *
   * @description
   *
   * This method is called when revenu,oop or tax field changes to calculate the total amount for po.
   * Once the total amount is calculated it will set the total amount to form field.
   *
   */
  setPOTotal() {
    this.adminObject.po.revenue = 0;
    this.adminObject.po.oop = 0;
    this.adminObject.po.tax = 0;
    this.adminObject.po.total = 0;
    if (!this.showaddBudget) {
      this.adminObject.po.revenue = +(this.PoForm.value.revenue).toFixed(2);
      this.adminObject.po.oop = this.PoForm.value.oop ? +(this.PoForm.value.oop).toFixed(2) : 0;
      this.adminObject.po.tax = this.PoForm.value.tax ? +(this.PoForm.value.tax).toFixed(2) : 0;
      this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
      this.PoForm.get('total').setValue(this.adminObject.po.total);
    }
    if (this.showaddBudget) {
      this.adminObject.po.revenue = +(this.changeBudgetForm.value.revenue).toFixed(2);
      this.adminObject.po.oop = this.changeBudgetForm.value.oop ? +(this.changeBudgetForm.value.oop).toFixed(2) : 0;
      this.adminObject.po.tax = this.changeBudgetForm.value.tax ? +(this.changeBudgetForm.value.tax).toFixed(2) : 0;
      this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
      this.changeBudgetForm.get('total').setValue(this.adminObject.po.total);
    }
  }
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
  async savePO() {
    if (this.PoForm.valid) {
      console.log(this.PoForm.value);
      if (!this.showeditPO) {
        if (this.PORows.some(a =>
          a.PoNumber.toLowerCase() === this.PoForm.value.poNumber.toLowerCase())) {
          this.messageService.add({
            key: 'adminCustom', severity: 'error',
            summary: 'Error Message', detail: 'This PO number is already exist. Please enter another PO number.'
          });
          return false;
        }
      }
      this.constantsService.loader.isPSInnerLoaderHidden = false;
      const docFolder = this.adminConstants.FOLDER_LOCATION.PO;
      const libraryName = this.currClientObj.ListName;
      const folderPath: string = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + libraryName + '/' + docFolder;
      this.filePathUrl = await this.spServices.getFileUploadUrl(folderPath, this.selectedFile.name, true);
      this.common.SetNewrelic('Admin-ClientMasterData', 'SavePO', 'UploadFile');
      const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
      console.log(res);
      if (this.selectedFile && !res.hasOwnProperty('hasError')) {
        // write the logic of create new PO.
        const poData = await this.getPOData();
        if (!this.showeditPO) {
          this.common.SetNewrelic('admin', 'client-masterdata', 'savePO');
          const results = await this.spServices.createItem(this.constantsService.listNames.PO.name,
            poData, this.constantsService.listNames.PO.type);
          if (!results.hasOwnProperty('hasError') && !results.hasError) {
            const poBreakUPData = await this.getPOBudgetBreakUPData(results);
            this.common.SetNewrelic('admin', 'admin-clientMaster', 'createPOBudgetreakup');
            const poBreakUPResult = await this.spServices.createItem(this.constantsService.listNames.POBudgetBreakup.name,
              poBreakUPData, this.constantsService.listNames.POBudgetBreakup.type);
            if (!poBreakUPResult.hasOwnProperty('hasError') && !poBreakUPResult.hasError) {
              this.messageService.add({
                key: 'adminCustom', severity: 'success', summary: 'Success Message',
                detail: 'The Po ' + this.PoForm.value.poNumber + ' is created successfully.'
              });
            }
            await this.loadRecentPORecords(results.ID, this.adminConstants.ACTION.ADD);
          }
        }
        if (this.showeditPO) {
          this.common.SetNewrelic('admin', 'admin-clientMaster', 'updatePO');
          const results = await this.spServices.updateItem(this.constantsService.listNames.PO.name, this.currPOObj.ID,
            poData, this.constantsService.listNames.PO.type);
          this.messageService.add({
            key: 'adminCustom', severity: 'success',
            summary: 'Success Message', detail: 'The Po ' + this.currPOObj.PoNumber + ' is updated successfully.'
          });
          await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
        }
        this.showaddPO = false;
        this.constantsService.loader.isPSInnerLoaderHidden = true;
      }
    } else {
      this.cmObject.isPOFormSubmit = true;
    }
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
  getPOData() {
    const data: any = {
      NameST: this.PoForm.value.poName,
      POExpiryDate: this.PoForm.value.poExpiryDate,
      POCLookup: this.PoForm.value.poc,
      TA: this.PoForm.value.ta,
      Molecule: this.PoForm.value.molecule,
      CMLevel2Id: this.PoForm.value.cmLevel2,
      BuyingEntity: this.PoForm.value.poBuyingEntity,
      Link: this.selectedFile.name
    };
    if (!this.showeditPO) {
      data.Currency = this.PoForm.value.currency;
      data.CreateDate = new Date();
      data.ClientLegalEntity = this.currClientObj.ClientLegalEntity;
      data.Number = this.PoForm.value.poNumber;
      data.Amount = this.adminObject.po.total;
      data.AmountRevenue = this.adminObject.po.revenue;
      data.AmountOOP = this.adminObject.po.oop;
      data.AmountTax = this.adminObject.po.tax;
      data.Status = this.adminConstants.LOGICAL_FIELD.ACTIVE;
      data.POCategory = 'Client PO';
    }
    return data;
  }
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
  getPOBudgetBreakUPData(poResult) {
    const data: any = {
      POLookup: poResult.ID,
      Currency: this.showeditPO ? this.currPOObj.Currency : this.PoForm.value.currency,
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
        { label: 'Change Budget', command: (e) => this.showchangeBudgetModal() },
        { label: 'Edit', command: (e) => this.showEditPOModal() },
        { label: 'Delete', command: (e) => this.deletePO() }
      ];
    } else {
      this.poItems = [
        { label: 'Edit', command: (e) => this.showEditPOModal() },
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
  }
  /**
   * Construct a method to show the edit form to edit the po.
   *
   * @description
   *
   * This method is used to popup the predefined filled form to edit the po.
   * If value is present in the dropdown array then it will simply load the dropdown.
   * If value is not present in the dropdown array then it will make REST call to get the data.
   *
   * @Note
   *
   * 1. PO Number field is disabled.
   * 2. Currency field is disabled.
   * 3. Total field is disabled.
   * 4. OOP field is disabled.
   * 5. Revenue field is disabled.
   * 6. Tax field is disabled.
   *
   */
  async showEditPOModal() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.cmObject.isPOFormSubmit = false;
    this.editPo = false;
    this.buttonLabel = 'Update';
    await this.loadPODropdown();
    this.PoForm.controls.poNumber.disable();
    this.PoForm.controls.currency.disable();
    this.PoForm.controls.total.disable();
    this.PoForm.controls.oop.disable();
    this.PoForm.controls.revenue.disable();
    this.PoForm.controls.tax.disable();
    this.PoForm.patchValue({
      poNumber: this.currPOObj.PoNumber,
      poName: this.currPOObj.PoName,
      currency: this.currPOObj.Currency,
      poExpiryDate: this.currPOObj.POExpiryDate,
      poc: this.currPOObj.POCLookup,
      total: this.currPOObj.Amount,
      revenue: this.currPOObj.AmountRevenue,
      oop: this.currPOObj.AmountOOP,
      tax: this.currPOObj.AmountTax,
      // poFile: this.globalObject.sharePointPageObject.webRelativeUrl + '/' + this.currClientObj.ClientLegalEntity +
      //   '/' + this.adminConstants.FOLDER_LOCATION.PO + '/' + this.currPOObj.Link,
      ta: this.currPOObj.TA,
      molecule: this.currPOObj.Molecule,
      cmLevel2: this.currPOObj.CMLevel2.ID,
      poBuyingEntity: this.currPOObj.BuyingEntity
    });
    this.showeditPO = true;
    this.showaddPO = true;
    this.constantsService.loader.isPSInnerLoaderHidden = true;
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
  deletePO() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          Status: this.adminConstants.LOGICAL_FIELD.INACTIVE
        };
        this.confirmUpdate(this.currPOObj, updateData, this.constantsService.listNames.PO.name,
          this.constantsService.listNames.PO.type, this.adminConstants.DELETE_LIST_ITEM.PURCHASE_ORDER);
      },
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
  async viewPO() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.PORightRows = [this.currPOObj];
    this.adminObject.po.isRightVisible = true;
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
  /**
   * Construct a function to open the form to add, subtract and restructure the amount.
   *
   * @description
   *
   * This method is used to open the form to perform an action like add, subtract and restructure the amount.
   *
   */
  showchangeBudgetModal() {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    this.selectedValue = [];
    this.checkBudgetValue = false;
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.oldBudget.LastUpdated = this.currPOObj.LastUpdated;
    this.changeBudgetForm.controls.total.disable();
    this.initAddBudgetForm();
    this.showaddBudget = true;
    this.cmObject.isBudgetFormSubmit = false;
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
  /**
   * Construct a method to save the budget in `PO` and `POBudgetBreakup` list.
   *
   * @description
   *
   * This method is used to save the data based on action in `PO` and `POBudgetBreakup` list.
   *
   * @Note
   *
   * 1. User should select the action need to perform.
   * 2. If `Action='Add'` it will add budget to the existing budget.
   * 3. If `Action='Reduce'` it will subtract budget from the existing budget.
   * 4. If `Action='Restructure'` it will adjust budget from one category to another category with total as zero.
   */
  async saveBudget() {
    if (!this.selectedValue.length) {
      this.checkBudgetValue = true;
    } else {
      this.checkBudgetValue = false;
    }
    if (this.selectedValue.length) {
      if (this.changeBudgetForm.valid) {
        this.constantsService.loader.isPSInnerLoaderHidden = false;
        switch (this.selectedValue) {
          case this.adminConstants.ACTION.ADD:
            await this.addBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
          case this.adminConstants.ACTION.REDUCE:
            await this.reduceBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
          case this.adminConstants.ACTION.RESTRUCTURE:
            await this.restructureBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
        }

      } else {
        this.cmObject.isBudgetFormSubmit = true;
      }
    }
  }
  /**
   * Construct a method to add budget to existing budget.
   *
   * @description
   *
   * This method is used to add the budget to existing budget.
   * It will make one entry in `PO`list and another one in `POBudgetBreakup` list.
   *
   *  @Note
   *
   * 1. Revenue should be positive number.
   * 2. OOP should be positive number.
   * 3. Tax should be positive number.
   * 4. Total should not be less than zero.
   *
   * @example
   *
   * It will add Amount to Amount, AmountRevenue to AmountRevenue, AmountOOP to AmountOOP and AmountTax
   *  to AmountTax column in `PO` and `POBudgetBreakup` list.
   * Total = AmountRevenue + AmountOOP + AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async addBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (this.adminObject.newBudget.AmountRevenue < 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Revenue should be Positive Number'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP < 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'OOP should be Positive Number'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountTax < 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Tax should be Positive Number'
      });
      return false;
    }
    if (this.adminObject.newBudget.Amount < 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Total should be Positive Number'
      });
      return false;
    }
    await this.confirmBudgetUpdate();
    this.showaddBudget = false;
    await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
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
  }
  /**
   * Construct a method to subtract the budget from existing budget.
   *
   * @description
   *
   * This method is used to subtract the budget from existing budget.
   * It will make update the item in `PO`list and create one item in `POBudgetBreakup` list with `-` sign.
   *
   * @Note
   *
   * 1. Revenue amount should be negative number.
   * 2. OOP amount should be negative number.
   * 3. Tax amount should be negative number.
   * 4. Total should be in negative number.
   * 5. Total Amount must be less than or equal to existing Total.
   * 6. Revenue must be less than or equal to existing Revenue
   * 7. OOP must be less than or equal to existing OOP Value.
   * 8. Tax Amount must be less than or equal to existing Tax
   *
   * @example
   *
   * Let say existing revenue is $100 so user cannot subtract -101 from revenu budget which is same for
   * Total, OOP and Tax.
   *
   * Total = AmountRevenue - AmountOOP - AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async reduceBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (this.adminObject.newBudget.AmountRevenue > 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Revenue amount should be negative number'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP > 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'OOP amount should be negative number'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountTax > 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Tax amount should be negative number'
      });
      return false;
    }
    if (this.adminObject.newBudget.Amount > 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Total should be negative number'
      });
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.Amount) > this.adminObject.oldBudget.Amount) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Total Amount must be less than or equal to existing Total'
      });
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountRevenue) > this.adminObject.oldBudget.AmountRevenue) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Revenue must be less than or equal to existing Revenue'
      });
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountOOP) > this.adminObject.oldBudget.AmountOOP) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'OOP must be less than or equal to existing OOP Value'
      });
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountTax) > this.adminObject.oldBudget.AmountTax) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Tax Amount must be less than or equal to existing Tax'
      });
      return false;
    }
    await this.confirmBudgetUpdate();
    this.showaddBudget = false;
    await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }
  /**
   * Construct a method to add budget from one category to another category without affecting the total budget.
   *
   * @description
   *
   * This method is used to transfer the amount form one category to another category without changing the total amount.
   * It will make update the item in `PO`list and create one item in `POBudgetBreakup` list with
   * one of the column with positive amount and another with negative amount.
   *
   * @Note
   *
   * 1. Total amount should be zero.
   * 2. Total Amount must be less than or equal to existing Total.
   * 3. Revenue must be less than or equal to existing Revenue
   * 4. OOP must be less than or equal to existing OOP Value.
   * 5. Tax Amount must be less than or equal to existing Tax
   *
   * @example
   *
   * Possible transfer bugdget case is
   *
   * 1. Revenue to OOP.
   * 2. Revenue to Tax.
   * 3. OOP to Revenue.
   * 4. OOP to Tax.
   * 5. Tax to Revenue.
   * 6. Tax to OOP.
   *
   * Case1:
   *
   * Let assume, I want to transfer $50 from existing $100 from revenue to OOP.
   * Then,
   * Revenue will have -50 and
   * OOP will have +50
   * Here I cannot add more than $100 because existing revenue is only $100.
   * Above example is applies to each category if they want to tranfer the amount.
   *
   * Total = +-AmountRevenue +- AmountOOP +- AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async restructureBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (Math.abs(this.adminObject.newBudget.Amount) > this.adminObject.oldBudget.Amount) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Total Amount must be less than or equal to existing Total'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountRevenue < 0 && Math.abs(this.adminObject.newBudget.AmountRevenue) > this.adminObject.oldBudget.AmountRevenue) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Revenue must be less than or equal to existing Revenue'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP < 0 && Math.abs(this.adminObject.newBudget.AmountOOP) > this.adminObject.oldBudget.AmountOOP) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'OOP must be less than or equal to existing OOP Value'
      });
      return false;
    }
    if (this.adminObject.newBudget.AmountTax < 0 && Math.abs(this.adminObject.newBudget.AmountTax) > this.adminObject.oldBudget.AmountTax) {
      this.messageService.add({
        key: 'adminCustom',
        severity: 'error', summary: 'Error Message',
        detail: 'Tax Amount must be less than or equal to existing Tax'
      });
      return false;
    }
    if (this.adminObject.newBudget.Amount !== 0) {
      this.messageService.add({ key: 'adminCustom', severity: 'error', summary: 'Error Message', detail: 'Total Should be Zero' });
      return false;
    }
    await this.confirmBudgetUpdate();
    this.showaddBudget = false;
    await this.loadRecentPORecords(this.currPOObj.ID, this.adminConstants.ACTION.EDIT);
    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }

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
        this.messageService.add({
          key: 'adminCustom', severity: 'success',
          summary: 'Success Message', detail: 'The Client ' + clientDetails.value.name + ' is created successfully.'
        });

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
      this.messageService.add({
        key: 'adminCustom', severity: 'success',
        summary: 'Success Message', detail: 'The Client ' + this.currClientObj.ClientLegalEntity + ' is updated successfully.'
      });

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

    const ref = this.dialogService.open(AddEditSubdivisionComponent, {
      header: title,
      width: '92vw',
      data: {
        SubDivisionObject: SubDivisionObject,
        subDivisionDetailsRows: this.subDivisionDetailsRows,
        currClientObj: this.currClientObj
      },
      contentStyle: { 'max-height': '82vh', 'overflow-y': 'auto' },
      closable: false,
    });

    ref.onClose.subscribe((clientDetails: any) => {
      // if (clientDetails) {
      //   this.saveClient(clientDetails);
      // }
    });
  }

  addEditPOC(title, pocObject) {

    const ref = this.dialogService.open(AddEditPocComponent, {
      header: title,
      width: '92vw',
      data: {
        PocObject: pocObject,
        PocRows: this.POCRows,
        currClientObj: this.currClientObj
      },
      contentStyle: { 'max-height': '82vh', 'overflow-y': 'auto' },
      closable: false,
    });

    ref.onClose.subscribe((clientDetails: any) => {
      // if (clientDetails) {
      //   this.saveClient(clientDetails);
      // }
    });
  }
}
