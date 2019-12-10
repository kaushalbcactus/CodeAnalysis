import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng/api';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-time-spent-dialog',
  templateUrl: './time-spent-dialog.component.html',
  styleUrls: ['./time-spent-dialog.component.css']
})
export class TimeSpentDialogComponent implements OnInit {

  data: any;
  batchContents: any[];
  response: any;
  dateArray: any[];
  currentTaskTimeSpent: any;
  timeSpentObject = { taskDay: null, taskHrs: null, taskMins: null }
  modalloaderenable: boolean;
  @Input() taskData: any;
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
  task: any;
  SelectedTabType: any;
  constructor(public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    public messageService: MessageService,
  ) { }

  ngOnInit() {

    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    if (this.data !== undefined) {
      if (this.config.data) {
        this.getDatesForTimespent(this.data.task);
      }
      else {
        this.getDatesForTimespent(this.data);
      }

      this.SelectedTabType = this.data.tab;
      this.modalloaderenable = true;

    }

  }


  // *************************************************************************************************************************************
  //  onchange call when modal open
  // *************************************************************************************************************************************

  ngOnChanges(changes: SimpleChanges) {

    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    this.getDatesForTimespent(this.data);
    this.SelectedTabType = this.data.tab;
    this.modalloaderenable = true;

  }


  // *************************************************************************************************************************************
  //  Chceck task Status FOR TIME SPENT
  // *************************************************************************************************************************************

  async getDatesForTimespent(task) {
    this.task = task;
    // var previousStatus =  this.data.status;
    // if (previousStatus === "Completed" || previousStatus === "AllowCompletion" || previousStatus === "Auto Closed") {

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    let TimeSpent = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.TimeSpent);
    //TimeSpent.filter = TimeSpent.filter.replace(/{{taskId}}/gi, task.ID);

    // const myTimeSpentUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', TimeSpent);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTimeSpentUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.response = await this.spServices.readItem(this.constants.listNames.Schedules.name, task.ID, TimeSpent);

    this.currentTaskTimeSpent = this.response;
    this.dateArray = [];
    const todayDate = new Date(this.datePipe.transform(new Date(), 'MMM d, y'));
    let startDate = new Date(this.datePipe.transform(task.StartDate, 'MMM d, y'));


    if (this.currentTaskTimeSpent.TimeSpentPerDay) {
      const timeSpentForTask = this.currentTaskTimeSpent.TimeSpentPerDay.split(/\n/);

      if (timeSpentForTask.indexOf("") > -1) {
        timeSpentForTask.splice(timeSpentForTask.indexOf(""), 1);
      }

      startDate = timeSpentForTask[0].split(':')[0] === timeSpentForTask[0] ? new Date(timeSpentForTask[0].split('#')[0]) : new Date(timeSpentForTask[0].split(':')[0].replace(/,/g, ", "));

      let endDate = this.SelectedTabType === 'MyCompletedTask' || task.Status === "Completed" ? new Date(this.datePipe.transform(new Date(new Date(task.Actual_x0020_End_x0020_Date)), 'MMM d, y')) : new Date(this.datePipe.transform(new Date(), 'MMM d, y'));

      endDate = task.Status === "Auto Closed" ? new Date(this.datePipe.transform(task.DueDate, 'MMM d, y')) : endDate;

      // var days = this.CalculateWorkingDays(startDate, endDate);
      this.dateArray = await this.CalculatePastBusinessDays(new Date(startDate), new Date(endDate));
      this.dateArray.reverse();
    }
    else {
      if (startDate > todayDate) {

        if (this.SelectedTabType === 'MyCompletedTask' || task.Status === "Completed" || task.Status === "Auto Closed") {

          endDate = task.Status === "Auto Closed" ? new Date(this.datePipe.transform(task.DueDate, 'MMM d, y')) : new Date(new Date(this.datePipe.transform(new Date(task.Actual_x0020_End_x0020_Date), 'MMM d,y')));

          startDate = task.Status === "Auto Closed" ? new Date(this.datePipe.transform(task.StartDate, 'MMM d, y')) : startDate;
        }
        else {
          startDate = await this.myDashboardConstantsService.CalculateminstartDateValue(todayDate, 3);
          var endDate = new Date(todayDate.setDate(todayDate.getDate()))

        }
        this.dateArray = await this.CalculatePastBusinessDays(startDate, endDate);
        this.dateArray.reverse();
      }
      else {
        var StartDate = startDate.getDay() === 6 ? new Date(startDate.setDate(startDate.getDate() - 1)) : startDate.getDay() === 0 ? new Date(startDate.setDate(startDate.getDate() - 2)) : new Date(startDate.setDate(startDate.getDate()))

        startDate = await this.myDashboardConstantsService.CalculateminstartDateValue(StartDate, 3);

        if (this.SelectedTabType === 'MyCompletedTask' || task.Status === "Completed" || task.Status === "Auto Closed") {

          endDate = task.Status === "Auto Closed" ? new Date(this.datePipe.transform(task.DueDate, 'MMM d, y')) : new Date(new Date(this.datePipe.transform(new Date(task.Actual_x0020_End_x0020_Date), 'MMM d,y')));

          startDate = task.Status === "Auto Closed" ? new Date(this.datePipe.transform(task.StartDate, 'MMM d, y')) : startDate;

          this.dateArray = await this.CalculatePastBusinessDays(startDate, endDate);
          this.dateArray.reverse();
        }
        else {
          this.dateArray = await this.CalculatePastBusinessDays(startDate, todayDate);
          this.dateArray.reverse();
        }
      }
    }


