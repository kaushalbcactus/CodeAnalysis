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
    }
  };
  public LOGICAL_FIELD = {
    YES: 'Yes',
    NO: 'No',
    ACTIVE: 'Active'
  };
  public CHOICE_FIELD_NAME = {
    INCAPACITY: 'InCapacity',
    POOLED: 'Pooled',
    PRIMARYSKILL: 'PrimarySkill',
    ROLE: 'Role',
  };
}
