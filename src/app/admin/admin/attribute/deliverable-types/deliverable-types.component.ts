import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService, Message, ConfirmationService } from 'primeng/api';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';

@Component({
  selector: 'app-deliverable-types',
  templateUrl: './deliverable-types.component.html',
  styleUrls: ['./deliverable-types.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to Title column into `DeliverableType` list.
 *
 */
export class DeliverableTypesComponent implements OnInit {
  deliverableTypes: any;
  deliverableTypesColumns = [];
  deliverableTypesRows = [];
  auditHistoryColumns = [];
  acronym: any;
  currDeliverableTypeObj: any;
  auditHistoryRows = [];
  deliverableTypesColArray = {
    DeliverableType: [],
    Acronym: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    Action: [],
    SubAction: [],
    ActionBy: [],
    Date: [],
  };
  items = [
    { label: 'Delete', command: (e) => this.delete() }
  ];
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param confirmationService This is instance referance of `ConfirmationService` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   */
  constructor(
    private datepipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private adminCommonService: AdminCommonService,
    private adminObject: AdminObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService
  ) { }
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  async ngOnInit() {
    this.deliverableTypesColumns = [
      { field: 'DeliverableType', header: 'Deliverable Type', visibility: true },
      { field: 'Acronym', header: 'Acronym', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    await this.loadDeliverableTypeTable();
    this.colFilters(this.deliverableTypesRows);
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination and delete the Deliverable Type.
   *
   */
  async loadDeliverableTypeTable() {
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const getDeliverableTypeInfo = Object.assign({}, this.adminConstants.QUERY.GET_DELIVERABLE_TYPE_BY_ACTIVE);
    getDeliverableTypeInfo.filter = getDeliverableTypeInfo.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    const results = await this.spServices.readItems(this.constants.listNames.DeliverableType.name, getDeliverableTypeInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.deliverableTypeObj);
        obj.ID = item.ID;
        obj.DeliverableType = item.Title;
        obj.Acronym = item.Acronym;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
        obj.LastUpdatedBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.deliverableTypesRows = tempArray;
      this.colFilters(this.deliverableTypesRows);
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the DeliverableType,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.deliverableTypesColArray.DeliverableType = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }));
    this.deliverableTypesColArray.Acronym = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Acronym, value: a.Acronym }; return b; }));
    this.deliverableTypesColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          value: a.LastUpdated
        };
        return b;
      }));
    this.deliverableTypesColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  /**
   * Construct a method to add the new Deliverable Type into `DeliverableType` list.
   *
   * @description
   *
   * This method will add bucket into `DeliverableType` list and shows that Deliverable Type into the table.
   *
   * @Note
   *
   * If Deliverable Type is already present then system will throws error and return `false`.
   * If blank Deliverable Type is submitted then system will throws error and return `false`.
   * Only alphabets and two special characters are allowed and special characters cannot start or end the words.
   *
   */
  async addDeliverableData() {
    this.messageService.clear();
    const isValid = await this.isFormValid();
    if (isValid) {
      this.adminObject.isMainLoaderHidden = false;
      const data = {
        Title: this.deliverableTypes,
        Acronym: this.acronym.toUpperCase()
      };
      const result = await this.spServices.createItem(this.constants.listNames.DeliverableType.name, data,
        this.constants.listNames.DeliverableType.type);
      console.log(result);
      this.messageService.add({
        key: 'adminCustom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'The Deliverable Type ' + this.deliverableTypes + ' has added successfully.'
      });
      this.deliverableTypes = '';
      this.acronym = '';
      await this.loadDeliverableTypeTable();
      this.adminObject.isMainLoaderHidden = true;
    }
  }
  /**
   * Construct a method to determines whether form is valid or not.
   *
   * @description
   * This method will validate the form based on value enter into the input field.
   *
   * @Note
   *
   * 1. Deliverable Type cannot be blank.
   * 2. If Deliverable Type is already present then system will throws error and return `false`.
   * 3. If blank Deliverable Type is submitted then system will throws error and return `false`.
   * 4. Only alphabets and two special characters are allowed and special characters cannot start or end the words.
   * 5. Acronym cannot be blank.
   * 6. Only 3 character is allowed in Acronym.
   * 7. No number or special character is allowed in Acronym.
   *
   * @returns  It will return boolean value either `true` or `false`
   */
  isFormValid() {
    const alphaSpecialExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL;
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA;
    if (!this.deliverableTypes) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter Deliverable Type.'
      });
      return false;
    }
    if (!this.deliverableTypes.match(alphaSpecialExp)) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.'
      });
      return false;
    }
    if (this.deliverableTypesRows.some(a => a.DeliverableType.toLowerCase() === this.deliverableTypes.toLowerCase())) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'This Deliverable Type is already exist. Please enter another Deliverable Type.'
      });
      return false;
    }
    if (!this.acronym) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter acronym Type.'
      });
      return false;
    }
    if (!this.acronym.match(alphaExp)) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Please enter only alphabets.'
      });
      return false;
    }
    if (this.acronym.length !== 3) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter 3 character as acronym.'
      });
      return false;
    }
    if (this.deliverableTypesRows.some(a => a.Acronym.toLowerCase() === this.acronym.toLowerCase())) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'This acronym is already exist. Please enter another acronym.'
      });
      return false;
    }
    return true;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the `Deliverable Type` as inactive so that it is not visible in table.
   *
   * @param data Pass data as parameter which contains value of bucket row.
   *
   */
  delete() {
    const data = this.currDeliverableTypeObj;
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          Active: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.DeliverableType.name, this.constants.listNames.DeliverableType.type);
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
      summary: 'Success Message', detail: 'The deliverable type ' + data.DeliverableType + ' has deleted successfully.'
    });
    this.loadDeliverableTypeTable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to store current selected row data into variable `currDeliverableTypeObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currDeliverableTypeObj`.
   *
   */
  storeRowData(rowData) {
    this.currDeliverableTypeObj = rowData;
    console.log(rowData);
  }
  downloadExcel(dt) {
    dt.exportCSV();
  }

}
