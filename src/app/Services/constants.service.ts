import { Injectable } from '@angular/core';

import { GlobalService } from './global.service';
// import { AdminViewComponent } from '../admin-view/admin-view.component';

@Injectable({
  providedIn: 'root'
})

export class ConstantsService {

  constructor(public global: GlobalService) { }
  public listNames = {
    ProjectRelatedInvoices: {
      name: 'ProjectRelatedInvoices',
      type: 'SP.Data.ProjectRelatedInvoicesListItem'
    },
    InvoiceDetails: {
      name: 'InvoiceDetails',
      type: 'SP.Data.InvoiceDetailsListItem'
    },
    SubDeliverables: {
      name: 'SubDeliverables',
      type: 'SP.Data.SubDeliverablesListItem'
    },
    InvoiceLineItems: {
      name: 'InvoiceLineItems',
      type: 'SP.Data.InvoiceLineItemsListItem'
    },
    ProjectInformation: {
      name: 'ProjectInformation',
      type: 'SP.Data.ProjectInformationListItem'
    },
    projectInfo: {
      name: 'ProjectInformation',
      type: 'SP.Data.ProjectInformationListItem'
    },
    JournalConf: {
      name: 'JournalConference',
      type: 'SP.Data.JournalConferenceListItem'
    },
    JCSubmission: {
      name: 'JCSubmission',
      type: 'SP.Data.JCSubmissionListItem'
    },
    addAuthor: {
      name: 'Authors',
      type: 'SP.Data.AuthorsListItem'
    },
    updateAuthor: {
      name: 'AAA01',
      type: 'SP.Data.AAA01ListItem'
    },
    updateDecision: {
      name: 'AAA01',
      type: 'SP.Data.AAA01ListItem'
    },
    jcGalley: {
      name: 'JCGalley',
      type: 'SP.Data.JCGalleyListItem'
    },
    // JCSubmission: 'JCSubmission',
    ProjectFinances: {
      name: 'ProjectFinances',
      type: 'SP.Data.ProjectFinancesListItem'
    },
    SOW: {
      name: 'SOW',
      type: 'SP.Data.SOWListItem'
    },
    ClientLegalEntity: {
      name: 'ClientLegalEntity',
      type: 'SP.Data.ClientLegalEntityListItem'
    },
    SOWBudgetBreakup: {
      name: 'SOWBudgetBreakup',
      type: 'SP.Data.SOWBudgetBreakupListItem'
    },
    ProjectContacts: {
      name: 'ProjectContacts',
      type: 'SP.Data.ProjectContactsListItem'
    },
    DeliverableType: {
      name: 'DeliverableType',
      type: 'SP.Data.DeliverableTypeListItem'
    },
    ProjectType: {
      name: 'ProjectType',
      type: 'SP.Data.ProjectTypeListItem'
    },
    TA: {
      name: 'TA',
      type: 'SP.Data.TAListItem'
    },
    Molecules: {
      name: 'Molecules',
      type: 'SP.Data.MoleculesListItem'
    },
    ResourceCategorization: {
      name: 'ResourceCategorization',
      type: 'SP.Data.ResourceCategorizationListItem'
    },
    BusinessVerticals: {
      name: 'BusinessVerticals',
      type: 'SP.Data.BusinessVerticalsListItem'
    },
    Currency: {
      name: 'Currency',
      type: 'SP.Data.CurrencyListItem'
    },
    ProjectPerYear: {
      name: 'ProjectPerYear',
      type: 'SP.Data.ProjectPerYearListItem'
    },
    // redundant item
    ProjectPO: {
      name: 'PO',
      type: 'SP.Data.POListItem'
    },
    PO: {
      name: 'PO',
      type: 'SP.Data.POListItem'
    },
    ProjectFinanceBreakup: {
      name: 'ProjectFinanceBreakup',
      type: 'SP.Data.ProjectFinanceBreakupListItem'
    },
    ProjectBudgetBreakup: {
      name: 'ProjectBudgetBreakup',
      type: 'SP.Data.ProjectBudgetBreakupListItem'
    },
    BillingEntity: {
      name: 'BillingEntity',
      type: 'SP.Data.BillingEntityListItem'
    },
    Schedules: {
      name: 'Schedules',
      type: 'SP.Data.SchedulesListItem'
    },
    LeaveCalendar: {
      name: 'Leave Calendar',
      type: 'SP.Data.Leave_x0020_CalendarListItem'
    },
    Inquiry: {
      name: 'Inquiry',
      type: 'SP.Data.InquiryListItem'
    },
    Milestones: {
      name: 'Milestones',
      type: 'SP.Data.MilestonesListItem'
    },
    MilestoneTasks: {
      name: 'MilestoneTasks',
      type: 'SP.Data.MilestoneTasksListItem'
    },
    SubMilestones: {
      name: 'SubMilestones',
      type: 'SP.Data.SubMilestonesListItem'
    },
    EmailDetails: {
      name: 'EmailDetails',
      type: 'SP.Data.EmailDetailsListItem'
    },
    ErrorLog: {
      name: 'ErrorLog',
      type: 'SP.Data.ErrorLogListItem'
    },
    MailContent: {
      name: 'MailContent',
      type: 'SP.Data.MailContentListItem'
    },
    ScorecardTemplate: {
      name: 'ScorecardTemplates',
      type: 'SP.Data.ScorecardTemplatesListItem'
    },
    ScorecardMatrix: {
      name: 'ScorecardMatrix',
      type: 'SP.Data.ScorecardMatrixListItem'
    },
    Scorecard: {
      name: 'Scorecard',
      type: 'SP.Data.ScorecardListItem'
    },
    ScorecardRatings: {
      name: 'ScorecardRating',
      type: 'SP.Data.ScorecardRatingListItem'
    },
    QualityComplaints: {
      name: 'QualityComplaints',
      type: 'SP.Data.Quality_x0020_ComplaintsListItem'
    },
    PositiveFeedbacks: {
      name: 'PositiveFeedbacks',
      type: 'SP.Data.PositiveFeedbacksListItem'
    },
    QCEmails: {
      name: 'QC Emails',
      type: 'SP.Data.QC_x0020_EmailsListItem'
    },
    StandardServices: {
      name: 'StandardServices',
      type: 'SP.Data.StandardServicesListItem'
    },
    SkillMaster: {
      name: 'SkillMaster',
      type: 'SP.Data.SkillMasterListItem'
    },
    StandardTemplates: {
      name: 'StandardTemplates',
      type: 'SP.Data.StandardTemplatesListItem'
    },
    MilestoneMatrix: {
      name: 'MilestoneMatrix',
      type: 'SP.Data.MilestoneMatrixListItem'
    },
    MilestoneTaskMatrix: {
      name: 'MilestoneTaskMatrix',
      type: 'SP.Data.MilestoneTaskMatrixListItem'
    },
    Services: {
      name: 'Services',
      type: 'SP.Data.ServicesListItem'
    },
    UsState: {
      name: 'USStates',
      type: 'SP.Data.USStatesListItem'
    },
    BudgetRateMaster: {
      name: 'BudgetRateMaster',
      type: 'SP.Data.BudgetRateMasterListItem'
    },
    ClientSubdivision: {
      name: 'ClientSubdivision',
      type: 'SP.Data.ClientSubdivisionListItem'
    },
    SpendingInfo: {
      name: 'SpendingInfo',
      type: 'SP.Data.SpendingInfoListItem'
    },
    Invoices: {
      name: 'Invoices',
      type: 'SP.Data.InvoicesListItem'
    },
    Proforma: {
      name: 'Proforma',
      type: 'SP.Data.ProformaListItem'
    },
    // redundant
    OutInvoices: {
      name: 'Invoices',
      type: 'SP.Data.InvoicesListItem'
    },
    CreditAndDebit: {
      name: 'CreditAndDebitNote',
      type: 'SP.Data.CreditAndDebitNoteListItem'
    },
    VendorFreelancer: {
      name: 'VendorFreelancer',
      type: 'SP.Data.VendorFreelancerListItem'
    },
  };

