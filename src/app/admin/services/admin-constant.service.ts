import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminConstantService {
  constructor() { }
  public QUERY = {
    GET_BUCKET: {
      select: 'ID,Title',
      filter: 'IsActive eq \'1\'',
      orderby: 'Title',
      top: 4900
    },
    GET_PRACTICE_AREA: {
      select: 'ID,Title',
      orderby: 'Title',
      top: 4900
    },
    GET_TIMEZONES: {
      select: 'ID,Title,TimeZoneName',
      orderby: 'Title',
      top: 4900
    },
    GET_CHOICEFIELD: {
      filter: 'EntityPropertyName eq \'{{choiceField}}\''
    },
    GET_SKILL_MASTER: {
      select: 'ID,Title,Category,Name,Location',
      orderby: 'Title',
      top: 4900
    },
    GET_TASK: {
      select: 'ID,Title,SerialOrder',
      filter: 'Status eq \'{{status}}\'',
      orderby: 'SerialOrder',
      top: 4900
    },
    GET_ACCOUNT: {
      select: 'ID,Title,Acronym,ListName,Market,ClientGroup',
      orderby: 'Title',
      top: 4900
    },
    GET_DELIVERABLE: {
      select: 'ID,Title,Acronym,Active',
      filter: 'Active eq \'{{isActive}}\'',
      orderby: 'Title',
      top: 4900
    },
    GET_TA: {
      select: 'ID,Title',
      filter: 'Active eq \'{{isActive}}\'',
      orderby: 'Title',
      top: 4900
    },
    GET_USER_INFORMATION: {
      filter: 'EMail eq \'{{emailId}}\''
    },
    GET_RESOURCE_CATEGERIZATION: {
      select: 'ID,Title,Account/ID,Account/Title,Bucket,Categories,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID,'
        + 'DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity,'
        + 'IsActive,IsLeader,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area,'
        + 'PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,Role,SkillLevel/ID,SkillLevel/Title,'
        + 'SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title,'
        + 'TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      expand: 'Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,'
        + 'Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,'
        + 'Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      filter: 'IsActive eq \'{{isActive}}\'',
      top: 4900,
      orderby: 'Modified desc'
    },
    GET_RESOURCE_CATEGERIZATION_BY_ID: {
      select: 'ID,Title,Account/ID,Account/Title,Bucket,Categories,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID,'
        + 'DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity,'
        + 'IsActive,IsLeader,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area,'
        + 'PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,Role,SkillLevel/ID,SkillLevel/Title,'
        + 'SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title,'
        + 'TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      expand: 'Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,'
        + 'Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,'
        + 'Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      filter: 'IsActive eq \'{{isActive}}\' and ID eq \'{{Id}}\''
    },
    GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME: {
      select: 'ID,Title,Account/ID,Account/Title,Bucket,Categories,Created,DateofExit,DateOfJoining,DeliverableExclusion/ID,'
        + 'DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,Designation,GoLiveDate,InCapacity,'
        + 'IsActive,IsLeader,Manager/ID,Manager/Title,Manager/EMail,ManagerEffectiveDate,MaxHrs,Modified,Pooled,Practice_x0020_Area,'
        + 'PracticeAreaEffectiveDate,PrimarySkill,PrimarySkillEffectiveDate,Ready_x0020_To,Role,SkillLevel/ID,SkillLevel/Title,'
        + 'SkillLevelEffectiveDate,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,Tasks/Title,TimeZone/ID,TimeZone/Title,'
        + 'TimeZone/TimeZoneName,TimeZoneEffectiveDate,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      expand: 'Account/ID,Account/Title,DeliverableExclusion/ID,DeliverableExclusion/Title,Deliverables/ID,Deliverables/Title,'
        + 'Manager/ID,Manager/Title,Manager/EMail,SkillLevel/ID,SkillLevel/Title,TA/ID,TA/Title,TAExclusion/ID,TAExclusion/Title,Tasks/ID,'
        + 'Tasks/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName,UserName/ID,UserName/Title,UserName/EMail,Author/ID,Author/Title,'
        + 'Editor/ID,Editor/Title',
      filter: 'IsActive eq \'{{isActive}}\'',
      top: 4900,
      orderby: 'UserName/Title asc'
    },
    GET_CLIENTLEGALENTITY_BY_USER_ROLE: {
      select: 'ID,Title,Acronym,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID,DeliveryLevel2/Title,BillingEntity',
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID,DeliveryLevel2/Title',
      filter: '',
      orderby: 'Title asc'
    },
    GET_SOW_BY_CLIENT: {
      select: 'ID,Title,SOWCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,'
        + 'DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID,DeliveryLevel2/Title',
      filter: 'Status ne \'Closed\' and ClientLegalEntity eq \'{{clientLegalEntity}}\'',
      top: 4900
    },
    GET_PROJECT_BY_CLIENT: {
      select: 'ID,Title,SOWCode,WBJID,ProjectCode,ClientLegalEntity,CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,'
        + 'DeliveryLevel1/ID,DeliveryLevel1/Title,DeliveryLevel2/ID,DeliveryLevel2/Title',
      expand: 'CMLevel1/ID,CMLevel1/Title,CMLevel2/ID,CMLevel2/Title,DeliveryLevel1/ID,DeliveryLevel1/Title,'
        + 'DeliveryLevel2/ID,DeliveryLevel2/Title',
      filter: 'Status ne \'Closed\' and ClientLegalEntity eq \'{{clientLegalEntity}}\'',
      top: 4900
    },
    GET_FOCUS_GROUP_BY_ACTIVE: {
      select: 'ID,Title,Modified,IsActive,Editor/ID,Editor/Title',
      expand: 'Editor/ID,Editor/Title',
      filter: 'IsActive eq {{isActive}}',
      orderby: 'Modified desc',
      top: 4900
    },
    GET_CLIENTLEGALENTITY_BY_ACTIVE: {
      select: 'ID,Title,Bucket',
      filter: 'IsActive eq \'{{isActive}}\'',
      orderby: 'Title asc',
      top: 4900
    },
    GET_PROJECT_TYPE_BY_ACTIVE: {
      select: 'ID,Title,Modified,IsActive,Editor/ID,Editor/Title',
      expand: 'Editor/ID,Editor/Title',
      filter: 'IsActive eq \'{{isActive}}\'',
      orderby: 'Modified desc',
      top: 4900
    },
    GET_DELIVERABLE_TYPE_BY_ACTIVE: {
      select: 'ID,Title,Acronym,Modified,Active,Editor/ID,Editor/Title',
      expand: 'Editor/ID,Editor/Title',
      filter: 'Active eq \'{{isActive}}\'',
      orderby: 'Modified desc',
      top: 4900
    },
    GET_TA_BY_ACTIVE: {
      select: 'ID,Title,Modified,Active,Editor/ID,Editor/Title',
      expand: 'Editor/ID,Editor/Title',
      filter: 'Active eq \'{{isActive}}\'',
      orderby: 'Modified desc',
      top: 4900
    },
    GET_PRACTICE_AREA_BY_ACTIVE: {
      select: 'ID,Title,Modified,IsActive,Editor/ID,Editor/Title',
      expand: 'Editor/ID,Editor/Title',
      filter: 'IsActive eq \'{{isActive}}\'',
      orderby: 'Modified desc',
      top: 4900
    }
  };
  public LOGICAL_FIELD = {
    YES: 'Yes',
    NO: 'No',
    ACTIVE: 'Active',
    INACTIVE: 'InActive'
  };
  public CHOICE_FIELD_NAME = {
    INCAPACITY: 'InCapacity',
    POOLED: 'Pooled',
    PRIMARYSKILL: 'PrimarySkill',
    ROLE: 'Role',
  };
  public ACTION = {
    COPY: 'Copy',
    ADD: 'Add'
  };
  public FILTER = {
    CM_LEVEL_1: 'CM L1',
    CM_LEVEL_2: 'CM L2',
    DELIVERY_LEVEL_1: 'Delivery L1',
    DELIVERY_LEVEL_2: 'Delivery L2'
  };
  public ACCESS_TYPE = {
    ACCESS: 'Access',
    ACCOUNTABLE: 'Accountable'
  };
  public REG_EXPRESSION = {
    ALPHA_SPECIAL: /^[a-zA-Z]+(-?[a-zA-Z]+)?(_?[a-zA-Z]+)?$/,
    ALPHA: /^[a-zA-Z]+$/
  };
}
