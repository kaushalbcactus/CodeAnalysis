import { Component, OnInit, ViewChild } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import interactionPlugin from '@fullcalendar/interaction';
import { ConstantsService } from '../Services/constants.service';
import { GlobalService } from '../Services/global.service';
import { SPOperationService } from '../Services/spoperation.service';
import { DatePipe } from '@angular/common';
import { LeaveCalendarConstantsService } from './services/leave-calendar-constants.service';
import { CommonService } from '../Services/common.service';

declare var Tooltip: any;


@Component({
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.css']
})
export class LeaveCalendarComponent implements OnInit {
  events = [];
  options: any;
  CalendarLoader = true;
  leaves = [];
  @ViewChild('calendar', { static: true }) fullCalendar: any;
  allLeaves = [];
  constructor(
    private constants: ConstantsService,
    public globalService: GlobalService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private leaveCalendarConstantsService: LeaveCalendarConstantsService) { }

  ngOnInit() {
    this.globalService.currentTitle = 'Leave Calendar';

    this.options = {

      // listPlugin
      plugins: [dayGridPlugin, timeGridPlugin, bootstrapPlugin, interactionPlugin],
      defaultDate: new Date(),
      weekends: false,
      header: {
        left: ' prev title next',
        center: '',
        // right: ''
        right: 'AddnewEvent today,dayGridMonth,timeGridWeek,'
      },
      aspectRatio: 2.4,
      // handleWindowResize: true,
      // windowResizeDelay: 200,
      eventLimit: 4, // for all non-TimeGrid views
      views: {
        basic: {
          eventLimit: 4
        },
        agenda: {
          eventLimit: 4
        },
        week: {
          eventLimit: 4
        },
        day: {
          eventLimit: 4
        },
        dayGridMonth: {
          columnHeaderFormat: {
            weekday: 'long',

          },
        }
      },
      defaultView: 'dayGridMonth',
      titleFormat: {
        month: 'short',
        year: 'numeric',
        day: 'numeric',
      },
      columnHeaderFormat: {
        weekday: 'short',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
      },
      buttonText: {
        today: 'current',
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

    };

    this.getleaves(true, null, null);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterViewInit() {
    this.bindEvents();
  }

  // **************************************************************************************************
  //   to get leaves on button click
  // **************************************************************************************************

  bindEvents() {

    const prevButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-prev-button');
    const nextButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-next-button');
    const todayButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-today-button');
    const monthButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-dayGridMonth-button');
    const weekButton = this.fullCalendar.el.nativeElement.getElementsByClassName('fc-timeGridWeek-button');

    nextButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getleaves(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    prevButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getleaves(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);
    });

    monthButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getleaves(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);

    });
    weekButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getleaves(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);


    });

    todayButton[0].addEventListener('click', () => {
      this.CalendarLoader = true;
      this.getleaves(false, this.fullCalendar.calendar.state.dateProfile.currentRange.start,
        this.fullCalendar.calendar.state.dateProfile.currentRange.end);
    });
  }

  // ***************************************************************************************************
  //  convert date into string
  // ***************************************************************************************************

  async getStartEndDates(startDate, endDate) {
    const filterDates = [];
    const startmonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;
    filterDates.push(startDate.getFullYear() + '-' + (startmonth < 10 ? '0' + startmonth : startmonth)
      + '-' + (startDate.getDate() < 10 ? '0' + startDate.getDate() : startDate.getDate()) + 'T00:00:01.000Z');
    filterDates.push(endDate.getFullYear() + '-' + (endMonth < 10 ? '0' + endMonth : endMonth) + '-' +
      (endDate.getDate() < 10 ? '0' + endDate.getDate() : endDate.getDate()) + 'T23:59:00.000Z');
    return filterDates;
  }


  // *************************************************************************************************
  // Get leaves based on dates
  // *************************************************************************************************

  async getleaves(firstLoad, startDate, endDate) {
    let filterDates = [];
    if (firstLoad) {
      const date = new Date();
      startDate = new Date(date.getFullYear(), date.getMonth(), 1),
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    filterDates = await this.getStartEndDates(startDate, endDate);
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    this.leaves = [];

    const leavesGet = Object.assign({}, options);
    const leavesQuery = Object.assign({}, this.leaveCalendarConstantsService.leaveCalendarComponent.LeaveCalendar);
    leavesGet.url = this.spServices.getReadURL('' + this.constants.listNames.LeaveCalendar.name +
      '', leavesQuery);
    leavesGet.url = leavesGet.url.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
    leavesGet.type = 'GET';
    leavesGet.listName = this.constants.listNames.LeaveCalendar.name;
    batchURL.push(leavesGet);
    this.commonService.SetNewrelic('LeaveCalendar', 'leaveCalendar', 'GetLevaesBasedOnSDED', "GET");
    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {

        this.allLeaves = arrResults[0].retItems;

        this.allLeaves.forEach(element => {
          // tslint:disable 
          const eventObj = {

            'title': element.Title,
            'id': element.Id,
            'start': new Date(element.EventDate),
            // 'end': new Date(this.datePipe.transform(element.EventDate, "yyyy-MM-dd")).getTime() !== new Date(this.datePipe.transform(element.EndDate, "yyyy-MM-dd")).getTime() ? new Date(new Date(element.EndDate).setDate(new Date(element.EndDate).getDate() + 1)) : new Date(element.EndDate),
            'end': new Date(element.EndDate),
            'backgroundColor': element.IsHalfDay ? '#808080' : '#e60000',

          }
          // tslint:enable
          this.leaves.push(eventObj);

        });
      }
    }
    this.leaves = [...this.leaves];
    this.CalendarLoader = false;

  }

}