  public projectStatus = {
    InDiscussion: 'In Discussion',
    Confirmed: 'Confirmed',
    Unallocated: 'Unallocated',
    InProgress: 'In Progress',
    ReadyForClient: 'Ready for Client',
    AuthorReview: 'Author Review',
    OnHold: 'On Hold',
    Submitted: 'Submitted',
    Galleyed: 'Galleyed',
    Published: 'Published',
    AuditInProgress: 'Audit In Progress',
    Closed: 'Closed',
    Cancelled: 'Cancelled',
    AwaitingCancelApproval: 'Awaiting Cancel Approval',
    PendingClosure: 'Pending Closure',
    SentToAMForApproval: 'Sent to AM for Approval'
  };

  public Groups = {
    qmsAdmin: 'QMS_Admin',
    MANAGERS: 'Managers',
    PROJECT_FULL_ACCESS: 'Project-FullAccess',
    SOW_FULL_ACCESS: 'SOW-Full Access',
    SOW_CREATION_MANAGERS: 'SOW Creation Managers'
  };

  public FeedbackType = {
    taskRating: 'Task Feedback',
    qualitative: 'Qualitative'
  };
  public currentWebUrl = this.global.sharePointPageObject.serverRelativeUrl;
  // ***********************************************************************//
  // Add SOW
  // ***********************************************************************//
  public SOW_STATUS = {
    APPROVED: 'Approved',
    CANCEL_APPROVAL_PENDING: 'Cancel Approval Pending',
    CANCELLED: 'Cancelled',
    PROPOSE_CLOSURE: 'Propose Closure',
    PENDING_CLOSURE: 'Pending Closure',
    CLOSED: 'Closed',
    AUDIT_IN_PROGRESS: 'Audit In Progress',
    UPDATE: 'Update'
  };

