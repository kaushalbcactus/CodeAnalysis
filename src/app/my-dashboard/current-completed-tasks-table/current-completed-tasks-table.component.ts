import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  HostListener
} from "@angular/core";
import { ConstantsService } from "src/app/Services/constants.service";
import { MyDashboardConstantsService } from "../services/my-dashboard-constants.service";
import { DatePipe } from "@angular/common";
import { SPOperationService } from "src/app/Services/spoperation.service";
import {
  DialogService,
  MenuItem,
  Table,
  DynamicDialogConfig,
  Dropdown,
} from "primeng";
import { CommonService } from "src/app/Services/common.service";
import { ActivatedRoute } from "@angular/router";
import { TimeSpentDialogComponent } from "../time-spent-dialog/time-spent-dialog.component";
import { PreviosNextTasksDialogComponent } from "../previos-next-tasks-dialog/previos-next-tasks-dialog.component";
import { AddEditCommentComponent } from "../add-edit-comment-dialog/add-edit-comment-dialog.component";
import { ViewUploadDocumentDialogComponent } from "src/app/shared/view-upload-document-dialog/view-upload-document-dialog.component";
import { FeedbackPopupComponent } from "src/app/qms/qms/reviewer-detail-view/feedback-popup/feedback-popup.component";
import { GlobalService } from "src/app/Services/global.service";
import { AllocationOverlayComponent } from "src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component";

@Component({
  selector: "app-current-completed-tasks-table",
  templateUrl: "./current-completed-tasks-table.component.html",
  styleUrls: ["./current-completed-tasks-table.component.css"],
  providers: [AllocationOverlayComponent],
})
export class CurrentCompletedTasksTableComponent implements OnInit {
  @ViewChild("TasksTable", { static: false }) TasksTable: Table;
  // @ViewChild('dailyAllocateOP', { static: false }) dailyAllocateOP: AllocationOverlayComponent;
  // @ViewChild('feedbackPopup', { static: false }) feedbackPopupComponent: FeedbackPopupComponent;
  @Output() reloadTableData = new EventEmitter<string>();
  tableBlock: Table;
  loaderenable: boolean = true;
  @Input() allTasksData: any;
  public allTasks = [];
  cols: any[];
  TabName: any;
  taskMenu: MenuItem[];
  AllTaskColArray: any = [];
  isOptionFilter: boolean;
  modalloaderenable = true;
  selectedTask: string;
  selectedType: any;
  tableloaderenable: boolean;
  selectedindex: any;
  tempClick: any;
  hideIcon: boolean = false;
  renameSub: boolean = false;
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  subMilestonesArrayList: any;
  taskArrayList: any;
  subMilestonesArrayFormat: any[];
  subMilestonesList: any[];
  subMilestone: any;
  enteredSubMile: string;
  errorMsg: string = "";

  constructor(
    public myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    public spOperations: SPOperationService,
    public config: DynamicDialogConfig,
    public sharedObject: GlobalService,
    private dailyAllocateOP: AllocationOverlayComponent
  ) {}

  async ngOnInit() {
    this.TabName = this.route.snapshot.data.type;
    this.cols = [
      {
        field: "MainStatus",
        header: "Status",
        visibility: true,
        exportable: true,
      },
      {
        field: "TaskStatus",
        header: "Task Status",
        visibility: true,
        exportable: true,
      },
      {
        field: "TaskName",
        header: "Task Name",
        visibility: true,
        exportable: true,
      },
      {
        field: "ExportStartDate",
        header: "Start Date",
        visibility: false,
        exportable: true,
      },
      {
        field: "ExportDueDate",
        header: "End Date",
        visibility: false,
        exportable: true,
      },
      {
        field: "StartDate",
        header: "Start Date",
        visibility: true,
        exportable: false,
      },
      {
        field: "DueDate",
        header: "Due Date",
        visibility: true,
        exportable: false,
      },
      {
        field: "ExpectedTime",
        header: "Allocated Time",
        visibility: true,
        exportable: true,
      },
      {
        field: "TimeSpent",
        header: "Time Spent",
        visibility: true,
        exportable: true,
      },
    ];

    this.hideIcon = this.config.data ? true : false;
    await this.processData(
      this.config.data ? this.config.data.allpopupTasks : this.allTasksData
    );
    // if (this.config.data) {
    //   await this.processData(this.config.data.allpopupTasks);
    // }
    // else {
    //   this.allTasks = this.allTasksData;
    // }
    this.loaderenable = false;
    this.initializeTableOptions();
  }

