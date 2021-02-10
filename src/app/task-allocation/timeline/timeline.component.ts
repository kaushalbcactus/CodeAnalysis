import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  ViewEncapsulation,
  Input,
  OnDestroy,
  HostListener,
  ElementRef,
  ComponentFactoryResolver,
  ComponentRef,
  ComponentFactory,
  ViewContainerRef,
  NgZone,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { ConstantsService } from "src/app/Services/constants.service";
import { GlobalService } from "src/app/Services/global.service";
import { TaskAllocationConstantsService } from "../services/task-allocation-constants.service";
import { CommonService } from "src/app/Services/common.service";
import { TreeNode, DialogService, DynamicDialogRef } from "primeng";
import { MenuItem } from "primeng/api";
import { DragDropComponent } from "../drag-drop/drag-drop.component";
import { TaskDetailsDialogComponent } from "../task-details-dialog/task-details-dialog.component";
import {
  NgxMaterialTimepickerTheme,
  NgxMaterialTimepickerComponent
} from "ngx-material-timepicker";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { UsercapacityComponent } from "src/app/shared/usercapacity/usercapacity.component";
import { TaskAllocationCommonService } from "../services/task-allocation-common.service";
import { GanttChartComponent } from "../../shared/gantt-chart/gantt-chart.component";
import { SelectItem } from "primeng/api";
import { gantt } from "../../dhtmlx-gantt/codebase/source/dhtmlxgantt";
import { FormBuilder } from "@angular/forms";
declare let dhtmlXMenuObject: any;
import { IMilestoneTask, IResourceSelection } from "../interface/allocation";
import { IDailyAllocationTask } from "src/app/shared/pre-stack-allocation/interface/prestack";
import { PreStackAllocationComponent } from "src/app/shared/pre-stack-allocation/pre-stack-allocation.component";
import { AllocationOverlayComponent } from "src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component";
import { GanttEdittaskComponent } from "../gantt-edittask/gantt-edittask.component";
import { ConflictAllocationComponent } from "src/app/shared/conflict-allocations/conflict-allocation.component";
import { PreStackcommonService } from "src/app/shared/pre-stack-allocation/service/pre-stackcommon.service";
import { IConflictResource } from "src/app/shared/conflict-allocations/interface/conflict-allocation";
import { GanttService } from "src/app/shared/gantt-chart/service/gantt.service";
import { IUserCapacity } from 'src/app/shared/usercapacity/interface/usercapacity';
import { WriterReviewTransitionComponent } from '../writer-review-transition/writer-review-transition.component';

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.css"],
  providers: [
    DialogService,
    DragDropComponent,
    UsercapacityComponent,
    DynamicDialogRef,
    PreStackAllocationComponent,
    AllocationOverlayComponent,
    GanttEdittaskComponent,
    ConflictAllocationComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  scales: SelectItem[];
  selectedScale: any;
  @Input() projectDetails: any;
  @Output() reloadResources = new EventEmitter<string>();
  public GanttchartData = [];
  tempGanttchartData = [];
  oldGantChartData = [];
  public noTaskError = "No milestones found.";
  @ViewChild("reallocationMailTableID", { static: false })
  reallocateTable: ElementRef;
  // @ViewChild('ganttcontainer', { read: ViewContainerRef, static: false })
  // ganttChart: ViewContainerRef;
  @ViewChild("ganttcontainer", { static: false })
  ganttChart: GanttChartComponent;
  @ViewChild("dailyAllocateOP", { static: false })
  dailyAllocateOP: AllocationOverlayComponent;
  @ViewChild("ganttPicker", { static: false })
  picker: NgxMaterialTimepickerComponent;
  Today = new Date();
  tempComment;
  minDateValue = new Date();
  yearsRange =
    new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);
  task;
  errorMessage;
  milestoneDataCopy = [];
  ganttObject: any = {};
  resource = [];
  ganttComponentRef: any;
  updatedTasks: any;

  hoverRowData = {
    allocationPerDay: "",
    event: {}
  };
  min_date;
  max_date;
  startDate;
  endDate;
  currentTaskId;
  public colors = [
    {
      key: "Not Confirmed",
      value: "#FFD34E"
    },
    {
      key: "Not Started",
      value: "#5F6273"
    },
    {
      key: "In Progress",
      value: "#6EDC6C"
    },
    {
      key: "Completed",
      value: "#3498DB"
    },
    {
      key: "Auto Closed",
      value: "#8183CC"
    },
    {
      key: "Hold",
      value: "#FF3E56"
    },
    {
      key: "Not Saved",
      value: "rgb(219, 23, 33)"
    }
  ];

  public allTasks = [];
  public allRestructureTasks = [];
  batchContents = new Array();
  public GanttChartView = true;
  public visualgraph = true;
  public tableView = false;
  public webImageURL = "/sites/medcomcdn/PublishingImages";
  public oProjectDetails = {
    hoursSpent: 0,
    spentHours: 0,
    availableHours: 0,
    budgetHours: 0,
    allocatedHours: 0,
    totalMilestoneBudgetHours: 0,
    projectCode: "",
    projectID: "",
    status: "",
    projectFolder: "",
    currentMilestone: "",
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
    allOldMilestones: [],
    ta: [],
    deliverable: [],
    account: [],
    projectType: '',
    practiceArea: '',
    isPubSupport: ''
  };
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: ""
  };
  selected: any;
  milestoneData: TreeNode[] = [];
  tempmilestoneData: TreeNode[] = [];
  selectedNode: TreeNode;
  displayComment = false;
  capacityLoaderenable = false;
  displaydragdrop: boolean;
  loaderenable: boolean;
  confirmMilestoneLoader = false;
  resources: any;
  disableSave = false;
  currentTask;
  allTaskData;
  resetTask;
  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: "#424242",
      buttonColor: "#fff"
    },
    dial: {
      dialBackgroundColor: "#555"
    },
    clockFace: {
      clockFaceBackgroundColor: "#555",
      clockHandColor: "#C53E3E ",
      clockFaceTimeInactiveColor: "#fff"
    }
  };
  taskMenu: MenuItem[];
  tempClick: any;
  selectedSubMilestone: any;
  changeInRestructure = false;
  dbRecords: any[];
  reallocationMailData = [];
  reallocationMailArray = [];
  deallocationMailArray = [];
  deletedMilestones = [];
  deletedTasks = [];
  assignedUsers = [];
  showBudgetHrs = false;
  budgetHrs = 0;
  budgetHrsTask: any;
  selectedTask: any;
  displayBody = false;
  graphFlag: boolean;
  menu: any;
  dragClickedInput: string;
  capacityObj: any = {
    users: [],
    conflictAllocation: false
  };
  maxBudgetHrs: any = "";
  resourceSeletion: any;
  header: string;
  hideResourceSelection = false;
  taskTime;
  ganttSetTime: boolean = false;
  singleTask;
  defaultTimeZone = 5.5;
  ogBudgethrs = 0;
  preferredResources = [];
  minTime: any;
  maxTime: any;
  leaveAlertMsgs: any[] = [];
  transitionMil = [];
  transitionCancel: boolean = false;
  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    public commonService: CommonService,
    private taskAllocationService: TaskAllocationConstantsService,
    public datepipe: DatePipe,
    public dialogService: DialogService,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private usercapacityComponent: UsercapacityComponent,
    private resolver: ComponentFactoryResolver,
    private zone: NgZone,
    private fb: FormBuilder,
    private dailyAllocation: PreStackAllocationComponent,
    private cdRef: ChangeDetectorRef,
    private myElement: ElementRef,
    private conflictAllocation: ConflictAllocationComponent,
    private prestackService: PreStackcommonService,
    private ganttService: GanttService
  ) { }

  ngOnInit() {
    this.loaderenable = true;
    this.scales = [
      { label: "Minute Scale", value: "0" },
      { label: "Day Scale", value: "1" },
      { label: "Week Scale", value: "2" },
      { label: "Month Scale", value: "3" },
      { label: "Quarter Scale", value: "4" },
      { label: "Year Scale", value: "5" }
    ];

    if (this.projectDetails !== undefined) {
      this.sharedObject.oTaskAllocation.oProjectDetails = this.projectDetails;
      this.projectDetails.projectCode = this.projectDetails.ProjectCode;
      this.oProjectDetails.projectCode = this.projectDetails.projectCode;
      this.onPopupload();
    }

    this.sharedObject.currentUser.timeZone = this.commonService.getCurrentUserTimeZone();
  }

  ngAfterViewInit() { }

  ngAfterViewChecked() {
    this.cdRef.detach();
    this.cdRef.detectChanges();
  }

  ngOnDestroy() { }

  async onPopupload() {
    await this.callReloadRes();
    await this.getMilestones(true);
  }

  async getResourceCapacity() {
    let users = [];
    if (this.milestoneData.length) {
      const currentMilestone = this.milestoneData.find(
        m => m.data.itemType === "milestone" && m.data.isCurrent
      );
      const stDate = currentMilestone
        ? currentMilestone.data.pUserStart
        : this.milestoneData[0].data.pUserStart;
      const resources = this.getAllResources(this.allTasks);
      resources.forEach(resource => {
        users.push(
          this.sharedObject.oTaskAllocation.oResources.find(
            r => r.UserNamePG.ID === resource
          )
        );
      });
      users = [...new Set(users)].filter(Boolean);
      const newdate = this.commonService.calcBusinessDate(
        "Next",
        30,
        new Date(stDate)
      );
      this.sharedObject.oCapacity = await this.usercapacityComponent.applyFilterReturn(
        stDate,
        newdate.endDate,
        users,
        []
      );
    }
  }

  public getAllResources(tasks) {
    const validTasks = tasks.filter(t => t.Status !== "Deleted" && t.Status !== 'Completed'
      && t.Status !== 'Auto Closed' && t.Task !== 'Time Booking' && t.Task !== 'Send to client'
      && t.Task !== 'Client Review' && t.Task !== 'Adhoc');
    let resources = validTasks.map(t => t.AssignedTo.ID);
    resources = [...new Set(resources)].filter(res => res && res > 0);
    return resources;
  }

  public async callReloadRes() {
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "GetProjectResources",
      "GET"
    );
    await this.commonService.getProjectResources(
      this.oProjectDetails.projectCode,
      false,
      false
    );
  }

  // *************************************************************************************************************************************
  // Get All Milestone Data
  // *************************************************************************************************************************************

  generateDate(date) {
    return date
      ? {
        date: {
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth() + 1,
          day: new Date(date).getDate()
        }
      }
      : "";
  }

  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, "MMM d, y"));
  }
  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, "hh:mm a");
  }

  removeToolTip() {
    var elem = document.querySelector('.gantt_tooltip');
    if (elem) {
      elem.parentNode.removeChild(elem);
    }
  }

  async createFetchTaskObject(
    milestoneTasks,
    milestoneHoursSpent,
    projectHoursSpent,
    projectHoursAllocated,
    projectAvailableHours,
    allRetrievedTasks,
    tempSubmilestones,
    milestone
  ) {
    // debugger;
    let taskName = "";
    let bConsiderAllcoated = true;
    for (const milestoneTask of milestoneTasks) {
      bConsiderAllcoated =
        milestoneTask.CentralAllocationDone === "Yes" &&
          milestoneTask.IsCentrallyAllocated === "Yes"
          ? false
          : true;
      let color = this.colors.filter(c => c.key == milestoneTask.Status);
      if (color.length) {
        milestoneTask.color = color[0].value;
      }

      milestoneTask.assignedUsers = [{ Title: "", userType: "" }];

      const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(
        function (objt) {
          return milestoneTask.AssignedTo.ID === objt.UserNamePG.ID;
        }
      );
      milestoneTask.assignedUserTimeZone =
        AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          ? AssignedUserTimeZone[0].TimeZone.Title
            ? AssignedUserTimeZone[0].TimeZone.Title
            : this.defaultTimeZone
          : this.defaultTimeZone;

      const hrsMinObject = {
        timeHrs:
          milestoneTask.TimeSpent != null
            ? milestoneTask.TimeSpent.indexOf(".") > -1
              ? milestoneTask.TimeSpent.split(".")[0]
              : milestoneTask.TimeSpent
            : "00",
        timeMins:
          milestoneTask.TimeSpent != null
            ? milestoneTask.TimeSpent.indexOf(".") > -1
              ? milestoneTask.TimeSpent.split(".")[1]
              : "00"
            : 0
      };

      if (
        milestoneTask.Status !== "Deleted" &&
        milestoneTask.Status !== "Abandon"
      ) {
        milestoneHoursSpent.push(hrsMinObject);
        projectHoursSpent.push(hrsMinObject);
        if (bConsiderAllcoated) {
          projectHoursAllocated.push(+milestoneTask.ExpectedTime);
        }
      }
      if (
        milestoneTask.Status === "Completed" ||
        milestoneTask.Status === "Auto Closed"
      ) {
        if (milestoneTask.TimeSpent == null) {
          projectAvailableHours.push(+milestoneTask.ExpectedTime);
        } else {
          const mHoursSpentTask = this.commonService.addHrsMins([hrsMinObject]);
          const convertedHoursMins = this.commonService.convertFromHrsMins(
            mHoursSpentTask
          );
          projectAvailableHours.push(+convertedHoursMins);
        }
      } else if (
        milestoneTask.Status !== "Deleted" &&
        milestoneTask.Status !== "Abandon" &&
        bConsiderAllcoated
      ) {
        projectAvailableHours.push(+milestoneTask.ExpectedTime);
      }

      // Gantt Chart Sub Object

      if (milestoneTask.Status !== "Deleted") {
        milestoneTask.type = "task";

        let GanttTaskObj = await this.taskAllocateCommonService.ganttDataObject(
          milestoneTask,
          "",
          "",
          milestone,
          hrsMinObject
        );

        taskName = milestoneTask.Title.replace(
          this.sharedObject.oTaskAllocation.oProjectDetails.projectCode +
          " " +
          milestoneTask.Milestone +
          " ",
          ""
        );
        this.GanttchartData.push(GanttTaskObj);
        allRetrievedTasks.push(GanttTaskObj);
        let tempObj = {};
        if (GanttTaskObj.IsCentrallyAllocated === "Yes") {
          const dummyExistingSlot = tempSubmilestones.find(
            s => s.data.id === GanttTaskObj.id
          );
          if (dummyExistingSlot) {
            dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
          } else {
            tempObj = { data: GanttTaskObj, expanded: false, children: [] };
            tempSubmilestones.push(tempObj);
          }
        } else {
          if (GanttTaskObj.parentSlot) {
            const slot = tempSubmilestones.find(
              t => t.data.id === +GanttTaskObj.parentSlot
            );
            if (slot) {
              slot.children.push({ data: GanttTaskObj });
            } else {
              const tempSlot = Object.assign({}, GanttTaskObj);
              tempSlot.id = GanttTaskObj.parentSlot;
              tempSubmilestones.push({
                data: tempSlot,
                expanded: false,
                children: [{ data: GanttTaskObj }]
              });
            }
          } else {
            tempObj = { data: GanttTaskObj };
            tempSubmilestones.push(tempObj);
          }
        }
      }

      // Close  Gantt Chart Object
    }
  }

  createFetchTaskMilestone(milestone, milestoneHoursSpent, submile) {
    const milestoneTemp = this.GanttchartData.find(c => c.id === milestone.Id);
    if (milestoneTemp) {
      milestoneTemp.spentTime =
        milestoneHoursSpent.length > 0
          ? this.commonService.addHrsMins(milestoneHoursSpent)
          : "0:0";
      const tempmilestone = {
        data: milestoneTemp,
        expanded:
          this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
            milestone.Title
            ? true
            : false,
        children: submile
      };

      this.milestoneData.push(tempmilestone);
    }
  }

  async createFetchTaskCR(milestone) {
    const clientReviewObj = this.allTasks.filter(
      c =>
        c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE &&
        c.Milestone === milestone.Title &&
        c.Task === "Client Review" &&
        c.Status !== "Deleted"
    );

    if (clientReviewObj.length > 0) {
      clientReviewObj[0].assignedUsers = [{ Title: "", userType: "" }];
      const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(
        function (objt) {
          return clientReviewObj[0].AssignedTo.ID === objt.UserNamePG.ID;
        }
      );
      clientReviewObj[0].assignedUserTimeZone =
        AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          ? AssignedUserTimeZone[0].TimeZone.Title
            ? AssignedUserTimeZone[0].TimeZone.Title
            : this.defaultTimeZone
          : this.defaultTimeZone;

      let color = this.colors.filter(c => c.key == clientReviewObj[0].Status);
      if (color.length) {
        clientReviewObj[0].color = color[0].value;
      }

      clientReviewObj[0].type = "task";
      let GanttTaskObj = await this.taskAllocateCommonService.ganttDataObject(
        clientReviewObj[0],
        "",
        "",
        milestone,
        ""
      );

      if (GanttTaskObj.status !== "Deleted") {
        this.GanttchartData.push(GanttTaskObj);
      }

      const tempmilestone = { data: GanttTaskObj, children: [] };
      this.milestoneData.push(tempmilestone);
    }
  }

  async createFetchTaskSubMil(
    dbSubMilestones,
    milestone,
    GanttObj,
    nextSubMilestone,
    milestoneHoursSpent,
    projectHoursSpent,
    projectHoursAllocated,
    projectAvailableHours,
    allRetrievedTasks,
    submile
  ) {
    let index = 0;
    for (const element of dbSubMilestones) {
      index++;
      let color = this.colors.filter(c => c.key == element.status);

      element.Id = "SM" + milestone.Id + index; //parseInt("1200000" + milestone.Id + index)
      element.type = "submilestone";
      element.Status = element.status;
      if (color.length) {
        element.color = color[0].value;
      }

      let tempSubmilestones = [];
      let GanttTaskObj = await this.taskAllocateCommonService.ganttDataObject(
        element,
        GanttObj,
        nextSubMilestone,
        milestone,
        ""
      );
      if (GanttTaskObj.status !== "Deleted") {
        this.GanttchartData.push(GanttTaskObj);
      }
      const milestoneTasks = this.allTasks.filter(
        c =>
          c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE &&
          c.Milestone === milestone.Title &&
          c.SubMilestones === element.subMile
      );
      await this.createFetchTaskObject(
        milestoneTasks,
        milestoneHoursSpent,
        projectHoursSpent,
        projectHoursAllocated,
        projectAvailableHours,
        allRetrievedTasks,
        tempSubmilestones,
        milestone
      );

      if (tempSubmilestones.length > 0) {
        const tempSubmilestonesWOAT = tempSubmilestones.filter(
          c => c.data.itemType !== "Time Booking"
        );
        const subMilData = this.GanttchartData.find(
          c => c.title === element.subMile && c.parent === milestone.Id
        );
        if (tempSubmilestonesWOAT.length) {
          subMilData.start_date = tempSubmilestonesWOAT[0].data.start_date;
          subMilData.end_date =
            tempSubmilestonesWOAT[
              tempSubmilestonesWOAT.length - 1
            ].data.end_date;
          subMilData.pUserStart = tempSubmilestonesWOAT[0].data.start_date;
          subMilData.pUserEnd =
            tempSubmilestonesWOAT[
              tempSubmilestonesWOAT.length - 1
            ].data.end_date;

        } else {
          subMilData.start_date = tempSubmilestones[0].data.start_date;
          subMilData.end_date =
            tempSubmilestones[
              tempSubmilestones.length - 1
            ].data.end_date;
          subMilData.pUserStart = tempSubmilestones[0].data.start_date;
          subMilData.pUserEnd =
            tempSubmilestones[
              tempSubmilestones.length - 1
            ].data.end_date;
        }
        this.setDatePartAndTimePart(subMilData);
      }


      const temptasks = {
        data: this.GanttchartData.find(
          c => c.title === element.subMile && c.parent === milestone.Id
        ),
        expanded:
          this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
            milestone.Title
            ? true
            : false,
        children: tempSubmilestones
      };

      submile.push(temptasks);
    }
  }
  getNextTask(currentTask, allTasks, allNewTasks) {
    if (currentTask.data.nextTask) {
      const nextTasks = currentTask.data.nextTask.split(";");
      const newTasks = allTasks.filter(
        e => nextTasks.indexOf(e.data.title) > -1
      );
      const newNextTasks = [];
      newTasks.forEach(newTask => {
        if (allNewTasks.indexOf(newTask) === -1) {
          allNewTasks.push(newTask);
          newNextTasks.push(newTask);
        }
      });
      newNextTasks.forEach(newNext => {
        this.getNextTask(newNext, allTasks, allNewTasks);
      });
    }
  }

  sortTasks(subMilestone) {
    let allTasks = subMilestone.children;
    const startTasks = allTasks.filter(e => !e.data.previousTask);
    let allNewTasks = [...startTasks];
    startTasks.forEach(element => {
      this.getNextTask(element, allTasks, allNewTasks);
    });
    allNewTasks = allNewTasks.sort(
      (a, b) =>
        <any>new Date(a.data.start_date) - <any>new Date(b.data.start_date)
    );
    subMilestone.children = allNewTasks;
  }

  /////// Impelement reorder function
  reOrderTaskItems(milestoneData) {
    milestoneData.forEach(milestone => {
      if (milestone.data.type === 'milestone' && milestone.data.status !== 'Completed' && milestone.data.status !== 'Deleted') {
        let getSubMil = [],
          getTasks = [];
        getSubMil = milestone.children.filter(
          e => e.data.type === "submilestone"
        );
        getTasks = milestone.children.filter(e => e.data.type === "task");
        if (getSubMil.length) {
          getSubMil = getSubMil.sort(
            (a, b) =>
              +a.data.position - +b.data.position &&
              <any>new Date(a.data.start_date) -
              <any>new Date(b.data.start_date)
          );
          getSubMil.forEach(subMil => {
            this.sortTasks(subMil);
          });
        }
        if (getSubMil.length && getTasks.length) {
          getTasks = getTasks.sort(
            (a, b) =>
              <any>new Date(a.data.start_date) -
              <any>new Date(b.data.start_date)
          );
          milestone.children = [...getSubMil, ...getTasks];
        } else if (getSubMil.length) {
          milestone.children = [...getSubMil];
        } else if (getTasks.length) {
          this.sortTasks(milestone);
        }
      }
    });
  }

  async fetchDetails() {
    // tslint:disable: max-line-length
    const batchUrl = [];
    const milestoneObj = Object.assign({}, this.queryConfig);
    milestoneObj.url = this.spServices.getReadURL(
      this.constants.listNames.Schedules.name,
      this.taskAllocationService.taskallocationComponent.milestone
    );
    milestoneObj.url = milestoneObj.url.replace(
      /{{projectCode}}/gi,
      this.oProjectDetails.projectCode
    );
    milestoneObj.listName = this.constants.listNames.PreferredResources.name;
    milestoneObj.type = "GET";
    batchUrl.push(milestoneObj);

    const preferredResObj = Object.assign({}, this.queryConfig);
    preferredResObj.url = this.spServices.getReadURL(
      this.constants.listNames.PreferredResources.name,
      this.taskAllocationService.taskallocationComponent.getPreferredResources
    );
    preferredResObj.url = preferredResObj.url
      .replace(/{{practiceArea}}/gi, this.oProjectDetails.practiceArea)
      .replace(/{{currentuser}}/gi, "" + this.sharedObject.currentUser.userId);
    preferredResObj.listName = this.constants.listNames.PreferredResources.name;
    preferredResObj.type = "GET";
    batchUrl.push(preferredResObj);

    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "GetMilestonesByProjectCode and preferred resources",
      "GET-BATCH"
    );
    const arrResult = await this.spServices.executeBatch(batchUrl);
    const response = arrResult.length > 0 ? arrResult.map(a => a.retItems) : [];
    return {
      tasks: response.length > 0 ? response[0] : [],
      preferredResources: response.length > 1 ? response[1] : []
    };
  }

  // tslint:disable
  public async getMilestones(bFirstLoad) {
    this.loaderenable = true;
    this.sharedObject.isResourceChange = false;
    (this.GanttchartData = []), (this.milestoneData = []);
    this.oProjectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const projectHoursSpent = [],
      projectHoursAllocated = [],
      projectAvailableHours = [],
      totalMilestoneBudgetHours = [];
    let milestones = [],
      milestoneTasks = [],
      milestoneSubmilestones = [],
      allRetrievedTasks = [];
    const response = await this.fetchDetails();
    this.allTasks = response.tasks;
    this.preferredResources = response.preferredResources;

    if (this.allTasks.length > 0) {
      milestones = this.allTasks.filter(
        c => c.ContentTypeCH === this.constants.CONTENT_TYPE.MILESTONE
      );
      this.deletedMilestones = milestones.filter(m => m.Status === "Deleted");
      const arrMilestones = this.sharedObject.oTaskAllocation.oProjectDetails
        .allMilestones;

      const milestonesList = [];
      ////// Sorts the data as per the stored order
      for (const mil of arrMilestones) {
        const milestone = milestones.find(
          e => e.Title === mil && e.Status !== "Deleted"
        );
        if (milestone) {
          milestonesList.push(milestone);
        }
      }
      milestones = milestonesList;
      this.dbRecords = [];

      for (const milestone of milestones) {
        const tempmilestoneTask = this.allTasks.filter(
          c =>
            c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE &&
            c.Milestone === milestone.Title
        );
        this.dbRecords.push({
          milestone: milestone,
          tasks: tempmilestoneTask.map(c =>
            c.Title.replace(
              this.sharedObject.oTaskAllocation.oProjectDetails.projectCode +
              " " +
              milestone.Title +
              " ",
              ""
            )
          )
        });
        const milestoneHoursSpent = [];
        let taskName;
        milestoneSubmilestones =
          milestone.SubMilestones !== null
            ? milestone.SubMilestones.replace(/#/gi, "").split(";")
            : [];

        let dbSubMilestones: Array<any> =
          milestoneSubmilestones.length > 0
            ? milestoneSubmilestones.map(
              o =>
                new Object({
                  subMile: o.split(":")[0],
                  position: o.split(":")[1],
                  status: o.split(":")[2],
                  Milestone: milestone.Title
                })
            )
            : [];

        const nextSubMilestone =
          dbSubMilestones.length > 0
            ? dbSubMilestones.find(c => c.status === "Not Confirmed") !==
              undefined
              ? dbSubMilestones.find(c => c.status === "Not Confirmed")
              : new Object({
                subMile: "",
                position: "",
                status: "",
                Milestone: milestone.Title
              })
            : new Object({
              subMile: "",
              position: "",
              status: "",
              Milestone: milestone.Title
            });

        milestone.startDate = this.generateDate(
          milestone.Actual_x0020_Start_x0020_Date
        );
        milestone.endDate = this.generateDate(
          milestone.Actual_x0020_End_x0020_Date
        );

        let color = this.colors.filter(c => c.key == milestone.Status);
        if (color.length) {
          milestone.color = color[0].value;
        }

        milestone.type = "milestone";
        // Gantt Chart Object

        let GanttObj: any = await this.taskAllocateCommonService.ganttDataObject(
          milestone
        );

        if (GanttObj.status !== "Deleted") {
          this.GanttchartData.push(GanttObj);
        }
        if (dbSubMilestones.length > 0) {
          let submile = [];
          await this.createFetchTaskSubMil(
            dbSubMilestones,
            milestone,
            GanttObj,
            nextSubMilestone,
            milestoneHoursSpent,
            projectHoursSpent,
            projectHoursAllocated,
            projectAvailableHours,
            allRetrievedTasks,
            submile
          );

          const defaultTasks = this.allTasks.filter(
            c =>
              c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE &&
              c.Milestone === milestone.Title &&
              (c.SubMilestones === null || c.SubMilestones === "Default") &&
              c.Task !== "Client Review" &&
              c.Status !== "Deleted"
          );

          if (defaultTasks.length) {
            await this.createFetchTaskObject(
              defaultTasks,
              milestoneHoursSpent,
              projectHoursSpent,
              projectHoursAllocated,
              projectAvailableHours,
              allRetrievedTasks,
              submile,
              milestone
            );
          }
          this.createFetchTaskMilestone(
            milestone,
            milestoneHoursSpent,
            submile
          );
          await this.createFetchTaskCR(milestone);
        } else {
          milestoneTasks = this.allTasks.filter(
            c =>
              c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE &&
              c.Milestone === milestone.Title &&
              c.Task !== "Client Review"
          );

          let tempSubmilestones = [];
          await this.createFetchTaskObject(
            milestoneTasks,
            milestoneHoursSpent,
            projectHoursSpent,
            projectHoursAllocated,
            projectAvailableHours,
            allRetrievedTasks,
            tempSubmilestones,
            milestone
          );

          this.createFetchTaskMilestone(
            milestone,
            milestoneHoursSpent,
            tempSubmilestones
          );

          await this.createFetchTaskCR(milestone);
        }
      }

      ////// Assign users & hours
      this.assignProjectHours(
        projectHoursSpent,
        projectHoursAllocated,
        projectAvailableHours,
        totalMilestoneBudgetHours
      );

      this.reOrderTaskItems(this.milestoneData);
      if (this.projectDetails === undefined) {
        this.assignUsers(allRetrievedTasks);
      }

      this.GanttchartData = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      this.tempmilestoneData = [];
      this.oldGantChartData = JSON.parse(JSON.stringify(this.GanttchartData));
      this.tempGanttchartData = JSON.parse(JSON.stringify(this.GanttchartData));
      this.tempmilestoneData = JSON.parse(JSON.stringify(this.milestoneData));
    } else {
      this.milestoneData = [];
    }
    this.visualgraph = this.graphFlag !== undefined ? this.graphFlag : true;
    if (this.visualgraph) {
      this.tableView = false;
      this.showGanttChart(true);
    } else {
      this.removeToolTip();
      this.tableView = true;
      this.createGanttDataAndLinks(true);
    }
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));

    this.disableSave = false;
    if (!bFirstLoad) {
      this.changeInRestructure = false;

      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "Tasks Saved Successfully.",
        false
      );
    } else {
      this.ganttChart.ganttAttachEvents();
    }
    await this.getResourceCapacity();
    this.loaderenable = false;
    this.GanttChartView = true;

  }

  assignProjectHours(
    projectHoursSpent,
    projectHoursAllocated,
    projectAvailableHours,
    totalMilestoneBudgetHours
  ) {
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));
    this.oProjectDetails.hoursSpent = this.commonService.convertToHrs(
      projectHoursSpent.length > 0
        ? this.commonService.addHrsMins(projectHoursSpent)
        : "0:0"
    );
    this.oProjectDetails.hoursSpent = parseFloat(
      this.oProjectDetails.hoursSpent.toFixed(2)
    );
    this.oProjectDetails.allocatedHours = projectHoursAllocated
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
    this.oProjectDetails.spentHours = projectAvailableHours
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
    this.oProjectDetails.totalMilestoneBudgetHours = totalMilestoneBudgetHours.reduce(
      (a, b) => a + b,
      0
    );

    this.oProjectDetails.availableHours = +(
      +this.oProjectDetails.budgetHours - +this.oProjectDetails.spentHours
    ).toFixed(2);
  }

  async assignUsersToTask(taskObj, allRetrievedTasks) {
    const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(
      taskObj.data,
      allRetrievedTasks
    );

    taskObj.data.assignedUsers = [];
    const response = await this.formatAssignedUser(assignedUsers);
    taskObj.data.assignedUsers = response;
    if (taskObj.data.editMode) {
      taskObj.data.assignedUsers.forEach(element => {
        if (
          element.items.find(c => c.value.ID === taskObj.data.AssignedTo.ID)
        ) {
          taskObj.data.AssignedTo = element.items.find(
            c => c.value.ID === taskObj.data.AssignedTo.ID
          ).value;
        }
      });
    }
  }

  // *************************************************************************************************************************************
  // Switch between Gantt chart and Tree table View
  // *************************************************************************************************************************************

  public async assignUsers(allRetrievedTasks) {
    for (
      let nCount = 0;
      nCount < this.milestoneData.length;
      nCount = nCount + 1
    ) {
      let milestone = this.milestoneData[nCount];
      if (milestone.data.itemType === "Client Review") {
        await this.assignUsersToTask(milestone, allRetrievedTasks);
      } else if (milestone.children !== undefined) {
        for (
          let nCountSub = 0;
          nCountSub < milestone.children.length;
          nCountSub = nCountSub + 1
        ) {
          let submilestone = milestone.children[nCountSub];
          if (submilestone.data.type === "task") {
            await this.assignUsersToTask(submilestone, allRetrievedTasks);
          } else if (submilestone.children !== undefined) {
            for (
              let nCountTask = 0;
              nCountTask < submilestone.children.length;
              nCountTask = nCountTask + 1
            ) {
              const task = submilestone.children[nCountTask];
              await this.assignUsersToTask(task, allRetrievedTasks);
            }
          }
        }
      }
    }
  }

  formatAssignedUser(assignedUsers) {
    const response = [];
    const UniqueUserType = assignedUsers
      .map(c => c.userType)
      .filter(
        (item, index) =>
          assignedUsers.map(c => c.userType).indexOf(item) === index
      );
    console.log(assignedUsers);

    for (const retRes of UniqueUserType) {
      const Items = [];
      const Users = assignedUsers.filter(c => c.userType === retRes);
      Users.forEach(user => {
        const tempUser = user.UserNamePG ? user.UserNamePG : user;
        Items.push({
          label: tempUser.Title,
          value: {
            ID: tempUser.ID,
            Title: tempUser.Title,
            Email: tempUser.EMail ? tempUser.EMail : tempUser.Email,
            SkillText: tempUser.SkillText ? tempUser.SkillText : ""
          }
        });
      });
      response.push({ label: retRes, items: Items });
    }
    return response;
  }

  showVisualRepresentation() {
    if (this.visualgraph === false) {
      this.tableView = false;
      this.visualgraph = true;
      this.showGanttChart(true);
    } else {
      this.removeToolTip();
      this.visualgraph = false;
      this.tableView = true;
    }
  }

  async showGanttChart(bCreateLinks) {
    await this.createGanttDataAndLinks(bCreateLinks);
    await this.loadComponent();
  }

  createLinkArrayObject(sourceObj, targetObj) {
    return {
      name: sourceObj.title,
      source: sourceObj.id,
      target: targetObj.id,
      nextTask: sourceObj.nextTask,
      type: 0
    };
  }

  createGanttDataAndLinks(createLinks, milestonesList?) {
    const linkArray = [];

    const data = this.GanttchartData;
    let milestones = data.filter(e => e.type == "milestone");
    milestones.map(m => {
      const getFirstTasks = data.filter(
        e =>
          e.type === "task" &&
          e.milestone === m.taskFullName &&
          !e.previousTask &&
          e.itemType !== "Adhoc" &&
          e.itemType !== "TB" && e.itemType !== "Time Booking"
      );


      if (getFirstTasks.length) {
        let firstTask;
        if (getFirstTasks.length > 1) {
          firstTask = this.sortByDate(getFirstTasks, "start_date", "asc")[0];
        } else {
          firstTask = getFirstTasks[0];
          m.start_date = new Date(firstTask.start_date);
        }

        if (firstTask.start_date > m.start_date) {
          m.start_date = new Date(firstTask.start_date);
        }
      }

      const getLastTasks = data.filter(
        e =>
          e.type === "task" &&
          e.milestone === m.taskFullName &&
          e.itemType == "Send to client" &&
          (!e.nextTask || e.nextTask === 'Client Review')
      );

      if (getLastTasks.length) {
        let lastTask;
        if (getLastTasks.length > 1) {
          lastTask = this.sortByDate(getLastTasks, "end_date", "desc")[0];
        } else {
          lastTask = getLastTasks[0];
          m.end_date = new Date(lastTask.end_date);
        }

        if (lastTask.end_date > m.end_date) {
          m.end_date = new Date(lastTask.end_date);
        }
      }

      const getClientReview = data.find(
        e => e.itemType === "Client Review" && e.milestone === m.taskFullName
      );
      const milIndex = this.milestoneData.findIndex(e => e.data.id === m.id);
      if (getClientReview) {
        if (getClientReview.start_date > m.end_date) {
          getClientReview.start_date = new Date(m.end_date);
        } else {
          m.end_date = new Date(getClientReview.start_date);
        }
        getClientReview.start_date = new Date(getClientReview.start_date);
        getClientReview.end_date = new Date(getClientReview.end_date);
      } else {
        m.end_date = new Date(new Date(m.end_date).setHours(23, 59, 59, 59));
      }
      this.milestoneData[milIndex].data.end_date = m.end_date;
      this.milestoneData[milIndex].data.start_date = m.start_date;
      return m;
    });

    data.forEach((item, index) => {
      item.parent = 0;
      if (item.type === "submilestone") {
        const mil = milestones.find(e => e.title === item.milestone);
        item.parent = mil.id;
        item.start_date = new Date(item.start_date);
        item.end_date = new Date(item.end_date);
        const subMils = data.filter(
          e =>
            (e.position ? parseInt(e.position) : 0) ===
            parseInt(item.position) + 1
        );
        subMils.forEach(submil => {
          linkArray.push(this.createLinkArrayObject(item, submil));
        });
      } else if (item.type === "task" && item.itemType !== "Client Review") {
        if (item.parentSlot) {
          item.parent = item.parentSlot;
          item.start_date = new Date(item.start_date);
          item.end_date = new Date(item.end_date);
        } else {
          const taskParent = data.find(e =>
            item.submilestone
              ? e.title === item.submilestone && e.milestone === item.milestone
              : e.title === item.milestone
          );
          item.parent = taskParent.id;
          item.start_date = new Date(item.start_date);
          item.end_date = new Date(item.end_date);
        }
        if (item.nextTask && item.nextTask.indexOf("Client Review") === -1) {
          const nextTasks = this.fetchNextTasks(item);
          nextTasks.forEach(nextTask => {
            linkArray.push(this.createLinkArrayObject(item, nextTask));
          });
        }
      } else if (item.type === "task" && item.itemType === "Client Review") {
        const arrMilestones = milestonesList
          ? milestonesList
          : this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones;
        const milIndex = arrMilestones.indexOf(item.milestone);
        const nextMilesone =
          arrMilestones.length - 1 === milIndex
            ? ""
            : arrMilestones[milIndex + 1];
        if (nextMilesone) {
          const nextMil = data.find(e => e.title === nextMilesone);
          if (nextMil) {
            linkArray.push(this.createLinkArrayObject(item, nextMil));
          }
        }
      } else if (item.type === "milestone") {
        const crTask = data.find(
          e => e.itemType === "Client Review" && e.milestone === item.title
        );
        if (crTask) {
          linkArray.push(this.createLinkArrayObject(item, crTask));
        }
      }
      if (item.AssignedTo && item.AssignedTo.ID >= 0) {
        this.resource.push({
          key: item.AssignedTo.ID,
          Name: item.AssignedTo.Name,
          label: item.AssignedTo.Title,
          Email: item.AssignedTo.EMail,
          textColor: "#fff"
        });
      }
    });

    this.taskAllocateCommonService.ganttParseObject.data = [...data];
    this.renderGanttTemplates();

    this.resource = this.resource.filter(function (a) {
      let key = a.label;
      if (!this[key]) {
        this[key] = true;
        return true;
      }
    }, Object.create(null));

    if (createLinks) {
      this.taskAllocateCommonService.ganttParseObject.links = [...linkArray];
    }
  }

  fetchNextTasks(task) {
    if (task.nextTask) {
      const nextTaskVal = task.nextTask.replace(/#/gi, "");
      const arrayNext = nextTaskVal.split(";");
      return this.GanttchartData.filter(
        e => arrayNext.indexOf(e.title) > -1 && e.milestone === task.milestone
      );
    } else {
      return [];
    }
  }

  generateMenuList(indices) {
    const menus = [
      { id: "budgetHrs", text: "Budget Hours", enabled: true },
      { id: "editTask", text: "Edit Task", enabled: true },
      { id: "tatON", text: "TAT ON", enabled: true },
      { id: "tatOFF", text: "TAT OFF", enabled: true },
      { id: "disableCascadeON", text: "Disable Cascade", enabled: true },
      { id: "disableCascadeOFF", text: "Enable Cascade", enabled: true },
      { id: "filesandcomments", text: "Files And Comments", enabled: true },
      { id: "capacity", text: "Show Capacity", enabled: true },
      { id: "confirmMilestone", text: "Confirm Milestone", enabled: true },
      {
        id: "confirmSubmilestone",
        text: "Confirm SubMilestone",
        enabled: true
      },
      { id: "editAllocation", text: "Edit Allocation", enabled: true },
      { id: "equalSplit", text: "Equal Allocation", enabled: true },
      { id: "taskScope", text: "Task Scope", enabled: true }
    ];

    let menuItems = [];
    if (!indices) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        "No menus available",
        false
      );
    } else {
      indices.forEach(element => {
        menuItems.push(menus[element]);
      });
    }

    return menuItems;
  }

  showMenus(task) {
    task.showAllocationSplit = task.allocationPerDay ? true : false;
    let index;
    let status = ["Auto Closed", "Completed"];
    if (task.type == "task") {
      if (task.itemType === "Client Review") {
        index =
          task.status == "Completed" || task.status == "Auto Closed"
            ? [6]
            : [1, 6];
      } else if (task.itemType === "Send to client") {
        if (task.status == "Completed" || task.status == "Auto Closed") {
          index = [6];
        } else {
          index = [1, 6];
          index.push(task.DisableCascade ? 5 : 4);
        }
      } else {
        if (task.slotType === "Slot" && !status.includes(task.status)) {
          index = [0, 1, 12];
          index.push(task.DisableCascade ? 5 : 4);
        } else if (task.slotType === "Slot" && status.includes(task.status)) {
          index = [];
        } else {
          if (task.status !== "Completed" && task.status !== "Auto Closed") {
            index = [0, 1, 12, 6];
            index.push(task.tat ? 3 : 2);
            index.push(task.DisableCascade ? 5 : 4);
            if (
              task.AssignedTo &&
              task.AssignedTo.ID &&
              task.AssignedTo.ID !== -1
            ) {
              index.push(7);
            }
            if (task.showAllocationSplit) {
              index = index.concat([10, 11]);
            }
          } else {
            index = [6];
            if (
              task.AssignedTo &&
              task.AssignedTo.ID &&
              task.AssignedTo.ID !== -1
            ) {
              index.push(7);
            }
          }
        }
      }
    } else if (task.type == "milestone") {
      if (task.status !== "Completed" && task.status !== "Auto Closed") {
        index = [0];
      }
      if (
        task.isNext === true &&
        !task.subMilestonePresent &&
        !this.changeInRestructure &&
        this.oProjectDetails.status !== "In Discussion" &&
        this.oProjectDetails.projectType !== "FTE-Writing" &&
        task.status !== "Completed"
      ) {
        index.push(8);
      }
    } else if (
      task.type == "submilestone" &&
      !this.changeInRestructure &&
      task.status === "Not Confirmed" &&
      (task.isCurrent || task.isNext)
    ) {
      index = [9];
    }

    return this.generateMenuList(index);
  }

  loadComponent() {
    this.selectedScale = this.selectedScale || {
      label: "Day Scale",
      value: "1"
    };
    gantt.serverList("AssignedTo", this.resource);
    if (this.taskAllocateCommonService.ganttParseObject.data.length) {
      let firstTaskStart = new Date(
        this.taskAllocateCommonService.ganttParseObject.data[0].start_date
      );
      firstTaskStart = new Date(firstTaskStart.setDate(-1));
      gantt.config.start_date = new Date(
        firstTaskStart.getFullYear(),
        firstTaskStart.getMonth(),
        firstTaskStart.getDate(),
        0,
        0
      );
      let lastTaskEnd = new Date(
        this.taskAllocateCommonService.ganttParseObject.data[
          this.taskAllocateCommonService.ganttParseObject.data.length - 1
        ].end_date
      );
      lastTaskEnd = new Date(lastTaskEnd.setDate(lastTaskEnd.getDate() + 31));
      gantt.config.end_date = new Date(
        lastTaskEnd.getFullYear(),
        lastTaskEnd.getMonth(),
        lastTaskEnd.getDate(),
        0,
        0
      );
    }
    gantt.init(this.ganttChart.ganttContainer.nativeElement);
    gantt.clearAll();
    this.renderGanttTemplates();
    this.ganttChart.onLoad(this.resource);
    this.setScale(this.selectedScale);
    this.allTaskData = this.taskAllocateCommonService.ganttParseObject;

    gantt.refreshData();
    this.allocationColor();
    if (this.menu !== undefined) {
      this.menu.unload();
    }
    this.menu = new dhtmlXMenuObject();

    let menus = [];

    this.menu.renderAsContextMenu();
    this.menu.setSkin("dhx_terrace");
    this.menu.loadStruct(menus);

    this.menu.attachEvent("onClick", (id, zoneId, cas) => {
      let task = gantt.getTask(this.currentTaskId);
      switch (id) {
        case "tatON":
          task.tat = true;
          this.ChangeEndDate(true, task);
          this.updateMilestoneData(task);
          this.ganttNotification();
          break;
        case "tatOFF":
          task.tat = false;
          this.ChangeEndDate(true, task);
          this.updateMilestoneData(task);
          this.ganttNotification();
          break;
        case "disableCascadeON":
          task.DisableCascade = true;
          task.edited = true;
          this.updateMilestoneData(task);
          this.ganttNotification();
          break;
        case "disableCascadeOFF":
          task.DisableCascade = false;
          task.edited = true;
          this.updateMilestoneData(task);
          this.ganttNotification();
          break;
        case "filesandcomments":
          this.viewTaskDetails(task);
          break;
        case "capacity":
          this.getUserCapacity(task);
          break;
        case "confirmMilestone":
          this.setForConfirmMilestone(task);
          break;
        case "confirmSubmilestone":
          this.setForConfirmMilestone(task);
          break;
        case "editAllocation":
          this.editAllocation(task, "");
          break;
        case "equalSplit":
          this.editAllocation(task, "Equal");
          break;
        case "editTask":
          this.openPopupOnGanttTask(task, "end");
          break;
        case "budgetHrs":
          this.changeBudgetHrs(task);
          break;
        case "taskScope":
          this.openComment(task, null);
          break;
        default:
          break;
      }
    });
  }

  renderGanttTemplates() {
    let status = ["Auto Closed", "Completed"];
    this.taskAllocateCommonService.ganttParseObject.data.forEach(e => {
      e.ganttOverlay = e.showAllocationSplit
        ? this.taskAllocationService.allocationSplitColumn
        : "";
      e.ganttMenu =
        e.type == "milestone"
          ? e.isNext === true &&
            !e.subMilestonePresent &&
            !this.changeInRestructure &&
            this.oProjectDetails.status !== "In Discussion" &&
            this.oProjectDetails.projectType !== "FTE-Writing" &&
            e.status !== "Completed"
            ? this.taskAllocationService.contextMenu
            : e.status !== "Completed" && e.status !== "Auto Closed"
              ? this.taskAllocationService.contextMenu
              : ""
          : e.type == "submilestone"
            ? !this.changeInRestructure &&
              e.status === "Not Confirmed" &&
              (e.isCurrent || e.isNext)
              ? this.taskAllocationService.contextMenu
              : ""
            : e.slotType == "Slot"
              ? !status.includes(e.status)
                ? this.taskAllocationService.contextMenu
                : ""
              : e.parentSlot !== "" && e.parentSlot !== 0
                ? ""
                : this.taskAllocationService.contextMenu;
    });
  }

  isDragEnable(isStartDate, task) {
    switch (task.status) {
      case "Not Started":
      case "Not Confirmed":
      case "Not Saved":
        if (task.parentSlot !== "" && task.parentSlot !== 0) return false;
        else return true;

      case "In Progress":
        if (task.parentSlot !== "" && task.parentSlot !== 0) {
          return false;
        } else {
          if (!isStartDate) return true;
          else return false;
        }

      default:
        return false;
    }
  }

  createResetObj(task) {
    let taskObj: any = {
      id: task.id,
      start_date: task.start_date,
      pUserStart: task.pUserStart,
      pUserStartDatePart: task.pUserStartDatePart,
      pUserStartTimePart: task.pUserStartTimePart,
      end_date: task.end_date,
      pUserEnd: task.pUserEnd,
      pUserEndDatePart: task.pUserEndDatePart,
      pUserEndTimePart: task.pUserEndTimePart,
      budgetHours: task.budgetHours,
      user: task.user,
      AssignedTo: task.AssignedTo,
      tat: task.tat,
      DisableCascade: task.DisableCascade
    };

    return taskObj;
  }

  onBeforeTaskDragCall = (id, mode, e) => {
    let task = this.GanttchartData.find(e => e.id == id);
    this.resetTask = this.createResetObj(task);
    this.dragClickedInput = e.srcElement.className;
    let isStartDate;
    if (
      this.dragClickedInput !== "gantt_link_point" &&
      this.dragClickedInput !== "gantt_task_cell"
    ) {
      isStartDate =
        this.dragClickedInput.indexOf("start_date") > -1 ? true : false;
      if (gantt.ext.zoom.getCurrentLevel() < 3) {
        if (
          task.status == "Completed" ||
          task.status == "Auto Closed" ||
          task.type == "milestone" ||
          task.type === "submilestone"
        ) {
          return false;
        } else {
          if (mode === "resize") {
            if (task.itemType == "Client Review" && !isStartDate) {
              let isDrag = this.isDragEnable(isStartDate, task);
              return isDrag;
            } else if (task.itemType == "Send to client" && isStartDate) {
              let isDrag = this.isDragEnable(isStartDate, task);
              return isDrag;
            } else if (
              task.itemType !== "Send to client" &&
              task.itemType !== "Client Review"
            ) {
              let isDrag = this.isDragEnable(isStartDate, task);
              return isDrag;
            } else {
              return false;
            }
          } else if (mode === "move") {
            if (task.status == "In Progress") {
              return false;
            } else {
              if (task.parentSlot !== "" && task.parentSlot !== 0) {
                return false;
              } else {
                return true;
              }
            }
          } else {
            return false;
          }
        }
      }
    } else {
      return false;
    }
  };

  onTaskClickCall = (taskId, e) => {
    let task = gantt.getTask(taskId);
    let ganttOpenIcon = e.target.closest(".gantt_arrow_click");
    if (!ganttOpenIcon) {
      if (
        task.itemType !== "Send to client" &&
        task.itemType !== "Client Review" &&
        task.slotType !== "Slot" &&
        task.type !== "milestone" &&
        task.type !== "submilestone"
      ) {
        if (e.target.parentElement.className === "gantt_cell cell_user") {
          this.header = task.submilestone
            ? task.milestone + " " + task.submilestone + " " + task.text
            : task.milestone + " " + task.text;
          this.sharedObject.resourceHeader = this.header;

          let resourceTask = task;
          if (
            resourceTask.status === "Completed" ||
            resourceTask.status === "Auto CLosed" ||
            resourceTask.status === "In Progress"
          ) {
            this.commonService.showToastrMessage(
              this.constants.MessageType.error,
              "Resource view is unavailable for Completed, Auto CLosed & In Progress tasks.",
              false
            );
          } else {
            this.onResourceClick(resourceTask);
          }
        }
      } else if (
        (task.itemType == "Send to client" ||
          task.itemType == "Client Review") &&
        e.target.parentElement.className === "gantt_cell cell_user"
      ) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          "Resource view is unavailable for these tasks please edit the task to change resource.",
          false
        );
      }
      let menuButton = e.target.closest("[data-action]");
      if (menuButton) {
        if (gantt.ext.zoom.getCurrentLevel() < 3) {
          if (taskId) {
            let task = this.GanttchartData.find(e => e.id == taskId);
            const menus = this.showMenus(task);
            this.menu.clearAll();
            this.menu.loadStruct(menus);
            this.currentTaskId = taskId;
            this.resetTask = this.createResetObj(task);
            let x =
              e.clientX +
              document.body.scrollLeft +
              document.documentElement.scrollLeft,
              y =
                e.clientY +
                document.body.scrollTop +
                document.documentElement.scrollTop;

            if (task.status !== "Completed" || task.status !== "Auto Closed") {
              this.menu.showContextMenu(x, y);
              setTimeout(() => {
                let contextMenu: any = document.getElementsByClassName(
                  "dhtmlxMenu_dhx_terrace_SubLevelArea_Polygon"
                )[0];
                contextMenu.style.display = "block";
              }, 50);
            }
          }
        }
      }
      let overlayIconButton = e.target.closest(".ganttOverlayIcon");
      if (overlayIconButton) {
        this.showOverlayPanel(
          e,
          task,
          this.dailyAllocateOP,
          e.target.parentElement
        );
      }
    }

    return true;
  };

  onAfterTaskDragCall = async (id, mode, e) => {
    this.disableSave = true;
    let task = { ...this.currentTask };
    this.ganttSetTime = false;
    let isStartDate;
    if (
      this.dragClickedInput !== "gantt_link_point" &&
      this.dragClickedInput !== "gantt_task_cell"
    ) {
      isStartDate =
        this.dragClickedInput.indexOf("start_date") > -1 ? true : false;
      if (task.status !== "Completed" || task.type == "milestone") {
        if (mode === "resize") {
          this.taskTime = isStartDate
            ? this.taskAllocateCommonService.setMinutesAfterDrag(
              task.start_date
            )
            : this.taskAllocateCommonService.setMinutesAfterDrag(task.end_date);
          this.singleTask = task;
          if (this.singleTask.tat) {
            this.loaderenable = true;
            this.visualgraph = false;
            this.commonService
              .confirmMessageDialog(
                "Change " +
                (isStartDate
                  ? "Start Date and Time "
                  : "End Date and Time ") +
                "of Task",
                "Are you sure you want to change specify selected " +
                (isStartDate ? "Start Date" : "End Date") +
                " of Task ?",
                null,
                ["Yes", "No"],
                false
              )
              .then(async Confirmation => {
                if (Confirmation == "Yes") {
                  if (isStartDate) {
                    this.singleTask.start_date = new Date(
                      task.start_date.getFullYear(),
                      task.start_date.getMonth(),
                      task.start_date.getDate(),
                      9,
                      0
                    );
                    this.singleTask.pUserStart = new Date(
                      this.datepipe.transform(
                        this.singleTask.start_date,
                        "MMM d, y"
                      ) +
                      " " +
                      this.singleTask.pUserStartTimePart
                    );
                    this.singleTask.pUserStartDatePart = this.getDatePart(
                      this.singleTask.start_date
                    );
                  } else {
                    this.singleTask.end_date = new Date(
                      task.end_date.getFullYear(),
                      task.end_date.getMonth(),
                      task.end_date.getDate(),
                      19,
                      0
                    );
                    this.singleTask.pUserEnd = this.singleTask.pUserEnd = new Date(
                      this.datepipe.transform(
                        this.singleTask.end_date,
                        "MMM d, y"
                      ) +
                      " " +
                      this.singleTask.pUserEndTimePart
                    );
                    this.singleTask.pUserEndDatePart = this.getDatePart(
                      this.singleTask.end_date
                    );
                  }
                  this.ganttSetTime = true;
                  this.timeChange();
                } else {
                  let allTasks = {
                    data: []
                  };

                  allTasks.data = this.getGanttTasksFromMilestones(
                    this.milestoneData,
                    true
                  );

                  allTasks.data.forEach(task => {
                    if (this.resetTask.type === "milestone") {
                      if (task.id == this.resetTask.id) {
                        task.open = true;
                        task.edited = false;
                      }
                    }
                    if (task.id == this.resetTask.id) {
                      task = this.resetCurrentTask(task, this.resetTask);
                    }
                  });
                  this.GanttchartData = allTasks.data;
                  this.showGanttChart(false);
                  setTimeout(() => {
                    this.scrollToTaskDate(
                      this.resetTask.pUserEnd,
                      this.resetTask.id
                    );
                  }, 500);
                }
              });
          } else {
            await this.checkDragDateTime(isStartDate);
            await this.picker.open();
          }
        } else {
          this.openPopupOnGanttTask(task, "end");
        }
        this.disableSave = false;
        return true;
      }
    } else {
      this.disableSave = false;
      return false;
    }
  };

  onBeforeTaskChangedCall = (id, mode, task) => {
    this.allTaskData = this.getGanttTasksFromMilestones(
      this.milestoneData,
      true
    ); //gantt.serialize();
    this.currentTask = { ...task };
    return true;
  };

  async timeChange() {
    this.visualgraph = false;
    this.loaderenable = true;
    const isStartDate =
      this.dragClickedInput.indexOf("start_date") > -1 ? true : false;
    let type = isStartDate ? "start" : "end";
    let allTasks = {
      data: []
    };
    if (this.ganttSetTime) {
      await this.setDateToCurrent(this.singleTask);
      // this.DateChange(this.singleTask, type);

      this.singleTask.ExpectedBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
        this.singleTask
      );
      this.maxBudgetHrs = this.singleTask.ExpectedBudgetHrs;

      allTasks.data = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      allTasks.data.forEach(task => {
        if (task.type == "milestone") {
          if (task.title == this.singleTask.milestone) {
            task.edited = true;
            task.open = true;
          }
        }
      });

      const resource = this.sharedObject.oTaskAllocation.oResources.filter(
        objt => {
          return this.singleTask.AssignedTo.ID === objt.UserNamePG.ID;
        }
      );

      if (
        this.singleTask.itemType !== "Client Review" &&
        this.singleTask.itemType !== "Send to client"
      ) {
        await this.changeBudgetHrs(this.singleTask);
        // await this.prestackService.calcPrestackAllocation(
        //   resource,
        //   this.singleTask
        // );
      } else if (this.singleTask.type == "task") {
        await this.DateChange(this.singleTask, type);
        this.GanttchartData = allTasks.data;
      }

      this.loaderenable = false;
      this.visualgraph = true;
      this.GanttchartData = allTasks.data;
      await this.ganttNotification();
    } else {
      allTasks.data = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      allTasks.data.forEach(task => {
        if (task.type == "milestone") {
          if (task.title == this.singleTask.milestone) {
            task.edited = false;
            task.open = true;
          }
        }
        if (task.id == this.resetTask.id) {
          task = this.resetCurrentTask(task, this.resetTask);
        }
      });

      this.GanttchartData = allTasks.data;
      this.loaderenable = false;
      this.visualgraph = true;
    }
    await this.showGanttChart(false);
    // setTimeout(() => {
    //   this.scrollToTaskDate(this.ganttSetTime ? this.singleTask.end_date : this.resetTask.end_date, this.singleTask.id);
    // }, 500);
  }

  checkDragDateTime(isStartDate) {
    if (
      new Date(this.singleTask.start_date).getDate() ==
      new Date(this.singleTask.end_date).getDate()
    ) {
      if (isStartDate) {
        this.maxTime = this.singleTask.pUserEndTimePart;
        this.minTime = "12:00 AM";
      } else {
        this.maxTime = "11:45 PM";
        this.minTime = this.singleTask.pUserStartTimePart;
      }
    } else {
      this.maxTime = "11:45 PM";
      this.minTime = "12:00 AM";
    }
  }

  setTime(time) {
    this.ganttSetTime = true;
    const isStartDate =
      this.dragClickedInput.indexOf("start_date") > -1 ? true : false;
    if (isStartDate) {
      this.singleTask.start_date = new Date(
        this.datepipe.transform(this.singleTask.start_date, "MMM d, y") +
        " " +
        time
      );
      this.singleTask.pUserStart = new Date(
        this.datepipe.transform(this.singleTask.start_date, "MMM d, y") +
        " " +
        time
      );
      this.singleTask.pUserStartDatePart = this.getDatePart(
        this.singleTask.start_date
      );
      this.singleTask.pUserStartTimePart = time;
      if (this.singleTask.itemType == "Send to client") {
        this.singleTask.end_date = this.singleTask.start_date;
        this.singleTask.pUserEnd = this.singleTask.pUserStart;
        this.singleTask.pUserEndDatePart = this.getDatePart(
          this.singleTask.pUserStart
        );
        this.singleTask.pUserEndTimePart = this.getTimePart(
          this.singleTask.pUserStart
        );
      }
    } else {
      if (this.singleTask.itemType == "Send to client") {
        this.singleTask.end_date = this.singleTask.start_date;
        this.singleTask.pUserEnd = this.singleTask.pUserStart;
        this.singleTask.pUserEndDatePart = this.getDatePart(
          this.singleTask.pUserStart
        );
        this.singleTask.pUserEndTimePart = this.getTimePart(
          this.singleTask.pUserStart
        );
      } else {
        this.singleTask.end_date = new Date(
          this.datepipe.transform(this.singleTask.end_date, "MMM d, y") +
          " " +
          time
        );
        this.singleTask.pUserEnd = new Date(
          this.datepipe.transform(this.singleTask.end_date, "MMM d, y") +
          " " +
          time
        );
        this.singleTask.pUserEndDatePart = this.getDatePart(
          this.singleTask.end_date
        );
        this.singleTask.pUserEndTimePart = time;
      }
    }
  }

  openPopupOnGanttTask(task, clickedInputType) {
    if (gantt.ext.zoom.getCurrentLevel() < 3) {
      if (task.type == "task") {
        this.editTaskModal(task, clickedInputType);
        return true;
      } else if (task.type == "milestone" || task.type == "submilestone") {
        this.changeBudgetHrs(task);
        return true;
      }
    } else {
      return false;
    }
  }

  async changeBudgetHrs(task) {
    this.budgetHrs = 0;
    this.updatedTasks = task;
    this.budgetHrs = task.budgetHours;
    if (task.type !== "milestone" && task.type !== "submilestone") {
      task.ExpectedBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
        task
      );
      this.maxBudgetHrs = task.ExpectedBudgetHrs;
      this.budgetHrsTask = task;
    } else {
      task.ExpectedBudgetHrs = "";
      this.maxBudgetHrs = "";
      this.budgetHrsTask = task;
    }
    if (
      task.type == "task" &&
      new Date(task.start_date).getTime() == new Date(task.end_date).getTime()
    ) {
      this.showBudgetHrs = false;
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        "Budget hrs cannot be updated because start date and end date of task is equal",
        false
      );
    } else {
      this.showBudgetHrs = true;
    }
  }

  ganttNotification() {
    this.commonService.showToastrMessage(
      this.constants.MessageType.warn,
      "Gantt task update. There are some unsaved changes, Please save them.",
      false
    );
  }

  onResourceClick(task) {
    this.hideResourceSelection = true;
    this.displayBody = true;

    let resources = [];
    task.assignedUsers.forEach(c => {
      c.items.forEach(item => {
        this.sharedObject.oTaskAllocation.oResources.forEach(objt => {
          if (objt.UserNamePG.ID === item.value.ID) {
            resources.push(objt);
          }
        });
      });
    });
    task.resources = resources;
    const prefRes = this.preferredResources.length
      ? this.preferredResources[0]
      : {};
    const startTime = new Date(new Date(task.start_date).setHours(0, 0, 0, 0));
    const endTime = new Date(new Date(task.end_date).setHours(0, 0, 0, 0));
    let data: IResourceSelection = {
      task,
      startTime: startTime,
      endTime: endTime,
      projectDetails: this.sharedObject.oTaskAllocation.oProjectDetails,
      preferredResources: prefRes
    };
    this.selectedTask = task;
    this.sharedObject.data = data;
  }

  onClose() {
    this.hideResourceSelection = false;
    this.header = "";
  }

  getNode(task): TreeNode {
    const tasktitle =
      task.itemType === "milestone" ? task.title : task.milestone;
    const milestone: TreeNode = this.milestoneData.find(
      m => m.data.title === tasktitle
    );
    if (task.itemType === "submilestone") {
      const submilestone: TreeNode = milestone.children.find(
        sm => sm.data.title === task.title
      );
      return submilestone;
    }
    return milestone;
  }

  checkNotCompletedTask(task): Boolean {
    let isValid: Boolean = false;
    let tasks = [];
    let currentMilestone: TreeNode = this.milestoneData.find(e => e.data.isCurrent == true && e.data.type == 'milestone');
    if (currentMilestone) {
      let currentTasks = this.taskAllocateCommonService.getTasksFromMilestones(
        currentMilestone.data,
        true,
        this.milestoneData,
        true
      );

      if (task.type == 'submilestone' && task.position !== "1") {
        let submilestone = currentTasks.find(e => e.type == 'submilestone' && e.position == task.position - 1).title;
        tasks = currentTasks.filter(t => t.submilestone == submilestone);
      } else {
        tasks = currentTasks;
      }

      tasks.forEach(e => {
        if (e.status !== 'Completed' && (e.itemType !== 'Client Review' && e.itemType !== 'Send to client')) {
          isValid = true;
        }
      })
    }
    return isValid;
  }

  async setForConfirmMilestone(task) {
    let isValid = await this.checkNotCompletedTask(task);
    if (isValid) {
      await this.commonService.confirmMessageDialog('Confirmation', 'Previous Milestone/SubMilestone tasks are not completed and it will be mark as Auto Closed. Are you sure that you want to proceed ?', null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          this.confirmMilestone(task);
        }
      });
    } else {
      this.confirmMilestone(task);
    }
  }

  confirmMilestone(task) {
    this.loaderenable = true;
    this.confirmMilestoneLoader = true;
    setTimeout(async () => {
      const rowNode: TreeNode = this.getNode(task);
      if (task.edited || task.editMode) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "There are some unsaved changes, Please save them.",
          false
        );
        // return false;
      } else {
        const conflictDetails: IConflictResource[] = await this.conflictAllocation.bindConflictDetails(
          rowNode,
          this.milestoneData,
          [],
          this.sharedObject.oTaskAllocation.oResources
        );
        if (conflictDetails.length) {
          this.showConflictAllocations(task, conflictDetails, rowNode);
        } else {
          const Title: string =
            task.itemType === "submilestone" && task.milestone
              ? task.milestone + " - " + task.title
              : task.title;
          const message: string =
            "Are you sure that you want to Confirm '" + Title + "' milestone ?";
          await this.setAsNextMilestoneCall(task, message);
        }
      }
      this.loaderenable = false;
      this.confirmMilestoneLoader = false;
    }, 100);
  }

  async changeResource(userId) {
    this.sharedObject.isResourceChange = true;
    if (userId) {
      this.selectedTask.assignedUsers.forEach(element => {
        if (element.items.find(e => e.value.ID === userId)) {
          this.selectedTask.AssignedTo = element.items.find(
            e => e.value.ID === userId
          ).value;
        }
      });
    }
    this.selectedTask.user = this.selectedTask.AssignedTo.Title;
    let allTasksData = [];
    allTasksData = this.getGanttTasksFromMilestones(this.milestoneData, true);
    const editedTask = allTasksData.find(
      task => task.id == this.selectedTask.id
    );
    editedTask.AssignedTo = editedTask
      ? this.selectedTask.AssignedTo
      : editedTask.AssignedTo;
    editedTask.user = editedTask
      ? this.selectedTask.AssignedTo.Title
      : editedTask.AssignedTo.Title;
    this.assignedToUserChanged(editedTask);
    this.GanttchartData = allTasksData;
    this.taskAllocateCommonService.ganttParseObject.data = [...allTasksData];
    this.loadComponent();
    this.ganttNotification();
  }

  editTaskModal(task, clickedInputType) {
    this.updatedTasks = {};
    this.updatedTasks = task;
    this.assignedUsers = task.assignedUsers;

    task.assignedUsers.forEach(element => {
      if (element.items.find(e => e.value.ID === task.AssignedTo.ID)) {
        task.AssignedTo = element.items.find(
          e => e.value.ID === task.AssignedTo.ID
        ).value;
      }
    });

    let data = {
      task,
      clickedInputType,
      assignedUsers: this.assignedUsers,
      milestoneData: this.milestoneData,
      milestoneDataCopy: this.milestoneDataCopy,
      allRestructureTasks: this.allRestructureTasks,
      allTasks: this.allTasks
      // startDate: this.startDate,
      // endDate: this.endDate
    };

    this.editTaskComponent(data);
  }

  editTaskComponent(data) {
    const ref = this.dialogService.open(GanttEdittaskComponent, {
      data: data,
      width: "65vw",

      header:
        "Edit Task (" + data.task.milestone + " - " + data.task.title + ")",
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
      closable: false
    });
    ref.onClose.subscribe((updateData: any) => {
      this.disableSave = true;
      setTimeout(() => {
        this.saveTask(false, updateData);
        this.disableSave = false;
      }, 100);
    });
  }

  // *************************************************************************************************************************************
  // GANTT cascade start
  // *************************************************************************************************************************************

  setDateToCurrent(node) {
    for (const milestone of this.milestoneData) {
      if (
        milestone.data.type === "task" &&
        node.milestone === milestone.data.milestone &&
        node.taskFullName === milestone.data.taskFullName
      ) {
        milestone.data = node;
        milestone.data.edited = true;
        break;
      }
      if (milestone.children !== undefined) {
        for (const submilestone of milestone.children) {
          if (
            submilestone.data.type === "task" &&
            node.milestone === submilestone.data.milestone &&
            node.taskFullName === submilestone.data.taskFullName
          ) {
            submilestone.data = node;
            submilestone.data.edited = true;
            break;
          }
          if (submilestone.children !== undefined) {
            for (const task of submilestone.children) {
              if (
                node.milestone === task.data.milestone &&
                node.taskFullName === task.data.taskFullName
              ) {
                task.data = node;
                task.data.edited = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  async setBudgetHours(task) {
    if (task.type !== "milestone" && task.type !== "submilestone") {
      task.ExpectedBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
        task
      );
      this.maxBudgetHrs = task.ExpectedBudgetHrs;
      if (task.ExpectedBudgetHrs < this.budgetHrs) {
        this.ogBudgethrs = this.budgetHrs;
        this.budgetHrs = 0;
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Budget hours is set to zero because given budget hours is greater than task time period. Original budget hrs of task is " +
          this.ogBudgethrs,
          false
        );
      }
    } else {
      task.ExpectedBudgetHrs = "";
      this.maxBudgetHrs = task.ExpectedBudgetHrs;
    }
  }

  updateMilestoneTaskObject(updatedTask, milestoneTask) {
    let task = updatedTask.value;

    milestoneTask.start_date = task.startDate;
    milestoneTask.pUserStartDatePart = this.getDatePart(task.startDate);
    milestoneTask.pUserStartTimePart = task.startDateTimePart;
    milestoneTask.end_date = task.endDate;
    milestoneTask.pUserEndDatePart = this.getDatePart(task.endDate);
    milestoneTask.pUserEndTimePart = task.endDateTimePart;
    milestoneTask.budgetHours = task.budgetHrs;
    milestoneTask.DisableCascade = task.disableCascade;
    milestoneTask.AssignedTo = task.resource;
    milestoneTask.user = task.resource.Title;
    milestoneTask.tat = task.tat;

    return milestoneTask;
  }

  async saveTask(isBudgetHrs, updatedDataObj) {
    let allowStatus = ["Not Confirmed", "Not Saved"];
    if (isBudgetHrs) {
      let isStartDate: any;
      if (this.dragClickedInput) {
        isStartDate =
          this.dragClickedInput.indexOf("start_date") > -1 ? true : false;
      }
      let type = this.dragClickedInput
        ? isStartDate
          ? "start"
          : "end"
        : "end";

      let allTasks = {
        data: []
      };

      if (
        this.budgetHrs == 0 &&
        this.updatedTasks.type !== "milestone" &&
        !allowStatus.includes(this.updatedTasks.status)
      ) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please Add Budget Hours.",
          false
        );
      } else {
        this.loaderenable = true;
        this.visualgraph = false;
        if (this.updatedTasks.type !== "milestone") {
          const maxBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
            this.updatedTasks
          );
          if (+this.updatedTasks.budgetHours > +maxBudgetHrs) {
            this.ogBudgethrs = this.budgetHrs;
            this.budgetHrs = 0;
            this.commonService.showToastrMessage(
              this.constants.MessageType.error,
              "Budget hours is set to zero because given budget hours is greater than task time period. Original budget hrs of task is " +
              this.ogBudgethrs,
              false
            );
          }
        }
        allTasks.data = this.getGanttTasksFromMilestones(
          this.milestoneData,
          true
        );
        let arrMsgs = [];
        for (const task of allTasks.data) {
          if (task.type == "task") {
            if (task.id == this.updatedTasks.id) {
              task.budgetHours = this.budgetHrs;
              task.edited = true;
              const resource = this.sharedObject.oTaskAllocation.oResources.filter(
                objt => {
                  return (
                    task.AssignedTo && task.AssignedTo.ID === objt.UserNamePG.ID
                  );
                }
              );
              if (this.budgetHrs !== 0) {
                const resourceCapacity = await this.prestackService.calcPrestackAllocation(
                  resource,
                  task
                );
                // arrMsgs = this.CalculateAndShowLeaveMsg(resourceCapacity, arrMsgs);
                if (resourceCapacity && resourceCapacity.leaves.length) {
                  const leaves = [];
                  for (const leave of resourceCapacity.leaves) {
                    const formattedleave = this.datepipe.transform(new Date(leave), "d MMM y");
                    leaves.push(formattedleave);
                  }
                  arrMsgs.push(resourceCapacity.userName + " is on leave on " + leaves.join(','));
                }
              } else {
                this.taskAllocateCommonService.resetDailyAllocation(task);
              }
              this.commonService.showToastrMessage(this.constants.MessageType.info, arrMsgs.join('/\n'), false);
              this.setDateToCurrent(task);
              await this.DateChange(task, type);
              this.sharedObject.currentTaskData = task;
            }
          } else if (task.type == "milestone") {
            if (task.id == this.updatedTasks.id) {
              task.budgetHours = this.budgetHrs;
              task.edited = true;
            }
          }
        }

        allTasks.data.forEach(task => {
          if (task.type == "milestone") {
            if (task.title == this.updatedTasks.milestone) {
              task.edited = true;
              task.open = true;
            }
          }
        });

        this.GanttchartData = allTasks.data;
        this.showBudgetHrs = false;
        this.ganttNotification();
        this.showGanttChart(false);
        setTimeout(() => {
          this.scrollToTaskDate(
            this.updatedTasks.end_date,
            this.updatedTasks.id
          );
        }, 500);
      }
    } else if (updatedDataObj.reset) {
      this.close();
    } else {
      this.loaderenable = true;
      this.visualgraph = false;
      let allTasks = {
        data: []
      };
      let scrollDate;
      const cascadingObject = updatedDataObj.cascadingObject;
      if (
        Object.keys(cascadingObject).length &&
        !Object.values(cascadingObject).some(x => x == "")
      ) {
        scrollDate = new Date(cascadingObject.node.end_date);
        this.setDateToCurrent(cascadingObject.node);
        ////// Cascade future  dates
        await this.DateChange(cascadingObject.node, cascadingObject.type);
        this.sharedObject.currentTaskData = cascadingObject.node;
      } else {
        let updatedTask = this.updateMilestoneTaskObject(
          updatedDataObj.updatedTask,
          this.updatedTasks
        );
        scrollDate = new Date(updatedTask.end_date);
        this.setDateToCurrent(updatedTask);
        this.sharedObject.currentTaskData = updatedTask;
      }

      allTasks.data = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      allTasks.data.forEach(task => {
        if (task.type == "milestone") {
          if (task.title == this.updatedTasks.milestone) {
            task.edited = true;
            task.open = true;
          }
        }
      });

      this.GanttchartData = allTasks.data;

      this.ganttNotification();
      this.showGanttChart(false);
      setTimeout(() => {
        this.scrollToTaskDate(scrollDate, this.updatedTasks.id);
      }, 500);
    }
  }

  getGanttTasksFromMilestones(milestones, includeSubTasks) {
    let tasks = [];
    milestones.forEach(milestone => {
      const milTasks = this.taskAllocateCommonService.getTasksFromMilestones(
        milestone,
        includeSubTasks,
        this.milestoneData,
        true
      );
      tasks = tasks.length ? [...tasks, ...milTasks] : milTasks;
    });
    return this.commonService.removeEmptyItems(tasks);
  }

  updateMilestoneData(currentTask) {
    let allTasks = { data: [] };

    this.setDateToCurrent(currentTask);
    allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);

    allTasks.data.forEach(e => {
      if (e.type == "milestone" && currentTask.milestone == e.title) {
        e.edited = true;
        e.open = true;
      }
    });

    this.GanttchartData = allTasks.data;

    this.showGanttChart(false);
  }

  resetCurrentTask(task, resetTask) {
    task.start_date = resetTask.start_date;
    task.pUserStart = resetTask.pUserStart;
    task.pUserStartDatePart = resetTask.pUserStartDatePart;
    task.pUserStartTimePart = resetTask.pUserStartTimePart;
    task.end_date = resetTask.end_date;
    task.pUserEnd = resetTask.pUserEnd;
    task.pUserEndDatePart = resetTask.pUserEndDatePart;
    task.pUserEndTimePart = resetTask.pUserEndTimePart;
    task.budgetHours = resetTask.budgetHours;
    task.user = resetTask.user;
    task.AssignedTo = resetTask.AssignedTo;
    task.tat = resetTask.tat;
    task.DisableCascade = resetTask.DisableCascade;
    task.showAllocationSplit = task.allocationPerDay ? true : false;

    return task;
  }

  async close() {
    this.loaderenable = true;
    this.visualgraph = false;
    let allTasks = {
      data: []
    };

    this.showBudgetHrs = false;
    allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);

    allTasks.data.forEach(task => {
      if (this.resetTask.type === "milestone") {
        if (task.id == this.resetTask.id) {
          task.open = true;
          task.edited = false;
        }
      }
      if (task.id == this.resetTask.id) {
        task = this.resetCurrentTask(task, this.resetTask);
      }
    });
    this.GanttchartData = allTasks.data;
    this.showGanttChart(false);
    setTimeout(() => {
      this.scrollToTaskDate(this.resetTask.pUserEnd, this.resetTask.id);
    }, 500);
  }

  loadComponentRefresh() {
    this.visualgraph = false;
    this.loaderenable = true;
    setTimeout(() => {
      this.loadComponent();
      this.loaderenable = false;
      this.visualgraph = true;
    });
  }

  refreshGantt() {
    this.loaderenable = true;
    this.visualgraph = false;
    setTimeout(() => {
      if (this.taskAllocateCommonService.ganttParseObject.data.length) {
        let firstTaskStart = new Date(
          this.taskAllocateCommonService.ganttParseObject.data[0].start_date
        );
        firstTaskStart = new Date(firstTaskStart.setDate(-1));
        gantt.config.start_date = new Date(
          firstTaskStart.getFullYear(),
          firstTaskStart.getMonth(),
          firstTaskStart.getDate(),
          0,
          0
        );
        let lastTaskEnd = new Date(
          this.taskAllocateCommonService.ganttParseObject.data[
            this.taskAllocateCommonService.ganttParseObject.data.length - 1
          ].end_date
        );
        lastTaskEnd = new Date(lastTaskEnd.setDate(lastTaskEnd.getDate() + 31));
        gantt.config.end_date = new Date(
          lastTaskEnd.getFullYear(),
          lastTaskEnd.getMonth(),
          lastTaskEnd.getDate(),
          0,
          0
        );
      }
      gantt.init(this.ganttChart.ganttContainer.nativeElement);
      gantt.clearAll();
      this.ganttChart.onLoad(this.resource);
      this.setScale(this.selectedScale);
      this.renderGanttTemplates();
      this.loaderenable = false;
      this.visualgraph = true;
    }, 300);
  }

  scrollToTaskDate(date, id?) {
    if (gantt.ext.zoom.getCurrentLevel() !== 0) {
      let endDate = new Date(date);
      endDate = new Date(endDate.setDate(endDate.getDate() - 6));
      gantt.showDate(new Date(endDate));
    }

    this.loaderenable = false;
    this.visualgraph = true;

    if (gantt.ext.zoom.getCurrentLevel() == 0) {
      gantt.showTask(id);
      // let scrollX = gantt.posFromDate(new Date(date));
      // gantt.scrollTo(scrollX, 0);
    }
  }

  setScale(scale) {
    this.ganttChart.setScaleConfig(scale.value);
  }

  zoomIn() {
    if (gantt.ext.zoom.getCurrentLevel() != 0) {
      this.ganttChart.zoomIn();
      this.selectedScale = this.scales[gantt.ext.zoom.getCurrentLevel()];
    }
  }

  zoomOut() {
    if (gantt.ext.zoom.getCurrentLevel() < 5) {
      this.ganttChart.zoomOut();
      this.selectedScale = this.scales[gantt.ext.zoom.getCurrentLevel()];
    }
  }

  allocationColor() {
    gantt.templates.grid_row_class = function (start, end, task) {
      let css = [];
      if (task.title) {
        css.push("gantt_resource_task gantt_resource_task" + task.id);
      }
      return css.join(" ");
    };

    gantt.attachEvent("onParse", () => {
      let styleId = "dynamicGanttStyles";
      let element = document.getElementById(styleId);
      if (!element) {
        element = document.createElement("style");
        element.id = styleId;
        document.querySelector("head").appendChild(element);
      }
      let html = [];
      let resources = gantt.serverList("AssignedTo");
      let allTasks = this.GanttchartData;
      resources.forEach(r => {
        allTasks.forEach(e => {
          let textColor = "";
          textColor =
            e.allocationColor == "indianred" ? r.textColor : "#454545";
          html.push(
            ".gantt_row.gantt_resource_task" +
            e.id +
            " .gantt_cell:nth-child(2) .gantt_tree_content{" +
            "background-color:" +
            e.allocationColor +
            "; " +
            "color:" +
            textColor +
            ";" +
            "}"
          );
        });
      });
      element.innerHTML = html.join("");
    });
  }

  ganttExportToExcel() {
    gantt.exportToExcel({
      name: "Task Allocation.xlsx",
      columns: [
        { id: "text", header: "Task", width: 40 },
        { id: "status", header: "Status", width: 40 },
        { id: "user", header: "Resource", width: 40 },
        { id: "budgetHours", header: "Budget Hours", width: 40 },
        { id: "spentTime", header: "Spent Hours", width: 40 },
        { id: "start_date", header: "Start date", width: 40, type: "date" },
        { id: "end_date", header: "End date", width: 40, type: "date" }
      ]
      // visual: true,
      // cellColors: true
    });
  }

  // **************************************************************************************************************************************

  //  Cancel Milestone Changes
  // **************************************************************************************************************************************

  CancelChanges(milestone, type) {
    this.loaderenable = true;
    if (type === "discardAll") {
      //this.loaderenable = false;
      this.changeInRestructure = false;
      this.milestoneData = [...this.tempmilestoneData];
      this.GanttchartData = [...this.oldGantChartData];
      setTimeout(() => {
        if (this.visualgraph === true) {
          this.loadComponentRefresh();
        }
      }, 200);
    } else if (type === "task" && milestone.itemType === "Client Review") {
      const tempMile = this.tempmilestoneData.find(
        c => c.data.id === milestone.id
      );
      milestone = tempMile.data;
      var index = this.milestoneData.indexOf(
        this.milestoneData.find(c => c.data.id === milestone.id)
      );
      if (index > -1 && index < this.milestoneData.length - 1) {
        const notCancelled = this.milestoneData.splice(0, index);
        const dbmilestones = this.tempmilestoneData.slice(
          index,
          this.tempmilestoneData.length
        );
        this.milestoneData = [...notCancelled, ...dbmilestones];
      }
    } else if (type == "cancelAll") {
      const milestoneData = this.tempmilestoneData; //this.cancelAll();
      this.milestoneData = [...milestoneData];
      this.GanttchartData = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      this.createGanttDataAndLinks(true);
      setTimeout(() => {
        this.loaderenable = false;
      }, 50);
    } else {
      this.tempmilestoneData.forEach(element => {
        const getAllTasks = this.taskAllocateCommonService.getTasksFromMilestones(
          element,
          false,
          this.milestoneData,
          false
        );
        const selectedTask = getAllTasks.find(c => c.id === milestone.id);
        if (selectedTask !== undefined) {
          milestone = selectedTask;
        }
      });
      const milestoneIndex = this.milestoneData.findIndex(
        c => c.data.title === milestone.milestone
      );
      if (milestoneIndex > -1) {
        if (
          milestone.submilestone !== null &&
          milestone.submilestone !== "Default"
        ) {
          const submilestoneIndex = this.milestoneData[
            milestoneIndex
          ].children.findIndex(c => c.data.title === milestone.submilestone);

          if (submilestoneIndex > -1) {
            const taskindex = this.milestoneData[milestoneIndex].children[
              submilestoneIndex
            ].children.findIndex(c => c.data.id === milestone.id);

            // replace all milestone from edited milestone
            const currentMilestone = this.milestoneData.splice(
              0,
              milestoneIndex + 1
            );
            this.checkForEditedMilestone(currentMilestone);
            const dbmilestones = this.tempmilestoneData.slice(
              milestoneIndex + 1,
              this.tempmilestoneData.length
            );
            this.milestoneData = [...currentMilestone, ...dbmilestones];

            // replace all submilestone from edited submilestone
            const submilestones = this.milestoneData[
              milestoneIndex
            ].children.splice(0, submilestoneIndex + 1);
            this.checkForEditedMilestone(submilestones);
            const dbsubmilestones = this.tempmilestoneData[
              milestoneIndex
            ].children.slice(
              submilestoneIndex + 1,
              this.tempmilestoneData[milestoneIndex].children.length
            );
            this.milestoneData[milestoneIndex].children = [
              ...submilestones,
              ...dbsubmilestones
            ];

            // replace all tasks from edited task
            const tasks = this.milestoneData[milestoneIndex].children[
              submilestoneIndex
            ].children.splice(0, taskindex);
            const dbtasks = this.tempmilestoneData[milestoneIndex].children[
              submilestoneIndex
            ].children.slice(
              taskindex,
              this.tempmilestoneData[milestoneIndex].children[submilestoneIndex]
                .children.length
            );
            this.milestoneData[milestoneIndex].children[
              submilestoneIndex
            ].children = [...tasks, ...dbtasks];

            if (milestone.slotType === "Slot") {
              // replace all subtasks from edited task
              const dbSubtasks = this.tempmilestoneData[milestoneIndex]
                .children[submilestoneIndex].children[taskindex].children;
              this.milestoneData[milestoneIndex].children[
                submilestoneIndex
              ].children[taskindex].children = [...dbSubtasks];
            }
          }
        } else {
          const submilestoneIndex = this.milestoneData[
            milestoneIndex
          ].children.findIndex(c => c.data.id === milestone.id);
          if (submilestoneIndex > -1) {
            // replace all milestone from edited milestone
            const tillCurrent = this.milestoneData.splice(
              0,
              milestoneIndex + 1
            );
            this.checkForEditedMilestone(tillCurrent);
            const dbmilestones = this.tempmilestoneData.slice(
              milestoneIndex + 1,
              this.tempmilestoneData.length
            );
            this.milestoneData = [...tillCurrent, ...dbmilestones];

            // replace all submilestone from edited submilestone
            const submilestones = this.milestoneData[
              milestoneIndex
            ].children.splice(0, submilestoneIndex);
            this.checkForEditedMilestone(submilestones);
            const dbsubmilestones = this.tempmilestoneData[
              milestoneIndex
            ].children.slice(
              submilestoneIndex,
              this.tempmilestoneData[milestoneIndex].children.length
            );
            this.milestoneData[milestoneIndex].children = [
              ...submilestones,
              ...dbsubmilestones
            ];

            if (milestone.slotType === "Slot") {
              // replace all tasks from edited task
              const dbtasks = this.tempmilestoneData[milestoneIndex].children[
                submilestoneIndex
              ].children;
              this.milestoneData[milestoneIndex].children[
                submilestoneIndex
              ].children = [...dbtasks];
            }
          }
        }
      }
    }
    this.tempmilestoneData = JSON.parse(JSON.stringify(this.tempmilestoneData));
    let allReturnedTasks = [];
    this.milestoneData.forEach(milestone => {
      allReturnedTasks.push.apply(
        this.taskAllocateCommonService.getTasksFromMilestones(
          milestone,
          false,
          this.milestoneData,
          false
        )
      );
    });

    this.assignUsers(allReturnedTasks);
    this.convertDateString();

    setTimeout(() => {
      this.milestoneData = [...this.milestoneData];
      this.GanttchartData = this.getGanttTasksFromMilestones(
        this.milestoneData,
        true
      );
      this.createGanttDataAndLinks(true);
      this.loaderenable = false;
    }, 200);
  }
  // tslint:enable

  checkForEditedMilestone(milestonesTasks) {
    let milestoneData = milestonesTasks.filter(
      m =>
        (m.data.type == "milestone" || m.data.type == "submilestone") &&
        m.data.edited
    );
    milestoneData.forEach(m => {
      m.data.editMode = false;
      m.data.edited = false;
    });
  }

  // **************************************************************************************************************************************
  //  Convert string date to date format after cancel the changes
  // **************************************************************************************************************************************
  convertToDate(obj) {
    obj.data.start_date = new Date(obj.data.start_date);
    obj.data.end_date = new Date(obj.data.end_date);
    obj.data.pUserStart = new Date(obj.data.pUserStart);
    obj.data.pUserEnd = new Date(obj.data.pUserEnd);
    obj.data.pUserStartDatePart = this.getDatePart(obj.data.pUserStart);
    obj.data.pUserEndDatePart = this.getDatePart(obj.data.pUserEnd);
  }

  convertDateString() {
    this.milestoneData.forEach(milestone => {
      this.convertToDate(milestone);
      if (milestone.children) {
        milestone.children.forEach(submil => {
          this.convertToDate(submil);
          if (submil.children) {
            submil.children.forEach(task => {
              this.convertToDate(task);
            });
          }
        });
      }
    });
  }

  // **************************************************************************************************
  //  Edit Task
  // **************************************************************************************************

  async editTask(task, rowNode, type?) {
    if (type == "Edit All") {
      this.loaderenable = true;
      setTimeout(() => {
        this.milestoneData.forEach(async (mil, index) => {
          if (mil.children && mil.children.length) {
            mil.children.forEach(async submile => {
              submile.data.type == "task"
                ? await this.editModeForTasks(submile, mil)
                : submile.children.forEach(async subTask => {
                  await this.editModeForTasks(subTask, mil, submile);
                });
            });
          }
          if (mil.data.itemType == "Client Review") {
            await this.editModeForTasks(mil, mil);
          }
        });
        this.loaderenable = false;
      }, 100);
    } else {
      task.assignedUsers.forEach(element => {
        if (element.items.find(c => c.value.ID === task.AssignedTo.ID)) {
          task.AssignedTo = element.items.find(
            c => c.value.ID === task.AssignedTo.ID
          ).value;
        }
      });
      if (rowNode.parent !== null) {
        if (rowNode.parent.parent === null) {
          rowNode.parent.data.editMode = true;
          rowNode.parent.data.edited = true;
        } else {
          rowNode.parent.parent.data.editMode = true;
          rowNode.parent.parent.data.edited = true;
          rowNode.parent.data.editMode = true;
          rowNode.parent.data.edited = true;
        }
      }
      task.editMode = true;
      task.edited = true;
    }
  }

  editModeForTasks(task, milestone, submilestone?) {
    if (
      task.data.status !== "Completed" &&
      task.data.status !== "Abandon" &&
      task.data.status !== "Auto Closed"
    ) {
      task.data.assignedUsers.forEach(element => {
        if (element.items.find(c => c.value.ID === task.data.AssignedTo.ID)) {
          task.data.AssignedTo = element.items.find(
            c => c.value.ID === task.data.AssignedTo.ID
          ).value;
        }
      });
      task.data.edited = true;
      task.data.editMode = true;
      milestone.data.edited = true;
      milestone.data.editMode = true;
      task.data.type !== "Client Review"
        ? (milestone.expanded = true)
        : milestone;
      if (submilestone) {
        submilestone.data.edited = true;
        submilestone.data.editMode = true;
        submilestone.expanded = milestone.data.edited;
      }
      // rowNode.node.data.edited = true;
      // rowNode.node.data.editMode = true;
    }
  }

  // *************************************************************************************************
  //  Add Comment
  // **************************************************************************************************
  openComment(task, rowNode) {
    this.tempComment = task.scope;
    this.task = task;
    this.displayComment = true;

    if (rowNode && rowNode.parent !== null) {
      if (rowNode.parent.parent === null) {
        rowNode.parent.data.edited = true;
      } else {
        rowNode.parent.parent.data.edited = true;
        rowNode.parent.data.edited = true;
      }
    } else {
      const milestone = this.GanttchartData.find(
        e => e.type === "milestone" && e.title === task.milestone
      );
      milestone.edited = true;
    }
    task.edited = true;
  }

  // *************************************************************************************************

  //  Remove Comment
  // **************************************************************************************************

  cancelComment() {
    this.task.scope = this.tempComment;
  }

  // **************************************************************************************************
  //  To check option on each node or row
  //  Menu option on Right Click
  // **************************************************************************************************

  openPopup(data, rowNode) {
    this.taskMenu = [];
    if (
      data.type == "milestone" &&
      data.status !== "Completed" &&
      data.status !== "Abandon" &&
      data.status !== "Auto Closed"
    ) {
      this.taskMenu = [
        {
          label: "Edit All",
          icon: "pi pi-pencil",
          command: event => this.editTask(data, rowNode, "Edit All")
        }
      ];

      if (this.milestoneData.filter(e => e.data.editMode).length) {
        //rowNode.node.children.filter(r=> r.data.editMode).length
        this.taskMenu.splice(
          this.taskMenu.findIndex(t => t.label === "Edit All"),
          1
        );
        this.taskMenu.push({
          label: "Cancel All",
          icon: "pi pi-times-circle",
          command: event => this.CancelChanges(data, "cancelAll")
        });
      }
    }

    if (
      data.type === "task" &&
      data.milestoneStatus !== "Completed" &&
      data.status !== "Completed" &&
      data.status !== "Abandon" &&
      data.status !== "Auto Closed"
    ) {
      this.taskMenu = [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: event => this.editTask(data, rowNode)
        }
      ];
      if (
        data.itemType !== "Client Review" &&
        data.itemType !== "Send to client"
      ) {
        this.taskMenu.push({
          label: "Task Scope",
          icon: "pi pi-comment",
          command: event => this.openComment(data, rowNode)
        });
      }
      if (
        data.itemType !== "Client Review" &&
        data.itemType !== "Send to client" &&
        data.slotType.indexOf("Slot") < 0
      ) {
        if (data.showAllocationSplit) {
          this.taskMenu.push(
            {
              label: "Edit Allocation",
              icon: "pi pi-sliders-h",
              command: event => this.editAllocation(data, "")
            },
            {
              label: "Equal Allocation",
              icon: "pi pi-sliders-h",
              command: event => this.editAllocation(data, "Equal")
            }
          );
        }
        if (data.AssignedTo.ID !== undefined && data.AssignedTo.ID > -1) {
          this.taskMenu.push({
            label: "User Capacity",
            icon: "pi pi-camera",
            command: event => this.getUserCapacity(data)
          });
        }
      }
      if (data.editMode) {
        this.taskMenu.splice(
          this.taskMenu.findIndex(t => t.label === "Edit"),
          1
        );
        this.taskMenu.push({
          label: "Cancel",
          icon: "pi pi-times-circle",
          command: event => this.CancelChanges(data, "task")
        });
      }
    }
  }

  // *************************************************************************************************
  // hide popup menu on production
  // ***********************************************************************************************

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

  async budgetHrsChanged(event) {
    this.disableSave = true;
    event.editMode = true;
    event.edited = true;
    const resource = this.sharedObject.oTaskAllocation.oResources.filter(
      objt => {
        return event.AssignedTo && event.AssignedTo.ID === objt.UserNamePG.ID;
      }
    );
    if (event.type !== "milestone" && event.type !== "submilestone") {
      event.ExpectedBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
        event
      );
      this.maxBudgetHrs = event.ExpectedBudgetHrs;
      if (event.ExpectedBudgetHrs < event.budgetHours) {
        this.ogBudgethrs = event.budgetHours;
        event.budgetHours = 0;
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Budget hours is set to zero because given budget hours is greater than task time period. Original budget hrs of task is " +
          this.ogBudgethrs,
          false
        );
      }
    }
    await this.prestackService.calcPrestackAllocation(resource, event);
    this.disableSave = false;
  }

  // **************************************************************************************************
  //  To get User capacity
  // ************************************************************************************************

  getUserCapacity(milestoneTask) {
    this.sharedObject.currentTaskData = milestoneTask;

    let resourceTask = this.sharedObject.currentTaskData;

    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter(
      objt => {
        return objt.UserNamePG.ID === milestoneTask.AssignedTo.ID;
      }
    );

    let resources = [];
    milestoneTask.assignedUsers.forEach(c => {
      c.items.forEach(item => {
        this.sharedObject.oTaskAllocation.oResources.forEach(objt => {
          if (objt.UserNamePG.ID === item.value.ID) {
            resources.push(objt);
          }
        });
      });
    });

    const ref = this.dialogService.open(UsercapacityComponent, {
      data: {
        task: resourceTask,
        startTime: resourceTask.pUserStart,
        endTime: resourceTask.pUserEnd,
        parentModule: "allocation",
        taskResources: resources
      },
      width: "90vw",
      header: resourceTask.submilestone
        ? resourceTask.milestone +
        " " +
        resourceTask.title +
        " ( " +
        resourceTask.submilestone +
        " )"
        : resourceTask.milestone + " " + resourceTask.title,
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" }
    });
    ref.onClose.subscribe((UserCapacity: any) => { });
  }

  sortByDate(array, prop, order) {
    array.sort((a, b) => {
      a = a.hasOwnProperty("data") ? a.data : a;
      b = b.hasOwnProperty("data") ? b.data : b;
      a = new Date(a[prop]).getTime();
      b = new Date(b[prop]).getTime();
      return order === "asc" ? a - b : b - a;
    });
    return array;
  }

  /********************************************************************************* */
  // Restructre code begins
  /********************************************************************************* */
  reConfigureNodes(restructureMilestones) {
    const nodesNew = [];
    for (const nodeOrder of restructureMilestones.nodeOrder) {
      const node = restructureMilestones.nodes.find(e => e.id === nodeOrder);
      nodesNew.push(node);
    }
    return nodesNew;
  }

  getNextPrevious(allTaskNodes, allTaskLinks, task, firstParam, secondParam) {
    let tasks = allTaskNodes.filter(c =>
      allTaskLinks
        .filter(c => c[firstParam] === task.id)
        .map(c => c[secondParam])
        .includes(c.id)
    );
    tasks = tasks.map(c => c.label).join(";");
    return tasks;
  }

  restructureGetTasks(
    node,
    tempId,
    milestone,
    allReturnedTasks,
    temptasks,
    CRObj,
    milestoneedit,
    submilestone
  ) {
    const allTaskNodes = node.task.nodes;
    const allTaskLinks = node.task.links;
    // debugger;
    allTaskNodes.forEach(task => {
      let nextTasks = this.getNextPrevious(
        allTaskNodes,
        allTaskLinks,
        task,
        "source",
        "target"
      );
      let previousTasks = this.getNextPrevious(
        allTaskNodes,
        allTaskLinks,
        task,
        "target",
        "source"
      );

      tempId++;
      let TaskObj = this.getTaskObjectByValue(
        task,
        "ggroupblack",
        milestone,
        nextTasks,
        previousTasks,
        submilestone,
        "T" + tempId
      );
      previousTasks = previousTasks === "" ? null : previousTasks;
      nextTasks = nextTasks === "" ? null : nextTasks;

      let oExistingTask = this.tempGanttchartData.find(c => c.id === task.dbId);
      if (oExistingTask) {
        oExistingTask = this.getExistingData(oExistingTask);
        if (
          (oExistingTask.previousTask !== previousTasks ||
            (oExistingTask.nextTask !== nextTasks && milestone.status !== "Completed"))
          && !oExistingTask.parentSlot
        ) {
          if (
            oExistingTask.status == "Completed" ||
            oExistingTask.status == "Auto Closed"
          ) {
            oExistingTask.editMode = false;
            oExistingTask.edited = true;
          } else {
            oExistingTask.editMode = true;
            oExistingTask.edited = true;
          }
        }
        oExistingTask.nextTask = nextTasks;
        oExistingTask.previousTask = previousTasks;
      }
      const oTaskObj = oExistingTask ? oExistingTask : TaskObj;
      if (task.taskType !== "Client Review") {
        const tempObj: any = { data: oTaskObj };
        allReturnedTasks.push(oTaskObj);
        if (oTaskObj && oTaskObj.slotType === 'Slot') {
          const subTasks = this.tempGanttchartData.filter(t => t.parentSlot === oTaskObj.id);
          if (subTasks.length) {
            tempObj.children = [];
            subTasks.forEach(subTask => {
              subTask = this.getExistingData(subTask);
              tempObj.children.push({ data: subTask });
            });
            allReturnedTasks = [...allReturnedTasks, ...subTasks];
          }
        }
        temptasks.push(tempObj);
      } else {
        CRObj = { data: oTaskObj };
        allReturnedTasks.push(oTaskObj);
      }
      milestoneedit = milestoneedit
        ? milestoneedit
        : oExistingTask
          ? oExistingTask.edited
            ? true
            : false
          : true;
      if (submilestone) {
        submilestone.edited = submilestone.edited
          ? submilestone.edited
          : oExistingTask
            ? oExistingTask.edited
              ? true
              : false
            : true;
      }

    });
    return { milestoneedit, tempId, CRObj };
  }

  finalizeRestructureChanges(
    milestoneedit,
    milestone,
    temptasks,
    milestoneObj,
    tempmilestoneData,
    CRObj
  ) {
    let oExistingMil = this.tempGanttchartData.find(
      c => c.id === milestone.dbId
    );
    if (oExistingMil !== undefined) {
      if (
        temptasks.filter(c => c.data.id === undefined || c.data.id === 0)
          .length > 0
      ) {
        oExistingMil.editMode = true;
        oExistingMil.edited = true;
      }
    }

    const tempmilestone = {
      data: oExistingMil !== undefined ? oExistingMil : milestoneObj,
      expanded: milestoneedit,
      children: temptasks
    };
    tempmilestoneData.push(tempmilestone);

    if (CRObj !== undefined) {
      tempmilestoneData.push(CRObj);
    }
  }

  getSubmilestonePositionArray(nodes, links, tempSubmilePositionArray) {
    let submilestoneposition = 1;

    nodes.forEach(submilestone => {
      const previousSubMilestones = nodes
        .filter(c =>
          links
            .filter(c => c.target === submilestone.id)
            .map(c => c.source)
            .includes(c.id)
        )
        .map(c => c.label);
      if (previousSubMilestones.length) {
        const prevPosition = tempSubmilePositionArray
          .filter(e => previousSubMilestones.indexOf(e.name) > -1)
          .map(c => parseInt(c.position));
        prevPosition.sort(function (a, b) {
          return b - a;
        });
        submilestoneposition = prevPosition[0] + 1;
      } else {
        submilestoneposition = 1;
      }
      //  if()
      const obj = {
        name: submilestone.label,
        position: submilestoneposition.toString()
      };
      tempSubmilePositionArray.push(obj);
    });
  }

  restructureGanttData(
    restructureMilestones,
    tempmilestoneData,
    milestonesList,
    allReturnedTasks
  ) {
    let tempId = 0;
    let milestoneedit = false;
    restructureMilestones.nodes.forEach(milestone => {
      let CRObj;
      let temptasks = [],
        tempSubmilePositionArray = [];
      tempId++;
      let milestoneObj = this.getObjectByValue(
        milestone,
        "milestone",
        "M" + tempId,
        undefined,
        null
      );
      milestonesList.push(milestone.label);
      if (milestone.submilestone.nodes.length > 1) {
        var submile = [];

        /////// SubMilestone position

        this.getSubmilestonePositionArray(
          milestone.submilestone.nodes,
          milestone.submilestone.links,
          tempSubmilePositionArray
        );

        milestone.submilestone.nodes.forEach(submilestone => {
          tempId++;
          let submilestoneObj = null;
          if (submilestone.label !== "Default") {
            submilestoneObj = this.getObjectByValue(
              submilestone,
              "submilestone",
              "S" + tempId,
              tempSubmilePositionArray,
              milestone
            );
          }

          if (submilestone.task.nodes.length > 0) {
            const taskRes = this.restructureGetTasks(
              submilestone,
              tempId,
              milestone,
              allReturnedTasks,
              temptasks,
              CRObj,
              milestoneedit,
              submilestoneObj
            );
            milestoneedit = taskRes.milestoneedit;
            tempId = taskRes.tempId;
            CRObj = taskRes.CRObj;
            const subTempGantt = this.tempGanttchartData.find(
              c => c.id === submilestone.dbId
            );
            if (subTempGantt && submilestoneObj.edited === true) {
              subTempGantt.edited = true;
              subTempGantt.position = submilestoneObj.position;
            }
            if (submilestone.label !== "Default") {
              const tempsub = {
                data: subTempGantt ? subTempGantt : submilestoneObj,
                children: temptasks,
                expanded: submilestoneObj.edited
              };
              temptasks = [];
              submile.push(tempsub);
            }
          }
        });

        this.finalizeRestructureChanges(
          milestoneedit,
          milestone,
          submile,
          milestoneObj,
          tempmilestoneData,
          CRObj
        );
      } else {
        const taskRes = this.restructureGetTasks(
          milestone.submilestone.nodes[0],
          tempId,
          milestone,
          allReturnedTasks,
          temptasks,
          CRObj,
          milestoneedit,
          null
        );
        milestoneedit = taskRes.milestoneedit;
        tempId = taskRes.tempId;
        CRObj = taskRes.CRObj;

        this.finalizeRestructureChanges(
          milestoneedit,
          milestone,
          temptasks,
          milestoneObj,
          tempmilestoneData,
          CRObj
        );
      }
    });
  }

  postProcessRestructureChanges(allReturnedTasks, milestonesList) {
    this.allRestructureTasks = allReturnedTasks;
    this.assignUsers(allReturnedTasks);
    const ganttTempData = JSON.parse(JSON.stringify(this.GanttchartData));
    this.tempGanttchartData = ganttTempData;
    this.oldGantChartData = ganttTempData;
    this.GanttchartData = this.getGanttTasksFromMilestones(
      this.milestoneData,
      true
    );
    this.createGanttDataAndLinks(true, milestonesList);
    this.taskAllocateCommonService.ganttParseObject.data = [
      ...this.GanttchartData
    ];
    if (this.visualgraph === true) {
      this.loadComponent();
    }
  }

  // **************************************************************************************************
  // Get  Milestone Data After Restructure (Drag & Drop)
  // *************************************************************************************************
  // tslint:disable
  showRestructure() {
    this.loaderenable = true;
    const ref = this.dialogService.open(DragDropComponent, {
      data: {
        milestones: this.milestoneData,
        dbmilestones: this.dbRecords
      },

      header: "Task Allocation ",
      width: "100vw",
      height: "100vh",
      contentStyle: { height: "90vh", overflow: "auto" },
      closable: false
    });

    ref.onClose.subscribe((restructureMilestones: any) => {
      this.loaderenable = true;
      let allReturnedTasks = [],
        tempSubmilestones = [];
      if (restructureMilestones) {
        let tempmilestoneData = [],
          milestonesList = [];
        // restructureMilestones.nodes = this.reConfigureNodes(
        //   restructureMilestones
        // );
        this.restructureGanttData(
          restructureMilestones,
          tempmilestoneData,
          milestonesList,
          allReturnedTasks
        );
        const updatedTaskData = this.updateRestructureDates(tempmilestoneData);
        const updatedtempmilestoneData = this.updateMilestoneSubMilestonesDate(
          updatedTaskData
        );
        this.milestoneData = [];
        this.milestoneData.push.apply(
          this.milestoneData,
          updatedtempmilestoneData
        );
        this.milestoneData = [...this.milestoneData];
        this.changeInRestructure =
          this.milestoneData.find(c => c.data.editMode === true) !== undefined
            ? true
            : false;
        if (this.changeInRestructure) {
          setTimeout(() => {
            this.commonService.showToastrMessage(
              this.constants.MessageType.warn,
              "There are some unsaved changes, Please save them.",
              false
            );
          }, 300);
        }
        this.postProcessRestructureChanges(allReturnedTasks, milestonesList);
        this.loaderenable = false;
      } else {
        this.CancelChanges(tempSubmilestones, "discardAll");
      }
    });
  }

  setTaskDates(milestoneTaskObj, updatedDate) {
    milestoneTaskObj.pUserStart = new Date(updatedDate);
    milestoneTaskObj.pUserStartDatePart = this.getDatePart(
      new Date(updatedDate)
    );
    milestoneTaskObj.pUserStartTimePart = this.getTimePart(
      new Date(updatedDate)
    );
    milestoneTaskObj.pUserEnd = new Date(updatedDate);
    milestoneTaskObj.pUserEndDatePart = this.getDatePart(new Date(updatedDate));
    milestoneTaskObj.pUserEndTimePart = this.getTimePart(new Date(updatedDate));
    milestoneTaskObj.start_date = new Date(updatedDate);
    milestoneTaskObj.end_date = new Date(updatedDate);

    // return milestoneTaskObj;
  }

  updateRestructureDates(milestoneData) {
    const defaultDate = this.getDefaultDate();
    milestoneData.forEach((mil, index) => {
      let milestone =
        mil.data.type == "milestone" && mil.data.added == true ? mil.data : "";
      let subMilestone = mil.children
        ? mil.children.filter(
          e => e.data.type == "submilestone" && e.data.added == true
        )
        : "";
      let CRtask =
        mil.data.itemType == "Client Review" && mil.data.added == true
          ? mil.data
          : "";

      //new added milestone
      if (milestone) {
        let prevCRTask = milestoneData[
          milestoneData.findIndex(m => m.data == milestone) - 1
        ]
          ? milestoneData[milestoneData.findIndex(m => m.data == milestone) - 1]
            .data
          : "";
        prevCRTask
          ? new Date(prevCRTask.end_date) > new Date(defaultDate)
            ? this.setTaskDates(milestone, prevCRTask.end_date)
            : this.setTaskDates(milestone, new Date(defaultDate))
          : this.setTaskDates(milestone, new Date(defaultDate));
      }

      //new added submilestone
      if (subMilestone && subMilestone.length) {
        subMilestone.forEach(sub => {
          let previousSubMilestones = mil.children[
            mil.children.findIndex(e => e == sub) - 1
          ]
            ? mil.children[mil.children.findIndex(e => e.data == sub.data) - 1]
              .data
            : "";
          let parentMilestone = milestoneData.find(
            m => m.data.title === sub.data.milestone
          );
          previousSubMilestones
            ? this.setTaskDates(sub.data, previousSubMilestones.end_date)
            : new Date(parentMilestone.data.start_date) > new Date(defaultDate)
              ? this.setTaskDates(sub.data, parentMilestone.data.start_date)
              : this.setTaskDates(sub.data, new Date(defaultDate));
        });
      }
      // new added milestone/submilestone task
      if (mil.children && mil.children.length) {
        let tasks = mil.children.find(e => e.children && e.data.slotType !== 'Slot')
          ? mil.children.filter(e => e.children.find(c => c.data.added))
          : mil.children.filter(c => c.data.added == true);
        if (tasks && tasks.length) {
          tasks.forEach(t => {
            if (t.data.type == "submilestone") {
              t.children.forEach(subTask => {
                if (subTask.data.added) {
                  let prevTask = t.children.find(
                    e => e.data.title == subTask.data.previousTask
                  );
                  let parentSubMilestone = mil.children
                    .filter(e => e.data.title)
                    .find(c => c.data.title == subTask.data.submilestone).data;
                  // let parentSubMilestone = milestoneData.find(m => m.children.filter(e=> e.data.title)).children.find(c=> c.data.title == subTask.data.submilestone).data;
                  prevTask
                    ? this.setTaskDates(subTask.data, prevTask.data.end_date)
                    : new Date(parentSubMilestone.start_date) >
                      new Date(defaultDate)
                      ? this.setTaskDates(
                        subTask.data,
                        parentSubMilestone.start_date
                      )
                      : this.setTaskDates(subTask.data, new Date(defaultDate));
                }
              });
            } else if (t.data.type == "task") {
              let prevTask = mil.children.find(
                e => e.data.title == t.data.previousTask
              );
              let parentMilestone = milestoneData.find(
                m => m.data.title === t.data.milestone
              );
              prevTask
                ? this.setTaskDates(t.data, prevTask.data.end_date)
                : new Date(parentMilestone.data.start_date) >
                  new Date(defaultDate)
                  ? this.setTaskDates(t.data, parentMilestone.data.start_date)
                  : this.setTaskDates(t.data, new Date(defaultDate));
            }
          });
        }
      }

      //new added CR task
      if (CRtask) {
        let parentMilestone = milestoneData.find(
          m => m.data.title === CRtask.milestone
        );
        this.setTaskDates(CRtask, parentMilestone.data.end_date);
      }
    });
    return milestoneData;
  }

  setDateValues(object) {
    let milestone = object;
    // milestone.children = object.children.sort((a, b) =>
    //     <any>new Date(a.data.start_date) - <any>new Date(b.data.start_date));

    object.data.start_date = milestone.children[0].data.start_date;
    object.data.pUserStart = milestone.children[0].data.pUserStart;
    object.data.pUserStartDatePart =
      milestone.children[0].data.pUserStartDatePart;
    object.data.end_date =
      milestone.children[milestone.children.length - 1].data.end_date;
    object.data.pUserEnd =
      milestone.children[milestone.children.length - 1].data.pUserEnd;
    object.data.pUserEndDatePart =
      milestone.children[milestone.children.length - 1].data.pUserEndDatePart;
  }

  updateMilestoneSubMilestonesDate(milestones) {
    const updatedMilestones = milestones;
    updatedMilestones.forEach(milestone => {
      if (milestone.children) {
        milestone.children.forEach(submilestone => {
          if (submilestone.children) {
            this.setDateValues(submilestone);
          }
        });
        this.setDateValues(milestone);
      }
    });
    return updatedMilestones;
  }
  // tslint:enable
  // *************************************************************************************************************************************
  // User changes Cascading (User change )
  // *************************************************************************************************************************************

  async assignedToUserChanged(milestoneTask) {
    this.disableSave = true;
    await this.taskAllocateCommonService.assignedToUserChanged(
      milestoneTask,
      this.milestoneData,
      this.allRestructureTasks,
      this.allTasks
    );
    this.disableSave = false;
  }

  // *************************************************************************************************
  // Cascading full data
  // **************************************************************************************************
  async DateChangePart(node, type) {
    this.disableSave = true;
    this.leaveAlertMsgs = [];
    this.reallocationMailArray.length = 0;
    this.deallocationMailArray.length = 0;
    node.pUserStart = new Date(
      this.datepipe.transform(node.pUserStartDatePart, "MMM d, y") +
      " " +
      node.pUserStartTimePart
    );
    node.pUserEnd = new Date(
      this.datepipe.transform(node.pUserEndDatePart, "MMM d, y") +
      " " +
      node.pUserEndTimePart
    );
    node.ExpectedBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(
      node
    );
    this.maxBudgetHrs = node.ExpectedBudgetHrs;
    const resource = this.sharedObject.oTaskAllocation.oResources.filter(
      objt => {
        return node.AssignedTo && node.AssignedTo.ID === objt.UserNamePG.ID;
      }
    );
    const isValid = this.validateTask([node]);
    if (isValid) {
      await this.startDateChanged(node, type);
      if (+node.budgetHours > +this.maxBudgetHrs) {
        this.ogBudgethrs = node.budgetHours;
        node.budgetHours = 0;
        this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          "Budget hours is set to zero because given budget hours is greater than task time period.Original budget hrs of task is " +
          this.ogBudgethrs,
          false
        );
      }
      await this.changeDateOfEditedTask(node, type);
      await this.prestackService.calcPrestackAllocation(resource, node);
      this.leaveAlertMsgs = await this.calcLeaveMsgs(resource, node, this.leaveAlertMsgs);
      await this.DateChange(node, type);
      this.displayLeaveMsgs(this.leaveAlertMsgs);
    }
    this.disableSave = false;
  }

  // tslint:disable
  async DateChange(node, type) {
    let previousNode = node;
    let selectedMil = -1;
    let subMilestonePosition = 0;

    if (previousNode.itemType === "Client Review") {
      const clientReviewIndex = this.milestoneData.findIndex(
        e =>
          e.data.itemType === "Client Review" &&
          e.data.milestone === previousNode.milestone
      );
      selectedMil = clientReviewIndex;
    } else {
      selectedMil = this.milestoneData.findIndex(
        e => e.data.title === previousNode.milestone
      );
      if (previousNode.submilestone) {
        const milestone = this.milestoneData[selectedMil];
        const subMil = milestone.children.find(
          e => e.data.title === previousNode.submilestone
        );
        subMilestonePosition = parseInt(subMil.data.position, 10);
      }
    }

    // clickedInput variable is used to know if start or end date changed
    previousNode.clickedInput = type;
    await this.cascadeNextNodes(previousNode, subMilestonePosition, selectedMil);
    this.resetStartAndEnd();
    previousNode.clickedInput = undefined;
  }

  startDateChanged(node, type) {
    if (type == "start" && node.pUserStart > node.pUserEnd && node.budgetHours) {
      let endDate = new Date(node.pUserStart);
      endDate.setHours(
        endDate.getHours() + parseInt(node.budgetHours.split(".")[0])
      );
      node.budgetHours.split(".")[1]
        ? endDate.setMinutes(
          endDate.getMinutes() + parseInt(node.budgetHours.split(".")[1])
        )
        : endDate;
      node.end_date = new Date(endDate);
      node.pUserEnd = new Date(endDate);
      node.pUserEndDatePart = this.getDatePart(endDate);
      node.pUserEndTimePart = this.getTimePart(endDate);
    }
  }

  setMilestoneStartEnd(nextNode, selectedMil) {
    const sentPrevNode = this.milestoneData[selectedMil];
    this.setStartAndEnd(sentPrevNode);
    this.milestoneData[selectedMil] = sentPrevNode;
    if (this.milestoneData.length > selectedMil + 1) {
      nextNode.push(this.milestoneData[selectedMil + 1]);
    }
    return sentPrevNode;
  }

  async cascadeNextNodes(previousNode, subMilestonePosition, selectedMil) {
    var nextNode = [];
    let sentPrevNode = undefined;
    if (
      previousNode.nextTask &&
      previousNode.nextTask.indexOf("Client Review") === -1
    ) {
      const currMil = this.milestoneData[selectedMil];
      const allMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(
        currMil,
        true,
        this.milestoneData,
        false
      );
      const nextTasks = previousNode.nextTask.split(";");
      let retNodes = undefined;
      if (subMilestonePosition !== 0) {
        retNodes = allMilestoneTasks.filter(
          c =>
            c.submilestone === previousNode.submilestone &&
            nextTasks.indexOf(c.title) > -1
        );
      } else {
        retNodes = allMilestoneTasks.filter(
          c => nextTasks.indexOf(c.title) > -1
        );
      }
      retNodes.forEach(element => {
        nextNode.push(element);
      });
      sentPrevNode = previousNode;
    } else {
      if (subMilestonePosition !== 0) {
        const currMil = this.milestoneData[selectedMil];
        let retNodes;
        ///// Set current submilestone end date
        if (
          previousNode.submilestone !== "Default" &&
          previousNode.submilestone !== ""
        ) {
          sentPrevNode = currMil.children.filter(
            c => c.data.title == previousNode.submilestone
          )[0];
          this.setStartAndEnd(sentPrevNode);
          this.milestoneData[selectedMil].children.filter(
            c => c.data.title == previousNode.submilestone
          )[0] = sentPrevNode;
          retNodes = currMil.children.filter(
            c => parseInt(c.data.position) == subMilestonePosition + 1
          );
        } else {
          sentPrevNode = previousNode;
          const allMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(
            currMil,
            true,
            this.milestoneData,
            false
          );
          const nextTasks = previousNode.nextTask.split(";");
          retNodes = allMilestoneTasks.filter(
            c =>
              c.submilestone === previousNode.submilestone &&
              nextTasks.indexOf(c.title) > -1
          );
        }

        if (retNodes.length) {
          retNodes.forEach(element => {
            nextNode.push(element);
          });
        } else {
          retNodes = currMil.children.filter(
            c =>
              (c.data.submilestone == "" ||
                c.data.submilestone === "Default") &&
              c.data.type !== "submilestone" &&
              !c.data.previousTask
          );
          subMilestonePosition = 0;
          if (retNodes.length) {
            retNodes.forEach(element => {
              nextNode.push(element);
            });
          } else {
            sentPrevNode = this.setMilestoneStartEnd(nextNode, selectedMil);
          }
        }
      } else {
        sentPrevNode = this.setMilestoneStartEnd(nextNode, selectedMil);
      }
    }
    if (sentPrevNode.slotType === "Slot" && sentPrevNode.id > 0) {
      await this.compareSlotSubTasksTimeline(
        sentPrevNode,
        subMilestonePosition,
        selectedMil
      );
    }

    if (nextNode.length) {
      nextNode.forEach(async element => {
        const elementData = element.hasOwnProperty("data")
          ? element.data
          : element;
        // stops cascading if elements cascading is disabled or task is in progress
        if (
          !elementData.DisableCascade &&
          (elementData.status === "Not Started" ||
            elementData.status === "Not Confirmed" ||
            elementData.status === "Not Saved")
        ) {
          await this.cascadeNextTask(
            sentPrevNode,
            element,
            subMilestonePosition,
            selectedMil
          );
        }
      });
    }
  }

  async cascadeNextTask(
    previousNode,
    nextNode,
    subMilestonePosition,
    selectedMil
  ) {
    const nodeData = nextNode.hasOwnProperty("data") ? nextNode.data : nextNode;
    const prevNodeData = previousNode.hasOwnProperty("data")
      ? previousNode.data
      : previousNode;
    // based on slot or task use start date or end date
    const prevNodeEndDate =
      prevNodeData.slotType === "Slot" && nodeData.parentSlot
        ? new Date(prevNodeData.start_date)
        : new Date(prevNodeData.end_date);
    if (nodeData.type === "task") {
      if (
        nodeData.status !== "Completed" &&
        nodeData.status !== "Auto Closed" &&
        prevNodeEndDate > new Date(nodeData.start_date)
      ) {
        if (nodeData.itemType !== "Client Review") {
          await this.cascadeNode(previousNode, nodeData);
          await this.cascadeNextNodes(nodeData, subMilestonePosition, selectedMil);
        } else {
          await this.cascadeNode(previousNode, nodeData);
          await this.cascadeNextNodes(nodeData, 0, selectedMil + 1);
        }
      }
    } else if (nodeData.type === "submilestone") {
      if (prevNodeEndDate > nodeData.start_date) {
        const allParallelTasks = nextNode.children.filter(dataEl => {
          return !dataEl.data.previousTask;
        });
        allParallelTasks.forEach(async element => {
          if (
            !element.data.DisableCascade &&
            element.data.status !== "In Progress"
          ) {
            await this.cascadeNextTask(
              previousNode,
              element.data,
              parseInt(nodeData.position),
              selectedMil
            );
          }
        });
      }
    } else if (nodeData.type === "milestone") {
      if (prevNodeEndDate >= nodeData.start_date) {
        const firstTask = nextNode.children[0].data;
        nodeData.edited = true;
        const allTasks = this.taskAllocateCommonService.getTasksFromMilestones(
          nextNode,
          false,
          this.milestoneData,
          false
        );
        let allParallelTasks = [];
        if (firstTask.type === "task") {
          allParallelTasks = allTasks.filter(dataEl => {
            return !dataEl.previousTask;
          });
        } else {
          nextNode.children.forEach(element => {
            const tempData = allTasks.filter(dataEl => {
              return (
                !dataEl.previousTask &&
                parseInt(firstTask.position) === parseInt(element.data.position)
              );
            });
            allParallelTasks.push.apply(allParallelTasks, tempData);
          });
        }
        allParallelTasks.forEach(async element => {
          if (!element.DisableCascade && element.status !== "In Progress") {
            await this.cascadeNextTask(
              previousNode,
              element,
              element.submilestone ? 1 : 0,
              selectedMil + 1
            );
          }
        });
      }
    }
  }

  // *************************************************************************************************
  // Date changes Cascading (Task Date Change)
  // **************************************************************************************************
  // tslint:disable
  async cascadeNode(previousNode, node) {
    const nodeData = node.hasOwnProperty("data") ? node.data : node;
    const prevNodeData = previousNode.hasOwnProperty("data")
      ? previousNode.data
      : previousNode;
    const startDate = new Date(nodeData.pUserStart);
    const endDate = new Date(nodeData.pUserEnd);
    const workingHours = this.workingMinutesBetweenDates(startDate, endDate);
    // Check if prev node slot then consider startdate of slot
    const prevNodeStartDate =
      prevNodeData.slotType === "Slot" && nodeData.parentSlot
        ? new Date(prevNodeData.start_date)
        : new Date(prevNodeData.end_date);
    nodeData.pUserStart = this.commonService.calcTimeForDifferentTimeZone(
      prevNodeStartDate,
      this.sharedObject.currentUser.timeZone,
      nodeData.assignedUserTimeZone
    );
    nodeData.pUserEnd = this.checkEndDate(nodeData.pUserStart, workingHours);
    nodeData.edited = true;
    this.changeDateProperties(nodeData);
    const resource = this.sharedObject.oTaskAllocation.oResources.filter(
      objt => {
        return node.AssignedTo && node.AssignedTo.ID === objt.UserNamePG.ID;
      }
    );
    await this.prestackService.calcPrestackAllocation(resource, nodeData);
    this.leaveAlertMsgs = await this.calcLeaveMsgs(resource, nodeData, this.leaveAlertMsgs);
    if (
      nodeData.IsCentrallyAllocated === "Yes" &&
      node.slotType !== "Slot" &&
      !node.parentSlot
    ) {
      nodeData.user = nodeData.skillLevel;
    }
  }
  // tslint:enable

  async calcLeaveMsgs(resource, nodeData: IMilestoneTask, leaveMsgs) {
    const resourceDetail = await this.prestackService.calcResourceCapacity(resource, nodeData);
    const resourceCapacity = resourceDetail.capacity;
    if (resourceCapacity && resourceCapacity.leaves.length) {
      const resourceExists = leaveMsgs.find(r => r.resource === resourceCapacity.userName);
      if (resourceExists) {
        for (const leave of resourceCapacity.leaves) {
          if (!resourceExists.allLeaves.find(r => new Date(r).getTime() === new Date(leave).getTime())) {
            const formattedleave = this.datepipe.transform(new Date(leave), "d MMM y");
            resourceExists.allLeaves.push(formattedleave);
          }
        }
      } else {
        const leaves = [];
        for (const leave of resourceCapacity.leaves) {
          const formattedleave = this.datepipe.transform(new Date(leave), "d MMM y");
          leaves.push(formattedleave);
        }
        leaveMsgs.push({
          resource: resourceCapacity.userName,
          allLeaves: leaves
        })
      }
    }
    return leaveMsgs;
  }

  getSortedDates(node) {
    node.data.end_date =
      node.children !== undefined && node.children.length > 0
        ? this.sortDates(node, "end")
        : node.data.end_date;
    node.data.start_date =
      node.children !== undefined && node.children.length > 0
        ? this.sortDates(node, "start")
        : node.data.start_date;
  }

  setStartAndEnd(node) {
    if (node.data.itemType === "Client Review") {
      this.getSortedDates(node);
      this.setDatePartAndTimePart(node.data);
    } else if (node.data.status !== "Completed") {
      this.getSortedDates(node);
      node.data.pUserStart = node.data.start_date;
      node.data.pUserEnd = node.data.end_date;
      this.setDatePartAndTimePart(node.data);

      const getNodes = this.taskAllocateCommonService.getTasksFromMilestones(
        node,
        false,
        this.milestoneData,
        false
      );
      const bEditedNode = getNodes.find(e => e.edited === true);
      if (bEditedNode) {
        node.data.edited = true;
      }
    }
  }

  sortDates(node, type) {
    const nodeCopy = Object.assign({}, node).children.filter(
      c =>
        c.data.type !== 'task' ||
        (c.data.type === 'task' &&
          c.data.itemType.toLowerCase() !== 'adhoc' &&
          c.data.itemType.toLowerCase() !== 'tb' && c.data.itemType !== 'Time Booking')
    );
    switch (type) {
      case "start":
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.start_date);
          const dueDate = new Date(b.data.start_date);
          return startDate > dueDate ? 1 : -1;
        });
        return nodeCopy[0].data.start_date;
      case "end":
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.end_date);
          const dueDate = new Date(b.data.end_date);
          return dueDate > startDate ? 1 : -1;
        });
        return nodeCopy[0].data.end_date;
      default:
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.start_date);
          const dueDate = new Date(b.data.start_date);
          return startDate > dueDate ? 1 : -1;
        });
        return nodeCopy[0];
    }
  }

  getDefaultStartDate(node) {
    return new Date(
      node.pUserStart.getFullYear(),
      node.pUserStart.getMonth(),
      node.pUserStart.getDate(),
      9,
      0
    );
  }

  getDefaultEndDate(node) {
    return new Date(
      node.pUserStart.getFullYear(),
      node.pUserStart.getMonth(),
      node.pUserStart.getDate(),
      19,
      0
    );
  }

  setDatePartAndTimePart(node) {
    node.pUserStartDatePart = this.getDatePart(node.pUserStart);
    node.pUserStartTimePart = this.getTimePart(node.pUserStart);
    node.pUserEndDatePart = this.getDatePart(node.pUserEnd);
    node.pUserEndTimePart = this.getTimePart(node.pUserEnd);
    node.tatVal = this.commonService.calcBusinessDays(
      new Date(node.start_date),
      new Date(node.end_date)
    );
  }

  changeUserTimeZoneToCurrent(node) {
    node.start_date = this.commonService.calcTimeForDifferentTimeZone(
      node.pUserStart,
      node.assignedUserTimeZone,
      this.sharedObject.currentUser.timeZone
    );
    node.end_date = this.commonService.calcTimeForDifferentTimeZone(
      node.pUserEnd,
      node.assignedUserTimeZone,
      this.sharedObject.currentUser.timeZone
    );
  }

  changeUserTimeZone(node, previousTimezone, newTimeZone) {
    node.pUserStart = this.commonService.calcTimeForDifferentTimeZone(
      node.pUserStart,
      previousTimezone,
      newTimeZone
    );
    node.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(
      node.pUserEnd,
      previousTimezone,
      newTimeZone
    );
  }

  changeDateProperties(node) {
    this.changeUserTimeZoneToCurrent(node);
    this.setDatePartAndTimePart(node);
  }

  changeDateOfEditedTask(node, type) {
    node.pUserStart =
      node.tat === true && node.itemType !== "Client Review"
        ? this.getDefaultStartDate(node)
        : node.pUserStart;
    node.pUserEnd =
      type === "start" && node.pUserStart > node.pUserEnd
        ? node.tat === true
          ? this.getDefaultEndDate(node)
          : node.pUserStart
        : node.itemType == "Send to client"
          ? node.pUserStart
          : node.pUserEnd;
    this.changeDateProperties(node);
    node.edited = true;
    if (
      node.IsCentrallyAllocated === "Yes" &&
      node.slotType !== "Slot" &&
      !node.parentSlot
    ) {
      node.user = node.skillLevel;
    }
  }

  resetStartAndEnd() {
    for (const milestone of this.milestoneData) {
      if (milestone.children !== undefined) {
        milestone.children.forEach(submilestone => {
          if (submilestone.data.type === "submilestone") {
            this.setStartAndEnd(submilestone);
          }
        });
      }
      this.setStartAndEnd(milestone);
    }
  }

  // tslint:enable

  // *************************************************************************************************************************************
  // Calculate Working Hours between Dates
  // *************************************************************************************************************************************

  workingMinutesBetweenDates(start, end) {
    let count = 0;
    for (
      let i = start.valueOf();
      i < end.valueOf();
      i = start.setMinutes(start.getMinutes() + 1).valueOf()
    ) {
      if (start.getDay() !== 0 && start.getDay() !== 6) {
        // && start.getHours() >= 9 && start.getHours() < 19
        count++;
      }
    }
    return count;
  }

  // *************************************************************************************************************************************
  // Calculate  End  Date  after working hours difference
  // *************************************************************************************************************************************

  checkEndDate(start, workingMinutes) {
    let count = 0;
    let EndDate = new Date(start);
    while (count < workingMinutes) {
      if (EndDate.getDay() !== 0 && EndDate.getDay() !== 6) {
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        count++;
      } else {
        EndDate = new Date(
          EndDate.getFullYear(),
          EndDate.getMonth(),
          EndDate.getDate() + 1,
          0,
          0
        );
      }
    }
    return EndDate;
  }

  // *************************************************************************************************************************************
  // Calculate  Start End Date On Tat
  // *************************************************************************************************************************************
  async ChangeEndDate($event, node) {
    if ($event) {
      const resource = this.sharedObject.oTaskAllocation.oResources.filter(
        objt => {
          return node.AssignedTo.ID === objt.UserNamePG.ID;
        }
      );
      node.pUserStart = new Date(
        node.pUserStart.getFullYear(),
        node.pUserStart.getMonth(),
        node.pUserStart.getDate(),
        9,
        0
      );
      node.pUserEnd = new Date(
        node.pUserEnd.getFullYear(),
        node.pUserEnd.getMonth(),
        node.pUserEnd.getDate(),
        19,
        0
      );

      this.changeDateProperties(node);
      await this.prestackService.calcPrestackAllocation(resource, node);
      await this.DateChange(node, "end");
    }
  }

  // *************************************************************************************************************************************
  // Cascade Slot sub tasks
  // *************************************************************************************************************************************

  /**
   * Cascading slot subtasks if start date of slot is changed
   * @param sentPrevNode
   * @param element
   * @param subMilestonePosition
   * @param selectedMil
   */
  async compareSlotSubTasksTimeline(
    sentPrevNode1,
    subMilestonePosition,
    selectedMil
  ) {
    // fetch slot based on submilestone presnt or not
    let sentPrevNode;
    if (subMilestonePosition === 0) {
      sentPrevNode = this.milestoneData[selectedMil].children.find(
        st => st.data.title === sentPrevNode1.title
      );
    } else {
      const submilestone = this.milestoneData[selectedMil].children.find(
        sm => sm.data.title === sentPrevNode1.submilestone
      );
      sentPrevNode = submilestone.children.find(
        st => st.data.title === sentPrevNode1.title
      );
    }

    let slotFirstTask = sentPrevNode
      ? sentPrevNode.children
        ? sentPrevNode.children.filter(st => !st.data.previousTask)
        : []
      : [];
    // cascade if slot start date is more than first subtask in slot
    if (slotFirstTask.length) {
      if (
        !sentPrevNode1.clickedInput ||
        (sentPrevNode1.clickedInput && sentPrevNode1.clickedInput === "start")
      ) {
        let slotFirstTaskSorted = this.sortByDate(
          slotFirstTask,
          "pUserStart",
          "asc"
        );
        if (
          sentPrevNode.data.start_date > slotFirstTaskSorted[0].data.start_date
        ) {
          slotFirstTaskSorted.forEach(async element => {
            if (
              !element.data.DisableCascade &&
              element.data.status === "Not Started"
            ) {
              await this.cascadeNextTask(
                sentPrevNode,
                element,
                subMilestonePosition,
                selectedMil
              );
            }
          });
          if (
            sentPrevNode.data.status !== "In Progress" &&
            slotFirstTask[0].data.AssignedTo.EMail
          ) {
            // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability
            await this.checkTaskResourceAvailability(
              sentPrevNode,
              subMilestonePosition,
              selectedMil,
              this.sharedObject.oTaskAllocation.oResources
            );
          }
        }
      } else if (
        sentPrevNode.data.status !== "In Progress" &&
        slotFirstTask[0].data.AssignedTo.EMail
      ) {
        // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability
        await this.checkTaskResourceAvailability(
          sentPrevNode,
          subMilestonePosition,
          selectedMil,
          this.sharedObject.oTaskAllocation.oResources
        );
      }
    }
  }

  addToReAllocateEmail(mailTableObj, newData, oldData, assignedTo) {
    const dataObj = Object.assign({}, mailTableObj);
    dataObj.taskName = newData.data.title;
    dataObj.preStDate = this.datepipe.transform(
      oldData.data.start_date,
      "MMM dd yyyy hh:mm:ss a"
    );
    dataObj.preEndDate = this.datepipe.transform(
      oldData.data.end_date,
      "MMM dd yyyy hh:mm:ss a"
    );
    dataObj.newStDate = this.datepipe.transform(
      newData.data.start_date,
      "MMM dd yyyy hh:mm:ss a"
    );
    dataObj.newEndDate = this.datepipe.transform(
      newData.data.end_date,
      "MMM dd yyyy hh:mm:ss a"
    );
    dataObj.assginedTo = assignedTo;
    this.reallocationMailData.push(dataObj);
  }

  /**
   * Deallocation / Reallocation logic
   * @param slot
   * @param subMilestonePosition
   * @param selectedMil
   */
  async checkTaskResourceAvailability(
    slot,
    subMilestonePosition,
    selectedMil,
    oResources
  ) {
    let deallocateSlot = false;
    // old value of slot is used for table details within mail sne for deallocation
    const oldSlot =
      subMilestonePosition === 0
        ? this.tempmilestoneData[selectedMil].children.find(
          s => s.data.title === slot.data.title
        )
        : this.milestoneData[selectedMil].children[
          subMilestonePosition - 1
        ].children.find(st => st.data.title === slot.data.title);
    const slotTasks = slot.children;
    const lastTask = slot.children.filter(st => !st.data.nextTask);
    const firstTask = slot.children.filter(st => !st.data.prevTask);
    const sortedTasksEnd = this.sortByDate(lastTask, "pUserEnd", "desc");
    const sortedTasksStart = this.sortByDate(firstTask, "pUserStart", "asc");
    for (const task of slotTasks) {
      const assignedUserId =
        task.data.AssignedTo.ID && task.data.AssignedTo.ID !== -1
          ? task.data.AssignedTo.ID
          : task.data.previousAssignedUser;
      // find capacity of user on new dates and it returns task for user on given dates
      if (assignedUserId) {
        let retTask = [];
        const resource = oResources.filter(
          r => r.UserNamePG.ID === assignedUserId
        );
        const oCapacity = await this.usercapacityComponent.applyFilterReturn(
          task.data.pUserStart,
          task.data.pUserEnd,
          resource,
          []
        );

        let retRes = oCapacity.arrUserDetails.length
          ? oCapacity.arrUserDetails[0]
          : [];
        retTask = retRes.tasks;
        const breakAvailable = retRes.displayTotalUnAllocated.split(":");
        let availableHours =
          parseFloat(breakAvailable[0]) +
          parseFloat((parseFloat(breakAvailable[1]) / 60).toFixed(2));
        const allocatedHours = parseFloat(task.data.budgetHours);
        // For same task included in result so adding expected hours for same task
        const retTaskInd = retTask.find(t => t.ID === task.data.id);
        if (retTaskInd) {
          availableHours = availableHours + allocatedHours;
        }
        if (availableHours >= allocatedHours) {
          // filter tasks based on dates and subtasks within same slot
          retTask = retTask.filter(
            t => t.ID !== task.data.pID && t.Status !== "Completed"
          );

          retTask = retTask.filter(tsk => {
            return (
              task.data.id != tsk.ID &&
              (
                (task.data.pUserStart <= tsk.DueDate &&
                  task.data.pUserEnd >= tsk.DueDate) ||
                (task.data.pUserStart <= tsk.StartDate &&
                  task.data.pUserEnd >= tsk.StartDate) ||
                (task.data.pUserStart >= tsk.StartDate &&
                  task.data.pUserEnd <= tsk.DueDate))
            );
          });

          if (
            retTask.length ||
            slot.data.pUserEnd < sortedTasksEnd[0].data.pUserEnd ||
            slot.data.pUserStart > sortedTasksStart[0].data.pUserStart
          ) {
            deallocateSlot = true;
            break;
          } else {
            deallocateSlot = false;
          }
        } else {
          deallocateSlot = true;
          break;
        }
      }
    }

    // If slot needs to be deallocated then form table with new and old values for table
    // this.deallocationMailArray is used to store all values of table to trigger single mail for slot which is used in savetask function
    if (!deallocateSlot) {
      slot.data.slotColor = "#6EDC6C";
      slot.data.CentralAllocationDone = "Yes";
      this.reallocationMailData.length = 0;

      const mailTableObj = {
        taskName: "",
        preStDate: "",
        preEndDate: "",
        newStDate: "",
        newEndDate: "",
        assginedTo: ""
      };
      for (let task of slotTasks) {
        task.data.AssignedTo.ID =
          task.data.AssignedTo.ID !== -1
            ? task.data.AssignedTo.ID
            : task.data.previousAssignedUser;
        task.data.previousAssignedUser = -1;
        task.data.assignedUserTimeZone = task.data.assignedUserTimeZone
          ? task.data.assignedUserTimeZone
          : task.data.previousTimeZone;
        task.data.CentralAllocationDone = "Yes";
        task.data.edited = true;
        task.data.allocationPerDay = task.data.prevallocationPerDay
          ? task.data.prevallocationPerDay
          : task.data.allocationPerDay;
        task.data.showAllocationSplit = task.data.prevshowAllocationSplit
          ? task.data.prevshowAllocationSplit
          : task.data.showAllocationSplit;
        task.data.allocationColor = task.data.prevallocationColor
          ? task.data.prevallocationColor
          : task.data.allocationColor;
      }
      this.addToReAllocateEmail(mailTableObj, slot, oldSlot, "");
      const oldSubTasks = oldSlot.children;

      slot.children.forEach((task, index) => {
        this.addToReAllocateEmail(
          mailTableObj,
          task,
          oldSubTasks[index],
          task.data.AssignedTo.Title
        );
      });
      setTimeout(() => {
        const table = this.reallocateTable.nativeElement.innerHTML;
        this.reallocationMailArray.push({
          project: this.oProjectDetails,
          slot,
          data: table,
          subject: slot.data.title + " reallocated"
        });
      }, 300);
    } else {
      // Reallocation and send single mail for reallocation
      for (const task of slotTasks) {
        task.data.previousAssignedUser =
          task.data.previousAssignedUser &&
            task.data.previousAssignedUser !== -1
            ? task.data.previousAssignedUser
            : task.data.AssignedTo.ID
              ? task.data.AssignedTo.ID
              : -1;
        task.data.AssignedTo.ID = -1;
        task.data.previousTimeZone = task.data.assignedUserTimeZone;
        task.data.assignedUserTimeZone = this.defaultTimeZone;
        task.data.CentralAllocationDone = "No";
        task.data.edited = true;
        task.data.prevallocationPerDay = task.data.allocationPerDay;
        task.data.prevshowAllocationSplit = task.data.showAllocationSplit;
        task.data.prevallocationColor = task.data.allocationColor;
        this.taskAllocateCommonService.resetDailyAllocation(task.data);
      }
      slot.data.slotColor = "#FF3E56";
      slot.data.CentralAllocationDone = "No";
      this.deallocationMailArray.push({
        project: this.oProjectDetails,
        slot,
        subject: slot.data.title + " deallocated",
        template: this.constants.EMAIL_TEMPLATE_NAME.CENTRAL_TASK_CREATION
      });
    }
  }

  showConflictAllocations(task, conflictDetail, node) {
    let header = task
      ? "-" + task.submilestone
        ? task.milestone + " ( " + task.title + " )"
        : "-" + task.title
      : "";
    header =
      "Conflicting Allocations - " + this.oProjectDetails.projectCode + header;
    const ref = this.dialogService.open(ConflictAllocationComponent, {
      data: {
        conflictDetail,
        node,
        originalData: this.milestoneData,
        project: this.oProjectDetails.projectCode
      },
      header,
      width: "95vw",
      height: "80vh",
      contentStyle: { height: "80vh", overflow: "auto" },
      closable: false
    });

    ref.onClose.subscribe(async (detail: any) => {
      if (detail.action.toLowerCase() === "save") {
        if (task) {
          const Title =
            task.itemType === "submilestone" && task.milestone
              ? task.milestone + " - " + task.title
              : task.title;
          const msg =
            "Are you sure that you want to Confirm '" + Title + "' milestone ?";
          const conflictMessage = detail.conflictResolved
            ? "" + msg
            : "Conflict unresolved. " + msg;
          await this.setAsNextMilestoneCall(task, conflictMessage);
        } else {
          if (detail.conflictResolved) {
            this.loaderenable = true;
            await this.generateSaveTasks();
          } else {
            const conflictMessage =
              "Conflict unresolved. Do you want to proceed ?";
            await this.commonService
              .confirmMessageDialog(
                "Confirmation",
                conflictMessage,
                null,
                ["Yes", "No"],
                false
              )
              .then(async Confirmation => {
                if (Confirmation === "Yes") {
                  this.loaderenable = true;
                  await this.generateSaveTasks();
                }
              });
          }
        }
      }
    });
  }

  // *************************************************************************************************
  // Save tasks
  // *************************************************************************************************

  async saveTasks() {
    this.disableSave = true;
    if (this.milestoneData.length > 0) {
      const isValid = await this.validateSaveTask();
      if (isValid) {
        this.graphFlag = this.visualgraph;
        this.visualgraph = false;
        this.tableView = false;
        this.loaderenable = true;
        this.sharedObject.resSectionShow = false;
        const currentMilestoneEdited = this.milestoneData.find(
          m => m.data.type === "milestone" && m.data.isCurrent && m.data.edited
        );
        // tslint:disable-next-line: max-line-length
        const conflictDetails: IConflictResource[] = currentMilestoneEdited
          ? await this.conflictAllocation.bindConflictDetails(
            null,
            this.milestoneData,
            [],
            this.sharedObject.oTaskAllocation.oResources
          )
          : [];
        if (conflictDetails.length) {
          this.disableSave = false;
          this.loaderenable = false;
          this.visualgraph =
            this.graphFlag !== undefined ? this.graphFlag : true;
          this.tableView = this.visualgraph ? false : true;
          this.GanttChartView = true;
          this.showConflictAllocations(
            null,
            conflictDetails,
            currentMilestoneEdited
          );
        } else {
          setTimeout(async () => {
            await this.generateSaveTasks();
          }, 300);
        }
      } else {
        this.disableSave = false;
      }
    } else {
      this.disableSave = true;
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please Add Task.",
        false
      );
    }
  }

  getIDFromItem(objItem) {
    let arrData = [];
    if (objItem.hasOwnProperty("results")) {
      arrData = objItem.results.map(a => a.ID);
    }

    return arrData;
  }

  updateResourcesForProject(
    milestoneTask,
    writers,
    arrWriterIDs,
    qualityChecker,
    arrQualityCheckerIds,
    editors,
    arrEditorsIds,
    graphics,
    arrGraphicsIds,
    pubSupport,
    arrPubSupportIds,
    reviewers,
    arrReviewers
  ) {
    if (
      milestoneTask.AssignedTo &&
      milestoneTask.AssignedTo.hasOwnProperty("ID") &&
      milestoneTask.AssignedTo.ID !== -1
    ) {
      // debugger;
      switch (milestoneTask.skillLevel) {
        case 'Writer':
          writers.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrWriterIDs.push(milestoneTask.AssignedTo.ID);
          break;
        case "QC":
          qualityChecker.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrQualityCheckerIds.push(milestoneTask.AssignedTo.ID);
          break;
        case 'Editor':
          editors.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrEditorsIds.push(milestoneTask.AssignedTo.ID);
          break;
        case "Graphics":
          graphics.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrGraphicsIds.push(milestoneTask.AssignedTo.ID);
          break;

        case "Pub Support":
          pubSupport.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrPubSupportIds.push(milestoneTask.AssignedTo.ID);
          break;
        case 'Review':
          reviewers.push({
            ID: milestoneTask.AssignedTo.ID,
            Name: milestoneTask.AssignedTo.Title
          });
          arrReviewers.push(milestoneTask.AssignedTo.ID);
          break;
        default:
          break;
      }
    }
  }

  async setMilestone(
    addTaskItems,
    updateTaskItems,
    addMilestoneItems,
    updateMilestoneItems,
    currentMilestoneTaskUpdated,
    listOfMilestones
  ) {
    let updatedCurrentMilestone = false;
    // tslint:disable-next-line: one-variable-per-declaration
    let writers = [],
      arrWriterIDs = [],
      qualityChecker = [],
      arrQualityCheckerIds = [],
      editors = [],
      arrEditorsIds = [],
      graphics = [],
      arrGraphicsIds = [],
      pubSupport = [],
      arrPubSupportIds = [],
      reviewers = [],
      arrReviewers = [],
      arrPrimaryResourcesIds = [],
      addTasks = [],
      updateTasks = [],
      addMilestones = [],
      updateMilestones = [];
    const projectFolder = this.oProjectDetails.projectFolder;
    this.oProjectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const batchUrl = [];
    arrWriterIDs = this.getIDFromItem(this.oProjectDetails.writer);
    arrReviewers = this.getIDFromItem(this.oProjectDetails.reviewer);
    arrEditorsIds = this.getIDFromItem(this.oProjectDetails.editor);
    arrQualityCheckerIds = this.getIDFromItem(
      this.oProjectDetails.qualityChecker
    );
    arrGraphicsIds = this.getIDFromItem(this.oProjectDetails.graphicsMembers);
    arrPubSupportIds = this.getIDFromItem(
      this.oProjectDetails.pubSupportMembers
    );
    arrPrimaryResourcesIds = this.getIDFromItem(
      this.oProjectDetails.primaryResources
    );

    for (const milestoneTask of addTaskItems) {
      this.updateResourcesForProject(
        milestoneTask,
        writers,
        arrWriterIDs,
        qualityChecker,
        arrQualityCheckerIds,
        editors,
        arrEditorsIds,
        graphics,
        arrGraphicsIds,
        pubSupport,
        arrPubSupportIds,
        reviewers,
        arrReviewers
      );

      addTasks.push(
        await this.setMilestoneTaskForAddUpdate(milestoneTask, true)
      );
    }
    for (const milestoneTask of updateTaskItems) {
      this.updateResourcesForProject(
        milestoneTask,
        writers,
        arrWriterIDs,
        qualityChecker,
        arrQualityCheckerIds,
        editors,
        arrEditorsIds,
        graphics,
        arrGraphicsIds,
        pubSupport,
        arrPubSupportIds,
        reviewers,
        arrReviewers
      );

      updateTasks.push(
        await this.setMilestoneTaskForAddUpdate(milestoneTask, false)
      );
    }

    for (const milestone of addMilestoneItems) {
      addMilestones.push(this.setMilestoneForAddUpdate(milestone, true));
    }

    for (const milestone of updateMilestoneItems) {
      updateMilestones.push(this.setMilestoneForAddUpdate(milestone, false));
    }

    for (const mil of addMilestones) {
      this.commonService.setBatchObject(
        batchUrl,
        mil.url,
        mil.body,
        this.constants.Method.POST,
        this.constants.listNames.Schedules.name
      );
    }

    for (const tasks of addTasks) {
      this.commonService.setBatchObject(
        batchUrl,
        tasks.url,
        tasks.body,
        this.constants.Method.POST,
        this.constants.listNames.Schedules.name
      );
    }

    for (const mil of addMilestoneItems) {
      const folderUrl = projectFolder + "/Drafts/Internal/" + mil.title;
      this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getFolderCreationURL(),
        this.spServices.getFolderCreationData(folderUrl),
        this.constants.Method.POST,
        "Milestone Folder Creation"
      );
    }
    for (const mil of updateMilestones) {
      this.commonService.setBatchObject(
        batchUrl,
        mil.url,
        mil.body,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }
    for (const tasks of updateTasks) {
      this.commonService.setBatchObject(
        batchUrl,
        tasks.url,
        tasks.body,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }

    arrWriterIDs = this.commonService.removeEmptyItems(arrWriterIDs);
    arrEditorsIds = this.commonService.removeEmptyItems(arrEditorsIds);
    arrGraphicsIds = this.commonService.removeEmptyItems(arrGraphicsIds);
    arrQualityCheckerIds = this.commonService.removeEmptyItems(
      arrQualityCheckerIds
    );
    arrReviewers = this.commonService.removeEmptyItems(arrReviewers);
    arrPubSupportIds = this.commonService.removeEmptyItems(arrPubSupportIds);
    arrPrimaryResourcesIds = this.commonService.removeEmptyItems(
      arrPrimaryResourcesIds
    );

    const updatedResources = {
      writer: { results: [...arrWriterIDs] },
      editor: { results: [...arrEditorsIds] },
      graphicsMembers: { results: [...arrGraphicsIds] },
      qualityChecker: { results: [...arrQualityCheckerIds] },
      reviewer: { results: [...arrReviewers] },
      pubSupportMembers: { results: [...arrPubSupportIds] },
      primaryResources: { results: [...arrPrimaryResourcesIds] },
      allDeliveryRes: []
    };

    updatedResources.allDeliveryRes = [
      ...updatedResources.writer.results,
      ...updatedResources.editor.results,
      ...updatedResources.graphicsMembers.results,
      ...updatedResources.qualityChecker.results,
      ...updatedResources.reviewer.results,
      ...updatedResources.pubSupportMembers.results,
      ...updatedResources.primaryResources.results
    ];

    const restructureMilstoneStr =
      listOfMilestones.length > 0 ? listOfMilestones.join(";#") : "";
    const mile = updateMilestoneItems.find(
      c => c.title === this.oProjectDetails.currentMilestone
    ); //.split(' (')[0]
    const task = addTaskItems.filter(
      c => c.milestone === this.oProjectDetails.currentMilestone
    );

    updatedCurrentMilestone = mile && task && task.length ? true : false;
    let projectStatus = this.sharedObject.oTaskAllocation.oProjectDetails
      .status;
    let previousProjectStatus = this.sharedObject.oTaskAllocation
      .oProjectDetails.prevstatus;

    if (
      (updatedCurrentMilestone || currentMilestoneTaskUpdated) &&
      this.sharedObject.oTaskAllocation.oProjectDetails.status ===
      this.constants.STATUS.AUTHOR_REVIEW
    ) {
      await this.commonService
        .confirmMessageDialog(
          "Confirmation",
          "Do you want to keep project in 'Author Review' or 'In Progress' ?",
          null,
          [
            this.constants.STATUS.AUTHOR_REVIEW,
            this.constants.STATUS.IN_PROGRESS
          ],
          false
        )
        .then(async projectstatus => {
          if (projectstatus) {
            projectStatus = projectstatus;
            if (
              projectstatus !==
              this.sharedObject.oTaskAllocation.oProjectDetails.status
            ) {
              previousProjectStatus = this.sharedObject.oTaskAllocation
                .oProjectDetails.status;
            }
            await this.continueSetMilestone(
              restructureMilstoneStr,
              updatedResources,
              batchUrl,
              addMilestones,
              addTasks,
              projectStatus,
              previousProjectStatus
            );
          }
        });
    } else {
      projectStatus = updatedCurrentMilestone
        ? this.constants.STATUS.IN_PROGRESS
        : projectStatus;
      previousProjectStatus = updatedCurrentMilestone
        ? this.sharedObject.oTaskAllocation.oProjectDetails.status
        : previousProjectStatus;
      await this.continueSetMilestone(
        restructureMilstoneStr,
        updatedResources,
        batchUrl,
        addMilestones,
        addTasks,
        projectStatus,
        previousProjectStatus
      );
    }
  }
  // **************************************************************************************************
  // Split because of confirmation message popup
  // this function is continou part of setMilestone
  // **************************************************************************************************
  async continueSetMilestone(
    restructureMilstoneStr,
    updatedResources,
    batchUrl,
    addMilestones,
    addTasks,
    projectStatus,
    previousProjectStatus
  ) {
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "SaveTasksMilestones",
      "POST-BATCH"
    );
    const responseInLines = await this.executeBulkRequests(
      restructureMilstoneStr,
      updatedResources,
      batchUrl,
      projectStatus,
      previousProjectStatus
    );

    for (const mail of this.reallocationMailArray) {
      await this.sendReallocationCentralTaskMail(
        mail.project,
        mail.slot,
        mail.data,
        mail.subject
      );
    }
    for (const mail of this.deallocationMailArray) {
      await this.sendCentralTaskMail(
        mail.project,
        mail.slot.data,
        mail.subject,
        mail.template
      );
    }
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "setMilestone-getProjectResources",
      "GET-BATCH"
    );
    await this.commonService.getProjectResources(
      this.oProjectDetails.projectCode,
      false,
      false
    );
    await this.getMilestones(false);

    this.reloadResources.emit();
  }

  updateClosedTaskObject(milestoneTask) {
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      NextTasks: this.setPreviousAndNext(
        milestoneTask.nextTask,
        milestoneTask.milestone,
        this.oProjectDetails.projectCode
      ),
      PrevTasks: this.setPreviousAndNext(
        milestoneTask.previousTask,
        milestoneTask.milestone,
        this.oProjectDetails.projectCode
      )
    };
  }

  updateTaskObject(milestoneTask) {
    return {
      PreviousAssignedUserId: milestoneTask.previousAssignedUser
        ? milestoneTask.previousAssignedUser
        : -1
    };
  }

  addTaskObject(milestoneTask, slotTaskName) {
    return {
      Title:
        milestoneTask.slotType !== "Both" && milestoneTask.slotType !== "Slot"
          ? this.oProjectDetails.projectCode +
          " " +
          milestoneTask.milestone +
          " " +
          milestoneTask.title
          : this.oProjectDetails.projectCode +
          " " +
          milestoneTask.milestone +
          " " +
          slotTaskName,
      SubMilestones: milestoneTask.submilestone,
      Milestone: milestoneTask.milestone,
      Task: milestoneTask.itemType,
      ProjectCode: this.oProjectDetails.projectCode
    };
  }
  addUpdateTaskObject(milestoneTask) {
    // debugger
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      CommentsMT: milestoneTask.scope,
      StartDate: milestoneTask.start_date,
      DueDateDT: milestoneTask.end_date,
      ExpectedTime: "" + milestoneTask.budgetHours,
      TATStatus:
        milestoneTask.tat === true || milestoneTask.tat === "Yes"
          ? "Yes"
          : "No",
      TATBusinessDays: milestoneTask.tatVal,
      AssignedToId: milestoneTask.AssignedTo
        ? milestoneTask.AssignedTo.hasOwnProperty("ID")
          ? milestoneTask.AssignedTo.ID
          : -1
        : -1,
      TimeZoneNM: +milestoneTask.assignedUserTimeZone,
      Status: milestoneTask.status,
      NextTasks: this.setPreviousAndNext(
        milestoneTask.nextTask,
        milestoneTask.milestone,
        this.oProjectDetails.projectCode
      ),
      PrevTasks: this.setPreviousAndNext(
        milestoneTask.previousTask,
        milestoneTask.milestone,
        this.oProjectDetails.projectCode
      ),
      SkillLevel: milestoneTask.skillLevel,
      IsCentrallyAllocated:
        milestoneTask.slotType === "Both" && milestoneTask.AssignedTo.ID
          ? "No"
          : milestoneTask.IsCentrallyAllocated,
      CentralAllocationDone: milestoneTask.CentralAllocationDone,
      ActiveCA: milestoneTask.ActiveCA,
      DisableCascade: milestoneTask.DisableCascade === true ? "Yes" : "No",
      AllocationPerDay: milestoneTask.allocationPerDay
        ? milestoneTask.allocationPerDay
        : "",
      ContentTypeCH:
        milestoneTask.IsCentrallyAllocated === "Yes"
          ? this.constants.CONTENT_TYPE.SLOT
          : this.constants.CONTENT_TYPE.TASK,
      Reason: milestoneTask.Reason
    };
  }

  async setMilestoneTaskForAddUpdate(milestoneTask, bAdd) {
    let url = "";
    //let data = {};
    if (milestoneTask.status === "Not Saved") {
      if (milestoneTask.isCurrent) {
        milestoneTask.status = "Not Started";
        milestoneTask.assignedUserChanged = true;
      } else {
        milestoneTask.status = "Not Confirmed";
      }
    }
    // send mail for new task for current milestone
    if (
      milestoneTask.assignedUserChanged &&
      milestoneTask.status === "Not Started"
    ) {
      await this.sendMail(this.oProjectDetails, milestoneTask);
      milestoneTask.assignedUserChanged = false;
    }
    // For new slot and current milestone
    if (
      bAdd &&
      milestoneTask.IsCentrallyAllocated === "Yes" &&
      this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
      milestoneTask.milestone
    ) {
      //// send task creation email
      milestoneTask.ActiveCA = "Yes";
      await this.sendCentralTaskMail(
        this.oProjectDetails,
        milestoneTask,
        milestoneTask.title + " Created",
        this.constants.EMAIL_TEMPLATE_NAME.CENTRAL_TASK_CREATION
      );
    }
    let addUpdateTask;
    if (bAdd) {
      const taskCount = milestoneTask.title.match(/\d+$/)
        ? " " + milestoneTask.title.match(/\d+$/)[0]
        : "";
      const slotTaskName = milestoneTask.itemType + taskCount;
      addUpdateTask = this.addUpdateTaskObject(milestoneTask);
      addUpdateTask = Object.assign(
        addUpdateTask,
        this.addTaskObject(milestoneTask, slotTaskName)
      );

      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
    } else {
      if (
        milestoneTask.status !== "Completed" &&
        milestoneTask.status !== "Auto Closed"
      ) {
        addUpdateTask = this.addUpdateTaskObject(milestoneTask);
        addUpdateTask = Object.assign(
          addUpdateTask,
          this.updateTaskObject(milestoneTask)
        );
      } else {
        addUpdateTask = this.updateClosedTaskObject(milestoneTask);
      }
      url = this.spServices.getItemURL(
        this.constants.listNames.Schedules.name,
        +milestoneTask.id
      );
    }

    return {
      body: addUpdateTask,
      url
    };
  }
  // tslint:disable
  setPreviousAndNext(sText, sMilestone, sProject) {
    let sVal = "";

    if (sText) {
      const arrVal = sText.split(";");
      const arrNewVal = [];
      for (var val of arrVal) {
        arrNewVal.push(sProject + " " + sMilestone + " " + val);
      }

      sVal = arrNewVal.join(";#");
    }

    return sVal;
  }
  addMilestoneObject(currentMilestone) {
    return {
      ProjectCode: this.oProjectDetails.projectCode,
      Title: currentMilestone.title,
      ContentTypeCH: this.constants.CONTENT_TYPE.MILESTONE
    };
  }
  addUpdateMilestoneObject(
    currentMilestone,
    milestoneStartDate,
    milestoneEndDate
  ) {
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: milestoneStartDate,
      Actual_x0020_End_x0020_Date: milestoneEndDate,
      StartDate: milestoneStartDate,
      DueDateDT: milestoneEndDate,
      ExpectedTime: "" + currentMilestone.budgetHours,
      Status:
        currentMilestone.status === "Not Saved"
          ? currentMilestone.isCurrent
            ? "Not Started"
            : "Not Confirmed"
          : currentMilestone.status,
      TATBusinessDays: currentMilestone.tatBusinessDays,
      SubMilestones: currentMilestone.submilestone
    };
  }

  setMilestoneForAddUpdate(sentMilestone, bAdd) {
    let currentMilestone = sentMilestone;
    let url = "";
    let data;
    const milestoneStartDate = new Date(currentMilestone.start_date);
    const milestoneEndDate = new Date(currentMilestone.end_date);
    currentMilestone.tatBusinessDays = this.commonService.calcBusinessDays(
      milestoneStartDate,
      milestoneEndDate
    );

    if (currentMilestone.status !== "Deleted") {
      const getCurrentMilestone = this.milestoneData.find(
        e => e.data.id === currentMilestone.id
      );
      currentMilestone.submilestone = this.getSubMilestoneStatus(
        getCurrentMilestone,
        ""
      );
    }
    if (bAdd) {
      data = this.addUpdateMilestoneObject(
        currentMilestone,
        milestoneStartDate,
        milestoneEndDate
      );
      data = Object.assign(data, this.addMilestoneObject(currentMilestone));
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
    } else {
      data = this.addUpdateMilestoneObject(
        currentMilestone,
        milestoneStartDate,
        milestoneEndDate
      );
      url = this.spServices.getItemURL(
        this.constants.listNames.Schedules.name,
        +currentMilestone.id
      );
    }
    return {
      body: data,
      url,
      Title: currentMilestone.title
    };
  }

  // executing bulk batch requests
  async executeBulkRequests(
    restructureMilstoneStr,
    updatedResources,
    batchUrl,
    projectStatus,
    previousProjectStatus
  ) {
    let updateProjectRes = {};
    const projectID = this.oProjectDetails.projectID;
    let currentMilestone = this.oProjectDetails.currentMilestone;
    const isCurrentMilestoneDeleted = this.oProjectDetails.allMilestones.find(
      m => m === currentMilestone
    )
      ? false
      : true;
    if (isCurrentMilestoneDeleted) {
      const newCurrentMilestoneIndex = this.oProjectDetails.allOldMilestones.findIndex(
        t => t === currentMilestone
      );
      currentMilestone =
        newCurrentMilestoneIndex > 0
          ? this.oProjectDetails.allOldMilestones[newCurrentMilestoneIndex - 1]
          : "";
    }
    updateProjectRes = {
      __metadata: { type: this.constants.listNames.ProjectInformation.type },
      WritersId: { results: updatedResources.writer.results },
      ReviewersId: { results: updatedResources.reviewer.results },
      EditorsId: { results: updatedResources.editor.results },
      AllDeliveryResourcesId: { results: updatedResources.allDeliveryRes },
      QCId: { results: updatedResources.qualityChecker.results },
      GraphicsMembersId: { results: updatedResources.graphicsMembers.results },
      PSMembersId: { results: updatedResources.pubSupportMembers.results },
      Milestones: restructureMilstoneStr,
      Milestone: currentMilestone,
      Status: projectStatus,
      PrevStatus: previousProjectStatus
    };

    this.commonService.setBatchObject(
      batchUrl,
      this.spServices.getItemURL(
        this.constants.listNames.ProjectInformation.name,
        +projectID
      ),
      updateProjectRes,
      this.constants.Method.PATCH,
      this.constants.listNames.ProjectInformation.name
    );

    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "updateProjectInfo",
      "POST"
    );
    let response = await this.spServices.executeBatch(batchUrl);
    response = response.length ? response.map(a => a.retItems) : [];
    return response;
  }

  // *************************************************************************************************
  //  Send Email On Task
  // **************************************************************************************************

  async sendMail(projectDetails, milestoneTask) {
    if (
      milestoneTask.AssignedTo &&
      milestoneTask.AssignedTo.hasOwnProperty("ID") &&
      milestoneTask.AssignedTo.ID &&
      milestoneTask.AssignedTo.ID !== -1
    ) {
      const fromUser = this.sharedObject.currentUser;
      const user = milestoneTask.AssignedTo;
      const mailSubject =
        projectDetails.projectCode +
        "(" +
        projectDetails.wbjid +
        ")" +
        ": Task created";
      const objEmailBody = await this.getsendEmailObjBody(
        milestoneTask,
        projectDetails,
        "Email",
        this.constants.EMAIL_TEMPLATE_NAME.TASK_CREATION
      );
      const arrayTo = [];

      if (user !== "SelectOne" && user !== "" && user != null) {
        const userEmail = user.UserNamePG
          ? user.UserNamePG.EMail
          : user.EMail
            ? user.EMail
            : user.Email;
        arrayTo.push(userEmail);
      }
      const to = arrayTo.join(",").trim();
      if (to) {
        this.commonService.SetNewrelic(
          "TaskAllocation",
          "Timeline",
          "sendMails",
          "POST"
        );
        await this.spServices.sendMail(
          to,
          fromUser.email,
          mailSubject,
          objEmailBody
        );
      }
    }
  }

  // *************************************************************************************************
  //  Send Email On Central Task
  // **************************************************************************************************

  async sendCentralTaskMail(
    projectDetails,
    milestoneTask,
    subjectLine,
    templateName
  ) {
    const fromUser = this.sharedObject.currentUser;
    const mailSubject =
      projectDetails.projectCode +
      "(" +
      projectDetails.wbjid +
      ")" +
      ": " +
      subjectLine;
    const objEmailBody = await this.getsendEmailObjBody(
      milestoneTask,
      projectDetails,
      "CentralTaskMail",
      templateName
    );
    const arrayTo = [];
    const users = this.sharedObject.oTaskAllocation.oCentralGroup;
    for (const user of users) {
      arrayTo.push(user.Email);
    }
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "sendCentralTaskMail",
      "POST"
    );
    await this.spServices.sendMail(
      arrayTo.join(","),
      fromUser.email,
      mailSubject,
      objEmailBody
    );
  }

  async sendReallocationCentralTaskMail(
    projectDetails,
    slot,
    data,
    subjectLine
  ) {
    const fromUser = this.sharedObject.currentUser;
    const mailSubject =
      projectDetails.projectCode +
      "(" +
      projectDetails.wbjid +
      ")" +
      ": " +
      subjectLine;
    const objEmailBody = await this.getReallocateEmailObjBody(
      data,
      slot,
      "ReallocationSlotNotification"
    );
    const arrayTo = [];
    const users = this.sharedObject.oTaskAllocation.oCentralGroup;
    for (const user of users) {
      arrayTo.push(user.Email);
    }
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "sendReallocationCentralTaskMail",
      "POST"
    );
    await this.spServices.sendMail(
      arrayTo.join(","),
      fromUser.email,
      mailSubject,
      objEmailBody
    );
  }

  // *************************************************************************************************
  //  Get Email Body
  // **************************************************************************************************

  async getsendEmailObjBody(
    milestoneTask,
    projectDetails,
    EmailType,
    templateName
  ) {
    const mailObj = Object.assign(
      {},
      this.taskAllocationService.common.getMailTemplate
    );
    mailObj.filter = mailObj.filter.replace("{{templateName}}", templateName);
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "timeline-getsendEmailObjBody",
      "GET"
    );
    const templateData = await this.spServices.readItems(
      this.constants.listNames.MailContent.name,
      mailObj
    );
    let mailContent = templateData.length > 0 ? templateData[0].ContentMT : [];
    mailContent = this.replaceContent(
      mailContent,
      "@@Val3@@",
      EmailType === "Email"
        ? milestoneTask.AssignedTo
          ? milestoneTask.AssignedTo.Title
          : undefined
        : "Team"
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val1@@",
      projectDetails.projectCode
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val2@@",
      milestoneTask.submilestone && milestoneTask.submilestone !== "Default"
        ? projectDetails.projectCode +
        " " +
        milestoneTask.milestone +
        " " +
        milestoneTask.title +
        " - " +
        milestoneTask.submilestone
        : projectDetails.projectCode +
        " " +
        milestoneTask.milestone +
        " " +
        milestoneTask.title
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val4@@",
      milestoneTask.itemType
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val5@@",
      milestoneTask.milestone
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val6@@",
      this.datepipe.transform(
        milestoneTask.start_date,
        "MMM dd yyyy hh:mm:ss a"
      )
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val7@@",
      this.datepipe.transform(milestoneTask.end_date, "MMM dd yyyy hh:mm:ss a")
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val9@@",
      milestoneTask.scope ? milestoneTask.scope : ""
    );
    return mailContent;
  }

  async getReallocateEmailObjBody(data, slot, templateName) {
    const mailObj = Object.assign(
      {},
      this.taskAllocationService.common.getMailTemplate
    );
    mailObj.filter = mailObj.filter.replace("{{templateName}}", templateName);
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "timeline-getReallocateEmailObjBody",
      "GET"
    );
    const templateData = await this.spServices.readItems(
      this.constants.listNames.MailContent.name,
      mailObj
    );
    let mailContent = templateData.length > 0 ? templateData[0].ContentMT : [];
    mailContent = this.replaceContent(
      mailContent,
      "@@Val1@@",
      slot.data.taskFullName
    );
    mailContent = this.replaceContent(mailContent, "@@ValTable@@", data);

    return mailContent;
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, "g"), value);
  }

  /***********************************************************************/
  ////// Save tasks section

  /**********************************************************************/

  getUpdatedStatus(element, allTasks) {
    const mil = allTasks.find(e => e.taskFullName === element.milestone);
    let status = "";
    if (element.submilestone) {
      const subMil = allTasks.find(
        e =>
          e.milestone === element.milestone &&
          e.submilestone === element.submilestone
      );
      status =
        subMil.status === "In Progress"
          ? "Not Started"
          : subMil.status === "Not Saved"
            ? mil.isCurrent
              ? "Not Started"
              : "Not Confirmed"
            : element.status;
    } else {
      status = mil.status === "In Progress" ? "Not Started" : element.status;
    }

    return status;
  }

  updateCurrentItemID(objList, obj) {
    let deletedObj = objList.find(
      t => t.Title === obj.taskFullName && t.Status === "Deleted"
    );
    if (deletedObj) {
      obj.id = deletedObj.ID;
      obj.added = false;
    }
  }
  addedUpdatedList(
    element,
    addedList,
    updatedList,
    bTask,
    currentMilTaskUpdated,
    allTasks
  ) {
    if (element.added) {
      if (bTask) {
        const status = this.getUpdatedStatus(element, allTasks);
        element.status = status;
      }
      addedList.push(element);
    } else {
      if (bTask) {
        const isCurrent =
          element.milestone ===
            this.sharedObject.oTaskAllocation.oProjectDetails.milestone
            ? true
            : false;
        if (isCurrent && element.itemType !== "Client Review") {
          currentMilTaskUpdated = true;
        }
      }
      updatedList.push(element);
    }

    return currentMilTaskUpdated;
  }

  getMilTaskData(
    addedTasks,
    updatedTasks,
    addedMilestones,
    updatedMilestones,
    listOfMilestones
  ) {
    let currentMilTaskUpdated = false;
    let allTasks = this.getGanttTasksFromMilestones(this.milestoneData, true);
    const allTasksItem = allTasks.filter(e => e.type !== "submilestone");
    allTasksItem.forEach(element => {
      if (element.type === "milestone") {
        listOfMilestones.push(element.title);
      }
      if (element.edited) {
        if (
          element.type === "milestone" &&
          element.status !== "Completed" &&
          element.status !== "Auto Closed"
        ) {
          this.updateCurrentItemID(this.deletedMilestones, element);
          currentMilTaskUpdated = this.addedUpdatedList(
            element,
            addedMilestones,
            updatedMilestones,
            false,
            currentMilTaskUpdated,
            allTasks
          );
        } else {
          this.updateCurrentItemID(this.allTasks, element);
          currentMilTaskUpdated = this.addedUpdatedList(
            element,
            addedTasks,
            updatedTasks,
            true,
            currentMilTaskUpdated,
            allTasks
          );
        }
      }
    });
    return currentMilTaskUpdated;
  }

  public generateSaveTasks() {
    const listOfMilestones = [],
      addedTasks = [],
      updatedTasks = [],
      addedMilestones = [],
      updatedMilestones = [];
    let currentMilestoneTaskUpdated = this.getMilTaskData(
      addedTasks,
      updatedTasks,
      addedMilestones,
      updatedMilestones,
      listOfMilestones
    );
    this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones = listOfMilestones;
    this.getDeletedMilestoneTasks(updatedTasks, updatedMilestones);
    this.setMilestone(
      addedTasks,
      updatedTasks,
      addedMilestones,
      updatedMilestones,
      currentMilestoneTaskUpdated,
      listOfMilestones
    );
  }

  markTaskDeleted(element) {
    const task = element;
    task.nextTask = "";
    task.previousTask = "";
    task.status = "Deleted";

    return task;
  }

  // tslint:enable
  getDeletedMilestoneTasks(updatedTasks, updatedMilestones) {
    let oldMilestoneData = this.getGanttTasksFromMilestones(
      this.milestoneDataCopy,
      true
    );
    oldMilestoneData = oldMilestoneData.filter(
      e =>
        e.type !== "submilestone" ||
        (e.status !== "Completed" && e.status !== "Deleted")
    );
    const newMilestoneData = this.getGanttTasksFromMilestones(
      this.milestoneData,
      false
    );
    oldMilestoneData.forEach(element => {
      if (element.status !== "Completed" && element.status !== "Deleted") {
        const itemDeleted = newMilestoneData.find(e => e.id === element.id);
        if (!itemDeleted) {
          if (element.type === "milestone") {
            element.status = "Deleted";
            updatedMilestones.push(element);
          } else if (!element.parentSlot) {
            let task = this.markTaskDeleted(element);
            if (task.IsCentrallyAllocated === "Yes") {
              task.IsCentrallyAllocated = "No";
              task.ActiveCA = "No";
              task.CentralAllocationDone = "No";

              const subTasks = oldMilestoneData.filter(
                e => e.parentSlot === element.id
              );
              subTasks.forEach(subEle => {
                const subTask = this.markTaskDeleted(subEle);
                updatedTasks.push(subTask);
              });
            }
            updatedTasks.push(task);
          }
        } else if (element.type === "milestone") {
          const milestoneReturn = this.milestoneData.find(
            dataEl => dataEl.data.id === element.id
          );
          const existMilReturn = this.milestoneDataCopy.find(
            dataEl => dataEl.data.id === element.id
          );

          const newSub = this.getSubMilestoneStatus(milestoneReturn, "");
          const existingSub = this.getSubMilestoneStatus(existMilReturn, "");

          if (
            newSub !== existingSub &&
            !updatedMilestones.find(e => e.id === element.id)
          ) {
            updatedMilestones.push(element);
          }
        }
      }
    });
  }

  // ************************************************************************************************
  // Milestone Validation
  // ************************************************************************************************
  validationsForActive(checkTasks) {
    checkTasks = checkTasks.filter(t => !t.parentSlot);
    checkTasks = checkTasks.filter(objt => {
      return objt.status !== "Deleted" && objt.status !== "Abandon";
    });

    //////// Check if all tasks are allocated
    const task = checkTasks.find(
      element =>
        !element.AssignedTo || (element.AssignedTo && !element.AssignedTo.Title)
    );
    if (task) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "All tasks should be assigned to either a resource or skill before setting the milestone / submilestone - " +
        task.title,
        false
      );
      return false;
    }
    /////// Check if all are assigned more than zero budget hrs
    // tslint:disable
    const checkTaskAllocatedTime = checkTasks.find(
      e =>
        (e.budgetHours === "" || +e.budgetHours <= 0) &&
        e.itemType !== "Send to client" &&
        e.itemType !== "Client Review" &&
        e.itemType !== "Follow up" &&
        e.status !== "Completed"
    );
    // tslint:enable
    if (checkTaskAllocatedTime) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Allocated time for task cannot be equal or less than 0 for " +
        checkTaskAllocatedTime.title,
        false
      );
      return false;
    }

    //////// Check if end time is greater than start time of the task
    const compareDates = checkTasks.find(
      e =>
        e.end_date <= e.start_date &&
        e.tat === false &&
        e.itemType !== "Follow up" &&
        e.status !== "Completed" &&
        e.itemType !== "Send to client"
    );
    if (compareDates) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "End time should be greater than start time for " + compareDates.title,
        false
      );
      return false;
    }

    ////// Check if the dates are correct for the cascade perspective
    const errorPresnet = this.validateTaskDates(checkTasks);
    if (errorPresnet) {
      return false;
    }
    return true;
  }

  async validateSaveTask() {
    const projectBudgetHours = this.oProjectDetails.budgetHours;
    const milestonesData = this.milestoneData;

    if (this.oProjectDetails.isPubSupport == 'Yes') {
      const currentMilestone = this.milestoneData.find(m => m.data.type == 'milestone' && m.data.isCurrent && m.data.edited);
      let allTasks = [];
      if (currentMilestone) {
        if (currentMilestone.data.subMilestonePresent) {
          currentMilestone.children.forEach(element => {
            allTasks = [...allTasks, ...this.taskAllocateCommonService.getTasksFromMilestones(element, false, this.milestoneData, false)];
          });
        } else {
          allTasks = this.taskAllocateCommonService.getTasksFromMilestones(currentMilestone, false, this.milestoneData, false);
        }
        const validPubSupportTask = await this.checkForPubSupportTasks(allTasks);
        if (!validPubSupportTask) {
          return false;
        }
      }
    }

    const allMilestones = milestonesData
      .filter(c => c.data.type === "milestone" && c.data.status !== "Deleted")
      .map(c => c.data);
    const milestoneBudgetHrs = allMilestones.reduce(
      (a, b) => a + +b.budgetHours,
      0
    );
    if (projectBudgetHours < milestoneBudgetHrs) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Sum of milestone budget hours cannot be greater than project budget hours.",
        false
      );
      return false;
    }
    const tempMilestones = allMilestones.filter(
      e => e.status !== "Completed" && e.status !== "Deleted"
    );
    const checkMilestoneAllocatedTime = tempMilestones.find(
      e => e.budgetHours === "" || +e.budgetHours <= 0
    );
    if (checkMilestoneAllocatedTime) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Budget hours for " +
        checkMilestoneAllocatedTime.title +
        " milestone cannot be less than or equal to 0",
        false
      );
      return false;
    }
    let previousNode;
    const activeMilestones = milestonesData.filter(
      t => t.data.status !== "Completed" && t.data.status !== "Deleted"
    );

    for (const milestone of activeMilestones) {
      let bSubMilPresent = false;
      const AllTasks = this.taskAllocateCommonService.getTasksFromMilestones(
        milestone,
        false,
        this.milestoneData,
        false
      );

      let validateDates = AllTasks.filter(
        t =>
          t.status !== "Abandon" &&
          t.status !== "Completed" &&
          t.status !== "Auto Closed" &&
          t.itemType !== "Adhoc"
      );

      let validateCurrentTask = validateDates.find(
        t =>
          new Date(t.pUserStart).getDay() == 0 ||
          new Date(t.pUserStart).getDay() == 6 ||
          new Date(t.pUserEnd).getDay() == 0 ||
          new Date(t.pUserEnd).getDay() == 6
      );

      if (validateCurrentTask) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          'Start date / End date of ' + validateCurrentTask.title + ' task in ' + validateCurrentTask.milestone + ' is on Saturday / Sunday so please change',
          false
        );
        return false;
      }
      const bTask = this.validateTask(validateDates);
      if (!bTask) {
        return false;
      }
      if (milestone.data.status === "In Progress") {
        const zeroItem =
          milestone.children && milestone.children.length
            ? milestone.children[0].data
            : milestone.data;
        if (zeroItem.itemType === "submilestone") {
          bSubMilPresent = true;
        }
        let checkTasks = [];
        if (bSubMilPresent) {
          milestone.children.forEach(element => {
            if (
              element.data.status === "In Progress" &&
              element.data.itemType === "submilestone"
            ) {
              checkTasks = checkTasks.concat(
                this.taskAllocateCommonService.getTasksFromMilestones(
                  element,
                  false,
                  this.milestoneData,
                  false
                )
              );
            }
          });
        } else {
          checkTasks = AllTasks.filter(
            t =>
              t.status !== "Abandon" &&
              t.status !== "Completed" &&
              t.status !== "Not Confirmed" &&
              t.itemType !== "Adhoc"
          );
        }

        await this.alertResourceLeave(checkTasks);
        const isValid = this.validationsForActive(checkTasks);
        if (!isValid) {
          return false;
        }
      }
      // previousNode - Milestone
      // milestone.data. - client review
      if (
        previousNode !== undefined &&
        previousNode.status !== "Completed" &&
        new Date(previousNode.end_date).getTime() >
        new Date(milestone.data.start_date).getTime()
      ) {
        let errormessage = previousNode.milestone + " Client Review";
        if (previousNode.title !== "Client Review") {
          errormessage = previousNode.title;
        }

        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Start Date of " +
          milestone.data.title +
          " should be greater than end date of " +
          errormessage,
          false
        );
        return false;
      }

      const milestoneTasksRelink = AllTasks.filter(
        t => t.status !== "Abandon" && t.itemType !== "Adhoc"
      );
      if (milestoneTasksRelink.length > 0) {
        this.linkScToClientReview(milestoneTasksRelink);
      }
      const isSaveValid = this.validateAllocationString(AllTasks);
      if (!isSaveValid) {
        return false;
      }
      previousNode = milestone.data;
    }

    let validTransition = await this.isWriterReviewTransition(this.transitionMil,milestonesData);
    if (!validTransition.valid) {
      this.transitionMil = validTransition.data ? validTransition.data : [];
      return false;
    }

    return true;
  }

  async alertResourceLeave(allTasks) {
    const arrMsgs = [];
    for (const task of allTasks) {
      const resource = this.sharedObject.oTaskAllocation.oResources.filter(
        objt => {
          return (
            task.AssignedTo && task.AssignedTo.ID === objt.UserNamePG.ID
          );
        }
      );
      this.leaveAlertMsgs = await this.calcLeaveMsgs(resource, task, this.leaveAlertMsgs);
    }
    this.displayLeaveMsgs(this.leaveAlertMsgs);
  }

  displayLeaveMsgs(leaveMsgs) {
    setTimeout(() => {
      const alertMsg = [];
      for (const resource of leaveMsgs) {
        alertMsg.push(resource.resource + " is on leave on " + resource.allLeaves.join(','));
      }
      if (alertMsg.length) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.info,
          alertMsg.join('\n'),
          true
        );
      }
    }, 100);
  }

  async checkForPubSupportTasks(allTasks) {
    const allowedTasks = ['Journal Requirement', 'Galley', "GalleySlot", 'Submission Pkg', 'Submit', 'SubmitSlot'];
    const status = ['Completed', 'Auto Closed'];
    for (const index in allTasks) {
      if (allTasks.hasOwnProperty(index)) {
        // let taskTitle = allTasks[index].slotType == 'Slot' ?  allTasks[index].title.split(' ')[0] :  allTasks[index].title;
        if (allowedTasks.includes(allTasks[index].itemType) && !status.includes(allTasks[index].status)) {
          const batchUrl = [];
          let jcGalleyObj;
          let jcsubmitObj;
          let jcSubObj;
          let jcReqObj;
          switch (allTasks[index].itemType) {

            case 'Submission Pkg':
              jcSubObj = Object.assign({}, this.queryConfig);
              jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.taskAllocationService.myDashboardComponent.SubmissionPkg);
              jcSubObj.url = jcSubObj.url.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{StatusResubmit}}/gi, 'Resubmit to same journal');
              jcSubObj.listName = this.constants.listNames.JournalConf.name;
              jcSubObj.type = 'GET';
              batchUrl.push(jcSubObj);
              break;
            case 'Galley':
            case 'GalleySlot':
              jcGalleyObj = Object.assign({}, this.queryConfig);
              jcGalleyObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.taskAllocationService.myDashboardComponent.Submit);
              jcGalleyObj.url = jcGalleyObj.url.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
              jcGalleyObj.listName = this.constants.listNames.JournalConf.name;
              jcGalleyObj.type = 'GET';
              batchUrl.push(jcGalleyObj);
              break;
            case 'Submit':
            case 'SubmitSlot':
              jcsubmitObj = Object.assign({}, this.queryConfig);
              jcsubmitObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.taskAllocationService.myDashboardComponent.Submit);
              jcsubmitObj.url = jcsubmitObj.url.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{Status1}}/gi, 'Resubmit to same journal');
              jcsubmitObj.listName = this.constants.listNames.JournalConf.name;
              jcsubmitObj.type = 'GET';
              batchUrl.push(jcsubmitObj);
              break;
            case 'Journal Requirement':
              jcReqObj = Object.assign({}, this.queryConfig);
              jcReqObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.taskAllocationService.myDashboardComponent.JournalRequirement);
              jcReqObj.url = jcReqObj.url.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode);
              jcReqObj.listName = this.constants.listNames.JournalConf.name;
              jcReqObj.type = 'GET';
              batchUrl.push(jcReqObj);
              break;
          }

          let result = await this.spServices.executeBatch(batchUrl);
          let response = result.length > 0 ? result.map(a => a.retItems) : [];
          let jcSubId = '';
          let jcId = '';
          if (response.length > 0) {
            switch (allTasks[index].itemType) {
              case 'Submission Pkg':
                jcSubId = response[0].length > 0 ? response[0][0].ID : 0;
                if (!jcSubId) {
                  this.commonService.showToastrMessage(
                    this.constants.MessageType.error,
                    'Submission Pkg cant be plotted as PubSupportStatus is not Selected or Resubmit to same journal',
                    false
                  );
                  return false;
                }
                break;
              case 'Galley':
              case 'GalleySlot':
                jcId = response[0].length > 0 ? response[0][0].ID : 0
                if (!jcId) {
                  this.commonService.showToastrMessage(
                    this.constants.MessageType.error,
                    'Galley / GalleySlot cant be plotted as PubSupportStatus is not Accepted or Galleyed',
                    false
                  );
                  return false;
                }
                break;
              case 'Submit':
              case 'SubmitSlot':
                jcId = response[0].length > 0 ? response[0][0].ID : 0;
                if (!jcId) {
                  this.commonService.showToastrMessage(
                    this.constants.MessageType.error,
                    'Submit / SubmitSlot cant be plotted as PubSupportStatus is not Selected or Resubmit to same journal',
                    false
                  );
                  return false;
                }
                break;
              case 'Journal Requirement':
                jcId = response[0].length > 0 ? response[0][0].ID : 0;
                if (!jcId) {
                  this.commonService.showToastrMessage(
                    this.constants.MessageType.error,
                    'Journal Requirement cant be plotted as Journal Information is not added',
                    false
                  );
                  return false;
                }
                break;
            }
          }
        }
      }
    }
    return true;
  }

  async isWriterReviewTransition(mil,milestoneData) {
    let writeTransition = false;
    let reviewTransition = false;
    let milestones: any = [];
    let allMilestones = milestoneData.filter(m=>m.data.type == 'milestone').map(e=> e.data.title);
    let allResources = this.sharedObject.oTaskAllocation.oResources;
    let addedMilestone = milestoneData.filter(m => m.data.type == 'milestone' && m.data.edited); 

      if(addedMilestone.length) {
        if(!mil.length) {
          addedMilestone.forEach((ele)=>{
            let alltasks = this.taskAllocateCommonService.getTasksFromMilestones(ele, false, milestoneData, false)
            if(alltasks.filter(t => (t.itemType == 'Write' || t.itemType == 'Review-Write') && t.edited).length) {
              milestones.push({milestone:ele.data.title, milestoneArray:ele});
            }
          })
        } else {
          if(!this.transitionCancel) {
            mil.shift();
          }
          milestones = mil;
        }
  
        let transitionMilestone =  milestones.length ? milestones[0] : {};
  
        let prevMilestone = allMilestones.length && transitionMilestone ? milestoneData.find(m => m.data.title == allMilestones[allMilestones.indexOf(transitionMilestone.milestone) -1]) : {};
        let prevMilestoneTasks = prevMilestone ? this.taskAllocateCommonService.getTasksFromMilestones(prevMilestone, false, milestoneData, false) : [];
        let prevWriteTasks = prevMilestoneTasks.length ? prevMilestoneTasks.filter(t=> t.itemType == 'Write') : [];
        let prevReviewTasks = prevMilestoneTasks.length ? prevMilestoneTasks.filter(t=> t.itemType == 'Review-Write') : [];
        let writers = Array.from(new Set(prevWriteTasks.map(e=> e.AssignedTo).map(t => t.ID)))
        .map(id => {
          return prevWriteTasks.map(e=> e.AssignedTo).find(t => t.ID === id)
        });
        let reviewers = Array.from(new Set(prevReviewTasks.map(e=> e.AssignedTo).map(t => t.ID)))
        .map(id => {
          return prevReviewTasks.map(e=> e.AssignedTo).find(t => t.ID === id)
        });


        let addedMilestoneTasks = Object.keys(transitionMilestone).length ? this.taskAllocateCommonService.getTasksFromMilestones(transitionMilestone.milestoneArray, false, milestoneData, false) : [];
      
        let newAddedWriteTasks = addedMilestoneTasks.length ? addedMilestoneTasks.filter(t=> t.itemType == 'Write') : [];   
        let newAddedReviewTasks = addedMilestoneTasks.length ? addedMilestoneTasks.filter(t=> t.itemType == 'Review-Write') : []

        if(prevWriteTasks.length && newAddedWriteTasks.length) {
          newAddedWriteTasks.forEach((a,index)=>{
            writeTransition = (!writers.some(e=> e.ID == a.AssignedTo.ID) && allResources.some(r=> r.UserNamePG.ID == a.AssignedTo.ID) && (a.Reason=="" || a.Reason==undefined));
            if(!writeTransition && index > -1) {
              newAddedWriteTasks.splice(index, 1);
            }
          })
        }

        if(prevReviewTasks.length && newAddedReviewTasks.length) {
          newAddedReviewTasks.forEach((a,index)=>{
            reviewTransition = (!reviewers.some(e=> e.ID == a.AssignedTo.ID) && allResources.some(r=> r.UserNamePG.ID == a.AssignedTo.ID) && (a.Reason=="" || a.Reason==undefined));
            if(!reviewTransition && index > -1) {
              newAddedReviewTasks.splice(index, 1);
            }
          })
        }
      
        if(writeTransition || reviewTransition) {
          const ref = this.dialogService.open(WriterReviewTransitionComponent, {
          data: {
            milestoneData,
            newAddedWriteTasks,
            newAddedReviewTasks,
            writeTransition,
            reviewTransition,
            transitionMilestone
          },
            width: "85vw",
            header:
              "Writer and Review Transition",
            contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
            closable: false
          });
          ref.onClose.subscribe(async (updatedMilestones: any) => {
            if(updatedMilestones) {
              this.transitionCancel = false;
              this.milestoneData = updatedMilestones.milestoneData;
              if(milestones.length == 1) { 
                milestones = [];
                this.transitionCancel = false;
                this.transitionMil = [];
                this.disableSave = true;
                await this.generateSaveTasks();
              }
            } else {
              this.transitionCancel = true;
            }
          }); 
        }
      }
      return (writeTransition || reviewTransition) ? { data: milestones, valid:false} : {valid:true};
  }


  validateAllocationString(checkTasks) {
    //////// check if multiple days task have allocationperday string
    const errorTasks = checkTasks.filter(t => t.edited && t.itemType !== 'Client Review' && t.itemType !== 'Send to client'
      && !t.parentSlot && t.slotType === 'Task' && t.status !== 'Abandon' && t.status !== 'Completed' && t.status !== 'Auto Closed'
      && t.status !== 'Deleted' && t.itemType !== 'Adhoc'
      && new Date(t.pUserStartDatePart).getTime() !== new Date(t.pUserEndDatePart).getTime()
      && !t.allocationPerDay && +t.budgetHours
      && t.AssignedTo && t.AssignedTo.ID && t.AssignedTo.ID !== -1);
    if (errorTasks.length) {
      const tasks = errorTasks.map(t => t.title).join(", ");
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Error occured for tasks " +
        tasks +
        ". Please try reset budget hours and save again.",
        false
      );
      return false;
    }
    return true;
  }

  linkScToClientReview(milestoneTasks) {
    milestoneTasks
      .filter(
        c =>
          c.itemType === "Send to client" &&
          c.nextTask &&
          c.nextTask === "Client Review"
      )
      .forEach(sc => {
        sc.nextTask = null;
        sc.edited = true;
      });
    const latestSCDate = new Date(
      Math.max.apply(
        null,
        milestoneTasks
          .filter(c => c.itemType === "Send to client")
          .map(c => c.pUserEnd)
      )
    );

    const latestSC = milestoneTasks.find(
      c =>
        c.itemType === "Send to client" &&
        new Date(c.pUserEnd).getTime() === latestSCDate.getTime()
    );

    const crTask = milestoneTasks.find(c => c.itemType === "Client Review");

    if (latestSC && crTask) {
      latestSC.nextTask = crTask ? crTask.title : null;
      crTask.previousTask = latestSC ? latestSC.title : null;
    }
  }

  validateTaskDates(allTasks) {
    let errorPresnet = false;
    const taskCount = allTasks.length;
    for (let i = 0; i < taskCount; i = i + 1) {
      const task = allTasks[i];
      if (
        task.nextTask &&
        task.status !== "Completed" &&
        task.status !== "Auto Closed" &&
        task.status !== "Deleted"
      ) {
        const nextTasks = task.nextTask.split(";");
        const allNextTasks = allTasks.filter(
          c => nextTasks.indexOf(c.title) > -1
        );

        const conflictTask = allNextTasks.find(
          c =>
            task.end_date > c.start_date &&
            c.status !== "Completed" &&
            c.status !== "Auto Closed" &&
            c.status !== "Deleted" &&
            c.DisableCascade === false
        ); //// Change allow start to disable cascade
        if (conflictTask) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.warn,
            "Start Date of " +
            conflictTask.title +
            "  should be greater than end date of " +
            task.title +
            " in " +
            task.milestone,
            false
          );
          errorPresnet = true;
          break;
        }
      }
    }
    return errorPresnet;
  }

  validateNextMilestone(subMile) {
    if (
      subMile.type === "milestone" &&
      (subMile.budgetHours === "" || +subMile.budgetHours <= 0)
    ) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Budget hours for " +
        subMile.title +
        " milestone cannot be less than or equal to 0",
        false
      );
      return false;
    }
    let currMilTasks = this.taskAllocateCommonService.getTasksFromMilestones(
      subMile,
      false,
      this.milestoneData,
      false
    );
    return this.validationsForActive(currMilTasks);
  }

  async setAsNextMilestoneCall(task, msg) {
    await this.commonService.confirmMessageDialog('Confirmation', msg, null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        //this.selectedSubMilestone = task;
        let isValid;
        if (this.oProjectDetails.isPubSupport == 'Yes') {
          let currMilTasks = this.taskAllocateCommonService.getTasksFromMilestones(
            task,
            false,
            this.milestoneData,
            false
          );
          isValid = await this.checkForPubSupportTasks(currMilTasks);
        } else {
          isValid = true;
        }
        if (isValid) {
          const validateNextMilestone = this.validateNextMilestone(task);
          if (validateNextMilestone) {
            this.loaderenable = true;
            // setTimeout(async () => {
            await this.setAsNextMilestone(task);
            // }, 200);
          }
        }
      }
    });
  }

  async setAsNextMilestone(subMile) {
    const batchUrl = [];
    const projectID = this.oProjectDetails.projectID;
    let bSubMilNew = false;
    let bCurrentMilestoneUpdated = false;
    if (subMile.type === "submilestone"
      && subMile.milestone === this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone) {
      bCurrentMilestoneUpdated = true;
      bSubMilNew = true;
    } else if (subMile.type === "submilestone") {
      bCurrentMilestoneUpdated = false;
      bSubMilNew = true;
    }
    const currentMilestone = this.milestoneData.find(obj => {
      return obj.data.isCurrent === true;
    });
    let previousTasks, newTasks, updateProjectBody, updateCurrMilBody;
    if (bCurrentMilestoneUpdated) {
      const currentMilSubmil = currentMilestone.children ? currentMilestone.children : []
      const prevSubMil = currentMilSubmil.filter(c => parseInt(c.data.position, 10) === parseInt(subMile.position, 10) - 1);
      prevSubMil.forEach(element => {
        const subMilTasks = this.taskAllocateCommonService.getTasksFromMilestones(element, true, this.milestoneData, false);
        previousTasks = previousTasks ? [...previousTasks, ...subMilTasks] : [...subMilTasks];
      });
      newTasks = this.taskAllocateCommonService.getTasksFromMilestones(subMile, true, this.milestoneData, false);
      newTasks = newTasks.filter(c => c.itemType !== "Client Review");
      if (previousTasks && previousTasks.length) {

        previousTasks = previousTasks.filter(c => c.itemType !== "Client Review");
      } else {
        previousTasks = [];
      }

    } else {
      const newCurrentMilestone = this.milestoneData.find(obj => {
        return (
          obj.data.title ===
          this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone
        );
      });

      let updateNextMilBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: this.constants.STATUS.IN_PROGRESS,
        SubMilestones: bSubMilNew
          ? this.getSubMilestoneStatus(
            newCurrentMilestone,
            this.constants.STATUS.COMPLETED,
            subMile.title
          )
          : ""
      };
      this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          +newCurrentMilestone.data.id
        ),
        updateNextMilBody,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );

      previousTasks = currentMilestone
        ? this.taskAllocateCommonService.getTasksFromMilestones(
          currentMilestone,
          true,
          this.milestoneData,
          false
        )
        : [];

      newTasks = this.taskAllocateCommonService.getTasksFromMilestones(
        newCurrentMilestone,
        true,
        this.milestoneData,
        false
      );
      if (subMile.type === "submilestone") {
        newTasks = newTasks.filter(
          c =>
            c.submilestone === subMile.title || c.itemType === "Client Review"
        );
      }
    }
    if (currentMilestone) {
      /////// Update current milestone status
      updateCurrMilBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: bCurrentMilestoneUpdated
          ? this.constants.STATUS.IN_PROGRESS
          : this.constants.STATUS.COMPLETED,
        SubMilestones: bCurrentMilestoneUpdated
          ? this.getSubMilestoneStatus(
            currentMilestone,
            this.constants.STATUS.COMPLETED,
            subMile.title
          )
          : this.getSubMilestoneStatus(
            currentMilestone,
            this.constants.STATUS.COMPLETED
          )
      };
      this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          +currentMilestone.data.id
        ),
        updateCurrMilBody,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }

    /////// Update current project status
    updateProjectBody = {
      __metadata: { type: this.constants.listNames.ProjectInformation.type },
      Milestone: bCurrentMilestoneUpdated
        ? this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone
        : this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone,
      Status: this.constants.STATUS.IN_PROGRESS,
      PrevStatus: this.sharedObject.oTaskAllocation.oProjectDetails.status
    };
    this.commonService.setBatchObject(
      batchUrl,
      this.spServices.getItemURL(
        this.constants.listNames.ProjectInformation.name,
        +projectID
      ),
      updateProjectBody,
      this.constants.Method.PATCH,
      this.constants.listNames.ProjectInformation.name
    );

    /////// Filter out not required tasks from prev Milestone / submilestone
    previousTasks = previousTasks.filter(objt => {
      return (
        objt.status !== "Deleted" &&
        objt.status !== "Abandon" &&
        objt.status !== "Completed"
      );
    });

    ////// Filter only Not Confirmed tasks from new
    newTasks = newTasks.filter(objt => {
      return objt.status === "Not Confirmed";
    });

    for (const task of previousTasks) {
      if (task.status === "Not Confirmed") {
        task.status = "Deleted";
      } else {
        if (
          task.itemType === "Send to client" ||
          task.itemType === "Client Review"
        ) {
          task.status = "Completed";
        } else {
          task.status = "Auto Closed";
        }
      }
      task.ActiveCA = "No";
      // tslint:enable
      const updateSchedulesBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: task.status,
        ActiveCA: task.ActiveCA
      };
      this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          +task.id
        ),
        updateSchedulesBody,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }

    for (const element of newTasks) {
      if (element.AssignedTo) {
        await this.sendMail(this.oProjectDetails, element);
      }
      if (element.IsCentrallyAllocated === "Yes") {
        //// send task creation email
        element.ActiveCA = "Yes";
        await this.sendCentralTaskMail(
          this.oProjectDetails,
          element,
          element.title + " Created",
          this.constants.EMAIL_TEMPLATE_NAME.CENTRAL_TASK_CREATION
        );
      }
      element.status = "Not Started";
      element.assignedUserChanged = false;
      const updateSchedulesBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: element.status,
        ActiveCA: element.ActiveCA
      };

      this.commonService.setBatchObject(
        batchUrl,
        this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          +element.id
        ),
        updateSchedulesBody,
        this.constants.Method.PATCH,
        this.constants.listNames.Schedules.name
      );
    }

    let url = this.spServices.getReadURL(
      this.constants.listNames.EarlyTaskCompleteNotifications.name,
      this.taskAllocationService.taskallocationComponent.earlyTaskNotification
    );
    url = url.replace(/{{projectCode}}/g, this.oProjectDetails.projectCode);
    this.commonService.setBatchObject(
      batchUrl,
      url,
      null,
      this.constants.Method.GET,
      this.constants.listNames.EarlyTaskCompleteNotifications.name
    );

    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "SetAsNextMilestone",
      "POST-BATCH"
    );
    const response = await this.spServices.executeBatch(batchUrl);
    if (response.length) {
      const notificationBatchUrl = [];
      const notifications = response[0].retItems;
      notifications.forEach(element => {
        const updateNotificationBody = {
          __metadata: {
            type: this.constants.listNames.EarlyTaskCompleteNotifications.type
          },
          IsActiveCH: "No"
        };

        this.commonService.setBatchObject(
          batchUrl,
          this.spServices.getItemURL(
            this.constants.listNames.EarlyTaskCompleteNotifications.name,
            +element.ID
          ),
          updateNotificationBody,
          this.constants.Method.PATCH,
          this.constants.listNames.EarlyTaskCompleteNotifications.name
        );
      });

      this.commonService.SetNewrelic(
        "TaskAllocation",
        "Timeline",
        "SendEarlyTaskCompletionNotification",
        "POST"
      );
      await this.spServices.executeBatch(notificationBatchUrl);
    }
    this.commonService.SetNewrelic(
      "TaskAllocation",
      "Timeline",
      "setAsNextMilestone-timeline-getProjectResources",
      "GET-BATCH"
    );
    await this.commonService.getProjectResources(
      this.oProjectDetails.projectCode,
      false,
      false
    );
    await this.getMilestones(false);
  }

  getSubMilestoneStatus(milestone, status, sumbMil?) {
    const arrSubMil = [];
    let subMil = "";
    if (milestone.children !== undefined) {
      for (
        let nCountSub = 0;
        nCountSub < milestone.children.length;
        nCountSub = nCountSub + 1
      ) {
        const submilestone = milestone.children[nCountSub];
        if (submilestone.data.type !== "task") {
          submilestone.data.status =
            submilestone.data.status === "Not Saved"
              ? "Not Confirmed"
              : submilestone.data.status;
          if (status === "Completed") {
            if (sumbMil) {
              if (submilestone.data.title === sumbMil) {
                submilestone.data.status = this.constants.STATUS.IN_PROGRESS;
                arrSubMil.push(
                  submilestone.data.title +
                  ":" +
                  submilestone.data.position +
                  ":" +
                  this.constants.STATUS.IN_PROGRESS
                );
              } else if (submilestone.data.status !== "Not Confirmed") {
                arrSubMil.push(
                  submilestone.data.title +
                  ":" +
                  submilestone.data.position +
                  ":" +
                  this.constants.STATUS.COMPLETED
                );
              } else {
                arrSubMil.push(
                  submilestone.data.title +
                  ":" +
                  submilestone.data.position +
                  ":" +
                  submilestone.data.status
                );
              }
            } else if (submilestone.data.status !== "Not Confirmed") {
              arrSubMil.push(
                submilestone.data.title +
                ":" +
                submilestone.data.position +
                ":" +
                this.constants.STATUS.COMPLETED
              );
            }
          } else {
            arrSubMil.push(
              submilestone.data.title +
              ":" +
              submilestone.data.position +
              ":" +
              submilestone.data.status
            );
          }
        }
      }
    }
    if (arrSubMil.length) {
      subMil = arrSubMil.join(";#");
    }
    return subMil;
  }

  // *************************************************************************************************************************************
  // load component for  comment
  // *************************************************************************************************************************************

  // tslint:disable
  async viewTaskDetails(task) {
    const ref = this.dialogService.open(TaskDetailsDialogComponent, {
      data: {
        task: task
      },
      header:
        task.submilestone !== null
          ? task.milestone + " - " + task.submilestone + " - " + task.title
          : task.milestone + " - " + task.title,
      width: "80vw",
      contentStyle: {
        "min-height": "30vh",
        "max-height": "90vh",
        "overflow-y": "auto"
      }
    });
    ref.onClose.subscribe(async (taskobj: any) => { });
  }

  getDefaultDate() {
    return new Date(
      this.Today.getFullYear(),
      this.Today.getMonth(),
      this.Today.getDate(),
      0,
      0
    );
  }

  getTaskObjectByValue(
    task,
    className,
    milestone,
    nextTasks,
    previousTasks,
    submilestone,
    tempID
  ) {
    // debugger;
    const submilestoneLabel = submilestone ? submilestone.title : "";
    const defaultDate = this.getDefaultDate();
    let taskObj: IMilestoneTask = {
      pUserStart: new Date(defaultDate),
      pUserEnd: new Date(defaultDate),
      pUserStartDatePart: this.getDatePart(this.Today),
      pUserStartTimePart: this.getTimePart(new Date(defaultDate)),
      pUserEndDatePart: this.getDatePart(this.Today),
      pUserEndTimePart: this.getTimePart(new Date(defaultDate)),
      status: "Not Saved",
      id: task.dbId === undefined || task.dbId === 0 ? tempID : task.dbId,
      text: task.label,
      title: task.label,
      start_date: new Date(defaultDate),
      end_date: new Date(defaultDate),
      user: "",
      open: 1,
      parent: task.taskType === "Client Review" ? 0 : milestone.Id,
      res_id: "",
      budgetHours: "0",
      tat: false,
      tatVal: "0",
      milestoneStatus: className === "gtaskred" ? "Not Saved" : null,
      type: "task",
      slotType: task.slotType ? task.slotType : "",
      editMode: true,
      scope: null,
      spentTime: "0:0",
      isCurrent:
        this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
          milestone.label
          ? true
          : false,
      assignedUsers: [{ Title: "", userType: "" }],
      AssignedTo: {},
      userCapacityEnable: false,
      nextTask: nextTasks === "" ? null : nextTasks,
      previousTask: previousTasks === "" ? null : previousTasks,
      itemType: task.taskType,
      IsCentrallyAllocated: task.IsCentrallyAllocated,
      edited: true,
      added: true,
      submilestone: submilestoneLabel,
      milestone: milestone.label,
      skillLevel: task.skillLevel,
      CentralAllocationDone: task.CentralAllocationDone,
      ActiveCA: task.ActiveCA,
      assignedUserTimeZone: this.defaultTimeZone,
      DisableCascade:
        task.DisableCascade && task.DisableCascade === "Yes" ? true : false,
      taskFullName:
        this.oProjectDetails.projectCode +
        " " +
        milestone.label +
        " " +
        task.label,
      allocationPerDay: task.allocationPerDay ? task.allocationPerDay : "",
      timeSpentPerDay: task.TimeSpentPerDay ? task.TimeSpentPerDay : "",
      isNext: false,
      position: "",
      color: "",
      slotColor: "",
      parentSlot: 0,
      deallocateSlot: false,
      subMilestonePresent: false,
      showAllocationSplit: false,
      allocationColor: "",
      allocationTypeLoader: false,
      ganttOverlay: "",
      ganttMenu: "",
      ExpectedBudgetHrs: "",
      Reason:''
    };

    return taskObj;
  }

  getObjectByValue(milestone, type, tempID, TempSubmilePositionArray, mil) {
    const defaultDate = this.getDefaultDate();
    let taskObj: IMilestoneTask = {
      pUserStart: new Date(defaultDate),
      pUserEnd: new Date(defaultDate),
      pUserStartDatePart: this.getDatePart(this.Today),
      pUserStartTimePart: this.getTimePart(new Date(defaultDate)),
      pUserEndDatePart: this.getDatePart(this.Today),
      pUserEndTimePart: this.getTimePart(new Date(defaultDate)),
      status: "Not Saved",
      id:
        milestone.dbId === undefined || milestone.dbId === 0
          ? tempID
          : milestone.dbId,
      text: milestone.label,
      title: milestone.label,
      start_date: new Date(defaultDate),
      end_date: new Date(defaultDate),
      user: "",
      open:
        this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
          milestone.label
          ? 1
          : 0,
      parent: 0,
      res_id: "",
      budgetHours: "0",
      tat: null,
      tatVal: "0",
      milestoneStatus: "",
      type: type,
      slotType: "",
      editMode: true,
      scope: null,
      spentTime: "0:0",
      milestone: mil ? mil.label : "",
      position:
        type === "submilestone"
          ? TempSubmilePositionArray.find(c => c.name === milestone.label) !==
            undefined
            ? TempSubmilePositionArray.find(c => c.name === milestone.label)
              .position
            : 1
          : "",
      isCurrent:
        this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone ===
          milestone.label
          ? true
          : false,
      isNext:
        this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone ===
          milestone.label
          ? true
          : false,
      userCapacityEnable: false,
      edited: true,
      added: true,
      taskFullName: milestone.label,
      nextTask: "",
      previousTask: "",
      assignedUsers: [{ Title: "", userType: "" }],
      AssignedTo: {},
      color: "",
      slotColor: "",
      itemType: "",
      IsCentrallyAllocated: "",
      submilestone: "",
      skillLevel: "",
      CentralAllocationDone: false,
      ActiveCA: false,
      assignedUserTimeZone: this.defaultTimeZone,
      parentSlot: 0,
      DisableCascade: false,
      deallocateSlot: false,
      subMilestonePresent: false,
      allocationPerDay: "",
      timeSpentPerDay: "",
      showAllocationSplit: false,
      allocationColor: "",
      allocationTypeLoader: false,
      ganttOverlay: "",
      ganttMenu: "",
      ExpectedBudgetHrs: "",
      Reason:''
    };

    return taskObj;
  }

  getExistingData(oExistingTask) {
    oExistingTask.start_date = new Date(oExistingTask.start_date);
    oExistingTask.end_date = new Date(oExistingTask.end_date);
    oExistingTask.pUserStart = new Date(oExistingTask.pUserStart);
    oExistingTask.pUserEnd = new Date(oExistingTask.pUserEnd);

    this.setDatePartAndTimePart(oExistingTask);
    return oExistingTask;
  }
  // tslint:enable

  trackByFn(index, item) {
    return index; // or item.id
  }

  editAllocation(milestoneTask, allocationType): void {
    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter(
      objt => {
        return objt.UserNamePG.ID === milestoneTask.AssignedTo.ID;
      }
    );
    let header = milestoneTask.submilestone
      ? milestoneTask.milestone +
      " " +
      milestoneTask.title +
      " ( " +
      milestoneTask.submilestone +
      " )"
      : milestoneTask.milestone + " " + milestoneTask.title;
    header = header + " - " + milestoneTask.AssignedTo.Title;
    const ref = this.dialogService.open(PreStackAllocationComponent, {
      data: {
        ID: milestoneTask.id,
        task: milestoneTask.taskFullName,
        startDate: milestoneTask.pUserStartDatePart,
        endDate: milestoneTask.pUserEndDatePart,
        startTime: milestoneTask.pUserStartTimePart,
        endTime: milestoneTask.pUserEndTimePart,
        budgetHrs: milestoneTask.budgetHours,
        resource: milestoneTask.resources,
        status: milestoneTask.status,
        strAllocation: milestoneTask.allocationPerDay,
        strTimeSpent: milestoneTask.timeSpentPerDay,
        allocationType
      } as IDailyAllocationTask,
      width: "90vw",
      header,
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      // let task: any;
      // if (milestoneTask.type === "Milestone") {
      const milestoneData: MilestoneTreeNode = this.milestoneData.find(
        m => m.data.title === milestoneTask.milestone
      );
      // const milestoneTasks: any[] = this.taskAllocateCommonService.getTasksFromMilestones(
      //   milestoneData,
      //   true,
      //   this.milestoneData,
      //   false
      // );
      milestoneData.data.edited = true;
      //   task = milestoneTasks.find(t => t.id === milestoneTask.id);
      // } else {
      //   task = milestoneTask;
      // }
      this.prestackService.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Resource is over allocated",
          false
        );
      }
    });
  }

  showOverlayPanel(event, rowData, dailyAllocateOP, target?) {
    const allocationPerDay = rowData.allocationPerDay
      ? rowData.allocationPerDay
      : "";
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
    setTimeout(() => {
      let panel: any = document.querySelector(
        ".dailyAllocationOverlayComp > div"
      );
      let panelContainer: any = document.getElementById("s4-workspace");
      let topAdject = 0;
      if (panelContainer) {
        topAdject =
          panelContainer.scrollTop > 0
            ? panelContainer.scrollTop - panel.clientHeight
            : 0;
        if (topAdject < 0) {
          topAdject = panelContainer.scrollTop;
        }
      }
      panel.style.top = event.pageY + topAdject + "px";
      panel.style.left = event.pageX + "px";
    }, 50);
  }

  hideOverlayPanel() {
    this.dailyAllocateOP.hideOverlay();
  }

  validateTask(nodes): boolean {
    const errorMsgs = this.commonService.validateTaskDuration(nodes, 50);
    if (errorMsgs) {
      this.commonService.showToastrMessage(this.constants.MessageType.error, errorMsgs, true);
      return false;
    }
    return true;
  }
}

export interface MilestoneTreeNode {
  data?: any;
  children?: MilestoneTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}
