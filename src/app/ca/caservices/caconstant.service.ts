import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CAConstantService {
  constructor() { }
  // tslint:disable
  public resourceQueryOptions = {
    select: 'ID,MaxHrs,PrimarySkill,UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
    expand: 'UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
    filter: "IsActive eq 'Yes'",
    top: 4200,
    orderby: 'UserName/Title asc'
  };

  public scheduleUnAllocatedQueryOptions = {
    select: 'ID,Title,TimeZone,SkillLevel,Task,Status,NextTasks,PrevTasks,ProjectCode,TimeSpent,Milestone,SubMilestones,ExpectedTime,TaskComments,Comments,StartDate,DueDate,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title,DisableCascade,AllowCompletion',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "ActiveCA eq 'Yes' and  IsCentrallyAllocated eq 'Yes' and CentralAllocationDone eq 'No'",
    filterSlot: '',
    orderby: 'DueDate asc',
    top: 4200
  };

  public scheduleMilestoneQueryOptions = {
    select: 'ID,Title,TimeZone,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,TaskComments,StartDate,DueDate,AssignedTo/ID, AssignedTo/Title',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "((ProjectCode eq '{0}' and Milestone eq '{1}') or (ProjectCode eq '{2}' and Status eq 'Completed' and (Task eq 'QC' or Task eq 'Review-QC' or Task eq 'Inco-QC' or Task eq 'Edit' or Task eq 'Review-Edit' or Task eq 'Inco-Edit' or Task eq 'Graphics' or Task eq 'Review-Graphics' or Task eq 'Inco-Graphics')))",
    top: 4200
  };

  public projectQueryOptions = {
    select: 'ID,Title,ProjectCode,PrimaryPOC,WBJID,TA,DeliverableType,ClientLegalEntity, Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title, AllDeliveryResources/ID, AllDeliveryResources/Name, AllDeliveryResources/Title',
    expand: 'Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title,AllDeliveryResources/ID,AllDeliveryResources/Name,AllDeliveryResources/Title',
    filter: "(Status ne 'Closed') and (Status ne 'Cancelled')",
    filterByCode: "ProjectCode eq '{{projectCode}}'",
    top: 4200,
    orderby: 'ClientLegalEntity asc'
  };

  public projectOnLoad = {
    select: 'ID,Title,ProjectCode,PrimaryPOC,WBJID,TA,DeliverableType,ClientLegalEntity',
    filter: "(Status ne 'Closed') and (Status ne 'Cancelled') ",
    top: 4200,
    orderby: 'ClientLegalEntity asc'
  };

  public mailContent = {
    select: 'Content',
    filter: "Title eq '{0}'",
    top: 4200
  };

  public scheduleAllocatedQueryOptions = {
    select: 'ID,Title,TimeZone,SkillLevel,TimeSpentSubmitStatus,TimeSpentPerDay,TimeSpent,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,ExpectedTime,TaskComments,Comments,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,StartDate,DueDate,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title, ActiveCA,DisableCascade,AllowCompletion',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "ActiveCA eq 'Yes' and  IsCentrallyAllocated eq 'Yes' and CentralAllocationDone eq 'Yes'",
    filterSlot: '',
    orderby: 'DueDate asc',
    top: 4200
  };

  public scheduleQueryOptions = {
    select: 'ID,Title,TimeZone,SkillLevel,TimeSpentSubmitStatus,TimeSpentPerDay,TimeSpent,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,ExpectedTime,TaskComments,Comments,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,StartDate,DueDate,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title, ActiveCA,DisableCascade,AllowCompletion',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "ActiveCA eq 'Yes'",
    filterSlot: " and IsCentrallyAllocated eq 'Yes'",
    filterTask: " ParentSlot eq {{ParentSlotId}} ",
    orderby: 'DueDate asc',
    top: 4200
  };

  public taskQueryOptions = {
    select: 'ID,Title,Status,IsCentrallyAllocated,DefaultSkill,ParentSlot',
    filter: "Status eq '{{status}}'",
    orderby: 'SerialOrder asc',
    top: 4500
  };

  public projectResources = {
    select: 'ID,ProjectCode, QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, AllDeliveryResources/ID, AllDeliveryResources/Name, AllDeliveryResources/Title',
    expand: 'QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, AllDeliveryResources/ID,AllDeliveryResources/Name,AllDeliveryResources/Title',
    filter: "ProjectCode eq '{{ProjectCode}}'",
    top: 4500
  };


  public getMailTemplate =  {
    select: 'Content',
    filter: "Title eq '{{templateName}}'"
}

  // tslint:enable

}
