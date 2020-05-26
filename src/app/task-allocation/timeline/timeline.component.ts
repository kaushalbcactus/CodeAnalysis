import {
  Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation, Input, OnDestroy, HostListener, ElementRef, ComponentFactoryResolver,
  ComponentRef, ComponentFactory, ViewContainerRef, NgZone, AfterViewInit, ChangeDetectorRef, AfterViewChecked
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import { CommonService } from 'src/app/Services/common.service';
// import { GanttEditorComponent, GanttEditorOptions } from 'ng-gantt';
import { TreeNode, MessageService, DialogService, ConfirmationService, DynamicDialogRef } from 'primeng';
import { MenuItem } from 'primeng/api';
import { DragDropComponent } from '../drag-drop/drag-drop.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';
import { NgxMaterialTimepickerTheme, NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { GanttChartComponent } from '../../shared/gantt-chart/gantt-chart.component';
import { SelectItem } from 'primeng/api';
import { gantt, Gantt } from '../../dhtmlx-gantt/codebase/source/dhtmlxgantt';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
declare let dhtmlXMenuObject: any;
// import { DailyAllocationComponent } from '../daily-allocation/daily-allocation.component';
import { IMilestoneTask } from '../interface/allocation';
import { DailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { AllocationOverlayComponent } from 'src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component';
import { GanttEdittaskComponent } from '../gantt-edittask/gantt-edittask.component';
import { ConflictAllocationsComponent } from '../conflict-allocations/conflict-allocations.component';
// import { ResourceSelectionComponent } from '../resource-selection/resource-selection.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers: [MessageService, DialogService, DragDropComponent, UsercapacityComponent, DynamicDialogRef,
    PreStackAllocationComponent, AllocationOverlayComponent, GanttEdittaskComponent],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  scales: SelectItem[];
  selectedScale: any;
  @Input() projectDetails: any;
  @Output() reloadResources = new EventEmitter<string>();
  public GanttchartData = [];
  tempGanttchartData = [];
  oldGantChartData = [];
  public noTaskError = 'No milestones found.';
  // @ViewChild('gantteditor', { static: true }) gantteditor: GanttEditorComponent;
  @ViewChild('reallocationMailTableID', { static: false }) reallocateTable: ElementRef;
  @ViewChild('ganttcontainer', { read: ViewContainerRef, static: false }) ganttChart: ViewContainerRef;
  // @ViewChild('resourceSelect', { static: false }) resourceSelect: ResourceSelectionComponent;
  @ViewChild('dailyAllocateOP', { static: false }) dailyAllocateOP: AllocationOverlayComponent;
  @ViewChild('ganttPicker', { static: false }) picker: NgxMaterialTimepickerComponent;
  Today = new Date();
  tempComment;
  minDateValue = new Date();
  yearsRange = new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);
  task;
  errorMessage;
  milestoneDataCopy = [];
  ganttObject: any = {};
  resource = [];
  ganttComponentRef: any;
  updatedTasks: any;

  hoverRowData = {
    allocationPerDay: '',
    event: {}
  };
  min_date;
  max_date;
  startDate;
  endDate;
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
  public allRestructureTasks = [];
  batchContents = new Array();
  // private editorOptions: GanttEditorOptions;
  public GanttChartView = true;
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
    allOldMilestones: [],
    ta: [],
    deliverable: [],
    account: [],
    projectType: ''
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
  currentTask;
  allTaskData;
  resetTask
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
  assignedUsers = [];
  showBudgetHrs = false;
  budgetHrs = 0;
  selectedTask: any;
  displayBody = false;
  graphFlag: boolean;
  menu: any;
  dragClickedInput: string;
  capacityObj: any = {
    users: [],
    conflictAllocation: false
  }
  maxBudgetHrs: any = "";
  resourceSeletion: any;
  header: string;
  hideResourceSelection = false;
  taskTime;
  ganttSetTime: boolean = false;
  singleTask;
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
    private resolver: ComponentFactoryResolver,
    private zone: NgZone, private fb: FormBuilder,
    private dailyAllocation: PreStackAllocationComponent,
    private cdRef: ChangeDetectorRef,
    private myElement: ElementRef
  ) {

  }

  ngOnInit() {

    this.scales = [
      { label: 'Minute Scale', value: '0' },
      { label: 'Day Scale', value: '1' },
      { label: 'Week Scale', value: '2' },
      { label: 'Month Scale', value: '3' },
      { label: 'Quarter Scale', value: '4' },
      { label: 'Year Scale', value: '5' }]

    if (this.projectDetails !== undefined) {
      this.sharedObject.oTaskAllocation.oProjectDetails = this.projectDetails;
      this.projectDetails.projectCode = this.projectDetails.ProjectCode;
      this.oProjectDetails.projectCode = this.projectDetails.projectCode;
      this.onPopupload();
    }

    this.sharedObject.currentUser.timeZone = this.commonService.getCurrentUserTimeZone();
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    this.cdRef.detach();
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
  }


  async onPopupload() {
    await this.callReloadRes();
    await this.getMilestones(true);
  }

  public async callReloadRes() {

    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'GetProjectResources');
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
  }


  // *************************************************************************************************************************************
  // Get All Milestone Data
  // *************************************************************************************************************************************

  generateDate(date) {
    return date ?
      {
        date: {
          'year': new Date(date).getFullYear(),
          'month': new Date(date).getMonth() + 1,
          'day': new Date(date).getDate()
        }
      } : '';
  }

  // getDate(startDate) {
  //   return startDate !== '' ? startDate.date.year + '/' + (startDate.date.month < 10 ?
  //     '0' + startDate.date.month : startDate.date.month) + '/' + (startDate.date.day < 10
  //       ? '0' + startDate.date.day : startDate.date.day) : '';
  // }
  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }
  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
  }


  createFetchTaskObject(milestoneTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated,
    projectAvailableHours, allRetrievedTasks, tempSubmilestones, milestone) {
    let taskName = '';
    let bConsiderAllcoated = true;
    for (const milestoneTask of milestoneTasks) {
      bConsiderAllcoated = milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes' ? false : true;
      // if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
      //   // if (milestoneTask.Task.indexOf('Slot') > -1) {
      //   bDontConsiderAllcoated = true;
      //   // }
      // } else 
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


      const hrsMinObject = {
        timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
          milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
        timeMins: milestoneTask.TimeSpent != null ?
          milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
      };

      if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
        milestoneHoursSpent.push(hrsMinObject);
        projectHoursSpent.push(hrsMinObject);
        if (bConsiderAllcoated) {
          projectHoursAllocated.push(+milestoneTask.ExpectedTime);
        }
      }
      if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
        if (milestoneTask.TimeSpent == null) {
          projectAvailableHours.push(+milestoneTask.ExpectedTime);
        } else {
          const mHoursSpentTask = this.commonService.addHrsMins([hrsMinObject]);
          // const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
          const convertedHoursMins = this.commonService.convertFromHrsMins(mHoursSpentTask);
          projectAvailableHours.push(+convertedHoursMins);
        }
      } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon' && bConsiderAllcoated) {
        //if (bConsiderAllcoated) {
        projectAvailableHours.push(+milestoneTask.ExpectedTime);
        // }
      }

      // Gantt Chart Sub Object

      if (milestoneTask.Status !== 'Deleted') {
        milestoneTask.type = 'task';

        let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(milestoneTask, '', '', milestone, hrsMinObject);
        // console.log(GanttTaskObj)

        taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
        this.GanttchartData.push(GanttTaskObj);
        allRetrievedTasks.push(GanttTaskObj);
        // const tempObj = { 'data': GanttTaskObj };
        // tempSubmilestones.push(tempObj);
        let tempObj = {};
        if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
          const dummyExistingSlot = tempSubmilestones.find(s => s.data.id === GanttTaskObj.id);
          if (dummyExistingSlot) {
            dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
          } else {
            tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
            tempSubmilestones.push(tempObj);
          }
        } else {
          if (GanttTaskObj.parentSlot) {
            const slot = tempSubmilestones.find(t => t.data.id === +GanttTaskObj.parentSlot);
            if (slot) {
              slot.children.push({ 'data': GanttTaskObj });
            } else {
              const tempSlot = Object.assign({}, GanttTaskObj);
              tempSlot.id = GanttTaskObj.parentSlot;
              tempSubmilestones.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
            }
          } else {
            tempObj = { 'data': GanttTaskObj };
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
      milestoneTemp.spentTime = milestoneHoursSpent.length > 0 ? this.commonService.addHrsMins(milestoneHoursSpent) : '0:0';
      const tempmilestone = {
        'data': milestoneTemp,
        'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
        'children': submile
      }

      this.milestoneData.push(tempmilestone);
    }
  }

  createFetchTaskCR(milestone) {
    const clientReviewObj = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title &&
      c.Task === 'Client Review' && c.Status !== 'Deleted');

    if (clientReviewObj.length > 0) {
      clientReviewObj[0].assignedUsers = [{ Title: '', userType: '' }];
      const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
        return clientReviewObj[0].AssignedTo.ID === objt.UserName.ID;
      });
      clientReviewObj[0].assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
        ? AssignedUserTimeZone[0].TimeZone.Title ?
          AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';


      let color = this.colors.filter(c => c.key == clientReviewObj[0].Status)
      if (color.length) {
        clientReviewObj[0].color = color[0].value;
      }

      clientReviewObj[0].type = 'task';
      let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(clientReviewObj[0], '', '', milestone, '');
      // console.log(GanttTaskObj)

      // i = clientReviewObj[0].Id;
      if (GanttTaskObj.status !== 'Deleted') {
        this.GanttchartData.push(GanttTaskObj);
      }

      const tempmilestone = { 'data': GanttTaskObj, 'children': [] }
      this.milestoneData.push(tempmilestone);
    }
  }

  createFetchTaskSubMil(dbSubMilestones, milestone, GanttObj, nextSubMilestone, milestoneHoursSpent, projectHoursSpent,
    projectHoursAllocated, projectAvailableHours, allRetrievedTasks, submile) {
    let index = 0;
    for (const element of dbSubMilestones) {
      index++;
      let color = this.colors.filter(c => c.key == element.status)

      element.Id = parseInt("1200000" + milestone.Id + index)
      element.type = 'submilestone'
      element.Status = element.status
      if (color.length) {
        element.color = color[0].value;
      }

      let tempSubmilestones = [];
      let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(element, GanttObj, nextSubMilestone, milestone, '')
      if (GanttTaskObj.status !== 'Deleted') {
        this.GanttchartData.push(GanttTaskObj);
      }

      const milestoneTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && c.SubMilestones === element.subMile);

      this.createFetchTaskObject(milestoneTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours
        , allRetrievedTasks, tempSubmilestones, milestone);

      if (tempSubmilestones.length > 0) {

        const tempSubmilestonesWOAT = tempSubmilestones.filter(c => c.data.itemType !== 'Time Booking');
        const subMilData = this.GanttchartData.find(c => c.title === element.subMile && c.parent === milestone.Id);
        subMilData.start_date = tempSubmilestonesWOAT[0].data.start_date;
        subMilData.end_date = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.end_date;
        subMilData.pUserStart = tempSubmilestonesWOAT[0].data.start_date;
        subMilData.pUserEnd = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.end_date;
        this.setDatePartAndTimePart(subMilData);
      }
      const temptasks = {
        'data': this.GanttchartData.find(c => c.title === element.subMile && c.parent === milestone.Id),
        'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
        'children': tempSubmilestones
      }

      submile.push(temptasks);
    }
  }
  // tslint:disable
  public async getMilestones(bFirstLoad) {
    this.sharedObject.isResourceChange = false;
    this.GanttchartData = [], this.milestoneData = [];
    this.oProjectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const projectHoursSpent = [], projectHoursAllocated = [], projectAvailableHours = [], totalMilestoneBudgetHours = [];
    let milestones = [], milestoneTasks = [], milestoneSubmilestones = [], allRetrievedTasks = [];

    let milestoneCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.milestone);
    milestoneCall.filter = milestoneCall.filter.replace(/{{projectCode}}/gi, this.oProjectDetails.projectCode);

    this.commonService.SetNewrelic('TaskAllocation', 'task-detailsDialog', 'GetMilestonesByProjectCode');
    const response = await this.spServices.readItems(this.constants.listNames.Schedules.name, milestoneCall);
    this.allTasks = response.length ? response : [];

    if (this.allTasks.length > 0) {

      milestones = this.allTasks.filter(c => c.FileSystemObjectType === 1);
      this.deletedMilestones = milestones.filter(m => m.Status === 'Deleted');
      //var i = -1;
      const arrMilestones = this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones;

      const milestonesList = [];
      ////// Sorts the data as per the stored order
      for (const mil of arrMilestones) {
        const milestone = milestones.find(e => e.Title === mil && e.Status !== 'Deleted');
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

        let dbSubMilestones: Array<any> = milestoneSubmilestones.length > 0 ? milestoneSubmilestones.map(o => new Object({
          subMile: o.split(':')[0],
          position: o.split(':')[1], status: o.split(':')[2],
          Milestone: milestone.Title
        })) : [];

        const nextSubMilestone = dbSubMilestones.length > 0 ? dbSubMilestones.find(c => c.status === 'Not Confirmed') !== undefined
          ? dbSubMilestones.find(c => c.status === 'Not Confirmed') : new Object({ subMile: '', position: '', status: '', Milestone: milestone.Title }) :
          new Object({ subMile: '', position: '', status: '', Milestone: milestone.Title });

        // milestone.startDate = milestone.Actual_x0020_Start_x0020_Date ?
        //   {
        //     date: {
        //       'year': new Date(milestone.Actual_x0020_Start_x0020_Date).getFullYear(),
        //       'month': new Date(milestone.Actual_x0020_Start_x0020_Date).getMonth() + 1,
        //       'day': new Date(milestone.Actual_x0020_Start_x0020_Date).getDate()
        //     }
        //   } : '';
        // milestone.endDate = milestone.Actual_x0020_End_x0020_Date ?
        //   {
        //     date: {
        //       'year': new Date(milestone.Actual_x0020_End_x0020_Date).getFullYear(),
        //       'month': new Date(milestone.Actual_x0020_End_x0020_Date).getMonth() + 1,
        //       'day': new Date(milestone.Actual_x0020_End_x0020_Date).getDate()
        //     }
        //   } : '';

        milestone.startDate = this.generateDate(milestone.Actual_x0020_Start_x0020_Date);
        milestone.endDate = this.generateDate(milestone.Actual_x0020_End_x0020_Date);

        let color = this.colors.filter(c => c.key == milestone.Status)
        if (color.length) {
          milestone.color = color[0].value;
        }

        milestone.type = 'milestone';
        // Gantt Chart Object

        let GanttObj: any = this.taskAllocateCommonService.ganttDataObject(milestone)
        // console.log(GanttObj)


        // i = milestone.Id;
        if (GanttObj.status !== 'Deleted') {
          this.GanttchartData.push(GanttObj);
        }
        ////// Refactor code - Done
        if (dbSubMilestones.length > 0) {
          let submile = [];
          this.createFetchTaskSubMil(dbSubMilestones, milestone, GanttObj, nextSubMilestone, milestoneHoursSpent, projectHoursSpent,
            projectHoursAllocated, projectAvailableHours, allRetrievedTasks, submile);
          // let index = 0;
          // for (const element of dbSubMilestones) {
          //   index++;
          //   let color = this.colors.filter(c => c.key == element.status)

          //   element.Id = parseInt("1200000" + milestone.Id + index)
          //   element.type = 'submilestone'
          //   element.Status = element.status
          //   if (color.length) {
          //     element.color = color[0].value;
          //   }

          //   let tempSubmilestones = [];
          //   let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(element, GanttObj, nextSubMilestone, milestone, '')
          //   // console.log(GanttTaskObj)
          //   // taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
          //   if (GanttTaskObj.status !== 'Deleted') {
          //     this.GanttchartData.push(GanttTaskObj);
          //   }

          //   milestoneTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && c.SubMilestones === element.subMile);

          //   this.createFetchTaskObject(milestoneTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours
          //     , allRetrievedTasks, tempSubmilestones, milestone);

          //   // const excludeSlotsListForHrs = [];
          //   // for (const milestoneTask of milestoneTasks) {
          //   //   taskName = '';
          //   //   if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
          //   //     // if (milestoneTask.Task.indexOf('Slot') > -1) {
          //   //     excludeSlotsListForHrs.push(milestoneTask.ID);
          //   //     // }
          //   //   } else {
          //   //     if (milestoneTask.ParentSlot) {
          //   //       excludeSlotsListForHrs.push(milestoneTask.ID);
          //   //     }
          //   //   }
          //   //   let color = this.colors.filter(c => c.key == milestoneTask.Status)
          //   //   if (color.length) {
          //   //     milestoneTask.color = color[0].value;
          //   //   }

          //   //   milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];

          //   //   const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
          //   //     return milestoneTask.AssignedTo.ID === objt.UserName.ID;
          //   //   });
          //   //   milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          //   //     ? AssignedUserTimeZone[0].TimeZone.Title ?
          //   //       AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';


          //   //   const hrsMinObject = {
          //   //     timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
          //   //       milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
          //   //     timeMins: milestoneTask.TimeSpent != null ?
          //   //       milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
          //   //   };

          //   //   if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
          //   //     milestoneHoursSpent.push(hrsMinObject);
          //   //     projectHoursSpent.push(hrsMinObject);
          //   //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
          //   //       projectHoursAllocated.push(+milestoneTask.ExpectedTime);
          //   //     }
          //   //   }
          //   //   if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
          //   //     if (milestoneTask.TimeSpent == null) {
          //   //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
          //   //     } else {
          //   //       const mHoursSpentTask = this.commonService.addHrsMins([hrsMinObject]);
          //   //       // const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
          //   //       const convertedHoursMins = this.commonService.convertFromHrsMins(mHoursSpentTask);
          //   //       projectAvailableHours.push(+convertedHoursMins);
          //   //     }
          //   //   } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
          //   //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
          //   //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
          //   //     }
          //   //   }


          //   //   // Gantt Chart Sub Object
          //   //   if (milestone.Title === milestoneTask.Milestone) {
          //   //     if (milestoneTask.Status !== 'Deleted') {
          //   //       milestoneTask.type = 'task';

          //   //       let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(milestoneTask, '', '', milestone, hrsMinObject);
          //   //       // console.log(GanttTaskObj)

          //   //       taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
          //   //       this.GanttchartData.push(GanttTaskObj);
          //   //       allRetrievedTasks.push(GanttTaskObj);
          //   //       if (GanttTaskObj.itemType !== 'Client Review') {
          //   //         // const tempObj = { 'data': GanttTaskObj };
          //   //         // tempSubmilestones.push(tempObj);
          //   //         let tempObj = {};
          //   //         if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
          //   //           const dummyExistingSlot = tempSubmilestones.find(s => s.data.id === GanttTaskObj.id);
          //   //           if (dummyExistingSlot) {
          //   //             dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
          //   //           } else {
          //   //             tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
          //   //             tempSubmilestones.push(tempObj);
          //   //           }
          //   //         } else {
          //   //           if (GanttTaskObj.parentSlot) {
          //   //             const slot = tempSubmilestones.find(t => t.data.id === +GanttTaskObj.parentSlot);
          //   //             if (slot) {
          //   //               slot.children.push({ 'data': GanttTaskObj });
          //   //             } else {
          //   //               const tempSlot = Object.assign({}, GanttTaskObj);
          //   //               tempSlot.id = GanttTaskObj.parentSlot;
          //   //               tempSubmilestones.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
          //   //             }
          //   //           } else {
          //   //             tempObj = { 'data': GanttTaskObj };
          //   //             tempSubmilestones.push(tempObj);
          //   //           }
          //   //         }
          //   //       }
          //   //     }
          //   //   }

          //   //   // Close  Gantt Chart Object
          //   // }


          //   if (tempSubmilestones.length > 0) {

          //     const tempSubmilestonesWOAT = tempSubmilestones.filter(c => c.data.itemType !== 'Time Booking');
          //     const subMilData = this.GanttchartData.find(c => c.title === element.subMile && c.parent === milestone.Id);
          //     subMilData.start_date = tempSubmilestonesWOAT[0].data.start_date;
          //     subMilData.end_date = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.end_date;
          //     subMilData.pUserStart = tempSubmilestonesWOAT[0].data.start_date;
          //     subMilData.pUserEnd = tempSubmilestonesWOAT[tempSubmilestonesWOAT.length - 1].data.end_date;
          //     this.setDatePartAndTimePart(subMilData);
          //     // subMilData.pUserStartDatePart = this.getDatePart(subMilData.pUserStart);
          //     // subMilData.pUserStartTimePart = this.getTimePart(subMilData.pUserStart);
          //     // subMilData.pUserEndDatePart = this.getDatePart(subMilData.pUserEnd);
          //     // subMilData.pUserEndTimePart = this.getTimePart(subMilData.pUserEnd);
          //     // subMilData.tatVal = this.commonService.calcBusinessDays(new Date(subMilData.start_date), new Date(subMilData.end_date));
          //   }
          //   const temptasks = {
          //     'data': this.GanttchartData.find(c => c.title === element.subMile && c.parent === milestone.Id),
          //     'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
          //     'children': tempSubmilestones
          //   }

          //   submile.push(temptasks);
          // }

          const defaultTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title
            && (c.SubMilestones === null || c.SubMilestones === 'Default') && c.Task !== 'Client Review' && c.Status !== 'Deleted');

          if (defaultTasks.length) {

            this.createFetchTaskObject(defaultTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours,
              allRetrievedTasks, submile, milestone);

            /**
             * excludeSlotsListForHrs is used for exclusion list to consider either slot or subtasks hours for available hours and budget hrs
             */



            // const excludeSlotsListForHrs = [];
            // for (const milestoneTask of DefaultTasks) {
            //   taskName = '';
            //   if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
            //     excludeSlotsListForHrs.push(milestoneTask.ID);
            //   } else {
            //     if (milestoneTask.ParentSlot) {
            //       excludeSlotsListForHrs.push(milestoneTask.ID);
            //     }
            //   }
            //   let color = this.colors.filter(c => c.key == milestoneTask.Status)
            //   if (color.length) {
            //     milestoneTask.color = color[0].value;
            //   }
            //   milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];
            //   const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
            //     return milestoneTask.AssignedTo.ID === objt.UserName.ID;
            //   });
            //   milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
            //     ? AssignedUserTimeZone[0].TimeZone.Title ?
            //       AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

            //   const hrsMinObject = {
            //     timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
            //       milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
            //     timeMins: milestoneTask.TimeSpent != null ?
            //       milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
            //   };

            //   if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
            //     milestoneHoursSpent.push(hrsMinObject);
            //     projectHoursSpent.push(hrsMinObject);
            //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
            //       projectHoursAllocated.push(+milestoneTask.ExpectedTime);
            //     }
            //   }
            //   if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
            //     if (milestoneTask.TimeSpent == null) {
            //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
            //     } else {
            //       const mHoursSpentTask = this.commonService.addHrsMins([hrsMinObject]);
            //       // const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
            //       const convertedHoursMins = this.commonService.convertFromHrsMins(mHoursSpentTask);
            //       projectAvailableHours.push(+convertedHoursMins);
            //     }
            //   } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
            //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
            //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
            //     }
            //   }

            //   // Gantt Chart Sub Object

            //   if (milestone.Title === milestoneTask.Milestone) {
            //     if (milestoneTask.Status !== 'Deleted') {
            //       milestoneTask.type = 'task';
            //       let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(milestoneTask, '', '', milestone, hrsMinObject);
            //       // console.log(GanttTaskObj)

            //       taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
            //       this.GanttchartData.push(GanttTaskObj);
            //       allRetrievedTasks.push(GanttTaskObj);

            //       if (GanttTaskObj.itemType !== 'Client Review') {
            //         let tempObj = {};
            //         if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
            //           const dummyExistingSlot = submile.find(s => s.data.id === GanttTaskObj.id);
            //           if (dummyExistingSlot) {
            //             dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
            //           } else {
            //             tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
            //             submile.push(tempObj);
            //           }
            //         } else {
            //           if (GanttTaskObj.parentSlot) {
            //             const slot = submile.find(t => t.data.id === +GanttTaskObj.parentSlot);
            //             if (slot) {
            //               slot.children.push({ 'data': GanttTaskObj });
            //             } else {
            //               const tempSlot = Object.assign({}, GanttTaskObj);
            //               tempSlot.id = GanttTaskObj.parentSlot;
            //               submile.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
            //             }
            //           } else {
            //             tempObj = { 'data': GanttTaskObj };
            //             submile.push(tempObj);
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
          }
          this.createFetchTaskMilestone(milestone, milestoneHoursSpent, submile);
          // const milestoneTemp = this.GanttchartData.find(c => c.id === milestone.Id);
          // if (milestoneTemp) {
          //   milestoneTemp.spentTime = milestoneHoursSpent.length > 0 ? this.commonService.addHrsMins(milestoneHoursSpent) : '0:0';
          //   const tempmilestone = {
          //     'data': milestoneTemp,
          //     'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
          //     'children': submile
          //   }

          //   this.milestoneData.push(tempmilestone);
          // }

          this.createFetchTaskCR(milestone);
          // const clientReviewObj = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title &&
          //   c.Task === 'Client Review' && c.Status !== 'Deleted');

          // if (clientReviewObj.length > 0) {
          //   clientReviewObj[0].assignedUsers = [{ Title: '', userType: '' }];
          //   const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
          //     return clientReviewObj[0].AssignedTo.ID === objt.UserName.ID;
          //   });
          //   clientReviewObj[0].assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          //     ? AssignedUserTimeZone[0].TimeZone.Title ?
          //       AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';


          //   let color = this.colors.filter(c => c.key == clientReviewObj[0].Status)
          //   if (color.length) {
          //     clientReviewObj[0].color = color[0].value;
          //   }

          //   clientReviewObj[0].type = 'task';
          //   let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(clientReviewObj[0], '', '', milestone, '');
          //   // console.log(GanttTaskObj)

          //   // i = clientReviewObj[0].Id;
          //   if (GanttTaskObj.status !== 'Deleted') {
          //     this.GanttchartData.push(GanttTaskObj);
          //   }

          //   const tempmilestone = { 'data': GanttTaskObj, 'children': [] }
          //   this.milestoneData.push(tempmilestone);

          // }
        }
        else {
          milestoneTasks = this.allTasks.filter(c => c.FileSystemObjectType === 0 && c.Milestone === milestone.Title && c.Task !== 'Client Review');

          let tempSubmilestones = []
          this.createFetchTaskObject(milestoneTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours
            , allRetrievedTasks, tempSubmilestones, milestone);
          //;

          // let GanttTaskObj;
          // let CRObj;
          // const excludeSlotsListForHrs = [];
          // for (const milestoneTask of milestoneTasks) {
          //   taskName = '';

          //   if (milestoneTask.CentralAllocationDone === 'Yes' && milestoneTask.IsCentrallyAllocated === 'Yes') {
          //     excludeSlotsListForHrs.push(milestoneTask.ID);
          //   } else {
          //     if (milestoneTask.ParentSlot) {
          //       excludeSlotsListForHrs.push(milestoneTask.ID);
          //     }
          //   }
          //   let color = this.colors.filter(c => c.key == milestoneTask.Status)
          //   if (color.length) {
          //     milestoneTask.color = color[0].value;
          //   }
          //   milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];
          //   const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
          //     return milestoneTask.AssignedTo.ID === objt.UserName.ID;
          //   });
          //   milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
          //     ? AssignedUserTimeZone[0].TimeZone.Title ?
          //       AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';


          //   const hrsMinObject = {
          //     timeHrs: milestoneTask.TimeSpent != null ? milestoneTask.TimeSpent.indexOf('.') > -1 ?
          //       milestoneTask.TimeSpent.split('.')[0] : milestoneTask.TimeSpent : '00',
          //     timeMins: milestoneTask.TimeSpent != null ?
          //       milestoneTask.TimeSpent.indexOf('.') > -1 ? milestoneTask.TimeSpent.split('.')[1] : '00' : 0
          //   };

          //   if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
          //     milestoneHoursSpent.push(hrsMinObject);
          //     projectHoursSpent.push(hrsMinObject);
          //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
          //       projectHoursAllocated.push(+milestoneTask.ExpectedTime);
          //     }
          //   }
          //   if (milestoneTask.Status === 'Completed' || milestoneTask.Status === 'Auto Closed') {
          //     if (milestoneTask.TimeSpent == null) {
          //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
          //     } else {
          //       const mHoursSpentTask = this.commonService.addHrsMins([hrsMinObject]);
          //       // const taskTotalMins = this.commonService.calculateTotalMins(mHoursSpentTask);
          //       const convertedHoursMins = this.commonService.convertFromHrsMins(mHoursSpentTask);
          //       projectAvailableHours.push(+convertedHoursMins);
          //     }
          //   } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon') {
          //     if (excludeSlotsListForHrs.indexOf(milestoneTask.ID) < 0) {
          //       projectAvailableHours.push(+milestoneTask.ExpectedTime);
          //     }
          //   }

          //   // Gantt Chart Sub Object

          //   if (milestone.Title === milestoneTask.Milestone) {
          //     if (milestoneTask.Status !== 'Deleted') {
          //       milestoneTask.type = 'task';

          //       GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(milestoneTask, '', '', milestone, hrsMinObject);
          //       // console.log(GanttTaskObj)

          //       if (milestoneTask.Task === 'Client Review' && milestoneTask.Status !== 'Deleted') {
          //         //  i = milestoneTask.Id;
          //         CRObj = { 'data': GanttTaskObj };

          //       }
          //       taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
          //       this.GanttchartData.push(GanttTaskObj);
          //       allRetrievedTasks.push(GanttTaskObj);

          //       if (GanttTaskObj.itemType !== 'Client Review') {
          //         let tempObj = {};
          //         if (GanttTaskObj.IsCentrallyAllocated === 'Yes') {
          //           const dummyExistingSlot = tempSubmilestones.find(s => s.data.id === GanttTaskObj.id);
          //           if (dummyExistingSlot) {
          //             dummyExistingSlot.data = Object.assign({}, GanttTaskObj);
          //           } else {
          //             tempObj = { 'data': GanttTaskObj, 'expanded': false, 'children': [] };
          //             tempSubmilestones.push(tempObj);
          //           }
          //         } else {
          //           if (GanttTaskObj.parentSlot) {
          //             const slot = tempSubmilestones.find(t => t.data.id === +GanttTaskObj.parentSlot);
          //             if (slot) {
          //               slot.children.push({ 'data': GanttTaskObj });
          //             } else {
          //               const tempSlot = Object.assign({}, GanttTaskObj);
          //               tempSlot.id = GanttTaskObj.parentSlot;
          //               tempSubmilestones.push({ 'data': tempSlot, 'expanded': false, 'children': [{ 'data': GanttTaskObj }] });
          //             }
          //           } else {
          //             tempObj = { 'data': GanttTaskObj };
          //             tempSubmilestones.push(tempObj);
          //           }
          //         }
          //       }
          //     }
          //   }

          //   // Close  Gantt Chart Object
          // }

          this.createFetchTaskMilestone(milestone, milestoneHoursSpent, tempSubmilestones);
          // const milestoneTemp = this.GanttchartData.find(c => c.id === milestone.Id);
          // if (milestoneTemp) {
          //   milestoneTemp.spentTime = milestoneHoursSpent.length > 0 ? this.commonService.addHrsMins(milestoneHoursSpent) : '0:0';

          //   const tempmilestone = {
          //     'data': milestoneTemp,
          //     'expanded': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false,
          //     'children': tempSubmilestones
          //   }

          //   this.milestoneData.push(tempmilestone);
          // }
          this.createFetchTaskCR(milestone);
          // if (!CRObj && taskName && taskName.replace(/[0-9]/g, '').trim() === 'Client Review') {
          //   const tempmilestone = { 'data': GanttTaskObj, 'children': [] }
          //   this.milestoneData.push(tempmilestone);
          // }
          // else if (CRObj) {
          //   this.milestoneData.push(CRObj);
          // }
        }
      }

      ////// Assign users & hours

      if (this.projectDetails === undefined) {
        this.assignUsers(allRetrievedTasks);
        this.assignProjectHours(projectHoursSpent, projectHoursAllocated, projectAvailableHours, totalMilestoneBudgetHours);
      }

      this.milestoneData = [...this.milestoneData];
      this.GanttchartData = [...this.GanttchartData];
      this.tempmilestoneData = [];
      this.oldGantChartData = this.GanttchartData;
      this.tempGanttchartData = JSON.parse(JSON.stringify(this.GanttchartData));
      this.tempmilestoneData = JSON.parse(JSON.stringify(this.milestoneData));
    }
    else {
      this.milestoneData = [];
    }

    if (this.visualgraph) {
      this.showGanttChart(true);
    }
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));

    // this.oProjectDetails.hoursSpent = this.commonService.convertToHrs(projectHoursSpent.length > 0 ? this.commonService.addHrsMins(projectHoursSpent) : '0:0');
    // this.oProjectDetails.hoursSpent = parseFloat(this.oProjectDetails.hoursSpent.toFixed(2));
    // this.oProjectDetails.allocatedHours = projectHoursAllocated.reduce((a, b) => a + b, 0).toFixed(2);
    // this.oProjectDetails.spentHours = projectAvailableHours.reduce((a, b) => a + b, 0).toFixed(2);
    // this.oProjectDetails.totalMilestoneBudgetHours = totalMilestoneBudgetHours.reduce((a, b) => a + b, 0);

    // this.oProjectDetails.availableHours = +(+this.oProjectDetails.budgetHours - +this.oProjectDetails.spentHours).toFixed(2);
    this.disableSave = false;
    if (!bFirstLoad) {
      this.changeInRestructure = false;
      this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Tasks Saved Successfully' });
    } else {
      this.ganttAttachEvents();
    }
    this.loaderenable = false;
    this.visualgraph = this.graphFlag !== undefined ? this.graphFlag : true;
    this.GanttChartView = true;
  }

  assignProjectHours(projectHoursSpent, projectHoursAllocated, projectAvailableHours, totalMilestoneBudgetHours) {
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));
    this.oProjectDetails.hoursSpent = this.commonService.convertToHrs(projectHoursSpent.length > 0 ? this.commonService.addHrsMins(projectHoursSpent) : '0:0');
    this.oProjectDetails.hoursSpent = parseFloat(this.oProjectDetails.hoursSpent.toFixed(2));
    this.oProjectDetails.allocatedHours = projectHoursAllocated.reduce((a, b) => a + b, 0).toFixed(2);
    this.oProjectDetails.spentHours = projectAvailableHours.reduce((a, b) => a + b, 0).toFixed(2);
    this.oProjectDetails.totalMilestoneBudgetHours = totalMilestoneBudgetHours.reduce((a, b) => a + b, 0);

    this.oProjectDetails.availableHours = +(+this.oProjectDetails.budgetHours - +this.oProjectDetails.spentHours).toFixed(2);

  }

  async assignUsersToTask(taskObj, allRetrievedTasks) {
    const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(taskObj.data, allRetrievedTasks);

    taskObj.data.assignedUsers = [];
    const response = await this.formatAssignedUser(assignedUsers);
    taskObj.data.assignedUsers = response;
    if (taskObj.data.editMode) {
      taskObj.data.assignedUsers.forEach(element => {
        if (element.items.find(c => c.value.ID === taskObj.data.AssignedTo.ID)) {
          taskObj.data.AssignedTo = element.items.find(c => c.value.ID === taskObj.data.AssignedTo.ID).value;
        }
      });
    }
  }

  // *************************************************************************************************************************************
  // Switch between Gantt chart and Tree table View
  // *************************************************************************************************************************************
  /////// Refactor code - Done
  public async assignUsers(allRetrievedTasks) {

    for (let nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
      let milestone = this.milestoneData[nCount];
      if (milestone.data.itemType === 'Client Review') {
        // const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(milestone.data, allRetrievedTasks);

        // milestone.data.assignedUsers = [];
        // const response = await this.formatAssignedUser(assignedUsers);
        // milestone.data.assignedUsers = response;
        // if (milestone.data.editMode) {
        //   milestone.data.assignedUsers.forEach(element => {
        //     if (element.items.find(c => c.value.ID === milestone.data.AssignedTo.ID)) {
        //       milestone.data.AssignedTo = element.items.find(c => c.value.ID === milestone.data.AssignedTo.ID).value;
        //     }
        //   });
        // }
        await this.assignUsersToTask(milestone, allRetrievedTasks);

      } else if (milestone.children !== undefined) {
        for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
          let submilestone = milestone.children[nCountSub];
          if (submilestone.data.type === 'task') {
            // const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(submilestone.data, allRetrievedTasks);

            // submilestone.data.assignedUsers = [];
            // const response = await this.formatAssignedUser(assignedUsers);
            // submilestone.data.assignedUsers = response;
            // if (submilestone.data.editMode) {
            //   submilestone.data.assignedUsers.forEach(element => {
            //     if (element.items.find(c => c.value.ID === submilestone.data.AssignedTo.ID)) {
            //       submilestone.data.AssignedTo = element.items.find(c => c.value.ID === submilestone.data.AssignedTo.ID).value;
            //     }
            //   });
            // }
            await this.assignUsersToTask(submilestone, allRetrievedTasks);

          } else if (submilestone.children !== undefined) {
            for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
              const task = submilestone.children[nCountTask];
              // const assignedUsers = await this.taskAllocateCommonService.getResourceByMatrix(task.data, allRetrievedTasks);
              // task.data.assignedUsers = [];
              // const response = await this.formatAssignedUser(assignedUsers);
              // task.data.assignedUsers = response;
              // if (task.data.editMode) {
              //   task.data.assignedUsers.forEach(element => {
              //     if (element.items.find(c => c.value.ID === task.data.AssignedTo.ID)) {
              //       task.data.AssignedTo = element.items.find(c => c.value.ID === task.data.AssignedTo.ID).value;
              //     }
              //   });
              // }
              await this.assignUsersToTask(task, allRetrievedTasks);
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
    if (this.visualgraph === false) {
      this.visualgraph = true;
      this.showGanttChart(true);
    } else {
      this.ganttChart.remove();
      this.visualgraph = false;
    }
  }

  showGanttChart(bCreateLinks) {
    this.createGanttDataAndLinks(bCreateLinks);
    // this.taskAllocateCommonService.ganttParseObject.data = this.GanttchartData;
    // this.taskAllocateCommonService.ganttParseObject.links = this.linkArray;
    this.sharedObject.allocatedTask = this.taskAllocateCommonService.ganttParseObject.data.filter(e => e.type !== 'milestone' && e.slotType !== 'Slot' && e.title !== 'Client Review' && e.itemType !== 'Send to client')
    this.loadComponent();
  }

  createLinkArrayObject(sourceObj, targetObj) {
    return {
      "name": sourceObj.title,
      "source": sourceObj.id,
      "target": targetObj.id,
      "nextTask": sourceObj.nextTask,
      "type": 0,
    }
  }
  /////// Refactor code - Done
  createGanttDataAndLinks(createLinks, milestonesList?) {
    const linkArray = [];

    const data = this.GanttchartData;
    let milestones = data.filter(e => e.type == 'milestone')
    milestones.map(m => {
      const getFirstTasks = data.filter(e => e.type === 'task' && e.milestone === m.taskFullName && !e.previousTask
        && e.itemType !== 'Adhoc' && e.itemType !== 'TB');
      if (getFirstTasks.length) {
        let firstTask;
        if (getFirstTasks.length > 1) {
          firstTask = this.sortByDate(getFirstTasks, 'start_date', 'asc')[0];
        } else {
          firstTask = getFirstTasks[0];
        }

        if (firstTask.start_date > m.start_date) {
          m.start_date = new Date(firstTask.start_date);
        }
      }
      const getClientReview = data.find(e => e.itemType === 'Client Review' && e.milestone === m.taskFullName);
      if (getClientReview) {
        m.end_date = new Date(getClientReview.start_date);
      } else {
        m.end_date = new Date(new Date(m.end_date).setHours(23, 59, 59, 59));
      }
      return m;
    });

    // ////// index of cr tasks
    // const indexes = data.reduce((r, e, i) => {
    //   e.itemType == 'Client Review' && r.push(i);
    //   return r;
    // }, []);
    // ////// index of submilestones
    // const subIndex = data.reduce((r, e, i) => {
    //   e.type == 'submilestone' && r.push(i);
    //   return r;
    // }, []);

    // let submilestones = data.filter(item => item.type == 'submilestone' && item.added === true)

    // let previousSub: any;
    data.forEach((item, index) => {
      item.parent = 0;
      if (item.type === 'submilestone') {
        const mil = milestones.find(e => e.text === item.milestone)
        item.parent = mil.id;
        const subMils = data.filter(e => (e.position ? parseInt(e.position) : 0) === parseInt(item.position) + 1);
        subMils.forEach(submil => {
          linkArray.push(this.createLinkArrayObject(item, submil));
        });
      } else if (item.type === 'task' && item.itemType !== 'Client Review') {
        if (item.parentSlot) {
          item.parent = item.parentSlot;
        } else {
          const taskParent = data.find(e => item.submilestone ?
            e.text === item.submilestone && e.milestone === item.milestone :
            e.text === item.milestone);
          item.parent = taskParent.id;
        }
        if (item.nextTask && item.nextTask.indexOf('Client Review') === -1) {
          const nextTasks = this.fetchNextTasks(item);
          nextTasks.forEach(nextTask => {
            linkArray.push(this.createLinkArrayObject(item, nextTask));
          });
        }

      } else if (item.type === 'task' && item.itemType === 'Client Review') {
        const arrMilestones = milestonesList ? milestonesList : this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones;
        const milIndex = arrMilestones.indexOf(item.milestone);
        const nextMilesone = arrMilestones.length - 1 === milIndex ? '' : arrMilestones[milIndex + 1];
        if (nextMilesone) {
          const nextMil = data.find(e => e.text === nextMilesone);
          linkArray.push(this.createLinkArrayObject(item, nextMil));
        }
      }
      else if (item.type === 'milestone') {
        const crTask = data.find(e => e.itemType === 'Client Review' && e.milestone === item.text);
        linkArray.push(this.createLinkArrayObject(item, crTask));
      }
      if (item.AssignedTo && item.AssignedTo.ID >= 0) {
        this.resource.push({
          "key": item.AssignedTo.ID,
          "Name": item.AssignedTo.Name,
          "label": item.AssignedTo.Title,
          "Email": item.AssignedTo.EMail,
          'textColor': '#fff'
        })
      }
      // else
      //   if (item.submilestone) {
      //     submilestones.forEach((subMile) => {
      //       if (item.submilestone === subMile.title) {
      //         item.parent = item.subId;
      //       }
      //     })
      //     subIndex.forEach((s) => {
      //       let sub = data[s];
      //       if (sub.position > 1 && previousSub !== undefined) {
      //         sub.parent = previousSub.parent;
      //       } else {
      //         let m = data[s - 1];
      //         sub.parent = m.id
      //         previousSub = sub;
      //       }
      //     })
      //   } else {
      //     milestones.forEach((m) => {
      //       if (item.milestone === m.title.replace(' (Current)', '') || item.milestone === m.title) {
      //         item.parent = m.id;
      //       }
      //     })
      //   }
    });

    this.taskAllocateCommonService.ganttParseObject.data = data;


    // data.forEach((item, index) => {
    //   if()
    //   indexes.forEach((i) => {
    //     let clientReview = data[i]
    //     let nextMilestone = data[i + 1]
    //     clientReview.parent = 0;
    //     if (i !== data.length - 1 && !(this.linkArray.find(e => e.source == clientReview.id && e.target == nextMilestone.id))) {
    //       this.linkArray.push(
    //         //   {
    //         //   "name": clientReview.title,
    //         //   "source": clientReview.id,
    //         //   "target": nextMilestone.id,
    //         //   "nextTask": clientReview.nextTask,
    //         //   "type": 0,
    //         // }
    //         this.createLinkArrayObject(clientReview, nextMilestone, true)
    //       );
    //     }
    //   })

    //   task = this.fetchTask(item)
    //   if (task.length) {
    //     task.forEach((e) => {
    //       if (e.milestone === item.milestone && item.nextTask !== 'Client Review') {
    //         this.linkArray.push(
    //           //   {
    //           //   "name": item.title,
    //           //   "source": item.id,
    //           //   "target": e.id,
    //           //   "nextTask": item.nextTask,
    //           //   "type": 0,
    //           // }
    //           this.createLinkArrayObject(item, e, true)
    //         )
    //       }
    //     })
    //   }
    // })

    // let tasks = data.filter(e => e.itemType == "Client Review")

    // tasks.forEach((task) => {
    //   milestones.forEach((m) => {
    //     if ((task.milestone === m.title.replace(' (Current)', '') || task.milestone === m.title) && !(this.linkArray.find(e => e.name == m.title))) {
    //       this.linkArray.push(
    //         //   {
    //         //   "name": m.title,
    //         //   "source": m.id,
    //         //   "target": task.id,
    //         //   "nextTask": task.nextTask,
    //         //   "type": 0,
    //         // }
    //         this.createLinkArrayObject(m, task, false)
    //       )
    //     }
    //   })
    // })

    // data.forEach((item, index) => {

    // })

    this.resource = this.resource.filter(function (a) {
      let key = a.label;
      if (!this[key]) {
        this[key] = true;
        return true;
      }
    }, Object.create(null));

    if (createLinks) {
      this.taskAllocateCommonService.ganttParseObject.links = linkArray;
    }
  }

  fetchNextTasks(task) {
    if (task.nextTask) {
      const nextTaskVal = task.nextTask.replace(/#/gi, '');
      const arrayNext = nextTaskVal.split(';');
      return this.GanttchartData.filter(e => arrayNext.indexOf(e.title) > -1 && e.milestone === task.milestone);
    } else {
      return [];
    }
  }

  currentTaskId;


  generateMenuList(indices) {
    const menus = [
      { "id": "budgetHrs", "text": "Budget Hours", "enabled": true },
      // { "id": "startDate", "text": "Start Date and Time", "enabled": true },
      // { "id": "endDate", "text": "End Date and Time", "enabled": true },
      { "id": "editTask", "text": "Edit Task", "enabled": true },
      { "id": "tatON", "text": "TAT ON", "enabled": true },
      { "id": "tatOFF", "text": "TAT OFF", "enabled": true },
      { "id": "disableCascadeON", "text": "Disable Cascade", "enabled": true },
      { "id": "disableCascadeOFF", "text": "Enable Cascade", "enabled": true },
      { "id": "filesandcomments", "text": "Files And Comments", "enabled": true },
      { "id": "capacity", "text": "Show Capacity", "enabled": true },
      { "id": "confirmMilestone", "text": "Confirm Milestone", "enabled": true },
      { "id": "confirmSubmilestone", "text": "Confirm SubMilestone", "enabled": true },
      { "id": "editAllocation", "text": "Edit Allocation", "enabled": true },
      { "id": "equalSplit", "text": "Equal Split", "enabled": true }

    ]

    let menuItems = [];

    indices.forEach(element => {
      menuItems.push(menus[element]);
    });

    return menuItems;
  }

  // showMenus(task) {
  //   if (task.type == "task") {
  //     this.menu.showItem(menus[0].id);
  //     // this.menu.hideItem(menus[3].id);
  //     // this.menu.hideItem(menus[4].id);
  //     // this.menu.hideItem(menus[5].id);
  //     // this.menu.hideItem(menus[6].id);
  //     // this.menu.hideItem(menus[9].id);
  //     // this.menu.hideItem(menus[10].id);
  //     // this.menu.hideItem(menus[11].id);
  //     // this.menu.hideItem(menus[12].id);
  //     if (task.itemType !== "Client Review") {
  //       if (task.tat && task.DisableCascade) {
  //         this.menu.showItem(menus[1].id);
  //         this.menu.showItem(menus[2].id);
  //         if (task.slotType !== "Slot" && task.itemType !== "Send to client") {
  //           this.menu.hideItem(menus[3].id);
  //           this.menu.showItem(menus[4].id);
  //         }
  //         this.menu.hideItem(menus[5].id);
  //         this.menu.showItem(menus[6].id);
  //       } else if (task.tat && !task.DisableCascade) {
  //         this.menu.showItem(menus[1].id);
  //         this.menu.showItem(menus[2].id);
  //         if (task.slotType !== "Slot" && task.itemType !== "Send to client") {
  //           this.menu.hideItem(menus[3].id);
  //           this.menu.showItem(menus[4].id);
  //         }
  //         this.menu.showItem(menus[5].id);
  //         this.menu.hideItem(menus[6].id);
  //       } else if (!task.tat && task.DisableCascade) {
  //         this.menu.showItem(menus[1].id);
  //         this.menu.showItem(menus[2].id);
  //         if (task.slotType !== "Slot" && task.itemType !== "Send to client") {
  //           this.menu.showItem(menus[3].id);
  //           this.menu.hideItem(menus[4].id);
  //         }
  //         this.menu.hideItem(menus[5].id);
  //         this.menu.showItem(menus[6].id);
  //       } else if (!task.tat && !task.DisableCascade) {
  //         this.menu.showItem(menus[1].id);
  //         this.menu.showItem(menus[2].id);
  //         if (task.slotType !== "Slot" && task.itemType !== "Send to client") {
  //           this.menu.showItem(menus[3].id);
  //           this.menu.hideItem(menus[4].id);
  //         }
  //         this.menu.showItem(menus[5].id);
  //         this.menu.hideItem(menus[6].id);
  //       }
  //     }

  //     if (task.slotType == "Slot") {
  //       this.menu.showItem(menus[0].id);
  //       this.menu.hideItem(menus[7].id);
  //       this.menu.hideItem(menus[8].id);
  //     } else if (task.itemType == "Send to client" || task.itemType == "Client Review") {
  //       this.menu.hideItem(menus[0].id);
  //       this.menu.showItem(menus[7].id);
  //       this.menu.hideItem(menus[8].id);
  //     } else {
  //       this.menu.showItem(menus[0].id);
  //       this.menu.showItem(menus[7].id);
  //       this.menu.showItem(menus[8].id);
  //       if (+task.budgetHours && new Date(task.pUserStartDatePart).getTime() !== new Date(task.pUserEndDatePart).getTime()) {
  //         this.menu.showItem(menus[11].id);
  //         this.menu.showItem(menus[12].id);
  //       }
  //     }
  //   } else if (task.type == "milestone") {
  //     if ((task.isNext === true && !task.subMilestonePresent && !this.changeInRestructure) || (task.type === 'submilestone' && task.isCurrent && !this.changeInRestructure) || (task.type === 'submilestone' && task.isNext && !this.changeInRestructure)) {
  //       this.menu.showItem(menus[9].id);
  //       this.menu.hideItem(menus[10].id);
  //     } else {
  //       this.menu.hideItem(menus[9].id);
  //     }
  //     this.menu.showItem(menus[0].id);
  //     this.menu.hideItem(menus[1].id);
  //     this.menu.hideItem(menus[2].id);
  //     this.menu.hideItem(menus[3].id);
  //     this.menu.hideItem(menus[4].id);
  //     this.menu.hideItem(menus[5].id);
  //     this.menu.hideItem(menus[6].id);
  //     this.menu.hideItem(menus[7].id);
  //     this.menu.hideItem(menus[8].id);
  //   } else if (task.type == "submilestone") {
  //     if ((task.isNext === true && !task.subMilestonePresent && !this.changeInRestructure) || (task.type === 'submilestone' && task.isCurrent && !this.changeInRestructure) || (task.type === 'submilestone' && task.isNext && !this.changeInRestructure)) {
  //       this.menu.hideItem(menus[9].id);
  //       this.menu.showItem(menus[10].id);
  //     } else {
  //       this.menu.hideItem(menus[10].id);
  //     }
  //     this.menu.showItem(menus[0].id);
  //     this.menu.hideItem(menus[1].id);
  //     this.menu.hideItem(menus[2].id);
  //     this.menu.hideItem(menus[3].id);
  //     this.menu.hideItem(menus[4].id);
  //     this.menu.hideItem(menus[5].id);
  //     this.menu.hideItem(menus[6].id);
  //     this.menu.hideItem(menus[7].id);
  //     this.menu.hideItem(menus[8].id);
  //   }
  // }

  showMenus(task) {
    let index;
    if (task.type == "task") {
      if (task.itemType === 'Client Review') {
        index = [1, 6];
      }
      else if (task.itemType === 'Send to client') {
        index = [1, 6];
        index.push(task.DisableCascade ? 5 : 4);
      } else {
        if (task.slotType === 'Slot' && task.status !== 'Completed') {
          index = [0, 1,];
          index.push(task.DisableCascade ? 5 : 4);
        } else {
          index = [0, 1, 6];
          index.push(task.tat ? 3 : 2);
          index.push(task.DisableCascade ? 5 : 4);
          if (task.AssignedTo && task.AssignedTo.ID && task.AssignedTo.ID !== -1) {
            index.push(7);
          }
          if (task.showAllocationSplit) {
            index = index.concat([10, 11]);
          }
        }
      }
      //index = [0, 1, 2, 3, 5, 7, 8, 11, 12];
    } else if (task.type == "milestone") {
      index = [0];
      if (task.isNext === true && !task.subMilestonePresent && !this.changeInRestructure &&
        this.oProjectDetails.status !== 'In Discussion' && this.oProjectDetails.projectType !== 'FTE-Writing'
        && task.status !== 'Completed') {
        index.push(8);
      }
    } else if (task.type == "submilestone" && !this.changeInRestructure && task.status === 'Not Confirmed' &&
      (task.isCurrent || task.isNext)) {
      index = [9];
    }

    return this.generateMenuList(index);
  }

  loadComponent() {
    this.selectedScale = this.selectedScale || { label: 'Day Scale', value: '1' };
    this.ganttChart.clear();
    this.ganttChart.remove();
    const factory = this.resolver.resolveComponentFactory(GanttChartComponent);
    this.ganttComponentRef = this.ganttChart.createComponent(factory);
    gantt.serverList("AssignedTo", this.resource);
    // this.ganttComponentRef.instance.isLoaderHidden = false;
    if (this.taskAllocateCommonService.ganttParseObject.data.length) {
      let firstTaskStart = new Date(this.taskAllocateCommonService.ganttParseObject.data[0].start_date);
      firstTaskStart = new Date(firstTaskStart.setDate(-1));
      gantt.config.start_date = new Date(firstTaskStart.getFullYear(), firstTaskStart.getMonth(), firstTaskStart.getDate(), 0, 0);
      let lastTaskEnd = new Date(this.taskAllocateCommonService.ganttParseObject.data[this.taskAllocateCommonService.ganttParseObject.data.length - 1].end_date);
      lastTaskEnd = new Date(lastTaskEnd.setDate(lastTaskEnd.getDate() + 31));
      gantt.config.end_date = new Date(lastTaskEnd.getFullYear(), lastTaskEnd.getMonth(), lastTaskEnd.getDate(), 0, 0);
    }
    gantt.init(this.ganttComponentRef.instance.ganttContainer.nativeElement);
    gantt.clearAll();

    this.ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject, this.resource);
    this.setScale(this.selectedScale);
    this.allTaskData = this.taskAllocateCommonService.ganttParseObject;
    // this.ganttComponentRef.instance.isLoaderHidden = false;
    this.allocationColor();
    if (this.menu !== undefined) {
      this.menu.unload();
    }
    this.menu = new dhtmlXMenuObject();

    let menus = [

    ]

    this.menu.renderAsContextMenu();
    this.menu.setSkin("dhx_terrace");
    this.menu.loadStruct(menus);

    // this.menu.hideItem(menus[0].id);
    // this.menu.hideItem(menus[3].id);
    // this.menu.hideItem(menus[4].id);
    // this.menu.hideItem(menus[5].id);
    // this.menu.hideItem(menus[6].id);
    // this.menu.showItem(menus[7].id);
    // this.menu.showItem(menus[8].id);
    // this.menu.hideItem(menus[9].id);
    // this.menu.hideItem(menus[10].id);
    // this.menu.hideItem(menus[11].id);
    // this.menu.hideItem(menus[12].id);
    gantt.attachEvent("onContextMenu", (taskId, linkId, event) => {
      if (gantt.ext.zoom.getCurrentLevel() < 3) {
        if (taskId) {
          let task = gantt.getTask(taskId);
          const menus = this.showMenus(task);
          this.menu.clearAll();
          this.menu.loadStruct(menus);
          this.currentTaskId = taskId;
          this.startDate = task.start_date;
          this.endDate = task.end_date;
          this.resetTask = task;
          let x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

          if (task.status !== 'Completed' || task.status !== "Auto Closed") {
            this.menu.showContextMenu(x, y);
          } else if (linkId) {
            this.menu.showContextMenu(x, y);
          }

          if (task || linkId) {
            return false;
          }

          return true;
        }
      } else {
        return false;
      }
    });



    this.menu.attachEvent("onClick", (id, zoneId, cas) => {
      let task = gantt.getTask(this.currentTaskId);
      switch (id) {
        case 'tatON':
          task.tat = true;
          //task.edited = true;
          //          this.changeDate(task);
          this.ChangeEndDate(true, task);
          this.updateMilestoneData();
          this.ganttNotification();
          break;
        case 'tatOFF':
          task.tat = false;
          //task.edited = true;
          //        this.changeDate(task);
          this.ChangeEndDate(true, task);
          this.updateMilestoneData();
          this.ganttNotification();
          break;
        case 'disableCascadeON':
          task.DisableCascade = true;
          task.edited = true;
          this.updateMilestoneData();
          this.ganttNotification();
          break;
        case 'disableCascadeOFF':
          task.DisableCascade = false;
          task.edited = true;
          this.updateMilestoneData();
          this.ganttNotification();
          break;
        case 'filesandcomments':
          this.ViewTaskDetails(task);
          break;
        case 'capacity':
          this.getUserCapacity(task);
          break;
        case 'confirmMilestone':
          this.confirmMilestone(task);
          break;
        case 'confirmSubilestone':
          this.confirmMilestone(task);
          break;
        case 'editAllocation':
          this.editAllocation(task, '');
          break;
        case 'equalSplit':
          this.editAllocation(task, 'Equal');
          break;
        // case 'startDate':
        //   this.openPopupOnGanttTask(task, 'start');
        //   break;
        // case 'endDate':
        //   this.openPopupOnGanttTask(task, 'end');
        //   break;
        case 'editTask':
          this.openPopupOnGanttTask(task, '');
          break;
        default:
          break;
      }
    });

  }

  ganttAttachEvents() {

    if (this.taskAllocateCommonService.attachedEvents.length) {
      this.taskAllocateCommonService.attachedEvents.forEach(element => {
        gantt.detachEvent(element);
      });
      this.taskAllocateCommonService.attachedEvents = [];
    }

    const onTaskOpened = gantt.attachEvent("onTaskOpened", (id) => {
      this.ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject, this.resource);
      this.setScale(this.selectedScale);
    });
    this.taskAllocateCommonService.attachedEvents.push(onTaskOpened);

    const onBeforeTaskChanged = gantt.attachEvent("onBeforeTaskChanged", (id, mode, task) => {
      this.allTaskData = gantt.serialize();
      this.currentTask = task;
      return true;
    });
    this.taskAllocateCommonService.attachedEvents.push(onBeforeTaskChanged);

    const onBeforeTaskDrag = gantt.attachEvent("onBeforeTaskDrag", (id, mode, e) => {
      let task = gantt.getTask(id)
      this.startDate = task.start_date;
      this.endDate = task.end_date;
      this.resetTask = task;
      this.dragClickedInput = e.srcElement.className;
      if (gantt.ext.zoom.getCurrentLevel() < 3) {
        if (task.status == 'Completed' || task.status == "Auto Closed" || task.type == "milestone" || task.type === 'submilestone') {
          return false;
        } else {
          if (task.itemType == 'Client Review') {
            if (mode === 'resize') {
              return true;
            } else {
              return false;
            }
          } else {
            if (mode === 'resize' || mode === 'move') {
              return true;
            } else {
              return false;
            }
          }
        }
      } else {
        return false;
      }
    });
    this.taskAllocateCommonService.attachedEvents.push(onBeforeTaskDrag);

    const onTaskClick = gantt.attachEvent("onTaskClick", (id, e) => {
      let task = gantt.getTask(id);
      if (task.itemType !== "Send to client" && task.itemType !== "Client Review" && task.slotType !== 'Slot' && task.type !== "milestone" && task.type !== "submilestone") {
        if (e.target.parentElement.className === "gantt_cell gantt_last_cell") {
          this.header = task.submilestone ? task.milestone + ' ' + task.submilestone + ' ' + task.text
            : task.milestone + ' ' + task.text;
          this.sharedObject.resourceHeader = this.header;
          this.onResourceClick(task);
        }
      }

      return true;
    });

    this.taskAllocateCommonService.attachedEvents.push(onTaskClick);

    const onTaskDrag = gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
      let task = this.currentTask;
      this.ganttSetTime = false;
      //gantt.getTask(id);
      const isStartDate = this.dragClickedInput.indexOf('start_date') > -1 ? true : false;
      // this.updateDates(e, task, isStartDate);
      if (task.status !== 'Completed' || task.type == 'milestone') {
        if (mode === 'resize') {
          this.taskTime = isStartDate ? this.taskAllocateCommonService.setMinutesAfterDrag(task.start_date) : this.taskAllocateCommonService.setMinutesAfterDrag(task.end_date);
          this.singleTask = task;
          if (this.singleTask.tat) {
            if (isStartDate) {
              this.singleTask.start_date = new Date(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate(), 9, 0)
              this.singleTask.pUserStart = new Date(this.datepipe.transform(this.singleTask.start_date, 'MMM d, y') + ' ' + this.singleTask.pUserStartTimePart);
              this.singleTask.pUserStartDatePart = this.getDatePart(this.singleTask.start_date);
            } else {
              this.singleTask.end_date = new Date(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate(), 19, 0);
              this.singleTask.pUserEnd = this.singleTask.pUserEnd = new Date(this.datepipe.transform(this.singleTask.end_date, 'MMM d, y') + ' ' + this.singleTask.pUserEndTimePart);
              this.singleTask.pUserEndDatePart = this.getDatePart(this.singleTask.end_date);
            }
            this.ganttSetTime = true;
            this.timeChange();
          } else {
            this.picker.open();
          }
        } else {
          isStartDate ? this.openPopupOnGanttTask(task, 'start') : this.openPopupOnGanttTask(task, 'end');
        }
        return true;
      } else {
        return false;
      }
    });
    this.taskAllocateCommonService.attachedEvents.push(onTaskDrag);

  }

  async timeChange() {
    const isStartDate = this.dragClickedInput.indexOf('start_date') > -1 ? true : false;
    let type = isStartDate ? 'start' : 'end'
    let allTasks = {
      data: []
    };
    if (this.ganttSetTime) {
      this.setDateToCurrent(this.singleTask);
      this.DateChange(this.singleTask, type);

      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
        if (task.type == "milestone") {
          if (task.title.replace(' (Current)', '') == this.singleTask.milestone) {
            task.edited = true;
            task.open = true;
          }
        }
      });

      this.GanttchartData = allTasks.data;
      this.ganttNotification();
    } else {
      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
        if (task.type == "milestone") {
          if (task.title.replace(' (Current)', '') == this.singleTask.milestone) {
            task.edited = false;
            task.open = true;
          }
        }
        if (task.id == this.resetTask.id) {
          task = this.resetTask;
          task.start_date = this.startDate;
          task.end_date = this.endDate;
        }
      });

      this.GanttchartData = allTasks.data;
    }
    this.showGanttChart(false);
    setTimeout(() => {
      this.scrollToTaskDate(this.singleTask.end_date);
    }, 1000);
  }

  setTime(time) {
    this.ganttSetTime = true;
    const isStartDate = this.dragClickedInput.indexOf('start_date') > -1 ? true : false;
    if (isStartDate) {
      this.singleTask.start_date = new Date(this.datepipe.transform(this.singleTask.start_date, 'MMM d, y') + ' ' + time);
      this.singleTask.pUserStart = new Date(this.datepipe.transform(this.singleTask.start_date, 'MMM d, y') + ' ' + time);
      this.singleTask.pUserStartDatePart = this.getDatePart(this.singleTask.start_date);
      this.singleTask.pUserStartTimePart = time;
    } else {
      this.singleTask.end_date = new Date(this.datepipe.transform(this.singleTask.end_date, 'MMM d, y') + ' ' + time);
      this.singleTask.pUserEnd = this.singleTask.pUserEnd = new Date(this.datepipe.transform(this.singleTask.end_date, 'MMM d, y') + ' ' + time);
      this.singleTask.pUserEndDatePart = this.getDatePart(this.singleTask.end_date);
      this.singleTask.pUserEndTimePart = time;
    }
  }

  openPopupOnGanttTask(task, clickedInputType) {
    // let tasks = this.GanttchartData.filter(e => e.type !== 'milestone')
    // let filteredTasks = this.taskAllocateCommonService.ganttParseObject.data.find(e => e.id == id)
    if (gantt.ext.zoom.getCurrentLevel() < 3) {
      if (task.type == "task") {
        this.editTaskModal(task, clickedInputType)
        return true;
      } else if (task.type == "milestone" || task.type == "submilestone") {
        this.changeBudgetHrs(task)
        return true;
      }
    } else {
      return false;
    }
  }

  changeBudgetHrs(task) {
    this.budgetHrs = 0;
    this.showBudgetHrs = true;
    this.updatedTasks = task;
    this.budgetHrs = task.budgetHours;
  }

  ganttNotification() {
    this.messageService.add({ key: 'gantt-message', severity: 'warn', summary: 'Warning Message', detail: 'Gantt task update. There are some unsaved changes, Please save them.' });
  }

  // notificationMessage() {
  //   this.messageService.add({ key: 'gantt-message', severity: 'success', summary: 'Success Message', detail: 'Task Updated Successfully' });
  // }

  onResourceClick(task) {
    this.hideResourceSelection = true;
    this.displayBody = true;

    let resources = [];
    task.assignedUsers.forEach((c) => {
      c.items.forEach((item) => {
        this.sharedObject.oTaskAllocation.oResources.forEach((objt) => {
          if (objt.UserName.ID === item.value.ID) {
            resources.push(objt)
          }
        })
      })
    });

    task.resources = resources;

    const startTime = new Date(new Date(task.start_date).setHours(0, 0, 0, 0));
    const endTime = new Date(new Date(task.end_date).setHours(0, 0, 0, 0));


    let data: any = {
      task,
      startTime: startTime,
      endTime: endTime,
    }

    // this.resourceSeletion = data;
    this.selectedTask = task;

    this.sharedObject.data = data;

  }

  onClose() {
    this.hideResourceSelection = false;
    this.header = "";
  }


  showCapacity(task) {

    let resources = [];
    task.assignedUsers.forEach((c) => {
      c.items.forEach((item) => {
        this.sharedObject.oTaskAllocation.oResources.forEach((objt) => {
          if (objt.UserName.ID === item.value.ID) {
            resources.push(objt)
          }
        })
      })
    });

    task.resources = resources;

    let startDate = new Date(new Date(task.start_date).setDate(new Date(task.start_date).getDate() - 1))
    if (startDate.getDay() === 6 || startDate.getDay() === 0) {
      startDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() - 2))
    }
    let endDate = new Date(new Date(task.end_date).setDate(new Date(task.end_date).getDate() + 1));
    if (endDate.getDay() === 6 || endDate.getDay() === 0) {
      endDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 2));
    }
    const startTime = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const endTime = new Date(new Date(endDate).setHours(23, 59, 59, 0));

    this.selectedTask = task;

    const ref = this.dialogService.open(UsercapacityComponent, {
      data: {
        task,
        startTime,
        endTime,
      },
      width: '90vw',

      header: task.milestone + ' ' + task.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe((userCapacity: any) => {
    });

  }

  confirmMilestone(task) {
    let data = this.milestoneData.filter(e => e.data.id === task.id)
    let rowNode = {
      node: data[0]
    }
    this.setAsNextMilestoneCall(task, rowNode)
  }

  confirmChangeResource(event) {
    this.confirmationService.confirm({
      header: 'Change Resource of Task',
      icon: 'pi pi-exclamation-triangle',
      message: 'Are you sure you want to change the Resource of Task ?',
      accept: () => {
        this.displayBody = false;
        this.changeResource(event);
      }
    });
  }

  async changeResource(userId) {
    this.sharedObject.isResourceChange = true;
    if (userId) {
      this.selectedTask.assignedUsers.forEach(element => {

        if (element.items.find(e => e.value.ID === userId)) {
          this.selectedTask.AssignedTo = element.items.find(e => e.value.ID === userId).value;
        }
      });
    }
    this.selectedTask.user = this.selectedTask.AssignedTo.Title;
    let allTasks = {
      data: []
    }
    allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
    // let allTasks = gantt.serialize();
    // let editedTask: any;
    const editedTask = allTasks.data.find(task => task.id == this.selectedTask.id);
    editedTask.AssignedTo = editedTask ? this.selectedTask.AssignedTo : editedTask.AssignedTo;
    editedTask.user = editedTask ? this.selectedTask.AssignedTo.Title : editedTask.AssignedTo.Title;
    this.assignedToUserChanged(editedTask);
    this.GanttchartData = allTasks.data;
    this.taskAllocateCommonService.ganttParseObject = allTasks;
    // await this.loadComponent();
    const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return this.selectedTask.AssignedTo.ID === objt.UserName.ID;
    });
    await this.dailyAllocateTask(resource, this.selectedTask);
    this.refreshGantt();
    this.ganttNotification();
  }

  editTaskModal(task, clickedInputType) {
    this.updatedTasks = {};
    this.updatedTasks = task;
    console.log(task)
    this.assignedUsers = task.assignedUsers

    task.assignedUsers.forEach(element => {

      if (element.items.find(e => e.value.ID === task.AssignedTo.ID)) {
        task.AssignedTo = element.items.find(e => e.value.ID === task.AssignedTo.ID).value;
      }
    });

    let data = {
      task,
      clickedInputType,
      assignedUsers: this.assignedUsers,
      milestoneData: this.milestoneData,
      milestoneDataCopy: this.milestoneDataCopy,
      allRestructureTasks: this.allRestructureTasks,
      allTasks: this.allTasks,
      startDate: this.startDate,
      endDate: this.endDate
    }

    this.editTaskComponent(data)

  }

  editTaskComponent(data) {

    const ref = this.dialogService.open(GanttEdittaskComponent, {
      data: data,
      width: '65vw',

      header: 'Edit Task (' + data.task.milestone + ' - ' + data.task.title + ')',
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((updateData: any) => {
      this.saveTask(false, updateData)
    });

  }


  // *************************************************************************************************************************************
  // GANTT cascade start
  // *************************************************************************************************************************************


  setDateToCurrent(Node) {
    for (const milestone of this.milestoneData) {
      // this.milestoneData.forEach(milestone => {
      if (milestone.data.type === 'task' && Node.milestone === milestone.data.milestone && Node.taskFullName === milestone.data.taskFullName) {
        milestone.data = Node;
        milestone.data.edited = true;
        break;
      }
      if (milestone.children !== undefined) {
        for (const submilestone of milestone.children) {
          // milestone.children.forEach(submilestone => {
          if (submilestone.data.type === 'task' && Node.milestone === submilestone.data.milestone && Node.taskFullName === submilestone.data.taskFullName) {
            submilestone.data = Node;
            submilestone.data.edited = true;
            break;
          }
          if (submilestone.children !== undefined) {
            for (const task of submilestone.children) {
              // submilestone.children.forEach(task => {
              if (Node.milestone === task.data.milestone && Node.taskFullName === task.data.taskFullName) {
                task.data = Node;
                task.data.edited = true;
                break;
              }
              // });
            }
          }
          // });
        }
      }
    }
    // });
  }

  async saveTask(isBudgetHrs, updatedDataObj) {
    if (isBudgetHrs) {
      let allTasks = gantt.serialize();

      allTasks.data.forEach((task) => {
        if (task.id == this.updatedTasks.id) {
          task.budgetHours = this.budgetHrs;
          task.edited = true;
          task.open = true;
        }
      })

      this.GanttchartData = allTasks.data;
      this.taskAllocateCommonService.ganttParseObject = allTasks;

      allTasks = allTasks.data.filter(e => e.edited == true);

      allTasks.forEach((task) => {
        this.milestoneData.forEach((item: any) => {
          if (task.type == "milestone" && task.id == item.data.id) {
            item.data.budgetHours = task.budgetHours
            item.data.edited = true;
          }
        })
      });
      this.showBudgetHrs = false;
      this.ganttNotification();
      await this.loadComponent()
      setTimeout(() => {
        this.scrollToTaskDate(this.updatedTasks.end_date);
      }, 1000);


    } else if (updatedDataObj.reset) {
      this.close();
    } else {
      // let updatedTask = updatedDataObj.updatedTask
      const cascadingObject = updatedDataObj.cascadingObject;
      const scrollDate = new Date(cascadingObject.node.end_date);
      if (Object.keys(cascadingObject).length) {
        this.setDateToCurrent(cascadingObject.node);
        ////// Cascade future  dates
        this.DateChange(cascadingObject.node, cascadingObject.type);
      }
      let allTasks = {
        data: []
      };
      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
        if (task.type == "milestone") {
          if (task.title.replace(' (Current)', '') == this.updatedTasks.milestone) {
            task.edited = true;
            task.open = true;
          }
        }
      });


      this.GanttchartData = allTasks.data;

      this.ganttNotification();
      this.showGanttChart(false);
      setTimeout(() => {
        this.scrollToTaskDate(scrollDate);
      }, 1000);
    }
  }

  getGanttTasksFromMilestones(milestones, includeSubTasks) {
    let tasks = [];
    milestones.forEach(milestone => {
      const milTasks = this.getTasksFromMilestones(milestone, false, includeSubTasks, true);
      tasks = tasks.length ? [...tasks, ...milTasks] : milTasks;
    });
    return this.commonService.removeEmptyItems(tasks);
    // return tasks;
  }
  ////// Refactor code - Use get tasks from milestone function rather looping - Done
  // getGanttTasksFromMilestones(milestones, includeSubTasks) {
  //   let tasks = [];
  //   milestones.forEach(milestone => {
  //     if (milestone.data) {
  //       tasks.push(milestone.data);
  //     }
  //     if (milestone.children !== undefined) {
  //       for (var nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
  //         var submilestone = milestone.children[nCountSub];
  //         if (submilestone.data.type === 'task') {
  //           tasks.push(submilestone.data);
  //           if (includeSubTasks && submilestone.children) {
  //             for (let nCountSubTask = 0; nCountSubTask < submilestone.children.length; nCountSubTask = nCountSubTask + 1) {
  //               var subtask = submilestone.children[nCountSubTask];
  //               tasks.push(subtask.data);
  //             }
  //           }
  //         } else if (submilestone.children !== undefined) {
  //           for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
  //             var task = submilestone.children[nCountTask];
  //             tasks.push(task.data);
  //             if (includeSubTasks && task.children) {
  //               for (let nCountSubTask = 0; nCountSubTask < task.children.length; nCountSubTask = nCountSubTask + 1) {
  //                 var subtask = task.children[nCountSubTask];
  //                 tasks.push(subtask.data);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   });
  //   return tasks;
  // }

  updateMilestoneData() {

    let allTasks = this.ganttAllTasks();

    let tasks = allTasks.data.filter(e => e.edited == true && e.type == 'task');

    allTasks.data.forEach((task) => {
      tasks.forEach((item) => {
        if (task.type == "milestone") {
          if (task.title.replace(' (Current)', '') == item.milestone) {
            task.edited = true;
          }
        }
      })
    })

    allTasks = allTasks.data.filter(e => e.edited == true);

    allTasks.forEach((task) => {
      this.milestoneData.forEach((item: any) => {
        if (task.id == item.data.id) {
          item.data.edited = true;
        } else if (item.children) {
          item.children.forEach((child: any) => {
            if (task.id == child.data.id) {
              child.data = task;
            }
          })
        }
      })
    });
  }

  ganttAllTasks() {
    return gantt.serialize();
  }

  async close() {
    this.showBudgetHrs = false;
    let allTasks = this.allTaskData;

    allTasks.data.forEach((task) => {
      if (this.resetTask.itemType === 'milestone') {
        if (task.id == this.resetTask.id) {
          task.open = true;
          task.edited = false;
        }
      }
      if (task.id == this.resetTask.id) {
        ////// Refactor code - Done
        task = this.resetTask;
        task.start_date = this.startDate;
        task.end_date = this.endDate;
        // task.pUserStart = this.resetTask.pUserStart;
        // task.pUserEnd = this.resetTask.pUserEnd;
        // task.pUserStartDatePart = this.resetTask.pUserStartDatePart;
        // task.pUserEndDatePart = this.resetTask.pUserEndDatePart;
        // task.pUserStartTimePart = this.resetTask.pUserStartTimePart;
        // task.pUserEndTimePart = this.resetTask.pUserEndTimePart;
        // if (this.resetTask.tat) {
        //   task.pUserStart = new Date(this.resetTask.pUserStart.getFullYear(), this.resetTask.pUserStart.getMonth(), this.resetTask.pUserStart.getDate(), 9, 0);
        //   task.pUserEnd = new Date(this.resetTask.pUserEnd.getFullYear(), this.resetTask.pUserEnd.getMonth(), this.resetTask.pUserEnd.getDate(), 19, 0);

        //   // task.pUserStartDatePart = this.getDatePart(this.resetTask.pUserStart);
        //   // task.pUserStartTimePart = this.getTimePart(this.resetTask.pUserStart);
        //   // task.pUserEndDatePart = this.getDatePart(this.resetTask.pUserEnd);
        //   // task.pUserEndTimePart = this.getTimePart(this.resetTask.pUserEnd);

        //   task.start_date = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), 9, 0);
        //   task.end_date = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 19, 0);
        // }
      }
      if (task.title.replace(' (Current)', '') === this.resetTask.milestone || task.title === this.resetTask.milestone) {
        task.open = true;
      }
    })
    // this.taskAllocateCommonService.ganttParseObject = allTasks;
    this.GanttchartData = allTasks.data;
    await this.loadComponent();
    setTimeout(() => {
      this.scrollToTaskDate(this.resetTask.pUserEnd);
    }, 1000);
  }

  refreshGantt() {
    this.loaderenable = true;
    this.visualgraph = false;
    setTimeout(() => {
      if (this.taskAllocateCommonService.ganttParseObject.data.length) {
        let firstTaskStart = new Date(this.taskAllocateCommonService.ganttParseObject.data[0].start_date);
        firstTaskStart = new Date(firstTaskStart.setDate(-1));
        gantt.config.start_date = new Date(firstTaskStart.getFullYear(), firstTaskStart.getMonth(), firstTaskStart.getDate(), 0, 0);
        let lastTaskEnd = new Date(this.taskAllocateCommonService.ganttParseObject.data[this.taskAllocateCommonService.ganttParseObject.data.length - 1].end_date);
        lastTaskEnd = new Date(lastTaskEnd.setDate(lastTaskEnd.getDate() + 31));
        gantt.config.end_date = new Date(lastTaskEnd.getFullYear(), lastTaskEnd.getMonth(), lastTaskEnd.getDate(), 0, 0);
      }
      this.ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject, this.resource);
      this.setScale(this.selectedScale);
      this.loaderenable = false;
      this.visualgraph = true;
    }, 300);

  }

  scrollToTaskDate(date) {
    let endDate = new Date(date);
    endDate = new Date(endDate.setDate(endDate.getDate() - 3));
    gantt.showDate(new Date(endDate));
  }

  setScale(scale) {
    this.ganttComponentRef.instance.setScaleConfig(scale.value)
  }

  zoomIn() {
    if (gantt.ext.zoom.getCurrentLevel() != 0) {
      this.ganttComponentRef.instance.zoomIn()
      this.selectedScale = this.scales[gantt.ext.zoom.getCurrentLevel()];
    }
  }

  zoomOut() {
    if (gantt.ext.zoom.getCurrentLevel() < 5) {
      this.ganttComponentRef.instance.zoomOut()
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
      let resources = gantt.serverList('AssignedTo');

      let allTasks = this.GanttchartData;

      resources.forEach((r) => {
        allTasks.forEach((e) => {

          let textColor = '';
          textColor = e.allocationColor ? r.textColor : '#454545';
          html.push(".gantt_row.gantt_resource_task" + e.id + " .gantt_cell:nth-child(2) .gantt_tree_content{" +
            "background-color:" + e.allocationColor + "; " +
            "color:" + textColor + ";" +
            "}");
        })
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
      ],
      // visual: true,
      // cellColors: true
    })
  }


  // **************************************************************************************************************************************

  //  Cancel Milestone Changes
  // **************************************************************************************************************************************

  /////// Refactor code 
  CancelChanges(milestone, type) {
    if (type === "discardAll") {
      this.loaderenable = false;
      this.changeInRestructure = false;
      this.milestoneData = JSON.parse(JSON.stringify(this.tempmilestoneData));
      this.GanttchartData = this.oldGantChartData;
      this.createGanttDataAndLinks(true);
      this.convertDateString();
      this.loadComponent();
    }
    else if (type === 'task' && milestone.itemType === 'Client Review') {
      const tempMile = this.tempmilestoneData.find(c => c.data.id === milestone.id);
      milestone = this.taskAllocateCommonService.milestoneObject(milestone, tempMile.data);

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
        const SelectedTask = getAllTasks.find(c => c.id === milestone.id);
        if (SelectedTask !== undefined) {
          milestone = this.taskAllocateCommonService.milestoneObject(milestone, SelectedTask);
        }
      });

      var milestoneIndex = this.milestoneData.indexOf(this.milestoneData.find(c => c.data.title.split('(')[0].trim() === milestone.milestone));
      if (milestoneIndex > -1) {
        if (milestone.submilestone !== null && milestone.submilestone !== "Default") {
          var submilestoneIndex = this.milestoneData[milestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children.find(c => c.data.title === milestone.submilestone));

          if (submilestoneIndex > -1) {
            var taskindex = this.milestoneData[milestoneIndex].children[submilestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children[submilestoneIndex].children.find(c => c.data === milestone));


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
          var submilestoneIndex = this.milestoneData[milestoneIndex].children.indexOf(this.milestoneData[milestoneIndex].children.find(c => c.data.title === milestone.title));
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
      milestone = this.taskAllocateCommonService.milestoneObject(milestone.data);
      if (milestone.children !== undefined && milestone.children.length > 0) {
        milestone.children.forEach(submilestone => {
          submilestone = this.taskAllocateCommonService.milestoneObject(submilestone.data);
          if (submilestone.children !== undefined && submilestone.children.length > 0) {
            submilestone.children.forEach(task => {
              task = this.taskAllocateCommonService.milestoneObject(task.data)
              if (task.children !== undefined && task.children.length > 0) {
                task.children.forEach(subTask => {
                  subTask = this.taskAllocateCommonService.milestoneObject(subTask.data)
                });
              }
            });
            const subMiledb = submilestone.children.filter(c => c.data.title.toLowerCase().indexOf
              ('adhoc') === -1 && c.data.title.toLowerCase().indexOf('tb') === -1 && !c.data.parentSlot);
            if (subMiledb.length) {
              submilestone = this.taskAllocateCommonService.milestoneObject(submilestone, subMiledb[0].data)
              // submilestone.data.pStart = new Date(subMiledb[0].data.pStart);
              // submilestone.data.pEnd = new Date(subMiledb[subMiledb.length - 1].data.pEnd);
              submilestone.data.pUserStart = new Date(subMiledb[0].data.pUserStart);
              submilestone.data.pUserEnd = new Date(subMiledb[subMiledb.length - 1].data.pUserEnd);
            }
          }
        });

        const tempMile = milestone.children.filter(c => c.data.title.toLowerCase().indexOf('adhoc') ===
          -1 && c.data.title.toLowerCase().indexOf('tb') === -1);
        milestone = this.taskAllocateCommonService.milestoneObject(milestone, tempMile[0].data)
        // milestone.data.pStart = new Date(tempMile[0].data.pStart);
        // milestone.data.pEnd = new Date(tempMile[tempMile.length - 1].data.pEnd);
        milestone.data.pUserStart = new Date(tempMile[0].data.pUserStart);
        milestone.data.pUserEnd = new Date(tempMile[tempMile.length - 1].data.pUserEnd);
      }
    });
  }


  // **************************************************************************************************

  //  Edit Task
  // **************************************************************************************************


  async editTask(task, rowNode) {
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
  // openComment(task, rowNode) {
  //   this.tempComment = task.scope;
  //   this.task = task;
  //   this.displayComment = true;

  //   if (rowNode.parent !== null) {
  //     if (rowNode.parent.parent === null) {
  //       rowNode.parent.data.edited = true;
  //     } else {
  //       rowNode.parent.parent.data.edited = true;
  //       rowNode.parent.data.edited = true;

  //     }
  //   }
  //   task.edited = true;
  // }

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

  ////// Refactor code - Merge to single function if possible  - Done
  openPopup(data, rowNode) {
    this.taskMenu = [];
    if (data.type === 'task' && data.milestoneStatus !== 'Completed' &&
      (data.status !== 'Completed' && data.status !== 'Abandon' && data.status !== 'Auto Closed')) {
      this.taskMenu = [
        { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editTask(data, rowNode) },
      ];

      if (data.itemType !== 'Client Review' && data.itemType !== 'Send to client' && data.slotType.indexOf('Slot') < 0) {
        if (data.showAllocationSplit) {
          this.taskMenu.push(
            { label: 'Edit Allocation', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, '') },
            { label: 'Equal Split', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, 'Equal') }
          );
        }
        if (data.AssignedTo.ID !== undefined && data.AssignedTo.ID > -1) {
          this.taskMenu.push({ label: 'User Capacity', icon: 'pi pi-camera', command: (event) => this.getUserCapacity(data) });
        }
      }
      if (data.editMode) {
        this.taskMenu.push({ label: 'Cancel', icon: 'pi pi-times-circle', command: (event) => this.CancelChanges(data, 'task') });
      }
    }
  }

  // openPopupEdit(data) {
  //   this.taskMenu = [];
  //   if (data.type === 'task' && data.itemType !== 'Client Review' && data.itemType !== 'Send to client') {
  //     if (data.showAllocationSplit) {
  //       this.taskMenu.push(
  //         { label: 'Edit Allocation', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, '') },
  //         { label: 'Equal Split', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, 'Equal') }
  //       );
  //     }
  //     if (data.AssignedTo.ID !== undefined && data.AssignedTo.ID > -1) {
  //       this.taskMenu.push({ label: 'User Capacity', icon: 'pi pi-camera', command: (event) => this.getUserCapacity(data) });
  //     }
  //   }
  //   if (data.editMode) {
  //     this.taskMenu.push({ label: 'Cancel', icon: 'pi pi-times-circle', command: (event) => this.CancelChanges(data, 'task') });
  //   }
  // }

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


  async modelChanged(event) {
    this.maxBudgetHrs = '';
    event.editMode = true;
    event.edited = true;
    const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return event.AssignedTo && event.AssignedTo.ID === objt.UserName.ID;
    });
    if (event.type !== 'milestone' || event.type !== 'submilestone') {
      let time: any = this.commonService.getHrsAndMins(event.start_date, event.end_date);

      this.maxBudgetHrs = time.maxBudgetHrs;
    }

    await this.dailyAllocateTask(resource, event);
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

      header: milestoneTask.submilestone ? milestoneTask.milestone + ' ' + milestoneTask.title
        + ' ( ' + milestoneTask.submilestone + ' )' : milestoneTask.milestone + ' ' + milestoneTask.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe((UserCapacity: any) => {
    });

  }

  sortByDate(array, prop, order) {
    array.sort((a, b) => {
      a = a.hasOwnProperty('data') ? a.data : a;
      b = b.hasOwnProperty('data') ? b.data : b;
      a = new Date(a[prop]).getTime();
      b = new Date(b[prop]).getTime();
      return order === 'asc' ? a - b : b - a;
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
    let tasks = allTaskNodes.filter(c => allTaskLinks.filter(c => c[firstParam] === task.id).map(c => c[secondParam]).includes(c.id));
    tasks = tasks.map(c => c.label).join(';');
    return tasks;
  }

  restructureGetTasks(node, tempId, milestone, allReturnedTasks, temptasks, CRObj, milestoneedit, submilestone) {
    const allTaskNodes = node.task.nodes;
    const allTaskLinks = node.task.links;

    allTaskNodes.forEach(task => {
      let nextTasks = this.getNextPrevious(allTaskNodes, allTaskLinks, task, 'source', 'target');
      let previousTasks = this.getNextPrevious(allTaskNodes, allTaskLinks, task, 'target', 'source');

      tempId++;
      let TaskObj = this.getTaskObjectByValue(task, 'ggroupblack', milestone, nextTasks, previousTasks, submilestone, 'T' + tempId);
      previousTasks = previousTasks === "" ? null : previousTasks;
      nextTasks = nextTasks === "" ? null : nextTasks;

      let oExistingTask = this.tempGanttchartData.find(c => c.id === task.dbId);
      if (oExistingTask) {
        oExistingTask = this.getExistingData(oExistingTask);
        if (oExistingTask.previousTask !== previousTasks || oExistingTask.nextTask !== nextTasks) {
          oExistingTask.editMode = true;
          oExistingTask.edited = true;
        }
        oExistingTask.nextTask = nextTasks;
        oExistingTask.previousTask = previousTasks;
      }
      const oTaskObj = oExistingTask ? oExistingTask : TaskObj;
      if (task.taskType !== 'Client Review') {
        const tempObj = { 'data': oTaskObj };
        allReturnedTasks.push(oTaskObj);
        temptasks.push(tempObj);
      }
      else {
        CRObj = { 'data': oTaskObj };
        allReturnedTasks.push(oTaskObj);
      }
      milestoneedit = milestoneedit ? milestoneedit : (oExistingTask ? (oExistingTask.edited ? true : false) : true);
      if (submilestone) {
        submilestone.edited = submilestone.edited ? submilestone.edited : (oExistingTask ? (oExistingTask.edited ? true : false) : true);
      }
    });

    return { milestoneedit: milestoneedit, tempId: tempId, CRObj: CRObj };
  }

  finalizeRestructureChanges(milestoneedit, milestone, temptasks, milestoneObj, tempmilestoneData, CRObj) {

    let oExistingMil = this.tempGanttchartData.find(c => c.id === milestone.dbId);
    // if (milestoneedit === true) {
    //   this.tempGanttchartData.find(c => c.id === milestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.id === milestone.dbId).edited = true : milestoneObj.edited = true;
    // }
    if (oExistingMil !== undefined) {
      if (temptasks.filter(c => c.data.id === undefined || c.data.id === 0).length > 0) {
        oExistingMil.editMode = true;
        oExistingMil.edited = true;
      }
    }

    const tempmilestone = {
      'data': oExistingMil !== undefined ? oExistingMil : milestoneObj,
      'expanded': milestoneedit,
      'children': temptasks
    }
    tempmilestoneData.push(tempmilestone);

    if (CRObj !== undefined) {
      tempmilestoneData.push(CRObj);
    }
  }

  getSubmilestonePositionArray(nodes, links, tempSubmilePositionArray) {
    let submilestoneposition = 1;

    nodes.forEach(submilestone => {
      const previousSubMilestones = nodes.filter(c => links.filter(c => c.target === submilestone.id).map(c => c.source).includes(c.id)).map(c => c.label);
      if (previousSubMilestones.length) {
        const prevPosition = tempSubmilePositionArray.filter(e => previousSubMilestones.indexOf(e.name) > -1).map(c => parseInt(c.position));
        prevPosition.sort(function (a, b) { return b - a });
        submilestoneposition = prevPosition[0] + 1;
      } else {
        submilestoneposition = 1;
      }
      //  if()
      const obj = {
        'name': submilestone.label,
        'position': submilestoneposition.toString()
      }
      tempSubmilePositionArray.push(obj);
    });
  }

  restructureGanttData(restructureMilestones, tempmilestoneData, milestonesList, allReturnedTasks) {
    let tempId = 0;
    let milestoneedit = false;
    restructureMilestones.nodes.forEach(milestone => {
      let CRObj;
      let temptasks = [], tempSubmilePositionArray = [];
      tempId++;
      let milestoneObj = this.getObjectByValue(milestone, 'milestone', 'M' + tempId, undefined, null);
      milestonesList.push(milestone.label);
      if (milestone.submilestone.nodes.length > 1) {
        var submile = [];

        /////// SubMilestone position

        this.getSubmilestonePositionArray(milestone.submilestone.nodes, milestone.submilestone.links, tempSubmilePositionArray);

        milestone.submilestone.nodes.forEach(submilestone => {
          tempId++;
          let submilestoneObj = null;
          if (submilestone.label !== 'Default') {
            submilestoneObj = this.getObjectByValue(submilestone, 'submilestone', 'S' + tempId, tempSubmilePositionArray, milestone);
          }

          if (submilestone.task.nodes.length > 0) {
            const taskRes = this.restructureGetTasks(submilestone, tempId, milestone, allReturnedTasks, temptasks, CRObj, milestoneedit, submilestoneObj);
            milestoneedit = taskRes.milestoneedit;
            tempId = taskRes.tempId;
            CRObj = taskRes.CRObj;
            const subTempGantt = this.tempGanttchartData.find(c => c.id === submilestone.dbId);
            if (subTempGantt && submilestoneObj.edited === true) {
              subTempGantt.edited = true;
            }
            if (submilestone.label !== 'Default') {
              const tempsub = {
                'data': subTempGantt ? subTempGantt : submilestoneObj,
                'children': temptasks,
                'expanded': submilestoneObj.edited,
              }
              temptasks = [];
              submile.push(tempsub);
            }
          }
        });

        this.finalizeRestructureChanges(milestoneedit, milestone, submile, milestoneObj, tempmilestoneData, CRObj);
      }
      else {

        const taskRes = this.restructureGetTasks(milestone.submilestone.nodes[0], tempId, milestone, allReturnedTasks, temptasks, CRObj, milestoneedit, null);
        milestoneedit = taskRes.milestoneedit;
        tempId = taskRes.tempId;
        CRObj = taskRes.CRObj;

        this.finalizeRestructureChanges(milestoneedit, milestone, temptasks, milestoneObj, tempmilestoneData, CRObj);
      }
    });
  }

  postProcessRestructureChanges(allReturnedTasks, milestonesList) {
    this.allRestructureTasks = allReturnedTasks;
    this.assignUsers(allReturnedTasks);
    const ganttTempData = JSON.parse(JSON.stringify(this.GanttchartData));
    this.tempGanttchartData = ganttTempData;
    this.oldGantChartData = ganttTempData;
    this.GanttchartData = this.getGanttTasksFromMilestones(this.milestoneData, true);
    this.createGanttDataAndLinks(true, milestonesList);
    this.taskAllocateCommonService.ganttParseObject.data = this.GanttchartData;
    this.loadComponent();
  }

  ////// Refactor code
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

    ref.onClose.subscribe((restructureMilestones: any) => {

      this.loaderenable = true;
      let allReturnedTasks = [], tempSubmilestones = [];
      //let tempId = 0;
      if (restructureMilestones) {
        //tempmilestoneId++;
        //let milestoneedit = false;
        let tempmilestoneData = [], milestonesList = [];
        // const nodesNew = [];
        // for (const nodeOrder of restructureMilestones.nodeOrder) {
        //   const node = restructureMilestones.nodes.find(e => e.id === nodeOrder);
        //   nodesNew.push(node);
        // }
        // restructureMilestones.nodes = nodesNew;

        restructureMilestones.nodes = this.reConfigureNodes(restructureMilestones);

        // restructureMilestones.nodes.forEach(milestone => {
        //   let CRObj;
        //   let temptasks = [];
        //   let submilestoneposition = 1;
        //   let TempSubmilePositionArray = [];
        //   tempId++;
        //   let milestoneObj = this.getObjectByValue(milestone, 'milestone', 'M' + tempId, undefined);
        //   milestonesList.push(milestone.label);
        //   if (milestone.submilestone.nodes.length > 1) {
        //     var submile = [];
        //     milestone.submilestone.nodes.forEach(submilestone => {
        //       if (submilestone.label !== 'Default') {
        //         if (TempSubmilePositionArray.length === 0) {
        //           const obj = {
        //             'name': submilestone.label,
        //             'position': submilestoneposition.toString()
        //           }
        //           submilestoneposition++;
        //           TempSubmilePositionArray.push(obj);
        //         }
        //         let nextsubmilestones = milestone.submilestone.nodes.filter(c => milestone.submilestone.links.filter(c => c.source === submilestone.id).map(c => c.target).includes(c.id)).map(c => c.label); //.replace(/ /g, '')

        //         if (nextsubmilestones !== "") {
        //           nextsubmilestones.forEach(element => {
        //             if (TempSubmilePositionArray.find(c => c.name === element) === undefined) {
        //               const obj = {
        //                 'name': element,
        //                 'position': submilestoneposition.toString(),
        //               }
        //               TempSubmilePositionArray.push(obj);
        //             }
        //             else {
        //               submilestoneposition--;
        //             }
        //           });
        //           submilestoneposition++;
        //         }
        //         else {
        //           if (TempSubmilePositionArray.find(c => c.name === submilestone.label) === undefined) {
        //             submilestoneposition++;
        //             const obj = {
        //               'name': submilestone.label,
        //               'position': submilestoneposition.toString(),
        //             }
        //             TempSubmilePositionArray.push(obj);
        //           }
        //         }

        //       }
        //       tempId++;
        //       let submilestoneObj = this.getObjectByValue(submilestone, 'submilestone', 'S' + tempId, TempSubmilePositionArray);


        //       if (submilestone.task.nodes.length > 0) {
        //         submilestone.task.nodes.forEach(task => {
        //           let nextTasks = submilestone.task.nodes.filter(c => submilestone.task.links.filter(c => c.source === task.id).map(c => c.target).includes(c.id));
        //           nextTasks = nextTasks.map(c => c.label).join(';')
        //           let previousTasks = submilestone.task.nodes.filter(c => submilestone.task.links.filter(c => c.target === task.id).map(c => c.source).includes(c.id));
        //           previousTasks = previousTasks.map(c => c.label).join(';')
        //           tempId++;
        //           let TaskObj = this.getTaskObjectByValue(task, 'ggroupblack', milestone, nextTasks, previousTasks, submilestone, 'T' + tempId);
        //           previousTasks = previousTasks === "" ? null : previousTasks;
        //           nextTasks = nextTasks === "" ? null : nextTasks;

        //           let oExistingTask = this.tempGanttchartData.find(c => c.id === task.dbId);
        //           if (oExistingTask !== undefined) {
        //             oExistingTask = this.getExistingData(oExistingTask);
        //             if (oExistingTask.previousTask !== previousTasks || oExistingTask.nextTask !== nextTasks) {
        //               if (submilestoneObj.title === 'Default') {
        //                 oExistingTask.editMode = true;
        //                 oExistingTask.edited = true;
        //                 milestoneedit = true;
        //               }
        //               else {
        //                 oExistingTask.editMode = true;
        //                 oExistingTask.edited = true;
        //                 submilestoneObj.editMode = true;
        //                 submilestoneObj.edited = true;
        //                 milestoneedit = true;
        //               }
        //             }
        //             oExistingTask.nextTask = nextTasks;
        //             oExistingTask.previousTask = previousTasks;
        //             if (submilestoneObj.title === 'Default' && task.taskType !== 'Adhoc' && task.taskType !== 'TB') {
        //               CRObj = { 'data': oExistingTask };
        //               allReturnedTasks.push(oExistingTask);
        //             }
        //             else {
        //               const tempObj = { 'data': oExistingTask };
        //               allReturnedTasks.push(oExistingTask);
        //               temptasks.push(tempObj);
        //             }
        //           }
        //           else {
        //             if (submilestoneObj.title === 'Default' && task.taskType !== 'Adhoc' && task.taskType !== 'TB') {
        //               milestoneedit = true;
        //               CRObj = { 'data': TaskObj };
        //               allReturnedTasks.push(TaskObj);
        //             }
        //             else {
        //               if (submilestoneObj !== undefined) {
        //                 submilestoneObj.editMode = true;
        //                 submilestoneObj.edited = true;
        //               }
        //               milestoneedit = true;
        //               const tempObj = { 'data': TaskObj };
        //               allReturnedTasks.push(TaskObj);
        //               temptasks.push(tempObj);
        //             }
        //           }
        //         });

        //         if (submilestoneObj.title !== 'Default') {
        //           if (this.tempGanttchartData.find(c => c.id === submilestone.dbId) !== undefined && submilestoneObj.editMode === true && submilestoneObj.edited === true) {
        //             this.tempGanttchartData.find(c => c.id === submilestone.dbId).editMode = true;
        //             this.tempGanttchartData.find(c => c.id === submilestone.dbId).edited = true;
        //           }
        //           const tempsub = {
        //             'data': this.tempGanttchartData.find(c => c.id === submilestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.id === submilestone.dbId) : submilestoneObj,
        //             'children': temptasks,
        //             'expanded': false,
        //           }
        //           temptasks = [];
        //           submile.push(tempsub);
        //         }
        //         else if (submilestoneObj.title === 'Default' || temptasks.length > 0) {
        //           temptasks.forEach(element => {

        //             const tempsub = {
        //               'data': this.tempGanttchartData.find(c => c.id === element.data.id),
        //             }

        //             submile.push(tempsub);
        //           });
        //           temptasks = [];
        //         }

        //       }
        //     });

        //     let expand = false;
        //     submile.forEach(element => {
        //       expand = expand === false ? (element.data.status === 'Not Saved' ? true : false) : true;
        //       if (element.children !== undefined) {
        //         element.children = this.sortByDate(element.children, 'start_date', 'asc');
        //         element.children.forEach(task => {
        //           element.expanded = element.expanded === false ? (task.data.status === 'Not Saved' ? true : false) : true;
        //         });
        //       }
        //     });
        //     if (milestoneedit === true && this.tempGanttchartData.find(c => c.id === milestone.dbId) !== undefined) {
        //       this.tempGanttchartData.find(c => c.id === milestone.dbId).editMode = true;
        //       this.tempGanttchartData.find(c => c.id === milestone.dbId).edited = true;
        //     }
        //     const tempmilestone = {
        //       'data': this.tempGanttchartData.find(c => c.id === milestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.id === milestone.dbId) : milestoneObj,
        //       'expanded': expand,
        //       'children': submile
        //     }
        //     tempmilestoneData.push(tempmilestone);
        //     if (CRObj !== undefined) {
        //       tempmilestoneData.push(CRObj);
        //     }
        //   }
        //   else {

        //     milestone.submilestone.nodes[0].task.nodes.forEach(task => {
        //       let nextTasks = milestone.submilestone.nodes[0].task.nodes.filter(c => milestone.submilestone.nodes[0].task.links.filter(c => c.source === task.id).map(c => c.target).includes(c.id));
        //       nextTasks = nextTasks.map(c => c.label).join(';');
        //       let previousTasks = milestone.submilestone.nodes[0].task.nodes.filter(c => milestone.submilestone.nodes[0].task.links.filter(c => c.target === task.id).map(c => c.source).includes(c.id));
        //       previousTasks = previousTasks.map(c => c.label).join(';');
        //       tempId++
        //       let TaskObj = this.getTaskObjectByValue(task, 'gtaskred', milestone, nextTasks, previousTasks, undefined, 'T' + tempId);

        //       previousTasks = previousTasks === "" ? null : previousTasks;
        //       nextTasks = nextTasks === "" ? null : nextTasks;

        //       let oExistingTask = this.tempGanttchartData.find(c => c.id === task.dbId);
        //       if (oExistingTask !== undefined) {

        //         oExistingTask = this.getExistingData(oExistingTask);

        //         if (oExistingTask.previousTask !== previousTasks || oExistingTask.nextTask !== nextTasks) {
        //           oExistingTask.editMode = true;
        //           oExistingTask.edited = true;
        //           milestoneedit = true;
        //         }
        //         oExistingTask.nextTask = nextTasks;
        //         oExistingTask.previousTask = previousTasks;

        //         if (task.taskType !== 'Client Review') {
        //           const tempObj = { 'data': oExistingTask };
        //           allReturnedTasks.push(oExistingTask);
        //           temptasks.push(tempObj);
        //         }
        //         else {
        //           CRObj = { 'data': oExistingTask };
        //           allReturnedTasks.push(oExistingTask);
        //         }
        //       }
        //       else {
        //         if (task.taskType !== 'Client Review') {
        //           milestoneedit = true;
        //           const tempObj = { 'data': TaskObj };
        //           allReturnedTasks.push(TaskObj);
        //           temptasks.push(tempObj);
        //         }
        //         else {
        //           milestoneedit = true;
        //           CRObj = { 'data': TaskObj };
        //           allReturnedTasks.push(TaskObj);
        //         }
        //       }
        //     });
        //     let mileexpand = false;
        //     temptasks = this.sortByDate(temptasks, 'start_date', 'asc');
        //     temptasks.forEach(element => {
        //       mileexpand = mileexpand == false ? (element.data.status === 'Not Saved' ? true : false) : true;
        //     });
        //     if (milestoneedit === true) {
        //       this.tempGanttchartData.find(c => c.id === milestone.dbId) !== undefined ? this.tempGanttchartData.find(c => c.id === milestone.dbId).edited = true : milestoneObj.edited = true;
        //     }
        //     let oExistingMil = this.tempGanttchartData.find(c => c.id === milestone.dbId);

        //     if (oExistingMil !== undefined) {
        //       if (temptasks.filter(c => c.data.id === undefined || c.data.id === 0).length > 0) {
        //         oExistingMil.editMode = true;
        //         oExistingMil.edited = true;
        //       }
        //     }

        //     const tempmilestone = {
        //       'data': oExistingMil !== undefined ? oExistingMil : milestoneObj,
        //       'expanded': mileexpand,
        //       'children': temptasks
        //     }
        //     tempmilestoneData.push(tempmilestone);

        //     if (CRObj !== undefined) {
        //       tempmilestoneData.push(CRObj);
        //     }
        //   }

        // });

        this.restructureGanttData(restructureMilestones, tempmilestoneData, milestonesList, allReturnedTasks);
        const updatedtempmilestoneData = this.updateMilestoneSubMilestonesDate(tempmilestoneData);

        this.milestoneData = [];
        this.milestoneData.push.apply(this.milestoneData, updatedtempmilestoneData);
        // this.loaderenable = false;
        this.milestoneData = [...this.milestoneData];
        this.changeInRestructure = this.milestoneData.find(c => c.data.editMode === true) !== undefined ? true : false;
        if (this.changeInRestructure) {
          this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'There are some unsaved changes, Please save them.' });

        }

        this.postProcessRestructureChanges(allReturnedTasks, milestonesList);
        // this.allRestructureTasks = allReturnedTasks;
        // this.assignUsers(allReturnedTasks);
        // const ganttTempData = JSON.parse(JSON.stringify(this.GanttchartData));
        // this.tempGanttchartData = ganttTempData;
        // this.oldGantChartData = ganttTempData;
        // //let ganttData: any = this.getGanttTasksFromMilestones(this.milestoneData, true);
        // // const data = this.updateGanttChartData();
        // // let ganttData: any = this.updateGanttChartData();
        // //console.log(ganttData);

        // // this.GanttchartData = this.taskAllocateCommonService.createGanttData(ganttData);
        // //this.GanttchartData = ganttData;

        // this.GanttchartData = this.getGanttTasksFromMilestones(this.milestoneData, true);
        // this.createGanttDataAndLinks(true, milestonesList);

        // //console.log(this.GanttchartData);
        // // console.log(this.linkArray);
        // this.taskAllocateCommonService.ganttParseObject.data = this.GanttchartData;
        // // this.taskAllocateCommonService.ganttParseObject.links = this.linkArray;

        // this.loadComponent();
        this.loaderenable = false;
      }
      else {
        this.CancelChanges(tempSubmilestones, 'discardAll');
      }
    });
  }

  ////// Refactor code - Done
  // async updateGanttChartData() {
  //   let data = [];

  //   // let milestones = this.milestoneData.filter(e => e.data.type == 'milestone');
  //   // milestones.forEach((milestone) => {
  //   //   data.push(milestone.data)
  //   // })
  //   for (let nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
  //     let milestone = this.milestoneData[nCount];
  //     if (milestone.data.type === 'milestone') {
  //       if (milestone.data.id === 0) {
  //         milestone.data.id = "M" + nCount + 1
  //       }
  //       data.push(milestone.data)
  //     }
  //     if (milestone.data.itemType === 'Client Review') {
  //       if (milestone.data.parent === undefined) {
  //         milestone.data.parent = 0
  //       }
  //       if (milestone.data.id === 0) {
  //         milestone.data.id = 'CR' + nCount + 1
  //       }
  //       data.push(milestone.data)
  //     } else if (milestone.children !== undefined) {
  //       for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
  //         let submilestone = milestone.children[nCountSub];
  //         if (submilestone.data.type === 'submilestone') {
  //           if (submilestone.data.id === 0) {
  //             submilestone.data.id = 'SUB' + nCountSub + nCount + 1
  //           }
  //           data.push(submilestone.data)
  //         }
  //         if (submilestone.data.type === 'task') {
  //           // if(submilestone.data.parent === undefined){
  //           //   submilestone.data.parent = 1
  //           // }
  //           if (submilestone.data.id === 0) {
  //             submilestone.data.id = 'SUBT' + nCountSub + 1;
  //           }
  //           data.push(submilestone.data)
  //         } else if (submilestone.children !== undefined) {
  //           for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
  //             const task = submilestone.children[nCountTask];
  //             task.data.subId = submilestone.data.id;
  //             // if(task.data.parent === undefined){
  //             //   task.data.parent = 1
  //             // }
  //             if (task.data.id === 0) {
  //               task.data.id = 'T' + nCountSub + nCountTask + 3;
  //             }
  //             data.push(task.data)
  //           }
  //         }
  //       }
  //     }

  //   }


  //   return data;
  // }

  setDateValues(object) {
    object.data.start_date = object.children[0].data.start_date;
    object.data.pUserStart = object.children[0].data.pUserStart;
    object.data.pUserStartDatePart = object.children[0].data.pUserStartDatePart;
    object.data.end_date = object.children[object.children.length - 1].data.end_date;
    object.data.pUserEnd = object.children[object.children.length - 1].data.pUserEnd;
    object.data.pUserEndDatePart = object.children[object.children.length - 1].data.pUserEndDatePart;
  }

  updateMilestoneSubMilestonesDate(milestones) {
    const updatedMilestones = milestones;
    updatedMilestones.forEach(milestone => {
      if (milestone.children) {
        milestone.children.forEach(submilestone => {
          if (submilestone.children) {
            this.setDateValues(submilestone);
            // submilestone.data.start_date = submilestone.children[0].data.start_date;
            // submilestone.data.pUserStart = submilestone.children[0].data.pUserStart;
            // submilestone.data.pUserStartDatePart = submilestone.children[0].data.pUserStartDatePart;
            // submilestone.data.end_date = submilestone.children[submilestone.children.length - 1].data.end_date;
            // submilestone.data.pUserEnd = submilestone.children[submilestone.children.length - 1].data.pUserEnd;
            // submilestone.data.pUserEndDatePart = submilestone.children[submilestone.children.length - 1].data.pUserEndDatePart;
          }
        });
        this.setDateValues(milestone);
        // milestone.data.start_date = milestone.children[0].data.start_date;
        // milestone.data.pUserStart = milestone.children[0].data.pUserStart;
        // milestone.data.pUserStartDatePart = milestone.children[0].data.pUserStartDatePart;
        // milestone.data.end_date = milestone.children[milestone.children.length - 1].data.end_date;
        // milestone.data.pUserEnd = milestone.children[milestone.children.length - 1].data.pUserEnd;
        // milestone.data.pUserEndDatePart = milestone.children[milestone.children.length - 1].data.pUserEndDatePart;
      }
    });
    return updatedMilestones;
  }
  // tslint:enable
  // *************************************************************************************************************************************
  // User changes Cascading (User change )
  // *************************************************************************************************************************************

  async assignedToUserChanged(milestoneTask) {
    const assignedTo = milestoneTask.AssignedTo;
    if (assignedTo) {
      this.updateNextPreviousTasks(milestoneTask);
      milestoneTask.assignedUserChanged = true;
      if (assignedTo.hasOwnProperty('ID') && assignedTo.ID) {
        milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(assignedTo.SkillText);
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
          return assignedTo.ID === objt.UserName.ID;
        });
        await this.dailyAllocateTask(resource, milestoneTask);
        milestoneTask.assignedUserTimeZone = resource && resource.length > 0
          ? resource[0].TimeZone.Title ?
            resource[0].TimeZone.Title : '+5.5' : '+5.5';

        this.changeUserTimeZone(milestoneTask, previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        // milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
        //   previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        // milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
        //   previousUserTimeZone, milestoneTask.assignedUserTimeZone);

        this.setDatePartAndTimePart(milestoneTask);

        // milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        // milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        // milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        // milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        /// Change date as user changed in AssignedTo dropdown
      } else {
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        milestoneTask.assignedUserTimeZone = '+5.5';
        this.changeUserTimeZone(milestoneTask, previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        // milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
        //   previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        // milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
        //   previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        this.setDatePartAndTimePart(milestoneTask);
        // milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        // milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        // milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        // milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        milestoneTask.skillLevel = milestoneTask.AssignedTo.SkillText;
        milestoneTask.user = milestoneTask.skillLevel;
      }
      milestoneTask.edited = true;
      milestoneTask.user = milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title : milestoneTask.user;
    }
  }

  async dailyAllocateTask(resource, milestoneTask) {
    const eqgTasks = ['Edit', 'Quality', 'Graphics', 'Client Review', 'Send to client'];
    if (!eqgTasks.find(t => t === milestoneTask.itemType) && milestoneTask.pUserStartDatePart &&
      resource.length && milestoneTask.pUserEndDatePart && milestoneTask.budgetHours &&
      milestoneTask.pUserEnd > milestoneTask.pUserStart) {
      const allocationData: DailyAllocationTask = {
        ID: milestoneTask.id,
        task: milestoneTask.taskFullName,
        startDate: milestoneTask.pUserStartDatePart,
        endDate: milestoneTask.pUserEndDatePart,
        startTime: milestoneTask.pUserStartTimePart,
        endTime: milestoneTask.pUserEndTimePart,
        budgetHrs: milestoneTask.budgetHours,
        resource,
        status: milestoneTask.status,
        strAllocation: '',
        allocationType: ''
      };
      const resourceCapacity = await this.dailyAllocation.getResourceCapacity(allocationData);
      const objDailyAllocation = await this.dailyAllocation.initialize(resourceCapacity, allocationData);
      this.setAllocationPerDay(objDailyAllocation, milestoneTask);
      if (objDailyAllocation.allocationAlert) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
      }
    } else {
      milestoneTask.showAllocationSplit = false;
      milestoneTask.allocationColor = '';
      milestoneTask.allocationPerDay = '';
    }
  }

  ////// Refactor code

  /**
   * Update next previous task of submit/galley(Slot type as Both) slot based on skill/user
   * @param milestoneTask - task whose assigned user changed
   */
  async updateNextPreviousTasks(milestoneTask) {
    const currentTask = milestoneTask;
    const milestone = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ?
      // tslint:disable: max-line-length
      this.milestoneData.find(m => m.data.title === milestoneTask.milestone + ' (Current)') : this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
    let subMilestone: TreeNode;
    subMilestone = currentTask.submilestone ? milestone.children.find(t => t.data.title === currentTask.submilestone) : milestone;
    if (milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID) {

      milestoneTask.ActiveCA = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'No' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType.replace(/Slot/g, '');
      let newName = '';
      if (milestoneTask.IsCentrallyAllocated === 'Yes') {
        newName = milestoneTask.itemType;
        newName = this.getNewTaskName(milestoneTask, newName);
        milestoneTask.IsCentrallyAllocated = 'No';
      } else {
        newName = milestoneTask.title;
      }
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.title === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.title === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.title = milestoneTask.text = newName;
    } else if (milestoneTask.slotType === 'Both' && !milestoneTask.AssignedTo.ID) {
      milestoneTask.IsCentrallyAllocated = 'Yes';
      milestoneTask.ActiveCA = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'Yes' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType + 'Slot';
      let newName = milestoneTask.itemType;
      newName = this.getNewTaskName(milestoneTask, newName);
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.title === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.title === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.title = milestoneTask.text = newName;
    }
  }

  getNewTaskName(milestoneTask, originalName) {
    let counter = 1;
    let tasks = this.checkNameExists([], milestoneTask, originalName);
    while (tasks.length) {
      counter++;
      originalName = milestoneTask.itemType + ' ' + counter;
      tasks = this.checkNameExists(tasks, milestoneTask, originalName);
    }

    return originalName;
  }

  checkNameExists(tasks, milestoneTask, originalName) {
    tasks = this.allRestructureTasks.filter(e => e.text === originalName && e.milestone === milestoneTask.milestone);
    if (!tasks.length) {
      tasks = this.allTasks.filter(e => {
        const taskName = e.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + e.Milestone + ' ', '');
        return e.FileSystemObjectType === 0 && taskName === originalName && e.Milestone === milestoneTask.milestone;
      });
    }
    return tasks;
  }

  // *************************************************************************************************
  // Cascading full data
  // **************************************************************************************************
  async DateChangePart(node, type) {
    this.reallocationMailArray.length = 0;
    this.deallocationMailArray.length = 0;
    node.pUserStart = new Date(this.datepipe.transform(node.pUserStartDatePart, 'MMM d, y') + ' ' + node.pUserStartTimePart);
    node.pUserEnd = new Date(this.datepipe.transform(node.pUserEndDatePart, 'MMM d, y') + ' ' + node.pUserEndTimePart);
    const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return node.AssignedTo && node.AssignedTo.ID === objt.UserName.ID;
    });
    let time: any = this.commonService.getHrsAndMins(node.pUserStart, node.pUserEnd)
    let bhrs = this.commonService.convertToHrsMins('' + node.budgetHours).replace('.', ':')

    let maxHrs = time.hrs;
    let maxMin = time.minutes;

    let hrs = bhrs.split(':')[0];
    let min = bhrs.split(':')[1];

    if (hrs > maxHrs || min > maxMin) {
      node.budgetHours = 0
    }
    this.changeDateOfEditedTask(node, type);
    await this.dailyAllocateTask(resource, node);
    this.DateChange(node, type);
  }

  // tslint:disable
  DateChange(node, type) {
    let previousNode = node;
    let selectedMil = -1;
    let subMilestonePosition = 0;

    if (previousNode.itemType === 'Client Review') {
      const clientReviewIndex = this.milestoneData.findIndex(e => e.data.itemType === 'Client Review' && e.data.milestone === previousNode.milestone);
      selectedMil = clientReviewIndex;
    }
    else {
      selectedMil = this.milestoneData.findIndex(e => e.data.text === previousNode.milestone);
      if (previousNode.submilestone) {
        const milestone = this.milestoneData[selectedMil];
        const subMil = milestone.children.find(e => e.data.text === previousNode.submilestone);
        subMilestonePosition = parseInt(subMil.data.position, 10);
      }
    }
    // this.milestoneData.forEach(milestone => {
    //   milestonePosition = milestonePosition + 1;
    //   if ((Node === milestone.data || Node.taskFullName === milestone.data.taskFullName) && milestone.data.type === 'task') {
    //     if (!bGanttCascade) {
    //       this.changeDateOfEditedTask(milestone.data, type);
    //     }
    //     selectedMil = milestonePosition;
    //     previousNode = milestone.data;
    //   }
    //   if (milestone.children !== undefined) {
    //     milestone.children.forEach(submilestone => {

    //       if (submilestone.data.type === 'task') {
    //         if (Node === submilestone.data || Node.taskFullName === submilestone.data.taskFullName) {
    //           if (!bGanttCascade)
    //             this.changeDateOfEditedTask(submilestone.data, type);
    //           selectedMil = milestonePosition;
    //           previousNode = submilestone.data;
    //         }
    //       }
    //       if (submilestone.children !== undefined) {
    //         submilestone.children.forEach(task => {
    //           if (Node === task.data || Node.taskFullName === task.data.taskFullName) {
    //             subMilestonePosition = parseInt(submilestone.data.position, 10);
    //             if (!bGanttCascade)
    //               this.changeDateOfEditedTask(task.data, type);
    //             selectedMil = milestonePosition;
    //             previousNode = task.data;
    //           }
    //         });
    //       }
    //     });
    //   }
    // });


    // clickedInput variable is used to know if start or end date changed
    previousNode.clickedInput = type;
    this.cascadeNextNodes(previousNode, subMilestonePosition, selectedMil);
    this.resetStartAndEnd();
    previousNode.clickedInput = undefined;
  }

  setMilestoneStartEnd(nextNode, selectedMil) {
    const sentPrevNode = this.milestoneData[selectedMil];
    this.setStartAndEnd(sentPrevNode);
    this.milestoneData[selectedMil] = sentPrevNode;
    if (this.milestoneData.length > (selectedMil + 1)) {
      nextNode.push(this.milestoneData[selectedMil + 1]);
    }
    return sentPrevNode;
  }

  cascadeNextNodes(previousNode, subMilestonePosition, selectedMil) {
    var nextNode = [];
    let sentPrevNode = undefined;
    if (previousNode.nextTask && previousNode.nextTask.indexOf('Client Review') === -1) {
      const currMil = this.milestoneData[selectedMil];
      const allMilestoneTasks = this.getTasksFromMilestones(currMil, false, true);
      const nextTasks = previousNode.nextTask.split(';');
      let retNodes = undefined;
      if (subMilestonePosition !== 0) {
        retNodes = allMilestoneTasks.filter(c => (c.submilestone === previousNode.submilestone && nextTasks.indexOf(c.title) > -1));
      }
      else {
        retNodes = allMilestoneTasks.filter(c => (nextTasks.indexOf(c.title) > -1));
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
          sentPrevNode = currMil.children.filter(c => c.data.title == previousNode.submilestone)[0];
          this.setStartAndEnd(sentPrevNode);
          this.milestoneData[selectedMil].children.filter(c => c.data.title == previousNode.submilestone)[0] = sentPrevNode;
          retNodes = currMil.children.filter(c => parseInt(c.data.position) == (subMilestonePosition + 1));
        }
        else {
          sentPrevNode = previousNode;
          const allMilestoneTasks = this.getTasksFromMilestones(currMil, false, true);
          const nextTasks = previousNode.nextTask.split(';');
          retNodes = allMilestoneTasks.filter(c => (c.submilestone === previousNode.submilestone && nextTasks.indexOf(c.title) > -1));
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
            // sentPrevNode = this.milestoneData[selectedMil];
            // this.setStartAndEnd(sentPrevNode);
            // this.milestoneData[selectedMil] = sentPrevNode;
            // if (this.milestoneData.length > (selectedMil + 1)) {
            //   nextNode.push(this.milestoneData[selectedMil + 1]);
            // }
            sentPrevNode = this.setMilestoneStartEnd(nextNode, selectedMil);
          }
        }
      }
      else {
        // sentPrevNode = this.milestoneData[selectedMil];
        // this.setStartAndEnd(sentPrevNode);
        // this.milestoneData[selectedMil] = sentPrevNode;
        // if (this.milestoneData.length > (selectedMil + 1)) {
        //   nextNode.push(this.milestoneData[selectedMil + 1]);
        // }

        sentPrevNode = this.setMilestoneStartEnd(nextNode, selectedMil);

      }
    }
    if (sentPrevNode.slotType === 'Slot' && sentPrevNode.id > 0) {
      this.compareSlotSubTasksTimeline(sentPrevNode, subMilestonePosition, selectedMil)
    }

    if (nextNode.length) {
      nextNode.forEach(element => {
        const elementData = element.hasOwnProperty('data') ? element.data : element;
        // stops cascading if elements cascading is disabled or task is in progress
        if (!elementData.DisableCascade && (elementData.status === 'Not Started' || elementData.status === 'Not Confirmed' || elementData.status === 'Not Saved')) {
          this.cascadeNextTask(sentPrevNode, element, subMilestonePosition, selectedMil);
        }
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
      new Date(prevNodeData.start_date) : new Date(prevNodeData.end_date));
    if (nodeData.type === 'task') {
      if (nodeData.status !== 'Completed' && nodeData.status !== 'Auto Closed' && prevNodeEndDate > new Date(nodeData.start_date)) {
        if (nodeData.itemType !== 'Client Review') {
          this.cascadeNode(previousNode, nodeData);
          this.cascadeNextNodes(nodeData, subMilestonePosition, selectedMil);
        } else {
          this.cascadeNode(previousNode, nodeData);
          this.cascadeNextNodes(nodeData, 0, selectedMil + 1);
        }
      }
    }
    // else if (prevNodeData.itemType === 'Client Review' && nodeData.status !== 'Completed' && nodeData.status !== 'Auto Closed' && prevNodeEndDate > nodeData.start_date) {
    //   this.cascadeNode(previousNode, nodeData);
    //   this.cascadeNextNodes(nodeData, subMilestonePosition, selectedMil);
    // }
    else if (nodeData.type === 'submilestone') {
      if (prevNodeEndDate > nodeData.start_date) {
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
      if (prevNodeEndDate >= nodeData.start_date) {
        const firstTask = nextNode.children[0].data;
        nodeData.edited = true;
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
          if (!element.DisableCascade && element.status !== 'In Progress') {
            this.cascadeNextTask(previousNode, element, element.submilestone ? 1 : 0, selectedMil + 1);
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

    const nodeData = node.hasOwnProperty('data') ? node.data : node;
    const prevNodeData = previousNode.hasOwnProperty('data') ? previousNode.data : previousNode;
    const startDate = new Date(nodeData.pUserStart);
    const endDate = new Date(nodeData.pUserEnd);
    const workingHours = this.workingMinutesBetweenDates(startDate, endDate);
    // Check if prev node slot then consider startdate of slot
    const prevNodeStartDate = ((prevNodeData.slotType === 'Slot' && nodeData.parentSlot) ?
      new Date(prevNodeData.start_date) : new Date(prevNodeData.end_date));
    nodeData.pUserStart = this.commonService.calcTimeForDifferentTimeZone(prevNodeStartDate,
      this.sharedObject.currentUser.timeZone, nodeData.assignedUserTimeZone);
    nodeData.pUserEnd = this.checkEndDate(nodeData.pUserStart, workingHours);

    // nodeData.pUserStartDatePart = this.getDatePart(nodeData.pUserStart);
    // nodeData.pUserStartTimePart = this.getTimePart(nodeData.pUserStart);
    // nodeData.pUserEndDatePart = this.getDatePart(nodeData.pUserEnd);
    // nodeData.pUserEndTimePart = this.getTimePart(nodeData.pUserEnd);
    // nodeData.start_date = this.commonService.calcTimeForDifferentTimeZone(nodeData.pUserStart,
    //   nodeData.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    // nodeData.end_date = this.commonService.calcTimeForDifferentTimeZone(nodeData.pUserEnd,
    //   nodeData.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    // nodeData.tatVal = this.commonService.calcBusinessDays(new Date(nodeData.start_date), new Date(nodeData.end_date));
    nodeData.edited = true;

    this.changeDateProperties(nodeData);
    if (nodeData.IsCentrallyAllocated === 'Yes' && node.slotType !== 'Slot' && !node.parentSlot) {
      nodeData.user = nodeData.skillLevel;
    }
  }
  // tslint:enable

  getSortedDates(node) {
    node.data.end_date = node.children !== undefined && node.children.length > 0 ? this.sortDates(node, 'end') : node.data.end_date;
    node.data.start_date = node.children !== undefined && node.children.length > 0 ? this.sortDates(node, 'start') : node.data.start_date;
  }

  setStartAndEnd(node) {
    if (node.data.itemType === 'Client Review') {
      this.getSortedDates(node);
      this.setDatePartAndTimePart(node.data);
      // node.data.pUserStartDatePart = this.getDatePart(node.data.pUserStart);
      // node.data.pUserStartTimePart = this.getTimePart(node.data.pUserStart);
      // node.data.pUserEndDatePart = this.getDatePart(node.data.pUserEnd);
      // node.data.pUserEndTimePart = this.getTimePart(node.data.pUserEnd);
      // node.data.tatVal = this.commonService.calcBusinessDays(new Date(node.data.end_date), new Date(node.data.start_date));
    } else if (node.data.status !== 'Completed') {
      this.getSortedDates(node);
      node.data.pUserStart = node.data.start_date;
      node.data.pUserEnd = node.data.end_date;
      this.setDatePartAndTimePart(node.data);
      // node.data.pUserStartDatePart = this.getDatePart(node.data.pUserStart);
      // node.data.pUserStartTimePart = this.getTimePart(node.data.pUserStart);
      // node.data.pUserEndDatePart = this.getDatePart(node.data.pUserEnd);
      // node.data.pUserEndTimePart = this.getTimePart(node.data.pUserEnd);
      // node.data.tatVal = this.commonService.calcBusinessDays(new Date(node.data.start_date), new Date(node.data.end_date));
    }
  }

  sortDates(node, type) {
    const nodeCopy = Object.assign({}, node).children.filter(c => c.data.type !== 'task' || (c.data.type === 'task' &&
      c.data.itemType.toLowerCase() !== 'adhoc' && c.data.itemType.toLowerCase() !== 'tb'));
    switch (type) {
      case 'start':
        nodeCopy.sort((a, b) => {
          const startDate = new Date(a.data.start_date);
          const dueDate = new Date(b.data.start_date);
          return startDate > dueDate ? 1 : -1;
        });
        return nodeCopy[0].data.start_date;
      case 'end':
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
    return new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 9, 0);
  }

  getDefaultEndDate(node) {
    return new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 19, 0);
  }

  setDatePartAndTimePart(node) {
    node.pUserStartDatePart = this.getDatePart(node.pUserStart);
    node.pUserStartTimePart = this.getTimePart(node.pUserStart);
    node.pUserEndDatePart = this.getDatePart(node.pUserEnd);
    node.pUserEndTimePart = this.getTimePart(node.pUserEnd);
    node.tatVal = this.commonService.calcBusinessDays(new Date(node.start_date), new Date(node.end_date));
  }

  changeUserTimeZoneToCurrent(node) {
    node.start_date = this.commonService.calcTimeForDifferentTimeZone(node.pUserStart,
      node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
    node.end_date = this.commonService.calcTimeForDifferentTimeZone(node.pUserEnd,
      node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
  }

  changeUserTimeZone(node, previousTimezone, newTimeZone) {
    node.pUserStart = this.commonService.calcTimeForDifferentTimeZone(node.pUserStart,
      previousTimezone, newTimeZone);
    node.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(node.pUserEnd,
      previousTimezone, newTimeZone);
  }

  changeDateProperties(node) {
    this.changeUserTimeZoneToCurrent(node);
    this.setDatePartAndTimePart(node);
  }

  changeDateOfEditedTask(node, type) {
    node.pUserStart = node.tat === true && node.itemType !== 'Client Review' ?
      this.getDefaultStartDate(node) : node.pUserStart;
    node.pUserEnd = type === 'start' && node.pUserStart > node.pUserEnd ? (node.tat === true ?
      this.getDefaultEndDate(node) : node.pUserStart) : node.pUserEnd;
    this.changeDateProperties(node);
    node.edited = true;
    if (node.IsCentrallyAllocated === 'Yes' && node.slotType !== 'Slot' && !node.parentSlot) {
      node.user = node.skillLevel;
    }
  }

  resetStartAndEnd() {
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

  // tslint:enable

  // *************************************************************************************************************************************
  // Calculate Working Hours between Dates
  // *************************************************************************************************************************************

  workingMinutesBetweenDates(start, end) {
    let count = 0;
    for (let i = start.valueOf(); i < end.valueOf(); i = (start.setMinutes(start.getMinutes() + 1)).valueOf()) {
      if (start.getDay() !== 0 && start.getDay() !== 6) { // && start.getHours() >= 9 && start.getHours() < 19
        count++;
      }
    }
    return count;
  }

  // **************************************************************************************************
  // Check Start Date
  // *************************************************************************************************


  // private checkStartDate(date) {
  //   date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDay() === 0 ? date.getDate() + 1 : date.getDate() + 0);
  //   return new Date(date);
  // }


  // *************************************************************************************************************************************
  // Calculate  End  Date  after working hours difference
  // *************************************************************************************************************************************

  checkEndDate(start, workingMinutes) {
    let count = 0;
    let EndDate = new Date(start);
    //let CaculateDate = new Date(start);
    while (count < workingMinutes) {
      if (EndDate.getDay() !== 0 && EndDate.getDay() !== 6) {
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        //CaculateDate = new Date(EndDate);
        count++;
      }
      else {
        EndDate = new Date(EndDate.getFullYear(), EndDate.getMonth(), (EndDate.getDate() + 1), 0, 0);
        //CaculateDate = new Date(EndDate);
      }
    }
    return EndDate;
  }

  // *************************************************************************************************************************************
  // Calculate  Start End Date On Tat
  // *************************************************************************************************************************************
  async ChangeEndDate($event, node) {
    if ($event) {
      const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
        return node.AssignedTo.ID === objt.UserName.ID;
      });
      // node.start_date = new Date(node.start_date.getFullYear(), node.start_date.getMonth(), node.start_date.getDate(), 9, 0);
      // node.end_date = new Date(node.start_date.getFullYear(), node.start_date.getMonth(), node.start_date.getDate(), 19, 0);
      node.pUserStart = new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 9, 0);
      node.pUserEnd = new Date(node.pUserEnd.getFullYear(), node.pUserEnd.getMonth(), node.pUserEnd.getDate(), 19, 0);
      // node.pUserStartDatePart = this.getDatePart(node.pUserStart);
      // node.pUserStartTimePart = this.getTimePart(node.pUserStart);
      // node.pUserEndDatePart = this.getDatePart(node.pUserEnd);
      // node.pUserEndTimePart = this.getTimePart(node.pUserEnd);
      // node.start_date = this.commonService.calcTimeForDifferentTimeZone(node.pUserStart,
      //   node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
      // node.end_date = this.commonService.calcTimeForDifferentTimeZone(node.pUserEnd,
      //   node.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);
      // node.tatVal = this.commonService.calcBusinessDays(new Date(node.start_date), new Date(node.end_date));
      this.changeDateProperties(node);
      await this.dailyAllocateTask(resource, node);
      this.DateChange(node, 'end');
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
  async compareSlotSubTasksTimeline(sentPrevNode1, subMilestonePosition, selectedMil) {
    // fetch slot based on submilestone presnt or not
    let sentPrevNode;
    if (subMilestonePosition === 0) {
      sentPrevNode = this.milestoneData[selectedMil].children.find(st => st.data.title === sentPrevNode1.title)
    } else {
      const submilestone = this.milestoneData[selectedMil].children.find(sm => sm.data.title === sentPrevNode1.submilestone);
      sentPrevNode = submilestone.children.find(st => st.data.title === sentPrevNode1.title);
    }

    let slotFirstTask = sentPrevNode ? sentPrevNode.children ? sentPrevNode.children.filter(st => !st.data.previousTask) : [] : [];
    // cascade if slot start date is more than first subtask in slot
    if (slotFirstTask.length) {

      if (!sentPrevNode1.clickedInput || (sentPrevNode1.clickedInput && sentPrevNode1.clickedInput === 'start')) {
        let slotFirstTaskSorted = this.sortByDate(slotFirstTask, 'pUserStart', 'asc');
        if (sentPrevNode.data.start_date > slotFirstTaskSorted[0].data.start_date) {
          slotFirstTaskSorted.forEach(element => {
            if (!element.data.DisableCascade && (element.data.status === 'Not Started')) {
              this.cascadeNextTask(sentPrevNode, element, subMilestonePosition, selectedMil);
            }
          });
          if (sentPrevNode.data.status !== 'In Progress' && slotFirstTask[0].data.AssignedTo.ID && slotFirstTask[0].data.AssignedTo.ID !== -1) {
            // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability
            await this.checkTaskResourceAvailability(sentPrevNode, subMilestonePosition, selectedMil, this.sharedObject.oTaskAllocation.oResources);
          }
        }
      } else if (sentPrevNode.data.status !== 'In Progress' && slotFirstTask[0].data.AssignedTo.EMail) {
        // All task of slot will be allocated at once so if first task is assigned to resource then check for resource and new task date availability
        await this.checkTaskResourceAvailability(sentPrevNode, subMilestonePosition, selectedMil, this.sharedObject.oTaskAllocation.oResources);
      }

    }
  }

  /**
   * Deallocation / Reallocation logic
   * @param slot
   * @param subMilestonePosition
   * @param selectedMil
   */
  async checkTaskResourceAvailability(slot, subMilestonePosition, selectedMil, oResources) {
    let deallocateSlot = false;
    // old value of slot is used for table details within mail sne for deallocation
    const oldSlot = subMilestonePosition === 0 ? this.tempmilestoneData[selectedMil].children.find(s => s.data.title === slot.data.title) :
      this.milestoneData[selectedMil].children[subMilestonePosition - 1].children.find(st => st.data.title === slot.data.title);
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
        const resource = oResources.filter(r => r.UserName.ID === assignedUserId);
        const oCapacity = await this.usercapacityComponent.applyFilterReturn(task.data.pUserStart, task.data.pUserEnd,
          resource, []);


        let retRes = oCapacity.arrUserDetails.length ? oCapacity.arrUserDetails[0] : [];
        retTask = retRes.tasks;
        const breakAvailable = retRes.displayTotalUnAllocated.split(":");
        let availableHours = parseFloat(breakAvailable[0]) + parseFloat((parseFloat(breakAvailable[1]) / 60).toFixed(2));
        const allocatedHours = parseFloat(task.data.budgetHours);
        // For same task included in result so adding expected hours for same task
        const retTaskInd = retTask.find(t => t.ID === task.data.id);
        if (retTaskInd) {
          availableHours = availableHours + allocatedHours;
        }
        if (availableHours >= allocatedHours) {
          // filter tasks based on dates and subtasks within same slot
          retTask = retTask.filter(t => t.ID !== task.data.pID && t.Status !== 'Completed');

          retTask = retTask.filter((tsk) => {
            return ((task.data.pUserStart <= tsk.DueDate && task.data.pUserEnd >= tsk.DueDate)
              || (task.data.pUserStart <= tsk.StartDate && task.data.pUserEnd >= tsk.StartDate)
              || (task.data.pUserStart >= tsk.StartDate && task.data.pUserEnd <= tsk.DueDate));
          });

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
    ////// Refactor code
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
      milestoneMailObj.taskName = slot.data.title;
      milestoneMailObj.preStDate = this.datepipe.transform(oldSlot.data.start_date, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.preEndDate = this.datepipe.transform(oldSlot.data.end_date, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.newStDate = this.datepipe.transform(slot.data.start_date, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.newEndDate = this.datepipe.transform(slot.data.end_date, 'MMM dd yyyy hh:mm:ss a');
      milestoneMailObj.assginedTo = '';
      this.reallocationMailData.push(milestoneMailObj);
      const oldSubTasks = oldSlot.children;

      slot.children.forEach((task, index) => {
        const subTask = Object.assign({}, mailTableObj);
        subTask.taskName = task.data.title;
        subTask.preStDate = this.datepipe.transform(oldSubTasks[index].data.start_date, 'MMM dd yyyy hh:mm:ss a');
        subTask.preEndDate = this.datepipe.transform(oldSubTasks[index].data.end_date, 'MMM dd yyyy hh:mm:ss a');
        subTask.newStDate = this.datepipe.transform(task.data.start_date, 'MMM dd yyyy hh:mm:ss a');
        subTask.newEndDate = this.datepipe.transform(task.data.end_date, 'MMM dd yyyy hh:mm:ss a');
        subTask.assginedTo = task.data.AssignedTo.Title;
        this.reallocationMailData.push(subTask);
      });
      setTimeout(() => {
        const table = this.reallocateTable.nativeElement.innerHTML;
        this.reallocationMailArray.push({
          project: this.oProjectDetails,
          slot: slot,
          data: table,
          subject: slot.data.title + ' reallocated'
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
        subject: slot.data.title + ' deallocated',
        template: 'CentralTaskCreation'
      });
    }
  }

  conflictAllocations(resources) {
    const ref = this.dialogService.open(ConflictAllocationsComponent, {

      data: {
        resources: resources,
        projectDetail: this.oProjectDetails
      },

      header: 'Conflicting Allocations ',
      width: '100vw',
      height: '100vh',
      contentStyle: { "height": "60vh", "overflow": "auto" },
      closable: true,

    });

    ref.onClose.subscribe((conflictAllocations: any) => {

    })
  }



  /////// Refactor code - Done
  async checkConflictsAllocations(milSubMil) {

    let allTasks = [];
    if (milSubMil) {
      allTasks = this.getTasksFromMilestones(milSubMil, false, false);
    } else {
      let currentMilestone = this.milestoneData.find(e => e.data.type == 'milestone'
        && e.data.isCurrent == true)
      if (currentMilestone) {
        if (currentMilestone.data.subMilestonePresent) {
          currentMilestone.children.forEach(element => {
            if (element.data.status === 'In Progress') {
              allTasks = [...allTasks, ...this.getTasksFromMilestones(element, false, false)];
            }
          });
        } else {
          allTasks = this.getTasksFromMilestones(currentMilestone, false, false);
        }
      }
    }

    allTasks = allTasks.filter(e => e.itemType !== 'Client Review' && e.itemType !== 'Send to client' &&
      e.slotType !== 'Slot' && e.AssignedTo && e.AssignedTo.ID && e.AssignedTo.ID !== -1);
    let capacity;
    let maxHrs = 10;
    let maxMin = 0;
    let count = 0;

    for (const element of allTasks) {
      //allTasks.forEach(element => {
      element.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
        return objt.UserName.ID === element.AssignedTo.ID;
      });

      if (milSubMil) {
        capacity = await this.usercapacityComponent.afterResourceChange(element, element.start_date,
          element.end_date, element.resources, [], false)
      } else {
        capacity = await this.usercapacityComponent.factoringTimeForAllocation(element.start_date, element.end_date,
          element.resources, [], [], this.taskAllocateCommonService.adhocStatus);
      }

      for (var index in capacity.arrUserDetails) {
        if (capacity.arrUserDetails.hasOwnProperty(index)) {
          let dates = capacity.arrUserDetails[index].dates;
          for (var dateIndex in dates) {
            if (dates[dateIndex].userCapacity != 'Leave') {
              let hrs = dates[dateIndex].totalTimeAllocatedPerDay.split(':')[0];
              let min = dates[dateIndex].totalTimeAllocatedPerDay.split(':')[1];
              if (hrs >= maxHrs && min > maxMin) {
                count++;
              }
            }
          }
        }

        if (count > 0) {
          this.capacityObj.conflictAllocation = true;
          this.capacityObj.users.push(capacity.arrUserDetails[index]);
        }
      }
    }

    //);
    // let tasksStatus = type ? this.taskAllocateCommonService.taskStatus : [];
    // let allTasks = this.milestoneData.filter((e => e.children));
    // let capacity;
    // for (var index in allTasks) {
    //   if (allTasks.hasOwnProperty(index)) {
    //     let task = allTasks[index].children;
    //     for (var childIndex in task) {
    //       if (task[childIndex].data.itemType !== 'Client Review' && task[childIndex].data.itemType !== 'Send to client' && task[childIndex].data.slotType.indexOf('Slot') < 0) {
    //         task[childIndex].data.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
    //           return objt.UserName.ID === task[childIndex].data.AssignedTo.ID;
    //         });
    //         if ((task[childIndex].data.edited || task[childIndex].data.added) && task[childIndex].data.milestone == currentMilestone[0].data.text) {
    //           capacity = await this.usercapacityComponent.afterMilestoneTaskModified(task[childIndex].data, task[childIndex].data.start_date, task[childIndex].data.end_date, task[childIndex].data.resources, [])
    //         } else {
    //           capacity = await this.usercapacityComponent.factoringTimeForAllocation(task[childIndex].data.start_date, task[childIndex].data.end_date, task[childIndex].data.resources, [], [], this.taskAllocateCommonService.adhocStatus);
    //         }
    //         let maxHrs = 10;
    //         let maxMin = 0;
    //         let count = 0;
    //         for (var index in capacity.arrUserDetails) {
    //           if (capacity.arrUserDetails.hasOwnProperty(index)) {
    //             let dates = capacity.arrUserDetails[index].dates;
    //             for (var dateIndex in dates) {
    //               if (dates[dateIndex].userCapacity != 'Leave') {
    //                 let hrs = dates[dateIndex].totalTimeAllocatedPerDay.split(':')[0];
    //                 let min = dates[dateIndex].totalTimeAllocatedPerDay.split(':')[1];
    //                 if (hrs >= maxHrs && min > maxMin) {
    //                   count++;
    //                 }
    //               }
    //             }
    //           }
    //           if (count > 0) {
    //             this.capacityObj.conflictAllocation = true;
    //             this.capacityObj.users.push(capacity.arrUserDetails[index]);
    //           }
    //         }
    //         console.log(capacity);
    //       }
    //     }
    //   }
    // }

    if (this.capacityObj.conflictAllocation) {
      this.conflictAllocations(this.capacityObj.users);
    }

  }


  // *************************************************************************************************
  // Save tasks
  // *************************************************************************************************


  async saveTasks() {
    this.disableSave = true;
    if (this.milestoneData.length > 0) {

      const isValid = this.validate();
      if (isValid) {
        this.graphFlag = this.visualgraph;
        this.loaderenable = true;
        this.visualgraph = false;
        this.sharedObject.resSectionShow = false;

        await this.checkConflictsAllocations(null);

        if (!this.capacityObj.conflictAllocation) {
          setTimeout(async () => {
            await this.generateSaveTasks();
          }, 300);
        }
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

  updateResourcesForProject(milestoneTask,
    writers, arrWriterIDs,
    qualityChecker, arrQualityCheckerIds,
    editors, arrEditorsIds,
    graphics, arrGraphicsIds,
    pubSupport, arrPubSupportIds,
    reviewers, arrReviewers) {
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
  }

  //async setMilestone(addTaskItems, updateTaskItems, addMilestoneItems, updateMilestoneItems) {
  async setMilestone(addTaskItems, updateTaskItems, addMilestoneItems, updateMilestoneItems, currentMilestoneTaskUpdated) {
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
      this.updateResourcesForProject(milestoneTask,
        writers, arrWriterIDs,
        qualityChecker, arrQualityCheckerIds,
        editors, arrEditorsIds,
        graphics, arrGraphicsIds,
        pubSupport, arrPubSupportIds,
        reviewers, arrReviewers)

      addTasks.push(await this.setMilestoneTaskForAddUpdate(milestoneTask, true));
    }
    for (const milestoneTask of updateTaskItems) {
      this.updateResourcesForProject(milestoneTask,
        writers, arrWriterIDs,
        qualityChecker, arrQualityCheckerIds,
        editors, arrEditorsIds,
        graphics, arrGraphicsIds,
        pubSupport, arrPubSupportIds,
        reviewers, arrReviewers)

      updateTasks.push(await this.setMilestoneTaskForAddUpdate(milestoneTask, false));
    }

    for (const milestone of addMilestoneItems) {
      addMilestones.push(this.setMilestoneForAddUpdate(milestone, true));
    }

    for (const milestone of updateMilestoneItems) {
      updateMilestones.push(this.setMilestoneForAddUpdate(milestone, false));
    }

    for (const mil of addMilestones) {
      this.commonService.setBatchObject(batchUrl, mil.url, mil.body, this.constants.listNames.Schedules.name,
        this.constants.batchType.POST);
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, mil.url, mil.body, true);
      // const milObj = Object.assign({}, this.queryConfig);
      // milObj.url = mil.url;
      // milObj.listName = this.constants.listNames.Schedules.name;
      // milObj.type = 'POST';
      // milObj.data = mil.body;
      // batchUrl.push(milObj);
    }

    for (const tasks of addTasks) {
      this.commonService.setBatchObject(batchUrl, tasks.url, tasks.body, this.constants.listNames.Schedules.name,
        this.constants.batchType.POST);
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tasks.url, tasks.body, true);
      // const milTaskObj = Object.assign({}, this.queryConfig);
      // milTaskObj.url = tasks.url;
      // milTaskObj.listName = this.constants.listNames.Schedules.name;
      // milTaskObj.type = 'POST';
      // milTaskObj.data = tasks.body;
      // batchUrl.push(milTaskObj);
    }

    for (const mil of addMilestoneItems) {
      // const milestoneFolderBody = {
      //   __metadata: { type: 'SP.Folder' },
      //   ServerRelativeUrl: projectFolder + '/Drafts/Internal/' + mil.data.title
      // };
      const folderUrl = projectFolder + '/Drafts/Internal/' + mil.data.title;
      // const addMilObj = Object.assign({}, this.queryConfig);
      // addMilObj.url = this.spServices.getFolderCreationURL();
      // addMilObj.listName = 'Milestone Folder Creation';
      // addMilObj.type = 'POST';
      // addMilObj.data = this.spServices.getFolderCreationData(folderUrl);
      // batchUrl.push(addMilObj);
      this.commonService.setBatchObject(batchUrl, this.spServices.getFolderCreationURL(),
        this.spServices.getFolderCreationData(folderUrl),
        'Milestone Folder Creation', this.constants.batchType.POST
      )
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, milestoneFolderEndpoint, JSON.stringify(milestoneFolderBody), true);
    }
    for (const mil of updateMilestones) {
      this.commonService.setBatchObject(batchUrl, mil.url, mil.body, this.constants.listNames.Schedules.name,
        this.constants.batchType.PATCH);
      //this.setSchedulesObject(mil, batchUrl);
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, mil.url, mil.body, false);
      // const milObj = Object.assign({}, this.queryConfig);
      // milObj.url = mil.url;
      // milObj.listName = this.constants.listNames.Schedules.name;
      // milObj.type = 'PATCH';
      // milObj.data = mil.body;
      // batchUrl.push(milObj);
    }
    for (const tasks of updateTasks) {
      this.commonService.setBatchObject(batchUrl, tasks.url, tasks.body, this.constants.listNames.Schedules.name,
        this.constants.batchType.PATCH);
      //this.setSchedulesObject(tasks, batchUrl);
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tasks.url, tasks.body, false);
      // const taskObj = Object.assign({}, this.queryConfig);
      // taskObj.url = tasks.url;
      // taskObj.listName = this.constants.listNames.Schedules.name;
      // taskObj.type = 'PATCH';
      // taskObj.data = tasks.body;
      // batchUrl.push(taskObj);
    }

    ////// Refactor code - Done
    arrWriterIDs = this.commonService.removeEmptyItems(arrWriterIDs);
    arrEditorsIds = this.commonService.removeEmptyItems(arrEditorsIds);
    arrGraphicsIds = this.commonService.removeEmptyItems(arrGraphicsIds);
    arrQualityCheckerIds = this.commonService.removeEmptyItems(arrQualityCheckerIds);
    arrReviewers = this.commonService.removeEmptyItems(arrReviewers);
    arrPubSupportIds = this.commonService.removeEmptyItems(arrPubSupportIds);
    arrPrimaryResourcesIds = this.commonService.removeEmptyItems(arrPrimaryResourcesIds);

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
    const mile = updateMilestoneItems.find(c => c.data.title.split(' (')[0] === this.oProjectDetails.currentMilestone);
    const task = addTaskItems.filter(c => c.milestone === this.oProjectDetails.currentMilestone);

    updatedCurrentMilestone = mile && task && task.length ? true : false;
    let projectStatus = this.sharedObject.oTaskAllocation.oProjectDetails.status;
    let previousProjectStatus = this.sharedObject.oTaskAllocation.oProjectDetails.prevstatus;

    if ((updatedCurrentMilestone || currentMilestoneTaskUpdated) && this.sharedObject.oTaskAllocation.oProjectDetails.status === this.constants.STATUS.AUTHOR_REVIEW) {

      this.commonService.confirmMessageDialog("Do you want to keep project in 'Author Review' or 'In Progress' ?", [this.constants.STATUS.AUTHOR_REVIEW, this.constants.STATUS.IN_PROGRESS], false).then(async projectstatus => {
        if (projectstatus) {
          projectStatus = projectstatus;
          if (projectstatus !== this.sharedObject.oTaskAllocation.oProjectDetails.status) {
            previousProjectStatus = this.sharedObject.oTaskAllocation.oProjectDetails.status;
          }
          await this.continueSetMilestone(restructureMilstoneStr, updatedResources, batchUrl, addMilestones, addTasks, projectStatus, previousProjectStatus);
        }
      });
    }
    else {

      projectStatus = updatedCurrentMilestone ? this.constants.STATUS.IN_PROGRESS : projectStatus;
      previousProjectStatus = updatedCurrentMilestone ? this.sharedObject.oTaskAllocation.oProjectDetails.status : previousProjectStatus;
      await this.continueSetMilestone(restructureMilstoneStr, updatedResources, batchUrl, addMilestones, addTasks, projectStatus, previousProjectStatus);
    }



    // }
  }
  // **************************************************************************************************
  // Split because of confirmation message popup 
  // this function is continou part of setMilestone 
  // **************************************************************************************************
  async continueSetMilestone(restructureMilstoneStr, updatedResources, batchUrl, addMilestones, addTasks, projectStatus, previousProjectStatus) {
    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'SaveTasksMilestones');
    const responseInLines = await this.executeBulkRequests(restructureMilstoneStr,
      updatedResources, batchUrl, projectStatus, previousProjectStatus);
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
      this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'MoveTasksAfterCreate');
      await this.spServices.executeBatch(respBatchUrl);
    }
    for (const mail of this.reallocationMailArray) {
      await this.sendReallocationCentralTaskMail(mail.project, mail.slot, mail.data, mail.subject);
    }
    for (const mail of this.deallocationMailArray) {
      await this.sendCentralTaskMail(mail.project, mail.slot.data, mail.subject, mail.template);
    }
    this.commonService.SetNewrelic('TaskAllocation', 'timeline-getProjectResources', 'setMilestone');
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
    this.getMilestones(false);

    this.reloadResources.emit();
    // }
  }

  async updateTaskObject(milestoneTask) {
    return { PreviousAssignedUserId: milestoneTask.previousAssignedUser ? milestoneTask.previousAssignedUser : -1 }
  }

  async addTaskObject(milestoneTask, slotTaskName) {
    return {
      Title: milestoneTask.slotType !== 'Both' && milestoneTask.slotType !== 'Slot' ? this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.title :
        this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + slotTaskName,
      SubMilestones: milestoneTask.submilestone,
      Milestone: milestoneTask.milestone,
      Task: milestoneTask.itemType,
      ProjectCode: this.oProjectDetails.projectCode,
    }
  }
  async addUpdateTaskObject(milestoneTask) {
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      StartDate: milestoneTask.start_date,
      DueDate: milestoneTask.end_date,
      ExpectedTime: '' + milestoneTask.budgetHours,
      TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
      TATBusinessDays: milestoneTask.tatVal,
      AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.hasOwnProperty('ID') ? milestoneTask.AssignedTo.ID : -1 : -1,
      TimeZone: milestoneTask.assignedUserTimeZone.toString(),
      Status: milestoneTask.status,
      NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      SkillLevel: milestoneTask.skillLevel,
      IsCentrallyAllocated: milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID ? 'No' : milestoneTask.IsCentrallyAllocated,
      CentralAllocationDone: milestoneTask.CentralAllocationDone,
      ActiveCA: milestoneTask.ActiveCA,
      DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No',
      AllocationPerDay: milestoneTask.allocationPerDay ? milestoneTask.allocationPerDay : ''

    };
  }
  ////// Refactor code - Done
  async setMilestoneTaskForAddUpdate(milestoneTask, bAdd) {
    let url = '';
    //let data = {};
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
      await this.sendCentralTaskMail(this.oProjectDetails, milestoneTask, milestoneTask.title + ' Created', 'CentralTaskCreation');
    }
    let addUpdateTask;
    if (bAdd) {
      const taskCount = milestoneTask.title.match(/\d+$/) ? ' ' + milestoneTask.title.match(/\d+$/)[0] : '';
      // milestoneTask.itemType = milestoneTask.itemType;
      const slotTaskName = milestoneTask.itemType + taskCount;
      addUpdateTask = await this.addUpdateTaskObject(milestoneTask);
      addUpdateTask = Object.assign(addUpdateTask, await this.addTaskObject(milestoneTask, slotTaskName));
      // const addData = {
      //   __metadata: { type: 'SP.Data.SchedulesListItem' },
      //   StartDate: milestoneTask.start_date,
      //   DueDate: milestoneTask.end_date,
      //   ExpectedTime: '' + milestoneTask.budgetHours,
      //   //AllowCompletion: milestoneTask.allowStart === true ? 'Yes' : 'No',
      //   TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
      //   TATBusinessDays: milestoneTask.tatVal,
      //   AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.hasOwnProperty('ID') ? milestoneTask.AssignedTo.ID : -1 : -1,
      //   TimeZone: milestoneTask.assignedUserTimeZone.toString(),
      //   // Comments: milestoneTask.scope,
      //   Status: milestoneTask.status,
      //   NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      //   PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      //   ProjectCode: this.oProjectDetails.projectCode,
      //   Task: milestoneTask.itemType,
      //   Milestone: milestoneTask.milestone,
      //   SubMilestones: milestoneTask.submilestone,
      //   Title: milestoneTask.slotType !== 'Both' && milestoneTask.slotType !== 'Slot' ? this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.title :
      //     this.oProjectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + slotTaskName,
      //   SkillLevel: milestoneTask.skillLevel,
      //   IsCentrallyAllocated: milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID ? 'No' : milestoneTask.IsCentrallyAllocated,
      //   CentralAllocationDone: milestoneTask.CentralAllocationDone,
      //   ActiveCA: milestoneTask.ActiveCA,
      //   DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No',
      //   AllocationPerDay: milestoneTask.allocationPerDay ? milestoneTask.allocationPerDay : ''
      // };
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
      //data = addData;
    } else {
      // const updateData = {
      //   __metadata: { type: 'SP.Data.SchedulesListItem' },
      //   StartDate: milestoneTask.start_date,
      //   DueDate: milestoneTask.end_date,
      //   ExpectedTime: '' + milestoneTask.budgetHours,
      //   //AllowCompletion: milestoneTask.allowStart === true ? 'Yes' : 'No',
      //   TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
      //   TATBusinessDays: milestoneTask.tatVal,
      //   AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.ID ? milestoneTask.AssignedTo.ID : -1 : -1,
      //   TimeZone: milestoneTask.assignedUserTimeZone.toString(),
      //   // Comments: milestoneTask.scope ? milestoneTask.scope : '',
      //   Status: milestoneTask.status,
      //   NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      //   PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      //   SkillLevel: milestoneTask.skillLevel,
      //   IsCentrallyAllocated: milestoneTask.IsCentrallyAllocated,
      //   CentralAllocationDone: milestoneTask.CentralAllocationDone,
      //   ActiveCA: milestoneTask.ActiveCA,
      //   DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No',
      //   PreviousAssignedUserId: milestoneTask.previousAssignedUser ? milestoneTask.previousAssignedUser : -1,
      //   SubMilestones: milestoneTask.submilestone,
      //   AllocationPerDay: milestoneTask.allocationPerDay ? milestoneTask.allocationPerDay : ''
      // };
      addUpdateTask = await this.addUpdateTaskObject(milestoneTask);
      addUpdateTask = Object.assign(addUpdateTask, await this.updateTaskObject(milestoneTask));
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneTask.id);
      //data = updateData;
    }
    //data = addUpdateTask;
    return {
      body: addUpdateTask,
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
  addMilestoneObject(currentMilestone) {
    return {
      ProjectCode: this.oProjectDetails.projectCode,
      Title: currentMilestone.title.split('(')[0].trim(),
      FileSystemObjectType: 1,
      ContentTypeId: "0x0120",
    }
  }
  addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate) {
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: milestoneStartDate,
      Actual_x0020_End_x0020_Date: milestoneEndDate,
      StartDate: milestoneStartDate,
      DueDate: milestoneEndDate,
      ExpectedTime: '' + currentMilestone.budgetHours,
      Status: currentMilestone.status === 'Not Saved' ?
        currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' :
        currentMilestone.status,
      TATBusinessDays: currentMilestone.tatBusinessDays,
      SubMilestones: currentMilestone.submilestone,
    };
  }
  ////// Refactor code - Done
  setMilestoneForAddUpdate(sentMilestone, bAdd) {
    let currentMilestone = sentMilestone.data;
    let url = '';
    let data;
    currentMilestone.submilestone = this.getSubMilestoneStatus(sentMilestone, '');//.join(';#');
    const milestoneStartDate = new Date(currentMilestone.start_date);
    const milestoneEndDate = new Date(currentMilestone.end_date);
    currentMilestone.tatBusinessDays = this.commonService.calcBusinessDays(milestoneStartDate, milestoneEndDate);
    if (bAdd) {
      // let updateData: any = {
      //   __metadata: { type: 'SP.Data.SchedulesListItem' },
      //   Actual_x0020_Start_x0020_Date: milestoneStartDate,
      //   Actual_x0020_End_x0020_Date: milestoneEndDate,
      //   StartDate: milestoneStartDate,
      //   DueDate: milestoneEndDate,
      //   ExpectedTime: '' + currentMilestone.budgetHours,
      //   Status: currentMilestone.status === 'Not Saved' ? currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' : currentMilestone.status,
      //   TATBusinessDays: currentMilestone.tatBusinessDays,
      //   SubMilestones: currentMilestone.submilestone,
      // };
      data = this.addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate);
      data = Object.assign(data, this.addMilestoneObject(currentMilestone));
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
      // data = updateData;
    } else {
      // const addData = {
      //   __metadata: { type: 'SP.Data.SchedulesListItem' },
      //   Actual_x0020_Start_x0020_Date: milestoneStartDate,
      //   Actual_x0020_End_x0020_Date: milestoneEndDate,
      //   StartDate: milestoneStartDate,
      //   DueDate: milestoneEndDate,
      //   ExpectedTime: '' + currentMilestone.budgetHours,
      //   Status: currentMilestone.status === 'Not Saved' ? currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' : currentMilestone.status,
      //   TATBusinessDays: currentMilestone.tatBusinessDays,
      //   ProjectCode: this.oProjectDetails.projectCode,
      //   Title: currentMilestone.title.split(' (')[0],
      //   FileSystemObjectType: 1,
      //   ContentTypeId: "0x0120",
      //   SubMilestones: currentMilestone.submilestone
      // };
      data = this.addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate);
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +currentMilestone.id);
      // data = addData;
    }
    return {
      body: data,
      url,
      Title: currentMilestone.title
    };

  }

  // executing bulk batch requests
  async executeBulkRequests(restructureMilstoneStr, updatedResources, batchUrl, projectStatus, previosProjectStatus) {
    let updateProjectRes = {};
    const projectID = this.oProjectDetails.projectID;
    let currentMilestone = this.oProjectDetails.currentMilestone;
    const isCurrentMilestoneDeleted = this.oProjectDetails.allMilestones.find(m => m === currentMilestone) ? false : true;
    if (isCurrentMilestoneDeleted) {
      const newCurrentMilestoneIndex = this.oProjectDetails.allOldMilestones.findIndex(t => t === currentMilestone);
      currentMilestone = newCurrentMilestoneIndex > 0 ? this.oProjectDetails.allOldMilestones[newCurrentMilestoneIndex - 1] : '';
    }
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
      Status: projectStatus,
      PrevStatus: previosProjectStatus
      // Status: currentMilestoneTaskUpdated ? projectStatus :  currentMilestoneUpdated ? this.constants.STATUS.IN_PROGRESS : this.sharedObject.oTaskAllocation.oProjectDetails.status,
      // PrevStatus:currentMilestoneTaskUpdated && projectStatus !== this.sharedObject.oTaskAllocation.oProjectDetails.status  ?  this.sharedObject.oTaskAllocation.oProjectDetails.status :  currentMilestoneUpdated ? this.sharedObject.oTaskAllocation.oProjectDetails.status : this.sharedObject.oTaskAllocation.oProjectDetails.prevstatus
    };
    const updatePrjObj = Object.assign({}, this.queryConfig);
    updatePrjObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID);
    updatePrjObj.listName = this.constants.listNames.ProjectInformation.name;
    updatePrjObj.type = 'PATCH';
    updatePrjObj.data = updateProjectRes;
    batchUrl.push(updatePrjObj);
    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'updateProjectInfo');
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
        this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'sendMails');
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
    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'sendCentralTaskMail');
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
    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'sendReallocationCentralTaskMail');
    await this.spServices.sendMail(arrayTo.join(','), fromUser.email, mailSubject, objEmailBody);
  }

  // *************************************************************************************************
  //  Get Email Body
  // **************************************************************************************************

  async getsendEmailObjBody(milestoneTask, projectDetails, EmailType, templateName) {
    const mailObj = Object.assign({}, this.taskAllocationService.common.getMailTemplate);
    mailObj.filter = mailObj.filter.replace('{{templateName}}', templateName);
    this.commonService.SetNewrelic('TaskAllocation', 'timeline-getsendEmailObjBody', 'readItems');
    const templateData = await this.spServices.readItems(this.constants.listNames.MailContent.name,
      mailObj);
    let mailContent = templateData.length > 0 ? templateData[0].Content : [];
    mailContent = this.replaceContent(mailContent, "@@Val3@@", EmailType === 'Email' ? milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title : undefined : 'Team');
    mailContent = this.replaceContent(mailContent, "@@Val1@@", projectDetails.projectCode);
    mailContent = this.replaceContent(mailContent, "@@Val2@@", milestoneTask.submilestone && milestoneTask.submilestone !== 'Default' ? projectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.title + ' - ' + milestoneTask.submilestone : projectDetails.projectCode + ' ' + milestoneTask.milestone + ' ' + milestoneTask.title);
    mailContent = this.replaceContent(mailContent, "@@Val4@@", milestoneTask.itemType);
    mailContent = this.replaceContent(mailContent, "@@Val5@@", milestoneTask.milestone);
    mailContent = this.replaceContent(mailContent, "@@Val6@@", this.datepipe.transform(milestoneTask.start_date, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val7@@", this.datepipe.transform(milestoneTask.end_date, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val9@@", milestoneTask.scope ? milestoneTask.scope : '');
    return mailContent;
  }

  async getReallocateEmailObjBody(data, slot, templateName) {
    const mailObj = Object.assign({}, this.taskAllocationService.common.getMailTemplate);
    mailObj.filter = mailObj.filter.replace('{{templateName}}', templateName);
    this.commonService.SetNewrelic('TaskAllocation', 'timeline-getReallocateEmailObjBody', 'readItems');
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
  ////// Refactor code
  public generateSaveTasks() {
    // this.sharedObject.isResourceChange = false;
    var listOfMilestones = [];
    let currentMilestoneTaskUpdated = false;
    var addedTasks = [], updatedTasks = [], addedMilestones = [], updatedMilestones = []
    for (var nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
      var milestone = this.milestoneData[nCount];
      // deleted milestone is overwritten by new milestone
      let deletedMilestone = this.deletedMilestones.filter(m => m.Title === milestone.data.title);
      if (deletedMilestone.length > 0) {
        milestone.data.id = deletedMilestone[0].ID
        milestone.data.added = false;
      }
      if (milestone.data.type === 'milestone') {
        listOfMilestones.push(milestone.data.title.split(' (')[0]);
      }
      if (milestone.data.edited === true && milestone.data.status !== 'Completed') {
        if (milestone.data.itemType === 'Client Review') {
          const deletedTask = this.allTasks.filter(t => t.Title === milestone.data.taskFullName && t.Status === 'Deleted');
          if (deletedTask.length > 0) {
            milestone.data.id = deletedTask[0].ID
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
              submilestone.data.id = deletedTask[0].ID
              submilestone.data.added = false;
            }
            //if (submilestone.data.edited === true) {
            if (submilestone.data.type === 'task' && submilestone.data.edited) {
              if (submilestone.data.added == true) {
                submilestone.data.status = milestone.data.status === 'In Progress' ? 'Not Started' : submilestone.data.status;
                addedTasks.push(submilestone.data);
              }
              else {
                updatedTasks.push(submilestone.data);
                currentMilestoneTaskUpdated = milestone.data.title.indexOf('(Current)') > -1 ? true : false;
              }
            }
            if (submilestone.children !== undefined) {
              for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
                var task = submilestone.children[nCountTask];
                const deletedTask = this.allTasks.filter(t => t.Title === task.data.taskFullName && t.Status === 'Deleted');
                if (deletedTask.length > 0) {
                  task.data.id = deletedTask[0].ID
                  task.data.added = false;
                }
                if(task.data.edited) {

                  if (task.data.added == true) {
                    task.data.status = submilestone.data.status === 'In Progress' ? 'Not Started' : submilestone.data.status === 'Not Saved' ? milestone.data.isCurrent ? 'Not Started' : 'Not Confirmed' : task.data.status;
                    addedTasks.push(task.data);
                  }
                  else {
                    updatedTasks.push(task.data);
                    currentMilestoneTaskUpdated = milestone.data.title.indexOf('(Current)') > -1 ? true : false;
                  }
                }
                if (task.children) {
                  for (var nSubTaskTaskCount = 0; nSubTaskTaskCount < task.children.length; nSubTaskTaskCount = nSubTaskTaskCount + 1) {
                    var subtask = task.children[nSubTaskTaskCount];
                    const deletedSubTask = this.allTasks.filter(t => t.Title === subtask.data.taskFullName);
                    if (deletedSubTask.length > 0) {
                      subtask.data.id = deletedSubTask[0].ID
                      subtask.data.added = false;
                    }
                    if(subtask.data.edited) {
                      if (subtask.data.added == true) {
                        subtask.data.status = subtask.data.status;
                        addedTasks.push(subtask.data);
                      }
                      else {
                        updatedTasks.push(subtask.data);
                        currentMilestoneTaskUpdated = milestone.data.title.indexOf('(Current)') > -1 ? true : false;
                      }
                    }

                  }
                }
              }
            }
            //}
          }
        }
      }
    }

    this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones = listOfMilestones;
    // this.refreshGantt();
    this.getDeletedMilestoneTasks(updatedTasks, updatedMilestones);

    this.setMilestone(addedTasks, updatedTasks, addedMilestones, updatedMilestones, currentMilestoneTaskUpdated);

    // let allTasks = this.milestoneData.filter((e => e.children));
    // allTasks.forEach((e) => {
    //   e.children.forEach((task: any) => {
    //     if (task.data.itemType !== 'Client Review' && task.data.itemType !== 'Send to client' && task.data.slotType.indexOf('Slot') < 0 || task.data.added == false) {
    //       task.data.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
    //         return objt.UserName.ID === task.data.AssignedTo.ID;
    //       });
    //       this.usercapacityComponent.factoringTimeForAllocation(task.data.start_date, task.data.end_date, task.data.resources, [], this.taskAllocateCommonService.taskStatus, this.taskAllocateCommonService.adhocStatus);
    //     }
    //   })
    // })
  }

  // tslint:enable
  ////// Refactor code
  getDeletedMilestoneTasks(updatedTasks, updatedMilestones) {

    this.milestoneDataCopy.forEach((element) => {
      if (element.data.status !== 'Completed' && element.data.status !== 'Deleted') {
        if (element.data.type === 'task' && element.data.itemType === 'Client Review') {
          const clTasks = this.milestoneData.filter(dataEl => {
            return dataEl.data.itemType === 'Client Review' && dataEl.data.id === element.data.id;
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
            return dataEl.data.type === 'milestone' && dataEl.data.id === element.data.id;
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
            const newSub = this.getSubMilestoneStatus(milestoneReturn[0], '');//.join(';#');
            const existingSub = this.getSubMilestoneStatus(element, '');//.join(';#');
            if (newSub !== existingSub) {
              updatedMilestones.push(milestoneReturn[0]);
            }
            const getAllTasks = this.getTasksFromMilestones(element, true, false);
            const getAllSubTasks = this.getTasksFromMilestones(element, true, true);
            const getAllNewTasks = this.getTasksFromMilestones(milestoneReturn[0], false, false);
            getAllTasks.forEach(task => {
              if (task.status !== 'Deleted' && task.status !== 'Completed') {
                const taskSearch = getAllNewTasks.filter(dataEl => {
                  return dataEl.type === 'task' && dataEl.id === task.id;
                });
                if (taskSearch.length === 0) {
                  task.previousTask = '';
                  task.nextTask = '';
                  task.status = 'Deleted';
                  /// mark activeca as No for slot if it is deleted
                  if (task.IsCentrallyAllocated) {
                    task.ActiveCA = 'No';
                    task.CentralAllocationDone = 'No';
                    const subTaskSearch = getAllSubTasks.filter(dataEl => dataEl.parentSlot === task.id);
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

  getTasksSubTasks(tasks, includeSubTasks, milestone) {
    const milTasks = milestone.children.map(e => e.data)
    tasks = tasks.length ? [...tasks, ...milTasks] : milTasks;
    if (includeSubTasks) {
      const subTask = milestone.children.map(e => (e.children ? e.children.map(c => c.data) : null));
      tasks = tasks.length ? [...tasks, ...subTask] : subTask;
    }
    return tasks;
  }

  getTasksFromMilestones(milestone, bOld, includeSubTasks, getMilSubMil?) {
    let tasks = [];
    if (getMilSubMil) {
      tasks.push(milestone.data);
    }
    if (milestone.children && milestone.children.length) {
      var submilestone = milestone.children[0];
      if (submilestone.data.type === 'task') {
        tasks = this.getTasksSubTasks(tasks, includeSubTasks, milestone);
      } else if (submilestone.children && submilestone.children.length) {
        milestone.children.forEach(submil => {
          if (getMilSubMil) {
            tasks.push(submil.data);
          }
          tasks = this.getTasksSubTasks(tasks, includeSubTasks, submil);
        });
      }
      // for (var nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
      //   var submilestone = milestone.children[nCountSub];
      //   if (submilestone.data.type === 'task') {
      //     tasks.push(submilestone.data);
      //     if (includeSubTasks && submilestone.children) {
      //       for (let nCountSubTask = 0; nCountSubTask < submilestone.children.length; nCountSubTask = nCountSubTask + 1) {
      //         var subtask = submilestone.children[nCountSubTask];
      //         tasks.push(subtask.data);
      //       }
      //     }
      //   } else if (submilestone.children !== undefined) {
      //     for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
      //       var task = submilestone.children[nCountTask];
      //       tasks.push(task.data);
      //       if (includeSubTasks && task.children) {
      //         for (let nCountSubTask = 0; nCountSubTask < task.children.length; nCountSubTask = nCountSubTask + 1) {
      //           var subtask = task.children[nCountSubTask];
      //           tasks.push(subtask.data);
      //         }
      //       }
      //     }
      //   }
      // }
    }
    const milData = bOld ? this.milestoneDataCopy : this.milestoneData
    const clTask = milestone.data.type === 'milestone' || milestone.data.type === 'task' ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.data.title.split(' (')[0]
    }) : milestone.parent ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.parent.data.title.split(' (')[0]
    }) : [];

    if (clTask.length && !getMilSubMil)
      tasks.push(clTask[0].data);

    return this.commonService.removeEmptyItems(tasks);
  }
  ////// Refactor code - Done
  // getSubTasksfromTasks(task) {
  //   let tasks = [];
  //   if (task.children !== undefined) {
  //     for (var nCountTask = 0; nCountTask < task.children.length; nCountTask = nCountTask + 1) {
  //       var task = task.children[nCountTask];
  //       tasks.push(task.data);
  //     }
  //     return tasks;
  //   }
  // }

  // getTasksFromSubMilestones(submilestone) {

  //   let tasks = [];
  //   if (submilestone.children !== undefined) {
  //     for (var nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
  //       var task = submilestone.children[nCountTask];
  //       tasks.push(task.data);
  //     }
  //   }

  //   if (submilestone.parent.length > 1) {

  //     var isAllSubMilestoneCompleted = submilestone.parent.filter(c => c.data !== submilestone.data).map(c => c.data.status === 'Not Confirmed').length > 0 ? true : false;

  //     if (isAllSubMilestoneCompleted) {
  //       const milData = this.milestoneData
  //       const clTask = milData.filter(function (obj) {
  //         return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === submilestone.parent.data.title.split(' (')[0];
  //       });

  //       if (clTask.length)
  //         tasks.push(clTask[0].data);
  //     }
  //   }
  //   return tasks;
  // }

  // tslint:enable

  validateTaskDates(AllTasks) {
    let errorPresnet = false;
    const taskCount = AllTasks.length;
    for (let i = 0; i < taskCount; i = i + 1) {
      const task = AllTasks[i];
      if (task.nextTask && task.status !== 'Completed'
        && task.status !== 'Auto Closed' && task.status !== 'Deleted') {
        const nextTasks = task.nextTask.split(';');
        const AllNextTasks = AllTasks.filter(c => (nextTasks.indexOf(c.title) > -1));

        const SDTask = AllNextTasks.find(c => task.end_date > c.start_date && c.status !== 'Completed'
          && c.status !== 'Auto Closed' && c.status !== 'Deleted' && c.DisableCascade === false); //// Change allow start to disable cascade
        if (SDTask) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + SDTask.title + '  should be greater than end date of ' + task.title + ' in ' + task.milestone
          });
          errorPresnet = true;
          break;
        }
      }
    }
    return errorPresnet;
  }

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
      return obj.data.title.split(' (')[0] === newCurrentMilestoneText;
    });
    if (newCurrentMilestone.length > 0) {
      let currMilTasks = this.getTasksFromMilestones(newCurrentMilestone[0], false, false);
      currMilTasks = currMilTasks.filter((objt) => {
        return objt.status !== 'Deleted' && objt.status !== 'Abandon';
      });
      if (subMile.itemType === 'submilestone') {
        currMilTasks = currMilTasks.filter((objt) => {
          return objt.parent === subMile.id;
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
          detail: 'Allocated time for task cannot be equal or less than 0 for ' + checkTaskAllocatedTime[0].title
        });

        return false;
      }

      const compareDates = currMilTasks.filter(e => (e.end_date <= e.start_date && e.tat === false &&
        e.itemType !== 'Follow up' && e.status !== 'Completed' && e.itemType !== 'Send to client'));
      if (compareDates.length > 0) {
        //  && e.itemType !== 'Send to client' && e.itemType !== 'Client Review'
        this.messageService.add({
          key: 'custom', severity: 'warn', summary: 'Warning Message',
          detail: 'End date should be greater than start date of ' + compareDates[0].title
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
      const Title = rowNode.parent ? rowNode.parent.data.title + ' - ' + rowData.title : rowData.title;
      let tasks = [];
      this.confirmationService.confirm({
        message: 'Are you sure that you want to Confirm ' + Title + ' ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.selectedSubMilestone = rowData;
          // let allTasks = rowNode.node;
          const validateNextMilestone = this.validateNextMilestone(this.selectedSubMilestone);
          if (validateNextMilestone) {
            await this.checkConflictsAllocations(rowNode.node);
            if (!this.capacityObj.conflictAllocation) {
              this.loaderenable = true;
              setTimeout(() => { this.setAsNextMilestone(this.selectedSubMilestone); }, 200);
            }
          }
        },
        reject: () => {
        }
      });
    }
  }

  ///// Refactor code 
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
      return obj.data.title.split(' (')[0] === newCurrentMilestoneText;
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
            milestoneID = +element.data.id;
            const subMileStatus = prevMilestoneTasks.filter(c => c.itemType !== 'Client Review').every(this.checkStatus);
            element.data.status = subMileStatus ? 'Deleted' : 'Completed';
            updatePMilestoneBody = {
              __metadata: { type: 'SP.Data.SchedulesListItem' },
              Status: subMileStatus ? 'Deleted' : 'Completed'
            };
          }
          else {
            milestoneID = +element.id;
            updatePMilestoneBody = {
              __metadata: { type: 'SP.Data.SchedulesListItem' },
              Status: 'Completed',
              SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], 'Completed')//.join(';#')
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
              // AllowCompletion: 'Yes',
              ActiveCA: task.ActiveCA
            };
            const taskUpdateObj = Object.assign({}, this.queryConfig);
            taskUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.id);
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
          await this.sendCentralTaskMail(this.oProjectDetails, element, element.title + ' Created', 'CentralTaskCreation');
        }
        element.status = 'Not Started';
        element.assignedUserChanged = false;
        const updateSchedulesBody = {
          __metadata: { type: 'SP.Data.SchedulesListItem' },
          Status: element.status,
          ActiveCA: element.ActiveCA
        };
        const taskCAUpdateObj = Object.assign({}, this.queryConfig);
        taskCAUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.id);
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
      curMilestoneID = +currentMilestone[0].data.id;
      updateCMilestoneBody = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], '')//.join(';#')
      };
    } else {
      curMilestoneID = +newCurrentMilestone[0].data.id;
      updateCMilestoneBody = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(newCurrentMilestone[0], '')//.join(';#')
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

    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'SetAsNextMilestone');
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

      this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'SendEarlyTaskCompletionNotification');
      await this.spServices.executeBatch(notificationBatchUrl);
    }
    this.commonService.SetNewrelic('TaskAllocation', 'timeline-getProjectResources', 'setAsNextMilestone');
    await this.commonService.getProjectResources(this.oProjectDetails.projectCode, false, false);
    this.getMilestones(false);
  }

  checkStatus(value) {
    return value.status === 'Not Confirmed' ? true : false;
  }

  checkCompletedStatus(value) {
    return value.status === 'Auto Closed' || value.status === 'Completed' ? true : false;
  }
  ////// Refactor code - Done

  getSubMilestoneStatus(milestone, status) {
    const arrSubMil = [];
    let subMil = '';
    if (milestone.children !== undefined) {
      for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
        const submilestone = milestone.children[nCountSub];
        submilestone.data.status = submilestone.data.status === 'Not Saved' ? milestone.data.isCurrent ? 'Not Started' : 'Not Confirmed' : submilestone.data.status;
        if (submilestone.data.type !== 'task') {

          if (status === 'Completed') {
            if (submilestone.data.status !== 'Not Confirmed') {
              arrSubMil.push(submilestone.data.title + ':' + submilestone.data.position + ':Completed');
            }
          } else {
            arrSubMil.push(submilestone.data.title + ':' + submilestone.data.position + ':' + submilestone.data.status);
          }
        }
      }
    }
    if (arrSubMil.length) {
      subMil = arrSubMil.join(';#');
    }
    return subMil;
  }

  // ************************************************************************************************
  // Milestone Validation
  // **************************************************************************************************
  ////// Refactor code
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
        detail: 'Budget hours for ' + checkMilestoneAllocatedTime[0].title + ' milestone cannot be less than or equal to 0'
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
          checkTasks = checkTasks.filter(t => !t.parentSlot);
          // tslint:disable
          const checkTaskAllocatedTime = checkTasks.filter(e => (e.budgetHours === '' || +e.budgetHours === 0)
            && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' && e.itemType !== 'Follow up' && e.status !== 'Completed');
          // tslint:enable
          if (checkTaskAllocatedTime.length > 0) {
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'Allocated time for task cannot be equal or less than 0 for '
                + milestone.data.title + ' - ' + checkTaskAllocatedTime[0].title
            });

            return false;
          }
          const compareDates = checkTasks.filter(e => (e.pUserEnd <= e.pUserStart && e.tat === false
            && e.itemType !== 'Follow up' && e.status !== 'Completed' && e.itemType !== 'Send to client'));
          if (compareDates.length > 0) {
            //  && e.itemType !== 'Send to client' && e.itemType !== 'Client Review'
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'End date should be greater than start date of ' + milestone.data.text + ' - ' + compareDates[0].text
            });

            return false;
          }
          let validateAllocation = true;
          checkTasks = checkTasks.filter(t => t.slotType === 'Task');
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
          const errorPresnet = this.validateTaskDates(checkTasks);
          if (errorPresnet) {
            return false;
          }
        }
        // previousNode - Milestone
        // milestone.data. - client review
        if (previousNode !== undefined && previousNode.status !== 'Completed' &&
          new Date(milestone.data.start_date).getTime() <
          new Date(previousNode.end_date).getTime()) {
          let errormessage = previousNode.milestone + ' Client Review';
          if (previousNode.title !== 'Client Review') {
            errormessage = previousNode.title;
          }

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + milestone.data.title + ' should be greater than end date of ' + errormessage
          });
          return false;
        }
        if (milestone.data.title === 'Client Review' &&
          new Date(milestone.data.start_date).getTime() >= new Date(milestone.data.end_date).getTime()) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'End date should be greater than start date of ' + milestone.data.milestone + ' - Client Review'
          });
          return false;
        }
        const milestoneTasksRelink = AllTasks.filter(t => t.status !== 'Abandon' && t.itemType !== 'Adhoc');
        if (milestoneTasksRelink.length > 0) {
          this.linkScToClientReview(milestoneTasksRelink);
        }

      }
      previousNode = milestone.data;

    }
    return true;
  }


  linkScToClientReview(milestoneTasks) {

    milestoneTasks.filter(c => c.itemType === 'Send to client' && c.nextTask && c.nextTask === 'Client Review').forEach(sc => {
      sc.nextTask = null;
      sc.edited = true;
    });
    const LatestSCDate = new Date(Math.max.apply(null, milestoneTasks.filter(c => c.itemType === 'Send to client').map(c => c.pUserEnd)));

    const LatestSC = milestoneTasks.find(c => c.itemType === 'Send to client' &&
      new Date(c.pUserEnd).getTime() === LatestSCDate.getTime());

    const CR = milestoneTasks.find(c => c.itemType === 'Client Review');

    if (LatestSC && CR) {
      LatestSC.nextTask = CR ? CR.title : null;
      CR.previousTask = LatestSC ? LatestSC.title : null;
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
      header: task.submilestone !== null ? task.milestone + ' - ' + task.submilestone + ' - ' + task.title : task.milestone + " - " + task.title,
      width: '80vw',
      contentStyle: { "min-height": "30vh", "max-height": "90vh", "overflow-y": "auto" }
    });
    ref.onClose.subscribe(async (taskobj: any) => {

    });
  }


  ////// Refactor code
  getTaskObjectByValue(task, className, milestone, nextTasks, previousTasks, submilestone, tempID) {
    const submilestoneLabel = submilestone ? submilestone.text : '';
    return {
      'pUserStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStartDatePart': this.getDatePart(this.Today),
      'pUserStartTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pUserEndDatePart': this.getDatePart(this.Today),
      'pUserEndTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'status': 'Not Saved',
      'id': task.dbId === undefined || task.dbId === 0 ? tempID : task.dbId,
      'text': task.label,
      'title': task.label,
      'start_date': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'end_date': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'user': '',
      'open': 1,
      'parent': task.taskType === 'Client Review' ? 0 : milestone.Id,
      'res_id': '',
      'budgetHours': 0,
      'tat': false,
      'tatVal': 0,
      'milestoneStatus': className === 'gtaskred' ? 'Not Saved' : null,
      'type': 'task',
      'slotType': task.slotType ? task.slotType : '',
      'editMode': true,
      'scope': null,
      'spentTime': '0:0',
      'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      //'isFuture': '',
      'assignedUsers': [{ Title: '', userType: '' }],
      'AssignedTo': {},
      'userCapacityEnable': false,
      // 'subtype': submilestone ? submilestone.label === 'Default' ? '' : 'submilestone' : '',
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
      'taskFullName': this.oProjectDetails.projectCode + ' ' + milestone.label + ' ' + task.label,
      'allocationPerDay': task.allocationPerDay ? task.allocationPerDay : ''
    };
  }

  getObjectByValue(milestone, type, tempID, TempSubmilePositionArray, mil) {

    return {
      'pUserStart': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserEnd': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'pUserStartDatePart': this.getDatePart(this.Today),
      'pUserStartTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'pUserEndDatePart': this.getDatePart(this.Today),
      'pUserEndTimePart': this.getTimePart(new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)),
      'status': 'Not Saved',
      'id': milestone.dbId === undefined || milestone.dbId === 0 ? tempID : milestone.dbId,
      'text': milestone.label,
      'title': milestone.label,
      'start_date': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'end_date': new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0),
      'user': '',
      'open': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? 1 : 0,
      'parent': 0,
      'res_id': '',
      'budgetHours': '0',
      'tat': null,
      'tatVal': 0,
      'milestoneStatus': '',
      'type': type,
      'slotType': '',
      'editMode': true,
      'scope': null,
      'spentTime': '0:0',
      'milestone': mil ? mil.label : '',
      'position': type === 'submilestone' ? TempSubmilePositionArray.find(c => c.name === milestone.label) !== undefined ? TempSubmilePositionArray.find(c => c.name === milestone.label).position : 1 : '',
      'isCurrent': this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      // 'isFuture': this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined ?
      //   this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(milestone.label)
      //     > -1 ? true : false : false,
      'isNext': this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === milestone.label ? true : false,
      'userCapacityEnable': false,
      'edited': true,
      'added': true
    };
  }

  ////// Refactor - Done
  getExistingData(oExistingTask) {
    oExistingTask.start_date = new Date(oExistingTask.start_date);
    oExistingTask.end_date = new Date(oExistingTask.end_date);
    oExistingTask.pUserStart = new Date(oExistingTask.pUserStart);
    oExistingTask.pUserEnd = new Date(oExistingTask.pUserEnd);

    this.setDatePartAndTimePart(oExistingTask);

    // oExistingTask.pUserStartDatePart = this.getDatePart(oExistingTask.pUserStart);
    // oExistingTask.pUserStartTimePart = this.getTimePart(oExistingTask.pUserStart);
    // oExistingTask.pUserEndDatePart = this.getDatePart(oExistingTask.pUserEnd);
    // oExistingTask.pUserEndTimePart = this.getTimePart(oExistingTask.pUserEnd);
    // oExistingTask.tatVal = this.commonService.calcBusinessDays(new Date(oExistingTask.start_date), new Date(oExistingTask.end_date));

    return oExistingTask;
  }
  // tslint:enable


  trackByFn(index, item) {
    return index; // or item.id
  }

  editAllocation(milestoneTask, allocationType): void {
    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserName.ID === milestoneTask.AssignedTo.ID;
    });

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
        allocationType
      } as DailyAllocationTask,
      width: '90vw',

      header: milestoneTask.submilestone ? milestoneTask.milestone + ' ' + milestoneTask.title
        + ' ( ' + milestoneTask.submilestone + ' )' : milestoneTask.milestone + ' ' + milestoneTask.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
      }
    });
  }
  setAllocationPerDay(allocation, milestoneTask: IMilestoneTask) {
    let task: any;
    if (milestoneTask.type === 'Milestone') {
      const milestoneData: MilestoneTreeNode = this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
      const milestoneTasks: any[] = this.getTasksFromMilestones(milestoneData, false, true);
      milestoneData.data.edited = true;
      task = milestoneTasks.find(t => t.id === milestoneTask.id);
    } else {
      task = milestoneTask;
    }
    task.allocationPerDay = allocation.allocationPerDay;
    task.showAllocationSplit = new Date(task.StartDatePart).getTime() !== new Date(task.EndDatePart).getTime() ? true : false;
    task.edited = true;
    if (allocation.allocationType === 'Equal Split') {
      task.allocationColor = 'indianred';
    } else if (allocation.allocationType === 'Daily Allocation') {
      task.allocationColor = 'rgb(160, 247, 142)';
    }
  }

  showOverlayPanel(event, rowData, dailyAllocateOP, target?) {
    const allocationPerDay = rowData.allocationPerDay ? rowData.allocationPerDay : '';
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
  }

  hideOverlayPanel() {
    this.dailyAllocateOP.hideOverlay();
  }
}

export interface MilestoneTreeNode {
  data?: any;
  children?: MilestoneTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}
