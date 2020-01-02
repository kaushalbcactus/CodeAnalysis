import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { MessageService, ConfirmationService, Message } from 'primeng/api';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-project-types',
  templateUrl: './project-types.component.html',
  styleUrls: ['./project-types.component.css']
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add user to Title column into `ProjectType` list.
 *
 */
export class ProjectTypesComponent implements OnInit {
  projectType: any;
  projectTypeColumns = [];
  projectTypeRows = [];
  currProjectTypeObj: any;
  projectTypeColArray = {
    ProjectType: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
  };
  items = [
    { label: 'Delete', command: (e) => this.delete() }
  ];
  msgs: Message[] = [];
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
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param common This is instance referance of `CommonService` component.
   */
  constructor(
    private datepipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private adminCommonService: AdminCommonService,
    private adminObject: AdminObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService
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
    this.projectTypeColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'ProjectType', header: 'Project Type', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false }
    ];
    this.loadProjectTypeTable();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * It will iterate all the response array to cater the request and show into the table.
   * The table have option for sorting, pagination and delete the Project Type.
   *
   */
  async loadProjectTypeTable() {
    this.adminObject.isMainLoaderHidden = false;
    const tempArray = [];
    const getProjectTypeInfo = Object.assign({}, this.adminConstants.QUERY.GET_PROJECT_TYPE_BY_ACTIVE);
    getProjectTypeInfo.filter = getProjectTypeInfo.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
      this.common.SetNewrelic('admin', 'admin-attribute-projectTypes', 'getProjectType');
    const results = await this.spServices.readItems(this.constants.listNames.ProjectType.name, getProjectTypeInfo);
    if (results && results.length) {
      results.forEach(item => {
        const obj = Object.assign({}, this.adminObject.projectTypeObj);
        obj.ID = item.ID;
        obj.ProjectType = item.Title;
        obj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        obj.LastUpdatedFormat = this.datepipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        obj.LastUpdatedBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.projectTypeRows = tempArray;
      this.colFilters(this.projectTypeRows);
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to map the array values into particular column dropdown.
   *
   * @description
   *
   * This method will extract the column object value from an array and stores into the column dropdown array and display
   * the values into the ProjectType,LastUpdated and LastUpdatedBy column dropdown.
   *
   * @param colData Pass colData as a parameter which contains an array of column object.
   *
   */
  colFilters(colData) {
    this.projectTypeColArray.ProjectType = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ProjectType, value: a.ProjectType }; return b; })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.projectTypeColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datepipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.projectTypeColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; })));
  }
  /**
   * Construct a method to add the new Project Type into `ProjectType` list.
   *
   * @description
   *
   * This method will add bucket into `ProjectType` list and shows that Project Type into the table.
   *
   * @Note
   *
   * If ProjectType is already present then system will throws error and return `false`.
   * If blank ProjectType is submitted then system will throws error and return `false`.
   * Only alphabets and two special characters are allowed and special characters cannot start or end the words.
   *
   */
  async addProjectType() {
    const alphaExp = this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL;
    this.messageService.clear();
    if (!this.projectType) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter Project Type.'
      });
      return false;
    }
    if (!this.projectType.match(alphaExp)) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error', summary: 'Error Message',
        detail: 'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.'
      });
      return false;
    }
    if (this.projectTypeRows.some(a => a.ProjectType.toLowerCase() === this.projectType.toLowerCase())) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'This Project Type is already exist. Please enter another Project Type.'
      });
      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const data = {
      Title: this.projectType
    };
    this.common.SetNewrelic('admin', 'admin-attribute-projectTypes', 'createProjectType');
    const result = await this.spServices.createItem(this.constants.listNames.ProjectType.name, data,
      this.constants.listNames.ProjectType.type);
    console.log(result);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The Project Type ' + this.projectType + ' has added successfully.'
    });
    this.projectType = '';
    await this.loadProjectTypeTable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to remove the item from table.
   *
   * @description
   *
   * This method mark the `ProjectType` as inactive so that it is not visible in table.
   *
   * @param data Pass data as parameter which contains value of bucket row.
   *
   */
  delete() {
    const data = this.currProjectTypeObj;
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      key: 'confirm',
      accept: () => {
        const updateData = {
          IsActive: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.ProjectType.name, this.constants.listNames.ProjectType.type);
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
    this.common.SetNewrelic('admin', 'admin-attribute-projectTypes', 'updateProjectType');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);
    this.messageService.add({
      key: 'adminCustom', severity: 'success', sticky: true,
      summary: 'Success Message', detail: 'The ProjectType ' + data.ProjectType + ' has deleted successfully.'
    });
    this.loadProjectTypeTable();
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to store current selected row data into variable `currProjectTypeObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currProjectTypeObj`.
   *
   */
  storeRowData(rowData) {
    this.currProjectTypeObj = rowData;
    console.log(rowData);
  }
  downloadExcel(pt) {
    pt.exportCSV();
  }
}

