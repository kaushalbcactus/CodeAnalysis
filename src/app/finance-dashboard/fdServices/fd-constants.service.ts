import { Injectable } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import { ConstantsService } from '../../Services/constants.service';

@Injectable({
    providedIn: 'root'
})
export class FdConstantsService {

    constructor(
        private constantService: ConstantsService,
        private globalObject: GlobalService
    ) { }

    fdComponent = {
        hideDatesSection: true,
        tabs: {
            topMenu: [],
            expenditureMenu: [],
            scheduleMenu: []
        },
        selectedEditObject: {
            Code: '',
            ID: '',
            Type: '',
            ListName: '',
            HtmlContent: '',
            Header: '',
            Footer: '',
            Content: ''
        },
        selectedComp: null,
        isPSInnerLoaderHidden: false,
        projectInfo: {
            select: "ID,ProjectCode,ProjectType,WBJID,Title,ClientLegalEntity,SOWCode,ProposedEndDate,PrimaryPOC,Status,Milestone,Milestones,BusinessVertical,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail",
            filter: "Status ne 'cancelled' and Status ne 'closed' and Status ne 'Awaiting Cancel Approval'",
            orderby: "ProjectCode",
            top: 4500,
            expand: "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail"
        },
        projectInfoCode: {
            select: "ID,ProjectCode,ProjectType,WBJID,Title,ClientLegalEntity,SOWCode,ProposedEndDate,PrimaryPOC,Status,Milestone,BusinessVertical,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail",
            filter: "ProjectCode eq '{{ProjectCode}}'",
            orderby: "ProjectCode",
            top: 4500,
            expand: "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,CMLevel2/EMail"
        },
        projectPO: {
            select: "ID,Title,NameST,Amount,ClientLegalEntity,Status,POExpiryDate,Currency,AmountRevenue,TotalLinked,RevenueLinked,TotalScheduled,ScheduledRevenue,Number,ScheduledOOP,InvoicedOOP, InvoicedRevenue, AmountOOP, POCLookup, OOPLinked,TotalInvoiced",
            filter: "Status ne 'Archived' and Status ne 'Closed' and POCategory ne 'Client PO Pending'",
            // orderby: 'ProjectCode ',
            top: 4500
        },
        projectContacts: {
            select: "ID,Title,FName,LName,ClientLegalEntity,AddressMT,Designation,FullNameCC,EmailAddress,Phone",
            // filter: "Status ne 'Closed' and Status ne 'Cancelled' and Status ne 'In Discussion' and Status ne 'Pending Closure' and Status ne 'Awaiting cancel approval' ",
            top: 4500
        },
        clientLegalEntity: {
            select: "ID,Title,Acronym,ProformaCounter,InvoiceCounter,TimeZoneNM,APEmail,APAddress,InvoiceName,ListName, CMLevel1/ID, CMLevel2/ID, Currency",
            filter: "IsActiveCH eq 'Yes'",
            orderby: "Title",
            top: 4500,
            expand: "CMLevel1, CMLevel2"
        },
        usStates: {
            select: 'ID,Title',
            // filter: '',
            orderby: 'Title',
            top: '5000'
        },
        currency: {
            select: "ID,Title",
            filter: "IsActiveCH eq 'Yes'",
            top: 4500,
            orderby: "Title"
        },
        resourceCategorization: {
            select: "ID,UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title",
            filter: "IsActiveCH eq 'Yes'",
            orderby: "Title",
            top: "5000",
            expand: "UserNamePG"
        },
        billingEntity: {
            select: "Title, Acronym, InvoiceTemplate",
            filter: "IsActiveCH eq 'Yes'",
            top: "7"
        },
        budgetRate: {
            select: "Title, ConversionRate,Symbol",
            top: "30"
        },
        userGroup: {
            select: "Title"
        },
        sowList: {
            select: "ID,SOWCode,Title,ClientLegalEntity,Currency,BillingEntity,TotalLinked,OOPLinked,InvoicedOOP,TotalInvoiced,TotalScheduled,ScheduledOOP",
            filter: "Status ne 'CLosed' or Status ne 'Cancelled' ",
            top: 4500
        },
        sow: {
            select: "OOPBudget, ScheduledOOP, InvoicedOOP",
            filter: "SOWCode eq  {{SOWCode}}",
            top: 1
        },
        spendingInfo: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq '{{Status}}' ",
            expand: "Editor,Author",
            top: 4500,
            orderby: "{{Status}} desc"
        },
        spendingInfoCS: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq '{{Status}}' and CSId eq {{UserID}}",
            expand: "Editor,Author",
            top: 4500,
            orderby: "{{Status}} desc"
        },
        spendingInfoForNonBillable: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Title,Editor/Id, Editor/Title",
            filter: "(Status eq 'Approved Payment Pending' or Status eq 'Approved') and CategoryST eq 'Non Billable' and DateSpend ge '{{StartDate}}' and DateSpend le '{{EndDate}}'",
            expand: "Editor,Author",
            top: 4500,
            // orderby: "Non Billable desc"
        },
        spendingInfoForNonBillableCS: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "(Status eq 'Approved Payment Pending' or Status eq 'Approved') and CategoryST eq 'Non Billable'  and CSId eq {{UserID}} and DateSpend ge '{{StartDate}}' and DateSpend le '{{EndDate}}'",
            expand: "Editor,Author",
            top: 4500,
            // orderby: "Non Billable desc"
        },

        spendingInfoForBillable: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title,CSId,CategoryST,Currency,NotesMT,SpendType",
            filter: "CategoryST eq 'Billable' and (Status eq 'Approved Payment Pending' or Status eq 'Approved' or Status eq 'Billed Payment Pending' or (Status eq 'Billed' and DateSpend ge '{{StartDate}}' and DateSpend le '{{EndDate}}'))",
            expand: "Editor,Author",
            top: 4500,
            // orderby: "{{Category}} desc"
        },
        spendingInfoForBillableCS: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title,CSId,CategoryST,Currency,NotesMT,SpendType",
            filter: "CategoryST eq 'Billable' and CSId eq {{UserID}} and (Status eq 'Approved Payment Pending' or Status eq 'Approved' or Status eq 'Billed Payment Pending' or (Status eq 'Billed' and DateSpend ge '{{StartDate}}' and DateSpend le '{{EndDate}}'))",
            expand: "Editor,Author",
            top: 4500,
            // orderby: "{{Category}} desc"
        },

        spendingInfoForRC: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "(Status eq 'Rejected' or Status eq 'Cancelled') and Modified ge '{{StartDate}}' and Modified le '{{EndDate}}' ",
            expand: "Editor,Author",
            top: 4500
        },
        spendingInfoForRCCS: {
            select: "ID,Title,Number,Header,DateSpend,SpendType,PaymentMode,Currency,Amount,ClientCurrency,ClientAmount,DollarAmount,Status,FileURL,NotesMT,InvoiceID,CategoryST,Modified,POLookup,ApproverComments,ApproverFileUrl,Created,PayingEntity,VendorFreelancer,RequestType,ClientApprovalFileURL,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "(Status eq 'Rejected' or Status eq 'Cancelled') and Modified ge '{{StartDate}}' and Modified le '{{EndDate}}'  and CSId eq {{UserID}} ",
            expand: "Editor,Author",
            top: 4500
        },
        // Schedule Deliverable
        invoicesDel: {
            // select: "ID,Title,SOWCode,ScheduledDate,Amount,Currency,MainPOC,AddressType,PO,Status,Template,ScheduleType,SOWCode,CS/ID,CS/Title",
            select: "ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Scheduled' and ScheduleType eq 'revenue' and (ScheduledDate ge '{{StartDate}}' and ScheduledDate le '{{EndDate}}') ",
            top: 4500,
            orderby: "ScheduledDate asc",
            expand: "CS/ID,CS/Title,Editor,Author"
        },
        // Schedule Deliverable
        invoicesDelCS: {
            // select: "ID,Title,SOWCode,ScheduledDate,Amount,Currency,MainPOC,AddressType,PO,Status,Template,ScheduleType,SOWCode,CS/ID,CS/Title",
            select: "ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Scheduled' and ScheduleType eq 'revenue' and (ScheduledDate ge '{{StartDate}}' and ScheduledDate le '{{EndDate}}') and CSId eq {{UserID}}",
            top: 4500,
            orderby: "ScheduledDate asc",
            expand: "CS/ID,CS/Title,Editor,Author"
        },
        // Schedule OOP Invoices
        invoicesOOP: {
            select: "ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Scheduled' and ScheduleType eq 'oop' and (ScheduledDate ge '{{StartDate}}' and ScheduledDate le '{{EndDate}}')  ",
            top: 4500,
            orderby: "ScheduledDate asc",
            expand: "CS/ID,CS/Title,Editor,Author"
        },
        // Schedule OOP Invoices
        invoicesOOPCS: {
            select: "ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Scheduled' and ScheduleType eq 'oop' and (ScheduledDate ge '{{StartDate}}' and ScheduledDate le '{{EndDate}}') and CSId eq {{UserID}}",
            top: 4500,
            orderby: "ScheduledDate asc",
            expand: "CS/ID,CS/Title,Editor,Author"
        },
        // hourly based
        projectFinances: {
            // select: "ID,Title,BudgetHrs,Budget,HoursSpent,Currency,Template,ApprovedBudget,ScheduledOOP,ScheduledRevenue,TotalScheduled,InvoicedRevenue,InvoicedOOP,TotalInvoiced,InvoicesScheduled, Invoiced",
            select: "ID,Modified,Title,Currency,ApprovedBudget,Budget,RevenueBudget,OOPBudget,TaxBudget,InvoicesScheduled,ScheduledRevenue,ScheduledOOP,Invoiced,InvoicedRevenue,InvoicedOOP,InvoicedTax,HoursSpent,BillableExpenses,NonBillableExpenses,Realization,BudgetHrs,Template",
            filter: "Title eq '{{ProjectCode}}'",
            // orderby: "Title",
            // expand: "Editor,Author",
            top: 1
        },
        projectFinanceBreakupFromPO: {
            select: "ID,Title,AmountOOP, Amount, POLookup,ProjectNumber,ScheduledOOP,ScheduledRevenue,TotalScheduled,InvoicedRevenue,InvoicedOOP,TotalInvoiced,AuthorId,EditorId",
            filter: "ProjectNumber eq '{{ProjectCode}}' and POLookup eq '{{PO}}' and Status ne 'Deleted' ",
            top: 1
        },

        sowForIG: {
            select: "ID, SOWCode,ScheduledOOP, ScheduledRevenue, TotalScheduled, TotalInvoiced, InvoicedOOP, InvoicedRevenue,AuthorId,EditorId",
            filter: "SOWCode eq  '{{SOWCode}}' ",
            top: 1
        },

        // ,TotalBudget,NetBudget,TotalLinked,TotalInvoiced,TotalScheduled,ScheduledRevenue,RevenueLinked

        projectBudgetBreakup: {
            select: "ID, ProjectLookup, BudgetHours,AuthorId,EditorId,OriginalBudget,OOPBudget,NetBudget",
            filter: "ProjectCode eq '{{ProjectCode}}' ",
            // top: 1
        },

        projectFinanceBreakup: {
            select: "ID,POLookup,ProjectNumber,AuthorId,EditorId,Amount,AmountRevenue,TotalScheduled,ScheduledRevenue,InvoicedRevenue,TotalInvoiced",
            filter: "ProjectNumber eq '{{ProjectCode}}' and Status ne 'Deleted' ",
            // top: 1
        },

        projectFinanceBreakupForPO: {
            select: "ID,POLookup,ProjectNumber,AuthorId,EditorId",
            filter: "ProjectNumber eq '{{ProjectCode}}' and Status ne 'Deleted' ",
            top: 1
        },

        sowByProjectCode: {
            select: "ID,Title,ClientLegalEntity,Currency,TotalBudget,NetBudget,OOPBudget,TaxBudget,Status,PrimaryPOC,TotalLinked,TotalScheduled,ScheduledRevenue,TotalInvoiced,RevenueLinked,InvoicedRevenue,AuthorId,EditorId",
            filter: "SOWCode eq '{{SOWCode}}' and Status ne 'Deleted'",
            top: 1
        },

        // Confirmed
        invoiceLineItems: {
            // select: "ID,Title,SOWCode,ScheduledDate,Amount,Currency,MainPOC,AddressType,PO,Status,Template,ScheduleType,SOWCode,CS/ID,CS/Title&$Expand=CS/ID,CS/Title",
            select: "ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Confirmed' ",
            orderby: "ScheduledDate asc",
            top: 4500,
            expand: "CS/ID,CS/Title,Editor,Author"
        },

        // Proforma
        proformaForMangerIT: {
            // select: "ID,Title,ProformaDate,ProformaHtml,ProformaType,ClientLegalEntity,Amount,Currency,MainPOC,AddressType,LineItems/Id,LineItems/Title,PO,Status,FileURL,Template,AdditionalInfo",
            select: "Title,ClientLegalEntity,ProformaType,ProformaDate,Amount,Currency,PO,Status,MainPOC,AdditionalInfo,ProformaTitle,AddressType,Template,InvoiceLookup,FileURL,Reason,State,Modified,ID,ProformaHtml,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "Status eq 'Created' or Status eq 'Sent' ",
            orderby: "ProformaDate",
            expand: "Editor,Author",
            top: 4500
        },

        // Proforma
        proformaForUser: {
            // select: "ID,Title,ProformaDate,ProformaHtml,ProformaType,ClientLegalEntity,Amount,Currency,MainPOC,AddressType,LineItems/Id,LineItems/Title,PO,Status,FileURL,Template,AdditionalInfo",
            select: "Title,ClientLegalEntity,ProformaType,ProformaDate,Amount,Currency,PO,Status,MainPOC,AdditionalInfo,ProformaTitle,AddressType,Template,InvoiceLookup,FileURL,Reason,State,Modified,ID,ProformaHtml,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "ID eq '{{ItemID}}'",
            orderby: "ProformaDate",
            expand: "Editor,Author",
            top: 4500
        },
        proformaForNonManger: {
            select: "ID,Title,ProformaDate,ProformaType,ClientLegalEntity,Amount,Currency,MainPOC,AddressType,PO,Status,FileURL",
            filter: "ID lt 0",
            // orderby: "ProformaDate",
            // expand: "LineItems",
            top: 4500
        },

        // Outstanding Invoices
        invoicesForMangerIT: {
            // select: "ID,ClientLegalEntity,Title,InvoiceNumber,InvoiceDate,Amount,Currency,MainPOC,AddressType,PO,Status,FileURL,Template,ProformaLookup,InvoiceType",
            select: "ID,ClientLegalEntity,InvoiceNumber,InvoiceDate,Amount,PaymentURL,FileURL,Currency,PO,Status,MainPOC,InvoiceTitle,AddressType,Template,ProformaLookup,DisputeReason,DisputeComments,Reason,State,AdditionalInfo,InvoiceType,TaggedAmount,IsTaggedFully,Modified,Title,Created,InvoiceHtml,Editor/Id, Editor/Title,AuxiliaryInvoiceName",
            filter: "Status eq '" + this.constantService.invoicesStatus.AwaitingClosedCreditNote + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.AwaitingClosedDebitNote + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.AwaitingWriteOff + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.Dispute + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.Generated + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.SentForConfirmation + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.SentForPayment + "' or " +
                "Status eq '" + this.constantService.invoicesStatus.SentToAP + "'",
            orderby: "InvoiceDate",
            expand: "Editor",
            top: 4500
        },
        invoicesForNonManger: {
            select: "ID,Title,InvoiceNumber,InvoiceDate,Amount,Currency,MainPOC,AddressType,PO,Status,FileURL,Editor/Id,Editor/Title",
            filter: "ID lt 0",
            // orderby: "ProformaDate",
            expand: "Editor",
            top: 4500
        },

        // Paid Invoices
        paidInvoices: {
            // select: "ID,ClientLegalEntity,InvoiceNumber,InvoiceDate,FiscalYear, FileURL,InvoiceTitle,Amount,Currency,MainPOC,AddressType,PO,Status,ProformaLookup,State, InvoiceType, Title",
            select: "ID,ClientLegalEntity,InvoiceNumber,InvoiceDate,Amount,PaymentURL,FileURL,Currency,PO,Status,MainPOC,InvoiceTitle,AddressType,Template,ProformaLookup,DisputeReason,DisputeComments,Reason,State,AdditionalInfo,InvoiceType,TaggedAmount,IsTaggedFully,Modified,Title,Created,Editor/Id,Editor/Title,AuxiliaryInvoiceName",
            filter: "InvoiceDate ge '{{StartDate}}' and InvoiceDate le '{{EndDate}}' and Status eq 'Paid'",
            // orderby: "ProformaDate",
            expand: "Editor",
            top: 4500
        },

        // Invoice Line Item
        invoiceLineItem: {
            select: "ID,Title,Status,ScheduledDate,Amount,Currency,PO,MainPOC,ScheduleType,InvoiceLookup,Expenses,AddressType,Template,SOWCode,ProformaLookup",
            filter: "ProformaLookup eq '{{ProformaLookup}}' ",
            top: 4500
        },

        invoiceLineItemProforma:{
            select:"ID,Title,TaggedDate,ScheduledDate,Amount,Currency,PO,Status,ProformaLookup,ScheduleType,InvoiceLookup,MainPOC,AddressType,Template,SOWCode,Modified,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "ProformaLookup eq '{{ProformaLookup}}' ",
            top: 4500,
            expand: "CS/ID,CS/Title,Editor,Author"
        },

        invoiceLineItemByInvoice: {
            select: "ID,Title,Status,ScheduledDate,Amount,Currency,PO,MainPOC,ScheduleType,InvoiceLookup,Expenses,AddressType,Template,SOWCode,ProformaLookup,Modified,CS,CS/ID,CS/Title,Author/Id,Author/Title,Author/EMail,Editor/Id, Editor/Title",
            filter: "InvoiceLookup eq '{{InvoiceLookup}}' ",
            top: 4500,
            expand: "CS/ID,CS/Title,Editor,Author"

        },

        // Mail Content
        mailContent: {
            select: "ID,Title,ContentMT",
            filter: "Title eq '{{MailType}}' ",
            top: 1
        },

        ADV_INVOICES: {
            select: 'ID, ClientLegalEntity, Amount, AddressType, InvoiceNumber, PO, ProformaLookup, IsTaggedFully, TaggedAmount,AuxiliaryInvoiceName,'
                + ' InvoiceDate, MainPOC, FileURL',
            filter: 'ClientLegalEntity eq \'{{clientLegalEntity}}\' and InvoiceType eq \'{{invoiceType}}\' and IsTaggedFully eq \'No\'',
            top: 4500
        },

        invoiceLineItemByProject: {
            select: "ID,Title,Status,Amount,PO,MainPOC,ScheduleType,InvoiceLookup,ProformaLookup",
            filter: "Title eq '{{ProjectCode}}' ",
            top: 4500
        },

        invoiceData: {
            select: 'ID, ClientLegalEntity, Amount, AddressType, InvoiceNumber, PO, ProformaLookup, IsTaggedFully, TaggedAmount,AuxiliaryInvoiceName,'
            + ' InvoiceDate, MainPOC, FileURL',
            filter: 'ClientLegalEntity eq \'{{clientLegalEntity}}\' and InvoiceType eq \'{{invoiceType}}\' and IsTaggedFully eq \'Yes\'',
            top: 4500
        },

        invoiceLineItemsByClient: {
            select: "ID,Title,Status,Amount,PO,MainPOC,ScheduleType,InvoiceLookup,ProformaLookup",
            filter: "Title eq '{{ProjectCode}}'  and ScheduleType eq \'{{ScheduleType}}\'",
            top: 4500
        },

        GET_PO_BY_ID: {
            lect: "ID,Title,NameST,Amount,ClientLegalEntity,Status,POExpiryDate,Currency,AmountRevenue,TotalLinked,RevenueLinked,TotalScheduled,ScheduledRevenue,Number,ScheduledOOP,InvoicedOOP, InvoicedRevenue, AmountOOP, POCLookup, OOPLinked,TotalInvoiced",
            filter: "Status eq 'Active' and ID eq {{ItemID}}",
            top: 4500,
          },


              // Add Update
        addUpdateProjectInformation: {
            // createProject: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.projectInfo.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectInformation.name + "')/items({{Id}})",
        },
        addUpdatePO: {
            // createProject: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.projectInfo.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.PO.name + "')/items({{Id}})",
        },
        addUpdateInvoiceLineItem: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.InvoiceLineItems.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.InvoiceLineItems.name + "')/items({{Id}})",
        },
        addUpdateProjectFinances: {
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectFinances.name + "')/items({{Id}})",
        },
        addUpdateProjectFinanceBreakup: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectFinanceBreakup.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectFinanceBreakup.name + "')/items({{Id}})",
        },
        addUpdateProjectBudgetBreakup: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectBudgetBreakup.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ProjectBudgetBreakup.name + "')/items({{Id}})",
        },
        addUpdateSow: {
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.SOW.name + "')/items({{Id}})",
        },
        addUpdateProforma: {
            createProforma: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.Proforma.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.Proforma.name + "')/items({{Id}})",
        },
        addUpdateInvoice: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.Invoices.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.Invoices.name + "')/items({{Id}})",
        },
        addUpdateCreditDebit: {
            createCD: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.CreditAndDebit.name + "')/items",
        },
        addUpdateFreelancer: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.VendorFreelancer.name + "')/items",
        },
        addUpdateSpendingInfo: {
            create: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.SpendingInfo.name + "')/items",
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.SpendingInfo.name + "')/items({{Id}})",
        },
        addUpdateClientLegalEntity: {
            update: this.globalObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constantService.listNames.ClientLegalEntity.name + "')/items({{Id}})",
        },
        ProformaTemplates: [
            { label: 'US', value: 'US' },
            { label: 'Japan', value: 'Japan' },
            { label: 'India', value: 'India' },
            { label: 'Korea', value: 'Korea' },
            { label: 'China', value: 'China' },
            { label: 'ROW', value: 'ROW' }
        ],

        addressTypes: [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]

    }
}
