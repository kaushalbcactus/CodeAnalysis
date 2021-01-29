import { Component, OnInit, ViewChild, ApplicationRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { ConstantsService } from '../../../../Services/constants.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from '../../../../Services/common.service';
import { GlobalService } from '../../../../Services/global.service';
import { SPCommonService } from '../../../../Services/spcommon.service';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { QMSCommonService } from '../../services/qmscommon.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { FeedbackPopupComponent } from '../../reviewer-detail-view/feedback-popup/feedback-popup.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.css"],
})
export class AdminViewComponent implements OnInit, OnDestroy {
  public navLinks = [
    {
      routerLink: ["/qms/adminView/retrospectiveFeedback"],
      label: "Retrospective Feedback",
    },
    { routerLink: ["/qms/adminView/scorecards"], label: "Scorecards" },
  ];
  ReviewerDetailColumns = [];
  ReviewerDetail = [];
  navigationSubscription;
  milestoneTasks = [];
  public filterObj = {
    taskType: [
      { type: "Write", value: "Write" },
      { type: "Edit", value: "Edit" },
      { type: "QC", value: "QC" },
      { type: "Graphics", value: "Graphics" },
      { type: "Review-Write", value: "Review-Write" },
      { type: "Review-Edit", value: "Review-Edit" },
      { type: "Review-QC", value: "Review-QC" },
      { type: "Review-Graphics", value: "Review-Graphics" },
    ],
    filteredResources: [],
    selectedTaskType: null,
    selectedResource: null,
    startDate: new Date(),
    endDate: new Date(),
  };
  public tasks = {
    // matFormatTasks: new MatTableDataSource([]),
    arrTasks: [],
  };
  public hideLoader = true;
  public hideTable = false;
  public displayedColumns: string[] = [
    "taskTitle",
    "taskCompletionDate",
    "rated",
    "Draft",
    "rating",
  ];
  public resources = [];
  public options = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };

  public AdminColArray = {
    taskTitle: [],
    taskCompletionDate: [],
    rated: [],
    Drafts: [],
  };

  @ViewChild("admin", { static: false }) adminTable: Table;
  showAdminTable: boolean;
  constructor(
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private spService: SPOperationService,
    private globalConstant: ConstantsService,
    public datepipe: DatePipe,
    private global: GlobalService,
    private qmsConstant: QMSConstantsService,
    private qmsCommon: QMSCommonService,
    private dialogService: DialogService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.navigationSubscription = _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  async ngOnInit() {
    this.showAdminTable = true;
    if (!this.global.currentUser.groups.length) {
      this.commonService.SetNewrelic("QMS", "admin-view", "getUserInfo", "GET");
      const result = await this.spService.getUserInfo(
        this.global.currentUser.userId
      );
      this.global.currentUser.groups = result.Groups.results
        ? result.Groups.results
        : [];
    }
    const isQMSAdmin = this.global.currentUser.groups.filter(
      (u) => u.Title === this.globalConstant.Groups.QMSAdmin
    );
    this.global.viewTabsPermission.hideAdmin = isQMSAdmin.length ? false : true;
    this.ReviewerDetailColumns = [
      { field: "taskTitle", header: "Pending Work Draft" ,Type:'string',dbName:'taskTitle', options:[]},
      { field: "taskCompletionDate", header: "Date of submission",Type:'datetime',dbName:'taskCompletionDate', options:[] },
      { field: "rated", header: "Rated",Type:'string',dbName:'rated', options:[] },
      { field: "docUrlHtmlTag", header: "Drafts",Type:'string',dbName:'docUrlHtmlTag', options:[] },
    ];
    if (!this.global.viewTabsPermission.hideAdmin) {
      this.showLoader();
      setTimeout(async () => {
        this.filterObj.startDate = new Date(
          new Date().setMonth(new Date().getMonth() - 1)
        );
        const adminComponent = JSON.parse(
          JSON.stringify(this.qmsConstant.AdminViewComponent)
        );
        adminComponent.getResources.top = adminComponent.getResources.top.replace(
          "{{TopCount}}",
          "4500"
        );
        this.commonService.SetNewrelic(
          "QMS",
          "admin-view",
          "getResourceDetails",
          "GET"
        );
        const arrResult = await this.spService.readItems(
          this.globalConstant.listNames.ResourceCategorization.name,
          adminComponent.getResources
        );
        this.resources = arrResult.length > 0 ? arrResult : [];
        this.showTable();
      }, 500);
    }
  }

  /**
   * Updates Admin view Rated column after admin provides rating
   *
   * @param task - Value emitted from FeedbackPopupComponent after adding scorecard from admin view
   *
   */
  updateReviewerTable(task) {
    const updatedTask = this.tasks.arrTasks.filter(
      (t) => t.taskID === task.taskID
    );
    updatedTask[0].rated = "Yes";
    this.bindAdminView(this.tasks.arrTasks);
  }

  /**
   * Convert data table to MatTable and bind to HTML
   *
   *
   */
  async bindAdminView(tasks) {
    // Bind results of tasks to Admin table
    this.ReviewerDetail = [];
    tasks.forEach((element) => {
      this.ReviewerDetail.push({
        taskTitle: element.taskTitle
          ? element.subMilestones
            ? element.taskTitle + " - " + element.subMilestones
            : element.taskTitle
          : "",
        title: element.taskTitle,
        milestone: element.Milestone,
        subMilestones: element.subMilestones,
        taskCompletionDate: element.taskCompletionDate
          ? new Date(
              this.datepipe.transform(element.taskCompletionDate, "MMM d, yyyy")
            )
          : "",
        rated: element.rated ? element.rated : "",
        docUrlHtmlTag: element.docUrlHtmlTag ? element.docUrlHtmlTag : "",
        documentURL: element.documentURL ? element.documentURL : "",
        reviewTaskDocUrl: element.reviewTaskDocUrl
          ? element.reviewTaskDocUrl
          : "",
        formattedCompletionDate: element.formattedCompletionDate
          ? element.formattedCompletionDate
          : "",
        resource: element.resource,
        resourceID: element.resourceID,
        taskID: element.taskID,
        reviewTask: {
          defaultSkill: "Review",
        },
      });
    });
    this.ReviewerDetailColumns = await this.commonService.MainfilterForTable(this.ReviewerDetailColumns,this.ReviewerDetail)
    // this.colFilters(this.ReviewerDetail);
    this.tasks.arrTasks = tasks;
  }

  /**
   * Fetch resource tasks
   *
   * @param element - task
   *
   */
  fetchResourcesTasks(element) {
    this.showAdminTable = false;
    //this.isOptionFilter = false;
    if (element && !this.global.viewTabsPermission.hideAdmin) {
      this.showLoader();
      setTimeout(async () => {
        const tasks = await this.getResourceTasks(
          4500,
          element.value.UserNamePG.ID
        );
        this.bindAdminView(tasks);
        this.showAdminTable = true;
        this.showTable();
      }, 500);
    }
  }

  /**
   * fetch selected resources tasks
   *
   *
   */
  async getResourceTasks(itemCount, userID) {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setHours(0, 0, 0, 0);
    // date for filter since last month
    const filterDate = new Date(today).toISOString();
    // REST API url in contants file

    const adminComponent = JSON.parse(
      JSON.stringify(this.qmsConstant.AdminViewComponent)
    );
    adminComponent.resourceTaskUrl.top = adminComponent.resourceTaskUrl.top.replace(
      "{{TopCount}}",
      "" + itemCount
    );
    adminComponent.resourceTaskUrl.filter = adminComponent.resourceTaskUrl.filter
      .replace("{{PrevMonthDate}}", filterDate)
      .replace("{{resourceID}}", userID)
      .replace("{{TaskType}}", this.filterObj.selectedTaskType);
    this.commonService.SetNewrelic("QMS", "admin-view", "CurrentUserInfo", "GET");
    const arrResult = await this.spService.readItems(
      this.globalConstant.listNames.Schedules.name,
      adminComponent.resourceTaskUrl
    );
    const arrTasks = arrResult.length > 0 ? arrResult : [];
    // Get previous task project information - 2nd Query
    let projectInformation = await this.getProjectInformation(arrTasks);
    projectInformation = [].concat(...projectInformation);
    // Get all tasks documents from tasks milestone - 3rd Query
    const documents = await this.qmsCommon.getAllTaskDocuments(
      arrTasks,
      projectInformation
    );
    const tasks = [];
    arrTasks.forEach((task) => {
      const taskDocuments = this.qmsCommon.getTaskDocuments(
        documents,
        task.Title
      );
      const taskDate = task.Actual_x0020_End_x0020_Date
        ? new Date(task.Actual_x0020_End_x0020_Date)
        : "";
      const subMilestones = task.SubMilestones ? task.SubMilestones : "";
      const milestones = task.Milestones ? task.Milestones : "";
      const obj = {
        resource: task.AssignedTo ? task.AssignedTo.Title : "",
        resourceID: task.AssignedTo ? task.AssignedTo.ID : "",
        taskTitle: task.Title ? task.Title : "",
        subMilestones,
        milestones,
        taskID: task.ID ? task.ID : "",
        rated: task.Rated ? "Yes" : "No",
        taskCompletionDate: task.Actual_x0020_End_x0020_Date
          ? new Date(task.Actual_x0020_End_x0020_Date)
          : "",
        formattedCompletionDate: this.datepipe.transform(taskDate, "MMM d, y"),
        reviewTaskDocUrl: "",
        documentURL: taskDocuments.documentUrl,
        docUrlHtmlTag: taskDocuments.documentUrlHtmlTag,
      };
      tasks.push(obj);
    });
    return tasks;
  }

  /**
   * Fetch project information for task
   *
   * @returns [] project information
   *
   */
  async getProjectInformation(task) {
    const projcode = [];
    const batchURL = [];
    // Fetch project information for each tasks
    task.forEach((element) => {
      // Fetch proj info if it fetched for first time
      if (projcode.indexOf(element.ProjectCode) < 0) {
        const getPrjItemData = Object.assign({}, this.options);
        getPrjItemData.url = this.spService.getReadURL(
          this.globalConstant.listNames.ProjectInformation.name,
          this.qmsConstant.AdminViewComponent.projectInformationUrl
        );
        getPrjItemData.url = getPrjItemData.url.replace(
          "{{projectCode}}",
          element.ProjectCode
        );
        getPrjItemData.listName = this.globalConstant.listNames.ProjectInformation.name;
        getPrjItemData.type = "GET";
        batchURL.push(getPrjItemData);
        projcode.push(element.ProjectCode);
      }
    });
    this.commonService.SetNewrelic("QMS", "admin-view", "GetProjectInfo", "GET-BATCH");
    let arrResult = await this.spService.executeBatch(batchURL);
    arrResult =
      arrResult.length > 0
        ? arrResult.map((p) => (p.retItems.length ? p.retItems[0] : {}))
        : [];
    return arrResult;
  }

  /**
   * Filter resource based on task type selected ( Write, Edit, QC, Graphics )
   *
   */
  filterResource() {
    this.showAdminTable = false;
    //this.isOptionFilter = false;
    this.filterObj.selectedResource = null;
    this.filterObj.filteredResources = [];
    // tslint:disable
    // Filter resource based on resource categorization list - Tasks column of resource
    let filteredResources = this.resources.filter(
      (t) =>
        t.Tasks.results.filter(
          (type) => type.Title === this.filterObj.selectedTaskType
        ).length > 0
    );
    filteredResources.forEach((element) => {
      this.filterObj.filteredResources.push(element);
    });
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  showToastMsg(objMsg) {
    this.commonService.showToastrMessage(objMsg.type, objMsg.detail, false);
  }

  // isOptionFilter: boolean;
  // optionFilter(event: any) {
  //   if (event.target.value) {
  //     this.isOptionFilter = false;
  //   }
  // }

  // ngAfterViewChecked() {
  //   if (this.ReviewerDetail.length && this.isOptionFilter) {
  //     let obj = {
  //       tableData: this.adminTable,
  //       colFields: this.AdminColArray,
  //     };
  //     if (obj.tableData.filteredValue) {
  //       this.commonService.updateOptionValues(obj);
  //     } else if (
  //       obj.tableData.filteredValue === null ||
  //       obj.tableData.filteredValue === undefined
  //     ) {
  //       this.colFilters(obj.tableData.value);
  //       this.isOptionFilter = false;
  //     }
  //     this.cdr.detectChanges();
  //   }
  // }

  openfeedbackpopup(qmsTasks, task) {
    const ref = this.dialogService.open(FeedbackPopupComponent, {
      data: {
        qmsTasks,
        task,
      },
      header: "Rate Work",
      width: "50vw",
      contentStyle: {
        "min-height": "30vh",
        "max-height": "90vh",
        "overflow-y": "auto",
      },
    });
    ref.onClose.subscribe((feedbackdata: any) => {
      if (feedbackdata) {
        this.updateReviewerTable(feedbackdata.task);
        this.showToastMsg(feedbackdata.message);
      }
    });
  }
}
