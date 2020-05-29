// export interface Prestack {
// }
export interface DailyAllocationTask {
  ID: number;
  task: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  budgetHrs: string;
  resource: [number];
  status: string;
  strAllocation: string;
  allocationType: string;
}

export interface DailyAllocationObject {
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
