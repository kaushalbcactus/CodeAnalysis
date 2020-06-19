import { Injectable } from "@angular/core";

import { GlobalService } from "./global.service";
// import { AdminViewComponent } from '../admin-view/admin-view.component';

@Injectable({
  providedIn: "root",
})
export class ConstantsService {
  constructor(public globalService: GlobalService) {}
  loader = {
    isPSInnerLoaderHidden: false,
  };
  public userPermission = {
    isFdUserManager: false,
    isFdUserExpenseApprover: false,
    isFDUserAdmin: true,
    userPermissionMsg: false,
  };

  public listNames = {
    ProjectRelatedInvoices: {
      name: "ProjectRelatedInvoices",
      type: "SP.Data.ProjectRelatedInvoicesListItem",
    },
    ProjectScope: {
      name: "ProjectScope",
      type: "SP.Data.ProjectScopeListItem",
    },
    InvoiceDetails: {
      name: "InvoiceDetails",
      type: "SP.Data.InvoiceDetailsListItem",
    },
    AvailableHours: {
      name: "AvailableHours",
      type: "SP.Data.AvailableHoursListItem",
    },
    SubDeliverables: {
      name: "SubDeliverables",
      type: "SP.Data.SubDeliverablesListItem",
    },
    InvoiceLineItems: {
      name: "InvoiceLineItems",
      type: "SP.Data.InvoiceLineItemsListItem",
    },
    ProjectInformation: {
      name: "ProjectInformation",
      type: "SP.Data.ProjectInformationListItem",
    },
    projectInfo: {
      name: "ProjectInformation",
      type: "SP.Data.ProjectInformationListItem",
    },
    JournalConf: {
      name: "JournalConference",
      type: "SP.Data.JournalConferenceListItem",
    },
    JCSubmission: {
      name: "JCSubmission",
      type: "SP.Data.JCSubmissionListItem",
    },
    addAuthor: {
      name: "Authors",
      type: "SP.Data.AuthorsListItem",
    },
    updateAuthor: {
      name: "AAA01",
      type: "SP.Data.AAA01ListItem",
    },
    updateDecision: {
      name: "AAA01",
      type: "SP.Data.AAA01ListItem",
    },
    jcGalley: {
      name: "JCGalley",
      type: "SP.Data.JCGalleyListItem",
    },
    Journal: {
      name: "Journal",
      type: "SP.Data.JournalListItem",
    },
    Conference: {
      name: "Conference",
      type: "SP.Data.ConferenceListItem",
    },
    // JCSubmission: 'JCSubmission',
    ProjectFinances: {
      name: "ProjectFinances",
      type: "SP.Data.ProjectFinancesListItem",
    },
    SOW: {
      name: "SOW",
      type: "SP.Data.SOWListItem",
    },
    ClientLegalEntity: {
      name: "ClientLegalEntity",
      type: "SP.Data.ClientLegalEntityListItem",
    },
    SOWBudgetBreakup: {
      name: "SOWBudgetBreakup",
      type: "SP.Data.SOWBudgetBreakupListItem",
    },
    ProjectContacts: {
      name: "ProjectContacts",
      type: "SP.Data.ProjectContactsListItem",
    },
    DeliverableType: {
      name: "DeliverableType",
      type: "SP.Data.DeliverableTypeListItem",
    },
    ProjectType: {
      name: "ProjectType",
      type: "SP.Data.ProjectTypeListItem",
    },
    TA: {
      name: "TA",
      type: "SP.Data.TAListItem",
    },
    Molecules: {
      name: "Molecules",
      type: "SP.Data.MoleculesListItem",
    },
    ResourceCategorization: {
      name: "ResourceCategorization",
      type: "SP.Data.ResourceCategorizationListItem",
    },
    BusinessVerticals: {
      name: "BusinessVerticals",
      type: "SP.Data.BusinessVerticalsListItem",
    },
    Currency: {
      name: "Currency",
      type: "SP.Data.CurrencyListItem",
    },
    ProjectPerYear: {
      name: "ProjectPerYear",
      type: "SP.Data.ProjectPerYearListItem",
    },
    // redundant item
    ProjectPO: {
      name: "PO",
      type: "SP.Data.POListItem",
    },
    PO: {
      name: "PO",
      type: "SP.Data.POListItem",
    },
    ProjectFinanceBreakup: {
      name: "ProjectFinanceBreakup",
      type: "SP.Data.ProjectFinanceBreakupListItem",
    },
    ProjectBudgetBreakup: {
      name: "ProjectBudgetBreakup",
      type: "SP.Data.ProjectBudgetBreakupListItem",
    },
    BillingEntity: {
      name: "BillingEntity",
      type: "SP.Data.BillingEntityListItem",
    },
    Schedules: {
      name: "Schedules",
      type: "SP.Data.SchedulesListItem",
    },
    EarlyTaskComplete: {
      name: "EarlyTaskCompleteNotifications",
      type: "SP.Data.EarlyTaskCompleteNotificationsListItem",
    },
    LeaveCalendar: {
      name: "Leave Calendar",
      type: "SP.Data.Leave_x0020_CalendarListItem",
    },
    Inquiry: {
      name: "Inquiry",
      type: "SP.Data.InquiryListItem",
    },
    Milestones: {
      name: "Milestones",
      type: "SP.Data.MilestonesListItem",
    },
    MilestoneTasks: {
      name: "MilestoneTasks",
      type: "SP.Data.MilestoneTasksListItem",
    },
    SubMilestones: {
      name: "SubMilestones",
      type: "SP.Data.SubMilestonesListItem",
    },
    EmailDetails: {
      name: "EmailDetails",
      type: "SP.Data.EmailDetailsListItem",
    },
    ErrorLog: {
      name: "ErrorLog",
      type: "SP.Data.ErrorLogListItem",
    },
    MailContent: {
      name: "MailContent",
      type: "SP.Data.MailContentListItem",
    },
    ScorecardTemplate: {
      name: "ScorecardTemplates",
      type: "SP.Data.ScorecardTemplatesListItem",
    },
    ScorecardMatrix: {
      name: "ScorecardMatrix",
      type: "SP.Data.ScorecardMatrixListItem",
    },
    Scorecard: {
      name: "Scorecard",
      type: "SP.Data.ScorecardListItem",
    },
    ScorecardRatings: {
      name: "ScorecardRating",
      type: "SP.Data.ScorecardRatingListItem",
    },
    QualityComplaints: {
      name: "Quality Complaints",
      type: "SP.Data.Quality_x0020_ComplaintsListItem",
    },
    PositiveFeedbacks: {
      name: "PositiveFeedbacks",
      type: "SP.Data.PositiveFeedbacksListItem",
    },
    QCEmails: {
      name: "QC Emails",
      type: "SP.Data.QC_x0020_EmailsListItem",
    },
    StandardServices: {
      name: "StandardServices",
      type: "SP.Data.StandardServicesListItem",
    },
    SkillMaster: {
      name: "SkillMaster",
      type: "SP.Data.SkillMasterListItem",
    },
    StandardTemplates: {
      name: "StandardTemplates",
      type: "SP.Data.StandardTemplatesListItem",
    },
    MilestoneMatrix: {
      name: "MilestoneMatrix",
      type: "SP.Data.MilestoneMatrixListItem",
    },
    MilestoneSubTaskMatrix: {
      name: "MilestoneSubTaskMatrix",
      type: "SP.Data.MilestoneSubTaskMatrixListItem",
    },
    MilestoneTaskMatrix: {
      name: "MilestoneTaskMatrix",
      type: "SP.Data.MilestoneTaskMatrixListItem",
    },
    Services: {
      name: "Services",
      type: "SP.Data.ServicesListItem",
    },
    UsState: {
      name: "USStates",
      type: "SP.Data.USStatesListItem",
    },
    BudgetRateMaster: {
      name: "BudgetRateMaster",
      type: "SP.Data.BudgetRateMasterListItem",
    },
    ClientSubdivision: {
      name: "ClientSubdivision",
      type: "SP.Data.ClientSubdivisionListItem",
    },
    SpendingInfo: {
      name: "SpendingInfo",
      type: "SP.Data.SpendingInfoListItem",
    },
    Invoices: {
      name: "Invoices",
      type: "SP.Data.InvoicesListItem",
    },
    Proforma: {
      name: "Proforma",
      type: "SP.Data.ProformaListItem",
    },
    // redundant
    OutInvoices: {
      name: "Invoices",
      type: "SP.Data.InvoicesListItem",
    },
    CreditAndDebit: {
      name: "CreditAndDebitNote",
      type: "SP.Data.CreditAndDebitNoteListItem",
    },
    VendorFreelancer: {
      name: "VendorFreelancer",
      type: "SP.Data.VendorFreelancerListItem",
    },
    FocusGroup: {
      name: "Focus Group",
      type: "SP.Data.Focus_x0020_GroupListItem",
    },
    TimeZones: {
      name: "TimeZones",
      type: "SP.Data.TimeZonesListItem",
    },
    UserInformationList: {
      name: "User Information List",
    },
    ClientGroup: {
      name: "ClientGroup",
      type: "SP.Data.ClientGroupListItem",
    },
    POBudgetBreakup: {
      name: "POBudgetBreakup",
      type: "SP.Data.POBudgetBreakupListItem",
    },
    CLEBucketMapping: {
      name: "CLEBucketMapping",
      type: "SP.Data.CLEBucketMappingListItem",
    },
    EarlyTaskCompleteNotifications: {
      name: "EarlyTaskCompleteNotifications",
      type: "SP.Data.EarlyTaskCompleteNotificationsListItem",
    },
    SendEmail: {
      name: "SendEmail",
      type: "SP.Data.SendEmailListItem",
    },
    BlockResource: {
      name: "BlockingResources",
      type: "SP.Data.BlockingResourcesListItem",
    },
  };

