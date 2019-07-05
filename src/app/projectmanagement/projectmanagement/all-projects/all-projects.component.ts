import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, MessageService, DialogService, SelectItem } from 'primeng/api';
import { PMCommonService } from '../../services/pmcommon.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommunicationComponent } from '../communication/communication.component';
import { ProjectAttributesComponent } from '../add-projects/project-attributes/project-attributes.component';
import { ManageFinanceComponent } from '../add-projects/manage-finance/manage-finance.component';
import { TimelineHistoryComponent } from '../../../timeline/timeline-history/timeline-history.component';
import { Router } from '@angular/router';
import { ProjectTimelineComponent } from './project-timeline/project-timeline.component';

declare var $;
@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css']
})
export class AllProjectsComponent implements OnInit {
  @Output() sendOutput = new EventEmitter<string>();
  popItems: MenuItem[];
  selectedProjectObj;
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'Sow Code' },
    { field: 'ProjectCode', header: 'Project Code' },
    { field: 'ShortTitle', header: 'Short Title' },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity' },
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'ProjectType', header: 'Project Type' },
    { field: 'Status', header: 'Status' },
    { field: 'CreatedBy', header: 'Created By' },
    { field: 'CreatedDate', header: 'Created Date' },
  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ProjectCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'DeliverableType' },
    { field: 'ProjectType' },
    { field: 'Status' },
    { field: 'CreatedBy' },
    { field: 'CreatedDate' }];
  public allProjects = {
    sowCodeArray: [],
    projectCodeArray: [],
    shortTitleArray: [],
    clientLegalEntityArray: [],
    deliveryTypeArray: [],
    projectTypeArray: [],
    statusArray: [],
    createdByArray: [],
    createdDateArray: []
  };
  public Ids = {
    projectBudgetBreakUPID: 0,
    projectFinanceID: 0
  };
  isAllProjectLoaderHidden = true;
  isAllProjectTableHidden = true;
  public checkList = {
    addRollingProjectError: false,
    addRollingProjectErrorMsg: ''
  };
  newSelectedSOW;
  moveSOWObjectArray = [];
  sowDropDownArray: SelectItem[];
  @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
  constructor(
    public pmObject: PMObjectService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private constants: ConstantsService,
    private pmConstant: PmconstantService,
    private pmCommonService: PMCommonService,
    private spServices: SPOperationService,
    private messageService: MessageService,
    public dialogService: DialogService,
    public router: Router
  ) { }

  ngOnInit() {
    this.isAllProjectTableHidden = true;
    this.isAllProjectLoaderHidden = false;
    this.popItems = [
      { label: 'Confirm Project', command: (event) => this.changeProjectStatus(this.selectedProjectObj) },
      { label: 'Propose Closure', command: (event) => this.changeProjectStatus(this.selectedProjectObj) },
      { label: 'Audit Project', command: (event) => this.changeProjectStatus(this.selectedProjectObj) },
      { label: 'Close Project', command: (event) => this.changeProjectStatus(this.selectedProjectObj) },
      { label: 'View Project', command: (event) => this.viewProject(this.selectedProjectObj) },
      { label: 'Edit Project', command: (event) => this.editProject(this.selectedProjectObj) },
      { label: 'Communications', command: (event) => this.communications(this.selectedProjectObj) },
      { label: 'Timeline', command: (event) => this.projectTimeline(this.selectedProjectObj) },
      { label: 'Manage Finance', command: (event) => this.manageFinances(this.selectedProjectObj) },
      { label: 'Change SOW', command: (event) => this.moveSOW(this.selectedProjectObj) },
      { label: 'Show History', command: (event) => this.showTimeline(this.selectedProjectObj) },
      { label: 'View Details', command: (event) => this.sendOutput.next(this.selectedProjectObj) }
    ];
    setTimeout(() => {
      this.getAllProjects();
      if (this.pmObject.columnFilter.ProjectCode && this.pmObject.columnFilter.ProjectCode.length) {
        const event = {
          filters: {
            ProjectCode: {
              matchMode: 'in',
              value: this.pmObject.columnFilter.ProjectCode
            }
          },
          first: 0,
          globalFilter: null,
          multiSortMeta: undefined,
          rows: 5,
          sortField: undefined,
          sortOrder: 1
        };
        this.lazyLoadTask(event);
      }
      this.pmObject.columnFilter.ProjectCode = [];
    }, 500);
  }
  /**
   * This method is used to get all projects based on current user credentials.
   */
  getAllProjects() {
    const sowCodeTempArray = [];
    const projectCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const deliveryTypeTempArray = [];
    const projectTypeTempArray = [];
    const statusTempArray = [];
    const createdByTempArray = [];
    const createDateTempArray = [];
    if (this.pmObject.allProjectItems && this.pmObject.allProjectItems.length) {
      const tempAllProjectArray = [];
      for (const task of this.pmObject.allProjectItems) {
        const projObj = $.extend(true, {}, this.pmObject.allProject);
        projObj.ID = task.ID;
        projObj.Title = task.Title;
        projObj.SOWCode = task.SOWCode;
        projObj.ProjectCode = task.ProjectCode;
        projObj.ShortTitle = task.WBJID;
        projObj.ClientLegalEntity = task.ClientLegalEntity;
        projObj.DeliverableType = task.DeliverableType;
        projObj.ProjectType = task.ProjectType;
        projObj.Status = task.Status;
        projObj.CreatedBy = task.Author ? task.Author.Title : '';
        projObj.CreatedDate = this.datePipe.transform(task.Created, 'MMM dd yyyy hh:mm:ss aa');
        projObj.PrimaryPOC = task.PrimaryPOC;
        projObj.PrimaryPOCText = this.pmCommonService.extractNamefromPOC([projObj.PrimaryPOC]);
        projObj.AdditionalPOC = task.POC ? task.POC.split(';#') : [];
        projObj.AdditionalPOCText = this.pmCommonService.extractNamefromPOC(task.POC ? task.POC.split(';#') : []);
        projObj.ProjectFolder = task.ProjectFolder;
        projObj.AuthorId = task.Author.Id;
        projObj.AuthorTitle = task.Author.Title;
        projObj.SubDivision = task.SubDivision ? task.SubDivision : '';
        projObj.TA = task.TA ? task.TA : '';
        projObj.ProposedStartDate = new Date(task.ProposedStartDate);
        projObj.ProposedEndDate = new Date(task.ProposedEndDate);
        projObj.ActualStartDate = new Date(task.ActualStartDate);
        projObj.ActualEndDate = new Date(task.ActualEndDate);
        projObj.Description = task.Description ? task.Description : '';
        projObj.ConferenceJournal = task.ConferenceJournal ? task.ConferenceJournal : '';
        projObj.Comments = task.Comments ? task.Comments : '';
        projObj.PO = task.PO;
        projObj.Milestone = task.Milestones ? task.Milestones : '';
        projObj.Molecule = task.Molecule ? task.Molecule : '';
        projObj.Indication = task.Indication ? task.Indication : '';
        projObj.IsPubSupport = task.IsPubSupport ? task.IsPubSupport : '';
        projObj.SOWBoxLink = task.SOWBoxLink ? task.SOWBoxLink : '';
        projObj.StandardBudgetHrs = task.StandardBudgetHrs ? task.StandardBudgetHrs : 0;
        projObj.CMLevel1ID = task.CMLevel1 && task.CMLevel1.results && task.CMLevel1.results.length ?
          task.CMLevel1.results : null;
        projObj.CMLevel1Title = projObj.CMLevel1ID && projObj.CMLevel1ID.length ?
          this.pmCommonService.extractNameFromId(projObj.CMLevel1ID).join(';#') : '';
        projObj.CMLevel2ID = task.CMLevel2.ID;
        projObj.CMLevel2Title = task.CMLevel2.Title;
        projObj.DeliveryLevel1ID = task.DeliveryLevel1 && task.DeliveryLevel1.results && task.DeliveryLevel1.results.length
          ? task.DeliveryLevel1.results : null;
        projObj.DeliveryLevel1Title = projObj.DeliveryLevel1ID && projObj.DeliveryLevel1ID.length ?
          this.pmCommonService.extractNameFromId(projObj.DeliveryLevel1ID).join(';#') : '';
        projObj.DeliveryLevel2ID = task.DeliveryLevel2.ID;
        projObj.DeliveryLevel2Title = task.DeliveryLevel2.Title;
        projObj.BusinessVertical = task.BusinessVertical ? task.BusinessVertical : '';
        projObj.BillingEntity = task.BillingEntity ? task.BillingEntity : '';
        projObj.SOWLink = task.SOWLink ? task.BillingEntity : '';
        projObj.PubSupportStatus = task.PubSupportStatus ? task.PubSupportStatus : '';
        projObj.IsStandard = task.IsStandard ? task.IsStandard : '';
        projObj.StandardService = task.StandardService ? task.StandardService : '';
        projObj.Priority = task.Priority ? task.Priority : '';
        projObj.Authors = task.Authors ? task.Authors : '';
        switch (projObj.Status) {
          case this.constants.projectStatus.InDiscussion:
            projObj.isRedIndicator = true;
            projObj.SLA = this.pmConstant.ColorIndicator.RED;
            break;
          case this.constants.projectStatus.Unallocated:
            projObj.isBlueIndicator = true;
            projObj.SLA = this.pmConstant.ColorIndicator.BLUE;
            break;
          case this.constants.projectStatus.InProgress:
            projObj.isGreenIndicator = true;
            projObj.SLA = this.pmConstant.ColorIndicator.GREEN;
            break;
          case this.constants.projectStatus.ReadyForClient:
            break;
          case this.constants.projectStatus.AuthorReview:
            break;
          case this.constants.projectStatus.AuditInProgress:
            break;
          case this.constants.projectStatus.SentToAMForApproval:
            break;
          case this.constants.projectStatus.PendingClosure:
            break;
          case this.constants.projectStatus.AwaitingCancelApproval:
            break;
          case this.constants.projectStatus.OnHold:
            break;
        }
        sowCodeTempArray.push({ label: projObj.SOWCode, value: projObj.SOWCode });
        projectCodeTempArray.push({ label: projObj.ProjectCode, value: projObj.ProjectCode });
        shortTitleTempArray.push({ label: projObj.ShortTitle, value: projObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: projObj.ClientLegalEntity, value: projObj.ClientLegalEntity });
        deliveryTypeTempArray.push({ label: projObj.DeliverableType, value: projObj.DeliverableType });
        projectTypeTempArray.push({ label: projObj.ProjectType, value: projObj.ProjectType });
        statusTempArray.push({ label: projObj.Status, value: projObj.Status });
        createdByTempArray.push({ label: projObj.CreatedBy, value: projObj.CreatedBy });
        createDateTempArray.push({ label: projObj.CreatedDate, value: projObj.CreatedDate });
        tempAllProjectArray.push(projObj);
      }
      this.allProjects.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      this.allProjects.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      this.allProjects.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.allProjects.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.allProjects.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      this.allProjects.projectTypeArray = this.commonService.unique(projectTypeTempArray, 'value');
      this.allProjects.statusArray = this.commonService.unique(statusTempArray, 'value');
      this.allProjects.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      this.allProjects.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      this.pmObject.allProjectsArray = tempAllProjectArray;
      this.pmObject.totalRecords.AllProject = tempAllProjectArray.length;
      this.pmObject.allProjectsArrayCopy = tempAllProjectArray.splice(0, 5);
      this.isAllProjectLoaderHidden = true;
      this.isAllProjectTableHidden = false;
    }
  }
  /**
   * This method is used to filter the data based on selected filter.
   * @param event It takes event as a parameter.
   */
  lazyLoadTask(event) {
    const allProjectArray = this.pmObject.allProjectsArray;
    this.commonService.lazyLoadTask(event, allProjectArray, this.filterColumns, this.pmConstant.filterAction.ALL_PROJECTS);
  }
  /**
   * This method is used to store the selected project row object and depend on status show the pop menu
   * @param rowData project object
   * @param menu menu object.
   */
  storeRowData(rowData, menu) {
    this.selectedProjectObj = rowData;
    const status = this.selectedProjectObj.Status;
    const route = this.router.url;
    if (route.indexOf('myDashboard') > -1) {
      menu.model[0].visible = false;
      menu.model[1].visible = false;
      menu.model[2].visible = false;
      menu.model[3].visible = false;
      menu.model[4].visible = false;
      menu.model[5].visible = false;
      menu.model[6].visible = false;
      menu.model[7].visible = false;
      menu.model[8].visible = false;
      menu.model[9].visible = false;
      menu.model[10].visible = false;
    }
    else {
      menu.model[11].visible = false;
      switch (status) {
        case this.constants.projectStatus.InDiscussion:
          menu.model[0].visible = true;
          menu.model[1].visible = false;
          menu.model[2].visible = false;
          menu.model[3].visible = false;
          menu.model[6].visible = true;
          break;
        case this.constants.projectStatus.Unallocated:
        case this.constants.projectStatus.InProgress:
        case this.constants.projectStatus.ReadyForClient:
        case this.constants.projectStatus.OnHold:
        case this.constants.projectStatus.AuthorReview:
          menu.model[0].visible = false;
          menu.model[1].visible = true;
          menu.model[2].visible = false;
          menu.model[3].visible = false;
          menu.model[6].visible = true;
          break;
        case this.constants.projectStatus.AuditInProgress:
          menu.model[0].visible = false;
          menu.model[1].visible = false;
          menu.model[2].visible = true;
          menu.model[3].visible = false;
          menu.model[6].visible = true;
          break;
        case this.constants.projectStatus.PendingClosure:
          menu.model[0].visible = false;
          menu.model[1].visible = false;
          menu.model[2].visible = false;
          menu.model[3].visible = true;
          menu.model[6].visible = false;
          break;
        case this.constants.projectStatus.AwaitingCancelApproval:
          menu.model[6].visible = false;
          break;
      }
    }

  }
  /**
   * This method is called to change the project status based on current project status.
   * @param mins pass project object as a parameter.
   */
  async changeProjectStatus(selectedProjectObj) {
    const status = this.selectedProjectObj.Status;
    const result = await this.getGetIds(selectedProjectObj.ProjectCode);
    if (result && result.length) {
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      switch (status) {
        case this.constants.projectStatus.InDiscussion:
          const piUdateData = {
            __metadata: {
              type: this.constants.listNames.ProjectInformation.type
            },
            Status: this.constants.projectStatus.Unallocated,
            PrevStatus: status,
            ActualStartDate: new Date()
          };
          const piUpdate = Object.assign({}, options);
          piUpdate.data = piUdateData;
          piUpdate.listName = this.constants.listNames.ProjectInformation.name;
          piUpdate.type = 'PATCH';
          piUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, this.selectedProjectObj.ID);
          batchURL.push(piUpdate);
          const prjBudgetBreakupData = {
            __metadata: {
              type: this.constants.listNames.ProjectBudgetBreakup.type
            },
            Status: this.constants.STATUS.APPROVED,
            ApprovalDate: new Date()
          };
          const prjBudgetBreakupUpdate = Object.assign({}, options);
          prjBudgetBreakupUpdate.data = prjBudgetBreakupData;
          prjBudgetBreakupUpdate.listName = this.constants.listNames.ProjectBudgetBreakup.name;
          prjBudgetBreakupUpdate.type = 'PATCH';
          prjBudgetBreakupUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectBudgetBreakup.name,
            this.Ids.projectBudgetBreakUPID);
          batchURL.push(prjBudgetBreakupUpdate);
          break;
        case this.constants.projectStatus.Unallocated:
        case this.constants.projectStatus.InProgress:
        case this.constants.projectStatus.ReadyForClient:
        case this.constants.projectStatus.OnHold:
        case this.constants.projectStatus.AuthorReview:
          const pinfoUdateData = {
            __metadata: {
              type: this.constants.listNames.ProjectInformation.type
            },
            PrevStatus: status,
            Status: this.constants.projectStatus.AuditInProgress,
            ProposedEndDate: new Date()
          };
          const piInfoUpdate = Object.assign({}, options);
          piInfoUpdate.data = pinfoUdateData;
          piInfoUpdate.listName = this.constants.listNames.ProjectInformation.name;
          piInfoUpdate.type = 'PATCH';
          piInfoUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
            this.selectedProjectObj.ID);
          batchURL.push(piInfoUpdate);
          // This function is used to calculate the hour spent for particular projects.
          const hourSpent = await this.getTotalHours(this.selectedProjectObj.ProjectCode);
          const projectFinaceData = {
            __metadata: {
              type: this.constants.listNames.ProjectFinances.type
            },
            HoursSpent: hourSpent,
          };
          const projectFinanceUpdate = Object.assign({}, options);
          projectFinanceUpdate.data = projectFinaceData;
          projectFinanceUpdate.listName = this.constants.listNames.ProjectFinances.name;
          projectFinanceUpdate.type = 'PATCH';
          projectFinanceUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectFinances.name,
            this.Ids.projectFinanceID);
          batchURL.push(projectFinanceUpdate);
          break;
        case this.constants.projectStatus.AuditInProgress:
          this.pmObject.isAuditRollingVisible = true;
          break;
        case this.constants.projectStatus.PendingClosure:
          const picloseUdateData = {
            __metadata: {
              type: this.constants.listNames.ProjectInformation.type
            },
            Status: this.constants.projectStatus.Closed,
            ActualEndDate: new Date(),
            PrevStatus: status,
          };
          const picloseUpdate = Object.assign({}, options);
          picloseUpdate.data = picloseUdateData;
          picloseUpdate.listName = this.constants.listNames.ProjectInformation.name;
          picloseUpdate.type = 'PATCH';
          picloseUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
            this.selectedProjectObj.ID);
          batchURL.push(picloseUpdate);
          break;
      }
      if (status !== this.constants.projectStatus.AuditInProgress) {
        const sResult = await this.spServices.executeBatch(batchURL);
        this.sendEmailBasedOnStatus(status);
        this.messageService.add({
          key: 'allProject', severity: 'success', summary: 'Success Message',
          detail: 'Project Updated Successfully.'
        });
      }
    }
  }
  async getGetIds(projectCode) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Project Budget Breakup  ##0;
    const projectBBGet = Object.assign({}, options);
    const projectBBFilter = Object.assign({}, this.pmConstant.QUERY.PROJECT_BUDGET_BREAKUP_BY_PROJECTCODE);
    projectBBFilter.filter = projectBBFilter.filter.replace(/{{projectCode}}/gi, projectCode).replace(/{{status}}/gi, 'Billed');
    projectBBGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectBudgetBreakup.name,
      projectBBFilter);
    projectBBGet.type = 'GET';
    projectBBGet.listName = this.constants.listNames.ProjectBudgetBreakup.name;
    batchURL.push(projectBBGet);
    // Get Project Finances  ##1;
    const projectFinanceGet = Object.assign({}, options);
    const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi, projectCode).replace(/{{status}}/gi, 'Billed');
    projectFinanceGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinances.name,
      projectFinanceFilter);
    projectFinanceGet.type = 'GET';
    projectFinanceGet.listName = this.constants.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceGet);
    const results = await this.spServices.executeBatch(batchURL);
    if (results && results.length) {
      this.Ids.projectBudgetBreakUPID = results[0].retItems[0].ID;
      this.Ids.projectFinanceID = results[1].retItems[0].ID;
      return results;
    }
  }
  /**
   * This method is used to get the total hours spent based on project code.
   * @param projectCode pass projectCode as parameter.
   */
  async getTotalHours(projectCode) {
    let totalSpentTime = 0;
    const scheduleFilter = Object.assign({}, this.pmConstant.QUERY.GET_TIMESPENT);
    scheduleFilter.filter = scheduleFilter.filter.replace(/{{projectCode}}/gi, projectCode);
    const sResult = await this.spServices.readItems(this.constants.listNames.Schedules.name, scheduleFilter);
    if (sResult && sResult.length > 0) {
      sResult.forEach(task => {
        if (!(task.Task === this.pmConstant.task.FOLLOW_UP && task.Task === this.pmConstant.task.SEND_TO_CLIENT)) {
          totalSpentTime += task.TimeSpent ? this.timeToMins(task.TimeSpent) : 0;
        }
      });
    }
    return this.convertMinsToHrsMins(totalSpentTime);
  }
  timeToMins(time) {
    const b = time.split('.');
    return b[0] * 60 + +b[1];
  }
  /**
   * This method is used to convert the mins into hrs and min
   * @param mins pass minute as parameter.
   */
  convertMinsToHrsMins(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hours = h < 10 ? '0' + h : h;
    const min = m < 10 ? '0' + m : m;
    return hours + '.' + min;
  }
  /**
   * This method is used to show project related properties on right hand side.
   * @param selectedProjectObj pass the project object as parameter.
   */
  async viewProject(selectedProjectObj) {
    const proj = selectedProjectObj;
    this.pmObject.addProject.SOWSelect.SOWCode = proj.SOWCode;
    this.pmObject.addProject.ProjectAttributes.ProjectCode = proj.ProjectCode;
    this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = proj.ClientLegalEntity;
    this.pmObject.addProject.ProjectAttributes.SubDivision = proj.SubDivision;
    this.pmObject.addProject.ProjectAttributes.BillingEntity = proj.BillingEntity;
    this.pmObject.addProject.ProjectAttributes.BilledBy = proj.ProjectType;
    this.pmObject.addProject.ProjectAttributes.PracticeArea = proj.BusinessVertical;
    this.pmObject.addProject.ProjectAttributes.Priority = proj.Priority;
    this.pmObject.addProject.ProjectAttributes.ProjectStatus = proj.Status;
    this.pmObject.addProject.ProjectAttributes.PointOfContact1 = proj.PrimaryPOCText[0];
    this.pmObject.addProject.ProjectAttributes.PointOfContact2 = proj.PrimaryPOCText[0];
    this.pmObject.addProject.ProjectAttributes.Molecule = proj.Molecule;
    this.pmObject.addProject.ProjectAttributes.TherapeuticArea = proj.TA;
    this.pmObject.addProject.ProjectAttributes.Indication = proj.Indication;
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = proj.IsPubSupport;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = proj.PubSupportStatus;
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = proj.ShortTitle;
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = proj.SOWBoxLink;
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = proj.ConferenceJournal;
    this.pmObject.addProject.ProjectAttributes.Authors = proj.Authors;
    this.pmObject.addProject.ProjectAttributes.Comments = proj.Comments;
    this.pmObject.addProject.ProjectAttributes.ProjectTitle = proj.Title;
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = proj.Description;
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      this.pmObject.addProject.Timeline.Standard.Service = proj.StandardService;
      this.pmObject.addProject.Timeline.Standard.ProposedStartDate = proj.ProposedStartDate;
      this.pmObject.addProject.Timeline.Standard.ProposedEndDate = proj.ProposedStartDate;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      this.pmObject.addProject.Timeline.NonStandard.Service = proj.StandardService;
      this.pmObject.addProject.Timeline.NonStandard.DeliverableType = proj.DeliverableType;
      this.pmObject.addProject.Timeline.NonStandard.SubDeliverable = proj.SubDeliverable;
      this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate = proj.ProposedStartDate;
      this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate = proj.ProposedStartDate;
    }
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = proj.CMLevel1Title;
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = proj.CMLevel2Title;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = proj.DeliveryLevel1Title;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = proj.DeliveryLevel1Title;
    // get data from project finance based on project code.
    const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi, proj.ProjectCode);
    const sResult = await this.spServices.readItems(this.constants.listNames.ProjectFinances.name, projectFinanceFilter);
    if (sResult && sResult.length > 0) {
      const fm = sResult[0];
      this.pmObject.addProject.FinanceManagement.Currency = fm.Currency;
      this.pmObject.addProject.FinanceManagement.BudgetHours = fm.BudgetHrs;
      this.pmObject.addProject.FinanceManagement.Budget.Total = fm.Budget;
      this.pmObject.addProject.FinanceManagement.Budget.Net = fm.RevenueBudget;
      this.pmObject.addProject.FinanceManagement.Budget.OOP = fm.OOPBudget;
      this.pmObject.addProject.FinanceManagement.Budget.Tax = fm.TaxBudget;
    }
    this.pmObject.isProjectRightSideVisible = true;
  }
  async manageFinances(selectedProjectObj) {
    const projObj: any = selectedProjectObj;
    projObj.isUpdate = true;
    const ref = this.dialogService.open(ManageFinanceComponent, {
      data: {
        projectObj: projObj
      }
    });
  }
  communications(selectedProjectObj) {
    const ref = this.dialogService.open(CommunicationComponent, {
      data: {
        projectObj: selectedProjectObj
      }
    });
  }
  projectTimeline(selectedProjectObj) {
    const ref = this.dialogService.open(ProjectTimelineComponent, {
      data: {
        projectObj: selectedProjectObj
      }
    });
  }
  showTimeline(selectedProjectObj) {
    this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'Project');
  }
  /**
   * This method is used to complete the audit.
   */
  async auditComplete() {
    const formValue = $('.audit-rolling-section .formContentChecklist');
    const oInput = $('.audit-rolling-section .formContentChecklist input');
    const oContent = $('.audit-rolling-section .formContentChecklist .formRow .attrCheckListContent');
    const oTextArea = $('.audit-rolling-section .formContentChecklist .formRow .attrCheckListContent textarea');
    let bFlag = true;
    const arrData = [];
    const nCount = oInput.length;
    for (const index in oInput) {
      if (index < nCount) {
        const bChecked = oInput[index].checked;
        const contentIndex = +index * 2;
        let sData = $(oContent[contentIndex]).html();
        if (sData) {
          sData = sData.trim();
        }
        const sComment = oTextArea[index].value.trim();
        if (bChecked || sComment) {
          const oParam: any = {};
          oParam.checked = bChecked;
          oParam.data = sData;
          oParam.comment = sComment;
          arrData.push(oParam);
        } else {
          bFlag = false;
          break;
        }
      }
    }
    if (!bFlag) {
      this.checkList.addRollingProjectError = true;
      this.checkList.addRollingProjectErrorMsg = this.pmConstant.ERROR.AUDIT_COMPLETE_ERROR;
    } else {
      const piUdpate = {
        AuditCheckList: formValue.html(),
        Status: this.constants.projectStatus.PendingClosure,
        PrevStatus: this.selectedProjectObj.Status,
      };
      const retResults = await this.spServices.updateItem(this.constants.listNames.ProjectInformation.name,
        this.selectedProjectObj.ID, piUdpate, this.constants.listNames.ProjectInformation.type);
      this.pmObject.isAuditRollingVisible = false;
      this.sendEmailBasedOnStatus(this.selectedProjectObj.Status);
    }
  }
  /**
   * This method is used to send email by using template.
   * @param val pass the template name.
   * @param header pass the header.
   */
  async sendNotificationMail(val, header) {
    const queryText = val;
    const projectCode = this.selectedProjectObj.ProjectCode;
    let arrayTo = [];
    const arrayCC = [];
    let alterID = '';
    if (this.selectedProjectObj.ShortTitle) {
      alterID = '(' + this.selectedProjectObj.ShortTitle + ')';
    }
    let mailSubject = projectCode + ' : ' + val;
    const objEmailBody = [];
    let tempArray = [];
    const cm1IdArray = [];
    this.selectedProjectObj.CMLevel1ID.forEach(element => {
      cm1IdArray.push(element.ID);
    });
    tempArray = tempArray.concat(cm1IdArray, this.selectedProjectObj.CMLevel2ID);
    arrayTo = this.pmCommonService.getEmailId(tempArray);
    mailSubject = projectCode + alterID + ' : ' + header;
    objEmailBody.push({ key: '@@Val1@@', value: projectCode });
    objEmailBody.push({ key: '@@Val2@@', value: this.selectedProjectObj.ClientLegalEntity });
    objEmailBody.push({ key: '@@Val3@@', value: 'All' });
    if (val === this.constants.STATUS.CLOSED_PROJECT) {
      const hrs = await this.updateUsedHrs();
      objEmailBody.push({ key: '@@Val5@@', value: hrs });
    }
    arrayCC.push(this.pmObject.currLoginInfo.Email);
    this.pmCommonService.getTemplate(queryText, objEmailBody, mailSubject, arrayTo, arrayCC);
  }
  /**
   * This method is used to trigger the email based on status.
   * @param status pass project status as parameter.
   */
  sendEmailBasedOnStatus(status) {
    switch (status) {
      case this.constants.projectStatus.AuditInProgress:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.AUDIT_PROJECT, 'Propose closure for project');
        break;
      case this.constants.projectStatus.PendingClosure:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.CLOSE_PROJECT, 'Audit completed kindly close the project');
        break;
      case this.constants.projectStatus.Unallocated:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.NOTIFY_PM, 'Status unallocated');
        break;
      case this.constants.projectStatus.SentToAMForApproval:
        // this.SendProjectApprovalMailNoBudget("ApproveProject", "Approve project for billing");
        break;
    }
  }
  /**
   * This method is used to update update used hrs.
   * @returns Hours.Min total hours.
   */
  async updateUsedHrs() {
    let totalHours = '';
    if (this.selectedProjectObj.ProjectCode) {
      totalHours = await this.getTotalHours(this.selectedProjectObj.ProjectCode);
      const pfUdpate = {
        HoursSpent: totalHours
      };
      const retResults = await this.spServices.updateItem(this.constants.listNames.ProjectFinances.name,
        this.Ids.projectFinanceID, pfUdpate, this.constants.listNames.ProjectFinances.type);
      return totalHours;
    }
  }
  /**
   * This method is used to edit the project code attributes
   * @param projObj pass the projObj as parameter.
   */
  editProject(projObj) {
    const ref = this.dialogService.open(ProjectAttributesComponent, {
      data: {
        projectObj: projObj
      }
    });
  }
  /**
   * This function is used to open the move to project dialog box.
   * @param projObj pass the project object as a parameter.
   */
  moveSOW(projObj) {
    this.newSelectedSOW = projObj.SOWCode;
    this.sowDropDownArray = this.allProjects.sowCodeArray;
    this.pmObject.isMoveProjectToSOWVisible = true;
  }
  /**
   * This method is used to transfer the project from one sow code to another sow code.
   */
  async performSOWMove() {
    const projObject = this.selectedProjectObj;
    const isValid = await this.validateSOWBudgetForProjectMovement(this.newSelectedSOW, projObject);
    if (isValid) {
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      // calculate New SOW Budget.
      const allSOWArray = this.pmObject.allSOWItems;
      const newSOWObj = allSOWArray.filter(x => x.SOWCode === this.newSelectedSOW);
      const oldSOWObj = allSOWArray.filter(x => x.SOWCode === projObject.SOWCode);
      if (newSOWObj && newSOWObj.length && oldSOWObj && oldSOWObj.length) {
        const newSOW = newSOWObj[0];
        const oldSOW = oldSOWObj[0];
        const newSOWTotalBudget = newSOW.TotalLinked + projObject.Budget;
        const newSOWRevenueBudget = newSOW.RevenueLinked + projObject.RevenueBudget;
        const newSOWOOPBudget = newSOW.OOPLinked + projObject.OOPBudget;
        const newSOWTaxBudget = newSOW.TaxLinked + projObject.TaxBudget;
        const newSOWTotalScheduled = newSOW.TotalScheduled + projObject.InvoicesScheduled;
        const newSOWScheduledRevenue = newSOW.ScheduledRevenue + projObject.ScheduledRevenue;
        const newSOWScheduledOOP = newSOW.ScheduledOOP + projObject.ScheduledOOP;
        const newSOWData = this.getSOWData(newSOWTotalBudget, newSOWRevenueBudget, newSOWOOPBudget,
          newSOWTaxBudget, newSOWTotalScheduled, newSOWScheduledRevenue, newSOWScheduledOOP);
        const newSOWUpdate = Object.assign({}, options);
        newSOWUpdate.url = this.spServices.getItemURL(this.constants.listNames.SOW.name, newSOW.ID);
        newSOWUpdate.data = newSOWData;
        newSOWUpdate.type = 'PATCH';
        newSOWUpdate.listName = this.constants.listNames.SOW.name;
        batchURL.push(newSOWUpdate);
        // calculate old sow Budget.
        const oldSOWTotalBudget = oldSOW.TotalLinked - projObject.Budget;
        const oldSOWRevenueBudget = oldSOW.RevenueLinked - projObject.RevenueBudget;
        const oldSOWOOPBudget = oldSOW.OOPLinked - projObject.OOPBudget;
        const oldSOWTaxBudget = oldSOW.TaxLinked - projObject.TaxBudget;
        const oldSOWTotalScheduled = oldSOW.TotalScheduled - projObject.InvoicesScheduled;
        const oldSOWScheduledRevenue = oldSOW.ScheduledRevenue - projObject.ScheduledRevenue;
        const oldSOWScheduledOOP = oldSOW.ScheduledOOP - projObject.ScheduledOOP;
        const oldSOWData = this.getSOWData(oldSOWTotalBudget, oldSOWRevenueBudget, oldSOWOOPBudget,
          oldSOWTaxBudget, oldSOWTotalScheduled, oldSOWScheduledRevenue, oldSOWScheduledOOP);
        const oldSOWUpdate = Object.assign({}, options);
        oldSOWUpdate.url = this.spServices.getItemURL(this.constants.listNames.SOW.name, oldSOW.ID);
        oldSOWUpdate.data = oldSOWData;
        oldSOWUpdate.type = 'PATCH';
        oldSOWUpdate.listName = this.constants.listNames.SOW.name;
        batchURL.push(oldSOWUpdate);
        const invoiceItemArray = this.moveSOWObjectArray[1].retItems;
        invoiceItemArray.forEach(element => {
          const data = {
            __metadata: { type: this.constants.listNames.InvoiceLineItems.type },
            SOWCode: this.newSelectedSOW
          };
          const invoiceUpdate = Object.assign({}, options);
          invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.InvoiceLineItems.name, element.ID);
          invoiceUpdate.data = data;
          invoiceUpdate.type = 'PATCH';
          invoiceUpdate.listName = this.constants.listNames.InvoiceLineItems.name;
          batchURL.push(invoiceUpdate);
        });
        const projectData = {
          __metadata: { type: this.constants.listNames.ProjectInformation.type },
          SOWCode: this.newSelectedSOW
        };
        const projectInfoUpdate = Object.assign({}, options);
        projectInfoUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, projObject.ID);
        projectInfoUpdate.data = projectData;
        projectInfoUpdate.type = 'PATCH';
        projectInfoUpdate.listName = this.constants.listNames.ProjectInformation.name;
        batchURL.push(projectInfoUpdate);
      }
      const sResult = await this.spServices.executeBatch(batchURL);
      this.messageService.add({
        key: 'allProject', severity: 'success', summary: 'Success Message',
        detail: 'Project move to under new SOW Code - ' + this.newSelectedSOW + ''
      });
      setTimeout(() => {
        this.closeMoveSOW();
      }, 500);
    }
  }
  /**
   * This method is used to get SOW Object.
   * @param sowTotalLinked pass TotalLinked Object as parameter.
   * @param sowRevenueLinked pass RevenueLinked Object as parameter.
   * @param sowOOPLinked pass OOPLinked Object as parameter.
   * @param sowTaxLinked pass TaxLinked Object as parameter.
   * @param sowTotalScheduled pass TotalScheduled Object as parameter.
   * @param sowScheduledRevenue pass ScheduledRevenue Object as parameter.
   * @param sowScheduledOOP pass ScheduledOOP Object as parameter.
   */
  getSOWData(sowTotalLinked, sowRevenueLinked, sowOOPLinked, sowTaxLinked, sowTotalScheduled, sowScheduledRevenue, sowScheduledOOP) {
    const data = {
      __metadata: { type: this.constants.listNames.SOW.type },
      TotalLinked: sowTotalLinked,
      RevenueLinked: sowRevenueLinked,
      OOPLinked: sowOOPLinked,
      TaxLinked: sowTaxLinked,
      TotalScheduled: sowTotalScheduled,
      ScheduledRevenue: sowScheduledRevenue,
      ScheduledOOP: sowScheduledOOP
    };
    return data;
  }
  /**
   * This method is used to check whether New SOW code budget is greater than project budget.
   * @param newSOWCode pass the new sowcode as parameter.
   * @param projObj pass the projObj as parameter.
   */
  async validateSOWBudgetForProjectMovement(newSOWCode, projObj) {
    // get data from project finance based on project code.
    let budgetValidateFlag = false;
    const allSOWArray = this.pmObject.allSOWItems;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Project Finance  ##0;
    const projectFinanceGet = Object.assign({}, options);
    const projectFinaceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinaceFilter.filter = projectFinaceFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    projectFinanceGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinances.name,
      projectFinaceFilter);
    projectFinanceGet.type = 'GET';
    projectFinanceGet.listName = this.constants.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceGet);
    // Get InvoiceLine Items ##1;
    const inoviceGet = Object.assign({}, options);
    const invoiceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceFilter.filter = projectFinaceFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    inoviceGet.url = this.spServices.getReadURL(this.constants.listNames.InvoiceLineItems.name,
      invoiceFilter);
    inoviceGet.type = 'GET';
    inoviceGet.listName = this.constants.listNames.InvoiceLineItems.name;
    batchURL.push(inoviceGet);
    const sResult = await this.spServices.executeBatch(batchURL);
    const sowObj = allSOWArray.filter(x => x.SOWCode === newSOWCode);
    if (sResult && sResult.length && sowObj && sowObj.length) {
      this.moveSOWObjectArray = sResult;
      const fm = sResult[0].retItems[0];
      const sowItem = sowObj[0];
      // add budget into project object to utilize for update operation.
      projObj.Budget = fm.Budget ? fm.Budget : 0;
      projObj.RevenueBudget = fm.RevenueBudget ? fm.RevenueBudget : 0;
      projObj.OOPBudget = fm.OOPBudget ? fm.OOPBudget : 0;
      projObj.TaxBudget = fm.TaxBudget ? fm.TaxBudget : 0;
      projObj.InvoicesScheduled = fm.InvoicesScheduled ? fm.InvoicesScheduled : 0;
      projObj.ScheduledRevenue = fm.ScheduledRevenue ? fm.ScheduledRevenue : 0;
      projObj.ScheduledOOP = fm.ScheduledOOP ? fm.ScheduledOOP : 0;
      const sowBalanceTotalBudget = sowItem.TotalBudget - sowItem.TotalLinked;
      const sowBalanceRevenueBudget = sowItem.NetBudget - sowItem.RevenueLinked;
      const sowBalanceOOPBudget = sowItem.OOPBudget - sowItem.OOPLinked;
      const sowBalanceTaxBudget = sowItem.TaxBudget - sowItem.TaxLinked;
      if (sowBalanceTotalBudget >= fm.Budget &&
        sowBalanceRevenueBudget >= fm.RevenueBudget &&
        sowBalanceOOPBudget >= fm.OOPBudget &&
        sowBalanceTaxBudget >= fm.TaxBudget) {
        budgetValidateFlag = true;
      } else {
        budgetValidateFlag = false;
      }
    }
    return budgetValidateFlag;
  }
  /**
   * This method is used to close the dialog box.
   */
  closeDialog() {
    this.pmObject.isAuditRollingVisible = false;
  }
  /**
   * This method is used to close the dialog box.
   */
  closeMoveSOW() {
    this.pmObject.isMoveProjectToSOWVisible = false;
  }
}
