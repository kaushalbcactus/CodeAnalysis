import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MessageService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-add-edit-po-dialog',
  templateUrl: './add-edit-po-dialog.component.html',
  styleUrls: ['./add-edit-po-dialog.component.css']
})
export class AddEditPoDialogComponent implements OnInit {
  PORows = [];
  showeditPO = false;
  PoForm: FormGroup;
  currClientObj: any;
  isPOFormSubmit = false;
  selectedFile: any;
  currPOObj: any;
  modalloaderenable = true;
  constructor(
    private frmbuilder: FormBuilder,
    private messageService: MessageService,
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
  ) {
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




  ngOnInit() {

    this.currPOObj = this.config.data.poObject;
    this.currClientObj = this.config.data.currClientObj;
    this.PORows = this.config.data.poRows;
    if (this.config.data.poObject) {
      this.showEditPOModal();
    } else {
      this.showAddPO();
    }
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
    this.PoForm.controls.poNumber.enable();
    this.PoForm.controls.currency.enable();
    this.PoForm.controls.total.disable();
    this.PoForm.controls.oop.enable();
    this.PoForm.controls.revenue.enable();
    this.PoForm.controls.tax.enable();
    await this.loadPODropdown();
    this.isPOFormSubmit = false;
    this.modalloaderenable = false;
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
    this.isPOFormSubmit = false;
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
    this.modalloaderenable=false;
    
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
          this.adminObject.dropdown.POPointOfContactArray.push({ label: element.FullName, value: element.ID });
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
          this.adminObject.dropdown.CMLevel1Array.push({ label: element.UserName.Title, value: element.UserName.ID });
          break;
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_1:
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_2:
          this.adminObject.dropdown.DeliveryLevel1Array.push({ label: element.UserName.Title, value: element.UserName.ID });
          break;
      }
      switch (role) {
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.CMLevel2:
          this.adminObject.dropdown.CMLevel2Array.push({ label: element.UserName.Title, value: element.UserName.ID });
          break;
        case this.adminConstants.RESOURCE_CATEGORY_CONSTANT.DELIVERY_LEVEL_2:
          this.adminObject.dropdown.DeliveryLevel2Array.push({ label: element.UserName.Title, value: element.UserName.ID });
          break;
      }
    });
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
    // if (!this.showaddBudget) {
    this.adminObject.po.revenue = +(this.PoForm.value.revenue).toFixed(2);
    this.adminObject.po.oop = this.PoForm.value.oop ? +(this.PoForm.value.oop).toFixed(2) : 0;
    this.adminObject.po.tax = this.PoForm.value.tax ? +(this.PoForm.value.tax).toFixed(2) : 0;
    this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
    this.PoForm.get('total').setValue(this.adminObject.po.total);
    // }
    // if (this.showaddBudget) {
    //   this.adminObject.po.revenue = +(this.changeBudgetForm.value.revenue).toFixed(2);
    //   this.adminObject.po.oop = this.changeBudgetForm.value.oop ? +(this.changeBudgetForm.value.oop).toFixed(2) : 0;
    //   this.adminObject.po.tax = this.changeBudgetForm.value.tax ? +(this.changeBudgetForm.value.tax).toFixed(2) : 0;
    //   this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
    //   this.changeBudgetForm.get('total').setValue(this.adminObject.po.total);
    // }
  }



  cancel() {
    this.ref.close();
  }

  async SavePODetails() {
    if (this.PoForm.valid) {
      if (this.selectedFile[0].size > 0) {
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
        const data = {
          poDetails: this.PoForm,
          selectedFile: this.selectedFile
        }
        this.ref.close(data);
      }
      else {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'Unable to upload file, size of ' + this.selectedFile[0].name + ' is 0 KB.'
        });
        return false;
      }

    } else {
      this.isPOFormSubmit = true;
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
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files;
    }
  }

}
