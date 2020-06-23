import {
  Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation, Input, OnDestroy, HostListener, ElementRef, ComponentFactoryResolver,
  ComponentRef, ComponentFactory, ViewContainerRef, NgZone, AfterViewInit, ChangeDetectorRef, AfterViewChecked
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { TreeNode, DialogService, DynamicDialogRef } from 'primeng';
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
import { IMilestoneTask, IConflictTask, IConflictResource } from '../interface/allocation';
import { IDailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { AllocationOverlayComponent } from 'src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component';
import { GanttEdittaskComponent } from '../gantt-edittask/gantt-edittask.component';
import { ConflictAllocationsComponent } from './conflict-allocations/conflict-allocations.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers: [DialogService, DragDropComponent, UsercapacityComponent, DynamicDialogRef,
    PreStackAllocationComponent, AllocationOverlayComponent, GanttEdittaskComponent, ConflictAllocationsComponent],
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
  @ViewChild('reallocationMailTableID', { static: false }) reallocateTable: ElementRef;
  @ViewChild('ganttcontainer', { read: ViewContainerRef, static: false }) ganttChart: ViewContainerRef;
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
  currentTaskId;
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
  displayComment = false;
  capacityLoaderenable = false;
  displaydragdrop: boolean;
  loaderenable: boolean;
  confirmMilestoneLoader = false;
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
  budgetHrsTask: any;
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
  bHrs = 0;
  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private taskAllocationService: TaskAllocationConstantsService,
    public datepipe: DatePipe,
    public dialogService: DialogService,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private usercapacityComponent: UsercapacityComponent,
    private resolver: ComponentFactoryResolver,
    private zone: NgZone, private fb: FormBuilder,
    private dailyAllocation: PreStackAllocationComponent,
    private cdRef: ChangeDetectorRef,
    private myElement: ElementRef,
    private conflictAllocation: ConflictAllocationsComponent
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

  async getResourceCapacity() {
    const users = [];
    if (this.milestoneData.length) {
      const currentMilestone = this.milestoneData.find(m => m.data.itemType === 'milestone' && m.data.isCurrent);
      const stDate = currentMilestone ? currentMilestone.data.pUserStart : this.milestoneData[0].data.pUserStart;
      const resources = this.getAllResources(this.allTasks);
      resources.forEach(resource => {
        users.push(this.sharedObject.oTaskAllocation.oResources.find(r => r.UserNamePG.ID === resource));
      });
      const newdate = this.commonService.calcBusinessDate('Next', 90, new Date(stDate));
      this.sharedObject.oCapacity = await this.usercapacityComponent.applyFilterReturn(stDate, newdate.endDate, users, []);
    }
  }

  public getAllResources(tasks) {
    const validTasks = tasks.filter(t => t.Status !== 'Deleted');
    let resources = validTasks.map(t => t.AssignedTo.ID);
    resources = [...new Set(resources)].filter(res => res && res > 0);
    return resources;
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
      let color = this.colors.filter(c => c.key == milestoneTask.Status);
      if (color.length) {
        milestoneTask.color = color[0].value;
      }

      milestoneTask.assignedUsers = [{ Title: '', userType: '' }]; //this.resources.length > 0 ? this.resources : [{ Title: '', userType: '' }];

      const AssignedUserTimeZone = this.sharedObject.oTaskAllocation.oResources.filter(function (objt) {
        return milestoneTask.AssignedTo.ID === objt.UserNamePG.ID;
      });
      milestoneTask.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
        ? AssignedUserTimeZone[0].TimeZone.Title ?
          AssignedUserTimeZone[0].TimeZone.Title : +5.5 : +5.5;


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
          const convertedHoursMins = this.commonService.convertFromHrsMins(mHoursSpentTask);
          projectAvailableHours.push(+convertedHoursMins);
        }
      } else if (milestoneTask.Status !== 'Deleted' && milestoneTask.Status !== 'Abandon' && bConsiderAllcoated) {
        projectAvailableHours.push(+milestoneTask.ExpectedTime);
      }

      // Gantt Chart Sub Object

      if (milestoneTask.Status !== 'Deleted') {
        milestoneTask.type = 'task';

        let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(milestoneTask, '', '', milestone, hrsMinObject);

        taskName = milestoneTask.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + milestoneTask.Milestone + ' ', '');
        this.GanttchartData.push(GanttTaskObj);
        allRetrievedTasks.push(GanttTaskObj);
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
        return clientReviewObj[0].AssignedTo.ID === objt.UserNamePG.ID;
      });
      clientReviewObj[0].assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
        ? AssignedUserTimeZone[0].TimeZone.Title ?
          AssignedUserTimeZone[0].TimeZone.Title : +5.5 : +5.5;


      let color = this.colors.filter(c => c.key == clientReviewObj[0].Status)
      if (color.length) {
        clientReviewObj[0].color = color[0].value;
      }

      clientReviewObj[0].type = 'task';
      let GanttTaskObj = this.taskAllocateCommonService.ganttDataObject(clientReviewObj[0], '', '', milestone, '');

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

      element.Id = "SM" + milestone.Id + index; //parseInt("1200000" + milestone.Id + index)
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

      milestones = this.allTasks.filter(c => c.ContentTypeCH === this.constants.CONTENT_TYPE.MILESTONE);
      this.deletedMilestones = milestones.filter(m => m.Status === 'Deleted');
      const arrMilestones = this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones;

      const milestonesList = [];
      ////// Sorts the data as per the stored order
      for (const mil of arrMilestones) {
        const milestone = milestones.find(e => e.Title === mil && e.Status !== 'Deleted');
        if (milestone) {
          milestonesList.push(milestone);
        }
      }
      milestones = milestonesList;
      this.dbRecords = [];

      for (const milestone of milestones) {
        const tempmilestoneTask = this.allTasks.filter(c => c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE && c.Milestone === milestone.Title);
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

        milestone.startDate = this.generateDate(milestone.Actual_x0020_Start_x0020_Date);
        milestone.endDate = this.generateDate(milestone.Actual_x0020_End_x0020_Date);

        let color = this.colors.filter(c => c.key == milestone.Status)
        if (color.length) {
          milestone.color = color[0].value;
        }

        milestone.type = 'milestone';
        // Gantt Chart Object

        let GanttObj: any = this.taskAllocateCommonService.ganttDataObject(milestone)

        if (GanttObj.status !== 'Deleted') {
          this.GanttchartData.push(GanttObj);
        }
        if (dbSubMilestones.length > 0) {
          let submile = [];
          this.createFetchTaskSubMil(dbSubMilestones, milestone, GanttObj, nextSubMilestone, milestoneHoursSpent, projectHoursSpent,
            projectHoursAllocated, projectAvailableHours, allRetrievedTasks, submile);

          const defaultTasks = this.allTasks.filter(c => c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE && c.Milestone === milestone.Title
            && (c.SubMilestones === null || c.SubMilestones === 'Default') && c.Task !== 'Client Review' && c.Status !== 'Deleted');

          if (defaultTasks.length) {
            this.createFetchTaskObject(defaultTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours,
              allRetrievedTasks, submile, milestone);
          }
          this.createFetchTaskMilestone(milestone, milestoneHoursSpent, submile);
          this.createFetchTaskCR(milestone);
        }
        else {
          milestoneTasks = this.allTasks.filter(c => c.ContentTypeCH !== this.constants.CONTENT_TYPE.MILESTONE && c.Milestone === milestone.Title && c.Task !== 'Client Review');

          let tempSubmilestones = []
          this.createFetchTaskObject(milestoneTasks, milestoneHoursSpent, projectHoursSpent, projectHoursAllocated, projectAvailableHours
            , allRetrievedTasks, tempSubmilestones, milestone);

          this.createFetchTaskMilestone(milestone, milestoneHoursSpent, tempSubmilestones);

          this.createFetchTaskCR(milestone);

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
    this.visualgraph = this.graphFlag !== undefined ? this.graphFlag : true;
    if (this.visualgraph) {
      this.showGanttChart(true);
    } else {
      this.createGanttDataAndLinks(true);
    }
    this.milestoneDataCopy = JSON.parse(JSON.stringify(this.milestoneData));

    this.disableSave = false;
    if (!bFirstLoad) {
      this.changeInRestructure = false;

      this.commonService.showToastrMessage(this.constants.MessageType.success, 'Tasks Saved Successfully.', false);
    } else {
      this.ganttAttachEvents();
    }
    this.loaderenable = false;
    //this.visualgraph = this.graphFlag !== undefined ? this.graphFlag : true;
    this.GanttChartView = true;
    await this.getResourceCapacity();
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

  public async assignUsers(allRetrievedTasks) {

    for (let nCount = 0; nCount < this.milestoneData.length; nCount = nCount + 1) {
      let milestone = this.milestoneData[nCount];
      if (milestone.data.itemType === 'Client Review') {
        await this.assignUsersToTask(milestone, allRetrievedTasks);

      } else if (milestone.children !== undefined) {
        for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
          let submilestone = milestone.children[nCountSub];
          if (submilestone.data.type === 'task') {
            await this.assignUsersToTask(submilestone, allRetrievedTasks);

          } else if (submilestone.children !== undefined) {
            for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
              const task = submilestone.children[nCountTask];
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

        const tempUser = user.UserNamePG ? user.UserNamePG : user;
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

  async showGanttChart(bCreateLinks) {
    await this.createGanttDataAndLinks(bCreateLinks);
    this.loaderenable = true;
    await this.loadComponent();
    this.loaderenable = false;
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
          m.start_date = new Date(firstTask.start_date);
        }

        if (firstTask.start_date > m.start_date) {
          m.start_date = new Date(firstTask.start_date);
        }
      }
      const getClientReview = data.find(e => e.itemType === 'Client Review' && e.milestone === m.taskFullName);
      const milIndex = this.milestoneData.findIndex(e => e.data.id === m.id);
      if (getClientReview) {
        m.end_date = new Date(getClientReview.start_date);
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
      if (item.type === 'submilestone') {
        const mil = milestones.find(e => e.title === item.milestone)
        item.parent = mil.id;
        item.start_date = new Date(item.start_date);
        item.end_date = new Date(item.end_date);
        const subMils = data.filter(e => (e.position ? parseInt(e.position) : 0) === parseInt(item.position) + 1);
        subMils.forEach(submil => {
          linkArray.push(this.createLinkArrayObject(item, submil));
        });
      } else if (item.type === 'task' && item.itemType !== 'Client Review') {
        if (item.parentSlot) {
          item.parent = item.parentSlot;
          item.start_date = new Date(item.start_date);
          item.end_date = new Date(item.end_date);
        } else {
          const taskParent = data.find(e => item.submilestone ?
            e.title === item.submilestone && e.milestone === item.milestone :
            e.title === item.milestone);
          item.parent = taskParent.id;
          item.start_date = new Date(item.start_date);
          item.end_date = new Date(item.end_date);
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
          const nextMil = data.find(e => e.title === nextMilesone);
          if (nextMil) {
            linkArray.push(this.createLinkArrayObject(item, nextMil));
          }
        }
      }
      else if (item.type === 'milestone') {
        const crTask = data.find(e => e.itemType === 'Client Review' && e.milestone === item.title);
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
      const nextTaskVal = task.nextTask.replace(/#/gi, '');
      const arrayNext = nextTaskVal.split(';');
      return this.GanttchartData.filter(e => arrayNext.indexOf(e.title) > -1 && e.milestone === task.milestone);
    } else {
      return [];
    }
  }

  generateMenuList(indices) {
    const menus = [
      { "id": "budgetHrs", "text": "Budget Hours", "enabled": true },
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
      { "id": "equalSplit", "text": "Equal Allocation", "enabled": true }

    ]

    let menuItems = [];
    if (!indices) {
      this.commonService.showToastrMessage(this.constants.MessageType.error, 'No menus available', false);
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
    } else if (task.type == "milestone") {
      if (task.status !== 'Completed' && task.status !== 'Auto Closed') {
        index = [0];
      }
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

    this.renderGanttTemplates();
    this.ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject, this.resource);
    this.setScale(this.selectedScale);
    this.allTaskData = this.taskAllocateCommonService.ganttParseObject;

    gantt.refreshData();
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

    this.menu.attachEvent("onClick", (id, zoneId, cas) => {
      let task = gantt.getTask(this.currentTaskId);
      switch (id) {
        case 'tatON':
          task.tat = true;
          this.ChangeEndDate(true, task);
          this.updateMilestoneData();
          this.ganttNotification();
          break;
        case 'tatOFF':
          task.tat = false;
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
        case 'editTask':
          this.openPopupOnGanttTask(task, 'end');
          break;
        case 'budgetHrs':
          this.changeBudgetHrs(task);
          break;
        default:
          break;
      }
    });

  }

  renderGanttTemplates() {
    this.taskAllocateCommonService.ganttParseObject.data.forEach((e) => {
      e.ganttOverlay = e.showAllocationSplit ? this.taskAllocateCommonService.allocationSplitColumn : '';
      e.ganttMenu = e.type == 'milestone' ? e.isNext === true && !e.subMilestonePresent && !this.changeInRestructure &&
        this.oProjectDetails.status !== 'In Discussion' && this.oProjectDetails.projectType !== 'FTE-Writing'
        && e.status !== 'Completed' ? this.taskAllocateCommonService.contextMenu : e.status !== 'Completed' && e.status !== 'Auto Closed' ? this.taskAllocateCommonService.contextMenu : ''
        : e.type == 'submilestone' ? !this.changeInRestructure && e.status === 'Not Confirmed' &&
          (e.isCurrent || e.isNext) ? this.taskAllocateCommonService.contextMenu : '' : this.taskAllocateCommonService.contextMenu;
    })
  }

  isDragEnable(isStartDate, status) {
    switch (status) {
      case 'Not Started':
      case 'Not Confirmed':
      case 'Not Saved':
        return true;

      case 'In Progress':
        if (!isStartDate)
          return true;
        else
          return false;

      default:
        return false;
    }
  }

  ganttAttachEvents() {

    if (this.taskAllocateCommonService.attachedEvents.length) {
      this.taskAllocateCommonService.attachedEvents.forEach(element => {
        gantt.detachEvent(element);
      });
      this.taskAllocateCommonService.attachedEvents = [];
    }

    const onTaskOpened = gantt.attachEvent("onTaskOpened", (id) => {
      // ;
      // gantt.init(this.ganttComponentRef.instance.ganttContainer.nativeElement);
      // gantt.clearAll();
      // this.ganttComponentRef.instance.onLoad(this.taskAllocateCommonService.ganttParseObject, this.resource);
      // this.setScale(this.selectedScale);
      //this.loadComponent();
    });
    this.taskAllocateCommonService.attachedEvents.push(onTaskOpened);

    const onBeforeTaskChanged = gantt.attachEvent("onBeforeTaskChanged", (id, mode, task) => {
      this.allTaskData = gantt.serialize();
      this.currentTask = { ...task };
      return true;
    });
    this.taskAllocateCommonService.attachedEvents.push(onBeforeTaskChanged);

    const onBeforeTaskDrag = gantt.attachEvent("onBeforeTaskDrag", (id, mode, e) => {
      let task = this.GanttchartData.find(e => e.id == id);
      this.startDate = task.start_date;
      this.endDate = task.end_date;
      this.bHrs = task.budgetHours;
      this.resetTask = { ...task };
      this.dragClickedInput = e.srcElement.className;
      const isStartDate = this.dragClickedInput.indexOf('start_date') > -1 ? true : false;
      if (gantt.ext.zoom.getCurrentLevel() < 3) {
        if (task.status == 'Completed' || task.status == "Auto Closed" || task.type == "milestone" || task.type === 'submilestone') {
          return false;
        } else {
          if (task.itemType == 'Client Review') {
            if (mode === 'resize') {
              let isDrag = this.isDragEnable(isStartDate, task.status)
              return isDrag;
            } else {
              return false;
            }
          } else {
            if (mode === 'resize') {
              let isDrag = this.isDragEnable(isStartDate, task.status)
              return isDrag;
            } else if (mode === 'move') {
              if (task.status == 'In Progress') {
                return false;
              } else {
                return true;
              }
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

    const onTaskClick = gantt.attachEvent("onTaskClick", (taskId, e) => {
      let task = gantt.getTask(taskId);
      let ganttOpenIcon = e.target.closest('.gantt_arrow_click');
      if (!ganttOpenIcon) {
        if (task.itemType !== "Send to client" && task.itemType !== "Client Review" && task.slotType !== 'Slot' && task.type !== "milestone" && task.type !== "submilestone" && task.AssignedTo.ID !== -1) {
          if (e.target.parentElement.className === "gantt_cell cell_user") {
            this.header = task.submilestone ? task.milestone + ' ' + task.submilestone + ' ' + task.text
              : task.milestone + ' ' + task.text;
            this.sharedObject.resourceHeader = this.header;

            let resourceTask = task;
            this.onResourceClick(resourceTask);
          }
        } else if ((task.itemType == "Send to client" || task.itemType == "Client Review") && e.target.parentElement.className === "gantt_cell cell_user") {

          this.commonService.showToastrMessage(this.constants.MessageType.error, 'Resource view is unavailable for these tasks please edit the task to change resource.', false);
        }
        let menuButton = e.target.closest("[data-action]")
        if (menuButton) {
          if (gantt.ext.zoom.getCurrentLevel() < 3) {
            if (taskId) {
              let task = this.GanttchartData.find(e => e.id == taskId);
              const menus = this.showMenus(task);
              this.menu.clearAll();
              this.menu.loadStruct(menus);
              this.currentTaskId = taskId;
              this.startDate = task.start_date;
              this.endDate = task.end_date;
              this.bHrs = task.budgetHours;
              this.resetTask = task;
              let x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

              if (task.status !== 'Completed' || task.status !== "Auto Closed") {
                this.menu.showContextMenu(x, y);
                setTimeout(() => {
                  let contextMenu: any = document.getElementsByClassName("dhtmlxMenu_dhx_terrace_SubLevelArea_Polygon")[0];
                  contextMenu.style.display = "block";
                }, 500);
              }
              if (task) {
                return false;
              }
            } else {
              return false;
            }
          }
        }
        let overlayIconButton = e.target.closest(".ganttOverlayIcon");
        if (overlayIconButton) {
          this.showOverlayPanel(e, task, this.dailyAllocateOP, e.target.parentElement)
        }
        return false;
      }
      else {
        return true;
      }
    });

    this.taskAllocateCommonService.attachedEvents.push(onTaskClick);

    const onTaskDrag = gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
      let task = { ...this.currentTask };
      this.ganttSetTime = false;
      const isStartDate = this.dragClickedInput.indexOf('start_date') > -1 ? true : false;
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
          this.openPopupOnGanttTask(task, 'end');
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

      this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(this.singleTask);

      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
        if (task.type == "milestone") {
          if (task.title == this.singleTask.milestone) {
            task.edited = true;
            task.open = true;
          }
        }
      });

      const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
        return this.singleTask.AssignedTo.ID === objt.UserNamePG.ID;
      });
      await this.dailyAllocation.calcPrestackAllocation(resource, this.singleTask);

      this.GanttchartData = allTasks.data;
      this.ganttNotification();
    } else {
      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
        if (task.type == "milestone") {
          if (task.title == this.singleTask.milestone) {
            task.edited = false;
            task.open = true;
          }
        }
        if (task.id == this.resetTask.id) {
          //task = this.resetTask;

          task.start_date = this.startDate;
          task.end_date = this.endDate;
        }
      });

      this.GanttchartData = allTasks.data;
    }
    this.showGanttChart(false);
    setTimeout(() => {
      this.scrollToTaskDate(this.ganttSetTime ? this.singleTask.end_date : this.resetTask.end_date);
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
      if (this.singleTask.itemType == 'Send to client') {
        this.singleTask.end_date = this.singleTask.start_date;
        this.singleTask.pUserEnd = this.singleTask.pUserStart;
        this.singleTask.pUserEndDatePart = this.getDatePart(this.singleTask.pUserStart);
        this.singleTask.pUserEndTimePart = this.getTimePart(this.singleTask.pUserStart);
      }
    } else {
      if (this.singleTask.itemType == 'Send to client') {
        this.singleTask.end_date = this.singleTask.start_date;
        this.singleTask.pUserEnd = this.singleTask.pUserStart;
        this.singleTask.pUserEndDatePart = this.getDatePart(this.singleTask.pUserStart);
        this.singleTask.pUserEndTimePart = this.getTimePart(this.singleTask.pUserStart);
      } else {
        this.singleTask.end_date = new Date(this.datepipe.transform(this.singleTask.end_date, 'MMM d, y') + ' ' + time);
        this.singleTask.pUserEnd = new Date(this.datepipe.transform(this.singleTask.end_date, 'MMM d, y') + ' ' + time);
        this.singleTask.pUserEndDatePart = this.getDatePart(this.singleTask.end_date);
        this.singleTask.pUserEndTimePart = time;
      }
    }
  }

  openPopupOnGanttTask(task, clickedInputType) {
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
    this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(task);
    this.budgetHrsTask = task;
  }

  ganttNotification() {
    this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Gantt task update. There are some unsaved changes, Please save them.', false);
  }

  onResourceClick(task) {
    this.hideResourceSelection = true;
    this.displayBody = true;

    let resources = [];
    task.assignedUsers.forEach((c) => {
      c.items.forEach((item) => {
        this.sharedObject.oTaskAllocation.oResources.forEach((objt) => {
          if (objt.UserNamePG.ID === item.value.ID) {
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

    this.selectedTask = task;
    this.sharedObject.data = data;

  }

  onClose() {
    this.hideResourceSelection = false;
    this.header = "";
  }


  getNode(task): TreeNode {
    const tasktitle = task.itemType === 'milestone' ? task.title : task.milestone;
    const milestone: TreeNode = this.milestoneData.find(m => m.data.title === tasktitle);
    if (task.itemType === 'submilestone') {
      const submilestone: TreeNode = milestone.children.find(sm => sm.data.title === task.title);
      return submilestone;
    }
    return milestone;
  }

  confirmMilestone(task) {
    this.loaderenable = true;
    this.confirmMilestoneLoader = true;
    setTimeout(async () => {
      const rowNode: TreeNode = this.getNode(task);
      if (task.editMode) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'There are some unsaved changes, Please save them.', false);
        return false;

      } else {
        const Title: string = task.itemType === 'submilestone' && task.milestone ? task.milestone + ' - ' + task.title : task.title;
        const message: string = 'Are you sure that you want to Confirm \'' + Title + '\' milestone ?';
        const conflictDetails: IConflictResource[] = await this.conflictAllocation.checkConflictsAllocations(rowNode, this.milestoneData);
        if (conflictDetails.length) {
          this.showConflictAllocations(task, conflictDetails, rowNode);
        } else {
          this.setAsNextMilestoneCall(task, message);
        }
      }
      this.loaderenable = false;
      this.confirmMilestoneLoader = false;
    }, 100);
  }

  confirmChangeResource(event) {
    this.commonService.confirmMessageDialog('Change Resource of Task', 'Are you sure you want to change the Resource of Task ?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
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
    let allTasksData = [];
    allTasksData = this.getGanttTasksFromMilestones(this.milestoneData, true);
    const editedTask = allTasksData.find(task => task.id == this.selectedTask.id);
    editedTask.AssignedTo = editedTask ? this.selectedTask.AssignedTo : editedTask.AssignedTo;
    editedTask.user = editedTask ? this.selectedTask.AssignedTo.Title : editedTask.AssignedTo.Title;
    this.assignedToUserChanged(editedTask);
    this.GanttchartData = allTasksData;
    this.taskAllocateCommonService.ganttParseObject.data = [...allTasksData];
    this.loadComponent();
    this.ganttNotification();
  }

  editTaskModal(task, clickedInputType) {
    this.updatedTasks = {};
    this.updatedTasks = task;
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

  setDateToCurrent(node) {
    for (const milestone of this.milestoneData) {
      if (milestone.data.type === 'task' && node.milestone === milestone.data.milestone && node.taskFullName === milestone.data.taskFullName) {
        milestone.data = node;
        milestone.data.edited = true;
        break;
      }
      if (milestone.children !== undefined) {
        for (const submilestone of milestone.children) {
          if (submilestone.data.type === 'task' && node.milestone === submilestone.data.milestone && node.taskFullName === submilestone.data.taskFullName) {
            submilestone.data = node;
            submilestone.data.edited = true;
            break;
          }
          if (submilestone.children !== undefined) {
            for (const task of submilestone.children) {
              if (node.milestone === task.data.milestone && node.taskFullName === task.data.taskFullName) {
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
  setBudgetHours(task) {
    if (task.type !== 'milestone' && task.type !== 'submilestone') {
      this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(task);
      if (this.maxBudgetHrs < this.budgetHrs) {
        this.budgetHrs = 0;
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Budget hours is set to zero because given budget hours is greater than task time period.', false);
      }
    }
  }

  updateMilestoneTaskObject(updatedTask, milestoneTask) {
    let task = updatedTask.value;

    milestoneTask.start_date = task.startDate;
    milestoneTask.pUserStartDatePart = this.getDatePart(task.startDate);
    milestoneTask.pUserStartTimePart = task.startDateTimePart
    milestoneTask.end_date = task.endDate;
    milestoneTask.pUserEndDatePart = this.getDatePart(task.endDate);
    milestoneTask.pUserEndTimePart = task.endDateTimePart;
    milestoneTask.budgetHours = task.budgetHrs;
    milestoneTask.DisableCascade = task.disableCascade;
    milestoneTask.AssignedTo = task.resource
    milestoneTask.user = task.resource.Title
    milestoneTask.tat = task.tat

    return milestoneTask;
  }

  async saveTask(isBudgetHrs, updatedDataObj) {
    if (isBudgetHrs) {

      let allTasks = {
        data: []
      };

      if (this.budgetHrs == 0 && this.updatedTasks.type !== 'milestone') {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please Add Budget Hours.', false);

      } else {
        if (this.updatedTasks.type !== 'milestone') {
          let time: any = this.commonService.getHrsAndMins(this.updatedTasks.pUserStart, this.updatedTasks.pUserEnd)
          let bhrs = this.commonService.convertToHrsMins('' + this.updatedTasks.budgetHours).replace('.', ':')

          let hrs = parseInt(bhrs.split(':')[0]);
          let min = parseInt(bhrs.split(':')[1]);

          let bHrsTime: any = new Date();
          bHrsTime = bHrsTime.setHours(hrs, min, 0, 0);

          if (bHrsTime > time.maxTime) {
            this.budgetHrs = 0;

            this.commonService.showToastrMessage(this.constants.MessageType.error, 'Budget hours is set to zero because given budget hours is greater than task time period.', false);
          }
        }
        allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);

        for (const task of allTasks.data) {
          if (task.type == 'task') {
            if (task.id == this.updatedTasks.id) {
              task.budgetHours = this.budgetHrs;
              task.edited = true;
              const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
                return task.AssignedTo && task.AssignedTo.ID === objt.UserNamePG.ID;
              });
              if (this.budgetHrs !== 0) {
                await this.dailyAllocation.calcPrestackAllocation(resource, task);
              }
              this.setDateToCurrent(task)
              this.sharedObject.currentTaskData = task;
            }
          } else if (task.type == 'milestone') {
            if (task.id == this.updatedTasks.id) {
              task.budgetHours = this.budgetHrs;
              task.edited = true;
            }
          }
        }

        allTasks.data.forEach((task) => {
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
        setTimeout(() => {
          this.showGanttChart(false);
        }, 500)
        setTimeout(() => {
          this.scrollToTaskDate(this.updatedTasks.end_date);
        }, 1000);

      }

    } else if (updatedDataObj.reset) {
      this.close();
    } else {
      let allTasks = {
        data: []
      };
      let scrollDate;
      const cascadingObject = updatedDataObj.cascadingObject;
      if (Object.keys(cascadingObject).length && !Object.values(cascadingObject).some(x => (x == ''))) {
        scrollDate = new Date(cascadingObject.node.end_date);
        this.setDateToCurrent(cascadingObject.node);
        ////// Cascade future  dates
        this.DateChange(cascadingObject.node, cascadingObject.type);
        this.sharedObject.currentTaskData = cascadingObject.node;
      } else {
        let updatedTask = this.updateMilestoneTaskObject(updatedDataObj.updatedTask, this.updatedTasks);
        scrollDate = new Date(updatedTask.end_date);
        this.setDateToCurrent(updatedTask)
        this.sharedObject.currentTaskData = updatedTask;
      }

      allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);
      allTasks.data.forEach((task) => {
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
        this.scrollToTaskDate(scrollDate);
      }, 1000);
    }
  }

  getGanttTasksFromMilestones(milestones, includeSubTasks) {
    let tasks = [];
    milestones.forEach(milestone => {
      const milTasks = this.taskAllocateCommonService.getTasksFromMilestones(milestone, includeSubTasks, this.milestoneData, true);
      tasks = tasks.length ? [...tasks, ...milTasks] : milTasks;
    });
    return this.commonService.removeEmptyItems(tasks);
    // return tasks;
  }

  updateMilestoneData() {
    let allTasks = this.ganttAllTasks();
    let tasks = allTasks.data.filter(e => e.edited == true && e.type == 'task');

    allTasks.data.forEach((task) => {
      tasks.forEach((item) => {
        if (task.type == "milestone") {
          if (task.title == item.milestone) {
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
    let allTasks = {
      data: []
    };

    this.showBudgetHrs = false;
    allTasks.data = this.getGanttTasksFromMilestones(this.milestoneData, true);

    allTasks.data.forEach((task) => {
      if (this.resetTask.type === 'milestone') {
        if (task.id == this.resetTask.id) {
          task.open = true;
          task.edited = false;
        }
      }
      if (task.id == this.resetTask.id) {
        task = this.resetTask;
        task.start_date = this.startDate;
        task.end_date = this.endDate;
        task.budgetHours = this.bHrs;
        task.user = this.resetTask.AssignedTo ? this.resetTask.AssignedTo.Title : '';
      }
    })
    this.GanttchartData = allTasks.data;
    this.showGanttChart(false);
    setTimeout(() => {
      this.scrollToTaskDate(this.resetTask.pUserEnd);
    }, 1000);
  }

  loadComponentRefresh() {
    this.loaderenable = true;
    this.visualgraph = false;
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
      this.renderGanttTemplates();
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
          textColor = e.allocationColor == 'indianred' ? r.textColor : '#454545';
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

  CancelChanges(milestone, type) {
    this.loaderenable = true;
    if (type === "discardAll") {
      //this.loaderenable = false;
      this.changeInRestructure = false;
      this.milestoneData = [...this.tempmilestoneData];
      this.GanttchartData = [...this.oldGantChartData];
    }
    else if (type === 'task' && milestone.itemType === 'Client Review') {
      const tempMile = this.tempmilestoneData.find(c => c.data.id === milestone.id);
      milestone = tempMile.data;
      var index = this.milestoneData.indexOf(this.milestoneData.find(c => c.data.id === milestone.id));
      if (index > -1 && index < this.milestoneData.length - 1) {
        const notCancelled = this.milestoneData.splice(0, index);
        const dbmilestones = this.tempmilestoneData.slice(index, this.tempmilestoneData.length);
        this.milestoneData = [...notCancelled, ...dbmilestones];
      }
    }
    else {
      this.tempmilestoneData.forEach(element => {
        const getAllTasks = this.taskAllocateCommonService.getTasksFromMilestones(element, false, this.milestoneData, false);
        const selectedTask = getAllTasks.find(c => c.id === milestone.id);
        if (selectedTask !== undefined) {
          milestone = selectedTask;
        }
      });
      const milestoneIndex = this.milestoneData.findIndex(c => c.data.title === milestone.milestone);
      if (milestoneIndex > -1) {
        if (milestone.submilestone !== null && milestone.submilestone !== "Default") {
          const submilestoneIndex = this.milestoneData[milestoneIndex].children.findIndex(c => c.data.title === milestone.submilestone);

          if (submilestoneIndex > -1) {
            const taskindex = this.milestoneData[milestoneIndex].children[submilestoneIndex].children.findIndex(c => c.data.id === milestone.id);

            // replace all milestone from edited milestone
            const currentMilestone = this.milestoneData.splice(0, milestoneIndex + 1);
            const dbmilestones = this.tempmilestoneData.slice(milestoneIndex + 1, this.tempmilestoneData.length);
            this.milestoneData = [...currentMilestone, ...dbmilestones];

            // replace all submilestone from edited submilestone
            const submilestones = this.milestoneData[milestoneIndex].children.splice(0, submilestoneIndex + 1);
            const dbsubmilestones = this.tempmilestoneData[milestoneIndex].children.slice(submilestoneIndex + 1, this.tempmilestoneData[milestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children = [...submilestones, ...dbsubmilestones];

            // replace all tasks from edited task
            const tasks = this.milestoneData[milestoneIndex].children[submilestoneIndex].children.splice(0, taskindex);
            const dbtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children.slice(taskindex, this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children[submilestoneIndex].children = [...tasks, ...dbtasks];

            if (this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].data.slotType === 'Slot') {
              // replace all subtasks from edited task
              const dbSubtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children;
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children[taskindex].children = [...dbSubtasks];
            }

          }
        }
        else {
          const submilestoneIndex = this.milestoneData[milestoneIndex].children.findIndex(c => c.data.id === milestone.id);
          if (submilestoneIndex > -1) {

            // replace all milestone from edited milestone
            const tillCurrent = this.milestoneData.splice(0, milestoneIndex + 1);
            const dbmilestones = this.tempmilestoneData.slice(milestoneIndex + 1, this.tempmilestoneData.length);
            this.milestoneData = [...tillCurrent, ...dbmilestones];

            // replace all submilestone from edited submilestone
            const submilestones = this.milestoneData[milestoneIndex].children.splice(0, submilestoneIndex);
            const dbsubmilestones = this.tempmilestoneData[milestoneIndex].children.slice(submilestoneIndex, this.tempmilestoneData[milestoneIndex].children.length);
            this.milestoneData[milestoneIndex].children = [...submilestones, ...dbsubmilestones];

            if (this.milestoneData[milestoneIndex].children[submilestoneIndex].data.slotType === 'Slot') {
              // replace all tasks from edited task
              const dbtasks = this.tempmilestoneData[milestoneIndex].children[submilestoneIndex].children;
              this.milestoneData[milestoneIndex].children[submilestoneIndex].children = [...dbtasks];
            }
          }
        }

      }

    }
    this.tempmilestoneData = JSON.parse(JSON.stringify(this.tempmilestoneData));
    let allReturnedTasks = [];
    this.milestoneData.forEach(milestone => {
      allReturnedTasks.push.apply(this.taskAllocateCommonService.getTasksFromMilestones(milestone, false, this.milestoneData, false));
    });

    this.assignUsers(allReturnedTasks);
    this.convertDateString();

    setTimeout(() => {
      this.milestoneData = [...this.milestoneData];
      this.GanttchartData = this.getGanttTasksFromMilestones(this.milestoneData, true);
      this.createGanttDataAndLinks(true);
      this.loaderenable = false;
    }, 200);

  }
  // tslint:enable

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
            { label: 'Equal Allocation', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, 'Equal') }
          );
        }
        if (data.AssignedTo.ID !== undefined && data.AssignedTo.ID > -1) {
          this.taskMenu.push({ label: 'User Capacity', icon: 'pi pi-camera', command: (event) => this.getUserCapacity(data) });
        }
      }
      if (data.editMode) {
        this.taskMenu.splice(this.taskMenu.findIndex(t => t.label === 'Edit'), 1);
        this.taskMenu.push({ label: 'Cancel', icon: 'pi pi-times-circle', command: (event) => this.CancelChanges(data, 'task') });
      }
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


  async modelChanged(event) {
    event.editMode = true;
    event.edited = true;
    const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return event.AssignedTo && event.AssignedTo.ID === objt.UserNamePG.ID;
    });
    if (event.type !== 'milestone' && event.type !== 'submilestone') {
      this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(event);
      if (this.maxBudgetHrs < event.budgetHrs) {
        event.budgetHrs = 0;

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Budget hours is set to zero because given budget hours is greater than task time period.', false);
      }
    }
    await this.dailyAllocation.calcPrestackAllocation(resource, event);
  }

  // **************************************************************************************************
  //  To get User capacity
  //
  // ************************************************************************************************

  getUserCapacity(milestoneTask) {

    this.sharedObject.currentTaskData = milestoneTask;

    let resourceTask = this.sharedObject.currentTaskData;

    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserNamePG.ID === milestoneTask.AssignedTo.ID;
    });
    const ref = this.dialogService.open(UsercapacityComponent, {
      data: {
        task: resourceTask,
        startTime: resourceTask.pUserStart,
        endTime: resourceTask.pUserEnd,
        parentModule: 'allocation'
      },
      width: '90vw',
      header: resourceTask.submilestone ? resourceTask.milestone + ' ' + resourceTask.title
        + ' ( ' + resourceTask.submilestone + ' )' : resourceTask.milestone + ' ' + resourceTask.title,
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
    this.taskAllocateCommonService.ganttParseObject.data = [...this.GanttchartData];
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

      header: 'Task Allocation ',
      width: '100vw',
      height: '100vh',
      contentStyle: { "height": "90vh", "overflow": "auto" },
      closable: false,

    });

    ref.onClose.subscribe((restructureMilestones: any) => {

      this.loaderenable = true;
      let allReturnedTasks = [], tempSubmilestones = [];
      if (restructureMilestones) {
        let tempmilestoneData = [], milestonesList = [];
        restructureMilestones.nodes = this.reConfigureNodes(restructureMilestones);
        this.restructureGanttData(restructureMilestones, tempmilestoneData, milestonesList, allReturnedTasks);
        const updatedtempmilestoneData = this.updateMilestoneSubMilestonesDate(tempmilestoneData);
        const updatedTaskData = this.updateRestructureDates(updatedtempmilestoneData);
        this.milestoneData = [];
        this.milestoneData.push.apply(this.milestoneData, updatedTaskData);
        this.milestoneData = [...this.milestoneData];
        this.changeInRestructure = this.milestoneData.find(c => c.data.editMode === true) !== undefined ? true : false;
        if (this.changeInRestructure) {
          setTimeout(() => {
            this.commonService.showToastrMessage(this.constants.MessageType.warn, 'There are some unsaved changes, Please save them.', false);
          }, 300);
        }
        this.postProcessRestructureChanges(allReturnedTasks, milestonesList);
        this.loaderenable = false;
      }
      else {
        this.CancelChanges(tempSubmilestones, 'discardAll');
      }
    });
  }

  setTaskDates(milestoneTaskObj, updatedDate) {
    milestoneTaskObj.pUserStart = new Date(updatedDate);
    milestoneTaskObj.pUserStartDatePart = this.getDatePart(new Date(updatedDate));
    milestoneTaskObj.pUserStartTimePart = this.getTimePart(new Date(updatedDate));
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

      let milestone = mil.data.type == 'milestone' && mil.data.added == true ? mil.data : '';
      let subMilestone = mil.children ? mil.children.filter(e => e.data.type == 'submilestone' && e.data.added == true) : '';
      let CRtask = mil.data.itemType == 'Client Review' && mil.data.added == true ? mil.data : '';

      //new added milestone
      if (milestone) {
        let prevCRTask = milestoneData[milestoneData.findIndex(m => m.data == milestone) - 1] ? milestoneData[milestoneData.findIndex(m => m.data == milestone) - 1].data : '';
        prevCRTask ? new Date(prevCRTask.end_date) > new Date(defaultDate) ? this.setTaskDates(milestone, prevCRTask.end_date) : this.setTaskDates(milestone, new Date(defaultDate)) : this.setTaskDates(milestone, new Date(defaultDate));
      }

      //new added submilestone
      if (subMilestone) {
        subMilestone.forEach(sub => {
          let previousSubMilestones = mil.children[mil.children.findIndex(e => e == sub) - 1] ? mil.children[mil.children.findIndex(e => e.data == sub.data) - 1].data : '';
          let parentMilestone = milestoneData.find(m => m.data.title === sub.data.milestone);
          previousSubMilestones ? this.setTaskDates(sub.data, previousSubMilestones.end_date) : new Date(parentMilestone.data.end_date) > new Date(defaultDate) ? this.setTaskDates(sub.data, parentMilestone.data.end_date) : this.setTaskDates(sub.data, new Date(defaultDate));

        })
      }
      // new added milestone/submilestone task
      if (mil.children) {
        let tasks = mil.children.find(e => e.children) ? mil.children.filter(e => e.children.find(c => c.data.added)) : mil.children.filter(c => c.data.added == true);
        if (tasks) {
          tasks.forEach(t => {
            if (t.data.type == 'submilestone') {
              t.children.forEach(subTask => {
                if (subTask.data.added) {
                  let prevTask = t.children.find(e => e.data.title == subTask.data.previousTask);
                  let parentSubMilestone = mil.children.filter(e => e.data.title).find(c => c.data.title == subTask.data.submilestone).data
                  // let parentSubMilestone = milestoneData.find(m => m.children.filter(e=> e.data.title)).children.find(c=> c.data.title == subTask.data.submilestone).data;
                  prevTask ? this.setTaskDates(subTask.data, prevTask.data.end_date) : new Date(parentSubMilestone.end_date) > new Date(defaultDate) ? this.setTaskDates(subTask.data, parentSubMilestone.end_date) : this.setTaskDates(subTask.data, new Date(defaultDate));
                }
              })
            } else if (t.data.type == 'task') {
              let prevTask = mil.children.find(e => e.data.title == t.data.previousTask)
              let parentMilestone = milestoneData.find(m => m.data.title === t.data.milestone);
              prevTask ? this.setTaskDates(t.data, prevTask.data.end_date) : new Date(parentMilestone.data.end_date) > new Date(defaultDate) ? this.setTaskDates(t.data, parentMilestone.data.end_date) : this.setTaskDates(t.data, new Date(defaultDate));
            }
          });
        }
      }

      //new added CR task
      if (CRtask) {
        let parentMilestone = milestoneData.find(m => m.data.title === CRtask.milestone);
        this.setTaskDates(CRtask, parentMilestone.data.end_date);
      }
    })
    return milestoneData
  }

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
    const assignedTo = milestoneTask.AssignedTo;
    if (assignedTo) {
      this.updateNextPreviousTasks(milestoneTask);
      milestoneTask.assignedUserChanged = true;
      if (assignedTo.hasOwnProperty('ID') && assignedTo.ID) {
        milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(assignedTo.SkillText);
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
          return assignedTo.ID === objt.UserNamePG.ID;
        });
        await this.dailyAllocation.calcPrestackAllocation(resource, milestoneTask);
        milestoneTask.assignedUserTimeZone = resource && resource.length > 0
          ? resource[0].TimeZone.Title ?
            resource[0].TimeZone.Title : +5.5 : +5.5;

        this.changeUserTimeZone(milestoneTask, previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        this.setDatePartAndTimePart(milestoneTask);

        /// Change date as user changed in AssignedTo dropdown
      } else {
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        milestoneTask.assignedUserTimeZone = +5.5;
        this.changeUserTimeZone(milestoneTask, previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        this.setDatePartAndTimePart(milestoneTask);
        milestoneTask.skillLevel = milestoneTask.AssignedTo.SkillText;
        milestoneTask.user = milestoneTask.skillLevel;
      }
      milestoneTask.edited = true;
      milestoneTask.user = milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title : milestoneTask.user;
    }
  }

  changeNextTaskPrevTask(sNextPrev, subMilestone, currentTask, newName, sParam) {
    const sTasks = sNextPrev.split(';');
    sTasks.forEach(task => {
      const oTask = subMilestone.children.find(t => t.data.title === task);
      const sNextPrevTasks = oTask.data[sParam].split(';');
      const currentTaskIndex = sNextPrevTasks.indexOf(currentTask.title);
      sNextPrevTasks[currentTaskIndex] = newName;
      const prevNextTaskString = sNextPrevTasks.join(';');
      oTask.data[sParam] = prevNextTaskString;
    });
  }

  /**
   * Update next previous task of submit/galley(Slot type as Both) slot based on skill/user
   * @param milestoneTask - task whose assigned user changed
   */
  async updateNextPreviousTasks(milestoneTask) {
    const currentTask = milestoneTask;
    const milestone = this.milestoneData.find(m => m.data.title === milestoneTask.milestone);

    let subMilestone: TreeNode;
    subMilestone = currentTask.submilestone ? milestone.children.find(t => t.data.title === currentTask.submilestone) : milestone;
    let newName = '';
    if (milestoneTask.slotType === 'Both') {
      if (milestoneTask.AssignedTo.ID) {
        milestoneTask.ActiveCA = 'No';
        milestoneTask.itemType = milestoneTask.itemType.replace(/Slot/g, '');
        if (milestoneTask.IsCentrallyAllocated === 'Yes') {
          newName = milestoneTask.itemType;
          newName = this.getNewTaskName(milestoneTask, newName);
          milestoneTask.IsCentrallyAllocated = 'No';
        } else {
          newName = milestoneTask.title;
        }
      } else if (!milestoneTask.AssignedTo.ID) {
        milestoneTask.IsCentrallyAllocated = 'Yes';
        milestoneTask.ActiveCA = this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'Yes' : milestoneTask.ActiveCA;
        milestoneTask.itemType = milestoneTask.itemType + 'Slot';
        newName = milestoneTask.itemType;
        newName = this.getNewTaskName(milestoneTask, newName);
      }
      milestoneTask.title = milestoneTask.title = newName;

      if (milestoneTask.nextTask) {
        this.changeNextTaskPrevTask(milestoneTask.nextTask, subMilestone, currentTask, newName, 'previousTask');
      }
      if (milestoneTask.previousTask) {
        this.changeNextTaskPrevTask(milestoneTask.nextTask, subMilestone, currentTask, newName, 'nextTask');
      }

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
    tasks = this.allRestructureTasks.filter(e => e.title === originalName && e.milestone === milestoneTask.milestone);
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
      return node.AssignedTo && node.AssignedTo.ID === objt.UserNamePG.ID;
    });
    let time: any = this.commonService.getHrsAndMins(node.pUserStart, node.pUserEnd)
    let bhrs = this.commonService.convertToHrsMins('' + node.budgetHours).replace('.', ':')

    this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(node);
    let hrs = parseInt(bhrs.split(':')[0]);
    let min = parseInt(bhrs.split(':')[1]);

    let bHrsTime: any = new Date();
    bHrsTime = bHrsTime.setHours(hrs, min, 0, 0);

    if (bHrsTime > time.maxTime) {
      node.budgetHours = 0;

      this.commonService.showToastrMessage(this.constants.MessageType.error, 'Budget hours is set to zero because given budget hours is greater than task time period.', false);
    }
    this.changeDateOfEditedTask(node, type);
    await this.dailyAllocation.calcPrestackAllocation(resource, node);
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
      selectedMil = this.milestoneData.findIndex(e => e.data.title === previousNode.milestone);
      if (previousNode.submilestone) {
        const milestone = this.milestoneData[selectedMil];
        const subMil = milestone.children.find(e => e.data.title === previousNode.submilestone);
        subMilestonePosition = parseInt(subMil.data.position, 10);
      }
    }

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
      const allMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(currMil, true, this.milestoneData, false);
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
          const allMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(currMil, true, this.milestoneData, false);
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
            sentPrevNode = this.setMilestoneStartEnd(nextNode, selectedMil);
          }
        }
      }
      else {
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
        const allTasks = this.taskAllocateCommonService.getTasksFromMilestones(nextNode, false, this.milestoneData, false);
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
    nodeData.edited = true;
    this.changeDateProperties(nodeData);
    const resource = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return node.AssignedTo && node.AssignedTo.ID === objt.UserNamePG.ID;
    });
    await this.dailyAllocation.calcPrestackAllocation(resource, nodeData);
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
    } else if (node.data.status !== 'Completed') {
      this.getSortedDates(node);
      node.data.pUserStart = node.data.start_date;
      node.data.pUserEnd = node.data.end_date;
      this.setDatePartAndTimePart(node.data);

      const getNodes = this.taskAllocateCommonService.getTasksFromMilestones(node, false, this.milestoneData);
      const bEditedNode = getNodes.find(e => e.edited === true);
      if (bEditedNode) {
        node.data.edited = true;
      }
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
      this.getDefaultEndDate(node) : node.pUserStart) : node.itemType == 'Send to client' ? node.pUserStart : node.pUserEnd;
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
        return node.AssignedTo.ID === objt.UserNamePG.ID;
      });
      node.pUserStart = new Date(node.pUserStart.getFullYear(), node.pUserStart.getMonth(), node.pUserStart.getDate(), 9, 0);
      node.pUserEnd = new Date(node.pUserEnd.getFullYear(), node.pUserEnd.getMonth(), node.pUserEnd.getDate(), 19, 0);

      this.changeDateProperties(node);
      await this.dailyAllocation.calcPrestackAllocation(resource, node);
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

  addToReAllocateEmail(mailTableObj, newData, oldData, assignedTo) {
    const dataObj = Object.assign({}, mailTableObj);
    dataObj.taskName = newData.data.title;
    dataObj.preStDate = this.datepipe.transform(oldData.data.start_date, 'MMM dd yyyy hh:mm:ss a');
    dataObj.preEndDate = this.datepipe.transform(oldData.data.end_date, 'MMM dd yyyy hh:mm:ss a');
    dataObj.newStDate = this.datepipe.transform(newData.data.start_date, 'MMM dd yyyy hh:mm:ss a');
    dataObj.newEndDate = this.datepipe.transform(newData.data.end_date, 'MMM dd yyyy hh:mm:ss a');
    dataObj.assginedTo = assignedTo;
    this.reallocationMailData.push(dataObj);
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
        const resource = oResources.filter(r => r.UserNamePG.ID === assignedUserId);
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
            return ((task.data.pUserStart <= tsk.DueDateDT && task.data.pUserEnd >= tsk.DueDateDT)
              || (task.data.pUserStart <= tsk.StartDate && task.data.pUserEnd >= tsk.StartDate)
              || (task.data.pUserStart >= tsk.StartDate && task.data.pUserEnd <= tsk.DueDateDT));
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

    // If slot needs to be deallocated then form table with new and old values for table
    // this.deallocationMailArray is used to store all values of table to trigger single mail for slot which is used in savetask function
    if (!deallocateSlot) {
      slot.data.slotColor = "#6EDC6C";
      slot.data.CentralAllocationDone = 'Yes';
      this.reallocationMailData.length = 0;

      const mailTableObj = {
        taskName: '', preStDate: '', preEndDate: '', newStDate: '', newEndDate: '', assginedTo: ''
      }
      for (let task of slotTasks) {
        task.data.AssignedTo.ID = task.data.AssignedTo.ID !== -1 ? task.data.AssignedTo.ID : task.data.previousAssignedUser;
        task.data.previousAssignedUser = -1;
        task.data.assignedUserTimeZone = task.data.assignedUserTimeZone ? task.data.assignedUserTimeZone : task.data.previousTimeZone;
        task.data.CentralAllocationDone = 'Yes';
      }
      this.addToReAllocateEmail(mailTableObj, slot, oldSlot, '');
      const oldSubTasks = oldSlot.children;

      slot.children.forEach((task, index) => {
        this.addToReAllocateEmail(mailTableObj, task, oldSubTasks, task.data.AssignedTo.Title);
      });
      setTimeout(() => {
        const table = this.reallocateTable.nativeElement.innerHTML;
        this.reallocationMailArray.push({
          project: this.oProjectDetails,
          slot,
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
        slot,
        subject: slot.data.title + ' deallocated',
        template: 'CentralTaskCreation'
      });
    }
  }

  showConflictAllocations(task, conflictDetail, node) {
    let header = task ? '-' + task.itemType.submilestone ? task.milestone + ' ( ' + task.title + ' )'
      : '-' + task.title : '';
    header = 'Conflicting Allocations - ' + this.oProjectDetails.projectCode + header;
    const ref = this.dialogService.open(ConflictAllocationsComponent, {
      data: {
        conflictDetail,
        node,
        originalData: this.milestoneData,
        project: this.oProjectDetails.projectCode
      },
      header,
      width: '95vw',
      height: '80vh',
      contentStyle: { "height": "80vh", "overflow": "auto" },
      closable: false,
    });

    ref.onClose.subscribe(async (detail: any) => {
      if (detail.action.toLowerCase() === 'save') {
        if (task) {
          const Title = task.itemType === 'submilestone' && task.milestone ? task.milestone + ' - ' + task.title : task.title;
          const msg = 'Are you sure that you want to Confirm \'' + Title + '\' milestone ?';
          const conflictMessage = detail.conflictResolved ? '' + msg : 'Conflict unresolved. ' + msg;
          this.setAsNextMilestoneCall(task, conflictMessage);
        } else {
          this.loaderenable = true;
          await this.generateSaveTasks();
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
      const isValid = this.validate();
      if (isValid) {
        this.graphFlag = this.visualgraph;
        this.loaderenable = true;
        this.visualgraph = false;
        this.sharedObject.resSectionShow = false;
        const currentMilestoneEdited = this.milestoneData.find(m => m.data.type === 'milestone' && m.data.isCurrent && m.data.edited);
        // tslint:disable-next-line: max-line-length
        const conflictDetails: IConflictResource[] = currentMilestoneEdited ? await this.conflictAllocation.checkConflictsAllocations(null, this.milestoneData) : [];
        if (conflictDetails.length) {
          this.disableSave = false;
          this.loaderenable = false;
          this.visualgraph = this.graphFlag !== undefined ? this.graphFlag : true;
          this.GanttChartView = true;
          this.showConflictAllocations(null, conflictDetails, currentMilestoneEdited);
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
      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please Add Task.', false);
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

  async setMilestone(addTaskItems, updateTaskItems, addMilestoneItems, updateMilestoneItems, currentMilestoneTaskUpdated, listOfMilestones) {
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
      this.commonService.setBatchObject(batchUrl, mil.url, mil.body, this.constants.Method.POST, this.constants.listNames.Schedules.name);
    }

    for (const tasks of addTasks) {
      this.commonService.setBatchObject(batchUrl, tasks.url, tasks.body, this.constants.Method.POST, this.constants.listNames.Schedules.name);
    }

    for (const mil of addMilestoneItems) {
      const folderUrl = projectFolder + '/Drafts/Internal/' + mil.title;
      this.commonService.setBatchObject(batchUrl, this.spServices.getFolderCreationURL(),
        this.spServices.getFolderCreationData(folderUrl), this.constants.Method.POST,
        'Milestone Folder Creation'
      )
    }
    for (const mil of updateMilestones) {
      this.commonService.setBatchObject(batchUrl, mil.url, mil.body, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);
    }
    for (const tasks of updateTasks) {
      this.commonService.setBatchObject(batchUrl, tasks.url, tasks.body, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);
    }


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

    const restructureMilstoneStr = listOfMilestones.length > 0 ? listOfMilestones.join(';#') : '';
    const mile = updateMilestoneItems.find(c => c.title === this.oProjectDetails.currentMilestone); //.split(' (')[0]
    const task = addTaskItems.filter(c => c.milestone === this.oProjectDetails.currentMilestone);

    updatedCurrentMilestone = mile && task && task.length ? true : false;
    let projectStatus = this.sharedObject.oTaskAllocation.oProjectDetails.status;
    let previousProjectStatus = this.sharedObject.oTaskAllocation.oProjectDetails.prevstatus;

    if ((updatedCurrentMilestone || currentMilestoneTaskUpdated) && this.sharedObject.oTaskAllocation.oProjectDetails.status === this.constants.STATUS.AUTHOR_REVIEW) {

      this.commonService.confirmMessageDialog('Confirmation', "Do you want to keep project in 'Author Review' or 'In Progress' ?", null, [this.constants.STATUS.AUTHOR_REVIEW, this.constants.STATUS.IN_PROGRESS], false).then(async projectstatus => {
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

  }
  // **************************************************************************************************
  // Split because of confirmation message popup
  // this function is continou part of setMilestone
  // **************************************************************************************************
  async continueSetMilestone(restructureMilstoneStr, updatedResources, batchUrl, addMilestones, addTasks, projectStatus, previousProjectStatus) {
    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'SaveTasksMilestones');
    const responseInLines = await this.executeBulkRequests(restructureMilstoneStr,
      updatedResources, batchUrl, projectStatus, previousProjectStatus);

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
      DueDateDT: milestoneTask.end_date,
      ExpectedTime: '' + milestoneTask.budgetHours,
      TATStatus: milestoneTask.tat === true || milestoneTask.tat === 'Yes' ? 'Yes' : 'No',
      TATBusinessDays: milestoneTask.tatVal,
      AssignedToId: milestoneTask.AssignedTo ? milestoneTask.AssignedTo.hasOwnProperty('ID') ? milestoneTask.AssignedTo.ID : -1 : -1,
      TimeZoneNM: +milestoneTask.assignedUserTimeZone,
      Status: milestoneTask.status,
      NextTasks: this.setPreviousAndNext(milestoneTask.nextTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      PrevTasks: this.setPreviousAndNext(milestoneTask.previousTask, milestoneTask.milestone, this.oProjectDetails.projectCode),
      SkillLevel: milestoneTask.skillLevel,
      IsCentrallyAllocated: milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID ? 'No' : milestoneTask.IsCentrallyAllocated,
      CentralAllocationDone: milestoneTask.CentralAllocationDone,
      ActiveCA: milestoneTask.ActiveCA,
      DisableCascade: milestoneTask.DisableCascade === true ? 'Yes' : 'No',
      AllocationPerDay: milestoneTask.allocationPerDay ? milestoneTask.allocationPerDay : '',
      ContentTypeCH: milestoneTask.IsCentrallyAllocated === 'Yes' ? this.constants.CONTENT_TYPE.SLOT : this.constants.CONTENT_TYPE.TASK
    };
  }

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
      const slotTaskName = milestoneTask.itemType + taskCount;
      addUpdateTask = await this.addUpdateTaskObject(milestoneTask);
      addUpdateTask = Object.assign(addUpdateTask, await this.addTaskObject(milestoneTask, slotTaskName));

      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
    } else {
      addUpdateTask = await this.addUpdateTaskObject(milestoneTask);
      addUpdateTask = Object.assign(addUpdateTask, await this.updateTaskObject(milestoneTask));
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneTask.id);
    }

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
      Title: currentMilestone.title,
      ContentTypeCH: this.constants.CONTENT_TYPE.MILESTONE,
    }
  }
  addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate) {
    return {
      __metadata: { type: this.constants.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: milestoneStartDate,
      Actual_x0020_End_x0020_Date: milestoneEndDate,
      StartDate: milestoneStartDate,
      DueDateDT: milestoneEndDate,
      ExpectedTime: '' + currentMilestone.budgetHours,
      Status: currentMilestone.status === 'Not Saved' ?
        currentMilestone.isCurrent ? 'Not Started' : 'Not Confirmed' :
        currentMilestone.status,
      TATBusinessDays: currentMilestone.tatBusinessDays,
      SubMilestones: currentMilestone.submilestone,
    };
  }

  setMilestoneForAddUpdate(sentMilestone, bAdd) {
    let currentMilestone = sentMilestone;
    let url = '';
    let data;
    const milestoneStartDate = new Date(currentMilestone.start_date);
    const milestoneEndDate = new Date(currentMilestone.end_date);
    currentMilestone.tatBusinessDays = this.commonService.calcBusinessDays(milestoneStartDate, milestoneEndDate);

    if (currentMilestone.status !== 'Deleted') {
      const getCurrentMilestone = this.milestoneData.find(e => e.data.id === currentMilestone.id);
      currentMilestone.submilestone = this.getSubMilestoneStatus(getCurrentMilestone, '');//.join(';#');
    }
    if (bAdd) {
      data = this.addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate);
      data = Object.assign(data, this.addMilestoneObject(currentMilestone));
      url = this.spServices.getReadURL(this.constants.listNames.Schedules.name);
    } else {
      data = this.addUpdateMilestoneObject(currentMilestone, milestoneStartDate, milestoneEndDate);
      url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +currentMilestone.id);
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
      PrevStatus: previosProjectStatus
    };
    // const updatePrjObj = Object.assign({}, this.queryConfig);
    // updatePrjObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID);
    // updatePrjObj.listName = this.constants.listNames.ProjectInformation.name;
    // updatePrjObj.type = 'PATCH';
    // updatePrjObj.data = updateProjectRes;
    // batchUrl.push(updatePrjObj);

    this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID),
      updateProjectRes, this.constants.Method.PATCH, this.constants.listNames.ProjectInformation.name);


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
        const userEmail = user.UserNamePG ? user.UserNamePG.EMail : user.EMail ? user.EMail : user.Email;
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
    let mailContent = templateData.length > 0 ? templateData[0].ContentMT : [];
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
    let mailContent = templateData.length > 0 ? templateData[0].ContentMT : [];
    mailContent = this.replaceContent(mailContent, "@@Val1@@", slot.data.taskFullName);
    mailContent = this.replaceContent(mailContent, "@@ValTable@@", data);

    return mailContent;
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }



  /***********************************************************************/
  ////// Save tasks section

  /**********************************************************************/

  getUpdatedStatus(element, allTasks) {
    const mil = allTasks.find(e => e.taskFullName === element.milestone);
    let status = '';
    if (element.submilestone) {
      const subMil = allTasks.find(e => e.milestone === element.milestone && e.taskFullName === element.submilestone);
      status = subMil.status === 'In Progress' ? 'Not Started' :
        (subMil.status === 'Not Saved' ? mil.isCurrent ? 'Not Started' : 'Not Confirmed' : element.status);
    } else {
      status = mil.status === 'In Progress' ? 'Not Started' : element.status;
    }

    return status;
  }

  updateCurrentItemID(objList, obj) {
    let deletedObj = objList.find(t => t.Title === obj.taskFullName && t.Status === 'Deleted');
    if (deletedObj) {
      obj.id = deletedObj.ID
      obj.added = false;
    }
  }
  addedUpdatedList(element, addedList, updatedList, bTask, currentMilTaskUpdated, allTasks) {
    if (element.added) {
      if (bTask) {
        const status = this.getUpdatedStatus(element, allTasks);
        element.status = status;
      }
      addedList.push(element);
    }
    else {
      if (bTask) {
        const isCurrent = element.milestone === this.sharedObject.oTaskAllocation.oProjectDetails.milestone ? true : false;
        if (isCurrent && element.itemType !== 'Client Review') {
          currentMilTaskUpdated = true;
        }
      }
      updatedList.push(element);
    }

    return currentMilTaskUpdated;
  }

  getMilTaskData(addedTasks, updatedTasks, addedMilestones, updatedMilestones, listOfMilestones,) {
    let currentMilTaskUpdated = false;
    let allTasks = this.getGanttTasksFromMilestones(this.milestoneData, true);
    const allTasksItem = allTasks.filter(e => e.type !== 'submilestone');
    allTasksItem.forEach(element => {
      if (element.type === 'milestone') {
        listOfMilestones.push(element.title); //.split(' (')[0]);
      }
      if (element.edited && element.status !== 'Completed' && element.status !== 'Auto Closed') {
        if (element.type === 'milestone') {
          this.updateCurrentItemID(this.deletedMilestones, element);
          currentMilTaskUpdated = this.addedUpdatedList(element, addedMilestones, updatedMilestones, false, currentMilTaskUpdated, allTasks);
        } else {
          this.updateCurrentItemID(this.allTasks, element);
          currentMilTaskUpdated = this.addedUpdatedList(element, addedTasks, updatedTasks, true, currentMilTaskUpdated, allTasks);
        }
      }
    });
    return currentMilTaskUpdated;
  }

  public generateSaveTasks() {
    const listOfMilestones = [], addedTasks = [], updatedTasks = [], addedMilestones = [], updatedMilestones = [];
    let currentMilestoneTaskUpdated = this.getMilTaskData(addedTasks, updatedTasks, addedMilestones, updatedMilestones, listOfMilestones);
    this.sharedObject.oTaskAllocation.oProjectDetails.allMilestones = listOfMilestones;
    this.getDeletedMilestoneTasks(updatedTasks, updatedMilestones);
    this.setMilestone(addedTasks, updatedTasks, addedMilestones, updatedMilestones, currentMilestoneTaskUpdated, listOfMilestones);

  }

  markTaskDeleted(element) {
    const task = element;
    task.nextTask = '';
    task.previousTask = '';
    task.status = 'Deleted';

    return task;
  }

  // tslint:enable
  getDeletedMilestoneTasks(updatedTasks, updatedMilestones) {

    let oldMilestoneData = this.getGanttTasksFromMilestones(this.milestoneDataCopy, true);
    oldMilestoneData = oldMilestoneData.filter(e => e.type !== 'submilestone' || (e.status !== 'Completed'
      && e.status !== 'Deleted'));
    const newMilestoneData = this.getGanttTasksFromMilestones(this.milestoneData, false);
    oldMilestoneData.forEach(element => {
      if (element.status !== 'Completed' && element.status !== 'Deleted') {
        const itemDeleted = newMilestoneData.find(e => e.id === element.id);
        if (!itemDeleted) {
          if (element.type === 'milestone') {
            element.status = 'Deleted';
            updatedMilestones.push(element);
          } else if (!element.parentSlot) {
            let task = this.markTaskDeleted(element);
            if (task.IsCentrallyAllocated === 'Yes') {
              task.IsCentrallyAllocated = 'No'
              task.ActiveCA = 'No'
              task.CentralAllocationDone = 'No'

              const subTasks = oldMilestoneData.filter(e => e.parentSlot === element.id);
              subTasks.forEach(subEle => {
                const subTask = this.markTaskDeleted(subEle);
                updatedTasks.push(subTask);
              });
            }
            updatedTasks.push(task);
          }
        } else if (element.type === 'milestone') {
          const milestoneReturn = this.milestoneData.find(dataEl => dataEl.data.id === element.id);
          const existMilReturn = this.milestoneDataCopy.find(dataEl => dataEl.data.id === element.id);

          const newSub = this.getSubMilestoneStatus(milestoneReturn, '');
          const existingSub = this.getSubMilestoneStatus(existMilReturn, '');

          if (newSub !== existingSub && !updatedMilestones.find(e => e.id === element.id)) {
            updatedMilestones.push(element);
          }
        }
      }
    });
  }

  validateTaskDates(allTasks) {
    let errorPresnet = false;
    const taskCount = allTasks.length;
    for (let i = 0; i < taskCount; i = i + 1) {
      const task = allTasks[i];
      if (task.nextTask && task.status !== 'Completed'
        && task.status !== 'Auto Closed' && task.status !== 'Deleted') {
        const nextTasks = task.nextTask.split(';');
        const allNextTasks = allTasks.filter(c => (nextTasks.indexOf(c.title) > -1));

        const conflictTask = allNextTasks.find(c => task.end_date > c.start_date && c.status !== 'Completed'
          && c.status !== 'Auto Closed' && c.status !== 'Deleted' && c.DisableCascade === false); //// Change allow start to disable cascade
        if (conflictTask) {

          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Start Date of ' + conflictTask.title + '  should be greater than end date of ' + task.title + ' in ' + task.milestone, false);
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
      return obj.data.title === newCurrentMilestoneText; //.split(' (')[0]
    });
    if (newCurrentMilestone.length > 0) {
      let currMilTasks = this.taskAllocateCommonService.getTasksFromMilestones(newCurrentMilestone[0], false, this.milestoneData, false);
      currMilTasks = currMilTasks.filter((objt) => {
        return objt.status !== 'Deleted' && objt.status !== 'Abandon';
      });
      if (subMile.itemType === 'submilestone') {
        currMilTasks = currMilTasks.filter((objt) => {
          return objt.parent === subMile.id;
        });
      } else {
        if (subMile.budgetHours === '' || +subMile.budgetHours <= 0) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Budget hours for the milestone cannot be less than or equal to 0', false);
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
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'All tasks should be assigned to either a resource or skill before setting the milestone / submilestone as current.', false);
        return false;
      }

      // tslint:disable
      const checkTaskAllocatedTime = currMilTasks.filter(e => (e.budgetHours === '' || +e.budgetHours === 0)
        && e.itemType !== 'Send to client' && e.itemType !== 'Client Review' && e.itemType !== 'Follow up' && e.status !== 'Completed' && !e.parentSlot);
      // tslint:enable
      if (checkTaskAllocatedTime.length > 0) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Allocated time for task cannot be equal or less than 0 for ' + checkTaskAllocatedTime[0].title, false);
        return false;
      }

      const compareDates = currMilTasks.filter(e => (e.end_date <= e.start_date && e.tat === false &&
        e.itemType !== 'Follow up' && e.status !== 'Completed' && e.itemType !== 'Send to client'));
      if (compareDates.length > 0) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'End date should be greater than start date of ' + compareDates[0].title, false);
        return false;
      }

      const errorPresnet = this.validateTaskDates(currMilTasks);
      if (errorPresnet) {
        return false;
      }
    }

    return validateNextMilestone;
  }


  ///// Kaushal to test
  async setAsNextMilestoneCall(task, msg) {

    this.commonService.confirmMessageDialog('Confirmation', msg, null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        this.selectedSubMilestone = task;
        const validateNextMilestone = this.validateNextMilestone(this.selectedSubMilestone);
        if (validateNextMilestone) {
          this.loaderenable = true;
          setTimeout(async () => { await this.setAsNextMilestone(this.selectedSubMilestone); }, 200);
        }
      }
    });
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
      return obj.data.title === newCurrentMilestoneText;
    });
    const batchUrl = [];
    // tslint:disable
    if (!submilePresentInCurrent) {
      // // tslint:enable
      const updateProjectBody = {
        __metadata: { type: this.constants.listNames.ProjectInformation.type },
        Milestone: newCurrentMilestoneText,
        Status: 'In Progress',
        PrevStatus: this.sharedObject.oTaskAllocation.oProjectDetails.status
      };
      // const taskObj = Object.assign({}, this.queryConfig);
      // taskObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID);
      // taskObj.data = updateProjectBody;
      // taskObj.listName = this.constants.listNames.ProjectInformation.name;
      // taskObj.type = 'PATCH';
      // batchUrl.push(taskObj);

      this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +projectID),
        updateProjectBody, this.constants.Method.PATCH, this.constants.listNames.ProjectInformation.name);
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
            prevMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(currentMilestone[0], true, this.milestoneData, false);
          } else {
            prevMilestoneTasks = this.taskAllocateCommonService.getTasksFromMilestones(element, true, this.milestoneData, false);
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
              __metadata: { type: this.constants.listNames.Schedules.type },
              Status: subMileStatus ? 'Deleted' : 'Completed'
            };
          }
          else {
            milestoneID = +element.id;
            updatePMilestoneBody = {
              __metadata: { type: this.constants.listNames.Schedules.type },
              Status: 'Completed',
              SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], 'Completed')
            };
          }
          // const milestoneObj = Object.assign({}, this.queryConfig);
          // milestoneObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneID);
          // milestoneObj.data = updatePMilestoneBody;
          // milestoneObj.listName = this.constants.listNames.Schedules.name;
          // milestoneObj.type = 'PATCH';
          // batchUrl.push(milestoneObj);

          this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.Schedules.name, +milestoneID),
            updatePMilestoneBody, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);
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
              ActiveCA: task.ActiveCA
            };
            // const taskUpdateObj = Object.assign({}, this.queryConfig);
            // taskUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.id);
            // taskUpdateObj.data = updateSchedulesBody;
            // taskUpdateObj.listName = this.constants.listNames.Schedules.name;
            // taskUpdateObj.type = 'PATCH';
            // batchUrl.push(taskUpdateObj);

            this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.id),
              updateSchedulesBody, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);
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
      setToTasks = this.taskAllocateCommonService.getTasksFromMilestones(subMilestone, true, this.milestoneData, false);
    } else {
      setToTasks = this.taskAllocateCommonService.getTasksFromMilestones(currentMilestone[0], true, this.milestoneData, false);
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
          __metadata: { type: this.constants.listNames.Schedules.type },
          Status: element.status,
          ActiveCA: element.ActiveCA
        };
        // const taskCAUpdateObj = Object.assign({}, this.queryConfig);
        // taskCAUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.id);
        // taskCAUpdateObj.data = updateSchedulesBody;
        // taskCAUpdateObj.listName = this.constants.listNames.Schedules.name;
        // taskCAUpdateObj.type = 'PATCH';
        // batchUrl.push(taskCAUpdateObj);

        this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.id),
          updateSchedulesBody, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);
      }
    }
    const cMilestoneEndpoint = '';
    let updateCMilestoneBody;
    let curMilestoneID = -1;
    if (submilePresentInCurrent) {
      curMilestoneID = +currentMilestone[0].data.id;
      updateCMilestoneBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(currentMilestone[0], '')//.join(';#')
      };
    } else {
      curMilestoneID = +newCurrentMilestone[0].data.id;
      updateCMilestoneBody = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Status: 'In Progress',
        SubMilestones: this.getSubMilestoneStatus(newCurrentMilestone[0], '')//.join(';#')
      };
    }
    // const taskCMUpdateObj = Object.assign({}, this.queryConfig);
    // taskCMUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +curMilestoneID);
    // taskCMUpdateObj.data = updateCMilestoneBody;
    // taskCMUpdateObj.listName = this.constants.listNames.Schedules.name;
    // taskCMUpdateObj.type = 'PATCH';
    // batchUrl.push(taskCMUpdateObj);
    this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.Schedules.name, +curMilestoneID),
      updateCMilestoneBody, this.constants.Method.PATCH, this.constants.listNames.Schedules.name);

    // const notificationObj = Object.assign({}, this.queryConfig);
    // // tslint:disable: max-line-length
    // notificationObj.url = this.spServices.getReadURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, this.taskAllocationService.taskallocationComponent.earlyTaskNotification);
    // notificationObj.url = notificationObj.url.replace(/{{projectCode}}/g, this.oProjectDetails.projectCode);
    // notificationObj.listName = this.constants.listNames.EarlyTaskCompleteNotifications.name;
    // notificationObj.type = 'GET';
    // batchUrl.push(notificationObj);
    let url = this.spServices.getReadURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, this.taskAllocationService.taskallocationComponent.earlyTaskNotification);
    url = url.replace(/{{projectCode}}/g, this.oProjectDetails.projectCode);
    this.commonService.setBatchObject(batchUrl, url, null, this.constants.Method.GET, this.constants.listNames.EarlyTaskCompleteNotifications.name);

    this.commonService.SetNewrelic('TaskAllocation', 'Timeline', 'SetAsNextMilestone');
    const response = await this.spServices.executeBatch(batchUrl);
    if (response.length) {
      const notificationBatchUrl = [];
      const notifications = response[0].retItems;
      notifications.forEach(element => {
        const updateNotificationBody = {
          __metadata: { type: this.constants.listNames.EarlyTaskCompleteNotifications.type },
          IsActiveCH: 'No',
        };
        // const notificationUpdateObj = Object.assign({}, this.queryConfig);
        // notificationUpdateObj.url = this.spServices.getItemURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, +element.ID);
        // notificationUpdateObj.data = updateNotificationBody;
        // notificationUpdateObj.listName = this.constants.listNames.EarlyTaskCompleteNotifications.name;
        // notificationUpdateObj.type = 'PATCH';
        // notificationBatchUrl.push(notificationUpdateObj);

        this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constants.listNames.EarlyTaskCompleteNotifications.name, +element.ID),
        updateNotificationBody, this.constants.Method.PATCH, this.constants.listNames.EarlyTaskCompleteNotifications.name);
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
      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Sum of milestone budget hours cannot be greater than project budget hours.', false);
      return false;
    }
    const tempMilestones = allMilestones.filter(e => e.status !== 'Completed');
    const checkMilestoneAllocatedTime = tempMilestones.filter(e => (e.budgetHours === '' || +e.budgetHours === 0) && e.status !== 'Not Confirmed');
    if (checkMilestoneAllocatedTime.length > 0 && checkMilestoneAllocatedTime[0].status !== 'Not Saved') {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Budget hours for ' + checkMilestoneAllocatedTime[0].pName + ' milestone cannot be less than or equal to 0', false);
      return false;
    }
    let previousNode;
    for (const milestone of milestonesData) {

      if (milestone.data.status !== 'Completed' && milestone.data.status !== 'Deleted') {
        let bSubMilPresent = false;
        const zeroItem = milestone.children && milestone.children.length ? milestone.children[0].data : milestone.data;
        const AllTasks = this.taskAllocateCommonService.getTasksFromMilestones(milestone, false, this.milestoneData, false);
        const milestoneTasks = AllTasks.filter(t => t.status !== 'Abandon' && t.status !== 'Completed' && t.status !== 'Not Confirmed' && t.itemType !== 'Adhoc');
        if (milestone.data.status === 'In Progress') {
          if (zeroItem.itemType === 'submilestone') {
            bSubMilPresent = true;
          }
          let checkTasks = [];
          if (bSubMilPresent) {
            milestone.children.forEach(element => {
              if (element.data.status === 'In Progress' && element.data.itemType === 'submilestone') {
                checkTasks = checkTasks.concat(this.taskAllocateCommonService.getTasksFromMilestones(element, false, this.milestoneData, false));
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

            this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Allocated time for task cannot be equal or less than 0 for '
              + milestone.data.pName + ' - ' + checkTaskAllocatedTime[0].pName, false);
            return false;
          }
          const compareDates = checkTasks.filter(e => (e.pUserEnd <= e.pUserStart && e.tat === false
            && e.itemType !== 'Follow up' && e.status !== 'Completed' && e.itemType !== 'Send to client'));
          if (compareDates.length > 0) {

            this.commonService.showToastrMessage(this.constants.MessageType.warn, 'End date should be greater than start date of ' + milestone.data.pName + ' - ' + compareDates[0].pName, false);
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

            this.commonService.showToastrMessage(this.constants.MessageType.warn, 'All tasks should be assigned to either a resource or skill for active milestone.', false);
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
          new Date(previousNode.end_date).getTime() > new Date(milestone.data.start_date).getTime()
        ) {
          let errormessage = previousNode.milestone + ' Client Review';
          if (previousNode.title !== 'Client Review') {
            errormessage = previousNode.title;
          }

          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Start Date of ' + milestone.data.pName + ' should be greater than end date of ' + errormessage, false);
          return false;
        }
        if (milestone.data.title === 'Client Review' && milestone.data.status !== 'Not Confirmed' && milestone.data.status !== 'Not Saved' &&
          new Date(milestone.data.start_date).getTime() >= new Date(milestone.data.end_date).getTime()) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'End date should be greater than start date of ' + milestone.data.milestone + ' - Client Review.', false);
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

  getDefaultDate() {
    return new Date(this.Today.getFullYear(), this.Today.getMonth(), this.Today.getDate(), 9, 0)
  }

  getTaskObjectByValue(task, className, milestone, nextTasks, previousTasks, submilestone, tempID) {
    const submilestoneLabel = submilestone ? submilestone.title : '';
    const defaultDate = this.getDefaultDate();
    let taskObj: IMilestoneTask = {
      pUserStart: new Date(defaultDate),
      pUserEnd: new Date(defaultDate),
      pUserStartDatePart: this.getDatePart(this.Today),
      pUserStartTimePart: this.getTimePart(new Date(defaultDate)),
      pUserEndDatePart: this.getDatePart(this.Today),
      pUserEndTimePart: this.getTimePart(new Date(defaultDate)),
      status: 'Not Saved',
      id: task.dbId === undefined || task.dbId === 0 ? tempID : task.dbId,
      text: task.label,
      title: task.label,
      start_date: new Date(defaultDate),
      end_date: new Date(defaultDate),
      user: '',
      open: 1,
      parent: task.taskType === 'Client Review' ? 0 : milestone.Id,
      res_id: '',
      budgetHours: '0',
      tat: false,
      tatVal: '0',
      milestoneStatus: className === 'gtaskred' ? 'Not Saved' : null,
      type: 'task',
      slotType: task.slotType ? task.slotType : '',
      editMode: true,
      scope: null,
      spentTime: '0:0',
      isCurrent: this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      assignedUsers: [{ Title: '', userType: '' }],
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
      assignedUserTimeZone: 5.5,
      DisableCascade: task.DisableCascade && task.DisableCascade === 'Yes' ? true : false,
      taskFullName: this.oProjectDetails.projectCode + ' ' + milestone.label + ' ' + task.label,
      allocationPerDay: task.allocationPerDay ? task.allocationPerDay : '',
      isNext: false,
      position: '',
      color: '',
      slotColor: '',
      parentSlot: 0,
      deallocateSlot: false,
      subMilestonePresent: false,
      showAllocationSplit: false,
      allocationColor: '',
      allocationTypeLoader: false,
      ganttOverlay: '',
      ganttMenu: ''
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
      status: 'Not Saved',
      id: milestone.dbId === undefined || milestone.dbId === 0 ? tempID : milestone.dbId,
      text: milestone.label,
      title: milestone.label,
      start_date: new Date(defaultDate),
      end_date: new Date(defaultDate),
      user: '',
      open: this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? 1 : 0,
      parent: 0,
      res_id: '',
      budgetHours: '0',
      tat: null,
      tatVal: '0',
      milestoneStatus: '',
      type: type,
      slotType: '',
      editMode: true,
      scope: null,
      spentTime: '0:0',
      milestone: mil ? mil.label : '',
      position: type === 'submilestone' ? TempSubmilePositionArray.find(c => c.name === milestone.label) !== undefined ? TempSubmilePositionArray.find(c => c.name === milestone.label).position : 1 : '',
      isCurrent: this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.label ? true : false,
      isNext: this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === milestone.label ? true : false,
      userCapacityEnable: false,
      edited: true,
      added: true,
      taskFullName: milestone.label,
      nextTask: '',
      previousTask: '',
      assignedUsers: [{ Title: '', userType: '' }],
      AssignedTo: {},
      color: '',
      slotColor: '',
      itemType: '',
      IsCentrallyAllocated: '',
      submilestone: '',
      skillLevel: '',
      CentralAllocationDone: false,
      ActiveCA: false,
      assignedUserTimeZone: 5.5,
      parentSlot: 0,
      DisableCascade: false,
      deallocateSlot: false,
      subMilestonePresent: false,
      allocationPerDay: '',
      showAllocationSplit: false,
      allocationColor: '',
      allocationTypeLoader: false,
      ganttOverlay: '',
      ganttMenu: ''
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
    milestoneTask.resources = this.sharedObject.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserNamePG.ID === milestoneTask.AssignedTo.ID;
    });
    let header = milestoneTask.submilestone ? milestoneTask.milestone + ' ' + milestoneTask.title
      + ' ( ' + milestoneTask.submilestone + ' )' : milestoneTask.milestone + ' ' + milestoneTask.title;
    header = header + ' - ' + milestoneTask.AssignedTo.Title;
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
      } as IDailyAllocationTask,
      width: '90vw',
      header,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      let task: any;
      if (milestoneTask.type === 'Milestone') {
        const milestoneData: MilestoneTreeNode = this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
        const milestoneTasks: any[] = this.taskAllocateCommonService.getTasksFromMilestones(milestoneData, true, this.milestoneData, false);
        milestoneData.data.edited = true;
        task = milestoneTasks.find(t => t.id === milestoneTask.id);
      } else {
        task = milestoneTask;
      }
      this.dailyAllocation.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Resource is over allocated', false);
      }
    });
  }

  showOverlayPanel(event, rowData, dailyAllocateOP, target?) {
    const allocationPerDay = rowData.allocationPerDay ? rowData.allocationPerDay : '';
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
    console.log(event);
    setTimeout(() => {
      let panel: any = document.querySelector(".dailyAllocationOverlayComp > div");
      let panelContainer: any = document.getElementById('s4-workspace');
      let topAdject = 0;
      if (panelContainer) {
        topAdject = panelContainer.scrollTop > 0 ? panelContainer.scrollTop - panel.clientHeight : 0;
        if (topAdject < 0) {
          topAdject = panelContainer.scrollTop;
        }
      }
      panel.style.top = event.pageY + topAdject + 'px';
      panel.style.left = event.pageX + 'px';
    }, 50);
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
