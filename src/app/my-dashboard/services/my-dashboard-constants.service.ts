import { Injectable } from '@angular/core';
import { ConstantsService } from "../../Services/constants.service";
import { GlobalService } from '../../Services/global.service';
import { DatePipe } from '@angular/common';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MyDashboardConstantsService {
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
    private spServices: SharepointoperationService,
    public messageService: MessageService, ) { }

  mydashboardComponent = {

    MyTasks: {
      select: "ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,SubMilestones",
      orderby: "DueDate asc",
      filter: "AssignedTo eq  {{userId}} and (Task ne 'Send to client') and (Task ne 'Follow up') and (Task ne 'Client Review') and (Task ne 'Time Booking') and",
      filterStatus: "(Status ne 'Completed') and (Status ne 'Auto Closed')  and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      // filterNotCompleted: "(Status ne 'Completed') and (Status ne 'Not Confirmed') and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      // filterPlanned:"(Status eq 'Not Confirmed')",
      filterCompleted: "(Status eq 'Completed' or Status eq 'Auto Closed') and (Task ne 'Adhoc')",
      filterDate: "and((StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}') or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}') or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}'))",

    },
    ClientLegalEntitys: {
      select: 'ID,Title,Acronym,Geography,ClientGroup,Bucket,DistributionList',
      orderby: 'Title asc',
      top: 4500
    },
    ResourceCategorization: {
      select: 'ID,UserName/ID,UserName/Title,Account/ID,Account/Title,Manager/ID,Manager/Title,Designation,PrimarySkill,SkillLevel/ID,SkillLevel/Title,TimeZone/ID,TimeZone/Title,IsActive',
      expand: 'UserName/ID,UserName/Title,Account/ID,Account/Title,Manager/ID,Manager/Title,SkillLevel/ID,SkillLevel/Title,TimeZone/ID,TimeZone/Title',
      filter: "IsActive eq 'Yes'",
      orderby: "UserName/Title",
      top: 4500
    },
    ProjectContacts: {
      select: 'ID,Title,FName,LName,EmailAddress,Designation,Phone,Address,FullName,Department,Status,ReferralSource,RelationshipStrength,EngagementPlan,Comments,ProjectContactsType,ProjectContactsType,ClientLegalEntity',
      top: "4500"
    },
    ProjectInformations: {
      select: 'ID,Title,ProjectCode,Status,ClientLegalEntity,Milestones,WBJID,ProjectFolder',
      filter: "(Status eq 'Author Review' or Status eq 'In Progress' or Status eq 'Ready for Client' or Status eq 'Unallocated')",
      orderby: "ProjectCode asc",
      top: "4500"
    },
    previousNextTask: {
      select: 'ID,Title,StartDate,DueDate,Status,Task,NextTasks,PrevTasks,Milestone,SubMilestones,Start_x0020_Date_x0020_Text,End_x0020_Date_x0020_Text,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      filter: '',
      expand: "AssignedTo/Title"
    },
    previousTaskStatus: {
      select: 'ID,Title,Status,NextTasks,Task,AllowCompletion,PrevTasks,AssignedTo/Title',
      filter: "ID eq {{taskId}} and AssignedTo eq {{userID}} ",
      expand: "AssignedTo/Title"
    },
    taskStatus: {
      select: 'ID,Title,Status,Task,NextTasks,PrevTasks,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      filter: '',
      expand: "AssignedTo/Title"
    },
    TimeSpent: {
      select: 'ID,Title,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,DueDate,Status,ExpectedTime,TimeSpentPerDay,TimeSpentSubmitStatus',
      filter: 'ID eq {{taskId}}',
    },
    Comments: {
      select: "ID,Title,Milestone,FileDirRef,NextTasks,PrevTasks,Status,ProjectCode,Task",
      filter: "ID eq {{taskID}}"
    },
    Milestone: {

      select: "ID,Title,AssignedTo/Id,AssignedTo/Title,DueDate,TaskComments,SubMilestones",
      expand: "AssignedTo",
      orderby: "DueDate desc",
      filter: "ProjectCode eq '{{ProjectCode}}' and Milestone eq '{{Milestone}}'"

    },
    projectInfo: {
      select: 'ID,Title,ProjectCode,ProjectFolder,Milestone,Milestones,WBJID,IsPubSupport,ClientLegalEntity,PrimaryPOC,Status,DeliverableType',
      filter: "ProjectCode eq '{{projectCode}}'"
    },
    SubmissionPkg: {
      select: 'ID,Title,JCID,SubmissionDate,SubmissionURL,SubmissionPkgURL,DecisionURL,DecisionDate,Decision,Status',
      filter: "Title eq '{{projectCode}}' and Status eq '{{Status}}'",
      top: 1
    },

    GalleySubCat: {
      select: 'ID,Title,JCID,SubmissionDate,SubmissionURL,SubmissionPkgURL,DecisionURL,DecisionDate,Decision,Status',
      filter: "Title eq '{{projectCode}}' and (Status eq '{{Status}}' or  Status eq '{{Status1}}')",
      top: 1
    },
    Submit: {
      select: 'ID,Title,Status',
      filter: "Title eq '{{projectCode}}' and (Status eq '{{Status}}' or  Status eq '{{Status1}}')",
      top: 1
    },
    JournalRequirement:
    {
      select: 'ID,Title,Status',
      filter: "Title eq '{{projectCode}}'",
      top: 1,
      orderby: "Created desc"
    },

    MyTimeline: {
      select: "ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,SubMilestones",
      orderby: "DueDate asc",
      filter: "AssignedTo eq  {{userId}} and (Task ne 'Send to client') and (Task ne 'Follow up') and (Task ne 'Client Review') and  (Task ne 'Time Booking') and ",
      filterNotCompleted: "(Status ne 'Completed') and (Status ne 'Not Confirmed') and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      filterPlanned: "(Status eq 'Not Confirmed')",
      filterCompleted: "(Task ne 'Adhoc') and ((Status eq 'Completed' ) or (Status eq 'Auto Closed'))",
      filterAdhoc: "(Task eq 'Adhoc' and ProjectCode eq 'Adhoc' and Status eq 'Completed')",
      filterAll: "(Status ne 'Deleted')",
      filterDate: "and((StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}') or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}') or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}'))",
      top: 4500
    },
    TaskDetails: {
      select: "ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity",
      filter: 'ID eq {{taskId}}',
    },
    ClientLegalEntities: {
      select: 'ID,Title',
      orderby: "Title asc",
      top: 4500
    },
    LeaveCalendar: {

      select: 'ID,EventDate,EndDate,IsHalfDay,Title',
      filter: "(Author/Id eq {{currentUser}})and((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
      orderby: 'Created',
      top: 4500
    },
    AllMilestones:
    {
      select: 'ID,Title',
      filter: "ProjectCode eq '{{projectCode}}' and ContentType eq 'Summary Task' and (Status eq 'In Progress' or (Status eq 'Completed' and Actual_x0020_End_x0020_Date ge '{{DateString}}')) ",
      top: 4500
    },
    
    MyTimelineForBooking: {
      select: "ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,TimeSpentPerDay",
      orderby: "DueDate asc",
      filter: "AssignedTo eq  {{userId}} and ",
      filterNotCompleted: "(Status ne 'Not Confirmed') and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      filterDate: "and ((StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}') or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}') or (Actual_x0020_Start_x0020_Date ge '{{startDateString}}' and Actual_x0020_Start_x0020_Date le '{{endDateString}}') or (Actual_x0020_End_x0020_Date ge '{{startDateString}}' and Actual_x0020_End_x0020_Date le '{{endDateString}}') or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}') or (StartDate ge '{{startDateString}}' and DueDate le '{{endDateString}}') or (Actual_x0020_Start_x0020_Date le '{{startDateString}}' and DueDate ge '{{endDateString}}'))",
      top: 4500
    },
    ProjectInformation:
    {
      select: 'ID,Title,ProjectCode,ProjectFolder,ClientLegalEntity,PrimaryPOC,Status,DeliverableType,Milestone,Milestones,SubDeliverable,ServiceLevel,TA,Indication,Molecule,Complexity,Priority,ProposedStartDate,ProposedEndDate,ActualStartDate,ActualEndDate,IsPubSupport,PubSupportStatus,ConferenceJournal,Authors,Comments,WBJID,SOWCode,ProjectType,Created,Author/Title,BusinessVertical,SubDivision,SOWBoxLink,Description',
      filterByCode: "ProjectCode eq '{{projectCode}}'",
      filterByTitle: "WBJID eq '{{shortTitle}}'",
      filter: '',
      expand: 'Author/Title'
    },
    ProjectInfoResources: {
      select: 'ID,Title,ProjectCode,ClientLegalEntity,PrimaryResMembers/Id,PrimaryResMembers/Title,Writers/ID,Writers/Title,Reviewers/ID,Reviewers/Title,Editors/ID,Editors/Title,QC/ID,QC/Title,GraphicsMembers/ID,GraphicsMembers/Title,PSMembers/ID,PSMembers/Title',
      expand: "PrimaryResMembers/Id,PrimaryResMembers/Title,Writers/ID,Writers/Title,Reviewers/ID,Reviewers/Title,Editors/ID,Editors/Title,QC/ID,QC/Title,GraphicsMembers/ID,GraphicsMembers/Title,PSMembers/ID,PSMembers/Title",
      filter: "ID eq {{projectId}}",
    },
    ProjectResource:
    {
      select: 'ID,Title,ProjectCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      expand: "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title",
      filter: "ID eq {{projectId}}",
    }
  }

  // var endpoint = _spPageContextInfo.webAbsoluteUrl
  // +"/_api/web/lists/getbytitle('" + ListNames.LeaveCalendar + "')/items?$select=ID,EventDate,EndDate,IsHalfDay&$top=4500&$orderby=Created&$filter=(Author/Id eq "+oCapacity.arrUserDetails[indexUser].uid+")and("+
  // "(EventDate ge '"+startDateString+"' and EventDate le '"+endDateString+"') or (EndDate ge '"+startDateString+"' and EndDate le '"+endDateString+"') or (EventDate le '"+startDateString+"' and EndDate ge '"+endDateString+"'))";
  // getBatchBody(batchContentsLeaves, batchGuid, endpoint); 


  // *************************************************************************************************************************************
  // Get Next Previous task from current task 
  // *************************************************************************************************************************************
  async getNextPreviousTask(task) {
    this.tasks = [];
    var nextTaskFilter = '';
    var previousTaskFilter = '';
    if (task.NextTasks) {
      var nextTasks = task.NextTasks.split(";#");
      nextTasks.forEach(function (value, i) {
        nextTaskFilter += "(Title eq '" + value + "')";
        nextTaskFilter += i < nextTasks.length - 1 ? " or " : '';
      });
    }
    if (task.PrevTasks) {
      var previousTasks = task.PrevTasks.split(";#");
      previousTasks.forEach(function (value, i) {
        previousTaskFilter += "(Title eq '" + value + "')";
        previousTaskFilter += i < previousTasks.length - 1 ? " or " : '';
      });
    }

    var taskFilter = (nextTaskFilter !== '' && previousTaskFilter !== '') ? nextTaskFilter + " or " + previousTaskFilter : (nextTaskFilter === '' && previousTaskFilter !== '') ? previousTaskFilter : (nextTaskFilter !== '' && previousTaskFilter === '') ? nextTaskFilter : '';

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    let previousNextTask = Object.assign({}, this.mydashboardComponent.previousNextTask);
    previousNextTask.filter = taskFilter;

    const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousNextTask);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.tasks = this.response[0] !== "" ? this.response[0] : [];

    this.tasks.map(c => c.StartDate = c.StartDate !== null ? this.datePipe.transform(c.StartDate, 'MMM d, y h:mm a') : "-");
    this.tasks.map(c => c.DueDate = c.DueDate !== null ? this.datePipe.transform(c.DueDate, 'MMM d, y h:mm a') : "-");

    if (task.NextTasks)
      this.tasks.filter(c => nextTasks.includes(c.Title)).map(c => c.TaskType = "Next Task");
    if (task.PrevTasks)
      this.tasks.filter(c => previousTasks.includes(c.Title)).map(c => c.TaskType = "Previous Task");


    return this.tasks;
  }



  // *************************************************************************************************************************************
  //  get Previous Task Status
  // *************************************************************************************************************************************


  async getPrevTaskStatus(task) {
    var status = '';
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    let previousTask = Object.assign({}, this.mydashboardComponent.previousTaskStatus);
    previousTask.filter = previousTask.filter.replace(/{{taskId}}/gi, task.ID).replace(/{{userID}}/gi, this.sharedObject.sharePointPageObject.userId.toString());

    const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousTask);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);


    for (var i = 0; i < this.response[0].length; i++) {
      if (this.response[0][i].AllowCompletion === "No") {
        var previousTaskFilter = '';
        if (this.response[0][i].PrevTasks) {
          var previousTasks = task.PrevTasks.split(";#");
          previousTasks.forEach(function (value, i) {
            previousTaskFilter += "(Title eq '" + value + "')";
            previousTaskFilter += i < previousTasks.length - 1 ? " or " : '';
          });

          this.batchContents = new Array();
          const batchGuid = this.spServices.generateUUID();

          let previousTask = Object.assign({}, this.mydashboardComponent.taskStatus);
          previousTask.filter = previousTaskFilter

          const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousTask);
          this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

          this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

          this.response[0].forEach(element => {
            status = element.Status;
          });

        }
        else {
          status = "AllowCompletion";
        }
      }
      else {
        status = "AllowCompletion";
      }
    }
    return status;
  }


  // **************************************************************************************************************************************
  //  Complete Task 
  // **************************************************************************************************************************************


  async CompleteTask(task) {
    var response;
    this.projectInfo = await this.getCurrentTaskProjectInformation(task.ProjectCode);
    this.NextPreviousTask = await this.getNextPreviousTask(task);
    if (task.Task == 'Galley' || task.Task == 'Submission Pkg'
      || task.Task == 'Submit' || task.Task == 'Journal Selection'
      || task.Task == 'Journal Requirement') {
      await this.GetAllDocuments(task);
      var isJcIdFound = await this.getJCIDS(task);
      if (!isJcIdFound) {
        // this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: task.Task + "task can't be closed as no submission details are found." });
        response = "Task can't be closed as no submission details are found."
        return response;
      }
      else {

        response = await this.saveTask(task, true);
      }
    }
    else {
      response = await this.saveTask(task, false);
    }
    return response;
  }


  // **************************************************************************************************************************************
  //  Get  milestone documents
  // **************************************************************************************************************************************

  async GetAllDocuments(task) {

    this.DocumentArray = [];
    var documentsUrl = "/Drafts/Internal/" + task.Milestone;
    var completeFolderRelativeUrl = "";
    completeFolderRelativeUrl = this.projectInfo.ProjectFolder + documentsUrl;
    var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allDocuments = this.response[0];

    this.allDocuments.map(c => c.isFileMarkedAsFinal = c.ListItemAllFields.Status.split(" ").splice(-1)[0] === "Complete" ? true : false);
    this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === task.Title && c.isFileMarkedAsFinal);


  }
  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    let project = Object.assign({}, this.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    const projectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', project);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectUrl);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response[0][0];
  }


  // **************************************************************************************************************************************
  //  ckeck submission details 
  // **************************************************************************************************************************************


  async getJCIDS(task) {

    var isJcIdFound = false;
    const batchGuid = this.spServices.generateUUID();
    var batchContents = new Array();
    if (task.Task === 'Submission Pkg') {
      let jcSub = Object.assign({}, this.mydashboardComponent.SubmissionPkg);
      jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');;
      const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);
    }
    else if (task.Task === 'Galley') {
      let jcSub = Object.assign({}, this.mydashboardComponent.GalleySubCat);
      jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);

      let jcSubCat = Object.assign({}, this.mydashboardComponent.Submit);
      jcSubCat.filter = jcSubCat.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      const jcSubCatUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcSubCat);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubCatUrl);
    }

    else if (task.Task === 'Submit') {
      let jcSub = Object.assign({}, this.mydashboardComponent.SubmissionPkg);
      jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);

      let jcSubCat = Object.assign({}, this.mydashboardComponent.Submit);
      jcSubCat.filter = jcSubCat.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{Status1}}/gi, 'Resubmit to same journal');
      const jcSubCatUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcSubCat);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubCatUrl);
    }
    else if (task.Task === 'Journal Selection') {
      isJcIdFound = true;
    }
    else if (task.Task === 'Journal Requirement') {
      let jcReq = Object.assign({}, this.mydashboardComponent.JournalRequirement);
      jcReq.filter = jcReq.filter.replace(/{{projectCode}}/gi, task.ProjectCode);
      const jcReqUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcReq);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, jcReqUrl);
    }
    this.response = await this.spServices.getDataByApi(batchGuid, batchContents);

    this.jcSubId=undefined;
    this.jcId=undefined;
    if (this.response.length > 0) {

      switch (task.Task) {
        case 'Submission Pkg':
            this.jcSubId = this.response[0].length > 0 ? this.response[0][0].ID : 0;
           
          break;
        case 'Galley':
            this.jcSubId = this.response[0].length > 0 ? this.response[0][0].ID : 0;
            this.jcId = this.response.length > 1 ? this.response[1].length > 0 ? this.response[1][0].ID : 0 : 0;
          break;
        case 'Submit':
            this.jcSubId = this.response[0].length > 0 ? this.response[0][0].ID : 0;
            this.jcId = this.response.length > 1 ? this.response[1].length > 0 ? this.response[1][0].ID : 0 : 0;
          break;
        case 'Journal Requirement':
            this.jcId = this.response[0].length > 0 ? this.response[0][0].ID : 0;
          break;
      }

      if(this.jcSubId || this.jcId)
      {
        isJcIdFound = true;
      }

     
     
    }
    return isJcIdFound;
  }


  // **************************************************************************************************************************************
  // Save Task 
  // **************************************************************************************************************************************

  async saveTask(task, isJcIdFound) {
 

    const batchGuid = this.spServices.generateUUID();
    var batchContents = new Array();
    const changeSetId = this.spServices.generateUUID();
    const data = {

      __metadata: { type: 'SP.Data.SchedulesListItem' },
      Actual_x0020_End_x0020_Date: new Date(),
      Actual_x0020_Start_x0020_Date: task.Actual_x0020_Start_x0020_Date !== null ? task.Actual_x0020_Start_x0020_Date : new Date(),
      Status: task.Status,
      TaskComments: task.TaskComments
    };
    const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name + "')/items(" + +(task.ID) + ")";
    this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(data), false);

    if (isJcIdFound) {
      var docUrl = '';
      const count = this.DocumentArray.length;
      this.DocumentArray.forEach(function (value, i) {
        docUrl += value.ServerRelativeUrl;
        docUrl += i < count - 1 ? ";#" : '';
      });
      if (task.Task === 'Submission Pkg') {
        const jcSubmissionObj = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          SubmissionPkgURL: docUrl
        };

        const SubPackPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, SubPackPoint, JSON.stringify(jcSubmissionObj), false);

      }
      else if (task.Task === 'Galley') {
        const jcSubmissionObj = {
          __metadata: { type: 'SP.Data.JCGalleyListItem' },
          Title: task.ProjectCode,
          JCSubmissionID: this.jcSubId,
          GalleyDate: new Date().toISOString(),
          GalleyURL: docUrl
        };

        const GallyPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.jcGalley.name + "')/items";
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, GallyPoint, JSON.stringify(jcSubmissionObj), true);
        //--------------------------------------- new Url--------------------------------------------------//
        const jcendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        const jcSubObj = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          Status: 'Galleyed'
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcendPoint, JSON.stringify(jcSubObj), false);

        //--------------------------------------- new Url--------------------------------------------------//
        const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConObj = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Galleyed'
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoObj = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Galleyed'
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      }
      else if (task.Task === 'Submit') {
        const jcSubmissionObj = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          Status: 'Submitted',
          SubmissionDate: new Date().toISOString(),
          SubmissionURL: docUrl
        };

        const SubmitPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, SubmitPoint, JSON.stringify(jcSubmissionObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConObj = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Submitted'
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoObj = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Submitted',
          LastSubmissionDate: new Date().toISOString()
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      } else if (task.Task === 'Journal Selection') {

        const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoObj = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          JournalSelectionURL: docUrl,
          JournalSelectionDate: new Date().toISOString()
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      }
      else if (task.Task === 'Journal Requirement') {

        const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConObj = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          JournalRequirementDate: new Date().toISOString(),
          JournalRequirementURL: docUrl
        };
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);


      }
    }
    var nextTasks = this.NextPreviousTask !== undefined ? this.NextPreviousTask.filter(c => c.TaskType === "Next Task") : [];
    var sendToClientPresent = false;
    if (nextTasks.length > 0) {
      sendToClientPresent = nextTasks.find(c => c.Task === "Send to client") !== undefined ? true : false;
    }


    if (sendToClientPresent) {
      const data1 = {
        __metadata: { type: 'SP.Data.ProjectInformationListItem' },
        Status: "Ready for Client"
      };

      const endPoint1 = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.projectInfo.name + "')/items(" + +(this.projectInfo.ID) + ")";
      this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint1, JSON.stringify(data1), false);
    }
    var mailSubject = task.ProjectCode + "(" + this.projectInfo.WBJID + "): Task Completed";
    nextTasks.forEach(element => {
      const data = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        PreviousTaskClosureDate: new Date()
      };
      const tempendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name + "')/items(" + +(element.ID) + ")";
      this.spServices.getChangeSetBodySC(batchContents, changeSetId, tempendPoint, JSON.stringify(data), false);

      var EmailTemplate = this.Emailtemplate.Content;
      var objEmailBody = [];

      objEmailBody.push({
        "key": "@@Val1@@",
        "value": task.ProjectCode
      });
      objEmailBody.push({
        "key": "@@Val2@@",
        "value": element.SubMilestones ? element.SubMilestones !=="Default" ? element.Title + " - " + element.SubMilestones : element.Title : element.Title
      });
      objEmailBody.push({
        "key": "@@Val3@@",
        "value": element.AssignedTo.Title
      });
      objEmailBody.push({
        "key": "@@Val4@@",
        "value": element.Task
      });
      objEmailBody.push({
        "key": "@@Val5@@",
        "value": element.Milestone
      });
      objEmailBody.push({
        "key": "@@Val6@@",
        "value": element.StartDate
      });
      objEmailBody.push({
        "key": "@@Val7@@",
        "value": element.DueDate
      });
      objEmailBody.push({
        "key": "@@Val8@@",
        "value": task.TaskComments ? task.TaskComments : ''
      });
      objEmailBody.push({
        "key": "@@Val0@@",
        "value": element.ID
      });

      objEmailBody.forEach(element => {
        EmailTemplate = EmailTemplate.replace(RegExp(element.key, "gi"), element.value);
      });
      const obj = {
        'properties': {
          '__metadata': {
            'type': 'SP.Utilities.EmailProperties'
          },
          'To': {
            'results': [element.AssignedTo.EMail]
          },
          'CC': {
            'results': [this.sharedObject.currentUser.email]
          },
          'From': this.sharedObject.currentUser.email,
          'Subject': mailSubject,
          'Body': EmailTemplate
        }
      };

      const emailUrl = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/SP.Utilities.Utility.SendEmail";
      this.spServices.getChangeSetBodySC(batchContents, changeSetId, emailUrl, JSON.stringify(obj), true);

    });



    batchContents.push('--changeset_' + changeSetId + '--');
    const batchBody = batchContents.join('\r\n');
    const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
    batchBodyContent.push('--batch_' + batchGuid + '--');
    const batchBodyContents = batchBodyContent.join('\r\n');
    const response = await this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);



    return undefined;
    // this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: task.Title + 'Task completed sucessfully.' });
  }


  // *************************************************************************************************************************************
  // Get Email Template  
  // *************************************************************************************************************************************
  async getEmailTemplate() {
    var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/lists/GetByTitle('" + this.constants.listNames.MailContent.name + "')/items?$select=Content&$filter=Title eq 'NextTaskTemplate'";
    const batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    this.spServices.getBatchBodyGet(batchContents, batchGuid, Url);
    var response = await this.spServices.getDataByApi(batchGuid, batchContents);

    this.Emailtemplate = response[0][0];

  }



  // *************************************************************************************************************************************
  // Get All Clients  
  // *************************************************************************************************************************************


  async getAllClients() {

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    let ClientLegalEntities = Object.assign({}, this.mydashboardComponent.ClientLegalEntities);
    const ClientLegalEntitiesUrl = this.spServices.getReadURL('' + this.constants.listNames.ClientLegalEntity.name + '', ClientLegalEntities);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ClientLegalEntitiesUrl);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);


    const tempClientLegalEntities = this.response[0].map(c => c.Title);

    const ClientLegalEntitiesResponse = tempClientLegalEntities.filter(function (item, pos) {
      if (!item.toLowerCase().includes('cactus internal')) {
        return tempClientLegalEntities.indexOf(item) == pos;
      }
    });

    var dbClientLegalEntities = ClientLegalEntitiesResponse.map(o => new Object({ label: o, value: o }))

    return dbClientLegalEntities;

  }

  // *************************************************************************************************************************************
  // Calculate minimum date  
  // *************************************************************************************************************************************


  CalculateminstartDateValue(date, days) {
    var tempminDateValue;

    const dayCount = days;
    var tempDate = new Date(date);
    while (days > 0) {

      tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
      if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
        days -= 1;
        if (dayCount - 3 <= days) {
          tempminDateValue = tempDate;
        }
      }
    }
    return tempminDateValue;
  }

  //*************************************************************************************************
  //  Calculate difference between 2 dates 
  //*************************************************************************************************

  differenceBetweenHours(startDateTime, endDateTime) {
    var diff = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);

    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;

  }



  //*************************************************************************************************
  //  Return unique objects  string 
  //*************************************************************************************************

  uniqueArrayObj(array: any) {

    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value,
      
      }
    });
  }

  //*************************************************************************************************
  //   Get Task Documents
  //*************************************************************************************************


  getTaskDocument(folderUrl, documentUrl, previousTask) {
    let documents = [];
    const completeFolderRelativeUrl = folderUrl + documentUrl;
    const Url = "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";
    if (previousTask) {
      documents = this.spServices.fetchTaskDocumentsByRestAPI(Url, previousTask);
    } else {
      documents = this.spServices.fetchTaskDocumentsByRestAPI(Url, null);
    }
    if (documents.length) {
      documents = documents.sort((a, b) =>
        new Date(a.modified) < new Date(b.modified) ? 1 : -1
      );
    }
    return documents;
  }


  callQMSPopup(currentTaskElement, qmsObj) {
    var previousTaskFilter = '';
    var newValue = [];
    if (currentTaskElement.PrevTasks) {
      newValue = currentTaskElement.PrevTasks.split(";#");
      for (var i = 0; i < newValue.length; i++) {
        previousTaskFilter += "(Title eq '" + newValue[i] + "')";
        if (i != newValue.length - 1) {
          previousTaskFilter += " or "
        }
      }
    }
    const project = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === currentTaskElement.ProjectCode);
    var folderUrl = project.ProjectFolder;
    var documentsUrl = "/Drafts/Internal/" + currentTaskElement.Milestone;

    var tempArray = [];
    var reviewDocArray = [];
    var documents = this.getTaskDocument(folderUrl, documentsUrl, currentTaskElement.PrevTasks);
    for (var document in documents) {
      if (documents[document].visiblePrevTaskDoc === true) {
        var docObj = {
          url: '',
          fileName: ''
        }
        docObj.url = documents[document].fileUrl;
        docObj.fileName = documents[document].fileName;
        tempArray.push(docObj);
      }
    }
    var reviewDocuments = this.getTaskDocument(folderUrl, documentsUrl, '');
    for (var document in reviewDocuments) {
      if (reviewDocuments[document].taskName === currentTaskElement.TaskName && reviewDocuments[document].status.indexOf('Complete') > -1) {
        var docObj = {
          url: '',
          fileName: ''
        }
        docObj.url = reviewDocuments[document].fileUrl;
        docObj.fileName = reviewDocuments[document].fileName;
        reviewDocArray.push(docObj);
      }
    }
    if (newValue.length == 1 && tempArray.length) {
      var queryUrl = "/_api/web/lists/GetByTitle('Schedules')/items?$select=ID,Title,StartDate,DueDate,Status,Task,NextTasks,PrevTasks,Milestone,Actual_x0020_End_x0020_Date,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail&$expand=AssignedTo/Title&$filter=" + previousTaskFilter;
      var previousItems = this.spServices.fetchListItemsByRestAPI(queryUrl);
      var obj = {
        documentURL: [],
        resourceID: 0,
        resource: '',
        taskCompletionDate: new Date(),
        reviewTask: {
          ID: 0,
          Title: '',
          PrevTasks: '',
          Rated: '',
        },
        reviewTaskDocUrl: [],
        taskTitle: '',
        taskID: 0
      }
      obj.documentURL = tempArray;
      obj.resourceID = previousItems[0].AssignedTo.Id;
      obj.resource = previousItems[0].AssignedTo.Title;
      obj.taskCompletionDate = previousItems[0].Actual_x0020_End_x0020_Date;
      obj.reviewTask.ID = currentTaskElement.ID;
      obj.reviewTask.Title = currentTaskElement.TaskName ? currentTaskElement.TaskName : currentTaskElement.Title;
      obj.reviewTask.PrevTasks = currentTaskElement.PrevTasks;
      obj.reviewTask.Rated = currentTaskElement.Rated;
      obj.taskTitle = previousItems[0].Title;
      obj.taskID = previousItems[0].ID;
      obj.reviewTaskDocUrl = reviewDocArray;
      qmsObj.openPopup(obj);
      //window.angularComponentReference.zone.run(() =>{window.angularComponentReference.componentFn(obj);});
    }
  }



}




