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
    { field: 'ProjectCode', header: 'Project Code' ,Type:'string',dbName:'ProjectCode' ,options:[] },
    { field: 'ShortTitle', header: 'Short Title' ,Type:'string',dbName:'ShortTitle',options:[] },
    { field: 'ClientLegalEntity', header: 'Client' ,Type:'string',dbName:'ClientLegalEntity',options:[] },
    { field: 'POC', header: 'POC'  ,Type:'string',dbName:'POC' ,options:[]},
    { field: 'DeliverableType', header: 'Deliverable Type' ,Type:'string',dbName:'DeliverableType' ,options:[] },
    { field: 'TA', header: 'TA' ,Type:'string',dbName:'TA' ,options:[] },
    { field: 'Molecule', header: 'Molecule' ,Type:'string',dbName:'Molecule' ,options:[] },
    { field: 'PrimaryResourceText', header: 'Primary Resource' ,Type:'' ,options:[] },
    { field: 'Milestone', header: 'Milestone' ,Type:'string',dbName:'Milestone' ,options:[] },
    { field: 'Status', header: 'Status' ,Type:'string',dbName:'Status'  ,options:[]}];
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
  projectItems=[];
  // public iapArrays = {
  //   projectItems:  [],
  //   ProjectCode: [],
  //   ShortTitle: [],
  //   ClientLegalEntity: [],
  //   POC: [],
  //   TA: [],
  //   Molecule: [],
  //   DeliverableType: [],
  //   Milestone: [],
  //   Status: [],
  // }

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
    if (!this.pmObject.allProjectItems.length) {
      let arrResults: any = [];
      // Get all project information based on current user.
      arrResults = await this.pmCommonService.getProjects(true);
      this.pmObject.allProjectItems = arrResults;
    }
    this.projectItems = this.pmObject.allProjectItems.filter(x =>
      x.Status === this.Constant.projectStatus.OnHold ||
      x.Status === this.Constant.projectStatus.InDiscussion);
    if (this.projectItems.length) {
      const tempPAArray = [];
      this.pmObject.countObj.iapCount = this.projectItems.length;
      this.pmObject.totalRecords.InactiveProject = this.pmObject.countObj.iapCount;
      this.pmObject.tabMenuItems[5].label = 'Inactive Projects (' + this.pmObject.countObj.iapCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
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
        // tslint:disable-next-line:only-arrow-functions
        const poc = this.pmObject.projectContactsItems.filter((obj) => {
          return (obj.ID === task.PrimaryPOC);
        });
        paObj.POC = poc.length > 0 ? poc[0].FullNameCC : '';
        tempPAArray.push(paObj);
      }
      if (tempPAArray.length) {
        // this function return table filters Array
        this.displayedColumns = await this.commonService.MainfilterForTable(this.displayedColumns, tempPAArray);

      }
      this.pmObject.inActiveProjectArray = tempPAArray;
     
    } else {
      this.pmObject.tabMenuItems[5].label = 'Inactive Projects (' + this.pmObject.countObj.iapCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems]; 
    }
    this.isIAPTableHidden = false;
    this.isIAPInnerLoaderHidden = true;
    setTimeout(() => {
      const tabMenuInk: any = document.querySelector('.p-tabmenu-ink-bar');
      const tabMenuWidth: any = document.querySelector('.p-menuitem-link-active');
      tabMenuInk.style.width= tabMenuWidth.offsetWidth + 'px';
    }, 10);
    this.commonService.setIframeHeight();
  }

  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/dashboard#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
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
  
}