  openPopup(data) {
    this.taskMenu = [
      {
        label: "View / Upload Documents",
        icon: "pi pi-fw pi-upload",
        command: (e) => this.getAddUpdateDocument(data),
      },
      {
        label: "View / Add Comment",
        icon: "pi pi-fw pi-comment",
        command: (e) => this.getAddUpdateComment(data, false),
      },
      {
        label: "Project Scope",
        icon: "pi pi-fw pi-file",
        command: (e) => this.goToProjectScope(data),
      },
    ];

    if (this.TabName !== "MyCompletedTask") {
      this.taskMenu.push({
        label: "Mark Complete",
        icon: "pi pi-fw pi-check",
        command: (e) => this.checkCompleteTask(data),
      });
    }

    if (data.ProjectType == "FTE-Writing" && data.SubMilestones) {
      this.taskMenu.push({
        label: "Rename Submilestone",
        icon: "pi pi-fw pi-pencil",
        command: (e) => this.renameSubmilestone(data),
      });
    }
  }

  initializeTableOptions() {
    this.AllTaskColArray =
      this.route.snapshot.data.type === "MyCompletedTask"
        ? {
            MainStatus: [{ label: "Closed", value: "Closed" }],
            TaskStatus: [],
            TaskName: [],
            StartDate: [],
            DueDate: [],
          }
        : {
            MainStatus: [],
            TaskStatus: [],
            TaskName: [],
            StartDate: [],
            DueDate: [],
          };
    this.createColFieldValues(this.allTasks);
  }

  // *********************************************************************************************************
  // Column filter for search
  // ********************************************************************************************************

  createColFieldValues(resArray) {
    this.AllTaskColArray.TaskStatus = this.commonService.sortData(
      this.myDashboardConstantsService.uniqueArrayObj(
        resArray.map((a) => {
          const b = { label: a.TaskStatus, value: a.TaskStatus };
          return b;
        })
      )
    );

    this.AllTaskColArray.TaskName = this.commonService.sortData(
      this.myDashboardConstantsService.uniqueArrayObj(
        resArray.map((a) => {
          const b = {
            label: a.DisplayTitle,
            value: a.DisplayTitle,
            // tslint:disable-next-line: align
          };
          return b;
        })
      )
    );
    this.AllTaskColArray.MainStatus = this.commonService.sortData(
      this.myDashboardConstantsService.uniqueArrayObj(
        resArray.map((a) => {
          const b = {
            label: a.MainStatus,
            value: a.MainStatus,
            // tslint:disable-next-line: align
          };
          return b;
        })
      )
    );
    this.AllTaskColArray.StartDate = this.myDashboardConstantsService.uniqueArrayObj(
      resArray.map((a) => {
        const b = {
          label:
            // tslint:disable-next-line: align
            this.datePipe.transform(a.StartDate, "MMM d, y, h:mm a"),
          value: a.StartDate,
          // tslint:disable-next-line: align
        };
        return b;
      })
    );
    this.AllTaskColArray.DueDate = this.myDashboardConstantsService.uniqueArrayObj(
      resArray.map((a) => {
        const b = {
          label:
            // tslint:disable-next-line: align
            this.datePipe.transform(a.DueDate, "MMM d, y, h:mm a"),
          value: a.DueDate,
          // tslint:disable-next-line: align
        };
        return b;
      })
    );

    this.AllTaskColArray.StartDate = this.AllTaskColArray.StartDate.sort(
      (a, b) =>
        new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );
    this.AllTaskColArray.DueDate = this.AllTaskColArray.DueDate.sort((a, b) =>
      new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );
    this.loaderenable = false;
    this.tableBlock = this.TasksTable;
  }

