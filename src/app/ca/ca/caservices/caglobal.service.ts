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
    id : 0,
    clientName : '',
    projectName : '',
    milestone : '',
    task : '',
    taskName : '',
    deliveryType: '',
    estimatedTime: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    nextTaskStartDate: new Date(),
    lastTaskEndDate : new Date(),
    sendToClientDate : new Date(),
    autoAllocationBestFit : '',
    allocatedTo: '',
    taskScope: '',
    projectCode: '',
    projectManagementURL: '',
    SubMilestones: '',
    timezone: '',
    title: '',
    startDate: new Date(),
    dueDate: new Date(),
    startDateText: '',
    dueDateText: '',
    nextTaskStartDateText: '',
    lastTaskEndDateText: '',
    sendToClientDateText: '',
    NextTasks: '',
    PrevTasks: '',
    prevTaskComments: '',
    allocatedResource: '',
    assignedTo: '',
    isAllocatedSelectHidden: true,
    isAssignedToHidden: false,
    isEditEnabled: true,
    editImageUrl: '',
    taskScopeImageUrl: '',
    taskDeleteImageUrl: '',
    resources: [],
    selectedResources: [],
    mileStoneTask: [],
    projectTask: []
  };
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange : [],
    arrResources : [],
    arrDateFormat: [],
  };
  public oUser = {
      uid : '',
      userName : '',
      maxHrs : '',
      dates: [],
      tasks: [],
      leaves: [],
      businessDays: [],
      totalAllocated : 0,
      totalUnAllocated : 0
  };
}
