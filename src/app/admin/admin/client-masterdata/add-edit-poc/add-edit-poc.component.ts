import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from 'src/app/Services/constants.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonService } from 'src/app/Services/common.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { DatePipe } from '@angular/common';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';

@Component({
  selector: 'app-add-edit-poc',
  templateUrl: './add-edit-poc.component.html',
  styleUrls: ['./add-edit-poc.component.css']
})
export class AddEditPocComponent implements OnInit {
  pocForm: FormGroup;
  showeditPOC: boolean = false;
  buttonLabel: string;
  isPOCFormSubmit: boolean;
  modalloaderenable = true;
  currPOCObj: any;
  currClientObj: any;
  POCRows: any;

  constructor(private frmbuilder: FormBuilder,
    private constantsService: ConstantsService,
    private common: CommonService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private spServices: SPOperationService,
    private adminConstants: AdminConstantService,
    private datepipe: DatePipe,
    public adminObject: AdminObjectService,
    private adminCommonService: AdminCommonService) {

    /**
   * This is used to initialize the POC form.
   */
    this.pocForm = frmbuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      designation: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      address4: [''],
      department: [''],
      referralSource: ['', Validators.required],
      relationshipStrength: [''],
      engagementPlan: [''],
      comments: [''],
      contactsType: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log(this.config.data);
    this.currPOCObj = this.config.data.PocObject;
    this.POCRows = this.config.data.PocRows;
    this.currClientObj = this.config.data.currClientObj;
    if (this.config.data.PocObject) {
      this.editPocModal();
    } else {
      this.addPocModal();
    }
  }

  /**
   * Construct a method show the form to add new Point of Contact.
   *
   * @description
   *
   * This method is used to show the form to add new Point of Contact.
   *
   */
  async addPocModal() {
    this.pocForm.reset();
    await this.loadPOCDropdown();
    this.showeditPOC = false;
    this.buttonLabel = 'Submit';
    this.isPOCFormSubmit = false;
    this.modalloaderenable = false;
  }