  exportTasks() {
    this.TasksTable.exportCSV();
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterViewChecked() {
    if (this.allTasks.length && this.isOptionFilter) {
      const obj = {
        tableData: this.TasksTable,
        colFields: this.AllTaskColArray,
      };
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (
        obj.tableData.filteredValue === null ||
        obj.tableData.filteredValue === undefined
      ) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }

  // ********************************************************************************************************
  // hide popup menu on production
  // ********************************************************************************************************

  @HostListener("document:click", ["$event"])
  clickout(event) {
    if (event.target.className === "pi pi-ellipsis-v") {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
        if (
          this.tempClick !== event.target.parentElement.children[0].children[0]
        ) {
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

  // *****************************************************************************************
  // Dialog to display task and time spent
  // *****************************************************************************************

  async showDialog(task, type, row) {
    this.modalloaderenable = true;
    this.selectedTask = this.formatModalTitle(task);
    this.selectedindex = row;
    this.selectedType = type;

    if (type === "TaskName") {
      this.getNextPreviousTaskDialog(task);
    }
    if (type === "TimeSpent") {
      await this.getupdateTimeSpent(task);
    }
    this.modalloaderenable = false;
  }

  // ******************************************************************************************
  // load component for  time spent
  // ******************************************************************************************

  async getupdateTimeSpent(task) {
    const ref = this.dialogService.open(TimeSpentDialogComponent, {
      data: {
        task,
        tab: this.TabName,
      },
      header: this.formatModalTitle(task),
      width: "90vw",
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
      closable: false,
    });
    ref.onClose.subscribe((saveTimeSpentAccess: any) => {
      if (saveTimeSpentAccess) {
        this.loaderenable = true;
        this.refreshData();
      }
    });
  }

  formatModalTitle(task) {
    const formatedSubmilestones = task.SubMilestones
      ? task.SubMilestones.replace(/[0-9]/g, "")
      : "";
    const modalTitle = task.DisplayTitle.replace(
      task.SubMilestones ? task.SubMilestones : "",
      formatedSubmilestones
    );
    return modalTitle;
  }

  async refreshData() {
    if (this.config.data) {
      const res = await this.myDashboardConstantsService.getOpenTaskForDialog();
      this.processData(res);
    } else {
      this.reloadTableData.emit();
    }
  }

  // *****************************************************************************************
  // load component for  next previous tasks
  // *****************************************************************************************

  async getNextPreviousTaskDialog(task) {
    this.tableloaderenable = true;
    let tasks = [];
    this.commonService.SetNewrelic(
      "MyDashboard",
      "MyCurrentCompletedTasks",
      "GetTasks - " + this.route.snapshot.data.type,
      "GET"
    );
    tasks = await this.myDashboardConstantsService.getNextPreviousTask(task);
    this.tableloaderenable = false;
    const ref = this.dialogService.open(PreviosNextTasksDialogComponent, {
      data: {
        task,
        allTasks: tasks,
      },
      header: this.formatModalTitle(task),
      width: "90vw",
    });
    ref.onClose.subscribe((PrevTasks: any) => {});
  }

  // *****************************************************************************************
  // load component for  comment
  // *****************************************************************************************

  async getAddUpdateComment(task, IsMarkComplete) {
    const ref = this.dialogService.open(AddEditCommentComponent, {
      data: {
        task,
        MarkComplete: IsMarkComplete,
      },
      header: this.formatModalTitle(task),
      closable: false,
      width: "80vw",
    });
    ref.onClose.subscribe(async (Commentobj: any) => {
      if (Commentobj) {
        if (Commentobj.IsMarkComplete) {
          task.parent = "Dashboard";
          task.TaskComments = Commentobj.comment;
          task.Status = "Completed";
          const qmsTasks = await this.myDashboardConstantsService.callQMSPopup(
            task
          );
          if (qmsTasks.length) {
            this.showFeedbackPopup(qmsTasks, task);
            // this.feedbackPopupComponent.openPopup(qmsTasks, task);
          } else {
            this.loaderenable = true;
            this.commonService.SetNewrelic(
              "MyDashboard",
              "MyCurrentCompletedTasks" ,
              "CompleteTask - " + this.route.snapshot.data.type,
              "POST"
            );
            this.saveTask(task);
          }
        } else {
          this.UpdateComment(Commentobj.comment, task);
        }
      }
    });
  }

  // ****************************************************************************************
  //  show feedback popup
  // ****************************************************************************************

  showFeedbackPopup(qmsTasks, task) {
    const ref = this.dialogService.open(FeedbackPopupComponent, {
      data: {
        qmsTasks,
        task,
      },
      header: "Rate Work",
      width: "70vw",
      contentStyle: {
        "min-height": "30vh",
        "max-height": "90vh",
        "overflow-y": "auto",
      },
    });
    ref.onClose.subscribe((feedbacktask: any) => {
      if (feedbacktask) {
        this.saveTask(feedbacktask);
      }
    });
  }

  // ****************************************************************************************
  //  save  task
  // ****************************************************************************************

  async saveTask(task) {
    this.loaderenable = true;
    const response = await this.myDashboardConstantsService.CompleteTask(task);
    if (response) {
      this.loaderenable = false;
      this.reloadTableData.emit();
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        response,
        false
      );
    } else {
      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        task.Title + " task Updated Successfully.",
        false
      );
      this.refreshData();
    }
  }

  // ****************************************************************************************
  //  save / Update task comment
  // ****************************************************************************************

  async UpdateComment(comment, task) {
    const data = {
      TaskComments: comment,
    };

    this.commonService.SetNewrelic(
      "MyDashboard",
      "MyCurrentCompletedTasks" ,
      "UpdateComment - " + this.route.snapshot.data.type,
      "POST"
    );
    await this.spServices.updateItem(
      this.constants.listNames.Schedules.name,
      task.ID,
      data,
      this.constants.listNames.Schedules.type
    );
    this.commonService.showToastrMessage(
      this.constants.MessageType.success,
      "Comment saved successfully",
      false
    );
  }

  async getAddUpdateDocument(task) {
    let NextTasks;
    const enableEmail = await this.myDashboardConstantsService.checkEmailNotificationEnable(
      task
    );
    if (enableEmail) {
      NextTasks = await this.myDashboardConstantsService.getNextPreviousTask(
        task
      );
    }

    const ref = this.dialogService.open(ViewUploadDocumentDialogComponent, {
      data: {
        task,
        emailNotificationEnable: enableEmail,
        nextTasks: NextTasks
          ? NextTasks.filter((c) => c.TaskType === "Next Task")
          : [],
      },
      header: this.formatModalTitle(task),
      width: "80vw",
      contentStyle: {
        "min-height": "30vh",
        "max-height": "90vh",
        "overflow-y": "auto",
      },
    });
    ref.onClose.subscribe((Comment: any) => {});
  }

  // *****************************************************************************************
  //  Mark as Complete
  // *****************************************************************************************

  async checkCompleteTask(task) {
    const allowedStatus = ["Completed", "Auto Closed"];
    this.commonService.SetNewrelic(
      "MyDashboard",
      "MyCurrentCompletedTasks",
      "checkCompleteTask",
      "GET"
    );
    const response = await this.spServices.readItem(
      this.constants.listNames.Schedules.name,
      task.ID
    );
    const stval = await this.myDashboardConstantsService.getPrevTaskStatus(
      task
    );

    task.TaskComments = response ? response.TaskComments : "";

    if (allowedStatus.includes(stval) || stval == "") {
      this.forCompleteTask(task);
    } else {
      this.commonService
        .confirmMessageDialog(
          "Confirmation",
          "Previous task is not completed, do you still want to continue?",
          null,
          ["Yes", "No"],
          false
        )
        .then(async (Confirmation) => {
          if (Confirmation === "Yes") {
            this.forCompleteTask(task);
          }
        });
    }
  }

  forCompleteTask(task) {
    if (!task.FinalDocSubmit) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        "No Final Document Found",
        false
      );
      return false;
    }
    if (task.TaskComments) {
      this.commonService
        .confirmMessageDialog(
          "Confirmation",
          "Are you sure that you want to proceed?",
          null,
          ["Yes", "No"],
          false
        )
        .then(async (Confirmation) => {
          if (Confirmation === "Yes") {
            task.parent = "Dashboard";
            task.Status = "Completed";
            const qmsTasks = await this.myDashboardConstantsService.callQMSPopup(
              task
            );
            if (qmsTasks.length) {
              this.showFeedbackPopup(qmsTasks, task);
              // this.feedbackPopupComponent.openPopup(qmsTasks, task);
            } else {
              this.saveTask(task);
            }
          }
        });
    } else {
      this.getAddUpdateComment(task, true);
    }
  }

  // ******************************************************************************************
  //   This function is used to open or download project scope
  // ******************************************************************************************
  async goToProjectScope(task) {
    const ProjectInformation = await this.myDashboardConstantsService.getCurrentTaskProjectInformation(
      task.ProjectCode
    );
    const response = await this.commonService.goToProjectScope(
      ProjectInformation,
      ProjectInformation.Status
    );
    if (response === "No Document Found.") {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        task.ProjectCode + " - Project Scope not found.",
        false
      );
    } else {
      window.open(response);
    }
  }

