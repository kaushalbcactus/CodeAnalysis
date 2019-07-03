import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimelineConstantsService {

  constructor() { }
  public common = {
    getProjectContacts: {
      select: 'ID, FullName',
      top: '4500'
    },
    getPO: {
      select: 'ID,Number',
      top: '4500'
    },
    getClientLegalEntity: {
      select: 'Title, ListName',
      top: '4500'
    }
  }
  public financeDashboard = {
    invoice: {
      propertiesRequired: ['Status', 'FileURL', 'PaymentURL', 'InvoiceHtml'],
      getInvoiceLineItems: {
        select: 'ID,Title',
        filter: 'InvoiceLookup eq {{itemID}}',
        top: '4500'
      },
      getInvoiceVersion: {
        select: 'Id,Status,FileUrl,IsCurrentVersion,PaymentURL,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title,InvoiceHtml',
        skip: '{{skipCount}}',
        top: '{{top}}',
        Expand: 'Editor'
      }
    },
    proforma: {
      propertiesRequired: ['Status', 'FileURL', 'ProformaHtml'],
      getInvoiceLineItems: {
        select: 'ID,Title',
        filter: 'ProformaLookup eq {{itemID}}',
        top: '4500'
      },
      getProforma: {
        select: 'ID,Title',
        filter: 'InvoiceLookup eq {{itemID}}',
        top: '1'
      },
      getProformaVersion: {
        select: 'Id,Title,Status,FileUrl,IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title, ClientLegalEntity, ProformaHtml',
        skip: '{{skipCount}}',
        top: '{{top}}'
      }
    },
    invoiceLineItem: {
      propertiesRequired: ['Status', 'PO', 'AddressType', 'MainPOC', 'ScheduledDate', 'Amount'],
      getInvoiceLineItemsVersion: {
        select: 'Id, Title, Status, ScheduledDate, MainPOC, PO, AddressType,Amount,IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title, ClientLegalEntity',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      }
    },
    project: {
      propertiesRequired: ['Status'],
      getProjectVersions: {
        select: 'Id, ProjectCode, Status,IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },

      getProjInfo: {
        select: 'ID,ProjectType',
        filter: "ProjectCode eq '{{projectCode}}'",
        top: '4500'
      },

    },
    projectFinance: {
      propertiesRequired: ['Budget', 'HoursSpent'],
      getProjectFinanceVersions: {
        select: 'Id, Title, Budget, HoursSpent,IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      getProjFinanceInfo: {
        select: 'ID',
        filter: "Title eq '{{projectCode}}'",
        top: '4500'
      }
    }
  }

  public projectManagement = {
    projectInformation: {
      propertiesRequired: ['ProjectType', 'Description', 'ConferenceJournal','SOWCode', 'Authors', 'Comments', 'BusinessVertical', 'PrimaryPOC', 'TA', 'Indication', 'Molecule', 'Priority',
        'Status', 'IsPubSupport', 'SOWBoxLink', 'SOWLink', 'BD', 'CMLevel1', 'CMLevel2', 'DeliveryLevel1', 'DeliveryLevel2', 'WBJID', 'Milestone',
        'ProposedStartDate', 'ProposedEndDate'],
      getVersions: {
        select: 'Id,ProjectType, Description, BusinessVertical, ProjectCode, SOWCode, Comments, ProjectFolder, PrimaryPOC, TA, Indication, Molecule, Priority, Authors,' +
          'Status, IsPubSupport, SOWBoxLink, SOWLink, Title, WBJID, Milestone, ProposedStartDate, ProposedEndDate, ConferenceJournal, BD/LookupId, BD/LookupValue,' +
          'CMLevel1/LookupId, CMLevel1/LookupValue, CMLevel2/LookupId, CMLevel2/LookupValue, DeliveryLevel1/LookupId, DeliveryLevel1/LookupValue,' +
          'DeliveryLevel2/LookupId, DeliveryLevel2/LookupValue,' +
          'IsCurrentVersion,VersionLabel, VersionId, Modified, Editor/LookupId, Editor/LookupValue',
        Expand: 'CMLevel1, CMLevel2, DeliveryLevel1, DeliveryLevel2, Editor, BD',
        skip: '{{skipCount}}',
        top: '{{top}}',
      }, 
      getProjInfo: {
        select: 'ID,ProjectType',
        filter: "ProjectCode eq '{{projectCode}}'",
        top: '4500'
      },
    },
    projectFinanceBreakup: {
      propertiesRequired: ['Amount', 'AmountTax', 'AmountOOP', 'Status', 'TotalScheduled', 'ScheduledRevenue', 'Status'],
      getVersions: {
        select: 'Id, Title, POLookup, Amount, AmountTax, AmountOOP, Status, TotalScheduled, ScheduledRevenue,' +
          'IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title, Status',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      getProjFinanceBreakupInfo: {
        select: 'ID',
        filter: "ProjectNumber eq '{{projectCode}}'",
        top: '4500'
      }
    },
    projectBudgetBreakup: {
      propertiesRequired: ['OriginalBudget', 'NetBudget', 'OOPBudget', 'TaxBudget', 'Status', 'ApprovalDate', 'Currency', 'Reason'],
      getVersions: {
        select: 'Id, Title, OriginalBudget, NetBudget, OOPBudget, TaxBudget, POLookup, ApprovalDate, Status, Currency, Reason, IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title',
        expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      getProjBreakupInfo: {
        select: 'ID',
        filter: "ProjectCode eq '{{projectCode}}'",
        top: '4500'
      }
    },
    invoiceLineItems: {
      getInvoiceLineItems: {
        select: 'ID, InvoiceLookup, ProformaLookup',
        filter: "Title eq '{{projectCode}}'",
        top: '4500'
      },
    },
    projectFinance: {
      propertiesRequired: ['Budget', 'HoursSpent', 'RevenueBudget', 'OOPBudget', 'ScheduledRevenue', 'ScheduledOOP', 'InvoicedRevenue', 'InvoicedOOP','BudgetHrs'],
      getProjectFinanceVersions: {
        select: 'Id, Title, Budget, HoursSpent,RevenueBudget,OOPBudget,ScheduledRevenue,ScheduledOOP,InvoicedRevenue,InvoicedOOP,BudgetHrs,IsCurrentVersion,VersionLabel,VersionId, Modified, Editor/ID, Editor/Title',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      getProjFinanceInfo: {
        select: 'ID',
        filter: "Title eq '{{projectCode}}'",
        top: '4500'
      }
    },
    sow: {
      propertiesRequired: ['Title', 'PrimaryPOC', 'BusinessVertical', 'CreatedDate','ExpiryDate' , 'Status', 'SOWLink', 'CMLevel1', 'CMLevel2', 'DeliveryLevel1', 'DeliveryLevel2', 'BD'],
      getVersions: {
        select: 'Id,Title,PrimaryPOC, ClientLegalEntity, SOWCode, BusinessVertical, CreatedDate,ExpiryDate , Status, SOWLink, BD/LookupId, BD/LookupValue,' +
          'CMLevel1/LookupId, CMLevel1/LookupValue, CMLevel2/LookupId, CMLevel2/LookupValue, DeliveryLevel1/LookupId, DeliveryLevel1/LookupValue,' +
          'DeliveryLevel2/LookupId, DeliveryLevel2/LookupValue,' +
          'IsCurrentVersion,VersionLabel, VersionId, Modified, Editor/LookupId, Editor/LookupValue',
        Expand: 'CMLevel1, CMLevel2, DeliveryLevel1, DeliveryLevel2, Editor, BD',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
    },
    sowBudgetBreakup: {
      propertiesRequired: ['AddendumNetBudget', 'AddendumOOPBudget', 'AddendumTaxBudget', 'NetBudget', 'OOPBudget', 'TaxBudget'],
      getVersions: {
        select: 'Id,AddendumNetBudget, AddendumOOPBudget, AddendumTaxBudget, NetBudget, OOPBudget, TaxBudget,' +
          'IsCurrentVersion,VersionLabel, VersionId, Modified, Editor/LookupId, Editor/LookupValue',
        Expand: 'Editor',
        skip: '{{skipCount}}',
        top: '{{top}}',
      }, 
      getSOWBudgetBreakupInfo: {
        select: 'ID',
        filter: "SOWCode eq '{{SOWCode}}'",
        top: '4500'
      },
    },
  }
}
