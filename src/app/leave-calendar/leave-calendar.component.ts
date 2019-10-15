import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import interactionPlugin from '@fullcalendar/interaction';
@Component({
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.css']
})
export class LeaveCalendarComponent implements OnInit {
  events = [];
  options: any;
  constructor() { }

  ngOnInit() {
    this.options = {

      // listPlugin
      plugins: [dayGridPlugin, timeGridPlugin, bootstrapPlugin, interactionPlugin],
      defaultDate: new Date(),
      weekends: false,
      header: {
        left: ' prev title next',
        center: '',
        right: 'AddnewEvent today,dayGridMonth,timeGridWeek,'
      },
      aspectRatio: 2.5,

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

    };
  }

}
