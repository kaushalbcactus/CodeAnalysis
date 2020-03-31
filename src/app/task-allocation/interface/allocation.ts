export interface IDailyAllocationTask {
  ID: number;
  task: string;
  startDate: Date;
  endDate: Date;
  budgetHrs: string;
  resourceId: number;
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
