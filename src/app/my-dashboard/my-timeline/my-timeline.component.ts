import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import interactionPlugin from '@fullcalendar/interaction';
import { MenuItem, MessageService, DialogService, SelectItem, ConfirmationService } from 'primeng/api';
import { MenuModule, Button } from 'primeng/primeng';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { BlockTimeDialogComponent } from '../block-time-dialog/block-time-dialog.component';
import { DatePipe } from '@angular/common';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';

declare var Tooltip: any;

@Component({
  selector: 'app-my-timeline',
  templateUrl: './my-timeline.component.html',
  styleUrls: ['./my-timeline.component.css'],

})
export class MyTimelineComponent implements OnInit {
  @ViewChild('menuPopup', { static: true }) plusmenu: MenuModule;
  @ViewChild('calendar', { static: true }) fullCalendar: any;
  @ViewChild('feedbackPopup', { static: true }) feedbackPopupComponent: FeedbackPopupComponent
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
  constructor(private myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SharepointoperationService,
    public messageService: MessageService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
  ) { }

  ngAfterViewInit() {
    this.bindEvents();
  }
  ngOnInit() {

    this.CalendarLoader = true;
    this.myDashboardConstantsService.getEmailTemplate();
    this.taskTypes = [
      { name: 'All', value: 'All' },
      { name: 'Not Completed', value: 'Not Completed' },
      { name: 'Planned', value: 'Planned' },
      { name: 'Completed', value: 'Completed' },
      { name: 'Adhoc', value: 'Adhoc' },
    ]
    this.items = [
      { label: 'Leave', icon: 'fa fa-calendar-plus-o', command: (e) => this.loadBlockTimeDialog('Leave', undefined) },
      { label: 'Client Meeting / Training', icon: 'fa fa-handshake-o', command: (e) => this.loadBlockTimeDialog('Client Meeting / Training', undefined) },
      { label: 'Internal Meeting', icon: 'fa fa-users', command: (e) => this.loadBlockTimeDialog('Internal Meeting', undefined) },
      { label: 'Training', icon: 'fa fa-slideshare', command: (e) => this.loadBlockTimeDialog('Training', undefined) },
      { label: 'Admin', icon: 'fa fa-user', command: (e) => this.loadBlockTimeDialog('Admin', undefined) },
    ];
    let self = this;
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
        //weekday: 'long'
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
      eventMouseEnter: function (event, jsEvent, view) {
      
        event.el.Tooltip.show();
      },

      eventMouseLeave: function (event, jsEvent, view) {

        event.el.Tooltip.hide();
      },

      eventRender: function (info) {

        var tooltip = new Tooltip(info.el, {
          title: info.event.title,
          placement: 'top',
          trigger: 'hover',
          container: 'body'
        });

        info.el.Tooltip = tooltip;
      },

      eventClick: async function (eventInfo) {

        self.EnableEditDate = self.EnableEditDate === undefined ? await self.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 3) : self.EnableEditDate;
        if (eventInfo.event.backgroundColor !== '#D6CFC7') {
          self.modalloaderenable = true;
          self.step = 0;
          self.SelectedStatus = undefined;
          self.taskName = eventInfo.event.title.split(':')[0];
          self.task = self.allTasks.find(c => c.Id === parseInt(eventInfo.event.id));

          if (self.task.Task !== 'Adhoc') {
            self.taskdisplay = true;
            self.tasks = await self.myDashboardConstantsService.getNextPreviousTask(self.task);

          }
          else {

            if (new Date(self.datePipe.transform(self.EnableEditDate, 'MMM dd, yyyy')).getTime() <= new Date(self.datePipe.transform(self.task.StartDate, 'MMM dd, yyyy')).getTime()) {
              var Type = self.task.Comments === 'Client meeting / client training' ? 'Client Meeting / Training' : self.task.Comments === 'Internal meeting' ? 'Internal Meeting' : self.task.Comments === 'Internal training' ? 'Training' : 'Admin';
              self.loadBlockTimeDialog(Type, self.task)
            }
            else {
              self.taskdisplay = true;
            }
          }

          if (self.task.Status === "Not Started") {
            self.SelectedStatus = "Not Started";
            self.statusOptions = [
              { label: 'Not Started', value: 'Not Started' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
            ]
          }
          else if (self.task.Status === "In Progress") {
            self.SelectedStatus = "In Progress";
            self.statusOptions = [
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
            ]
          }
          self.task.AssignedTo = self.sharedObject.currentUser.title;

          self.task.TimeSpent = self.task.TimeSpent === null ? "00:00" : self.task.TimeSpent.replace('.', ':');
          var data = self.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === self.task.ProjectCode);

          if (data !== undefined) {
            self.task.ProjectName = data.WBJID !== null ? self.task.ProjectCode + '(' + data.WBJID + ')' : self.task.ProjectCode;
          }
          else {
            self.task.ProjectName = self.task.ProjectCode;
          }
        }
      },
      customButtons: {

        AddnewEvent: {
          click: function () {
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




  // *************************************************************************************************************************************
  // Get Events based on dates
  // *************************************************************************************************************************************



  async getEvents(firstLoad, startDate, endDate) {


    var filterDates = [];

    if (firstLoad) {
      debugger;
      startDate = new Date(new Date().setDate((new Date().getDate() - new Date().getDay()))),
        endDate = new Date(new Date().setDate((new Date().getDate() - new Date().getDay()) + 6));
    }

    filterDates = await this.getStartEndDates(startDate, endDate);
    const batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();



    //***********************************************************************************************
    // Get Tasks
    //**************************************************************************************************


    let MyTimeline = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTimeline);
    MyTimeline.filter = MyTimeline.filter.replace(/{{userId}}/gi, this.sharedObject.sharePointPageObject.userId.toString());
    MyTimeline.filter += this.selectedType.name === 'Completed' ? MyTimeline.filterCompleted : this.selectedType.name === 'Not Completed' ? MyTimeline.filterNotCompleted : this.selectedType.name === 'Planned' ? MyTimeline.filterPlanned : this.selectedType.name === 'Adhoc' ? MyTimeline.filterAdhoc : MyTimeline.filterAll;
    //  MyTimeline.filter.substring(0, MyTimeline.filter.lastIndexOf("and"));
    MyTimeline.filter += MyTimeline.filterDate.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
    const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', MyTimeline);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, myTaskUrl);

    //***********************************************************************************************
    // Get Leaves
    //**************************************************************************************************


    let MyLeaves = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.LeaveCalendar);
    MyLeaves.filter = MyLeaves.filter.replace(/{{currentUser}}/gi, this.sharedObject.sharePointPageObject.userId.toString()).replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);

    const myLeavesUrl = this.spServices.getReadURL('' + this.constants.listNames.LeaveCalendar.name + '', MyLeaves);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, myLeavesUrl);