  async processData(res) {
    this.loaderenable = true;
    const data = [];
    for (const task of res) {
      const TaskProject = this.sharedObject.DashboardData.ProjectCodes
        ? this.sharedObject.DashboardData.ProjectCodes.find(
            (c) => c.ProjectCode === task.ProjectCode
          )
        : null;
      let DisplayTitle;
      let ProjectType =
        TaskProject !== undefined ? TaskProject.ProjectType : "";
      if (TaskProject !== undefined) {
        if (task.SubMilestones) {
          if (task.SubMilestones === "Default") {
            DisplayTitle = task.Title + " ( " + TaskProject.WBJID + ")";
          } else {
            DisplayTitle =
              task.Title +
              " - " +
              task.SubMilestones +
              " ( " +
              TaskProject.WBJID +
              ")";
          }
        } else {
          DisplayTitle = task.Title + " (" + TaskProject.WBJID + ")";
        }
      } else {
        if (task.SubMilestones) {
          if (task.SubMilestones === "Default") {
            DisplayTitle = task.Title;
          } else {
            DisplayTitle = task.Title + " - " + task.SubMilestones;
          }
        } else {
          DisplayTitle = task.Title;
        }
      }

      data.push({
        Id: task.Id,
        AssignedTo: task.AssignedTo,
        StartDate: new Date(
          this.datePipe.transform(task.StartDate, "MMM d, y, h:mm a")
        ),
        DueDate: new Date(
          this.datePipe.transform(task.DueDateDT, "MMM d, y, h:mm a")
        ),
        ExportStartDate: new Date(
          this.datePipe.transform(task.StartDate, "MMM d, y, h:mm a")
        ),
        ExportDueDate: new Date(
          this.datePipe.transform(task.DueDateDT, "MMM d, y, h:mm a")
        ),
        TimeSpent:
          task.TimeSpent === null ? 0 : task.TimeSpent.replace(".", ":"),
        TaskStatus: task.Status,
        ExpectedTime: task.ExpectedTime,
        // tslint:disable-next-line: max-line-length
        MainStatus:
          task.Status === "Completed" || task.Status === "Auto Closed"
            ? "Closed"
            : task.Status === "Not Started" || task.Status === "In Progress"
            ? "Not Completed"
            : task.Status === "Not Confirmed"
            ? "Planned"
            : "",
        DisplayTitle,
        TaskName: DisplayTitle,
        Actual_x0020_End_x0020_Date: task.Actual_x0020_End_x0020_Date,
        Actual_x0020_Start_x0020_Date: task.Actual_x0020_Start_x0020_Date,
        Comments: task.Comments,
        FinalDocSubmit: task.FinalDocSubmit,
        ID: task.Id,
        IsCentrallyAllocated: task.IsCentrallyAllocated,
        Milestone: task.Milestone,
        NextTasks: task.NextTasks,
        PrevTasks: task.PrevTasks,
        ProjectCode: task.ProjectCode,
        Status: task.Status,
        SubMilestones: task.SubMilestones,
        Task: task.Task,
        TaskComments: task.TaskComments,
        Title: task.Title,
        ParentSlot: task.ParentSlot,
        allocationPerDay: task.AllocationPerDay,
        showAllocationSplit: task.AllocationPerDay ? true : false,
        ProjectType,
      });
    }
    this.loaderenable = false;
    this.allTasks = data;
  }

