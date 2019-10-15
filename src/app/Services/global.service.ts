import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }
  public userInfo: any;
  public oReviewerPendingTasks = [];
  public oTask = {
    resource: '',
    taskTitle: '',
    taskCompletionDate: new Date(),
    documentURL: '',
    docUrlHtmlTag: '',
    reviewTask: {
      ID: 0,
      Title: ''
    }
  };

  public oCapacity = {
    arrUserDetails: [],
    arrDateRange : [],
    arrResources : [],
    arrDateFormat: [],
  };
  public templateMatrix = {
    task: '',
    submilestones: '',
    taskID: 0,
    assignedToID: '',
    assignedTo: '',
    documentUrl: '',
    reviewTaskDocUrl: '',
    taskCompletionDate: new Date(),
    templates: [],
    selectedTemplate: {
      ID: '',
      Title: ''
    },
    selectedTemplateDetails: [{
      question: '',
      rating: 0,
      tooltip: ''
    }],
    averageRating: 0,
    feedback: '',
    reviewTask: {
      ID: 0,
      Title: ''
    }
  };

  /**
   * Copy created to restore when cancel button clicked on rating popup
   *
   * @ memberof GlobalService
   */
  // tslint:disable-next-line:variable-name
  public templateMatrix_copy = {
    task: '',
    taskID: 0,
    assignedToID: '',
    documentUrl: '',
    reviewTaskDocUrl: '',
    taskCompletionDate: new Date(),
    templates: [],
    selectedTemplate: {
      ID: '',
      Title: ''
    },
    selectedTemplateDetails: [{
      question: '',
      rating: 0,
      tooltip: ''
    }],
    averageRating: 0,
    feedback: '',
    reviewTask: {
      ID: 0,
      Title: ''
    }
  };

  public personalFeedback = {
    internal: {
      assignedTo: {
        ID: 0,
        title: '',
        designation: ''
      },
      scorecardFeedbacksOriginal: [],
      scorecardFeedbacksFiltered: [],
      averageRating: ''
    },
    external: {
      qc: []
    }
  };
  public scorecardItem = {
    feedbackDate: new Date(),
    taskTitle: '',
    feedbackType: '',
    feedbackBy: {
      ID: 0,
      Title: ''
    },
    rating: 0,
    comments: '',
    AverageRating: 0
  };
  public viewTabsPermission = {
    hideAdmin: false,
    hideAdminScorecard: false
  };
  public sharePointPageObject = {
    webAbsoluteUrl: '',
    webAbsoluteArchiveUrl: '',
    serverRelativeUrl: '',
    webRelativeUrl: '',
    publicCdn: '',
    userId: 0,
    email: '',
    title: '',
    rootsite: '',
  };


  /* To be removed */

  public resSectionShow = true;
  public DashboardData = {
    ProjectContacts: [],
    ResourceCategorization: [],
    ClientLegalEntity: [],
    ProjectCodes: [],
    CurrentUserInfo: [],
    ProjectInformation:
    {
      ID: null,
      Id: null,
      IsPubSupport: '',
      Milestone: null,
      Milestones: null,
      ProjectCode: null,
      ProjectFolder: null,
      Title: null,
      WBJID: null,
    }
  };

  public currentUser = {
    id: -1,
    title: '',
    email: '',
    timeZone: 0,
    designation: '',
    webAbsoluteUrl: '',
    serverRelativeUrl: '',
    loggedInUserInfo: [],
    loggedInUserGroup: [],
    isPFAdmin: false,
    isCDAdmin: false,
    groups: []
  };

  /*****************************************************************
 Maxwell
 Task Allocation Object
 *******************************************************************/

  public today = new Date();

  public oTaskAllocation: any = {
    oCentralGroup: [],
    oLegalEntity: {},
    oResources: [],
    oProjectDetails: {
      projectCode: '',
      ID: null,
      Writers: null,
      Reviewers: null,
      Editors: null,
      QC: null,
      GraphicsMembers: null,
      PSMembers: null,
      PrimaryResMembers: null,
      AllDeliveryResources: null,
      CMLevel1: null,
      CMLevel2: null,
      Milestone: null,
      nextMilestone: null,
      futureMilestones: null,
      prevMilestone: null,
      arrMilestones: null,
      oPrjFinance: null,
      TA: null,
      DeliverableType: null,
      ClientLegalEntity: [],
      WBJID: '',
      Status: '',
      PrevStatus: '',
      ProjectFolder: '',
    },
    oMilestones: [],
    oTasks: {},
    oProjectAttr: {

    },
    nTaskBuckets: 0,
    gMilestones_copy: {
      milestones: [],
      allTasks: []
    },
    oTaskObject: {
      PreviousTaskClosureDate: null,
      Actual_x0020_End_x0020_Date: null,
      Actual_x0020_Start_x0020_Date: null,
      AllowCompletion: 'No',
      TATStatus: 'No',
      AssignedTo: null,
      Comments: null,
      DueDate: null,
      ExpectedTime: '0',
      FileSystemObjectType: 0,
      ID: -1,
      Id: -1,
      Milestone: '',
      NextTasks: null,
      PreviousTasks: null,
      SkillLevel: null,
      StartDate: null,
      Status: 'Not Saved',
      Task: '',
      TimeSpent: '',
      Title: '',
      TaskPosition: '',
      allowStart: false,
      assignedUserTimeZone: '+5.5',
      assignedUsers: [],
      assignedUserChanged: false,
      editMode: true,
      editTask: true,
      deallocateCentral: false,
      dueDate: { date: { day: this.today.getDate(), month: this.today.getMonth() + 1, year: this.today.getFullYear() } },
      endTimeAMPM: 'AM',
      endTimeHrs: 9,
      endTimeMins: 0,
      endDateOptions: {},
      jsEndDate: new Date((new Date()).setHours(9, 0, 0, 0)),
      jsLocalEndDate: new Date((new Date()).setHours(9, 0, 0, 0)),
      replacedTaskTitle: '',
      scope: null,
      startDate: { date: { day: this.today.getDate(), month: this.today.getMonth() + 1, year: this.today.getFullYear() } },
      startTimeAMPM: 'AM',
      startTimeHrs: 9,
      startTimeMins: 0,
      jsStartDate: new Date((new Date()).setHours(9, 0, 0, 0)),
      jsLocalStartDate: new Date((new Date()).setHours(9, 0, 0, 0)),
      taskName: '',
      toggleCapacity: true,
      swimLaneNumber: -1,
      taskIndex: -1,
      id: '',
      paths: [],
      showAllowStart: false,
      showTATChkBox: false,
      taskExist: false,
      tatBusinessDays: 0,
      restrictCascade: true,
      CentralAllocationDone: 'No',
      IsCentrallyAllocated: 'No',
      ShowSkillCategory: 'No',
      color: '#000000',
    },
    oMilestoneObject: {
      Actual_x0020_End_x0020_Date: null,
      Actual_x0020_Start_x0020_Date: null,
      TATBusinessDays: 0,
      AllowCompletion: 'No',
      AssignedTo: null,
      Comments: null,
      milestoneExists: false,
      DueDate: null,
      ExpectedTime: '0',
      FileSystemObjectType: 1,
      ID: -1,
      Id: -1,
      Milestone: '',
      NextTasks: null,
      PreviousTasks: null,
      SkillLevel: null,
      StartDate: null,
      Status: 'Not Saved',
      Task: '',
      TimeSpent: '',
      Title: '',
      TaskPosition: '',
      endDate: { date: { day: this.today.getDate(), month: this.today.getMonth() + 1, year: this.today.getFullYear() } },
      hoursSpent: '',
      isCurrentMilestone: false,
      isFutureMilestone: false,
      isNextMilestone: false,
      nextMilestone: '',
      replacedTitle: '',
      startDate: { date: { day: this.today.getDate(), month: this.today.getMonth() + 1, year: this.today.getFullYear() } },
      tasks: [],
      id: '',
      type: '',
      nSwimlanes: 1,
      swimlaneCount: 1,
      editMilestone: true,
      color: '#000000',
    },
    arrRestructureMilestone: [],
    arrMilestones: [],
    arrSubMilestones: [],
    userCapacity: {
      totalAllocated: 0,
      totalUnallocated: 0
    }
  };

  public allResources = [];
  public pfAdmins = [];
  public cdAdmins = [];

  public imageSrcURL = {
    editImageURL: ''+this.sharePointPageObject.publicCdn+'/edit.png',
    cancelImageURL:''+this.sharePointPageObject.publicCdn+'/cancel.png',
    scopeImageURL: ''+this.sharePointPageObject.publicCdn+'/comments.png'
  };


  unique(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k] ? entry[k] : '').join('|');
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  }
}
