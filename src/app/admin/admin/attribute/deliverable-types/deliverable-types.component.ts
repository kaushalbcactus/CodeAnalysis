import { Component, OnInit, ApplicationRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Table } from 'primeng';

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
    LastModifiedBy: []
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

  isOptionFilter: boolean;
  @ViewChild('dt', { static: false }) dtTable: Table;

  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param common This is instance referance of `CommonService` component.
   */
  constructor(
    private datepipe: DatePipe,
    private adminCommonService: AdminCommonService,
    private adminObject: AdminObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService,
    private cdr: ChangeDetectorRef
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
  async ngOnInit() {
    this.deliverableTypesColumns = [
      { field: 'DeliverableType', header: 'Deliverable Type', visibility: true },
      { field: 'Acronym', header: 'Acronym', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastModifiedBy', header: 'Last Updated By', visibility: true },
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
    this.common.SetNewrelic('admin', 'admin-attribute-deliverableTypes', 'getDeliverableType');
    const results = await this.spServices.readItems(this.constants.listNames.DeliverableType.name, getDeliverableTypeInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.deliverableTypeObj);
        obj.ID = item.ID;
        obj.DeliverableType = item.Title;
        obj.Acronym = item.Acronym;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        obj.LastModifiedBy = item.Editor.Title;
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
    this.deliverableTypesColArray.DeliverableType = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.DeliverableType, value: a.DeliverableType }; return b; })));
    this.deliverableTypesColArray.Acronym = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Acronym, value: a.Acronym }; return b; })));
    const deliveryTypeDatesArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.deliverableTypesColArray.LastUpdated = deliveryTypeDatesArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.deliverableTypesColArray.LastModifiedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastModifiedBy, value: a.LastModifiedBy }; return b; })));
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
    this.common.clearToastrMessage();
    const isValid = await this.isFormValid();
    if (isValid) {
      this.adminObject.isMainLoaderHidden = false;
      const data = {
        Title: this.deliverableTypes,
        Acronym: this.acronym.toUpperCase(),
        IsActiveCH: this.adminConstants.LOGICAL_FIELD.YES
      };
      this.common.SetNewrelic('admin', 'admin-attribute-deliverableTypes', 'createDeliverableType');
      const result = await this.spServices.createItem(this.constants.listNames.DeliverableType.name, data,
        this.constants.listNames.DeliverableType.type);
      console.log(result);

      this.common.showToastrMessage(this.constants.MessageType.success,'The Deliverable Type ' + this.deliverableTypes + ' has added successfully.',true);
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
    const alphaSpecialExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL_WITHSPACE;
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA;
    if (!this.deliverableTypes) {

      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter Deliverable Type.',false);
      return false;
    }
    if (!this.deliverableTypes.match(alphaSpecialExp)) {

      this.common.showToastrMessage(this.constants.MessageType.error,'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.',false);
      return false;
    }
    if (this.deliverableTypesRows.some(a => a.DeliverableType.toLowerCase() === this.deliverableTypes.toLowerCase())) {
      this.common.showToastrMessage(this.constants.MessageType.error,'This Deliverable Type is already exist. Please enter another Deliverable Type.',false);
      return false;
    }
    if (!this.acronym) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter acronym Type.',false);
      return false;
    }
    if (!this.acronym.match(alphaExp)) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter only alphabets.',false);
      return false;
    }
    if (this.acronym.length !== 3) {

      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter 3 character as acronym.',false);
      return false;
    }
    if (this.deliverableTypesRows.some(a => a.Acronym.toLowerCase() === this.acronym.toLowerCase())) {

      this.common.showToastrMessage(this.constants.MessageType.error,'This acronym is already exist. Please enter another acronym.',false);

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

    this.common.confirmMessageDialog('Delete Confirmation','Do you want to delete this record?',null,['Yes','No'],false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.DeliverableType.name, this.constants.listNames.DeliverableType.type);
      }
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
    this.common.SetNewrelic('admin', 'admin-attribute-deliverableTypes', 'updateDeliverableType');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);

    this.common.showToastrMessage(this.constants.MessageType.error,'The deliverable type ' + data.DeliverableType + ' has deleted successfully.',true);
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

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.deliverableTypesRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.dtTable,
        colFields: this.deliverableTypesColArray
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

}
