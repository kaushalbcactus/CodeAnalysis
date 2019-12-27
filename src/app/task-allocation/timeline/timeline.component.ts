import { Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation, Input, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { GanttEditorComponent, GanttEditorOptions } from 'ng-gantt';
import { TreeNode, MessageService, DialogService, ConfirmationService, DynamicDialogRef } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { DragDropComponent } from '../drag-drop/drag-drop.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { CascadeDialogComponent } from '../cascade-dialog/cascade-dialog.component';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';



@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers: [MessageService, DialogService, DragDropComponent, UsercapacityComponent, DynamicDialogRef],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit, OnDestroy {

  @Input() projectDetails: any;
  @Output() reloadResources = new EventEmitter<string>();
  public GanttchartData = [];
  tempGanttchartData = [];
  public noTaskError = 'No milestones found.';
  @ViewChild('gantteditor', { static: true }) gantteditor: GanttEditorComponent;
  @ViewChild('reallocationMailTableID', { static: false }) reallocateTable: ElementRef;
  Today = new Date();
  tempComment;
  minDateValue = new Date();
  yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);
  userCapacityEnable = false;
  task;
  errorMessage;
  milestoneDataCopy = [];
  public colors = [
    {
      key: 'Not Confirmed',
      value: '#FFD34E'
    },
    {
      key: 'Not Started',
      value: '#5F6273'
    },
    {
      key: 'In Progress',
      value: '#6EDC6C'
    },
    {
      key: 'Completed',
      value: '#3498DB'
    },
    {
      key: 'Auto Closed',
      value: '#8183CC'
    },
    {
      key: 'Hold',
      value: '#FF3E56'
    },
    {
      key: 'Not Saved',
      value: 'rgb(219, 23, 33)'
    }
  ];

  public allTasks = [];
  batchContents = new Array();
  private editorOptions: GanttEditorOptions;
  public GanttChartView = false;
  public visualgraph = true;
  public webImageURL = '/sites/medcomcdn/PublishingImages';
  public oProjectDetails = {
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
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  selected: any;
  private contextMenuOptions: MenuItem[];
  milestoneData: TreeNode[] = [];
  tempmilestoneData: TreeNode[] = [];
  selectedNode: TreeNode;
  // contextMenuvisible: boolean = true;
  displayComment = false;
  capacityLoaderenable = false;
  displaydragdrop: boolean;
  loaderenable: boolean;
  resources: any;
  disableSave = false;

  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#C53E3E ',
      clockFaceTimeInactiveColor: '#fff'
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
  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private taskAllocationService: TaskAllocationConstantsService,
    public datepipe: DatePipe,
    public dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private usercapacityComponent: UsercapacityComponent,
  ) {

  }

  ngOnInit() {

    if (this.projectDetails !== undefined) {
      this.sharedObject.oTaskAllocation.oProjectDetails = this.projectDetails;
      this.projectDetails.projectCode = this.projectDetails.ProjectCode;
      this.oProjectDetails.projectCode = this.projectDetails.projectCode;
      this.onPopupload();

    }



    this.sharedObject.currentUser.timeZone = this.commonService.getCurrentUserTimeZone();
    this.editorOptions = {

      vCaptionType: 'Complete',  // Set to Show Caption : None,Caption,Resource,Duration,Complete,
      vDayColWidth: 36,
      vWeekColWidth: 150,
      vMonthColWidth: 300,
      vQuarterColWidth: 500,
      vDateTaskTableDisplayFormat: 'dd mon, yyyy hh:MI PM ',
      vUseSort: 0,
      vShowRes: parseInt('1', 10),
      vShowCost: parseInt('0', 10),
      vShowComp: parseInt('0', 10),
      vShowDur: parseInt('0', 10),
      vShowStartDate: parseInt('1', 10),
      vShowEndDate: parseInt('1', 10),
      vFormatArr: ['Day', 'Week', 'Month', 'Quarter'],
      vAdditionalHeaders: null,
    };
  }

  ngOnDestroy() {
  }


  async onPopupload() {
    await this.callReloadRes();
    await this.getMilestones(true);
  }

  public async callReloadRes() {
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
  }


  // *************************************************************************************************************************************
  // Get All Milestone Data
  // *************************************************************************************************************************************

  getDate(startDate) {
    return startDate !== '' ? startDate.date.year + '/' + (startDate.date.month < 10 ?
      '0' + startDate.date.month : startDate.date.month) + '/' + (startDate.date.day < 10
        ? '0' + startDate.date.day : startDate.date.day) : '';
  }
  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }
  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
  }
  // tslint:disable
  public async getMilestones(bFirstLoad) {
    this.GanttchartData = [];
    this.oProjectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const projectHoursSpent = [];
    const projectHoursAllocated = [];
    const projectAvailableHours = [];
    const totalMilestoneBudgetHours = [];
    let milestones = [];
    let milestoneTasks = [];
    let milestoneSubmilestones = [];
    let milestoneCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.milestone);
    milestoneCall.filter = milestoneCall.filter.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode);
    const response = await this.spServices.readItems(this.constants.listNames.Schedules.name, milestoneCall);
    this.allTasks = response.length ? response : [];
    let allRetrievedTasks = [];
    this.milestoneData = [];
    if (this.allTasks.length > 0) {

      milestones = this.allTasks.filter(c => c.FileSystemObjectType === 1);
      this.deletedMilestones = milestones.filter(m => m.Status === 'Deleted');
      var i = -1;
      const arrMilestones = this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones;

      const milestonesList = [];

      for (const mil of arrMilestones) {
        const milestone = milestones.find(e => e.Title === mil);
        milestonesList.push(milestone);
      }
      milestones = milestonesList;
      this.dbRecords = [];

      for (const milestone of milestones) {
        const tempmilestoneTask = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title);
        this.dbRecords.push({
          milestone: milestone,
          tasks: tempmilestoneTask.map(c => c.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestone.Title + ' ', '')),
        });
        const milestoneHoursSpent = [];
        let taskName;
        milestoneSubmilestones = milestone.SubMilestones !== null ? milestone.SubMilestones.replace(/#/gi, "").split(';') : [];

        var dbSubMilestones: Array<any> = milestoneSubmilestones.length > 0 ? milestoneSubmilestones.map(o => new Object({ subMile: o.split(':')[0], position: o.split(':')[1], status: o.split(':')[2] })) : [];

        var NextSubMilestone = dbSubMilestones.length > 0 ? dbSubMilestones.find(c => c.status === 'Not Confirmed') !== undefined ? dbSubMilestones.find(c => c.status === 'Not Confirmed') : new Object({ subMile: '', position: '', status: '' }) : new Object({ subMile: '', position: '', status: '' });

        milestone.startDate = milestone.Actual_x0020_Start_x0020_Date ?
          {
            date: {
              'year': new Date(milestone.Actual_x0020_Start_x0020_Date).getFullYear(),
              'month': new Date(milestone.Actual_x0020_Start_x0020_Date).getMonth() + 1,
              'day': new Date(milestone.Actual_x0020_Start_x0020_Date).getDate()
            }
          } : '';
        milestone.endDate = milestone.Actual_x0020_End_x0020_Date ?
          {
            date: {
              'year': new Date(milestone.Actual_x0020_End_x0020_Date).getFullYear(),
              'month': new Date(milestone.Actual_x0020_End_x0020_Date).getMonth() + 1,
              'day': new Date(milestone.Actual_x0020_End_x0020_Date).getDate()
            }
          } : '';

        let color = this.colors.filter(c => c.key == milestone.Status)
        if (color.length) {
          milestone.color = color[0].value;
        }

        // Gantt Chart Object

        let GanttObj = {

          'pID': milestone.Id,
          'pName': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? milestone.Title + " (Current)" : milestone.Title,
          'pStart': milestone.startDate !== "" ? milestone.startDate.date.year + "/" + (milestone.startDate.date.month < 10 ? "0" + milestone.startDate.date.month : milestone.startDate.date.month) + "/" + (milestone.startDate.date.day < 10 ? "0" + milestone.startDate.date.day : milestone.startDate.date.day) : '',
          'pEnd': milestone.endDate !== "" ? milestone.endDate.date.year + "/" + (milestone.endDate.date.month < 10 ? "0" + milestone.endDate.date.month : milestone.endDate.date.month) + "/" + (milestone.endDate.date.day < 10 ? "0" + milestone.endDate.date.day : milestone.endDate.date.day) : '',
          'pUserStart': milestone.startDate !== "" ? milestone.startDate.date.year + "/" + (milestone.startDate.date.month < 10 ? "0" + milestone.startDate.date.month : milestone.startDate.date.month) + "/" + (milestone.startDate.date.day < 10 ? "0" + milestone.startDate.date.day : milestone.startDate.date.day) : '',
          'pUserEnd': milestone.endDate !== "" ? milestone.endDate.date.year + "/" + (milestone.endDate.date.month < 10 ? "0" + milestone.endDate.date.month : milestone.endDate.date.month) + "/" + (milestone.endDate.date.day < 10 ? "0" + milestone.endDate.date.day : milestone.endDate.date.day) : '',
          'pUserStartDatePart': this.getDate(milestone.startDate),
          'pUserStartTimePart': '',
          'pUserEndDatePart': this.getDate(milestone.endDate),
          'pUserEndTimePart': '',
          'pClass': milestone.Status === 'Completed' ? 'gtaskblue' : milestone.Status === "In Progress" ? 'gtaskgreen' : milestone.Status === "Not Confirmed" ? 'gtaskyellow' : 'ggroupblack',
          'pLink': '',
          'pMile': 0,
          'pRes': '',
          'pComp': milestone.Status === 'Completed' ? 100 : (milestoneTasks.filter(c => c.Status == "Completed").length > 0) ? Math.round((milestoneTasks.filter(c => c.Status == "Completed").length / milestoneTasks.length) * 100) : 0,
          'pGroup': 1,
          'pParent': 0,
          'pOpen': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? 1 : 0,
          'pDepend': i === -1 ? '' : i,
          'pCaption': '',
          'status': milestone.Status,
          'tat': true,
          'tatVal': this.commonService.calcBusinessDays(new Date(milestone.Actual_x0020_Start_x0020_Date), new Date(milestone.Actual_x0020_End_x0020_Date)),
          'budgetHours': milestone.ExpectedTime ? milestone.ExpectedTime.toString() : '0',
          'spentTime': '0:0',
          'pNotes': milestone.Status,
          'type': 'milestone',
          'milestoneStatus': '',
          'editMode': false,
          'scope': null,
          'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
          'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ? this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.Title)
            > -1 ? true : false : false,
          'isNext': this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === milestone.Title ? true : false,
          'userCapacityEnable': false,
          'color': milestone.color,
          'itemType': 'milestone',
          'edited': false,
          'added': false,
          'slotType': '',
          'subMilestonePresent': dbSubMilestones.length > 0 ? true : false,
          'slotColor': 'white'
        };

        i = milestone.Id;
        if (GanttObj.status !== 'Deleted') {
          this.GanttchartData.push(GanttObj);
        }

        if (dbSubMilestones.length > 0) {
          let submile = [];
          let index = 0;
          for (const element of dbSubMilestones) {
            index++;
            let color = this.colors.filter(c => c.key == element.status)
            if (color.length) {
              element.color = color[0].value;
            }

            let tempSubmilestones = [];
            let GanttTaskObj = {
              'pID': parseInt("1200000" + milestone.Id + index),
              'pName': element.subMile,
              'pStart': null,
              'pEnd': null,
              'pUserStart': null,
              'pUserEnd': null,
              'pUserStartDatePart': '',
              'pUserStartTimePart': '',
              'pUserEndDatePart': '',
              'pUserEndTimePart': '',
              'pClass': element.status === 'Completed' ? 'gtaskblue' : element.status === "In Progress" ? 'gtaskgreen' : element.status === "Not Confirmed" ? 'gtaskyellow' : element.status === "Auto Closed" ? 'gtaskred' : 'ggroupblack',
              'pLink': '',
              'pMile': 0,
              'pRes': '  ',
              'pComp': 0,
              'pGroup': 1,
              'pParent': milestone.Id,
              'pOpen': 1,
              'pDepend': '',
              'pCaption': '',
              'pNotes': element.status,
              'status': element.status,
              'budgetHours': 0,
              'spentTime': '0:0',
              'allowStart': false,
              'tat': false,
              'tatVal': 0,
              'milestoneStatus': milestone.Status,
              'type': 'submilestone',
              'editMode': false,
              'scope': null,
              'isCurrent': GanttObj.isCurrent && NextSubMilestone.position === element.position && NextSubMilestone.status === element.status ? true : false,
              'isNext': GanttObj.isNext && NextSubMilestone.position === element.position && NextSubMilestone.status === element.status ? true : false,
              'isFuture': false,
              'assignedUsers': null,
              'AssignedTo': {},
              'userCapacityEnable': false,
              'position': element.position,
              'color': element.color,
              'itemType': 'submilestone',
              'slotType': '',
              'edited': false,
              'added': false,
              'slotColor': 'white'

            };
            // taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
            if (GanttTaskObj.status !== 'Deleted') {
              this.GanttchartData.push(GanttTaskObj);
            }

            milestoneTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && c.SubMilestones === element.subMile);
            const excludeSlotsListForHrs = [];
            for (const milestoneTask of milestoneTasks) {
              taskName = '';
              if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
                // if (milestoneTask.Task.indexOf('Slot') > -1) {
                excludeSlotsListForHrs.push(milestoneTask.ID);
                // }
              } else {
                if (milestoneTask.ParentSlot) {
                  excludeSlotsListForHrs.push(milestoneTask.ID);
                }
              }
              let color = this.colors.filter(c => c.key == milestoneTask.Status)
              if (color.length) {
                milestoneTask.color = color[0].value;
              }

              milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];

              const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
                return milestoneTask.AssignedTo.ID === objt.UserName.ID;
              });
              milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
                ? AssignedUserTimeZone[0].TimeZone.Title ?
                  AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

              const convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.StartDate),
                this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

              milestoneTask.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
                milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

              const convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.DueDate),
                this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

              milestoneTask.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
                milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

              const hrsMinObject = {
                timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
                  milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
                timeMins: milestoneTask.TimeSpent != null ?
                  milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
              };

              if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
                milestoneHoursSpent.push(hrsMinObject);
                projectHoursSpent.push(hrsMinObject);
                if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                  projectHoursAllocated.push(+milestoneTask.ExpectedTime);
                }
              }
              if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
                if (milestoneTask.TimeSpent == null) {
                  projectAvailableHours.push(+milestoneTask.ExpectedTime);
                } else {
                  const mHoursSpentTask = this.commonService.ajax_addHrsMins([hrsMinObject]);
                  const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
                  const convertedHoursMins = this.commonService.convertFromHrsMins(+taskTotalMins);
                  projectAvailableHours.push(+convertedHoursMins);
                }
              } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
                if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                  projectAvailableHours.push(+milestoneTask.ExpectedTime);
                }
              }


              // Gantt Chart Sub Object 
              if (milestone.Title === milestoneTask.Milestone) {
                if (milestoneTask.Status !== 'Deleted') {
                  let GanttTaskObj = {
                    'pID': milestoneTask.Id,
                    'pName': milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', ''),
                    'pStart': milestoneTask.jsLocalStartDate,
                    'pEnd': milestoneTask.jsLocalEndDate,
                    'pUserStart': convertedStartDate,
                    'pUserEnd': convertedEndDate,
                    'pUserStartDatePart': this.getDatePart(convertedStartDate),
                    'pUserStartTimePart': this.getTimePart(convertedStartDate),
                    'pUserEndDatePart': this.getDatePart(convertedEndDate),
                    'pUserEndTimePart': this.getTimePart(convertedEndDate),
                    'pClass': milestoneTask.Status === 'Completed' ? 'gtaskblue' : milestoneTask.Status === 'In Progress' ? 'gtaskgreen' : milestoneTask.Status === 'Not Started' ? 'ggroupblack' : 'gtaskred',
                    'pLink': '',
                    'pMile': 0,
                    'pRes': milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title !== undefined ? milestoneTask.AssignedTo.Title : '' : '  ',
                    'pComp': milestoneTask.Status === 'Not Confirmed' ? 0 : (milestoneTask.Status === 'Completed' ? 100 : milestoneTask.Status === 'In Progress' ? 50 : 0),
                    'pGroup': milestoneTask.IsCentrallyAllocated === 'Yes' ? 1 : 0,
                    'pParent': milestoneTask.ParentSlot ? milestoneTask.ParentSlot : parseInt("1200000" + milestone.Id + index),
                    'pOpen': milestoneTask.IsCentrallyAllocated === 'Yes' ? 0 : 1,
                    'pDepend': '',
                    'pCaption': '',
                    'pNotes': milestoneTask.Status,
                    'status': milestoneTask.Status,
                    'budgetHours': milestoneTask.ExpectedTime,
                    'spentTime': this.commonService.ajax_addHrsMins([hrsMinObject]),
                    'allowStart': milestoneTask.AllowCompletion === true || milestoneTask.AllowCompletion === 'Yes' ? true : false,
                    'tat': milestoneTask.TATStatus === true || milestoneTask.TATStatus === 'Yes' ? true : false,
                    'tatVal': this.commonService.calcBusinessDays(new Date(milestoneTask.jsLocalStartDate), new Date(milestoneTask.jsLocalEndDate)),
                    'milestoneStatus': milestone.Status,
                    'type': 'task',
                    'editMode': false,
                    'scope': milestoneTask.Comments,
                    'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
                    'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ? this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.Title)
                      > -1 ? true : false : false,
                    'assignedUsers': milestoneTask.assignedUsers,
                    // 'AssignedTo': {ID :  milestoneTask.AssignedTo.ID , Title :  milestoneTask.AssignedTo.Title, Email :  milestoneTask.AssignedTo.EMail,SkillText : milestoneTask.AssignedTo.SkillLevel },
                    'AssignedTo': milestoneTask.AssignedTo.ID ? milestoneTask.AssignedTo : '',
                    'userCapacityEnable': false,
                    'color': milestoneTask.color,
                    'itemType': milestoneTask.Task,
                    'nextTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.NextTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                    'previousTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.PrevTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                    'edited': false,
                    'IsCentrallyAllocated': milestoneTask.IsCentrallyAllocated,
                    'added': false,
                    'submilestone': milestoneTask.SubMilestones,
                    'milestone': milestoneTask.Milestone,
                    'skillLevel': milestoneTask.SkillLevel,
                    'CentralAllocationDone': milestoneTask.CentralAllocationDone,
                    'ActiveCA': milestoneTask.ActiveCA,
                    'assignedUserTimeZone': milestoneTask.assignedUserTimeZone,
                    'parentSlot': milestoneTask.ParentSlot ? milestoneTask.ParentSlot : '',
                    'slotType': milestoneTask.IsCentrallyAllocated === 'Yes' ? 'Slot' : 'Task',
                    'DisableCascade': (milestoneTask.DisableCascade && milestoneTask.DisableCascade === 'Yes') ? true : false,
                    'slotColor': 'white',
                    'deallocateSlot': false,
                    'taskFullName': milestoneTask.Title
                  };

                  taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
                  this.GanttchartData.push(GanttTaskObj);
                  allRetrievedTasks.push(GanttTaskObj);
                  if (GanttTaskObj.itemType !== 'Client Review') {
                    // const tempObj = { 'data': GanttTaskObj };
                    // tempSubmilestones.push(tempObj);
                    let tempObj = {};
                    if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
                      const dummyExistingSlot = tempSubmilestones.find(s => s.data.pID === GanttTaskObj.pID);
                      if (dummyExistingSlot) {
                        dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
                      } else {
                        tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
                        tempSubmilestones.push(tempObj);
                      }
                    } else {
                      if (GanttTaskObj.parentSlot) {
                        const slot = tempSubmilestones.find(t => t.data.pID === +GanttTaskObj.parentSlot);
                        if (slot) {
                          slot.children.push({ 'data': GanttTaskObj });
                        } else {
                          const tempSlot = Object.assign({}, GanttTaskObj);
                          tempSlot.pID = GanttTaskObj.parentSlot;
                          tempSubmilestones.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
                        }
                      } else {
                        tempObj = { 'data': GanttTaskObj };
                        tempSubmilestones.push(tempObj);
                      }
                    }
                  }
                }
              }

              // Close  Gantt Chart Object
            }


            if (tempSubmilestones.length > 0) {

              const tempSubmilestonesWOAT = tempSubmilestones.filter(c => c.data.itemType !== 'Time Booking');
              const subMilData = this.GanttchartData.find(c => c.pName === element.subMile && c.pParent === milestone.Id);
              subMilData.pStart = tempSubmilestonesWOAT[0].data.pStart;
              subMilData.pEnd = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.pEnd;
              subMilData.pUserStart = tempSubmilestonesWOAT[0].data.pStart;
              subMilData.pUserEnd = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.pEnd;
              subMilData.pUserStartDatePart = this.getDatePart(subMilData.pUserStart);
              subMilData.pUserStartTimePart = this.getTimePart(subMilData.pUserStart);
              subMilData.pUserEndDatePart = this.getDatePart(subMilData.pUserEnd);
              subMilData.pUserEndTimePart = this.getTimePart(subMilData.pUserEnd);
              subMilData.tatVal = this.commonService.calcBusinessDays(new Date(subMilData.pStart), new Date(subMilData.pEnd));
            }
            const temptasks = {
              'data': this.GanttchartData.find(c => c.pName === element.subMile && c.pParent === milestone.Id),
              'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
              'children': tempSubmilestones
            }

            submile.push(temptasks);
          }

          const DefaultTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && (c.SubMilestones === null || c.SubMilestones === 'Default') && c.Task !== 'Client Review' && c.Status !== 'Deleted');

          if (DefaultTasks !== undefined) {
            /**
             * excludeSlotsListForHrs is used for exclusion list to consider either slot or subtasks hours for available hours and budget hrs
             */
            const excludeSlotsListForHrs = [];
            for (const milestoneTask of DefaultTasks) {
              taskName = '';
              if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
                excludeSlotsListForHrs.push(milestoneTask.ID);
              } else {
                if (milestoneTask.ParentSlot) {
                  excludeSlotsListForHrs.push(milestoneTask.ID);
                }
              }
              let color = this.colors.filter(c => c.key == milestoneTask.Status)
              if (color.length) {
                milestoneTask.color = color[0].value;
              }
              milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];
              const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
                return milestoneTask.AssignedTo.ID === objt.UserName.ID;
              });
              milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
                ? AssignedUserTimeZone[0].TimeZone.Title ?
                  AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

              const convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.StartDate),
                this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

              milestoneTask.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
                milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

              const convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.DueDate),
                this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

              milestoneTask.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
                milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

              const hrsMinObject = {
                timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
                  milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
                timeMins: milestoneTask.TimeSpent != null ?
                  milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
              };

              if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
                milestoneHoursSpent.push(hrsMinObject);
                projectHoursSpent.push(hrsMinObject);
                if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                  projectHoursAllocated.push(+milestoneTask.ExpectedTime);
                }
              }
              if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
                if (milestoneTask.TimeSpent == null) {
                  projectAvailableHours.push(+milestoneTask.ExpectedTime);
                } else {
                  const mHoursSpentTask = this.commonService.ajax_addHrsMins([hrsMinObject]);
                  const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
                  const convertedHoursMins = this.commonService.convertFromHrsMins(+taskTotalMins);
                  projectAvailableHours.push(+convertedHoursMins);
                }
              } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
                if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                  projectAvailableHours.push(+milestoneTask.ExpectedTime);
                }
              }

              // Gantt Chart Sub Object 

              if (milestone.Title === milestoneTask.Milestone) {
                if (milestoneTask.Status !== 'Deleted') {

                  let GanttTaskObj = {
                    'pID': milestoneTask.Id,
                    'pName': milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', ''),
                    'pStart': milestoneTask.jsLocalStartDate,
                    'pEnd': milestoneTask.jsLocalEndDate,
                    'pUserStart': convertedStartDate,
                    'pUserEnd': convertedEndDate,
                    'pUserStartDatePart': this.getDatePart(convertedStartDate),
                    'pUserStartTimePart': this.getTimePart(convertedStartDate),
                    'pUserEndDatePart': this.getDatePart(convertedEndDate),
                    'pUserEndTimePart': this.getTimePart(convertedEndDate),
                    'pClass': milestoneTask.Status === 'Completed' ? 'gtaskblue' : milestoneTask.Status === 'In Progress' ? 'gtaskgreen' : milestoneTask.Status === 'Not Started' ? 'ggroupblack' : 'gtaskred',
                    'pLink': '',
                    'pMile': 0,
                    'pRes': milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title ? milestoneTask.AssignedTo.Title : '  ' : '  ',
                    'pComp': milestoneTask.Status === 'Not Confirmed' ? 0 : (milestoneTask.Status === 'Completed' ? 100 : milestoneTask.Status === 'In Progress' ? 50 : 0),
                    'pGroup': milestoneTask.IsCentrallyAllocated === 'Yes' ? 1 : 0,
                    'pParent': milestoneTask.Task === 'Client Review' ? 0 : milestoneTask.ParentSlot ? milestoneTask.ParentSlot : milestone.Id,
                    'pOpen': milestoneTask.IsCentrallyAllocated === 'Yes' ? 0 : 1,
                    'pDepend': '',
                    'pCaption': '',
                    'pNotes': milestoneTask.Status,
                    'status': milestoneTask.Status,
                    'budgetHours': milestoneTask.ExpectedTime,
                    'spentTime': this.commonService.ajax_addHrsMins([hrsMinObject]),
                    'allowStart': milestoneTask.AllowCompletion === true || milestoneTask.AllowCompletion === 'Yes' ? true : false,
                    'tat': milestoneTask.TATStatus === true || milestoneTask.TATStatus === 'Yes' ? true : false,
                    'tatVal': this.commonService.calcBusinessDays(milestoneTask.jsLocalStartDate, milestoneTask.jsLocalEndDate),
                    'milestoneStatus': milestone.Status,
                    'type': 'task',
                    'editMode': false,
                    'scope': milestoneTask.Comments,
                    'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
                    'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ?
                      this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.Title)
                        > -1 ? true : false : false,
                    'assignedUsers': milestoneTask.assignedUsers,
                    'AssignedTo': milestoneTask.AssignedTo.ID ? milestoneTask.AssignedTo : '',
                    'userCapacityEnable': false,
                    'color': milestoneTask.color,
                    'itemType': milestoneTask.Task,
                    'nextTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.NextTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                    'previousTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.PrevTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                    'edited': false,
                    'IsCentrallyAllocated': milestoneTask.IsCentrallyAllocated,
                    'added': false,
                    'submilestone': milestoneTask.SubMilestones,
                    'milestone': milestoneTask.Milestone,
                    'skillLevel': milestoneTask.SkillLevel,
                    'CentralAllocationDone': milestoneTask.CentralAllocationDone,
                    'ActiveCA': milestoneTask.ActiveCA,
                    'assignedUserTimeZone': milestoneTask.assignedUserTimeZone,
                    'parentSlot': milestoneTask.ParentSlot ? milestoneTask.ParentSlot : '',
                    'slotType': milestoneTask.IsCentrallyAllocated === 'Yes' ? 'Slot' : 'Task',
                    'DisableCascade': (milestoneTask.DisableCascade && milestoneTask.DisableCascade === 'Yes') ? true : false,
                    'slotColor': 'white',
                    'deallocateSlot': false,
                    'taskFullName': milestoneTask.Title
                  };
                  taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
                  this.GanttchartData.push(GanttTaskObj);
                  allRetrievedTasks.push(GanttTaskObj);

                  if (GanttTaskObj.itemType !== 'Client Review') {
                    let tempObj = {};
                    if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
                      const dummyExistingSlot = submile.find(s => s.data.pID === GanttTaskObj.pID);
                      if (dummyExistingSlot) {
                        dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
                      } else {
                        tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
                        submile.push(tempObj);
                      }
                    } else {
                      if (GanttTaskObj.parentSlot) {
                        const slot = submile.find(t => t.data.pID === +GanttTaskObj.parentSlot);
                        if (slot) {
                          slot.children.push({ 'data': GanttTaskObj });
                        } else {
                          const tempSlot = Object.assign({}, GanttTaskObj);
                          tempSlot.pID = GanttTaskObj.parentSlot;
                          submile.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
                        }
                      } else {
                        tempObj = { 'data': GanttTaskObj };
                        submile.push(tempObj);
                      }
                    }
                  }
                }
              }
            }
          }

          const milestoneTemp = this.GanttchartData.find(c => c.pID === milestone.Id);
          if (milestoneTemp) {
            milestoneTemp.spentTime = milestoneHoursSpent.length > 0 ? this.commonService.ajax_addHrsMins(milestoneHoursSpent) : '0:0';
            const tempmilestone = {
              'data': milestoneTemp,
              'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
              'children': submile
            }

            this.milestoneData.push(tempmilestone);
          }

          const clientReviewObj = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && (c.SubMilestones === null || c.SubMilestones === 'Default') && c.Task === 'Client Review' && c.Status !== 'Deleted');

          if (clientReviewObj.length > 0) {
            clientReviewObj[0].assignedUsers = [{ Title: '', userType: '' }];
            const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
              return clientReviewObj[0].AssignedTo.ID === objt.UserName.ID;
            });
            clientReviewObj[0].assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
              ? AssignedUserTimeZone[0].TimeZone.Title ?
                AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

            const convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(clientReviewObj[0].StartDate),
              this.sharedObject.currentUser.timeZone, clientReviewObj[0].assignedUserTimeZone);

            clientReviewObj[0].jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
              clientReviewObj[0].assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

            const convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(clientReviewObj[0].DueDate),
              this.sharedObject.currentUser.timeZone, clientReviewObj[0].assignedUserTimeZone);

            clientReviewObj[0].jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
              clientReviewObj[0].assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

            let color = this.colors.filter(c => c.key == clientReviewObj[0].Status)
            if (color.length) {
              clientReviewObj[0].color = color[0].value;
            }

            let GanttTaskObj = {
              'pID': clientReviewObj[0].Id,
              'pName': clientReviewObj[0].Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + clientReviewObj[0].Milestone + ' ', ''),
              'pStart': clientReviewObj[0].jsLocalStartDate,
              'pEnd': clientReviewObj[0].jsLocalEndDate,
              'pUserStart': convertedStartDate,
              'pUserEnd': convertedEndDate,
              'pUserStartDatePart': this.getDatePart(convertedStartDate),
              'pUserStartTimePart': this.getTimePart(convertedStartDate),
              'pUserEndDatePart': this.getDatePart(convertedEndDate),
              'pUserEndTimePart': this.getTimePart(convertedEndDate),
              'pClass': clientReviewObj[0].Status === 'Completed' ? 'gtaskblue' : clientReviewObj[0].Status === 'In Progress' ? 'gtaskgreen' : clientReviewObj[0].Status === 'Not Started' ? 'ggroupblack' : 'gtaskred',
              'pLink': '',
              'pMile': 0,
              'pRes': clientReviewObj[0].AssignedTo ? clientReviewObj[0].AssignedTo.Title ? clientReviewObj[0].AssignedTo.Title : '  ' : '  ',
              'pComp': clientReviewObj[0].Status === 'Not Confirmed' ? 0 : (clientReviewObj[0].Status === 'Completed' ? 100 : clientReviewObj[0].Status === 'In Progress' ? 50 : 0),
              'pGroup': 0,
              'pParent': clientReviewObj[0].Task === 'Client Review' ? 0 : milestone.Id,
              'pOpen': 1,
              'pDepend': i,
              'pCaption': '',
              'pNotes': clientReviewObj[0].Status,
              'status': clientReviewObj[0].Status,
              'budgetHours': clientReviewObj[0].ExpectedTime,
              'allowStart': clientReviewObj[0].AllowCompletion === true || clientReviewObj[0].AllowCompletion === 'Yes' ? true : false,
              'tat': clientReviewObj[0].TATStatus === true || clientReviewObj[0].TATStatus === 'Yes' ? true : false,
              'tatVal': this.commonService.calcBusinessDays(new Date(clientReviewObj[0].jsLocalStartDate), new Date(clientReviewObj[0].jsLocalEndDate)),
              'milestoneStatus': milestone.Status,
              'type': 'task',
              'editMode': false,
              'scope': clientReviewObj[0].Comments,
              'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
              'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ?
                this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.Title)
                  > -1 ? true : false : false,
              'assignedUsers': clientReviewObj[0].assignedUsers,
              'AssignedTo': clientReviewObj[0].AssignedTo,
              'userCapacityEnable': false,
              'color': clientReviewObj[0].color,
              'itemType': clientReviewObj[0].Task,
              'nextTask': clientReviewObj[0].NextTasks !== null ? clientReviewObj[0].NextTasks.replace(new RegExp(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ', 'g'), "").replace(new RegExp(clientReviewObj[0].Milestone + ' ', 'g'), "").replace(/#/gi, '') : null, //.replace(/ /g,'')
              'previousTask': clientReviewObj[0].PrevTasks !== null ? clientReviewObj[0].PrevTasks.replace(new RegExp(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ', 'g'), "").replace(new RegExp(clientReviewObj[0].Milestone + ' ', 'g'), "").replace(/#/gi, '') : null, //.replace(/ /g,'')
              'edited': false,
              'IsCentrallyAllocated': 'No',
              'added': false,
              'submilestone': clientReviewObj[0].SubMilestones,
              'milestone': clientReviewObj[0].Milestone,
              'skillLevel': clientReviewObj[0].SkillLevel,
              'CentralAllocationDone': clientReviewObj[0].CentralAllocationDone,
              'ActiveCA': clientReviewObj[0].ActiveCA,
              'assignedUserTimeZone': clientReviewObj[0].assignedUserTimeZone,
              'slotType': '',
              'DisableCascade': clientReviewObj[0].DisableCascade && clientReviewObj[0].DisableCascade === 'Yes' ? true : false,
              'slotColor': 'white'
            };
            i = clientReviewObj[0].Id;
            if (GanttTaskObj.status !== 'Deleted') {
              this.GanttchartData.push(GanttTaskObj);
            }

            const tempmilestone = { 'data': GanttTaskObj, 'children': [] }
            this.milestoneData.push(tempmilestone);

          }
        }
        else {
          milestoneTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title);

          let tempSubmilestones = [];
          let GanttTaskObj;
          let CRObj;
          const excludeSlotsListForHrs = [];
          for (const milestoneTask of milestoneTasks) {
            taskName = '';

            if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
              excludeSlotsListForHrs.push(milestoneTask.ID);
            } else {
              if (milestoneTask.ParentSlot) {
                excludeSlotsListForHrs.push(milestoneTask.ID);
              }
            }
            let color = this.colors.filter(c => c.key == milestoneTask.Status)
            if (color.length) {
              milestoneTask.color = color[0].value;
            }
            milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];
            const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
              return milestoneTask.AssignedTo.ID === objt.UserName.ID;
            });
            milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
              ? AssignedUserTimeZone[0].TimeZone.Title ?
                AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

            const convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.StartDate),
              this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

            milestoneTask.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
              milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

            const convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(milestoneTask.DueDate),
              this.sharedObject.currentUser.timeZone, milestoneTask.assignedUserTimeZone);

            milestoneTask.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
              milestoneTask.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

            const hrsMinObject = {
              timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
                milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
              timeMins: milestoneTask.TimeSpent != null ?
                milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
            };

            if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
              milestoneHoursSpent.push(hrsMinObject);
              projectHoursSpent.push(hrsMinObject);
              if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                projectHoursAllocated.push(+milestoneTask.ExpectedTime);
              }
            }
            if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
              if (milestoneTask.TimeSpent == null) {
                projectAvailableHours.push(+milestoneTask.ExpectedTime);
              } else {
                const mHoursSpentTask = this.commonService.ajax_addHrsMins([hrsMinObject]);
                const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
                const convertedHoursMins = this.commonService.convertFromHrsMins(+taskTotalMins);
                projectAvailableHours.push(+convertedHoursMins);
              }
            } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
              if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
                projectAvailableHours.push(+milestoneTask.ExpectedTime);
              }
            }

            // Gantt Chart Sub Object 

            if (milestone.Title === milestoneTask.Milestone) {
              if (milestoneTask.Status !== 'Deleted') {
                GanttTaskObj = {
                  'pID': milestoneTask.Id,
                  'pName': milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', ''),
                  'pStart': milestoneTask.jsLocalStartDate,
                  'pEnd': milestoneTask.jsLocalEndDate,
                  'pUserStart': convertedStartDate,
                  'pUserEnd': convertedEndDate,
                  'pUserStartDatePart': this.getDatePart(convertedStartDate),
                  'pUserStartTimePart': this.getTimePart(convertedStartDate),
                  'pUserEndDatePart': this.getDatePart(convertedEndDate),
                  'pUserEndTimePart': this.getTimePart(convertedEndDate),
                  'pClass': milestoneTask.Status === 'Completed' ? 'gtaskblue' : milestoneTask.Status === 'In Progress' ? 'gtaskgreen' : milestoneTask.Status === 'Not Started' ? 'ggroupblack' : 'gtaskred',
                  'pLink': '',
                  'pMile': 0,
                  'pRes': milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title ? milestoneTask.AssignedTo.Title : '  ' : '  ',
                  'pComp': milestoneTask.Status === 'Not Confirmed' ? 0 : (milestoneTask.Status === 'Completed' ? 100 : milestoneTask.Status === 'In Progress' ? 50 : 0),
                  'pGroup': milestoneTask.IsCentrallyAllocated === 'Yes' ? 1 : 0,
                  'pParent': milestoneTask.Task === 'Client Review' ? 0 : milestoneTask.ParentSlot ? milestoneTask.ParentSlot : milestone.Id,
                  'pOpen': milestoneTask.IsCentrallyAllocated === 'Yes' ? 0 : 1,
                  'pDepend': milestoneTask.Task === 'Client Review' ? i : '',
                  'pCaption': '',
                  'pNotes': milestoneTask.Status,
                  'status': milestoneTask.Status,
                  'budgetHours': milestoneTask.ExpectedTime,
                  'spentTime': this.commonService.ajax_addHrsMins([hrsMinObject]),
                  'allowStart': milestoneTask.AllowCompletion === true || milestoneTask.AllowCompletion === 'Yes' ? true : false,
                  'tat': milestoneTask.TATStatus === true || milestoneTask.TATStatus === 'Yes' ? true : false,
                  'tatVal': this.commonService.calcBusinessDays(milestoneTask.jsLocalStartDate, milestoneTask.jsLocalEndDate),
                  'milestoneStatus': milestone.Status,
                  'type': 'task',
                  'editMode': false,
                  'scope': milestoneTask.Comments,
                  'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
                  'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ? this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.Title)
                    > -1 ? true : false : false,
                  'assignedUsers': milestoneTask.assignedUsers,
                  'AssignedTo': milestoneTask.AssignedTo.ID ? milestoneTask.AssignedTo : '',
                  'userCapacityEnable': false,
                  'color': milestoneTask.color,
                  'itemType': milestoneTask.Task,
                  'nextTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.NextTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                  'previousTask': this.taskAllocateCommonService.fetchTaskName(milestoneTask.PrevTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, milestoneTask.Milestone),
                  'edited': false,
                  'IsCentrallyAllocated': milestoneTask.IsCentrallyAllocated,
                  'added': false,
                  'submilestone': milestoneTask.SubMilestones,
                  'milestone': milestoneTask.Milestone,
                  'skillLevel': milestoneTask.SkillLevel,
                  'CentralAllocationDone': milestoneTask.CentralAllocationDone,
                  'ActiveCA': milestoneTask.ActiveCA,
                  'assignedUserTimeZone': milestoneTask.assignedUserTimeZone,
                  'parentSlot': milestoneTask.ParentSlot ? milestoneTask.ParentSlot : '',
                  'DisableCascade': (milestoneTask.DisableCascade && milestoneTask.DisableCascade === 'Yes') ? true : false,
                  'slotType': milestoneTask.IsCentrallyAllocated === 'Yes' ? 'Slot' : 'Task',
                  'slotColor': 'white',
                  'deallocateSlot': false,
                  'taskFullName': milestoneTask.Title
                };

                if (milestoneTask.Task === 'Client Review' && milestoneTask.Status !== 'Deleted') {
                  i = milestoneTask.Id;
                  CRObj = { 'data': GanttTaskObj };

                }
                taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
                this.GanttchartData.push(GanttTaskObj);
                allRetrievedTasks.push(GanttTaskObj);

                if (GanttTaskObj.itemType !== 'Client Review') {
                  let tempObj = {};
                  if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
                    const dummyExistingSlot = tempSubmilestones.find(s => s.data.pID === GanttTaskObj.pID);
                    if (dummyExistingSlot) {
                      dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
                    } else {
                      tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
                      tempSubmilestones.push(tempObj);
                    }
                  } else {
                    if (GanttTaskObj.parentSlot) {
                      const slot = tempSubmilestones.find(t => t.data.pID === +GanttTaskObj.parentSlot);
                      if (slot) {
                        slot.children.push({ 'data': GanttTaskObj });
                      } else {
                        const tempSlot = Object.assign({}, GanttTaskObj);
                        tempSlot.pID = GanttTaskObj.parentSlot;
                        tempSubmilestones.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
                      }
                    } else {
                      tempObj = { 'data': GanttTaskObj };
                      tempSubmilestones.push(tempObj);
                    }
                  }
                }
              }
            }

            // Close  Gantt Chart Object
          }
          var milestoneTemp = this.GanttchartData.find(c => c.pID === milestone.Id);
          if (milestoneTemp) {
            milestoneTemp.spentTime = milestoneHoursSpent.length > 0 ? this.commonService.ajax_addHrsMins(milestoneHoursSpent) : '0:0';

            const tempmilestone = {
              'data': milestoneTemp,
              'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
              'children': tempSubmilestones
            }

            this.milestoneData.push(tempmilestone);
          }

          if (!CRObj && taskName && taskName.replace(/[0-9]/g, '').trim() === 'Client Review') {
            const tempmilestone = { 'data': GanttTaskObj, 'children': [] }
            this.milestoneData.push(tempmilestone);
          }
          else if (CRObj) {
            this.milestoneData.push(CRObj);
          }
        }
      }

      ////// Assign users 

      if (this.projectDetails === undefined) {
        this.assignUsers(allRetrievedTasks);
      }

      this.milestoneData = [...this.milestoneData];
      this.GanttchartData = [...this.GanttchartData];
      this.tempmilestoneData = [];
      this.tempGanttchartData = JSON.parse(JSON.stringify(this.GanttchartData));
      this.tempmilestoneData = JSON.parse(JSON.stringify(this.milestoneData));

      this.loaderenable = false;
    }
    else {
      this.milestoneData = [];
    }

    this.GanttChartView = true;
    this.visualgraph = false;
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));
    this.oProjectDetails.hoursSpent = this.commonService.convertToHrs(projectHoursSpent.length > 0 ? this.commonService.ajax_addHrsMins(projectHoursSpent) : '0:0');
    this.oProjectDetails.hoursSpent = parseFloat(this.oProjectDetails.hoursSpent.toFixed(2));
    this.oProjectDetails.allocatedHours = projectHoursAllocated.reduce((a, b) => a + b, 0).toFixed(2);
    this.oProjectDetails.spentHours = projectAvailableHours.reduce((a, b) => a + b, 0).toFixed(2);
    this.oProjectDetails.totalMilestoneBudgetHours = totalMilestoneBudgetHours.reduce((a, b) => a + b, 0);

    this.oProjectDetails.availableHours = +(+this.oProjectDetails.budgetHours - +this.oProjectDetails.spentHours).toFixed(2);
    this.disableSave = false;
    if (!bFirstLoad) {
      setTimeout(() => {
        this.changeInRestructure = false;
        this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Tasks Saved Successfully' });
      }, 300);
    }
  }



  // *************************************************************************************************************************************
  // Switch between Gantt chart and Tree table View  
  // *************************************************************************************************************************************

  public async assignUsers(allRetrievedTasks) {

    for (let nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
      let milestone = this.milestoneData[nCount];
      if (milestone.data.itemType === 'Client Review') {
        const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(milestone.data, allRetrievedTasks);

        milestone.data.assignedUsers = [];
        const response = await this.formatAssignedUser(assignedUsers);
        milestone.data.assignedUsers = response;
        if (milestone.data.editMode) {
          milestone.data.assignedUsers.forEach(element => {
            if (element.items.find(c => c.value.ID === milestone.data.AssignedTo.ID)) {
              milestone.data.AssignedTo = element.items.find(c => c.value.ID === milestone.data.AssignedTo.ID).value;
            }
          });
        }

      } else if (milestone.children !== undefined) {
        for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
          let submilestone = milestone.children[nCountSub];
          if (submilestone.data.type === 'task') {
            const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(submilestone.data, allRetrievedTasks);

            submilestone.data.assignedUsers = [];
            const response = await this.formatAssignedUser(assignedUsers);
            submilestone.data.assignedUsers = response;
            if (submilestone.data.editMode) {
              submilestone.data.assignedUsers.forEach(element => {
                if (element.items.find(c => c.value.ID === submilestone.data.AssignedTo.ID)) {
                  submilestone.data.AssignedTo = element.items.find(c => c.value.ID === submilestone.data.AssignedTo.ID).value;
                }
              });
            }


          } else if (submilestone.children !== undefined) {
            for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
              const task = submilestone.children[nCountTask];
              const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(task.data, allRetrievedTasks);
              task.data.assignedUsers = [];
              const response = await this.formatAssignedUser(assignedUsers);
              task.data.assignedUsers = response;
              if (task.data.editMode) {
                task.data.assignedUsers.forEach(element => {
                  if (element.items.find(c => c.value.ID === task.data.AssignedTo.ID)) {
                    task.data.AssignedTo = element.items.find(c => c.value.ID === task.data.AssignedTo.ID).value;
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  formatAssignedUser(assignedUsers) {
    const response = []
    const UniqueUserType = assignedUsers.map(c => c.userType).filter((item, index) => assignedUsers.map(c => c.userType).indexOf(item) === index);
    console.log(assignedUsers)

    for (const retRes of UniqueUserType) {
      const Items = [];
      const Users = assignedUsers.filter(c => c.userType === retRes);
      Users.forEach(user => {

        const tempUser = user.UserName ? user.UserName : user;
        Items.push({ label: tempUser.Title, value: { ID: tempUser.ID, Title: tempUser.Title, Email: tempUser.EMail ? tempUser.EMail : tempUser.Email, SkillText: tempUser.SkillText ? tempUser.SkillText : '' } }
        );
      });
      response.push({ label: retRes, items: Items });

    }
    return response;
  }

  showVisualRepresentation() {
    if (this.visualgraph === true) {
      this.visualgraph = false;
    } else {
      this.visualgraph = true;
    }
  }


  // **************************************************************************************************************************************

  //  Cancel Milestone Changes
  // **************************************************************************************************************************************

  CancelChanges(milestone, type) {



    if (type === "discardAll") {
      this.loaderenable = false;
      this.changeInRestructure = false;
      this.milestoneData = JSON.parse(JSON.stringify(this.tempmilestoneData));
      this.convertDateString();
    }
    else if (type === 'task' && milestone.itemType === 'Client Review') {
      const tempMile = this.tempmilestoneData.find(c => c.data.pID === milestone.pID);
      milestone.pStart = new Date(tempMile.data.pStart);
      milestone.pEnd = new Date(tempMile.data.pEnd);
      milestone.pUserStart = new Date(tempMile.data.pUserStart);
      milestone.pUserEnd = new Date(tempMile.data.pUserEnd);
      milestone.pUserStartDatePart = this.getDatePart(milestone.pUserStart);
      milestone.pUserStartTimePart = this.getTimePart(milestone.pUserStart);
      milestone.pUserEndDatePart = this.getDatePart(milestone.pUserEnd);
      milestone.pUserEndTimePart = this.getTimePart(milestone.pUserEnd);
      milestone.editMode = false;
      milestone.edited = false;
      milestone.tat = tempMile.data.tat;
      milestone.tatVal = this.commonService.calcBusinessDays(new Date(milestone.pStart), new Date(milestone.pEnd));
      milestone.AssignedTo = tempMile.data.AssignedTo;
      milestone.allowStart = tempMile.data.allowStart;
      milestone.budgetHours = tempMile.data.budgetHours;

      var index = this.milestoneData.indexOf(this.milestoneData.find(c => c.data === milestone));
      if (index > -1 && index < this.milestoneData.length - 1) {
        this.milestoneData = this.milestoneData.splice(0, index + 1);
        var dbmilestones = this.tempmilestoneData.slice(index + 1, this.tempmilestoneData.length);
        this.milestoneData.push.apply(this.milestoneData, dbmilestones);
        this.convertDateString();
      }
    }
    else {
      this.tempmilestoneData.forEach(element => {
        const getAllTasks = this.getTasksFromMilestones(element, false, false);
        const SelectedTask = getAllTasks.find(c => c.pID === milestone.pID);
        if (SelectedTask !== undefined) {
          milestone.pStart = new Date(SelectedTask.pStart);
          milestone.pEnd = new Date(SelectedTask.pEnd);
          milestone.pUserStart = new Date(SelectedTask.pUserStart);
          milestone.pUserEnd = new Date(SelectedTask.pUserEnd);
          milestone.pUserStartDatePart = this.getDatePart(milestone.pUserStart);
          milestone.pUserStartTimePart = this.getTimePart(milestone.pUserStart);
          milestone.pUserEndDatePart = this.getDatePart(milestone.pUserEnd);
          milestone.pUserEndTimePart = this.getTimePart(milestone.pUserEnd);
          milestone.editMode = false;
          milestone.edited = false;
          milestone.tat = SelectedTask.tat;
          milestone.AssignedTo = SelectedTask.AssignedTo;
          milestone.allowStart = SelectedTask.allowStart;
          milestone.budgetHours = SelectedTask.budgetHours;
          milestone.DisableCascade = SelectedTask.DisableCascade;
          milestone.tatVal = this.commonService.calcBusinessDays(new Date(milestone.pStart), new Date(milestone.pEnd));
          milestone.slotColor = SelectedTask.slotColor;
        }
      });

      var milestoneIndex = this.milestoneData.indexOf(this.milestoneData.find(c => c.data.pName.split('(')[0].trim() === milestone.milestone));
      if (milestoneIndex > -1) {
        if (milestone.submilestone !== null && milestone.submilestone !== "Default") {
          var submilestoneIndex = this.milestoneData[milestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children.find(c => c.data.pName === milestone.submilestone));

          if (submilestoneIndex > -1) {
            var taskindex = this.milestoneData[milestoneIndex].children[submilestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children[submilestoneIndex].children.find(c => c.data === milestone));
            const subTaskIndex = 0;

            // replace all milestone from edited milestone
            this.milestoneData = this.milestoneData.splice(0, milestoneIndex + 1);
            var dbmilestones = this.tempmilestoneData.slice(milestoneIndex + 1, this.tempmilestoneData.length);
            this.milestoneData.push.apply(this.milestoneData, dbmilestones);

            // replace all submilestone from edited submilestone
            var submilestones = this.milestoneData[milestoneIndex].children.splice(0, submilestoneIndex + 1);
            var dbsubmilestones = this.tempmilestoneData[milestoneIndex].children.slice(submilestoneIndex + 1, this.tempmilestoneData[milestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children = [];
            this.milestoneData[milestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children, submilestones);
            this.milestoneData[milestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children, dbsubmilestones);


            // replace all tasks from edited task
            var tasks = this.milestoneData[milestoneIndex].children[submilestoneIndex].children.splice(0, taskindex + 1);
            var dbtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children.slice(taskindex + 1, this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children[submilestoneIndex].children = [];
            this.milestoneData[milestoneIndex].children[submilestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children[submilestoneIndex].children, tasks);
            this.milestoneData[milestoneIndex].children[submilestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children[submilestoneIndex].children, dbtasks);

            if (this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].data.slotType === 'Slot') {
              // replace all subtasks from edited task
              var dbtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children;
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children = [];
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children.push.apply(this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children, dbtasks);
            }

            this.convertDateString();
          }
        }
        else {
          var submilestoneIndex = this.milestoneData[milestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children.find(c => c.data.pName === milestone.pName));
          const subTaskIndex = 0;
          if (submilestoneIndex > -1) {

            // replace all milestone from edited milestone
            this.milestoneData = this.milestoneData.splice(0, milestoneIndex + 1);
            var dbmilestones = this.tempmilestoneData.slice(milestoneIndex + 1, this.tempmilestoneData.length);
            this.milestoneData.push.apply(this.milestoneData, dbmilestones);

            // replace all submilestone from edited submilestone
            var submilestones = this.milestoneData[milestoneIndex].children.splice(0, submilestoneIndex + 1);
            var dbsubmilestones = this.tempmilestoneData[milestoneIndex].children.slice(submilestoneIndex + 1, this.tempmilestoneData[milestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children = [];
            this.milestoneData[milestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children, submilestones);
            this.milestoneData[milestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children, dbsubmilestones);

            if (this.milestoneData[milestoneIndex].children[submilestoneIndex].data.slotType === 'Slot') {
              // replace all tasks from edited task
              var dbtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children;
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children = [];
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children.push.apply(this.milestoneData[milestoneIndex].children[submilestoneIndex].children, dbtasks);
            }
            this.convertDateString();
          }
        }

      }

    }
    this.tempmilestoneData = JSON.parse(JSON.stringify(this.tempmilestoneData));
    let allReturnedTasks = [];
    this.milestoneData.forEach(milestone => {
      allReturnedTasks.push.apply(this.getTasksFromMilestones(milestone, false, false));
    });

    this.assignUsers(allReturnedTasks);

    this.milestoneData = [...this.milestoneData];
  }
  // tslint:enable

  // **************************************************************************************************************************************

  //  Convert string date to date format after cancel the changes
  // **************************************************************************************************************************************


  convertDateString() {
    this.milestoneData.forEach(milestone => {
      milestone.data.pStart = new Date(milestone.data.pStart);
      milestone.data.pEnd = new Date(milestone.data.pEnd);
      milestone.data.pUserStart = new Date(milestone.data.pUserStart);
      milestone.data.pUserEnd = new Date(milestone.data.pUserEnd);
      milestone.data.pUserStartDatePart = this.getDatePart(milestone.data.pUserStart);
      milestone.data.pUserStartTimePart = this.getTimePart(milestone.data.pUserStart);
      milestone.data.pUserEndDatePart = this.getDatePart(milestone.data.pUserEnd);
      milestone.data.pUserEndTimePart = this.getTimePart(milestone.data.pUserEnd);
      milestone.data.tatVal = this.commonService.calcBusinessDays(new Date(milestone.data.pStart), new Date(milestone.data.pEnd));
      if (milestone.children !== undefined && milestone.children.length > 0) {
        milestone.children.forEach(submilestone => {
          submilestone.data.pStart = new Date(submilestone.data.pStart);
          submilestone.data.pEnd = new Date(submilestone.data.pEnd);
          submilestone.data.pUserStart = new Date(submilestone.data.pUserStart);
          submilestone.data.pUserEnd = new Date(submilestone.data.pUserEnd);
          submilestone.data.pUserStartDatePart = this.getDatePart(submilestone.data.pUserStart);
          submilestone.data.pUserStartTimePart = this.getTimePart(submilestone.data.pUserStart);
          submilestone.data.pUserEndDatePart = this.getDatePart(submilestone.data.pUserEnd);
          submilestone.data.pUserEndTimePart = this.getTimePart(submilestone.data.pUserEnd);
          submilestone.data.tatVal = this.commonService.calcBusinessDays
            (new Date(submilestone.data.pStart), new Date(submilestone.data.pEnd));
          if (submilestone.children !== undefined && submilestone.children.length > 0) {
            submilestone.children.forEach(task => {
              task.data.pStart = new Date(task.data.pStart);
              task.data.pEnd = new Date(task.data.pEnd);
              task.data.pUserStart = new Date(task.data.pUserStart);
              task.data.pUserEnd = new Date(task.data.pUserEnd);
              task.data.pUserStartDatePart = this.getDatePart(task.data.pUserStart);
              task.data.pUserStartTimePart = this.getTimePart(task.data.pUserStart);
              task.data.pUserEndDatePart = this.getDatePart(task.data.pUserEnd);
              task.data.pUserEndTimePart = this.getTimePart(task.data.pUserEnd);
              task.data.tatVal = this.commonService.calcBusinessDays(new Date(task.data.pStart), new Date(task.data.pEnd));
              if (task.children !== undefined && task.children.length > 0) {
                task.children.forEach(subTask => {
                  subTask.data.pStart = new Date(subTask.data.pStart);
                  subTask.data.pEnd = new Date(subTask.data.pEnd);
                  subTask.data.pUserStart = new Date(subTask.data.pUserStart);
                  subTask.data.pUserEnd = new Date(subTask.data.pUserEnd);
                  subTask.data.pUserStartDatePart = this.getDatePart(subTask.data.pUserStart);
                  subTask.data.pUserStartTimePart = this.getTimePart(subTask.data.pUserStart);
                  subTask.data.pUserEndDatePart = this.getDatePart(subTask.data.pUserEnd);
                  subTask.data.pUserEndTimePart = this.getTimePart(subTask.data.pUserEnd);
                  subTask.data.tatVal = this.commonService.calcBusinessDays(new Date(subTask.data.pStart), new Date(subTask.data.pEnd));
                });
              }
            });
            const subMiledb = submilestone.children.filter(c => c.data.pName.toLowerCase().indexOf
              ('adhoc') === -1 && c.data.pName.toLowerCase().indexOf('tb') === -1 && !c.data.parentSlot);
            if (subMiledb.length) {
              submilestone.data.pStart = new Date(subMiledb[0].data.pStart);
              submilestone.data.pEnd = new Date(subMiledb[subMiledb.length - 1].data.pEnd);
              submilestone.data.pUserStart = new Date(subMiledb[0].data.pUserStart);
              submilestone.data.pUserEnd = new Date(subMiledb[subMiledb.length - 1].data.pUserEnd);
              submilestone.data.pUserStartDatePart = this.getDatePart(submilestone.data.pUserStart);
              submilestone.data.pUserStartTimePart = this.getTimePart(submilestone.data.pUserStart);
              submilestone.data.pUserEndDatePart = this.getDatePart(submilestone.data.pUserEnd);
              submilestone.data.pUserEndTimePart = this.getTimePart(submilestone.data.pUserEnd);
              submilestone.data.tatVal = this.commonService.calcBusinessDays
                (new Date(submilestone.data.pStart), new Date(submilestone.data.pEnd));
            }
          }
        });

        const tempMile = milestone.children.filter(c => c.data.pName.toLowerCase().indexOf('adhoc') ===
          -1 && c.data.pName.toLowerCase().indexOf('tb') === -1);
        milestone.data.pStart = new Date(tempMile[0].data.pStart);
        milestone.data.pEnd = new Date(tempMile[tempMile.length - 1].data.pEnd);
        milestone.data.pUserStart = new Date(tempMile[0].data.pUserStart);
        milestone.data.pUserEnd = new Date(tempMile[tempMile.length - 1].data.pUserEnd);
        milestone.data.pUserStartDatePart = this.getDatePart(milestone.data.pUserStart);
        milestone.data.pUserStartTimePart = this.getTimePart(milestone.data.pUserStart);
        milestone.data.pUserEndDatePart = this.getDatePart(milestone.data.pUserEnd);
        milestone.data.pUserEndTimePart = this.getTimePart(milestone.data.pUserEnd);
        milestone.data.tatVal = this.commonService.calcBusinessDays(new Date(milestone.data.pStart), new Date(milestone.data.pEnd));
      }
    });
  }


  // **************************************************************************************************

  //  Edit Task
  // **************************************************************************************************


  editTask(task, rowNode) {
    task.assignedUsers.forEach(element => {

      if (element.items.find(c => c.value.ID === task.AssignedTo.ID)) {
        task.AssignedTo = element.items.find(c => c.value.ID === task.AssignedTo.ID).value;
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

  // *************************************************************************************************
  // Cancel Edit Task
  // *************************************************************************************************

  cancelEditTask(task) {
    task.editMode = false;
  }

  // *************************************************************************************************
  //  Add Comment
  // **************************************************************************************************
  openComment(task, rowNode) {
    this.tempComment = task.scope;
    this.task = task;
    this.displayComment = true;

    if (rowNode.parent !== null) {
      if (rowNode.parent.parent === null) {
        rowNode.parent.data.edited = true;
      } else {
        rowNode.parent.parent.data.edited = true;
        rowNode.parent.data.edited = true;

      }
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
    if (data.type === 'task' && data.milestoneStatus !== 'Completed' &&
      (data.status !== 'Completed' && data.status !== 'Abandon' && data.status !== 'Auto Closed'
        && data.status !== 'Hold')) {

      this.taskMenu = [
        { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editTask(data, rowNode) },
      ];

      if (data.itemType !== 'Client Review' && data.itemType !== 'Send to client') {
        this.taskMenu.push({ label: 'Scope', icon: 'pi pi-comment', command: (event) => this.openComment(data, rowNode) });

        if (data.AssignedTo.ID !== undefined && data.AssignedTo.ID > -1 && data.pRes !== 'QC' && data.pRes !== 'Edit') {
          this.taskMenu.push({ label: 'User Capacity', icon: 'pi pi-camera', command: (event) => this.getUserCapacity(data) });
        }
      }
    }
  }

  openPopupEdit(data, rowNode) {
    this.taskMenu = [];
    if (data.itemType !== 'Client Review' && data.itemType !== 'Send to client') {
      this.taskMenu.push({ label: 'Scope', icon: 'pi pi-comment', command: (event) => this.openComment(data, rowNode) });
    }
  }

  // *************************************************************************************************
  // hide popup menu on production
  // ***********************************************************************************************

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


  modelChanged(event) {
    event.editMode = true;
    event.edited = true;
  }

  // **************************************************************************************************
  //  To get User capacity
  //
  // ************************************************************************************************

  getUserCapacity(milestoneTask) {

    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserName.ID === milestoneTask.AssignedTo.ID;
    });

    const ref = this.dialogService.open(UsercapacityComponent, {
      data: {
        task: milestoneTask,
        startTime: milestoneTask.pUserStart,
        endTime: milestoneTask.pUserEnd,
      },
      width: '90vw',

      header: milestoneTask.submilestone ? milestoneTask.milestone + ' ' + milestoneTask.pName
        + ' ( ' + milestoneTask.submilestone + ' )' : milestoneTask.milestone + ' ' + milestoneTask.pName,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe((UserCapacity: any) => {
    });

  }

  sortByDate(array, prop, order) {
    array.sort((a, b) => {
      a = new Date(a.data[prop]).getTime();
      b = new Date(b.data[prop]).getTime();
      return order === 'asc' ? a - b : b - a;
    });
    return array;
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

      header: 'Task Allocation ',
      width: '100vw',
      height: '100vh',
      contentStyle: { "height": "90vh", "overflow": "auto" },
      closable: false,

    });

    ref.onClose.subscribe((RestructureMilestones: any) => {

      let allReturnedTasks = [];
      this.loaderenable = true;
      let tempSubmilestones = [];
      let tempmilestoneId = 120000000;
      if (RestructureMilestones) {
        tempmilestoneId++;
        let tempmilestoneData = [];
        let milestoneedit = false;
        const nodesNew = [];
        for (const nodeOrder of RestructureMilestones.nodeOrder) {
          const node = RestructureMilestones.nodes.find(e => e.id === nodeOrder);
          nodesNew.push(node);
        }
        RestructureMilestones.nodes = nodesNew;


        RestructureMilestones.nodes.forEach(milestone => {
          let CRObj;
          let temptasks = [];
          let submilestoneposition = 1;
          let TempSubmilePositionArray = [];
          let milestoneObj = this.getObjectByValue(milestone, 'milestone', tempmilestoneId, undefined);

          if (milestone.submilestone.nodes.length > 1) {
            var submile = [];
            milestone.submilestone.nodes.forEach(submilestone => {
              if (submilestone.label !== 'Default') {
                if (TempSubmilePositionArray.length === 0) {
                  const obj = {
                    'name': submilestone.label,
                    'position': submilestoneposition.toString()
                  }
                  submilestoneposition++;
                  TempSubmilePositionArray.push(obj);
                }
                let nextsubmilestones = milestone.submilestone.nodes.filter(c => milestone.submilestone.links.filter(c => c.source === submilestone.id).map(c => c.target).includes(c.id)).map(c => c.label); //.replace(/ /g, '')

                if (nextsubmilestones !== "") {
                  nextsubmilestones.forEach(element => {
                    if (TempSubmilePositionArray.find(c => c.name === element) === undefined) {
                      const obj = {
                        'name': element,
                        'position': submilestoneposition.toString(),
                      }
                      TempSubmilePositionArray.push(obj);
                    }
                    else {
                      submilestoneposition--;
                    }
                  });
                  submilestoneposition++;
                }
                else {
                  if (TempSubmilePositionArray.find(c => c.name === submilestone.label) === undefined) {
                    submilestoneposition++;
                    const obj = {
                      'name': submilestone.label,
                      'position': submilestoneposition.toString(),
                    }
                    TempSubmilePositionArray.push(obj);
                  }
                }

              }
              let submilestoneObj = this.getObjectByValue(submilestone, 'submilestone', tempmilestoneId, TempSubmilePositionArray);


              if (submilestone.task.nodes.length > 0) {
                submilestone.task.nodes.forEach(task => {
                  let nextTasks = submilestone.task.nodes.filter(c => submilestone.task.links.filter(c => c.source === task.id).map(c => c.target).includes(c.id));
                  nextTasks = nextTasks.map(c => c.label).join(';')
                  let previousTasks = submilestone.task.nodes.filter(c => submilestone.task.links.filter(c => c.target === task.id).map(c => c.source).includes(c.id));
                  previousTasks = previousTasks.map(c => c.label).join(';')
                  let TaskObj = this.getTaskObjectByValue(task, 'ggroupblack', milestone, nextTasks, previousTasks, submilestone);
                  previousTasks = previousTasks === "" ? null : previousTasks;
                  nextTasks = nextTasks === "" ? null : nextTasks;

                  let oExistingTask = this.tempGanttchartData.find(c => c.pID === task.dbId);
                  if (oExistingTask !== undefined) {
                    oExistingTask = this.getExistindData(oExistingTask);
                    if (oExistingTask.previousTask !== previousTasks || oExistingTask.nextTask !== nextTasks) {
                      if (submilestoneObj.pName === 'Default') {
                        oExistingTask.editMode = true;
                        oExistingTask.edited = true;
                        milestoneedit = true;
                      }
                      else {
                        oExistingTask.editMode = true;
                        oExistingTask.edited = true;
                        submilestoneObj.editMode = true;
                        submilestoneObj.edited = true;
                        milestoneedit = true;
                      }
                    }
                    oExistingTask.nextTask = nextTasks;
                    oExistingTask.previousTask = previousTasks;
                    if (submilestoneObj.pName === 'Default' && task.taskType !== 'Adhoc' && task.taskType !== 'TB') {
                      CRObj = { 'data': oExistingTask };
                      allReturnedTasks.push(oExistingTask);
                    }
                    else {
                      const tempObj = { 'data': oExistingTask };
                      allReturnedTasks.push(oExistingTask);
                      temptasks.push(tempObj);
                    }
                  }
                  else {
                    if (submilestoneObj.pName === 'Default' && task.taskType !== 'Adhoc' && task.taskType !== 'TB') {
                      milestoneedit = true;
                      CRObj = { 'data': TaskObj };
                      allReturnedTasks.push(TaskObj);
                    }
                    else {
                      if (submilestoneObj !== undefined) {
                        submilestoneObj.editMode = true;
                        submilestoneObj.edited = true;
                      }
                      milestoneedit = true;
                      const tempObj = { 'data': TaskObj };
                      allReturnedTasks.push(TaskObj);
                      temptasks.push(tempObj);
                    }
                  }
                });

                if (submilestoneObj.pName !== 'Default') {
                  if (this.tempGanttchartData.find(c => c.pID === submilestone.dbId) !== undefined && submilestoneObj.editMode === true && submilestoneObj.edited === true) {
                    this.tempGanttchartData.find(c => c.pID === submilestone.dbId).editMode = true;
                    this.tempGanttchartData.find(c => c.pID === submilestone.dbId).edited = true;
                  }
                  const tempsub = {
                    'data': this.tempGanttchartData.find(c => c.pID === submilestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.pID === submilestone.dbId) : submilestoneObj,
                    'children': temptasks,
                    'expanded': false,
                  }
                  temptasks = [];
                  submile.push(tempsub);
                }
                else if (submilestoneObj.pName === 'Default' || temptasks.length > 0) {
                  temptasks.forEach(element => {

                    const tempsub = {
                      'data': this.tempGanttchartData.find(c => c.pID === element.data.pID),
                    }

                    submile.push(tempsub);
                  });
                  temptasks = [];
                }

              }
            });

            let expand = false;
            submile.forEach(element => {
              expand = expand === false ? (element.data.status === 'Not Saved' ? true : false) : true;
              if (element.children !== undefined) {
                element.children = this.sortByDate(element.children, 'pStart', 'asc');
                element.children.forEach(task => {
                  element.expanded = element.expanded === false ? (task.data.status === 'Not Saved' ? true : false) : true;
                });
              }
            });
            if (milestoneedit === true && this.tempGanttchartData.find(c => c.pID === milestone.dbId) !== undefined) {
              this.tempGanttchartData.find(c => c.pID === milestone.dbId).editMode = true;
              this.tempGanttchartData.find(c => c.pID === milestone.dbId).edited = true;
            }
            const tempmilestone = {
              'data': this.tempGanttchartData.find(c => c.pID === milestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.pID === milestone.dbId) : milestoneObj,
              'expanded': expand,
              'children': submile
            }
            tempmilestoneData.push(tempmilestone);
            if (CRObj !== undefined) {
              tempmilestoneData.push(CRObj);
            }
          }
          else {

            milestone.submilestone.nodes[0].task.nodes.forEach(task => {
              let nextTasks = milestone.submilestone.nodes[0].task.nodes.filter(c => milestone.submilestone.nodes[0].task.links.filter(c => c.source === task.id).map(c => c.target).includes(c.id));
              nextTasks = nextTasks.map(c => c.label).join(';');
              let previousTasks = milestone.submilestone.nodes[0].task.nodes.filter(c => milestone.submilestone.nodes[0].task.links.filter(c => c.target === task.id).map(c => c.source).includes(c.id));
              previousTasks = previousTasks.map(c => c.label).join(';');
              let TaskObj = this.getTaskObjectByValue(task, 'gtaskred', milestone, nextTasks, previousTasks, undefined);

              previousTasks = previousTasks === "" ? null : previousTasks;
              nextTasks = nextTasks === "" ? null : nextTasks;

              let oExistingTask = this.tempGanttchartData.find(c => c.pID === task.dbId);
              if (oExistingTask !== undefined) {

                oExistingTask = this.getExistindData(oExistingTask);

                if (oExistingTask.previousTask !== previousTasks || oExistingTask.nextTask !== nextTasks) {
                  oExistingTask.editMode = true;
                  oExistingTask.edited = true;
                  milestoneedit = true;
                }
                oExistingTask.nextTask = nextTasks;
                oExistingTask.previousTask = previousTasks;

                if (task.taskType !== 'Client Review') {
                  const tempObj = { 'data': oExistingTask };
                  allReturnedTasks.push(oExistingTask);
                  temptasks.push(tempObj);
                }
                else {
                  CRObj = { 'data': oExistingTask };
                  allReturnedTasks.push(oExistingTask);
                }
              }
              else {
                if (task.taskType !== 'Client Review') {
                  milestoneedit = true;
                  const tempObj = { 'data': TaskObj };
                  allReturnedTasks.push(TaskObj);
                  temptasks.push(tempObj);
                }
                else {
                  milestoneedit = true;
                  CRObj = { 'data': TaskObj };
                  allReturnedTasks.push(TaskObj);
                }
              }
            });
            let mileexpand = false;
            temptasks = this.sortByDate(temptasks, 'pStart', 'asc');
            temptasks.forEach(element => {
              mileexpand = mileexpand == false ? (element.data.status === 'Not Saved' ? true : false) : true;
            });
            if (milestoneedit === true) {
              this.tempGanttchartData.find(c => c.pID === milestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.pID === milestone.dbId).edited = true : milestoneObj.edited = true;
            }
            let oExistingMil = this.tempGanttchartData.find(c => c.pID === milestone.dbId);

            if (oExistingMil !== undefined) {
              if (temptasks.filter(c => c.data.pID === undefined || c.data.pID === 0).length > 0) {
                oExistingMil.editMode = true;
                oExistingMil.edited = true;
              }
            }

            const tempmilestone = {
              'data': oExistingMil !== undefined ? oExistingMil : milestoneObj,
              'expanded': mileexpand,
              'children': temptasks
            }
            tempmilestoneData.push(tempmilestone);

            if (CRObj !== undefined) {
              tempmilestoneData.push(CRObj);
            }
          }

        })

        const updatedtempmilestoneData = this.updateMilestoneSubMilestonesDate(tempmilestoneData);

        this.milestoneData = [];
        this.milestoneData.push.apply(this.milestoneData, updatedtempmilestoneData);

        this.assignUsers(allReturnedTasks);
        this.loaderenable = false;
        this.milestoneData = [...this.milestoneData];

        this.changeInRestructure = this.milestoneData.find(c => c.data.editMode === true) !== undefined ? true : false;
        if (this.changeInRestructure) {
          setTimeout(() => {

            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'There are some unsaved changes, Please save them.' });

          }, 300);
        }

        this.tempGanttchartData = JSON.parse(JSON.stringify(this.GanttchartData));
        this.loaderenable = false;
      }
      else {
        this.CancelChanges(tempSubmilestones, 'discardAll');
      }
    });
  }


  updateMilestoneSubMilestonesDate(milestones) {
    const updatedMilestones = milestones;
    updatedMilestones.forEach(milestone => {
      if (milestone.children) {
        milestone.children.forEach(submilestone => {
          if (submilestone.children) {
            submilestone.data.pStart = submilestone.children[0].data.pStart;
            submilestone.data.pUserStart = submilestone.children[0].pUserStart;
            submilestone.data.pUserStartDatePart = submilestone.children[0].data.pUserStartDatePart;
            submilestone.data.pEnd = submilestone.children[submilestone.children.length - 1].data.pEnd;
            submilestone.data.pUserEnd = submilestone.children[submilestone.children.length - 1].data.pUserEnd;
            submilestone.data.pUserEndDatePart = submilestone.children[submilestone.children.length - 1].data.pUserEndDatePart;
          }
        });
        milestone.data.pStart = milestone.children[0].data.pStart;
        milestone.data.pUserStart = milestone.children[0].data.pUserStart;
        milestone.data.pUserStartDatePart = milestone.children[0].data.pUserStartDatePart;
        milestone.data.pEnd = milestone.children[milestone.children.length - 1].data.pEnd;
        milestone.data.pUserEnd = milestone.children[milestone.children.length - 1].data.pUserEnd;
        milestone.data.pUserEndDatePart = milestone.children[milestone.children.length - 1].data.pUserEndDatePart;
      }
    });
    return updatedMilestones;
  }
  // tslint:enable
  // *************************************************************************************************************************************
  // User changes Cascading (User change )
  // *************************************************************************************************************************************

  assignedToUserChanged(milestoneTask) {
    if (milestoneTask.AssignedTo) {
      this.updateNextPreviousTasks(milestoneTask);
      milestoneTask.assignedUserChanged = true;
      if (milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID) {
        milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(milestoneTask.AssignedTo.SkillText);
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
          return milestoneTask.AssignedTo.ID === objt.UserName.ID;
        });

        milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          ? AssignedUserTimeZone[0].TimeZone.Title ?
            AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

        milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);

        milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        /// Change date as user changed in AssignedTo dropdown
      } else {
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        milestoneTask.assignedUserTimeZone = '+5.5';
        milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);

        milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        milestoneTask.skillLevel = milestoneTask.AssignedTo.SkillText;
        milestoneTask.edited = true;
        milestoneTask.pRes = milestoneTask.skillLevel;
      }
    }
  }

  /**
   * Update next previous task of submit/galley(Slot type as Both) slot based on skill/user
   * @param milestoneTask - task whose assigned user changed
   */
  async updateNextPreviousTasks(milestoneTask) {
    const currentTask = milestoneTask;
    const milestone = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ?
      // tslint:disable: max-line-length
      this.milestoneData.find(m => m.data.pName === milestoneTask.milestone + ' (Current)') : this.milestoneData.find(m => m.data.pName === milestoneTask.milestone);
    let subMilestone: TreeNode;
    subMilestone = currentTask.submilestone ? milestone.children.find(t => t.data.pName === currentTask.submilestone) : milestone;
    if (milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID) {
      milestoneTask.IsCentrallyAllocated = 'No';
      milestoneTask.ActiveCA = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'No' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType.replace(/Slot/g, '');
      const taskCount = milestoneTask.pName.match(/\d+$/) ? ' ' + milestoneTask.pName.match(/\d+$/)[0] : '';
      let newName = taskCount ? milestoneTask.itemType + taskCount : milestoneTask.itemType;
      const counter = taskCount ? +taskCount : 1;
      newName = this.getNewTaskName(milestoneTask, subMilestone, counter, newName);
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.pName === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.pName);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.pName === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.pName);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.pName = newName;
    } else if (milestoneTask.slotType === 'Both' && !milestoneTask.AssignedTo.ID) {
      milestoneTask.IsCentrallyAllocated = 'Yes';
      milestoneTask.ActiveCA = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'Yes' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType + 'Slot';
      const taskCount = milestoneTask.pName.match(/\d+$/) ? ' ' + milestoneTask.pName.match(/\d+$/)[0] : '';
      let newName = milestoneTask.itemType + taskCount;
      const counter = taskCount ? +taskCount : 1;
      newName = this.getNewTaskName(milestoneTask, subMilestone, counter, newName);
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.pName === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.pName);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.pName === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.pName);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.pName = newName;
    }
  }

  getNewTaskName(milestoneTask, subMilestone, counter, originalName) {
    subMilestone.children.forEach(task => {
      if (task.data.pName === originalName) {
        counter++;
        originalName = milestoneTask.itemType + ' ' + counter;
      }
    });
    return originalName;
  }
  // *************************************************************************************************
  // Date changes Cascading (Task Date Change)
  // **************************************************************************************************
  // tslint:disable
  async cascadeNode(previousNode, node) {

    var nodeData = node.hasOwnProperty('data') ? node.data : node;
    var prevNodeData = previousNode.hasOwnProperty('data') ? previousNode.data : previousNode;
    const startDate = nodeData.pUserStart;
    const endDate = nodeData.pUserEnd;
    var workingHours = this.workingHoursBetweenDates(startDate, endDate);
    // Check if prev node slot then consider startdate of slot 
    const prevNodeStartDate = ((prevNodeData.slotType === 'Slot' && nodeData.parentSlot) ?
      // || (prevNodeData.slotType === 'Slot' && prevNodeData.clickedInput && prevNodeData.clickedInput === 'start' && nodeData.parentSlot) ?
      new Date(prevNodeData.pStart) : new Date(prevNodeData.pEnd));
    nodeData.pUserStart = this.commonService.calcTimeForDifferentTimeZone(prevNodeStartDate,
      this.sharedObject.currentUser.timeZone, nodeData.assignedUserTimeZone);
    // const chkDate = nodeData.pUserStart.getHours() >= 19 && (nodeData.pUserStart.getHours() <= 23 && nodeData.pUserStart.getMinutes() < 60)
    nodeData.pUserStart = nodeData.pUserStart.getHours() >= 19 || nodeData.pUserStart.getHours() < 9 || prevNodeData.itemType === 'Client Review' || nodeData.itemType === 'Client Review' ?
      this.checkStartDate(new Date(nodeData.pUserStart.getFullYear(), nodeData.pUserStart.getMonth(), (nodeData.pUserStart.getDate() + 1), 9, 0)) :
      nodeData.pUserStart;
    nodeData.pUserEnd = this.checkEndDate(nodeData.pUserStart, workingHours);

    nodeData.pUserStartDatePart = this.getDatePart(nodeData.pUserStart);
    nodeData.pUserStartTimePart = this.getTimePart(nodeData.pUserStart);
    nodeData.pUserEndDatePart = this.getDatePart(nodeData.pUserEnd);
    nodeData.pUserEndTimePart = this.getTimePart(nodeData.pUserEnd);
    nodeData.pStart = this.commonService.calcTimeForDifferentTimeZone(nodeData.pUserStart,
      nodeData.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    nodeData.pEnd = this.commonService.calcTimeForDifferentTimeZone(nodeData.pUserEnd,
      nodeData.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    nodeData.tatVal = this.commonService.calcBusinessDays(new Date(nodeData.pStart), new Date(nodeData.pEnd));
    nodeData.edited = true;
    if (nodeData.IsCentrallyAllocated === 'Yes' && node.slotType !== 'Slot' && !node.parentSlot) {
      nodeData.pRes = nodeData.skillLevel;
    }
  }
  // tslint:enable

  setStartAndEnd(node) {
    node.data.pEnd = node.children !== undefined && node.children.length > 0 ? this.sortDates(node, 'end') : node.data.pEnd;
    node.data.pStart = node.children !== undefined && node.children.length > 0 ? this.sortDates(node, 'start') : node.data.pStart;
    node.data.pUserStart = node.data.pStart;
    node.data.pUserEnd = node.data.pEnd;
    node.data.pUserStartDatePart = this.getDatePart(node.data.pUserStart);
    node.data.pUserStartTimePart = this.getTimePart(node.data.pUserStart);
    node.data.pUserEndDatePart = this.getDatePart(node.data.pUserEnd);
    node.data.pUserEndTimePart = this.getTimePart(node.data.pUserEnd);
    node.data.tatVal = this.commonService.calcBusinessDays(new Date(node.data.pStart), new Date(node.data.pEnd));
  }

  sortDates(node, type) {
    const nodeCopy = Object.assign({}, node).children.filter(c =>
      c.data.pName.toLowerCase().indexOf('adhoc') === -1 && c.data.pName.toLowerCase().indexOf('tb') === -1);
    switch (type) {
      case 'start':
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.pStart);
          const dueDate = new Date(b.data.pStart);
          return startDate > dueDate ? 1 : -1;
        });
        return nodeCopy[0].data.pStart;
      case 'end':
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.pEnd);
          const dueDate = new Date(b.data.pEnd);
          return dueDate > startDate ? 1 : -1;
        });
        return nodeCopy[0].data.pEnd;
      default:
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.pStart);
          const dueDate = new Date(b.data.pStart);
          return startDate > dueDate ? 1 : -1;
        });
        return nodeCopy[0];
    }
  }


  changeDateOfEditedTask(node, type) {
    node.pUserStart = node.tat === true ?
      new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 9, 0) : node.pUserStart;
    node.pUserEnd = type === 'start' && node.pUserStart > node.pUserEnd ? (node.tat === true ?
      new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(),
        node.pUserStart.getDate(), 19, 0) : node.pUserStart) : node.pUserEnd;


    node.pUserStartDatePart = this.getDatePart(node.pUserStart);
    node.pUserStartTimePart = this.getTimePart(node.pUserStart);
    node.pUserEndDatePart = this.getDatePart(node.pUserEnd);
    node.pUserEndTimePart = this.getTimePart(node.pUserEnd);

    node.pStart = this.commonService.calcTimeForDifferentTimeZone(node.pUserStart,
      node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    node.pEnd = this.commonService.calcTimeForDifferentTimeZone(node.pUserEnd,
      node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    node.edited = true;
    if (node.IsCentrallyAllocated === 'Yes' && node.slotType !== 'Slot' && !node.parentSlot) {
      node.pRes = node.skillLevel;
    }

    node.tatVal = this.commonService.calcBusinessDays(new Date(node.pStart), new Date(node.pEnd));
  }

  ResetStartAndEnd() {

    this.milestoneData.forEach(milestone => {

      if (milestone.children !== undefined) {
        milestone.children.forEach(submilestone => {
          if (submilestone.data.type === 'submilestone') {

            this.setStartAndEnd(submilestone);
          }
        });
      }
      this.setStartAndEnd(milestone);
    });
  }

  validateTaskDates(AllTasks) {
    let errorPresnet = false;
    const taskCount = AllTasks.length;
    for (let i = 0; i < taskCount; i = i + 1) {
      const task = AllTasks[i];
      if (task.nextTask && task.status !== 'Completed'
        && task.status !== 'Auto Closed' && task.status !== 'Deleted') {
        const nextTasks = task.nextTask.split(';');
        const AllNextTasks = AllTasks.filter(c => (nextTasks.indexOf(c.pName) > -1));

        const SDTask = AllNextTasks.find(c => c.pStart < task.pEnd && c.status !== 'Completed'
          && c.status !== 'Auto Closed' && c.status !== 'Deleted' && c.allowStart === false);
        if (SDTask) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + SDTask.pName + '  should be greater than end date of ' + task.pName + ' in ' + task.milestone
          });
          errorPresnet = true;
          break;
        }
      }
    }
    return errorPresnet;
  }

  DateChangePart(Node, type) {
    this.reallocationMailArray.length = 0;
    this.deallocationMailArray.length = 0;
    Node.pUserStart = new Date(this.datepipe.transform(Node.pUserStartDatePart, 'MMM d, y') + ' ' + Node.pUserStartTimePart);
    Node.pUserEnd = new Date(this.datepipe.transform(Node.pUserEndDatePart, 'MMM d, y') + ' ' + Node.pUserEndTimePart);
    this.DateChange(Node, type);
  }
  // tslint:disable
  DateChange(Node, type) {
    let previousNode = undefined;
    let milestonePosition = -1;
    let selectedMil = -1;
    let subMilestonePosition = 0;
    this.milestoneData.forEach(milestone => {
      milestonePosition = milestonePosition + 1;
      if (Node === milestone.data && milestone.data.type === 'task') {
        this.changeDateOfEditedTask(milestone.data, type);
        selectedMil = milestonePosition;
        previousNode = milestone.data;
      }
      if (milestone.children !== undefined) {
        milestone.children.forEach(submilestone => {

          if (submilestone.data.type === 'task') {
            if (Node === submilestone.data) {
              this.changeDateOfEditedTask(submilestone.data, type);
              selectedMil = milestonePosition;
              previousNode = submilestone.data;
            }
          }
          if (submilestone.children !== undefined) {
            submilestone.children.forEach(task => {
              if (Node === task.data) {
                subMilestonePosition = parseInt(submilestone.data.position, 10);
                this.changeDateOfEditedTask(task.data, type);
                selectedMil = milestonePosition;
                previousNode = task.data;
              }
            });
          }
        });
      }
    });
    // clickedInput variable is used to know if start or end date changed
    previousNode.clickedInput = type;
    this.cascadeNextNodes(previousNode, subMilestonePosition, selectedMil);
    this.ResetStartAndEnd();
    previousNode.clickedInput = undefined;
  }




  cascadeNextNodes(previousNode, subMilestonePosition, selectedMil) {
    var nextNode = [];
    let sentPrevNode = undefined;
    if (previousNode.nextTask && previousNode.nextTask.indexOf('Client Review') === -1) {
      const currMil = this.milestoneData[selectedMil];
      const allMilestoneTasks = this.getTasksFromMilestones(currMil, false, false);
      const nextTasks = previousNode.nextTask.split(';');
      let retNodes = undefined;
      if (subMilestonePosition !== 0) {
        retNodes = allMilestoneTasks.filter(c => (c.submilestone === previousNode.submilestone && nextTasks.indexOf(c.pName) > -1));
      }
      else {
        retNodes = allMilestoneTasks.filter(c => (nextTasks.indexOf(c.pName) > -1));
      }
      retNodes.forEach(element => {
        nextNode.push(element);
      });
      sentPrevNode = previousNode;
    }
    else {
      if (subMilestonePosition !== 0) {
        const currMil = this.milestoneData[selectedMil];
        let retNodes;
        ///// Set current submilestone end date
        if (previousNode.submilestone !== 'Default' && previousNode.submilestone !== '') {
          sentPrevNode = currMil.children.filter(c => c.data.pName == previousNode.submilestone)[0];
          this.setStartAndEnd(sentPrevNode);
          this.milestoneData[selectedMil].children.filter(c => c.data.pName == previousNode.submilestone)[0] = sentPrevNode;
          retNodes = currMil.children.filter(c => parseInt(c.data.position) == (subMilestonePosition + 1));
        }
        else {
          sentPrevNode = previousNode;
          const allMilestoneTasks = this.getTasksFromMilestones(currMil, false, false);
          const nextTasks = previousNode.nextTask.split(';');
          retNodes = allMilestoneTasks.filter(c => (c.submilestone === previousNode.submilestone && nextTasks.indexOf(c.pName) > -1));
        }

        if (retNodes.length) {
          retNodes.forEach(element => {
            nextNode.push(element);
          });
        }
        else {
          retNodes = currMil.children.filter((c => (c.data.submilestone == '' || c.data.submilestone === 'Default') && !c.data.previousTask));
          subMilestonePosition = 0;
          if (retNodes.length) {
            retNodes.forEach(element => {
              nextNode.push(element);
            });
          }
          else {
            ///// Set current mil end dates
            sentPrevNode = this.milestoneData[selectedMil];
            this.setStartAndEnd(sentPrevNode);
            this.milestoneData[selectedMil] = sentPrevNode;
            if (this.milestoneData.length > (selectedMil + 1)) {
              nextNode.push(this.milestoneData[selectedMil + 1]);
            }
          }
        }
      }
      else {
        sentPrevNode = this.milestoneData[selectedMil];
        this.setStartAndEnd(sentPrevNode);
        this.milestoneData[selectedMil] = sentPrevNode;
        if (this.milestoneData.length > (selectedMil + 1)) {
          nextNode.push(this.milestoneData[selectedMil + 1]);
        }

      }
    }
    if (sentPrevNode.slotType === 'Slot' && sentPrevNode.pID > 0) {
      // if ((sentPrevNode.slotType === 'Slot' && sentPrevNode.pID > 0 && !sentPrevNode.clickedInput) ||
      //   sentPrevNode.slotType === 'Slot' && sentPrevNode.clickedInput) {
      this.compareSlotSubTasksTimeline(sentPrevNode, subMilestonePosition, selectedMil)
    }

    if (nextNode.length) {
      nextNode.forEach(element => {
        // stops cascading if elements cascading is disabled or task is in progress
        if (!element.DisableCascade && element.status !== 'In Progress') {
          // first condition checks if slot is changed due to previous task of slot and if it is updated
          // second condition checks if slot start date is changed
          //else {
          this.cascadeNextTask(sentPrevNode, element, subMilestonePosition, selectedMil);
          //}
        }
      });
    }
  }

  /**
   * Cascading slot subtasks if start date of slot is changed
   * @param sentPrevNode 
   * @param element 
   * @param subMilestonePosition 
   * @param selectedMil 
   */
  async compareSlotSubTasksTimeline(sentPrevNode1, subMilestonePosition, selectedMil) {
    // fetch slot based on submilestone presnt or not
    const sentPrevNode = subMilestonePosition === 0 ? this.milestoneData[selectedMil].children.find(st => st.data.pName === sentPrevNode1.pName) :
      this.milestoneData[selectedMil].children[subMilestonePosition - 1].children.find(st => st.data.pName === sentPrevNode1.pName);
    let slotFirstTask = sentPrevNode ? sentPrevNode.children ? sentPrevNode.children.filter(st => !st.data.previousTask) : [] : [];
    // cascade if slot start date is more than first subtask in slot
    if (slotFirstTask.length) {

      if (!sentPrevNode1.clickedInput || (sentPrevNode1.clickedInput && sentPrevNode1.clickedInput === 'start')) {
        let slotFirstTaskSorted = this.sortByDate(slotFirstTask, 'pUserStart', 'asc');
        if (sentPrevNode.data.pStart > slotFirstTaskSorted[0].data.pStart) {
          //let childIndex = 0;
          // for (const subTask of sentPrevNode.children) {
          //   if (!subTask.data.DisableCascade) {
          //     // If first subtask then cascade based on slot start date and subtask start date
          //     if (!subTask.data.previousTask) {
          //       this.cascadeNextTask(sentPrevNode, subTask, subMilestonePosition, selectedMil);
          //     }
          //     // If next task present then cascade based on first task end date and next subtask
          //     if (subTask.data.nextTask) {
          //       this.cascadeNode(subTask, sentPrevNode.children[childIndex + 1]);
          //     }
          //   }
          //   childIndex++;
          // }
          slotFirstTaskSorted.forEach(element => {
            if (!element.data.DisableCascade && element.data.status !== 'In Progress') {
              this.cascadeNextTask(sentPrevNode, element, subMilestonePosition, selectedMil);
            }
          });
          if (slotFirstTask[0].data.AssignedTo.ID && slotFirstTask[0].data.AssignedTo.ID !== -1) {
            // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability 
            await this.checkTaskResourceAvailability(sentPrevNode, subMilestonePosition, selectedMil);
          }
        }
      } else if (slotFirstTask[0].data.AssignedTo.EMail) {
        // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability 
        await this.checkTaskResourceAvailability(sentPrevNode, subMilestonePosition, selectedMil);
      }

    }
  }

  /**
   * Deallocation / Reallocation logic
   * @param slot 
   * @param subMilestonePosition 
   * @param selectedMil 
   */
  async checkTaskResourceAvailability(slot, subMilestonePosition, selectedMil) {
    let deallocateSlot = false;
    // old value of slot is used for table details within mail sne for deallocation
    const oldSlot = subMilestonePosition === 0 ? this.tempmilestoneData[selectedMil].children.find(s => s.data.pName === slot.data.pName) :
      this.milestoneData[selectedMil].children[subMilestonePosition - 1].children.find(st => st.data.pName === slot.data.pName);
    const slotTasks = slot.children;
    const lastTask = slot.children.filter(st => !st.data.nextTask);
    const firstTask = slot.children.filter(st => !st.data.prevTask);
    const sortedTasksEnd = this.sortByDate(lastTask, 'pUserEnd', 'desc');
    const sortedTasksStart = this.sortByDate(firstTask, 'pUserStart', 'asc');
    for (const task of slotTasks) {
      const assignedUserId = task.data.AssignedTo.ID && task.data.AssignedTo.ID !== -1 ? task.data.AssignedTo.ID : task.data.previousAssignedUser;
      // find capacity of user on new dates and it returns task for user on given dates
      if (assignedUserId) {
        let retTask = [];
        const resource = this.sharedObject.oTaskAllocation.oResources.filter(r => r.UserName.ID === assignedUserId);
        const oCapacity = await this.usercapacityComponent.applyFilterReturn(task.data.pUserStart, task.data.pUserEnd,
          resource);


        let retRes = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : [];
        const breakAvailable = retRes.displayTotalUnAllocated.split(":");

        let availableHours = parseFloat(breakAvailable[0]) + parseFloat((parseFloat(breakAvailable[1]) / 60).toFixed(2)); //  parseFloat(retRes.displayTotalUnAllocated.replace(':', '.'));
        const allocatedHours = parseFloat(task.data.budgetHours);
        const retTaskInd = retTask.find(t => t.ID !== task.data.parentSlot && t.ParentSlot !== task.data.parentSlot);
        if (retTaskInd) {
          availableHours = availableHours + allocatedHours;
        }
        if (availableHours >= allocatedHours) {
          // filter tasks based on dates and subtasks within same slot
          retTask = retRes.tasks.filter((tsk) => {
            return ((task.data.pUserStart <= tsk.DueDate && task.data.pUserEnd >= tsk.DueDate)
              || (task.data.pUserStart <= tsk.StartDate && task.data.pUserEnd >= tsk.StartDate)
              || (task.data.pUserStart >= tsk.StartDate && task.data.pUserEnd <= tsk.DueDate));
          });
          retTask = retTask.filter(t => t.ID !== task.data.parentSlot && t.ParentSlot !== task.data.parentSlot);
          if (retTask.length || slot.data.pUserEnd < sortedTasksEnd[0].data.pUserEnd || slot.data.pUserStart > sortedTasksStart[0].data.pUserStart) {
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
      slot.data.CentralAllocationDone = 'Yes';
      this.reallocationMailData.length = 0;

      const mailTableObj = {
        taskName: '',
        preStDate: '',
        preEndDate: '',
        newStDate: '',
        newEndDate: '',
        assginedTo: ''
      }
      for (let task of slotTasks) {
        task.data.AssignedTo.ID = task.data.AssignedTo.ID !== -1 ? task.data.AssignedTo.ID : task.data.previousAssignedUser;
        task.data.previousAssignedUser = -1;
        task.data.assignedUserTimeZone = task.data.assignedUserTimeZone ? task.data.assignedUserTimeZone : task.data.previousTimeZone;
        task.data.CentralAllocationDone = 'Yes';
      }
      const milestoneMailObj = Object.assign({}, mailTableObj);
      milestoneMailObj.taskName = slot.data.pName;
      milestoneMailObj.preStDate = this.datepipe.transform(oldSlot.data.pStart, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.preEndDate = this.datepipe.transform(oldSlot.data.pEnd, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.newStDate = this.datepipe.transform(slot.data.pStart, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.newEndDate = this.datepipe.transform(slot.data.pEnd, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.assginedTo = '';
      this.reallocationMailData.push(milestoneMailObj);
      const oldSubTasks = oldSlot.children;

      slot.children.forEach((task, index) => {
        const subTask = Object.assign({}, mailTableObj);
        subTask.taskName = task.data.pName;
        subTask.preStDate = this.datepipe.transform(oldSubTasks[index].data.pStart, 'MMM dd yyyy hh:mm:ss a');
        subTask.preEndDate = this.datepipe.transform(oldSubTasks[index].data.pEnd, 'MMM dd yyyy hh:mm:ss a');
        subTask.newStDate = this.datepipe.transform(task.data.pStart, 'MMM dd yyyy hh:mm:ss a');
        subTask.newEndDate = this.datepipe.transform(task.data.pEnd, 'MMM dd yyyy hh:mm:ss a');
        subTask.assginedTo = task.data.AssignedTo.Title;
        this.reallocationMailData.push(subTask);
      });
      setTimeout(() => {
        const table = this.reallocateTable.nativeElement.innerHTML;
        this.reallocationMailArray.push({
          project: this.oProjectDetails,
          slot: slot,
          data: table,
          subject: slot.data.pName + ' reallocated'
        });
      }, 300);
    } else {
      // Reallocation and send single mail for reallocation
      for (let task of slotTasks) {
        task.data.previousAssignedUser = task.data.previousAssignedUser && task.data.previousAssignedUser !== -1 ? task.data.previousAssignedUser : task.data.AssignedTo.ID ? task.data.AssignedTo.ID : -1;
        task.data.AssignedTo.ID = -1;
        task.data.previousTimeZone = task.data.assignedUserTimeZone;
        task.data.assignedUserTimeZone = 5.5;
        task.data.CentralAllocationDone = 'No';
      }
      slot.data.slotColor = "#FF3E56";
      slot.data.CentralAllocationDone = 'No';

      this.deallocationMailArray.push({
        project: this.oProjectDetails,
        slot: slot,
        subject: slot.data.pName + ' deallocated',
        template: 'CentralTaskCreation'
      });
    }
  }

  async cascadeNextTask(previousNode, nextNode, subMilestonePosition, selectedMil) {
    const nodeData = nextNode.hasOwnProperty('data') ? nextNode.data : nextNode;
    const prevNodeData = previousNode.hasOwnProperty('data') ? previousNode.data : previousNode;
    // based on slot or task use start date or end date
    const prevNodeEndDate = ((prevNodeData.slotType === 'Slot' && nodeData.parentSlot) ?
      // && !prevNodeData.clickedInput
      // || (prevNodeData.slotType === 'Slot' && prevNodeData.clickedInput && prevNodeData.clickedInput === 'start' && nodeData.parentSlot) ?
      new Date(prevNodeData.pStart) : new Date(prevNodeData.pEnd));
    if (nodeData.type === 'task' && nodeData.itemType !== 'Client Review') {
      if (new Date(prevNodeEndDate) > new Date(nodeData.pStart) && nodeData.status !== 'Completed' && nodeData.status !== 'Auto Closed') {
        this.cascadeNode(previousNode, nodeData);
        this.cascadeNextNodes(nodeData, subMilestonePosition, selectedMil);
      }
      else if (new Date(prevNodeEndDate).getTime() === new Date(nodeData.pStart).getTime() && prevNodeData.itemType === 'Client Review' && nodeData.status !== 'Completed' && nodeData.status !== 'Auto Closed') {
        this.cascadeNode(previousNode, nodeData);
        this.cascadeNextNodes(nodeData, subMilestonePosition, selectedMil);
      }
    }
    else if (nodeData.type === 'task' && nodeData.itemType === 'Client Review') {
      if (new Date(prevNodeEndDate) >= new Date(nodeData.pStart) && nodeData.status !== 'Completed' && nodeData.status !== 'Auto Closed') {
        this.cascadeNode(previousNode, nodeData);
        this.cascadeNextNodes(nodeData, 0, selectedMil + 1);
      }
    }
    else if (nodeData.type === 'submilestone') {
      if (new Date(prevNodeEndDate) > new Date(nodeData.pStart)) {
        const allParallelTasks = nextNode.children.filter(dataEl => {
          return !dataEl.data.previousTask
        });
        allParallelTasks.forEach(element => {
          if (!element.data.DisableCascade && element.data.status !== 'In Progress') {
            this.cascadeNextTask(previousNode, element.data, parseInt(nodeData.position), selectedMil);
          }
        });
      }
    }
    else if (nodeData.type === 'milestone') {
      if (new Date(prevNodeEndDate) >= new Date(nodeData.pStart)) {
        const firstTask = nextNode.children[0].data;
        const allTasks = this.getTasksFromMilestones(nextNode, false, false);
        let allParallelTasks = [];
        if (firstTask.type === 'task') {
          allParallelTasks = allTasks.filter(dataEl => {
            return !dataEl.previousTask
          });
        }
        else {
          nextNode.children.forEach(element => {

            const tempData = allTasks.filter(dataEl => {
              return (!dataEl.previousTask && (parseInt(firstTask.position) === parseInt(element.data.position)));
            });
            allParallelTasks.push.apply(allParallelTasks, tempData);
          });
        }
        allParallelTasks.forEach(element => {

          if (!element.data.DisableCascade  && element.data.status !== 'In Progress') {
            this.cascadeNextTask(previousNode, element, element.submilestone ? 1 : 0, selectedMil + 1);
          }
        });
      }
    }

  }

  // tslint:enable

  // *************************************************************************************************************************************
  // Calculate Working Hours between Dates
  // *************************************************************************************************************************************

  workingHoursBetweenDates(start, end) {
    let count = 0;
    for (let i = start.valueOf(); i < end.valueOf(); i = (start.setMinutes(start.getMinutes() + 1)).valueOf()) {
      if (start.getDay() !== 0 && start.getDay() !== 6 && start.getHours() >= 9 && start.getHours() < 19) {
        count++;
      }
    }
    return count / 60;
  }

  // **************************************************************************************************
  // Check Start Date
  // *************************************************************************************************


  private checkStartDate(date) {
    date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDay() === 0 ? date.getDate() + 1 : date.getDate() + 0);
    return new Date(date);
  }


  // *************************************************************************************************************************************
  // Calculate  End  Date  after working hours difference
  // *************************************************************************************************************************************


  checkEndDate(start, workingHours) {
    let count = 0;
    let EndDate = new Date(start);
    let CaculateDate = new Date(start);
    const workHours = workingHours * 60;
    while (count < workHours) {

      if (EndDate.getDay() !== 0 && EndDate.getDay() !== 6 && EndDate.getHours() >= 9 && EndDate.getHours() < 19) {
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        CaculateDate = new Date(EndDate);
      } else if (EndDate.getHours() === 19 && EndDate.getMinutes() === 0) {

        CaculateDate = new Date(EndDate);
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        count--;
      } else {
        EndDate = new Date(EndDate.getFullYear(), EndDate.getMonth(), (EndDate.getDate() + 1), 9, 0);
        CaculateDate = new Date(EndDate);
        count--;
      }

      if (EndDate.getHours() >= 9 && EndDate.getHours() <= 19) { count++; }
    }
    return CaculateDate;
  }

  // *************************************************************************************************************************************
  // Calculate  Start End Date On Tat
  // *************************************************************************************************************************************


  ChangeEndDate($event, node) {
    if ($event) {
      // node.pStart = new Date(node.pStart.getFullYear(), node.pStart.getMonth(), node.pStart.getDate(), 9, 0);
      // node.pEnd = new Date(node.pStart.getFullYear(), node.pStart.getMonth(), node.pStart.getDate(), 19, 0);
      node.pUserStart = new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 9, 0);
      node.pUserEnd = new Date(node.pUserEnd.getFullYear(), node.pUserEnd.getMonth(), node.pUserEnd.getDate(), 19, 0);
      node.pUserStartDatePart = this.getDatePart(node.pUserStart);
      node.pUserStartTimePart = this.getTimePart(node.pUserStart);
      node.pUserEndDatePart = this.getDatePart(node.pUserEnd);
      node.pUserEndTimePart = this.getTimePart(node.pUserEnd);
      node.pStart = this.commonService.calcTimeForDifferentTimeZone(node.pUserStart,
        node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
      node.pEnd = this.commonService.calcTimeForDifferentTimeZone(node.pUserEnd,
        node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
      node.tatVal = this.commonService.calcBusinessDays(new Date(node.pStart), new Date(node.pEnd));
      this.DateChange(node, 'end');
    }
  }


  // *************************************************************************************************
  // Save tasks
  // *************************************************************************************************


  saveTasks() {
    this.disableSave = true;
    if (this.milestoneData.length > 0) {

      const isValid = this.validate();
      if (isValid) {
        this.loaderenable = true;
        this.sharedObject.resSectionShow = false;
        setTimeout(() => {
          this.generateSaveTasks();
        }, 300);
      } else {
        this.disableSave = false;
      }
    } else {
      this.disableSave = true;
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Add Task.' });
    }
  }

  getIDFromItem(objItem) {
    let arrData = [];
    if (objItem.hasOwnProperty('results')) {
      arrData = objItem.results.map(a => a.ID);
    }

    return arrData;
  }

  async setMilestone(addTaskItems, updateTaskItems, addMilestoneItems, updateMilestoneItems) {
    let updatedCurrentMilestone = false;
    // tslint:disable-next-line: one-variable-per-declaration
    let writers = [], arrWriterIDs = [],
      qualityChecker = [],
      arrQualityCheckerIds = [],
      editors = [], arrEditorsIds = [],
      graphics = [], arrGraphicsIds = [],
      pubSupport = [], arrPubSupportIds = [],
      reviewers = [], arrReviewers = [],
      arrPrimaryResourcesIds = [], addTasks = [], updateTasks = [], addMilestones = [], updateMilestones = [];
    const projectFolder = this.oProjectDetails.projectFolder;
    this.oProjectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const batchUrl = [];
    arrWriterIDs = this.getIDFromItem(this.oProjectDetails.writer);
    arrReviewers = this.getIDFromItem(this.oProjectDetails.reviewer);
    arrEditorsIds = this.getIDFromItem(this.oProjectDetails.editor);
    arrQualityCheckerIds = this.getIDFromItem(this.oProjectDetails.qualityChecker);
    arrGraphicsIds = this.getIDFromItem(this.oProjectDetails.graphicsMembers);
    arrPubSupportIds = this.getIDFromItem(this.oProjectDetails.pubSupportMembers);
    arrPrimaryResourcesIds = this.getIDFromItem(this.oProjectDetails.primaryResources);

    for (const milestoneTask of addTaskItems) {
      if (milestoneTask.AssignedTo && milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID !== -1) {
        switch (milestoneTask.itemType) {
          case 'Write':
            writers.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrWriterIDs.push(milestoneTask.AssignedTo.ID);
            break;
          case 'QC':
            qualityChecker.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrQualityCheckerIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Edit':
            editors.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrEditorsIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Graphics':
            graphics.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrGraphicsIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Send to client':
          case 'Client Review':
            break;
          case 'Pub Support':
          case 'Submission Pkg':
          case 'Journal Selection':
          case 'Submit':
          case 'Galley':
          case 'Journal Requirement':
            pubSupport.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrPubSupportIds.push(milestoneTask.AssignedTo.ID);
            break;
          default:
            if (milestoneTask.itemType.startsWith('Review-')) {
              reviewers.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
              arrReviewers.push(milestoneTask.AssignedTo.ID);
            }
            break;
        }
      }

      addTasks.push(await this.setMilestoneTaskForAddUpdate(milestoneTask, true));
    }
    for (const milestoneTask of updateTaskItems) {
      if (milestoneTask.AssignedTo && milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID !== -1) {
        switch (milestoneTask.itemType) {
          case 'Write':
            writers.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrWriterIDs.push(milestoneTask.AssignedTo.ID);
            break;
          case 'QC':
            qualityChecker.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrQualityCheckerIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Edit':
            editors.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrEditorsIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Graphics':
            graphics.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrGraphicsIds.push(milestoneTask.AssignedTo.ID);
            break;
          case 'Send to client':
          case 'Client Review':
            break;
          case 'Pub Support':
          case 'Submission Pkg':
          case 'Journal Selection':
          case 'Submit':
          case 'Galley':
          case 'Journal Requirement':
            pubSupport.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
            arrPubSupportIds.push(milestoneTask.AssignedTo.ID);
            break;
          default:
            if (milestoneTask.itemType.startsWith('Review-')) {
              reviewers.push({ ID: milestoneTask.AssignedTo.ID, Name: milestoneTask.AssignedTo.Title });
              arrReviewers.push(milestoneTask.AssignedTo.ID);
            }
            break;
        }
      }

      updateTasks.push(await this.setMilestoneTaskForAddUpdate(milestoneTask, false));
    }

    for (const milestone of addMilestoneItems) {
      addMilestones.push(this.setMilestoneForAddUpdate(milestone, true));
    }

    for (const milestone of updateMilestoneItems) {
      updateMilestones.push(this.setMilestoneForAddUpdate(milestone, false));
    }

    for (const mil of addMilestones) {
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, mil.url, mil.body, true);
      const milObj = Object.assign({}, this.queryConfig);
      milObj.url = mil.url;
      milObj.listName = this.constants.listNames.Schedules.name;
      milObj.type = 'POST';
      milObj.data = mil.body;
      batchUrl.push(milObj);
    }

    for (const tasks of addTasks) {
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tasks.url, tasks.body, true);
      const milTaskObj = Object.assign({}, this.queryConfig);
      milTaskObj.url = tasks.url;
      milTaskObj.listName = this.constants.listNames.Schedules.name;
      milTaskObj.type = 'POST';
      milTaskObj.data = tasks.body;
      batchUrl.push(milTaskObj);
    }

    for (const mil of addMilestoneItems) {
      // const milestoneFolderBody = {
      //   __metadata: { type: 'SP.Folder' },
      //   ServerRelativeUrl: projectFolder + '/Drafts/Internal/' + mil.data.pName
      // };
      const folderUrl = projectFolder + '/Drafts/Internal/' + mil.data.pName;
      const addMilObj = Object.assign({}, this.queryConfig);
      addMilObj.url = this.spServices.getFolderCreationURL();
      addMilObj.listName = 'Milestone Folder Creation';
      addMilObj.type = 'POST';
      addMilObj.data = this.spServices.getFolderCreationData(folderUrl);
      batchUrl.push(addMilObj);
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, milestoneFolderEndpoint, JSON.stringify(milestoneFolderBody), true);
    }
    for (const mil of updateMilestones) {
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, mil.url, mil.body, false);
      const milObj = Object.assign({}, this.queryConfig);
      milObj.url = mil.url;
      milObj.listName = this.constants.listNames.Schedules.name;
      milObj.type = 'PATCH';
      milObj.data = mil.body;
      batchUrl.push(milObj);
    }
    for (const tasks of updateTasks) {


      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tasks.url, tasks.body, false);
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = tasks.url;
      taskObj.listName = this.constants.listNames.Schedules.name;
      taskObj.type = 'PATCH';
      taskObj.data = tasks.body;
      batchUrl.push(taskObj);
    }

    arrWriterIDs = arrWriterIDs.filter((el) => {
      return el != null;
    });
    arrEditorsIds = arrEditorsIds.filter((el) => {
      return el != null;
    });
    arrGraphicsIds = arrGraphicsIds.filter((el) => {
      return el != null;
    });
    arrQualityCheckerIds = arrQualityCheckerIds.filter((el) => {
      return el != null;
    });
    arrReviewers = arrReviewers.filter((el) => {
      return el != null;
    });
    arrPubSupportIds = arrPubSupportIds.filter((el) => {
      return el != null;
    });
    arrPrimaryResourcesIds = arrPrimaryResourcesIds.filter((el) => {
      return el != null;
    });

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

    updatedResources.allDeliveryRes = [...updatedResources.writer.results, ...updatedResources.editor.results,
    ...updatedResources.graphicsMembers.results, ...updatedResources.qualityChecker.results,
    ...updatedResources.reviewer.results, ...updatedResources.pubSupportMembers.results,
    ...updatedResources.primaryResources.results];

    const restructureMilstoneStr = this.oProjectDetails.allMilestones && this.oProjectDetails.allMilestones.length > 0 ?
      this.oProjectDetails.allMilestones.join(';#') : '';
    const mile = updateMilestoneItems.find(c => c.data.pName.split(' (')[0] === this.oProjectDetails.currentMilestone);
    const task = addTaskItems.filter(c => c.milestone === this.oProjectDetails.currentMilestone);

    updatedCurrentMilestone = mile && task && task.length ? true : false;

    const responseInLines = await this.executeBulkRequests(updatedCurrentMilestone, restructureMilstoneStr,
      updatedResources, batchUrl);
    if (responseInLines.length > 0) {
      let counter = 0;
      const addMilLength = addMilestones.length;
      const endIndex = addMilLength + addTasks.length;
      const respBatchUrl = [];
      for (const resp of responseInLines) {
        // tslint:disable: max-line-length
        const fileUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/Lists/' + this.constants.listNames.Schedules.name + '/' + resp.ID + '_.000';
        let moveFileUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/Lists/' + this.constants.listNames.Schedules.name + '/' + this.oProjectDetails.projectCode;
        if (counter < addMilLength) {
          moveFileUrl = moveFileUrl + '/' + resp.ID + '_.000';
          // const milestoneURL = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + this.constants.listNames.Schedules.name + "')/Items('" + resp.ID + "')";
          const moveData = {
            __metadata: { type: 'SP.Data.SchedulesListItem' },
            FileLeafRef: resp.Title
          };
          const url = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/getfolderbyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "')";
          // this.spServices.getChangeSetBodyMove(batchContents, changeSetId, url);

          // this.spServices.getChangeSetBodySC(batchContents, changeSetId, milestoneURL, moveData, false);

          const moveItemObj = Object.assign({}, this.queryConfig);
          moveItemObj.url = url; // this.spServices.getMoveURL(fileUrl, moveFileUrl);
          moveItemObj.listName = 'Move Item';
          moveItemObj.type = 'POST';
          respBatchUrl.push(moveItemObj);
          const updateTaskObj = Object.assign({}, this.queryConfig);
          updateTaskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +resp.ID);
          updateTaskObj.listName = this.constants.listNames.Schedules.name;
          updateTaskObj.type = 'PATCH';
          updateTaskObj.data = moveData;
          respBatchUrl.push(updateTaskObj);
        } else if (counter < endIndex) {
          moveFileUrl = moveFileUrl + '/' + resp.Milestone + '/' + resp.ID + '_.000';
          const url = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
          // this.spServices.getChangeSetBodyMove(batchContents, changeSetId, url);
          const moveItemObj = Object.assign({}, this.queryConfig);
          moveItemObj.url = url; // this.spServices.getMoveURL(fileUrl, moveFileUrl);
          moveItemObj.listName = 'Move Item';
          moveItemObj.type = 'POST';
          respBatchUrl.push(moveItemObj);
        } else {
          break;
        }

        counter = counter + 1;
      }
      await this.spServices.executeBatch(respBatchUrl);
    }
    for (const mail of this.reallocationMailArray) {
      await this.sendReallocationCentralTaskMail(mail.project, mail.slot, mail.data, mail.subject);
    }
    for (const mail of this.deallocationMailArray) {
      await this.sendCentralTaskMail(mail.project, mail.slot.data, mail.subject, mail.template);
    }
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
    this.getMilestones(false);

    this.reloadResources.emit();


    // }
  }
  async setMilestoneTaskForAddUpdate(milestoneTask, bAdd) {
    const batchUrl = [];
    let url = '';
    let data = {};
    if (milestoneTask.status === 'Not Saved') {
      if (milestoneTask.isCurrent) {
        milestoneTask.status = 'Not Started';
        milestoneTask.assignedUserChanged = true;
      } else {
        milestoneTask.status = 'Not Confirmed';
      }
    }
    // send mail for new task for current milestone
    if (milestoneTask.assignedUserChanged && milestoneTask.status === 'Not Started') {
      await this.sendMail(this.oProjectDetails, milestoneTask);
      milestoneTask.assignedUserChanged = false;
    }
    // For new slot and current milestone
    if (bAdd && milestoneTask.IsCentrallyAllocated === 'Yes' && this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone) {
      //// send task creation email
      milestoneTask.ActiveCA = 'Yes';
      await this.sendCentralTaskMail(this.oProjectDetails, milestoneTask, milestoneTask.pName + ' Created', 'CentralTaskCreation');
    }
    if (bAdd) {
      const taskCount = milestoneTask.pName.match(/\d+$/) ? ' ' + milestoneTask.pName.match(/\d+$/)[0] : '';
      milestoneTask.itemType = milestoneTask.itemType;
      const slotTaskName = milestoneTask.itemType + taskCount;
      const addData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        StartDate: milestoneTask.pStart,
        DueDate: milestoneTask.pEnd,
        ExpectedTime: '' + milestoneTask.budgetHours,
        AllowCompletion: milestoneTask.allowStart === true ? 'Yes' : 'No',
        TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
        TATBusinessDays: milestoneTask.tatVal,
        AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.hasOwnProperty('ID') ? milestoneTask.AssignedTo.ID : -1 : -1,
        TimeZone: milestoneTask.assignedUserTimeZone.toString(),
        Comments: milestoneTask.scope,
        Status: milestoneTask.status,
        NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
        PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
        ProjectCode: this.oProjectDetails.projectCode,
        Task: milestoneTask.itemType,
        Milestone: milestoneTask.milestone,
        SubMilestones: milestoneTask.submilestone,
        Title: milestoneTask.slotType !== 'Both' && milestoneTask.slotType !== 'Slot' ? this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.pName :
          this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + slotTaskName,
        SkillLevel: milestoneTask.skillLevel,
        IsCentrallyAllocated: milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID ? 'No' : milestoneTask.IsCentrallyAllocated,
        CentralAllocationDone: milestoneTask.CentralAllocationDone,
        ActiveCA: milestoneTask.ActiveCA,
        DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No'
      };
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
      data = addData;
    } else {
      const updateData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        StartDate: milestoneTask.pStart,
        DueDate: milestoneTask.pEnd,
        ExpectedTime: '' + milestoneTask.budgetHours,
        AllowCompletion: milestoneTask.allowStart === true ? 'Yes' : 'No',
        TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
        TATBusinessDays: milestoneTask.tatVal,
        AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.ID ? milestoneTask.AssignedTo.ID : -1 : -1,
        TimeZone: milestoneTask.assignedUserTimeZone.toString(),
        Comments: milestoneTask.scope ? milestoneTask.scope : '',
        Status: milestoneTask.status,
        NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
        PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
        SkillLevel: milestoneTask.skillLevel,
        IsCentrallyAllocated: milestoneTask.IsCentrallyAllocated,
        CentralAllocationDone: milestoneTask.CentralAllocationDone,
        ActiveCA: milestoneTask.ActiveCA,
        DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No',
        PreviousAssignedUserId: milestoneTask.previousAssignedUser ? milestoneTask.previousAssignedUser : -1,
        SubMilestones: milestoneTask.submilestone,
      };
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneTask.pID);
      data = updateData;
    }
    return {
      body: data,
      url
    };
  }
  // tslint:disable
  setPreviousAndNext(sText, sMilestone, sProject) {
    let sVal = '';

    if (sText) {
      const arrVal = sText.split(';');
      const arrNewVal = [];
      for (var val of arrVal) {
        arrNewVal.push(sProject + ' ' + sMilestone + ' ' + val);
      }

      sVal = arrNewVal.join(';#');
    }

    return sVal;
  }

  setMilestoneForAddUpdate(sentMilestone, bAdd) {
    let currentMilestone = sentMilestone.data;
    let url = '';
    let data = {};
    currentMilestone.submilestone = this.getSubMilestoneStatus(sentMilestone, '').join(';#');
    const milestoneStartDate = new Date(currentMilestone.pStart);
    const milestoneEndDate = new Date(currentMilestone.pEnd);
    currentMilestone.tatBusinessDays = this.commonService.calcBusinessDays(milestoneStartDate, milestoneEndDate);
    if (!bAdd) {
      const updateData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Actual_x0020_Start_x0020_Date: milestoneStartDate,
        Actual_x0020_End_x0020_Date: milestoneEndDate,
        StartDate: milestoneStartDate,
        DueDate: milestoneEndDate,
        ExpectedTime: '' + currentMilestone.budgetHours,
        Status: currentMilestone.status === 'Not Saved' ? currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' : currentMilestone.status,
        TATBusinessDays: currentMilestone.tatBusinessDays,
        SubMilestones: currentMilestone.submilestone
      };
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +currentMilestone.pID);
      data = updateData;
    } else {
      const addData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Actual_x0020_Start_x0020_Date: milestoneStartDate,
        Actual_x0020_End_x0020_Date: milestoneEndDate,
        StartDate: milestoneStartDate,
        DueDate: milestoneEndDate,
        ExpectedTime: '' + currentMilestone.budgetHours,
        Status: currentMilestone.status === 'Not Saved' ? currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' : currentMilestone.status,
        TATBusinessDays: currentMilestone.tatBusinessDays,
        ProjectCode: this.oProjectDetails.projectCode,
        Title: currentMilestone.pName.split(' (')[0],
        FileSystemObjectType: 1,
        ContentTypeId: "0x0120",
        SubMilestones: currentMilestone.submilestone
      };
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
      data = addData;
    }
    return {
      body: data,
      url,
      Title: currentMilestone.Title
    };

  }

  // executing bulk batch requests
  async executeBulkRequests(currentMilestoneUpdated, restructureMilstoneStr, updatedResources, batchUrl) {
    let updateProjectRes = {};
    const projectID = this.oProjectDetails.projectID;
    const currentMilestone = this.oProjectDetails.currentMilestone;
    updateProjectRes = {
      __metadata: { type: 'SP.Data.ProjectInformationListItem' },
      WritersId: { results: updatedResources.writer.results },
      ReviewersId: { results: updatedResources.reviewer.results },
      EditorsId: { results: updatedResources.editor.results },
      AllDeliveryResourcesId: { results: updatedResources.allDeliveryRes },
      QCId: { results: updatedResources.qualityChecker.results },
      GraphicsMembersId: { results: updatedResources.graphicsMembers.results },
      PSMembersId: { results: updatedResources.pubSupportMembers.results },
      Milestones: restructureMilstoneStr,
      Milestone: currentMilestone,
      Status: currentMilestoneUpdated ? 'In Progress' : this.sharedObject.oTaskAllocation.oProjectDetails.status,
      PrevStatus: currentMilestoneUpdated ? this.sharedObject.oTaskAllocation.oProjectDetails.status : this.sharedObject.oTaskAllocation.oProjectDetails.prevstatus
    };
    const updatePrjObj = Object.assign({}, this.queryConfig);
    updatePrjObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID);
    updatePrjObj.listName = this.constants.listNames.ProjectInformation.name;
    updatePrjObj.type = 'PATCH';
    updatePrjObj.data = updateProjectRes;
    batchUrl.push(updatePrjObj);
    let response = await this.spServices.executeBatch(batchUrl);
    response = response.length ? response.map(a => a.retItems) : [];
    return response;
  }

  // *************************************************************************************************
  //  Send Email On Task
  // **************************************************************************************************

  async sendMail(projectDetails, milestoneTask) {
    if (milestoneTask.AssignedTo && milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID && milestoneTask.AssignedTo.ID !== -1) {
      const fromUser = this.sharedObject.currentUser;
      const user = milestoneTask.AssignedTo;
      const mailSubject = projectDetails.projectCode + '(' + projectDetails.wbjid + ')' + ': Task created';
      const objEmailBody = await this.getsendEmailObjBody(milestoneTask, projectDetails, 'Email', 'TaskCreation');
      const arrayTo = [];

      if (user !== 'SelectOne' && user !== '' && user != null) {
        const userEmail = user.UserName ? user.UserName.EMail : user.EMail ? user.EMail : user.Email;
        arrayTo.push(userEmail);
      }
      const to = arrayTo.join(',').trim();
      if (to) {
        await this.spServices.sendMail(to, fromUser.email, mailSubject, objEmailBody);
      }
    }
  }

  // *************************************************************************************************
  //  Send Email On Central Task
  // **************************************************************************************************

  async sendCentralTaskMail(projectDetails, milestoneTask, subjectLine, templateName) {

    const fromUser = this.sharedObject.currentUser;
    const mailSubject = projectDetails.projectCode + '(' + projectDetails.wbjid + ')' + ': ' + subjectLine;
    const objEmailBody = await this.getsendEmailObjBody(milestoneTask, projectDetails, 'CentralTaskMail', templateName);
    const arrayTo = [];
    const users = this.sharedObject.oTaskAllocation.oCentralGroup;
    for (const user of users) {
      arrayTo.push(user.Email);
    }
    await this.spServices.sendMail(arrayTo.join(','), fromUser.email, mailSubject, objEmailBody);
  }

  async sendReallocationCentralTaskMail(projectDetails, slot, data, subjectLine) {

    const fromUser = this.sharedObject.currentUser;
    const mailSubject = projectDetails.projectCode + '(' + projectDetails.wbjid + ')' + ': ' + subjectLine;
    const objEmailBody = await this.getReallocateEmailObjBody(data, slot, 'ReallocationSlotNotification');
    const arrayTo = [];
    const users = this.sharedObject.oTaskAllocation.oCentralGroup;
    for (const user of users) {
      arrayTo.push(user.Email);
    }
    await this.spServices.sendMail(arrayTo.join(','), fromUser.email, mailSubject, objEmailBody);
  }

  // *************************************************************************************************
  //  Get Email Body
  // **************************************************************************************************

  async getsendEmailObjBody(milestoneTask, projectDetails, EmailType, templateName) {
    const mailObj = Object.assign({}, this.taskAllocationService.common.getMailTemplate);
    mailObj.filter = mailObj.filter.replace('{{templateName}}', templateName);
    const templateData = await this.spServices.readItems(this.constants.listNames.MailContent.name,
      mailObj);
    let mailContent = templateData.length > 0 ? templateData[0].Content : [];
    mailContent = this.replaceContent(mailContent, "@@Val3@@", EmailType === 'Email' ? milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title : undefined : 'Team');
    mailContent = this.replaceContent(mailContent, "@@Val1@@", projectDetails.projectCode);
    mailContent = this.replaceContent(mailContent, "@@Val2@@", milestoneTask.submilestone && milestoneTask.submilestone !== 'Default' ? projectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.pName + ' - ' + milestoneTask.submilestone : projectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.pName);
    mailContent = this.replaceContent(mailContent, "@@Val4@@", milestoneTask.itemType);
    mailContent = this.replaceContent(mailContent, "@@Val5@@", milestoneTask.milestone);
    mailContent = this.replaceContent(mailContent, "@@Val6@@", this.datepipe.transform(milestoneTask.pStart, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val7@@", this.datepipe.transform(milestoneTask.pEnd, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val9@@", milestoneTask.scope ? milestoneTask.scope : '');
    return mailContent;
  }

  async getReallocateEmailObjBody(data, slot, templateName) {
    const mailObj = Object.assign({}, this.taskAllocationService.common.getMailTemplate);
    mailObj.filter = mailObj.filter.replace('{{templateName}}', templateName);
    const templateData = await this.spServices.readItems(this.constants.listNames.MailContent.name,
      mailObj);
    let mailContent = templateData.length > 0 ? templateData[0].Content : [];
    mailContent = this.replaceContent(mailContent, "@@Val1@@", slot.data.taskFullName);
    mailContent = this.replaceContent(mailContent, "@@ValTable@@", data);

    return mailContent;
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }

  public generateSaveTasks() {

    var listOfMilestones = [];
    var addedTasks = [], updatedTasks = [], addedMilestones = [], updatedMilestones = []
    for (var nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
      var milestone = this.milestoneData[nCount];
      // deleted milestone is overwritten by new milestone
      let deletedMilestone = this.deletedMilestones.filter(m => m.Title === milestone.data.pName);
      if (deletedMilestone.length > 0) {
        milestone.data.pID = deletedMilestone[0].ID
        milestone.data.added = false;
      }
      if (milestone.data.type === 'milestone') {
        listOfMilestones.push(milestone.data.pName.split(' (')[0]);
      }
      if (milestone.data.edited === true && milestone.data.status !== 'Completed') {
        if (milestone.data.itemType === 'Client Review') {
          const deletedTask = this.allTasks.filter(t => t.Title === milestone.data.taskFullName && t.Status === 'Deleted');
          if (deletedTask.length > 0) {
            milestone.data.pID = deletedTask[0].ID
            milestone.data.added = false;
          }
          if (milestone.data.added === true) {
            addedTasks.push(milestone.data);
          }
          else {
            updatedTasks.push(milestone.data);
          }
        }
        else if (milestone.children !== undefined) {
          if (milestone.data.added == true) {
            addedMilestones.push(milestone);
          }
          else {
            updatedMilestones.push(milestone);
          }
          for (var nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
            var submilestone = milestone.children[nCountSub];
            // fetch deleted task and update task if task is again added
            const deletedTask = this.allTasks.filter(t => t.Title === submilestone.data.taskFullName && t.Status === 'Deleted');
            if (deletedTask.length > 0) {
              submilestone.data.pID = deletedTask[0].ID
              submilestone.data.added = false;
            }
            if (submilestone.data.edited === true) {
              if (submilestone.data.type === 'task') {
                if (submilestone.data.added == true) {
                  submilestone.data.status = milestone.data.status === 'In Progress' ? 'Not Started' : submilestone.data.status;
                  addedTasks.push(submilestone.data);
                }
                else {
                  updatedTasks.push(submilestone.data);
                }
              }
              if (submilestone.children !== undefined) {
                for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
                  var task = submilestone.children[nCountTask];
                  const deletedTask = this.allTasks.filter(t => t.Title === task.data.taskFullName && t.Status === 'Deleted');
                  if (deletedTask.length > 0) {
                    task.data.pID = deletedTask[0].ID
                    task.data.added = false;
                  }
                  if (task.data.added == true) {
                    task.data.status = submilestone.data.status === 'In Progress' ? 'Not Started' : submilestone.data.status === 'Not Saved' ? milestone.data.isCurrent ? 'Not Started' : 'Not Confirmed' : task.data.status;
                    addedTasks.push(task.data);
                  }
                  else {
                    updatedTasks.push(task.data);
                  }
                  if (task.children) {
                    for (var nSubTaskTaskCount = 0; nSubTaskTaskCount < task.children.length; nSubTaskTaskCount = nSubTaskTaskCount + 1) {
                      var subtask = task.children[nSubTaskTaskCount];
                      const deletedSubTask = this.allTasks.filter(t => t.Title === subtask.data.taskFullName);
                      if (deletedSubTask.length > 0) {
                        subtask.data.pID = deletedSubTask[0].ID
                        subtask.data.added = false;
                      }
                      if (subtask.data.added == true) {
                        subtask.data.status = subtask.data.status;
                        addedTasks.push(subtask.data);
                      }
                      else {
                        updatedTasks.push(subtask.data);
                      }

                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones = listOfMilestones;

    this.getDeletedMilestoneTasks(updatedTasks, updatedMilestones);
    this.setMilestone(addedTasks, updatedTasks, addedMilestones, updatedMilestones);

  }

  // tslint:enable

  getDeletedMilestoneTasks(updatedTasks, updatedMilestones) {

    this.milestoneDataCopy.forEach((element) => {
      if (element.data.status !== 'Completed' && element.data.status !== 'Deleted') {
        if (element.data.type === 'task' && element.data.itemType === 'Client Review') {
          const clTasks = this.milestoneData.filter(dataEl => {
            return dataEl.data.itemType === 'Client Review' && dataEl.data.pID === element.data.pID;
          });
          if (clTasks.length === 0) {
            const clTask = element;
            clTask.data.nextTask = '';
            clTask.data.previousTask = '';
            clTask.data.status = 'Deleted';
            updatedTasks.push(clTask.data);
          }
        } else {
          const milestoneReturn = this.milestoneData.filter(dataEl => {
            return dataEl.data.type === 'milestone' && dataEl.data.pID === element.data.pID;
          });
          if (milestoneReturn.length === 0) {
            const milDel = element;
            milDel.data.status = 'Deleted';
            updatedMilestones.push(milDel);
            const getAllTasks = this.getTasksFromMilestones(milDel, true, false);
            getAllTasks.forEach(task => {
              if (task.status !== 'Deleted' && task.status !== 'Completed') {
                task.previousTask = '';
                task.nextTask = '';
                task.status = 'Deleted';
                updatedTasks.push(task);
              }
            });
          } else {
            const newSub = this.getSubMilestoneStatus(milestoneReturn[0], '').join(';#');
            const existingSub = this.getSubMilestoneStatus(element, '').join(';#');
            if (newSub !== existingSub) {
              updatedMilestones.push(milestoneReturn[0]);
            }
            const getAllTasks = this.getTasksFromMilestones(element, true, false);
            const getAllSubTasks = this.getTasksFromMilestones(element, true, true);
            const getAllNewTasks = this.getTasksFromMilestones(milestoneReturn[0], false, false);
            getAllTasks.forEach(task => {
              if (task.status !== 'Deleted' && task.status !== 'Completed') {
                const taskSearch = getAllNewTasks.filter(dataEl => {
                  return dataEl.type === 'task' && dataEl.pID === task.pID;
                });
                if (taskSearch.length === 0) {
                  task.previousTask = '';
                  task.nextTask = '';
                  task.status = 'Deleted';
                  /// mark activeca as No for slot if it is deleted
                  if (task.IsCentrallyAllocated) {
                    task.ActiveCA = 'No';
                    task.CentralAllocationDone = 'No';
                    const subTaskSearch = getAllSubTasks.filter(dataEl => dataEl.parentSlot === task.pID);
                    subTaskSearch.forEach(subTask => {
                      subTask.previousTask = '';
                      subTask.nextTask = '';
                      subTask.status = 'Deleted';
                      subTask.CentralAllocationDone = 'No';
                      updatedTasks.push(subTask);
                    });
                  }
                  updatedTasks.push(task);
                }
              }
            });
          }
        }
      }
    });
  }

  // tslint:disable

  getTasksFromMilestones(milestone, bOld, includeSubTasks) {
    let tasks = [];
    if (milestone.children !== undefined) {
      for (var nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
        var submilestone = milestone.children[nCountSub];
        if (submilestone.data.type === 'task') {
          tasks.push(submilestone.data);
          if (includeSubTasks && submilestone.children) {
            for (let nCountSubTask = 0; nCountSubTask < submilestone.children.length; nCountSubTask = nCountSubTask + 1) {
              var subtask = submilestone.children[nCountSubTask];
              tasks.push(subtask.data);
            }
          }
        } else if (submilestone.children !== undefined) {
          for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
            var task = submilestone.children[nCountTask];
            tasks.push(task.data);
            if (includeSubTasks && task.children) {
              for (let nCountSubTask = 0; nCountSubTask < task.children.length; nCountSubTask = nCountSubTask + 1) {
                var subtask = task.children[nCountSubTask];
                tasks.push(subtask.data);
              }
            }
          }
        }
      }
    }
    const milData = bOld ? this.milestoneDataCopy : this.milestoneData
    const clTask = milestone.data.type === 'milestone' || milestone.data.type === 'task' ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.data.pName.split(' (')[0]
    }) : milestone.parent ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.parent.data.pName.split(' (')[0]
    }) : [];



    if (clTask.length)
      tasks.push(clTask[0].data);

    return tasks;
  }



  getSubTasksfromTasks(task) {
    let tasks = [];
    if (task.children !== undefined) {
      for (var nCountTask = 0; nCountTask < task.children.length; nCountTask = nCountTask + 1) {
        var task = task.children[nCountTask];
        tasks.push(task.data);
      }
      return tasks;
    }
  }

  getTasksFromSubMilestones(submilestone) {


    let tasks = [];
    if (submilestone.children !== undefined) {
      for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
        var task = submilestone.children[nCountTask];
        tasks.push(task.data);
      }
    }


    if (submilestone.parent.length > 1) {

      var isAllSubMilestoneCompleted = submilestone.parent.filter(c => c.data !== submilestone.data).map(c => c.data.status === 'Not Confirmed').length > 0 ? true : false;

      if (isAllSubMilestoneCompleted) {
        const milData = this.milestoneData
        const clTask = milData.filter(function (obj) {
          return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === submilestone.parent.data.pName.split(' (')[0];
        });

        if (clTask.length)
          tasks.push(clTask[0].data);
      }
    }
    return tasks;
  }

  // tslint:enable

  validateNextMilestone(subMile) {

    let validateNextMilestone = true;

    const currentMilestone = this.milestoneData.filter((obj) => {
      return obj.data.isCurrent === true;
    });

    let submilePresentInCurrent = false;
    if (currentMilestone.length > 0) {
      submilePresentInCurrent = currentMilestone[0].children.length > 0 ?
        currentMilestone[0].children.find(c => c.data === subMile) !== undefined ?
          true : false : currentMilestone[0].data === subMile ? true : false;
    }
    const newCurrentMilestoneText = submilePresentInCurrent ?
      this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone :
      this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone;

    const newCurrentMilestone = this.milestoneData.filter((obj) => {
      return obj.data.pName.split(' (')[0] === newCurrentMilestoneText;
    });
    if (newCurrentMilestone.length > 0) {
      let currMilTasks = this.getTasksFromMilestones(newCurrentMilestone[0], false, false);
      currMilTasks = currMilTasks.filter((objt) => {
        return objt.status !== 'Deleted' && objt.status !== 'Abandon';
      });
      if (subMile.itemType === 'submilestone') {
        currMilTasks = currMilTasks.filter((objt) => {
          return objt.pParent === subMile.pID;
        });
      } else {
        if (subMile.budgetHours === '' || +subMile.budgetHours <= 0) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Budget hours for the milestone cannot be less than or equal to 0'
          });
          return false;
        }
      }

      currMilTasks.forEach(element => {
        const title = element.AssignedTo ? element.AssignedTo.Title : null;
        if (!title) {
          validateNextMilestone = false;
        }
      });
      if (!validateNextMilestone) {
        this.messageService.add({
          key: 'custom', severity: 'warn', summary: 'Warning Message',
          detail: 'All tasks should be assigned to either a resource or skill before setting the milestone / submilestone as current.'
        });

        return false;
      }

      // tslint:disable
      const checkTaskAllocatedTime = currMilTasks.filter(e => (e.budgetHours === '' || +e.budgetHours === 0)
        && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' && e.itemType !== 'Follow up' && e.status !== 'Completed' && !e.parentSlot);
      // tslint:enable
      if (checkTaskAllocatedTime.length > 0) {
        this.messageService.add({
          key: 'custom', severity: 'warn', summary: 'Warning Message',
          detail: 'Allocated time for task cannot be equal or less than 0 for ' + checkTaskAllocatedTime[0].pName
        });

        return false;
      }

      const compareDates = currMilTasks.filter(e => (e.pEnd <= e.pStart && e.tat === false
        && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' &&
        e.itemType !== 'Follow up' && e.status !== 'Completed'));
      if (compareDates.length > 0) {

        this.messageService.add({
          key: 'custom', severity: 'warn', summary: 'Warning Message',
          detail: 'End date should be greater than start date of ' + compareDates[0].pName
        });

        return false;
      }

      const errorPresnet = this.validateTaskDates(currMilTasks);
      if (errorPresnet) {
        return false;
      }
    }

    return validateNextMilestone;
  }
  setAsNextMilestoneCall(rowData, rowNode) {

    if (rowData.editMode) {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'There are some unsaved changes, Please save them.'
      });
      return false;

    } else {
      const Title = rowNode.parent ? rowNode.parent.data.pName + ' - ' + rowData.pName : rowData.pName;

      this.confirmationService.confirm({
        message: 'Are you sure that you want to Confirm ' + Title + ' ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.selectedSubMilestone = rowData;
          const validateNextMilestone = this.validateNextMilestone(this.selectedSubMilestone);
          if (validateNextMilestone) {
            this.loaderenable = true;
            setTimeout(() => { this.setAsNextMilestone(this.selectedSubMilestone); }, 200);
          }
        },
        reject: () => {
        }
      });
    }
  }


  async setAsNextMilestone(subMile) {

    const projectID = this.oProjectDetails.projectID;
    const currentMilestone = this.milestoneData.filter((obj) => {
      return obj.data.isCurrent === true;
    });

    let submilePresentInCurrent = false;
    if (currentMilestone.length > 0) {
      submilePresentInCurrent = currentMilestone[0].children.length > 0 ?
        currentMilestone[0].children.find(c => c.data === subMile) !== undefined ?
          true : false : currentMilestone[0].data === subMile ? true : false;
    }
    const newCurrentMilestoneText = submilePresentInCurrent ?
      this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone :
      this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone;


    const newCurrentMilestone = this.milestoneData.filter((obj) => {
      return obj.data.pName.split(' (')[0] === newCurrentMilestoneText;
    });
    const batchUrl = [];
    // tslint:disable

    if (!submilePresentInCurrent) {
      // // tslint:enable
      const updateProjectBody = {
        __metadata: { type: 'SP.Data.ProjectInformationListItem' },
        Milestone: newCurrentMilestoneText,
        Status: 'In Progress',
        PrevStatus: this.sharedObject.oTaskAllocation.oProjectDetails.status
      };
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID);
      taskObj.data = updateProjectBody;
      taskObj.listName = this.constants.listNames.ProjectInformation.name;
      taskObj.type = 'PATCH';
      batchUrl.push(taskObj);
    }
    /// end of project information update
    let previousSubMilestones;
    if (currentMilestone.length > 0) {
      previousSubMilestones = submilePresentInCurrent && currentMilestone[0].children.length > 0
        ? currentMilestone[0].children.filter(c => parseInt(c.data.position, 10)
          === (parseInt(subMile.position, 10) - 1)) : [currentMilestone[0].data];

      if (previousSubMilestones.length > 0) {
        // tslint:disable

        previousSubMilestones.forEach(element => {
          // let pMilestoneEndpoint;
          let updatePMilestoneBody;

          let prevMilestoneTasks;
          if (element.type === 'milestone') {
            prevMilestoneTasks = this.getTasksFromMilestones(currentMilestone[0], false, true);
          } else {
            prevMilestoneTasks = this.getTasksFromMilestones(element, false, true);
          }
          prevMilestoneTasks = prevMilestoneTasks.filter((objt) => {
            return objt.status !== 'Deleted' && objt.status !== 'Abandon' && objt.status !== 'Completed';
          });
          let milestoneID = -1;
          if (submilePresentInCurrent) {
            milestoneID = +element.data.pID;
            const subMileStatus = prevMilestoneTasks.filter(c => c.itemType !== 'Client Review').every(this.checkStatus);
            element.data.status = subMileStatus ? 'Deleted' : 'Completed';
            updatePMilestoneBody = {
              __metadata: { type: 'SP.Data.SchedulesListItem' },
              Status: subMileStatus ? 'Deleted' : 'Completed'
            };
          }
          else {
            milestoneID = +element.pID;
            updatePMilestoneBody = {
              __metadata: { type: 'SP.Data.SchedulesListItem' },
              Status: 'Completed',
              SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], 'Completed').join(';#')
            };
          }
          const milestoneObj = Object.assign({}, this.queryConfig);
          milestoneObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneID);
          milestoneObj.data = updatePMilestoneBody;
          milestoneObj.listName = this.constants.listNames.Schedules.name;
          milestoneObj.type = 'PATCH';
          batchUrl.push(milestoneObj);
          // tslint:enable
          for (const task of prevMilestoneTasks) {
            if (task.status === 'Not Confirmed') {
              if (task.itemType !== 'Client Review') {
                task.status = 'Deleted';
              }
            } else {
              if ((task.itemType === 'Send to client') || (task.itemType === 'Client Review' && !submilePresentInCurrent)) {
                task.status = 'Completed';
              } else if (task.itemType === 'Client Review' && submilePresentInCurrent) {
                task.status = task.status;
              } else {
                task.status = 'Auto Closed';
              }
            }
            task.ActiveCA = 'No';
            // tslint:enable
            const updateSchedulesBody = {
              __metadata: { type: this.constants.listNames.Schedules.type },
              Status: task.status,
              AllowCompletion: 'Yes',
              ActiveCA: task.ActiveCA
            };
            const taskUpdateObj = Object.assign({}, this.queryConfig);
            taskUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.pID);
            taskUpdateObj.data = updateSchedulesBody;
            taskUpdateObj.listName = this.constants.listNames.Schedules.name;
            taskUpdateObj.type = 'PATCH';
            batchUrl.push(taskUpdateObj);
          }
        });
      }
    }

    // updated by Maxwell
    let setToTasks;
    if (newCurrentMilestone[0].children.length > 0) {
      const subMilestone = submilePresentInCurrent ?
        currentMilestone[0].children.find(c => c.data === subMile) :
        newCurrentMilestone[0].children.find(c => c.data === subMile) !== undefined ?
          newCurrentMilestone[0].children.find(c => c.data === subMile) : newCurrentMilestone[0];
      subMilestone.data.status = 'In Progress';
      setToTasks = this.getTasksFromMilestones(subMilestone, false, true);
    } else {
      setToTasks = this.getTasksFromMilestones(currentMilestone[0], false, true);
    }
    const slots = [];
    for (const element of setToTasks) {
      if (element.status === 'Not Confirmed') {
        if (element.AssignedTo) {
          await this.sendMail(this.oProjectDetails, element);
        }
        if (element.IsCentrallyAllocated === 'Yes') {
          slots.push(element.ID);
          //// send task creation email
          element.ActiveCA = 'Yes';
          await this.sendCentralTaskMail(this.oProjectDetails, element, element.pName + ' Created', 'CentralTaskCreation');
        }
        element.status = 'Not Started';
        element.assignedUserChanged = false;
        const updateSchedulesBody = {
          __metadata: { type: 'SP.Data.SchedulesListItem' },
          Status: element.status,
          ActiveCA: element.ActiveCA
        };
        const taskCAUpdateObj = Object.assign({}, this.queryConfig);
        taskCAUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.pID);
        taskCAUpdateObj.data = updateSchedulesBody;
        taskCAUpdateObj.listName = this.constants.listNames.Schedules.name;
        taskCAUpdateObj.type = 'PATCH';
        batchUrl.push(taskCAUpdateObj);
      }
    }
    const cMilestoneEndpoint = '';
    let updateCMilestoneBody;
    let curMilestoneID = -1;
    if (submilePresentInCurrent) {
      curMilestoneID = +currentMilestone[0].data.pID;
      updateCMilestoneBody = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], '').join(';#')
      };
    } else {
      curMilestoneID = +newCurrentMilestone[0].data.pID;
      updateCMilestoneBody = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(newCurrentMilestone[0], '').join(';#')
      };
    }
    const taskCMUpdateObj = Object.assign({}, this.queryConfig);
    taskCMUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +curMilestoneID);
    taskCMUpdateObj.data = updateCMilestoneBody;
    taskCMUpdateObj.listName = this.constants.listNames.Schedules.name;
    taskCMUpdateObj.type = 'PATCH';
    batchUrl.push(taskCMUpdateObj);

    const notificationObj = Object.assign({}, this.queryConfig);
    // tslint:disable: max-line-length
    notificationObj.url = this.spServices.getReadURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, this.taskAllocationService.taskallocationComponent.earlyTaskNotification);
    notificationObj.url = notificationObj.url.replace(/{{projectCode}}/g, this.oProjectDetails.projectCode);
    notificationObj.listName = this.constants.listNames.EarlyTaskCompleteNotifications.name;
    notificationObj.type = 'GET';
    batchUrl.push(notificationObj);

    const response = await this.spServices.executeBatch(batchUrl);
    if (response.length) {
      const notificationBatchUrl = [];
      const notifications = response[0].retItems;
      notifications.forEach(element => {
        const updateNotificationBody = {
          __metadata: { type: this.constants.listNames.EarlyTaskCompleteNotifications.type },
          IsActive: 'No',
        };
        const notificationUpdateObj = Object.assign({}, this.queryConfig);
        notificationUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, +element.ID);
        notificationUpdateObj.data = updateNotificationBody;
        notificationUpdateObj.listName = this.constants.listNames.EarlyTaskCompleteNotifications.name;
        notificationUpdateObj.type = 'PATCH';
        notificationBatchUrl.push(notificationUpdateObj);
      });
      await this.spServices.executeBatch(notificationBatchUrl);
    }
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
    this.getMilestones(false);
  }

  checkStatus(value) {
    return value.status === 'Not Confirmed' ? true : false;
  }

  checkCompletedStatus(value) {
    return value.status === 'Auto Closed' || value.status === 'Completed' ? true : false;
  }

  getSubMilestoneStatus(Milestone, status) {
    const arrSubMil = [];
    if (Milestone.children !== undefined) {
      for (let nCountSub = 0; nCountSub < Milestone.children.length; nCountSub = nCountSub + 1) {
        const submilestone = Milestone.children[nCountSub];
        submilestone.data.status = submilestone.data.status === 'Not Saved' ? Milestone.data.isCurrent ? 'Not Started' : 'Not Confirmed' : submilestone.data.status;
        if (submilestone.data.type !== 'task') {

          if (status === 'Completed') {
            if (submilestone.data.status !== 'Not Confirmed') {
              arrSubMil.push(submilestone.data.pName + ':' + submilestone.data.position + ':Completed');
            }
          } else {
            arrSubMil.push(submilestone.data.pName + ':' + submilestone.data.position + ':' + submilestone.data.status);
          }
        }
      }
    }
    return arrSubMil;
  }

  // ************************************************************************************************
  // Milestone Validation
  // **************************************************************************************************

  validate() {

    const projectBudgetHours = this.oProjectDetails.budgetHours;
    const milestonesData = this.milestoneData;
    const allMilestones = milestonesData.filter(c => c.data.type === 'milestone' && c.data.status !== 'Deleted').map(c => c.data);
    const milestoneBudgetHrs = allMilestones.reduce((a, b) => a + +b.budgetHours, 0);
    if (projectBudgetHours < milestoneBudgetHrs) {

      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'Sum of milestone budget hours cannot be greater than project budget hours.'
      });
      return false;
    }
    const tempMilestones = allMilestones.filter(e => e.status !== 'Completed');
    const checkMilestoneAllocatedTime = tempMilestones.filter(e => (e.budgetHours === '' || +e.budgetHours === 0) && e.status !== 'Not Confirmed');
    if (checkMilestoneAllocatedTime.length > 0 && checkMilestoneAllocatedTime[0].status !== 'Not Saved') {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'Budget hours for ' + checkMilestoneAllocatedTime[0].pName + ' milestone cannot be less than or equal to 0'
      });
      return false;
    }
    let previousNode;
    for (const milestone of milestonesData) {

      if (milestone.data.status !== 'Completed' && milestone.data.status !== 'Deleted') {
        let bSubMilPresent = false;
        const zeroItem = milestone.children && milestone.children.length ? milestone.children[0].data : milestone.data;
        const AllTasks = this.getTasksFromMilestones(milestone, false, false);
        const milestoneTasks = AllTasks.filter(t => t.status !== 'Abandon' && t.status !== 'Completed' && t.status !== 'Not Confirmed' && t.itemType !== 'Adhoc');
        if (milestone.data.status === 'In Progress') {
          if (zeroItem.itemType === 'submilestone') {
            bSubMilPresent = true;
          }
          let checkTasks = [];
          if (bSubMilPresent) {
            milestone.children.forEach(element => {
              if (element.data.status === 'In Progress' && element.data.itemType === 'submilestone') {
                checkTasks = checkTasks.concat(this.getTasksFromMilestones(element, false, false));
              }
            });
          } else {
            checkTasks = milestoneTasks;
          }
          checkTasks = checkTasks.filter(t => !t.parentSlot && t.IsCentrallyAllocated === 'No');
          // tslint:disable
          const checkTaskAllocatedTime = checkTasks.filter(e => (e.budgetHours === '' || +e.budgetHours === 0)
            && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' && e.itemType !== 'Follow up' && e.status !== 'Completed');
          // tslint:enable
          if (checkTaskAllocatedTime.length > 0) {
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'Allocated time for task cannot be equal or less than 0 for '
                + milestone.data.pName + ' - ' + checkTaskAllocatedTime[0].pName
            });

            return false;
          }
          let validateAllocation = true;
          checkTasks.forEach(element => {
            const title = element.AssignedTo ? element.AssignedTo.Title : null;
            if (!title) {
              validateAllocation = false;
            }
          });
          if (!validateAllocation) {
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'All tasks should be assigned to either a resource or skill for active milestone.'
            });

            return false;
          }

          const compareDates = checkTasks.filter(e => (e.pEnd <= e.pStart && e.tat === false
            && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' &&
            e.itemType !== 'Follow up' && e.status !== 'Completed'));
          if (compareDates.length > 0) {

            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'End date should be greater than start date of ' + milestone.data.pName + ' - ' + compareDates[0].pName
            });

            return false;
          }

          const errorPresnet = this.validateTaskDates(checkTasks);
          if (errorPresnet) {
            return false;
          }
        }

        if (previousNode !== undefined && previousNode.status !== "Completed" && new Date(previousNode.pEnd) >= new Date(milestone.data.pStart)) {
          let errormessage = previousNode.milestone + ' Client Review';
          if (previousNode.pName !== 'Client Review') {
            errormessage = previousNode.pName;
          }

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + milestone.data.pName + ' should be greater than end date of ' + errormessage
          });
          return false;
        }
        const milestoneTasksRelink = AllTasks.filter(t => t.status !== 'Abandon' && t.status !== 'Completed' && t.itemType !== 'Adhoc');
        if (milestoneTasksRelink.length > 0) {
          this.LinkScToClientReview(milestoneTasksRelink);
        }

      }
      previousNode = milestone.data;

    }
    return true;
  }


  LinkScToClientReview(milestoneTasks) {

    const LatestSCDate = new Date(Math.max.apply(null, milestoneTasks.filter(c => c.itemType === 'Send to client').map(c => c.pUserEnd)));

    const LatestSC = milestoneTasks.find(c => c.itemType === 'Send to client' &&
      new Date(c.pUserEnd).getTime() === LatestSCDate.getTime());

    const CR = milestoneTasks.find(c => c.itemType === 'Client Review');

    if (LatestSC && CR) {
      LatestSC.nextTask = CR ? CR.pName : null;
      CR.previousTask = LatestSC ? LatestSC.pName : null;
    }
  }


  // *************************************************************************************************************************************
  // load component for  comment
  // *************************************************************************************************************************************

  // tslint:disable
  async ViewTaskDetails(task) {

    const ref = this.dialogService.open(TaskDetailsDialogComponent, {
      data: {
        task: task,
      },
      header: task.submilestone !== null ? task.milestone + ' - ' + task.submilestone + ' - ' + task.pName : task.milestone + " - " + task.pName,
      width: '80vw',
      contentStyle: { "min-height": "30vh", "max-height": "90vh", "overflow-y": "auto" }
    });
    ref.onClose.subscribe(async (taskobj: any) => {

    });
  }



  getTaskObjectByValue(task, className, milestone, nextTasks, previousTasks, submilestone) {
    const submilestoneLabel = submilestone ? submilestone.label : '';
    return {
      'pID': task.dbId === undefined ? task.Id : task.dbId,
      'pName': task.label,
      'pStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStartDatePart': this.getDatePart(this.Today),
      'pUserStartTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pUserEndDatePart': this.getDatePart(this.Today),
      'pUserEndTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pClass': className,
      'pLink': '',
      'pMile': 0,
      'pRes': '  ',
      'pComp': 0,
      'pGroup': className = 'gtaskred' ? 0 : 1,
      'pParent': task.taskType === 'Client Review' ? 0 : milestone.Id,
      'pOpen': 1,
      'pDepend': '',
      'pCaption': '',
      'pNotes': null,
      'status': 'Not Saved',
      'budgetHours': 0,
      'allowStart': false,
      'tat': task.taskType === 'Client Review' ? true : false,
      'tatVal': 0,
      'milestoneStatus': className = 'gtaskred' ? 'Not Saved' : null,
      'type': 'task',
      'slotType': task.slotType ? task.slotType : '',
      'editMode': true,
      'scope': null,
      'spentTime': '0:0',
      'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      'isFuture': '',
      'assignedUsers': [{ Title: '', userType: '' }],
      'AssignedTo': {},
      'userCapacityEnable': false,
      'subtype': submilestone ? submilestone.label === 'Default' ? '' : 'submilestone' : '',
      'nextTask': nextTasks === "" ? null : nextTasks,
      'previousTask': previousTasks === "" ? null : previousTasks,
      'itemType': task.taskType,
      'IsCentrallyAllocated': task.IsCentrallyAllocated,
      'edited': true,
      'added': true,
      'submilestone': submilestoneLabel,
      'milestone': milestone.label,
      'skillLevel': task.skillLevel,
      'CentralAllocationDone': task.CentralAllocationDone,
      'ActiveCA': task.ActiveCA,
      'assignedUserTimeZone': '5.5',
      'DisableCascade': task.DisableCascade && task.DisableCascade === 'Yes' ? true : false,
      'taskFullName': this.oProjectDetails.projectCode + ' ' + milestone.label + ' ' + task.label
    };
  }

  getObjectByValue(milestone, type, tempmilestoneId, TempSubmilePositionArray) {

    return {
      'pID': milestone.dbId === undefined ? tempmilestoneId : milestone.dbId,
      'pName': milestone.label,
      'pStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStartDatePart': this.getDatePart(this.Today),
      'pUserStartTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pUserEndDatePart': this.getDatePart(this.Today),
      'pUserEndTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pClass': 'ggroupblack',
      'pLink': '',
      'pMile': 0,
      'pRes': '',
      'pComp': 0,
      'pGroup': 1,
      'pParent': 0,
      'pOpen': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? 1 : 0,
      'pDepend': '',
      'pCaption': '',
      'status': 'Not Saved',
      'tat': null,
      'tatVal': 0,
      'budgetHours': '0',
      'spentTime': '0:0',
      'pNotes': null,
      'type': type,
      'milestoneStatus': '',
      'editMode': true,
      'scope': null,
      'position': type === 'submilestone' ? TempSubmilePositionArray.find(c => c.name === milestone.label) !== undefined ? TempSubmilePositionArray.find(c => c.name === milestone.label).position : 1 : '',
      'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ?
        this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.label)
          > -1 ? true : false : false,
      'isNext': this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === milestone.label ? true : false,
      'userCapacityEnable': false,
      'edited': true,
      'added': true
    };
  }


  getExistindData(oExistingTask) {
    oExistingTask.pStart = new Date(oExistingTask.pStart);
    oExistingTask.pEnd = new Date(oExistingTask.pEnd);
    oExistingTask.pUserStart = new Date(oExistingTask.pUserStart);
    oExistingTask.pUserEnd = new Date(oExistingTask.pUserEnd);
    oExistingTask.pUserStartDatePart = this.getDatePart(oExistingTask.pUserStart);
    oExistingTask.pUserStartTimePart = this.getTimePart(oExistingTask.pUserStart);
    oExistingTask.pUserEndDatePart = this.getDatePart(oExistingTask.pUserEnd);
    oExistingTask.pUserEndTimePart = this.getTimePart(oExistingTask.pUserEnd);
    oExistingTask.tatVal = this.commonService.calcBusinessDays(new Date(oExistingTask.pStart), new Date(oExistingTask.pEnd));


    return oExistingTask;
  }
  // tslint:enable


  CascadeDialog() {

    const ref = this.dialogService.open(CascadeDialogComponent, {
      data: {

      },
      header: 'Cascading Data',
      width: '80vw',
      contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe(async (taskobj: any) => {

    });

  }

  trackByFn(index, item) {
    return index; // or item.id
  }

}


export interface MilestoneTreeNode {
  data?: any;
  children?: MilestoneTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}