  public STATUS = {
    NOT_STARTED: 'Not Saved',
    SCHEDUELD: 'Scheduled',
    APPROVED: 'Approved',
    APPROVAL_PENDING: 'Approval Pending',
    NOT_CONFIRMED: 'Not Confirmed',
    CLOSED_PROJECT: 'CloseProject',
    CONFIRMED: 'Confirmed',
    DELETED: 'Deleted',
    REJECTED: 'Rejected',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    AUTO_CLOSED: 'Auto Closed'
  };
  public SKILL_LEVEL = {
    WRITER: 'Writer',
    EDITOR: 'Editor',
    GRAPHICS: 'Graphics',
    QC: 'QC',
  };
  public EMAIL_TEMPLATE_NAME = {
    APPROVED_SOW: 'ApprovedSOW',
    SOW_BUDGET_UPDATED: 'SOWBudgetUpdated',
    AUDIT_PROJECT: 'AuditProject',
    CLOSE_PROJECT: 'CloseProject',
    NOTIFY_PM: 'NotifyPM',
    INVOICE_CONFIRM: 'ConfirmInvoice',
    CANCEL: 'Cancel',
    APPROVED_PROJECT: 'ApproveProject',
    BUDGET_REDUCTION: 'ApproveProjectBudget',
    BUDGET_APPROVAL: 'OutcomeBudgetApproval'
  };
  public invoiceList = {
    status: {
      Paid: 'Paid',
      Generated: 'Generated',
      SenttoAP: 'Sent to AP',
      Dispute: 'Dispute',
      AwaitingWriteOff: 'Awaiting Write Off',
      ClosedwithCredit: 'Closed with Credit Note',
      AwaitingClosedDebit: 'Awaiting Closed Debit Note',
      AwaitingClosedCredit: 'Awaiting Closed Credit Note'
    },
    columns: {
      FileURL: 'FileURL',
      InvoiceHtml: 'InvoiceHtml',
      Status: 'Status',
      PaymentURL: 'PaymentURL'
    }
  };

  public proformaList = {
    status: {
      Rejected: 'Rejected',
      Sent: 'Sent',
      Created: 'Created',
      Approved: 'Approved',
      Invoiced: 'Invoiced'
    },
    columns: {
      FileURL: 'FileURL',
      ProformaHtml: 'ProformaHtml',
      Status: 'Status'
    }
  };

