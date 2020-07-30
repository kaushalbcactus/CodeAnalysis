import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedConstantsService {

  constructor() { }
  // tslint:disable
  public userCapacity = {
    fetchTasks: {
      select: 'ID,Milestone,ProjectCode,SubMilestones,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDateDT,TimeZoneNM,ParentSlot,AllocationPerDay,CommentsMT,Entity,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      filter: "(AssignedTo/Id eq {{userID}}) and(" +
        "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
        "or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}')" +
        " or (StartDate le '{{startDateString}}' and DueDateDT ge '{{endDateString}}')" +
        ") and Status ne 'Abandon' and Status ne 'Deleted' and Task ne 'Time Booking' and Task ne 'Send to client' and Task ne 'Client Review' ",
      filterNotConfirmed: "and Status ne '{{taskStatus}}'",
      expand: 'AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      top: '4500',
      orderby: 'StartDate'
    },

    fetchAdhocTasks: {
      select: 'ID,Task,Status,Title,TimeSpent,StartDate,DueDateDT,TimeZoneNM,CommentsMT,Entity,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      filter: "(AssignedTo/Id eq {{userID}}) and(" +
        "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
        "or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}')" +
        " or (StartDate le '{{startDateString}}' and DueDateDT ge '{{endDateString}}')" +
        ") and Status ne 'Deleted'",
      expand: 'AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      top: '4500',
      orderby: 'StartDate'
    },

    fetchSpentTimeTasks: {
      select: 'ID,Milestone,ProjectCode,SubMilestones,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDateDT,TimeZoneNM,ParentSlot,TimeSpentPerDay,AssignedTo/Title,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,CommentsMT,Entity',
      filter : "(AssignedTo/Id eq {{userID}}) and ((Status eq 'Completed' and(" +
      "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
      " or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}')" +
      " or (StartDate le '{{startDateString}}' and DueDateDT ge '{{endDateString}}')"+
      " or (Actual_x0020_Start_x0020_Date ge '{{startDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')" +
      " or (Actual_x0020_End_x0020_Date ge '{{startDateString}}' and Actual_x0020_End_x0020_Date le '{{endDateString}}')" +
      " or (Actual_x0020_Start_x0020_Date le '{{startDateString}}' and Actual_x0020_End_x0020_Date ge '{{endDateString}}'))) or " +
      "((Status eq 'In Progress' or Status eq 'Auto Closed' ) and (" +
      "(Actual_x0020_Start_x0020_Date ge '{{startDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')" +
      " or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}')" +
      " or (Actual_x0020_Start_x0020_Date le '{{startDateString}}' and DueDateDT ge '{{endDateString}}'))))",



      // Actual_x0020_Start_x0020_Date ge '{{actualStartDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')",
      // filter: "(AssignedTo/Id eq {{userID}}) and Status eq 'Completed' and(" +
      //   "(Status eq 'Deleted' or Status eq 'In Progress') and ({{datestringArray}}))",
      expand: 'AssignedTo/Title',
        top: '4500',
      orderby: 'StartDate'
    },

    fetchBlockResource: {
      select: 'ID,Title,Status,ExpectedTime,StartDate,DueDateDT,TimeZoneNM,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail,AllocationPerDay',
      filter: "(AssignedTo/Id eq {{userID}}) and(" +
        "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
        "or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}')" +
        " or (StartDate le '{{startDateString}}' and DueDateDT ge '{{endDateString}}')" +
        ") and Status ne 'Deleted'",
      top: '4500',
      expand: 'AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      orderby: 'StartDate'
    },
    getProjectInformation: {
      select: 'ProjectCode, WBJID',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      top: '1'
    },
    //startswith(Title,'{{projectCode}}')
    getProjectTasks: {
      select: 'ID,Task,Title,ExpectedTime,StartDate,DueDateDT,TimeZoneNM,Status,AssignedTo/Title,ContentTypeCH',
      expand: 'AssignedTo/ID, AssignedTo/Title',
      filter: "ProjectCode eq '{{projectCode}}' and Milestone eq '{{milestone}}'" +
        " and Status ne 'Abandon' and Status ne 'Completed' and Status ne 'Deleted' and Status ne 'Auto Closed'",
      top: '4500'
    },
    leaveCalendar: {
      // tslint:disable
      select: "ID,EventDate,EndDate,IsHalfDay",
      filter: "(UserName/Id eq {{userId}} and IsActive eq 'Yes' ) and((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
      orderby: "Created",
      top: 4500
      // tslint:enable
    },
    availableHrs: {
      // tslint:disable
      select: "ID,ResourceID,WeekStartDate,WeekEndDate,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,MondayLeave,TuesdayLeave,WednesdayLeave,ThursdayLeave,FridayLeave",
      filter: "ResourceID eq {{ResourceId}} and((WeekStartDate ge '{{startDateString}}' and WeekStartDate le '{{endDateString}}') or (WeekEndDate ge '{{startDateString}}' and WeekEndDate le '{{endDateString}}') or (WeekStartDate le '{{startDateString}}' and WeekEndDate ge '{{endDateString}}'))",
      orderby: "WeekStartDate asc",
      top: 4500
      // tslint:enable
    }
  };
}
