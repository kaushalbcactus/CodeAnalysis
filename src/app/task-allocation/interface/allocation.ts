export interface IDailyAllocationTask {
  ID: number;
  task: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  budgetHrs: string;
  resource: number;
  status: string;
  strAllocation: string;
  allocationType: string;
}

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

export interface IDailyAllocation {
  Date: Date;
  Allocation: {
    valueHrs: number;
    valueMins: number;
    maxHrs: number;
    maxMins: number;
  };
};

export interface IMilestoneTask {
    'pUserStart': string;
    'pUserEnd': string;
    'pUserStartDatePart': string;
    'pUserStartTimePart': string;
    'pUserEndDatePart': string;
    'pUserEndTimePart': string;
    'status': string;
    'id': number;
    'text': string;
    'title': string;
    'milestone': string;
    'start_date': Date;
    'end_date': Date;
    'user': string;
    'open': string;
    'parent': string;
    'res_id': number;
    'owner_id': number;
    'nextTask': string;
    'previousTask': string;
    'budgetHours': string;
    'spentTime': string;
    'allowStart': string;
    'tat': string;
    'tatVal': string;
    'milestoneStatus': string;
    'type': string;
    'editMode': boolean;
    'scope': string;
    'isCurrent': boolean;
    'isNext': boolean;
    'isFuture': boolean;
    'assignedUsers': any [];
    'AssignedTo': any;
    'userCapacityEnable': string;
    'position': string;
    'color': string;
    'itemType': string;
    'slotType': string;
    'edited': boolean;
    'added': boolean;
    'slotColor': string;
    'IsCentrallyAllocated': boolean;
    'submilestone': string;
    'skillLevel': string;
    'CentralAllocationDone': boolean;
    'ActiveCA': boolean;
    'assignedUserTimeZone': number;
    'parentSlot': string;
    'DisableCascade': boolean;
    'deallocateSlot': boolean;
    'taskFullName': string;
    'subMilestonePresent': boolean;
    'allocationPerDay': string;

}
