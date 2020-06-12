// export interface Prestack {
// }
export interface IDailyAllocationTask {
  ID: number;
  task: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  budgetHrs: string;
  resource: [any];
  status: string;
  strAllocation: string;
  allocationType: string;
}

export interface IDailyAllocationObject {
  Date: Date;
  Allocation: {
    valueHrs: number;
    valueMins: number;
    maxHrs: number;
    maxMins: number;
  };
  hideTasksTable: boolean;
  tasks: any;
}
