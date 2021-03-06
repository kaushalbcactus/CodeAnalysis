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
    DateOfJoining: '',
    GoLiveDate: '',
    Designation: '',
    InCapacity: '',
    Pooled: '',
    MaxHrs: 0,
    BucketEffectiveDate: new Date(),
    MaxHrsEffectiveDate: new Date(),
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
    TAVisibility: '',
    CAVisibility: '',
    IsFTE: '',
    FTEEffectiveDate: new Date(),
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
    LastModifiedBy: '',
    Manager: '',
    IsActive: 'Yes',
    DisplayText: '',
    DateofExit: new Date(),
    WorkingFriday: false,
    WorkingMonday: false,
    WorkingSaturday: false,
    WorkingSunday: false,
    WorkingThursday: false,
    WorkingTuesday: false,
    WorkingWednesday: false,
    PlaceholderUser: ''
  };
  public isMainLoaderHidden = true;
  public resourceCatArray = [];
  public groupArray = [];
  public sowObj = {
    CMLevel1: [],
    CMLevel2: '',
    AllResources: [],
    DeliveryLevel1: [],
    DeliveryLevel2: '',
    ID: 0,
    Title: '',
    IsTypeChangedDisabled: false,
    ClientLegalEntity: '',
    AccessType: '',
    SOWCode: '',
    IsCheckBoxChecked: false,
    CurrentAccess: ''
  };
  public projObj = {
    CMLevel1: [],
    CMLevel2: '',
    AllOperationresources: [],
    DeliveryLevel1: [],
    DeliveryLevel2: '',
    ID: 0,
    Title: '',
    IsTypeChangedDisabled: false,
    ClientLegalEntity: '',
    AccessType: '',
    ProjectCode: '',
    SOWCode: '',
    WBJID: '',
    CurrentAccess: ''
  };
  public bucketObj = {
    ID: 0,
    Bucket: '',
    Client: '',
    PatClients: '',
    RowClientsArray: [],
    ClientsArray: [],
    LastUpdated: new Date(),
    LastModifiedBy: '',
    LastUpdatedFormat: '',
  };
  public bucketClientObj = {
    ID: '',
    Title: '',
    Bucket: '',
    EffectiveDate: new Date()
  };
  public projectTypeObj = {
    ID: 0,
    ProjectType: '',
    LastUpdated: new Date(),
    LastModifiededBy: '',
    LastUpdatedFormat: '',
  };
  public deliverableTypeObj = {
    ID: 0,
    DeliverableType: '',
    Acronym: '',
    LastUpdated: new Date(),
    LastModifiedBy: '',
    LastUpdatedFormat: '',
  };
  public taObj = {
    ID: 0,
    TherapeuticArea: '',
    LastUpdated: new Date(),
    LastModifiedBy: '',
    LastUpdatedFormat: '',
  };
  public practiveAreaObj = {
    ID: 0,
    PracticeArea: '',
    LastUpdated: new Date(),
    LastModifiedBy: '',
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
    DeliveryLevel2: ''
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
    poDocLink:null,
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
    BalancedRevenue: 0,
    BalancedOOP:0,
    CMLevel2: '',
  };

  public clientMasterDataColArray = {
    ClientLegalEntity: [],
    BillingEntity: [],
    Bucket: [],
    Acronym: [],
    Market: [],
    InvoiceName: [],
    LastUpdated: [],
    LastModifiedBy: []
  };

  public auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  public auditHistorySelectedArray = {
    ClientLegalEntry: [],
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  public subDivisionDetailsColArray = {
    SubDivision: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  public POCColArray = {
    FName: [],
    LName: [],
    EmailAddress: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  public POColArray = {
    PoName: [],
    PoNumber: [],
    AmountRevenue: [],
    AmountOOP: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  public resultResponse = {
    ClientGroupArray: [],
    MarketArray: [],
    TimeZonesArray: [],
    BillingEntityArray: [],
    ResourceCatArray: [],
    CurrencyArray: [],
    BucketArray: [],
    ClientLegalEntityArray: []
  };
  public dropdown = {
    ClientGroupArray: [],
    MarketArray: [],
    TimeZonesArray: [],
    BillingEntityArray: [],
    CMLevel1Array: [],
    CMLevel2Array: [],
    DeliveryLevel1Array: [],
    DeliveryLevel2Array: [],
    CurrencyArray: [],
    BucketArray: [],
    PORequiredArray: [],
    POCRefferalSourceArray: [],
    POCRelationshipArray: [],
    POCProjectContactTypesArray: [],
    POPointOfContactArray: [],
    POTAArray: [],
    POMoleculeArray: [],
    POBuyingEntityArray: []
  };
  public po = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    isRightVisible: false
  };
  public oldBudget = {
    Amount: 0,
    AmountRevenue: 0,
    AmountTax: 0,
    AmountOOP: 0,
    LastUpdated: new Date()
  };
  public newBudget = {
    Amount: 0,
    AmountRevenue: 0,
    AmountTax: 0,
    AmountOOP: 0
  };
  public finalBudget = {
    Amount: 0,
    AmountRevenue: 0,
    AmountTax: 0,
    AmountOOP: 0
  };

}
