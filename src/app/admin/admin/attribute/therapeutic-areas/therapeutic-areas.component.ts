import { Component, OnInit, ApplicationRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { MessageService, Message } from 'primeng/api';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Table } from 'primeng';

@Component({
  selector: 'app-therapeutic-areas',
  templateUrl: './therapeutic-areas.component.html',
  styleUrls: ['./therapeutic-areas.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to Title column into `TA` list.
 *
 */
export class TherapeuticAreasComponent implements OnInit {
  therapeuticArea: any;
  currTAObj: any;
  therapeuticAreaColumns = [];
  therapeuticAreaRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  therapeuticAreaColArray = {
    TherapeuticArea: [],
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
  msgs: Message[] = [];

  isOptionFilter: boolean;
  @ViewChild('ta', { static: false }) taTable: Table;

  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param messageService This is instance referance of `MessageService` component.
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
    private messageService: MessageService,
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
  ngOnInit() {
    this.therapeuticAreaColumns = [
      { field: 'TherapeuticArea', header: 'TherapeuticArea', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastModifiedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.loadTATable();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination and delete the Therapeutic Type.
   *
   */
  async loadTATable() {
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const getTAInfo = Object.assign({}, this.adminConstants.QUERY.GET_TA_BY_ACTIVE);
    getTAInfo.filter = getTAInfo.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    this.common.SetNewrelic('admin', 'admin-attribute-therapeutic', 'getTA');
    const results = await this.spServices.readItems(this.constants.listNames.TA.name, getTAInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.taObj);
        obj.ID = item.ID;
        obj.TherapeuticArea = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        obj.LastModifiedBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.therapeuticAreaRows = tempArray;
      this.colFilters(this.therapeuticAreaRows);
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the TherapeuticArea,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.therapeuticAreaColArray.TherapeuticArea = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.TherapeuticArea, value: a.TherapeuticArea
      };
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
    this.therapeuticAreaColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.therapeuticAreaColArray.LastModifiedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.LastModifiedBy, value: a.LastModifiedBy
      };
      return b;
    })));
  }
  /**
   * Construct a method to add the new ta into `TA` list.
   *
   * @description
   *
   * This method will add ta into `TA` list and shows that Project Type into the table.
   *
   * @Note
   *
   * If ta is already present then system will throws error and return `false`.
   * If blank ta is submitted then system will throws error and return `false`.
   * Only alphabets and two special characters are allowed and special characters cannot start or end the words.
   *
   */
  async addTherapeuticArea() {
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL_WITHSPACE;
    this.messageService.clear();
    if (!this.therapeuticArea) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter ta.'
      });
      return false;
    }
    if (!this.therapeuticArea.match(alphaExp)) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.'
      });
      return false;
    }
    if (this.therapeuticAreaRows.some(a => a.TherapeuticArea.toLowerCase() === this.therapeuticArea.toLowerCase())) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'This ta is already exist. Please enter another ta.'
      });
      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const data = {
      Title: this.therapeuticArea
    };
    this.common.SetNewrelic('admin', 'admin-attribute-therapeutic', 'createTA');
    const result = await this.spServices.createItem(this.constants.listNames.TA.name, data,
      this.constants.listNames.TA.type);
    console.log(result);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The Project Type ' + this.therapeuticArea + ' has added successfully.'
    });
    this.therapeuticArea = '';
    await this.loadTATable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the `TA` as inactive so that it is not visible in table.
   *
   * @param data Pass data as parameter which contains value of bucket row.
   *
   */
  delete() {
    const data = this.currTAObj;

    this.common.confirmMessageDialog('Delete Confirmation','Do you want to delete this record?',null,['Yes','No'],false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          Active: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.TA.name, this.constants.listNames.TA.type);
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
    this.common.SetNewrelic('admin', 'admin-attribute-therapeutic', 'updateTA');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The ta ' + data.TherapeuticArea + ' has deleted successfully.'
    });
    this.loadTATable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to store current selected row data into variable `currTAObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currTAObj`.
   *
   */
  storeRowData(rowData) {
    this.currTAObj = rowData;
    console.log(rowData);
  }

  downloadExcel(ta) {
    ta.exportCSV();
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }


  ngAfterViewChecked() {
    if (this.therapeuticAreaRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.taTable,
        colFields: this.therapeuticAreaColArray
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
