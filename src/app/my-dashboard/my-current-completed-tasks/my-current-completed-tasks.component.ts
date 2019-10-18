import { Component, OnInit, OnDestroy, ViewEncapsulation, TemplateRef, ViewChild, HostListener, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { SelectItem, MenuItem, DialogService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TimeSpentDialogComponent } from '../time-spent-dialog/time-spent-dialog.component';
import { AddEditCommentComponent } from '../add-edit-comment-dialog/add-edit-comment-dialog.component';
import { PreviosNextTasksDialogComponent } from '../previos-next-tasks-dialog/previos-next-tasks-dialog.component';
import { Table } from 'primeng/table';
import { FeedbackPopupComponent } from '../../qms/qms/reviewer-detail-view/feedback-popup/feedback-popup.component';
import { ViewUploadDocumentDialogComponent } from 'src/app/shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { DataTable } from 'primeng/primeng';

interface DateObj {
  label: string;
  value: string;
}

@Component({
  selector: 'app-my-current-completed-tasks',
  templateUrl: './my-current-completed-tasks.component.html',
  styleUrls: ['./my-current-completed-tasks.component.css'],
  providers: [DatePipe, MessageService, FeedbackPopupComponent],

})

export class MyCurrentCompletedTasksComponent implements OnInit, OnDestroy {

  selectedDueDate: DateObj;
  selectedStartDate: DateObj;
  thenBlock: Table;
  public loderenable = false;

  @ViewChild('feedbackPopup', { static: true }) feedbackPopupComponent: FeedbackPopupComponent;
  @ViewChild('taskId', { static: false }) taskId: Table;
  showCalender: boolean;
  selectedDate: any;
  rangeDates: Date[];
  cols: any[];
  taskMenu: MenuItem[];
  batchContents = new Array();
  public allTasks = [];
  response: any[];
  brands: SelectItem[];
  selectedStatus = 'Not Completed';
  loaderenable = true;
  display = false;
  tasks = [];
  modalloaderenable = true;
  selectedTask: string;
  selectedType: any;
  timeSpentObject = { taskDay: null, taskHrs: null, taskMins: null };
  editor: any;
  currentTaskTimeSpent: any;
  dateArray = [];
  selectedTab: any;
  days: any;
  selectedUrl: string;
  TabName: any;
  displayComment: boolean;
  DocumentArray: any[];
  allDocuments: any;
  projectInfo: any;
  NextPreviousTask: any;
  Emailtemplate: any;
  currentUser: any;
  AllTaskColArray: any = [];
  jcSubId: any;
  jcId: any;
  tableloaderenable: boolean;
  selectedindex: any;
  tempselectedDate: string;
  tempClick: any;

  // yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);
  constructor(
    private myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    private commonService: CommonService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    public spOperations: SPOperationService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'MainStatus', header: 'Status', visibility: true, exportable: true },
      { field: 'TaskStatus', header: 'Task Status', visibility: true, exportable: true },
      { field: 'TaskName', header: 'Task Name', visibility: true, exportable: true },
      { field: 'ExportStartDate', header: 'Start Date', visibility: false, exportable: true },
      { field: 'ExportDueDate', header: 'End Date', visibility: false, exportable: true },
      { field: 'StartDate', header: 'Start Date', visibility: true, exportable: false },
      { field: 'DueDate', header: 'Due Date', visibility: true, exportable: false },
      { field: 'ExpectedTime', header: 'Allocated Time', visibility: true, exportable: true },
      { field: 'TimeSpent', header: 'Time Spent', visibility: true, exportable: true },
    ];
    this.myDashboardConstantsService.getEmailTemplate();

  }


  openPopup(data) {
    if (this.TabName === 'MyCompletedTask') {
      this.taskMenu = [
        { label: 'View / Upload Documents', icon: 'pi pi-fw pi-upload', command: (e) => this.getAddUpdateDocument(data) },
        { label: 'View / Add Comment', icon: 'pi pi-fw pi-comment', command: (e) => this.getAddUpdateComment(data, false) }
      ];
    } else {
      this.taskMenu = [
        { label: 'View / Upload Documents', icon: 'pi pi-fw pi-upload', command: (e) => this.getAddUpdateDocument(data) },
        { label: 'View / Add Comment', icon: 'pi pi-fw pi-comment', command: (e) => this.getAddUpdateComment(data, false) },
        { label: 'Mark Complete', icon: 'pi pi-fw pi-check', command: (e) => this.checkCompleteTask(data) },
      ];
    }
  }

  // *************************************************************************************************************************************
  // Get data by dates on button switch
  // *************************************************************************************************************************************

  GetDatabyDateSelection(event, days) {
    this.TabName = this.route.snapshot.data.type;

    this.days = days;
    this.selectedTab = event;
    this.selectedDate = days > 0 ? event + days : event;
    this.rangeDates = event === 'Custom' ? this.rangeDates : null;
    if (event === 'Custom' && this.rangeDates !== null) {

      this.allTasks = [];
      this.loaderenable = true;
      this.rangeDates[1] = this.rangeDates[1] === null ? this.rangeDates[0] : this.rangeDates[1];
      const dates = this.CalculateDatesDiffernce(event, days);
      this.getStatusFilterDropDownValue(this.TabName, dates);
    } else if (event !== 'Custom') {
      this.allTasks = [];
      this.loaderenable = true;
      const dates = this.CalculateDatesDiffernce(event, days);
      this.getStatusFilterDropDownValue(this.TabName, dates);
    }
  }

  // *************************************************************************************************************************************
  // hide popup menu on production
  // *************************************************************************************************************************************

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


  // *************************************************************************************************************************************
  // date selected on button Click or Custom
  // *************************************************************************************************************************************

  CalculateDatesDiffernce(nextLast, days) {
    const filterDates = [];
    let startDate = new Date(new Date().setDate(new Date().getDate() + 1));
    let endDate = new Date(new Date().setDate(new Date().getDate() - 1));
    if (nextLast === 'Next') {
      startDate = startDate.getDay() === 6 ? new Date(startDate.setDate(startDate.getDate() + 2)) :
        startDate.getDay() === 0 ? new Date(startDate.setDate(startDate.getDate() + 1)) :
          new Date(startDate.setDate(startDate.getDate()));
      endDate = this.addBusinessDays(startDate, days - 1);
    } else if (nextLast === 'Past') {
      endDate = endDate.getDay() === 6 ? new Date(endDate.setDate(endDate.getDate() - 1)) :
        endDate.getDay() === 0 ? new Date(endDate.setDate(endDate.getDate() - 2)) :
          new Date(endDate.setDate(endDate.getDate()));

      startDate = this.RemoveBusinessDays(endDate, days - 1);
    } else if (nextLast === 'Custom') {

      startDate = this.rangeDates[0];
      endDate = this.rangeDates[1];

    } else if (nextLast === 'Today') {
      startDate = new Date();
      endDate = new Date();
    }

    const startmonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;
    filterDates.push(startDate.getFullYear() + '-' + (startmonth < 10 ? '0' + startmonth : startmonth) +
      '-' + (startDate.getDate() < 10 ? '0' + startDate.getDate() : startDate.getDate()) + 'T00:00:01.000Z');
    filterDates.push(endDate.getFullYear() + '-' + (endMonth < 10 ? '0' + endMonth : endMonth) + '-' +
      (endDate.getDate() < 10 ? '0' + endDate.getDate() : endDate.getDate()) + 'T23:59:00.000Z');

    return filterDates;
  }

  // *************************************************************************************************************************************
  // Add days to get end date for next days
  // *************************************************************************************************************************************
  addBusinessDays(date, days) {
    date = new Date(date.getTime());
    const day = date.getDay();
    date.setDate(date.getDate() + days + (day === 6 ? 2 : +!day) + (Math.floor((days - 1 + (day % 6 || 1)) / 5) * 2));
    return date;
  }
  // *************************************************************************************************************************************
  // remove days to get start date for previous days
  // *************************************************************************************************************************************

  RemoveBusinessDays(date, days) {

    let tempDate = new Date(date);
    while (days > 0) {

      tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
      if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
        days -= 1;
      }
    }
    return tempDate;
  }


  // *************************************************************************************************************************************
  // Get Data based on date selected
  // *************************************************************************************************************************************

  async getStatusFilterDropDownValue(status, filterDates) {

    const mytasks = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTasks);
    mytasks.filter = mytasks.filter.replace(/{{userId}}/gi, this.sharedObject.sharePointPageObject.userId.toString());
    mytasks.filter += status === 'MyCompletedTask' ? mytasks.filterCompleted : mytasks.filterStatus;
    // mytasks.filter += mytasks.filterStatus;
    mytasks.filter += mytasks.filterDate.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, mytasks);

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    // const mytasks = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTasks);
    // mytasks.filter = mytasks.filter.replace(/{{userId}}/gi, this.sharedObject.sharePointPageObject.userId.toString());
    // mytasks.filter += status === 'MyCompletedTask' ? mytasks.filterCompleted : mytasks.filterStatus;
    // // mytasks.filter += mytasks.filterStatus;
    // mytasks.filter += mytasks.filterDate.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
    // const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', mytasks);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    const res = this.response[0] !== '' ? this.response[0] : [];

    if (res.length > 0) {
      let data = [];
      res.forEach(task => {

        const TaskProject = this.sharedObject.DashboardData.ProjectCodes ? this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === task.ProjectCode) : null;
        let DisplayTitle;
        if (TaskProject !== undefined) {
          if (task.SubMilestones) {
            if (task.SubMilestones === 'Default') {
              DisplayTitle = task.Title + ' ( ' + TaskProject.WBJID + ')';
            } else {
              DisplayTitle = task.Title + ' - ' + task.SubMilestones + ' ( ' + TaskProject.WBJID + ')';
            }
          } else {
            DisplayTitle = task.Title + ' (' + TaskProject.WBJID + ')';
          }
        } else {
          if (task.SubMilestones) {
            if (task.SubMilestones === 'Default') {
              DisplayTitle = task.Title;
            } else {
              DisplayTitle = task.Title + ' - ' + task.SubMilestones;
            }
          } else {
            DisplayTitle = task.Title;
          }
        }

        data.push({
          Id: task.Id,
          StartDate: new Date(this.datePipe.transform(task.StartDate, 'MMM d, y, h:mm a')),
          DueDate: new Date(this.datePipe.transform(task.DueDate, 'MMM d, y, h:mm a')),
          ExportStartDate: new Date(this.datePipe.transform(task.StartDate, 'MMM d, y, h:mm a')),
          ExportDueDate: new Date(this.datePipe.transform(task.DueDate, 'MMM d, y, h:mm a')),
          TimeSpent: task.TimeSpent === null ? 0 : task.TimeSpent.replace('.', ':'),
          TaskStatus: task.Status,
          ExpectedTime: task.ExpectedTime,
          MainStatus: task.Status === 'Completed' || task.Status === 'Auto Closed' ? 'Closed' : task.Status === 'Not Started' || task.Status === 'In Progress' ? 'Not Completed' : task.Status === 'Not Confirmed' ? 'Planned' : '',
          DisplayTitle: DisplayTitle,
          TaskName: DisplayTitle
        })
      });
      this.allTasks = data;

      // this.allTasks.map(c => c.TimeSpent = c.TimeSpent === null ? 0 : c.TimeSpent.replace('.', ':'));

      // this.allTasks.map(c => c.StartDate = new Date(this.datePipe.transform(c.StartDate, 'MMM d, y, h:mm a')));
      // this.allTasks.map(c => c.DueDate = new Date(this.datePipe.transform(c.DueDate, 'MMM d, y, h:mm a')));

      // this.allTasks.map(c => c.ExportStartDate = this.datePipe.transform(c.StartDate, 'MMM d, y, h:mm a'));

      // this.allTasks.map(c => c.ExportDueDate = this.datePipe.transform(c.DueDate, 'MMM d, y, h:mm a'));



      // if (this.TabName === 'MyCompletedTask') {
      //   this.allTasks.filter(c => c.Status === 'Completed' || c.Status === 'Auto Closed').map(c => c.MainStatus = 'Closed');

      // } else {
      //   this.allTasks.filter(c => c.Status === 'Not Started' || c.Status === 'In Progress').map(c => c.MainStatus = 'Not Completed');
      //   this.allTasks.filter(c => c.Status === 'Not Confirmed').map(c => c.MainStatus = 'Planned');
      // }
      // if (this.sharedObject.DashboardData.ProjectCodes.length > 0) {
      //   this.allTasks.forEach(element => {

      //     const data = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === element.ProjectCode);

      //     if (data !== undefined) {
      //       if (element.SubMilestones) {
      //         task
      //         if (element.SubMilestones === 'Default') {
      //           element.DisplayTitle = element.Title + ' ( ' + data.WBJID + ')';
      //         } else {
      //           element.DisplayTitle = element.Title + ' - ' + element.SubMilestones + ' ( ' + data.WBJID + ')';
      //         }
      //       } else {
      //         element.DisplayTitle = element.Title + ' (' + data.WBJID + ')';
      //       }
      //     } else {
      //       if (element.SubMilestones) {
      //         if (element.SubMilestones === 'Default') {
      //           element.DisplayTitle = element.Title;
      //         } else {
      //           element.DisplayTitle = element.Title + ' - ' + element.SubMilestones;
      //         }
      //       } else {
      //         element.DisplayTitle = element.Title;
      //       }
      //     }
      //   });
      // }
      this.initializeTableOptions();

    } else if (this.allTasks.length === 0) {
      this.loaderenable = false;
      this.thenBlock = this.taskId;
    }
  }

  initializeTableOptions() {
    this.AllTaskColArray = this.route.snapshot.data.type === 'MyCompletedTask' ?
      { MainStatus: [{ label: 'Closed', value: 'Closed' }], TaskStatus: [], TaskName: [], StartDate: [], DueDate: [] } :
      { MainStatus: [], TaskStatus: [], TaskName: [], StartDate: [], DueDate: [] };
    this.createColFieldValues(this.allTasks);
  }

  // *************************************************************************************************************************************
  // Column filter for search
  // *************************************************************************************************************************************




  createColFieldValues(resArray) {
    this.AllTaskColArray.TaskStatus = this.commonService.sortData(this.myDashboardConstantsService.uniqueArrayObj
      (resArray.map(a => { const b = { label: a.TaskStatus, value: a.TaskStatus }; return b; })));

    this.AllTaskColArray.TaskName = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = {
          label:
            a.DisplayTitle, value: a.DisplayTitle
          // tslint:disable-next-line: align
        }; return b;
      })));
    this.AllTaskColArray.MainStatus = this.commonService.sortData
      (this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
        const b = {
          label:
            a.MainStatus, value: a.MainStatus
          // tslint:disable-next-line: align
        }; return b;
      })));
    this.AllTaskColArray.StartDate = this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
      const b = {
        label:
          // tslint:disable-next-line: align
          this.datePipe.transform(a.StartDate, 'MMM d, y, h:mm a'), value: a.StartDate
        // tslint:disable-next-line: align
      }; return b;
    }));
    this.AllTaskColArray.DueDate = this.myDashboardConstantsService.uniqueArrayObj(resArray.map(a => {
      const b = {
        label:
          // tslint:disable-next-line: align
          this.datePipe.transform(a.DueDate, 'MMM d, y, h:mm a'), value: a.DueDate
        // tslint:disable-next-line: align
      }; return b;
    }));

    this.AllTaskColArray.StartDate = this.AllTaskColArray.StartDate.sort((a, b) =>
      new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );

    this.AllTaskColArray.DueDate = this.AllTaskColArray.DueDate.sort((a, b) =>
      new Date(a.value).getTime() > new Date(b.value).getTime() ? 1 : -1
    );


    this.loaderenable = false;
    this.thenBlock = this.taskId;
  }

  // **************************************************************************************************
  // Get Next Previous task from current task
  // **************************************************************************************************
  async getNextPreviousTask(task) {
    this.tasks = [];
    let nextTaskFilter = '';
    let previousTaskFilter = '';
    let nextTasks;
    let previousTasks;
    if (task.NextTasks) {
      nextTasks = task.NextTasks.split(';#');
      nextTasks.forEach((value, i) => {
        // tslint:disable-next-line: quotemark
        nextTaskFilter += "(Title eq '" + value + "')";
        nextTaskFilter += i < nextTasks.length - 1 ? ' or ' : '';
      });
    }
    if (task.PrevTasks) {
      previousTasks = task.PrevTasks.split(';#');
      previousTasks.forEach((value, i) => {
        previousTaskFilter += '(Title eq \'' + value + '\')';
        previousTaskFilter += i < previousTasks.length - 1 ? ' or ' : '';
      });
    }

    const taskFilter = (nextTaskFilter !== '' && previousTaskFilter !== '') ?
      nextTaskFilter + ' or ' + previousTaskFilter : (nextTaskFilter === '' && previousTaskFilter !== '')
        ? previousTaskFilter : (nextTaskFilter !== '' && previousTaskFilter === '') ? nextTaskFilter : '';

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // const previousNextTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.previousNextTask);
    // previousNextTask.filter = taskFilter;

    // const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousNextTask);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    const previousNextTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.previousNextTask);
    previousNextTask.filter = taskFilter;
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousNextTask);

    this.tasks = this.response.length ? this.response : [];

    this.tasks.map(c => c.StartDate = c.StartDate !== null ? this.datePipe.transform(c.StartDate, 'MMM d, y h:mm a') : '-');
    this.tasks.map(c => c.DueDate = c.DueDate !== null ? this.datePipe.transform(c.DueDate, 'MMM d, y h:mm a') : '-');

    if (task.NextTasks) {
      this.tasks.filter(c => nextTasks.includes(c.Title)).map(c => c.TaskType = 'Next Task');
    }
    if (task.PrevTasks) {
      this.tasks.filter(c => previousTasks.includes(c.Title)).map(c => c.TaskType = 'Previous Task');
    }

    return this.tasks;
  }


  // *************************************************************************************************************************************
  // Dialog to display task and time spent
  // *************************************************************************************************************************************

  async showDialog(task, type, row) {

    this.modalloaderenable = true;
    this.selectedTask = task.DisplayTitle;
    this.selectedindex = row;
    this.selectedType = type;

    if (type === 'DisplayTitle') { // {
      this.getNextPreviousTaskDialog(task);
    }
    // this.display = true;
    // }
    if (type === 'TimeSpent') {
      await this.getupdateTimeSpent(task);
    }
    this.modalloaderenable = false;

  }

  // *************************************************************************************************************************************
  // load component for  time spent
  // *************************************************************************************************************************************


  async getupdateTimeSpent(task) {

    // var status = await this.getPrevTaskStatus(task);

    const ref = this.dialogService.open(TimeSpentDialogComponent, {
      data: {
        task,
        tab: this.TabName

      },
      header: task.DisplayTitle,
      width: '90vw',
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false,
    });
    ref.onClose.subscribe((saveTimeSpentAccess: any) => {


      if (saveTimeSpentAccess) {
        this.loaderenable = true;
        this.allTasks = [];
        this.GetDatabyDateSelection(this.selectedTab, this.days);
      }

    });
  }


  // *************************************************************************************************************************************
  // load component for  next previous tasks
  // *************************************************************************************************************************************


  async getNextPreviousTaskDialog(task) {

    this.tableloaderenable = true;
    const tasks = await this.getNextPreviousTask(task);
    this.tableloaderenable = false;
    const ref = this.dialogService.open(PreviosNextTasksDialogComponent, {
      data: {
        task,
        allTasks: tasks,
      },
      header: task.DisplayTitle,
      width: '90vw',

    });
    ref.onClose.subscribe((PrevTasks: any) => {
    });
  }


  // *************************************************************************************************************************************
  // load component for  comment
  // *************************************************************************************************************************************


  async getAddUpdateComment(task, IsMarkComplete) {

    const ref = this.dialogService.open(AddEditCommentComponent, {
      data: {
        task,
        MarkComplete: IsMarkComplete,
      },
      header: task.DisplayTitle,
      closable: false,
      width: '80vw',
    });
    ref.onClose.subscribe(async (Commentobj: any) => {

      if (Commentobj) {

        if (Commentobj.IsMarkComplete) {
          this.loaderenable = true;
          this.allTasks = [];
          task.TaskComments = Commentobj.comment;
          task.Status = 'Completed';
          const response = await this.myDashboardConstantsService.CompleteTask(task);
          if (response) {
            this.loaderenable = false;
            this.GetDatabyDateSelection(this.selectedTab, this.days);
            this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: response });
          } else {
            this.allTasks = [];
            this.messageService.add({
              key: 'custom', severity: 'success', summary: 'Success Message',
              detail: task.Title + 'Task Updated Successfully.'
            });
            this.GetDatabyDateSelection(this.selectedTab, this.days);
            if (task.PrevTasks && task.PrevTasks.indexOf(';#') === -1 && task.Task.indexOf('Review-') > -1) {
              this.myDashboardConstantsService.callQMSPopup(task, this.feedbackPopupComponent);
            }
          }
        } else {
          this.UpdateComment(Commentobj.comment, task);
        }
      }
    });
  }



  // *************************************************************************************************************************************
  //  save / Update task comment
  // *************************************************************************************************************************************


  async UpdateComment(comment, task) {

    const data = {
      TaskComments: comment
    };

    await this.spOperations.updateItem(this.constants.listNames.Schedules.name, task.ID, data, 'SP.Data.SchedulesListItem');
    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Comment saved successfully' });
  }

  // **************************************************************************************************
  //  get Previous Task Status
  // ***************************************************************************************************

  // async getPrevTaskStatus(task) {
  //   let status = '';
  //   // this.batchContents = new Array();
  //   // const batchGuid = this.spServices.generateUUID();

  //   // const previousTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.previousTaskStatus);
  //   // previousTask.filter = previousTask.filter.replace(/{{taskId}}/gi, task.ID).replace(/{{userID}}/gi,
  //   // this.sharedObject.sharePointPageObject.userId.toString());

  //   // const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousTask);
  //   // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

  //   // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
  //   const previousTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.previousTaskStatus);
  //   previousTask.filter = previousTask.filter.replace(/{{taskId}}/gi, task.ID).replace(/{{userID}}/gi, this.sharedObject.sharePointPageObject.userId.toString());
  //   this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousTask);
  //   this.response.forEach(async element => {
  //     if (element.AllowCompletion === 'No') {
  //       let previousTaskFilter = '';
  //       if (element.PrevTasks) {
  //         const previousTasks = task.PrevTasks.split(';#');
  //         previousTasks.forEach((value, i) => {
  //           previousTaskFilter += '(Title eq \'' + value + '\')';
  //           previousTaskFilter += i < previousTasks.length - 1 ? ' or ' : '';
  //         });

  //         const previousTask = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.taskStatus);
  //         previousTask.filter = previousTaskFilter;
  //         this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousTask);
  //         this.response.forEach(element => {
  //           status = element.Status;
  //         });

  //       } else {
  //         status = 'AllowCompletion';
  //       }
  //     } else {
  //       status = 'AllowCompletion';
  //     }
  //   });
  //   return status;
  // }


  // *************************************************************************************************************************************
  // load component for  upload document
  // *************************************************************************************************************************************


  async getAddUpdateDocument(task) {

    let NextTasks;
    const enableEmail = await this.checkEmailNotificationEnable(task);
    if (enableEmail) {
      NextTasks = await this.getNextPreviousTask(task);
    }

    const ref = this.dialogService.open(ViewUploadDocumentDialogComponent, {
      data: {
        task,
        emailNotificationEnable: enableEmail,
        nextTasks: NextTasks ? NextTasks.filter(c => c.TaskType === 'Next Task') : []
      },
      header: task.DisplayTitle,
      width: '80vw',
      contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe((Comment: any) => {
      if (Comment) {

      }

    });
  }

  async checkEmailNotificationEnable(task) {
    let EnableNotification = false;
    if (task.Status === 'Completed' || task.Status === 'Auto Closed') {

      let PastDate = await this.RemoveBusinessDays(new Date(), 2);

      PastDate = new Date(PastDate.getFullYear(), PastDate.getMonth(), PastDate.getDate());

      let TaskEndDate = task.Actual_x0020_End_x0020_Date ? new Date(task.Actual_x0020_End_x0020_Date) : new Date(task.DueDate);

      TaskEndDate = new Date(TaskEndDate.getFullYear(), TaskEndDate.getMonth(), TaskEndDate.getDate());

      EnableNotification = PastDate.getTime() <= TaskEndDate.getTime() ? true : false;

    }
    return EnableNotification;
  }




  // *************************************************************************************************************************************
  //  Mark as Complete
  // *************************************************************************************************************************************


  async checkCompleteTask(task) {

    const allowedStatus= ['Completed', 'AllowCompletion', 'Auto Closed'];
    const TaskDetails = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TaskDetails);
    TaskDetails.filter = TaskDetails.filter.replace(/{{taskId}}/gi, task.ID);
    
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, TaskDetails);


    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // const TaskDetails = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TaskDetails);
    // TaskDetails.filter = TaskDetails.filter.replace(/{{taskId}}/gi, task.ID);

    // const TaskDetailsUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', TaskDetails);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, TaskDetailsUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);


    const stval = await this.myDashboardConstantsService.getPrevTaskStatus(task);

    task.TaskComments = this.response.length ? this.response[0].TaskComments: '';

    // if (stval === 'Completed' || stval === 'AllowCompletion' || stval === 'Auto Closed') {
      if(allowedStatus.includes(stval)) {
      if (!task.FinalDocSubmit) {
        this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: 'No Final Document Found' });
        return false;
      }
      if (task.TaskComments) {

        this.confirmationService.confirm({
          message: 'Are you sure that you want to proceed?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {

            this.loaderenable = true;
            this.allTasks = [];
            this.callComplete(task);
          },
          reject: () => {
          }
        });

      } else {
        this.getAddUpdateComment(task, true);
      }
    } else {
      this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: 'Previous task should be completed.' });
    }
  }


  async callComplete(task) {
    task.Status = 'Completed';
    const response = await this.myDashboardConstantsService.CompleteTask(task);


    if (response) {
      this.loaderenable = false;
      this.GetDatabyDateSelection(this.selectedTab, this.days);
      this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: response });

    } else {
      this.messageService.add({
        key: 'custom', severity: 'success', summary: 'Success Message',
        detail: task.Title + 'Task Updated Successfully.'
      });
      this.GetDatabyDateSelection(this.selectedTab, this.days);
      if (task.PrevTasks && task.PrevTasks.indexOf(';#') === -1 && task.Task.indexOf('Review-') > -1) {
        this.myDashboardConstantsService.callQMSPopup(task, this.feedbackPopupComponent);
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
    if (this.allTasks.length && this.isOptionFilter) {
      let obj = {
        tableData: this.taskId,
        colFields: this.AllTaskColArray
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    //  else {
    //   this.initializeTableOptions();
    // }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {

  }


}