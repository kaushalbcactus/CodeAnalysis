import { Injectable } from "@angular/core";
import { MenuItem } from "primeng/api";
import { GlobalService } from "src/app/Services/global.service";

@Injectable({
  providedIn: "root",
})
export class PMObjectService {
  constructor(private globalObject: GlobalService) {}
  public tabMenuItems: any = [];
 
  
  public totalRecords = {
    SendToClient: 0,
    ClientReview: 0,
    PendingAllocation: 0,
    InactiveProject: 0,
    AllProject: 0,
    AllSOW: 0,
    SelectSOW: 0,
    activeProject: 0,
    pipelineProject: 0,
    inActiveProject: 0,
  };
  public loading = {
    SendToClient: false,
    ClientReview: false,
    PendingAllocation: false,
    InactiveProject: false,
    AllProject: false,
    AllSOW: false,
    SelectSOW: false,
    activeProject: false,
    pipelineProject: false,
    inActiveProject: false,
  };
  public allProjects = {
    activeProjectArray: [],
    activeProjectCopyArray: [],
    pipelineProjectArray: [],
    pipelineProjectCopyArray: [],
    inActiveProjectArray: [],
    inActiveProjectCopyArray: [],
  };
  public yearRange: any = "";
  public sendToClientArray: any = [];
  // tslint:disable-next-line:variable-name
  public sendToClientArray_copy: any = [];
  public clientReviewArray: any = [];
  // tslint:disable-next-line:variable-name
  public clientReviewArray_copy: any = [];
  public pendingAllocationArray: any = [];
  // tslint:disable-next-line:variable-name
  public pendingAllocationArray_copy: any = [];
  public inActiveProjectArray: any = [];
  // tslint:disable-next-line:variable-name
  public inActiveProjectArray_copy: any = [];
  public allProjectsArray: any = [];
  public allProjectsArrayCopy: any = [];
  public allProjectItems: any = [];
  public allSOWArray: any = [];
  public allSOWArrayCopy: any = [];
  public allSOWItems: any = [];
  public selectSOWArray: any = [];
  public selectSOWArrayCopy: any = [];
  public projectContactsItems = [];
  public projectInformationItems = [];
  public resourceCatItems = [];
  public countObj = {
    scCount: 0,
    crCount: 0,
    paCount: 0,
    iapCount: 0,
    allProjectCount: 0,
    allSOWCount: 0,
  };
  public sendToClient = {
    ProjectCode: "",
    ClientLegalEntity: "",
    POC: "",
    DeliverableType: "",
    DueDate: new Date(),
    Milestone: "",
    PreviousTaskUser: "",
    PreviousTaskStatus: "",
    isBlueIndicator: false,
    isRedIndicator: false,
    isGreenIndicator: false,
    ID: 0,
  };

