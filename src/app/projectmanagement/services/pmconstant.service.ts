import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PmconstantService {
  constructor(private global: GlobalService) { }
  // CS Dashboard Constants
  public resourCatConstant = {
    CMLevel1: 'CM L1',
    CMLevel2: 'CM L2',
    DELIVERY_LEVEL_1: 'Delivery L1',
    DELIVERY_LEVEL_2: 'Delivery L2',
    BUSINESS_DEVELOPMENT: 'Business Development',
    FINANCE: 'Finance'
  };
  public RESOURCES_CATEGORY = {
    BUSINESS_DEVELOPMENT: 'Business Development',
    WRITER: 'Writer',
    REVIEWER: 'Reviewer',
    QUALITY_CHECK: 'Quality Check',
    EDITOR: 'Editor',
    GRAPHICS: 'Graphics',
    PUBLICATION_SUPPORT: 'Publication Support'
  };
  public ColorIndicator = {
    GREEN: 'Green',
    RED: 'Red',
    BLUE: 'Blue'
  };
  public resourceQueryOptions = {
    select: 'ID,UserNamePG/ID,UserNamePG/Title,RoleCH',
    expand: 'UserNamePG/ID,UserNamePG/Title',
    filter: 'UserNamePG/ID eq {0}',
    top: 4200
  };
  public projectContactQueryOptions = {
    select: 'ID,Title,FullNameCC,FName,LName,EmailAddress,Designation,Phone,AddressMT,FullNameCC,DepartmentST,'
      + 'Status,ReferralSource,RelationshipStrength,EngagementPlan,CommentsMT,ProjectContactsType,ProjectContactsType,ClientLegalEntity',
    top: 4200
  };
  public projectInformationQueryOptions = {
    select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,BillingEntity,'
      // tslint:disable-next-line:max-line-length
      + 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
    // tslint:disable-next-line:max-line-length
    expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
    filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\')',
    top: 4200
  };
  public ProjectInformation_Get_ProjectFolder_Options = {
    select: 'ID,Title,ProjectCode,ProjectFolder',
    filter: 'ProjectCode eq \'{{projectCode}}\'',
    top: 1
  };
  public previousTaskOptions = {
    select: 'ID,Title,Status, AssignedTo/ID,AssignedTo/Title, IsCentrallyAllocated',
    expand: 'AssignedTo/ID,AssignedTo/Title',
    filter: 'Title eq \'{0}\' or Title eq \'{1}\''
  };
  public subtaskOptions = {
    select: 'ID,Title,Status, AssignedTo/ID,AssignedTo/Title',
    expand: 'AssignedTo/ID,AssignedTo/Title',
    filter: 'ParentSlot eq \'{0}\' and Status ne \'Deleted\' and NextTasks eq null',
     orderby: 'DueDateDT desc',
    top: 4200

  };

  public crTaskOptions = {
    select: 'ID,Title,Status, AssignedTo/ID,AssignedTo/Title,DueDateDT',
    expand: 'AssignedTo/ID,AssignedTo/Title',
    filter: 'Title eq \'{0}\''
  };

  public milestoneOptions = {
    select: 'ID,Title,ProjectCode,Milestone,SubMilestones',
    filter: "ProjectCode eq '{{projectCode}}' and Title eq '{{milestone}}'",
    top: 4200
  };

  public milestoneTaskOptions = {
    select: 'ID,Title,Task,Status,ProjectCode,Milestone,SubMilestones, ContentTypeCH',
    filter: "ProjectCode eq '{{projectCode}}' and (Milestone eq '{{milestone}}' or Title eq '{{milestone}}')",
    top: 4500
  };

  public projectOptions = {
    select: 'ID,Title,Task,Status,NextTasks,ExpectedTime,PrevTasks,Milestone,SubMilestones,DisableCascade, ParentSlot,FileSystemObjectType,ContentTypeCH',
    filter: "ProjectCode eq '{{projectCode}}'",
    top: 4500
  };


  public pInfoPendingAllocationIndiviualViewOptions = {
    select: 'PubSupportStatus,PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,'
      + 'AllDeliveryResources/Title,AllOperationresources/Id,AllOperationresources/Title,ClientLegalEntity,Title,'
      + 'ID,DeliverableType,SubDeliverable,TA,Molecule,ProjectCode,Status,Milestone,WBJID,StatusReportDesc,PrimaryPOC,DescriptionMT',
    expand: 'PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,AllDeliveryResources/Title,'
      + 'AllOperationresources/Id,AllOperationresources/Title,PrimaryResMembers/Id,PrimaryResMembers/Title',
    filter: '((AllOperationresources/Id eq {{UserID}}) and (Status eq \'Unallocated\'))',
    orderby: 'ProjectCode asc',
    top: '4500'
  };
  public pInfoInactiveProjectIndiviualViewOptions = {
    select: 'PubSupportStatus,PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,'
      + 'AllDeliveryResources/Title,AllOperationresources/Id,AllOperationresources/Title,ClientLegalEntity,Title,'
      + 'ID,DeliverableType,SubDeliverable,TA,Molecule,ProjectCode,Status,Milestone,WBJID,StatusReportDesc,PrimaryPOC,DescriptionMT',
    expand: 'PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,AllDeliveryResources/Title,'
      + 'AllOperationresources/Id,AllOperationresources/Title,PrimaryResMembers/Id,PrimaryResMembers/Title',
    filter: '((AllOperationresources/Id eq {{UserID}}) and '
      + ' (Status eq \'On Hold\' or Status eq \'In Discussion\'))',
    orderby: 'ProjectCode asc',
    top: '4500'
  };
  public PM_QUERY = {
    ALL_PROJECT_INFORMATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,Modified,'
        + 'Authors,POC,SubDivision, PriorityST, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,LastSubmissionDate,JournalSelectionURL,JournalSelectionDate,'
        // tslint:disable-next-line:max-line-length
        + 'DescriptionMT, ConferenceJournal, CommentsMT, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,SlideCount,PageCount,ReferenceCount,AnnotationBinder,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      filter: '(Status ne \'Closed\') and Status ne (\'Cancelled\')',
      orderby: 'Modified desc',
      top: 4500
    },
    USER_SPECIFIC_PROJECT_INFORMATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,Modified,'
        + 'Authors,POC,SubDivision, PriorityST, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,LastSubmissionDate,JournalSelectionURL,JournalSelectionDate,'
        // tslint:disable-next-line:max-line-length
        + 'DescriptionMT, ConferenceJournal, CommentsMT, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,SlideCount,PageCount,ReferenceCount,AnnotationBinder,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      // tslint:disable-next-line:max-line-length
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\') and (AllOperationresources/Id eq {{UserID}})',
      orderby: 'Modified desc',
      top: 4500
    },
    USER_SPECIFIC_PROJECT_INFORMATION_MY: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,'
        + 'Authors,POC,SubDivision, PriorityST, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,LastSubmissionDate,JournalSelectionURL,JournalSelectionDate,'
        // tslint:disable-next-line:max-line-length
        + 'DescriptionMT, ConferenceJournal, CommentsMT, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,SlideCount,PageCount,ReferenceCount,AnnotationBinder,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      // tslint:disable-next-line:max-line-length
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\') and (AllOperationresources/Id eq {{UserID}} or AllDeliveryResources/Id eq {{UserID}})',
      orderby: 'Modified desc',
      top: 4500
    },
    PROJECT_INFORMATION_BY_PROJECTCODE: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,'
        + 'Authors,POC,SubDivision, PriorityST, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,LastSubmissionDate,JournalSelectionURL,JournalSelectionDate,'
        // tslint:disable-next-line:max-line-length
        + 'DescriptionMT, ConferenceJournal, CommentsMT, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,SlideCount,PageCount,ReferenceCount,AnnotationBinder,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      filter: 'ProjectCode eq \'{{projectCode}}\' and (Status eq \'Closed\' or Status eq \'Cancelled\') and (AllOperationresources/Id eq {{UserID}})',
      orderby: 'Modified desc',
      top: 4500
    },
    PROJECT_INFORMATION_BY_PROJECTCODE_ALL: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,SubDeliverable,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,Modified,'
        + 'Authors,POC,SubDivision, PriorityST, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,LastSubmissionDate,JournalSelectionURL,JournalSelectionDate,'
        // tslint:disable-next-line:max-line-length
        + 'DescriptionMT, ConferenceJournal, CommentsMT, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,SlideCount,PageCount,ReferenceCount,AnnotationBinder,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title,Editor/Title',
      filter: 'ProjectCode eq \'{{projectCode}}\' and (Status eq \'Closed\' or Status eq \'Cancelled\')',
      orderby: 'Modified desc',
      top: 4500
    },
    PROJECT_INFORMATION_BY_PROJECTCODE_MILESTONE: {
      select: 'ID, Milestone',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      top: 4500
    }
  };
  public SOW_QUERY = {
    ALL_SOW: {
      select: 'ID,Title,SOWCode,PrimaryPOC,ClientLegalEntity,Author/Id,Author/Title,Created,TotalBudget,NetBudget,OOPBudget,TaxBudget,CommentsMT,Status,ExpiryDate,BusinessVertical,BD,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked, TotalScheduled, ScheduledRevenue, TotalInvoiced, InvoicedRevenue,'
        + 'BillingEntity, AdditionalPOC, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title, Currency, BD/ID, BD/Title,Editor/Title,Modified',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title,Editor/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title, BD/ID, BD/Title',
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\')',
      orderby: 'Modified desc',
      top: 4500
    },
    SOW_CODE: {
      select: 'ID,Title,SOWCode,PrimaryPOC,ClientLegalEntity,Author/Id,Author/Title,Created,TotalBudget,NetBudget,OOPBudget,TaxBudget, '
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked, TotalScheduled, ScheduledRevenue, TotalInvoiced, InvoicedRevenue,'
        + 'BillingEntity',
      expand: 'Author/Id,Author/Title',
      filter: 'SOWCode eq \'{{sowcode}}\'',
      orderby: 'Modified desc',
      top: 1
    },
    USER_SPECIFIC_SOW: {
      select: 'ID,Title,SOWCode,PrimaryPOC,ClientLegalEntity,Author/Id,Author/Title,Created,TotalBudget,NetBudget,OOPBudget,TaxBudget,CommentsMT,Status,ExpiryDate,BusinessVertical,BD,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked, TotalScheduled, ScheduledRevenue, TotalInvoiced, InvoicedRevenue,'
        + 'BillingEntity, AdditionalPOC, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title, Currency, BD/ID, BD/Title,Editor/Title,Modified',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title,Editor/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title, BD/ID, BD/Title',
      // tslint:disable-next-line:max-line-length
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\') and (AllResources/Id eq {{UserID}})',
      orderby: 'Modified desc',
      top: 4500
    },
    CONTENT_QUERY: {
      select: 'ContentMT',
      filter: 'Title eq \'{{templateName}}\''
    },

    SOW_BUDGET_BREAKUP: {
      select: 'ID',
      filter: 'SOWCode eq \'{{SOWCodeStr}}\''
    },
    COPY_AND_UPDATE_BUDGET_BREAKUP: {
      // tslint:disable-next-line:max-line-length
      select: 'SOWCode,Currency,TotalBudget,NetBudget,OOPBudget,TaxBudget,AddendumTotalBudget,AddendumNetBudget,AddendumOOPBudget,AddendumTaxBudget',
      filter: 'SOWCode eq \'{{SOWCodeStr}}\'',
      orderby: 'ID desc'
    },
    SOW_BUDGET_BREAKUP_ALL: {
      // tslint:disable-next-line:max-line-length
      select: 'SOWCode,Status,Currency,TotalBudget,NetBudget,OOPBudget,TaxBudget,AddendumTotalBudget,AddendumNetBudget,AddendumOOPBudget,AddendumTaxBudget,InternalReviewStartDate',
      filter: 'SOWCode eq \'{{SOWCodeStr}}\'',
      orderby: 'InternalReviewStartDate desc'
    },
    PREDECESSOR: {
      select: '',
      filter: 'SOWCode eq eq \'{{predecessor}}\'',
    },
    SOW_BY_ID: {
      select: 'ID,Title,SOWCode,ClientLegalEntity, TotalBudget, NetBudget, OOPBudget, TaxBudget , Currency, Status,'
        + 'TotalLinked,RevenueLinked,OOPLinked,TaxLinked,SOWLink,'
        + 'PrimaryPOC,BusinessVertical,CommentsMT,BD/ID, BD/Title,CMLevel1/ID, CMLevel1/Title,CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title, AdditionalPOC, BillingEntity,'
        + 'CreatedDate, ExpiryDate',
      expand: 'BD/ID, BD/Title,CMLevel1/ID, CMLevel1/Title,CMLevel2/ID, CMLevel2/Title,DeliveryLevel1/ID,'
        + 'DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title ',
      filter: 'ID eq \'{{Id}}\'',
    }
  };
  public DROP_DOWN_QUERY = {
    BILLING_ENTITY: {
      select: 'Title, InvoiceTemplate, Acronym',
      orderby: 'Title',
      filter: "IsActiveCH eq 'Yes'",
      top: 4900
    },
    PRACTICE_AREA: {
      select: 'Title',
      orderby: 'Title',
      filter: "IsActiveCH eq 'Yes'",
      top: 4900
    },
    CLIENT_LEGAL_ENTITY: {
      select: 'ID,Title,Acronym,Currency,InvoiceName,ListName,APAddress,TimeZoneNM, SOWCounter, BillingEntity, ListName, '
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title',
      expand: 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID, DeliveryLevel2/Title',
      filter: "IsActiveCH eq 'Yes'",
      orderby: 'Title',
      top: 4900
    },
    BUDGET_RATE_MASTER: {
      select: 'Title',
      orderby: 'Title',
      top: 4900
    },
    DELIVERY_TYPE: {
      select: 'Title,Acronym',
      orderby: 'Title',
      top: 4900,
      filter: "IsActiveCH eq 'Yes'",
    },
    MILESTONE_TYPE: {
      select: 'Title,Mandatory',
      orderby: 'Title',
      top: 4900
    },
    MOLECULES: {
      select: 'Title',
      orderby: 'Title',
      filter: "IsActiveCH eq 'Yes'",
      top: 4900
    },
    PROJECT_CONTANTCS: {
      select: 'ID,Title,ClientLegalEntity,AddressMT,Designation,EmailAddress,FName,ID,LName,Phone, FullNameCC',
      orderby: 'Title',
      filter: "Status eq 'Active'",
      top: 4900
    },
    PROJECT_TYPE: {
      select: 'Title',
      orderby: 'Title',
      filter: "IsActive eq 'Yes'",
      top: 4900
    },
    SUBDELIVERABLES: {
      select: 'Title',
      orderby: 'Title',
      top: 4900
    },
    TA: {
      select: 'Title',
      orderby: 'Title',
      filter: "IsActiveCH eq 'Yes'",
      top: 4900
    }
  };
  public filterAction = {
    ALL_SOW: 'SOW',
    ALL_PROJECTS: 'Projects',
    CLIENT_REVIEW: 'Client Review',
    PENDING_ALLOCATION: 'Pending Allocation',
    INACTIVE_PROJECTS: 'Inactive Projects',
    SEND_TO_CLIENT: 'Send To Client',
    SELECT_SOW: 'Select SOW',
    ACTIVE_PROJECT: 'Active Project',
    PIPELINE_PROJECT: 'Pipeline Project',
    INACTIVE_PROJECT: 'InActive Project'
  };
  // ***********************************************************************//
  // Time line Section
  // ***********************************************************************//
  public TIMELINE_QUERY = {
    PROJECT_PER_YEAR: {
      select: 'ID,Title,Count',
      filter: 'Title eq \'{{Id}}\'',
      top: 4900
    },
    CLIENT_LEGAL_ENTITY: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,BillingEntity,Acronym,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      // tslint:disable-next-line:max-line-length
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Titl,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      filter: "IsActiveCH eq 'Yes'",
      top: 4900
    },
    DELIVERY_TYPE: {
      select: 'ID,Title,Acronym,IsActiveCH',
      filter: 'IsActiveCH eq \'Yes\'',
      orderby: 'Title',
      top: 4900
    },
    STANDARD_RESOURCES_CATEGORIZATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,MaxHrs,PrimarySkill,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title,RoleCH',
      // tslint:disable-next-line:max-line-length
      expand: 'UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
      filter: 'IsActiveCH eq \'Yes\' and SkillLevel/Title ne null',
      top: 4900,
      orderby: 'UserNamePG/Title asc'
    },
    NON_STANDARD_SUB_TYPE: {
      select: 'ID,Title',
      orderby: 'Title',
      top: 4900
    },
    NON_STANDARD_SERVICE: {
      select: 'ID,Title',
      orderby: 'Title',
      top: 4900
    },
    NON_STANDARD_RESOURCE_CATEGORIZATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,MaxHrs,PrimarySkill,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title,IsFTE',
      // tslint:disable-next-line:max-line-length
      expand: 'UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
      filter: 'IsActiveCH eq \'Yes\' and SkillLevel/Title ne null',
      orderby: 'UserNamePG/Title asc',
      top: 4900
    }
  };
  public task = {
    PER_DAY_MAX_HOURS: 19,
    PER_DAY_MAX_END_HOURS: 19,
    USE_TASK_DAYS: 'Yes',
    NOT_USE_TASK_DAYS: 'No',
    SEND_TO_CLIENT: 'Send to client',
    USER_AVAILABLE: 'Available',
    CLIENT_REVIEW: 'Client Review',
    FOLLOW_UP: 'Follow up',
    BLOCKING: 'Blocking',
    MEETING: 'Meeting',
    TRAINING: 'Training'
  };

  public endDate = {
    MILESTONE_END_DATE_CHANGED: 'MilestoneEndDateChanged',
    CLIENT_REVIEW_END_DATE_CHANGED: 'ClientReviewEndDateChanged',
    SUB_MILESTONE_END_DATE_CHANGED: 'SubMilestoneEndDateChanged',
    TASK_END_DATE_CHANGED: 'TaskEndDateChanged'
  };
  public startDate = {
    MILESTONE_START_DATE_CHANGED: 'MilestoneStartDateChanged',
    CLIENT_REVIEW_START_DATE_CHANGED: 'ClientReviewStartDateChanged',
    SUB_MILESTONE_START_DATE_CHANGED: 'SubMilestoneStartDateChanged',
    TASK_START_DATE_CHANGED: 'TaskStartDateChanged'
  };
  public USERTYPE = {
    TYPE: 'Type',
    RECOMENDED: 'Recomended',
    OTHER: 'Other'
  };
  // ***********************************************************************//
  // Finance Management
  // ***********************************************************************//
  public ERROR = {
    ADD_PROJECT_TO_BUDGET: 'Please enter revenue budget greater than 0.',
    ADD_PROJECT_TO_BUDGETHrs: 'Please enter budget hrs.',
    PO_NOT_SELECTED: 'Please select PO.',
    PO_ALREADY_EXIST: 'PO already assiged to the project. Please select some other PO.',
    INVOICE_AMOUNT_GREATER: 'Invoice amount is greater than the pending amount to be scheduled.',
    INVOICE_AMOUNT_ZERO: 'Invoice amount should be greater than 0.',
    AUDIT_COMPLETE_ERROR: 'Please select checkbox or enter comment for each checklist parmater.',
    SELECT_SOW: 'Please select SOW code.',
    BLANK_HOURLY_BUDGET: 'Please enter rate.',
    NEGATIVE_HOURLY_BUDGET: 'Rate cant be negative.'
  };
  public FINANCE_QUERY = {
    GET_OOP: {
      select: 'ID,Title,Amount,ClientAmount,CategoryST,Currency,DollarAmount,FileURL,Number,' +
        'PayingEntity,ClientCurrency,VendorFreelancer,RequestType,Status,SpendType,Editor/Title',
      filter: 'Title eq \'{{projectCode}}\' and Status eq \'{{status}}\'',
      filterByProjectCode: 'Title eq \'{{projectCode}}\'',
      expand: 'Editor/Title',
      top: 4900
    },

    GET_PO: {
      select: 'ID,Title, ClientLegalEntity, Currency, Number, NameST, Amount, AmountOOP, AmountRevenue, AmountTax,POCategory,POExpiryDate,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked,TotalScheduled,ScheduledRevenue',
      filter: 'ClientLegalEntity eq \'{{clientLegalEntity}}\'',
      orderby: 'Created desc',
      top: 4900
    },
    GET_ClosePO: {
      select: 'ID,Title, ClientLegalEntity, Currency, Number, NameST, Amount, AmountOOP, AmountRevenue, AmountTax,POCategory,POExpiryDate,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked,TotalScheduled,ScheduledRevenue',
      filter: 'Id eq \'{{Id}}\'',
      orderby: 'Created desc',
      top: 4900
    },

    GET_RESOUCEBYID: {
      select: 'ID,MaxHrs,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title,IsFTE',
      expand: 'UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/Title',
      filter: 'UserNamePG/ID eq  \'{{Id}}\'',
      orderby: 'UserNamePG/Title asc',

    },

    GET_FinancePO: {
      select: 'ID,Title, ClientLegalEntity, Currency, Number, NameST, Amount, AmountOOP, AmountRevenue, AmountTax,POCategory,POExpiryDate,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked,TotalScheduled,ScheduledRevenue,ScheduledOOP',
      filter: 'Status eq \'Active\' and ClientLegalEntity eq \'{{clientLegalEntity}}\' and  Currency eq \'{{currency}}\'',
      orderby: 'Created desc',
      top: 4900
    },
    GET_SCHEDULES_BY_PROJECTCODE: {
      select: 'ID,Title,Task,Status,FileSystemObjectType,Milestone,StartDate,DueDateDT,Actual_x0020_End_x0020_Date,Actual_x0020_Start_x0020_Date',
      orderby: 'StartDate asc',
      filter: "ProjectCode eq '{{projectCode}}'",
      top: 4500
    },
    PROJECT_FINANCE_BY_PROJECTCODE: {
      select: 'ID, Title, Currency, ApprovedBudget, Budget, RevenueBudget, OOPBudget, TaxBudget,BudgetHrs,' +
        'InvoicesScheduled, ScheduledRevenue, ScheduledOOP, Invoiced, InvoicedRevenue, InvoicedOOP, Template',
      filter: 'Title eq \'{{projectCode}}\''
    },
    PROJECT_FINANCE_BREAKUP_BY_PROJECTCODE: {
      select: 'ID,Title,POLookup,ProjectNumber,Amount, AmountRevenue, AmountOOP, AmountTax, TotalScheduled, ScheduledRevenue,'
        + ' ScheduledOOP, TotalInvoiced, InvoicedRevenue, InvoicedOOP, Status',
      filter: 'ProjectNumber eq \'{{projectCode}}\' and Status eq \'Active\''
    },
    INVOICE_LINE_ITEMS_BY_PROJECTCODE: {
      select: 'ID, Title, ScheduledDate,Amount, Currency, PO, MainPOC, AddressType, SOWCode, ScheduleType, Status, ProformaLookup,InvoiceLookup',
      filter: 'Title eq \'{{projectCode}}\' and Status ne \'Deleted\'',
      orderby: 'ScheduledDate'
    },
    PROJECT_BUDGET_BREAKUP: {
      select: 'ID, Title, ProjectLookup, Status, ApprovalDate, OriginalBudget, NetBudget, OOPBudget, TaxBudget, ProjectCode,'
        + ' BudgetHours, Reason, CommentsMT',
      filter: 'ProjectCode eq \'{{projectCode}}\' and (Status eq \'Approval Pending\')',
      top: 1
    },
    ADV_INVOICES: {
      select: 'ID, ClientLegalEntity, Amount, AddressType, InvoiceNumber, PO, ProformaLookup, IsTaggedFully, TaggedAmount,AuxiliaryInvoiceName,'
        + ' InvoiceDate, MainPOC, FileURL',
      filter: 'ClientLegalEntity eq \'{{clientLegalEntity}}\' and InvoiceType eq \'revenue\' and IsTaggedFully eq \'No\'',
      top: 4500
    },
    GET_PROJECT_TYPE: {
      select: 'ID,Title,IsActive',
      filter: 'IsActive eq \'{{isActive}}\'',
      top: 4500,
      orderby: 'Title asc'
    },
    PROJECT_BUDGET_BREAKUP_FOR_ALL: {
      select: 'ID, Title, ProjectLookup, Status, ApprovalDate, OriginalBudget, NetBudget, OOPBudget, TaxBudget, ProjectCode,'
        + ' BudgetHours, Reason, CommentsMT',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      orderby: 'ApprovalDate desc',
      top: 4500
    },
    SPENDING_INFO: {
      select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
      filter: "Title eq '{{Title}}' and InvoiceID eq {{invoiceId}}",
      expand: "Editor,Author",
      top: 1,
    },
    SPENDING_INFOByActive: {
      select: "ID",
      filter: "Title eq '{{Title}}' and (Status ne \'Cancelled\' or Status ne \'Rejected\')",
      top: 1,
    },
    sowList: {
      select: "ID,SOWCode,Title,ClientLegalEntity,Currency,BillingEntity,TotalLinked,OOPLinked,InvoicedOOP,TotalInvoiced,TotalScheduled,ScheduledOOP",
      filter: "Status ne 'CLosed' or Status ne 'Cancelled' ",
      top: 4500
    }
  };
  public QUERY = {
    GET_TIMESPENT: {
      select: 'ID, Title, Task,TimeSpent, Status,SubMilestones,Milestone',
      filter: 'ProjectCode eq \'{{projectCode}}\''
    },
    PROJECT_BUDGET_BREAKUP_BY_PROJECTCODE: {
      select: 'ID',
      filter: 'ProjectCode eq \'{{projectCode}}\' and (Status eq \'Approved\' or Status eq \'Approval Pending\')'
    },
    ACTIVE_PROJECT_BY_SOWCODE: {
      select: 'ID, Title, ProjectType,ProjectCode,Title,DeliverableType,SubDeliverable,WBJID,Status,IsApproved,SOWCode,ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and (Status eq \'In Progress\' or Status eq \'Ready for Client\''
        + ' or Status eq \'Author Review\' or Status eq \'Sent To AM For Approval\''
        + ' or Status eq \'Audit In Progress\' or Status eq \'Pending Closure\')',
      top: 4900
    },
    PIPELINE_PROJECT_BY_SOWCODE: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType,SubDeliverable, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and (Status eq \'In Discussion\' or Status eq \'Unallocated\')',
      top: 4900
    },
    INACTIVE_PROJECTS_BY_SOWCODE1: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType,SubDeliverable, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and ((Status eq \'Closed\' and ActualEndDate gt datetime\'{{actualEndDate}}\')'
        + ' or (Status eq \'On Hold\') or (Status eq \'Awaiting Cancel Approval\') or (Status eq \'Cancelled\''
        + ' and (RejectionDate gt datetime\'{{rejectionDate}}\' or ProposedStartDate gt datetime\'{{proposedStartDate}}\')))',
      top: 4900
    },
    INACTIVE_PROJECTS_BY_SOWCODE: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType,SubDeliverable, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and ((Status eq \'Closed\' and ActualEndDate gt datetime\'{{actualStartDate}}\''
        + ' and ActualEndDate lt datetime\'{{actualEndDate}}\') or (Status eq \'On Hold\')'
        + ' or (Status eq \'Awaiting Cancel Approval\') or (Status eq \'Cancelled\''
        + ' and ((RejectionDate gt datetime\'{{rejectionStartDate}}\' and RejectionDate lt datetime\'{{rejectionEndDate}}\')'
        + ' or (ProposedStartDate gt datetime\'{{proposedStartDate}}\' and ProposedStartDate lt datetime\'{{proposedEndDate}}\')))) ',
      top: 4900
    },
    INVOICES_BY_INVOICELOOKUP: {
      select: 'ID, Title, FileURL, InvoiceNumber,AuxiliaryInvoiceName',
      filter: 'ID eq \'{{invoiceLookup}}\''
    },
    PROFORMA_BY_PROFORMALOOKUP: {
      select: 'ID, Title, FileURL',
      filter: 'ID eq \'{{proformaLookup}}\''
    },
    SCHEDULE_LIST_BY_PROJECTCODE: {
      select: 'ID, Title, Task,TimeSpent, Status,SubMilestones,Milestone',
      filter: 'ProjectCode eq \'{{projectCode}}\'',
      top: 4900
    },
    SOW_BY_SOWCODE: {
      select: 'ID,ClientLegalEntity,Currency,TotalBudget,NetBudget,OOPBudget,TaxBudget,Status,'
        + 'PrimaryPOC,TotalScheduled, ScheduledRevenue, TotalLinked, RevenueLinked',
      filter: 'SOWCode eq \'{{sowCode}}\'',
      top: 4900
    },
    PROJECT_BUDGET_BREAKUP_CANCELLED_BY_PROJECTCODE: {
      select: 'ID, Title, ProjectLookup, Status, ApprovalDate, OriginalBudget, NetBudget, OOPBudget, TaxBudget, ProjectCode,'
        + ' BudgetHours, Reason, CommentsMT',
      filter: 'ProjectCode eq \'{{projectCode}}\' and (Status eq \'Approved\' or Status eq \'Approval Pending\')'
    },
    PROJECT_FINANCE_BREAKUP_CANCELLED_BY_PROJECTCODE: {
      select: 'ID,Title,POLookup,ProjectNumber,Amount, AmountRevenue, AmountOOP, AmountTax, TotalScheduled, ScheduledRevenue',
      filter: 'ProjectNumber eq \'{{projectCode}}\' and Status eq \'Active\''
    },
    GET_SCHEDULE_LIST_ITEM_BY_PROJECT_CODE: {
      select: 'ID,Title,Milestone,Status,Task,ProjectCode,TimeSpent,DueDateDT,IsCentrallyAllocated',
      filter: 'ProjectCode eq \'{{projectCode}}\''
    },
    GET_EARLY_TASK_COMPLETED: {
      select: 'ID,Title,ProjectCode,IsActiveCH,ProjectCS/ID,ProjectCS/Title',
      expand: 'ProjectCS/ID,ProjectCS/Title',
      filter: 'IsActiveCH eq \'Yes\' and ProjectCSId eq {{UserID}} and Created ge \'{{LastOnceHour}}\''
    }
  };
  public PROJECT_TYPE = {
    HOURLY: { display: 'Hourly', value: 'Hours-Rolling' },
    DELIVERABLE: { display: 'Deliverable', value: 'Deliverable-Writing' },
    FTE: { display: 'FTE', value: 'FTE-Writing' }
  };
  public TIME_OUT = 500;
  public PROJECT_CANCELLED_REASON = {
    NOT_CONVINCED_OF_EXPERIANCE_OR_QUALITY: 'Not convinced of our experience/quality',
    LACK_OF_CAPABILITY: 'Lack of capability',
    PRICE_TO_HIGH: 'Price too high',
    CLIENT_BUDGET: 'Client Budget',
    CLIENT_DOING_INTERNALLY: 'Client doing internally',
    CHANGE_IN_DELIVERY_TYPE: 'Change in deliverable type',
    CACTUS_REJECT: 'CACTUS reject',
    DUPLICATE_ENTRY: 'Duplicate Entry',
    CLIENT_NOT_MOVING_FORWARD_WITH_PROJECT: 'Client not moving forward with project',
    UNKNOWN: 'Unkownn'
  };
  public PROJECT_BUDGET_INCREASE_REASON = {
    SCOPE_INCREASE: 'Scope increase',
    INPUT_ERROR: 'Input error'
  };
  public ACTION = {
    CONFIRM_PROJECT: 'Confirm Project',
    PROPOSE_CLOSURE: 'Propose Closure',
    AUDIT_PROJECT: 'Audit Project',
    CLOSE_PROJECT: 'Close Project',
    CANCEL_PROJECT: 'Cancel Project',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ON_HOLD: 'On Hold',
    OFF_HOLD: 'Off Hold',
    ADD: 'Add',
    REDUCE: 'Reduce',
    RESTRUCTURE: 'Restructure'
  };

  public CURRENCY = [
    { label: 'AUD', value: '$' },
    { label: 'BRL', value: 'R$' },
    { label: 'CNY', value: '¥ /元' },
    { label: 'DKK', value: 'kr' },
    { label: 'EUR', value: '€' },
    { label: 'GBP', value: '£' },
    { label: 'INR', value: '₹' },
    { label: 'JPY', value: '¥' },
    { label: 'KRW', value: '₩' },
    { label: 'NTD', value: 'NT$' },
    { label: 'SGD', value: '$' },
    { label: 'USD', value: '$' },
  ]
  public PROJECT_BUDGET_DECREASE_REASON = {
    SCOPE_REDUCE: 'Scope reduction',
    QUALITY: 'Client discount - quality complaints',
    RELATIONSHIP: 'Client discount - relationship',
    INPUT_ERROR: 'Input error',
  };
  public MONTH_NAMES = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}


