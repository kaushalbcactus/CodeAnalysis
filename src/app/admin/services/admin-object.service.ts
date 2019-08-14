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
    IsAddUser: true
  };
}
