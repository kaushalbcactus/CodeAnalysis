import { ConstantsService } from 'src/app/Services/constants.service';
import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';

@Injectable({
  providedIn: 'root'
})
export class QMSConstantsService {

  constructor(private globalConstant: ConstantsService, private global: GlobalService) { }
  //tslint:disable
  public common = {
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
  };
  public reviewerComponent = {
    reviewerPendingTaskURL: {
      select: 'ID, Title, Task, SubMilestones, ProjectCode, Status, Milestone, AssignedTo/ID, AssignedTo/Title,DueDate, PrevTasks, Rated',
      expand: 'AssignedTo/ID, AssignedTo/Title',
      filter: "AssignedTo/ID eq '" + this.global.currentUser.userId + "' and (Status eq 'Completed' or Status eq 'Auto Closed')" +
        " and startswith(Task,'Review-') and  DueDate ge '{{PrevMonthDate}}' and Rated eq 0",
      top: '{{TopCount}}'
    },
    prevOfReviewTasksUrl: {
      select: 'ID, Title, SubMilestones, ProjectCode, Status, Milestone, AssignedTo/ID, AssignedTo/Title, Actual_x0020_End_x0020_Date, PrevTasks, NextTasks, Rated',
      expand: 'AssignedTo/ID, AssignedTo/Title',
      filter: "Title eq '{{PrevTaskTitle}}' and Rated eq 0",
      top: '1'
    },
    projectInformationUrl: {
      select: 'ProjectCode, ProjectFolder',
      filter: "ProjectCode eq '{{projectCode}}'",
      top: '1'
    },
  };

  public feedbackPopupComponent = {
    getTemplates: {
      select: 'ID,Title,Tooltip',
      filter: "IsActive eq 1",
      top: '{{TopCount}}'
    },
    getTemplateMatrix: {
      select: 'ID,Title, ScorecardTemplate/Title, Tooltip',
      expand: 'ScorecardTemplate/Title',
      filter: "IsActive eq 1 and ScorecardTemplate/Title eq '{{selectedTemplate}}'",
      top: '{{TopCount}}'
    },
    notRatedPrevTasks: {
      select: 'ID, Title, ProjectCode, Status, Milestone, AssignedTo/ID, AssignedTo/Title, Actual_x0020_End_x0020_Date, PrevTasks, NextTasks',
      expand: 'AssignedTo/ID, AssignedTo/Title',
      filter: "Title eq '{{PrevTaskTitle}}' and Rated eq 0",
      top: '1'
    }
  };

