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
      filter: 'IsActive eq \'{{isActive}}\' and ID eq \'{{Id}}\'',
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
}
