import { Component, OnInit, ViewChild, Input, ViewEncapsulation, ApplicationRef, NgZone } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import interactionPlugin from '@fullcalendar/interaction';
import { MenuItem, DialogService, SelectItem } from 'primeng';
import { MenuModule, Button } from 'primeng';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { BlockTimeDialogComponent } from '../block-time-dialog/block-time-dialog.component';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { FeedbackPopupComponent } from '../../qms/qms/reviewer-detail-view/feedback-popup/feedback-popup.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { AllocationOverlayComponent } from 'src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component';

declare var Tooltip: any;

@Component({
  selector: 'app-my-timeline',
  templateUrl: './my-timeline.component.html',
  styleUrls: ['./my-timeline.component.css'],
  providers: [AllocationOverlayComponent]
})
export class MyTimelineComponent implements OnInit {
  @ViewChild('menuPopup', { static: false }) plusmenu: MenuModule;
  @ViewChild('calendar', { static: false }) fullCalendar: any;
  @ViewChild('feedbackPopup', { static: false }) feedbackPopupComponent: FeedbackPopupComponent;
  response: any[];
  display: boolean;
  tasks: any;
  events = [];
  task: any;
  taskName: string;
  options: any;
  public allTasks = [];
  curr = new Date;
  firstLoad: boolean = true;
  batchContents = new Array();
  taskdisplay: boolean = false;
  step = 0;

  items: MenuItem[];
  statusOptions: SelectItem[];
  modalloaderenable: boolean = true;
  selectedType = { name: "All", value: "All" };
  // selectedType = { name: "Not Completed", value: "Not Completed" };
  taskTypes: { name: string; value: string; }[];
  CalendarLoader: boolean = true;
  maxDate: Date;
  SelectedStatus: string;
  allLeaves: any;
  EnableEditDate: any;
  toolData: any;
  displayleave = false;
  leave: any;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  date1: Date;
  yearRangePastNext;
  // List of Subscribers
  private subscription: Subscription = new Subscription();

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
  allAdhoc: any;
  alldbTasks: any[];

