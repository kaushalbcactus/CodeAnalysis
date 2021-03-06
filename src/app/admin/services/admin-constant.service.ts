import { Injectable } from "@angular/core";
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class AdminConstantService {
  constructor() {}
  public QUERY = {
    GET_PROJECT_INFO_BY_USERROLE: {
      select:
        "ID,Title,SOWCode,BusinessVertical,WBJID,ProjectCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title,Status,CSRule,DeliveryRule",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title",
      filter:
        "Status ne 'Closed' and Status ne 'Cancelled' and {{userRole}}",
      top: 4900,
    },
    GET_SOW_BY_USERROLE: {
      select:
        "ID,Title,SOWCode,BusinessVertical,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,AllResources/ID,AllResources/Title,Status,CSRule,DeliveryRule",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,AllResources/ID,AllResources/Title",
      filter:
        "Status eq 'Approved' and {{userRole}}",
      top: 4900,
    },
    GET_QC_BY_USERROLE:{
      select:"ID,Title,Status,ASD/ID,ASD/Title,CS/ID,CS/Title,TL/ID,TL/Title,CSRule,DeliveryRule",
      expand:"ASD,CS,TL",
      filter:"Status ne 'Closed' and {{userRole}}",
      top: 4900
    },
    GET_POSITIVE_FEEDBACKS_BY_USERROLE: {
      select:"ID,Title,Status,DeliveryLeads/ID,DeliveryLeads/Title,CSRule,DeliveryRule",
      expand:"DeliveryLeads",
      filter:"Status eq 'Accepted' and {{userRole}} and SentDate ge '{{startDate}}' and SentDate le '{{endDate}}'",
      top: 4900
    },
    GET_ALL_ACTIVE_RULES:{
      select:"ID,Title,TypeST,ResourceType,OwnerPG/ID,OwnerPG/Title,Access/ID,Access/Title,DisplayOrder,IsActiveCH,Rule",
      expand:"OwnerPG,Access",
      filter: "IsActiveCH eq '{{isActive}}'",
      top: 4900
    },
    GET_BUCKET: {
      select: "ID,Title",
      filter: "IsActiveCH eq 'Yes'",
      orderby: "Title",
      top: 4900,
    },
    GET_PRACTICE_AREA: {
      select: "ID,Title",
      filter: "IsActiveCH eq 'Yes' ",
      orderby: "Title",
      top: 4900,
    },
    GET_TIMEZONES: {
      select: "ID,Title,TimeZoneName",
      orderby: "Title",
      top: 4900,
    },
    GET_CHOICEFIELD: {
      filter: "EntityPropertyName eq '{{choiceField}}'",
    },
    GET_SKILL_MASTER: {
      select: "ID,Title,CategoryCH,NameCH,LocationCH",
      orderby: "Title",
      top: 4900,
    },
    GET_TASK: {
      select: "ID,Title,SerialOrder",
      filter: "Status eq '{{status}}'",
      orderby: "SerialOrder",
      top: 4900,
    },
    GET_ACCOUNT: {
      select: "ID,Title,Acronym,ListName,Market,ClientGroup",
      orderby: "Title asc",
      filter: "IsActiveCH eq 'Yes'",
      top: 4900,
    },
    GET_DELIVERABLE: {
      select: "ID,Title,Acronym,IsActiveCH",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_TA: {
      select: "ID,Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_USER_INFORMATION: {
      filter: "EMail eq '{{emailId}}'",
    },
    GET_RESOURCE_CATEGERIZATION: {
      select:
        "ID,Title,Account/ID,Account/Title,Bucket,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID," +
        "DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity," +
        "IsActiveCH,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area," +
        "PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,RoleCH,SkillLevel/ID,SkillLevel/Title," +
        "SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title," +
        "TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title,WorkingSunday,WorkingMonday,WorkingTuesday,WorkingWednesday,WorkingThursday,WorkingFriday," +
        "WorkingSaturday,CAVisibility,TAVisibility,IsFTE,FTEEffectiveDate, BucketEffectiveDate, MaxHrsEffectiveDate,PlaceholderUser",
      expand:
        "Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title," +
        "Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID," +
        "Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      top: 4900,
      orderby: "Modified desc",
    },
    GET_ACCESS_RESOURCE_CATEGERIZATION: {
      select:
        "ID,Title,Account/ID,Account/Title,Bucket,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID," +
        "DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity," +
        "IsActiveCH,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area," +
        "PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,RoleCH,SkillLevel/ID,SkillLevel/Title," +
        "SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title," +
        "TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title,WorkingSunday,WorkingMonday,WorkingTuesday,WorkingWednesday,WorkingThursday,WorkingFriday," +
        "WorkingSaturday,CAVisibility,TAVisibility,IsFTE,FTEEffectiveDate, BucketEffectiveDate, MaxHrsEffectiveDate,PlaceholderUser",
      expand:
        "Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title," +
        "Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID," +
        "Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}' and Manager/ID eq '{{UserId}}'",
      top: 4900,
      orderby: "Modified desc",
    },
    GET_RESOURCE_CATEGERIZATION_BY_ID: {
      select:
        "ID,Title,Account/ID,Account/Title,Bucket,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID," +
        "DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity," +
        "IsActiveCH,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area," +
        "PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,RoleCH,SkillLevel/ID,SkillLevel/Title," +
        "SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title," +
        "TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title,WorkingSunday,WorkingMonday,WorkingTuesday,WorkingWednesday,WorkingThursday,WorkingFriday," +
        "WorkingSaturday,CAVisibility,TAVisibility,IsFTE,FTEEffectiveDate, BucketEffectiveDate, MaxHrsEffectiveDate,PlaceholderUser",
      expand:
        "Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title," +
        "Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID," +
        "Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail,Author/ID,Author/Title," +
        "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}' and ID eq '{{Id}}'",
      top: 4900,
    },
    GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME: {
      select: "ID,Title,RoleCH,UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail",
      expand: "UserNamePG/ID,UserNamePG/Title,UserNamePG/EMail",
      filter: "IsActiveCH eq '{{isActive}}'",
      top: 4900,
      orderby: "UserNamePG/Title asc",
    },
    GET_CLIENTLEGALENTITY_BY_USER_ROLE: {
      select:
        "ID,Title,Acronym,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,BillingEntity",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title",
      filter: "",
      orderby: "Title asc",
      top: 4900,
    },
    GET_SOW_BY_CLIENT: {
      select:
        "ID,Title,SOWCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,AllResources/ID,AllResources/Title,Status",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,AllResources/ID,AllResources/Title",
      filter:
        "Status ne 'Closed' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      top: 4900,
    },
    GET_PROJECT_BY_CLIENT: {
      select:
        "ID,Title,SOWCode,WBJID,ProjectCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title,Status",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title",
      filter:
        "Status ne 'Closed' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      top: 4900,
    },
    GET_FOCUS_GROUP_BY_ACTIVE: {
      select: "ID,Title,Modified,IsActiveCH,Editor/ID,Editor/Title",
      expand: "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_CLIENTLEGALENTITY_BY_ACTIVE: {
      select: "ID,Title,Bucket",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_PROJECT_TYPE_BY_ACTIVE: {
      select: "ID,Title,Modified,IsActive,Editor/ID,Editor/Title",
      expand: "Editor/ID,Editor/Title",
      filter: "IsActive eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_DELIVERABLE_TYPE_BY_ACTIVE: {
      select: "ID,Title,Acronym,Modified,IsActiveCH,Editor/ID,Editor/Title",
      expand: "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_TA_BY_ACTIVE: {
      select: "ID,Title,Modified,IsActiveCH,Editor/ID,Editor/Title",
      expand: "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_PRACTICE_AREA_BY_ACTIVE: {
      select: "ID,Title,Modified,IsActiveCH,Editor/ID,Editor/Title",
      expand: "Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_ALL_CLIENT_LEGAL_ENTITY_BY_ACTIVE: {
      select:
        "ID,Title,Acronym,ListName,Market,ClientGroup,InvoiceName,Currency,APAddress,APEmail,Template," +
        "DistributionList,Realization,TimeZoneNM,NotesMT,PORequired,BillingEntity,Bucket,IsActiveCH," +
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title,Modified",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_ACCESS_CLIENT_LEGAL_ENTITY_BY_ACTIVE: {
      select:
        "ID,Title,Acronym,ListName,Market,ClientGroup,InvoiceName,Currency,APAddress,APEmail,Template," +
        "DistributionList,Realization,TimeZoneNM,NotesMT,PORequired,BillingEntity,Bucket,IsActiveCH," +
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title,Modified",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title",
      filter:
        "IsActiveCH eq '{{isActive}}' and (CMLevel1/ID eq '{{UserId}}' or CMLevel2/ID eq '{{UserId}}' or DeliveryLevel1/ID eq '{{UserId}}' or DeliveryLevel2/ID eq '{{UserId}}') ",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_CLIENT_LEGAL_ENTITY_BY_ID: {
      select:
        "ID,Title,Acronym,ListName,Market,ClientGroup,InvoiceName,Currency,APAddress,APEmail,Template," +
        "DistributionList,Realization,TimeZoneNM,NotesMT,PORequired,BillingEntity,Bucket,IsActiveCH," +
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title,Modified",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID," +
        "DeliveryLevel2/Title,Editor/ID,Editor/Title",
      filter: "IsActiveCH eq '{{isActive}}' and ID eq '{{Id}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_CLIENT_GROUP_BY_ACTIVE: {
      select: "ID,Title,Realization,IsActiveCH,NotesMT",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_BILLING_ENTITY_BY_ACTIVE: {
      select: "ID,Title,Acronym,IsActiveCH,InvoiceTemplate",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_CURRENCY_BY_ACTIVE: {
      select: "ID,Title,IsActiveCH",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_SUB_DIVISION_BY_ACTIVE: {
      select:
        "ID,Title,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DistributionList,IsActiveCH," +
        "Modified,Editor/ID,Editor/Title",
      expand:
        "CMLevel1/ID,CMLevel1/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,Editor/ID,Editor/Title",
      filter:
        "IsActiveCH eq '{{isActive}}' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_SUB_DIVISION_BY_ID: {
      select:
        "ID,Title,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,DistributionList,IsActiveCH," +
        "Modified,Editor/ID,Editor/Title",
      expand:
        "CMLevel1/ID,CMLevel1/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,Editor/ID,Editor/Title",
      filter:
        "IsActiveCH eq '{{isActive}}' and ClientLegalEntity eq '{{clientLegalEntity}}' and ID eq '{{Id}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_POC_BY_ACTIVE: {
      select:
        "ID,Title,ClientLegalEntity,FName,LName,EmailAddress,Designation,Phone,AddressMT,FullNameCC,DepartmentST,ReferralSource,Status," +
        "RelationshipStrength,EngagementPlan,CommentsMT,ProjectContactsType,Modified,Editor/ID,Editor/Title",
      filter:
        "Status eq '{{active}}' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      expand: "Editor/ID,Editor/Title",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_POC_BY_ID: {
      select:
        "ID,Title,ClientLegalEntity,FName,LName,EmailAddress,Designation,Phone,AddressMT,FullNameCC,DepartmentST,ReferralSource,Status," +
        "RelationshipStrength,EngagementPlan,CommentsMT,ProjectContactsType,Modified,Editor/ID,Editor/Title",
      filter:
        "Status eq '{{active}}' and ClientLegalEntity eq '{{clientLegalEntity}}' and ID eq '{{Id}}'",
      expand: "Editor/ID,Editor/Title",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_POC_ORDER_BY_Title: {
      select: "ID,FName,LName,FullNameCC",
      filter:
        "Status eq '{{active}}' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      orderby: "FName,LName asc",
      top: 4900,
    },
    GET_PO_BY_ACTIVE: {
      select:
        "ID,Title,Amount,AmountOOP,AmountRevenue,BuyingEntity,ClientLegalEntity,Currency,InvoicedOOP," +
        "InvoicedRevenue,InvoicedTax,Link,Modified,Molecule,NameST,Number,OOPLinked,POCategory,POCLookup," +
        "POExpiryDate,RevenueLinked,ScheduledOOP,ScheduledRevenue,Status,TA,TaxLinked,TotalInvoiced," +
        "TotalLinked,TotalScheduled,AmountTax,CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      filter:
        "Status eq '{{active}}' and ClientLegalEntity eq '{{clientLegalEntity}}'",
      expand: "CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_PO_BY_CLOSED: {
      select:
        "ID,Title,Amount,AmountOOP,AmountRevenue,BuyingEntity,ClientLegalEntity,Currency,InvoicedOOP," +
        "InvoicedRevenue,InvoicedTax,Link,Modified,Molecule,NameST,Number,OOPLinked,POCategory,POCLookup," +
        "POExpiryDate,RevenueLinked,ScheduledOOP,ScheduledRevenue,Status,TA,TaxLinked,TotalInvoiced," +
        "TotalLinked,TotalScheduled,AmountTax,CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      filter:
        "Status eq 'Closed' or Status eq 'InActive' and ClientLegalEntity eq '{{clientLegalEntity}}' and Number eq '{{poNumber}}'",
      expand: "CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_PO_BY_ID: {
      select:
        "ID,Title,Amount,AmountOOP,AmountRevenue,BuyingEntity,ClientLegalEntity,Currency,InvoicedOOP," +
        "InvoicedRevenue,InvoicedTax,Link,Modified,Molecule,NameST,Number,OOPLinked,POCategory,POCLookup," +
        "POExpiryDate,RevenueLinked,ScheduledOOP,ScheduledRevenue,Status,TA,TaxLinked,TotalInvoiced," +
        "TotalLinked,TotalScheduled,AmountTax,CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      filter:
        "Status eq '{{active}}' and ClientLegalEntity eq '{{clientLegalEntity}}' and  ID eq '{{Id}}'",
      expand: "CMLevel2/ID,CMLevel2/Title,Editor/ID,Editor/Title",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_MOLECULES_ORDER_BY_TITLE: {
      select: "ID,Title,IsActiveCH",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Title asc",
      top: 4900,
    },
    GET_CLE_MAPPING_BY_ID: {
      select: "ID,CLEName",
      filter: "CLEName eq '{{clientLegalEntity}}' and EndDateDT eq null",
      orderby: "ID asc",
      top: 4900,
    },
    GET_BUCKET_MAPPING_BY_ID: {
      select: "ID,CLEName,Bucket,StartDate",
      filter: "Bucket eq '{{bucket}}' and EndDateDT eq null",
      orderby: "ID asc",
      top: 4900,
    },
    CONTENT_QUERY: {
      select: "ContentMT",
      filter: "Title eq '{{templateName}}'",
    },
    GET_SUB_DIVISION_BY_ACTIVEONLY: {
      select: "ID,Title,ClientLegalEntity",
      filter: "IsActiveCH eq '{{isActive}}'",
      orderby: "Modified desc",
      top: 4900,
    },
    GET_RULES_BY_ACTIVE: {
      select: "ID,Title,OwnerPG/ID,OwnerPG/Title,DisplayOrder,ResourceType,Rule,IsActiveCH, Access/ID,Access/Title",
      filter: "IsActiveCH eq '{{isActive}}' and TypeST eq '{{type}}'",
      expand: "OwnerPG, Access",
      orderby: "DisplayOrder desc",
      top: 4900,
    },
    GET_RULES_PARAMETER_BY_ACTIVE: {
      select: "ID,Title,NameST,ListName,Query,Dependency,DisplayOrder,InternalName",
      filter: "IsActiveCH eq '{{isActive}}' and TypeST eq '{{type}}'",
      orderby: "DisplayOrder asc",
      top: 4900,
    },
    GET_PROJECT_INFO: {
      select:
        "ID,Title,SOWCode,BusinessVertical,WBJID,ProjectCode,DeliverableType,SubDivision,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title,Status,CSRule,DeliveryRule",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title,AllOperationresources/ID,AllOperationresources/Title",
      filter:
        "Status ne 'Closed' and Status ne 'Cancelled'",
      top: 4900,
    },
    GET_PROJECT_INFO_bY_PROJECTCODE:{
      select:
      "ID,Title,BusinessVertical,ProjectCode,DeliverableType,ClientLegalEntity,SubDivision,Status,CSRule,DeliveryRule,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
      "DeliveryLevel2/ID,DeliveryLevel2/Title",
    expand:
      "CMLevel1,CMLevel2,DeliveryLevel1,DeliveryLevel2",
    filter:
      "ProjectCode eq '{{projectcode}}'",
    top: 4900,
    },
    GET_INACTIVE_PROJECT: {
      select:
        "ID,Title,ProjectCode,Status",
      filter:
        "Status eq 'Closed' or Status eq 'Cancelled'",
      top: 4900,
    },
    GET_PROJECT_FINANCE_BY_CURRENCY: {
      select: 'ID, Title, Currency',
      filter: 'Currency eq \'{{currency}}\''
    },

    GET_All_SOW: {
      select:
        "ID,Title,SOWCode,BusinessVertical,Currency,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title," +
        "DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title,Status,CSRule,DeliveryRule",
      expand:
        "CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title," +
        "DeliveryLevel2/ID,DeliveryLevel2/Title",
      filter:
        "Status eq 'Approved'",
      top: 4900,
    },
    GET_All_QUALITY_COMPLAINTS: {
      select:"ID,Title,Status,ASD/ID,ASD/Title,TL/ID,TL/Title,CSRule,DeliveryRule,CSId",
      expand:"ASD,TL",
      filter:
        "Status eq 'Created' or Status eq 'Rejected'",
      top: 4900,
    },
    GET_All_POSITIVE_FEEDBACK: {
      select:"ID,Title,Status,DeliveryLeads/ID,DeliveryLeads/Title,CSRule,DeliveryRule",
      expand:"DeliveryLeads",
      filter:
        "Status eq 'Accepted'",
      top: 4900,
    },
  };

  public LOGICAL_FIELD = {
    YES: "Yes",
    NO: "No",
    ACTIVE: "Active",
    INACTIVE: "InActive",
  };
  public CHOICE_FIELD_NAME = {
    INCAPACITY: "InCapacity",
    POOLED: "Pooled",
    PRIMARYSKILL: "PrimarySkill",
    ROLE: "RoleCH",
    MARKET: "Market",
    POC_STATUS: "Status",
    POC_REFERRAL_SOURCE: "ReferralSource",
    POC_PROJECT_CONTACTS_TYPE: "ProjectContactsType",
    POC_RELATIONSHIP_STRENGTH: "RelationshipStrength",
    PO_BUYING_ENTITY: "BuyingEntity",
    TAVISIBILITY: "TAVisibility",
    CAVISIBILITY: "CAVisibility",
    ISFTE: "IsFTE",
    PlaceholderUser: "PlaceholderUser"
  };
  public ACTION = {
    COPY: "Copy",
    ADD: "Add",
    EDIT: "Edit",
    DELETE: "Delete",
    GET: "Get",
    REDUCE: "Reduce",
    RESTRUCTURE: "Restructure",
  };
  public FILTER = {
    CM_LEVEL_1: "CM L1",
    CM_LEVEL_2: "CM L2",
    DELIVERY_LEVEL_1: "Delivery L1",
    DELIVERY_LEVEL_2: "Delivery L2",
    DELIVERY: "Delivery"
  };
  public ACCESS_TYPE = {
    ACCESS: "Access",
    ACCOUNTABLE: "Accountable",
    NO_ACCESS: "No Access",
  };
  public REG_EXPRESSION = {
    ALPHA_SPECIAL: /^([a-zA-Z])+((?:[-_](?![-_]))*([a-zA-Z]))*$/,
    ALPHA: /^[a-zA-Z]+$/,
    APLHA_NUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHA_SPECIAL_NUMERIC: /^([a-zA-Z0-9])+((?:[-_](?![-_]))*([a-zA-Z0-9]))*$/,
    THREE_UPPERCASE_TWO_NUMBER: /^[A-Z]{3}[0-9]{2}$/,
    ALPHA_SPECIAL_WITHSPACE: /^([a-z A-Z])+((?:[-_](?![-_]))*([a-z A-Z]))*$/
  };
  public RESOURCE_CATEGORY_CONSTANT = {
    CMLevel1: "CM L1",
    CMLevel2: "CM L2",
    DELIVERY_LEVEL_1: "Delivery L1",
    DELIVERY_LEVEL_2: "Delivery L2",
  };
  public DELETE_LIST_ITEM = {
    CLIENT_LEGAL_ENTITY: "ClientLegalEntity",
    SUB_DIVISION: "SubDivision",
    POINT_OF_CONTACT: "PointOfContact",
    PURCHASE_ORDER: "PurchaseOrder",
  };
  public FOLDER_LOCATION = {
    PO: "Finance/PO",
  };
  public GROUP_CONSTANT_TEXT = {
    SP_TEAM: "-Managed By SPTeam",
  };

  public DefaultMenu = {
    List: [],
  };

  public EntitleMentMenu = {
    List: [],
  };

  public TabMenu = {
    ClientMaster: [],
    UserProfile: [],
    Attribute: [],
    Entitlement: [],
  };

  public userRole = {
    SPMAA: false,
    SPMEA: false,
    SPMPA: false,
    MTeam: false,
    SPTeam: false,
  };

  public toastMsg = {
    SPMAD: false,
    SPMEA: false,
    SPMAA: false,
    EAPA: false,
    EA: false,
  };
  public ATTRIBUTES = {
    PROJECTCODE:"Project",
    SOWCODE: "SOW",
    CLIENTDISSATISFACTION:"Client Dissatisfaction",
    POSITIVEFEEDBACK: "Positive Feedback"
  }
}