  public clientReviewObj = {
    ProjectCode: "",
    ClientLegalEntity: "",
    POC: "",
    DeliverableType: "",
    DueDate: new Date(),
    Milestone: "",
    DeliveryDate: new Date(),
    isBlueIndicator: false,
    isRedIndicator: false,
    isGreenIndicator: false,
    ID: 0,
  };
  public paObj = {
    ID: 0,
    ProjectCode: "",
    WBJID: "",
    ClientLegalEntity: "",
    POC: "",
    DeliverableType: "",
    TA: "",
    Molecule: "",
    PrimaryResource: "",
    PrimaryResourceText: "",
    Milestone: "",
    Status: "",
  };
  public allProject = {
    SLA: "",
    SOWCode: "",
    ProjectCode: "",
    ShortTitle: "",
    ClientLegalEntity: "",
    DeliverableType: "",
    SubDeliverable: "",
    ProjectType: "",
    Status: "",
    CreatedBy: "",
    CreatedDate: "",
    isBlueIndicator: false,
    isRedIndicator: false,
    isGreenIndicator: false,
    ID: 0,
    PrimaryPOC: 0,
    PrimaryPOCText: "",
    ProjectFolder: "",
    AuthorId: 0,
    AuthorTitle: "",
    SubDivision: "",
    TA: "",
    ProposedStartDate: null,
    ProposedEndDate: null,
    ActualStartDate: null,
    ActualEndDate: null,
    Description: "",
    ConferenceJournal: "",
    Comments: "",
    PO: "",
    Milestone: "",
    Molecule: "",
    Indication: "",
    IsPubSupport: "",
    SOWBoxLink: "",
    StandardBudgetHrs: 0,
    CMLevel1ID: [],
    CMLevel1Title: [],
    CMLevel2ID: 0,
    CMLevel2Title: "",
    DeliveryLevel1ID: [],
    DeliveryLevel1Title: [],
    DeliveryLevel2ID: 0,
    DeliveryLevel2Title: "",
    BusinessVertical: "",
    BillingEntity: "",
    SOWLink: "",
    PubSupportStatus: "",
    IsStandard: "",
    StandardService: "",
    Priority: "",
    Authors: "",
    Title: "",
    AdditionalPOC: [],
    AdditionalPOCText: "",
  };
  public allSOW = {
    SOWCode: "",
    ShortTitle: "",
    ClientLegalEntity: "",
    POC: "",
    CreatedBy: "",
    CreatedDate: "",
    ID: 0,
  };
  public selectSOW = {
    SOWCode: "",
    ShortTitle: "",
    SOWOwner: "",
    ID: 0,
    TotalBudget: 0,
    NetBudget: 0,
    OOPBudget: 0,
    TaxBudget: 0,
    TotalLinked: 0,
    RevenueLinked: 0,
    OOPLinked: 0,
    TaxLinked: 0,
    TotalScheduled: 0,
    ScheduledRevenue: 0,
    TotalInvoiced: 0,
    InvoicedRevenue: 0,
    ClientLegalEntity: "",
  };
  public userRights = {
    isMangers: false,
    isHaveProjectFullAccess: false,
    isHaveSOWFullAccess: false,
    isHaveSOWBudgetManager: false,
    isInvoiceTeam: false,
  };
  public isMainLoaderHidden = true;
  public activeIndex = 0;
  public isStandardChecked = true;
  public addProject = {
    SOWSelect: {
      GlobalFilterValue: "",
      GlobalFilterEvent: "",
      SOWCode: "",
      SOWSelectedItem: {},
      sowTotalBalance: 0,
      sowNetBalance: 0,
    },
    ProjectAttributes: {
      ID: 0,
      ClientLegalEntity: "",
      SubDivision: "",
      BillingEntity: "",
      BilledBy: "",
      BusinessVertical:'',
      Currency:'',
      PracticeArea: "",
      Priority: "",
      ProjectCode: "",
      ProjectStatus: "",
      PointOfContact1: "",
      PointOfContact1Text: "",
      PointOfContact2: [],
      PointOfContact2Text: "",
      Milestone: "",
      Molecule: "",
      TherapeuticArea: "",
      Indication: "",
      PUBSupportRequired: false,
      PUBSupportStatus: "",
      ActiveCM1: [],
      ActiveCM1Text: "",
      ActiveCM2: "",
      ActiveCM2Text: "",
      ActiveDelivery1: [],
      ActiveDelivery1Text: "",
      ActiveDelivery2: "",
      ActiveDelivery2Text: "",
      ProjectTitle: "",
      AlternateShortTitle: "",
      EndUseofDeliverable: "",
      SOWBoxLink: "",
      ConferenceJournal: "",
      Authors: "",
      Comments: "",
      AnnotationBinder: false,
      SlideCount: 0,
      PageCount: 0,
      ReferenceCount: 0,
      CSRule : '',
      DeliveryRule:''

    },
    Timeline: {
      Standard: {
        IsStandard: false,
        Service: {},
        Resource: {},
        Reviewer: {},
        ProposedStartDate: null,
        ProposedEndDate: null,
        StandardProjectBugetHours: 0,
        StandardBudgetHrs: 0,
        OverallTat: 0,
        IsRegisterButtonClicked: false,
        standardArray: [],
        DeliverableType: "",
        SubDeliverable: "",
        Milestones: [],
        ServiceLevel: "",
        MilestonesArray: [],
        TaskArray: [],
      },
      NonStandard: {
        IsStandard: false,
        DeliverableType: "",
        SubDeliverable: "",
        Service: "",
        ResourceName: {},
        ProposedStartDate: null,
        ProposedEndDate: null,
        IsRegisterButtonClicked: false,
        ProjectBudgetHours: 0,
        months: [],
      },
    },
    FinanceManagement: {
      Currency: "",
      ProjectSOW: "",
      SelectedPO: "",
      POListArray: [],
      POArray: [],
      BudgetArray: [],
      UnassignedArray: [],
      AllOperationId: [],
      SOWFileURL: "",
      SOWFileName: "",
      SOWFileProp: [],
      BudgetHours: 0,
      Budget: {
        Total: 0,
        Net: 0,
        OOP: 0,
        Tax: 0,
      },
      OverNightRequest: "",
      Rate: 0,
      ClientLegalEntity: "",
      BilledBy: "",
      selectedFile: null,
      isBudgetRateAdded: false,
      Title:''
    },
  };
  public addSOW = {
    ID: 0,
    ClientLegalEntity: "",
    SOWCode: "",
    BillingEntity: "",
    BusinessVertical:"",
    Poc: "",
    PocText: "",
    PocOptional: [],
    PocOptionalText: "",
    SOWTitle: "",
    SOWCreationDate: null,
    SOWExpiryDate: null,
    Status: "",
    SOWFileURL: "",
    SOWFileName: "",
    SOWDocProperties: [],
    Comments: "",
    Currency: "",
    SOWDocument: "",
    Budget: {
      Total: 0,
      Net: 0,
      OOP: 0,
      Tax: 0,
      TotalBalance: 0,
      NetBalance: 0,
      OOPBalance: 0,
      TaxBalance: 0,
      LastUpdated: new Date(),
    },
    CM1: [],
    CM1Text: "",
    CM2: "",
    CM2Text: "",
    DeliveryOptional: "",
    DeliveryOptionalText: "",
    Delivery: [],
    DeliveryText: "",
    SOWOwner: "",
    SOWOwnerText: "",
    Addendum: {
      NetBudget: 0,
      OOPBudget: 0,
      TaxBudget: 0,
      TotalBudget: 0,
    },
    AllOperationId: [],
    Additonal: {
      NetBudget: 0,
      OOPBudget: 0,
      TaxBudget: 0,
      TotalBudget: 0,
    },
    isSOWCodeDisabled: false,
    isStatusDisabled: true,
    CSRule :  '',
    DeliveryRule : '',

  };
  public oProjectCreation = {
    oProjectInfo: {
      billingEntity: [],
      practiceArea: [],
      clientLegalEntities: [],
      currency: [],
      deliverableType: [],
      currentUser: "",
      molecule: [],
      projectType: [],
      subDeliverable: [],
      milestoneTypes: [],
      ta: [],
      projectContact: [],
      clientGeography: {},
      projectPerYear: 0,
    },
    Resources: {
      cmLevel1: [],
      cmLevel2: [],
      deliveryLevel1: [],
      deliveryLevel2: [],
      businessDevelopment: [],
      editors: [],
      graphics: [],
      primaryRes: [],
      pubSupport: [],
      qc: [],
      reviewers: [],
      writers: [],
    },
  };
  public standardPMResponse: any = [];
  public nonStandardPMResponse: any = [];
  public currentUserID = this.globalObject.currentUser.userId;
  public oTaskAllocation: any = {
    oStandardServices: [],
    oResources: [],
    oReviewer: [],
    oStandardTemplateForDeliverable: [],
    oAllSelectedResource: [],
    oAllResource: [],
  };
  public oProjectManagement = {
    oClientLegalEntity: [],
    oDeliverableType: [],
    oProjectPerYear: 0,
    oResourcesCat: [],
  };
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange: [],
    arrResources: [],
    arrDateFormat: [],
  };
  public oUser = {
    uid: "",
    userName: "",
    maxHrs: "",
    dates: [],
    tasks: [],
    leaves: [],
    businessDays: [],
    totalAllocated: 0,
    totalUnAllocated: 0,
  };
  public ngPrimeMilestoneGlobalObj = {
    data: {
      MileId: "",
      Name: "",
      Hours: 0,
      Days: 0,
      StartDate: new Date(),
      EndDate: new Date(),
      Deviation: 0,
      AssignedTo: "",
      ClientReviewDays: 0,
      clientReviewStartDate: new Date(),
      clientReviewEndDate: new Date(),
      isStartDateDisabled: true,
      isEndDateDisabled: true,
      toggleCapacity: true,
      showTime: false,
      strSubMilestone: "",
    },
    children: [],
  };
  public ngPrimeSubMilestoneGlobalObj = {
    data: {
      MileId: "",
      Name: "",
      Hours: 0,
      Days: 0,
      StartDate: new Date(),
      EndDate: new Date(),
      Deviation: 0,
      AssignedTo: "",
      isStartDateDisabled: true,
      isEndDateDisabled: true,
      toggleCapacity: true,
      showTime: false,
    },
    tasks: [],
    children: [],
  };
  public ngPrimeTaskGlobalObj = {
    data: {
      MileId: "",
      Name: "",
      Hours: 0,
      Days: 0,
      StartDate: new Date(),
      EndDate: new Date(),
      Deviation: 0,
      AssignedTo: "",
      isStartDateDisabled: true,
      isEndDateDisabled: true,
      toggleCapacity: true,
      showTime: false,
      assignedUserTimeZone: "+5.5",
      Milestone: "",
      SubMilestone: "",
      userId: 0,
      taskFullName: "",
      allocationPerDay: "",
      allocationType: "",
      allocationColor: "",
    },
  };
  public currLoginInfo: any = [];
  public isAdditionalBudgetVisible = false;
  public isSOWFormSubmit = false;
  public isAddSOWVisible = false;
  public isSOWRightViewVisible = false;
  public isSOWCloseVisible = false;
  public selectedSOWTask;
  public isUserAllowed = true;
  public isAddProjectVisible = false;
  public isProjectRightSideVisible = false;
  public isAuditRollingVisible = false;
  public isMoveProjectToSOWVisible = false;
  public isProjectVisible = false;
  public columnFilter = {
    ProjectCode: [],
    SOWCode: [],
  };
  public isReasonSectionVisible = false;
  public billedBy = [];
  public arrAdvanceInvoices = [];
  public milestoneArray = [];
  public taskArray = [];
  public fileReader: any = "";
  public updateInvoices = [];

  public RuleArray = [];
  public RuleTypeArray={ Delivery :[] , CM :[]};
  public TempRuleArray=[];


public OwnerAccess={
  cmLevel1 : [],
  cmLevel2 : [],
  deliveryLevel1 : [],
  deliveryLevel2 : [],
  selectedCMOwner:'',
  selectedCMAccess:[],
  selectedDeliveryOwner:'',
  selectedDeliveryAccess:[],

};



// public RuleParamterArray=[
//   { Rulelabel : "Practice Area" , Formlabel: 'practiceArea', Objlabel : 'PracticeArea', value:'' },
//   {Rulelabel  :'Client',Formlabel:'clientLeagalEntity' , Objlabel : 'ClientLegalEntity', value:'' },
//   {Rulelabel  :'Client Subdivision',Formlabel:'subDivision' , Objlabel : 'SubDivision', value:'' },
//   {Rulelabel  :'Currency',Formlabel:'Currency',  Objlabel : 'Currency', value:'' },
//   {Rulelabel  :'Deliverable Type',Formlabel:'DeliverableType', Objlabel :'DeliverableType', value:'' },
// ]



}
