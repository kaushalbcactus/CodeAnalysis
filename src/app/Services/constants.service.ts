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

  public REG_EXPRESSION = {
    ALPHA_SPECIAL: /^([a-zA-Z])+((?:[-_](?![-_]))*([a-zA-Z]))*$/,
  }

  public listNames = {
    ProjectScope: {
      name: "ProjectScopeCT",
      type: "SP.Data.ProjectScopeCTListItem",
      contentTypeId:
        "0x0100DD5B4FBCF3F8FD4DA1C52F52781E1BEC00075BFD9AAF4F7544AD9DE8BFA52D7E05",
    },
    AvailableHours: {
      // checked
      name: "AvailableHoursCT",
      type: "SP.Data.AvailableHoursCTListItem",
      contentTypeId: "0x0100AE8013F4448FD142986FE4648EC83285*",
    },
    SubDeliverables: {
      // checked
      name: "SubDeliverablesCT",
      type: "SP.Data.SubDeliverablesCTListItem",
      contentTypeId: "0x01000D9988EACAC35948A314055E45F51828*",
    },
    InvoiceLineItems: {
      // checked
      name: "InvoiceLineItemsCT",
      type: "SP.Data.InvoiceLineItemsCTListItem",
      contentTypeId: "0x0100DEC2228EE195F44D8AB231E4F33C6FA7*",
    },
    ProjectInformation: {
      name: "ProjectInformationCT",
      type: "SP.Data.ProjectInformationCTListItem",
      contentTypeId: "0x0100C39236969AED684AB3138CC274A973B0*",
    },
    JournalConf: {
      name: "JournalConferenceCT",
      type: "SP.Data.JournalConferenceCTListItem",
      contentTypeId: "0x010013477ACADCD5AA43A595464BB9986AF5*",
    },
    JCSubmission: {
      name: "JCSubmissionCT",
      type: "SP.Data.JCSubmissionCTListItem",
      contentTypeId: "0x0100ADED0F8617C0324AA5579EF8F5A13266*",
    },
    Authors: {
      name: "AuthorsCT",
      type: "SP.Data.AuthorsCTListItem",
      contentTypeId: "0x0100D7C4ED88080DDB4CADD6A20E98C3FE03*",
    },
    JCGalley: {
      name: "JCGalleyCT",
      type: "SP.Data.JCGalleyCTListItem",
      contentTypeId: "0x01009C58CD093A890542B38A029DE4790F19*",
    },
    Journal: {
      name: "JournalCT",
      type: "SP.Data.JournalCTListItem",
      contentTypeId: "0x010045D6CFF64F96C9468511AC4DAA5ED3C6*",
    },
    Conference: {
      name: "ConferenceCT",
      type: "SP.Data.ConferenceCTListItem",
      contentTypeId: "0x0100FA8BC4EBFB4EC84082F0BBB7DC79DFCB*",
    },
    // JCSubmission: 'JCSubmission',
    ProjectFinances: {
      name: "ProjectFinancesCT",
      type: "SP.Data.ProjectFinancesCTListItem",
      contentTypeId: "0x0100962736EC198643419ECB14DE056DA4E0*",
    },
    SOW: {
      name: "SOWCT",
      type: "SP.Data.SOWCTListItem",
      contentTypeId: "0x01007E54096B6D61EC47A7324CACBF9E4684*",
    },
    ClientLegalEntity: {
      name: "ClientLegalEntityCT",
      type: "SP.Data.ClientLegalEntityCTListItem",
      contentTypeId: "0x0100E97FF3DC47CEBD499E1FACAACE8A8537*",
    },
    SOWBudgetBreakup: {
      name: "SOWBudgetBreakupCT",
      type: "SP.Data.SOWBudgetBreakupCTListItem",
      contentTypeId: "0x0100E7756B65DC010C408F45BD075F161AAC*",
    },
    ProjectContacts: {
      name: "ProjectContactsCT",
      type: "SP.Data.ProjectContactsCTListItem",
      contentTypeId: "0x0100110169BC24C15C4595D53C6A2702CABF*",
    },
    DeliverableType: {
      name: "DeliverableTypeCT",
      type: "SP.Data.DeliverableTypeCTListItem",
      contentTypeId: "0x01000838C9D1140C274D9FDB75199AEA8EF1*",
    },
    ProjectType: {
      // Used in project-types-components && pm-common-services.ts // need delete later
      name: "ProjectType",
      type: "SP.Data.ProjectTypeListItem",
      contentTypeId: "",
    },
    TA: {
      name: "TACT",
      type: "SP.Data.TACTListItem",
      contentTypeId: "0x0100B2BCF00CBA6AA74DACEE5094DA1F75BB*",
    },
    Molecules: {
      name: "MoleculesCT",
      type: "SP.Data.MoleculesCTListItem",
      contentTypeId: "0x01005B925D728E4EFB4F898BFF900F85E1F0*",
    },
    ResourceCategorization: {
      name: "ResourceCategorizationCT",
      type: "SP.Data.ResourceCategorizationCTListItem",
      contentTypeId: "0x01006B3C6B0BE98BFE42A02C86580EC4C063*",
    },
    PracticeArea: {
      name: "PracticeAreaCT",
      type: "SP.Data.PracticeAreaCTListItem",
      contentTypeId: "0x010033A0DB5BD5D3EA478FF371821126EB1A*",
    },
    Currency: {
      name: "CurrencyCT",
      type: "SP.Data.CurrencyCTListItem",
      contentTypeId: "0x01000BA1874347FD7F4493D3CBB99A150AC0*",
    },
    ProjectPerYear: {
      name: "ProjectPerYearCT",
      type: "SP.Data.ProjectPerYearCTListItem",
      contentTypeId: "0x01001F87D28D986F294F8B4AB4670E437C5D*",
    },
    PO: {
      name: "POCT",
      type: "SP.Data.POCTListItem",
      contentTypeId: "0x0100A316D8AD29BCFB4DB67252A30783DF22*",
    },
    ProjectFinanceBreakup: {
      name: "ProjectFinanceBreakupCT",
      type: "SP.Data.ProjectFinanceBreakupCTListItem",
      contentTypeId: "0x0100C920DD645467334588714AA48AFF1A67*",
    },
    ProjectBudgetBreakup: {
      name: "ProjectBudgetBreakupCT",
      type: "SP.Data.ProjectBudgetBreakupCTListItem",
      contentTypeId: "0x0100792AC1D87963C34EA23766B486446D52*",
    },
    BillingEntity: {
      name: "BillingEntityCT",
      type: "SP.Data.BillingEntityCTListItem",
      contentTypeId: "0x01000D0C2EA8E6189841AD850920678AB6FF*",
    },
    Schedules: {
      name: "SchedulesCT",
      type: "SP.Data.SchedulesCTListItem",
      contentTypeId: "0x0100E230FF3CEDFE4C42BEB74E6E8E685340*",
    },
    LeaveCalendar: {
      // Local list
      name: "Leave Calendar",
      type: "SP.Data.Leave_x0020_CalendarListItem",
    },
    Milestones: {
      name: "MilestonesCT",
      type: "SP.Data.MilestonesCTListItem",
      contentTypeId: "0x0100A2AA7D9F3B833543A06D9B645CEDEB8E*",
    },
    MilestoneTasks: {
      name: "MilestoneTasksCT",
      type: "SP.Data.MilestoneTasksCTListItem",
      contentTypeId: "0x01004B1B9BEDF296EF4A8DA796593AE23091*",
    },
    SubMilestones: {
      name: "SubMilestonesCT",
      type: "SP.Data.SubMilestonesCTListItem",
      contentTypeId: "0x0100A6956A25EB1E4D458AF1EC83F398E6F3*",
    },
    ErrorLog: {
      name: "ErrorLogCT",
      type: "SP.Data.ErrorLogCTListItem",
      contentTypeId: "0x0100665992FA6DE27547915C059C44DCB5CA*",
    },
    MailContent: {
      name: "MailContentCT",
      type: "SP.Data.MailContentCTListItem",
      contentTypeId: "0x01002BB4C65956579043A0F077021AEE91EF*",
    },
    ScorecardTemplate: {
      name: "ScorecardTemplatesCT",
      type: "SP.Data.ScorecardTemplatesCTListItem",
      contentTypeId: "0x010051DC2269CF557F4F98D4EF64585DDAC5*",
    },
    ScorecardMatrix: {
      name: "ScorecardMatrixCT",
      type: "SP.Data.ScorecardMatrixCTListItem",
      contentTypeId: "0x0100EA61FDC033E83640B18D46D2F4331E05*",
    },
    Scorecard: {
      name: "ScorecardCT",
      type: "SP.Data.ScorecardCTListItem",
      contentTypeId: "0x0100521A011E27FBA54D8280311A570F5D89*",
    },
    ScorecardRatings: {
      name: "ScorecardRatingCT",
      type: "SP.Data.ScorecardRatingCTListItem",
      contentTypeId: "0x01009208731FF80A954C84C798B5DFB74643*",
    },
    QualityComplaints: {
      name: "QualityComplaintsCT",
      type: "SP.Data.QualityComplaintsCTListItem",
      contentTypeId: "0x01001B7D3B9AB6498543AE989843B15BCB8E*",
    },
    PositiveFeedbacks: {
      name: "PositiveFeedbacksCT",
      type: "SP.Data.PositiveFeedbacksCTListItem",
      contentTypeId: "0x0100D7EDDDD4440722498068DA96ACF9F286*",
    },
    QCEmails: {
      name: "QC Emails",
      type: "SP.Data.QC_x0020_EmailsListItem",
    },
    StandardServices: {
      name: "StandardServicesCT",
      type: "SP.Data.StandardServicesCTListItem",
      contentTypeId: "0x0100956B97B5D6DC7D43A27AD9DC6F0C5251*",
    },
    SkillMaster: {
      name: "SkillMasterCT",
      type: "SP.Data.SkillMasterCTListItem",
      contentTypeId: "0x0100C73E886234C2F843A291A924D7F0891A*",
    },
    StandardTemplates: {
      name: "StandardTemplatesCT",
      type: "SP.Data.StandardTemplatesCTListItem",
      contentTypeId: "0x0100EB3CBD8D654DE24FA2702437E76D5FA6*",
    },
    MilestoneMatrix: {
      name: "MilestoneMatrixCT",
      type: "SP.Data.MilestoneMatrixCTListItem",
      contentTypeId: "0x0100864FBE9DE3652D468C5852F7C28E8481*",
    },
    MilestoneSubTaskMatrix: {
      name: "MilestoneSubTaskMatrixCT",
      type: "SP.Data.MilestoneSubTaskMatrixCTListItem",
      contentTypeId: "0x0100CED72A58A5009443823F9655B164AC9F*",
    },
    MilestoneTaskMatrix: {
      name: "MilestoneTaskMatrixCT",
      type: "SP.Data.MilestoneTaskMatrixCTListItem",
      contentTypeId: "0x0100970730A5E0E03E4A92BD24E2B619CC45*",
    },
    Services: {
      name: "ServicesCT",
      type: "SP.Data.ServicesCTListItem",
      contentTypeId: "0x01009ACFC38D620A7545B2EEC432E40E0C59*",
    },
    UsState: {
      name: "USStatesCT",
      type: "SP.Data.USStatesCTListItem",
      contentTypeId: "0x01006FFFE4AA5178E64DA3D9AE27A107818F*",
    },
    BudgetRateMaster: {
      name: "BudgetRateMasterCT",
      type: "SP.Data.BudgetRateMasterCTListItem",
      contentTypeId: "0x0100B533A9063996F14787DABBF9914FC93C*",
    },
    ClientSubdivision: {
      name: "ClientSubdivisionCT",
      type: "SP.Data.ClientSubdivisionCTListItem",
      contentTypeId: "0x01000133CABFD5C9484C8E47E777756CA5BA*",
    },
    SpendingInfo: {
      name: "SpendingInfoCT",
      type: "SP.Data.SpendingInfoCTListItem",
      contentTypeId: "0x01004A74BF58B02D454E8D2D335FFA39F92D*",
    },
    Invoices: {
      name: "InvoicesCT",
      type: "SP.Data.InvoicesCTListItem",
      contentTypeId: "0x0100367490D3F315FF49B9AEB5277E4886AF*",
    },
    Proforma: {
      name: "ProformaCT",
      type: "SP.Data.ProformaCTListItem",
      contentTypeId: "0x01000E6CFCF1AF68C24C8FA754A91E693F32*",
    },
    CreditAndDebit: {
      name: "CreditAndDebitNoteCT",
      type: "SP.Data.CreditAndDebitNoteCTListItem",
      contentTypeId: "0x0100C1E5E87E5B85F342A8BF384A07B4062A*",
    },
    VendorFreelancer: {
      name: "VendorFreelancerCT",
      type: "SP.Data.VendorFreelancerCTListItem",
      contentTypeId: "0x01000F7F3A2BCB7B6342B9D58A46F1EA0CF4*",
    },
    FocusGroup: {
      name: "FocusGroupCT",
      type: "SP.Data.FocusGroupCTListItem",
      contentTypeId: "0x01005FDED8C40BE8C04ABA91C440CA00782F*",
    },
    TimeZones: {
      name: "TimeZonesCT",
      type: "SP.Data.TimeZonesCTListItem",
      contentTypeId: "0x0100FEFAC93A1A2FDF42B63583C7F42C657D*",
    },
    UserInformationList: {
      name: "User Information List",
    },
    ClientGroup: {
      name: "ClientGroupCT",
      type: "SP.Data.ClientGroupCTListItem",
      contentTypeId: "0x01008186D9D5372AB848B0EBC7EDE5AF8FB0*",
    },
    POBudgetBreakup: {
      name: "POBudgetBreakupCT",
      type: "SP.Data.POBudgetBreakupCTListItem",
      contentTypeId: "0x0100057CA5C63F5C7D4EA0DCE8E850A0B26A*",
    },
    CLEBucketMapping: {
      name: "CLEBucketMappingCT",
      type: "SP.Data.CLEBucketMappingCTListItem",
      contentTypeId: "0x01009EFF4B187F5C514CA55907ECBA65E0AC*",
    },
    EarlyTaskCompleteNotifications: {
      name: "EarlyTaskCompleteNotificationsCT",
      type: "SP.Data.EarlyTaskCompleteNotificationsCTListItem",
      contentTypeId: "0x0100AD22BC881F06A04EAD9E6F5E31399C55*",
    },
    SendEmail: {
      name: "SendEmailCT",
      type: "SP.Data.SendEmailCTListItem",
      contentTypeId: "0x0100E750B18758DE1A47B16A8FECB29C0F73*",
    },
    AdhocTask: {
      name: "AdhocTaskCT",
      type: "SP.Data.AdhocTaskCTListItem",
      contentTypeId: "0x010001D6F5F61703574497087ACF9390AA16*",
    },
    Blocking: {
      name: "BlockingCT",
      type: "SP.Data.BlockingCTListItem",
      contentTypeId: "0x010088151006240E4149953AD8D3958182CA*",
    },
    PreferredResources: {
      name: "PreferredResources",
      type: "SP.Data.PreferredResourcesListItem",
      contentTypeId: "0x01001C131EF299CBF741A4E84C62523A293A*",
    },
    RuleStore: {
      name: "RuleStoreCT",
      type: "SP.Data.RuleStoreCTListItem",
      contentTypeId: "0x01001C131EF299CBF741A4E84C62523A293A*",
    },
    RuleParameters: {
      name: "RuleParametersCT",
      type: "SP.Data.RuleParametersCTListItem",
      contentTypeId: "0x010080C9A0031AB9AF49B3726642F1BF810600BF72DE562CCD1447BCE552EFF0A4F06B",
    },

    SurveyResponse: {
      name: "SurveyResponse",
      type: "SP.Data.SurveyResponseListItem",
      contentTypeId: "0x01005BD96CAA8E88CC469F259E2270EE1072008AE0A6E96DBCC54198A5F5732A2C48CA",
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
    PO_BUDGET_UPDATED: "POBudgetUpdated",
    TASK_CREATION: "TaskCreation",
    CENTRAL_TASK_CREATION: "CentralTaskCreation",
    APPROVE_EXPENSE: "ApproveExpense",
    NEXT_TASK_TEMPLATE: "NextTaskTemplate",
    CANCEL_EXPENSE: "CancelExpense",
    REJECT_EXPENSE: "RejectExpense",
    CLOSED_TASK_NOTIFICATION: "ClosedTaskNotification",
    REALLOCATIONSLOTNOTIFICATION: "ReallocationSlotNotification",
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

  /////// Remove one of the constant
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
  public CONTENT_TYPE = {
    TASK: "Task",
    MILESTONE: "Milestone",
    SLOT: "Slot",
  };

  public PROJECTTYPES = {
    DELIVERABLE: "Deliverable-Writing",
    FTE: "FTE-Writing",
    HOURLY: "Hours-Rolling",
  };

  public RulesType = {
    PROJECT: "Project",
    SOW: "SOW",
    CD: "CD",
    PF: "PF",
    DELIVERY: "Delivery",
    CM: "CM",
  };

  public RoleType = {
    DELIVERY1: "Delivery L1",
    DELIVERY2: "Delivery L2",
    CM1: "CM L1",
    CM2: "CM L2",
  };

  public RuleParamterArray = [];

  public RuleTypeParameterArray = [
    {
      label: "Project",
      value: [
        {
          label: "Delivery",
          listName: "deliveryRuleArray",
          Level1: "DeliveryLevel1",
          Level2: "DeliveryLevel2",
          DBParameter: "DeliveryRule",
        },
        {
          label: "CM",
          listName: "csRuleArray",
          Level1: "CMLevel1",
          Level2: "CMLevel2",
          DBParameter: "CSRule",
        },
      ],
    },
    {
      label: "SOW",
      value: [
        {
          label: "Delivery",
          listName: "deliveryRuleArray",
          Level1: "DeliveryLevel1",
          Level2: "DeliveryLevel2",
          DBParameter: "DeliveryRule",
        },
        {
          label: "CM",
          listName: "csRuleArray",
          Level1: "CMLevel1",
          Level2: "CMLevel2",
          DBParameter: "CSRule",
        },
      ],
    },
    {
      label: "CD",
      value: [
        {
          label: "Delivery",
          listName: "deliveryRuleArray",
          Level1: "TL",
          Level2: "ASD",
          DBParameter: "DeliveryRule",
        },

      ],
    },
    {
      label: "PF",
      value: [
        {
          label: "Delivery",
          listName: "deliveryRuleArray",
          Level1: "DeliveryLeads",
          Level2: "DeliveryLeads",
          DBParameter: "DeliveryRule",
        },

      ],
    },
  ];
}
