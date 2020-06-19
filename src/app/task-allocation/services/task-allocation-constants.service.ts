import { Injectable } from '@angular/core';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';

@Injectable({
    providedIn: 'root'
})
export class TaskAllocationConstantsService {

    constructor(private constantService: ConstantsService, private globalObject: GlobalService) { }
    // tslint:disable
    common = {
        getMailTemplate: {
            select: 'ContentMT',
            filter: "Title eq '{{templateName}}'"
        }
    };
    taskallocationComponent = {
        projectResources: {
            select: 'ID,ProjectCode,Milestone,Status,PrevStatus,WBJID,ProjectFolder,Milestones,TA,DeliverableType,ClientLegalEntity,ProjectType, Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title, AllDeliveryResources/ID, AllDeliveryResources/Name, AllDeliveryResources/Title,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail',
            expand: 'Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title, Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title, GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title, PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail,AllDeliveryResources/ID,AllDeliveryResources/Name,AllDeliveryResources/Title',
            filter: "ProjectCode eq '{{ProjectCode}}'",
            top: 4500
        },
        projectShortTitle: {
          select: 'ProjectCode, WBJID',
          filter: 'ProjectCode eq \'{{projectCode}}\''
        },
        Resources: {
            select: "ID,MaxHrs,TAVisibility,PrimarySkill,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,UserNamePG/Name,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title",
            expand: "UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,UserNamePG/Name,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title",
            filter: "IsActiveCH eq '{{enable}}'",
            orderby: "UserNamePG/Title asc",
            top: 4500
        },
        Budgets: {
            select: 'BudgetHrs',
            filter: "Title eq '{{ProjectCode}}'",
            top: 4500
        },
        ClientLegal: {
            //select: 'IsCentrallyAllocated',
            select:'ID,Title',
            filter: "IsActiveCH eq 'Yes' and Title eq '{{ProjectDetailsaccount}}'",
            top: 4500
        },
        checkAccess: {
            select: 'Title,ProjectCode,AllOperationresources/ID,AllOperationresources/Title',
            expand: 'AllOperationresources/ID,AllOperationresources/Title',
            filter: "ProjectCode eq '{{code}}'",
            top: 4500
        },
        milestoneList: {
            select: 'Title,Status',
            orderby: 'SerialOrder asc',
            filter: "Status eq '{{status}}'",
            top: 4500
        },
        taskList: {
            select: 'Title,Status,IsCentrallyAllocated,DefaultSkill,TaskTypeCH',
            orderby: 'SerialOrder asc',
            filter: "Status eq '{{status}}' and TaskTypeCH ne '{{TaskType}}'",
            top: 4500
        },
        milestone: {
            select: 'ID,Title,Task,SkillLevel,TATStatus,CommentsMT,Status,AllowCompletion,NextTasks,FileSystemObjectType,ExpectedTime,PrevTasks,Milestone,SubMilestones,TimeSpent,StartDate,DueDate,PreviousTaskClosureDate,IsCentrallyAllocated,CentralAllocationDone,Actual_x0020_End_x0020_Date,Actual_x0020_Start_x0020_Date,AssignedTo/ID,AssignedTo/Name,AssignedTo/Title,AssignedTo/EMail,ActiveCA,DisableCascade,ParentSlot,AllocationPerDay,ContentTypeCH',
            orderby: 'StartDate asc',
            expand: 'AssignedTo/ID,AssignedTo/Name,AssignedTo/Title,AssignedTo/EMail',
            filter: "ProjectCode eq '{{projectCode}}'",
            top: 4500
        },
        userCapacity: {
            select: 'ID,Milestone,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDateDT,TimeZoneNM',
            orderby: 'StartDate',
            filter: "(AssignedTo/Id eq '{{selectedUserID}}') and((StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}') or (DueDateDT ge '{{startDateString}}' and DueDateDT le '{{endDateString}}') or (StartDate le '{{startDateString}}' and DueDateDT ge '{{endDateString}}')) and Status ne 'Abandon' and Status ne 'Deleted'",
            top: 4500
        },
        userCapacityEndPoint: {
            select: 'ID,EventDate,EndDate,IsHalfDay',
            orderby: 'Created',
            filter: "(Author/Id eq '{{arrUserDetailsuid}}')and((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
            top: 4500
        },
        submilestonesList: {
            select: 'Title,IsActiveCH',
            filter: "IsActiveCH eq '{{status}}'",
            top: 4500
        },
        getUserFromGroup: {
            UserFromGroup: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/sitegroups/getByName('{{groupName}}')/Users"
        },
        earlyTaskNotification: {
            select: 'ID',
            filter: "IsActiveCH eq 'Yes' and ProjectCode eq '{{projectCode}}'",
            top: 4500
        }
    };
}
