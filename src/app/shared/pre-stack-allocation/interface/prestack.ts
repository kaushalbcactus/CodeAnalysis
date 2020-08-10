// export interface Prestack {

import { IUserCapacity } from '../../usercapacity/interface/usercapacity';

// }
export interface IDailyAllocationTask {
  ID: number;
  task: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  budgetHrs: string;
  resource: IUserCapacity[];
  status: string;
  strAllocation: string;
  strTimeSpent: string;
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
  timeSpent: number;
  hideTasksTable: boolean;
  tasks: any;
  leave: boolean;
}

export interface IPreStack {
  allocationPerDay: string;
  allocationAlert: boolean;
  allocationType: string;
}

export interface IPerformAllocationObject {
      arrAllocation: IDailyAllocationObject[];
      allocationType: string;
}
