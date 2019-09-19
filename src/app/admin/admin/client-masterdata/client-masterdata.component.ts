import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm, ControlContainer } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AdminCommonService } from '../../services/admin-common.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { AdminObjectService } from '../../services/admin-object.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';

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
  items = [];
  items1 = [];
  poValue;
  selectedValue: any;
  buttonLabel;
  checkBudgetValue = false;

  showaddClientModal = false;
  showEditClient = false;
  showSubDivisionDetails = false;
  showaddSubDivision = false;
  showeditSubDivision = false;

  showPointofContact = false;
  showaddPOC = false;
  showeditPOC = false;

  showPurchaseOrder = false;
  showaddPO = false;
  showeditPO = false;
  showaddBudget = false;
  editPo = false;

  budgetType = [
    { label: 'Add', value: 'Add' },
    { label: 'Reduce', value: 'Reduce' },
    { label: 'Restructure', value: 'Restructure' }
  ];
  options = [
    { label: 'option1', value: 'option1' },
    { label: 'option2', value: 'option2' },
    { label: 'option3', value: 'option3' }
  ];
  cmObject = {
    isClientFormSubmit: false,
    isSubDivisionFormSubmit: false,
    isPOCFormSubmit: false,
    isBudgetFormSubmit: false,
    isPOFormSubmit: false,
  };
  addClient: FormGroup;
  subDivisionform: FormGroup;
  pocForm: FormGroup;
  PoForm: FormGroup;
  changeBudgetForm: FormGroup;

  clientMasterDataColArray = {
    ClientLegalEntity: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };

  auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  auditHistorySelectedArray = {
    ClientLegalEntry: [],
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  subDivisionDetailsColArray = {
    SubDivision: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  POCColArray = {
    POC: [],
    fName: [],
    lName: [],
    email: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  POColArray = {
    PoName: [],
    PoNo: [],
    Revenue: [],
    Oop: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  resultResponse = {
    ClientGroupArray: [],
    MarketArray: [],
    TimeZonesArray: [],
    BillingEntityArray: [],
    ResourceCatArray: [],
    CurrencyArray: [],
    BucketArray: [],
    ClientLegalEntityArray: []
  };
  dropdown = {
    ClientGroupArray: [],
    MarketArray: [],
    TimeZonesArray: [],
    BillingEntityArray: [],
    CMLevel1Array: [],
    CMLevel2Array: [],
    DeliveryLevel1Array: [],
    DeliveryLevel2Array: [],
    CurrencyArray: [],
    BucketArray: [],
    PORequiredArray: []
  };
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
   */
  constructor(
    private datepipe: DatePipe,
    private frmbuilder: FormBuilder,
    private messageService: MessageService,
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    private adminObject: AdminObjectService,
    private constants: ConstantsService,
    private spServices: SPOperationService
  ) {
    /**
     * This is used to initialize the Client form.
     */
    this.addClient = frmbuilder.group({
      name: ['', [Validators.required, Validators.pattern(this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL)]],
      acronym: ['', [Validators.required, Validators.maxLength(5), Validators.pattern(this.adminConstants.REG_EXPRESSION.APLHA_NUMERIC)]],
      group: ['', Validators.required],
      distributionList: [''],
      invoiceName: ['', Validators.required],
      realization: ['', [Validators.required, this.adminCommonService.checkPositiveNumber]],
      market: ['', Validators.required],
      billingEntry: ['', Validators.required],
      poRequired: ['', Validators.required],
      timeZone: ['', Validators.required],
      cmLevel1: ['', Validators.required],
      cmLevel2: ['', Validators.required],
      deliveryLevel1: [''],
      deliveryLevel2: ['', Validators.required],
      currency: ['', Validators.required],
      APEmail: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      address4: [''],
      notes: [''],
      bucket: ['', Validators.required]
    });
    /**
     * This is used to initialize the subDivision form.
     */
    this.subDivisionform = frmbuilder.group({
      subDivision_Name: ['', Validators.required],
      distributionList: [''],
      cmLevel1: [''],
      deliveryLevel1: [''],
    });
    /**
     * This is used to initialize the POC form.
     */
    this.pocForm = frmbuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      address4: [''],
      department: [''],
      referralSource: ['', Validators.required],
      status: ['', Validators.required],
      relationshipStrength: [''],
      engagementPlan: [''],
      comments: [''],
      contactsType: ['', Validators.required],
    });
    this.initAddPOForm();
    this.initAddBudgetForm();
  }
  /**
   * This is used to initialize the PO form.
   */
  initAddPOForm() {
    this.PoForm = this.frmbuilder.group({
      poNumber: ['', Validators.required],
      poName: ['', Validators.required],
      currency: ['', Validators.required],
      poExpiryDate: ['', Validators.required],
      poc: ['', Validators.required],
      poFile: ['', Validators.required],
      ta: ['', Validators.required],
      molecule: ['', Validators.required],
      cmLevel2: ['', Validators.required],
      poBuyingEntity: ['', Validators.required],
      total: [0, Validators.required],
      revenue: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
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
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];

    // this.clientMasterDataRows = [
    //   {
    //     ClientLegalEntry: 'Test',
    //     LastUpdated: 'Jul 3, 2019',
    //     LastUpdatedBy: 'Kaushal Bagrodia'
    //   }
    // ];

    // this.auditHistoryColumns = [
    //   { field: 'Action', header: 'Action' },
    //   { field: 'ActionBy', header: 'Action By' },
    //   { field: 'Date', header: 'Date' },
    //   { field: 'Details', header: 'Details' }
    // ];

    // this.auditHistoryRows = [
    //   {
    //     Action: '',
    //     ActionBy: '',
    //     Date: '',
    //     Details: ''
    //   }
    // ];

    // this.auditHistorySelectedColumns = [
    //   { field: 'ClientLegalEntry', header: 'Client Legal Entry' },
    //   { field: 'Action', header: 'Action' },
    //   { field: 'ActionBy', header: 'Action By' },
    //   { field: 'Date', header: 'Date' },
    //   { field: 'Details', header: 'Details' }
    // ];

    // this.auditHistorySelectedRows = [
    //   {
    //     ClientLegalEntry: 'User Created',
    //     Action: '',
    //     ActionBy: '',
    //     Date: '',
    //     Details: ''
    //   }
    // ];

    // this.subDivisionDetailsColumns = [
    //   { field: 'SubDivision', header: 'Sub-Division', visibility: true },
    //   { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
    //   { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    // ];

    // this.subDivisionDetailsRows = [
    //   {
    //     SubDivision: 'Sub-Division',
    //     LastUpdated: '',
    //     LastUpdatedBy: ''
    //   }
    // ];
    // this.POCColumns = [
    //   // { field: 'POC', header: 'POC', visibility: true },
    //   { field: 'fName', header: 'First Name', visibility: true },
    //   { field: 'lName', header: 'Last Name', visibility: true },
    //   { field: 'email', header: 'Email', visibility: true },
    //   { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
    //   { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    // ];

    // this.POCRows = [
    //   {
    //     // POC: 'POC',
    //     fName: 'Aditya',
    //     lName: 'Joshi',
    //     email: 'aditya@gmail.com',
    //     LastUpdated: 'Sep 3, 2019',
    //     LastUpdatedBy: 'Aditya Joshi'
    //   },
    //   {
    //     fName: 'Test',
    //     lName: 'Test',
    //     email: 'test@gmail.com',
    //     LastUpdated: 'Sep 5, 2019',
    //     LastUpdatedBy: 'Test'
    //   }
    // ];
    // this.POColumns = [
    //   { field: 'poName', header: 'Po Name' , visibility: true},
    //   { field: 'poNo', header: 'Po Number', visibility: true },
    //   { field: 'revenue', header: 'Revenue', visibility: true },
    //   { field: 'oop', header: 'OOP', visibility: true },
    //   { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
    //   { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    // ];

    // this.PORows = [
    //   {
    //     poName: 'PO 1',
    //     poNo: 'PO-1',
    //     LastUpdated: '',
    //     LastUpdatedBy: '',
    //     total: 1000,
    //     revenue: 500,
    //     oop: 500,
    //     tax: 0
    //   },
    //   {
    //     poName: 'PO 2',
    //     poNo: 'PO-2',
    //     LastUpdated: '',
    //     LastUpdatedBy: '',
    //     total: 1500,
    //     revenue: 800,
    //     oop: 600,
    //     tax: 100
    //   }
    // ];
    this.loadClientTable();
    // this.colFilters(this.clientMasterDataRows);
    // this.colFilters1(this.auditHistoryRows);
    // this.colFilters2(this.auditHistorySelectedRows);
    // this.subDivisionFilters(this.subDivisionDetailsRows);
    // this.POCFilters(this.POCRows);
    // this.POFilters(this.PORows);
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
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const getClientLegalInfo = Object.assign({}, this.adminConstants.QUERY.GET_ALL_CLIENT_LEGAL_ENTITY_BY_ACTIVE);
    getClientLegalInfo.filter = getClientLegalInfo.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    const results = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, getClientLegalInfo);
    if (results && results.length) {
      this.resultResponse.ClientLegalEntityArray = results;
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.clientObj);
        obj.ID = item.ID;
        obj.ClientLegalEntity = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
        obj.LastUpdatedBy = item.Editor.Title;
        obj.Acronym = item.Acronym;
        obj.Geography = item.Geography;
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
        obj.TimeZone = item.TimeZone;
        obj.Notes = item.Notes;
        obj.PORequired = item.PORequired;
        obj.BillingEntity = item.BillingEntity;
        obj.Bucket = item.Bucket;
        obj.IsCentrallyAllocated = item.IsCentrallyAllocated;
        obj.IsActive = item.IsActive;
        obj.CMLevel1 = item.CMLevel1;
        obj.CMLevel2 = item.CMLevel2;
        obj.DeliveryLevel1 = item.DeliveryLevel1;
        obj.DeliveryLevel2 = item.DeliveryLevel2;
        tempArray.push(obj);
      });
      this.clientMasterDataRows = tempArray;
      this.colFilters(this.clientMasterDataRows);
    }
    this.adminObject.isMainLoaderHidden = true;
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
    this.clientMasterDataColArray.ClientLegalEntity = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }));
    this.clientMasterDataColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: a.LastUpdated
        };
        return b;
      }));
    this.clientMasterDataColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  /**
   * Construct a method to show the add client legal entity form.
   *
   * @description
   *
   * This method will initialize all the dropdown value required in form
   * and will show the client legal entity form.
   *
   */
  async showAddClientModal() {
    this.adminObject.isMainLoaderHidden = false;
    await this.loadClientDropdown();
    this.addClient.reset();
    this.addClient.controls.name.enable();
    this.addClient.controls.acronym.enable();
    this.addClient.controls.currency.enable();
    this.addClient.controls.billingEntry.enable();
    this.addClient.controls.timeZone.enable();
    this.showEditClient = false;
    this.buttonLabel = 'Submit';
    this.showaddClientModal = true;
    this.adminObject.isMainLoaderHidden = true;
    this.cmObject.isClientFormSubmit = false;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. ClientGroup          - Get data from `ClientGroup` list based on filter `IsActive='Yes'`.
   * 2. Market               - Get choice field data for `Market` from `ClientLegalEntity` list.
   * 3. TimeZones            - Get data from `TimeZones` list based on filter `IsActive='Yes'`.
   * 4. Billing Entity       - Get data from `BillingEntity` list based on filter `IsActive='Yes'`.
   * 5. Resource             - Get data from `ResourceCategorization` list based on filter `IsActive='Yes'`.
   * 6. Currency             - Get data from `Currency` list based on filter `IsActive='Yes'`.
   * 7. Bucket               - Get data from `Focus Group` list based on filter `IsActive='Yes'`.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getAddClientInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get client group from ClientGroup list ##1;
    const clientGroupGet = Object.assign({}, options);
    const clientGroupFilter = Object.assign({}, this.adminConstants.QUERY.GET_CLIENT_GROUP_BY_ACTIVE);
    clientGroupFilter.filter = clientGroupFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    clientGroupGet.url = this.spServices.getReadURL(this.constants.listNames.ClientGroup.name,
      clientGroupFilter);
    clientGroupGet.type = 'GET';
    clientGroupGet.listName = this.constants.listNames.ClientGroup.name;
    batchURL.push(clientGroupGet);

    // Get market from ClientLegalEntity list ##2
    const marketGet = Object.assign({}, options);
    const marketFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    marketFilter.filter = marketFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.MARKET);
    marketGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ClientLegalEntity.name,
      marketFilter);
    marketGet.type = 'GET';
    marketGet.listName = this.constants.listNames.ClientLegalEntity.name;
    batchURL.push(marketGet);

    // Get TimeZones from TimeZones list ##3
    const timezonesGet = Object.assign({}, options);
    const timeZonesFilter = Object.assign({}, this.adminConstants.QUERY.GET_TIMEZONES);
    timezonesGet.url = this.spServices.getReadURL(this.constants.listNames.TimeZones.name,
      timeZonesFilter);
    timezonesGet.type = 'GET';
    timezonesGet.listName = this.constants.listNames.TimeZones.name;
    batchURL.push(timezonesGet);

    // Get billing entity from BillingEntity list ##4;
    const billingEntityGet = Object.assign({}, options);
    const billingEntityFilter = Object.assign({}, this.adminConstants.QUERY.GET_BILLING_ENTITY_BY_ACTIVE);
    billingEntityFilter.filter = billingEntityFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    billingEntityGet.url = this.spServices.getReadURL(this.constants.listNames.BillingEntity.name,
      billingEntityFilter);
    billingEntityGet.type = 'GET';
    billingEntityGet.listName = this.constants.listNames.BillingEntity.name;
    batchURL.push(billingEntityGet);

    // Get resource from ResourceCategorization list ##5;
    const resourceGet = Object.assign({}, options);
    const resourceFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
    resourceFilter.filter = resourceFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    resourceGet.url = this.spServices.getReadURL(this.constants.listNames.ResourceCategorization.name,
      resourceFilter);
    resourceGet.type = 'GET';
    resourceGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(resourceGet);

    // Get currency from Currency list ##6;
    const currencyGet = Object.assign({}, options);
    const currencyFilter = Object.assign({}, this.adminConstants.QUERY.GET_CURRENCY_BY_ACTIVE);
    currencyFilter.filter = currencyFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    currencyGet.url = this.spServices.getReadURL(this.constants.listNames.Currency.name,
      currencyFilter);
    currencyGet.type = 'GET';
    currencyGet.listName = this.constants.listNames.Currency.name;
    batchURL.push(currencyGet);

    // Get Bucket value  from FocusGroup list ##7;
    const bucketGet = Object.assign({}, options);
    const bucketFilter = Object.assign({}, this.adminConstants.QUERY.GET_BUCKET);
    bucketGet.url = this.spServices.getReadURL(this.constants.listNames.FocusGroup.name,
      bucketFilter);
    bucketGet.type = 'GET';
    bucketGet.listName = this.constants.listNames.FocusGroup.name;
    batchURL.push(bucketGet);

    const sResults = await this.spServices.executeBatch(batchURL);
    return sResults;

  }
  /**
   * construct a method to iterate the `Batch` response and add into the respective dropdown array.
   *
   * @description
   * This method is used to iterate the response and add into the dropdown array in label and value pair.
   *
   * 1. ClientGroup dropdown         - Iterate data from `ClientGroup` list based on filter `IsActive='Yes'`.
   * 2. Market dropdown              - Iterate choice field data for `Market` from `ClientLegalEntity` list.
   * 3. TimeZones dropdown           - Iterate data from `TimeZones` list based on filter `IsActive='Yes'`.
   * 4. Billing Entity dropdown      - Iterate data from `BillingEntity` list based on filter `IsActive='Yes'`.
   * 5. Currency dropdown            - Iterate data from `Currency` list based on filter `IsActive='Yes'`.
   * 6. Bucket dropdown              - Iterate data from `Focus Group` list based on filter `IsActive='Yes'`.
   * 7. CMLevel1 dropdwon            - Iterate data from `ResourceCategorization` list based on filter `IsActive='Yes'`
   * and `Role='CMLevel1'`.
   * 8. CMLevel2 dropdwon            - Iterate data from `ResourceCategorization` list based on filter `IsActive='Yes'`
   * and `Role='CMLevel2'`.
   * 9. DeliveryLevel1 dropdwon      - Iterate data from `ResourceCategorization` list based on filter `IsActive='Yes'`
   * and `Role='DeliveryLevel1'`.
   * 10. DeliveryLevel2 dropdwon      - Iterate data from `ResourceCategorization` list based on filter `IsActive='Yes'`
   * and `Role='DeliveryLevel2'`.
   * 11. PORequired dropdown          - Value is `Yes` and `No`.
   *
   */
  async loadClientDropdown() {
    const sResults = await this.getAddClientInitData();
    if (sResults && sResults.length) {
      this.resultResponse.ClientGroupArray = sResults[0].retItems;
      this.resultResponse.MarketArray = sResults[1].retItems;
      this.resultResponse.TimeZonesArray = sResults[2].retItems;
      this.resultResponse.BillingEntityArray = sResults[3].retItems;
      this.resultResponse.ResourceCatArray = sResults[4].retItems;
      this.resultResponse.CurrencyArray = sResults[5].retItems;
      this.resultResponse.BucketArray = sResults[6].retItems;
      this.dropdown.PORequiredArray = [
        { label: this.adminConstants.LOGICAL_FIELD.YES, value: this.adminConstants.LOGICAL_FIELD.YES },
        { label: this.adminConstants.LOGICAL_FIELD.NO, value: this.adminConstants.LOGICAL_FIELD.NO }
      ];
      if (this.resultResponse.ClientGroupArray && this.resultResponse.ClientGroupArray.length) {
        this.dropdown.ClientGroupArray = [];
        this.resultResponse.ClientGroupArray.forEach(element => {
          this.dropdown.ClientGroupArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.resultResponse.MarketArray
        && this.resultResponse.MarketArray.length) {
        const tempArray = this.resultResponse.MarketArray[0].Choices.results;
        this.dropdown.MarketArray = [];
        tempArray.forEach(element => {
          this.dropdown.MarketArray.push({ label: element, value: element });
        });
      }

      if (this.resultResponse.TimeZonesArray && this.resultResponse.TimeZonesArray.length) {
        this.dropdown.TimeZonesArray = [];
        this.resultResponse.TimeZonesArray.forEach(element => {
          this.dropdown.TimeZonesArray.push({ label: element.TimeZoneName, value: element.Title });
        });
      }
      if (this.resultResponse.BillingEntityArray && this.resultResponse.BillingEntityArray.length) {
        this.dropdown.BillingEntityArray = [];
        this.resultResponse.BillingEntityArray.forEach(element => {
          this.dropdown.BillingEntityArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.resultResponse.CurrencyArray && this.resultResponse.CurrencyArray.length) {
        this.dropdown.CurrencyArray = [];
        this.resultResponse.CurrencyArray.forEach(element => {
          this.dropdown.CurrencyArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.resultResponse.BucketArray && this.resultResponse.BucketArray.length) {
        this.dropdown.BucketArray = [];
        this.resultResponse.BucketArray.forEach(element => {
          this.dropdown.BucketArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.resultResponse.ResourceCatArray && this.resultResponse.ResourceCatArray.length) {
        this.dropdown.CMLevel1Array = [];
        this.dropdown.CMLevel2Array = [];
        this.dropdown.DeliveryLevel1Array = [];
        this.dropdown.DeliveryLevel2Array = [];
        this.resultResponse.ResourceCatArray.forEach(element => {
          const role = element.Role;
          switch (role) {
            case this.adminConstants.resourCatConstant.CMLevel1:
              this.dropdown.CMLevel1Array.push({ label: element.UserName.Title, value: element.UserName.ID });
              break;
            case this.adminConstants.resourCatConstant.CMLevel2:
              this.dropdown.CMLevel2Array.push({ label: element.UserName.Title, value: element.UserName.ID });
              break;
            case this.adminConstants.resourCatConstant.DELIVERY_LEVEL_1:
              this.dropdown.DeliveryLevel1Array.push({ label: element.UserName.Title, value: element.UserName.ID });
              break;
            case this.adminConstants.resourCatConstant.DELIVERY_LEVEL_2:
              this.dropdown.DeliveryLevel2Array.push({ label: element.UserName.Title, value: element.UserName.ID });
              break;
          }
        });
      }
    }
  }
  /**
   * Construct a funtion to validate the email id.
   *
   * @description
   *
   * This method is used to validate validate the email Id for `Distribution List` and `AP Email` field.
   *
   * @Note
   *
   * This method is only trigger when text field is not blank.
   */
  validateEmailId() {
    if (this.addClient.value.distributionList) {
      const distributionListControl = this.addClient.get('distributionList');
      distributionListControl.setValidators([Validators.email]);
      distributionListControl.updateValueAndValidity();
    }
    if (this.addClient.value.APEmail) {
      const APEmailControl = this.addClient.get('APEmail');
      APEmailControl.setValidators([Validators.email]);
      APEmailControl.updateValueAndValidity();
    }
  }
  /**
   * Construct a method to save the client legal entity into `ClientLegalEntity` list.
   * It will construct a REST-API Call to create item into `ClientLegalEntity` list.
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
  async saveClient() {
    if (this.addClient.valid) {
      console.log(this.addClient.value);
      if (this.resultResponse.ClientLegalEntityArray.some(a =>
        a.Title.toLowerCase() === this.addClient.value.name.toLowerCase())) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'This Client is already exist. Please enter another client name.'
        });
        return false;
      }
      if (this.resultResponse.ClientLegalEntityArray.some(a =>
        a.Acronym.toLowerCase() === this.addClient.value.acronym.toLowerCase())) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'This Acronym is already exist. Please enter another acronym.'
        });
        return false;
      }
      // write the save logic using rest api.
      this.adminObject.isMainLoaderHidden = false;
      const clientData = await this.getClientData();
      const results = await this.spServices.createItem(this.constants.listNames.ClientLegalEntity.name,
        clientData, this.constants.listNames.ClientLegalEntity.type);
      if (!results.hasOwnProperty('hasError') && !results.hasError) {
        this.messageService.add({
          key: 'adminCustom', severity: 'success',
          summary: 'Success Message', detail: 'The Client ' + this.addClient.value.name + ' is created successfully.'
        });
        await this.loadRecentRecords(results.ID, false);
        this.showaddClientModal = false;
      }
      this.adminObject.isMainLoaderHidden = true;
    } else {
      this.cmObject.isClientFormSubmit = true;
    }
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
    const result = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, resGet);
    if (result && result.length) {
      const item = result[0];
      const obj = Object.assign({}, this.adminObject.clientObj);
      obj.ID = item.ID;
      obj.ClientLegalEntity = item.Title;
      obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
      obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
      obj.LastUpdatedBy = item.Editor.Title;
      obj.Acronym = item.Acronym;
      obj.Geography = item.Geography;
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
      obj.TimeZone = item.TimeZone;
      obj.Notes = item.Notes;
      obj.PORequired = item.PORequired;
      obj.BillingEntity = item.BillingEntity;
      obj.Bucket = item.Bucket;
      obj.IsCentrallyAllocated = item.IsCentrallyAllocated;
      obj.IsActive = item.IsActive;
      obj.CMLevel1 = item.CMLevel1;
      obj.CMLevel2 = item.CMLevel2;
      obj.DeliveryLevel1 = item.DeliveryLevel1;
      obj.DeliveryLevel2 = item.DeliveryLevel2;
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array
      if (isUpdate) {
        const index = this.clientMasterDataRows.findIndex(x => x.ID === obj.ID);
        this.clientMasterDataRows.splice(index, 1, obj);
      } else {
        this.clientMasterDataRows.unshift(obj);
      }
    }
  }
  getClientData() {
    const data: any = {
      Title: this.addClient.value.name,
      ListName: this.addClient.value.name,
      Acronym: this.addClient.value.acronym.toUpperCase(),
      ClientGroup: this.addClient.value.group,
      InvoiceName: this.addClient.value.invoiceName,
      Realization: + this.addClient.value.realization,
      Market: this.addClient.value.market,
      BillingEntity: this.addClient.value.billingEntry,
      PORequired: this.addClient.value.poRequired,
      TimeZone: + this.addClient.value.timeZone,
      CMLevel1Id: {
        results: this.addClient.value.cmLevel1
      },
      CMLevel2Id: this.addClient.value.cmLevel2,
      DeliveryLevel2Id: this.addClient.value.deliveryLevel2,
      Currency: this.addClient.value.currency,
      Bucket: this.addClient.value.bucket
    };
    if (this.addClient.value.distributionList) {
      data.DistributionList = this.addClient.value.distributionList;
    }
    if (this.addClient.value.deliveryLevel1) {
      data.DeliveryLevel1Id = {
        results: this.addClient.value.deliveryLevel1
      };
    }
    if (this.addClient.value.APEmail) {
      data.APEmail = this.addClient.value.APEmail;
    }
    if (this.addClient.value.address1 || this.addClient.value.address2 || this.addClient.value.address3 || this.addClient.value.address4) {
      data.APAddress = this.addClient.value.address1 + ';#' + this.addClient.value.address2 + ';#' + this.addClient.value.address3 +
        ';#' + this.addClient.value.address4;
    }
    if (this.addClient.value.notes) {
      data.Notes = this.addClient.value.notes;
    }
    return data;
  }
  subDivisionFilters(colData) {
    this.subDivisionDetailsColArray.SubDivision = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.SubDivision, value: a.SubDivision }; return b; }));
    this.subDivisionDetailsColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        };
        return b;
      }));
    this.subDivisionDetailsColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  POCFilters(colData) {
    // this.POCColArray.POC = this.adminCommonService.uniqueArrayObj(
    //   colData.map(a => { const b = { label: a.POC, value: a.POC }; return b; }));
    this.POCColArray.fName = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.fName, value: a.fName }; return b; }));
    this.POCColArray.lName = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.lName, value: a.lName }; return b; }));
    this.POCColArray.email = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.email, value: a.email }; return b; }));
    this.POCColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        };
        return b;
      }));
    this.POCColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  POFilters(colData) {
    this.POColArray.PoName = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.poName, value: a.poName }; return b; }));
    this.POColArray.PoNo = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.poNo, value: a.poNo }; return b; }));
    this.POColArray.Revenue = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.revenue, value: a.revenue }; return b; }));
    this.POColArray.Oop = this.adminCommonService.uniqueArrayObj(colData.map(a => { const b = { label: a.oop, value: a.oop }; return b; }));
    this.POColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        };
        return b;
      }));
    this.POColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  colFilters1(colData) {
    this.auditHistoryArray.Action = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.ActionBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.Date = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
        };
        return b;
      }));
    this.auditHistoryArray.Details = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));

  }

  colFilters2(colData) {
    this.auditHistorySelectedArray.ClientLegalEntry = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ClientLegalEntry, value: a.ClientLegalEntry }; return b; }));
    this.auditHistorySelectedArray.Action = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistorySelectedArray.ActionBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistorySelectedArray.Date = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
        };
        return b;
      }));
    this.auditHistorySelectedArray.Details = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));
  }
  openMenuPopup(data) {
    this.items = [
      { label: 'Edit', command: (e) => this.showEditCLientModal(data) },
      { label: 'Delete' },
      { label: 'Sub-Division Details', command: (e) => this.showSubDivision(data) },
      { label: 'Point of Contact', command: (e) => this.showPOC(data) },
      { label: 'Purchase Order', command: (e) => this.showPO(data) }
    ];
  }
  subDivisionMenu(data) {
    this.items1 = [{ label: 'Edit', command: (e) => this.showEditSubDivision(data) },
    { label: 'Delete' }];
  }
  pocMenu(data) {
    this.items1 = [{ label: 'Edit', command: (e) => this.showEditPOC(data) },
    { label: 'Delete' }];
  }

  poMenu(data) {
    this.items1 = [{ label: 'Change Budget', command: (e) => this.showchangeBudgetModal(data) },
    { label: 'Edit', command: (e) => this.showEditPOModal(data) },
    { label: 'Delete' }];
  }



  saveSubdivision(subDivisionData) {
    if (subDivisionData.valid) {
      console.log(subDivisionData.value);
    } else {
      this.cmObject.isSubDivisionFormSubmit = true;
    }
  }

  savePOC(pocData) {
    if (pocData.valid) {
      console.log(pocData.value);
      this.POCRows.forEach((e) => {
        if (e.email === pocData.controls.email.value) {
          console.log('Email Id Must be Unique');
        }
      });
    } else {
      this.cmObject.isPOCFormSubmit = true;
    }
  }

  savePO(poData) {
    if (poData.valid) {
      console.log(poData.value);
    } else {
      this.cmObject.isPOFormSubmit = true;
    }
  }

  saveBudget(budgetData) {
    if (!this.selectedValue.length) {
      this.checkBudgetValue = true;
    } else {
      this.checkBudgetValue = false;
    }
    if (budgetData.valid) {
      switch (this.selectedValue) {
        case 'Add':
          this.addBudget();
          break;
        case 'Reduce':
          this.reduceBudget(budgetData);
          break;
        case 'Restructure':
          this.restructureBudget();
          break;
      }
    } else {
      this.cmObject.isBudgetFormSubmit = true;
    }
  }
  addBudget() {
    if (this.changeBudgetForm.controls.revenue.value < 0 ||
      this.changeBudgetForm.controls.oop.value < 0 || this.changeBudgetForm.controls.tax.value < 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Values should be Positve Number'
      });
    } else {
      if (this.changeBudgetForm.controls.total.value < 0) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', summary: 'Error Message',
          detail: 'Total should be in Positve Number'
        });
      } else {
        console.log(this.changeBudgetForm.value);
        // console.log(this.changeBudgetForm.getRawValue());
      }
    }
  }

  reduceBudget(data) {
    console.log(data);
    const total = Math.abs(this.changeBudgetForm.controls.total.value);
    const revenue = Math.abs(this.changeBudgetForm.controls.revenue.value);
    const oop = Math.abs(this.changeBudgetForm.controls.oop.value);
    const tax = Math.abs(this.changeBudgetForm.controls.tax.value);
    if (this.changeBudgetForm.controls.revenue.value > 0 ||
      this.changeBudgetForm.controls.oop.value > 0 || this.changeBudgetForm.controls.tax.value > 0) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Values should be Negative Number'
      });
    } else {
      if (this.changeBudgetForm.controls.total.value > 0) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', summary: 'Error Message',
          detail: 'Total should be in Negative Number'
        });
      } else if (total > this.poValue.total) {
        this.messageService.add({
          key: 'adminCustom',
          severity: 'error', summary: 'Error Message',
          detail: 'Total Amount must be less than or equal to existing Total'
        });
      } else if (revenue > this.poValue.revenue) {
        this.messageService.add({
          key: 'adminCustom',
          severity: 'error', summary: 'Error Message',
          detail: 'Revenue must be less than or equal to existing Revenue'
        });
      } else if (oop > this.poValue.oop) {
        this.messageService.add({
          key: 'adminCustom',
          severity: 'error', summary: 'Error Message',
          detail: 'OOP must be less than or equal to existing OOP Value'
        });
      } else if (tax > this.poValue.tax) {
        this.messageService.add({
          key: 'adminCustom',
          severity: 'error', summary: 'Error Message',
          detail: 'Tax Amount must be less than or equal to existing Tax'
        });
      } else {
        console.log(this.changeBudgetForm.value);
        // console.log(this.changeBudgetForm.getRawValue());
      }
    }
  }

  restructureBudget() {
    if (this.changeBudgetForm.controls.total.value !== 0) {
      this.messageService.add({ key: 'adminCustom', severity: 'error', summary: 'Error Message', detail: 'Total Should be Zero' });
    } else {
      console.log(this.changeBudgetForm.value);
      // console.log(this.changeBudgetForm.getRawValue());
    }
  }


  onChange() {
    let total = 0;
    total = this.changeBudgetForm.get('revenue').value + this.changeBudgetForm.get('oop').value + this.changeBudgetForm.get('tax').value;
    this.changeBudgetForm.controls.total.setValue(total);
  }



  showEditCLientModal(data) {
    this.cmObject.isClientFormSubmit = false;
    this.showEditClient = true;
    this.buttonLabel = 'Update';
    this.addClient.controls.name.disable();
    this.addClient.controls.acronym.disable();
    this.addClient.controls.currency.disable();
    this.addClient.controls.billingEntry.disable();
    this.addClient.controls.timeZone.disable();
    this.addClient.patchValue({
      name: 'Test',
      acronym: 'test',
      group: 'option1',
      distributionList: 'Test',
      invoiceName: 'Invoice',
      realization: 'Test',
      market: 'option1',
      billingEntry: 'option1',
      poRequired: 'option1',
      timeZone: 'option1',
      cmLevel1: ['option1'],
      cmLevel2: 'option1',
      deliveryLevel1: ['option1', 'option2'],
      deliveryLevel2: 'option1',
      currency: '',
      APEmail: 'test',
      address1: 'hfgsdjgfjsg',
      address2: 'sdgfasgd',
      address3: '',
      address4: '',
      notes: 'Test',
      bucket: 'option1'
    });
    this.showaddClientModal = true;
  }

  showSubDivision(data) {
    this.showSubDivisionDetails = true;
  }

  showPOC(data) {
    this.showPointofContact = true;
  }

  showPO(data) {
    this.showPurchaseOrder = true;
  }

  showAddSubDivision() {
    this.cmObject.isSubDivisionFormSubmit = false;
    this.subDivisionform.reset();
    this.showeditSubDivision = false;
    this.buttonLabel = 'Submit';
    this.showaddSubDivision = true;
    this.subDivisionform.controls.subDivision_Name.enable();
  }

  showEditSubDivision(data) {
    this.cmObject.isSubDivisionFormSubmit = false;
    this.showeditSubDivision = true;
    this.buttonLabel = 'Update';
    this.showaddSubDivision = true;
    this.subDivisionform.controls.subDivision_Name.disable();
    this.subDivisionform.patchValue({
      subDivision_Name: 'Test',
      distributionList: 'Test',
      cmLevel1: ['option1', 'option2'],
      deliveryLevel1: ['option1'],
    });
  }

  showAddPOC() {
    this.pocForm.reset();
    this.showeditPOC = false;
    this.buttonLabel = 'Submit';
    this.showaddPOC = true;
    this.cmObject.isPOCFormSubmit = false;
  }

  showEditPOC(data) {
    this.cmObject.isPOCFormSubmit = false;
    this.showeditPOC = true;
    this.buttonLabel = 'Update';
    this.showaddPOC = true;
    this.pocForm.patchValue({
      fname: 'Test',
      lname: 'Test',
      designation: 'Test',
      email: 'Test',
      phone: 'Test',
      address1: 'Test',
      address2: 'Test',
      address3: 'Test',
      address4: 'Test',
      department: 'Test',
      referralSource: 'option1',
      status: 'option1',
      relationshipStrength: 'Test',
      engagementPlan: 'Test',
      comments: 'Test',
      contactsType: 'option2',
    });
  }

  showAddPO() {
    this.editPo = true;
    this.PoForm.controls.poNumber.enable();
    this.PoForm.controls.currency.enable();
    this.buttonLabel = 'Submit';
    this.showaddPO = true;
    this.showeditPO = false;
    this.initAddPOForm();
    this.cmObject.isPOFormSubmit = false;
  }

  showEditPOModal(data) {
    this.cmObject.isPOFormSubmit = false;
    this.editPo = false;
    this.buttonLabel = 'Update';
    this.showeditPO = true;
    this.showaddPO = true;
    this.PoForm.controls.poNumber.disable();
    this.PoForm.controls.currency.disable();
    this.PoForm.patchValue({
      poNumber: data.poNo,
      poName: data.poName,
      currency: 'option2',
      poExpiryDate: new Date(),
      poc: 'option2',
      total: data.total,
      revenue: data.revenue,
      oop: data.oop,
      tax: data.tax,
      // poFile: 'Purchase Order.csv',
      ta: 'option2',
      molecule: 'option2',
      cmLevel2: 'option2',
      poBuyingEntity: 'option2'
    });
  }

  showchangeBudgetModal(data) {
    this.selectedValue = [];
    this.checkBudgetValue = false;
    this.poValue = data;
    this.changeBudgetForm.controls.total.disable();
    this.initAddBudgetForm();
    this.showaddBudget = true;
    this.cmObject.isBudgetFormSubmit = false;
  }

  downloadExcel(cmd) {
    cmd.exportCSV();
  }

}

