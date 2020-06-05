import { Component, OnInit, OnDestroy, ViewChild, HostListener, ApplicationRef, NgZone, ChangeDetectorRef, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ProjectDraftsComponent } from './project-drafts/project-drafts.component';
import { TimelineComponent } from 'src/app/task-allocation/timeline/timeline.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ViewUploadDocumentDialogComponent } from 'src/app/shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { Table } from 'primeng/table';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';

@Component({
  selector: 'app-search-projects',
  templateUrl: './search-projects.component.html',
  styleUrls: ['./search-projects.component.css']
})
export class SearchProjectsComponent implements OnInit, OnDestroy {

  @ViewChild(ProjectDraftsComponent, { static: false })
  projectDraftsComponent: ProjectDraftsComponent;

  @ViewChild(TimelineComponent, { static: false })
  timelineComponent: TimelineComponent;

  @ViewChild(ViewUploadDocumentDialogComponent, { static: false })
  viewUploadDocumentDialogComponent: ViewUploadDocumentDialogComponent;

  @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
  @ViewChild('project', { static: false }) project: Table;

  selectedDate: DateObj;
  ProjectTitle: any = '';
  ProjectCode: any = '';
  batchContents: any[];
  response: any[];
  loaderenable = false;
  tableviewenable = false;
  projectMenu: MenuItem[];
  cols: { field: string; header: string; }[];
  ProjectColArray: any;
  ProjectList: any;
  showDetailsenable = false;
  onSearchProject = true;
  step: number;
  modalloaderenable = false;
  projectDisplayTitle: any;
  ProjectPopupDetails: any;
  showDetails: boolean;
  projectResource: any = [];
  public ProjectDetails = {
    hoursSpent: 0,
    spentHours: 0,
    availableHours: 0,
    budgetHours: 0,
    allocatedHours: 0,
    totalMilestoneBudgetHours: 0,
    projectCode: '',
    projectID: '',
    status: '',
    projectFolder: '',
    currentMilestone: '',
    writer: { results: [] },
    allResources: { results: [] },
    reviewer: { results: [] },
    qualityChecker: { results: [] },
    editor: { results: [] },
    graphicsMembers: { results: [] },
    cmLevel1: { results: [] },
    pubSupportMembers: { results: [] },
    primaryResources: { results: [] },
    allMilestones: [],
    ta: [],
    deliverable: [],
    account: [],
  };
  tempClick: any;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  dialogComponentRef: ComponentRef<TimelineHistoryComponent>