  public projectStatus = {
    InDiscussion: "In Discussion",
    Confirmed: "Confirmed",
    Unallocated: "Unallocated",
    InProgress: "In Progress",
    ReadyForClient: "Ready for Client",
    AuthorReview: "Author Review",
    OnHold: "On Hold",
    Submitted: "Submitted",
    Galleyed: "Galleyed",
    Published: "Published",
    AuditInProgress: "Audit In Progress",
    NewAuditInProgress: "CS Audit",
    Closed: "Closed",
    Cancelled: "Cancelled",
    AwaitingCancelApproval: "Awaiting Cancel Approval",
    PendingClosure: "Pending Closure",
    NewPendingClosure: "Finance Audit",
    SentToAMForApproval: "Sent to AM for Approval",
  };

  public Groups = {
    QMSViewScorecard: "QMS_ViewScorecard",
    QMSAdmin: "QMS_Admin",
    QMSLeaders: "QMS_Leaders",
    CDAdmin: "CD_Admin",
    CAAdmin: "CA_Admin",
    PFAdmin: "PF_Admin",
    MANAGERS: "Managers",
    PROJECT_FULL_ACCESS: "Project-FullAccess",
    INVOICE_TEAM: "Invoice_Team",
    SOW_FULL_ACCESS: "SOW-Full Access",
    SOW_CREATION_MANAGERS: "SOW Creation Managers",
    SYNC_USER_TO_USER_INFORMATION_LIST: "SyncUserToUserInformationList",
  };
  public cdStatus = {
    Created: "Created",
    Deleted: "Deleted",
    ValidationPending: "Validation Pending",
    Closed: "Closed",
    Rejected: "Rejected",
    Valid: "Valid",
    InValid: "InValid",
  };

