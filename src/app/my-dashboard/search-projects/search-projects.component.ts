import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ProjectDraftsComponent } from './project-drafts/project-drafts.component';
import { TimelineComponent } from 'src/app/task-allocation/timeline/timeline.component';
import { ViewUploadDocumentDialogComponent } from '../view-upload-document-dialog/view-upload-document-dialog.component';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TimelineHistoryComponent } from './../../timeline/timeline-history/timeline-history.component';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-search-projects',
  templateUrl: './search-projects.component.html',
  styleUrls: ['./search-projects.component.css']
})
export class SearchProjectsComponent implements OnInit, OnDestroy {

  @ViewChild(ProjectDraftsComponent, { static: true })
  projectDraftsComponent: ProjectDraftsComponent;

  @ViewChild(TimelineComponent, { static: true })
  timelineComponent: TimelineComponent;

  @ViewChild(ViewUploadDocumentDialogComponent, { static: true })
  viewUploadDocumentDialogComponent: ViewUploadDocumentDialogComponent;

  @ViewChild('timelineRef', { static: true })
  timeline: TimelineHistoryComponent;

  selectedDate: DateObj;
  ProjectTitle: any = '';
  ProjectCode: any = '';
  batchContents: any[];
  response: any[];
  loaderenable: boolean = false;
  tableviewenable: boolean = false;
  projectMenu: MenuItem[];
  cols: { field: string; header: string; }[];
  ProjectColArray: any;
  ProjectList: any;
  showDetailsenable: boolean = false;
  onSearchProject: boolean = true;
  step: number;
  modalloaderenable: boolean = false;
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


  constructor(public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService, public router: Router) { }

  ngOnInit() {
    const route = this.router.url;

    if (route.indexOf('search-projects') > -1) {
      this.onSearchProject = true;
    }
    else {
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
      { field: 'Created', header: 'Created Date' },
    ];
  }

  ngOnDestroy() {
  }


  // *************************************************************************************************************************************
  // hide popup menu on production 
  // *************************************************************************************************************************************

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



   // *************************************************************************************************************************************
  //  pop up menu options 
  // *************************************************************************************************************************************

  openPopup(data) {
    this.projectMenu = [
      { label: 'View Details', command: (e) => this.getProjectDetails(data) },
      { label: 'Show History', command: (event) => this.showTimeline(data) },
    ];
  }

   // *************************************************************************************************************************************
  //  destroy load components 
  // *************************************************************************************************************************************

  onCancel() {
    this.projectDraftsComponent.ngOnDestroy();
    this.viewUploadDocumentDialogComponent.ngOnDestroy();
    this.timelineComponent.ngOnDestroy();
  }

    // *************************************************************************************************************************************
  //   create column heading multiselect options
  // *************************************************************************************************************************************

