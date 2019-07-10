import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, DialogService } from 'primeng/api';
import { DataService } from 'src/app/Services/data.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { AddProjectsComponent } from '../add-projects/add-projects.component';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router } from '@angular/router';
import { PMCommonService } from '../../services/pmcommon.service';
declare var $;
@Component({
  selector: 'app-sow',
  templateUrl: './sow.component.html',
  styleUrls: ['./sow.component.css']
})
export class SOWComponent implements OnInit {
  @Output() projectItem: EventEmitter<any> = new EventEmitter();
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'SOW Code' },
    { field: 'ShortTitle', header: 'SOW Title' },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity' },
    { field: 'POC', header: 'POC' },
    { field: 'CreatedBy', header: 'Created By' },
    { field: 'CreatedDate', header: 'Created Date' },
  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'CreatedBy' },
    { field: 'CreatedDate' }];
  projectsDisplayedColumns: any[] = [
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'ProjectCode', header: 'Project Code' },
    { field: 'Title', header: 'Title' },
    { field: 'Budget', header: 'Budget' },
    { field: 'Status', header: 'Status' }];
  projectFilterColumns: any[] = [
    { field: 'DeliverableType' },
    { field: 'ProjectCode' },
    { field: 'Title' },
    { field: 'Budget' },
    { field: 'Status' }];
  public allSOW = {
    sowCodeArray: [],
    shortTitleArray: [],
    clientLegalEntityArray: [],
    pocArray: [],
    createdByArray: [],
    createdDateArray: []
  };
  public projectObj = {
    ID: 0,
    DeliverableType: '',
    ProjectCode: '',
    Title: '',
    Budget: '',
    Status: ''
  };
  rangeDates: Date[];
  isAllSOWLoaderHidden = true;
  isAllSOWTableHidden = true;
  selectedSOWTask;
  activeProjectLoader = true;
  pipelineProjectLoader = true;
  inActiveProjectLoader = true;
  isActiveProjectTableHidden = true;
  isPipelineProjectTableHidden = true;
  isInActiveProjectTableHidden = true;
  popItems: MenuItem[];
  sowViewDataArray = [];
  @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
  step: number;
  constructor(
    public pmObject: PMObjectService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private pmConstant: PmconstantService,
    private dataService: DataService,
    public dialogService: DialogService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private router: Router,
    public pmCommonService: PMCommonService
  ) { }

  ngOnInit() {
    this.isAllSOWTableHidden = true;
    this.isAllSOWLoaderHidden = false;
    this.pmObject.isAddSOWVisible = false;
    this.pmObject.selectedSOWTask = '';


    setTimeout(() => {
      this.getAllSOW();
    }, this.pmConstant.TIME_OUT);
    this.popItems = [
      {
        label: 'View SOW', target: '_blank',
        command: (event) => this.viewSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Edit SOW', target: '_blank',
        command: (event) => this.editSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Update Budget', target: '_blank',
        command: (event) => this.addBudgetSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'View Project', target: '_blank',
        command: (event) => this.viewProjectSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Add Project', target: '_blank',
        command: (event) => this.addProjectSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Close SOW', target: '_blank',
        command: (event) => this.closeSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Show History', target: '_blank',
        command: (task) => this.timeline.showTimeline(this.pmObject.selectedSOWTask.ID, 'ProjectMgmt', 'SOW')
      }
    ];
  }
  /**
   * This method is used to add additional Budget SOW.
   * @param task the parameter is selected sow obj.
   */
  addBudgetSOW(task) {
    this.pmObject.isAdditionalBudgetVisible = true;
  }
  /**
   * This method is used to add Edit SOW.
   * @param task the parameter is selected sow obj.
   */
  editSOW(task) {
    this.dataService.publish('call-EditSOW');
  }
  viewSOW(task) {
    this.viewSOWOnRightSide();
  }
  async viewSOWOnRightSide() {
    this.sowViewDataArray = [];
    this.pmObject.isSOWRightViewVisible = false;
    let currSelectedSOW;
    if (this.pmObject.selectedSOWTask) {
      currSelectedSOW = this.pmObject.selectedSOWTask;
      const sowItemFilter = Object.assign({}, this.pmConstant.SOW_QUERY.SOW_BY_ID);
      sowItemFilter.filter = sowItemFilter.filter.replace(/{{Id}}/gi, currSelectedSOW.ID);
      const sowItemResult = await this.spServices.readItems(this.constants.listNames.SOW.name, sowItemFilter);
      if (sowItemResult && sowItemResult.length) {
        this.pmCommonService.setGlobalVariable(sowItemResult[0]);
        this.sowViewDataArray.push(this.pmObject.addSOW);
        this.pmObject.isSOWRightViewVisible = true;
      }
    }
  }
  closeSOW(task) {
    this.dataService.publish('call-Close-SOW');
  }
  addProjectSOW(task) {
    this.pmObject.isAddProjectVisible = true;
    this.pmObject.addProject.SOWSelect.SOWCode = task.SOWCode;
    this.pmObject.activeIndex = 1;
  }
  viewProjectSOW(task) {
    this.pmObject.isProjectVisible = true;
    this.setStep(0);
  }
  /**
   * This method is used to show all sow.
   */
  async getAllSOW() {
    const sowCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const pocTempArray = [];
    const createdByTempArray = [];
    const createDateTempArray = [];
    let arrResults = [];
    if (this.pmObject.userRights.isMangers
      || this.pmObject.userRights.isHaveSOWFullAccess
      || this.pmObject.userRights.isHaveSOWBudgetManager) {
      const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.ALL_SOW);
      arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
    } else {
      const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.USER_SPECIFIC_SOW);
      arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
    }
    if (arrResults && arrResults.length) {
      this.pmObject.allSOWItems = arrResults;
      this.pmObject.countObj.allSOWCount = this.pmObject.allSOWItems.length;
      this.pmObject.totalRecords.AllSOW = this.pmObject.countObj.allSOWCount;
      if (this.pmObject.tabMenuItems.length) {
        this.pmObject.tabMenuItems[1].label = 'All SOW (' + this.pmObject.countObj.allSOWCount + ')';
        this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      }
    }
    if (this.pmObject.allSOWItems && this.pmObject.allSOWItems.length) {
      const tempAllSOWArray = [];
      for (const task of this.pmObject.allSOWItems) {
        const sowObj = $.extend(true, {}, this.pmObject.allSOW);
        sowObj.ID = task.ID;
        sowObj.SOWCode = task.SOWCode;
        sowObj.ShortTitle = task.Title;
        sowObj.ClientLegalEntity = task.ClientLegalEntity;
        // tslint:disable-next-line:only-arrow-functions
        const poc = this.pmObject.projectContactsItems.filter((obj) => {
          return (obj.ID === task.PrimaryPOC);
        });
        sowObj.POC = poc.length > 0 ? poc[0].FullName : '';
        sowObj.CreatedBy = task.Author ? task.Author.Title : '';
        sowObj.CreatedDate = this.datePipe.transform(task.Created, 'MMM dd yyyy hh:mm:ss aa');
        sowCodeTempArray.push({ label: sowObj.SOWCode, value: sowObj.SOWCode });
        shortTitleTempArray.push({ label: sowObj.ShortTitle, value: sowObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: sowObj.ClientLegalEntity, value: sowObj.ClientLegalEntity });
        pocTempArray.push({ label: sowObj.POC, value: sowObj.POC });
        createdByTempArray.push({ label: sowObj.CreatedBy, value: sowObj.CreatedBy });
        createDateTempArray.push({ label: sowObj.CreatedDate, value: sowObj.CreatedDate });
        tempAllSOWArray.push(sowObj);
      }
      this.allSOW.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      this.allSOW.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.allSOW.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.allSOW.pocArray = this.commonService.unique(pocTempArray, 'value');
      this.allSOW.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      this.allSOW.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      this.pmObject.allSOWArray = tempAllSOWArray;
      this.isAllSOWLoaderHidden = true;
      this.isAllSOWTableHidden = false;
    }
  }
  lazyLoadTask(event) {
    const allSOWArray = this.pmObject.allSOWArray;
    this.commonService.lazyLoadTask(event, allSOWArray, this.filterColumns, this.pmConstant.filterAction.ALL_SOW);
  }
  storeRowData(rowData, menu) {
    this.pmObject.selectedSOWTask = rowData;
    const route = this.router.url;
    if (route.indexOf('myDashboard') > -1) {
      menu.model[1].visible = false;
      menu.model[2].visible = false;
      menu.model[4].visible = false;
      menu.model[5].visible = false;
    }
  }
  getActiveProject() {
    this.activeProjectLoader = false;
    this.isActiveProjectTableHidden = true;
    setTimeout(() => {
      this.loadProjectTable(this.pmConstant.filterAction.ACTIVE_PROJECT);
    }, this.pmConstant.TIME_OUT);
  }
  getPipelineProject() {
    this.pipelineProjectLoader = false;
    this.isPipelineProjectTableHidden = true;
    setTimeout(() => {
      this.loadProjectTable(this.pmConstant.filterAction.PIPELINE_PROJECT);
    }, this.pmConstant.TIME_OUT);
  }
  getInactiveProject() {
    this.inActiveProjectLoader = false;
    this.isInActiveProjectTableHidden = true;
    setTimeout(() => {
      this.loadProjectTable(this.pmConstant.filterAction.INACTIVE_PROJECT);
    }, this.pmConstant.TIME_OUT);
  }
  async loadProjectTable(projectFilter) {
    let projectInformationFilter: any = {};
    switch (projectFilter) {
      case this.pmConstant.filterAction.ACTIVE_PROJECT:
        projectInformationFilter = Object.assign({}, this.pmConstant.QUERY.ACTIVE_PROJECT_BY_SOWCODE);
        projectInformationFilter.filter = projectInformationFilter.filter.replace(/{{sowCode}}/gi, this.pmObject.selectedSOWTask.SOWCode);
        break;
      case this.pmConstant.filterAction.PIPELINE_PROJECT:
        projectInformationFilter = Object.assign({}, this.pmConstant.QUERY.PIPELINE_PROJECT_BY_SOWCODE);
        projectInformationFilter.filter = projectInformationFilter.filter.replace(/{{sowCode}}/gi, this.pmObject.selectedSOWTask.SOWCode);
        break;
      case this.pmConstant.filterAction.INACTIVE_PROJECT:
        const now = new Date();
        const past30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let startDate = past30Days.toISOString();
        let endDate = now.toISOString();
        if (this.rangeDates) {
          startDate = this.rangeDates[0].toISOString();
          endDate = this.rangeDates[1].toISOString();
        } else {
          this.rangeDates = [];
          this.rangeDates.push(new Date(startDate));
          this.rangeDates.push(new Date(endDate));
        }
        projectInformationFilter = Object.assign({}, this.pmConstant.QUERY.INACTIVE_PROJECTS_BY_SOWCODE);
        projectInformationFilter.filter = projectInformationFilter.filter
          .replace(/{{sowCode}}/gi, this.pmObject.selectedSOWTask.SOWCode)
          .replace(/{{actualStartDate}}/gi, startDate)
          .replace(/{{actualEndDate}}/gi, endDate)
          .replace(/{{rejectionStartDate}}/gi, startDate)
          .replace(/{{rejectionEndDate}}/gi, endDate)
          .replace(/{{proposedStartDate}}/gi, startDate)
          .replace(/{{proposedEndDate}}/gi, endDate);
        break;
    }
    const sResults = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, projectInformationFilter);
    const budgetArray = await this.getBudget(sResults);
    this.pmObject.allProjects.activeProjectArray = [];
    this.pmObject.allProjects.activeProjectCopyArray = [];
    const tempProjectArray = [];
    if (sResults && sResults.length) {
      sResults.forEach(projectItem => {
        const projectObj = $.extend(true, {}, this.projectObj);
        projectObj.ID = projectItem.ID;
        projectObj.DeliverableType = projectItem.DeliverableType;
        projectObj.ProjectCode = projectItem.ProjectCode;
        projectObj.Title = projectItem.Title;
        const tempBuget = budgetArray.filter(x => x.retItems[0].Title === projectItem.ProjectCode);
        projectObj.Budget = tempBuget && tempBuget.length && tempBuget[0] && tempBuget[0].retItems.length
          ? tempBuget[0].retItems[0].RevenueBudget ? tempBuget[0].retItems[0].RevenueBudget : 0 : 0;
        projectObj.Status = projectItem.Status;
        tempProjectArray.push(projectObj);
      });
    }
    switch (projectFilter) {
      case this.pmConstant.filterAction.ACTIVE_PROJECT:
        this.pmObject.allProjects.activeProjectArray = Object.assign([], tempProjectArray);
        this.pmObject.totalRecords.activeProject = tempProjectArray.length;
        this.pmObject.allProjects.activeProjectCopyArray = tempProjectArray.splice(0, 5);
        this.activeProjectLoader = true;
        this.isActiveProjectTableHidden = false;
        break;
      case this.pmConstant.filterAction.PIPELINE_PROJECT:
        this.pmObject.allProjects.pipelineProjectArray = Object.assign([], tempProjectArray);
        this.pmObject.totalRecords.pipelineProject = tempProjectArray.length;
        this.pmObject.allProjects.pipelineProjectCopyArray = tempProjectArray.splice(0, 5);
        this.pipelineProjectLoader = true;
        this.isPipelineProjectTableHidden = false;
        break;
      case this.pmConstant.filterAction.INACTIVE_PROJECT:
        this.pmObject.allProjects.inActiveProjectArray = Object.assign([], tempProjectArray);
        this.pmObject.totalRecords.inActiveProject = tempProjectArray.length;
        this.pmObject.allProjects.inActiveProjectCopyArray = tempProjectArray.splice(0, 5);
        this.inActiveProjectLoader = true;
        this.isInActiveProjectTableHidden = false;
        break;
    }
  }
  async getBudget(projectArray) {
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    let batchResults = [];
    let finalArray = [];
    if (projectArray && projectArray.length) {
      for (const element of projectArray) {
        if (batchURL.length < 100) {
          const projectFinanceGet = Object.assign({}, options);
          const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
          projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi,
            element.ProjectCode);
          projectFinanceGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinances.name,
            projectFinanceFilter);
          projectFinanceGet.type = 'GET';
          projectFinanceGet.listName = this.constants.listNames.ProjectFinances.name;
          batchURL.push(projectFinanceGet);
          if (batchURL.length === 99) {
            batchResults = await this.spServices.executeBatch(batchURL);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
    }
    console.log('batch length: ' + batchURL.length);
    return finalArray;
  }
  activeProjectlazyLoadTask(event) {
    const activeProjectArray = this.pmObject.allProjects.activeProjectArray;
    this.commonService.lazyLoadTask(event, activeProjectArray, this.projectFilterColumns, this.pmConstant.filterAction.ACTIVE_PROJECT);
  }
  pipelineProjectlazyLoadTask(event) {
    const pipelineProjectArray = this.pmObject.allProjects.pipelineProjectArray;
    this.commonService.lazyLoadTask(event, pipelineProjectArray, this.projectFilterColumns, this.pmConstant.filterAction.PIPELINE_PROJECT);
  }
  inActivelazyLoadTask(event) {
    const inActiveProjectArray = this.pmObject.allProjects.inActiveProjectArray;
    this.commonService.lazyLoadTask(event, inActiveProjectArray, this.projectFilterColumns, this.pmConstant.filterAction.INACTIVE_PROJECT);
  }
  setStep(index: number) {
    this.step = index;
    if (this.step === 0) {
      this.getActiveProject();
    }
    if (this.step === 1) {
      this.getPipelineProject();
    }
    if (this.step === 2) {
      this.getInactiveProject();
    }
  }
  navigateToProject(projObj) {
    this.pmObject.isProjectVisible = false;
    this.pmObject.columnFilter.ProjectCode = [projObj.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);
  }
}