  public pfStatus = {
    Pending: "Pending",
    Accepted: "Accepted",
    Rejected: "Rejected",
  };

  public blockResStatus = {
    Deleted: "Deleted",
    Active: "Active",
  };
  public FeedbackType = {
    taskRating: "Task Feedback",
    qualitative: "Qualitative",
  };
  public currentWebUrl = this.globalService.sharePointPageObject
    .serverRelativeUrl;
  // ***********************************************************************//
  // Add SOW
  // ***********************************************************************//
  public SOW_STATUS = {
    APPROVED: "Approved",
    CANCEL_APPROVAL_PENDING: "Cancel Approval Pending",
    CANCELLED: "Cancelled",
    PROPOSE_CLOSURE: "Propose Closure",
    PENDING_CLOSURE: "Pending Closure",
    CLOSED: "Closed",
    AUDIT_IN_PROGRESS: "Audit In Progress",
    UPDATE: "Update",
  };

  public STATUS = {
    NOT_STARTED: "Not Started",
    NOT_SAVED: "Not Saved",
    SCHEDUELD: "Scheduled",
    APPROVED: "Approved",
    APPROVAL_PENDING: "Approval Pending",
    NOT_CONFIRMED: "Not Confirmed",
    CLOSED_PROJECT: "CloseProject",
    CONFIRMED: "Confirmed",
    DELETED: "Deleted",
    REJECTED: "Rejected",
    IN_PROGRESS: "In Progress",
    ON_HOLD: "On Hold",
    AUTO_CLOSED: "Auto Closed",
    COMPLETED: "Completed",
    AUTHOR_REVIEW: "Author Review",
    UNALLOCATED: "Unallocated",
    SENTTOAP: "Sent to AP",
    GENERATED: "Generated",
  };
  public SKILL_LEVEL = {
    WRITER: "Writer",
    EDITOR: "Editor",
    GRAPHICS: "Graphics",
    QC: "QC",
  };
  public EMAIL_TEMPLATE_NAME = {
    APPROVED_SOW: "ApprovedSOW",
    SOW_BUDGET_UPDATED: "SOWBudgetUpdated",
    AUDIT_PROJECT: "AuditProject",
    CLOSE_PROJECT: "CloseProject",
    NOTIFY_PM: "NotifyPM",
    INVOICE_CONFIRM: "ConfirmInvoice",
    CANCEL: "Cancel",
    APPROVED_PROJECT: "ApproveProject",
    BUDGET_REDUCTION: "ApproveProjectBudget",
    BUDGET_APPROVAL: "OutcomeBudgetApproval",
    ON_HOLD: "Hold",
  };
  public invoiceList = {
    status: {
      Paid: "Paid",
      Generated: "Generated",
      SenttoAP: "Sent to AP",
      Dispute: "Dispute",
      AwaitingWriteOff: "Awaiting Write Off",
      ClosedwithCredit: "Closed with Credit Note",
      AwaitingClosedDebit: "Awaiting Closed Debit Note",
      AwaitingClosedCredit: "Awaiting Closed Credit Note",
    },
    columns: {
      FileURL: "FileURL",
      InvoiceHtml: "InvoiceHtml",
      Status: "Status",
      PaymentURL: "PaymentURL",
    },
  };

