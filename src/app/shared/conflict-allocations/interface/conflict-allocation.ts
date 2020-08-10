export interface ConflictAllocation {
}

export interface IConflictTask {
allocatedHrs: string;
// allocationDate: any;
allocation: any;
projects: any;
}

export interface IConflictProject {
  projectCode: string;
  shortTitle: string;
  allocatedhrs: number;
}

export interface IConflictResource {
// userName: string;
// userId: number;
user: any;
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
