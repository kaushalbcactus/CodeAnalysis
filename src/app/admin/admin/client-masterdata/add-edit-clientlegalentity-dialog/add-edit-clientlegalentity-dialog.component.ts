import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';

@Component({
  selector: 'app-add-edit-clientlegalentity-dialog',
  templateUrl: './add-edit-clientlegalentity-dialog.component.html',
  styleUrls: ['./add-edit-clientlegalentity-dialog.component.css']
})
export class AddEditClientlegalentityDialogComponent implements OnInit {

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private datepipe: DatePipe,
    private frmbuilder: FormBuilder,
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private adminObject: AdminObjectService,
    // private platformLocation: PlatformLocation,
    // private router: Router,
    // private applicationRef: ApplicationRef,
    // private zone: NgZone,
    // private globalObject: GlobalService,
    private common: CommonService,
  ) {
    /**
     * This is used to initialize the Client form.
     */
    this.addClient = frmbuilder.group({
      name: ['', Validators.required],
      acronym: ['', [Validators.required, Validators.maxLength(5),
      Validators.pattern(this.adminConstants.REG_EXPRESSION.THREE_UPPERCASE_TWO_NUMBER)]],
      group: ['', Validators.required],
      distributionList: [''],
      invoiceName: ['', [Validators.required]],
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
      bucket: ['', Validators.required],
      bucketEffectiveDate: ['']
    });

  }
  showEditClient = false;
  clientMasterDataRows = [];
  currClientObj: any;
  addClient: FormGroup;
  modalloaderenable = true;
  isClientFormSubmit = false;
  isBucketEffectiveDateActive = false;
  min30Days = new Date();
  ngOnInit() {

    this.clientMasterDataRows = this.config.data.clientMasterDataRows;
    if (this.config.data.clientObject) {
      this.currClientObj = this.config.data.clientObject;
      this.showEditCLientModal();
    } else {
      this.showAddClientModal();
    }
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
    await this.loadClientDropdown();
    // this.addClient.reset();
    // this.addClient.controls.name.enable();
    // this.addClient.controls.acronym.enable();
    // this.addClient.controls.currency.enable();
    // this.addClient.controls.billingEntry.enable();
    // this.addClient.controls.timeZone.enable();
    this.modalloaderenable = false;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. ClientGroup          - Get data from `ClientGroup` list based on filter `IsActiveCH='Yes'`.
   * 2. Market               - Get choice field data for `Market` from `ClientLegalEntity` list.
   * 3. TimeZones            - Get data from `TimeZones` list based on filter `IsActiveCH='Yes'`.
   * 4. Billing Entity       - Get data from `BillingEntity` list based on filter `IsActiveCH='Yes'`.
   * 5. Resource             - Get data from `ResourceCategorization` list based on filter `IsActiveCH='Yes'`.
   * 6. Currency             - Get data from `Currency` list based on filter `IsActiveCH='Yes'`.
   * 7. Bucket               - Get data from `Focus Group` list based on filter `IsActiveCH='Yes'`.
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
    clientGroupGet.url = this.spServices.getReadURL(this.constantsService.listNames.ClientGroup.name,
      clientGroupFilter);
    clientGroupGet.type = 'GET';
    clientGroupGet.listName = this.constantsService.listNames.ClientGroup.name;
    batchURL.push(clientGroupGet);

    // Get market from ClientLegalEntity list ##2
    const marketGet = Object.assign({}, options);
    const marketFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    marketFilter.filter = marketFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.MARKET);
    marketGet.url = this.spServices.getChoiceFieldUrl(this.constantsService.listNames.ClientLegalEntity.name,
      marketFilter);
    marketGet.type = 'GET';
    marketGet.listName = this.constantsService.listNames.ClientLegalEntity.name;
    batchURL.push(marketGet);

    // Get TimeZones from TimeZones list ##3
    const timezonesGet = Object.assign({}, options);
    const timeZonesFilter = Object.assign({}, this.adminConstants.QUERY.GET_TIMEZONES);
    timezonesGet.url = this.spServices.getReadURL(this.constantsService.listNames.TimeZones.name,
      timeZonesFilter);
    timezonesGet.type = 'GET';
    timezonesGet.listName = this.constantsService.listNames.TimeZones.name;
    batchURL.push(timezonesGet);

    // Get billing entity from BillingEntity list ##4;
    const billingEntityGet = Object.assign({}, options);
    const billingEntityFilter = Object.assign({}, this.adminConstants.QUERY.GET_BILLING_ENTITY_BY_ACTIVE);
    billingEntityFilter.filter = billingEntityFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    billingEntityGet.url = this.spServices.getReadURL(this.constantsService.listNames.BillingEntity.name,
      billingEntityFilter);
    billingEntityGet.type = 'GET';
    billingEntityGet.listName = this.constantsService.listNames.BillingEntity.name;
    batchURL.push(billingEntityGet);

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

    // Get Bucket value  from FocusGroup list ##7;
    const bucketGet = Object.assign({}, options);
    const bucketFilter = Object.assign({}, this.adminConstants.QUERY.GET_BUCKET);
    bucketGet.url = this.spServices.getReadURL(this.constantsService.listNames.FocusGroup.name,
      bucketFilter);
    bucketGet.type = 'GET';
    bucketGet.listName = this.constantsService.listNames.FocusGroup.name;
    batchURL.push(bucketGet);

    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getClientGroupCLETimeZoneBillingEntityRCFocousGroupCurrency');
    const sResults = await this.spServices.executeBatch(batchURL);
    return sResults;

  }
  /**
   * construct a method to iterate the `Batch` response and add into the respective dropdown array.
   *
   * @description
   * This method is used to iterate the response and add into the dropdown array in label and value pair.
   *
   * 1. ClientGroup dropdown         - Iterate data from `ClientGroup` list based on filter `IsActiveCH='Yes'`.
   * 2. Market dropdown              - Iterate choice field data for `Market` from `ClientLegalEntity` list.
   * 3. TimeZones dropdown           - Iterate data from `TimeZones` list based on filter `IsActiveCH='Yes'`.
   * 4. Billing Entity dropdown      - Iterate data from `BillingEntity` list based on filter `IsActiveCH='Yes'`.
   * 5. Currency dropdown            - Iterate data from `Currency` list based on filter `IsActiveCH='Yes'`.
   * 6. Bucket dropdown              - Iterate data from `Focus Group` list based on filter `IsActiveCH='Yes'`.
   * 7. CMLevel1 dropdwon            - Iterate data from `ResourceCategorization` list based on filter `IsActiveCH='Yes'`
   * and `RoleCH='CMLevel1'`.
   * 8. CMLevel2 dropdwon            - Iterate data from `ResourceCategorization` list based on filter `IsActiveCH='Yes'`
   * and `RoleCH='CMLevel2'`.
   * 9. DeliveryLevel1 dropdwon      - Iterate data from `ResourceCategorization` list based on filter `IsActiveCH='Yes'`
   * and `RoleCH='DeliveryLevel1'`.
   * 10. DeliveryLevel2 dropdwon      - Iterate data from `ResourceCategorization` list based on filter `IsActiveCH='Yes'`
   * and `RoleCH='DeliveryLevel2'`.
   * 11. PORequired dropdown          - Value is `Yes` and `No`.
   *
   */
  async loadClientDropdown() {
    const sResults = await this.getAddClientInitData();
    if (sResults && sResults.length) {
      this.adminObject.resultResponse.ClientGroupArray = sResults[0].retItems;
      this.adminObject.resultResponse.MarketArray = sResults[1].retItems;
      this.adminObject.resultResponse.TimeZonesArray = sResults[2].retItems;
      this.adminObject.resultResponse.BillingEntityArray = sResults[3].retItems;
      this.adminObject.resultResponse.ResourceCatArray = sResults[4].retItems;
      this.adminObject.resultResponse.CurrencyArray = sResults[5].retItems;
      this.adminObject.resultResponse.BucketArray = sResults[6].retItems;
      this.adminObject.dropdown.PORequiredArray = [
        { label: this.adminConstants.LOGICAL_FIELD.YES, value: this.adminConstants.LOGICAL_FIELD.YES },
        { label: this.adminConstants.LOGICAL_FIELD.NO, value: this.adminConstants.LOGICAL_FIELD.NO }
      ];
      if (this.adminObject.resultResponse.ClientGroupArray && this.adminObject.resultResponse.ClientGroupArray.length) {
        this.adminObject.dropdown.ClientGroupArray = [];
        this.adminObject.resultResponse.ClientGroupArray.forEach(element => {
          this.adminObject.dropdown.ClientGroupArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.adminObject.resultResponse.MarketArray
        && this.adminObject.resultResponse.MarketArray.length) {
        const tempArray = this.adminObject.resultResponse.MarketArray[0].Choices.results;
        this.adminObject.dropdown.MarketArray = [];
        tempArray.forEach(element => {
          this.adminObject.dropdown.MarketArray.push({ label: element, value: element });
        });
      }

      if (this.adminObject.resultResponse.TimeZonesArray && this.adminObject.resultResponse.TimeZonesArray.length) {
        this.adminObject.dropdown.TimeZonesArray = [];
        this.adminObject.resultResponse.TimeZonesArray.forEach(element => {
          this.adminObject.dropdown.TimeZonesArray.push({ label: element.TimeZoneName, value: element.Title });
        });
      }
      if (this.adminObject.resultResponse.BillingEntityArray && this.adminObject.resultResponse.BillingEntityArray.length) {
        this.adminObject.dropdown.BillingEntityArray = [];
        this.adminObject.resultResponse.BillingEntityArray.forEach(element => {
          this.adminObject.dropdown.BillingEntityArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.adminObject.resultResponse.CurrencyArray && this.adminObject.resultResponse.CurrencyArray.length) {
        this.adminObject.dropdown.CurrencyArray = [];
        this.adminObject.resultResponse.CurrencyArray.forEach(element => {
          this.adminObject.dropdown.CurrencyArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.adminObject.resultResponse.BucketArray && this.adminObject.resultResponse.BucketArray.length) {
        this.adminObject.dropdown.BucketArray = [];
        this.adminObject.resultResponse.BucketArray.forEach(element => {
          this.adminObject.dropdown.BucketArray.push({ label: element.Title, value: element.Title });
        });
      }
      if (this.adminObject.resultResponse.ResourceCatArray && this.adminObject.resultResponse.ResourceCatArray.length) {
        this.separateResourceCat(this.adminObject.resultResponse.ResourceCatArray);
      }
    }
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
      const role = element.RoleCH;
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
    // if (this.subDivisionform.value.distributionList) {
    //   const distributionListControl = this.subDivisionform.get('distributionList');
    //   distributionListControl.setValidators([Validators.email]);
    //   distributionListControl.updateValueAndValidity();
    // }
  }
  /**
   * Construct a method to trigger when bucket values changes.
   *
   * @description
   *
   * This method will trigger when bucket value changes and make bucketEffectiveDate field mandatory.
   */
  onBucketChange() {
    const bucketEffectiveDateControl = this.addClient.get('bucketEffectiveDate');
    if (this.showEditClient && this.currClientObj.Bucket !== this.addClient.value.bucket) {
      bucketEffectiveDateControl.setValidators([Validators.required]);
      bucketEffectiveDateControl.updateValueAndValidity();
      this.isBucketEffectiveDateActive = true;
    } else {
      bucketEffectiveDateControl.clearValidators();
      this.isBucketEffectiveDateActive = false;
    }
  }

  /**
   * Construct a method to show the edit form to edit the client legal entity.
   *
   * @description
   *
   * This method is used to popup the predefined filled form to edit the client legal entity.
   * If value is present in the dropdown array then it will simply load the dropdown.
   * If value is not present in the dropdown array then it will make REST call to get the data.
   *
   */
  async showEditCLientModal() {
    this.addClient.controls.name.disable();
    this.addClient.controls.acronym.disable();
    this.addClient.controls.currency.disable();
    this.addClient.controls.billingEntry.disable();
    this.addClient.controls.timeZone.disable();
    this.isBucketEffectiveDateActive = false;
    this.min30Days = new Date(new Date().setDate(new Date().getDate() - 30));
    if (!this.adminObject.dropdown.ClientGroupArray.length) {
      await this.loadClientDropdown();
    }
    console.log('this.currClientObj ', this.currClientObj);
    this.addClient.patchValue({
      name: this.currClientObj.ClientLegalEntity,
      acronym: this.currClientObj.Acronym,
      group: this.currClientObj.ClientGroup,
      distributionList: this.currClientObj.DistributionList ? this.currClientObj.DistributionList : '',
      invoiceName: this.currClientObj.InvoiceName,
      realization: this.currClientObj.Realization,
      market: this.currClientObj.Market,
      billingEntry: this.currClientObj.BillingEntity,
      poRequired: this.currClientObj.PORequired,
      timeZone: this.currClientObj.TimeZone.toString(),
      cmLevel1: this.adminCommonService.getIds(this.currClientObj.CMLevel1.results),
      cmLevel2: this.currClientObj.CMLevel2.ID,
      deliveryLevel1: this.currClientObj.DeliveryLevel1 && this.currClientObj.DeliveryLevel1.hasOwnProperty('results') &&
        this.currClientObj.DeliveryLevel1.results.length ? this.adminCommonService.getIds(this.currClientObj.DeliveryLevel1.results) : [],
      deliveryLevel2: this.currClientObj.DeliveryLevel2.ID,
      currency: this.currClientObj.Currency,
      APEmail: this.currClientObj.APEmail ? this.currClientObj.APEmail : '',
      address1: this.currClientObj.APAddress ? this.currClientObj.APAddress.split(';#')[0] : '',
      address2: this.currClientObj.APAddress ? this.currClientObj.APAddress.split(';#')[1] : '',
      address3: this.currClientObj.APAddress ? this.currClientObj.APAddress.split(';#')[2] : '',
      address4: this.currClientObj.APAddress ? this.currClientObj.APAddress.split(';#')[3] : '',
      notes: this.currClientObj.Notes ? this.currClientObj.Notes : '',
      bucket: this.currClientObj.Bucket,
      bucketEffectiveDate: null
    });
    // this.showaddClientModal = true;
    this.showEditClient = true;
    this.modalloaderenable = false;
  }



  SaveClientDetails() {

    if (this.addClient.valid) {
      console.log(this.addClient.value);
      if (!this.showEditClient) {
        if (this.clientMasterDataRows.some(a =>
          a.ClientLegalEntity && a.ClientLegalEntity.toLowerCase() === this.addClient.value.name.toLowerCase())) {
            this.common.showToastrMessage(this.constantsService.MessageType.warn,'This Client is already exist. Please enter another client name.',false);
          return false;
        }
        if (this.clientMasterDataRows.some(a =>
          a.Acronym && a.Acronym.toLowerCase() === this.addClient.value.acronym.toLowerCase())) {
            this.common.showToastrMessage(this.constantsService.MessageType.warn, 'This Acronym is already exist. Please enter another acronym.',false);
          return false;
        }
      }

      this.ref.close(this.addClient);

    } else {
      this.isClientFormSubmit = true;
    }
    
  }



  cancel() {
    this.ref.close();
  }



}
