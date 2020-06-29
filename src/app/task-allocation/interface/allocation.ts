export interface ICapacity {
  date: Date;
  userCapacity: string;
  taskCount: number;
  maxAvailableHours: number;
  totalTimeAllocated: number;
  availableHrs: string;
  tasksDetails: any;
  totalTimeAllocatedPerDay: string;
  displayAvailableHrs: string;
}

export interface IMilestoneTask {
    'pUserStart': Date;
    'pUserEnd': Date;
    'pUserStartDatePart': Date;
    'pUserStartTimePart': string;
    'pUserEndDatePart': Date;
    'pUserEndTimePart': string;
    'status': string;
    'id': number;
    'text': string;
    'title': string;
    'milestone': string;
    'start_date': Date;
    'end_date': Date;
    'user': string;
    'open': number;
    'parent': number;
    'res_id': any;
    // 'owner_id': number;
    'nextTask': string;
    'previousTask': string;
    'budgetHours': string;
    'spentTime': string;
   // 'allowStart': string;
    'tat': boolean;
    'tatVal': string;
    'milestoneStatus': string;
    'type': string;
    'editMode': boolean;
    'scope': string;
    'isCurrent': boolean;
    'isNext': boolean;
   // 'isFuture': boolean;
    'assignedUsers': any [];
    'AssignedTo': any;
    'userCapacityEnable': boolean;
    'position': string;
    'color': string;
    'itemType': string;
    'slotType': string;
    'edited': boolean;
    'added': boolean;
    'slotColor': string;
    'IsCentrallyAllocated': string;
    'submilestone': string;
    'skillLevel': string;
    'CentralAllocationDone': boolean;
    'ActiveCA': boolean;
    'assignedUserTimeZone': number;
    'parentSlot': number;
    'DisableCascade': boolean;
    'deallocateSlot': boolean;
    'taskFullName': string;
    'subMilestonePresent': boolean;
    'allocationPerDay': string;
    'timeSpentPerDay' : string;
    'allocationColor': string;
    'showAllocationSplit': boolean;
    'allocationTypeLoader': boolean;
    'ganttOverlay': string;
    'ganttMenu':string;
}

export interface IConflictTask {
  allocatedHrs: string;
  allocationDate: Date;
  projects: any;
}

export interface IConflictProject {
    projectCode: string;
    shortTitle: string;
    allocatedhrs: number;
}

export interface IConflictResource {
  userName: string;
  userId: number;
  userCapacity: any;
  tasks: any;
}

export interface IPopupConflictData {
    conflictResolved: boolean;
    action: string;
}

export interface IQueryOptions {
    data: any;
    url: string;
    type: string;
    listName: string;
}

