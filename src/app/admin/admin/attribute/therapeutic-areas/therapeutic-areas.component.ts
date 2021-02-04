import { Component, OnInit, ApplicationRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Table } from 'primeng/table';

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
  items = [
    { label: 'Delete', command: (e) => this.delete() }
  ];
  isOptionFilter: boolean;
  @ViewChild('ta', { static: false }) taTable: Table;
  loaderenable: boolean = true;

  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
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
    this.loaderenable=true;
    this.therapeuticAreaColumns = [
      { field: 'TherapeuticArea', header: 'TherapeuticArea', visibility: true, Type:'string',dbName:'TherapeuticArea',options:[] },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false, Type:'date',dbName:'LastUpdated',options:[] },
      { field: 'LastModifiedBy', header: 'Last Updated By', visibility: true , Type:'string',dbName:'LastModifiedBy',options:[]},
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false, Type:'',dbName:'',options:[] }
    ];
    await this.loadTATable();
    this.loaderenable=false;
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
    const tempArray = [];
    this.therapeuticAreaRows=[];
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
    }
    this.therapeuticAreaColumns = this.common.MainfilterForTable(this.therapeuticAreaColumns,this.therapeuticAreaRows);
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
    const alphaExp = new RegExp(this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL_WITHSPACE);
    this.common.clearToastrMessage();
    if (!this.therapeuticArea) {
      this.common.showToastrMessage(this.constants.MessageType.warn,'Please enter ta.',false);
      return false;
    }
    if (!alphaExp.test(this.therapeuticArea)) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.',false);
      return false;
    }
    if (this.therapeuticAreaRows.some(a => a.TherapeuticArea.toLowerCase() === this.therapeuticArea.toLowerCase())) {
      this.common.showToastrMessage(this.constants.MessageType.warn,'This ta is already exist. Please enter another ta.',false);
      return false;
    }
    this.constants.loader.isWaitDisable = false;
    const data = {
      Title: this.therapeuticArea,
      IsActiveCH: this.adminConstants.LOGICAL_FIELD.YES
    };
    this.common.SetNewrelic('admin', 'admin-attribute-therapeutic', 'createTA');
    const result = await this.spServices.createItem(this.constants.listNames.TA.name, data,
      this.constants.listNames.TA.type);
    console.log(result);
    this.common.showToastrMessage(this.constants.MessageType.success,'The Project Type ' + this.therapeuticArea + ' has added successfully.',true);
    this.therapeuticArea = '';
    await this.loadTATable();
    this.constants.loader.isWaitDisable = true;
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
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
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
    this.constants.loader.isWaitDisable = false;
    this.common.SetNewrelic('admin', 'admin-attribute-therapeutic', 'updateTA');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);

    this.common.showToastrMessage(this.constants.MessageType.success,'The ta ' + data.TherapeuticArea + ' has deleted successfully.',true);
    this.loadTATable();
    this.constants.loader.isWaitDisable = true;
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

}
