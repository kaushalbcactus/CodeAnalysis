import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { ConstantsService } from "src/app/Services/constants.service";
import { GlobalService } from "src/app/Services/global.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { CACommonService } from "src/app/ca/caservices/cacommon.service";
import { SharedConstantsService } from "./service/shared-constants.service";
import { MilestoneTasksDialogComponent } from "./milestone-tasks-dialog/milestone-tasks-dialog.component";
import { CommonService } from "src/app/Services/common.service";
import { GanttChartComponent } from "../../shared/gantt-chart/gantt-chart.component";
import { gantt } from "../../dhtmlx-gantt/codebase/source/dhtmlxgantt";
import { UserCapacitycommonService } from "./service/user-capacitycommon.service";

@Component({
  selector: "app-usercapacity",
  templateUrl: "./usercapacity.component.html",
  styleUrls: ["./usercapacity.component.css"],
})
export class UsercapacityComponent implements OnInit {
  @ViewChild("capacityTasks", { static: false }) capacityTasks: ElementRef;
  @ViewChild("ganttcontainer", { read: ViewContainerRef, static: false })
  ganttChart: ViewContainerRef;

  @Output() selectedUserEvent = new EventEmitter<object>();

  public modalReference = null;
  public clickedTaskTitle = "";
  public milestoneTasks = [];
  public height = "";
  public verticalAlign = "";
  elRef: ElementRef;
  data: any;
  loaderenable = true;
  dynamicload = false;
  width: any;
  pageWidth: any;
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  enableTaskDialog = false;
  selectedTask: any;
  disableCamera = false;
  enableDownload = false;
  displayCount: any;
  taskStatus = "All";
  tableLoaderenable = false;
  public disableOverlay = false;
  @Output() resourceSelect = new EventEmitter<string>();
  @Output() updateblocking = new EventEmitter();
  @Input() userCapacity: any;
  @Input() parentModule: string;
  constructor(
    public datepipe: DatePipe,
    public config: DynamicDialogConfig,
    private spService: SPOperationService,
    private globalConstantService: ConstantsService,
    private commonservice: CACommonService,
    elRef: ElementRef,
    private globalService: GlobalService,
    private sharedConstant: SharedConstantsService,
    private cdRef: ChangeDetectorRef,
    public dialogService: DialogService,
    private common: CommonService,
    private resolver: ComponentFactoryResolver,
    private userCapacityCommon: UserCapacitycommonService
  ) {
    this.elRef = elRef;
  }

  ngOnInit() {
    this.loaderenable = true;
    this.data = this.config.data;
    this.hideOverlay(this.data, this.parentModule);
    if (this.data) {
      this.dynamicload = true;
      this.Onload(this.data);
    } else if (this.userCapacity) {
      this.showCapacity(this.userCapacity);
    }
  }

  hideOverlay(dynamicPopupData: any, inputData: string): void {
    const arrShowOverlayComponents = ["capacity", "ca"];
    inputData =
      dynamicPopupData && dynamicPopupData.parentModule
        ? dynamicPopupData.parentModule
        : inputData;
    this.disableOverlay =
      arrShowOverlayComponents.indexOf(inputData) > -1 ? false : true;
  }

