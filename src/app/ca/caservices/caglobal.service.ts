import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CAGlobalService {
  constructor() { }
  public isUnallocatedChecked;
  public isAllocatedChecked;
  public schedulesItemFetch = [];
  public taskScope: string;
  public curTaskScope = [];
  public taskPreviousComment: string;
  public dataSource: any = [];
  public totalRecords: Number;
  public loading: boolean;
  public caObject = {
    Id: 0,
    ClientName: '',
    ProjectName: '',
    Milestone: '',
    Task: '',
    TaskName: '',
    Displaytask:'',
    editMode: false,
    edited: false,
    DeliveryType: '',
    EstimatedTime: new Date(),
    StartTime: new Date(),
    EndTime: new Date(),
    NextTaskStartDate: new Date(),
    LastTaskEndDate: new Date(),
    sendToClientDate: new Date(),
    autoAllocationBestFit: '',
    allocatedTo: '',
    CentralAllocationDone: '',
    AssignedUserTimeZone: '',
    TaskScope: '',
    DisableCascade: false,
    displayselectedResources: [],
    allowStart: false,
    ProjectCode: '',
    ProjectManagementURL: '',
    SubMilestones: '',
    Timezone: '',
    Title: '',
    StartDate: new Date(),
    DueDate: new Date(),
    UserStart: new Date(),
    UserEnd: new Date(),
    SpentTime: '',
    StartDateText: '',
    DueDateText: '',
    NextTaskStartDateText: '',
    LastTaskEndDateText: '',
    SendToClientDateText: '',
    NextTasks: '',
    PrevTasks: '',
    PrevTaskComments: '',
    allocatedResource: '',
    AssignedTo: '',
    isAllocatedSelectHidden: true,
    isAssignedToHidden: false,
    isEditEnabled: true,
    editImageUrl: '',
    taskScopeImageUrl: '',
    taskDeleteImageUrl: '',
    resources: [],
    selectedResources: [],
    mileStoneTask: [],
    projectTask: [],
    Type: '',
    UserStartDatePart: new Date(),
    UserEndDatePart: new Date(),
    UserStartTimePart: '',
    UserEndTimePart: '',
    Status: '',
    status: ''
  };
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange: [],
    arrResources: [],
    arrDateFormat: [],
  };
  public oUser = {
    uid: '',
    userName: '',
    maxHrs: '',
    dates: [],
    tasks: [],
    leaves: [],
    businessDays: [],
    totalAllocated: 0,
    totalUnAllocated: 0
  };
}
