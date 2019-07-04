import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, SelectItem, MessageService } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { ElementSchemaRegistry } from '@angular/compiler';
import { eraseStyles } from '@angular/animations/browser/src/util';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
  selector: 'app-time-booking-dialog',
  templateUrl: './time-booking-dialog.component.html',
  styleUrls: ['./time-booking-dialog.component.css']
})
export class TimeBookingDialogComponent implements OnInit {

  @ViewChild('scrollDown', {static: true}) _el: ElementRef;

  modalloaderenable: boolean = true;
  dbClientLegalEntities: any = [{ label: 'Select Client', value: null }];
  timeSpentObject = { taskDay: null, taskHrs: null }
  dateObject = { date: null, time: null };
  AllTaskTimeSpent: any[] = [];
  clonedMilestones: { [s: number]: milestoneData; } = {};
  milestoneData: milestoneData
  tempId: string = '00000';
  count: number = 0;
  UserMilestones: any = [];
  batchContents: any[];
  response: any[];
  weekDays: any[];
  dayscount: any = 0;
  prevArrow: boolean = true;
  nextArrow: boolean = true;
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
  TotalOfTotal: any=[];
  FinalTotal: string ="00:00";
  constructor(public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SharepointoperationService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService
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

  //*************************************************************************************************
  //  Get all clients name
  //*************************************************************************************************


  async getAllClients() {
    this.dbClientLegalEntities.push.apply(this.dbClientLegalEntities, await this.myDashboardConstantsService.getAllClients());

  }


  AddNewRow() {
    console.log(this.UserMilestones);
    const newMilestone = {
      ID: -1, Entity: '', Project: '', Milestone: '', type: "task", dbClientLegalEntities: this.dbClientLegalEntities, dbProjects: [{ label: 'Select Project', value: null }], dbMilestones: [{ label: 'Select Milestone', value: null }], isEditable: true, TimeSpents: this.weekDays.map(c => new Object({ date: c, MileHrs: "00:00", minHrs: "00:00", editable: new Date(this.datePipe.transform(this.MainminDate, 'yyyy-MM-dd')).getTime() <= new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() ? true : false }))
    }

    this.UserMilestones.push(newMilestone);
    this.UserMilestones = [...this.UserMilestones];

    // setTimeout(() => {
    //   this.onRowEditInit(newMilestone);
    //   alert();
    // }, 3000);


  }

  //*************************************************************************************************
  //  Get all projects based on client select 
  //*************************************************************************************************


  async getAllProjects(client, rowData) {
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    let ProjectInformations = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ProjectInformations);
    ProjectInformations.filter += " and (ClientLegalEntity eq '" + client + "')";
    const ProjectInformationsUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', ProjectInformations);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ProjectInformationsUrl);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    var dbProjectInformations = this.response[0].length > 0 ? this.response[0].map(o => new Object({ label: o.ProjectCode + " (" + o.WBJID + ")", value: o.ProjectCode })) : [];

    rowData.dbProjects.push.apply(rowData.dbProjects, dbProjectInformations);
    //this.dbProjects.push.apply( this.dbProjects,dbProjectInformations); 
  }


  //*************************************************************************************************
  //  Get all milestones based on project selection
  //*************************************************************************************************


  async getAllMilestones(projectCode, rowData) {
  debugger;
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    let AllMilestones = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.AllMilestones);

    var month =this.MainminDate.getMonth()+1;

    var EndDate= this.MainminDate.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (this.MainminDate.getDate() < 10 ? "0" + this.MainminDate.getDate() : this.MainminDate.getDate()) + "T23:59:00.000Z";