  downloadExcel() {
    this.common.tableToExcel("capacityTable1", "Capacity Dashboard");
  }
  // tslint:disable
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange: [],
    arrResources: [],
    arrDateFormat: [],
  };

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  // ******************************************************************************************************
  // load component for user capacity from diff. module
  // ******************************************************************************************************

  async Onload(data) {
    if (data.task) {
      this.enableDownload = data.type === "CapacityDashboard" ? true : false;
      if (data.type === "CapacityDashboard") {
        this.displayCount =
          data.resourceType === "OnJob"
            ? "Total On Job Resource: " + data.task.resources.length
            : "Total Trainee: " + data.task.resources.length;
        this.taskStatus = data.taskStatus;
      }
      let setResourcesExtn = $.extend(true, [], data.task.resources);

      const oCapacity = await this.applyFilterReturn(
        data.startTime,
        data.endTime,
        setResourcesExtn,
        []
      );
      const tempUserDetailsArray = [];

      if (data.task.selectedResources) {
        for (const user of data.task.selectedResources) {
          if (
            (user.userType === this.globalConstantService.userType.BEST_FIT ||
              user.userType ===
                this.globalConstantService.userType.RECOMMENDED) &&
            data.item.taskDetails.uid !== user.taskDetails.uid
          ) {
            const retResource = oCapacity.arrUserDetails.filter(
              (arrdt) => arrdt.uid === user.taskDetails.uid
            );
            tempUserDetailsArray.push(retResource[0]);
          }
          if (data.item.taskDetails.uid === user.taskDetails.uid) {
            const retResource = oCapacity.arrUserDetails.filter(
              (arrdt) => arrdt.uid === user.taskDetails.uid
            );
            tempUserDetailsArray.splice(0, 0, retResource[0]);
          }
        }

        oCapacity.arrUserDetails = tempUserDetailsArray;
      }
      if (this.globalService.isResourceChange) {
        const capacity: any = await this.afterResourceChange(
          data.task, // this.globalService.data.task,
          data.startTime, // this.globalService.data.startTime,
          data.endTime, // this.globalService.data.endTime,
          data.task.resources, // this.globalService.data.task.resources,
          [],
          true,
          data.taskResources
        );
        this.oCapacity = capacity;
      } else if (this.globalService.currentTaskData) {
        const capacity: any = await this.afterResourceChange(
          this.globalService.currentTaskData,
          this.globalService.currentTaskData.start_date,
          this.globalService.currentTaskData.end_date,
          this.globalService.currentTaskData.resources,
          [],
          false,
          data.taskResources
        );
        this.oCapacity = capacity;
      } else {
        this.globalService.oCapacity = oCapacity;
        this.oCapacity = oCapacity;
      }
      if (data.Module) {
        if (data.Module === "PM") {
          this.disableOverlay = true;
          this.disableCamera = true;
        }
      }
      this.calc(oCapacity);
    }

    if (this.enableDownload) {
      console.log("capacity data testing");
      console.log(this.oCapacity.arrUserDetails);

      this.selectedUserEvent.emit(
        this.oCapacity.arrUserDetails.map(
          (c) => new Object({ Id: c.uid, userName: c.userName })
        )
      );
    }
  }

  getHtmlContent() {
    return this.elRef.nativeElement.innerHTML;
  }

  async applyFilterReturn(startDate, endDate, selectedUsers, excludeTasks) {
    return await this.userCapacityCommon.applyFilter(
      startDate,
      endDate,
      selectedUsers,
      excludeTasks,
      this.enableDownload,
      this.taskStatus
    );
  }

  async applyFilterGlobal(startDate, endDate, selectedUsers, excludeTasks) {
    this.globalService.oCapacity = await this.userCapacityCommon.applyFilter(
      startDate,
      endDate,
      selectedUsers,
      excludeTasks,
      this.enableDownload,
      this.taskStatus
    );
  }
  async applyFilterLocal(
    startDate,
    endDate,
    selectedUsers,
    Module,
    excludeTasks
  ) {
    this.oCapacity = await this.userCapacityCommon.applyFilter(
      startDate,
      endDate,
      selectedUsers,
      excludeTasks,
      this.enableDownload,
      this.taskStatus
    );

    if (Module) {
      if (Module === "PM") {
        this.disableOverlay = true;
        this.disableCamera = true;
      }
    }

    this.calc(this.oCapacity);
  }

  async onResourceClick(user) {
    this.resourceSelect.emit(user);
  }

  // fetch capacity for after task resource change and milestone task added and/or changed
  async afterResourceChange(
    task: any,
    startDate: Date,
    endDate: Date,
    resource: any,
    [],
    isResourceChange: boolean,
    taskResources: any
  ) {
    let capacity;
    if (isResourceChange) {
      capacity = await this.userCapacityCommon.applyFilter(
        startDate,
        endDate,
        taskResources,
        [],
        this.enableDownload,
        this.taskStatus
      );
      let Task: any;
      capacity.arrUserDetails.forEach((e) => {
        e.tasks.forEach((c) => {
          if (task.id && c.Id == task.id) {
            Task = c;
          }
        });
      });

      capacity.arrUserDetails.forEach(
        (e) => (e.tasks = e.tasks.filter((c) => c.Id !== Task.Id))
      );

      capacity.arrUserDetails.forEach((e) => {
        if (e.uid == task.AssignedTo.ID && e.tasks.indexOf(task) === -1) {
          e.tasks.push(Task);
        }
      });

      capacity.arrUserDetails = capacity.arrUserDetails.filter(
        (e) => e.uid === task.AssignedTo.ID
      );
    } else {
      capacity = await this.userCapacityCommon.applyFilter(
        startDate,
        endDate,
        resource,
        [],
        this.enableDownload,
        this.taskStatus
      );
      let taskObj: any = {
        Title: task.taskFullName ? task.taskFullName : task.Title,
        Milestone: task.milestone ? task.milestone : task.Milestone,
        SubMilestones: task.SubMilestones
          ? task.SubMilestones
          : task.submilestone,
        Task: task.Task ? task.Task : task.title,
        StartDate: task.start_date,
        DueDate: task.end_date,
        DueDateDT: task.end_date,
        AllocationPerDay: task.allocationPerDay,
        Status: task.Status ? task.Status : task.status,
        ExpectedTime: task.EstimatedTime
          ? task.EstimatedTime
          : task.budgetHours,
        ID: task.id,
        TimeSpent: task.SpentTime ? task.SpentTime : task.spentTime,
        TimeZone: task.AssignedUserTimeZone
          ? task.AssignedUserTimeZone
          : task.assignedUserTimeZone,
        TimeZoneNM: task.AssignedUserTimeZone
          ? task.AssignedUserTimeZone
          : task.assignedUserTimeZone,
        parentSlot: task.parentSlot ? task.parentSlot : task.Id,
        AssignedTo: task.AssignedTo,
      };

      for (var index in capacity.arrUserDetails) {
        if (capacity.arrUserDetails.hasOwnProperty(index)) {
          if (
            capacity.arrUserDetails[index].uid == task.AssignedTo.ID &&
            capacity.arrUserDetails[index].tasks.indexOf(task) === -1
          ) {
            let taskIndex = capacity.arrUserDetails[index].tasks.findIndex(
              (x) => x.ID === task.id
            );
            if (taskIndex !== -1) {
              capacity.arrUserDetails[index].tasks.splice(
                taskIndex,
                1,
                taskObj
              );
            } else {
              capacity.arrUserDetails[index].tasks.push(taskObj);
            }
          } else if (
            capacity.arrUserDetails[index].tasks.find((e) => e.Id == task.id) &&
            capacity.arrUserDetails[index].uid !== task.AssignedTo.ID
          ) {
            let taskIndex = capacity.arrUserDetails[index].tasks.findIndex(
              (x) => x.ID === task.id
            );
            capacity.arrUserDetails[index].tasks.splice(taskIndex, 1);
          }
        }
      }
    }

    for (var index in capacity.arrUserDetails) {
      if (capacity.arrUserDetails.hasOwnProperty(index)) {
        this.userCapacityCommon.fetchUserCapacity(
          capacity.arrUserDetails[index]
        );
      }
    }
    return capacity;
  }

  changeHeight(user, objt) {
    if (objt.currentTarget.classList[1] === "more") {
      $(objt.currentTarget)
        .parent()
        .parent()
        .parent()
        .next()
        .find("div")
        .not(":visible")
        .addClass(user.uid + "overFlowTasks");
      const height =
        +user.maxHeight.split("px")[0] > +user.height.split("px")[0]
          ? user.maxHeight
          : user.height;
      $("." + user.uid + "taskrow").css("height", height);
      $("." + user.uid + "overFlowTasks").show();
      $("." + user.uid + "more").hide();
      $("." + user.uid + "less").show();
    } else {
      $("." + user.uid + "taskrow").css("height", user.height);
      $("." + user.uid + "overFlowTasks").hide();
      $("." + user.uid + "more").show();
      $("." + user.uid + "less").hide();
    }
  }

  fetchProjectTaskDetails(user, tasks, date, objt) {
    if (tasks.length > 0) {
      // const oItem = $(objt.target).closest('.UserTasksRow').siblings('.TaskPerDayRow');
      $("." + user.uid + "loaderenable").show();
      const oItem = $(objt.target)
        .closest(".UserTasksRow")
        .find(".TaskPerDayRow");
      oItem.hide();
      oItem.find("#TasksPerDay").hide();
      oItem.find(".innerTableLoader").show();
      oItem.slideDown();
      setTimeout(() => {
        this.bindProjectTaskDetails(tasks, objt, user);
      }, 300);

      user.dates.map((c) => delete c.backgroundColor);
      date.backgroundColor = "#ffeb9c";
      this.getColor(date);
    }
  }

  loadComponent() {
    // gantt.serverList("res_id", this.resource);
    this.ganttChart.clear();
    this.ganttChart.remove();
    const factory = this.resolver.resolveComponentFactory(GanttChartComponent);
    var ganttComponentRef = this.ganttChart.createComponent(factory);
    ganttComponentRef.instance.isLoaderHidden = true;
    gantt.init(ganttComponentRef.instance.ganttContainer.nativeElement);
    gantt.clearAll();
    // ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject,this.resource);
    // this.setScale({ label: 'Minute Scale', value: '0' });
  }

  // tslint:disable
  async bindProjectTaskDetails(tasks, objt, user) {
    if (tasks.length > 0) {
      const batchUrl = [];
      const batchContents = new Array();
      const batchGuid = this.spService.generateUUID();
      for (const taskIndex in tasks) {
        if (tasks.hasOwnProperty(taskIndex)) {
          if (tasks[taskIndex].projectCode) {
            // tslint:disable
            const piObj = Object.assign({}, this.queryConfig);
            piObj.url = this.spService.getReadURL(
              this.globalConstantService.listNames.ProjectInformation.name,
              this.sharedConstant.userCapacity.getProjectInformation
            );
            piObj.url = piObj.url.replace(
              "{{projectCode}}",
              tasks[taskIndex].projectCode
            );
            piObj.listName = this.globalConstantService.listNames.ProjectInformation.name;
            piObj.type = "GET";
            batchUrl.push(piObj);
            if (tasks[taskIndex].projectCode !== "Adhoc") {
              const tasksObj = Object.assign({}, this.queryConfig);
              tasksObj.url = this.spService.getReadURL(
                this.globalConstantService.listNames.Schedules.name,
                this.sharedConstant.userCapacity.getProjectTasks
              );
              tasksObj.url = tasksObj.url
                .replace("{{projectCode}}", tasks[taskIndex].projectCode)
                .replace("{{milestone}}", tasks[taskIndex].milestone);
              tasksObj.listName = this.globalConstantService.listNames.Schedules.name;
              tasksObj.type = "GET";
              batchUrl.push(tasksObj);
            } else {
              const tasksObj = Object.assign({}, this.queryConfig);
              tasksObj.url = this.spService.getReadURL(
                this.globalConstantService.listNames.Schedules.name,
                this.sharedConstant.userCapacity.getProjectTasks
              );
              tasksObj.url = tasksObj.url;
              // .replace("{{projectCode}}", tasks[taskIndex].projectCode)
              // .replace("{{milestone}}", tasks[taskIndex].milestone);
              tasksObj.listName = this.globalConstantService.listNames.Schedules.name;
              tasksObj.type = "GET";
              batchUrl.push(tasksObj);
            }

            // tslint:enable
          }
        }
      }
      if (batchUrl.length) {
        this.common.SetNewrelic(
          "CapacityDashboard",
          "UserCapacity",
          "getProInfoByPCAndTaskByPCandMilestone"
        );
        let arrResults = await this.spService.executeBatch(batchUrl);
        arrResults = arrResults.length ? arrResults.map((a) => a.retItems) : [];
        let nCount = 0;
        for (const i in tasks) {
          if (tasks.hasOwnProperty(i)) {
            if (tasks[i].projectCode) {
              const arrProject = arrResults[nCount];
              if (arrProject && arrProject.length > 0) {
                tasks[i].shortTitle = arrProject[0].WBJID;
              }
              let miltasks = arrResults[nCount + 1];
              if (miltasks) {
                if (
                  miltasks.length &&
                  miltasks[0].ContentTypeCH === "Milestone"
                ) {
                  miltasks.splice(0, 1);
                }
              } else {
                miltasks = [];
              }

              // tslint:disable
              for (const index in miltasks) {
                if (miltasks.hasOwnProperty(index)) {
                  const sTimeZone =
                    miltasks[index].TimeZoneNM === null
                      ? "+5.5"
                      : miltasks[index].TimeZoneNM;
                  const currentUserTimeZone =
                    (new Date().getTimezoneOffset() / 60) * -1;
                  miltasks[
                    index
                  ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
                    new Date(miltasks[index].StartDate),
                    currentUserTimeZone,
                    sTimeZone
                  );
                  miltasks[
                    index
                  ].DueDateDT = this.commonservice.calcTimeForDifferentTimeZone(
                    new Date(miltasks[index].DueDateDT),
                    currentUserTimeZone,
                    sTimeZone
                  );
                }
              }
              miltasks.sort(function (a, b) {
                return a.StartDate - b.StartDate;
              });
              let lastSCTask = [];
              const scTasks = miltasks.filter(function (obj) {
                return obj.Task === "Send to client";
              });
              if (scTasks.length > 0) {
                lastSCTask =
                  scTasks.length > 0
                    ? scTasks.sort(function (a, b) {
                        return new Date(a.StartDate) < new Date(b.StartDate);
                      })
                    : [];
              }
              tasks[i].milestoneTasks = miltasks;
              tasks[i].milestoneDeadline =
                lastSCTask.length > 0 ? lastSCTask[0].StartDate : "--";
              nCount = nCount + 2;
            }
          }
        }
      }
      tasks.map(
        (c) => (c.editenableCapacity = this.enableDownload ? true : false)
      );
      user.dayTasks = tasks;

      $("." + user.uid + "loaderenable").hide();
      const oTd = $(objt.target).closest("td");
      // const oUserRow = $(objt.target).closest('.UserTasksRow').find('.TaskPerDayRow');

      // const oUserTaskRow = $(objt.target).next('TaskPerDayRow');

      const oUserTaskRow = $(objt.target)
        .closest(".UserTasksRow")
        .find(".TaskPerDayRow");
      oUserTaskRow.find(".innerTableLoader").slideUp(function () {
        oUserTaskRow.find("#TasksPerDay").slideDown();
      });
      oTd.parent().find(".highlightCell").removeClass("highlightCell");
      oTd.addClass("highlightCell");
      $(".innerTableLoader").hide();
    }
  }

  async fetchTimeSpentTaskDetails(user, date, objt) {
    if (user.TimeSpentTasks.length > 0) {
      const SpentTasks = user.TimeSpentTasks.filter(
        (c) =>
          c.TimeSpentDate.getTime() === new Date(date.date).getTime() &&
          c.TimeSpentPerDay !== "00:00" &&
          c.TimeSpentPerDay !== "0:00"
      );
      if (SpentTasks.length > 0) {
        user.TimeSpentDayTasks = SpentTasks;
        // $('.' + user.uid + 'spentloaderenable').show();
        const oItem = $(objt.target).closest(".spenttaskRow").next("tr");
        oItem.hide();
        oItem.find("#spentTasksPerDay").hide();
        oItem.slideDown();
        oItem.find(".innerspentTableLoader").show();
        $(objt.target)
          .closest("td")
          .siblings()
          .closest(".highlightCell")
          .removeClass("highlightCell");
        $(objt.target).closest("td").addClass("highlightCell");

        const batchUrl = [];
        const projectAdded = [];
        for (const taskIndex in SpentTasks) {
          if (SpentTasks.hasOwnProperty(taskIndex)) {
            if (
              SpentTasks[taskIndex].projectCode !== "Adhoc" &&
              projectAdded.indexOf(SpentTasks[taskIndex].projectCode) === -1
            ) {
              // tslint:disable
              projectAdded.push(SpentTasks[taskIndex].projectCode);
              const piObj = Object.assign({}, this.queryConfig);
              piObj.url = this.spService.getReadURL(
                this.globalConstantService.listNames.ProjectInformation.name,
                this.sharedConstant.userCapacity.getProjectInformation
              );
              piObj.url = piObj.url.replace(
                "{{projectCode}}",
                SpentTasks[taskIndex].projectCode
              );
              piObj.listName = this.globalConstantService.listNames.ProjectInformation.name;
              piObj.type = "GET";
              batchUrl.push(piObj);
            }
          }
        }

        if (batchUrl.length) {
          this.common.SetNewrelic(
            "CapacityDashboard",
            "UserCapacity",
            "getProInfoByPC"
          );
          let arrResults = await this.spService.executeBatch(batchUrl);
          arrResults = arrResults.length
            ? arrResults.map((a) => a.retItems[0])
            : [];
          let nCount = 0;
          for (const i in SpentTasks) {
            if (SpentTasks.hasOwnProperty(i)) {
              if (SpentTasks[i].projectCode !== "Adhoc") {
                const arrProject = arrResults.find(
                  (e) => e.ProjectCode === SpentTasks[i].projectCode
                );
                if (arrProject) {
                  SpentTasks[i].shortTitle = arrProject.WBJID;
                }
              }
            }
          }
        }

        oItem.find("#spentTasksPerDay").show();
        oItem.find(".innerspentTableLoader").hide();

        user.dates.map((c) => delete c.TimespentbackgroundColor);
        date.TimespentbackgroundColor = "#ffeb9c";
        this.userCapacityCommon.getTimeSpentColorExcel(
          date,
          date.date,
          user.GoLiveDate
        );
      }
    }
  }

  showCapacity(oCapacity) {
    this.oCapacity = oCapacity;
    this.loaderenable = false;
    // this.calc(this.oCapacity);
  }

  calc(oCapacity) {
    const arrDateRange = oCapacity.arrDateFormat.length;
    this.loaderenable = false;

    if (arrDateRange <= 10 && !this.disableOverlay) {
      // setTimeout(() => {
      let tableWidth = document.getElementById("capacityTable").offsetWidth;

      tableWidth =
        tableWidth === 0
          ? document.getElementsByClassName("userCapacity").length
            ? document.getElementsByClassName("userCapacity")[0].parentElement
                .offsetWidth
            : 1192
          : tableWidth;

      this.pageWidth = tableWidth + "px";

      const totalCellWidth = tableWidth - (tableWidth * 18) / 100;
      const firstCellWidth = (tableWidth * 6) / 100;
      const eachColumnWidth = totalCellWidth / arrDateRange;
      const users = oCapacity.arrUserDetails;
      for (const i in users) {
        if (users.hasOwnProperty(i)) {
          let top = 0;
          this.height = "80px";
          users[i].height = "80px";
          users[i].maxHeight = users[i].tasks.length * 18 + 27 + "px";
          this.verticalAlign = "top";
          for (const j in users[i].tasks) {
            if (users[i].tasks.hasOwnProperty(j)) {
              const startDate = new Date(
                new Date(users[i].tasks[j].StartDate).toDateString()
              ); // format('MMM dd, yyyy'));
              let dateIndex = oCapacity.arrUserDetails[0].businessDays.findIndex(
                function (x) {
                  return x.valueOf() === startDate.valueOf();
                }
              );
              let nBusinessDays = users[i].tasks[j].taskTotalDays;
              if (dateIndex < 0) {
                const tblStartDate = new Date(users[i].businessDays[0]);
                const taskStartDate = new Date(
                  this.datepipe.transform(
                    users[i].tasks[j].StartDate,
                    "MMM dd yyyy"
                  )
                ); // .format('MMM dd yyyy')
                const nDays =
                  this.userCapacityCommon.CalculateWorkingDays(
                    taskStartDate,
                    tblStartDate
                  ) - 1;
                nBusinessDays = nBusinessDays - nDays;
              }
              dateIndex = dateIndex < 0 ? 0 : dateIndex;
              let availableIndex = arrDateRange - dateIndex;
              availableIndex =
                availableIndex >= nBusinessDays
                  ? nBusinessDays
                  : availableIndex;
              const left = eachColumnWidth * dateIndex + firstCellWidth;
              const width = eachColumnWidth * availableIndex;
              users[i].tasks[j].cssWidth = width + "px";
              users[i].tasks[j].cssLeft = left + "px";
              users[i].tasks[j].cssTop = top + "px";
              if (+j >= 3) {
                users[i].tasks[j].cssHide = "none";
              }
              top = top + 18;
            }
          }
        }
      }
    } else {
      this.height = "inherit";
      this.verticalAlign = "middle";
    }
  }

  getMilestoneTasks(task) {
    const ref = this.dialogService.open(MilestoneTasksDialogComponent, {
      data: {
        task,
      },
      header: task.title,
      width: "90vw",
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
    });
    ref.onClose.subscribe(async (tasks: any) => {});
  }

  collpaseTable(objt, user, type, row) {
    if (type === "available") {
      row.parentNode
        .getElementsByClassName("highlightCell")[0]
        .classList.remove("highlightCell");
      user.dayTasks = [];
      user.dates.map((c) => delete c.backgroundColor);
    } else {
      const oCollpase = $(objt).closest(".SpentTaskPerDayRow");
      oCollpase.prev().find(".highlightCell").removeClass("highlightCell");
      oCollpase.slideUp();
      user.TimeSpentDayTasks = [];
      user.dates.map((c) => delete c.TimespentbackgroundColor);
    }
  }

  getColor(date) {
    if (date.backgroundColor) {
      return "orange";
    }

    switch (date.userCapacity) {
      case "Leave":
        return "#808080";
      case "NotAvailable":
        return "#EF3D3D";
      case "Available":
        return "#55bf3b";
    }
  }

  UpdateBlocking(event) {
    this.updateblocking.emit(event);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.calc(this.oCapacity);
  }
}