  showOverlayPanel(event, rowData, dailyAllocateOP, target?) {
    const allocationPerDay = rowData.allocationPerDay
      ? rowData.allocationPerDay
      : "";
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
  }

  hideOverlayPanel() {
    this.dailyAllocateOP.hideOverlay();
  }

  async getSubmilestones(selectedItem) {
    const batchUrl = [];
    const dataObj = Object.assign({}, this.queryConfig);
    const schedulesQuery = Object.assign(
      {},
      this.myDashboardConstantsService.mydashboardComponent
        .FTESchedulesSubMilestones
    );
    schedulesQuery.filter = schedulesQuery.filter
      .replace("{{ProjectCode}}", selectedItem.ProjectCode)
      .replace("{{Milestone}}", selectedItem.Milestone);
    dataObj.url = this.spOperations.getReadURL(
      this.constants.listNames.Schedules.name,
      schedulesQuery
    );
    dataObj.listName = this.constants.listNames.Schedules.name;
    dataObj.type = "GET";
    batchUrl.push(dataObj);

    // Task list
    const taskObj = Object.assign({}, this.queryConfig);
    const taskQuery = Object.assign(
      {},
      this.myDashboardConstantsService.mydashboardComponent.FTESchedulesTask
    );
    taskQuery.filter = taskQuery.filter
      .replace("{{ProjectCode}}", selectedItem.ProjectCode)
      .replace("{{Milestone}}", selectedItem.Milestone);
    taskObj.url = this.spOperations.getReadURL(
      this.constants.listNames.Schedules.name,
      taskQuery
    );
    taskObj.listName = this.constants.listNames.Schedules.name;
    taskObj.type = "GET";
    batchUrl.push(taskObj);
    const res = await this.spOperations.executeBatch(batchUrl);
    this.subMilestonesArrayList = res.length ? res[0].retItems : [];
    this.taskArrayList = res.length
      ? res[1].retItems.filter(
          (e) => e.SubMilestones == selectedItem.SubMilestones
        )
      : [];
    console.log("this.taskArrayList ", this.taskArrayList);
    if (this.subMilestonesArrayList.length) {
      this.setSubmilestones(this.subMilestonesArrayList[0], selectedItem);
    }
    console.log("this.subMilestonesArrayList ", this.subMilestonesArrayList);
  }

