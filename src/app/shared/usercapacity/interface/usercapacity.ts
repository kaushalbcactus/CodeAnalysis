export interface IUserCapacity {
  AvailableHoursRID: number;
  Bench: string;
  GoLiveDate: Date;
  JoiningDate: Date;
  TimeSpentDayTasks: Array<any>;
  TimeSpentTasks: Array<any>;
  TotalTimeSpent: string;
  businessDays: Array<Date>;
  dates: Array<any>;
  dayTasks: Array<any>;
  displayTotalAllocated: string;
  displayTotalAllocatedExport: string;
  displayTotalTimeSpent: string;
  displayTotalTimeSpentExport: string;
  displayTotalUnAllocated: string;
  displayTotalUnAllocatedExport: string;
  leaves: Array<any>;
  maxHrs: number;
  tasks: Array<any>;
  totalAllocated: string;
  totalUnAllocated: string;
  uid: number;
  UserName: any;
  userName: string;
}
