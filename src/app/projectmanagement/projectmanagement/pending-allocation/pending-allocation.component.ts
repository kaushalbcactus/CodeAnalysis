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
    { field: 'ProjectCode', header: 'Project Code' ,Type:'string',dbName:'ProjectCode' , options:[] },
    { field: 'ShortTitle', header: 'Short Title',Type:'string',dbName:'ShortTitle' , options:[] },
    { field: 'ClientLegalEntity', header: 'Client' ,Type:'string',dbName:'ClientLegalEntity' , options:[]},
    { field: 'POC', header: 'POC' ,Type:'string',dbName:'POC' , options:[]},
    { field: 'DeliverableType', header: 'Deliverable Type',Type:'string',dbName:'DeliverableType' , options:[] },
    { field: 'TA', header: 'TA' ,Type:'string',dbName:'TA' , options:[]},
    { field: 'Molecule', header: 'Molecule' ,Type:'string',dbName:'Molecule' , options:[]},
    { field: 'PrimaryResourceText', header: 'Primary Resource' ,Type:'' , options:[] },
    { field: 'Milestone', header: 'Milestone',Type:'string',dbName:'Milestone' , options:[] },
    { field: 'Status', header: 'Status',Type:'string',dbName:'Status' , options:[] }
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
  projectItems = [];
  // public paArrays = {
  //   projectItems: [],
  //   ProjectCode: [],
  //   ShortTitle: [],
  //   ClientLegalEntity: [],
  //   TA: [],
  //   Molecule: [],
  //   POC: [],
  //   DeliverableType: [],
  //   Milestone: [],
  //   Status: [],
  // };
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
    this.paHideNoDataMessage = true;
    this.getPendingProjects();
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
    this.projectItems = this.pmObject.allProjectItems.filter(x => x.Status === this.Constant.projectStatus.Unallocated);
    this.pmObject.countObj.paCount = this.projectItems.length;
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
    if (this.projectItems.length) {
      this.pmObject.tabMenuItems[4].label = 'Pending Allocation (' + this.pmObject.countObj.paCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      const tempPAArray = [];
      // Iterate each CR Task
      for (const task of this.projectItems) {
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
        this.displayedColumns = await this.commonService.MainfilterForTable(this.displayedColumns, tempPAArray);
      }
      this.pmObject.pendingAllocationArray = tempPAArray;
    } else {
      this.pmObject.tabMenuItems[4].label = 'Pending Allocation (' + this.pmObject.countObj.paCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
    }
    this.isPATableHidden = false;
    this.isPAInnerLoaderHidden = true;
    setTimeout(() => {
      const tabMenuInk: any = document.querySelector('.p-tabmenu-ink-bar');
      const tabMenuWidth: any = document.querySelector('.p-menuitem-link-active');
      tabMenuInk.style.width= tabMenuWidth.offsetWidth + 'px';
    }, 10);
    this.commonService.setIframeHeight();
  }


  goToAllocationPage(task) {
    window.open(this.globalObject.url + '/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  
  goToProjectManagement(task) {
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
 
}
