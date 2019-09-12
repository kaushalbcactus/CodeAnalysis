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
}