  constructor(
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService,
    public router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private _applicationRef: ApplicationRef,
    zone: NgZone
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

  async ngOnInit() {
    const route = this.router.url;
    this.ProjectCode = this.route.snapshot.queryParams['ProjectCode'];
    if (this.ProjectCode !== undefined) {
      await this.SearchProject();  
      if(this.ProjectList){
        this.getProjectDetails(this.ProjectList[0]);
        this.router.navigate([]);
      }
    }
    if (route.indexOf('search-projects') > -1 ) {
      this.onSearchProject = true;
    } else {
      this.onSearchProject = false;
    }
   
    this.cols = [
      { field: 'SOWCode', header: 'SOW Code' },
      { field: 'ProjectCode', header: 'Project Code' },
      { field: 'WBJID', header: 'Short Title' },
      { field: 'ClientLegalEntity', header: 'Client' },
      { field: 'DeliverableType', header: 'Deliverable Type' },
      { field: 'ProjectType', header: 'Project Type' },
      { field: 'Status', header: 'Status' },
      { field: 'CreatedBy', header: 'Created By' },
      { field: 'CreatedDate', header: 'Created Date' },
    ];
  }


  // *************************************************************************************************************************************
  // hide popup menu on production
  // *************************************************************************************************************************************

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



  // *************************************************************************************************
  //  pop up menu options
  // **************************************************************************************************

  openPopup(data) {
    this.projectMenu = [
      { label: 'View Details', command: (e) => this.getProjectDetails(data) },
      { label: 'Show History', command: (event) => this.showTimeline(data) },
    ];
  }

  // ************************************************************************************************
  //  destroy load components
  // **************************************************************************************************

  onCancel() {
    this.projectDraftsComponent.ngOnDestroy();
    this.viewUploadDocumentDialogComponent.ngOnDestroy();
    this.timelineComponent.ngOnDestroy();
  }

  // **************************************************************************************************
  //   create column heading multiselect options
  // **************************************************************************************************

  createColFieldValues(resArray) {

    this.ProjectColArray = {
      SOWCode: [], ProjectCode: [], WBJID: [], ClientLegalEntity: [],
      DeliverableType: [], ProjectType: [], Status: [], CreatedBy: [], CreatedDate: []
    };
    this.ProjectColArray.SOWCode = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.SOWCode, value: a.SOWCode }; return b;
      })));

    this.ProjectColArray.ProjectCode = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.ProjectCode, value: a.ProjectCode }; return b;
      })));

    this.ProjectColArray.WBJID = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.WBJID, value: a.WBJID }; return b;
      })));

    this.ProjectColArray.ClientLegalEntity = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b;
      })));

    this.ProjectColArray.DeliverableType = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.DeliverableType, value: a.DeliverableType }; return b;
      })));

    this.ProjectColArray.ProjectType = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.ProjectType, value: a.ProjectType }; return b;
      })));

    this.ProjectColArray.Status = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.Status, value: a.Status }; return b;
      })));


    this.ProjectColArray.CreatedBy = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: a.CreatedBy, value: a.CreatedBy }; return b;
      })));


    this.ProjectColArray.CreatedDate.push.apply(this.ProjectColArray.CreatedDate,
      this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = { label: this.datePipe.transform(a.CreatedDate, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.CreatedDate, 'MMM dd, yyyy, h:mm a')) }; return b;
      })));



    this.ProjectColArray.CreatedDate = this.ProjectColArray.CreatedDate.sort((a, b) =>
      new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );

    this.loaderenable = false;
    this.tableviewenable = true;
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.SearchProject();
    }
  }

  // *************************************************************************************************************************************
  //   Search projects
  // *************************************************************************************************************************************

  async SearchProject() {

    this.ProjectPopupDetails = Object.assign({}, this.ProjectDetails);
    this.ProjectPopupDetails = undefined;
    this.projectResource = [];
    this.ProjectList = undefined;
    this.tableviewenable = false;
    this.modalloaderenable = true;

    if (!this.ProjectCode && !this.ProjectTitle) {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'Please Enter Project Code or Project Short Title.'
      });
    } else {
      this.loaderenable = true;
      // this.batchContents = new Array();
      // const batchGuid = this.spServices.generateUUID();
      let Project;
      if (this.ProjectCode !== '') {
        Project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformation);
        Project.filterByCode = Project.filterByCode.replace(/{{projectCode}}/gi, this.ProjectCode.trim());
        Project.filter = Project.filterByCode;
      } else {
        this.ProjectTitle.trimStart();
        Project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformation);
        Project.filterByTitle = Project.filterByTitle.replace(/{{shortTitle}}/gi, this.ProjectTitle.trimEnd());
        Project.filter = Project.filterByTitle;
      }

      // const ProjectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', Project);
      // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectUrl);
      // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
      this.commonService.SetNewrelic('MyDashboard', 'SearchProject', 'GetProjectInfoByProjectCode');
      this.response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, Project);
      if (this.response.length > 0) {
        this.ProjectList = this.response;

        this.ProjectList.map(c => c.Created = new Date(this.datePipe.transform(c.Created, 'MMM dd, yyyy, h:mm a')));

        this.ProjectList.map(c => c.CreatedBy = c.Author.Title);

        this.ProjectList = this.ProjectList.map(c => {
          c['CreatedDate'] = c['Created'];
          // delete c['Created'];
          return c;
        })

        console.log('this.ProjectList ', this.ProjectList);
        this.createColFieldValues(this.ProjectList);

        this.ProjectCode = '';
        this.ProjectTitle = '';

      } else {
        this.loaderenable = false;
        if (this.ProjectCode !== '') {
          this.messageService.add({
            key: 'custom', severity: 'error', summary: 'Warning Message',
            // tslint:disable-next-line: quotemark
            detail: "Project code doesn't exist. Please verify if it is correct."
          });
        } else {
          this.loaderenable = false;
          this.messageService.add({
            key: 'custom', severity: 'error', summary: 'Warning Message',
            // tslint:disable-next-line: quotemark
            detail: "Project Short Title doesn't exist. Please verify if it is correct."
          });
        }
      }

    }
  }

  focusFunction(event) {
    this.ProjectTitle = event === 'ProjectCode' ? '' : this.ProjectTitle;
    this.ProjectCode = event === 'ProjectTitle' ? '' : this.ProjectCode;
  }
  // **************************************************************************************************
  //  get project details by search
  // **************************************************************************************************

  getProjectDetails(project) {

    this.showDetails = true;
    this.step = 4;
    this.ProjectDetails = project;

    this.modalloaderenable = true;
    this.projectDisplayTitle = project.ProjectCode + ' - ' + project.ClientLegalEntity;
    this.ProjectPopupDetails = project;
    this.ProjectPopupDetails.IsSearchProject = true;
    this.ProjectPopupDetails.POC = this.sharedObject.DashboardData.ProjectContacts.find(c => c.ID ===
      project.PrimaryPOC) !== undefined ? this.sharedObject.DashboardData.ProjectContacts.find(c =>
        c.ID === project.PrimaryPOC).FullName : '';

    this.modalloaderenable = false;

    this.showDetailsenable = true;
    this.GetProjectResources();

  }

  // *************************************************************************************************
  //   to get event on title click
  // **************************************************************************************************
  async setStep(index: number) {

    this.step = index;
  }
  // *************************************************************************************************
  //   to get event on title click
  // **************************************************************************************************

  async GetProjectResources() {
    const batchUrl = [];
    this.response = [];
    const ProjectInfoResources = Object.assign({}, this.queryConfig);
    ProjectInfoResources.url = this.spServices.getReadURL(this.constants.listNames.ProjectInformation.name, this.myDashboardConstantsService.mydashboardComponent.ProjectInfoResources);
    ProjectInfoResources.url = ProjectInfoResources.url.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    ProjectInfoResources.listName = this.constants.listNames.ProjectInformation.name;
    ProjectInfoResources.type = 'GET';
    batchUrl.push(ProjectInfoResources);

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    // const ProjectInfoResources = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInfoResources);
    // ProjectInfoResources.filter = ProjectInfoResources.filter.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    // const ProjectInfoResourcesUrl = this.spServices.getReadURL('' +
    //   this.constants.listNames.ProjectInformation.name + '', ProjectInfoResources);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectInfoResourcesUrl);

    // const ProjectResources = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectResource);
    // ProjectResources.filter = ProjectResources.filter.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    // const ProjectResourcesUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', ProjectResources);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectResourcesUrl);

    const ProjectResources = Object.assign({}, this.queryConfig);
    ProjectResources.url = this.spServices.getReadURL(this.constants.listNames.ProjectInformation.name, this.myDashboardConstantsService.mydashboardComponent.ProjectResource);
    ProjectResources.url = ProjectResources.url.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    ProjectResources.listName = this.constants.listNames.ProjectInformation.name;
    ProjectResources.type = 'GET';
    batchUrl.push(ProjectResources);

    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.commonService.SetNewrelic('MyDashboard', 'SearchProject', 'GetProjectResourcesByProjectCode');
    const result = await this.spServices.executeBatch(batchUrl);
    const prjResInfo = result.length > 0 ? result[0].retItems : [];
    const prjResReponse = result.length > 1 ? result[1].retItems : [];
    this.response.push(prjResInfo);
    this.response.push(prjResReponse);
    this.ProjectDetails.cmLevel1 = this.response[1][0].CMLevel1;

    this.projectResource.CMMembers = this.response[1].map(c => c).map(c => c.CMLevel1)[0].results ?
      this.response[1].map(c => c).map(c => c.CMLevel1).map(c => c.results)[0].map(c => c.Title) + ', '
      + this.response[1][0].CMLevel2.Title : this.response[1][0].CMLevel2.Title;

    this.projectResource.PMMembers = this.response[1].map(c => c).map(c => c.DeliveryLevel1)[0]
      .results ? this.response[1].map(c => c).map(c => c.DeliveryLevel1).map(c => c.results)[0].map(c =>
        c.Title) + ', ' + this.response[1][0].DeliveryLevel2.Title : this.response[1][0].DeliveryLevel2.Title;

    this.projectResource.PrimaryResource = this.response[0].map(c => c).map(c => c.PrimaryResMembers)
      .find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.PrimaryResMembers)
        .map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Writers = this.response[0].map(c => c).map(c => c.Writers).find(c =>
      c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Writers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Reviewers = this.response[0].map(c => c).map(c => c.Reviewers).find(c =>
      c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Reviewers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Editors = this.response[0].map(c => c).map(c => c.Editors).find(c =>
      c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Editors).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.GraphicsMembers = this.response[0].map(c => c).map(c => c.GraphicsMembers)
      .find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.GraphicsMembers).map
        (c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.QC = this.response[0].map(c => c).map(c => c.QC).find(c => c.results) !==
      undefined ? this.response[0].map(c => c).map(c => c.QC).map(c => c.results)[0].map(e => e.Title) :
      '';


    this.projectResource.PubSupport = this.response[0].map(c => c).map(c => c.PSMembers).find(c =>
      c.results) !== undefined ? this.response[0].map(c => c).map(c => c.PSMembers).map(c => c.results)[0].map(e => e.Title) : '';
  }

  showTimeline(selectedProjectObj) {
    const route = this.router.url;
    if (route.indexOf('myDashboard') > -1) {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'ProjectFromDashboard');
    } else {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'Project');
    }
  }

  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.ProjectList && this.isOptionFilter) {
      console.log('this.timeline ', this.timeline);
      const obj = {
        tableData: this.project,
        colFields: this.ProjectColArray
      };
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
  }


  // **************************************************************************************************
  //   This function is used to open or download project scope 
  // **************************************************************************************************
  async goToProjectScope(project) {
    const response = await this.commonService.goToProjectScope(project, project.Status);
    if (response === 'No Document Found.') {
      this.messageService.add({
        key: 'custom', severity: 'error', summary: 'Error Message',
        detail: project.ProjectCode + ' - Project Scope not found.'
      });
    }
    else {
      window.open(response);
    }
  }

}



interface DateObj {
  label: string;
  value: string;
}