  setSubmilestones(items, task) {
    this.subMilestonesArrayFormat = [];
    this.subMilestonesArrayFormat = items.SubMilestones
      ? items.SubMilestones.split(";#")
      : [];
    this.subMilestonesArrayFormat = this.subMilestonesArrayFormat.filter(
      (value) => Object.keys(value).length !== 0
    );
    const array = [];
    this.subMilestonesArrayFormat.forEach((element) => {
      element
        ? element.split(":")[0] == task.SubMilestones
          ? array.push({ label: element.split(":")[0], value: element })
          : ""
        : "";
    });
    this.subMilestonesList = array;
  }

  onChangeDD(value: any) {
    if (value) {
      this.enteredSubMile = value;
    }
  }

  checkSubMilestone(val) {
    if (val) {
      const item = val + ":1:In Progress";
      let submilestoneArray = this.subMilestonesArrayFormat.map(
        (e) => e.split(":")[0]
      );
      if (submilestoneArray.includes(this.taskArrayList[0].SubMilestones)) {
        let subIndex = submilestoneArray.indexOf(
          this.taskArrayList[0].SubMilestones
        );
        this.subMilestonesArrayFormat[subIndex] = item;
      }
      return;
    }
  }

  clearFilter(dropdown: Dropdown) {
    if (dropdown.clearClick) {
      this.subMilestone = "";
      dropdown.resetFilter();
      dropdown.focus();
    }
  }