    this.response = await this.spServices.getDataByApi(batchGuid, batchContents);
    this.allTasks = this.response[0] !== "" ? this.response[0] : [];

    this.allLeaves = this.response[1] !== "" ? this.response[1] : [];
    this.events = [];
    this.allTasks.forEach(element => {

      if (element.SubMilestones) {
        element.SubMilestones = element.SubMilestones === "Default" ? null : element.SubMilestones
      }

      const eventObj = {
        "title": element.Task === 'Adhoc' ? element.Entity + "-" + element.Comments + " : " + element.TimeSpent : element.SubMilestones ? element.ExpectedTime ? element.Title + ' - ' + element.SubMilestones + " : " + element.ExpectedTime : element.Title + ' - ' + element.SubMilestones : element.ExpectedTime ? element.Title + " : " + element.ExpectedTime : element.Title,
        "id": element.Id,
        "start": new Date(element.StartDate),
        "end": element.TATStatus === "Yes" && new Date(this.datePipe.transform(element.StartDate, "yyyy-MM-dd")).getTime() !== new Date(this.datePipe.transform(element.DueDate, "yyyy-MM-dd")).getTime() ? new Date(new Date(element.DueDate).setDate(new Date(element.DueDate).getDate() + 1)) : new Date(element.DueDate),
        "backgroundColor": element.Status === 'Not Confirmed' ? "#FFD34E" : element.Status === 'Not Started' ? "#5F6273" : element.Status === 'In Progress' ? "#6EDC6C" : element.Status === 'Auto Closed' ? "#8183CC" : element.Status === 'On Hold' ? "#FF3E56" : (element.Status === 'Completed' && element.Task === 'Adhoc') ? element.Comments === "Administrative Work" ?
          '#eb592d' : element.Comments === "Client meeting / client training" ? '#ff8566' : element.Comments === "Internal meeting" ? '#795C32' : '#445cad' : "#3498DB",
        allDay: element.TATStatus === "Yes" ? true : false

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
      }
      this.events.push(eventObj);

    });

