import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedConstantsService {

  constructor() { }
  // tslint:disable
  public userCapacity = {
    fetchTasks: {
      select: 'ID,Milestone,ProjectCode,SubMilestones,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDate,TimeZone,ParentSlot',
      filter: "(AssignedTo/Id eq {{userID}}) and(" +
        "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
        "or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}')" +
        " or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}')" +
        ") and Status ne 'Abandon' and Status ne 'Deleted' and Task ne 'Time Booking' and Task ne 'Send to client' and Task ne 'Client Review' ",
      top: '4500',
      orderby: 'StartDate'
    },

    fetchSpentTimeTasks: {
      select: 'ID,Milestone,ProjectCode,SubMilestones,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDate,TimeZone,ParentSlot,TimeSpentPerDay,AssignedTo/Title,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date',
      filter : "(AssignedTo/Id eq {{userID}}) and ((Status eq 'Completed' and(" +
      "(StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}')" +
      " or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}')" +
      " or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}')"+
      " or (Actual_x0020_Start_x0020_Date ge '{{startDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')" +
      " or (Actual_x0020_End_x0020_Date ge '{{startDateString}}' and Actual_x0020_End_x0020_Date le '{{endDateString}}')" +
      " or (Actual_x0020_Start_x0020_Date le '{{startDateString}}' and Actual_x0020_End_x0020_Date ge '{{endDateString}}'))) or " +
      "((Status eq 'In Progress' or Status eq 'Auto Closed' ) and (" +
      "(Actual_x0020_Start_x0020_Date ge '{{startDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')" +
      " or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}')" +
      " or (Actual_x0020_Start_x0020_Date le '{{startDateString}}' and DueDate ge '{{endDateString}}'))))",
      
      
      
      // Actual_x0020_Start_x0020_Date ge '{{actualStartDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}')",
      // filter: "(AssignedTo/Id eq {{userID}}) and Status eq 'Completed' and(" +
      //   "(Status eq 'Deleted' or Status eq 'In Progress') and ({{datestringArray}}))",
      expand: 'AssignedTo/Title',
        top: '4500',
      orderby: 'StartDate'
    },
    getProjectInformation: {
      select: 'WBJID',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      top: '1'
    },
    //startswith(Title,'{{projectCode}}')
    getProjectTasks: {
      select: 'ID,Task,Title,ExpectedTime,StartDate,DueDate,TimeZone,Status,AssignedTo/Title,ContentType/Name',
      expand: 'ContentType , AssignedTo/ID, AssignedTo/Title',
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
