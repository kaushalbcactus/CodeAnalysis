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
    }
  };
}