  /**
   * Construct a method to load all the dropdown of Point of Contact form.
   * @description
   *
   * This method will load the Point of Contact dropdown as per following sequences.
   *  1. RefferalSource        - Get choice field data for `RefferalSource` from `ProjectContacts` list.
   *  2. Relationship Strength - Get choice field data for `RelationshipStrength` from `ProjectContacts` list.
   *  3. Project Contact Types - Get choice field data for `ProjectContactsType` from `ProjectContacts` list.
   * @Note
   *
   * If `dropdown.POCRefferalSourceArray`,`dropdown.POCRelationshipArray` & `POCProjectContactTypes` is null
   * then it will make a REST call to `ProjectContacts` list and iterate the result based on choice field to load the respective dropdown.
   */
  async loadPOCDropdown() {
    if (!this.adminObject.dropdown.POCRefferalSourceArray.length
      || !this.adminObject.dropdown.POCRelationshipArray.length
      || !this.adminObject.dropdown.POCProjectContactTypesArray.length) {
      const sResults = await this.getPOCDropdownRecords();
      if (sResults && sResults.length) {
        const referalArray = sResults[0].retItems;
        const relationshipArray = sResults[1].retItems;
        const projectContactArray = sResults[2].retItems;
        if (referalArray && referalArray.length) {
          const tempArray = referalArray[0].Choices.results;
          this.adminObject.dropdown.POCRefferalSourceArray = [];
          tempArray.forEach(element => {
            this.adminObject.dropdown.POCRefferalSourceArray.push({ label: element, value: element });
            if (element === 'Others') {
              this.pocForm.patchValue({
                referralSource: element
              });
            }
          });
        }
        if (relationshipArray && relationshipArray.length) {
          const tempArray = relationshipArray[0].Choices.results;
          this.adminObject.dropdown.POCRelationshipArray = [];
          tempArray.forEach(element => {
            this.adminObject.dropdown.POCRelationshipArray.push({ label: element, value: element });
            if (element === 'None') {
              this.pocForm.patchValue({
                relationshipStrength: element
              });
            }
          });
        }
        if (projectContactArray && projectContactArray.length) {
          const tempArray = projectContactArray[0].Choices.results;
          this.adminObject.dropdown.POCProjectContactTypesArray = [];
          tempArray.forEach(element => {
            this.adminObject.dropdown.POCProjectContactTypesArray.push({ label: element, value: element });
            if (element === 'Others') {
              this.pocForm.patchValue({
                contactsType: element
              });
            }
          });
        }
      }
    }
  }

  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   * @description
   *
   * This method will load the Point of Contact dropdown as per following sequences.
   *  1. RefferalSource        - Get choice field data for `RefferalSource` from `ProjectContacts` list.
   *  2. Relationship Strength - Get choice field data for `RelationshipStrength` from `ProjectContacts` list.
   *  3. Project Contact Types - Get choice field data for `ProjectContactsType` from `ProjectContacts` list.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getPOCDropdownRecords() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get RefferalSource from ProjectContacts list ##1
    const reffereSourceGet = Object.assign({}, options);
    const reffereSourceFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    reffereSourceFilter.filter = reffereSourceFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.POC_REFERRAL_SOURCE);
    reffereSourceGet.url = this.spServices.getChoiceFieldUrl(this.constantsService.listNames.ProjectContacts.name,
      reffereSourceFilter);
    reffereSourceGet.type = 'GET';
    reffereSourceGet.listName = this.constantsService.listNames.ProjectContacts.name;
    batchURL.push(reffereSourceGet);

    // Get Relationship Strength from ProjectContacts list ##2
    const relationShipGet = Object.assign({}, options);
    const relationShipFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    relationShipFilter.filter = relationShipFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.POC_RELATIONSHIP_STRENGTH);
    relationShipGet.url = this.spServices.getChoiceFieldUrl(this.constantsService.listNames.ProjectContacts.name,
      relationShipFilter);
    relationShipGet.type = 'GET';
    relationShipGet.listName = this.constantsService.listNames.ProjectContacts.name;
    batchURL.push(relationShipGet);

    // Get  Project Contact Types from ProjectContacts list ##3
    const projectContactsGet = Object.assign({}, options);
    const projectContactsFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    projectContactsFilter.filter = projectContactsFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.POC_PROJECT_CONTACTS_TYPE);
    projectContactsGet.url = this.spServices.getChoiceFieldUrl(this.constantsService.listNames.ProjectContacts.name,
      projectContactsFilter);
    projectContactsGet.type = 'GET';
    projectContactsGet.listName = this.constantsService.listNames.ProjectContacts.name;
    batchURL.push(projectContactsGet);
    this.common.SetNewrelic('admin', 'admin-clientMaster', 'getProjectContacts');
    const sResults = await this.spServices.executeBatch(batchURL);
    return sResults;
  }

  /**
   * Construct a method to save or update the point of contact into `ProjectContacts` list.
   * It will construct a REST-API Call to create item or update item into `ProjectContacts` list.
   *
   * @description
   *
   * This method is used to validate and save the point of contact item into `ProjectContacts` list.
   *
   * @Note
   *
   * 1. Duplicate email id is not allowed.
   *
   */
  async savePOC() {
    if (this.pocForm.valid) {
      if (!this.showeditPOC) {
        if (this.POCRows.some(a =>
          a.EmailAddress.toLowerCase() === this.pocForm.value.email.toLowerCase())) {
          this.common.showToastrMessage(this.constantsService.MessageType.warn, 'This email id is already exist. Please enter another email id.', false);
          return false;
        }
      }

      this.ref.close(this.pocForm)

    } else {
      this.isPOCFormSubmit = true;
    }
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
   * Construct a method to show the edit form to edit the point of contacts.
   *
   * @description
   *
   * This method is used to popup the predefined filled form to edit the point of contacts.
   * If value is present in the dropdown array then it will simply load the dropdown.
   * If value is not present in the dropdown array then it will make REST call to get the data.
   *
   */
  async editPocModal() {
    this.isPOCFormSubmit = false;
    this.buttonLabel = 'Update';
    if (!this.adminObject.dropdown.POCProjectContactTypesArray.length
      || !this.adminObject.dropdown.POCRefferalSourceArray.length
      || !this.adminObject.dropdown.POCRelationshipArray.length) {
      await this.loadPOCDropdown();
    }
    this.pocForm.patchValue({
      fname: this.currPOCObj.FName,
      lname: this.currPOCObj.LName,
      designation: this.currPOCObj.Designation ? this.currPOCObj.Designation : '',
      email: this.currPOCObj.EmailAddress,
      phone: this.currPOCObj.Phone ? this.currPOCObj.Phone : '',
      address1: this.currPOCObj.Address ? this.currPOCObj.Address.split(';#')[0] : '',
      address2: this.currPOCObj.Address ? this.currPOCObj.Address.split(';#')[1] : '',
      address3: this.currPOCObj.Address ? this.currPOCObj.Address.split(';#')[2] : '',
      address4: this.currPOCObj.Address ? this.currPOCObj.Address.split(';#')[3] : '',
      department: this.currPOCObj.Department ? this.currPOCObj.Department : '',
      referralSource: this.currPOCObj.ReferralSource ? this.currPOCObj.ReferralSource : '',
      status: this.currPOCObj.Status ? this.currPOCObj.Status : '',
      relationshipStrength: this.currPOCObj.RelationshipStrength ? this.currPOCObj.RelationshipStrength : '',
      engagementPlan: this.currPOCObj.EngagementPlan ? this.currPOCObj.EngagementPlan : '',
      comments: this.currPOCObj.Comments ? this.currPOCObj.Comments : '',
      contactsType: this.currPOCObj.ProjectContactsType ? this.currPOCObj.ProjectContactsType : '',
    });
    this.showeditPOC = true;
    this.modalloaderenable = false;
  }

  cancel() {
    this.ref.close();
  }
}
