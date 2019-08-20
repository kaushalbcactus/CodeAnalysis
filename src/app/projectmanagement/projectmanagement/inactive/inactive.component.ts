import { Component, OnInit, ViewChild, ViewEncapsulation, HostListener } from '@angular/core';
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
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-inactive',
  templateUrl: './inactive.component.html',
  styleUrls: ['./inactive.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class InactiveComponent implements OnInit {
  tempClick: any;

  displayedColumns: any[] = [
    { field: 'ProjectCode', header: 'Project Code' },
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
  constructor(
    public globalObject: GlobalService,
    public pmObject: PMObjectService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SharepointoperationService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    public router: Router,
  ) { }
  @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
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
    this._success.subscribe((message) => this.iapSuccessMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.iapSuccessMessage = null);
    this._error.subscribe((message) => this.iapErrorMessage = message);
    this._error.pipe(
      debounceTime(5000)
    ).subscribe(() => this.iapErrorMessage = null);
    setTimeout(() => {
      this.iapHideNoDataMessage = true;
      this.getPendingProjects();
    }, this.pmConstant.TIME_OUT);
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
    const projectCodeTempArray = [];
    const clientLegalEntityTempArray = [];
    const POCTempArray = [];
    const deliveryTypeTempArray = [];
    const taTempArray = [];
    const moleculeTempArray = [];
    const primaryResourceTempArray = [];
    const milestoneTempArray = [];
    const statusTempArray = [];
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
      this.iapArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      this.iapArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.iapArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      this.iapArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      this.iapArrays.taArray = this.commonService.unique(taTempArray, 'value');
      this.iapArrays.moleculeArray = this.commonService.unique(moleculeTempArray, 'value');
      this.iapArrays.primaryResourceArray = this.commonService.unique(primaryResourceTempArray, 'value');
      this.iapArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      this.iapArrays.statusArray = this.commonService.unique(statusTempArray, 'value');
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
  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/allocation#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
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