  constructor(
    public myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    public dialogService: DialogService,
    private datePipe: DatePipe,
    public spOperations: SPOperationService,
    private commonService: CommonService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone,
    private dailyAllocateOP: AllocationOverlayComponent
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });

    this.subscription.add(this.myDashboardConstantsService.getTimelineTabValue().subscribe(data => {
      console.log('in subscription ', data);
      this.setCalendarView(data.isFirstLoad, data.gotoDate, data.startDate, data.endDate);
    }));

  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterViewInit() {
    this.bindEvents();
  }

  ngOnInit() {
    this.yearRangePastNext = ((new Date()).getFullYear() - 5) + ':' + ((new Date()).getFullYear() + 5);
    this.CalendarLoader = true;
    this.myDashboardConstantsService.getEmailTemplate();
    this.taskTypes = [
      { name: 'All', value: 'All' },
      { name: 'Not Completed', value: 'Not Completed' },
      { name: 'Planned', value: 'Planned' },
      { name: 'Completed', value: 'Completed' },
      { name: 'Adhoc', value: 'Adhoc' },
    ];
    this.items = [
      { label: 'Leave', icon: 'fa fa-calendar-plus-o', command: (e) => this.loadBlockTimeDialog('Leave', undefined) },
      {
        label: 'Client Meeting / Training', icon: 'fa fa-handshake-o',
        command: (e) => this.loadBlockTimeDialog('Client Meeting / Training', undefined)
      },
      { label: 'Internal Meeting', icon: 'fa fa-users', command: (e) => this.loadBlockTimeDialog('Internal Meeting', undefined) },
      { label: 'Training', icon: 'fa fa-slideshare', command: (e) => this.loadBlockTimeDialog('Training', undefined) },
      { label: 'Admin', icon: 'fa fa-user', command: (e) => this.loadBlockTimeDialog('Admin', undefined) },
    ];
    const self = this;
    this.options = {

      // listPlugin
      plugins: [dayGridPlugin, timeGridPlugin, bootstrapPlugin, interactionPlugin],
      defaultDate: new Date(),
      weekends: false,
      header: {
        left: ' prev title next',
        center: '',
        right: 'AddnewEvent today,dayGridMonth,timeGridWeek,timeGridDay,'

        // right: 'AddnewEvent NotCompletedButton,completedButton,PlannedButton today,dayGridMonth,timeGridWeek,timeGridDay,'
        // // listWeek
      },
      aspectRatio: 2.5,
      // contentHeight:550,
      // weekends: false,
      defaultView: 'timeGridWeek',
      titleFormat: { // will produce something like "Tuesday, September 18, 2018"
        month: 'short',
        year: 'numeric',
        day: 'numeric',
        // weekday: 'long'
      },
      // minTime: '07:00:00',
      // maxTime: '22:00:00',
      columnHeaderFormat: {
        weekday: 'short',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
      },
      buttonText: {
        today: 'current',
      },

      views: {
        dayGridMonth: {
          columnHeaderFormat: {
            weekday: 'long',

          },
        }
      },
      eventMouseEnter: (event, jsEvent, view) => {

        event.el.Tooltip.show();
      },

      eventMouseLeave: (event, jsEvent, view) => {

        event.el.Tooltip.hide();
      },

      eventRender: (info) => {

        const tooltip = new Tooltip(info.el, {
          title: info.event.title,
          placement: 'top',
          trigger: 'hover',
          container: 'body'
        });

        info.el.Tooltip = tooltip;
      },

      eventClick: async function (eventInfo) {

        self.EnableEditDate = self.EnableEditDate === undefined ?
          await self.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 3) : self.EnableEditDate;
        if (eventInfo.event.backgroundColor !== '#D6CFC7') {
          self.modalloaderenable = true;
          self.step = 0;
          self.SelectedStatus = undefined;
          self.taskName = eventInfo.event.title.split(':')[0];
          self.task = self.alldbTasks.find(c => c.Id === parseInt(eventInfo.event.id));
          self.tasks = [];
          if (self.task.Task !== 'Adhoc') {
            self.taskdisplay = true;
          } else {

            if (new Date(self.datePipe.transform(self.EnableEditDate, 'MMM dd, yyyy')).getTime() <= new Date(self.datePipe.transform(self.task.StartDate, 'MMM dd, yyyy')).getTime()) {
              const Type = self.task.CommentsMT === 'Client meeting / client training' ? 'Client Meeting / Training' : self.task.CommentsMT === 'Internal meeting' ? 'Internal Meeting' : self.task.CommentsMT === 'Internal training' ? 'Training' : 'Admin';
              self.loadBlockTimeDialog(Type, self.task);
            } else {
              self.taskdisplay = true;
            }
          }

          if (self.task.Status === 'Not Started') {
            self.SelectedStatus = 'Not Started';
            self.statusOptions = [
              { label: 'Not Started', value: 'Not Started' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
            ];
          } else if (self.task.Status === 'In Progress') {
            self.SelectedStatus = 'In Progress';
            self.statusOptions = [
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
            ];
          }

          self.task.AssignedTo = self.sharedObject.currentUser.title;

          self.task.TimeSpent = self.task.TimeSpent === null ? '00:00' : self.task.TimeSpent.replace('.', ':');
          const data = self.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === self.task.ProjectCode);

          if (data !== undefined) {
            self.task.ProjectName = data.WBJID !== null ? self.task.ProjectCode + '(' + data.WBJID + ')' : self.task.ProjectCode;
          } else {
            self.task.ProjectName = self.task.ProjectCode;
          }
        } else {
          self.leave = self.allLeaves.find(c => c.Id === parseInt(eventInfo.event.id));
          const actualStartDate = new Date(self.leave.EventDate);
          const allowedDate = self.commonService.CalculateminstartDateValue(new Date(), 3);
          if (actualStartDate.getFullYear() >= allowedDate.getFullYear() &&
            actualStartDate.getMonth() >= allowedDate.getMonth()) {
            self.displayleave = true;
          } else {
            self.commonService.showToastrMessage(self.constants.MessageType.warn, 'Unable to delete  leaves for ' + self.datePipe.transform(new Date(self.leave.EventDate), 'MMM d , yyyy'), false);
          }
        }
      },
      customButtons: {
        AddnewEvent: {
          click: () => {
            document.getElementById('hiddenButton').click();
          }
        }
      },

      buttonIcons: {

        AddnewEvent: 'plus',
      },
    };

    this.getEvents(this.firstLoad, null, null);
  }

  // Execute below function only when create task

  setCalendarView(firstLoad, gotoDate, startDate, endDate) {
    setTimeout(() => {
      // this.CalendarLoader = true;
      this.fullCalendar.calendar.gotoDate(gotoDate);
      this.getEvents(firstLoad, startDate, endDate);
    }, 1000);
  }


  // **********************************************************************************************
  // Get Events based on dates
  // **********************************************************************************************

  async getEvents(firstLoad, startDate, endDate) {


    let filterDates = [];

    if (firstLoad) {
      startDate = new Date(new Date().setDate((new Date().getDate() - new Date().getDay())));
      endDate = new Date(new Date().setDate((new Date().getDate() - new Date().getDay()) + 6));
    }

    filterDates = await this.getStartEndDates(startDate, endDate);
    const batchURL = [];

    //***********************************************************************************************
    // Get Tasks
    //**************************************************************************************************

    if (this.selectedType.name === 'All' || this.selectedType.name === 'Completed' || this.selectedType.name === 'Not Completed' || this.selectedType.name === 'Planned') {
      let MyTimelineObj = Object.assign({}, this.queryConfig);
      let MyTimelineUrl = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTimeline);
      MyTimelineUrl.filter = MyTimelineUrl.filter.replace(/{{userId}}/gi, this.sharedObject.currentUser.userId.toString());
      MyTimelineUrl.filter += this.selectedType.name === 'Completed' ? MyTimelineUrl.filterCompleted : this.selectedType.name === 'Not Completed' ?
        MyTimelineUrl.filterNotCompleted : this.selectedType.name === 'Planned' ? MyTimelineUrl.filterPlanned : MyTimelineUrl.filterAll;
      //  MyTimeline.filter.substring(0, MyTimeline.filter.lastIndexOf("and"));
      MyTimelineUrl.filter += MyTimelineUrl.filterDate.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
      MyTimelineObj.url = this.spServices.getReadURL(this.constants.listNames.Schedules.name, MyTimelineUrl);
      MyTimelineObj.listName = this.constants.listNames.Schedules.name;
      MyTimelineObj.type = 'GET';
      batchURL.push(MyTimelineObj);
    }
    // this.spServices.getBatchBodyGet(batchContents, batchGuid, myTaskUrl);

    //***********************************************************************************************
    // Get Leaves
    //**************************************************************************************************
    let MyLeaves = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.LeaveCalendar);

    MyLeaves.filter = MyLeaves.filter.replace(/{{currentUser}}/gi, this.sharedObject.currentUser.userId.toString()).replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1])
    const MyLeavesUrl = this.spServices.getReadURL(this.constants.listNames.LeaveCalendar.name, MyLeaves);
    this.commonService.setBatchObject(batchURL, MyLeavesUrl, null, this.constants.Method.GET, this.constants.listNames.LeaveCalendar.name);


    //***********************************************************************************************
    // Get Adhoc Tasks
    //**********************************************************************************************
    if (this.selectedType.name === 'All' || this.selectedType.name === 'Adhoc') {
      let MyAdhocTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.AdhocTasks);

      MyAdhocTask.filter = MyAdhocTask.filter.replace(/{{userId}}/gi, this.sharedObject.currentUser.userId.toString()).replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1])


      const MyAdhocTaskUrl = this.spServices.getReadURL(this.constants.listNames.AdhocTask.name, MyAdhocTask);
      this.commonService.setBatchObject(batchURL, MyAdhocTaskUrl, null, this.constants.Method.GET, this.constants.listNames.AdhocTask.name);

    }
    this.commonService.SetNewrelic('MyDashboard', 'my-timeline', 'GetTasksAndLeaves');
    this.response = await this.spServices.executeBatch(batchURL);

    // this.response = await this.spServices.getDataByApi(batchGuid, batchContents);
    this.allTasks = this.response.find(c => c.listName === "SchedulesCT") ? this.response.find(c => c.listName === "SchedulesCT").retItems : [];
    this.allLeaves = this.response.find(c => c.listName === "Leave Calendar") ? this.response.find(c => c.listName === "Leave Calendar").retItems : [];
    this.allAdhoc = this.response.find(c => c.listName === "AdhocTaskCT") ? this.response.find(c => c.listName === "AdhocTaskCT").retItems : [];
    this.events = [];

    this.alldbTasks = [...this.allTasks, ...this.allAdhoc];

    this.alldbTasks.forEach(element => {

      if (element.SubMilestones) {
        element.SubMilestones = element.SubMilestones === "Default" ? null : element.SubMilestones
      }

      const eventObj = {
        "title": element.Task === 'Adhoc' ? element.Entity + "-" + element.CommentsMT + " : " + element.TimeSpent : element.SubMilestones ? element.ExpectedTime ? element.Title + ' - ' + element.SubMilestones + " : " + element.ExpectedTime : element.Title + ' - ' + element.SubMilestones : element.ExpectedTime ? element.Title + " : " + element.ExpectedTime : element.Title,
        "id": element.Id,
        "start": new Date(element.StartDate),
        "end": element.TATStatus && element.TATStatus === "Yes" && new Date(this.datePipe.transform(element.StartDate, "yyyy-MM-dd")).getTime() !== new Date(this.datePipe.transform(element.DueDateDT, "yyyy-MM-dd")).getTime() ? new Date(new Date(element.DueDateDT).setDate(new Date(element.DueDateDT).getDate() + 1)) : new Date(element.DueDateDT),
        "backgroundColor": element.Status === 'Not Confirmed' ? "#FFD34E" : element.Status === 'Not Started' ? "#5F6273" : element.Status === 'In Progress' ? "#6EDC6C" : element.Status === 'Auto Closed' ? "#8183CC" : element.Status === 'On Hold' ? "#FF3E56" : (element.Status === 'Completed' && element.Task === 'Adhoc') ? element.CommentsMT === "Administrative Work" ?
          '#eb592d' : element.CommentsMT === "Client meeting / client training" ? '#ff8566' : element.CommentsMT === "Internal meeting" ? '#795C32' : '#445cad' : "#3498DB",
        allDay: element.TATStatus && element.TATStatus === "Yes" ? true : false

      }
      this.events.push(eventObj);
    });

    this.allLeaves.forEach(element => {
      const eventObj = {
        "title": element.Title,
        "id": element.Id,
        "start": new Date(element.EventDate),
        "end": new Date(this.datePipe.transform(element.EventDate, "yyyy-MM-dd")).getTime() !== new Date(this.datePipe.transform(element.EndDate, "yyyy-MM-dd")).getTime() ? new Date(new Date(element.EndDate).setDate(new Date(element.EndDate).getDate() + 1)) : new Date(element.EndDate),
        "backgroundColor": "#D6CFC7",
        allDay: true,
      };
      this.events.push(eventObj);

    });

    this.events = [...this.events];
    this.CalendarLoader = false;

  }


  // ********************************************************************************************
  //  convert date into string
  // ********************************************************************************************

  async getStartEndDates(startDate, endDate) {
    const filterDates = [];
    const startmonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;
    filterDates.push(startDate.getFullYear() + "-" + (startmonth < 10 ? "0" + startmonth : startmonth) + "-" + (startDate.getDate() < 10 ? "0" + startDate.getDate() : startDate.getDate()) + "T00:00:01.000Z");
    filterDates.push(endDate.getFullYear() + "-" + (endMonth < 10 ? "0" + endMonth : endMonth) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()) + "T23:59:00.000Z");

    return filterDates;
  }
  // *********************************************************************************************
  //   to get event on button click
  // *********************************************************************************************

  bindEvents() {

    const prevButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-prev-button');
    const nextButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-next-button');
    const todayButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-today-button');
    const monthButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-dayGridMonth-button');
    const weekButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-timeGridWeek-button');
    const dayButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-timeGridDay-button');
    nextButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    prevButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    monthButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    weekButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);


    });
    dayButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    todayButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
  }


  // *********************************************************************************************
  //   to get event on title click
  // *********************************************************************************************


  async setStep(index: number) {

    this.step = index;
    if (this.step === 0) {
      this.modalloaderenable = true;

      // let TaskDetails = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TaskDetails);
      // TaskDetails.filter = TaskDetails.filter.replace(/{{taskId}}/gi, this.task.ID);

      // this.response  = await this.spServices.readItems(this.constants.listNames.Schedules.name, TaskDetails);
      const mytasks = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTasks);
      mytasks.filter = 'ID eq ' + +this.task.ID;
      this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'getTaskById');
      this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, mytasks);
      // this.response = await this.spServices.readItem(this.constants.listNames.Schedules.name, +this.task.ID);
      this.task = this.response ? this.response[0] : {};
      //  this.task.AssignedTo = this.sharedObject.currentUser.title;
      this.task.allocationPerDay = this.task.AllocationPerDay;
      this.task.showAllocationSplit = this.task.AllocationPerDay ? true : false;
      this.task.TimeSpent = this.task.TimeSpent === null ? '00:00' : this.task.TimeSpent.replace('.', ':');
      const data = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === this.task.ProjectCode);

      let emailEnable = false;
      if (this.task.Status === 'Completed' || this.task.Status === 'Auto Closed') {
        emailEnable = await this.myDashboardConstantsService.checkEmailNotificationEnable(this.task);
      }

      if (this.task.Task !== 'Adhoc') {
        this.tasks = await this.myDashboardConstantsService.getNextPreviousTask(this.task);
        this.task.nextTasks = this.tasks ? this.tasks.filter(c => c.TaskType === 'Next Task') : [];
        this.task.prevTaskDetails = this.tasks ? this.tasks.filter(c => c.TaskType === 'Previous Task') : [];
      }

      this.task.emailNotificationEnable = emailEnable;

      if (data !== undefined) {
        this.task.ProjectName = data.WBJID !== null ? this.task.ProjectCode + '(' + data.WBJID + ')' : this.task.ProjectCode;
      } else {
        this.task.ProjectName = this.task.ProjectCode;
      }
      console.log('berfore format this.task ', this.task);
      if (this.task.Status === 'Not Started') {
        this.SelectedStatus = 'Not Started';
        this.task.StartDate = new Date(this.task.StartDate);
        this.task.DueDateDT = new Date(this.task.DueDateDT);
        console.log(this.task.StartDate);
        this.task['StartTime'] = this.datePipe.transform(this.task.StartDate, 'h:mm a');
        this.task['DueTime'] = this.datePipe.transform(this.task.DueDateDT, 'h:mm a');
        console.log('this.task ', this.task);
        this.statusOptions = [
          { label: 'Not Started', value: 'Not Started' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
        ];
      } else if (this.task.Status === 'In Progress') {
        this.SelectedStatus = 'In Progress';
        this.task.StartDate = new Date(this.task.StartDate);
        this.task.DueDateDT = new Date(this.task.DueDateDT);
        this.task['DueTime'] = this.datePipe.transform(this.task.DueDateDT, 'h:mm a');
        this.statusOptions = [
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
        ];
      } else {
        this.SelectedStatus = this.task.Status;
      }
      this.modalloaderenable = false;
    }
  }

  SetTime(time, type: string) {
    let endTime;
    const startTime = type === 'startTime' ? time.split(':')[0] % 12 + ':' + time.split(':')[1]
      : endTime = time.split(':')[0] % 12 + ':' + time.split(':')[1];
    console.log('Start time: ', startTime + ' endTime ', endTime);
  }

  cancel() {
    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
      this.fullCalendar.calendar.state.dateProfile.currentRange.end);
  }

  onTaskTypeChange() {
    this.CalendarLoader = true;
    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
      this.fullCalendar.calendar.state.dateProfile.currentRange.end);
  }

  // **********************************************************************************************
  //  dialog for time booking
  // **********************************************************************************************
  async loadBlockTimeDialog(event, task) {
    const ref = this.dialogService.open(BlockTimeDialogComponent, {
      data: {
        timeblockType: event,
        task: task,
        mode: task === undefined ? 'create' : 'edit'
      },
      header: event,
      width: '50vw',
      closable: false,
    });
    ref.onClose.subscribe(async (blockTimeobj: any) => {
      if (blockTimeobj) {

        this.CalendarLoader = true;
        if (event === 'Leave') {
          // update leaves table based on leaves
          const dbAvailableHours = await this.getAvailableHours(blockTimeobj, 'apply');

          const batchURL = [];
          const leaveurl = this.spServices.getReadURL(this.constants.listNames.LeaveCalendar.name, null);
          this.commonService.setBatchObject(batchURL, leaveurl, blockTimeobj, this.constants.Method.POST, this.constants.listNames.LeaveCalendar.name)

          dbAvailableHours.forEach(availableHours => {
            const availableHoursurl = this.spServices.getItemURL(this.constants.listNames.AvailableHours.name, availableHours.ID);
            this.commonService.setBatchObject(batchURL, availableHoursurl, availableHours, this.constants.Method.PATCH, this.constants.listNames.AvailableHours.name)
          });

          this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'TimeBookingUpdate');
          const arrResults = await this.spServices.executeBatch(batchURL);
          this.commonService.showToastrMessage(this.constants.MessageType.success, 'Leave created successfully.', false);
        } else {
          if (task === undefined) {
            this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'Create Adhoc item');
            await this.spServices.createItem(this.constants.listNames.AdhocTask.name, blockTimeobj, this.constants.listNames.AdhocTask.type);
            this.commonService.showToastrMessage(this.constants.MessageType.success, 'Time Booking created successfully.', false);

          } else {

            if (blockTimeobj.IsDeleted !== undefined) {
              this.MarkAsDelete();
            } else {
              this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'UpdateTask');
              await this.spServices.updateItem(this.constants.listNames.AdhocTask.name, task.ID, blockTimeobj,
                this.constants.listNames.AdhocTask.type);
              this.commonService.showToastrMessage(this.constants.MessageType.success, 'Time Booking updated successfully.', false);
            }
          }
        }
        this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
          this.fullCalendar.calendar.state.dateProfile.currentRange.end);
      }

    });
  }

  // *************************************************************************************************************************************
  // Mark Task As Deleted
  // *************************************************************************************************************************************
  async MarkAsDelete() {

    this.CalendarLoader = true;
    const data = {
      Status: 'Deleted'
    };
    this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'DeleteTask');
    await this.spServices.updateItem(this.constants.listNames.AdhocTask.name, this.task.ID, data, this.constants.listNames.AdhocTask.type);


    this.commonService.showToastrMessage(this.constants.MessageType.success, 'Adhoc  deleted successfully', false);
    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
      this.fullCalendar.calendar.state.dateProfile.currentRange.end);
  }

  onCloseStartDate() {
    if (this.task.StartDate > this.task.DueDateDT) {
      this.task.DueDateDT = this.task.StartDate;
    }
  }



  // *******************************************************************************************
  // Update Task
  // *******************************************************************************************

  async UpdateTask() {

    this.CalendarLoader = true;
    if (this.step !== 0) {
      this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'GetTask');
      this.response = await this.spServices.readItem(this.constants.listNames.Schedules.name, +this.task.ID);
      this.task = this.response;
      this.task.AssignedTo = this.sharedObject.currentUser.title;
      this.task.TimeSpent = this.task.TimeSpent ? "00:00" : this.task.TimeSpent.replace('.', ':');
      const data = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === this.task.ProjectCode);
      this.tasks = await this.myDashboardConstantsService.getNextPreviousTask(this.task);
      this.task.nextTasks = this.tasks ? this.tasks.filter(c => c.TaskType === 'Next Task') : [];
      this.task.prevTaskDetails = this.tasks ? this.tasks.filter(c => c.TaskType === 'Previous Task') : [];
      if (data !== undefined) {
        this.task.ProjectName = data.WBJID !== null ? this.task.ProjectCode + '(' + data.WBJID + ')' : this.task.ProjectCode;
      } else {
        this.task.ProjectName = this.task.ProjectCode;
      }
    }


    const task = this.task;
    const earlierStaus = task.Status;
    task.Status = this.SelectedStatus;
    const stval = await this.myDashboardConstantsService.getPrevTaskStatus(task);
    const allowedStatus = ["Completed", "Auto Closed"];
    if (allowedStatus.includes(stval) || stval === '') { 
      this.updateCurrentTask(this.task,earlierStaus);
    } else { 
      this.CalendarLoader = false;
      this.commonService.confirmMessageDialog('Confirmation', 'Previous task is not completed, do you still want to continue?', null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          this.CalendarLoader = true;
         this.updateCurrentTask(this.task,earlierStaus);
        } else {
          task.Status = earlierStaus;
          this.CalendarLoader = false;
        }
      });
    }
  }

  async updateCurrentTask(task,earlierStaus) {
    if (task.Status === 'Completed' && !task.FinalDocSubmit) {
      this.commonService.showToastrMessage(this.constants.MessageType.error, 'No Final Document Found', false);
      task.Status = earlierStaus;
      this.CalendarLoader = false;
      return false;
    } else {
      if (task.Status === "Completed") {
        this.CalendarLoader = false;
        this.commonService.confirmMessageDialog('Confirmation', 'Are you sure that you want to proceed?', null, ['Yes', 'No'], false).then(async Confirmation => {
          if (Confirmation === 'Yes') {
            task.parent = 'Dashboard';
            const qmsTasks = await this.myDashboardConstantsService.callQMSPopup(task);
            if (qmsTasks.length) {

              const ref = this.dialogService.open(FeedbackPopupComponent, {
                data: {
                  qmsTasks,
                  task
                },
                header: 'Rate Work',
                width: '70vw',
                contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
              });
              ref.onClose.subscribe((feedbacktask: any) => {
                if (feedbacktask) {
                  this.saveTask(feedbacktask);
                }
              });
            } else {
              this.saveTask(task);
            }
          } else {
            task.Status = earlierStaus;
          }
        });          
      } else if (task.Status === "In Progress") {
      const batchURL = [];
      if (this.task.StartTime) {
        const startTime = this.commonService.ConvertTimeformat(24, this.task.StartTime);
        this.task.StartDate = this.datePipe.transform(new Date(this.task.StartDate), 'yyyy-MM-dd' + 'T' + startTime + ':00.000');
      }
      if (this.task.DueTime) {
        const endTime = this.commonService.ConvertTimeformat(24, this.task.DueTime);
        this.task.DueDate = this.datePipe.transform(this.task.DueDateDT, 'yyyy-MM-dd' + 'T' + endTime + ':00.000');
      }

      const ProjectInformation = await this.myDashboardConstantsService.getCurrentTaskProjectInformation(task.ProjectCode);

      this.SelectedStatus = undefined;
      this.taskdisplay = false;
      this.CalendarLoader = true;
      const jsonData = {
        __metadata: { type: this.constants.listNames.Schedules.type },
        Actual_x0020_Start_x0020_Date: task.Actual_x0020_Start_x0020_Date !== null ? task.Actual_x0020_Start_x0020_Date : new Date(),
        Status: task.Status,
        StartDate: this.task.StartDate,
        DueDateDT: this.task.DueDate
      };
      this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'UpdateTask');
      const taskUpdateUrl = this.spServices.getItemURL(this.constants.listNames.Schedules.name, task.ID);
      this.commonService.setBatchObject(batchURL, taskUpdateUrl, jsonData, this.constants.Method.PATCH, this.constants.listNames.Schedules.name)

      const projectInfoUpdateurl = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, ProjectInformation.ID);


      this.commonService.setBatchObject(batchURL, projectInfoUpdateurl, { Status: this.constants.STATUS.IN_PROGRESS, __metadata: { type: this.constants.listNames.ProjectInformation.type } }, this.constants.Method.PATCH, this.constants.listNames.ProjectInformation.name)

      await this.spServices.executeBatch(batchURL);
      if (task.ParentSlot) {
        await this.myDashboardConstantsService.getCurrentAndParentTask(task, jsonData.Status);
      }
      this.commonService.showToastrMessage(this.constants.MessageType.success, ' task updated successfully.', false);
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);
    } 
    }
  }

  async saveTask(task) {
    this.SelectedStatus = undefined;
    this.taskdisplay = false;
    this.CalendarLoader = true;
    const response = await this.myDashboardConstantsService.CompleteTask(task);

    if (response) {
      this.commonService.showToastrMessage(this.constants.MessageType.error, response, false);
    } else {
      this.commonService.showToastrMessage(this.constants.MessageType.success, task.Title + ' task updated successfully.', false)
    }
    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);
  }
  // ***************************************************************************************************
  // Update leave hours based on leave days
  // ***************************************************************************************************


  async getAvailableHours(blockTimeobj, leaveType) {

    let dbRecords = [];
    const batchURL = [];


    const ResourceId = this.sharedObject.DashboardData.ResourceCategorization.find(c => c.UserNamePG.ID
      === this.sharedObject.currentUser.userId) ?
      this.sharedObject.DashboardData.ResourceCategorization.find(c => c.UserNamePG.ID ===
        this.sharedObject.currentUser.userId).ID : 0;

    const AvailableHoursQuery = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.AvailableHours);
    const AvailableHoursGeturl = this.spServices.getReadURL('' + this.constants.listNames.AvailableHours.name +
      '', AvailableHoursQuery);


    this.commonService.setBatchObject(batchURL, AvailableHoursGeturl.replace(/{{resourceId}}/gi,
      ResourceId).replace(/{{startDateString}}/gi,
        this.datePipe.transform(blockTimeobj.EventDate, 'yyyy-MM-dd')).replace(/{{endDateString}}/gi,
          this.datePipe.transform(blockTimeobj.EndDate, 'yyyy-MM-dd')), null, this.constants.Method.GET, this.constants.listNames.AvailableHours.name);


    const LeaveDates = [];
    const startDate = new Date(this.datePipe.transform(blockTimeobj.EventDate, 'yyyy-MM-dd' + 'T00:00:00Z'));
    let endDate = new Date(this.datePipe.transform(blockTimeobj.EndDate, 'yyyy-MM-dd' + 'T00:00:00Z'));
    while (startDate <= endDate) {
      LeaveDates.push(new Date(endDate));
      endDate = new Date(endDate.setDate(endDate.getDate() - 1));
    }

    this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'GetAvailableHoursByUserAndSDED');
    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {
        dbRecords = arrResults[0].retItems;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        arrResults[0].retItems.forEach(element => {
          const date = new Date(element.WeekStartDate);
          while (date <= new Date(element.WeekEndDate)) {

            const LeaveDatePresent = LeaveDates.find(c => c.getTime() === date.getTime()) ? true : false;
            if (LeaveDatePresent && date.getDay() !== 0 && date.getDay() !== 6) {

              if (leaveType === 'apply') {

                element[days[date.getDay()] + 'Leave'] = blockTimeobj.IsHalfDay ?
                  element[days[date.getDay()]] / 2 : element[days[date.getDay()]];
              } else {
                element[days[date.getDay()] + 'Leave'] = 0;
              }
            }
            date.setDate(date.getDate() + 1);
          }
        });
      }
    }
    return dbRecords;
  }

  async DeleteLeave(leave) {

    this.CalendarLoader = true;
    const dbAvailableHours = await this.getAvailableHours(leave, 'discard');

    const batchURL = [];
    leave.IsActive = 'No';
    const leaveUpdateurl = this.spServices.getItemURL(this.constants.listNames.LeaveCalendar.name, leave.ID);
    this.commonService.setBatchObject(batchURL, leaveUpdateurl, leave, this.constants.Method.PATCH, this.constants.listNames.LeaveCalendar.name)


    dbAvailableHours.forEach(availableHours => {
      const availableHoursUpdateurl = this.spServices.getItemURL(this.constants.listNames.AvailableHours.name, availableHours.ID);
      this.commonService.setBatchObject(batchURL, availableHoursUpdateurl, availableHours, this.constants.Method.PATCH, this.constants.listNames.AvailableHours.name)
    });

    this.commonService.SetNewrelic('MyDashboard', 'My-timeline', 'GetLeavesAndAvailableHours');
    await this.spServices.executeBatch(batchURL);

    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
      this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    this.commonService.showToastrMessage(this.constants.MessageType.success, 'Leaves deleted successfully.', false);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }





  // **************************************************************************************************
  //   This function is used to open or download project scope
  // **************************************************************************************************
  async goToProjectScope(task) {
    const ProjectInformation = await this.myDashboardConstantsService.getCurrentTaskProjectInformation(task.ProjectCode);
    const response = await this.commonService.goToProjectScope(ProjectInformation, ProjectInformation.Status);
    if (response === 'No Document Found.') {

      this.commonService.showToastrMessage(this.constants.MessageType.error, task.ProjectCode + ' - Project Scope not found.', false);
    }
    else {
      window.open(response);
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