  public proformaList = {
    status: {
      Rejected: "Rejected",
      Sent: "Sent",
      Created: "Created",
      Approved: "Approved",
      Invoiced: "Invoiced",
    },
    columns: {
      FileURL: "FileURL",
      ProformaHtml: "ProformaHtml",
      Status: "Status",
    },
  };

  public invoiceLineItemsList = {
    status: {
      Scheduled: "Scheduled",
      Confirmed: "Confirmed",
      ProformaCreated: "Proforma Created",
    },
    columns: {
      ScheduledDate: "ScheduledDate",
      MainPOC: "MainPOC",
      PO: "PO",
      AddressType: "AddressType",
      Budget: "Budget",
      HoursSpent: "HoursSpent",
      Status: "Status",
      Amount: "Amount",
    },
  };

  public projectList = {
    status: {
      InDiscussion: "In Discussion",
      Confirmed: "Confirmed",
      Unallocated: "Unallocated",
      InProgress: "In Progress",
      ReadyForClient: "Ready for Client",
      AuthorReview: "Author Review",
      OnHold: "On Hold",
      AuditInProgress: "Audit In Progress",
      Closed: "Closed",
      Cancelled: "Cancelled",
      AwaitingCancelApproval: "Awaiting Cancel Approval",
      PendingClosure: "Pending Closure",
      SentToAMForApproval: "Sent to AM for Approval",
      // Selected: 'Selected',
      // Galleyed: 'Galleyed',
      // Submitted: 'Submitted',
      // Published: 'Published',
      // Accepted: 'Accepted',
      // Rejected: 'Rejected'
    },
    columns: {
      Title: "Title",
      ProjectType: "ProjectType",
      BusinessVertical: "BusinessVertical",
      PrimaryPOC: "PrimaryPOC",
      TA: "TA",
      Indication: "Indication",
      Molecule: "Molecule",
      Priority: "Priority",
      Status: "Status",
      IsPubSupport: "IsPubSupport",
      SOWBoxLink: "SOWBoxLink",
      BD: "BD",
      CMLevel1: "CMLevel1",
      CMLevel2: "CMLevel2",
      DeliveryLevel1: "DeliveryLevel1",
      DeliveryLevel2: "DeliveryLevel2",
      WBJID: "WBJID",
      Milestone: "Milestone",
      ProposedStartDate: "ProposedStartDate",
      ProposedEndDate: "ProposedEndDate",
      SOWLink: "SOWLink",
      Description: "Description",
      ConferenceJournal: "ConferenceJournal",
      Authors: "Authors",
      Comments: "Comments",
      SOWCode: "SOWCode",
      PubSupportStatus: "PubSupportStatus",
    },
  };

