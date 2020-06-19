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
  selector: 'app-practice-areas',
  templateUrl: './practice-areas.component.html',
  styleUrls: ['./practice-areas.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to Title column into `PracticeArea` list.
 *
 */

export class PracticeAreasComponent implements OnInit {
  practiceArea: any;
  currPracticeAreaObj: any;
  practiceAreaColumns = [];
  practiceAreaRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  practiceAreaColArray = {
    PracticeArea: [],
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
  @ViewChild('pa', { static: false }) paTable: Table;

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
  ngOnInit() {
    this.practiceAreaColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'PracticeArea', header: 'Practice Area', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedFormat', header: 'Last Updated', visibility: false },
      { field: 'LastModifiedBy', header: 'Last Updated By', visibility: true },
    ];
    this.loadPractiveArea();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination and delete the practice area.
   *
   */
  async loadPractiveArea() {
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const getPracticeAreaInfo = Object.assign({}, this.adminConstants.QUERY.GET_PRACTICE_AREA_BY_ACTIVE);
    getPracticeAreaInfo.filter = getPracticeAreaInfo.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    this.common.SetNewrelic('admin', 'admin-attribute-practice-areas', 'getBusinessVerticals');
    const results = await this.spServices.readItems(this.constants.listNames.PracticeArea.name, getPracticeAreaInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.practiveAreaObj);
        obj.ID = item.ID;
        obj.PracticeArea = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        obj.LastModifiedBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.practiceAreaRows = tempArray;
      this.colFilters(this.practiceAreaRows);
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the PracticeArea,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.practiceAreaColArray.PracticeArea = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.PracticeArea, value: a.PracticeArea }; return b; })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.practiceAreaColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.practiceAreaColArray.LastModifiedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastModifiedBy, value: a.LastModifiedBy }; return b; })));
  }
  /**
   * Construct a method to add the new Project Type into `PracticeArea` list.
   *
   * @description
   *
   * This method will add practice area into `PracticeArea` list and shows that Project Type into the table.
   *
   * @Note
   *
   * If practice area is already present then system will throws error and return `false`.
   * If blank practice area is submitted then system will throws error and return `false`.
   * Only alphabets and two special characters are allowed and special characters cannot start or end the words.
   *
   */
  async addPracticeArea() {
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL_WITHSPACE;
    this.common.clearToastrMessage();
    if (!this.practiceArea) {

      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter practice area.',false);
      return false;
    }
    if (!this.practiceArea.match(alphaExp)) {

      this.common.showToastrMessage(this.constants.MessageType.error,'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.',false);
      return false;
    }
    if (this.practiceAreaRows.some(a => a.PracticeArea.toLowerCase() === this.practiceArea.toLowerCase())) {
      this.common.showToastrMessage(this.constants.MessageType.error,'This practice area is already exist. Please enter another practice area.',false);

      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const data = {
      Title: this.practiceArea,
      IsActiveCH: this.adminConstants.LOGICAL_FIELD.YES
    };
    this.common.SetNewrelic('admin', 'admin-attribute-practice-areas', 'createBusinessVerticals');
    const result = await this.spServices.createItem(this.constants.listNames.PracticeArea.name, data,
      this.constants.listNames.PracticeArea.type);
    console.log(result);
    this.common.showToastrMessage(this.constants.MessageType.success,'The practice area ' + this.practiceArea + ' has added successfully.',true);
    this.practiceArea = '';
    await this.loadPractiveArea();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the `Practive Area` as inactive so that it is not visible in table.
   *
   * @param data Pass data as parameter which contains value of bucket row.
   *
   */
  delete() {
    const data = this.currPracticeAreaObj;
    this.common.confirmMessageDialog('Delete Confirmation','Do you want to delete this record?',null,['Yes','No'],false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          IsActiveCH: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.PracticeArea.name,
          this.constants.listNames.PracticeArea.type);
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
    this.common.SetNewrelic('admin', 'admin-attribute-practice-areas', 'updateBusinessVerticals');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);

    this.common.showToastrMessage(this.constants.MessageType.success,'The practice area ' + data.PracticeArea + ' has deleted successfully.',true);
    this.loadPractiveArea();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to store current selected row data into variable `currPracticeAreaObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currPracticeAreaObj`.
   *
   */
  storeRowData(rowData) {
    this.currPracticeAreaObj = rowData;
    console.log(rowData);
  }

  downloadExcel(pa) {
    pa.exportCSV();
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }


  ngAfterViewChecked() {
    if (this.practiceAreaRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.paTable,
        colFields: this.practiceAreaColArray
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

