import { Component, OnInit, ViewChild, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { PMCommonService } from '../../services/pmcommon.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { PlatformLocation, LocationStrategy } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-pending-allocation',
  templateUrl: './pending-allocation.component.html',
  styleUrls: ['./pending-allocation.component.css']
})
export class PendingAllocationComponent implements OnInit {
  tempClick: any;

  displayedColumns: any[] = [
    { field: 'ProjectCode', header: 'Project Code' },
    { field: 'ShortTitle', header: 'Short Title' },
    { field: 'ClientLegalEntity', header: 'Client' },
    { field: 'POC', header: 'POC' },
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'TA', header: 'TA' },
    { field: 'Molecule', header: 'Molecule' },
    { field: 'PrimaryResourceText', header: 'Primary Resource' },
    { field: 'Milestone', header: 'Milestone' },
    { field: 'Status', header: 'Status' }
  ];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ClientLegalEntity' },
    { field: 'ShortTitle' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'TA' },
    { field: 'Molecule' },
    { field: 'Milestone' },
    { field: 'Status' }];
  // tslint:disable-next-line:variable-name
  private _success = new Subject<string>();
  // tslint:disable-next-line:variable-name
  private _error = new Subject<string>();
  public paSuccessMessage: string;
  public paErrorMessage: string;
  public selectedPATask;
  public paContextMenuOptions = [];
  isPAInnerLoaderHidden = true;
  isPAFilterHidden = true;
  isPATableHidden = true;
  popItems: MenuItem[];
  paHideNoDataMessage = true;
  public paArrays = {
    projectItems: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    TA: [],
    Molecule: [],
    PrimaryResMembers: [],
    POC: [],
    DeliverableType: [],
    Milestone: [],
    Status: [],
    // shortTitleArray: [],
    // clientLegalEntityArray: [],
    // POCArray: [],
    // taArray: [],
    // moleculeArray: [],
    // primaryResourceArray: [],
    // deliveryTypeArray: [],
    // milestoneArray: [],
    // statusArray: []
  };
  @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
  @ViewChild('paTableRef', { static: false }) paTableRef: Table;
  constructor(
    public globalObject: GlobalService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SPOperationService,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    public router: Router,
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
    this.isPAInnerLoaderHidden = false;
    this.isPAFilterHidden = false;
    this.popItems = [
      {
        label: 'Go to Allocation', target: '_blank',
        command: (event) => this.goToAllocationPage(this.selectedPATask)
      },
      {
        label: 'Go to Project', target: '_blank',
        command: (event) => this.goToProjectManagement(this.selectedPATask)
      },
      {
        label: 'Show History', target: '_blank',
        command: (task) => this.timeline.showTimeline(this.selectedPATask.ID, 'ProjectMgmt', 'Project')
      }
    ];
    this.pmObject.sendToClientArray = [];
    this._success.subscribe((message) => this.paSuccessMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.paSuccessMessage = null);
    this._error.subscribe((message) => this.paErrorMessage = message);
    this._error.pipe(
      debounceTime(5000)
    ).subscribe(() => this.paErrorMessage = null);
    setTimeout(() => {
      this.paHideNoDataMessage = true;
      this.getPendingProjects();
    }, this.pmConstant.TIME_OUT);
  }
  getPendingProjects() {
    this.fetchPendingProjects();
  }
  async fetchPendingProjects() {
    // this.paArrays.projectItems = await this.spServices.read('' + this.Constant.listNames.ProjectInformation.name + '',
    //   this.pmConstant.pInfoPendingAllocationIndiviualViewOptions);
    if (!this.pmObject.allProjectItems.length) {
      let arrResults: any = [];
      // Get all project information based on current user.
      arrResults = await this.pmCommonService.getProjects(true);
      this.pmObject.allProjectItems = arrResults;
    }
    this.paArrays.projectItems = this.pmObject.allProjectItems.filter(x => x.Status === this.Constant.projectStatus.Unallocated);
    this.pmObject.countObj.paCount = this.paArrays.projectItems.length;
    this.pmObject.totalRecords.PendingAllocation = this.pmObject.countObj.paCount;
    const projectCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const POCTempArray = [];
    const deliveryTypeTempArray = [];
    const taTempArray = [];
    const moleculeTempArray = [];
    const primaryResourceTempArray = [];
    const milestoneTempArray = [];
    const statusTempArray = [];
    if (this.paArrays.projectItems.length) {
      this.pmObject.tabMenuItems[4].label = 'Pending Allocation (' + this.pmObject.countObj.paCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      const tempPAArray = [];
      // Iterate each CR Task
      for (const task of this.paArrays.projectItems) {
        const paObj = $.extend(true, {}, this.pmObject.paObj);
        paObj.ID = task.ID;
        paObj.ProjectCode = task.ProjectCode;
        paObj.ShortTitle = task.WBJID;
        paObj.WBJID = task.WBJID;
        paObj.ClientLegalEntity = task.ClientLegalEntity;
        paObj.DeliverableType = task.DeliverableType;
        paObj.TA = task.TA != null ? task.TA : '-';
        paObj.Molecule = task.Molecule != null ? task.Molecule : '-';
        paObj.Milestone = task.Milestone != null ? task.Milestone : '-';
        paObj.Status = task.Status;
        paObj.PrimaryResourceText = this.commonService.returnText(task.PrimaryResMembers.results);
        const poc = this.pmObject.projectContactsItems.filter((obj) => {
          return (obj.ID === task.PrimaryPOC);
        });
        paObj.POC = poc.length > 0 ? poc[0].FullNameCC : '';
        // Adding the particular value into the array for sorting and filtering.
        projectCodeTempArray.push({ label: paObj.ProjectCode, value: paObj.ProjectCode });
        shortTitleTempArray.push({ label: paObj.ShortTitle, value: paObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: paObj.ClientLegalEntity, value: paObj.ClientLegalEntity });
        POCTempArray.push({ label: paObj.POC, value: paObj.POC });
        deliveryTypeTempArray.push({ label: paObj.DeliverableType, value: paObj.DeliverableType });
        taTempArray.push({ label: paObj.TA, value: paObj.TA });
        moleculeTempArray.push({ label: paObj.Molecule, value: paObj.Molecule });
        primaryResourceTempArray.push({ label: paObj.PrimaryResourceText, value: paObj.PrimaryResourceText });
        milestoneTempArray.push({ label: paObj.Milestone, value: paObj.Milestone });
        statusTempArray.push({ label: paObj.Status, value: paObj.Status });
        tempPAArray.push(paObj);
      }
      if (tempPAArray.length) {
        this.createColFieldValues(tempPAArray);
      }
      // this.paArrays.ProjectCode = this.commonService.unique(projectCodeTempArray, 'value');
      // this.paArrays.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      // this.paArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      // this.paArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      // this.paArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      // this.paArrays.taArray = this.commonService.unique(taTempArray, 'value');
      // this.paArrays.moleculeArray = this.commonService.unique(moleculeTempArray, 'value');
      // this.paArrays.primaryResourceArray = this.commonService.unique(primaryResourceTempArray, 'value');
      // this.paArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      // this.paArrays.statusArray = this.commonService.unique(statusTempArray, 'value');
      this.pmObject.pendingAllocationArray = tempPAArray;
      this.isPATableHidden = false;
      this.isPAInnerLoaderHidden = true;
      this.isPATableHidden = false;
    } else {
      this.pmObject.tabMenuItems[4].label = 'Pending Allocation (' + this.pmObject.countObj.paCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      this.paHideNoDataMessage = false;
      this.isPAInnerLoaderHidden = true;
      this.isPATableHidden = true;
    }
    this.commonService.setIframeHeight();
  }

  createColFieldValues(resArray) {

    this.paArrays.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.paArrays.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.paArrays.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.paArrays.TA = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.TA, value: a.TA }; return b; }).filter(ele => ele.label)));
    this.paArrays.Molecule = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Molecule, value: a.Molecule }; return b; }).filter(ele => ele.label)));
    // this.paArrays.PrimaryResMembers = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PrimaryResMembers, value: a.PrimaryResMembers }; return b; }).filter(ele => ele.label)));
    this.paArrays.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
    this.paArrays.DeliverableType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }).filter(ele => ele.label)));
    this.paArrays.Milestone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Milestone, value: a.Milestone }; return b; }).filter(ele => ele.label)));
    this.paArrays.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));



    // const RevenueBudget = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.RevenueBudget, value: a.RevenueBudget }; return b; }).filter(ele => ele.label));
    // this.paArrays.RevenueBudget = this.commonService.customSort(RevenueBudget, 'label', 1);
    // const OOPBudget = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.OOPBudget, value: a.OOPBudget }; return b; }).filter(ele => ele.label));


    // this.allSOW.ModifiedDate = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ModifiedDateFormat, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.ModifiedDateFormat, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label)));

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

  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/dashboard#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
    // window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
    //   '/Pages/ProjectManagement.aspx?ProjectCode=' + task.ProjectCode, '_blank');
    this.pmObject.columnFilter.ProjectCode = [task.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);
  }
  paLazyLoadTask(event) {
    const paArray = this.pmObject.pendingAllocationArray;
    this.commonService.lazyLoadTask(event, paArray, this.filterColumns, this.pmConstant.filterAction.PENDING_ALLOCATION);
  }
  storeRowData(rowData) {
    this.selectedPATask = rowData;
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
    if (this.pmObject.pendingAllocationArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.paTableRef,
        colFields: this.paArrays
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


}