  public invoiceLineItemsList = {
    status: {
      Scheduled: 'Scheduled',
      Confirmed: 'Confirmed',
      ProformaCreated: 'Proforma Created',
    },
    columns: {
      ScheduledDate: 'ScheduledDate',
      MainPOC: 'MainPOC',
      PO: 'PO',
      AddressType: 'AddressType',
      Budget: 'Budget',
      HoursSpent: 'HoursSpent',
      Status: 'Status',
      Amount: 'Amount'
    }
  };

  public projectList = {
    status: {
      InDiscussion: 'In Discussion',
      Confirmed: 'Confirmed',
      Unallocated: 'Unallocated',
      InProgress: 'In Progress',
      ReadyForClient: 'Ready for Client',
      AuthorReview: 'Author Review',
      OnHold: 'On Hold',
      AuditInProgress: 'Audit In Progress',
      Closed: 'Closed',
      Cancelled: 'Cancelled',
      AwaitingCancelApproval: 'Awaiting Cancel Approval',
      PendingClosure: 'Pending Closure',
      SentToAMForApproval: 'Sent to AM for Approval',
      Selected: 'Selected',
      Galleyed: 'Galleyed',
      Submitted: 'Submitted',
      Published: 'Published',
      Accepted: 'Accepted',
      Rejected: 'Rejected'
    },
    columns: {
      Title: 'Title',
      ProjectType: 'ProjectType',
      BusinessVertical: 'BusinessVertical',
      PrimaryPOC: 'PrimaryPOC',
      TA: 'TA',
      Indication: 'Indication',
      Molecule: 'Molecule',
      Priority: 'Priority',
      Status: 'Status',
      IsPubSupport: 'IsPubSupport',
      SOWBoxLink: 'SOWBoxLink',
      BD: 'BD',
      CMLevel1: 'CMLevel1',
      CMLevel2: 'CMLevel2',
      DeliveryLevel1: 'DeliveryLevel1',
      DeliveryLevel2: 'DeliveryLevel2',
      WBJID: 'WBJID',
      Milestone: 'Milestone',
      ProposedStartDate: 'ProposedStartDate',
      ProposedEndDate: 'ProposedEndDate',
      SOWLink: 'SOWLink',
      Description: 'Description',
      ConferenceJournal: 'ConferenceJournal',
      Authors: 'Authors',
      Comments: 'Comments',
      SOWCode: 'SOWCode',
      PubSupportStatus: 'PubSupportStatus'
    }
  };

  public projectFinanceBreakupList = {
    status: {
      Active: 'Active',
      Deleted: 'Deleted'
    },
    columns: {
      POLookup: 'POLookup',
      Amount: 'Amount',
      AmountRevenue: 'AmountRevenue',
      AmountTax: 'AmountTax',
      AmountOOP: 'AmountOOP',
      Status: 'Status',
      TotalScheduled: 'TotalScheduled',
      ScheduledRevenue: 'ScheduledRevenue',
      ScheduledOOP: 'ScheduledOOP',
      TotalInvoiced: 'TotalInvoiced',
      InvoicedRevenue: 'InvoicedRevenue',
      InvoicedTax: 'InvoicedTax',
      InvoicedOOP: 'InvoicedOOP',
    }
  };

  public projectBudgetBreakupList = {
    status: {
      ApprovalPending: 'Approval Pending',
      Approved: 'Approved',
      Rejected: 'Rejected'
    },
    columns: {
      OriginalBudget: 'OriginalBudget',
      NetBudget: 'NetBudget',
      OOPBudget: 'OOPBudget',
      TaxBudget: 'TaxBudget',
      BudgetHours: 'BudgetHours',
      Status: 'Status'
    }
  };

  public projectFinancesList = {
    columns: {
      Budget: 'Budget',
      HoursSpent: 'HoursSpent',
      RevenueBudget: 'RevenueBudget',
      OOPBudget: 'OOPBudget',
      ScheduledRevenue: 'ScheduledRevenue',
      ScheduledOOP: 'ScheduledOOP',
      InvoicedRevenue: 'InvoicedRevenue',
      InvoicedOOP: 'InvoicedOOP',
      BudgetHrs: 'BudgetHrs'
    }
  };