  public personalFeedbackComponent = {
    Internal: {
      getCurrentResource: {
        select: 'ID,UserName/ID,UserName/EMail,UserName/Title,UserName/Name,TimeZone/Title,Designation',
        expand: 'UserName,TimeZone',
        filter: "IsActive eq 'Yes' and UserName/ID eq '" + this.global.currentUser.userId + "'",
        top: '1'
      },
      getScorecard: {
        select: 'ID,Title,SubMilestones, Comments,Created, AssignedTo/ID, AssignedTo/Title, Author/ID, Author/Title, DocumentsUrl, FeedbackType, SubmissionDate, AverageRating',
        expand: 'AssignedTo, Author',
        filter: "AssignedTo/ID eq '{{AssignedTo}}' {{FeedbackTypeFilter}} and Created ge '{{startDate}}' and Created le '{{endDate}}' and  Validity ne 0",
        top: '{{TopCount}}',
        orderby: 'Created desc'
      },
      getRatings: {
        select: '*, Parameter/Title, ScorecardTemplate/Title',
        expand: 'ScorecardTemplate, Parameter',
        filter: "Scorecard/ID eq '{{ID}}'",
        top: "20"
      },
    },
    External: {
      getQC: {
        select: 'ID, Title, FileID, FileURL, SentDate,SentBy/ID, SentBy/Title, Modified, Status, Category,' +
          'Resources/ID, IdentifiedResource/ID, IdentifiedResource/Title, SeverityLevel, BusinessImpact,Segregation,' +
          'Comments, RootCauseAnalysis, CorrectiveActions, PreventiveActions, IsActive',
        expand: 'IdentifiedResource, SentBy, Resources',
        filter: "Status ne 'Deleted' and Resources/ID eq '" + this.global.currentUser.userId + "' and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
        top: '{{TopCount}}',
        orderby: 'SentDate desc'
      },
      getQCDownload: {
        select: 'ID, Title, FileID, FileURL, SentDate,SentBy/ID, SentBy/Title, Modified, Status, Category,' +
          'Resources/ID, IdentifiedResource/ID, IdentifiedResource/Title, SeverityLevel, BusinessImpact,Segregation,' +
          'Comments, RootCauseAnalysis, CorrectiveActions, PreventiveActions, IsActive',
        expand: 'IdentifiedResource, SentBy, Resources',
        filter: "Status ne 'Deleted' and Resources/ID eq '{{AssignedTo}}' and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
        top: '{{TopCount}}',
        orderby: 'SentDate desc'
      },
    },
    PositiveFeedbacks: {
      getPF: {
      select: 'ID, Title, FileID, FileURL, SentDate,SentBy/ID, SentBy/Title, Modified, Resources/ID, Resources/Title, DeliveryLeads/ID',
      expand: 'SentBy, Resources, DeliveryLeads',
      filter: "IsActive eq 1 and Status eq 'Accepted' and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
      top: '{{TopCount}}',
      orderby: 'SentDate desc'
      }
    },
    FeebackByMe: {
      getScorecardByMe: {
        select: 'ID,Title, SubMilestones, Comments,Created, AssignedTo/ID, AssignedTo/Title, Author/ID, Author/Title, DocumentsUrl, FeedbackType, SubmissionDate, AverageRating',
        expand: 'AssignedTo, Author',
        filter: "Author/ID eq '" + this.global.currentUser.userId + "' {{FeedbackTypeFilter}} and Created ge '{{startDate}}' and Created le '{{endDate}}' and  Validity ne 0",
        top: '{{TopCount}}',
        orderby: 'Created desc'
      },
      getResourceScorecard: {
        select: 'ID,Title, SubMilestones, Comments,Created, AssignedTo/ID, AssignedTo/Title, Author/ID, Author/Title, DocumentsUrl, FeedbackType, SubmissionDate, AverageRating',
        expand: 'AssignedTo, Author',
        filter: "AssignedTo/ID eq  '{{AssignedTo}}' {{FeedbackTypeFilter}} and Created ge '{{startDate}}' and Created le '{{endDate}}' and  Validity ne 0",
        top: '{{TopCount}}',
        orderby: 'Created desc'
      },
      getRatings: {
        select: '*, Parameter/Title, ScorecardTemplate/Title',
        expand: 'ScorecardTemplate, Parameter',
        filter: "Scorecard/ID eq '{{ID}}'",
        top: "20"
      },
    }
  };

  public ManagerComponent = {
    getManagerResources: {
      select: 'ID,UserName/ID,UserName/EMail,UserName/Title,UserName/Name,Designation, Manager/ID, Manager/Title',
      expand: 'UserName, Manager',
      filter: "IsActive eq 'Yes' and Manager/ID eq '{{ManagerID}}'",
      top: '{{TopCount}}'
    },
    getQualitativeFeedback: {
      select: 'ID,Title, Comments,Created, AssignedTo/ID, AssignedTo/Title, Author/ID, Author/Title, FeedbackType',
      expand: 'AssignedTo, Author',
      filter: "AssignedTo/ID eq '{{AssignedTo}}' and FeedbackType eq '" + this.globalConstant.FeedbackType.qualitative + "' and Created ge '{{startDate}}' and Created le '{{endDate}}'",
      top: '{{TopCount}}',
      orderby: 'Created desc'
    },
    getPositveFeedback: {
      select: 'ID, Title, FileID, FileURL, SentDate,SentBy/ID, SentBy/Title, Modified, Resources/ID',
      expand: 'SentBy, Resources',
      filter: "Resources/ID eq '{{AssignedTo}}' and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
      top: '{{TopCount}}',
      orderby: 'SentDate desc'
    }
  };

