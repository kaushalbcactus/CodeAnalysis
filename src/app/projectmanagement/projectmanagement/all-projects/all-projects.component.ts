import { Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation, HostListener, ApplicationRef, NgZone, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, DialogService, SelectItem, SortEvent, DynamicDialogRef } from 'primeng';
import { PMCommonService } from '../../services/pmcommon.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
// import { CommunicationComponent } from '../communication/communication.component';
import { ProjectAttributesComponent } from '../add-projects/project-attributes/project-attributes.component';
import { ManageFinanceComponent } from '../add-projects/manage-finance/manage-finance.component';
import { TimelineHistoryComponent } from '../../../timeline/timeline-history/timeline-history.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectTimelineComponent } from './project-timeline/project-timeline.component';
import { GlobalService } from 'src/app/Services/global.service';
import { DataService } from 'src/app/Services/data.service';
import { Table } from 'primeng/table';
import { ViewUploadDocumentDialogComponent } from 'src/app/shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { CsFinanceAuditDialogComponent } from './cs-finance-audit-dialog/cs-finance-audit-dialog.component';
import { InvoiceLineitemsComponent } from './invoice-lineitems/invoice-lineitems.component';

declare var $;
@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AllProjectsComponent implements OnInit {
  tempClick: any;
  @Output() sendOutput = new EventEmitter<string>();
  @ViewChild("loader", { static: false }) loaderView: ElementRef;
  @ViewChild("spanner", { static: false }) spannerView: ElementRef;

  popItems: MenuItem[];
  selectedProjectObj;
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'Sow Code', visibility: true },
    { field: 'ProjectCode', header: 'Project Code', visibility: true },
    { field: 'ShortTitle', header: 'Short Title', visibility: true },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
    { field: 'DeliverableType', header: 'Deliverable Type', visibility: false },
    { field: 'ProjectType', header: 'Project Type', visibility: true },
    { field: 'PrimaryResources', header: 'Primary Resources', visibility: true },
    { field: 'POC', header: 'POC', visibility: true },
    { field: 'TA', header: 'TA', visibility: true },
    { field: 'Molecule', header: 'Molecule', visibility: true },
    { field: 'RevenueBudget', header: 'Revenue Budget', visibility: false },
    { field: 'OOPBudget', header: 'OOP Budget', visibility: false },
    { field: 'Currency', header: 'Currency', visibility: false },
    { field: 'Status', header: 'Status', visibility: true, exportable: false },
    { field: 'modifiedStatus', header: 'Status', visibility: false },
    { field: 'CreatedBy', header: 'Created By', visibility: false },
    { field: 'CreatedDateFormat', header: 'Created Date', visibility: false },
    { field: 'ModifiedBy', header: 'Modified By', visibility: false },
    { field: 'ReferenceCount', header: 'Reference Count', visibility: false },
    { field: 'PageCount', header: 'Page Count', visibility: false },
    { field: 'SlideCount', header: 'Slide Count', visibility: false },
    { field: 'AnnotationBinder', header: 'Annotation/Binder', visibility: false },

    // { field: 'CreatedDate', header: 'Created Date', visibility: true, exportable: false }
  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ProjectCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    // { field: 'DeliverableType' },
    { field: 'ProjectType' },
    { field: 'Status' },
    { field: 'PrimaryResources' },
    { field: 'POC' },
    { field: 'TA' },
    { field: 'Molecule' },
  ];
  // { field: 'CreatedBy' },
  // { field: 'CreatedDate' }];
  public allProjects = {
    SOWCode: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    ProjectType: [],
    Status: [],
    TA: [],
    Molecule: [],
    PrimaryResources: [],
    POC: []
    // sowCodeArray: [],
    // projectCodeArray: [],
    // shortTitleArray: [],
    // clientLegalEntityArray: [],
    // POCArray: [],
    // TAArray: [],
    // PrimaryResourcesArray: [],
    // MoleculeArray: [],
    // projectTypeArray: [],
    // statusArray: [],
    // deliveryTypeArray: [],
    // createdByArray: [],
    // createdDateArray: []
  };
  projectViewDataArray = [];
  public toUpdateIds = [];
  isAllProjectLoaderHidden = true;
  isAllProjectTableHidden = true;
  addRollingProjectArray: any[];
  public checkList = {
    addRollingProjectError: false,
    addRollingProjectErrorMsg: ''
  };
  public params = {
    ProjectCode: '',
    ActionStatus: '',
    ProjectStatus: '',
    ProjectBudgetStatus: ''
  };
  newSelectedSOW;
  moveSOWObjectArray = [];
  sowDropDownArray: SelectItem[];
  selectedReasonType;
  selectedReason;
  cancelReasonArray: SelectItem[];
  subscription;
  isApprovalAction = false;
  showNavigateSOW = false;
  hideExcelWithBudget = false;
  showFilterOptions = false;
  overAllValues: any;
  selectedOption: any = '';
  showProjectInput = false;
  providedProjectCode = '';
  @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
  @ViewChild('allProjectRef', { static: false }) allProjectRef: Table;
  ExcelDownloadenable = false;
  firstLoad = true;
  showExpenseEnable = false;
  expensedataloaderEnable = true;
  projectTitle: any;
  ExpenseCols: ({ field: string; header: string; visibility: boolean; exportable?: undefined; } |
  { field: string; header: string; visibility: boolean; exportable: boolean; })[];
  projectExpenses: any;
  expenseColArray: any = [];
  showTable: boolean;
  enableCountFields = false;
  FinanceButton = false;
  CSButton = false;
  CSButtonEnable = false;
  FinanceButtonEnable = false;
  res: void;
  constructor(
    public pmObject: PMObjectService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private constants: ConstantsService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    private spServices: SPOperationService,
    public dialogService: DialogService,
    public router: Router,
    private globalObject: GlobalService,
    private route: ActivatedRoute,
    private dataService: DataService,
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
    this.showTable = true;
    this.overAllValues = [
      { name: 'Open', value: 'Open' },
      { name: 'Closed / Cancelled', value: 'Closed' }
    ];
    this.selectedOption = this.overAllValues[0];
    this.providedProjectCode = '';
    if (this.router.url.indexOf('myDashboard') > -1) {
      this.showNavigateSOW = false;
      this.hideExcelWithBudget = true;
    } else {
      this.showNavigateSOW = true;
      this.hideExcelWithBudget = false;
    }

    if (this.pmObject.userRights.isMangers || this.pmObject.userRights.isHaveProjectFullAccess) {
      this.CSButtonEnable = true;
      this.FinanceButtonEnable = true;
    }
    else if (this.pmObject.userRights.isInvoiceTeam || this.pmObject.resourceCatItems[0].Role === this.pmConstant.resourCatConstant.FINANCE) {
      this.FinanceButtonEnable = true;
    }
    else if (this.pmObject.resourceCatItems[0].Role === this.pmConstant.resourCatConstant.CMLevel1 || this.pmObject.resourceCatItems[0].Role === this.pmConstant.resourCatConstant.CMLevel2) {
      this.CSButtonEnable = true;
    }

    this.isApprovalAction = true;
    this.reloadAllProject();
    this.checkEarlyTaskCompleted();
    setInterval(() => {
      this.checkEarlyTaskCompleted();
    }, 150000);
  }

  async checkEarlyTaskCompleted() {
    const completedTaskFilter = Object.assign({}, this.pmConstant.QUERY.GET_EARLY_TASK_COMPLETED);
    const lastOneHour = this.commonService.ConvertTimeformat(24,
      this.datePipe.transform(new Date().getTime() - (1000 * 60 * 60), 'hh:mm a'));
    const todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const lastOneHourDateTime = todayDate + 'T' + lastOneHour + ':00.000';

    completedTaskFilter.filter = completedTaskFilter.filter.replace('{{UserID}}', this.globalObject.currentUser.userId.toString()).
      replace('{{LastOnceHour}}', lastOneHourDateTime);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'CheckEarlyTaskNotifications');
    const sResult = await this.spServices.readItems(this.constants.listNames.EarlyTaskCompleteNotifications.name, completedTaskFilter);
    if (sResult && sResult.length) {
      console.log(sResult);
      let remainingUserId = [];
      let earlyTask;
      for (const element of sResult) {
        const projectCSArray = element.ProjectCS.results;

        this.commonService.showToastrMessage(this.constants.MessageType.error,'Early task ' + element.Title + ' has completed successfully.',true);
        remainingUserId = projectCSArray.filter(x => x.ID !== this.globalObject.currentUser.userId).map(x => x.ID);
        if (remainingUserId.length) {
          earlyTask = {
            ProjectCSId: {
              results: remainingUserId,
            },
          };
        } else {
          earlyTask = {
            IsActive: 'No'
          };
        }
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'updateEarlyTaskNotification');
        const retResults = await this.spServices.updateItem(this.constants.listNames.EarlyTaskCompleteNotifications.name,
          element.ID, earlyTask, this.constants.listNames.EarlyTaskCompleteNotifications.type);
      }
    }
  }

  navigateToSOW(oProject) {
    this.pmObject.columnFilter.SOWCode = [oProject.SOWCode];
    this.router.navigate(['/projectMgmt/allSOW']);
  }


  async convertToExcelFile(data) {
    this.showTable = true;
    this.ExcelDownloadenable = true;
    console.log(data);
    const budgets = await this.pmCommonService.getAllBudget(this.allProjectRef.filteredValue ?
      this.allProjectRef.filteredValue : this.pmObject.allProjectsArray);
    const AllBudgets = budgets.filter(c => c.retItems[0] !== undefined).map(c => c.retItems[0]);
    console.log(AllBudgets);
    this.pmObject.allProjectsArray.forEach(project => {
      const projBudget = AllBudgets.find(c => c.Title === project.ProjectCode);
      if (projBudget) {
        project.RevenueBudget = projBudget.RevenueBudget ? projBudget.RevenueBudget : 0;
        project.OOPBudget = projBudget.OOPBudget ? projBudget.OOPBudget : 0;
        project.Currency = projBudget.Currency;
      }
    });
    data._values = this.pmObject.allProjectsArray;
    this.pmCommonService.convertToExcelFile(data);
    this.ExcelDownloadenable = false;
  }


  reloadAllProject() {
    this.isAllProjectTableHidden = true;
    this.isAllProjectLoaderHidden = false;
    this.showFilterOptions = false;

    this.popItems = [
      {
        label: 'Status',
        items: [{
          label: 'Confirm Project', command: (event) =>
            this.changeProjectStatus(this.selectedProjectObj, this.pmConstant.ACTION.CONFIRM_PROJECT)
        },
        {
          label: 'Propose Closure', command: (event) =>
            this.changeProjectStatus(this.selectedProjectObj, this.pmConstant.ACTION.PROPOSE_CLOSURE)
        },
        {
          label: 'Audit Project', command: (event) =>
            this.changeProjectStatus(this.selectedProjectObj, this.pmConstant.ACTION.AUDIT_PROJECT)
        },
        {
          label: 'Close Project', command: (event) =>
            this.changeProjectStatus(this.selectedProjectObj, this.pmConstant.ACTION.CLOSE_PROJECT)
        },
        {
          label: 'Cancel Project', command: (event) =>
            this.changeProjectStatus(this.selectedProjectObj, this.pmConstant.ACTION.CANCEL_PROJECT)
        },
        {
          label: 'On Hold', command: (event) =>
            this.InvoiceLineItemsPopup(this.selectedProjectObj, this.constants.projectStatus.OnHold)
        },
        {
          label: 'Off Hold', command: (event) =>
            this.InvoiceLineItemsPopup(this.selectedProjectObj, this.constants.projectStatus.Unallocated)
        }]
      },
      {
        label: 'Misc',
        items: [
          { label: 'View Project Details', command: (event) => this.viewProject(this.selectedProjectObj) },
          { label: 'Edit Project', command: (event) => this.editProject(this.selectedProjectObj) },
          { label: 'Communications', command: (event) => this.communications(this.selectedProjectObj) },
          { label: 'Timeline', command: (event) => this.projectTimeline(this.selectedProjectObj) },
          { label: 'Go to Allocation', command: (event) => this.goToAllocationPage(this.selectedProjectObj) },
          { label: 'Project Scope', command: (event) => this.goToProjectScope(this.selectedProjectObj) },
        ]
      },
      {
        label: 'Finance',
        items: [
          { label: 'Manage Finance', command: (event) => this.manageFinances(this.selectedProjectObj) },
          { label: 'Change SOW', command: (event) => this.moveSOW(this.selectedProjectObj) },
          { label: 'Expense', command: (event) => this.showExpense(this.selectedProjectObj) },
        ]
      },
      { label: 'View Details', command: (event) => this.sendOutput.next(this.selectedProjectObj) },
      { label: 'Show History', command: (event) => this.showTimeline(this.selectedProjectObj) },


    ];
    this.getAllProjects();

    this.subscription = this.dataService.on('reload-project').subscribe(() => this.callReloadProject());

  }
  /**
   * This method is used to get all projects based on current user credentials.
   */
  callReloadProject() {
    this.pmObject.allProjectItems = [];
    this.reloadAllProject();
  }

  async getAllProjects() {
    this.showTable = true;
    const sowCodeTempArray = [];
    const projectCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    // const deliveryTypeTempArray = [];
    const projectTypeTempArray = [];
    const statusTempArray = [];
    const TATempArray = [];
    const MoleculeTempArray = [];
    const PrimaryResourcesTempArray = [];
    const POCTempArray = [];
    // const createdByTempArray = [];
    // const createDateTempArray = [];
    let arrResults: any = [];

    if (!this.pmObject.allProjectItems.length) {
      // Get all project information based on current user.
      arrResults = await this.pmCommonService.getProjects(this.showNavigateSOW);
      this.pmObject.allProjectItems = arrResults;
    }
    if (this.pmObject.allProjectItems.length) {
      // this.pmObject.countObj.allProjectCount = arrResults.length;
      this.pmObject.countObj.allProjectCount = this.pmObject.allProjectItems.length; // added by kaushal on 12-07-2019
      this.pmObject.totalRecords.AllProject = this.pmObject.countObj.allProjectCount;
      if (this.pmObject.tabMenuItems.length) {
        this.pmObject.tabMenuItems[0].label = 'All Projects (' + this.pmObject.countObj.allProjectCount + ')';
        this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      }
      if (this.route.snapshot.queryParams) {
        this.params.ProjectCode = this.route.snapshot.queryParams.ProjectCode;
        this.params.ActionStatus = this.route.snapshot.queryParams.ActionStatus;
        this.params.ProjectStatus = this.route.snapshot.queryParams.ProjectStatus;
        this.params.ProjectBudgetStatus = this.route.snapshot.queryParams.ProjectBudgetStatus;
      } else {
        this.params.ProjectCode = '';
        this.params.ActionStatus = '';
        this.params.ProjectStatus = '';
        this.params.ProjectBudgetStatus = '';
      }
      const projectObj = this.pmObject.allProjectItems.filter(c => c.ProjectCode === this.params.ProjectCode);
      if (this.params.ActionStatus) {
        if (projectObj && projectObj.length && this.params.ActionStatus === this.pmConstant.ACTION.APPROVED) {
          if ((this.pmObject.userRights.isMangers || projectObj[0].CMLevel2.ID === this.globalObject.currentUser.userId)) {
            if (projectObj[0].Status === this.constants.projectStatus.AwaitingCancelApproval) {
              await this.getGetIds(projectObj[0], this.pmConstant.ACTION.CANCEL_PROJECT);
              this.isApprovalAction = false;
              await this.changeProjectStatusCancelled(projectObj[0]);
            } else {

              this.commonService.showToastrMessage(this.constants.MessageType.error,'Cancellation action on this project - ' + this.params.ProjectCode + ' is already completed.',true);
            }
          } else {
            this.commonService.showToastrMessage(this.constants.MessageType.error,'You are not authorized to Approve cancellation for this project - ' + this.params.ProjectCode + ' .',true);
          }

        } else if (!projectObj.length && this.isApprovalAction && this.params.ProjectCode && this.params.ActionStatus) {

          this.commonService.showToastrMessage(this.constants.MessageType.error,'Cancellation action on this project - ' + this.params.ProjectCode + ' is already completed.',true);
        }

        if (projectObj && projectObj.length && this.params.ActionStatus === this.pmConstant.ACTION.REJECTED) {
          window.history.pushState({}, 'Title', window.location.href.split('?')[0]);
          if ((this.pmObject.userRights.isMangers || projectObj[0].CMLevel2.ID === this.globalObject.currentUser.userId)) {
            if (projectObj[0].Status === this.constants.projectStatus.AwaitingCancelApproval) {
              const piUdpate: any = {
                Status: this.params.ProjectStatus,
                PrevStatus: this.constants.projectStatus.AwaitingCancelApproval
              };
              const retResults = await this.spServices.updateItem(this.constants.listNames.ProjectInformation.name,
                projectObj[0].ID, piUdpate, this.constants.listNames.ProjectInformation.type);
              this.pmObject.allProjectItems = [];
              this.isApprovalAction = false;
              this.reloadAllProject();
            } else if (this.isApprovalAction) {

              this.commonService.showToastrMessage(this.constants.MessageType.error,'Cancellation action on this project - ' + projectObj[0].ProjectCode + ' is already completed.',true);
            }
          } else {
            this.commonService.showToastrMessage(this.constants.MessageType.error,'You are not authorized to Reject cancellation for this project - ' + this.params.ProjectCode + ' .',true);
          }
        }
      }
      if (this.params.ProjectBudgetStatus) {
        if (projectObj && projectObj.length) {
          if (this.pmObject.userRights.isMangers || projectObj[0].CMLevel2.ID === this.globalObject.currentUser.userId) {
            await this.approveRejectBudgetReduction(this.params.ProjectBudgetStatus, projectObj[0]);
          } else {
            this.commonService.showToastrMessage(this.constants.MessageType.error,'You are not authorized to Approve / Reject budget reduction for this project - ' + this.params.ProjectCode + ' .',true);
          }

        } else {

          this.commonService.showToastrMessage(this.constants.MessageType.error,'You dont have access to this project - ' + this.params.ProjectCode + '.',true);
        }
      }

    } else {
      if (this.pmObject.tabMenuItems.length) {
        this.pmObject.tabMenuItems[0].label = 'All Projects (' + this.pmObject.countObj.allProjectCount + ')';
        this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      }
    }
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
        projObj.SubDeliverable = task.SubDeliverable;
        projObj.ProjectType = task.ProjectType;
        projObj.Status = task.Status;
        projObj.modifiedStatus = task.Status === 'Audit In Progress' ? 'CS Audit' : task.Status === 'Pending Closure' ? 'Finance Audit' : task.Status;
        projObj.OOPBudget = 0;
        projObj.RevenueBudget = 0;
        projObj.Currency = null;
        projObj.CreatedBy = task.Author ? task.Author.Title : '';
        projObj.CreatedDate = task.Created;
        projObj.CreatedDateFormat = this.datePipe.transform(new Date(projObj.CreatedDate), 'MMM dd yyyy hh:mm:ss aa');
        projObj.ModifiedBy = task.Editor ? task.Editor.Title : '';
        projObj.ModifiedDate = task.Modified;
        projObj.ModifiedDateFormat = projObj.ModifiedDate ? this.datePipe.transform(new Date
          (projObj.ModifiedDate), 'MMM dd yyyy hh:mm:ss aa') : null;
        projObj.PrimaryPOC = task.PrimaryPOC;
        projObj.PrimaryPOCText = this.pmCommonService.extractNamefromPOC([projObj.PrimaryPOC]);
        projObj.POC = projObj.PrimaryPOCText[0];
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
        projObj.Milestone = task.Milestone ? task.Milestone : '';
        projObj.Milestones = task.Milestones ? task.Milestones : '';
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
        projObj.SOWLink = task.SOWLink ? task.SOWLink : '';
        projObj.PubSupportStatus = task.PubSupportStatus ? task.PubSupportStatus : '';
        projObj.IsStandard = task.IsStandard ? task.IsStandard : '';
        projObj.StandardService = task.StandardService ? task.StandardService : '';
        projObj.Priority = task.Priority ? task.Priority : '';
        projObj.Authors = task.Authors ? task.Authors : '';

        projObj.SlideCount = task.SlideCount ? task.SlideCount : 0;
        projObj.PageCount = task.PageCount ? task.PageCount : 0;
        projObj.ReferenceCount = task.ReferenceCount ? task.ReferenceCount : 0;
        projObj.AnnotationBinder = task.AnnotationBinder ? task.AnnotationBinder : 'No';
        projObj.PrimaryResources = this.commonService.returnText(task.PrimaryResMembers.results);
        projObj.PrimaryResourcesId = this.commonService.getResourceId((task.PrimaryResMembers.results));
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
        // deliveryTypeTempArray.push({ label: projObj.DeliverableType, value: projObj.DeliverableType });

        // console.log(projObj);
        projectTypeTempArray.push({ label: projObj.ProjectType, value: projObj.ProjectType });
        statusTempArray.push({ label: projObj.Status, value: projObj.Status });

        TATempArray.push({ label: projObj.TA, value: projObj.TA });
        MoleculeTempArray.push({ label: projObj.Molecule, value: projObj.Molecule });
        POCTempArray.push({ label: projObj.PrimaryPOCText, value: projObj.PrimaryPOCText });
        // PrimaryResourcesTempArray.push({ label: projObj.Status, value: projObj.Status });
        // createdByTempArray.push({ label: projObj.CreatedBy, value: projObj.CreatedBy });
        // createDateTempArray.push({
        //   label: this.datePipe.transform(projObj.CreatedDate, 'MMM dd yyyy hh:mm:ss aa'),
        //   value: projObj.CreatedDate
        // });
        tempAllProjectArray.push(projObj);
      }
      if (tempAllProjectArray) {
        await this.createColFieldValues(tempAllProjectArray);
      }
      // this.allProjects.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      // this.allProjects.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      // this.allProjects.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      // this.allProjects.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      // // this.allProjects.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      // this.allProjects.projectTypeArray = this.commonService.unique(projectTypeTempArray, 'value');
      // this.allProjects.statusArray = this.commonService.unique(statusTempArray, 'value');

      // // this.allProjects.PrimaryResourcesArray = this.commonService.unique(PrimaryResourcesTempArray, 'value');
      // this.allProjects.POCArray = this.commonService.unique(POCTempArray, 'value');
      // this.allProjects.TAArray = this.commonService.unique(TATempArray, 'value');
      // this.allProjects.MoleculeArray = this.commonService.unique(MoleculeTempArray, 'value');
      // this.allProjects.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      // this.allProjects.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      this.pmObject.allProjectsArray = [];
      this.pmObject.allProjectsArray = tempAllProjectArray;
      setTimeout(() => {
        this.pmObject.allProjectsArray = [...this.pmObject.allProjectsArray];
      }, this.pmConstant.TIME_OUT);
    }
    if (this.params.ProjectCode) {
      this.pmObject.columnFilter.ProjectCode = [this.params.ProjectCode];
      window.history.pushState({}, 'Title', window.location.href.split('?')[0]);
    }

    if (this.pmObject.columnFilter.ProjectCode && this.pmObject.columnFilter.ProjectCode.length) {
      const codeExists = this.allProjects.ProjectCode.find(e => e.label === this.pmObject.columnFilter.ProjectCode[0]);
      if (codeExists) {
        this.allProjectRef.filter(this.pmObject.columnFilter.ProjectCode, 'ProjectCode', 'in');
      } else {
        this.pmObject.columnFilter.ProjectCode = [];
      }

    }
    this.isAllProjectLoaderHidden = true;
    this.isAllProjectTableHidden = false;

    if (this.pmObject.allProjectsArray.length) {
      if (this.pmObject.allProjectsArray[0].Status === this.constants.projectList.status.Cancelled ||
        this.pmObject.allProjectsArray[0].Status === this.constants.projectList.status.Closed) {
        this.selectedOption = this.overAllValues[1];
        this.showProjectInput = true;
        this.providedProjectCode = this.pmObject.allProjectsArray[0].ProjectCode;
      } else {
        this.selectedOption = this.overAllValues[0];
        this.showProjectInput = false;
        this.providedProjectCode = '';
      }
    }

    this.showFilterOptions = true;
  }

  createColFieldValues(resArray) {
    this.allProjects.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label)));
    this.allProjects.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.allProjects.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.allProjects.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.allProjects.ProjectType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectType, value: a.ProjectType }; return b; }).filter(ele => ele.label)));
    this.allProjects.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status === 'Audit In Progress' ? 'CS Audit' : a.Status === 'Pending Closure' ? 'Finance Audit' : a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
    this.allProjects.TA = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.TA, value: a.TA }; return b; }).filter(ele => ele.label)));
    this.allProjects.Molecule = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Molecule, value: a.Molecule }; return b; }).filter(ele => ele.label)));
    const poc1 = resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label);
    this.allProjects.POC = this.commonService.sortData(this.uniqueArrayObj(poc1));
  }

  async approveRejectBudgetReduction(selectedStatus, projectObj) {
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    // Get Project Finance  ##0;

    this.GetprojectFinanceBatch(projectObj, options, batchURL);

    // Get PBB  ##1;
    const pbbGet = Object.assign({}, options);
    const pbbFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_BUDGET_BREAKUP);
    pbbFilter.filter = pbbFilter.filter.replace(/{{projectCode}}/gi,
      projectObj.ProjectCode);
    pbbGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectBudgetBreakup.name,
      pbbFilter);
    pbbGet.type = 'GET';
    pbbGet.listName = this.constants.listNames.ProjectBudgetBreakup.name;
    batchURL.push(pbbGet);

    // Get SOW ##2
    const sowGet = Object.assign({}, options);
    const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.SOW_CODE);
    sowFilter.filter = sowFilter.filter.replace(/{{sowcode}}/gi, projectObj.SOWCode);
    sowGet.url = this.spServices.getReadURL(this.constants.listNames.SOW.name,
      sowFilter);
    sowGet.type = 'GET';
    sowGet.listName = this.constants.listNames.SOW.name;
    batchURL.push(sowGet);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjFinancePBBSow');
    const result = await this.spServices.executeBatch(batchURL);

    if (result && result.length) {
      batchURL = [];
      const existPF = result[0].retItems[0];
      const existPBBArray = result[1].retItems;
      const existSOW = result[2].retItems[0];

      const pbb = existPBBArray.find(e => e.Status === this.constants.projectBudgetBreakupList.status.ApprovalPending);
      if (pbb) {
        const projectBudgetBreakupData = {
          __metadata: { type: this.constants.listNames.ProjectBudgetBreakup.type },
          ApprovalDate: new Date(),
          Status: ''
        };
        if (selectedStatus === this.pmConstant.ACTION.APPROVED) {
          ///// SOW data
          const sowData = {
            __metadata: { type: this.constants.listNames.SOW.type },
            TotalLinked: existSOW.TotalLinked + pbb.OriginalBudget,
            RevenueLinked: existSOW.RevenueLinked + pbb.NetBudget,
          };

          const sowUpdate = Object.assign({}, options);
          sowUpdate.url = this.spServices.getItemURL(this.constants.listNames.SOW.name, existSOW.ID);
          sowUpdate.data = sowData;
          sowUpdate.type = 'PATCH';
          sowUpdate.listName = this.constants.listNames.SOW.name;
          batchURL.push(sowUpdate);

          ///// PF Data

          const pfData: any = {
            __metadata: { type: this.constants.listNames.ProjectFinances.type },

          };
          pfData.BudgetHrs = existPF.BudgetHrs + pbb.BudgetHours;
          pfData.Budget = existPF.Budget + pbb.OriginalBudget;
          pfData.RevenueBudget = existPF.RevenueBudget + pbb.NetBudget;

          const projectFinanceUpdate = Object.assign({}, options);
          projectFinanceUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectFinances.name,
            existPF.ID);
          projectFinanceUpdate.data = pfData;
          projectFinanceUpdate.type = 'PATCH';
          projectFinanceUpdate.listName = this.constants.listNames.ProjectFinances.name;
          batchURL.push(projectFinanceUpdate);

          projectBudgetBreakupData.Status = this.constants.projectBudgetBreakupList.status.Approved;
        } else if (selectedStatus === this.pmConstant.ACTION.REJECTED) {
          projectBudgetBreakupData.Status = this.constants.projectBudgetBreakupList.status.Rejected;
        }
        const projectBudgetBreakupUpdate = Object.assign({}, options);
        projectBudgetBreakupUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectBudgetBreakup.name,
          pbb.ID);
        projectBudgetBreakupUpdate.data = projectBudgetBreakupData;
        projectBudgetBreakupUpdate.type = 'PATCH';
        projectBudgetBreakupUpdate.listName = this.constants.listNames.ProjectBudgetBreakup.name;
        batchURL.push(projectBudgetBreakupUpdate);
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjFinancePBBSow');
        const res = await this.spServices.executeBatch(batchURL);

        const subjectVal = 'Budget reduction is ' + selectedStatus.toLowerCase();
        const mailSubject = projectObj.ProjectCode + ': ' + subjectVal;
        const objEmailBody = [];
        objEmailBody.push({ key: '@@ProjectCode@@', value: projectObj.ProjectCode });
        objEmailBody.push({ key: '@@ClientName@@', value: projectObj.ClientLegalEntity });
        objEmailBody.push({ key: '@@Title@@', value: projectObj.Title });
        objEmailBody.push({ key: '@@Outcome@@', value: selectedStatus.toLowerCase() });

        let tempArray = [];
        let arrayTo = [];
        const cm1IdArray = [];
        let arrayCC = [];
        let ccIDs = [];
        if (projectObj.CMLevel1.hasOwnProperty('results')) {
          projectObj.CMLevel1.results.forEach(element => {
            cm1IdArray.push(element.ID);
          });
        }

        arrayCC = arrayCC.concat([], cm1IdArray);
        tempArray = tempArray.concat([], projectObj.CMLevel2.ID);
        arrayTo = this.pmCommonService.getEmailId(tempArray);
        ccIDs = this.pmCommonService.getEmailId(arrayCC);
        ccIDs.push(this.pmObject.currLoginInfo.Email);
        ///// Send approval message
        this.pmCommonService.getTemplate(this.constants.EMAIL_TEMPLATE_NAME.BUDGET_APPROVAL, objEmailBody, mailSubject, arrayTo,
          ccIDs);
      } else {
      this.commonService.showToastrMessage(this.constants.MessageType.error,'No un-apporved budget reduction request found for project - ' + this.params.ProjectCode + ' .',true);
      }

    }
    window.history.pushState({}, 'Title', window.location.href.split('?')[0]);

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

    menu.model[0].visible = true;
    menu.model[1].visible = true;
    menu.model[2].visible = true;
    menu.model[3].visible = true;
    menu.model[4].visible = true;
    menu.model[0].items.map(c => c.visible = true);
    menu.model[1].items.map(c => c.visible = true);
    menu.model[2].items.map(c => c.visible = true);

    if (route.indexOf('myDashboard') > -1) {
      menu.model[0].visible = false;
      menu.model[1].visible = false;
      menu.model[2].visible = false;
    } else {
      menu.model[3].visible = false;
      switch (status) {
        case this.constants.projectStatus.InDiscussion:
          menu.model[0].items[1].visible = false;
          menu.model[0].items[2].visible = false;
          menu.model[0].items[3].visible = false;
          menu.model[0].items[5].visible = false;
          menu.model[0].items[6].visible = false;
          break;
        case this.constants.projectStatus.Unallocated:
        case this.constants.projectStatus.InProgress:
        case this.constants.projectStatus.ReadyForClient:
        case this.constants.projectStatus.AuthorReview:
          menu.model[0].items[0].visible = false;
          menu.model[0].items[2].visible = false;
          menu.model[0].items[3].visible = false;
          menu.model[0].items[6].visible = false;
          break;

        case this.constants.projectStatus.OnHold:
          menu.model[0].items[0].visible = false;
          menu.model[0].items[1].visible = false;
          menu.model[0].items[2].visible = false;
          menu.model[0].items[3].visible = false;
          menu.model[0].items[4].visible = false;
          menu.model[0].items[5].visible = false;
          break

        case this.constants.projectStatus.AuditInProgress:
          menu.model[0].visible = false;
          // menu.model[0].items[0].visible = false;
          // menu.model[0].items[1].visible = false;
          // menu.model[0].items[3].visible = false;
          // menu.model[0].items[4].visible = false;
          break;
        case this.constants.projectStatus.PendingClosure:
          menu.model[0].visible = false;
          // menu.model[0].items[0].visible = false;
          // menu.model[0].items[1].visible = false;
          // menu.model[0].items[2].visible = false;
          // menu.model[0].items[4].visible = false;
          // menu.model[1].items[1].visible = false;
          // menu.model[0].items[5].visible = false;
          // menu.model[0].items[6].visible = false;
          break;
        case this.constants.projectStatus.Closed:
          menu.model[0].visible = false;
          break;
        case this.constants.projectStatus.Cancelled:
          menu.model[0].visible = false;
          menu.model[1].items[1].visible = false;
          menu.model[2].items[1].visible = false;
          break;
        case this.constants.projectStatus.SentToAMForApproval:
          menu.model[0].visible = false;
          menu.model[1].items[1].visible = false;
          break;
        case this.constants.projectStatus.AwaitingCancelApproval:
          menu.model[0].visible = false;
          menu.model[1].items[1].visible = false;
          menu.model[1].items[4].visible = false;
          menu.model[2].visible = false;
          break;
      }
    }

  }

  InvoiceLineItemsPopup(selectedProjectObj, setStatus) {
    var projObj: any = selectedProjectObj;
    const ref = this.dialogService.open(InvoiceLineitemsComponent, {
      data: {
        projectObj: projObj,
        Status: setStatus
      },
      header: 'Are you sure you want to change the Status of Project - ' + selectedProjectObj.ProjectCode + ''
        + ' from ' + selectedProjectObj.Status + ' to ' + setStatus + '?',
      contentStyle: { width: '100%', height: '100% !important' },
      width: '100%'
    });
    ref.onClose.subscribe(obj => {
      if (obj) {
        if (obj.status == this.constants.projectStatus.Unallocated) {
          this.changeProjectStatusOffHoldtoUnallocated(selectedProjectObj, obj.invoiceLineItems)
        } else {
          this.changeProjectStatusOnHold(selectedProjectObj, obj.invoiceLineItems)
        }
      }
    });
  }
  /**
   * This method is called to change the project status based on current project status.
   * @param mins pass project object as a parameter.
   */
  async changeProjectStatus(selectedProjectObj, projectAction) {

    // this.spannerView.nativeElement.style.height = Math.max(
    //   document.body.scrollHeight,
    //   document.documentElement.scrollHeight,
    //   document.body.offsetHeight,
    //   document.documentElement.offsetHeight,
    //   document.documentElement.clientHeight
    // ) + 'px';

    this.loaderView.nativeElement.classList.add('show');
    this.spannerView.nativeElement.classList.add('show');


    const result = await this.getGetIds(selectedProjectObj, projectAction);
    if (result && result.length) {
      const scheduleItems = result.find(c => c.listName === 'Schedules') ? result.find(c =>
        c.listName === 'Schedules').retItems : [];
      switch (projectAction) {
        case this.pmConstant.ACTION.CONFIRM_PROJECT:
          this.loaderView.nativeElement.classList.remove('show');
          this.spannerView.nativeElement.classList.remove('show');

          this.commonService.confirmMessageDialog('Change Status of Project -' + selectedProjectObj.ProjectCode + '', 'Are you sure you want to change the Status of Project - ' + selectedProjectObj.ProjectCode + ''
            + ' from ' + selectedProjectObj.Status + ' to ' + this.constants.projectStatus.Unallocated + '?', null, ['Yes', 'No'], false).then(async Confirmation => {
              if (Confirmation === 'Yes') {
                this.changeProjectStatusUnallocated(selectedProjectObj);
              }
            });
          break;
        case this.pmConstant.ACTION.PROPOSE_CLOSURE:

          const pbbItems = result.find(c => c.listName === 'ProjectBudgetBreakup') ? result.find(c =>
            c.listName === 'ProjectBudgetBreakup').retItems : [];
          if (pbbItems) {
            if (pbbItems.find(c => c.Status === 'Approval Pending')) {

              this.commonService.showToastrMessage(this.constants.MessageType.error,'Budget approval still pending for ' + selectedProjectObj.ProjectCode,true);
              this.loaderView.nativeElement.classList.remove('show');
              this.spannerView.nativeElement.classList.remove('show');
              break;
            }
          }
          const InvoiceLineItems = result.find(c => c.listName === 'InvoiceLineItems') ? result.find(c =>
            c.listName === 'InvoiceLineItems').retItems : [];
          if (InvoiceLineItems) {
            if (InvoiceLineItems.find(c => c.Status === 'Scheduled')) {

              this.commonService.showToastrMessage(this.constants.MessageType.error,selectedProjectObj.ProjectCode + ' line item is not Confirmed.',true);
              this.loaderView.nativeElement.classList.remove('show');
              this.spannerView.nativeElement.classList.remove('show');
              break;
            }
          }
          const ExpenseLineItems = result.find(c => c.listName === 'SpendingInfo') ? result.find(c =>
            c.listName === 'SpendingInfo').retItems : [];
          if (ExpenseLineItems) {
            const AllBillable = ExpenseLineItems.filter(c => c.Category === 'Billable');
            if (AllBillable) {
              if (AllBillable.find(c => c.Status.indexOf('Billed') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled')) {

                this.commonService.showToastrMessage(this.constants.MessageType.error,selectedProjectObj.ProjectCode + ' expense not scheduled / confirmed.',true);
                this.loaderView.nativeElement.classList.remove('show');
                this.spannerView.nativeElement.classList.remove('show');
                break;
              }
            }
            const AllNonBillable = ExpenseLineItems.filter(c => c.Category === 'Non Billable');
            if (AllNonBillable) {
              if (AllNonBillable.find(c => c.Status.indexOf('Approved') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled')) {


                this.commonService.showToastrMessage(this.constants.MessageType.error,selectedProjectObj.ProjectCode + ' expense not scheduled / confirmed.',true);
                this.loaderView.nativeElement.classList.remove('show');
                this.spannerView.nativeElement.classList.remove('show');
                break;
              }
            }
          }
          this.loaderView.nativeElement.classList.remove('show');
          this.spannerView.nativeElement.classList.remove('show');

          this.commonService.confirmMessageDialog('Change Status of Project -' + selectedProjectObj.ProjectCode + '', 'Are you sure you want to change the Status of Project - ' + selectedProjectObj.ProjectCode + ''
            + ' from ' + selectedProjectObj.Status + ' to ' + this.constants.projectStatus.NewAuditInProgress + '?', null, ['Yes', 'No'], false).then(async Confirmation => {
              if (Confirmation === 'Yes') {
                this.changeProjectStatusAuditInProgress(selectedProjectObj, scheduleItems);
              }
            });

          break;
        case this.pmConstant.ACTION.CLOSE_PROJECT:
          this.loaderView.nativeElement.classList.remove('show');
          this.spannerView.nativeElement.classList.remove('show');

          this.commonService.confirmMessageDialog('Change Status of Project -' + selectedProjectObj.ProjectCode + '', 'Are you sure you want to change the Status of Project - ' + selectedProjectObj.ProjectCode + ''
            + ' from ' + this.constants.projectStatus.NewPendingClosure + ' to ' + this.constants.projectStatus.Closed + '?', null, ['Yes', 'No'], false).then(async Confirmation => {
              if (Confirmation === 'Yes') {
                this.changeProjectStatusClose(selectedProjectObj);
              }
            });
          break;
        case this.pmConstant.ACTION.CANCEL_PROJECT:
          this.selectedReasonType = '';
          this.selectedReason = '';
          const batchURL = [];
          const options = {
            data: null,
            url: '',
            type: '',
            listName: ''
          };

          // Get InvoiceLine Items ##1;
          const inoviceGet = Object.assign({}, options);
          const invoiceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
          invoiceFilter.filter = invoiceFilter.filter.replace(/{{projectCode}}/gi,
            selectedProjectObj.ProjectCode);
          inoviceGet.url = this.spServices.getReadURL(this.constants.listNames.InvoiceLineItems.name,
            invoiceFilter);
          inoviceGet.type = 'GET';
          inoviceGet.listName = this.constants.listNames.InvoiceLineItems.name;
          batchURL.push(inoviceGet);
          this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetInvoiceLineItem');
          const sResult = await this.spServices.executeBatch(batchURL);
          this.loaderView.nativeElement.classList.remove('show');
          this.spannerView.nativeElement.classList.remove('show');
          if (sResult && sResult.length) {
            const invoiceItems = sResult[0].retItems;
            for (const item of invoiceItems) {
              if (item.Status !== this.constants.STATUS.SCHEDUELD) {

                this.commonService.showToastrMessage(this.constants.MessageType.error,'Cancellation not allowed as there is confirmed invoice line items.',true);
                return;
              }
            }
          } else if (scheduleItems) {

            const SpentHours = scheduleItems.filter(c => parseFloat(c.TimeSpent)).map(c => parseFloat
              (c.TimeSpent)) ? scheduleItems.filter(c => parseFloat(c.TimeSpent)).map(c => parseFloat
                (c.TimeSpent)).reduce((a, b) => a + b, 0) : 0;

            if (SpentHours > 0) {

              this.commonService.showToastrMessage(this.constants.MessageType.error,'Cancellation not allowed as there is spent hours on the project.',true);
              return;
            }

          }
          this.loadReasonDropDown();
          this.pmObject.isReasonSectionVisible = true;
          break;
      }
    }
  }
  loadReasonDropDown() {
    this.cancelReasonArray = [
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.NOT_CONVINCED_OF_EXPERIANCE_OR_QUALITY,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.NOT_CONVINCED_OF_EXPERIANCE_OR_QUALITY
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.LACK_OF_CAPABILITY,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.LACK_OF_CAPABILITY
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.PRICE_TO_HIGH,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.PRICE_TO_HIGH
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_BUDGET,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_BUDGET
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_DOING_INTERNALLY,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_DOING_INTERNALLY
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.CHANGE_IN_DELIVERY_TYPE,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.CHANGE_IN_DELIVERY_TYPE
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.CACTUS_REJECT,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.CACTUS_REJECT
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.DUPLICATE_ENTRY,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.DUPLICATE_ENTRY
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_NOT_MOVING_FORWARD_WITH_PROJECT,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.CLIENT_NOT_MOVING_FORWARD_WITH_PROJECT
      },
      {
        label: this.pmConstant.PROJECT_CANCELLED_REASON.UNKNOWN,
        value: this.pmConstant.PROJECT_CANCELLED_REASON.UNKNOWN
      }
    ];
  }
  async saveCancelProject() {
    if (this.selectedReasonType && this.selectedReason) {
      this.pmObject.isMainLoaderHidden = false;
      const piUdpate: any = {
        Reason: this.selectedReason,
        ReasonType: this.selectedReasonType
      };
      if (this.selectedProjectObj.Status !== this.constants.projectStatus.InDiscussion) {
        piUdpate.Status = this.constants.projectStatus.AwaitingCancelApproval;
      }
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'UpdateProjInformation');
      const retResults = await this.spServices.updateItem(this.constants.listNames.ProjectInformation.name,
        this.selectedProjectObj.ID, piUdpate, this.constants.listNames.ProjectInformation.type);
      if (this.selectedProjectObj.Status === this.constants.projectStatus.InDiscussion) {
        this.changeProjectStatusCancelled(this.selectedProjectObj);
      } else {
        this.sendApprovalEmailToManager(this.selectedProjectObj, this.selectedReason);
      }
    } else {
      if (!this.selectedReasonType) {
        this.commonService.showToastrMessage(this.constants.MessageType.error,'Please select reason Type.',false);
      } else if (!this.selectedReason) {
        this.commonService.showToastrMessage(this.constants.MessageType.error,'Please select reason.',false);
      }
    }
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  async getTosList() {
    this.commonService.SetNewrelic('Finance-Dashboard', 'all-projects-getTosList', 'getGroupInfo');
    const approvers = await this.spServices.getGroupInfo('ExpenseApprovers');
    let arrayTo = [];
    if (approvers.results) {
      if (approvers.results.length) {
        for (const a in approvers.results) {
          if (approvers.results[a].Email !== undefined && approvers.results[a].Email !== '') {
            arrayTo.push(approvers.results[a].Email);
          }
        }
      }
    }
    arrayTo = arrayTo.filter(this.onlyUnique);
    console.log('arrayTo ', arrayTo);
    return arrayTo;
  }

  async  sendApprovalEmailToManager(selectedProjectObj, reason) {
    const projectFinanceObj = this.toUpdateIds[1] && this.toUpdateIds[1].retItems && this.toUpdateIds[1].retItems.length ?
      this.toUpdateIds[1].retItems[0] : [];
    const subjectVal = 'Request to cancel the project';
    const mailSubject = selectedProjectObj.ProjectCode + ' : ' + subjectVal;
    const objEmailBody = [];
    objEmailBody.push({ key: '@@Val1@@', value: selectedProjectObj.ProjectCode });
    objEmailBody.push({ key: '@@Val2@@', value: selectedProjectObj.ClientLegalEntity });
    objEmailBody.push({ key: '@@SiteName@@', value: this.globalObject.sharePointPageObject.webAbsoluteUrl });
    objEmailBody.push({ key: '@@Val3@@', value: this.pmObject.currLoginInfo.Title });
    objEmailBody.push({ key: '@@Val4@@', value: selectedProjectObj.ProposedStartDate });
    objEmailBody.push({ key: '@@Val5@@', value: reason });
    objEmailBody.push({ key: '@@Val6@@', value: selectedProjectObj.ProposedStartDate });
    objEmailBody.push({ key: '@@Val7@@', value: projectFinanceObj.Budget });
    objEmailBody.push({ key: '@@ProjectStatus@@', value: selectedProjectObj.Status });
    let tempArray = [];
    let arrayTo = [];
    const cm1IdArray = [];
    this.selectedProjectObj.CMLevel1ID.forEach(element => {
      cm1IdArray.push(element.ID);
    });
    tempArray = tempArray.concat(cm1IdArray, this.selectedProjectObj.CMLevel2ID);
    arrayTo = this.pmCommonService.getEmailId(tempArray);
    const TempArray = await this.getTosList();
    arrayTo = arrayTo.concat(TempArray);
    arrayTo = arrayTo.filter(this.onlyUnique);
    this.pmCommonService.getTemplate(this.constants.EMAIL_TEMPLATE_NAME.CANCEL, objEmailBody, mailSubject, arrayTo,
      [this.pmObject.currLoginInfo.Email]);
    this.pmObject.isMainLoaderHidden = true;
    this.pmObject.isReasonSectionVisible = false;

    this.commonService.showToastrMessage(this.constants.MessageType.success,'Email has been sent for approval to concerned person.',true);
    setTimeout(() => {
      this.pmObject.allProjectItems = [];
      if (this.router.url === '/projectMgmt/allProjects') {
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }
  /**
   * This function is used to changet the project status to cancelled.
   * @param selectedProjectObj pass the project object as parameter.
   */
  async changeProjectStatusCancelled(selectedProjectObj) {
    const projectBudgetBreakUPObjs = this.toUpdateIds[0] && this.toUpdateIds[0].retItems && this.toUpdateIds[0].retItems.length ?
      this.toUpdateIds[0].retItems : [];
    const projectFinanceObj = this.toUpdateIds[1] && this.toUpdateIds[1].retItems && this.toUpdateIds[1].retItems.length ?
      this.toUpdateIds[1].retItems[0] : [];
    const projectFinanceBreakObjs = this.toUpdateIds[2] && this.toUpdateIds[2].retItems && this.toUpdateIds[2].retItems.length ?
      this.toUpdateIds[2].retItems : [];
    const sowObj = this.toUpdateIds[3] && this.toUpdateIds[3].retItems && this.toUpdateIds[3].retItems.length ?
      this.toUpdateIds[3].retItems[0] : [];
    const POObjsArray = this.toUpdateIds[4] && this.toUpdateIds[4].retItems && this.toUpdateIds[4].retItems.length ?
      this.toUpdateIds[4].retItems : [];
    const scheduleListObjs = this.toUpdateIds[5] && this.toUpdateIds[5].retItems && this.toUpdateIds[5].retItems.length ?
      this.toUpdateIds[5].retItems : [];
    const invoiceLineItemsObjs = this.toUpdateIds[6] && this.toUpdateIds[6].retItems && this.toUpdateIds[6].retItems.length ?
      this.toUpdateIds[6].retItems : [];
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const piUdateData = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      Status: this.constants.projectStatus.Cancelled,
      PrevStatus: selectedProjectObj.Status,
      RejectionDate: new Date()
    };
    const piUpdate = Object.assign({}, options);
    piUpdate.data = piUdateData;
    piUpdate.listName = this.constants.listNames.ProjectInformation.name;
    piUpdate.type = 'PATCH';
    piUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
      selectedProjectObj.ID);
    batchURL.push(piUpdate);
    invoiceLineItemsObjs.forEach(element => {
      const invoiceUpdateData = {
        __metadata: {
          type: this.constants.listNames.InvoiceLineItems.type
        },
        Status: this.constants.STATUS.DELETED,
        PO: null
      };
      const invoiceUpdate = Object.assign({}, options);
      invoiceUpdate.data = invoiceUpdateData;
      invoiceUpdate.listName = this.constants.listNames.InvoiceLineItems.name;
      invoiceUpdate.type = 'PATCH';
      invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.InvoiceLineItems.name,
        element.ID);
      batchURL.push(invoiceUpdate);
    });
    projectFinanceBreakObjs.forEach(element => {
      const projectFinanceBreakData = {
        __metadata: {
          type: this.constants.listNames.ProjectFinanceBreakup.type
        },
        Status: this.constants.STATUS.DELETED
      };
      const projectFinanceBreakUpdate = Object.assign({}, options);
      projectFinanceBreakUpdate.data = projectFinanceBreakData;
      projectFinanceBreakUpdate.listName = this.constants.listNames.ProjectFinanceBreakup.name;
      projectFinanceBreakUpdate.type = 'PATCH';
      projectFinanceBreakUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectFinanceBreakup.name,
        element.ID);
      batchURL.push(projectFinanceBreakUpdate);
    });
    projectBudgetBreakUPObjs.forEach(element => {
      if (selectedProjectObj.Status === this.constants.projectStatus.InDiscussion) {
        const projectBudgetBreakData = {
          __metadata: {
            type: this.constants.listNames.ProjectBudgetBreakup.type
          },
          Status: this.constants.STATUS.REJECTED
        };
        const projectBudgetUpdate = Object.assign({}, options);
        projectBudgetUpdate.data = projectBudgetBreakData;
        projectBudgetUpdate.listName = this.constants.listNames.ProjectBudgetBreakup.name;
        projectBudgetUpdate.type = 'PATCH';
        projectBudgetUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectBudgetBreakup.name,
          element.ID);
        batchURL.push(projectBudgetUpdate);
      }
      if (selectedProjectObj.Status === this.constants.projectStatus.AwaitingCancelApproval) {
        element.OriginalBudget = element.OriginalBudget ? element.OriginalBudget : 0;
        element.NetBudget = element.NetBudget ? element.NetBudget : 0;
        element.OOPBudget = element.OOPBudget ? element.OOPBudget : 0;
        element.TaxBudget = element.TaxBudget ? element.TaxBudget : 0;
        element.BudgetHours = element.BudgetHours ? element.BudgetHours : 0;
        const projectBudgetBreakCreateData = {
          __metadata: {
            type: this.constants.listNames.ProjectBudgetBreakup.type
          },
          ProjectLookup: element.ProjectLookup,
          ProjectCode: element.ProjectCode,
          ApprovalDate: new Date(),
          Status: element.Status,
          OriginalBudget: element.OriginalBudget * -1,
          NetBudget: element.NetBudget * -1,
          OOPBudget: element.OOPBudget * -1,
          TaxBudget: element.TaxBudget * -1,
          BudgetHours: element.BudgetHours * -1
        };
        const projectBudgetBreakCreate = Object.assign({}, options);
        projectBudgetBreakCreate.url = this.spServices.getReadURL(this.constants.listNames.ProjectBudgetBreakup.name, null);
        projectBudgetBreakCreate.data = projectBudgetBreakCreateData;
        projectBudgetBreakCreate.type = 'POST';
        projectBudgetBreakCreate.listName = this.constants.listNames.ProjectBudgetBreakup.name;
        batchURL.push(projectBudgetBreakCreate);
      }
    });
    if (selectedProjectObj.ProjectType === this.pmConstant.PROJECT_TYPE.DELIVERABLE.value ||
      selectedProjectObj.ProjectType === this.pmConstant.PROJECT_TYPE.FTE.value) {
      sowObj.TotalScheduled = sowObj.TotalScheduled ? sowObj.TotalScheduled : 0;
      sowObj.ScheduledRevenue = sowObj.ScheduledRevenue ? sowObj.ScheduledRevenue : 0;
      sowObj.TotalLinked = sowObj.TotalLinked ? sowObj.TotalLinked : 0;
      sowObj.RevenueLinked = sowObj.RevenueLinked ? sowObj.RevenueLinked : 0;
      projectFinanceObj.InvoicesScheduled = projectFinanceObj.InvoicesScheduled ? projectFinanceObj.InvoicesScheduled : 0;
      projectFinanceObj.ScheduledRevenue = projectFinanceObj.ScheduledRevenue ? projectFinanceObj.ScheduledRevenue : 0;
      projectFinanceObj.Budget = projectFinanceObj.Budget ? projectFinanceObj.Budget : 0;
      projectFinanceObj.RevenueBudget = projectFinanceObj.RevenueBudget ? projectFinanceObj.RevenueBudget : 0;
      const sowData = {
        __metadata: {
          type: this.constants.listNames.SOW.type
        },
        TotalScheduled: sowObj.TotalScheduled - projectFinanceObj.InvoicesScheduled,
        ScheduledRevenue: sowObj.ScheduledRevenue - projectFinanceObj.ScheduledRevenue,
        TotalLinked: sowObj.TotalLinked - projectFinanceObj.Budget,
        RevenueLinked: sowObj.RevenueLinked - projectFinanceObj.RevenueBudget
      };
      const sowUpdate = Object.assign({}, options);
      sowUpdate.data = sowData;
      sowUpdate.listName = this.constants.listNames.SOW.name;
      sowUpdate.type = 'PATCH';
      sowUpdate.url = this.spServices.getItemURL(this.constants.listNames.SOW.name,
        sowObj.ID);
      batchURL.push(sowUpdate);
      projectFinanceBreakObjs.forEach(element => {
        const poLookUp = element.POLookup;
        const poItem = POObjsArray.find(c => c.ID === poLookUp);
        if (poItem) {
          poItem.TotalLinked = poItem.TotalLinked ? poItem.TotalLinked : 0;
          poItem.RevenueLinked = poItem.RevenueLinked ? poItem.RevenueLinked : 0;
          poItem.TotalScheduled = poItem.TotalScheduled ? poItem.TotalScheduled : 0;
          poItem.ScheduledRevenue = poItem.ScheduledRevenue ? poItem.ScheduledRevenue : 0;
          element.Amount = element.Amount ? element.Amount : 0;
          const poData = {
            __metadata: {
              type: this.constants.listNames.PO.type
            },
            TotalLinked: poItem.TotalLinked - element.Amount,
            RevenueLinked: poItem.RevenueLinked - element.AmountRevenue,
            TotalScheduled: poItem.TotalScheduled - element.TotalScheduled,
            ScheduledRevenue: poItem.ScheduledRevenue - element.ScheduledRevenue
          };
          const poUpdate = Object.assign({}, options);
          poUpdate.data = poData;
          poUpdate.listName = this.constants.listNames.PO.name;
          poUpdate.type = 'PATCH';
          poUpdate.url = this.spServices.getItemURL(this.constants.listNames.PO.name,
            poItem.ID);
          batchURL.push(poUpdate);
        }
      });
    }
    for (const element of scheduleListObjs) {
      if (batchURL.length < 100) {
        const scUpdateData = {
          __metadata: {
            type: this.constants.listNames.Schedules.type
          },
          Status: this.constants.STATUS.DELETED,
          ActiveCA: 'No'
        };
        const scUpdate = Object.assign({}, options);
        scUpdate.data = scUpdateData;
        scUpdate.listName = this.constants.listNames.Schedules.name;
        scUpdate.type = 'PATCH';
        scUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
          element.ID);
        batchURL.push(scUpdate);
      }
      if (batchURL.length === 99) {
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjFinancePBBProjFinanceBreakupSow');
        const batchResults = await this.spServices.executeBatch(batchURL);
        batchURL = [];
      }
    }
    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjFinancePBBProjFinanceBreakupSow');
      const updateResults = await this.spServices.executeBatch(batchURL);
      // console.log(updateResults);
    }
    this.pmObject.isMainLoaderHidden = true;
    this.pmObject.isReasonSectionVisible = false;
    this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + selectedProjectObj.ProjectCode + ' cancelled successfully.',true);
    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else if (this.router.url.includes('/projectMgmt/allProjects?ProjectCode')) {
        window.history.pushState({}, 'Title', window.location.href.split('?')[0]);
        this.route.snapshot.queryParams = null;
        this.pmObject.allProjectItems = [];
        this.selectedOption = this.overAllValues[1];
        this.providedProjectCode = this.params.ProjectCode;
        this.searchClosedProject(null);
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }
  async changeProjectStatusClose(selectedProjectObj) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const picloseUdateData = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      Status: this.constants.projectStatus.Closed,
      ActualEndDate: new Date(),
      PrevStatus: selectedProjectObj.Status,
    };
    const picloseUpdate = Object.assign({}, options);
    picloseUpdate.data = picloseUdateData;
    picloseUpdate.listName = this.constants.listNames.ProjectInformation.name;
    picloseUpdate.type = 'PATCH';
    picloseUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
      selectedProjectObj.ID);
    batchURL.push(picloseUpdate);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjInfo');
    const sResult = await this.spServices.executeBatch(batchURL);


    this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + selectedProjectObj.ProjectCode + ' closed Successfully.',true);
    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }
  async changeProjectStatusUnallocated(selectedProjectObj) {
    const projectBudgetBreakUPIds = this.toUpdateIds[0] && this.toUpdateIds[0].retItems && this.toUpdateIds[0].retItems.length ?
      this.toUpdateIds[0].retItems : [];
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const piUdateData: any = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      Status: this.constants.projectStatus.Unallocated,
      PrevStatus: selectedProjectObj.Status,
      ActualStartDate: new Date()
    };
    // logic to set current milestone for FTE-Writing project.
    if (selectedProjectObj.ProjectType === this.pmConstant.PROJECT_TYPE.FTE.value) {
      const todayDate = new Date();
      const monthNames = this.pmConstant.MONTH_NAMES;
      const todayMonthsName = monthNames[todayDate.getMonth()];
      selectedProjectObj.monthName = todayMonthsName;
      if (selectedProjectObj.Milestones) {
        const firstMilestone = selectedProjectObj.Milestones.split(';#');
        if (firstMilestone[0] === todayMonthsName) {
          piUdateData.Milestone = firstMilestone[0];
          piUdateData.Status = this.constants.projectStatus.InProgress;
          this.changeMilestoneStatusFTE(selectedProjectObj);
        }
      }
    }
    const piUpdate = Object.assign({}, options);
    piUpdate.data = piUdateData;
    piUpdate.listName = this.constants.listNames.ProjectInformation.name;
    piUpdate.type = 'PATCH';
    piUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, selectedProjectObj.ID);
    batchURL.push(piUpdate);
    const prjBudgetBreakupData = {
      __metadata: {
        type: this.constants.listNames.ProjectBudgetBreakup.type
      },
      Status: this.constants.STATUS.APPROVED,
      ApprovalDate: new Date()
    };
    projectBudgetBreakUPIds.forEach(element => {
      const prjBudgetBreakupUpdate = Object.assign({}, options);
      prjBudgetBreakupUpdate.data = prjBudgetBreakupData;
      prjBudgetBreakupUpdate.listName = this.constants.listNames.ProjectBudgetBreakup.name;
      prjBudgetBreakupUpdate.type = 'PATCH';
      prjBudgetBreakupUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectBudgetBreakup.name,
        element.ID);
      batchURL.push(prjBudgetBreakupUpdate);
    });
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjBBreakupProjectInfo');
    const sResult = await this.spServices.executeBatch(batchURL);
    this.sendEmailBasedOnStatus(this.constants.projectStatus.Unallocated, selectedProjectObj);

    this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + selectedProjectObj.ProjectCode + ' Updated Successfully.',true);
    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }

  async changeMilestoneStatusFTE(selectedProjectObj) {
    const scheduleFilter = Object.assign({}, this.pmConstant.QUERY.GET_SCHEDULE_LIST_ITEM_BY_PROJECT_CODE);
    scheduleFilter.filter = scheduleFilter.filter.replace(/{{projectCode}}/gi, selectedProjectObj.ProjectCode);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedulesByProjCode');
    const sResult = await this.spServices.readItems(this.constants.listNames.Schedules.name, scheduleFilter);
    if (sResult && sResult.length > 0) {
      const filterResult = sResult.filter(a => a.Title.indexOf(selectedProjectObj.monthName) > -1);
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      const statusNotStartedScheduleList = {
        __metadata: {
          type: this.constants.listNames.Schedules.type
        },
        Status: this.constants.STATUS.NOT_STARTED
      };
      const statusInProgressStartedScheduleList = {
        __metadata: {
          type: this.constants.listNames.Schedules.type
        },
        Status: this.constants.STATUS.IN_PROGRESS
      };
      const statusCompletedScheduleList = {
        __metadata: {
          type: this.constants.listNames.Schedules.type
        },
        Status: this.constants.STATUS.COMPLETED
      };
      filterResult.forEach(element => {
        if (element.Task !== this.pmConstant.task.BLOCKING &&
          element.Task !== this.pmConstant.task.MEETING &&
          element.Task !== this.pmConstant.task.TRAINING) {

          const scheduleStatusUpdate = Object.assign({}, options);
          scheduleStatusUpdate.data = statusInProgressStartedScheduleList;
          scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
          scheduleStatusUpdate.type = 'PATCH';
          scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
            element.ID);
          batchURL.push(scheduleStatusUpdate);
        } else if (element.Task === this.pmConstant.task.BLOCKING) {
          const scheduleStatusUpdate = Object.assign({}, options);
          scheduleStatusUpdate.data = statusCompletedScheduleList;
          scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
          scheduleStatusUpdate.type = 'PATCH';
          scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
            element.ID);
          batchURL.push(scheduleStatusUpdate);
        } else {
          const scheduleStatusUpdate = Object.assign({}, options);
          scheduleStatusUpdate.data = statusNotStartedScheduleList;
          scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
          scheduleStatusUpdate.type = 'PATCH';
          scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
            element.ID);
          batchURL.push(scheduleStatusUpdate);
        }
      });
      if (batchURL.length) {
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedules');
        await this.spServices.executeBatch(batchURL);
      }
    }
  }
  async changeProjectStatusAuditInProgress(selectedProjectObj, scheduleItems) {
    const projectFinanceID = this.toUpdateIds[1] && this.toUpdateIds[1].retItems && this.toUpdateIds[1].retItems.length ?
      this.toUpdateIds[1].retItems[0].ID : -1;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const pinfoUdateData: any = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      PrevStatus: selectedProjectObj.Status
    };
    if (selectedProjectObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      pinfoUdateData.Status = this.constants.projectStatus.SentToAMForApproval;
    } else {
      pinfoUdateData.Status = this.constants.projectStatus.AuditInProgress;
      pinfoUdateData.ProposeClosureDate = new Date();
    }

    const objMilestone = Object.assign({}, this.pmConstant.projectOptions);
    objMilestone.filter = objMilestone.filter.replace(/{{projectCode}}/gi,
      selectedProjectObj.ProjectCode);
    this.commonService.SetNewrelic('projectManagment', 'allprojects', 'fetchMilestone');
    const response = await this.spServices.readItems(this.constants.listNames.Schedules.name, objMilestone);

    const allTasks = response.length ? response : [];
    if (allTasks.length > 0) {

      const milestones = allTasks.filter(c => c.FileSystemObjectType === 1 && (c.Status === 'Not Confirmed' || c.Status === 'In Progress'));
      console.log(milestones);

      const allMilestoneTasks = allTasks.filter(c => c.FileSystemObjectType === 0 && (c.Status === 'Not Confirmed' || c.Status === 'In Progress' || c.Status === 'Not Started'));
      console.log(allMilestoneTasks);

      if (milestones) {
        milestones.forEach(milestone => {
          let modifiedSubMilestones = null;
          let SubMilestonesObj = [];
          if (milestone.SubMilestones) {
            const SubMilestones = milestone.SubMilestones.split(';#');
            if (SubMilestones) {
              SubMilestones.forEach(element => {
                const status = element.split(':')[2] === 'Not Started' || element.split(':')[2] === 'In Progress' ? 'Auto Closed' : element.split(':')[2];
                if (status !== 'Not Confirmed') {
                  SubMilestonesObj.push(element.split(':')[0] + ':' + element.split(':')[1] + ':' + status);
                }
              });
              modifiedSubMilestones = SubMilestonesObj.length > 0 ? SubMilestonesObj.join(';#') : null;
            }
          }
          const data = {
            Status: milestone.Status === 'Not Confirmed' ? 'Deleted' : 'Auto Closed',
            SubMilestones: modifiedSubMilestones,
            __metadata: { type: this.constants.listNames.Schedules.type }
          };
          this.getTaskObject(batchURL, Object.assign({}, options), milestone, data);
        });
      }
      if (allMilestoneTasks) {
        allMilestoneTasks.forEach(task => {
          const data = {
            Status: task.Status === 'Not Confirmed' ? 'Deleted' : 'Auto Closed',
            __metadata: { type: this.constants.listNames.Schedules.type }
          };
          this.getTaskObject(batchURL, Object.assign({}, options), task, data);
        });
      }
    }
    const piInfoUpdate = Object.assign({}, options);
    piInfoUpdate.data = pinfoUdateData;
    piInfoUpdate.listName = this.constants.listNames.ProjectInformation.name;
    piInfoUpdate.type = 'PATCH';
    piInfoUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
      this.selectedProjectObj.ID);
    batchURL.push(piInfoUpdate);
    // This function is used to calculate the hour spent for particular projects.

    const hourSpent = await this.getTotalHours(this.selectedProjectObj.ProjectCode,
      true, scheduleItems);
    const projectFinanceData = {
      __metadata: {
        type: this.constants.listNames.ProjectFinances.type
      },
      HoursSpent: hourSpent,
    };
    const projectFinanceUpdate = Object.assign({}, options);
    projectFinanceUpdate.data = projectFinanceData;
    projectFinanceUpdate.listName = this.constants.listNames.ProjectFinances.name;
    projectFinanceUpdate.type = 'PATCH';
    projectFinanceUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectFinances.name,
      projectFinanceID);
    batchURL.push(projectFinanceUpdate);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjInformationProjectFinance');
    const sResult = await this.spServices.executeBatch(batchURL);
    if (selectedProjectObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      this.sendEmailBasedOnStatus(this.constants.projectStatus.SentToAMForApproval, selectedProjectObj);
    } else {
      this.sendEmailBasedOnStatus(this.constants.projectStatus.AuditInProgress, selectedProjectObj);
    }
    this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + this.selectedProjectObj.ProjectCode + ' Updated Successfully.',true);
    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }

  async changeProjectStatusOnHold(selectedProjectObj, invoiceLineItems) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const scheduleFilter = Object.assign({}, this.pmConstant.QUERY.GET_SCHEDULE_LIST_ITEM_BY_PROJECT_CODE);
    scheduleFilter.filter = scheduleFilter.filter.replace(/{{projectCode}}/gi, selectedProjectObj.ProjectCode);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedulesByProjCode');
    const tasks = await this.spServices.readItems(this.constants.listNames.Schedules.name, scheduleFilter);

    const filterTasks = tasks.filter(e => e.Task !== 'Select one' && e.Milestone == this.selectedProjectObj.Milestone)

    const scNotStartedUpdateData = {
      __metadata: {
        type: this.constants.listNames.Schedules.type
      },
      Status: this.constants.STATUS.DELETED,
      NextTasks: '',
      PrevTasks: '',
    };

    const scInProgressUpdateData = {
      __metadata: {
        type: this.constants.listNames.Schedules.type
      },
      Status: this.constants.STATUS.AUTO_CLOSED,
      Actual_x0020_End_x0020_Date: new Date(),
      DueDate: new Date(),
      ExpectedTime: '',
      NextTasks: '',
    };

    const scCRUpdateData = {
      __metadata: {
        type: this.constants.listNames.Schedules.type
      },
      PrevTasks: '',
    };

    const piOnHoldUpdateData = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      Status: this.constants.projectStatus.OnHold,
      PrevStatus: selectedProjectObj.Status
    };

    invoiceLineItems.forEach(element => {
      const lineItemsData: any = {
        __metadata: { type: this.constants.listNames.InvoiceLineItems.type },
        ScheduledDate: element.date,
      };

      const invoiceUpdate = Object.assign({}, options);
      invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.InvoiceLineItems.name, element.Id);
      invoiceUpdate.data = lineItemsData;
      invoiceUpdate.type = 'PATCH';
      invoiceUpdate.listName = this.constants.listNames.InvoiceLineItems.name;
      batchURL.push(invoiceUpdate);
    })

    const piUpdate = Object.assign({}, options);
    piUpdate.data = piOnHoldUpdateData;
    piUpdate.listName = this.constants.listNames.ProjectInformation.name;
    piUpdate.type = 'PATCH';
    piUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name,
      selectedProjectObj.ID);
    batchURL.push(piUpdate);

    filterTasks.forEach(element => {
      if (element.IsCentrallyAllocated == 'No') {
        if (element.Task == "Client Review") {
          const scheduleStatusUpdate = Object.assign({}, options);
          scheduleStatusUpdate.data = scCRUpdateData;
          scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
          scheduleStatusUpdate.type = 'PATCH';
          scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
            element.ID);
          batchURL.push(scheduleStatusUpdate);
        } else {
          if (element.Status == this.constants.STATUS.NOT_STARTED) {
            const scheduleStatusUpdate = Object.assign({}, options);
            scheduleStatusUpdate.data = scNotStartedUpdateData;
            scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
            scheduleStatusUpdate.type = 'PATCH';
            scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
              element.ID);
            batchURL.push(scheduleStatusUpdate);
          } else if (element.Status == this.constants.STATUS.IN_PROGRESS) {
            const scheduleStatusUpdate = Object.assign({}, options);
            const scInProgressUpdateDataNew = Object.assign({}, scInProgressUpdateData);
            scInProgressUpdateDataNew.ExpectedTime = element.TimeSpent;
            scInProgressUpdateDataNew.DueDate = new Date(element.DueDate) < new Date() ? new Date(element.DueDate) : new Date();
            scheduleStatusUpdate.data = scInProgressUpdateDataNew;
            scheduleStatusUpdate.listName = this.constants.listNames.Schedules.name;
            scheduleStatusUpdate.type = 'PATCH';
            scheduleStatusUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
              element.ID);
            batchURL.push(scheduleStatusUpdate);
          }
        }
      }

    });

    // console.log(batchURL)

    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'setProjectOnHold');
      await this.spServices.executeBatch(batchURL);
      this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + selectedProjectObj.ProjectCode + ' Updated Successfully.',true);
      this.sendEmailBasedOnStatus(this.constants.projectStatus.OnHold, selectedProjectObj);
    }

    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }

  async changeProjectStatusOffHoldtoUnallocated(selectedProjectObj, invoiceLineItems) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const piUdateData: any = {
      __metadata: {
        type: this.constants.listNames.ProjectInformation.type
      },
      Status: this.constants.projectStatus.Unallocated,
      PrevStatus: selectedProjectObj.Status,
    };


    invoiceLineItems.forEach(element => {
      const lineItemsData: any = {
        __metadata: { type: this.constants.listNames.InvoiceLineItems.type },
        ScheduledDate: element.date,
      };

      const invoiceUpdate = Object.assign({}, options);
      invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.InvoiceLineItems.name, element.Id);
      invoiceUpdate.data = lineItemsData;
      invoiceUpdate.type = 'PATCH';
      invoiceUpdate.listName = this.constants.listNames.InvoiceLineItems.name;
      batchURL.push(invoiceUpdate);
    })

    const piUpdate = Object.assign({}, options);
    piUpdate.data = piUdateData;
    piUpdate.listName = this.constants.listNames.ProjectInformation.name;
    piUpdate.type = 'PATCH';
    piUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, selectedProjectObj.ID);
    batchURL.push(piUpdate);

    // console.log(batchURL)

    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'undoOnHold');
      await this.spServices.executeBatch(batchURL);

      this.commonService.showToastrMessage(this.constants.MessageType.success,'Project - ' + selectedProjectObj.ProjectCode + ' Updated Successfully.',true);
    }

    setTimeout(() => {
      if (this.router.url === '/projectMgmt/allProjects') {
        this.pmObject.allProjectItems = [];
        this.reloadAllProject();
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }


  getTaskObject(batchURL, options, task, data) {
    const taskObj = Object.assign({}, options);
    taskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, task.Id);
    taskObj.data = data;
    taskObj.listName = this.constants.listNames.Schedules.name;
    taskObj.type = 'PATCH';
    batchURL.push(taskObj);
  }

  async getGetIds(selectedProjectObj, projectAction) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Project Budget Breakup  ##0;
    const projectBBGet = Object.assign({}, options);
    const projectBBFilter = Object.assign({}, this.pmConstant.QUERY.PROJECT_BUDGET_BREAKUP_CANCELLED_BY_PROJECTCODE);
    projectBBFilter.filter = projectBBFilter.filter
      .replace(/{{projectCode}}/gi, selectedProjectObj.ProjectCode);
    projectBBGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectBudgetBreakup.name,
      projectBBFilter);
    projectBBGet.type = 'GET';
    projectBBGet.listName = this.constants.listNames.ProjectBudgetBreakup.name;
    batchURL.push(projectBBGet);
    // Get Project Finances  ##1;
    this.GetprojectFinanceBatch(selectedProjectObj, options, batchURL);

    if (projectAction === this.pmConstant.ACTION.CANCEL_PROJECT) {
      // Get Project Finanance Breakup by project Code ##2.
      const projectFinanceBreakupGet = Object.assign({}, options);
      const projectFinanaceBreakupFilter = Object.assign({}, this.pmConstant.QUERY.PROJECT_FINANCE_BREAKUP_CANCELLED_BY_PROJECTCODE);
      projectFinanaceBreakupFilter.filter = projectFinanaceBreakupFilter.filter.replace(/{{projectCode}}/gi,
        selectedProjectObj.ProjectCode);
      projectFinanceBreakupGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinanceBreakup.name,
        projectFinanaceBreakupFilter);
      projectFinanceBreakupGet.type = 'GET';
      projectFinanceBreakupGet.listName = this.constants.listNames.ProjectFinanceBreakup.name;
      batchURL.push(projectFinanceBreakupGet);
      // Get all SOW by Project Code ##3
      const sowGet = Object.assign({}, options);
      const sowFilter = Object.assign({}, this.pmConstant.QUERY.SOW_BY_SOWCODE);
      sowFilter.filter = sowFilter.filter.replace(/{{sowCode}}/gi,
        selectedProjectObj.SOWCode);
      sowGet.url = this.spServices.getReadURL(this.constants.listNames.SOW.name,
        sowFilter);
      sowGet.type = 'GET';
      sowGet.listName = this.constants.listNames.SOW.name;
      batchURL.push(sowGet);
      // Get all PO based on ClientLegalEntity ##4
      const poGet = Object.assign({}, options);
      const poFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_PO);
      poFilter.filter = poFilter.filter.replace(/{{clientLegalEntity}}/gi,
        selectedProjectObj.ClientLegalEntity);
      poGet.url = this.spServices.getReadURL(this.constants.listNames.PO.name,
        poFilter);
      poGet.type = 'GET';
      poGet.listName = this.constants.listNames.PO.name;
      batchURL.push(poGet);
      // Get all the task from schedule list ##5.
      const scheduleGet = Object.assign({}, options);
      const scheduleFilter = Object.assign({}, this.pmConstant.QUERY.SCHEDULE_LIST_BY_PROJECTCODE);
      scheduleFilter.filter = scheduleFilter.filter.replace(/{{projectCode}}/gi,
        selectedProjectObj.ProjectCode);
      scheduleGet.url = this.spServices.getReadURL(this.constants.listNames.Schedules.name,
        scheduleFilter);
      scheduleGet.type = 'GET';
      scheduleGet.listName = this.constants.listNames.Schedules.name;
      batchURL.push(scheduleGet);
      // Get all Inovice Line Item list by project Code ##6.
      this.GetInvoiceBatch(selectedProjectObj, options, batchURL);
    }
    else if (projectAction === this.pmConstant.ACTION.PROPOSE_CLOSURE) {
      // Get Expanses
      this.GetExpenseBatch(selectedProjectObj, options, batchURL);

      //Get Invoices
      this.GetInvoiceBatch(selectedProjectObj, options, batchURL);
    }
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedulesPOInvoiceLineItemSowListNameProjectFinancePBB');
    const results = await this.spServices.executeBatch(batchURL);
    if (results && results.length) {
      this.toUpdateIds = results;
      return results;
    }
  }


  GetInvoiceBatch(selectedProjectObj, options, batchURL) {
    const invoiceGet = Object.assign({}, options);
    const invoiceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceFilter.filter = invoiceFilter.filter.replace(/{{projectCode}}/gi,
      selectedProjectObj.ProjectCode);
    invoiceGet.url = this.spServices.getReadURL(this.constants.listNames.InvoiceLineItems.name,
      invoiceFilter);
    invoiceGet.type = 'GET';
    invoiceGet.listName = this.constants.listNames.InvoiceLineItems.name;
    batchURL.push(invoiceGet);
  }


  GetExpenseBatch(selectedProjectObj, options, batchURL) {
    const expanseGet = Object.assign({}, options);
    const expanseQuery = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_OOP);
    expanseQuery.filter = expanseQuery.filterByProjectCode.replace(/{{projectCode}}/gi, selectedProjectObj.ProjectCode);
    const expanseEndPoint = this.spServices.getReadURL('' + this.constants.listNames.SpendingInfo.name +
      '', expanseQuery);
    expanseGet.url = expanseEndPoint.replace('{0}', '' + this.globalObject.currentUser.userId);
    expanseGet.type = 'GET';
    expanseGet.listName = this.constants.listNames.SpendingInfo.name;
    batchURL.push(expanseGet);
  }


  GetprojectFinanceBatch(projObj, options, batchURL) {
    const projectFinanceGet = Object.assign({}, options);
    const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    projectFinanceGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinances.name,
      projectFinanceFilter);
    projectFinanceGet.type = 'GET';
    projectFinanceGet.listName = this.constants.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceGet);
  }
  /**
   * This method is used to get the total hours spent based on project code.
   * @param projectCode pass projectCode as parameter.
   */
  async getTotalHours(projectCode, isScheduleListStatusUpdated, scheduleItems) {
    let totalSpentTime = 0;
    let sResult = [];
    if (scheduleItems.length === 0) {
      const scheduleFilter = Object.assign({}, this.pmConstant.QUERY.GET_TIMESPENT);
      scheduleFilter.filter = scheduleFilter.filter.replace(/{{projectCode}}/gi, projectCode);
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedulesbyProjectCode');
      sResult = await this.spServices.readItems(this.constants.listNames.Schedules.name, scheduleFilter);
    }
    else {
      sResult = scheduleItems;
    }


    if (sResult && sResult.length > 0) {
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      console.log(sResult);
      sResult.forEach(task => {
        if (!(task.Task === this.pmConstant.task.FOLLOW_UP && task.Task === this.pmConstant.task.SEND_TO_CLIENT)) {
          totalSpentTime += task.TimeSpent ? this.timeToMins(task.TimeSpent) : 0;
        }
        if (isScheduleListStatusUpdated) {
          let newSubmilestones = task.SubMilestones;
          if (task.SubMilestones && task.Milestone === 'Select one') {
            newSubmilestones = '';
            const replaceString = task.SubMilestones.indexOf(';#') > -1 ? task.SubMilestones.split(';#') : [];
            replaceString.forEach(element => {
              if (element) {
                const subMilestoneTaskEle = element.split(':');
                if (subMilestoneTaskEle.length && subMilestoneTaskEle[2] === this.constants.STATUS.IN_PROGRESS) {
                  subMilestoneTaskEle[2] = this.constants.STATUS.COMPLETED;
                }
                if (subMilestoneTaskEle[2] === this.constants.STATUS.COMPLETED) {
                  element = subMilestoneTaskEle.join(':');
                  newSubmilestones += element + ';#';
                }
              }
            });
          }
          if (task.Status === this.constants.STATUS.NOT_CONFIRMED) {
            const scheduleData = {
              __metadata: {
                type: this.constants.listNames.Schedules.type
              },
              Status: this.constants.STATUS.DELETED,
              SubMilestones: newSubmilestones
            };
            const invoiceUpdate = Object.assign({}, options);
            invoiceUpdate.data = scheduleData;
            invoiceUpdate.listName = this.constants.listNames.Schedules.name;
            invoiceUpdate.type = 'PATCH';
            invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
              task.ID);
            batchURL.push(invoiceUpdate);
          }
          if (task.Status === 'Not Started'
            || task.Status === this.constants.STATUS.IN_PROGRESS
            || task.Status === this.constants.STATUS.ON_HOLD) {
            const scheduleData = {
              __metadata: {
                type: this.constants.listNames.Schedules.type
              },
              Status: this.constants.STATUS.AUTO_CLOSED,
              ActiveCA: 'No',
              SubMilestones: newSubmilestones
            };
            const invoiceUpdate = Object.assign({}, options);
            invoiceUpdate.data = scheduleData;
            invoiceUpdate.listName = this.constants.listNames.Schedules.name;
            invoiceUpdate.type = 'PATCH';
            invoiceUpdate.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name,
              task.ID);
            batchURL.push(invoiceUpdate);
          }
        }
      });
      if (isScheduleListStatusUpdated) {
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSchedules');
        const batchResults = await this.spServices.executeBatch(batchURL);
      }
    }
    // return this.convertMinsToHrsMins(totalSpentTime);
    return parseFloat((totalSpentTime / 60).toFixed(2));
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
    this.projectViewDataArray = [];
    this.pmObject.addProject.SOWSelect.SOWCode = proj.SOWCode;
    this.pmObject.addProject.ProjectAttributes.ID = proj.hasOwnProperty('ID') ? proj.ID : 0;
    this.pmObject.addProject.ProjectAttributes.ProjectCode = proj.ProjectCode;
    this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = proj.ClientLegalEntity;
    this.pmObject.addProject.ProjectAttributes.Milestone = proj.Milestone;
    this.pmObject.addProject.ProjectAttributes.SubDivision = proj.SubDivision;
    this.pmObject.addProject.ProjectAttributes.BillingEntity = proj.BillingEntity;
    this.pmObject.addProject.ProjectAttributes.BilledBy = proj.ProjectType;
    this.pmObject.addProject.ProjectAttributes.PracticeArea = proj.BusinessVertical;
    this.pmObject.addProject.ProjectAttributes.Priority = proj.Priority;
    this.pmObject.addProject.ProjectAttributes.ProjectStatus = proj.Status;
    this.pmObject.addProject.ProjectAttributes.PointOfContact1 = proj.PrimaryPOC;
    this.pmObject.addProject.ProjectAttributes.PointOfContact1Text = proj.PrimaryPOCText[0];
    this.pmObject.addProject.ProjectAttributes.PointOfContact2 = proj.AdditionalPOC && proj.AdditionalPOC.length ? proj.AdditionalPOC : [];
    const pocIds = this.pmObject.addProject.ProjectAttributes.PointOfContact2.map(x => parseInt(x, 10));
    this.pmObject.addProject.ProjectAttributes.PointOfContact2Text = this.pmCommonService.extractNamefromPOC(pocIds).join(', ');
    this.pmObject.addProject.ProjectAttributes.Molecule = proj.Molecule;
    this.pmObject.addProject.ProjectAttributes.TherapeuticArea = proj.TA;
    this.pmObject.addProject.ProjectAttributes.Indication = proj.Indication;
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = proj.IsPubSupport === 'Yes' ? true : false;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = proj.PubSupportStatus;
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = proj.ShortTitle;
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = proj.SOWBoxLink;
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = proj.ConferenceJournal;
    this.pmObject.addProject.ProjectAttributes.Authors = proj.Authors;
    this.pmObject.addProject.ProjectAttributes.Comments = proj.Comments;

    this.pmObject.addProject.ProjectAttributes.PageCount = proj.PageCount;
    this.pmObject.addProject.ProjectAttributes.ReferenceCount = proj.ReferenceCount;
    this.pmObject.addProject.ProjectAttributes.SlideCount = proj.SlideCount;
    this.pmObject.addProject.ProjectAttributes.AnnotationBinder = proj.AnnotationBinder;

    this.pmObject.addProject.ProjectAttributes.ProjectTitle = proj.Title;
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = proj.Description;
    if (proj.IsStandard === 'Yes') {
      this.pmObject.addProject.Timeline.Standard.IsStandard = true;
      this.pmObject.addProject.Timeline.NonStandard.IsStandard = false;
    } else {
      this.pmObject.addProject.Timeline.Standard.IsStandard = false;
      this.pmObject.addProject.Timeline.NonStandard.IsStandard = true;
    }
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      this.pmObject.addProject.Timeline.Standard.Service = proj.StandardService;
      this.pmObject.addProject.Timeline.Standard.ProposedStartDate = proj.ProposedStartDate;
      this.pmObject.addProject.Timeline.Standard.ProposedEndDate = proj.ProposedEndDate;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      this.pmObject.addProject.Timeline.NonStandard.Service = proj.StandardService;
      this.pmObject.addProject.Timeline.NonStandard.DeliverableType = proj.DeliverableType;
      this.pmObject.addProject.Timeline.NonStandard.SubDeliverable = proj.SubDeliverable;
      this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate = proj.ProposedStartDate;
      this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate = proj.ProposedEndDate;
    }
    let cm1Array = [];
    let delivery1Array = [];
    if (proj.CMLevel1ID && proj.CMLevel1ID.length) {
      cm1Array = this.pmCommonService.getIds(proj.CMLevel1ID);
    }
    if (proj.DeliveryLevel1ID && proj.DeliveryLevel1ID.length) {
      delivery1Array = this.pmCommonService.getIds(proj.DeliveryLevel1ID);
    }
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = cm1Array;
    this.pmObject.addProject.ProjectAttributes.ActiveCM1Text = this.pmCommonService.extractNameFromId(cm1Array).join(', ');
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = proj.CMLevel2ID ? proj.CMLevel2ID : 0;
    this.pmObject.addProject.ProjectAttributes.ActiveCM2Text = proj.CMLevel2Title ? proj.CMLevel2Title : '';
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = delivery1Array;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1Text = this.pmCommonService.extractNameFromId(delivery1Array).join(', ');
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = proj.DeliveryLevel2ID ? proj.DeliveryLevel2ID : 0;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2Text = proj.DeliveryLevel2Title ? proj.DeliveryLevel2Title : '';
    // get data from project finance based on project code.
    const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi, proj.ProjectCode);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjectFinance');
    const sResult = await this.spServices.readItems(this.constants.listNames.ProjectFinances.name, projectFinanceFilter);
    if (sResult && sResult.length > 0) {
      const fm = sResult[0];
      this.pmObject.addProject.FinanceManagement.Currency = fm.Currency;
      this.pmObject.addProject.FinanceManagement.BudgetHours = fm.BudgetHrs;
      this.pmObject.addProject.FinanceManagement.Budget.Total = fm.Budget;
      this.pmObject.addProject.FinanceManagement.Budget.Net = fm.RevenueBudget;
      this.pmObject.addProject.FinanceManagement.Budget.OOP = fm.OOPBudget;
      this.pmObject.addProject.FinanceManagement.Budget.Tax = fm.TaxBudget;
      this.pmObject.addProject.FinanceManagement.ProjectSOW = proj.SOWLink;
      if (this.pmObject.addProject.FinanceManagement.ProjectSOW) {
        if (this.pmObject.addProject.FinanceManagement.ProjectSOW.
          indexOf(this.globalObject.sharePointPageObject.webRelativeUrl) === -1) {
          const client = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(e => e.Title === proj.ClientLegalEntity);
          this.pmObject.addProject.FinanceManagement.ProjectSOW =
            this.globalObject.sharePointPageObject.webRelativeUrl + '/' + client.ListName + '/Finance/SOW/' +
            this.pmObject.addProject.FinanceManagement.ProjectSOW;
        }
      }
    }



    this.projectViewDataArray.push(this.pmObject.addProject);
    this.enableCountFields = this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medcomm'
      || this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medinfo' ? true : false;
    console.log('Test');
    console.log(this.projectViewDataArray);
    this.pmObject.isProjectRightSideVisible = true;
  }


  // **************************************************************************************************
  //   This function is used to open or download project scope 
  // **************************************************************************************************
  async goToProjectScope(task) {
    this.loaderView.nativeElement.classList.add('show');
    this.spannerView.nativeElement.classList.add('show');
    const response = await this.commonService.goToProjectScope(task, task.Status);
    if (response === 'No Document Found.') {
      this.commonService.showToastrMessage(this.constants.MessageType.error, task.ProjectCode + ' - Project Scope not found.',false);
    }
    else {
      window.open(response);
    }
    this.loaderView.nativeElement.classList.remove('show');
    this.spannerView.nativeElement.classList.remove('show');
  }


  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/dashboard#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  async manageFinances(selectedProjectObj) {
    const projObj: any = selectedProjectObj;
    projObj.isUpdate = true;
    const ref = this.dialogService.open(ManageFinanceComponent, {
      data: {
        projectObj: projObj
      },
      header: 'Manage Finance - ' + selectedProjectObj.ProjectCode + '(' + selectedProjectObj.Title + ')',
      contentStyle: { width: '100%', height: '100% !important' },
      width: '100%'
    });
    ref.onClose.subscribe(element => {
      this.pmCommonService.resetAddProject();
    });
  }

  communications(selectedProjectObj) {
    selectedProjectObj.IsSearchProject = true;
    const ref = this.dialogService.open(ViewUploadDocumentDialogComponent, {
      header: 'Communications - ' + selectedProjectObj.ProjectCode + '(' + selectedProjectObj.Title + ')',
      width: '90vw',
      data: selectedProjectObj
    });
    ref.onClose.subscribe(element => {
      this.pmCommonService.resetAddProject();
    });
  }

  projectTimeline(selectedProjectObj) {
    const ref = this.dialogService.open(ProjectTimelineComponent, {
      header: 'Project Timeline - ' + selectedProjectObj.ProjectCode + '(' + selectedProjectObj.Title + ')',
      width: '90vw',
      data: {
        projectObj: selectedProjectObj
      }
    });
    ref.onClose.subscribe(element => {
      this.pmCommonService.resetAddProject();
    });
  }

  showTimeline(selectedProjectObj) {
    const route = this.router.url;
    if (route.indexOf('myDashboard') > -1) {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'ProjectFromDashboard');
    } else {
      this.timeline.showTimeline(selectedProjectObj.ID, 'ProjectMgmt', 'Project');
    }
  }


  /**
   * This method is used to send email by using template.
   * @param val pass the template name.
   * @param header pass the header.
   */
  async sendNotificationMail(val, header, selectedProjectObj, status) {
    const queryText = val;
    const projectCode = selectedProjectObj.ProjectCode;
    let arrayTo = [];
    let arrayCC = [];
    let alterID = '';
    if (selectedProjectObj.ShortTitle) {
      alterID = '(' + selectedProjectObj.ShortTitle + ')';
    }
    let mailSubject = projectCode + alterID + ' : ' + header;
    const objEmailBody = [];
    let tempArray = [];
    const cm1IdArray = [];
    const delivery1Id = [];
    const primaryRes = [];
    selectedProjectObj.CMLevel1ID.forEach(element => {
      cm1IdArray.push(element.ID);
    });
    selectedProjectObj.DeliveryLevel1ID.forEach(element => {
      delivery1Id.push(element.ID);
    });
    selectedProjectObj.PrimaryResourcesId.forEach(element => {
      primaryRes.push(element.Id);
    });
    if (status == this.constants.projectStatus.OnHold) {
      arrayCC = arrayCC.concat(cm1IdArray, selectedProjectObj.CMLevel2ID);
      arrayCC = this.pmCommonService.getEmailId(arrayCC);
      arrayTo = arrayTo.concat(delivery1Id, selectedProjectObj.DeliveryLevel2ID, primaryRes)
      arrayTo = this.pmCommonService.getEmailId(arrayTo);
    } else {
      tempArray = tempArray.concat(cm1IdArray, selectedProjectObj.CMLevel2ID);
      arrayTo = this.pmCommonService.getEmailId(tempArray);
      objEmailBody.push({ key: '@@Val1@@', value: projectCode });
      if (status !== this.constants.projectStatus.SentToAMForApproval) {
        objEmailBody.push({ key: '@@Val2@@', value: selectedProjectObj.ClientLegalEntity });
        objEmailBody.push({ key: '@@Val3@@', value: 'All' });
      }
      if (status === this.constants.projectStatus.SentToAMForApproval) {
        objEmailBody.push({ key: '@@Val2@@', value: selectedProjectObj.Title });
        objEmailBody.push({ key: '@@Val3@@', value: selectedProjectObj.DeliverableType });
        objEmailBody.push({ key: '@@Val4@@', value: selectedProjectObj.Client });
        objEmailBody.push({ key: '@@Val5@@', value: selectedProjectObj.PrimaryPOCText });
        objEmailBody.push({ key: '@@Val8@@', value: selectedProjectObj.PrimaryPOCText });
      }
      if (status !== this.constants.projectStatus.Unallocated) {
        const hrs = await this.updateUsedHrs();
        if (status === this.constants.projectStatus.SentToAMForApproval) {
          objEmailBody.push({ key: '@@Val6@@', value: hrs });
        } else {
          objEmailBody.push({ key: '@@Val5@@', value: hrs });
        }
      }
    }
    arrayCC.push(this.pmObject.currLoginInfo.Email);
    arrayTo = Array.from(new Set(arrayTo));
    arrayCC = Array.from(new Set(arrayCC));

    this.pmCommonService.getTemplate(queryText, objEmailBody, mailSubject, arrayTo, arrayCC);
  }
  /**
   * This method is used to trigger the email based on status.
   * @param status pass project status as parameter.
   */
  sendEmailBasedOnStatus(status, selectedProjectObj) {
    switch (status) {
      case this.constants.projectStatus.AuditInProgress:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.AUDIT_PROJECT,
          'Propose closure for project', selectedProjectObj, status);
        break;
      case this.constants.projectStatus.PendingClosure:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.CLOSE_PROJECT,
          'Audit completed kindly close the project', selectedProjectObj, status);
        break;
      case this.constants.projectStatus.Unallocated:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.NOTIFY_PM,
          'Status unallocated', selectedProjectObj, status);
        break;
      case this.constants.projectStatus.SentToAMForApproval:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.APPROVED_PROJECT,
          'Approve project for billing', selectedProjectObj, status);
        break;
      case this.constants.projectStatus.OnHold:
        this.sendNotificationMail(this.constants.EMAIL_TEMPLATE_NAME.ON_HOLD,
          'On Hold', selectedProjectObj, status);
        break;
    }
  }
  /**
   * This method is used to update update used hrs.
   * @returns Hours.Min total hours.
   */
  async updateUsedHrs() {
    let totalHours;
    const projectFinanceID = this.toUpdateIds[1] && this.toUpdateIds[1].retItems && this.toUpdateIds[1].retItems.length ?
      this.toUpdateIds[1].retItems[0].ID : -1;
    if (this.selectedProjectObj.ProjectCode) {
      totalHours = await this.getTotalHours(this.selectedProjectObj.ProjectCode, false, []);
      return totalHours;
    }
  }
  /**
   * This method is used to edit the project code attributes
   * @param projObj pass the projObj as parameter.
   */
  editProject(projObj) {
    const ref = this.dialogService.open(ProjectAttributesComponent, {
      header: 'Edit Project - ' + projObj.ProjectCode + '(' + projObj.Title + ')',
      width: '90vw',
      data: {
        projectObj: projObj
      },
      contentStyle: { 'max-height': '85vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe(element => {
      this.pmCommonService.resetAddProject();
    });
  }
  /**
   * This function is used to open the move to project dialog box.
   * @param projObj pass the project object as a parameter.
   */
  async moveSOW(projObj) {
    this.sowDropDownArray = [];
    this.pmObject.isMainLoaderHidden = false;
    // this.newSelectedSOW = projObj.SOWCode;
    if (this.pmObject.allSOWItems.length === 0) {
      let arrResults = [];
      if (this.pmObject.userRights.isMangers
        || this.pmObject.userRights.isHaveSOWFullAccess
        || this.pmObject.userRights.isHaveSOWBudgetManager) {
        const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.ALL_SOW);
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSow');
        arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
      } else {
        const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.USER_SPECIFIC_SOW);
        sowFilter.filter = sowFilter.filter.replace('{{UserID}}', this.globalObject.currentUser.userId.toString());
        this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSow');
        arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
      }
      if (arrResults && arrResults.length) {
        this.pmObject.allSOWItems = arrResults;
      }
    }
    const sowArray = this.pmObject.allSOWItems;
    if (sowArray && sowArray.length) {
      sowArray.forEach(element => {
        this.sowDropDownArray.push({ label: element.SOWCode, value: element.SOWCode });
      });
    } else {

    }
    this.pmObject.isMainLoaderHidden = true;
    this.pmObject.isMoveProjectToSOWVisible = true;
  }

  /**
   * This function is used to show expense of project.
   * @param projObj pass the project object as a parameter.
   */
  async showExpense(projObj) {
    this.showExpenseEnable = true;
    this.expensedataloaderEnable = true;
    this.ExpenseCols = [
      { field: 'RequestType', header: 'Request Type', visibility: true },
      { field: 'VendorName', header: 'Vendor Freelancer', visibility: true },
      // { field: 'ClientLegalEntity', header: 'Client', visibility: true },
      { field: 'Category', header: 'Category', visibility: true },
      { field: 'ExpenseType', header: 'Expense Type', visibility: true },
      { field: 'ClientAmount', header: 'Client Amount', visibility: true },
      { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
      { field: 'Status', header: 'Status', visibility: true },
      { field: 'Modified', header: 'Modified Date', visibility: false, exportable: false },
      { field: 'ModifiedDateFormat', header: 'Modified Date', visibility: false },
      { field: 'ModifiedBy', header: 'Modified By', visibility: false },
    ];

    const result = await this.getExpanseByProjectCode(projObj.ProjectCode);

    this.projectExpenses = [];

    result.expanse.forEach(element => {

      this.projectExpenses.push({
        Category: element.Category,
        ExpenseType: element.SpendType,
        ClientAmount: element.ClientAmount ? parseFloat(parseFloat(element.ClientAmount).toFixed(2)) : 0,
        ClientCurrency: element.ClientCurrency,
        ModifiedBy: element.Editor ? element.Editor.Title : '',
        Modified: new Date(this.datePipe.transform(element.Modified, 'MMM dd, yyyy')),
        ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
        RequestType: element.RequestType,
        Status: element.Status,
        VendorName: this.getVendorNameById(result.Freelancer, element),
      });
    });
    this.expenseColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map(a => { const b = { label: a.VendorName, value: a.VendorName }; return b; }).filter(ele => ele.label)));
    this.expenseColArray.RequestType = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map(a => { const b = { label: a.RequestType, value: a.RequestType }; return b; }).filter(ele => ele.label)));
    this.expenseColArray.Status = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map(a => { const b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
    this.expenseColArray.Category = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map(a => { const b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
    this.expenseColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map(a => { const b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
    const ClientAmount = this.uniqueArrayObj(this.projectExpenses.map(a => {
      const b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b;
    }).filter(ele => ele.label));
    this.expenseColArray.ClientAmount = this.pmCommonService.customSort(ClientAmount, 1, 'label');
    this.expenseColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj
      (this.projectExpenses.map
        (a => { const b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));
    this.expenseColArray.ModifiedBy = this.uniqueArrayObj(this.projectExpenses.map(a => {
      const b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b;
    }).filter(ele => ele.label));
    this.expenseColArray.ModifiedDate = this.uniqueArrayObj(this.projectExpenses.map(a => {
      const b = { label: this.datePipe.transform(a.Modified, 'MMM dd, yyyy'), value: a.Modified }; return b;
    }).filter(ele => ele.label));

    this.projectTitle = projObj.ShortTitle ?
      projObj.ProjectCode + ' (' + projObj.ShortTitle + ') ' : projObj.ProjectCode;

    this.expensedataloaderEnable = false;
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


  customSort(event: SortEvent) {

    event.data.sort((data1, data2) => {
      const value1 = data1[event.field];
      const value2 = data2[event.field];
      let result = null;

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }
      return (event.order * result);
    });
  }

  async getExpanseByProjectCode(projectCode) {

    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    // Get Expanses
    const expanseGet = Object.assign({}, options);
    const expanseQuery = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_OOP);
    expanseQuery.filter = expanseQuery.filterByProjectCode.replace(/{{projectCode}}/gi, projectCode);
    const expanseEndPoint = this.spServices.getReadURL('' + this.constants.listNames.SpendingInfo.name +
      '', expanseQuery);
    expanseGet.url = expanseEndPoint.replace('{0}', '' + this.globalObject.currentUser.userId);
    expanseGet.type = 'GET';
    expanseGet.listName = this.constants.listNames.SpendingInfo.name;
    batchURL.push(expanseGet);


    // Get Vendor FreeLancer
    const VendorFreeLancerGet = Object.assign({}, options);
    VendorFreeLancerGet.url = this.spServices.getReadURL('' + this.constants.listNames.VendorFreelancer.name +
      '');
    VendorFreeLancerGet.type = 'GET';
    VendorFreeLancerGet.listName = this.constants.listNames.VendorFreelancer.name;
    batchURL.push(VendorFreeLancerGet);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSpendingInfoAndVendorFreelancer');
    const arrResults = await this.spServices.executeBatch(batchURL);


    const resultArray = { expanse: [], Freelancer: [], Resources: [] };

    if (arrResults) {
      resultArray.expanse = arrResults[0].retItems;
      resultArray.Freelancer = arrResults[1].retItems;
    }

    return resultArray;
  }
  getVendorNameById(freelancerVendersRes, ele) {
    const found = freelancerVendersRes.find((x) => {
      if (x.ID === ele.VendorFreelancer) {
        return x;
      }
    });
    return found ? found.Title : '';
  }


  /**
   * This method is used to transfer the project from one sow code to another sow code.
   */
  async performSOWMove() {
    const projObject = this.selectedProjectObj;
    if (projObject.SOWCode === this.newSelectedSOW) {
      this.commonService.showToastrMessage(this.constants.MessageType.error,'Source sow code ' + projObject.SOWCode + ' and destination sow ' + this.newSelectedSOW + ' cannot be same.',false);
      return;
    }
    this.pmObject.isMainLoaderHidden = false;

    const isValid = await this.validateSOWBudgetForProjectMovement(this.newSelectedSOW, projObject);
    if (isValid) {
      if (isValid === 'InvoiceNotScheduled') {

        this.commonService.showToastrMessage(this.constants.MessageType.error,'Project Movement to selected SOW ' + this.newSelectedSOW + ' is not possible due to confirmed invoice',false);
        this.pmObject.isMainLoaderHidden = true;
        return;
      }
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
      this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetSowInvoiceLineItemProjectInfo');
      const sResult = await this.spServices.executeBatch(batchURL);
      this.pmObject.isMainLoaderHidden = true;

      this.commonService.showToastrMessage(this.constants.MessageType.success,'Project move to under new SOW Code - ' + this.newSelectedSOW + '',true);
      setTimeout(() => {
        if (this.router.url === '/projectMgmt/allProjects') {
          this.pmObject.allProjectItems = [];
          this.reloadAllProject();
        } else {
          this.router.navigate(['/projectMgmt/allProjects']);
        }
        this.closeMoveSOW();
      }, this.pmConstant.TIME_OUT);
    } else {
      this.pmObject.isMainLoaderHidden = true;

      this.commonService.showToastrMessage(this.constants.MessageType.error,'Project Movement to selected SOW ' + this.newSelectedSOW + ' is not possible due to insufficient amount',false);
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
    let budgetValidateFlag = true;
    const allSOWArray = this.pmObject.allSOWItems;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Project Finance  ##0;
    this.GetprojectFinanceBatch(projObj, options, batchURL);

    // Get InvoiceLine Items ##1;
    const inoviceGet = Object.assign({}, options);
    const invoiceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceFilter.filter = invoiceFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    inoviceGet.url = this.spServices.getReadURL(this.constants.listNames.InvoiceLineItems.name,
      invoiceFilter);
    inoviceGet.type = 'GET';
    inoviceGet.listName = this.constants.listNames.InvoiceLineItems.name;
    batchURL.push(inoviceGet);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjectFinanceInvoiceLineItem');
    const sResult = await this.spServices.executeBatch(batchURL);
    const sowObj = allSOWArray.filter(x => x.SOWCode === newSOWCode);
    if (sResult && sResult.length && sowObj && sowObj.length) {
      this.moveSOWObjectArray = sResult;
      const fm = sResult[0].retItems[0];
      const invoiceItems = sResult[1].retItems;
      for (const item of invoiceItems) {
        if (item.Status !== this.constants.STATUS.SCHEDUELD) {
          return 'InvoiceNotScheduled';
        }
      }
      if (this.selectedProjectObj.ProjectType !== this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        const sowItem = sowObj[0];
        // add budget into project object to utilize for update operation.
        projObj.Budget = fm.Budget ? fm.Budget : 0;
        projObj.RevenueBudget = fm.RevenueBudget ? fm.RevenueBudget : 0;
        projObj.OOPBudget = fm.OOPBudget ? fm.OOPBudget : 0;
        projObj.TaxBudget = fm.TaxBudget ? fm.TaxBudget : 0;
        projObj.InvoicesScheduled = fm.InvoicesScheduled ? fm.InvoicesScheduled : 0;
        projObj.ScheduledRevenue = fm.ScheduledRevenue ? fm.ScheduledRevenue : 0;
        projObj.ScheduledOOP = fm.ScheduledOOP ? fm.ScheduledOOP : 0;
        const sowBalanceTotalBudget = sowItem.TotalBudget - (sowItem.TotalLinked ? sowItem.TotalLinked : 0);
        const sowBalanceRevenueBudget = sowItem.NetBudget - (sowItem.RevenueLinked ? sowItem.RevenueLinked : 0);

        if (sowBalanceTotalBudget >= projObj.Budget &&
          sowBalanceRevenueBudget >= projObj.RevenueBudget
        ) {
          budgetValidateFlag = true;
        } else {
          budgetValidateFlag = false;
        }
      }

    }
    return budgetValidateFlag;
  }

  onChangeSelect(event) {
    if (this.selectedOption.name === 'Open') {
      this.showTable = false;
      this.showProjectInput = false;
      this.callReloadProject();
    } else {
      this.showTable = false;
      const emptyProjects = [];
      this.pmObject.allProjectsArray = [...emptyProjects];
      this.showProjectInput = true;
      this.providedProjectCode = '';
      this.pmObject.tabMenuItems[0].label = 'All Projects (0)';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      this.createColFieldValues([]);
    }
  }

  async searchClosedProject(event) {
    this.isAllProjectLoaderHidden = false;
    this.isAllProjectTableHidden = true;
    this.showFilterOptions = false;
    setTimeout(() => {
      this.getProjectByCode();
    }, this.pmConstant.TIME_OUT);
  }
  async getProjectByCode() {
    const projectCode = this.providedProjectCode;
    let projectInfoFilter;
    if (this.pmObject.userRights.isMangers || this.pmObject.userRights.isHaveProjectFullAccess || this.pmObject.userRights.isInvoiceTeam) {
      projectInfoFilter = Object.assign({}, this.pmConstant.PM_QUERY.PROJECT_INFORMATION_BY_PROJECTCODE_ALL);
    } else {
      projectInfoFilter = Object.assign({}, this.pmConstant.PM_QUERY.PROJECT_INFORMATION_BY_PROJECTCODE);
      projectInfoFilter.filter = projectInfoFilter.filter.replace('{{UserID}}', this.globalObject.currentUser.userId.toString());
    }

    projectInfoFilter.filter = projectInfoFilter.filter.replace(/{{projectCode}}/gi,
      projectCode);
    this.commonService.SetNewrelic('projectManagment', 'allProj-allprojects', 'GetProjectInformation');
    const results = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, projectInfoFilter);
    this.showTable = true;
    if (results && results.length) {
      this.pmObject.allProjectItems = results;
      this.reloadAllProject();
    } else {
      const emptyProjects = [];
      this.pmObject.allProjectsArray = [...emptyProjects];
      this.pmObject.tabMenuItems[0].label = 'All Projects (0)';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
    }
    this.isAllProjectLoaderHidden = true;
    this.isAllProjectTableHidden = false;
    this.showFilterOptions = true;
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
    if (this.pmObject.allProjectsArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.allProjectRef,
        colFields: this.allProjects,
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
        if (obj.colFields['Status'].filter(c => c.value === 'Pending Closure')) {
          obj.colFields['Status'].filter(c => c.value === 'Pending Closure').map(c => c.label = 'Finance Audit')
        }
        if (obj.colFields['Status'].filter(c => c.value === 'Audit In Progress')) {
          obj.colFields['Status'].filter(c => c.value === 'Audit In Progress').map(c => c.label = 'CS Audit')
        }
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }


  // this will open dialog with filter for Finance audit or CS audit project list.
  showAllCSFinanceAudit(title) {

    const ProjectList = title === 'Finance' ? this.pmObject.allProjectsArray.filter(c => c.Status === 'Pending Closure') : this.pmObject.allProjectsArray.filter(c => c.Status === 'Audit In Progress');

    const ProjectFinanceIDs = this.toUpdateIds[1] && this.toUpdateIds[1].retItems && this.toUpdateIds[1].retItems.length ?
      this.toUpdateIds[1].retItems[0].ID : -1;

    const allProjectItems = {
      projectList: ProjectList,
      isOptionFilter: this.isOptionFilter,
      tableData: this.allProjectRef,
      AuditListType: title,
      projectFinanceIDs: ProjectFinanceIDs
    }
    this.FinanceButton = title === 'Finance' ? true : false;
    this.CSButton = title === 'CS' ? true : false;
    const csref = this.dialogService.open(CsFinanceAuditDialogComponent, {
      header: title + ' Audit List',
      width: '92vw',
      data: allProjectItems,
      contentStyle: { 'max-height': '72vh', 'overflow-y': 'auto' },
      closable: false,
    });

    csref.onClose.subscribe((allprojObj: any) => {
      if (allprojObj) {
        if (this.router.url === '/projectMgmt/allProjects') {
          this.pmObject.allProjectItems = [];
          this.reloadAllProject();
        } else {
          this.router.navigate(['/projectMgmt/allProjects']);
        }
      }

      this.FinanceButton = false;
      this.CSButton = false;
    });
  }


  AuditCSProjects(AuditProjectList, AuditComments) {

  }


}
