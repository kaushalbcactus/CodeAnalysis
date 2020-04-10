import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, SelectItem, MessageService } from 'primeng';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { Table } from 'primeng/table';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-time-booking-dialog',
  templateUrl: './time-booking-dialog.component.html',
  styleUrls: ['./time-booking-dialog.component.css']
})
export class TimeBookingDialogComponent implements OnInit {

  // tslint:disable-next-line: variable-name
  @ViewChild('scrollDown', { static: true }) _el: ElementRef;

  thenBlock: Table;
  @ViewChild('tableId', { static: true })
  tableId: Table;


  modalloaderenable = true;
  dbClientLegalEntities: any = [{ label: 'Select Client', value: null }];
  timeSpentObject = { taskDay: null, taskHrs: null };
  dateObject = { date: null, time: null };
  AllTaskTimeSpent: any[] = [];
  clonedMilestones: { [s: number]: milestoneData; } = {};
  milestoneData: milestoneData;
  tempId = '00000';
  count = 0;
  UserMilestones: any = [];
  batchContents: any[];
  response: any[];
  weekDays: any[];
  dayscount: any = 0;
  prevArrow = true;
  nextArrow = true;
  projetInformations: any;
  allTasks: any;
  milestonesTimeSpent: any = [];
  tempMilestoneTimeSpent: any = [];
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
  MainminDate: any;
  TotalOfTotal: any = [];
  FinalTotal = '00:00';
  displayComment = false;
  displayFileUpload = false;
  timebookingRow: any;
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService,
    public spOperations: SPOperationService,
    private commonService: CommonService
  ) { }



  async ngOnInit() {
    this.modalloaderenable = true;
    this.getAllClients();
    this.getweekDates(null);
    this.MainminDate = await this.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 3);
  }


  cancelTBooking() {
    this.ref.close();
  }

  // *************************************************************************************************
  //  Get all clients name
  // *************************************************************************************************


  async getAllClients() {
    this.dbClientLegalEntities.push.apply(this.dbClientLegalEntities, await this.myDashboardConstantsService.getAllClients());

  }


  AddNewRow() {
    const newMilestone = {
      ID: -1, Entity: '', ProjectCode: '', Milestone: '', SubMilestone: '', displayName: '', type: 'task',
      dbClientLegalEntities: this.dbClientLegalEntities, dbProjects: [{
        label: 'Select Project',
        value: null
      }], dbMilestones: [{ label: 'Select Milestone', value: null }], isEditable: true,
      commentEnable: false,
      Comments: '',
      TimeSpents: this.weekDays.map(c => new Object({
        date: c, MileHrs: '00:00', minHrs: '00:00',
        editable: new Date(this.datePipe.transform(this.MainminDate, 'yyyy-MM-dd')).getTime() <=
          new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime()
          && new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() <= new Date().getTime() ? true : false
      }))
    };


    this.UserMilestones.push(newMilestone);
    this.UserMilestones = [...this.UserMilestones];
  }

  // *************************************************************************************************
  //  Get all projects based on client select
  // *************************************************************************************************


  async getAllProjects(client, rowData) {
    rowData.dbProjects = [{ label: 'Select Project', value: null }];

    const projectInfoFilter = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformations);
    projectInfoFilter.filter += " and (ClientLegalEntity eq '" + client + "')";

    this.commonService.SetNewrelic('MyDashboard', 'timeBooking-dialog', 'GetProjectInfoByClient');
    this.response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, projectInfoFilter);

    const dbProjectInformations = this.response.length > 0 ?
      this.response.map(o => new Object({ label: o.ProjectCode + ' (' + o.WBJID + ')', value: o.ProjectCode })) : [];
    rowData.dbProjects.push.apply(rowData.dbProjects, dbProjectInformations);
  }


  // *************************************************************************************************
  //  Get all milestones based on project selection
  // *************************************************************************************************


  async getAllMilestones(projectCode, rowData) {

    rowData.dbMilestones = [{ label: 'Select Milestone', value: null }];
    rowData.ProjectCode = projectCode;
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    const AllMilestones = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.AllMilestones);

    const month = this.MainminDate.getMonth() + 1;
    const EndDate = this.MainminDate.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' +
      (this.MainminDate.getDate() < 10 ? '0' + this.MainminDate.getDate() : this.MainminDate.getDate()) + 'T23:59:00.000Z';

    AllMilestones.filter = AllMilestones.filter.replace(/{{projectCode}}/gi, projectCode).replace(/{{DateString}}/gi, EndDate);
    this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'GetMilestoneByRpojectCode');
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, AllMilestones);

    const dbAllMilestones = this.response.length > 0 ? await this.getSubMilestoneMilestones(this.response) : [];
    rowData.dbMilestones.push.apply(rowData.dbMilestones, dbAllMilestones);

  }

  async getSubMilestoneMilestones(Milestones) {
    // this.response[0].map(o => new Object({ label: o.Title, value: o.Title }))
    const subMileArray = [];
    Milestones.forEach(element => {

      if (element.SubMilestones) {
        const SubMilestone = element.SubMilestones.split(';#');
        SubMilestone.forEach((value, i) => {

          const tempValue = value.split(':');
          if (tempValue[2] !== 'Not Confirmed') {
            subMileArray.push(new Object({
              label: element.Title + ' - ' + value.substr(0,
                value.indexOf(':')), value: element.Title + ' - ' + value.substr(0, value.indexOf(':'))
            }));
          }

        });


      } else {
        subMileArray.push(new Object({ label: element.Title, value: element.Title }));
      }

    });


    return subMileArray;


  }



  // *************************************************************************************************
  //  Get week days
  //*************************************************************************************************


  getweekDates(status) {
    this.modalloaderenable = true;
    this.dayscount = status === null ? 0 : status === 'increase' ? this.dayscount - 7 : this.dayscount + 7;
    this.weekDays = [];
    const WeekDate = new Date(new Date().getTime() - 60 * 60 * 24 * this.dayscount * 1000);
    const day = WeekDate.getDay();
    const diffToMonday = (WeekDate.getDate() - day + (day === 0 ? -6 : 1)) - 1;

    const tempdate = new Date(WeekDate.setDate(diffToMonday));
    for (let i = 0; i <= 6; i++) {
      // const dateonly = tempdate.getDate();
      const newDate = new Date(tempdate.getTime());
      newDate.setDate(newDate.getDate() + 1);
      this.weekDays.push(newDate);
      tempdate.setDate(tempdate.getDate() + 1);
      // tempdate = new Date(this.datePipe.transform(new Date(tempdate), 'yyyy-MM-dd'));
    }

    if (this.dayscount <= -21) {
      this.nextArrow = false;
      this.prevArrow = true;
    } else if (this.dayscount >= 14) {
      this.prevArrow = false;
      this.nextArrow = true;
    } else {
      this.prevArrow = true;
      this.nextArrow = true;
    }

    this.getTimeBookingData();
  }



  SetTime(time, dayhoursObj, rowData) {

    const timespent = time.split(':')[0] % 12 + ':' + time.split(':')[1];
    dayhoursObj.MileHrs = timespent;

    rowData.TimeSpents.some((value) => {
      const MileHrsArray = value.MileHrs.split(':');
      const minHrsArray = value.minHrs.split(':');
      // tslint:disable-next-line: radix
      rowData.commentEnable = (parseInt(MileHrsArray[0]) + 60 * parseInt(MileHrsArray[1])) >
        // tslint:disable-next-line: radix
        (parseInt(minHrsArray[0]) + 60 * parseInt(minHrsArray[1])) ? true : false;
      return rowData.commentEnable === true;
    });

  }

  // *************************************************************************************************
  //  Get  milestone time booking based on week dates
  // *************************************************************************************************

  unique(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k] ? entry[k] : '').join('|');
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  }


  async getTimeBookingData() {

    const startDate = new Date(this.datePipe.transform(this.weekDays[0], 'yyyy-MM-dd') + ' 00:00:00').toISOString();
    const endDate = new Date(this.datePipe.transform(this.weekDays[this.weekDays.length - 1], 'yyyy-MM-dd') + ' 23:59:00').toISOString();
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const AllMilestones = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTimelineForBooking);
    const minDate = await this.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 4);
    AllMilestones.filter = AllMilestones.filter.replace(/{{userId}}/gi, this.sharedObject.currentUser.userId.toString());
    AllMilestones.filter += AllMilestones.filterNotCompleted;

    AllMilestones.filter += AllMilestones.filterDate.replace(/{{startDateString}}/gi, startDate).replace(/{{endDateString}}/gi, endDate);

    this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'GetSchedulesByUserId');
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, AllMilestones);
    this.allTasks = this.response.length > 0 ? this.response : [];

    const tempMilestones = this.allTasks.map(o => new Object({
      ID: o.ID, Entity: o.Entity,
      Title: o.Title,
      Task: o.Task,
      // ProjectCode: o.ProjectCode === 'Adhoc' ? '-' : o.ProjectCode,
      ProjectCode: o.ProjectCode,
      Milestone: o.Milestone === 'Select one' ? o.Comments : o.Milestone,
      SubMilestone: o.SubMilestones,
      displayName: o.Milestone === 'Select one' ? o.Comments : o.SubMilestones &&
        o.SubMilestones !== 'Default' ? o.Milestone + ' - ' + o.SubMilestones : o.Milestone,
      type: o.Entity === null ? 'task' : 'Adhoc',
      commentEnable: o.Task === 'Time Booking' ? true : false,
      Comments: o.Task === 'Time Booking' ? o.TaskComments : '',
      TimeSpents: this.weekDays.map(c => new Object({
        date: c, MileHrs: '00:00', minHrs: '00: 00',
        editable: (new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() >
          new Date(this.datePipe.transform(minDate, 'yyyy-MM-dd')).getTime()) &&
          (new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() <= new Date
            (this.datePipe.transform(new Date(), 'yyyy-MM-dd')).getTime()) ? true : false
      }))
    }));

    const dbActualMilestone = tempMilestones.length > 0 ? tempMilestones.filter(c => c.ProjectCode !== 'Adhoc') : [];
    const dbActualAdhoc = tempMilestones.length > 0 ? tempMilestones.filter(c => c.ProjectCode === 'Adhoc') : [];
    const uniquedbTasks = dbActualMilestone.length > 0 ?
      this.unique(dbActualMilestone, ['ProjectCode', 'Milestone', 'SubMilestone']) : [];
    const uniqueAdhoc = dbActualAdhoc.length > 0 ? this.unique(dbActualAdhoc, ['Entity', 'Milestone']) : [];

    this.UserMilestones = [];
    const uniqueLineItems = [];
    uniqueLineItems.push.apply(uniqueLineItems, uniquedbTasks);
    uniqueLineItems.push.apply(uniqueLineItems, uniqueAdhoc);
    uniqueLineItems.forEach(record => {
      let milestoneTasks = [];
      let tbTask;
      if (record.ProjectCode === 'Adhoc') {
        milestoneTasks = this.allTasks.filter(c => c.Entity === record.Entity && c.Comments === record.Milestone);
      } else {
        milestoneTasks = this.allTasks.filter(c => c.Milestone === record.Milestone &&
          c.ProjectCode === record.ProjectCode && c.SubMilestones === record.SubMilestone);
        tbTask = milestoneTasks.find(t => t.Task === 'Time Booking');
      }

      const obj = {
        ProjectCode: record.ProjectCode ? record.ProjectCode : '',
        Milestone: record.Milestone ? record.Milestone : '',
        SubMilestone: record.SubMilestone ? record.SubMilestone : '',
        displayName: record.displayName ? record.displayName : '',
        Entity: record.Entity ? record.Entity : '',
        type: record.type ? record.type : '',
        tasks: milestoneTasks,
        ID: tbTask ? tbTask.ID : -1,
        Task: tbTask ? tbTask.Task : '',
        Title: tbTask ? tbTask.Title : '',
        isTBPresent: tbTask ? true : false,
        commentEnable: tbTask ? true : false,
        Comments: tbTask ? tbTask.TaskComments : '',
        TimeSpents: this.weekDays.map(c => new Object({
          date: c, MileHrs: '00:00', minHrs: '00: 00',
          editable: (new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() >
            new Date(this.datePipe.transform(minDate, 'yyyy-MM-dd')).getTime()) &&
            (new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() <= new Date
              (this.datePipe.transform(new Date(), 'yyyy-MM-dd')).getTime()) ? true : false
        }))
      };
      record.ProjectCode !== 'Adhoc' ? this.generateTimeSpent(milestoneTasks, obj) : this.generateAdhocTimeSpent(milestoneTasks, obj);
      this.UserMilestones.push(obj);
    });
    let allProjectCodes = this.UserMilestones !== undefined ? this.UserMilestones.map(c => c.ProjectCode) : [];
    allProjectCodes = [...new Set(allProjectCodes)];
    let finalArray = [];
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    allProjectCodes.forEach(async (value, i) => {
      const projectInfoGet = Object.assign({}, options);
      const projectInfoFilter = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
      projectInfoFilter.filter = projectInfoFilter.filter.replace(/{{projectCode}}/gi, value);
      projectInfoGet.url = this.spServices.getReadURL(this.constants.listNames.ProjectInformation.name,
        projectInfoFilter);
      projectInfoGet.type = 'GET';
      projectInfoGet.listName = this.constants.listNames.ProjectInformation.name;
      batchURL.push(projectInfoGet);
      if (batchURL.length === 99) {
        this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'GetProjectInfoByProjectCodes');
        const batchResults = await this.spServices.executeBatch(batchURL);
        finalArray = [...finalArray, ...batchResults];
        batchURL = [];
      }
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'GetProjectInfoByProjectCodes');
      const batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
      // console.log(updateResults);
    }

    this.projetInformations = finalArray.length > 0 ? [].concat(...finalArray.map(c => c.retItems)) : [];

    if (this.UserMilestones !== undefined) {
      this.projetInformations.forEach(element => {
        this.UserMilestones.filter(c => c.ProjectCode === element.ProjectCode).map(c => c.Entity = element.ClientLegalEntity);
        this.UserMilestones.filter(c => c.ProjectCode === element.ProjectCode).map(c =>
          c.ProjectCodeTitle = c.ProjectCode + ' (' + element.WBJID + ')');

      });
      this.UserMilestones.sort((a, b) => {
        const nameA = a.type.toLowerCase();
        const nameB = b.type.toLowerCase();
        // tslint:disable: curly
        if (nameA < nameB) // sort string ascending
          return -1;
        if (nameA > nameB)
          return 1;
        return 0;
      });
    }

    this.thenBlock = this.tableId;
    this.modalloaderenable = false;
  }

  generateTimeSpent(tasks, milestone) {
    tasks.forEach(task => {
      if (task.TimeSpentPerDay !== null) {
        const timeSpentForTask = task.TimeSpentPerDay.split(/\n/);
        if (timeSpentForTask.indexOf('') > -1) {
          timeSpentForTask.splice(timeSpentForTask.indexOf(''), 1);
        }
        timeSpentForTask.forEach(element => {
          // tslint:disable-next-line: no-shadowed-variable
          const hoursArray = [];
          const taskDay = element.split(':')[0] === element ? element.split('#')[0] : element.split(':')[0].replace(/,/g, ', ');
          const taskHrs = element.split(':')[0] === element ?
            element.substring(element.indexOf('#') + 1,
              element.indexOf('.')) : element.split(':')[1] + ':' + element.split(':')[2];
          hoursArray.push(taskHrs);
          // tslint:disable-next-line: no-shadowed-variable
          const currentMilestone = milestone.TimeSpents.find(c =>
            new Date(this.datePipe.transform(c.date, 'yyyy-MM-dd')).getTime() ===
            new Date(this.datePipe.transform(taskDay, 'yyyy-MM-dd')).getTime());
          if (currentMilestone !== undefined) {
            hoursArray.push(currentMilestone.MileHrs);
            currentMilestone.MileHrs = this.getTimeSpentHours(hoursArray);
            if (task.Task !== 'Time Booking') {
              hoursArray[1] = currentMilestone.minHrs;
              currentMilestone.minHrs = this.getTimeSpentHours(hoursArray);
            }
          }
        });
      }
    });
  }

  getTimeSpentHours(hoursArray) {
    const timeSpentHours = hoursArray.map(c => c.split(c.indexOf('.') > -1 ? '.' : ':')).map(c => c[0]).map(Number).reduce
      ((sum, num) => sum + num, 0) + Math.floor(hoursArray.map(c => c.split(c.indexOf('.') > -1 ? '.' : ':'))
        .map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
    // tslint:disable-next-line: no-shadowed-variable
    const timeSpentMin = hoursArray.map(c => c.split(c.indexOf('.') > -1 ? '.' : ':')).map(c => c[1]).map(Number).reduce
      ((sum, num) => sum + num, 0) % 60;
    // tslint:disable-next-line: no-shadowed-variable
    const timeSpentHours1 = timeSpentHours < 10 ? '0' + timeSpentHours : timeSpentHours;
    const timespent = timeSpentMin < 10 ?
      timeSpentHours1 + ':' + '0' + timeSpentMin : timeSpentHours1 + ':' + timeSpentMin;
    return timespent;
  }

  generateAdhocTimeSpent(tasks, milestone) {
    tasks.forEach(task => {
      const hoursArray = [];
      hoursArray.push(task.TimeSpent);
      if (milestone !== undefined) {
        // tslint:disable-next-line: no-shadowed-variable
        const currentMilestone = milestone.TimeSpents.find(c => new Date(this.datePipe.transform
          (c.date, 'yyyy-MM-dd')).getTime() === new Date(this.datePipe.transform
            (task.Actual_x0020_Start_x0020_Date, 'yyyy-MM-dd')).getTime());
        if (currentMilestone !== undefined) {
          hoursArray.push(currentMilestone.MileHrs);
          currentMilestone.MileHrs = this.getTimeSpentHours(hoursArray);
        }
      }
    });
  }

  async SaveTimeBooking() {

    let count = 0;
    const dbTasks = this.UserMilestones.filter(c => c.type === 'task');
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < dbTasks.length; i++) {

      const dateArray = [];
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < dbTasks[i].TimeSpents.length; j++) {
        const dateObject = {
          date: this.datePipe.transform(dbTasks[i].TimeSpents[j].date, 'EE, MMM d, y'),
          time: await this.DifferenceHours(dbTasks[i].TimeSpents[j].minHrs, dbTasks[i].TimeSpents[j].MileHrs)
        };
        dateArray.push(dateObject);
      }

      const timeSpentString = dateArray.map(c => (c.date + ':' + c.time.replace('.', ':')).replace(/ /g, '')).join('\n');
      const timeSpentHours = dateArray.map(c => c.time.split(c.time.indexOf('.') > -1 ? '.' : ':')).map(c => c[0]).map(Number).
        reduce((sum, num) => sum + num, 0) + Math.floor(dateArray.map(c => c.time.split(c.time.indexOf('.') > -1 ? '.' : ':'))
          .map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
      const timeSpentMin = dateArray.map(c => c.time.split(c.time.indexOf('.') > -1 ? '.' : ':')).map(c => c[1]).map(Number)
        .reduce((sum, num) => sum + num, 0) % 60;

      const timeSpentHours1 = timeSpentHours < 10 ? '0' + timeSpentHours : timeSpentHours;
      const totalTimeSpent = timeSpentMin < 10 ? timeSpentHours1 + '.' + '0' + timeSpentMin : timeSpentHours1 + '.' + timeSpentMin;

      const existingObjItem = this.allTasks.filter(c => c.ProjectCode === dbTasks[i].ProjectCode &&
        c.Milestone === dbTasks[i].Milestone && c.SubMilestone === dbTasks[i].SubMilestones && c.Task === 'Time Booking');

      if (existingObjItem.length) {
        const existingObj = existingObjItem[0];
        if (existingObj.TimeSpentPerDay !== timeSpentString || existingObj.TaskComments !== dbTasks[i].Comments) {
          existingObj.TimeSpent = totalTimeSpent;
          existingObj.TimeSpentPerDay = timeSpentString;
          existingObj.TaskComments = dbTasks[i].Comments;
          count++;

          this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'updateSchedule');
          await this.spOperations.updateItem(this.constants.listNames.Schedules.name, existingObj.ID, existingObj,
            this.constants.listNames.Schedules.type);
        }
      } else {
        if (dbTasks[i].Entity) {

          if (!dbTasks[i].ProjectCode) {
            this.messageService.add({
              key: 'custom-booking', severity: 'warn', summary: 'Warnin Message',
              detail: 'Please Select Project / To remove unwanted line, please unselect Client'
            });

            return false;
          } else if (!dbTasks[i].Milestone) {
            this.messageService.add({
              key: 'custom-booking', severity: 'warn', summary: 'Warning Message',
              detail: 'Please Select Milestone / To remove unwanted line, please unselect Client'
            });
            return false;
          } else if (totalTimeSpent !== '00.00') {
            this.modalloaderenable = true;
            if (dbTasks[i].Milestone && dbTasks[i].ProjectCode && dbTasks[i].Entity) {
              const obj = {
                __metadata: {
                  // tslint:disable-next-line: object-literal-key-quotes
                  'type': 'SP.Data.SchedulesListItem'
                },
                Actual_x0020_End_x0020_Date: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[6]
                  .date, 'yyyy-MM-dd') + 'T09:00:00.000'),
                Actual_x0020_Start_x0020_Date: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[0]
                  .date, 'yyyy-MM-dd') + 'T09:00:00.000'),
                DueDate: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[6].date, 'yyyy-MM-dd') + 'T09:00:00.000'),
                ExpectedTime: '0',
                Milestone: dbTasks[i].Milestone,
                SubMilestones: dbTasks[i].SubMilestone,
                ProjectCode: dbTasks[i].ProjectCode,
                StartDate: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[0].date, 'yyyy-MM-dd') + 'T09:00:00.000'),
                Status: 'Completed',
                Task: 'Time Booking',
                TimeSpent: totalTimeSpent,
                TimeSpentPerDay: timeSpentString,
                TaskComments: dbTasks[i].Comments,
                Title: dbTasks[i].ProjectCode + ' ' + dbTasks[i].Milestone + ' TB ' + this.sharedObject.currentUser.title,
                AssignedToId: this.sharedObject.currentUser.userId,
              };
              count++;
              const folderUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/Lists/Schedules/' + dbTasks[i].ProjectCode;
              this.commonService.SetNewrelic('MyDashboard', 'time-bookingDialog', 'CreateAndMoveSchedule');
              // tslint:disable: max-line-length
              await this.spServices.createItemAndMove(this.constants.listNames.Schedules.name, obj, this.constants.listNames.Schedules.type, folderUrl);
              // await this.spServices.createAndMove(this.constants.listNames.Schedules.name, obj, folderUrl);
            }
          }
        }
      }
    }

    this.modalloaderenable = false;
    this.ref.close(count);


  }

  checkMilestone(event, rowData) {
    rowData.Milestone = event.lastIndexOf(' - ') > -1 ? event.substr(0, event.lastIndexOf(' - ')) : event;
    rowData.SubMilestone = event.lastIndexOf(' - ') > -1 ? event.substr(event.lastIndexOf(' - ') + 3) : null;
    // rowData.Title = rowData.ID === -1 ? rowData.ProjectCode + ' ' + rowData.Milestone + ' TB ' + this.sharedObject.currentUser.title : rowData.Title;
    if (this.UserMilestones.filter(c => c.Entity === rowData.Entity && c.ProjectCode ===
      rowData.ProjectCode && c.displayName === event).length > 1) {
      const index = this.UserMilestones.indexOf(rowData);

      if (index > -1) {
        this.UserMilestones.splice(index, 1);
      }
      this.messageService.add({
        key: 'custom-booking', severity: 'warn', summary: 'Warning Message',
        detail: 'Selected combination already exist. Please check above'
      });
    }
  }


  async DifferenceHours(startTime, EndTime) {
    // tslint:disable-next-line: radix
    const TotalMinDiff = ((EndTime.split(':')[0] * 60) + parseInt(EndTime.split(':')[1])) -
      // tslint:disable-next-line: radix
      ((startTime.split(':')[0] * 60) + parseInt(startTime.split(':')[1]));
    const hours = (TotalMinDiff / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    const tempminutes = rminutes < 10 ? '0' + rminutes : rminutes;
    const temphours = rhours < 10 ? '0' + rhours : rhours;
    return temphours + '.' + tempminutes;
  }


  getTotalHoursRow(milestone) {

    const hours = milestone.TimeSpents.map(c => c.MileHrs);
    const timeSpentHours = hours.map(c => c.split(':')).map(c => c[0]).map(Number).reduce((sum, num) =>
      sum + num, 0) + Math.floor(hours.map(c => c.split(':')).map(c => c[1]).map(Number)
        .reduce((sum, num) => sum + num, 0) / 60);
    const timeSpentMin = hours.map(c => c.split(':')).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    const tempminutes = timeSpentMin < 10 ? '0' + timeSpentMin : timeSpentMin;
    const temphours = timeSpentHours < 10 ? '0' + timeSpentHours : timeSpentHours;

    return temphours + ':' + tempminutes;
  }

  getTotalOfTotal() {
    const TotalOfTotal = [];
    for (let i = 0; i < 7; i++) {
      TotalOfTotal.push(this.getTotalHoursColumn(i));
    }

    const timeSpentHours = TotalOfTotal.map(c => c.split(':')).map(c => c[0]).map(Number).
      reduce((sum, num) => sum + num, 0) + Math.floor(TotalOfTotal.map(c => c.split(':')).map(c => c[1])
        .map(Number).reduce((sum, num) => sum + num, 0) / 60);
    const timeSpentMin = TotalOfTotal.map(c => c.split(':')).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    const tempminutes = timeSpentMin < 10 ? '0' + timeSpentMin : timeSpentMin;
    const temphours = timeSpentHours < 10 ? '0' + timeSpentHours : timeSpentHours;
    return temphours + ':' + tempminutes;
  }

  getTotalHoursColumn(column) {
    const timespanArray = [];
    const tempcolumnValues = this.UserMilestones.map(c => c.TimeSpents);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < tempcolumnValues.length; i++) {
      timespanArray.push(tempcolumnValues[i].map(c => c.MileHrs)[column]);
    }
    const timeSpentHours = timespanArray.map(c => c.split(':')).map(c => c[0]).map(Number)
      .reduce((sum, num) => sum + num, 0) + Math.floor(timespanArray.map(c => c.split(':')).map(c => c[1])
        .map(Number).reduce((sum, num) => sum + num, 0) / 60);
    const timeSpentMin = timespanArray.map(c => c.split(':')).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    const tempminutes = timeSpentMin < 10 ? '0' + timeSpentMin : timeSpentMin;
    const temphours = timeSpentHours < 10 ? '0' + timeSpentHours : timeSpentHours;
    return temphours + ':' + tempminutes;
  }


  // *************************************************************************************************
  //  open / close dialog for comment
  // *************************************************************************************************


  openDialog(rowData, type) {
    if (type === 'comments') {
      this.displayComment = true;
      this.timebookingRow = rowData;
    } else {
      this.displayFileUpload = true;
      this.timebookingRow = {
        ...rowData,
        task: rowData
      };
    }
  }


}
// tslint:disable-next-line: class-name
export interface milestoneData {
  ID;
  Entity;
  ProjectCode;
  Milestone;
  isEditable;
}
