import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminObjectService {

  constructor() { }
  public addUser = {
    UserNameEmail: '',
    UserId: 0,
    ManagerEmail: '',
    ManagerId: '',
    Bucket: '',
    PracticeArea: '',
    TimeZone: '',
    DateOfJoining: new Date(),
    GoLiveDate: new Date(),
    Designation: '',
    InCapacity: '',
    Pooled: '',
    MaxHrs: 0,
    PrimarySkill: '',
    SkillLevel: '',
    Role: '',
    ReadyTo: '',
    Task: [],
    TaskText: '',
    Account: [],
    AccountText: '',
    Deliverable: [],
    DeliverableText: '',
    DeliverableExclusion: [],
    DeliverableExclusionText: '',
    TA: [],
    TAText: '',
    TAExclusion: [],
    TAExclusionText: '',
    PracticeAreaEffectiveDate: new Date(),
    TimeZoneEffectiveDate: new Date(),
    ManagerEffectiveDate: new Date(),
    PrimarySkillEffectiveDate: new Date(),
    SkillLevelEffectiveDate: new Date(),
    IsAddUser: true,
    ID: 0,
    Title: '',
    User: '',
    LastUpdated: new Date(),
    LastUpdatedFormat: '',
    LastUpdatedBy: '',
    Manager: '',
    IsActive: 'Yes',
    DisplayText: '',
    DateofExit: new Date()
  };
  public isMainLoaderHidden = true;
  public resourceCatArray = [];
  public groupArray = [];
  public sowObj = {
    CMLevel1: [],
    CMLevel2: '',
    DeliveryLevel1: [],
    DeliveryLevel2: '',
    ID: 0,
    Title: '',
    IsTypeChangedDisabled: false,
    ClientLegalEntity: '',
    AccessType: '',
    SOWCode: '',
    IsCheckBoxChecked: false
  };
  public projObj = {
    CMLevel1: [],
    CMLevel2: '',
    DeliveryLevel1: [],
    DeliveryLevel2: '',
    ID: 0,
    Title: '',
    IsTypeChangedDisabled: false,
    ClientLegalEntity: '',
    AccessType: '',
    ProjectCode: '',
    SOWCode: '',
    WBJID: ''
  };
  public bucketObj = {
    ID: 0,
    Bucket: '',
    Client: '',
    PatClients: '',
    RowClientsArray: [],
    ClientsArray: [],
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
  };
  public projectTypeObj = {
    ID: 0,
    ProjectType: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
  };
  public deliverableTypeObj = {
    ID: 0,
    DeliverableType: '',
    Acronym: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
  };
  public taObj = {
    ID: 0,
    TherapeuticArea: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
  };
  public practiveAreaObj = {
    ID: 0,
    PracticeArea: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
  };
  public clientObj = {
    ID: 0,
    ClientLegalEntity: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
    Acronym: '',
    Geography: '',
    ListName: '',
    Market: '',
    ClientGroup: '',
    InvoiceName: '',
    Currency: '',
    APAddress: '',
    APEmail: '',
    Template: '',
    DistributionList: '',
    Realization: '',
    TimeZone: '',
    Notes: '',
    PORequired: '',
    BillingEntity: '',
    Bucket: '',
    IsCentrallyAllocated: '',
    IsActive: '',
    CMLevel1: [],
    CMLevel2: '',
    DeliveryLevel1: [],
    DeliveryLevel2: '',
  };
  public subDivisionObj = {
    ID: 0,
    SubDivision: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
    ClientLegalEntity: '',
    CMLevel1: [],
    DeliveryLevel1: [],
    DistributionList: '',
    IsActive: ''
  };
  public pocObj = {
    ID: 0,
    Title: '',
    FName: '',
    LName: '',
    EmailAddress: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
    ClientLegalEntity: '',
    Designation: '',
    Phone: '',
    Address: '',
    FullName: '',
    Department: '',
    ReferralSource: '',
    Status: '',
    RelationshipStrength: '',
    EngagementPlan: '',
    Comments: '',
    ProjectContactsType: ''
  };
  public poObj = {
    ID: 0,
    Title: '',
    Amount: 0,
    AmountOOP: 0,
    AmountRevenue: 0,
    AmountTax: 0,
    BillOOPFromRevenue: '',
    BuyingEntity: '',
    ClientLegalEntity: '',
    Currency: '',
    InvoicedOOP: 0,
    InvoicedRevenue: 0,
    InvoicedTax: 0,
    Link: '',
    LastUpdated: new Date(),
    LastUpdatedBy: '',
    LastUpdatedFormat: '',
    Molecule: '',
    PoName: '',
    PoNumber: '',
    OOPLinked: 0,
    PO_x0020_Geography: '',
    POCategory: '',
    POCLookup: 0,
    POExpiryDate: new Date(),
    PoProposalID: '',
    RevenueLinked: 0,
    ScheduledOOP: 0,
    ScheduledRevenue: 0,
    SOWLookup: 0,
    Status: '',
    TA: '',
    TaxLinked: 0,
    TotalInvoiced: 0,
    TotalLinked: 0,
    TotalScheduled: 0,
    CMLevel2: '',
  };
}