  async renameSubmilestone(rowData) {
    await this.getSubmilestones(rowData);
    this.renameSub = true;
  }

  async onUpdate() {
    const batchUrl = [];
    this.checkSubMilestone(this.enteredSubMile);
    if (!this.subMilestone) {
      this.errorMsg = "Sub Milestone is required.";
      return false;
    } else if (
      typeof this.subMilestone == "string" &&
      this.subMilestone.length > 30
    ) {
      this.errorMsg = "Maximum Sub Milestone character length is 30 only.";
      return false;
    } else {
      this.errorMsg = "";
    }

    const array = [];
    this.subMilestonesArrayFormat.forEach((ele) => {
      if (!ele.includes(";#")) {
        array.push(ele);
      } else {
        array.push(ele);
      }
    });

    let milestoneDataObj = {};
    milestoneDataObj = {
      SubMilestones: array.join(";#"),
    };

    /* tslint:disable:no-string-literal */
    milestoneDataObj["__metadata"] = {
      type: this.constants.listNames.Schedules.type,
    };
    /* tslint:enable:no-string-literal */

    const milestoneObj = Object.assign({}, this.queryConfig);
    milestoneObj.url = this.spOperations.getItemURL(
      this.constants.listNames.Schedules.name,
      this.subMilestonesArrayList[0].ID
    );
    milestoneObj.listName = this.constants.listNames.Schedules.name;
    milestoneObj.type = "PATCH";
    milestoneObj.data = milestoneDataObj;
    batchUrl.push(milestoneObj);

    let taskObj = {};
    taskObj = {
      SubMilestones: this.subMilestone.label
        ? this.subMilestone.label
        : this.subMilestone,
    };
    /* tslint:disable:no-string-literal */
    taskObj["__metadata"] = { type: this.constants.listNames.Schedules.type };
    /* tslint:enable:no-string-literal */
    for (let i = 0; i < this.taskArrayList.length; i++) {
      let element = this.taskArrayList[i];
      await this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          element.ID
        ),
        taskObj,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }

    console.log("final batchUrl ", batchUrl);

    this.submit(batchUrl);
    this.renameSub = false;
  }

  async submit(batchUrl: any) {
    this.constants.loader.isPSInnerLoaderHidden = false;

    if (batchUrl.length) {
      const res: any = await this.spOperations.executeBatch(batchUrl);
      console.log("res ", res);
      // if (res[0].retItems.hasError) {
      //   const errorMsg = res[0].retItems.message.value;
      //   this.commonService.showToastrMessage(this.constants.MessageType.error,errorMsg,false);
      //   return false;
      // }

      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "Task Submilestone Updated",
        false
      );
      this.constants.loader.isPSInnerLoaderHidden = true;
    }
  }

  cancelSub() {
    this.enteredSubMile = "";
    this.renameSub = false;
  }
}
