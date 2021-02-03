import { Component, OnInit, ApplicationRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Table } from 'primeng/table';

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
  items = [
    { label: 'Delete', command: (e) => this.delete() }
  ];
  isOptionFilter: boolean;
  @ViewChild('pt', { static: false }) ptTable: Table;
  loaderenable: boolean= true;


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
    this.projectTypeColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'ProjectType', header: 'Project Type', visibility: true, Type:'string', dbName:'ProjectType',options:[] },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false , Type:'date', dbName:'LastUpdated',options:[]  },
      { field: 'LastModifiededBy', header: 'Last Updated By', visibility: true , Type:'string', dbName:'LastModifiededBy',options:[]  },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false , Type:'', dbName:'',options:[]  }
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
        obj.LastModifiededBy = item.Editor.Title;
        tempArray.push(obj);
      });
      this.projectTypeRows = tempArray;
      this.projectTypeColumns= this.common.MainfilterForTable(this.projectTypeColumns, this.projectTypeRows);
    }
   this.loaderenable=false;
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
    const alphaExp = new RegExp(this.adminConstants.REG_EXPRESSION.ALPHA_SPECIAL);
    this.common.clearToastrMessage();
    if (!this.projectType) {
      this.common.showToastrMessage(this.constants.MessageType.warn,'Please enter Project Type.',false);
      return false;
    }
    if (!alphaExp.test(this.projectType)) {
      this.common.showToastrMessage(this.constants.MessageType.error,'Special characters are allowed between alphabets. Allowed special characters are \'-\' and \'_\'.',false);
      return false;
    }
    if (this.projectTypeRows.some(a => a.ProjectType.toLowerCase() === this.projectType.toLowerCase())) {
      this.common.showToastrMessage(this.constants.MessageType.error,'This Project Type is already exist. Please enter another Project Type.',false);
      return false;
    }
   this.constants.loader.isWaitDisable=false;
    const data = {
      Title: this.projectType
    };
    this.common.SetNewrelic('admin', 'admin-attribute-projectTypes', 'createProjectType');
    const result = await this.spServices.createItem(this.constants.listNames.ProjectType.name, data,
      this.constants.listNames.ProjectType.type);
    console.log(result);
    this.common.showToastrMessage(this.constants.MessageType.success, 'The Project Type ' + this.projectType + ' has added successfully.',true);
    this.projectType = '';
    await this.loadProjectTypeTable();
    setTimeout(()=>{
      this.constants.loader.isWaitDisable= true;
    }, 500);
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

    this.common.confirmMessageDialog('Delete Confirmation','Do you want to delete this record?',null,['Yes','No'],false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        const updateData = {
          IsActive: this.adminConstants.LOGICAL_FIELD.NO
        };
        this.confirmUpdate(data, updateData, this.constants.listNames.ProjectType.name, this.constants.listNames.ProjectType.type);
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
    this.constants.loader.isWaitDisable=false;
    this.common.SetNewrelic('admin', 'admin-attribute-projectTypes', 'updateProjectType');
    const result = await this.spServices.updateItem(listName, data.ID, updateData, type);
    this.common.showToastrMessage(this.constants.MessageType.success,'The ProjectType ' + data.ProjectType + ' has deleted successfully.',true);
    this.loadProjectTypeTable();
    setTimeout(()=>{
      this.constants.loader.isWaitDisable= true;
    }, 500);
    
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