    if (this.currentTaskTimeSpent !== undefined) {
      if (this.currentTaskTimeSpent.TimeSpentPerDay !== null) {
        var timeSpentForTask = this.currentTaskTimeSpent.TimeSpentPerDay.split(/\n/);

        if (timeSpentForTask.indexOf("") > -1) {
          timeSpentForTask.splice(timeSpentForTask.indexOf(""), 1);
        }

        timeSpentForTask.forEach(element => {

          this.timeSpentObject.taskDay = element.split(':')[0] == element ? element.split('#')[0] : element.split(':')[0].replace(/,/g, ", ");
          this.timeSpentObject.taskHrs = element.split(':')[0] == element ? element.substring(element.indexOf('#') + 1, element.indexOf(".")) : element.split(':')[1] + ":" + element.split(':')[2];


          if (this.dateArray.find(c => new Date(c.date).getTime() === new Date(this.timeSpentObject.taskDay).getTime()) !== undefined) {
            this.dateArray.find(c => new Date(c.date).getTime() === new Date(this.timeSpentObject.taskDay).getTime()).time = this.timeSpentObject.taskHrs;
          }

        });

      }


    }
    //  }

    this.modalloaderenable = false;
  }

  SetTime(time, timeObj) {

    var timespent = time.split(':')[0] % 12 + ":" + time.split(':')[1];
    timeObj.time = timespent;
  }


  // *************************************************************************************************************************************
  //  Calculate  pastworking  days for time spent
  // *************************************************************************************************************************************

  async CalculatePastBusinessDays(startDate, endDate) {

    var businessDates = [];
    var enableEditDate = await this.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 3);
    while (startDate <= endDate) {
      const copyDate = new Date(endDate.getTime());
      if (copyDate >= new Date(this.datePipe.transform(enableEditDate, 'MMM d,y')) && copyDate <= new Date()) {
        businessDates.push({ actualDate: copyDate, date: this.datePipe.transform(copyDate, 'EE, MMM d, y'), time: '00:00', edited: true });
      }
      else {
        businessDates.push({ actualDate: copyDate, date: this.datePipe.transform(copyDate, 'EE, MMM d, y'), time: '00:00', edited: false });
      }

      endDate = new Date(endDate.setDate(endDate.getDate() - 1));
    }
    return businessDates;
  }


  // *************************************************************************************************************************************
  //  Calculate  working days
  // *************************************************************************************************************************************



  CalculateWorkingDays(startDate, endDate) {
    var tempDate = new Date(startDate);
    var days = 0;
    while (endDate > tempDate) {

      tempDate = new Date(tempDate.setDate(tempDate.getDate() + 1));
      if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
        days += 1;
      }
    }
    return days;
  }

  // *************************************************************************************************************************************
  //  Cancel Time Spent
  // *************************************************************************************************************************************


  cancelTimeSpent() {
    this.ref.close();
  }


  // *************************************************************************************************************************************
  //  Save Time Spent
  // *************************************************************************************************************************************


  async saveTimeSpent() {
    const data = {
      task: this.task,
      dateArray: this.dateArray
    }
    if (this.config.data) {
      await this.saveTimeSpentdb(this.task, this.dateArray)
      this.ref.close(data);
    } else {
      this.modalloaderenable = true;
      await this.saveTimeSpentdb(this.task, this.dateArray)
      this.modalloaderenable = false;
    }

  }



  // *************************************************************************************************************************************
  //  Save time spent  database
  // *************************************************************************************************************************************


  async saveTimeSpentdb(task, dateArray) {

    let ActualStartDate;
    if (dateArray.find(c => c.time !== '00:00') !== undefined) {
      //   this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Updating...' });
      ActualStartDate = this.datePipe.transform(dateArray.find(c => c.time !== '00:00').actualDate, 'yyyy-MM-dd') + 'T09:00:00.000';

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please define time.' });
      return false;
    }
    if (task !== undefined) {
      ActualStartDate = task.Actual_x0020_Start_x0020_Date !== null ? task.Actual_x0020_Start_x0020_Date : new Date(ActualStartDate);
    }


    const timeSpentString = dateArray.map(c => (c.date + ':' + c.time).replace(/ /g, '')).join('\n');
    const timeSpentHours = dateArray.map(c => c.time.split(':')).map(c => c[0]).map(Number).reduce((sum, num) => sum + num, 0) +
      Math.floor(dateArray.map(c => c.time.split(':')).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) / 60);
    const timeSpentMin = dateArray.map(c => c.time.split(':')).map(c => c[1]).map(Number).reduce((sum, num) => sum + num, 0) % 60;
    const totalTimeSpent = timeSpentMin < 10 ? timeSpentHours + '.' + '0' + timeSpentMin : timeSpentHours + '.' + timeSpentMin;
    const jsonData = {
      Actual_x0020_Start_x0020_Date: ActualStartDate,
      TimeSpent: totalTimeSpent,
      TimeSpentPerDay: timeSpentString,
      Status: task.Status === 'Not Started' ? 'In Progress' : task.Status,

      ActiveCA: 'No'
    };
    await this.spServices.updateItem(this.constants.listNames.Schedules.name, task.ID, jsonData, 'SP.Data.SchedulesListItem');
    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Task Time updated successfully.' });


    if (task.ParentSlot) {
      await this.myDashboardConstantsService.getCurrentAndParentTask(task, jsonData.Status);
    }
  }


}


