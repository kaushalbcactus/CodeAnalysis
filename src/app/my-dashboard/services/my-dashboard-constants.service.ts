import { Injectable } from '@angular/core';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService } from 'primeng/api';
import { CommonService } from 'src/app/Services/common.service';

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
    private spServices: SPOperationService,
    public messageService: MessageService, 
    public common: CommonService) { }

  mydashboardComponent = {

    common : {
      getAllResource: {
        select: 'ID,UserName/ID,UserName/EMail,UserName/Title,UserName/Name,TimeZone/Title,Designation, Manager/ID, Manager/Title, Tasks/ID, Tasks/Title',
        expand: 'UserName,TimeZone,Manager,Tasks',
        filter: "IsActive eq 'Yes'",
        top: '4500'
      },
      getMailTemplate: {
        select: 'Content',
        filter: "Title eq '{{templateName}}'"
      }
    },
    MyTasks: {

      select: 'ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,SubMilestones, IsCentrallyAllocated,AssignedTo/Title,AssignedTo/EMail',
      orderby: 'DueDate asc',
      filter: "AssignedTo eq  {{userId}} and (Task ne 'Send to client') and (Task ne 'Follow up') and (Task ne 'Client Review') and (Task ne 'Time Booking') and",
      filterStatus: "(Status ne 'Completed') and (Status ne 'Auto Closed')  and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      // filterNotCompleted: "(Status ne 'Completed') and (Status ne 'Not Confirmed') and (Status ne 'Deleted') and (Status ne 'Abandon') and (Status ne 'Hold Request') and (Status ne 'Abandon Request') and (Status ne 'Hold') and (Status ne 'Project on Hold')",
      // filterPlanned:"(Status eq 'Not Confirmed')",
      filterCompleted: "(Status eq 'Completed' or Status eq 'Auto Closed') and (Task ne 'Adhoc')",
      filterDate: "and((StartDate ge '{{startDateString}}' and StartDate le '{{endDateString}}') or (DueDate ge '{{startDateString}}' and DueDate le '{{endDateString}}') or (StartDate le '{{startDateString}}' and DueDate ge '{{endDateString}}'))",
      expand: "AssignedTo/Title"

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
      // filter: "ID eq {{taskID}}"
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
      select: "ID,Title,Status,StartDate,DueDate,SubMilestones,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,AssignedTo/Id,AssignedTo/Title",
      filter: 'ID eq {{taskId}}',
      expand: "AssignedTo",
    },
    ClientLegalEntities: {
      select: 'ID,Title',
      orderby: "Title asc",
      top: 4500
    },
    LeaveCalendar: {

      select: 'ID,EventDate,EndDate,IsHalfDay,Title',
      filter: "(UserName/Id eq {{currentUser}} and IsActive eq 'Yes' ) and ((EventDate ge '{{startDateString}}' and EventDate le '{{endDateString}}') or (EndDate ge '{{startDateString}}' and EndDate le '{{endDateString}}') or (EventDate le '{{startDateString}}' and EndDate ge '{{endDateString}}'))",
      orderby: 'Created',
      top: 4500
    },
    AvailableHours: {
      // tslint:disable-next-line: max-line-length
      select: 'ID,WeekStartDate,WeekEndDate,ResourceID,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,MondayLeave,TuesdayLeave,WednesdayLeave,ThursdayLeave,FridayLeave',
      filter: "ResourceID eq {{resourceId}}  and ((WeekStartDate ge '{{startDateString}}' and WeekStartDate le '{{endDateString}}') or (WeekEndDate ge '{{startDateString}}' and WeekEndDate le '{{endDateString}}') or (WeekStartDate le '{{startDateString}}' and WeekEndDate ge '{{endDateString}}'))",
      orderby: 'Created',
      top: 4500
    },
    AllMilestones:
    {
      select: 'ID,Title,SubMilestones',
      filter: "ProjectCode eq '{{projectCode}}' and ContentType eq 'Summary Task' and (Status eq 'In Progress' or (Status eq 'Completed' and Actual_x0020_End_x0020_Date ge '{{DateString}}'))",
      top: 4500
    },

    MyTimelineForBooking: {
      select: "ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,TimeSpentPerDay,SubMilestones",
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
    },
    
  }

  // var endpoint = _spPageContextInfo.webAbsoluteUrl
  // +"/_api/web/lists/getbytitle('" + ListNames.LeaveCalendar + "')/items?$select=ID,EventDate,EndDate,IsHalfDay&$top=4500&$orderby=Created&$filter=(Author/Id eq "+oCapacity.arrUserDetails[indexUser].uid+")and("+
  // "(EventDate ge '"+startDateString+"' and EventDate le '"+endDateString+"') or (EndDate ge '"+startDateString+"' and EndDate le '"+endDateString+"') or (EventDate le '"+startDateString+"' and EndDate ge '"+endDateString+"'))";
  // getBatchBody(batchContentsLeaves, batchGuid, endpoint); 

  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
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
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousNextTask);
    // const myTaskUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', previousNextTask);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, myTaskUrl);

    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.tasks = this.response.length > 0 ? this.response[0] : [];

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
    const currentTask = Object.assign({}, this.mydashboardComponent.previousTaskStatus);
    currentTask.filter = currentTask.filter.replace(/{{taskId}}/gi, task.ID).replace(/{{userID}}/gi, this.sharedObject.sharePointPageObject.userId.toString());
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, currentTask);
      for(const element of this.response) {
      if (element.AllowCompletion === 'No') {
        let previousTaskFilter = '';
        if (element.PrevTasks) {
          const previousTasks = task.PrevTasks.split(';#');
          previousTasks.forEach((value, i) => {
            previousTaskFilter += '(Title eq \'' + value + '\')';
            previousTaskFilter += i < previousTasks.length - 1 ? ' or ' : '';
          });
          const previousTask = Object.assign({}, this.mydashboardComponent.taskStatus);
          previousTask.filter = previousTaskFilter;
          const prevTaskResponse = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousTask);
          for(const obj of prevTaskResponse) {
            status = obj.Status;
          }
        } else {
          status = 'AllowCompletion';
        }
      } else {
        status = 'AllowCompletion';
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
    const allowedTasks = ['Galley', 'Submission Pkg', 'Submit', 'Journal Selection', 'Journal Requirement'];
    if(allowedTasks.includes(task.Task)) {
      await this.GetAllDocuments(task);
      var isJcIdFound = await this.getJCIDS(task);
      if (!isJcIdFound) {
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
    this.response = await this.spServices.readFiles(completeFolderRelativeUrl);
    // var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allDocuments = this.response.length > 0 ? this.response : [];

    this.allDocuments.map(c => c.isFileMarkedAsFinal = c.ListItemAllFields.Status.split(" ").splice(-1)[0] === "Complete" ? true : false);
    this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === task.Title && c.isFileMarkedAsFinal);


  }
  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    let project = Object.assign({}, this.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    // const projectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', project);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response.length > 0 ? this.response[0] : {};
  }


  // **************************************************************************************************************************************
  //  ckeck submission details 
  // **************************************************************************************************************************************


  async getJCIDS(task) {

    var isJcIdFound = false;
    const batchGuid = this.spServices.generateUUID();
    var batchContents = new Array();
    let batchUrl = [];
    if (task.Task === 'Submission Pkg') {
      let jcObj = Object.assign({}, this.queryConfig);
      jcObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.SubmissionPkg);
      jcObj.url = jcObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      jcObj.listName = this.constants.listNames.JCSubmission.name;
      jcObj.type = 'GET';
      batchUrl.push(jcObj);
      // let jcSub = Object.assign({}, this.mydashboardComponent.SubmissionPkg);
      // jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      // const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);
    }
    else if (task.Task === 'Galley') {
      let jcSubObj = Object.assign({}, this.queryConfig);
      jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.GalleySubCat);
      jcSubObj.url = jcSubObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      jcSubObj.listName = this.constants.listNames.JCSubmission.name;
      jcSubObj.type = 'GET';
      batchUrl.push(jcSubObj);

      // let jcSub = Object.assign({}, this.mydashboardComponent.GalleySubCat);
      // jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      // const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);

      let jcSubCatObj = Object.assign({}, this.queryConfig);
      jcSubCatObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.Submit);
      jcSubCatObj.url = jcSubCatObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      jcSubCatObj.listName = this.constants.listNames.JournalConf.name;
      jcSubCatObj.type = 'GET';
      batchUrl.push(jcSubCatObj);

      // let jcSubCat = Object.assign({}, this.mydashboardComponent.Submit);
      // jcSubCat.filter = jcSubCat.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      // const jcSubCatUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcSubCat);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubCatUrl);

      
    }

    else if (task.Task === 'Submit') {

      let jcSubObj = Object.assign({}, this.queryConfig);
      jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.SubmissionPkg);
      jcSubObj.url = jcSubObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      jcSubObj.listName = this.constants.listNames.JCSubmission.name;
      jcSubObj.type = 'GET';
      batchUrl.push(jcSubObj);

      // let jcSub = Object.assign({}, this.mydashboardComponent.SubmissionPkg);
      // jcSub.filter = jcSub.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      // const jcSubUrl = this.spServices.getReadURL('' + this.constants.listNames.JCSubmission.name + '', jcSub);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubUrl);

      let jcSubCatObj = Object.assign({}, this.queryConfig);
      jcSubCatObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.Submit);
      jcSubCatObj.url = jcSubCatObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{Status1}}/gi, 'Resubmit to same journal');
      jcSubCatObj.listName = this.constants.listNames.JournalConf.name;
      jcSubCatObj.type = 'GET';
      batchUrl.push(jcSubCatObj);

      // let jcSubCat = Object.assign({}, this.mydashboardComponent.Submit);
      // jcSubCat.filter = jcSubCat.filter.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{Status1}}/gi, 'Resubmit to same journal');
      // const jcSubCatUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcSubCat);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcSubCatUrl);
      
    }
    else if (task.Task === 'Journal Selection') {
      isJcIdFound = true;
    }
    else if (task.Task === 'Journal Requirement') {
      let jcReqObj = Object.assign({}, this.queryConfig);
      jcReqObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.JournalRequirement);
      jcReqObj.url = jcReqObj.url.replace(/{{projectCode}}/gi, task.ProjectCode);
      jcReqObj.listName = this.constants.listNames.JournalConf.name;
      jcReqObj.type = 'GET';
      batchUrl.push(jcReqObj);

      // let jcReq = Object.assign({}, this.mydashboardComponent.JournalRequirement);
      // jcReq.filter = jcReq.filter.replace(/{{projectCode}}/gi, task.ProjectCode);
      // const jcReqUrl = this.spServices.getReadURL('' + this.constants.listNames.JournalConf.name + '', jcReq);
      // this.spServices.getBatchBodyGet(batchContents, batchGuid, jcReqUrl);
    }
    // this.response = await this.spServices.getDataByApi(batchGuid, batchContents);
    const arrResult = await this.spServices.executeBatch(batchUrl);
    this.response = arrResult.length > 0 ? arrResult.map(a => a.retItems) : [];
    this.jcSubId = undefined;
    this.jcId = undefined;
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

      if (this.jcSubId || this.jcId) {
        isJcIdFound = true;
      }



    }
    return isJcIdFound;
  }


  // **************************************************************************************************************************************
  // Save Task 
  // **************************************************************************************************************************************

  async saveTask(task, isJcIdFound) {


    // const batchGuid = this.spServices.generateUUID();
    // var batchContents = new Array();
    // const changeSetId = this.spServices.generateUUID();
    const batchUrl = [];
    let data = {
      __metadata: { type: 'SP.Data.SchedulesListItem' },
      Actual_x0020_End_x0020_Date: new Date(),
      Actual_x0020_Start_x0020_Date: task.Actual_x0020_Start_x0020_Date !== null ? task.Actual_x0020_Start_x0020_Date : new Date(),
      Status: task.Status,
      TaskComments: task.TaskComments,
    };
    const newdata = task.IsCentrallyAllocated === 'Yes' ? {...data, ActiveCA: 'No'} : {...data};
    const taskObj = Object.assign({}, this.queryConfig);
    taskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.ID);
    taskObj.data = newdata;
    taskObj.listName = this.constants.listNames.Schedules.name;
    taskObj.type = this.constants.listNames.Schedules.type;
    batchUrl.push(taskObj);
    // const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name + "')/items(" + +(task.ID) + ")";
    // this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(newdata), false);
    if (isJcIdFound) {
      var docUrl = '';
      const count = this.DocumentArray.length;
      this.DocumentArray.forEach(function (value, i) {
        docUrl += value.ServerRelativeUrl;
        docUrl += i < count - 1 ? ";#" : '';
      });
      if (task.Task === 'Submission Pkg') {
        const jcSubmissionData = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          SubmissionPkgURL: docUrl
        };
        const jcSubObj = Object.assign({}, this.queryConfig);
        jcSubObj.url = this.spServices.getItemURL(this.constants.listNames.JCSubmission.name, +this.jcSubId);
        jcSubObj.data = jcSubmissionData;
        jcSubObj.listName = this.constants.listNames.JCSubmission.name;
        jcSubObj.type = this.constants.listNames.JCSubmission.type;
        batchUrl.push(jcSubObj);

        // const SubPackPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, SubPackPoint, JSON.stringify(jcSubmissionObj), false);

      }
      else if (task.Task === 'Galley') {
        const jcSubmissionData = {
          __metadata: { type: 'SP.Data.JCGalleyListItem' },
          Title: task.ProjectCode,
          JCSubmissionID: this.jcSubId,
          GalleyDate: new Date().toISOString(),
          GalleyURL: docUrl
        };
        const jcSubObj = Object.assign({}, this.queryConfig);
        jcSubObj.data = jcSubmissionData;
        jcSubObj.listName = this.constants.listNames.jcGalley.name;
        jcSubObj.type = this.constants.listNames.jcGalley.type;
        batchUrl.push(jcSubObj);
        // const GallyPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.jcGalley.name + "')/items";
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, GallyPoint, JSON.stringify(jcSubmissionObj), true);
        //--------------------------------------- new Url--------------------------------------------------//
        // const jcendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        const jcSubData = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          Status: 'Galleyed'
        };
        const jcObj = Object.assign({}, this.queryConfig);
        jcObj.data = jcSubData;
        jcObj.url = this.spServices.getItemURL(this.constants.listNames.JCSubmission.name, +this.jcSubId);
        jcObj.listName = this.constants.listNames.JCSubmission.name;
        jcObj.type = this.constants.listNames.JCSubmission.type;
        batchUrl.push(jcObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcendPoint, JSON.stringify(jcSubObj), false);

        //--------------------------------------- new Url--------------------------------------------------//
        // const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Galleyed'
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = this.constants.listNames.JournalConf.type;
        batchUrl.push(jcConObj);

        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        // const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Galleyed'
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = this.constants.listNames.ProjectInformation.type;
        batchUrl.push(projectInfoObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      }
      else if (task.Task === 'Submit') {
        const jcSubmissionData = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          Status: 'Submitted',
          SubmissionDate: new Date().toISOString(),
          SubmissionURL: docUrl
        };
        const jcSubmissionObj = Object.assign({}, this.queryConfig);
        jcSubmissionObj.data = jcSubmissionData;
        jcSubmissionObj.url = this.spServices.getItemURL(this.constants.listNames.JCSubmission.name, +this.jcSubId);
        jcSubmissionObj.listName = this.constants.listNames.JCSubmission.name;
        jcSubmissionObj.type = this.constants.listNames.JCSubmission.type;
        batchUrl.push(jcSubmissionObj);
        // const SubmitPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JCSubmission.name + "')/items(" + +(this.jcSubId) + ")";
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, SubmitPoint, JSON.stringify(jcSubmissionObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        // const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Submitted'
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = this.constants.listNames.JournalConf.type;
        batchUrl.push(jcConObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);
        //--------------------------------------- new Url--------------------------------------------------//
        // const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Submitted',
          LastSubmissionDate: new Date().toISOString()
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = this.constants.listNames.ProjectInformation.type;
        batchUrl.push(projectInfoObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      } else if (task.Task === 'Journal Selection') {

        // const ProjetcInfoPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.ProjectInformation.name + "')/items(" + +(this.projectInfo.ID) + ")";
        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          JournalSelectionURL: docUrl,
          JournalSelectionDate: new Date().toISOString()
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = this.constants.listNames.ProjectInformation.type;
        batchUrl.push(projectInfoObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, ProjetcInfoPoint, JSON.stringify(projectInfoObj), false);


      }
      else if (task.Task === 'Journal Requirement') {

        // const jcConendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.JournalConf.name + "')/items(" + +(this.jcId) + ")";
        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          JournalRequirementDate: new Date().toISOString(),
          JournalRequirementURL: docUrl
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = this.constants.listNames.JournalConf.type;
        batchUrl.push(jcConObj);
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, jcConendPoint, JSON.stringify(jcConObj), false);


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
      const scObj = Object.assign({}, this.queryConfig);
      scObj.data = data1;
      scObj.url = this.spServices.getItemURL(this.constants.listNames.projectInfo.name, +this.projectInfo.ID);
      scObj.listName = this.constants.listNames.projectInfo.name;
      scObj.type = this.constants.listNames.projectInfo.type;
      batchUrl.push(scObj);
      // const endPoint1 = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.projectInfo.name + "')/items(" + +(this.projectInfo.ID) + ")";
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint1, JSON.stringify(data1), false);
    }
    var mailSubject = task.ProjectCode + "(" + this.projectInfo.WBJID + "): Task Completed";
    nextTasks.forEach(element => {
      const data = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        PreviousTaskClosureDate: new Date()
      };
      const nextTaskObj = Object.assign({}, this.queryConfig);
      nextTaskObj.data = data;
      nextTaskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.ID);
      nextTaskObj.listName = this.constants.listNames.Schedules.name;
      nextTaskObj.type = this.constants.listNames.Schedules.type;
      batchUrl.push(nextTaskObj);
      // const tempendPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name + "')/items(" + +(element.ID) + ")";
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tempendPoint, JSON.stringify(data), false);

      var EmailTemplate = this.Emailtemplate.Content;
      var objEmailBody = [];

      objEmailBody.push({
        "key": "@@Val1@@",
        "value": task.ProjectCode
      });
      objEmailBody.push({
        "key": "@@Val2@@",
        "value": element.SubMilestones ? element.SubMilestones !== "Default" ? element.Title + " - " + element.SubMilestones : element.Title : element.Title
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
      // const obj = {
      //   'properties': {
      //     '__metadata': {
      //       'type': 'SP.Utilities.EmailProperties'
      //     },
      //     'To': {
      //       'results': [element.AssignedTo.EMail]
      //     },
      //     'CC': {
      //       'results': [this.sharedObject.currentUser.email]
      //     },
      //     'From': this.sharedObject.currentUser.email,
      //     'Subject': mailSubject,
      //     'Body': EmailTemplate
      //   }
      // };
      const emailObj = Object.assign({}, this.queryConfig);
      emailObj.data = this.spServices.getEmailData(element.AssignedTo.EMail, this.sharedObject.currentUser.email, mailSubject, EmailTemplate, this.sharedObject.currentUser.email);;
      emailObj.url = this.spServices.getEmailURL();
      batchUrl.push(emailObj);
      // const emailUrl = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/SP.Utilities.Utility.SendEmail";
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, emailUrl, JSON.stringify(obj), true);

    });



    // batchContents.push('--changeset_' + changeSetId + '--');
    // const batchBody = batchContents.join('\r\n');
    // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
    // batchBodyContent.push('--batch_' + batchGuid + '--');
    // const batchBodyContents = batchBodyContent.join('\r\n');
    // const response = await this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);
    await this.spServices.executeBatch(batchUrl);
    return undefined;
    // this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: task.Title + 'Task completed sucessfully.' });
  }


  // *************************************************************************************************************************************
  // Get Email Template  
  // *************************************************************************************************************************************
  async getEmailTemplate() {
    // var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/lists/GetByTitle('" + this.constants.listNames.MailContent.name + "')/items?$select=Content&$filter=Title eq 'NextTaskTemplate'";
    // const batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // this.spServices.getBatchBodyGet(batchContents, batchGuid, Url);
    // var response = await this.spServices.getDataByApi(batchGuid, batchContents);

    // this.Emailtemplate = response[0][0];

    const common = this.mydashboardComponent.common;
    common.getMailTemplate.filter = common.getMailTemplate.filter.replace('{{templateName}}', 'NextTaskTemplate');
    const templateData = await this.spServices.readItems(this.constants.listNames.MailContent.name,
      common.getMailTemplate);
    this.Emailtemplate = templateData.length > 0 ? templateData[0] : [];
  }



  // *************************************************************************************************************************************
  // Get All Clients  
  // *************************************************************************************************************************************


  async getAllClients() {

    let ClientLegalEntities = Object.assign({}, this.mydashboardComponent.ClientLegalEntities);
    this.response  = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, ClientLegalEntities);

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // let ClientLegalEntities = Object.assign({}, this.mydashboardComponent.ClientLegalEntities);
    // const ClientLegalEntitiesUrl = this.spServices.getReadURL('' + this.constants.listNames.ClientLegalEntity.name + '', ClientLegalEntities);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, ClientLegalEntitiesUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);


    const tempClientLegalEntities = this.response.map(c => c.Title);

    const ClientLegalEntitiesResponse = tempClientLegalEntities.filter(function (item, pos) {
      if (!item.toLowerCase().includes('cactus internal')) {
        return tempClientLegalEntities.indexOf(item) == pos;
      }
    });
    let dbClientLegalEntities = [];
    dbClientLegalEntities = ClientLegalEntitiesResponse.map(o => new Object({ label: o, value: o }))

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


  // async getTaskDocument(folderUrl, documentUrl) {
  //   // let documents = [];
  //   const completeFolderRelativeUrl = folderUrl + documentUrl;
  //   let documents = await this.spServices.readFiles(completeFolderRelativeUrl);
  //   if (documents.length) {
  //     documents = documents.sort((a, b) =>
  //       new Date(a.modified) < new Date(b.modified) ? 1 : -1
  //     );
  //   }
  //   return documents;
  // }


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
    var documents = this.common.getTaskDocument(folderUrl, documentsUrl);
    for (var document in documents) {
      if (currentTaskElement.PrevTasks.indexOf(documents[document].ListItemAllFields.TaskName) > -1 && documents[document].ListItemAllFields.Status.indexOf('Complete') > -1) {
        tempArray.push(documents[document].ServerRelativeUrl);
      }
    }
    var reviewDocuments = this.common.getTaskDocument(folderUrl, documentsUrl);
    for (var document in reviewDocuments) {
      if (reviewDocuments[document].ListItemAllFields.TaskName === currentTaskElement.TaskName && reviewDocuments[document].ListItemAllFields.Status.indexOf('Complete') > -1) {
        reviewDocArray.push(reviewDocuments[document].ServerRelativeUrl);
      }
    }
    if (newValue.length == 1 && tempArray.length) {
      const taskObj = Object.assign({}, this.mydashboardComponent.TaskDetails);
      taskObj.filter = previousTaskFilter;
      const previousItems = this.spServices.readItems(this.constants.listNames.Schedules.name, taskObj);
      const obj = {
        documentURL : tempArray,
        resourceID : previousItems[0].AssignedTo.Id,
        subMilestones : previousItems[0].SubMilestones,
        resource : previousItems[0].AssignedTo.Title,
        taskCompletionDate : previousItems[0].Actual_x0020_End_x0020_Date,
        reviewTask : {
          ID : currentTaskElement.ID,
          Title : currentTaskElement.TaskName ? currentTaskElement.TaskName : currentTaskElement.Title,
          PrevTasks : currentTaskElement.PrevTasks,
          Rated : currentTaskElement.Rated
        },
        taskTitle : previousItems[0].Title,
        taskID : previousItems[0].ID,
        reviewTaskDocUrl : reviewDocArray,
      }
      qmsObj.openPopup(obj);
    }
  }
}




