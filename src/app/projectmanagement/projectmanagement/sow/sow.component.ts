import { Component, OnInit, EventEmitter, Output, ViewChild, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, DialogService } from 'primeng/api';
import { DataService } from 'src/app/Services/data.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router } from '@angular/router';
import { PMCommonService } from '../../services/pmcommon.service';
import { Table } from 'primeng/table';

declare var $;
@Component({
  selector: 'app-sow',
  templateUrl: './sow.component.html',
  styleUrls: ['./sow.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SOWComponent implements OnInit, OnDestroy {
  @Output() projectItem: EventEmitter<any> = new EventEmitter();
  tempClick: any;
  viewBudget = false;
  viewNote: true;
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'SOW Code', visibility: true },
    { field: 'ShortTitle', header: 'SOW Title', visibility: true },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
    { field: 'POC', header: 'POC', visibility: true },
    { field: 'Currency', header: 'Currency', visibility: true },
    { field: 'RevenueBudget', header: 'Revenue Budget', visibility: true },
    { field: 'OOPBudget', header: 'OOP Budget', visibility: true },
    { field: 'TaxBudget', header: 'Tax Budget', visibility: false },
    { field: 'TotalBudget', header: 'Total Budget', visibility: false },
    { field: 'Revenue', header: 'Revenue Balance', visibility: false },
    { field: 'OOP', header: 'OOP Balance', visibility: false },
    { field: 'Tax', header: 'Tax Balance', visibility: false },
    { field: 'Total', header: 'Total Balance', visibility: false },
    { field: 'Status', header: 'Status', visibility: false },
    { field: 'ExpiryDateFormat', header: 'ExpiryDate', visibility: false },
    { field: 'BillingEntity', header: 'Billing Entity', visibility: false },
    { field: 'BusinessVertical', header: 'Practice Areas', visibility: false },
    { field: 'Comments', header: 'Comments', visibility: false },
    { field: 'Owner', header: 'SOW Owner', visibility: false },
    { field: 'CM1', header: 'CM1', visibility: false },
    { field: 'CM2', header: 'CM2', visibility: false },
    { field: 'Delivery1', header: 'Delivery1', visibility: false },
    { field: 'Delivery2', header: 'Delivery2', visibility: false },
    { field: 'CreatedBy', header: 'Created By', visibility: false },
    { field: 'CreatedDate', header: 'Created Date', visibility: false, exportable: false },
    { field: 'CreatedDateFormat', header: 'Created Date', visibility: false },
    { field: 'ModifiedBy', header: 'Modified By', visibility: true },
    { field: 'ModifiedDate', header: 'Modified Date', visibility: true, exportable: false },
    { field: 'ModifiedDateFormat', header: 'Modified Date', visibility: false },


  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'RevenueBudget' },
    { field: 'OOPBudget' },
    { field: 'Currency' },
    { field: 'CreatedBy' },
    { field: 'CreatedDate' },
    { field: 'ModifiedBy' },
    { field: 'ModifiedDate' }];
  projectsDisplayedColumns: any[] = [
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'ProjectCode', header: 'Project Code' },
    { field: 'Title', header: 'Title' },
    { field: 'RevenueBudget', header: 'Revenue Budget' },
    { field: 'OOPBudget', header: 'OOP Budget' },

    //  { field: 'Budget', header: 'Budget' },
    { field: 'Status', header: 'Status' }];
  projectFilterColumns: any[] = [
    { field: 'DeliverableType' },
    { field: 'ProjectCode' },
    { field: 'Title' },
    { field: 'RevenueBudget' },
    { field: 'OOPBudget' },

    // { field: 'Budget' },
    { field: 'Status' }];
  public allSOW = {
    sowCodeArray: [],
    shortTitleArray: [],
    clientLegalEntityArray: [],
    pocArray: [],
    createdByArray: [],
    createdDateArray: [],
    modifiedByArray: [],
    modifiedDateArray: [],
    RevenueBudgetArray: [],
    OOPBudgetArray: [],
    currencyArray: [],
  };
  public projectObj = {
    ID: 0,
    DeliverableType: '',
    ProjectCode: '',
    Title: '',
    OOPBudget: '',
    RevenueBudget: '',
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
  subscription;
  showProjectLink = false;
  @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
  @ViewChild('allProjectRef', { static: true }) allProjectRef: Table;
  step: number;
  ProjectArray = [];
  totalRevenueBudget = 0;
  totalOOPBudget = 0;
  loaderenable = false;
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
    if (this.router.url.indexOf('myDashboard') > -1) {
      this.showProjectLink = false;
    } else {
      this.showProjectLink = true;
    }
    this.loadSOWInit();
  }
  loadSOWInit() {
    this.isAllSOWTableHidden = true;
    this.isAllSOWLoaderHidden = false;
    this.pmObject.isAddSOWVisible = false;
    this.pmObject.isSOWFormSubmit = false;
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
        label: 'View Projects', target: '_blank',
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
    this.subscription = this.dataService.on('reload-EditSOW').subscribe(() => this.loadSOWInit());
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  /**
   * This method is used to add additional Budget SOW.
   * @param task the parameter is selected sow obj.
   */
  addBudgetSOW(task) {
    this.pmObject.isSOWFormSubmit = false;
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
        console.log(this.pmObject.addSOW);
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
    this.pmObject.addProject.SOWSelect.SOWSelectedItem = task;
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
    const modifiedByTempArray = [];
    const modifiedDateTempArray = [];
    const RevenueBudgetTempArray = [];
    const OOPBudgetTempArray = [];
    const currencyTempArray = [];
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
    } else {
      if (this.pmObject.tabMenuItems.length) {
        this.pmObject.tabMenuItems[1].label = 'All SOW (' + this.pmObject.countObj.allSOWCount + ')';
        this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      }
    }
    if (this.pmObject.allSOWItems && this.pmObject.allSOWItems.length) {
      this.pmObject.activeIndex = 0;
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
        sowObj.CreatedDate = task.Created;
        sowObj.Comments = task.Comments;
        sowObj.Status = task.Status;
        sowObj.BusinessVertical = task.BusinessVertical ? task.BusinessVertical.replace(/;#/g, ',') : '';
        sowObj.BillingEntity = task.BillingEntity;
        sowObj.Owner = task.BD ? task.BD.Title : '';
        sowObj.ExpiryDate = task.ExpiryDate;
        sowObj.CM1 = task.CMLevel1 && task.CMLevel1.results ? task.CMLevel1.results.map(c => c.Title).toString() : '';
        sowObj.CM2 = task.CMLevel2 ? task.CMLevel2.Title : '';
        sowObj.Delivery1 = task.DeliveryLevel1 && task.DeliveryLevel1.results ?
          task.DeliveryLevel1.results.map(c => c.Title).toString() : '';
        sowObj.Delivery2 = task.DeliveryLevel2 ? task.DeliveryLevel2.Title : '';
        sowObj.ExpiryDateFormat = this.datePipe.transform(new Date(sowObj.ExpiryDate), 'MMM dd yyyy hh:mm aa');
        sowObj.CreatedDateFormat = this.datePipe.transform(new Date(sowObj.CreatedDate), 'MMM dd yyyy hh:mm:ss aa');
        sowObj.ModifiedBy = task.Editor ? task.Editor.Title : '';
        sowObj.ModifiedDate = task.Modified;
        sowObj.ModifiedDateFormat = this.datePipe.transform(new Date(sowObj.ModifiedDate), 'MMM dd yyyy hh:mm:ss aa');
        sowObj.TotalBudget = task.TotalBudget ? task.TotalBudget : 0;
        sowObj.NetBudget = task.NetBudget ? task.NetBudget : 0;
        sowObj.OOPBudget = task.OOPBudget ? task.OOPBudget : 0;
        sowObj.TaxBudget = task.TaxBudget ? task.TaxBudget : 0;
        sowObj.RevenueBudget = task.NetBudget ? task.NetBudget : 0;
        sowObj.RevenueLinked = task.RevenueLinked ? task.RevenueLinked : 0;
        sowObj.OOPLinked = task.OOPLinked ? task.OOPLinked : 0;
        sowObj.TaxLinked = task.TaxLinked ? task.TaxLinked : 0;
        sowObj.TotalScheduled = task.TotalScheduled ? task.TotalScheduled : 0;
        sowObj.TotalLinked = task.TotalLinked ? task.TotalLinked : 0;
        sowObj.ScheduledRevenue = task.ScheduledRevenue ? task.ScheduledRevenue : 0;
        sowObj.TotalInvoiced = task.TotalInvoiced ? task.TotalInvoiced : 0;
        sowObj.InvoicedRevenue = task.InvoicedRevenue ? task.InvoicedRevenue : 0;
        sowObj.Total = sowObj.TotalBudget - sowObj.TotalLinked;
        sowObj.Revenue = sowObj.RevenueBudget - sowObj.RevenueLinked;
        sowObj.OOP = sowObj.OOPBudget - sowObj.OOPLinked;
        sowObj.Tax = sowObj.TaxBudget - sowObj.TaxLinked;
        sowObj.ClientLegalEntity = task.ClientLegalEntity;
        sowObj.Currency = task.Currency;
        sowCodeTempArray.push({ label: sowObj.SOWCode, value: sowObj.SOWCode });
        shortTitleTempArray.push({ label: sowObj.ShortTitle, value: sowObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: sowObj.ClientLegalEntity, value: sowObj.ClientLegalEntity });
        pocTempArray.push({ label: sowObj.POC, value: sowObj.POC });
        createdByTempArray.push({ label: sowObj.CreatedBy, value: sowObj.CreatedBy });
        currencyTempArray.push({ label: sowObj.Currency, value: sowObj.Currency });
        RevenueBudgetTempArray.push({ label: sowObj.RevenueBudget, value: sowObj.RevenueBudget });
        OOPBudgetTempArray.push({ label: sowObj.OOPBudget, value: sowObj.OOPBudget });
        createDateTempArray.push({
          label: this.datePipe.transform(sowObj.CreatedDate, 'MMM dd yyyy hh:mm:ss aa'),
          value: sowObj.CreatedDate
        });
        modifiedByTempArray.push({ label: sowObj.CreatedBy, value: sowObj.CreatedBy });
        modifiedDateTempArray.push({
          label: this.datePipe.transform(sowObj.CreatedDate, 'MMM dd yyyy hh:mm:ss aa'),
          value: sowObj.CreatedDate
        });
        tempAllSOWArray.push(sowObj);
      }
      this.allSOW.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      this.allSOW.currencyArray = this.commonService.unique(currencyTempArray, 'value');
      this.allSOW.RevenueBudgetArray = this.commonService.unique(RevenueBudgetTempArray, 'value');
      this.allSOW.OOPBudgetArray = this.commonService.unique(OOPBudgetTempArray, 'value');
      this.allSOW.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.allSOW.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.allSOW.pocArray = this.commonService.unique(pocTempArray, 'value');
      this.allSOW.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      this.allSOW.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      this.allSOW.modifiedByArray = this.commonService.unique(modifiedByTempArray, 'value');
      this.allSOW.modifiedDateArray = this.commonService.unique(modifiedDateTempArray, 'value');
      this.pmObject.allSOWArray = tempAllSOWArray;

    }

    if (this.pmObject.columnFilter.SOWCode && this.pmObject.columnFilter.SOWCode.length) {
      const getSOW = this.pmObject.allSOWArray.find(e => e.SOWCode === this.pmObject.columnFilter.SOWCode[0]);
      if (getSOW) {
        this.allProjectRef.filter(this.pmObject.columnFilter.SOWCode, 'SOWCode', 'in');
        this.pmObject.selectedSOWTask = getSOW;
        this.viewSOW(this.pmObject.selectedSOWTask);
      } else {
        this.pmObject.columnFilter.SOWCode = [];
      }

    }

    this.isAllSOWLoaderHidden = true;
    this.isAllSOWTableHidden = false;

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
          endDate = this.rangeDates[1] ? this.rangeDates[1].toISOString() : this.rangeDates[0].toISOString();
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

    this.ProjectArray = [];
    const sResults = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, projectInformationFilter);
    this.ProjectArray = sResults;
    //  const budgetArray = await this.getBudget(sResults);
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
        // const tempBuget = budgetArray.find(x => x.retItems && x.retItems.length &&
        //   x.retItems[0].Title === projectItem.ProjectCode);
        // projectObj.Budget = tempBuget && tempBuget.retItems.length
        //   ? (tempBuget.retItems[0].ApprovedBudget ? tempBuget.retItems[0].ApprovedBudget :
        //     (tempBuget.retItems[0].RevenueBudget ? tempBuget.retItems[0].RevenueBudget : 0)) : 0;


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

  async loadBudgetHours(projectFilter) {
    this.loaderenable = true;
    const budgetArray = await this.pmCommonService.getAllBudget(this.ProjectArray);
    const tempProjectArray = [];
    let AllArrayObj = [];
    this.ProjectArray.forEach(projectItem => {
      const projectObj = $.extend(true, {}, this.projectObj);
      projectObj.ID = projectItem.ID;
      projectObj.DeliverableType = projectItem.DeliverableType;
      projectObj.ProjectCode = projectItem.ProjectCode;
      projectObj.Title = projectItem.Title;
      const tempBuget = budgetArray.find(x => x.retItems && x.retItems.length &&
        x.retItems[0].Title === projectItem.ProjectCode);


      projectObj.RevenueBudget = tempBuget && tempBuget.retItems.length ?
        projectItem.ProjectType.includes('Deliverable') ?
          (tempBuget.retItems[0].RevenueBudget ? tempBuget.retItems[0].RevenueBudget : 0) :
          (tempBuget.retItems[0].ApprovedBudget ? tempBuget.retItems[0].ApprovedBudget : 0) : 0;

      projectObj.OOPBudget = tempBuget && tempBuget.retItems.length ?
        (tempBuget.retItems[0].OOPBudget ? tempBuget.retItems[0].OOPBudget : 0) : 0;
      projectObj.Status = projectItem.Status;
      tempProjectArray.push(projectObj);
    });
    AllArrayObj = Object.assign([], tempProjectArray);
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
    this.loaderenable = false;
    this.viewBudget = true;
    this.totalRevenueBudget = parseFloat(AllArrayObj.map(c => c.RevenueBudget).reduce((a, b) => a + b, 0).toFixed(2));
    this.totalOOPBudget = parseFloat(AllArrayObj.map(c => c.OOPBudget).reduce((a, b) => a + b, 0).toFixed(2));

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

    this.viewBudget = false;
    this.viewNote = true;
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
    // this.pmObject.isProjectVisible = false;
    // this.pmObject.columnFilter.ProjectCode = [projObj.ProjectCode];
    // this.router.navigate(['/projectMgmt/allProjects']);
    if (this.pmObject.allProjectItems) {
      localStorage.setItem('allProjects', JSON.stringify(this.pmObject.allProjectItems));
    }
    let allProjects = window.location.href.replace('allSOW', 'allProjects');
    allProjects = allProjects + '?ProjectCode=' + projObj.ProjectCode;
    window.open(allProjects, '_blank');
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === 'pi pi-ellipsis-v') {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = '';
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = '';
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        this.tempClick = undefined;
      }
    }
  }
}
