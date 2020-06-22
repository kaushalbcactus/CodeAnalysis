import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CAConstantService {
  constructor() { }
  // tslint:disable
  public resourceQueryOptions = {
    select: 'ID,MaxHrs,PrimarySkill,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
    expand: 'UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
    filter: "IsActiveCH eq 'Yes' and  CAVisibility eq 'Yes'",
    top: 4200,
    orderby: 'UserNamePG/Title asc'
  };

  public scheduleAllocatedQueryOptions = {
    select: 'ID,Title,TimeZoneNM,SkillLevel,TimeSpentPerDay,TimeSpent,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,ExpectedTime,TaskComments,CommentsMT,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,StartDate,DueDateDT,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title, ActiveCA,DisableCascade,AllowCompletion, AllocationPerDay',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "ActiveCA eq 'Yes' and  IsCentrallyAllocated eq 'Yes' and CentralAllocationDone eq 'Yes' and Status ne 'Deleted' and Status ne 'Completed'",
    filterSlot: '',
    orderby: 'DueDateDT asc',
    top: 4200
  };


  public scheduleUnAllocatedQueryOptions = {
    select: 'ID,Title,TimeZoneNM,SkillLevel,Task,Status,NextTasks,PrevTasks,ProjectCode,TimeSpent,Milestone,SubMilestones,ExpectedTime,TaskComments,CommentsMT,StartDate,DueDateDT,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title,DisableCascade,AllowCompletion, AllocationPerDay',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "ActiveCA eq 'Yes' and  IsCentrallyAllocated eq 'Yes' and CentralAllocationDone eq 'No' and Status ne 'Deleted' and Status ne 'Completed'",
    filterSlot: '',
    orderby: 'DueDateDT asc',
    top: 4200
  };

  public scheduleMilestoneQueryOptions = {
    select: 'ID,Title,TimeZoneNM,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,TaskComments,StartDate,DueDateDT,AssignedTo/ID, AssignedTo/Title',
    expand: 'AssignedTo/ID, AssignedTo/Title',
    filter: "((ProjectCode eq '{0}' and Milestone eq '{1}') or (ProjectCode eq '{2}' and (Status eq 'Completed' or Status eq 'Auto Closed') and (Task eq 'QC' or Task eq 'Review-QC' or Task eq 'Inco-QC' or Task eq 'Edit' or Task eq 'Review-Edit' or Task eq 'Inco-Edit' or Task eq 'Graphics' or Task eq 'Review-Graphics' or Task eq 'Inco-Graphics')))",
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
    select: 'ID,Title,ProjectCode,PrimaryPOC,WBJID,TA,DeliverableType,ClientLegalEntity,StandardService,IsStandard',
    filter: "(Status ne 'Closed') and (Status ne 'Cancelled') ",
    top: 4200,
    orderby: 'ClientLegalEntity asc'
  };

  public mailContent = {
    select: 'ContentMT',
    filter: "Title eq '{0}'",
    top: 4200
  };


  public scheduleQueryOptions = {
    select: 'ID,Title,TimeZoneNM,SkillLevel,TimeSpentPerDay,TimeSpent,Task,Status,NextTasks,PrevTasks,ProjectCode,Milestone,SubMilestones,ExpectedTime,TaskComments,CommentsMT,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,StartDate,DueDateDT,CentralAllocationDone,IsCentrallyAllocated,AssignedTo/ID, AssignedTo/Title, ActiveCA,DisableCascade,AllowCompletion,PreviousAssignedUser/ID,PreviousAssignedUser/Title',
    expand: 'AssignedTo/ID, AssignedTo/Title,PreviousAssignedUser/ID,PreviousAssignedUser/Title',
    filter: "ActiveCA eq 'Yes' and Status ne 'Deleted' and Status ne 'Completed'",
    filterSlot: " and IsCentrallyAllocated eq 'Yes'",
    filterTask: " ParentSlot eq {{ParentSlotId}} ",
    orderby: 'DueDateDT asc',
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

  public tasks = {
    select: 'ID,Title,Task,Status,ParentSlot,ProjectCode,Milestone',
    orderby: 'StartDate asc',
    filter: "ProjectCode eq '{{projectCode}}' and Task ne 'Select one'",
    top: 4500
  };


  public getMailTemplate = {
    select: 'ContentMT',
    filter: "Title eq '{{templateName}}'"
  };

  public GetTaskBudgetHours = {
    select: 'ID,Title,Hours',
    filter: "ClientLegalEntity eq '{{ClientLegalEntity}}' and StandardService eq '{{StandardService}}' and Milestone eq '{{Milestone}}'  and IsActiveCH eq 'Yes'",
    top: 4500
  };

  // tslint:enable

}
