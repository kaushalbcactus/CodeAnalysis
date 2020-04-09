import { Component, OnInit, ViewChild, ViewEncapsulation, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-inactive',
  templateUrl: './inactive.component.html',
  styleUrls: ['./inactive.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class InactiveComponent implements OnInit {
  tempClick: any;
  @ViewChild('iapTableRef', { static: false }) iapTableRef: Table;

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
    { field: 'Status', header: 'Status' }];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'TA' },
    { field: 'Molecule' },
    { field: 'Milestone' },
    { field: 'Status' }];

  public iapSuccessMessage: string;
  public iapErrorMessage: string;
  public selectedIAPTask;
  public iapContextMenuOptions = [];
  popItems: MenuItem[];
  isIAPInnerLoaderHidden = true;
  isIAPFilterHidden = true;
  isIAPTableHidden = true;
  iapHideNoDataMessage = true;
  public iapArrays = {
    projectItems: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    POC: [],
    TA: [],
    Molecule: [],
    PrimaryResource: [],
    DeliverableType: [],
    Milestone: [],
    Status: [],
    // projectCodeArray: [],
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
  constructor(
    public globalObject: GlobalService,
    public pmObject: PMObjectService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SPOperationService,
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
  @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
  ngOnInit() {
    this.isIAPInnerLoaderHidden = false;
    this.isIAPFilterHidden = false;
    this.popItems = [
      // {
      //   label: 'Go to Allocation', target: '_blank',
      //   command: (task) => this.goToAllocationPage(this.selectedIAPTask)
      // },
      {
        label: 'Go to Project', target: '_blank',
        command: (task) => this.goToProjectManagement(this.selectedIAPTask)
      },
      {
        label: 'Show History', target: '_blank',
        command: (task) => this.timeline.showTimeline(this.selectedIAPTask.ID, 'ProjectMgmt', 'Project')
      }
    ];
    this.pmObject.sendToClientArray = [];
    this.iapHideNoDataMessage = true;
    this.getPendingProjects();
  }
  getPendingProjects() {
    this.fetchPendingProjects();
  }
  async fetchPendingProjects() {
    // this.iapArrays.projectItems = await this.spServices.read('' + this.Constant.listNames.ProjectInformation.name + '',
    //   this.pmConstant.pInfoInactiveProjectIndiviualViewOptions);
    if (!this.pmObject.allProjectItems.length) {
      let arrResults: any = [];
      // Get all project information based on current user.
      arrResults = await this.pmCommonService.getProjects(true);
      this.pmObject.allProjectItems = arrResults;
    }
    this.iapArrays.projectItems = this.pmObject.allProjectItems.filter(x =>
      x.Status === this.Constant.projectStatus.OnHold ||
      x.Status === this.Constant.projectStatus.InDiscussion);
    // const projectCodeTempArray = [];
    // const shortTitleTempArray = [];
    // const clientLegalEntityTempArray = [];
    // const POCTempArray = [];
    // const deliveryTypeTempArray = [];
    // const taTempArray = [];
    // const moleculeTempArray = [];
    // const primaryResourceTempArray = [];
    // const milestoneTempArray = [];
    // const statusTempArray = [];
    if (this.iapArrays.projectItems.length) {
      const tempPAArray = [];
      this.pmObject.countObj.iapCount = this.iapArrays.projectItems.length;
      this.pmObject.totalRecords.InactiveProject = this.pmObject.countObj.iapCount;
      this.pmObject.tabMenuItems[5].label = 'Inactive Projects (' + this.pmObject.countObj.iapCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      // Iterate each CR Task
      for (const task of this.iapArrays.projectItems) {
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
        // tslint:disable-next-line:only-arrow-functions
        const poc = this.pmObject.projectContactsItems.filter((obj) => {
          return (obj.ID === task.PrimaryPOC);
        });
        paObj.POC = poc.length > 0 ? poc[0].FullName : '';
        // Adding the particular value into the array for sorting and filtering.
        // projectCodeTempArray.push({ label: paObj.ProjectCode, value: paObj.ProjectCode });
        // shortTitleTempArray.push({ label: paObj.ShortTitle, value: paObj.ShortTitle });
        // clientLegalEntityTempArray.push({ label: paObj.ClientLegalEntity, value: paObj.ClientLegalEntity });
        // POCTempArray.push({ label: paObj.POC, value: paObj.POC });
        // deliveryTypeTempArray.push({ label: paObj.DeliverableType, value: paObj.DeliverableType });
        // taTempArray.push({ label: paObj.TA, value: paObj.TA });
        // moleculeTempArray.push({ label: paObj.Molecule, value: paObj.Molecule });
        // primaryResourceTempArray.push({ label: paObj.PrimaryResourceText, value: paObj.PrimaryResourceText });
        // milestoneTempArray.push({ label: paObj.Milestone, value: paObj.Milestone });
        // statusTempArray.push({ label: paObj.Status, value: paObj.Status });
        tempPAArray.push(paObj);
      }

      if (tempPAArray.length) {
        this.createColFieldValues(tempPAArray);
      }
      // this.iapArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      // this.iapArrays.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      // this.iapArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      // this.iapArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      // this.iapArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      // this.iapArrays.taArray = this.commonService.unique(taTempArray, 'value');
      // this.iapArrays.moleculeArray = this.commonService.unique(moleculeTempArray, 'value');
      // this.iapArrays.primaryResourceArray = this.commonService.unique(primaryResourceTempArray, 'value');
      // this.iapArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      // this.iapArrays.statusArray = this.commonService.unique(statusTempArray, 'value');
      this.pmObject.inActiveProjectArray = tempPAArray;
      this.isIAPTableHidden = false;
      this.isIAPInnerLoaderHidden = true;
      this.isIAPTableHidden = false;
    } else {
      this.pmObject.tabMenuItems[5].label = 'Inactive Projects (' + this.pmObject.countObj.iapCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      this.iapHideNoDataMessage = false;
      this.isIAPInnerLoaderHidden = true;
      this.isIAPTableHidden = true;
    }
    this.commonService.setIframeHeight();
  }

  createColFieldValues(resArray) {
    this.iapArrays.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.iapArrays.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.iapArrays.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.iapArrays.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
    this.iapArrays.TA = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.TA, value: a.TA }; return b; }).filter(ele => ele.label)));
    this.iapArrays.Molecule = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Molecule, value: a.Molecule }; return b; }).filter(ele => ele.label)));
    this.iapArrays.PrimaryResource = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PrimaryResource, value: a.PrimaryResource }; return b; }).filter(ele => ele.label)));
    this.iapArrays.DeliverableType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }).filter(ele => ele.label)));
    this.iapArrays.Milestone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Milestone, value: a.Milestone }; return b; }).filter(ele => ele.label)));
    this.iapArrays.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));

  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      }
    })
  }


  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/dashboard#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
    // window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
    //   '/Pages/ProjectManagement.aspx?ProjectCode=' + task.ProjectCode, '_blank');
    //this.pmObject.columnFilter.ProjectCode = [{ label: task.ProjectCode, value: task.ProjectCode }];
    this.pmObject.columnFilter.ProjectCode = [task.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);

  }
  iapLazyLoadTask(event) {
    const paArray = this.pmObject.inActiveProjectArray;
    this.commonService.lazyLoadTask(event, paArray, this.filterColumns, this.pmConstant.filterAction.INACTIVE_PROJECTS);
  }

  storeRowData(rowData) {
    this.selectedIAPTask = rowData;
  }
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === "pi pi-ellipsis-v") {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = "";
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = "";
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
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
    if (this.pmObject.inActiveProjectArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.iapTableRef,
        colFields: this.iapArrays,
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }
}
