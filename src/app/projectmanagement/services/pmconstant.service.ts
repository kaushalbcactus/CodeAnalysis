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
    DELIVERY_LEVEL_2: 'Delivery L2'
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
    select: 'ID,UserName/ID,UserName/Title,Role',
    expand: 'UserName/ID,UserName/Title',
    filter: 'UserName/ID eq {0}',
    top: 4200
  };
  public projectContactQueryOptions = {
    select: 'ID,Title,FullName,FName,LName,EmailAddress,Designation,Phone,Address,FullName,Department,'
      + 'Status,ReferralSource,RelationshipStrength,EngagementPlan,Comments,ProjectContactsType,ProjectContactsType,ClientLegalEntity',
    top: 4200
  };
  public projectInformationQueryOptions = {
    select: 'ID,Title,ProjectCode,DeliverableType,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,BillingEntity,'
      // tslint:disable-next-line:max-line-length
      + 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
    // tslint:disable-next-line:max-line-length
    expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
    filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\')',
    top: 4200
  };
  public previousTaskOptions = {
    select: 'ID,Title,Status, AssignedTo/ID,AssignedTo/Title',
    expand: 'AssignedTo/ID,AssignedTo/Title',
    filter: 'Title eq \'{0}\' or Title eq \'{1}\''
  };
  public crTaskOptions = {
    select: 'ID,Title,Status, AssignedTo/ID,AssignedTo/Title,DueDate',
    expand: 'AssignedTo/ID,AssignedTo/Title',
    filter: 'Title eq \'{0}\' or Title eq \'{1}\''
  };

  public pInfoPendingAllocationIndiviualViewOptions = {
    select: 'PubSupportStatus,PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,'
      + 'AllDeliveryResources/Title,AllOperationresources/Id,AllOperationresources/Title,ClientLegalEntity,Title,'
      + 'ID,DeliverableType,TA,Molecule,ProjectCode,Status,Milestone,WBJID,StatusReportDesc,NextSCDate,PrimaryPOC,Description',
    expand: 'PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,AllDeliveryResources/Title,'
      + 'AllOperationresources/Id,AllOperationresources/Title,PrimaryResMembers/Id,PrimaryResMembers/Title',
    filter: '((AllOperationresources/Id eq ' + this.global.sharePointPageObject.userId + ') and (Status eq \'Unallocated\'))',
    orderby: 'ProjectCode asc',
    top: '4500'
  };
  public pInfoInactiveProjectIndiviualViewOptions = {
    select: 'PubSupportStatus,PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,'
      + 'AllDeliveryResources/Title,AllOperationresources/Id,AllOperationresources/Title,ClientLegalEntity,Title,'
      + 'ID,DeliverableType,TA,Molecule,ProjectCode,Status,Milestone,WBJID,StatusReportDesc,NextSCDate,PrimaryPOC,Description',
    expand: 'PrimaryResMembers/Id,PrimaryResMembers/Title,AllDeliveryResources/Id,AllDeliveryResources/Title,'
      + 'AllOperationresources/Id,AllOperationresources/Title,PrimaryResMembers/Id,PrimaryResMembers/Title',
    filter: '((AllOperationresources/Id eq ' + this.global.sharePointPageObject.userId + ') and '
      + ' (Status eq \'On Hold\' or Status eq \'In Discussion\'))',
    orderby: 'ProjectCode asc',
    top: '4500'
  };
  public PM_QUERY = {
    ALL_PROJECT_INFORMATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,'
        + 'Authors,POC,SubDivision, Priority, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,'
        // tslint:disable-next-line:max-line-length
        + 'Description, ConferenceJournal, Comments, PO, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      filter: '(Status ne \'Closed\') and Status ne (\'Cancelled\')',
      orderby: 'Modified desc',
      top: 4500
    },
    USER_SPECIFIC_PROJECT_INFORMATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Title,ProjectCode,DeliverableType,PrimaryPOC,ClientLegalEntity,ProjectFolder,SOWCode,WBJID,ProjectType,Status,Author/Id,Author/Title,Created,'
        + 'Authors,POC,SubDivision, Priority, TA, ProposedStartDate, ProposedEndDate, ActualStartDate, ActualEndDate,'
        // tslint:disable-next-line:max-line-length
        + 'Description, ConferenceJournal, Comments, PO, Milestones, Milestone, Molecule, Indication, IsPubSupport, SOWBoxLink, StandardBudgetHrs,'
        + 'CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title, DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID,'
        + 'DeliveryLevel2/Title, BusinessVertical, BillingEntity, SOWLink, PubSupportStatus, IsStandard, StandardService,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      expand: 'Author/Id,Author/Title, CMLevel1/ID, CMLevel1/Title, CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,'
        + 'PrimaryResMembers/Id,PrimaryResMembers/Title',
      // tslint:disable-next-line:max-line-length
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\') and (AllOperationresources/Id eq ' + this.global.sharePointPageObject.userId + ')',
      orderby: 'Modified desc',
      top: 4500
    }
  };
  public SOW_QUERY = {
    ALL_SOW: {
      select: 'ID,Title,SOWCode,PrimaryPOC,ClientLegalEntity,Author/Id,Author/Title,Created,TotalBudget,NetBudget,OOPBudget,TaxBudget, '
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked, TotalScheduled, ScheduledRevenue, TotalInvoiced, InvoicedRevenue,'
        + 'BillingEntity',
      expand: 'Author/Id,Author/Title',
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\')',
      orderby: 'Modified desc',
      top: 4500
    },
    USER_SPECIFIC_SOW: {
      select: 'ID,Title,SOWCode,PrimaryPOC,ClientLegalEntity,Author/Id,Author/Title,Created,TotalBudget,NetBudget,OOPBudget,TaxBudget'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked, TotalScheduled, ScheduledRevenue, TotalInvoiced, InvoicedRevenue,'
        + 'BillingEntity',
      expand: 'Author/Id,Author/Title',
      // tslint:disable-next-line:max-line-length
      filter: '(Status ne \'Closed\') and (Status ne \'Cancelled\') and (AllResources/Id eq ' + this.global.sharePointPageObject.userId + ')',
      orderby: 'Modified desc',
      top: 4500
    },
    CONTENT_QUERY: {
      select: 'Content',
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
    PREDECESSOR: {
      select: '',
      filter: 'SOWCode eq eq \'{{predecessor}}\'',
    },
    SOW_BY_ID: {
      select: 'ID,Title,SOWCode,ClientLegalEntity,SOWTitle, TotalBudget, NetBudget, OOPBudget, TaxBudget , Currency, Status,'
        + 'PrimaryPOC,BusinessVertical,Comments,BD/ID, BD/Title,CMLevel1/ID, CMLevel1/Title,CMLevel2/ID, CMLevel2/Title,'
        + 'DeliveryLevel1/ID, DeliveryLevel1/Title, DeliveryLevel2/ID, DeliveryLevel2/Title,Year, AdditionalPOC, BillingEntity,'
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
      top: 4900
    },
    PRACTICE_AREA: {
      select: 'Title',
      orderby: 'Title',
      top: 4900
    },
    CLIENT_LEGAL_ENTITY: {
      select: 'ID,Title,Acronym,Currency,InvoiceName,ListName,APAddress,TimeZone, SOWCounter, IsCentrallyAllocated, BillingEntity',
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
      top: 4900
    },
    MILESTONE_TYPE: {
      select: 'Title,Mandatory',
      orderby: 'Title',
      top: 4900
    },
    MOLECULES: {
      select: 'Title',
      orderby: 'Title',
      top: 4900
    },
    PROJECT_CONTANTCS: {
      select: 'ID,Title,ClientLegalEntity,Address,Designation,EmailAddress,FName,ID,LName,Phone, FullName',
      orderby: 'Title',
      top: 4900
    },
    PROJECT_TYPE: {
      select: 'Title',
      orderby: 'Title',
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
      select: 'ID,Title,BillingEntity,Acronym,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,PMLevel1/ID,PMLevel1/Title,PMLevel2/ID,PMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      // tslint:disable-next-line:max-line-length
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,PMLevel1/ID,PMLevel1/Title,PMLevel2/ID,PMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      top: 4900
    },
    DELIVERY_TYPE: {
      select: 'ID,Title,Acronym,Active',
      filter: 'Active eq \'Yes\'',
      orderby: 'Title',
      top: 4900
    },
    STANDARD_RESOURCES_CATEGORIZATION: {
      // tslint:disable-next-line:max-line-length
      select: 'ID,MaxHrs,PrimarySkill,UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title,Role,Categories',
      // tslint:disable-next-line:max-line-length
      expand: 'UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
      filter: 'IsActive eq \'Yes\' and SkillLevel/Title ne null',
      top: 4900,
      orderby: 'UserName/Title asc'
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
      select: 'ID,MaxHrs,PrimarySkill,UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
      // tslint:disable-next-line:max-line-length
      expand: 'UserName/ID,UserName/EMail,UserName/Title,TimeZone/Title,SkillLevel/Title,Tasks/Title,Tasks/Status,Deliverables/Title,DeliverableExclusion/Title,TA/Title,TAExclusion/Title,Account/Title',
      filter: 'IsActive eq \'Yes\' and SkillLevel/Title ne null',
      orderby: 'UserName/Title asc',
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
    FOLLOW_UP: 'Follow up'
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
    ADD_PROJECT_TO_BUDGET: 'Please enter project budget.',
    PO_NOT_SELECTED: 'Please select PO.',
    PO_ALREADY_EXIST: 'PO already assiged to the project. Please select some other PO.',
    INVOICE_AMOUNT_GREATER: 'Invoice amount is greater than the pending amount to be scheduled.',
    AUDIT_COMPLETE_ERROR: 'Please select checkbox or enter comment for each checklist parmater.',
    SELECT_SOW: 'Please select SOW code.',
    BLANK_HOURLY_BUDGET: 'Please enter rate.',
    NEGATIVE_HOURLY_BUDGET: 'Rate cant be negative.'
  };
  public FINANCE_QUERY = {
    GET_OOP: {
      select: 'ID,Title,Amount, ClientAmount,Category,Currency,DollarAmount,FileURL,FiscalYear,Number,PayingEntity,PayingEntity',
      filter: 'Title eq \'{{projectCode}}\' and Status eq \'{{status}}\'',
    },
    GET_PO: {
      select: 'ID,Title, ClientLegalEntity, Currency, Number, Name, Amount, AmountOOP, AmountRevenue, AmountTax,'
        + 'TotalLinked, RevenueLinked, OOPLinked, TaxLinked,TotalScheduled,ScheduledRevenue',
      filter: 'ClientLegalEntity eq \'{{clientLegalEntity}}\''
    },
    PROJECT_FINANCE_BY_PROJECTCODE: {
      select: 'ID, Title, Currency, Budget, RevenueBudget, OOPBudget, TaxBudget,BudgetHrs,' +
        'InvoicesScheduled, ScheduledRevenue, ScheduledOOP, Invoiced, InvoicedRevenue, InvoicedOOP',
      filter: 'Title eq \'{{projectCode}}\''
    },
    PROJECT_FINANCE_BREAKUP_BY_PROJECTCODE: {
      select: 'ID,Title,POLookup,ProjectNumber,Amount, AmountRevenue, AmountOOP, AmountTax, TotalScheduled, ScheduledRevenue',
      filter: 'ProjectNumber eq \'{{projectCode}}\''
    },
    INVOICE_LINE_ITEMS_BY_PROJECTCODE: {
      select: 'ID, Title, ScheduledDate,Amount, Currency, PO, MainPOC, AddressType, SOWCode, ScheduleType, Status, ProformaLookup,'
        + ' InvoiceLookup',
      filter: 'Title eq \'{{projectCode}}\''
    }
  };
  public QUERY = {
    GET_TIMESPENT: {
      select: 'ID, Title, Task,TimeSpent',
      filter: 'ProjectCode eq \'{{projectCode}}\''
    },
    PROJECT_BUDGET_BREAKUP_BY_PROJECTCODE: {
      select: 'ID',
      filter: 'ProjectCode eq \'{{projectCode}}\''
    },
    ACTIVE_PROJECT_BY_SOWCODE: {
      select: 'ID, Title, ProjectType,ProjectCode,Title,DeliverableType,WBJID,Status,IsApproved,SOWCode,ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and (Status eq \'In Progress\' or Status eq \'Ready for Client\''
        + ' or Status eq \'Author Review\' or Status eq \'Sent To AM For Approval\''
        + ' or Status eq \'Audit In Progress\' or Status eq \'Pending Closure\')',
      top: 4900
    },
    PIPELINE_PROJECT_BY_SOWCODE: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and (Status eq \'In Discussion\' or Status eq \'Unallocated\')',
      top: 4900
    },
    INACTIVE_PROJECTS_BY_SOWCODE1: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and ((Status eq \'Closed\' and ActualEndDate gt datetime\'{{actualEndDate}}\')'
        + ' or (Status eq \'On Hold\') or (Status eq \'Awaiting Cancel Approval\') or (Status eq \'Cancelled\''
        + ' and (RejectionDate gt datetime\'{{rejectionDate}}\' or ProposedStartDate gt datetime\'{{proposedStartDate}}\')))',
      top: 4900
    },
    INACTIVE_PROJECTS_BY_SOWCODE: {
      select: 'ID, Title, ProjectType, ProjectCode, Title, DeliverableType, WBJID, Status, IsApproved, SOWCode, ProposedStartDate',
      filter: 'SOWCode eq \'{{sowCode}}\' and ((Status eq \'Closed\' and ActualEndDate gt datetime\'{{actualStartDate}}\''
        + ' and ActualEndDate lt datetime\'{{actualEndDate}}\') or (Status eq \'On Hold\')'
        + ' or (Status eq \'Awaiting Cancel Approval\') or (Status eq \'Cancelled\''
        + ' and ((RejectionDate gt datetime\'{{rejectionStartDate}}\' and RejectionDate lt datetime\'{{rejectionEndDate}}\')'
        + ' or (ProposedStartDate gt datetime\'{{proposedStartDate}}\' and ProposedStartDate lt datetime\'{{proposedEndDate}}\')))) ',
      top: 4900
    },
    INVOICES_BY_INVOICELOOKUP: {
      select: 'ID, Title, FileURL, InvoiceNumber',
      filter: 'ID eq \'{{invoiceLookup}}\''
    },
    PROFORMA_BY_PROFORMALOOKUP: {
      select: 'ID, Title, FileURL',
      filter: 'ID eq \'{{proformaLookup}}\''
    }
  };
  public PROJECT_TYPE = {
    HOURLY: 'Hourly',
    DELIVERABLE: 'Deliverable'
  };
}
