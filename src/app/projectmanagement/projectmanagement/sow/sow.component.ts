import { Component, OnInit, EventEmitter, Output, ViewChild, OnDestroy, ViewEncapsulation, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, DialogService } from 'primeng';
import { DataService } from 'src/app/Services/data.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router } from '@angular/router';
import { PMCommonService } from '../../services/pmcommon.service';
import { Table } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GlobalService } from 'src/app/Services/global.service';
import { AddReduceSowbudgetDialogComponent } from './add-reduce-sowbudget-dialog/add-reduce-sowbudget-dialog.component';

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
    SOWCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    POC: [],
    CreatedBy: [],
    CreatedDate: [],
    ModifiedBy: [],
    ModifiedDate: [],
    RevenueBudget: [],
    OOPBudget: [],
    Currency: [],
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
  @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
  @ViewChild('allProjectRef', { static: true }) allProjectRef: Table;
  step: number;
  ProjectArray = [];
  totalRevenueBudget = 0;
  totalOOPBudget = 0;
  loaderenable = false;
  private _destroy$ = new Subject();
  emailTemplate: any;

  constructor(
    public pmObject: PMObjectService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    public pmConstant: PmconstantService,
    private dataService: DataService,
    public dialogService: DialogService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private router: Router,
    public pmCommonService: PMCommonService,
    private globalObject: GlobalService,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    _applicationRef: ApplicationRef,
    zone: NgZone,
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });


  }

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
        command: (event) => this.changeBudgetDialog(this.pmObject.selectedSOWTask)
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
    this.subscription = this.dataService.on('reload-EditSOW').pipe(takeUntil(this._destroy$)).subscribe(() => this.loadSOWInit());
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
      this.commonService.SetNewrelic('projectManagment', 'sow', 'GetSow');
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
      this.commonService.SetNewrelic('projectManagment', 'sow', 'GetSow');
      arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
    } else {
      const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.USER_SPECIFIC_SOW);
      sowFilter.filter = sowFilter.filter.replace('{{UserID}}', this.globalObject.currentUser.userId.toString());
      this.commonService.SetNewrelic('projectManagment', 'sow', 'GetSow');
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

        sowObj.POC = poc.length > 0 ? poc[0].FullNameCC : '';
        sowObj.CreatedBy = task.Author ? task.Author.Title : '';
        sowObj.CreatedDate = task.Created;
        sowObj.Comments = task.CommentsMT;
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
        sowObj.ExpiryDateFormat = this.datePipe.transform(new Date(sowObj.ExpiryDate), 'MMM dd, yyyy, h:mm a');
        sowObj.CreatedDateFormat = this.datePipe.transform(new Date(sowObj.CreatedDate), 'MMM dd, yyyy, h:mm a');
        sowObj.ModifiedBy = task.Editor ? task.Editor.Title : '';
        sowObj.ModifiedDate = new Date(this.datePipe.transform(task.Modified, 'MMM dd, yyyy, h:mm a'));
        sowObj.ModifiedDateFormat = this.datePipe.transform(new Date(sowObj.ModifiedDate), 'MMM dd, yyyy, h:mm a');
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
          label: this.datePipe.transform(sowObj.CreatedDate, 'MMM dd, yyyy, h:mm a'),
          value: sowObj.CreatedDate
        });
        modifiedByTempArray.push({ label: sowObj.CreatedBy, value: sowObj.CreatedBy });
        modifiedDateTempArray.push({
          label: this.datePipe.transform(sowObj.CreatedDate, 'MMM dd, yyyy, h:mm a'),
          value: sowObj.CreatedDate
        });
        tempAllSOWArray.push(sowObj);
      }

      if (tempAllSOWArray.length) {
        this.createColFieldValues(tempAllSOWArray);
      }

      // this.allSOW.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      // this.allSOW.currencyArray = this.commonService.unique(currencyTempArray, 'value');
      // this.allSOW.RevenueBudgetArray = this.commonService.unique(RevenueBudgetTempArray, 'value');
      // this.allSOW.OOPBudgetArray = this.commonService.unique(OOPBudgetTempArray, 'value');
      // this.allSOW.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      // this.allSOW.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      // this.allSOW.pocArray = this.commonService.unique(pocTempArray, 'value');
      // this.allSOW.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      // this.allSOW.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      // this.allSOW.modifiedByArray = this.commonService.unique(modifiedByTempArray, 'value');
      // this.allSOW.modifiedDateArray = this.commonService.unique(modifiedDateTempArray, 'value');
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

  createColFieldValues(resArray) {
    this.allSOW.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label)));
    this.allSOW.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.allSOW.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.allSOW.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));

    const RevenueBudget = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.RevenueBudget, value: a.RevenueBudget }; return b; }).filter(ele => ele.label));
    this.allSOW.RevenueBudget = this.commonService.customSort(RevenueBudget, 1, 'label');
    const OOPBudget = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.OOPBudget, value: a.OOPBudget }; return b; }).filter(ele => ele.label));
    this.allSOW.OOPBudget = this.commonService.customSort(OOPBudget, 1, 'label');
    this.allSOW.CreatedBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.CreatedBy, value: a.CreatedBy }; return b; }).filter(ele => ele.label)));
    this.allSOW.CreatedDate = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.CreatedDateFormat, value: a.CreatedDateFormat }; return b; }).filter(ele => ele.label)));
    this.allSOW.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
    this.allSOW.ModifiedBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label)));


    this.allSOW.ModifiedDate = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ModifiedDateFormat, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.ModifiedDateFormat, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label)));

    // const modifiedDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ModifiedDate, "MMM dd, yyyy, h:mm a"), value: a.ModifiedDate }; return b; }).filter(ele => ele.label)));
    // this.allSOW.ModifiedDate = modifiedDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label);
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      const keys = {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
      return keys ? keys : '';
    });
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
    this.commonService.SetNewrelic('projectManagment', 'sow', 'GetProjectInformation');
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

  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.pmObject.allSOWArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.allProjectRef,
        colFields: this.allSOW
        // colFieldsArray: this.createColFieldValues(this.proformaTable.value)
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }



  // ***************************************************************************************************
  // open dialog module to add / reduce sow budget of selected row item
  // ***************************************************************************************************


  changeBudgetDialog(SowObject) {

    const ref = this.dialogService.open(AddReduceSowbudgetDialogComponent, {
      header: SowObject.SOWCode +  ' - Change Budget',
      width: '78vw',
      data: {
        sowObject: SowObject,
      },
      contentStyle: { 'overflow-y': 'visible', 'background-color': '#f4f3ef' },
      closable: false,
    });

    ref.onClose.subscribe(async (budgetDetails: any) => {
      if (budgetDetails) {
        if (!this.emailTemplate) {
          this.emailTemplate = await this.pmCommonService.getEmailTemplate(this.constants.EMAIL_TEMPLATE_NAME.SOW_BUDGET_UPDATED);
        }
        const today = this.pmCommonService.toISODateString(new Date());
        const docFolder = 'Finance/SOW';
        let libraryName = '';
        let SelectedFile = [];
        SelectedFile.push(new Object({ name: budgetDetails.selectedFile.name, file: budgetDetails.selectedFile }))
        const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
          x.Title === this.pmObject.addSOW.ClientLegalEntity);
        if (clientInfo && clientInfo.length) {
          libraryName = clientInfo[0].ListName;
        }
        this.constants.loader.isPSInnerLoaderHidden = true;
        this.commonService.SetNewrelic('ProjectManagement', 'projectmanagement-sowAddBudget', 'uploadFile');
        this.commonService.UploadFilesProgress(SelectedFile, libraryName + '/' + docFolder, true).then(async uploadedfile => {

          if (uploadedfile.length === SelectedFile.length) {
            if (uploadedfile[0].hasOwnProperty('ServerRelativeUrl') && uploadedfile[0].hasOwnProperty('Name')) {
              this.pmObject.addSOW.SOWFileURL = uploadedfile[0].ServerRelativeUrl;
              this.pmObject.addSOW.SOWFileName = uploadedfile[0].Name;
              this.pmObject.addSOW.SOWDocProperties = uploadedfile;
            }
            this.constants.loader.isPSInnerLoaderHidden = false;
            const batchURL = [];
            const options = {
              data: null,
              url: '',
              type: '',
              listName: ''
            };
            // Assign form value to global variable
            this.pmObject.addSOW.Addendum.TotalBudget = budgetDetails.BudgetDetails.total;
            this.pmObject.addSOW.Addendum.NetBudget = budgetDetails.BudgetDetails.net;
            this.pmObject.addSOW.Addendum.OOPBudget = budgetDetails.BudgetDetails.oop ? budgetDetails.BudgetDetails.oop : 0;
            this.pmObject.addSOW.Addendum.TaxBudget = budgetDetails.BudgetDetails.tax ? budgetDetails.BudgetDetails.tax : 0;
            // create sow obj for update the sow list.
            const updateSOWObj = {
              TotalBudget: this.pmObject.addSOW.Addendum.TotalBudget + this.pmObject.addSOW.Budget.Total,
              NetBudget: this.pmObject.addSOW.Addendum.NetBudget + this.pmObject.addSOW.Budget.Net,
              OOPBudget: this.pmObject.addSOW.Addendum.OOPBudget + this.pmObject.addSOW.Budget.OOP,
              TaxBudget: this.pmObject.addSOW.Addendum.TaxBudget + this.pmObject.addSOW.Budget.Tax,
              SOWLink: this.pmObject.addSOW.SOWFileURL,
              __metadata: {
                type: this.constants.listNames.SOW.type
              }
            };
            // create budgetbreakup obj for create new item in SOWBudgetBreakup list.
            const newBudgetSOWObj = {
              TotalBudget: this.pmObject.addSOW.Addendum.TotalBudget + this.pmObject.addSOW.Budget.Total,
              NetBudget: this.pmObject.addSOW.Addendum.NetBudget + this.pmObject.addSOW.Budget.Net,
              OOPBudget: this.pmObject.addSOW.Addendum.OOPBudget + this.pmObject.addSOW.Budget.OOP,
              TaxBudget: this.pmObject.addSOW.Addendum.TaxBudget + this.pmObject.addSOW.Budget.Tax,
              AddendumTotalBudget: this.pmObject.addSOW.Addendum.TotalBudget,
              AddendumNetBudget: this.pmObject.addSOW.Addendum.NetBudget,
              AddendumOOPBudget: this.pmObject.addSOW.Addendum.OOPBudget,
              AddendumTaxBudget: this.pmObject.addSOW.Addendum.TaxBudget,
              Currency: this.pmObject.addSOW.Currency,
              SOWCode: this.pmObject.addSOW.SOWCode,
              Status: this.pmObject.addSOW.Status,
              InternalReviewStartDate: today,
              ClientReviewStartDate: today,
              ClientReviewCompletionDate: today,
              InternalReviewCompletionDate: today,
              __metadata: {
                type: this.constants.listNames.SOWBudgetBreakup.type
              }
            };
            const updateSowData = Object.assign({}, options);
            updateSowData.data = updateSOWObj;
            updateSowData.listName = this.constants.listNames.SOW.name;
            updateSowData.type = 'PATCH';
            updateSowData.url = this.spServices.getItemURL(this.constants.listNames.SOW.name, this.pmObject.selectedSOWTask.ID);
            batchURL.push(updateSowData);

            const insertSOWBudgetBreakup = Object.assign({}, options);
            insertSOWBudgetBreakup.data = newBudgetSOWObj;
            insertSOWBudgetBreakup.listName = this.constants.listNames.SOWBudgetBreakup.name;
            insertSOWBudgetBreakup.type = 'POST';
            insertSOWBudgetBreakup.url = this.spServices.getReadURL(this.constants.listNames.SOWBudgetBreakup.name, null);
            batchURL.push(insertSOWBudgetBreakup);


            let arrayTo = [];
            let tempArray = [];
            tempArray = Array.from(new Set(tempArray.concat(this.pmObject.addSOW.SOWOwner, this.pmObject.addSOW.CM1, this.pmObject.addSOW.CM2, this.pmObject.addSOW.DeliveryOptional, this.pmObject.addSOW.Delivery)));
            arrayTo = this.pmCommonService.getEmailId(tempArray);
            const mailSubject = this.pmObject.addSOW.SOWCode + ' - Budget Updated';
            let mailContent = await this.getMailContent(this.pmObject.addSOW);
            mailContent = mailContent.replace(RegExp('\'', 'gi'), '');
            mailContent = mailContent.replace(/\\/g, '\\\\');

            // arrayTo.forEach(toUser => {

              const sendEmailObj = {
                __metadata: { type: this.constants.listNames.SendEmail.type },
                Title: mailSubject,
                MailBody: mailContent,
                Subject: mailSubject,
                ToEmailId: arrayTo.join(','),
                FromEmailId: this.globalObject.currentUser.email,
                CCEmailId: this.globalObject.currentUser.email
              };
              const createSendEmailObj = Object.assign({}, options);
              createSendEmailObj.url = this.spServices.getReadURL(this.constants.listNames.SendEmail.name, null);
              createSendEmailObj.data = sendEmailObj;
              createSendEmailObj.type = 'POST';
              createSendEmailObj.listName = this.constants.listNames.SendEmail.name;
              batchURL.push(createSendEmailObj);

            // });


            this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'GetSowSowBudBreakup');
            const res = await this.spServices.executeBatch(batchURL);

            // this.updateBudgetEmail(this.pmObject.addSOW);
            this.constants.loader.isPSInnerLoaderHidden = true;

            this.commonService.showToastrMessage(this.constants.MessageType.success,'Budget updated Successfully.',false);
            console.log(res);
            setTimeout(() => {
              if (this.router.url === '/projectMgmt/allSOW') {
                this.dataService.publish('reload-EditSOW');
              }
            }, this.pmConstant.TIME_OUT);
          }
        });
      }
    });
  }




  getMailContent(sowObj) {
    let mailContent = this.emailTemplate ? this.emailTemplate.ContentMT : '';
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@SowCode@@", sowObj.SOWCode);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@ClientName@@", sowObj.ClientLegalEntity);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@Title@@", sowObj.SOWTitle);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@POC@@", this.pmCommonService.extractNamefromPOC([sowObj.Poc]));
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@Currency@@", sowObj.Currency);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@Comments@@", sowObj.Comments);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@TotalBudget@@", sowObj.Budget.Total);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@AddendumTotalvalue@@", sowObj.Addendum.TotalBudget);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@NewTotalBudget@@", parseFloat((sowObj.Budget.Total + sowObj.Addendum.TotalBudget).toFixed(2)));
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@NetBudget@@", sowObj.Budget.Net);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@AddendumNetvalue@@", sowObj.Addendum.NetBudget);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@NewNetBudget@@", parseFloat((sowObj.Budget.Net + sowObj.Addendum.NetBudget).toFixed(2)));
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@OOPBudget@@", sowObj.Budget.OOP);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@AddendumOOPvalue@@", sowObj.Addendum.OOPBudget);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@NewOOPBudget@@", parseFloat((sowObj.Budget.OOP + sowObj.Addendum.OOPBudget).toFixed(2)));
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@TaxBudget@@", sowObj.Budget.Tax);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@AddendumTaxvalue@@", sowObj.Addendum.TaxBudget);
    mailContent = this.pmCommonService.replaceContent(mailContent, "@@NewTaxBudget@@", parseFloat((sowObj.Budget.Tax + sowObj.Addendum.TaxBudget).toFixed(2)));

    return mailContent;

  }
}


