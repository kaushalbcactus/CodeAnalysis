import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { eraseStyles } from '@angular/animations/browser/src/util';

@Component({
  selector: 'app-block-time-dialog',
  templateUrl: './block-time-dialog.component.html',
  styleUrls: ['./block-time-dialog.component.css']
})
export class BlockTimeDialogComponent implements OnInit {
  data: any;
  batchContents: any[];
  response: any[];
  SelectedClientLegalEntity: string;
  modalloaderenable = true; 
  ClientLegalEntities: { label: string; value: string; }[];
  cars: { label: string; value: string; }[];
  starttime: any;
  endtime: any;
  eventDate: any;
  eventEndDate: any;
  yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);
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
  minDateValue: any;
  IsHalfDay = false;
  minEndTime = '12:00 am';
  commment: any;
  maxDate: Date;
  mode: any;
  halfDayEnable = false;
  eventEndDated: any;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService) { }

  async ngOnInit() {


    this.data = this.config.data;
    this.getMaxDate();
    if (this.data.task !== undefined) {
      this.SelectedClientLegalEntity = this.data.timeblockType !== 'Admin' &&
        this.data.timeblockType !== 'Training' && this.data.timeblockType !== 'Internal Meeting' ?
        this.data.task.Entity : undefined;
      this.eventDate = new Date(this.datePipe.transform(this.data.task.StartDate, 'dd MMM, yyyy'));
      this.starttime = this.data.timeblockType !== 'Admin' ?
        this.datePipe.transform(this.data.task.StartDate, 'hh:mm aa').toLowerCase() : this.data.task.TimeSpent;
      this.minEndTime = this.starttime;
      this.minDateValue = await this.myDashboardConstantsService.CalculateminstartDateValue(this.eventDate, 3);
      this.endtime = this.datePipe.transform(this.data.task.DueDate, 'hh:mm aa').toLowerCase();
      this.commment = this.data.task.TaskComments !== null ? this.data.task.TaskComments : undefined;

    } else {
      if (this.data.timeblockType !== 'Leave') {
        this.minDateValue = await this.myDashboardConstantsService.CalculateminstartDateValue(new Date(), 3);
      } else {
        const WeekDate = new Date(new Date().getTime() - 60 * 60 * 24 * 14 * 1000);
        const day = WeekDate.getDay();
        const monday = (WeekDate.getDate() - day + (day === 0 ? -6 : 1)) - 1;
        const tempdate = new Date(WeekDate.setDate(monday));
        const newDate = new Date(tempdate.getTime());
        this.minDateValue = new Date(newDate.setDate(newDate.getDate() + 1));
      }
    }
    this.mode = this.data.mode;

    if (this.data.timeblockType !== 'Admin' && this.data.timeblockType !== 'Leave') {
      this.modalloaderenable = true;
      this.getAllClients();
    } else {

      this.modalloaderenable = false;
    }
  }

  // *************************************************************************************************
  //  Get all clients name
  // *************************************************************************************************
  async getAllClients() {
    this.ClientLegalEntities = await this.myDashboardConstantsService.getAllClients();
    this.modalloaderenable = false;
  }

  // *************************************************************************************************
  //  Delete booking
  // *************************************************************************************************
  MarkAsDelete() {
    const obj = {
      IsDeleted: true
    };
    this.ref.close(obj);
  }



  SetTime(time) {
    // const timespent = (time.split(':')[0] % 12) > 12 ?
    //   time.split(':')[0] % 12 + ':' + time.split(':')[1] : time.split(':')[0] + ':' + time.split(':')[1];
    const timespent = time.split(':')[0] % 12 + ':' + time.split(':')[1];
    this.starttime = timespent;
  }


  // *************************************************************************************************
  //  Save booking / create Meeting
  // *************************************************************************************************


  async saveBooking() {

    if ((!this.SelectedClientLegalEntity && this.data.timeblockType !== 'Admin') &&
      (!this.SelectedClientLegalEntity && this.data.timeblockType !== 'Internal Meeting') &&
      (!this.SelectedClientLegalEntity && this.data.timeblockType !== 'Training')) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Client.' });
      return false;
    } else if (!this.eventDate) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select  Date.' });
      return false;
    } else if (!this.starttime) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Define Start Time.' });
      return false;
    } else if (!this.endtime && this.data.timeblockType !== 'Admin') {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Define End Time.' });
      return false;
    } else if (!this.commment) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please add Comments.' });
      return false;
    } else if (this.starttime === this.endtime) {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'End Time should be Greater than Start Time.'
      });
      return false;
    } else if (this.starttime === '0:00') {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message',
        detail: 'Total hours should be Greater than 0.'
      });
      return false;
    } else {
      let timeDifference;
      let startDateTime = new Date();
      let endDateTime = new Date();
      if (this.data.timeblockType !== 'Admin') {
        const totalsHours = await this.ConvertTimeformat(this.starttime);
        const totaleHours = await this.ConvertTimeformat(this.endtime);

        startDateTime = new Date(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd') + 'T' + totalsHours + ':00.000');
        endDateTime = new Date(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd') + 'T' + totaleHours + ':00.000');
        timeDifference = await this.myDashboardConstantsService.differenceBetweenHours(startDateTime, endDateTime);
      } else {
        startDateTime = new Date(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd') + 'T09:00:00.000');
        endDateTime = new Date(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd') + 'T19:00:00.000');
      }



      const obj = {
        __metadata: this.mode === 'create' ? {
          // tslint:disable-next-line: object-literal-key-quotes
          'type': 'SP.Data.SchedulesListItem'
        } : undefined,
        Title: 'Adhoc ' + this.datePipe.transform(this.eventDate, 'dd MMM') + ' ' + this.sharedObject.currentUser.title,
        Entity: this.data.timeblockType === 'Admin' || this.data.timeblockType === 'Training' ||
          this.data.timeblockType === 'Internal Meeting' ? 'CACTUS Internal India' : this.SelectedClientLegalEntity,
        ProjectCode: 'Adhoc',
        Task: 'Adhoc',
        StartDate: startDateTime,
        DueDate: endDateTime,
        Actual_x0020_Start_x0020_Date: startDateTime,
        Actual_x0020_End_x0020_Date: endDateTime,
        ExpectedTime: '0',
        TimeSpent: this.data.timeblockType === 'Admin' ? this.starttime.replace(':', '.') : timeDifference.replace(':', '.'),
        Comments: this.data.timeblockType === 'Client Meeting / Training' ?
          'Client meeting / client training' : this.data.timeblockType === 'Internal Meeting' ?
            'Internal meeting' : this.data.timeblockType === 'Training' ? 'Internal training' : 'Administrative Work',
        TaskComments: this.commment,
        Status: 'Completed',
        AssignedToId: this.sharedObject.currentUser.userId,
        TimeZone: this.sharedObject.DashboardData.ResourceCategorization.find(c => c.ID ===
          this.sharedObject.currentUser.userId) !== undefined ?
          this.sharedObject.DashboardData.ResourceCategorization.find(c => c.ID ===
            this.sharedObject.currentUser.userId).TimeZone !== undefined ?
            this.sharedObject.DashboardData.ResourceCategorization.find(c => c.ID ===
              this.sharedObject.currentUser.userId).TimeZone.Title : '5.5' : '5.5',
        TATStatus: this.data.timeblockType === 'Admin' ? 'Yes' : 'No',



      };
      this.ref.close(obj);
    }
  }


  // *************************************************************************************************
  //  Save / create Leave
  // *************************************************************************************************



  async saveLeave() {


    if (!this.eventDate) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Start Date.' });
      return false;
    } else if (!this.eventEndDate) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select End Date.' });
      return false;
    } else if (!this.commment) {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please add Comments.' });
      return false;
    } else {
      debugger;
      const obj = {
        __metadata: {
          // tslint:disable-next-line: object-literal-key-quotes
          'type': this.constants.listNames.LeaveCalendar.type
        },
       
        Title: this.IsHalfDay ? this.sharedObject.currentUser.title + ' on half day leave' :
          this.sharedObject.currentUser.title + ' on leave',
        EventDate: new Date(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd') + 'T09:00:00.000'),
        EndDate: new Date(this.datePipe.transform(this.eventEndDate, 'yyyy-MM-dd') + 'T19:00:00.000'),
        Description: this.commment,
        IsHalfDay: this.IsHalfDay,
        IsActive: 'Yes',
        UserNameId: this.sharedObject.currentUser.userId
      };
      const validation = await this.validateLeave(this.datePipe.transform(this.eventDate, 'yyyy-MM-dd')
        + 'T09:00:00.000', this.datePipe.transform(this.eventEndDate, 'yyyy-MM-dd') + 'T19:00:00.000');
      if (validation) {
        this.ref.close(obj);
      } else {

        this.messageService.add({
          key: 'custom', severity: 'warn', summary: 'Warning Message',
          detail: 'Leave already exist between ' +
            this.datePipe.transform(this.eventDate, 'MMM dd, yyyy') + ' and ' + this.datePipe.transform(this.eventEndDate, 'MMM dd, yyyy')
        });

      }

    }
  }

  async validateLeave(EventDate, EndDate) {
    let validation = true;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    const leavesGet = Object.assign({}, options);
    leavesGet.url = this.spServices.getReadURL(this.constants.listNames.LeaveCalendar.name,
                           this.myDashboardConstantsService.mydashboardComponent.LeaveCalendar);
    leavesGet.url = leavesGet.url.replace(/{{currentUser}}/gi,
      this.sharedObject.currentUser.userId.toString()).replace(/{{startDateString}}/gi,
        EventDate).replace(/{{endDateString}}/gi, EndDate);
    leavesGet.type = 'GET';
    leavesGet.listName = this.constants.listNames.LeaveCalendar.name;
    batchURL.push(leavesGet);

    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {
        validation = false;
      }
    }
    return validation;
  }

  // *************************************************************************************************
  //  convert Am / Pm into 24 hours format
  // *************************************************************************************************


  async ConvertTimeformat(time) {
    let hours = Number(time.match(/^(\d+)/)[1]);
    const minutes = Number(time.match(/:(\d+)/)[1]);
    const AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM === 'pm' && hours < 12) { hours = hours + 12; }
    if (AMPM === 'am' && hours === 12) { hours = hours - 12; }

    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10) { sHours = '0' + sHours; }
    if (minutes < 10) { sMinutes = '0' + sMinutes; }

    return sHours + ':' + sMinutes;

  }




  // *************************************************************************************************
  //  Cancel booking
  // *************************************************************************************************


  cancelTBooking() {
    this.ref.close();
  }


  // *************************************************************************************************
  //  set minimum end time based on start time
  // *************************************************************************************************

  SetEndTime(event) {

    this.endtime = undefined;
    this.minEndTime = event;

  }

  getMaxDate() {
    const currentDate = new Date();
    const tempdate = new Date(currentDate.setDate(currentDate.getDate() + (3 * 7)));
    const lastday = tempdate.getDate() - (tempdate.getDay() - 1) + 4;
    this.maxDate = this.data.timeblockType === 'Admin' ? new Date() : new Date(tempdate.setDate(lastday));
  }

  // *************************************************************************************************
  //  Enable  disable half day option
  // *************************************************************************************************


  EnableHalfDay() {

    if (new Date(this.datePipe.transform(this.eventDate, 'MMM dd, yyyy')).getTime() ===
      new Date(this.datePipe.transform(this.eventEndDate, 'MMM dd, yyyy')).getTime()) {

      this.halfDayEnable = true;
    } else {
      this.IsHalfDay = false;
      this.halfDayEnable = false;
    }


  }

}