  public projectFinanceBreakupList = {
    status: {
      Active: "Active",
      Deleted: "Deleted",
    },
    columns: {
      POLookup: "POLookup",
      Amount: "Amount",
      AmountRevenue: "AmountRevenue",
      AmountTax: "AmountTax",
      AmountOOP: "AmountOOP",
      Status: "Status",
      TotalScheduled: "TotalScheduled",
      ScheduledRevenue: "ScheduledRevenue",
      ScheduledOOP: "ScheduledOOP",
      TotalInvoiced: "TotalInvoiced",
      InvoicedRevenue: "InvoicedRevenue",
      InvoicedTax: "InvoicedTax",
      InvoicedOOP: "InvoicedOOP",
    },
  };

  public projectBudgetBreakupList = {
    status: {
      ApprovalPending: "Approval Pending",
      Approved: "Approved",
      Rejected: "Rejected",
    },
    columns: {
      OriginalBudget: "OriginalBudget",
      NetBudget: "NetBudget",
      OOPBudget: "OOPBudget",
      TaxBudget: "TaxBudget",
      BudgetHours: "BudgetHours",
      Status: "Status",
    },
  };

  public projectFinancesList = {
    columns: {
      Budget: "Budget",
      HoursSpent: "HoursSpent",
      RevenueBudget: "RevenueBudget",
      OOPBudget: "OOPBudget",
      ScheduledRevenue: "ScheduledRevenue",
      ScheduledOOP: "ScheduledOOP",
      InvoicedRevenue: "InvoicedRevenue",
      InvoicedOOP: "InvoicedOOP",
      BudgetHrs: "BudgetHrs",
    },
  };

  public sowList = {
    status: {
      Approved: "Approved",
      Cancelled: "Cancelled",
    },
    columns: {
      Title: "Title",
      PrimaryPOC: "PrimaryPOC",
      Comments: "Comments",
      BusinessVertical: "BusinessVertical",
      CreatedDate: "CreatedDate",
      ExpiryDate: "ExpiryDate",
      Status: "Status",
      SOWLink: "SOWLink",
      CMLevel1: "CMLevel1",
      CMLevel2: "CMLevel2",
      DeliveryLevel1: "DeliveryLevel1",
      DeliveryLevel2: "DeliveryLevel2",
      BD: "BD",
    },
  };

  public sowBudgetBreakupList = {
    status: {
      Approved: "Approved",
      Cancelled: "Cancelled",
    },
    columns: {
      AddendumNetBudget: "AddendumNetBudget",
      AddendumOOPBudget: "AddendumOOPBudget",
      AddendumTaxBudget: "AddendumTaxBudget",
      NetBudget: "NetBudget",
      OOPBudget: "OOPBudget",
      TaxBudget: "TaxBudget",
    },
  };

  public invoicesStatus = {
    Abandoned: "Abandoned",
    Closed: "Closed",
    Generated: "Generated",
    SentForConfirmation: "Sent for confirmation",
    SentForPayment: "Sent for payment",
    SentToAP: "Sent to AP",
    Paid: "Paid",
    Dispute: "Dispute",
    AwaitingWriteOff: "Awaiting Write Off ",
    ClosedWithWrittenOff: "Closed with Written Off",
    ClosedWithCreditNote: "Closed with Credit Note",
    AwaitingClosedCreditNote: "Awaiting Closed Credit Note",
    AwaitingClosedDebitNote: "Awaiting Closed Debit Note",
    ClosedWithDebitNote: "Closed with Debit Note",
  };

  public userType = {
    BEST_FIT: "Best Fit",
    RECOMMENDED: "Recommended",
  };

  public Method = {
    POST: "POST",
    PATCH: "PATCH",
    GET: "GET",
  };

  public MessageType = {
    success: "success",
    info: "info",
    warn: "warn",
    error: "error",
  };

  public Messages = {
    SpecialCharMsg:
      "Special characters are found in file name. Please rename it. List of special characters ~ # % & * { }  : / + < > ? \" @ '",
    ZeroKbFile: "Unable to upload file, size of  {{fileName}} is 0 KB.",
    FileNotUploaded: "File not uploaded, Folder / File Not Found",
    FileAlreadyExist:
      "This file name already exit.Please select another file name.",
  };
}