  public sowList = {
    status: {
      Approved: 'Approved',
      Cancelled: 'Cancelled'
    },
    columns: {
      Title: 'Title',
      PrimaryPOC: 'PrimaryPOC',
      Comments: 'Comments',
      BusinessVertical: 'BusinessVertical',
      CreatedDate: 'CreatedDate',
      ExpiryDate: 'ExpiryDate',
      Status: 'Status',
      SOWLink: 'SOWLink',
      CMLevel1: 'CMLevel1',
      CMLevel2: 'CMLevel2',
      DeliveryLevel1: 'DeliveryLevel1',
      DeliveryLevel2: 'DeliveryLevel2',
      BD: 'BD'
    }
  };

  public sowBudgetBreakupList = {
    status: {
      Approved: 'Approved',
      Cancelled: 'Cancelled'
    },
    columns: {
      AddendumNetBudget: 'AddendumNetBudget',
      AddendumOOPBudget: 'AddendumOOPBudget',
      AddendumTaxBudget: 'AddendumTaxBudget',
      NetBudget: 'NetBudget',
      OOPBudget: 'OOPBudget',
      TaxBudget: 'TaxBudget'
    }
  };


  public invoicesStatus = {
    Abandoned: 'Abandoned',
    Closed: 'Closed',
    Generated: 'Generated',
    SentForConfirmation: 'Sent for confirmation',
    SentForPayment: 'Sent for payment',
    SentToAP: 'Sent to AP',
    Paid: 'Paid',
    Dispute: 'Dispute',
    AwaitingWriteOff: 'Awaiting Write Off ',
    ClosedWithWrittenOff: 'Closed with Written Off',
    ClosedWithCreditNote: 'Closed with Credit Note',
    AwaitingClosedCreditNote: 'Awaiting Closed Credit Note',
    AwaitingClosedDebitNote: 'Awaiting Closed Debit Note',
    ClosedWithDebitNote: 'Closed with Debit Note',
  };

  public feedbackPopupComponent = {
    getTemplates: this.currentWebUrl +
      "/_api/web/lists/getbytitle('" + this.listNames.ScorecardTemplate.name + "')/items?" +
      "$select=ID,Title,Tooltip" +
      "&$filter= IsActive eq 1&$top={{TopCount}}",
    getTemplateMatrix: this.currentWebUrl +
      "/_api/web/lists/getbytitle('" + this.listNames.ScorecardMatrix.name + "')/items?" +
      "$select=ID,Title, ScorecardTemplate/Title, Tooltip&$expand=ScorecardTemplate/Title" +
      "&$filter= IsActive eq 1 and ScorecardTemplate/Title eq '{{selectedTemplate}}'&$top={{TopCount}}",
    addScorecardItem: this.currentWebUrl + "/_api/web/lists/getbytitle('" + this.listNames.Scorecard.name + "')/items",
    moveFileUrl: this.currentWebUrl + "/_api/web/getfilebyserverrelativeurl('{{FileUrl}}')/moveto(newurl='{{NewFileUrl}}',flags=1)",
    addScorecardRatingItem: this.currentWebUrl + "/_api/web/lists/getbytitle('" + this.listNames.ScorecardRatings.name + "')/items",
    updateScorecardRatingItem: this.currentWebUrl + "/_api/web/lists/getbytitle('" + this.listNames.ScorecardRatings.name + "')/items({{ID}})",
    updateSchedulesListItem: this.currentWebUrl + "/_api/web/lists/getbytitle('" + this.listNames.Schedules.name + "')/items({{ID}})",
    notRatedPrevTasks: this.currentWebUrl +
      "/_api/web/lists/getbytitle('" + this.listNames.Schedules.name + "')/items?" +
      "$select=ID, Title, ProjectCode, Status, Milestone, AssignedTo/ID, AssignedTo/Title, Actual_x0020_End_x0020_Date, PrevTasks, NextTasks" +
      "&$expand=AssignedTo/ID, AssignedTo/Title" +
      "&$filter= Title eq '{{PrevTaskTitle}}' and Rated eq 0&$top=1",
  }

}
