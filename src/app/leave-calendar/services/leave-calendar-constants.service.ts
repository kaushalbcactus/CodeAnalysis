import { Injectable } from '@angular/core';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class LeaveCalendarConstantsService {
  tasks: any[];
  batchContents: any[];
  response: any[];
  NextPreviousTask: any[];
  DocumentArray: any[];
  projectInfo: any;
  allDocuments: any;
  jcSubId: any;
  jcId: any;
  Emailtemplate: any;

  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    public messageService: MessageService, ) { }

  leaveCalendarComponent = {

    LeaveCalendar: {

      select: 'ID,EventDate,EndDate,IsHalfDay,Title',
      filter: "IsActive eq 'Yes'  and ((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
      orderby: 'Created',
      top: 4500
    },

  };

}




