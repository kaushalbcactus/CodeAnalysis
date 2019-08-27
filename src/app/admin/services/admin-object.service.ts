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
    Account: [],
    Deliverable: [],
    DeliverableExclusion: [],
    TA: [],
    TAExclusion: [],
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
}
