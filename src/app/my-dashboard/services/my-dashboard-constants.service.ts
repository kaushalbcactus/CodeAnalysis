import { Injectable } from '@angular/core';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService } from 'primeng/api';
import { CommonService } from 'src/app/Services/common.service';
import { Subject, Observable } from 'rxjs';
import { ISPRequest } from 'src/app/qms/interfaces/qms';
import { QMSConstantsService } from 'src/app/qms/qms/services/qmsconstants.service';

@Injectable({
  providedIn: 'root'
})
export class MyDashboardConstantsService {
  tasks: any[];
  previousNextTaskChildRes: any[];
  batchContents: any[];
  response: any[];
  NextPreviousTask: any[];
  DocumentArray: any[];
  projectInfo: any;
  allDocuments: any;
  jcSubId: any;
  jcId: any;
  Emailtemplate: any;

  private OpenTaskSelectedTab = new Subject<any>();
  private TimelineSelectedTab = new Subject<any>();

  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    public messageService: MessageService,
    public common: CommonService,
    public qmsConstant: QMSConstantsService) { }


  public openTaskSelectedTab = {
    event: '',
    days: 0,
    selectedDate: ''
  };

  mydashboardComponent = {

    user: {
      isUserFTE: false,
    },

    common: {
      getAllResource: {
        select: 'ID,UserName/ID,UserName/EMail,UserName/Title,UserName/Name,TimeZone/Title,Designation, Manager/ID, Manager/Title, Tasks/ID, Tasks/Title',
        expand: 'UserName,TimeZone,Manager,Tasks',
        filter: 'IsActive eq \'Yes\'',
        top: '4500'
      },
      getMailTemplate: {
        select: 'Content',
        filter: 'Title eq \'{{templateName}}\''
      }
    },
    MyTasks: {

      select: 'ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,SubMilestones, IsCentrallyAllocated,ParentSlot,AssignedTo/Title,AssignedTo/EMail',
      orderby: 'DueDate asc',
      filter: 'AssignedTo eq  {{userId}} and (Task ne \'Send to client\') and (Task ne \'Follow up\') and (Task ne \'Client Review\') and (Task ne \'Time Booking\') and (Task ne \'Blocking\') and ',
      filterStatus: '(Status ne \'Completed\') and (Status ne \'Auto Closed\')  and (Status ne \'Deleted\') and (Status ne \'Abandon\') and (Status ne \'Hold Request\') and (Status ne \'Abandon Request\') and (Status ne \'Hold\') and (Status ne \'Project on Hold\')',
      filterCompleted: '(Status eq \'Completed\' or Status eq \'Auto Closed\') and (Task ne \'Adhoc\')',
      filterDate: 'and((StartDate ge \'{{startDateString}}\' and StartDate le \'{{endDateString}}\') or (DueDate ge \'{{startDateString}}\' and DueDate le \'{{endDateString}}\') or (StartDate le \'{{startDateString}}\' and DueDate ge \'{{endDateString}}\'))',
      expand: 'AssignedTo/Title'

    },
    ClientLegalEntitys: {
      select: 'ID,Title,Acronym,Geography,ClientGroup,Bucket,DistributionList',
      orderby: 'Title asc',
      filter: 'IsActive eq \'yes\'',
      top: 4500
    },
    ResourceCategorization: {
      select: 'ID,UserName/ID,UserName/Title,Account/ID,Account/Title,Manager/ID,Manager/Title,Designation,PrimarySkill,SkillLevel/ID,SkillLevel/Title,TimeZone/ID,TimeZone/Title,IsActive,IsFTE',
      expand: 'UserName/ID,UserName/Title,Account/ID,Account/Title,Manager/ID,Manager/Title,SkillLevel,TimeZone/ID,TimeZone/Title',
      filter: 'IsActive eq \'Yes\'',
      orderby: 'UserName/Title',
      top: 4500
    },
    ProjectContacts: {
      select: 'ID,Title,FName,LName,EmailAddress,Designation,Phone,Address,FullName,Department,Status,ReferralSource,RelationshipStrength,EngagementPlan,Comments,ProjectContactsType,ProjectContactsType,ClientLegalEntity',
      top: '4500'
    },
    ProjectInformations: {
      select: 'ID,Title,ProjectCode,Status,ClientLegalEntity,Milestones,WBJID,ProjectFolder',
      filter: '(Status eq \'Author Review\' or Status eq \'In Progress\' or Status eq \'Ready for Client\' or Status eq \'Unallocated\')',
      orderby: 'ProjectCode asc',
      top: '4500'
    },
    FTEProjectInformations: {
      select: 'ID,Title,ProjectCode,Status,ClientLegalEntity,Milestones,Milestone,WBJID,ProjectFolder,ServiceLevel',
      filter: 'ProjectType eq \'FTE-Writing\' and (Status eq \'Author Review\' or Status eq \'In Progress\' or Status eq \'Ready for Client\' or Status eq \'Unallocated\') and PrimaryResMembersId eq {{userId}} ',
      orderby: 'ProjectCode asc',
      top: '4500'
    },
    FTESchedulesSubMilestones: {
      select: 'ID,Title,ProjectCode,SubMilestones',
      filter: 'ProjectCode eq \'{{ProjectCode}}\' and Title eq \'{{Milestone}}\'',
      top: '4500'
    },
    FTESchedulesTask: {
      select: 'ID,Title,ProjectCode,SubMilestones',
      filter: 'ProjectCode eq \'{{ProjectCode}}\' and Milestone eq \'{{Milestone}}\' and Task ne \'Blocking\' and Task ne \'Meeting\' and Task ne \'Training\'',
      top: '4500'
    },
    previousNextTask: {
      select: 'ID,Title,StartDate,DueDate,Status,Task,NextTasks,PrevTasks,Milestone,SubMilestones,IsCentrallyAllocated,ParentSlot,Start_x0020_Date_x0020_Text,End_x0020_Date_x0020_Text,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail,Actual_x0020_End_x0020_Date',
      filter: '',
      expand: 'AssignedTo/Title'
    },
    previousNextTaskParent: {
      select: 'ID,Title,StartDate,DueDate,Status,Task,NextTasks,PrevTasks,Milestone,SubMilestones,IsCentrallyAllocated,ParentSlot,Start_x0020_Date_x0020_Text,End_x0020_Date_x0020_Text,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail,ProjectCode',
      filter: 'ID eq {{ParentSlotId}}',
      expand: 'AssignedTo/Title'
    },
    nextPreviousTaskChild: {
      select: 'ID,Title,StartDate,DueDate,Status,Task,NextTasks,PrevTasks,Milestone,SubMilestones,IsCentrallyAllocated,ParentSlot,Start_x0020_Date_x0020_Text,End_x0020_Date_x0020_Text,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail,Actual_x0020_End_x0020_Date',
      filter: 'ParentSlot eq {{ParentSlotId}} and Status ne \'Deleted\'',
      expand: 'AssignedTo/Title'
    },
    previousTaskStatus: {
      select: 'ID,Title,Status,NextTasks,Task,AllowCompletion,PrevTasks,AssignedTo/Title,ParentSlot',
      filter: 'ID eq {{taskId}} and AssignedTo eq {{userID}} ',
      expand: 'AssignedTo/Title'
    },
    taskStatus: {
      select: 'ID,Title,Status,Task,NextTasks,PrevTasks,AssignedTo/Id,AssignedTo/Title,AssignedTo/EMail',
      filter: '',
      expand: 'AssignedTo/Title'
    },
    TimeSpent: {
      select: 'ID,Title,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,DueDate,Status,ExpectedTime,TimeSpentPerDay,TimeSpentSubmitStatus',
      // filter: 'ID eq {{taskId}}',
    },
    Comments: {
      select: 'ID,Title,Milestone,FileDirRef,NextTasks,PrevTasks,Status,ProjectCode,Task',
      // filter: "ID eq {{taskID}}"
    },
    Milestone: {

      select: 'ID,Title,AssignedTo/Id,AssignedTo/Title,DueDate,TaskComments,SubMilestones',
      expand: 'AssignedTo',
      orderby: 'DueDate desc',
      filter: 'ProjectCode eq \'{{ProjectCode}}\' and Milestone eq \'{{Milestone}}\''

    },
    projectInfo: {
      select: 'ID,Title,ProjectCode,ProjectFolder,Milestone,Milestones,WBJID,IsPubSupport,ClientLegalEntity,PrimaryPOC,Status,DeliverableType',
      filter: 'ProjectCode eq \'{{projectCode}}\''
    },
    projectInfoByPC: {
      select: 'ID,Title,ProjectCode,CMLevel1/ID',
      expand: 'CMLevel1/ID',
      filter: 'ProjectCode eq \'{{ProjectCode}}\''
    },
    SubmissionPkg: {
      select: 'ID,Title,JCID,SubmissionDate,SubmissionURL,SubmissionPkgURL,DecisionURL,DecisionDate,Decision,Status',
      filter: 'Title eq \'{{projectCode}}\' and Status eq \'{{Status}}\'',
      top: 1
    },

    GalleySubCat: {
      select: 'ID,Title,JCID,SubmissionDate,SubmissionURL,SubmissionPkgURL,DecisionURL,DecisionDate,Decision,Status',
      filter: 'Title eq \'{{projectCode}}\' and (Status eq \'{{Status}}\' or  Status eq \'{{Status1}}\')',
      top: 1
    },
    Submit: {
      select: 'ID,Title,Status',
      filter: 'Title eq \'{{projectCode}}\' and (Status eq \'{{Status}}\' or  Status eq \'{{Status1}}\')',
      top: 1
    },
    JournalRequirement:
    {
      select: 'ID,Title,Status',
      filter: 'Title eq \'{{projectCode}}\'',
      top: 1,
      orderby: 'Created desc'
    },

    MyTimeline: {
      select: 'ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,SubMilestones',
      orderby: 'DueDate asc',
      filter: 'AssignedTo eq  {{userId}} and (Task ne \'Send to client\') and (Task ne \'Follow up\') and (Task ne \'Client Review\') and  (Task ne \'Time Booking\') and (Task ne \'Blocking\') and ',
      filterNotCompleted: '(Status ne \'Completed\') and (Status ne \'Not Confirmed\') and (Status ne \'Deleted\') and (Status ne \'Abandon\') and (Status ne \'Hold Request\') and (Status ne \'Abandon Request\') and (Status ne \'Hold\') and (Status ne \'Project on Hold\') and (Status ne \'Auto Closed\')',
      filterPlanned: '(Status eq \'Not Confirmed\')',
      filterCompleted: '(Task ne \'Adhoc\') and ((Status eq \'Completed\' ) or (Status eq \'Auto Closed\'))',
      filterAdhoc: '(Task eq \'Adhoc\' and ProjectCode eq \'Adhoc\' and Status eq \'Completed\')',
      filterAll: '(Status ne \'Deleted\')',
      filterDate: 'and((StartDate ge \'{{startDateString}}\' and StartDate le \'{{endDateString}}\') or (DueDate ge \'{{startDateString}}\' and DueDate le \'{{endDateString}}\') or (StartDate le \'{{startDateString}}\' and DueDate ge \'{{endDateString}}\'))',
      top: 4500
    },
    TaskDetails: {
      select: 'ID,Title,Status,StartDate,DueDate,SubMilestones,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,AssignedTo/Id,AssignedTo/Title',
      filter: 'ID eq {{taskId}}',
      expand: 'AssignedTo',
    },
    ClientLegalEntities: {
      select: 'ID,Title',
      orderby: 'Title asc',
      filter: 'IsActive eq \'Yes\'',
      top: 4500
    },
    LeaveCalendar: {

      select: 'ID,EventDate,EndDate,IsHalfDay,Title,IsActive',
      filter: '(UserName/Id eq {{currentUser}} and IsActive eq \'Yes\' ) and ((EventDate ge \'{{startDateString}}\' and EventDate le \'{{endDateString}}\') or (EndDate ge \'{{startDateString}}\' and EndDate le \'{{endDateString}}\') or (EventDate le \'{{startDateString}}\' and EndDate ge \'{{endDateString}}\'))',
      orderby: 'Created',
      top: 4500
    },
    AvailableHours: {
      // tslint:disable-next-line: max-line-length
      select: 'ID,WeekStartDate,WeekEndDate,ResourceID,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,MondayLeave,TuesdayLeave,WednesdayLeave,ThursdayLeave,FridayLeave',
      filter: 'ResourceID eq {{resourceId}}  and ((WeekStartDate ge \'{{startDateString}}\' and WeekStartDate le \'{{endDateString}}\') or (WeekEndDate ge \'{{startDateString}}\' and WeekEndDate le \'{{endDateString}}\') or (WeekStartDate le \'{{startDateString}}\' and WeekEndDate ge \'{{endDateString}}\'))',
      orderby: 'Created',
      top: 4500
    },
    AllMilestones:
    {
      select: 'ID,Title,SubMilestones',
      filter: 'ProjectCode eq \'{{projectCode}}\' and ContentType eq \'Summary Task\' and (Status eq \'In Progress\' or (Status eq \'Completed\' and Actual_x0020_End_x0020_Date ge \'{{DateString}}\'))',
      top: 4500
    },

    MyTimelineForBooking: {
      select: 'ID,Title,Status,StartDate,DueDate,Actual_x0020_Start_x0020_Date,Actual_x0020_End_x0020_Date,ExpectedTime,TimeSpent,NextTasks,Comments,ProjectCode,PrevTasks,Milestone,Task,FinalDocSubmit,TaskComments,TATStatus,Entity,TimeSpentPerDay,SubMilestones',
      orderby: 'DueDate asc',
      filter: 'AssignedTo eq  {{userId}} and ',
      filterNotCompleted: '(Status ne \'Not Confirmed\') and (Status ne \'Deleted\') and (Status ne \'Abandon\') and (Status ne \'Hold Request\') and (Status ne \'Abandon Request\') and (Status ne \'Hold\') and (Status ne \'Project on Hold\')',
      filterDate: 'and ((StartDate ge \'{{startDateString}}\' and StartDate le \'{{endDateString}}\') or (DueDate ge \'{{startDateString}}\' and DueDate le \'{{endDateString}}\') or (Actual_x0020_Start_x0020_Date ge \'{{startDateString}}\' and Actual_x0020_Start_x0020_Date le \'{{endDateString}}\') or (Actual_x0020_End_x0020_Date ge \'{{startDateString}}\' and Actual_x0020_End_x0020_Date le \'{{endDateString}}\') or (StartDate le \'{{startDateString}}\' and DueDate ge \'{{endDateString}}\') or (StartDate ge \'{{startDateString}}\' and DueDate le \'{{endDateString}}\') or (Actual_x0020_Start_x0020_Date le \'{{startDateString}}\' and DueDate ge \'{{endDateString}}\'))',
      top: 4500
    },
    ProjectInformation:
    {
      select: 'ID,Title,ProjectCode,ProjectFolder,ClientLegalEntity,PrimaryPOC,Status,DeliverableType,Milestone,Milestones,SubDeliverable,ServiceLevel,TA,Indication,Molecule,Complexity,Priority,ProposedStartDate,ProposedEndDate,ActualStartDate,ActualEndDate,IsPubSupport,PubSupportStatus,ConferenceJournal,Authors,Comments,WBJID,SOWCode,ProjectType,Created,Author/Title,BusinessVertical,SubDivision,SOWBoxLink,Description',
      filterByCode: 'ProjectCode eq \'{{projectCode}}\'',
      filterByTitle: 'WBJID eq \'{{shortTitle}}\'',
      filter: '',
      expand: 'Author/Title'
    },
    ProjectInfoResources: {
      select: 'ID,Title,ProjectCode,ClientLegalEntity,PrimaryResMembers/Id,PrimaryResMembers/Title,Writers/ID,Writers/Title,Reviewers/ID,Reviewers/Title,Editors/ID,Editors/Title,QC/ID,QC/Title,GraphicsMembers/ID,GraphicsMembers/Title,PSMembers/ID,PSMembers/Title',
      expand: 'PrimaryResMembers/Id,PrimaryResMembers/Title,Writers/ID,Writers/Title,Reviewers/ID,Reviewers/Title,Editors/ID,Editors/Title,QC/ID,QC/Title,GraphicsMembers/ID,GraphicsMembers/Title,PSMembers/ID,PSMembers/Title',
      filter: 'ID eq {{projectId}}',
    },
    ProjectResource:
    {
      select: 'ID,Title,ProjectCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      filter: 'ID eq {{projectId}}',
    },

  };

  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  // For current task
  setOpenTaskTabValue(data: any) {
    this.OpenTaskSelectedTab.next(data);
  }

  getOpenTaskTabValue(): Observable<any> {
    return this.OpenTaskSelectedTab.asObservable();
  }

  // My Timeline
  // For current task
  setTimelineTabValue(data: any) {
    this.TimelineSelectedTab.next(data);
  }

  getTimelineTabValue(): Observable<any> {
    return this.TimelineSelectedTab.asObservable();
  }

  // *************************************************************************************************************************************
  // Get Next Previous task from current task
  // *************************************************************************************************************************************

  async getNextPreviousTask(task) {
    this.tasks = [];
    let nextTaskFilter = '';
    let previousTaskFilter = '';
    let nextTasks;
    let previousTasks;
    let currentTaskNextTask = task.NextTasks;
    let currentTaskPrevTask = task.PrevTasks;

    if (task.ParentSlot) {
      const parentPreviousNextTask = Object.assign({}, this.mydashboardComponent.previousNextTaskParent);
      parentPreviousNextTask.filter = parentPreviousNextTask.filter.replace('{{ParentSlotId}}', task.ParentSlot);
      this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasks');
      const parentNPTasks = await this.spServices.readItems(this.constants.listNames.Schedules.name, parentPreviousNextTask);
      console.log(parentNPTasks);
      const parentNPTask = parentNPTasks.length ? parentNPTasks[0] : [];
      if (!currentTaskNextTask) {
        currentTaskNextTask = parentNPTask.NextTasks;
      }
      if (!currentTaskPrevTask) {
        currentTaskPrevTask = parentNPTask.PrevTasks;
      }
    }

    if (currentTaskNextTask) {
      nextTasks = currentTaskNextTask.split(';#');
      nextTasks.forEach((value, i) => {
        // tslint:disable-next-line: quotemark
        nextTaskFilter += "(Title eq '" + value + "')";
        nextTaskFilter += i < nextTasks.length - 1 ? ' or ' : '';
      });
    }
    if (currentTaskPrevTask) {
      previousTasks = currentTaskPrevTask.split(';#');
      previousTasks.forEach((value, i) => {
        previousTaskFilter += '(Title eq \'' + value + '\')';
        previousTaskFilter += i < previousTasks.length - 1 ? ' or ' : '';
      });
    }

    const taskFilter = (nextTaskFilter !== '' && previousTaskFilter !== '') ?
      nextTaskFilter + ' or ' + previousTaskFilter : (nextTaskFilter === '' && previousTaskFilter !== '')
        ? previousTaskFilter : (nextTaskFilter !== '' && previousTaskFilter === '') ? nextTaskFilter : '';

    if (!taskFilter) {
      return [];
    }
    const previousNextTask = Object.assign({}, this.mydashboardComponent.previousNextTask);
    previousNextTask.filter = taskFilter;
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasksFromSchedules');
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousNextTask);

    this.tasks = this.response.length ? this.response : [];


    if (currentTaskNextTask) {
      this.tasks.filter(c => nextTasks.includes(c.Title)).map(c => c.TaskType = 'Next Task');
    }
    if (currentTaskPrevTask) {
      this.tasks.filter(c => previousTasks.includes(c.Title)).map(c => c.TaskType = 'Previous Task');
    }

    this.previousNextTaskChildRes = [];
    for (const ele of this.tasks) {
      if (ele.IsCentrallyAllocated === 'Yes') {
        let previousNextTaskChild: any = [];
        previousNextTaskChild = Object.assign({}, this.mydashboardComponent.nextPreviousTaskChild);
        previousNextTaskChild.filter = previousNextTaskChild.filter.replace('{{ParentSlotId}}', ele.ID.toString());
        this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasksFromParentSlot');
        let res: any = await this.spServices.readItems(this.constants.listNames.Schedules.name, previousNextTaskChild);
        if (res.hasError) {
          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: res.message.value });
          return;
        }
        res = res.length ? res : [];
        const taskBreak = [];
        res.forEach(element => {
          if (ele.TaskType === 'Next Task') {
            if (!element.PrevTasks) {
              element.TaskType = ele.TaskType;
              taskBreak.push(element);
            }
          } else {
            if (!element.NextTasks) {
              element.TaskType = ele.TaskType;
              taskBreak.push(element);
            }
          }

        });
        if (!taskBreak.length) {
          this.previousNextTaskChildRes.push(ele);
        } else {
          this.previousNextTaskChildRes = this.previousNextTaskChildRes.concat(taskBreak);
        }

      } else if (ele.IsCentrallyAllocated === 'No') {
        this.previousNextTaskChildRes.push(ele);
      }
    }

    this.tasks = this.previousNextTaskChildRes.length ? this.previousNextTaskChildRes : this.tasks;
    console.log('previousNextTaskChildRes ', this.previousNextTaskChildRes);
    this.tasks.map(c => c.StartDate = c.StartDate !== null ? this.datePipe.transform(c.StartDate, 'MMM d, y h:mm a') : '-');
    this.tasks.map(c => c.DueDate = c.DueDate !== null ? this.datePipe.transform(c.DueDate, 'MMM d, y h:mm a') : '-');

    return this.tasks;
  }



  async checkEmailNotificationEnable(task) {
    let EnableNotification = false;
    if (task.Status === 'Completed' || task.Status === 'Auto Closed') {
      let PastDate = await this.RemoveBusinessDays(new Date(), 2);
      PastDate = new Date(PastDate.getFullYear(), PastDate.getMonth(), PastDate.getDate());
      let TaskEndDate = task.Actual_x0020_End_x0020_Date ? new Date(task.Actual_x0020_End_x0020_Date) : new Date(task.DueDate);
      TaskEndDate = new Date(TaskEndDate.getFullYear(), TaskEndDate.getMonth(), TaskEndDate.getDate());
      EnableNotification = PastDate.getTime() <= TaskEndDate.getTime() ? true : false;
    }
    return EnableNotification;
  }




  // *******************************************************************************************************
  //  get Previous Task Status
  // *******************************************************************************************************


  async getPrevTaskStatus(task) {
    let status = '';
    const currentTask = Object.assign({}, this.mydashboardComponent.previousTaskStatus);
    currentTask.filter = currentTask.filter.replace(/{{taskId}}/gi, task.ID)
      .replace(/{{userID}}/gi, this.sharedObject.currentUser.userId.toString());
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasksStatus');
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, currentTask);
    for (const element of this.response) {
      if (element.AllowCompletion === 'No') {

        const nextPrevTasks = await this.getNextPreviousTask(element);
        const prevTaskResponse = nextPrevTasks.filter(e => e.TaskType === 'Previous Task');
        if (prevTaskResponse.length) {

          for (const obj of prevTaskResponse) {
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


  // *******************************************************************************************************
  //  Complete Task
  // ********************************************************************************************************


  async CompleteTask(task) {
    let response;
    this.projectInfo = await this.getCurrentTaskProjectInformation(task.ProjectCode);
    this.NextPreviousTask = await this.getNextPreviousTask(task);
    const allowedTasks = ['Galley', 'Submission Pkg', 'Submit', 'Journal Selection', 'Journal Requirement'];
    if (allowedTasks.includes(task.Task)) {
      await this.GetAllDocuments(task);
      const isJcIdFound = await this.getJCIDS(task);
      if (!isJcIdFound) {
        response = 'Task can\'t be closed as no submission details are found.';
        return response;
      } else {
        response = await this.saveTask(task, true);
      }
    } else {
      response = await this.saveTask(task, false);
    }
    if (task.ParentSlot) {
      await this.getCurrentAndParentTask(task, 'Completed');
    }
    return response;
  }

  getCSDetails(res) {
    const pcmLevels = [];
    if (res.hasOwnProperty('CMLevel1') && res.CMLevel1.hasOwnProperty('results') && res.CMLevel1.results.length) {
      for (const ele of res.CMLevel1.results) {
        pcmLevels.push(ele);
      }
      return pcmLevels;
    } else {
      return [];
    }
  }

  async getCurrentAndParentTask(task: any, status) {


    let batchURL = [];
    // Parent Task
    const parentTaskObj = Object.assign({}, this.mydashboardComponent.previousNextTaskParent);
    parentTaskObj.filter = parentTaskObj.filter.replace(/{{ParentSlotId}}/g, task.ParentSlot);
    batchURL.push({
      data: null,
      url: this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', parentTaskObj),
      type: 'GET',
      listName: this.constants.listNames.Schedules.name
    });

    // Current Task
    const currentTaskObj = Object.assign({}, this.mydashboardComponent.previousNextTaskParent);
    currentTaskObj.filter = currentTaskObj.filter.replace(/{{ParentSlotId}}/g, task.ID);
    batchURL.push({
      data: null,
      url: this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', currentTaskObj),
      type: 'GET',
      listName: this.constants.listNames.Schedules.name
    });
    if (status === 'Completed') {

      // Project Information
      const projectInfObj = Object.assign({}, this.mydashboardComponent.projectInfoByPC);
      projectInfObj.filter = projectInfObj.filter.replace(/{{ProjectCode}}/g, task.ProjectCode);
      batchURL.push({
        data: null,
        url: this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', projectInfObj),
        type: 'GET',
        listName: this.constants.listNames.ProjectInformation.name
      });

    }

    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'getCurrentAndParentTask');
    const currentParentTasks = await this.spServices.executeBatch(batchURL);
    const parentTaskProp = { Status: 'In Progress', ActiveCA: 'Yes', __metadata: { type: this.constants.listNames.Schedules.type } };
    const parentTaskRes = currentParentTasks.length ? currentParentTasks[0].retItems[0] : null;
    const currentTaskRes = currentParentTasks.length ? currentParentTasks[1].retItems[0] : null;
    if (status === 'Completed') {
      const projInfoRes = currentParentTasks.length ? currentParentTasks[2].retItems[0] : null;
      if (!currentTaskRes.NextTasks) {
        if (parentTaskRes.Status !== 'Completed') {
          const ctDueDate = new Date(this.datePipe.transform(currentTaskRes.DueDate, 'MMM d, y h:mm a'));
          const todayDate = new Date();
          const ONE_HOUR = 60 * 60 * 1000;
          const timeDiff = ctDueDate.getTime() - todayDate.getTime();
          const pcmLevels: any[] = this.getCSDetails(projInfoRes);

          if (ctDueDate > todayDate && timeDiff > ONE_HOUR) {
            const earlyTaskCompleteObj = {
              __metadata: { type: this.constants.listNames.EarlyTaskComplete.type },
              Title: currentTaskRes.Title,
              ProjectCode: currentTaskRes.ProjectCode,
              ProjectCSId: { results: pcmLevels.map(x => x.ID) },
              IsActive: 'Yes'
            };
            batchURL = [];
            batchURL.push({
              data: earlyTaskCompleteObj,
              url: this.spServices.getReadURL(this.constants.listNames.EarlyTaskComplete.name, null),
              type: 'POST',
              listName: this.constants.listNames.EarlyTaskComplete.name
            });
            this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'EarlyTaskNotification');
            const res = await this.spServices.executeBatch(batchURL);
          }
          parentTaskProp.Status = 'Completed';
          parentTaskProp.ActiveCA = 'No';
        } else {
          return false;
        }
      } else if (!currentTaskRes.PrevTasks) {
        if (parentTaskRes.Status !== 'In Progress' && parentTaskRes.Status !== 'Completed') {
          parentTaskProp.Status = 'In Progress';
        } else {
          return false;
        }
      } else if (currentTaskRes.PrevTasks && currentTaskRes.NextTasks) {
        if (parentTaskRes.Status !== 'In Progress' && parentTaskRes.Status !== 'Completed') {
          parentTaskProp.Status = 'In Progress';
        } else {
          return false;
        }
      }
    } else {
      if (parentTaskRes.Status !== 'In Progress' && parentTaskRes.Status !== 'Completed') {
        parentTaskProp.Status = 'In Progress';
      } else {
        return false;
      }
    }
    const postbatchURL = [];
    postbatchURL.push({
      data: parentTaskProp,
      url: this.spServices.getItemURL(this.constants.listNames.Schedules.name, parentTaskRes.Id),
      type: 'PATCH',
      listName: this.constants.listNames.Schedules.name
    });
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'UpdateSlot');
    await this.spServices.executeBatch(postbatchURL);
  }


  // **************************************************************************************************************************************
  //  Get  milestone documents
  // **************************************************************************************************************************************

  async GetAllDocuments(task) {
    this.DocumentArray = [];
    const documentsUrl = '/Drafts/Internal/' + task.Milestone;
    let completeFolderRelativeUrl = '';
    completeFolderRelativeUrl = this.projectInfo.ProjectFolder + documentsUrl;
    this.common.SetNewrelic('MyDashboard', 'my-dashboard-constants', 'readFiles');
    this.response = await this.spServices.readFiles(completeFolderRelativeUrl);
    this.allDocuments = this.response.length > 0 ? this.response : [];
    this.allDocuments.map(c => c.isFileMarkedAsFinal = c.ListItemAllFields.Status.split(' ').splice(-1)[0] === 'Complete' ? true : false);
    this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === task.Title && c.isFileMarkedAsFinal);
  }
  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const project = Object.assign({}, this.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'getCurrentTaskProjectInformation');
    this.response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    return this.response.length > 0 ? this.response[0] : {};
  }


  // **************************************************************************************************************************************
  //  ckeck submission details
  // **************************************************************************************************************************************

  // tslint:disable: max-line-length
  async getJCIDS(task) {

    let isJcIdFound = false;
    const batchUrl = [];
    if (task.Task === 'Submission Pkg') {
      const jcObj = Object.assign({}, this.queryConfig);
      jcObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.SubmissionPkg);
      jcObj.url = jcObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      jcObj.listName = this.constants.listNames.JCSubmission.name;
      jcObj.type = 'GET';
      batchUrl.push(jcObj);
    } else if (task.Task === 'Galley') {
      const jcSubObj = Object.assign({}, this.queryConfig);
      jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.GalleySubCat);
      jcSubObj.url = jcSubObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      jcSubObj.listName = this.constants.listNames.JCSubmission.name;
      jcSubObj.type = 'GET';
      batchUrl.push(jcSubObj);
      const jcSubCatObj = Object.assign({}, this.queryConfig);
      jcSubCatObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.Submit);
      jcSubCatObj.url = jcSubCatObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Accepted').replace(/{{Status1}}/gi, 'Galleyed');
      jcSubCatObj.listName = this.constants.listNames.JournalConf.name;
      jcSubCatObj.type = 'GET';
      batchUrl.push(jcSubCatObj);
    } else if (task.Task === 'Submit') {
      const jcSubObj = Object.assign({}, this.queryConfig);
      jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.JCSubmission.name, this.mydashboardComponent.SubmissionPkg);
      jcSubObj.url = jcSubObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected');
      jcSubObj.listName = this.constants.listNames.JCSubmission.name;
      jcSubObj.type = 'GET';
      batchUrl.push(jcSubObj);
      const jcSubCatObj = Object.assign({}, this.queryConfig);
      jcSubCatObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.Submit);
      jcSubCatObj.url = jcSubCatObj.url.replace(/{{projectCode}}/gi, task.ProjectCode).replace(/{{Status}}/gi, 'Selected').replace(/{{Status1}}/gi, 'Resubmit to same journal');
      jcSubCatObj.listName = this.constants.listNames.JournalConf.name;
      jcSubCatObj.type = 'GET';
      batchUrl.push(jcSubCatObj);
    } else if (task.Task === 'Journal Selection') {
      isJcIdFound = true;
    } else if (task.Task === 'Journal Requirement') {
      const jcReqObj = Object.assign({}, this.queryConfig);
      jcReqObj.url = this.spServices.getReadURL(this.constants.listNames.JournalConf.name, this.mydashboardComponent.JournalRequirement);
      jcReqObj.url = jcReqObj.url.replace(/{{projectCode}}/gi, task.ProjectCode);
      jcReqObj.listName = this.constants.listNames.JournalConf.name;
      jcReqObj.type = 'GET';
      batchUrl.push(jcReqObj);
    }
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'ckeckSubmissionDetails');
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


  // ********************************************************************************************************
  // Save Task
  // *****************************************************************************************************

  async saveTask(task, isJcIdFound) {

    const batchUrl = [];
    const data = {
      __metadata: { type: 'SP.Data.SchedulesListItem' },
      Actual_x0020_End_x0020_Date: new Date(),
      Actual_x0020_Start_x0020_Date: task.Actual_x0020_Start_x0020_Date !== null ? task.Actual_x0020_Start_x0020_Date : new Date(),
      Status: task.Status,
      TaskComments: task.TaskComments,
    };
    const newdata = task.IsCentrallyAllocated === 'Yes' ? { ...data, ActiveCA: 'No' } : { ...data };
    const taskObj = Object.assign({}, this.queryConfig);
    taskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +task.ID);
    taskObj.data = newdata;
    taskObj.listName = this.constants.listNames.Schedules.name;
    taskObj.type = 'PATCH';
    batchUrl.push(taskObj);

    if (isJcIdFound) {
      let docUrl = '';
      const count = this.DocumentArray.length;
      this.DocumentArray.forEach((value, i) => {
        docUrl += value.ServerRelativeUrl;
        docUrl += i < count - 1 ? ';#' : '';
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
        jcSubObj.type = 'PATCH';
        batchUrl.push(jcSubObj);

      } else if (task.Task === 'Galley') {
        const jcSubmissionData = {
          __metadata: { type: 'SP.Data.JCGalleyListItem' },
          Title: task.ProjectCode,
          JCSubmissionID: this.jcSubId,
          GalleyDate: new Date().toISOString(),
          GalleyURL: docUrl
        };
        const jcSubObj = Object.assign({}, this.queryConfig);
        jcSubObj.url = this.spServices.getReadURL(this.constants.listNames.jcGalley.name);
        jcSubObj.data = jcSubmissionData;
        jcSubObj.listName = this.constants.listNames.jcGalley.name;
        jcSubObj.type = 'POST';
        batchUrl.push(jcSubObj);

        const jcSubData = {
          __metadata: { type: 'SP.Data.JCSubmissionListItem' },
          Status: 'Galleyed'
        };
        const jcObj = Object.assign({}, this.queryConfig);
        jcObj.data = jcSubData;
        jcObj.url = this.spServices.getItemURL(this.constants.listNames.JCSubmission.name, +this.jcSubId);
        jcObj.listName = this.constants.listNames.JCSubmission.name;
        jcObj.type = 'PATCH';
        batchUrl.push(jcObj);

        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Galleyed'
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = 'PATCH';
        batchUrl.push(jcConObj);

        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Galleyed'
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = 'PATCH';
        batchUrl.push(projectInfoObj);

      } else if (task.Task === 'Submit') {
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
        jcSubmissionObj.type = 'PATCH';
        batchUrl.push(jcSubmissionObj);

        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          Status: 'Submitted'
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = 'PATCH';
        batchUrl.push(jcConObj);

        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          PubSupportStatus: 'Submitted',
          LastSubmissionDate: new Date().toISOString()
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = 'PATCH';
        batchUrl.push(projectInfoObj);

      } else if (task.Task === 'Journal Selection') {
        const projectInfoData = {
          __metadata: { type: 'SP.Data.ProjectInformationListItem' },
          JournalSelectionURL: docUrl,
          JournalSelectionDate: new Date().toISOString()
        };
        const projectInfoObj = Object.assign({}, this.queryConfig);
        projectInfoObj.data = projectInfoData;
        projectInfoObj.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, +this.projectInfo.ID);
        projectInfoObj.listName = this.constants.listNames.ProjectInformation.name;
        projectInfoObj.type = 'PATCH';
        batchUrl.push(projectInfoObj);

      } else if (task.Task === 'Journal Requirement') {
        const jcConData = {
          __metadata: { type: 'SP.Data.JournalConferenceListItem' },
          JournalRequirementDate: new Date().toISOString(),
          JournalRequirementURL: docUrl
        };
        const jcConObj = Object.assign({}, this.queryConfig);
        jcConObj.data = jcConData;
        jcConObj.url = this.spServices.getItemURL(this.constants.listNames.JournalConf.name, +this.jcId);
        jcConObj.listName = this.constants.listNames.JournalConf.name;
        jcConObj.type = 'PATCH';
        batchUrl.push(jcConObj);

      }
    }
    const nextTasks = this.NextPreviousTask !== undefined ? this.NextPreviousTask.filter(c => c.TaskType === 'Next Task') : [];
    let sendToClientPresent = false;
    if (nextTasks.length > 0) {
      sendToClientPresent = nextTasks.find(c => c.Task === 'Send to client') !== undefined ? true : false;
    }

    if (sendToClientPresent) {
      const data1 = {
        __metadata: { type: 'SP.Data.ProjectInformationListItem' },
        Status: 'Ready for Client'
      };
      const scObj = Object.assign({}, this.queryConfig);
      scObj.data = data1;
      scObj.url = this.spServices.getItemURL(this.constants.listNames.projectInfo.name, +this.projectInfo.ID);
      scObj.listName = this.constants.listNames.projectInfo.name;
      scObj.type = 'PATCH';
      batchUrl.push(scObj);
    }
    let mailSubject = task.ProjectCode + '(' + this.projectInfo.WBJID + '): Task Completed';
    nextTasks.forEach(element => {
      const postdata = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        PreviousTaskClosureDate: new Date()
      };
      const nextTaskObj = Object.assign({}, this.queryConfig);
      nextTaskObj.data = postdata;
      nextTaskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +element.ID);
      nextTaskObj.listName = this.constants.listNames.Schedules.name;
      nextTaskObj.type = 'PATCH';
      batchUrl.push(nextTaskObj);
      if (element.AssignedTo.EMail) {
        let EmailTemplate = this.Emailtemplate.Content;
        const objEmailBody = [];
        // tslint:disable: object-literal-key-quotes
        objEmailBody.push({
          'key': '@@Val1@@',
          'value': task.ProjectCode
        });
        objEmailBody.push({
          'key': '@@Val2@@',
          'value': element.SubMilestones ? element.SubMilestones !== 'Default' ? element.Title + ' - ' +
            element.SubMilestones : element.Title : element.Title
        });
        objEmailBody.push({
          'key': '@@Val3@@',
          'value': element.AssignedTo.Title
        });
        objEmailBody.push({
          'key': '@@Val4@@',
          'value': element.Task
        });
        objEmailBody.push({
          'key': '@@Val5@@',
          'value': element.Milestone
        });
        objEmailBody.push({
          'key': '@@Val6@@',
          'value': element.StartDate
        });
        objEmailBody.push({
          'key': '@@Val7@@',
          'value': element.DueDate
        });
        objEmailBody.push({
          'key': '@@Val8@@',
          'value': task.TaskComments ? task.TaskComments : ''
        });
        objEmailBody.push({
          'key': '@@Val0@@',
          'value': element.ID
        });

        objEmailBody.forEach(obj => {
          EmailTemplate = EmailTemplate.replace(RegExp(obj.key, 'gi'), obj.value);
        });
        EmailTemplate = EmailTemplate.replace(RegExp('\'', 'gi'), '');
        EmailTemplate = EmailTemplate.replace(/\\/g, '\\\\');
        mailSubject = mailSubject.replace(RegExp('\'', 'gi'), '');
        const sendEmailObj = {
          __metadata: { type: this.constants.listNames.SendEmail.type },
          Title: mailSubject,
          MailBody: EmailTemplate,
          Subject: mailSubject,
          ToEmailId: element.AssignedTo.EMail,
          FromEmailId: this.sharedObject.currentUser.email,
          CCEmailId: this.sharedObject.currentUser.email
        };
        const createSendEmailObj = Object.assign({}, this.queryConfig);
        createSendEmailObj.url = this.spServices.getReadURL(this.constants.listNames.SendEmail.name, null);
        createSendEmailObj.data = sendEmailObj;
        createSendEmailObj.type = 'POST';
        createSendEmailObj.listName = this.constants.listNames.SendEmail.name;
        batchUrl.push(createSendEmailObj);
      }

    });

    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'SaveTask');
    await this.spServices.executeBatch(batchUrl);
    return undefined;
  }


  // *************************************************************************************************************************************
  // Get Email Template
  // *************************************************************************************************************************************
  async getEmailTemplate() {
    this.common.SetNewrelic('MyDashboard', 'MyDashboard', 'GetEmailTemplate');
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
    const ClientLegalEntities = Object.assign({}, this.mydashboardComponent.ClientLegalEntities);
    this.common.SetNewrelic('MyDashboard', 'MyDashboardConstants-getAllClients', 'readItems');
    this.response = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, ClientLegalEntities);
    const tempClientLegalEntities = this.response.map(c => c.Title);
    const ClientLegalEntitiesResponse = tempClientLegalEntities.filter((item, pos) => {
      if (!item.toLowerCase().includes('cactus internal')) {
        return tempClientLegalEntities.indexOf(item) === pos;
      }
    });
    let dbClientLegalEntities = [];
    dbClientLegalEntities = ClientLegalEntitiesResponse.map(o => new Object({ label: o, value: o }));
    return dbClientLegalEntities;
  }

  // *************************************************************************************************************************************
  // Calculate minimum date
  // *************************************************************************************************************************************


  CalculateminstartDateValue(date, days) {
    let tempminDateValue = null;
    const dayCount = days;
    let tempDate = new Date(date);
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

  // *************************************************************************************************
  //  Calculate difference between 2 dates
  // *************************************************************************************************

  differenceBetweenHours(startDateTime, endDateTime) {
    let diff = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / 1000 / 60);
    return (hours < 9 ? '0' : '') + hours + ':' + (minutes < 9 ? '0' : '') + minutes;
  }

  // *************************************************************************************************
  //  Return unique objects  string
  // *************************************************************************************************

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value,
      };
    });
  }

  async callQMSPopup(currentTask) {
    const qmsTasks = [];
    const batchUrl = [];
    let previousTasks = currentTask.prevTaskDetails ? currentTask.prevTaskDetails : [];
    if (previousTasks.length) {
      previousTasks = previousTasks.filter(pt => pt.Status === 'Completed' || pt.Status === 'Auto Closed');
      const project = this.sharedObject.DashboardData.ProjectCodes.find(c => c.ProjectCode === currentTask.ProjectCode);
      const folderUrl = project.ProjectFolder;
      const documentsUrl = '/Drafts/Internal/' + currentTask.Milestone;
      const options: ISPRequest = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      const getMilestoneTasks = Object.assign({}, options);
      getMilestoneTasks.url = this.spServices.getReadURL(this.constants.listNames.MilestoneTasks.name,
        this.qmsConstant.common.getMilestoneTasks);
      getMilestoneTasks.listName = this.constants.listNames.MilestoneTasks.name;
      getMilestoneTasks.type = 'GET';
      batchUrl.push(getMilestoneTasks);

      const getDocuments = Object.assign({}, options);
      const url = folderUrl + documentsUrl;
      getDocuments.url = this.spServices.getFilesFromFoldersURL(url);
      getDocuments.listName = 'Milestone files';
      getDocuments.type = 'GET';
      batchUrl.push(getDocuments);

      this.common.SetNewrelic('MyDashboard', 'MyDashboardConstants-callQMSPopup', 'readItems');
      const arrResults = await this.spServices.executeBatch(batchUrl);
      const milestoneTasks = arrResults.length > 0 ? arrResults[0].retItems : [];
      const documents = arrResults.length > 1 ? arrResults[1].retItems : [];
      const arrEQGTasks = ['Edit', 'QC', 'Graphics'];
      const arrFinalizeTasks = ['Finalize', 'Inco'];
      currentTask.isEQGTask = arrEQGTasks.indexOf(currentTask.Task) > -1 ? true : false;
      currentTask.isFinalizeTask = !currentTask.isEQGTask ? arrFinalizeTasks.indexOf(currentTask.Task) > -1 ? true : false : false;
      currentTask.isReviewTask = !currentTask.isEQGTask && !currentTask.isFinalizeTask ? currentTask.Task.indexOf('Review-') > -1 ? true : false : false;
      const milestoneTask = milestoneTasks.find(t => t.Title === currentTask.Task);
      currentTask.defaultSkill = currentTask.isReviewTask ? 'Review' : milestoneTask.DefaultSkill ? milestoneTask.DefaultSkill : '';
      currentTask.scorecardRatingAllowed = milestoneTask.ScorecardRatingAllowed ? milestoneTask.ScorecardRatingAllowed : '';
      for (const previousTask of previousTasks) {
        if (currentTask.scorecardRatingAllowed) {
          const arrEQGSkills = ['Editor', 'QC', 'Graphics'];
          const writer = 'Writer';
          const reviewer = 'Reviewer';
          let arrPrevTaskDocUrl = documents.filter(d => d.ListItemAllFields.TaskName === previousTask.Title && d.ListItemAllFields.Status.indexOf('Complete') > -1);
          arrPrevTaskDocUrl = arrPrevTaskDocUrl.length ? arrPrevTaskDocUrl.map(d => d.ServerRelativeUrl) : '';
          let arrReviewDocUrl = documents.filter(d => d.ListItemAllFields.TaskName === currentTask.Title && d.ListItemAllFields.Status.indexOf('Complete') > -1);
          arrReviewDocUrl = arrReviewDocUrl ? arrReviewDocUrl.map(d => d.ServerRelativeUrl) : '';
          previousTask.skill = this.getResourceSkill(previousTask);
          previousTask.isResourceEQG = arrEQGSkills.findIndex(t => previousTask.skill.includes(t)) > -1 ? true : false;
          previousTask.isWriter = !previousTask.isResourceEQG ? previousTask.skill.includes(writer) : false;
          previousTask.isReviewer = !previousTask.isResourceEQG && !previousTask.isWriter ? previousTask.skill.includes(reviewer) : false;
          previousTask.isReviewTask = previousTask.Task.indexOf('Review-') > -1 ? true : false;
          if (currentTask.isReviewTask || (!previousTask.isReviewTask && arrPrevTaskDocUrl.length > 0 &&
            ((currentTask.isEQGTask && previousTask.isWriter) ||
              (currentTask.isFinalizeTask && previousTask.isResourceEQG)
            )
          )
          ) {
            const obj = {
              documentURL: arrPrevTaskDocUrl,
              resourceID: previousTask.AssignedTo.Id,
              milestone: previousTask.Milestone ? previousTask.Milestone : '',
              subMilestones: previousTask.SubMilestones,
              resource: previousTask.AssignedTo.Title,
              taskCompletionDate: previousTask.Actual_x0020_End_x0020_Date,
              reviewTask: {
                ID: currentTask.ID,
                Title: currentTask.Title ? currentTask.Title : currentTask.Title,
                PrevTasks: currentTask.prevTaskDetails,
                Rated: currentTask.Rated,
                defaultSkill: currentTask.defaultSkill
              },
              taskTitle: previousTask.Title,
              taskID: previousTask.ID,
              reviewTaskDocUrl: arrReviewDocUrl
            };
            qmsTasks.push(obj);
          }
        }
      }
    }
    return qmsTasks;
  }

  getResourceSkill(task) {
    const assignedTo = task.AssignedTo ? task.AssignedTo : -1;
    const resource = this.sharedObject.DashboardData.ResourceCategorization.find(res => res.UserName.ID === assignedTo.Id);
    const skill = resource ? resource.SkillLevel.Title ? resource.SkillLevel.Title : '' : '';
    return skill;
  }
  // *************************************************************************************************************************************
  // remove days to get start date for previous days
  // *************************************************************************************************************************************

  RemoveBusinessDays(date, days) {

    let tempDate = new Date(date);
    while (days > 0) {

      tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
      if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
        days -= 1;
      }
    }
    return tempDate;
  }
  
}




