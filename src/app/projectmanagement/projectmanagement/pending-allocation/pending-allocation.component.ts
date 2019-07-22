import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { PMCommonService } from '../../services/pmcommon.service';
declare var $: any;
@Component({
  selector: 'app-pending-allocation',
  templateUrl: './pending-allocation.component.html',
  styleUrls: ['./pending-allocation.component.css']
})
export class PendingAllocationComponent implements OnInit {
  tempClick: any;

  displayedColumns: any[] = [
    { field: 'ProjectCode', header: 'Project Code'},
    { field: 'ClientLegalEntity', header: 'Client' },
    { field: 'POC', header: 'POC'  },
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'TA', header: 'TA' },
    { field: 'Molecule', header: 'Molecule'},
    { field: 'PrimaryResourceText', header: 'Primary Resource' },
    { field: 'Milestone', header: 'Milestone' },
    { field: 'Status', header: 'Status' }
  ];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ClientLegalEntity' },
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
    projectCodeArray: [],
    clientLegalEntityArray: [],
    POCArray: [],
    taArray: [],
    moleculeArray: [],
    primaryResourceArray: [],
    deliveryTypeArray: [],
    milestoneArray: [],
    statusArray: []
  };
  @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
  constructor(
    public globalObject: GlobalService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SharepointoperationService,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService) { }

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
      arrResults = await this.pmCommonService.getProjects();
      this.pmObject.allProjectItems = arrResults;
    }
    this.paArrays.projectItems = this.pmObject.allProjectItems.filter(x => x.Status === this.Constant.projectStatus.Unallocated);
    this.pmObject.countObj.paCount = this.paArrays.projectItems.length;
    this.pmObject.totalRecords.PendingAllocation = this.pmObject.countObj.paCount;
    const projectCodeTempArray = [];
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
        paObj.POC = poc.length > 0 ? poc[0].FullName : '';
        // Adding the particular value into the array for sorting and filtering.
        projectCodeTempArray.push({ label: paObj.ProjectCode, value: paObj.ProjectCode });
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
      this.paArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      this.paArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.paArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      this.paArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      this.paArrays.taArray = this.commonService.unique(taTempArray, 'value');
      this.paArrays.moleculeArray = this.commonService.unique(moleculeTempArray, 'value');
      this.paArrays.primaryResourceArray = this.commonService.unique(primaryResourceTempArray, 'value');
      this.paArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      this.paArrays.statusArray = this.commonService.unique(statusTempArray, 'value');
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
  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/Pages/TaskAllocation.aspx?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/Pages/ProjectManagement.aspx?ProjectCode=' + task.ProjectCode, '_blank');
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
      if (event.target.className === "pi pi-ellipsis-v") {
        if (this.tempClick) {
          this.tempClick.style.display = "none";
          if(this.tempClick !== event.target.parentElement.children[0].children[0]) {
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
          this.tempClick =  undefined;
        }
      }
    }
}