    this.events = [...this.events];
    this.CalendarLoader = false;

    console.log(this.events);

  }


  // *************************************************************************************************************************************
  //  convert date into string 
  // *************************************************************************************************************************************

  async getStartEndDates(startDate, endDate) {
    var filterDates = [];
    var startmonth = startDate.getMonth() + 1;
    var endMonth = endDate.getMonth() + 1;
    filterDates.push(startDate.getFullYear() + "-" + (startmonth < 10 ? "0" + startmonth : startmonth) + "-" + (startDate.getDate() < 10 ? "0" + startDate.getDate() : startDate.getDate()) + "T00:00:01.000Z");
    filterDates.push(endDate.getFullYear() + "-" + (endMonth < 10 ? "0" + endMonth : endMonth) + "-" + (endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()) + "T23:59:00.000Z");

    return filterDates;
  }
  // *************************************************************************************************************************************
  //   to get event on button click 
  // *************************************************************************************************************************************

  bindEvents() {

    let prevButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-prev-button");
    let nextButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-next-button");
    let todayButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-today-button");
    let monthButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-dayGridMonth-button");
    let weekButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-timeGridWeek-button");
    let dayButton = this.fullCalendar.el.nativeElement.getElementsByClassName("fc-timeGridDay-button");
    nextButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    prevButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    monthButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    weekButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);


    });
    dayButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    todayButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
  }


  // *************************************************************************************************************************************
  //   to get event on title click 
  // *************************************************************************************************************************************


  async setStep(index: number) {

    this.step = index;
    if (this.step === 0) {
      this.modalloaderenable = true;
      this.batchContents = new Array();
      const batchGuid = this.spServices.generateUUID();

      let TaskDetails = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TaskDetails);
      TaskDetails.filter = TaskDetails.filter.replace(/{{taskId}}/gi, this.task.ID);

      const TaskDetailsUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', TaskDetails);
      this.spServices.getBatchBodyGet(this.batchContents, batchGuid, TaskDetailsUrl);
      this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

      this.task = this.response[0][0];
      this.task.AssignedTo = this.sharedObject.currentUser.title;
      this.task.TimeSpent = this.task.TimeSpent === null ? "00:00" : this.task.TimeSpent.replace('.', ':');
      var data = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === this.task.ProjectCode);

      if (data !== undefined) {
        this.task.ProjectName = data.WBJID !== null ? this.task.ProjectCode + '(' + data.WBJID + ')' : this.task.ProjectCode;
      }
      else {
        this.task.ProjectName = this.task.ProjectCode;
      }

      if (this.task.Status === "Not Started") {
        this.SelectedStatus = "Not Started";
        this.statusOptions = [
          { label: 'Not Started', value: 'Not Started' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
        ]
      }
      else if (this.task.Status === "In Progress") {
        this.SelectedStatus = "In Progress";
        this.statusOptions = [
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
        ]
      }
      this.modalloaderenable = false;

    }
  }


  cancel() {

    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);

  }



  // *************************************************************************************************************************************
  // Get Next Previous task from current task 
  // *************************************************************************************************************************************
  // async getNextPreviousTask(task) {

  //   var nextTaskFilter = '';
  //   var previousTaskFilter = '';
  //   if (task.NextTasks) {
  //     var nextTasks = task.NextTasks.split(";#");
  //     nextTasks.forEach(function (value, i) {
  //       nextTaskFilter += "(Title eq '" + value + "')";
  //       nextTaskFilter += i < nextTasks.length - 1 ? " or " : '';
  //     });
  //   }
  //   if (task.PrevTasks) {
  //     var previousTasks = task.PrevTasks.split(";#");
  //     previousTasks.forEach(function (value, i) {
  //       previousTaskFilter += "(Title eq '" + value + "')";
  //       previousTaskFilter += i < previousTasks.length - 1 ? " or " : '';
  //     });
  //   }

  //   var taskFilter = (nextTaskFilter !== '' && previousTaskFilter !== '') ? nextTaskFilter + " or " + previousTaskFilter : (nextTaskFilter === '' && previousTaskFilter !== '') ? previousTaskFilter : (nextTaskFilter !== '' && previousTaskFilter === '') ? nextTaskFilter : '';

  //   this.batchContents = new Array();
  //   const batchGuid = this.spServices.generateUUID();

  //   let previousNextTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.previousNextTask);
  //   previousNextTask.filter = taskFilter;

  //   const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules + '', previousNextTask);
  //   this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

  //   this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
  //   this.tasks = this.response[0] !== "" ? this.response[0] : [];


  //   if (task.NextTasks)
  //     this.tasks.filter(c => nextTasks.includes(c.Title)).map(c => c.TaskType = "Next Task");
  //   if (task.PrevTasks)
  //     this.tasks.filter(c => previousTasks.includes(c.Title)).map(c => c.TaskType = "Previous Task");

  //   this.modalloaderenable = false;
  // }
  // *************************************************************************************************************************************
  // Get  data on task type change (dropdown)
  // *************************************************************************************************************************************

  onTaskTypeChange() {
    this.CalendarLoader = true;
    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);
  }

  // *************************************************************************************************************************************
  //  dialog for time booking 
  // *************************************************************************************************************************************
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

          await this.spServices.create(this.constants.listNames.LeaveCalendar.name, blockTimeobj, '');
          this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Leave created successfully.' });
        }
        else {
          if (task === undefined) {
            const folderUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/Lists/Schedules/AdhocTasks";
            await this.spServices.createAndMove(this.constants.listNames.Schedules.name, blockTimeobj, folderUrl);

            this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Time Booking created successfully.' });
          }
          else {

            if (blockTimeobj.IsDeleted !== undefined) {

              this.MarkAsDelete();
            }
            else {

              await this.spServices.update(this.constants.listNames.Schedules.name, task.ID, blockTimeobj, "SP.Data.SchedulesListItem");

              this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Time Booking updated successfully.' });
            }

          }
        }

        this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);
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
    }

    await this.spServices.update(this.constants.listNames.Schedules.name, this.task.ID, data, "SP.Data.SchedulesListItem");

    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Adhoc  deleted successfully' });

    this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);


  }



  // *************************************************************************************************************************************
  // Update Task
  // *************************************************************************************************************************************

  async UpdateTask() {

    debugger;
    this.CalendarLoader = true;
    if (this.step !== 0) {
      this.batchContents = new Array();
      const batchGuid = this.spServices.generateUUID();

      let TaskDetails = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TaskDetails);
      TaskDetails.filter = TaskDetails.filter.replace(/{{taskId}}/gi, this.task.ID);

      const TaskDetailsUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', TaskDetails);
      this.spServices.getBatchBodyGet(this.batchContents, batchGuid, TaskDetailsUrl);
      this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

      this.task = this.response[0][0];
      this.task.AssignedTo = this.sharedObject.currentUser.title;
      this.task.TimeSpent = this.task.TimeSpent === null ? "00:00" : this.task.TimeSpent.replace('.', ':');
      var data = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === this.task.ProjectCode);

      if (data !== undefined) {
        this.task.ProjectName = data.WBJID !== null ? this.task.ProjectCode + '(' + data.WBJID + ')' : this.task.ProjectCode;
      }
      else {
        this.task.ProjectName = this.task.ProjectCode;
      }
    }


    var task = this.task;
    const earlierStaus = task.Status;
    task.Status = this.SelectedStatus;
    var stval = await this.myDashboardConstantsService.getPrevTaskStatus(task);

    if (stval === "Completed" || stval === "AllowCompletion" || stval === "Auto Closed") {

      if (task.Status === 'Completed' && !task.FinalDocSubmit) {
        this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: 'No Final Document Found' });
        task.Status = earlierStaus;
        this.CalendarLoader = false;

        return false;
      }
      else {
        this.CalendarLoader = false;
        this.confirmationService.confirm({
          message: 'Are you sure that you want to proceed?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            this.SelectedStatus = undefined;
            this.taskdisplay = false;
            this.CalendarLoader = true;
            var response = await this.myDashboardConstantsService.CompleteTask(task);

            if (response) {
              this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: response });

            }
            else {
              this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: task.Title + 'Task updated successfully.' });

              if (task.PrevTasks && task.PrevTasks.indexOf(';#') === -1 && task.Task.indexOf('Review-') > -1 && task.Status === 'Completed') {
                this.myDashboardConstantsService.callQMSPopup(task, this.feedbackPopupComponent);
              }
            }
            this.getEvents(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start, this.fullCalendar.calendar.state.dateProfile.currentRange.end);
          },
          reject: () => {
            task.Status = earlierStaus;
          }
        });
      }


    }
    else {
      this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: 'Previous task should be completed.' });
      task.Status = earlierStaus;
      this.CalendarLoader = false;
    }
  };
}

