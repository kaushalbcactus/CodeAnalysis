import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MessageService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { DatePipe } from '@angular/common';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';

@Component({
  selector: 'app-add-edit-subdivision',
  templateUrl: './add-edit-subdivision.component.html',
  styleUrls: ['./add-edit-subdivision.component.css']
})
export class AddEditSubdivisionComponent implements OnInit {

  subDivisionform: FormGroup;
  currClientObj: any;
  isSubDivisionFormSubmit = false;
  currSubDivisionObj: any;
  subDivisionDetailsRows = []
  buttonLabel;
  showeditSubDivision = false;
  isOptionFilter: boolean;
  modalloaderenable = true;

  constructor(private frmbuilder: FormBuilder,
    private constantsService: ConstantsService,
    private messageService: MessageService,
    private common: CommonService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private spServices: SPOperationService,
    private adminConstants: AdminConstantService,
    private datepipe: DatePipe,
    public adminObject: AdminObjectService,
    private adminCommonService: AdminCommonService
  ) {

    /**
   * This is used to initialize the subDivision form.
   */
    this.subDivisionform = frmbuilder.group({
      subDivision_Name: ['', Validators.required],
      distributionList: [''],
      cmLevel1: [''],
      deliveryLevel1: [''],
    });
  }

  ngOnInit() {
    this.subDivisionDetailsRows = this.config.data.subDivisionDetailsRows;
    this.currClientObj = this.config.data.currClientObj;
    this.currSubDivisionObj = this.config.data.SubDivisionObject;
    if (this.config.data.SubDivisionObject) {
      this.editSubDivisionModal();
    } else {
      this.addSubDivisionModal();
    }
  }



  

  /**
   * Construct a method show the form to add new sub division.
   *
   * @description
   *
   * This method is used to show the form to add new Sub Division.
   *
   */
  async addSubDivisionModal() {
    this.subDivisionform.reset();
    this.isSubDivisionFormSubmit = false;
    this.subDivisionform.controls.subDivision_Name.enable();
    this.buttonLabel = 'Submit';
    await this.loadSubDivisionDropdown();
    this.showeditSubDivision = false;
    this.modalloaderenable = false;
  }

  /**
   * Construct a method to load the sub division dropdown.
   *
   * @description
   *
   * This method will load the sub division dropdown.
   *
   * @Note
   *
   * If `dropdown.CMLevel1Array` & `dropdown.DeliveryLevel1Array` is null then it will make a REST call
   * to `ResourceCategorization` list and iterate the result based on role to load the respective dropdown.
   */
  async loadSubDivisionDropdown() {
    if (!this.adminObject.dropdown.CMLevel1Array.length || !this.adminObject.dropdown.DeliveryLevel1Array.length) {
      const getResourceCat = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
      getResourceCat.filter = getResourceCat.filter.replace(/{{isActive}}/gi,
        this.adminConstants.LOGICAL_FIELD.YES);
      this.common.SetNewrelic('admin', 'admin-clientMaster', 'GetRC');
      const result = await this.spServices.readItems(this.constantsService.listNames.ResourceCategorization.name, getResourceCat);
      this.separateResourceCat(result);
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
   * Construct a method to show the edit form to edit the sub division.
   *
   * @description
   *
   * This method is used to popup the predefined filled form to edit the sub division.
   * If value is present in the dropdown array then it will simply load the dropdown.
   * If value is not present in the dropdown array then it will make REST call to get the data.
   *
   */
  async editSubDivisionModal() {
    this.isSubDivisionFormSubmit = false;
    this.buttonLabel = 'Update';
    this.showeditSubDivision = true;
    if (!this.adminObject.dropdown.DeliveryLevel1Array.length || !this.adminObject.dropdown.CMLevel1Array.length) {
      await this.loadSubDivisionDropdown();
    }
    this.subDivisionform.controls.subDivision_Name.disable();
    console.log(this.currSubDivisionObj)
    this.subDivisionform.patchValue({
      subDivision_Name: this.currSubDivisionObj.SubDivision,
      distributionList: this.currSubDivisionObj.DistributionList ? this.currSubDivisionObj.DistributionList : '',
      cmLevel1: this.currSubDivisionObj.CMLevel1 && this.currSubDivisionObj.CMLevel1.hasOwnProperty('results') &&
        this.currSubDivisionObj.CMLevel1.results.length ?
        this.adminCommonService.getIds(this.currSubDivisionObj.CMLevel1.results) : [],
      deliveryLevel1: this.currSubDivisionObj.DeliveryLevel1 && this.currSubDivisionObj.DeliveryLevel1.hasOwnProperty('results') &&
        this.currSubDivisionObj.DeliveryLevel1.results.length ?
        this.adminCommonService.getIds(this.currSubDivisionObj.DeliveryLevel1.results) : []
    });
    this.modalloaderenable = false;
  }

  validateEmailId() {

    if (this.subDivisionform.value.distributionList) {
      const distributionListControl = this.subDivisionform.get('distributionList');
      distributionListControl.setValidators([Validators.email]);
      distributionListControl.updateValueAndValidity();
    }
  }

  /**
   * Construct a method to save or update the sub division into `ClientSubdivision` list.
   * It will construct a REST-API Call to create item or update item into `ClientSubdivision` list.
   *
   * @description
   *
   * This method is used to validate and save the sub division item into `ClientSubdivision` list.
   *
   * @Note
   *
   * 1. Duplicate sub division is not allowed.
   * 2. Only 2 special character are allowed.
   * 3. `SubDivisionClient` name cannot start or end with special character.
   *
   */
  async saveSubdivision() {
    if (this.subDivisionform.valid) {
      if (!this.showeditSubDivision) {
        if (this.subDivisionDetailsRows.some(a =>
          a.SubDivision.toLowerCase() === this.subDivisionform.value.subDivision_Name.toLowerCase())) {
          this.messageService.add({
            key: 'adminCustom', severity: 'error',
            summary: 'Error Message', detail: 'This client sub-division is already exist. Please enter another client sub-division.'
          });
          return false;
        }
      }
      this.ref.close(this.subDivisionform);
    } else {
      this.isSubDivisionFormSubmit = true;
    }
  }

  cancel() {
    this.ref.close();
  }
}