  createColFieldValues() {

    this.ProjectColArray = { SOWCode: [], ProjectCode: [], WBJID: [], ClientLegalEntity: [], DeliverableType: [], ProjectType: [], Status: [], CreatedBy: [], Created: [] };
    this.ProjectColArray.SOWCode = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; })));

    this.ProjectColArray.ProjectCode = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; })));

    this.ProjectColArray.WBJID = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.WBJID, value: a.WBJID }; return b; })));

    this.ProjectColArray.ClientLegalEntity = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; })));

    this.ProjectColArray.DeliverableType = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.DeliverableType, value: a.DeliverableType }; return b; })));

    this.ProjectColArray.ProjectType = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.ProjectType, value: a.ProjectType }; return b; })));

    this.ProjectColArray.Status = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.Status, value: a.Status }; return b; })));


    this.ProjectColArray.CreatedBy = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: a.CreatedBy, value: a.CreatedBy }; return b; })));


    this.ProjectColArray.Created.push.apply(this.ProjectColArray.Created, this.myDashboardConstantsService.uniqueArrayObj(this.ProjectList.map(a => { let b = { label: this.datePipe.transform(a.Created, "MMM d, y, h:mm a"), value: a.Created }; return b; })));



    this.ProjectColArray.Created = this.ProjectColArray.Created.sort((a, b) =>
      new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );


    this.loaderenable = false;
    this.tableviewenable = true;
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
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
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Enter Project Code or Project Short Title.' });
    }
    else {
      this.loaderenable = true;
      this.batchContents = new Array();
      const batchGuid = this.spServices.generateUUID();
      var Project;
      if (this.ProjectCode !== '') {
        Project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformation);
        Project.filterByCode = Project.filterByCode.replace(/{{projectCode}}/gi, this.ProjectCode.trim());
        Project.filter = Project.filterByCode;
      }
      else {
        this.ProjectTitle.trimStart();
        Project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformation);
        Project.filterByTitle = Project.filterByTitle.replace(/{{shortTitle}}/gi, this.ProjectTitle.trimEnd());
        Project.filter = Project.filterByTitle;
      }

      const ProjectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', Project);
      this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectUrl);
      this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

      if (this.response[0].length > 0) {
        this.ProjectList = this.response[0];

        this.ProjectList.map(c => c.Created = new Date(c.Created));

        this.ProjectList.map(c => c.CreatedBy = c.Author.Title);

        this.createColFieldValues();

        this.ProjectCode = '';
        this.ProjectTitle = '';

      }
      else {
        this.loaderenable = false;
        if (this.ProjectCode !== '') {
          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Warning Message', detail: "Project code doesn't exist. Please verify if it is correct." });
        }
        else {
          this.loaderenable = false;
          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Warning Message', detail: "Project Short Title doesn't exist. Please verify if it is correct." });
        }
      }

    }
  }

  focusFunction(event) {
    this.ProjectTitle = event === 'ProjectCode' ? '' : this.ProjectTitle;
    this.ProjectCode = event === 'ProjectTitle' ? '' : this.ProjectCode;
  }
  // *************************************************************************************************************************************
  //  get project details by search
  // *************************************************************************************************************************************

  getProjectDetails(project) {

    this.showDetails = true;
    this.step = 4;
    this.ProjectDetails = project;

    this.modalloaderenable = true;
    this.projectDisplayTitle = project.ProjectCode + " - " + project.ClientLegalEntity;
    this.ProjectPopupDetails = project;
    this.ProjectPopupDetails.IsSearchProject = true;
    this.ProjectPopupDetails.POC = this.sharedObject.DashboardData.ProjectContacts.find(c => c.ID === project.PrimaryPOC) !== undefined ? this.sharedObject.DashboardData.ProjectContacts.find(c => c.ID === project.PrimaryPOC).FullName : '';

    this.modalloaderenable = false;

    this.showDetailsenable = true;
    this.GetProjectResources();

  }



  // *************************************************************************************************************************************
  //   to get event on title click 
  // *************************************************************************************************************************************


  async setStep(index: number) {

    this.step = index;
  }


  //*************************************************************************************************
  //   to get event on title click 
  //***************************************************************************************************

  async GetProjectResources() {

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();


    let ProjectInfoResources = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInfoResources);
    ProjectInfoResources.filter = ProjectInfoResources.filter.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    const ProjectInfoResourcesUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', ProjectInfoResources);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectInfoResourcesUrl);


    let ProjectResources = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectResource);
    ProjectResources.filter = ProjectResources.filter.replace(/{{projectId}}/gi, this.ProjectPopupDetails.ID);
    const ProjectResourcesUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', ProjectResources);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectResourcesUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.ProjectDetails.cmLevel1 = this.response[1][0].CMLevel1;


    this.projectResource.CMMembers = this.response[1].map(c => c).map(c => c.CMLevel1)[0].results ? this.response[1].map(c => c).map(c => c.CMLevel1).map(c => c.results)[0].map(c => c.Title) + ", " + this.response[1][0].CMLevel2.Title : this.response[1][0].CMLevel2.Title;

    this.projectResource.PMMembers = this.response[1].map(c => c).map(c => c.DeliveryLevel1)[0].results ? this.response[1].map(c => c).map(c => c.DeliveryLevel1).map(c => c.results)[0].map(c => c.Title) + ", " + this.response[1][0].DeliveryLevel2.Title : this.response[1][0].DeliveryLevel2.Title;

    // this.projectResource.PMMembers = this.response[1][0].DeliveryLevel1.Title ? this.response[1][0].DeliveryLevel1.Title + ", " + this.response[1][0].DeliveryLevel2.Title : this.response[1][0].DeliveryLevel2.Title;

    this.projectResource.PrimaryResource = this.response[0].map(c => c).map(c => c.PrimaryResMembers).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.PrimaryResMembers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Writers = this.response[0].map(c => c).map(c => c.Writers).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Writers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Reviewers = this.response[0].map(c => c).map(c => c.Reviewers).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Reviewers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.Editors = this.response[0].map(c => c).map(c => c.Editors).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.Editors).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.GraphicsMembers = this.response[0].map(c => c).map(c => c.GraphicsMembers).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.GraphicsMembers).map(c => c.results)[0].map(e => e.Title) : '';

    this.projectResource.QC = this.response[0].map(c => c).map(c => c.QC).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.QC).map(c => c.results)[0].map(e => e.Title) : '';


    this.projectResource.PubSupport = this.response[0].map(c => c).map(c => c.PSMembers).find(c => c.results) !== undefined ? this.response[0].map(c => c).map(c => c.PSMembers).map(c => c.results)[0].map(e => e.Title) : '';
  }

  showTimeline(selectedProjectObj) {
    const route = this.router.url;
    if (route.indexOf('myDashboard') > -1) {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'ProjectFromDashboard');
    } else {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'Project');
    }
  }
}



interface DateObj {
  label: string;
  value: string;
}

