import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedConstantsService {

  constructor() { }
  // tslint:disable
  public userCapacity = {
    fetchTasks: {
      select: 'ID,Milestone,SubMilestones,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDate,TimeZone',
      filter: "(AssignedTo/Id eq {{userID}}) and(" +
              "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
              "or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}')"+
              " or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}')" +
              ") and Status ne 'Abandon' and Status ne 'Deleted'",
      top: '4500',
      orderby: 'StartDate'
    },
    getProjectInformation: {
      select: 'WBJID',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      top: '1'
    },
    getProjectTasks : {
      select: 'ID,Task,Title,ExpectedTime,StartDate,DueDate,TimeZone,Status,AssignedToText,ContentType/Name',
      expand: 'ContentType',
      filter: "startswith(Title,'{{projectCode}}') and Milestone eq '{{milestone}}'" +
              "Status ne 'Abandon' and Status ne 'Completed' and Status ne 'Deleted' and Status ne 'Auto Closed'",
      top: '4500'
    },
    leaveCalendar : {
      // tslint:disable 
      select: "ID,EventDate,EndDate,IsHalfDay",
      filter: "(UserName/Id eq {{userId}} and IsActive eq 'Yes' ) and((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
      orderby: "Created",
      top: 4500
      // tslint:enable
    },
    availableHrs : {
      // tslint:disable 
      select: "ID,ResourceID,WeekStartDate,WeekEndDate,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,MondayLeave,TuesdayLeave,WednesdayLeave,ThursdayLeave,FridayLeave",
      filter: "ResourceID eq {{ResourceId}} and((WeekStartDate ge '{{startDateString}}' and WeekStartDate le '{{endDateString}}') or (WeekEndDate ge '{{startDateString}}' and WeekEndDate le '{{endDateString}}') or (WeekStartDate le '{{startDateString}}' and WeekEndDate ge '{{endDateString}}'))",
      orderby: "WeekStartDate asc",
      top: 4500
      // tslint:enable
    }
  };
}