    AllMilestones.filter = AllMilestones.filter.replace(/{{projectCode}}/gi, projectCode).replace(/{{DateString}}/gi,EndDate );
    const AllMilestonesUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', AllMilestones);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, AllMilestonesUrl);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    console.log("milestone");
    console.log(this.response[0]);
    var dbAllMilestones = this.response.length > 0 ? this.response[0].map(o => new Object({ label: o.Title, value: o.Title })) : [];
    rowData.dbMilestones.push.apply(rowData.dbMilestones, dbAllMilestones);

  }


  //*************************************************************************************************
  //  Get week days   //*************************************************************************************************


  getweekDates(status) {
   
    this.modalloaderenable = true;
    this.dayscount = status === null ? 0 : status === 'increase' ? this.dayscount - 7 : this.dayscount + 7;
    this.weekDays = [];
    var WeekDate = new Date(new Date().getTime() - 60 * 60 * 24 * this.dayscount * 1000)
      , day = WeekDate.getDay()
      , diffToMonday = WeekDate.getDate() - day + (day === 0 ? -6 : 1)

    for (var i = 0; i <= 6; i++) {
      var newDate = new Date(this.datePipe.transform(new Date(WeekDate.setDate(diffToMonday + i)), 'yyyy-MM-dd'));
      this.weekDays.push(newDate);
    }

    if (this.dayscount <= -21) {
      this.nextArrow = false;
      this.prevArrow = true;
    }
    else if (this.dayscount >= 14) {
      this.prevArrow = false;
      this.nextArrow = true;
    }
    else {
      this.prevArrow = true;
      this.nextArrow = true;
    }

    this.getTimeBookingData();
  }


  //*************************************************************************************************
  //  Get  milestone time booking based on week dates
  //*************************************************************************************************


  getUnique(arr, comp) {

    const unique = arr
      .map(e => e[comp])

      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the dead keys & store unique objects
      .filter(e => arr[e]).map(e => arr[e]);

    return unique;
  }

  async getTimeBookingData() {

    var startDate = new Date(this.datePipe.transform(this.weekDays[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
    var endDate = new Date(this.datePipe.transform(this.weekDays[this.weekDays.length - 1], "yyyy-MM-dd") + " 23:59:00").toISOString();

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    let AllMilestones = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTimelineForBooking);
    var minDate = await this.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 4);
    AllMilestones.filter = AllMilestones.filter.replace(/{{userId}}/gi, this.sharedObject.currentUser.id.toString());
    AllMilestones.filter += AllMilestones.filterNotCompleted;

    AllMilestones.filter += AllMilestones.filterDate.replace(/{{startDateString}}/gi, startDate).replace(/{{endDateString}}/gi, endDate);
    const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', AllMilestones);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allTasks = this.response[0];

    var tempMilestones = this.allTasks.map(o => new Object({ Entity: o.Entity, ProjectCode: o.ProjectCode === "Adhoc" ? '-' : o.ProjectCode, Milestone: o.Milestone === 'Select one' ? o.Comments : o.Milestone, type: o.Entity === null ? 'task' : 'Adhoc', TimeSpents: this.weekDays.map(c => new Object({ date: c, MileHrs: "00:00", minHrs: "00:00", editable: new Date(this.datePipe.transform(minDate, 'yyyy-MM-dd')).getTime() < new Date(this.datePipe.transform(c, 'yyyy-MM-dd')).getTime() ? true : false })) }));

    this.UserMilestones = tempMilestones.length > 0 ? this.getUnique(tempMilestones, 'ProjectCode') : [];


    console.log("allTasks")
    console.log(this.allTasks)
    this.allTasks.forEach(task => {

      if (task.TimeSpentPerDay !== null) {
        var timeSpentForTask = task.TimeSpentPerDay.split(/\n/);

        if (timeSpentForTask.indexOf("") > -1) {
          timeSpentForTask.splice(timeSpentForTask.indexOf(""), 1);
        }
        var milestone = this.UserMilestones.find(c => c.Milestone === task.Milestone && c.ProjectCode === task.ProjectCode);
        if(milestone !== undefined)
        {
          timeSpentForTask.forEach(element => {
            var hoursArray = [];
            var taskDay = element.split(':')[0] == element ? element.split('#')[0] : element.split(':')[0].replace(/,/g, ", ");
            var taskHrs = element.split(':')[0] == element ? element.substring(element.indexOf('#') + 1, element.indexOf(".")) : element.split(':')[1] + ":" + element.split(':')[2];
            hoursArray.push(taskHrs);
  
            var currentMilestone = milestone.TimeSpents.find(c => new Date(this.datePipe.transform(c.date, 'yyyy-MM-dd')).getTime() === new Date(this.datePipe.transform(taskDay, 'yyyy-MM-dd')).getTime())
            if (currentMilestone !== undefined) {
              hoursArray.push(currentMilestone.MileHrs);
              var timeSpentHours = hoursArray.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
              var timeSpentMin = hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
              var timeSpentHours1 = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
              currentMilestone.MileHrs = timeSpentMin < 10 ? timeSpentHours1 + ':' + "0" + timeSpentMin : timeSpentHours1 + ':' + timeSpentMin;
  
  
              if (task.Task !== "Time Booking") {
                hoursArray[1] = currentMilestone.minHrs;
                var timeSpentHours = hoursArray.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
                var timeSpentMin = hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
                var timeSpentHours1 = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
                currentMilestone.minHrs = timeSpentMin < 10 ? timeSpentHours1 + ':' + "0" + timeSpentMin : timeSpentHours1 + ':' + timeSpentMin;
              }
  
  
            }
          });
        }
      
      }
      else if (task.ProjectCode === 'Adhoc') {


        var milestone = this.UserMilestones.find(c => c.Entity === task.Entity && c.Milestone === task.Comments);

        var hoursArray = [];
        hoursArray.push(task.TimeSpent);

        if(milestone !== undefined)
        {
          var currentMilestone = milestone.TimeSpents.find(c => new Date(this.datePipe.transform(c.date, 'yyyy-MM-dd')).getTime() === new Date(this.datePipe.transform(task.Actual_x0020_Start_x0020_Date, 'yyyy-MM-dd')).getTime())
          if (currentMilestone !== undefined) {
            hoursArray.push(currentMilestone.MileHrs);
            var timeSpentHours = hoursArray.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
            var timeSpentMin = hoursArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
            var timeSpentHours1 = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
            currentMilestone.MileHrs = timeSpentMin < 10 ? timeSpentHours1 + ':' + "0" + timeSpentMin : timeSpentHours1 + ':' + timeSpentMin;
  
          }
        }
       

      }
    });

    console.log("taskTimeSpent");

    console.log(this.UserMilestones);

    var allProjectCodes = this.UserMilestones !== undefined ? this.UserMilestones.map(c => c.ProjectCode) : [];

    this.batchContents = new Array();

    let ProjectInformation = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    var count = 0;
    var ProjectInformationFilter = '';



    allProjectCodes.forEach(function (value, i) {
      ProjectInformationFilter += "ProjectCode eq '" + value + "'";
      ProjectInformationFilter += i < allProjectCodes.length - 1 ? " or " : '';
    });

    ProjectInformation.filter = ProjectInformationFilter;
    const projectInfoUrl = this.spServices.getReadURL('' + this.constants.listNames.projectInfo.name + '', ProjectInformation);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectInfoUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.projetInformations = this.response[0];
    console.log(this.projetInformations);


    if (this.UserMilestones !== undefined) {
      this.projetInformations.forEach(element => {

        this.UserMilestones.filter(c => c.ProjectCode === element.ProjectCode).map(c => c.Entity = element.ClientLegalEntity);

        this.UserMilestones.filter(c => c.ProjectCode === element.ProjectCode).map(c => c.ID = element.ID);


        this.UserMilestones.filter(c => c.ProjectCode === element.ProjectCode).map(c => c.ProjectCodeTitle = element.ProjectCode + " (" + element.WBJID + ")");

      });


      this.UserMilestones.sort(function (a, b) {
        var nameA = a.type.toLowerCase(), nameB = b.type.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })

    }

    console.log("UserMilestones")
    console.log(this.UserMilestones)

    this.modalloaderenable = false;
  }


  async SaveTimeBooking() {

    this.modalloaderenable = true;
    var dbTasks = this.UserMilestones.filter(c => c.type === 'task');
    for (var i = 0; i < dbTasks.length; i++) {

      var dateArray = [];
      for (var j = 0; j < dbTasks[i].TimeSpents.length; j++) {
        const dateObject = {
          date: this.datePipe.transform(dbTasks[i].TimeSpents[j].date, 'EE, MMM d, y'),
          time: await this.DifferenceHours(dbTasks[i].TimeSpents[j].minHrs, dbTasks[i].TimeSpents[j].MileHrs)
        }
        dateArray.push(dateObject);
      }

      var timeSpentString = dateArray.map(c => (c.date + ":" + c.time).replace(/ /g, '')).join('\n');
      var timeSpentHours = dateArray.map(c => c.time.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(dateArray.map(c => c.time.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
      var timeSpentMin = dateArray.map(c => c.time.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
      var timeSpentHours1 = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
      var totalTimeSpent = timeSpentMin < 10 ? timeSpentHours1 + ':' + "0" + timeSpentMin : timeSpentHours1 + ':' + timeSpentMin;


      var existingObj = this.allTasks.find(c => c.ProjectCode === dbTasks[i].ProjectCode && c.Milestone === dbTasks[i].Milestone && c.Task === "Time Booking")

      if (existingObj !== undefined) {
        if (existingObj.TimeSpentPerDay !== timeSpentString) {
          existingObj.TimeSpent = totalTimeSpent;
          existingObj.TimeSpentPerDay = timeSpentString;

          await this.spServices.update(this.constants.listNames.Schedules.name, existingObj.ID, existingObj, "SP.Data.SchedulesListItem");
        }
      }
      else {
        if (dbTasks[i].Milestone !== "" || dbTasks[i].ProjectCode !== "" || dbTasks[i].Entity !== "") {
          const obj = {
            __metadata: {
              'type': 'SP.Data.SchedulesListItem'
            },
            Actual_x0020_End_x0020_Date: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[6].date, 'yyyy-MM-dd') + "T09:00:00.000"),
            Actual_x0020_Start_x0020_Date: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[0].date, 'yyyy-MM-dd') + "T09:00:00.000"),
            DueDate: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[6].date, 'yyyy-MM-dd') + "T09:00:00.000"),
            ExpectedTime: "0",
            Milestone: dbTasks[i].Milestone,
            ProjectCode: dbTasks[i].ProjectCode,
            StartDate: new Date(this.datePipe.transform(dbTasks[i].TimeSpents[0].date, 'yyyy-MM-dd') + "T09:00:00.000"),
            Status: "Completed",
            Task: "Time Booking",
            TimeSpent: totalTimeSpent,
            TimeSpentPerDay: timeSpentString,
            Title: dbTasks[i].ProjectCode + " TB " + this.sharedObject.currentUser.title + " " + this.datePipe.transform(new Date(), 'MMM dd, yyyy'),
            AssignedToId: this.sharedObject.currentUser.id,
          }

          const folderUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/Lists/Schedules/" + dbTasks[i].ProjectCode;
          await this.spServices.createAndMove(this.constants.listNames.Schedules.name, obj, folderUrl);

        }
      }
    }

    this.modalloaderenable = false;
    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Time booking updated successfully.' });

    this.ref.close();

  }



  async DifferenceHours(startTime, EndTime) {
    var TotalMinDiff = ((EndTime.split(':')[0] * 60) + parseInt(EndTime.split(':')[1])) - ((startTime.split(':')[0] * 60) + parseInt(startTime.split(':')[1]))
    var hours = (TotalMinDiff / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    var tempminutes = rminutes < 10 ? "0" + rminutes : rminutes;
    var temphours = rhours < 10 ? "0" + rhours : rhours;
    return temphours + ":" + tempminutes;
  }


  getTotalHoursRow(milestone) {
   
    var hours = milestone.TimeSpents.map(c => c.MileHrs);
    var timeSpentHours = hours.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(hours.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
    var timeSpentMin = hours.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    var tempminutes = timeSpentMin < 10 ? "0" + timeSpentMin : timeSpentMin;
    var temphours = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
  
    return temphours + ":" + tempminutes;
  }

  getTotalOfTotal()
  {
    var TotalOfTotal=[];
      for(var i=0;i< 7 ;i++)
      {
        TotalOfTotal.push (this.getTotalHoursColumn(i));
      }

      var timeSpentHours = TotalOfTotal.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(TotalOfTotal.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
      var timeSpentMin = TotalOfTotal.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
      var tempminutes = timeSpentMin < 10 ? "0" + timeSpentMin : timeSpentMin;
      var temphours = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
      return temphours + ":" + tempminutes;
  }

  getTotalHoursColumn(column)
  {
    var timespanArray=[];
    var tempcolumnValues = this.UserMilestones.map(c=>c.TimeSpents);
    for(var i=0;i<tempcolumnValues.length;i++)
    {
      timespanArray.push(tempcolumnValues[i].map(c=>c.MileHrs)[column]);
    }
    var timeSpentHours = timespanArray.map(c => c.split(":")).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) + Math.floor(timespanArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
    var timeSpentMin = timespanArray.map(c => c.split(":")).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    var tempminutes = timeSpentMin < 10 ? "0" + timeSpentMin : timeSpentMin;
    var temphours = timeSpentHours < 10 ? "0" + timeSpentHours : timeSpentHours;
    return temphours + ":" + tempminutes;
  }

}
export interface milestoneData {
  ID,
  Entity,
  ProjectCode,
  Milestone,
  isEditable
}