  public AdminViewComponent = {
    getResources: {
      select: 'ID,UserName/ID,UserName/EMail,UserName/Title,UserName/Name,Designation, Manager/ID, Manager/Title, Tasks/ID, Tasks/Title',
      expand: 'UserName, Manager, Tasks',
      filter: "IsActive eq 'Yes' and UserName/ID ne '" + this.global.currentUser.userId + "'",
      top: '{{TopCount}}',
      orderby: 'UserName/Title asc'
    },
    resourceTaskUrl: {
      select: 'ID, Title, ProjectCode, SubMilestones, Status, Milestone, AssignedTo/ID, AssignedTo/Title, Actual_x0020_End_x0020_Date, PrevTasks, NextTasks, Rated, IsRated',
      expand: 'AssignedTo/ID, AssignedTo/Title',
      filter: "AssignedTo/ID eq '{{resourceID}}' and Task eq '{{TaskType}}' and (Status eq 'Completed' or Status eq 'Auto Closed')" +
              " and  DueDate ge '{{PrevMonthDate}}'",
      top: '{{TopCount}}'
    },
    projectInformationUrl:{
      select: 'ProjectCode, ProjectFolder',
      filter: "ProjectCode eq '{{projectCode}}'",
      top: '1'
    },
  };

  public ClientFeedback = {
    ClientDissatisfactionComponent: {
      getQC: {
        select: 'ID, Title, FileID, FileURL, IsActive, SentDate,SentBy/ID, SentBy/Title, Modified, Status, Category, Resources/ID,' +
        'IdentifiedResource/ID, IdentifiedResource/Title, IdentifiedResource/EMail, SeverityLevel, BusinessImpact,Segregation,' +
        'ASD/ID, TL/ID, CS/ID, Comments, RootCauseAnalysis, CorrectiveActions, PreventiveActions, RejectionComments',
        expand: 'IdentifiedResource, SentBy, Resources, ASD, TL, CS',
        filter: "{{statusFilter}} SentDate ge '{{startDate}}' and SentDate le '{{endDate}}' and (ASD/ID eq '" + this.global.currentUser.userId + "')",
        top: '{{TopCount}}',
        orderby: 'SentDate desc'
      },
      getQCAdmin: {
        select: 'ID, Title, FileID, FileURL, IsActive, SentDate,SentBy/ID, SentBy/Title, Modified, Status, Category, Resources/ID,' +
        'IdentifiedResource/ID, IdentifiedResource/Title, IdentifiedResource/EMail, SeverityLevel, BusinessImpact,Segregation,' +
        'ASD/ID, TL/ID, CS/ID, Comments, RootCauseAnalysis, CorrectiveActions, PreventiveActions, RejectionComments',
        expand: 'IdentifiedResource, SentBy, Resources, ASD, TL, CS',
        filter: "{{statusFilter}} SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
        top: '{{TopCount}}',
        orderby: 'SentDate desc'
      },
      getRMCSOpsResourceUrl: {
        select: 'UserName/ID,UserName/EMail,UserName/Title, Tasks/ID, Tasks/Title',
        expand: 'UserName, Tasks',
        filter: "IsActive eq 'Yes' and (PrimarySkill ne 'Writer' and PrimarySkill ne 'Editor' and"+
        " PrimarySkill ne 'Graphics' and PrimarySkill ne 'Reviewer' and PrimarySkill ne 'Quality Check'"+
        " and PrimarySkill ne 'Publication Support')",
        top: '4500',
        orderby: 'UserName/Title asc'
      },
      getSSResourceUrl: {
        select: 'UserName/ID,UserName/EMail,UserName/Title, Tasks/ID, Tasks/Title',
        expand: 'UserName, Tasks',
        filter: "IsActive eq 'Yes' and (PrimarySkill eq 'Writer' or PrimarySkill eq 'Editor' or"+
        " PrimarySkill eq 'Graphics' or PrimarySkill eq 'Reviewer' or PrimarySkill eq 'Quality Check'"+
        " or PrimarySkill eq 'Publication Support')",
        top: '4500',
        orderby: 'UserName/Title asc'
      },
      getProject: {
        select: 'ProjectCode,WBJID, DeliveryLevel1/ID,DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title, DeliveryLevel2/EMail, PrimaryResMembers/ID, PrimaryResMembers/Title,'+
        'CMLevel1/ID,CMLevel1/Title, CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail, AllDeliveryResources/ID, AllDeliveryResources/Title, Milestone, BD/ID, BD/EMail',
        expand: 'DeliveryLevel1, DeliveryLevel2, PrimaryResMembers, CMLevel1, CMLevel2, AllDeliveryResources, BD',
        filter: "ProjectCode eq '{{projectCode}}'",
        top: '4900',
        orderby: 'ProjectCode'
      },
      getClient:{
        select: 'Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title, DeliveryLevel2/EMail,'+
        'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID,  CMLevel2/Title,  CMLevel2/EMail',
        expand: 'DeliveryLevel1, DeliveryLevel2, CMLevel1, CMLevel2',
        filter: "IsActive eq 'Yes' and Title eq '{{Title}}'",
        top: '4900',
        orderby: 'Title'
      },
      getOpenProjects:{
        select: 'ProjectCode,WBJID, DeliveryLevel1/ID,DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title, DeliveryLevel2/EMail, PrimaryResMembers/ID, PrimaryResMembers/Title,'+
        'CMLevel1/ID,CMLevel1/Title, CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail, AllDeliveryResources/ID, AllDeliveryResources/Title, Milestone, BD/ID, BD/EMail',
        expand: 'DeliveryLevel1, DeliveryLevel2, PrimaryResMembers, CMLevel1, CMLevel2, AllDeliveryResources, BD',
        filter: "Status eq '" + this.globalConstant.projectStatus.AuthorReview + "' or Status eq '" + this.globalConstant.projectStatus.AuditInProgress + "'"+
        "or Status eq '" + this.globalConstant.projectStatus.Unallocated + "' or Status eq '" + this.globalConstant.projectStatus.SentToAMForApproval + "'"+
        "or Status eq '" + this.globalConstant.projectStatus.OnHold + "' or Status eq '" + this.globalConstant.projectStatus.ReadyForClient + "'"+
        "or Status eq '" + this.globalConstant.projectStatus.PendingClosure + "' or Status eq '" + this.globalConstant.projectStatus.InProgress + "'",
        top: '4900',
        orderby: 'ProjectCode'
      },
      getClients:{
        select: 'Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title, DeliveryLevel2/EMail,'+
        'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID,  CMLevel2/Title,  CMLevel2/EMail',
        filter: "IsActive eq 'Yes'",
        expand: 'DeliveryLevel1, DeliveryLevel2, CMLevel1, CMLevel2',
        top: '4900',
        orderby: 'Title'
      }
    },
    PositiveFeedbackComponent: {
      getPF: {
        select: 'ID, Title, FileID, FileURL, Status, IsActive, SentDate,SentBy/ID, SentBy/Title, Modified, Resources/ID,Resources/Title, DeliveryLeads/ID',
        expand: 'SentBy, Resources, DeliveryLeads',
        filter:"IsActive eq 1 and Status ne 'Accepted' and Status ne 'Rejected' and DeliveryLeads/ID eq '" + this.global.currentUser.userId + "'"+
                " and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
        top: '4900',
        orderby: 'SentDate desc'
      },
      getPFAdmin:{
        select: 'ID, Title, FileID, FileURL, Status, IsActive, SentDate,SentBy/ID, SentBy/Title, Modified, Resources/ID,Resources/Title, DeliveryLeads/ID',
        expand: 'SentBy, Resources, DeliveryLeads',
        filter:"SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
        top: '4900',
        orderby: 'SentDate desc'
      }
    }
  };

  public Email = {
    from: this.global.currentUser.email,
    template: '',
    data: [],
    to: [],
    subject: '',
    errorLogDesc: '',
    cc: []
  };

  public EmailTemplates = {
    CD: {
      ValidationPending: 'ValidationPendingQualityComplaint',
      NotifyAllOtherResources: 'NotifyAllQualityComplaint',
      RejectQualityComplaint: 'RejectQualityComplaint',
      CreateQualityComplaint: 'CreateQualityComplaint'
    },
    PF: {
      CreatePositiveFeedback: 'CreatePositiveFeedback',
      NotifyAllOtherResources: 'NotifyAllPositiveFeedback',
    }
  };
}
