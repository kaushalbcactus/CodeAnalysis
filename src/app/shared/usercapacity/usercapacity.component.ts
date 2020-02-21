import { Component, OnInit, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DynamicDialogConfig, MessageService, DialogService } from 'primeng';
import { CAGlobalService } from 'src/app/ca/caservices/caglobal.service';
import { CACommonService } from 'src/app/ca/caservices/cacommon.service';
import { SharedConstantsService } from '../services/shared-constants.service';
import { MilestoneTasksDialogComponent } from './milestone-tasks-dialog/milestone-tasks-dialog.component';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-usercapacity',
  templateUrl: './usercapacity.component.html',
  styleUrls: ['./usercapacity.component.css']
})
export class UsercapacityComponent implements OnInit {
  public modalReference = null;
  private Schedules = this.globalConstantService.listNames.Schedules.name;
  private ProjectInformation = this.globalConstantService.listNames.ProjectInformation.name;
  private leaveCalendar = this.globalConstantService.listNames.LeaveCalendar.name;
  public clickedTaskTitle = '';
  public milestoneTasks = [];
  public height = '';
  public verticalAlign = '';
  elRef: ElementRef;
  data: any;
  loaderenable = true;
  dynamicload = false;
  width: any;
  pageWidth: any;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  enableTaskDialog = false;
  selectedTask: any;
  disableCamera = false;
  enableDownload = false;
  displayCount: any;
  taskStatus = 'All';
  tableLoaderenable = false;
  constructor(
    public datepipe: DatePipe, public config: DynamicDialogConfig,
    private spService: SPOperationService,
    private caGlobalService: CAGlobalService,
    private globalConstantService: ConstantsService,
    private commonservice: CACommonService,
    elRef: ElementRef,
    private globalService: GlobalService,
    private messageService: MessageService,
    private sharedConstant: SharedConstantsService,
    private cdRef: ChangeDetectorRef,
    public dialogService: DialogService,
    private common: CommonService) {
    this.elRef = elRef;
  }

  ngOnInit() {
    this.loaderenable = true;
    this.data = this.config.data;
    if (this.data) {
      this.dynamicload = true;
      this.Onload(this.data);

    }
  }


  downloadExcel() {
    this.common.tableToExcel('capacityTable1', 'Capacity Dashboard');
  }
  // tslint:disable
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange: [],
    arrResources: [],
    arrDateFormat: [],
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  // ******************************************************************************************************
  // load component for user capacity from diff. module
  // ******************************************************************************************************


  async Onload(data) {

    this.messageService.add({
      key: 'myKey1', severity: 'warn', sticky: true,
      summary: 'Info Message', detail: 'Fetching data...'
    });
    this.enableDownload = data.type === 'CapacityDashboard' ? true : false;
    // setTimeout(() => {


    // }, 500);

    if (data.type === 'CapacityDashboard') {

      this.displayCount = data.resourceType === 'OnJob' ? 'Total On Job Resource: ' + data.task.resources.length : 'Total Trainee: ' + data.task.resources.length;
      this.taskStatus = data.taskStatus
    }
    let setResourcesExtn = $.extend(true, [], data.task.resources);

    const oCapacity = await this.applyFilterReturn(data.startTime, data.endTime, setResourcesExtn);
    const tempUserDetailsArray = [];

    if (data.task.selectedResources) {
      for (const user of data.task.selectedResources) {
        if ((user.userType === this.globalConstantService.userType.BEST_FIT ||
          user.userType === this.globalConstantService.userType.RECOMMENDED) &&
          (data.item.taskDetails.uid !== user.taskDetails.uid)) {
          const retResource = oCapacity.arrUserDetails.filter(
            arrdt => arrdt.uid === user.taskDetails.uid);
          tempUserDetailsArray.push(retResource[0]);
        }
        if (data.item.taskDetails.uid === user.taskDetails.uid) {
          const retResource = oCapacity.arrUserDetails.filter(arrdt => arrdt.uid === user.taskDetails.uid);
          tempUserDetailsArray.splice(0, 0, retResource[0]);
        }
      }
      oCapacity.arrUserDetails = tempUserDetailsArray;
    }
    this.oCapacity = oCapacity;

    if (data.Module) {
      if (data.Module === 'PM') {
        this.disableCamera = true;
      }
    }

    this.calc(oCapacity);
  }


  getHtmlContent() {
    return this.elRef.nativeElement.innerHTML;
  }

  getMonday(d, NextLast, weeks) {
    d = new Date(d);
    const day = d.getDay(),
      diff = (NextLast === 'Next' ? d.getDate() + (7 * weeks) : NextLast === 'Last' ?
        d.getDate() - (7 * weeks) : d.getDate()) - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  getDates(startDate, stopDate, remove) {
    const objDates = {
      dateStringArray: [],
      dateArray: []
    };
    let currentDate = new Date(startDate);
    currentDate = new Date(currentDate.setHours(0, 0, 0, 0));
    let newStopDate = new Date(stopDate);
    newStopDate = new Date(newStopDate.setHours(23, 59, 59, 0));
    while (currentDate <= newStopDate) {
      if (remove) {
        if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
          objDates.dateArray.push(new Date(currentDate));
        }
      }
      else {
        objDates.dateArray.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return objDates;
  }

  async applyFilter(startDate, endDate, selectedUsers) {
    const oCapacity = {
      arrUserDetails: [],
      arrDateRange: [],
      arrResources: [],
      arrDateFormat: [],
    };

    let batchResults = [];
    let finalArray = [];
    let tempFinalArray = [];
    let tempTimeSpentFinalArray = [];
    let TimeSpentbatchResults = [];
    let startDateString = this.datepipe.transform(startDate, 'yyyy-MM-dd') + 'T00:00:01.000Z';
    let endDateString = this.datepipe.transform(endDate, 'yyyy-MM-dd') + 'T23:59:00.000Z';
    const sTopStartDate = startDate;
    const sTopEndDate = endDate;
    const obj = {
      arrDateRange: [],
      arrDateFormat: []
    };
    obj.arrDateRange = this.getDates(startDate, endDate, false).dateArray;
    obj.arrDateFormat = this.getDates(startDate, endDate, false).dateArray;
    oCapacity.arrDateRange = obj.arrDateRange;
    oCapacity.arrDateFormat = obj.arrDateFormat;
    const batchGuid = this.spService.generateUUID();
    let batchContents = new Array();
    let batchUrl = [];
    let TimeSpentbatchUrl = [];

    for (const userIndex in selectedUsers) {
      if (selectedUsers.hasOwnProperty(userIndex)) {
        if (selectedUsers[userIndex]) {
          const oUser = {
            uid: '',
            userName: '',
            maxHrs: '',
            dates: [],
            tasks: [],
            leaves: [],
            businessDays: [],
            totalAllocated: 0,
            totalUnAllocated: 0,
            TotalTimeSpent: 0,
            GoLiveDate: '',
            JoiningDate: '',
            TimeSpentTasks: [],
          };

          const userDetail = [selectedUsers[userIndex]];
          if (userDetail.length > 0) {
            oUser.uid = userDetail[0].UserName.ID ? userDetail[0].UserName.ID : userDetail[0].UserName.Id;
            oUser.userName = userDetail[0].UserName.Title;
            oUser.maxHrs = userDetail[0].UserName.MaxHrs ? userDetail[0].UserName.MaxHrs : userDetail[0].MaxHrs;
            oUser.GoLiveDate = userDetail[0].GoLiveDate;
            oUser.JoiningDate = userDetail[0].DateOfJoining;
            this.fetchData(oUser, startDateString, endDateString, batchUrl);
            if (this.enableDownload) {
              this.fetchDataForTimeSpent(oUser, startDateString, endDateString, TimeSpentbatchUrl);
            }

            if (batchUrl.length === 99) {
              this.common.SetNewrelic('Shared', 'UserCapacity', 'fetchTaskByUsers');
              batchResults = await this.spService.executeBatch(batchUrl);
              console.log(batchResults);
              tempFinalArray = [...tempFinalArray, ...batchResults];
              batchUrl = [];
            }
            if (TimeSpentbatchUrl.length === 99) {
              TimeSpentbatchResults = await this.spService.executeBatch(TimeSpentbatchUrl);
              console.log(batchResults);
              tempTimeSpentFinalArray = [...tempTimeSpentFinalArray, ...TimeSpentbatchResults];
              TimeSpentbatchUrl = [];

            }
            oCapacity.arrUserDetails.push(oUser);
          }
        }
      }
    }
    if (batchUrl.length) {
      this.common.SetNewrelic('Shared', 'UserCapacity', 'fetchTaskByUsers');
      batchResults = await this.spService.executeBatch(batchUrl);
      tempFinalArray = [...tempFinalArray, ...batchResults];
    }
    if (TimeSpentbatchUrl.length) {
      this.common.SetNewrelic('Shared', 'UserCapacity', 'fetchSpentTaskByUsers');

      TimeSpentbatchResults = await this.spService.executeBatch(TimeSpentbatchUrl);
      tempTimeSpentFinalArray = [...tempTimeSpentFinalArray, ...TimeSpentbatchResults];

    }

    // let arruserResults = await this.spService.executeBatch(batchUrl);
    const arruserResults = tempFinalArray.length ? tempFinalArray.map(a => a.retItems) : [];

    const arruserResults1 = tempTimeSpentFinalArray.length ? tempTimeSpentFinalArray.map(a => a.retItems) : [];
    let batchURL = [];
    batchResults = [];
    finalArray = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    for (const indexUser in oCapacity.arrUserDetails) {
      if (oCapacity.arrUserDetails.hasOwnProperty(indexUser)) {
        // oCapacity.arrUserDetails[indexUser].tasks = this.fetchTasks(oCapacity.arrUserDetails[indexUser], arruserResults[indexUser]);


        const TempTasks = this.fetchTasks(oCapacity.arrUserDetails[indexUser], arruserResults[indexUser]);

        oCapacity.arrUserDetails[indexUser].tasks = this.filterData(TempTasks);

        if (oCapacity.arrUserDetails[indexUser].tasks && oCapacity.arrUserDetails[indexUser].tasks.length) {
          oCapacity.arrUserDetails[indexUser].tasks.sort((a, b) => {
            return b.DueDate - a.DueDate;
          });


          // tslint:disable
          this.datepipe.transform(startDate, 'yyyy-MM-dd') + 'T00:00:01.000Z'
          endDateString = new Date(sTopEndDate) > new Date(this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].DueDate, 'yyyy-MM-ddT') + '23:59:00.000Z')
            ? sTopEndDate.toISOString() : this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].DueDate, 'yyyy-MM-ddT') + "23:59:00.000Z";

          startDateString = new Date(sTopStartDate) < new Date(this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].StartDate, 'yyyy-MM-ddT') + '00:00:01.000Z')
            ? sTopStartDate.toISOString() : this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].StartDate, 'yyyy-MM-ddT') + '00:00:01.000Z';
          // tslint: enable



          if (this.enableDownload) {
            const TimeSpentTasks = this.fetchTasks(oCapacity.arrUserDetails[indexUser], arruserResults1[indexUser]);
            oCapacity.arrUserDetails[indexUser].TimeSpentTasks = await this.SplitfetchTasks(TimeSpentTasks);

            if (oCapacity.arrUserDetails[indexUser].TimeSpentTasks && oCapacity.arrUserDetails[indexUser].TimeSpentTasks.length) {
              oCapacity.arrUserDetails[indexUser].TimeSpentTasks.sort((a, b) => {
                return b.DueDate - a.DueDate;
              });
            }
          }

        }
        else {
          startDateString = sTopStartDate.toISOString();
          endDateString = sTopEndDate.toISOString();
        }



        selectedUsers.map(c => c.ResourceUserID = c.UserName.Id ? c.UserName.Id : c.UserName.ID);

        oCapacity.arrUserDetails.map(c => c.AvailableHoursRID = selectedUsers.find(c => c.ResourceUserID === oCapacity.arrUserDetails[indexUser].uid).ID)

        if (batchURL.length === 99) {
          this.common.SetNewrelic('Shared', 'UserCapacity', 'fetchTaskByUsers');
          batchResults = await this.spService.executeBatch(batchURL);
          console.log(batchResults);
          finalArray = [...finalArray, ...batchResults];
          batchURL = [];
        }

        const leaveGet = Object.assign({}, options);
        const leavesQuery = Object.assign({}, this.sharedConstant.userCapacity.leaveCalendar);
        leaveGet.url = this.spService.getReadURL('' + this.globalConstantService.listNames.LeaveCalendar.name + '', leavesQuery);
        leaveGet.url = leaveGet.url.replace(/{{userId}}/gi, oCapacity.arrUserDetails[indexUser].uid).replace(/{{startDateString}}/gi, startDateString).replace(/{{endDateString}}/gi, endDateString);
        leaveGet.type = 'GET';
        leaveGet.listName = this.globalConstantService.listNames.LeaveCalendar.name;
        batchURL.push(leaveGet);

        if (batchURL.length === 99) {
          this.common.SetNewrelic('Shared', 'UserCapacity', 'getLeavesbyUserIdAndSDED');
          batchResults = await this.spService.executeBatch(batchURL);
          console.log(batchResults);
          finalArray = [...finalArray, ...batchResults];
          batchURL = [];
        }
        const availableHrsGet = Object.assign({}, options);
        const availableHrsQuery = Object.assign({}, this.sharedConstant.userCapacity.availableHrs);
        availableHrsGet.url = this.spService.getReadURL('' + this.globalConstantService.listNames.AvailableHours.name +
          '', availableHrsQuery);
        availableHrsGet.url = availableHrsGet.url.replace(/{{ResourceId}}/gi, oCapacity.arrUserDetails[indexUser].AvailableHoursRID).replace(/{{startDateString}}/gi, startDateString).replace(/{{endDateString}}/gi, endDateString);
        availableHrsGet.type = 'GET';
        availableHrsGet.listName = this.globalConstantService.listNames.AvailableHours.name;
        batchURL.push(availableHrsGet);
      }
    }


    if (batchURL.length) {
      this.common.SetNewrelic('Shared', 'UserCapacity', 'getLeavesbyUserIdAndSDEDAndAHbyUserID');
      batchResults = await this.spService.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }

    finalArray = finalArray.length ? finalArray : [];
    if (finalArray) {

      const UserLeaves = finalArray.filter(c => c.listName === 'Leave Calendar');
      const UserAvailableHrs = finalArray.filter(c => c.listName === 'AvailableHours');

      for (var index in oCapacity.arrUserDetails) {
        if (oCapacity.arrUserDetails.hasOwnProperty(index)) {
          await this.fetchUserLeaveDetails(oCapacity, oCapacity.arrUserDetails[index], UserLeaves[index].retItems, UserAvailableHrs[index].retItems);
          this.fetchUserCapacity(oCapacity.arrUserDetails[index], startDate, endDate);
        }
      }
    }
    return oCapacity;
  }

  filterData(TempTasks) {
    let taskArray = [];
    taskArray = this.taskStatus === 'Confirmed' ? TempTasks.filter(c => c.Status === 'Completed' || c.Status === 'Not Started' || c.Status === 'In Progress' || c.Status === 'Auto Closed') :
      this.taskStatus === 'NotConfirmed' ? TempTasks.filter(c => c.Status === 'Not Confirmed' || c.Status === 'Planned' || c.Status === 'Blocked') : TempTasks;

    return taskArray;
  }



  applyFilterReturn(startDate, endDate, selectedUsers) {
    return this.applyFilter(startDate, endDate, selectedUsers);
  }

  async applyFilterGlobal(startDate, endDate, selectedUsers) {
    this.globalService.oCapacity = await this.applyFilter(startDate, endDate, selectedUsers);

  }
  async applyFilterLocal(startDate, endDate, selectedUsers, Module) {
    this.oCapacity = await this.applyFilter(startDate, endDate, selectedUsers);

    if (Module) {
      if (Module === 'PM') {
        this.disableCamera = true;
      }
    }

    this.calc(this.oCapacity);
  }
  fetchData(oUser, startDateString, endDateString, batchUrl) {

    const selectedUserID = oUser.uid;
    const invObj = Object.assign({}, this.queryConfig);
    // tslint:disable-next-line: max-line-length

    invObj.url = this.spService.getReadURL(this.globalConstantService.listNames.Schedules.name, this.sharedConstant.userCapacity.fetchTasks);
    invObj.url = invObj.url.replace('{{userID}}', selectedUserID).replace(/{{startDateString}}/gi, startDateString)
      .replace(/{{endDateString}}/gi, endDateString);
    invObj.listName = this.globalConstantService.listNames.Schedules.name;
    invObj.type = 'GET';
    batchUrl.push(invObj);
    return batchUrl;
    // return this.spService.getBatchBodyGet(batchContents, batchGuid, endpoint);
  }

  fetchDataForTimeSpent(oUser, startDateString, endDateString, TimeSpentbatchUrl) {

    const selectedUserID = oUser.uid;
    const invObj = Object.assign({}, this.queryConfig);
    // tslint:disable-next-line: max-line-length
    invObj.url = this.spService.getReadURL(this.globalConstantService.listNames.Schedules.name, this.sharedConstant.userCapacity.fetchSpentTimeTasks);
    invObj.url = invObj.url.replace('{{userID}}', selectedUserID).replace(/{{startDateString}}/gi, startDateString)
      .replace(/{{endDateString}}/gi, endDateString);
    invObj.listName = this.globalConstantService.listNames.Schedules.name;
    invObj.type = 'GET';
    TimeSpentbatchUrl.push(invObj);
    return TimeSpentbatchUrl;
  }

  async executeBatchRequest(batchUrl) {
    const response = await this.spService.executeBatch(batchUrl);
    const arrResults = response.length ? response.map(a => a.retItems) : [];
    return arrResults;
  }
  // tslint:disable
  fetchTasks(oUser, tasks) {
    for (const index in tasks) {
      if (tasks.hasOwnProperty(index)) {

        tasks[index].TotalAllocated = tasks[index].Task !== 'Adhoc' ?
          this.commonservice.convertToHrsMins('' + tasks[index].ExpectedTime).replace('.', ':')
          : tasks[index].TimeSpent.replace('.', ':');
        const sTimeZone = tasks[index].TimeZone === null ? '+5.5' : tasks[index].TimeZone;
        const currentUserTimeZone = (new Date()).getTimezoneOffset() / 60 * -1;
        tasks[index].StartDate = this.commonservice.calcTimeForDifferentTimeZone(new Date(tasks[index].StartDate), currentUserTimeZone, sTimeZone);
        tasks[index].DueDate = this.commonservice.calcTimeForDifferentTimeZone(new Date(tasks[index].DueDate), currentUserTimeZone, sTimeZone);
      }
    }
    return tasks;
  }




  async calculateAvailableHours(availableHrs) {

    const availableHrsArray = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    availableHrs.forEach(element => {

      const date = new Date(element.WeekStartDate);
      while (date <= new Date(element.WeekEndDate)) {

        const leaveHrs = element[days[date.getDay()] + 'Leave'] ? element[days[date.getDay()] + 'Leave'] : 0
        const availableHrsDay = element[days[date.getDay()]] - leaveHrs;

        availableHrsArray.push({ date: new Date(date), availableHrs: availableHrsDay });
        date.setDate(date.getDate() + 1);
      }
    });

    return availableHrsArray;
  }

  async fetchUserLeaveDetails(oCapacity, oUser, leaves, availableHrs) {
    oUser.leaves = [];
    let AvailableHrs = [];
    if (availableHrs) {
      AvailableHrs = await this.calculateAvailableHours(availableHrs);
    }

    for (const index in oCapacity.arrDateFormat) {
      if (oCapacity.arrDateFormat.hasOwnProperty(index)) {

        const temp = {
          date: oCapacity.arrDateFormat[index],
          userCapacity: AvailableHrs.find(c => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()) ? AvailableHrs.find(c => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()).availableHrs === 0 ? 'Leave' : oCapacity.arrDateRange[index] : oCapacity.arrDateRange[index],
          taskCount: 0,
          maxAvailableHours: AvailableHrs.find(c => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()) ? AvailableHrs.find(c => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()).availableHrs : oUser.maxHrs,
          totalTimeAllocated: 0,
          availableHrs: 0,
          TimeSpent: 0,

        };
        oUser.dates.push(temp);
      }
    }
    if (leaves.length > 0) {
      for (const i in leaves) {
        if (leaves.hasOwnProperty(i)) {
          let arrLeaves = [];
          let arrLeavesDates = [];
          arrLeaves = $.merge(arrLeaves, this.getDates(leaves[i].EventDate, leaves[i].EndDate, true).dateArray);
          if (!leaves[i].IsHalfDay) {
            arrLeavesDates = $.merge(arrLeavesDates, this.getDates(leaves[i].EventDate, leaves[i].EndDate, true).dateArray);
          }
          for (const j in arrLeaves) {
            if (arrLeaves.hasOwnProperty(j)) {
              // const sLeaveIndex = oUser.dates.map(function(e) { return e.userCapacity; }).indexOf(arrLeaves[j]);
              const mappedArray = oUser.dates.map(function (e) { return e.userCapacity; });
              const sLeaveIndex = mappedArray.map(Number).indexOf(+arrLeaves[j]);
              if (sLeaveIndex > -1) {
                if (leaves[i].IsHalfDay) {
                  oUser.dates[sLeaveIndex].maxAvailableHours = oUser.maxHrs > 0 ? +(oUser.maxHrs / 2) : 0;
                } else {
                  oUser.dates[sLeaveIndex].userCapacity = 'Leave';
                  oUser.dates[sLeaveIndex].maxAvailableHours = 0;
                }
              }
            }
          }
          if (arrLeavesDates.length) {
            $.merge(oUser.leaves, arrLeavesDates);
          }
        }
      }
    }
  }

  fetchUserCapacity(oUser, startDate, endDate) {

    const totalAllocatedPerUser = 0, totalUnAllocatedPerUser = 0;
    const arrTotalAllocatedPerUser = [], arrTotalAvailablePerUser = [];
    for (const i in oUser.dates) {
      if (oUser.dates.hasOwnProperty(i)) {
        const tasksDetails = [];

        if (oUser.dates[i].date.getDay() === 6 || oUser.dates[i].date.getDay() === 0) {
          oUser.dates[i].userCapacity = 'Leave';
          oUser.dates[i].maxAvailableHours = 0;
        }
        const bLeave = oUser.dates[i].userCapacity !== 'Leave' ? false : true;
        const arrHoursMins = [];
        const objTotalAllocatedPerUser = {
          timeHrs: '',
          timeMins: ''
        }, objTotalAvailablePerUser = {
          timeHrs: '',
          timeMins: ''
        };
        let taskCount = 0, totalTimeAllocatedPerDay = '0';
        for (const j in oUser.tasks) {
          if (oUser.tasks.hasOwnProperty(j)) {
            const taskStartDate = new Date(this.datepipe.transform(new Date(oUser.tasks[j].StartDate), 'MMM dd, yyyy'));
            const taskEndDate = new Date(this.datepipe.transform(new Date(oUser.tasks[j].DueDate), 'MMM dd, yyyy'));
            // const taskStartDate = new Date(new Date(oUser.tasks[j].StartDate));
            // const taskEndDate = new Date(new Date(oUser.tasks[j].DueDate));
            const taskBusinessDays = this.commonservice.calcBusinessDays(taskStartDate, taskEndDate);
            oUser.tasks[j].taskBusinessDays = taskBusinessDays;
            oUser.tasks[j].taskTotalDays = this.CalculateWorkingDays(taskStartDate, taskEndDate);

            let arrLeaveDays = [];
            if (oUser.leaves.length) {
              arrLeaveDays = oUser.leaves.filter(function (obj) {
                return obj >= taskStartDate && obj <= taskEndDate;
              });
            }
            if (oUser.tasks[j].Task !== 'Adhoc') {
              // tslint:disable
              oUser.tasks[j].timeAllocatedPerDay = this.commonservice.convertToHrsMins('' + this.getPerDayTime(oUser.tasks[j].ExpectedTime !== null ?
                oUser.tasks[j].ExpectedTime : '0', taskBusinessDays - arrLeaveDays.length));
              // tslint:enable
            } else {
              oUser.tasks[j].timeAllocatedPerDay = oUser.tasks[j].TimeSpent !== null ? '' + oUser.tasks[j].TimeSpent : '0.0';
            }
            if (oUser.dates[i].userCapacity === 'Leave') {
              oUser.tasks[j].timeAllocatedPerDay = '0:0';
            }
            if (oUser.dates[i].date >= taskStartDate && oUser.dates[i].date <= taskEndDate) {
              const TotalAllocatedTime = oUser.tasks[j].Task !== 'Adhoc' ? oUser.tasks[j].ExpectedTime : oUser.tasks[j].TimeSpent;
              taskCount++;
              const objTask = {
                title: oUser.tasks[j].Title,
                projectCode: oUser.tasks[j].Title !== null ? oUser.tasks[j].Title.split(' ')[0] : '',
                milestone: oUser.tasks[j].Milestone,
                SubMilestones: oUser.tasks[j].SubMilestones,
                task: oUser.tasks[j].Task,
                shortTitle: '',
                milestoneDeadline: '',
                startDate: oUser.tasks[j].StartDate,
                dueDate: oUser.tasks[j].DueDate,
                timeAllocatedPerDay: oUser.tasks[j].timeAllocatedPerDay,
                displayTimeAllocatedPerDay: oUser.tasks[j].timeAllocatedPerDay !== null ?
                  oUser.tasks[j].timeAllocatedPerDay.replace('.', ':') : oUser.tasks[j].timeAllocatedPerDay,
                status: oUser.tasks[j].Status,
                totalAllocatedTime: TotalAllocatedTime,
                displayTotalAllocatedTime: TotalAllocatedTime !== null ? oUser.tasks[j].Task !== 'Adhoc' ?
                  TotalAllocatedTime : TotalAllocatedTime.replace('.', ':') : TotalAllocatedTime,
                parentSlot: oUser.tasks[j].parentSlot ? oUser.tasks[j].parentSlot : ''
              };
              tasksDetails.push(objTask);
              const taskHrsMinObject = {
                timeHrs: '0',
                timeMins: '0'
              };
              taskHrsMinObject.timeHrs = oUser.tasks[j].timeAllocatedPerDay.replace('.', ':').split(':')[0];
              taskHrsMinObject.timeMins = oUser.tasks[j].timeAllocatedPerDay.replace('.', ':').split(':')[1];
              arrHoursMins.push(taskHrsMinObject);
            }
          }
        }
        oUser.dates[i].tasksDetails = tasksDetails;
        totalTimeAllocatedPerDay = arrHoursMins.length > 0 ? this.commonservice.ajax_addHrsMins(arrHoursMins) : '0:0';
        oUser.dates[i].totalTimeAllocatedPerDay = totalTimeAllocatedPerDay;
        objTotalAllocatedPerUser.timeHrs = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
          ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[0] : 0;
        objTotalAllocatedPerUser.timeMins = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
          ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[1] : 0;
        arrTotalAllocatedPerUser.push(objTotalAllocatedPerUser);
        const av = tasksDetails.filter(k => k.task === 'Blocking');
        if (av.length) {
          oUser.dates[i].availableHrs = '0:0';
          oUser.dates[i].displayAvailableHrs = oUser.dates[i].availableHrs;
          oUser.dates[i].displayAvailableHrsstring = oUser.dates[i].displayAvailableHrs.split(':')[0] + 'h:' +
            oUser.dates[i].displayAvailableHrs.split(':')[1] + 'm';
          oUser.dates[i].userCapacity = 'NotAvailable';
        } else {
          oUser.dates[i].availableHrs = this.commonservice.ajax_subtractHrsMins(
            this.commonservice.convertToHrsMins('' + oUser.dates[i].maxAvailableHours),
            totalTimeAllocatedPerDay.length > 0 ? totalTimeAllocatedPerDay.replace(':', '.') : 0);
          oUser.dates[i].displayAvailableHrs = oUser.dates[i].availableHrs;
          oUser.dates[i].displayAvailableHrsstring = oUser.dates[i].displayAvailableHrs.split(':')[0] + 'h:' +
            oUser.dates[i].displayAvailableHrs.split(':')[1] + 'm';
          if (+oUser.dates[i].availableHrs.replace(':', '.') > 0) {
            objTotalAvailablePerUser.timeHrs = oUser.dates[i].availableHrs.split(':')[0];
            objTotalAvailablePerUser.timeMins = oUser.dates[i].availableHrs.split(':')[1];
            arrTotalAvailablePerUser.push(objTotalAvailablePerUser);
          }
          if (+oUser.dates[i].availableHrs.replace(':', '.') <= 0) {
            oUser.dates[i].userCapacity = 'NotAvailable';
          } else if (+oUser.dates[i].availableHrs.replace(':', '.') > 0) {
            oUser.dates[i].userCapacity = 'Available';
          }
        }

        const allTimeSpentArray = oUser.TimeSpentTasks.filter(c => c.TimeSpentDate.getTime() === oUser.dates[i].date.getTime()) ?
          oUser.TimeSpentTasks.filter(c => c.TimeSpentDate.getTime() === oUser.dates[i].date.getTime()).map(c =>
            new Object({ timeHrs: c.TimeSpentPerDay.split(':')[0], timeMins: c.TimeSpentPerDay.split(':')[1] })) : [];

        oUser.dates[i].TimeSpent = allTimeSpentArray.length > 0 ? this.commonservice.ajax_addHrsMins(allTimeSpentArray) : '0:0';
        oUser.dates[i].TimeSpentstring = oUser.dates[i].TimeSpent.split(':')[0] + 'h:' +
          oUser.dates[i].TimeSpent.split(':')[1] + 'm';
        oUser.dates[i].taskCount = taskCount;
        if (bLeave) {
          oUser.dates[i].totalTimeAllocatedPerDay = 0;
          oUser.dates[i].availableHrs = 0;
          oUser.dates[i].userCapacity = 'Leave';
        }
        oUser.businessDays.push(oUser.dates[i].date);
      }
    }

    const ArrayTimespentPerDay = oUser.dates.map(c => new Object({
      timeHrs: c.TimeSpent.split(':')[0],
      timeMins: c.TimeSpent.split(':')[1]
    }));

    oUser.TotalTimeSpent = ArrayTimespentPerDay.length > 0 ? this.commonservice.ajax_addHrsMins(ArrayTimespentPerDay) : 0;

    oUser.totalAllocated = arrTotalAllocatedPerUser.length > 0 ? this.commonservice.ajax_addHrsMins(arrTotalAllocatedPerUser) : 0;
    oUser.totalUnAllocated = arrTotalAvailablePerUser.length > 0 ? this.commonservice.ajax_addHrsMins(arrTotalAvailablePerUser) : 0;
    oUser.displayTotalAllocated = oUser.totalAllocated === 0 ? '0:0' : oUser.totalAllocated;
    oUser.displayTotalUnAllocated = oUser.totalUnAllocated === 0 ? '0:0' : oUser.totalUnAllocated;
    oUser.displayTotalAllocatedExport = oUser.displayTotalAllocated.split(':')[0] + 'h:' +
      oUser.displayTotalAllocated.split(':')[1] + 'm';
    oUser.displayTotalUnAllocatedExport = oUser.displayTotalUnAllocated.split(':')[0] + 'h:' +
      oUser.displayTotalUnAllocated.split(':')[1] + 'm';
    oUser.displayTotalTimeSpent = oUser.TotalTimeSpent === 0 ? '0:0' : oUser.TotalTimeSpent;
    oUser.displayTotalTimeSpentExport = oUser.displayTotalTimeSpent.split(':')[0] + 'h:' +
      oUser.displayTotalTimeSpent.split(':')[1] + 'm';
    oUser.dayTasks = [];
    oUser.TimeSpentDayTasks = [];
  }


  CalculateWorkingDays(startDate, endDate) {
    let tempDate = new Date(startDate);
    let days = 1;
    while (endDate > tempDate) {
      tempDate = new Date(tempDate.setDate(tempDate.getDate() + 1));
      days += 1;
    }
    return days;
  }


  getPerDayTime(sTime, numberOfBusDays) {


    if (numberOfBusDays === 1) {
      return sTime;
    } else {
      let nTime = 0.0;
      if (sTime.indexOf('.') > -1) {
        const arrTime = sTime.split('.');
        const nTotalMins = parseFloat(arrTime[0]) * 60 + (parseFloat('0.' + arrTime[1]) * 60);
        const nTimePerDay = Math.round(nTotalMins / numberOfBusDays);
        const nHrs = nTimePerDay / 60;
        const nMins = nTimePerDay % 60;
        return nHrs + ':' + nMins;
      } else {
        nTime = parseFloat(sTime);
        return (nTime / numberOfBusDays).toFixed(2);
      }
    }
  }

  changeHeight(user, objt) {
    if (objt.currentTarget.classList[1] === 'more') {
      $(objt.currentTarget).parent().parent().next().find('div').not(':visible').addClass(user.uid + 'overFlowTasks');
      const height = +(user.maxHeight.split('px')[0]) > +(user.height.split('px')[0]) ? user.maxHeight : user.height;
      $('.' + user.uid + 'taskrow').css('height', height);
      $('.' + user.uid + 'overFlowTasks').show();
      $('.' + user.uid + 'more').hide();
      $('.' + user.uid + 'less').show();
    } else {
      $('.' + user.uid + 'taskrow').css('height', user.height);
      $('.' + user.uid + 'overFlowTasks').hide();
      $('.' + user.uid + 'more').show();
      $('.' + user.uid + 'less').hide();
    }
  }

  fetchProjectTaskDetails(user, tasks, date, objt) {


    if (tasks.length > 0) {
      // const oItem = $(objt.target).closest('.UserTasksRow').siblings('.TaskPerDayRow');
      $('.' + user.uid + 'loaderenable').show();
      const oItem = $(objt.target).closest('.UserTasksRow').find('.TaskPerDayRow');
      oItem.hide();
      oItem.find('#TasksPerDay').hide();
      oItem.find('.innerTableLoader').show();
      oItem.slideDown();
      setTimeout(() => {
        this.bindProjectTaskDetails(tasks, objt, user);
      }, 300);

      user.dates.map(c => delete c.backgroundColor);
      date.backgroundColor = '#ffeb9c';
      this.getColor(date);

    }
  }
  // tslint:disable
  async bindProjectTaskDetails(tasks, objt, user) {
    if (tasks.length > 0) {
      const batchUrl = [];
      const batchContents = new Array();
      const batchGuid = this.spService.generateUUID();
      for (const taskIndex in tasks) {
        if (tasks.hasOwnProperty(taskIndex)) {
          if (tasks[taskIndex].projectCode !== 'Adhoc') {
            // tslint:disable
            const piObj = Object.assign({}, this.queryConfig);
            piObj.url = this.spService.getReadURL(this.globalConstantService.listNames.ProjectInformation.name, this.sharedConstant.userCapacity.getProjectInformation);
            piObj.url = piObj.url.replace('{{projectCode}}', tasks[taskIndex].projectCode)
            piObj.listName = this.globalConstantService.listNames.ProjectInformation.name;
            piObj.type = 'GET';
            batchUrl.push(piObj);
            const tasksObj = Object.assign({}, this.queryConfig);
            tasksObj.url = this.spService.getReadURL(this.globalConstantService.listNames.Schedules.name, this.sharedConstant.userCapacity.getProjectTasks);
            tasksObj.url = tasksObj.url.replace('{{projectCode}}', tasks[taskIndex].projectCode).replace('{{milestone}}', tasks[taskIndex].milestone);
            tasksObj.listName = this.globalConstantService.listNames.Schedules.name;
            tasksObj.type = 'GET';
            batchUrl.push(tasksObj);

            // tslint:enable
          }
        }
      }
      if (batchUrl.length) {
        this.common.SetNewrelic('Shared', 'UserCapacity', 'getProInfoByPCAndTaskByPCandMilestone');
        let arrResults = await this.spService.executeBatch(batchUrl);
        arrResults = arrResults.length ? arrResults.map(a => a.retItems) : [];
        let nCount = 0;
        for (const i in tasks) {
          if (tasks.hasOwnProperty(i)) {
            if (tasks[i].projectCode !== 'Adhoc') {
              const arrProject = arrResults[nCount];
              if (arrProject.length > 0) {
                tasks[i].shortTitle = arrProject[0].WBJID;
              }
              const miltasks = arrResults[nCount + 1];
              if (miltasks.length && miltasks[0].ContentType.Name === 'Summary Task') {
                miltasks.splice(0, 1);
              }
              // tslint:disable
              for (const index in miltasks) {
                if (miltasks.hasOwnProperty(index)) {
                  const sTimeZone = miltasks[index].TimeZone === null ? "+5.5" : miltasks[index].TimeZone;
                  const currentUserTimeZone = (new Date()).getTimezoneOffset() / 60 * -1;
                  miltasks[index].StartDate = this.commonservice.
                    calcTimeForDifferentTimeZone(new Date(miltasks[index].StartDate), currentUserTimeZone, sTimeZone);
                  miltasks[index].DueDate = this.commonservice.
                    calcTimeForDifferentTimeZone(new Date(miltasks[index].DueDate), currentUserTimeZone, sTimeZone);
                }
              }
              miltasks.sort(function (a, b) {
                return a.StartDate - b.StartDate;
              });
              let lastSCTask = [];
              const scTasks = miltasks.filter(function (obj) {
                return obj.Task === 'Send to client';
              });
              if (scTasks.length > 0) {
                lastSCTask = scTasks.length > 0 ? scTasks.sort(function (a, b) {
                  return new Date(a.StartDate) < new Date(b.StartDate);
                }) : [];
              }

              tasks[i].milestoneTasks = miltasks;
              tasks[i].milestoneDeadline = lastSCTask.length > 0 ? lastSCTask[0].StartDate : '--';
              nCount = nCount + 2;
            }
          }
        }
      }
      user.dayTasks = tasks;

      $('.' + user.uid + 'loaderenable').hide();
      const oTd = $(objt.target).closest('td');
      // const oUserRow = $(objt.target).closest('.UserTasksRow').find('.TaskPerDayRow');

      // const oUserTaskRow = $(objt.target).next('TaskPerDayRow');

      const oUserTaskRow = $(objt.target).closest('.UserTasksRow').find('.TaskPerDayRow');
      oUserTaskRow.find('.innerTableLoader').slideUp(function () {
        oUserTaskRow.find('#TasksPerDay').slideDown();
      });
      oTd.parent().find('.highlightCell').removeClass('highlightCell');
      oTd.addClass('highlightCell');
      $('.innerTableLoader').hide();
    }
  }


  async fetchTimeSpentTaskDetails(user, date, objt) {
    if (user.TimeSpentTasks.length > 0) {
      const SpentTasks = user.TimeSpentTasks.filter(c => c.TimeSpentDate.getTime() === date.date.getTime() && c.TimeSpentPerDay !== '00:00' && c.TimeSpentPerDay !== '0:00');
      if (SpentTasks.length > 0) {
        user.TimeSpentDayTasks = SpentTasks;
        // $('.' + user.uid + 'spentloaderenable').show();
        const oItem = $(objt.target).closest('.spenttaskRow').next('tr');
        oItem.hide();
        oItem.find('#spentTasksPerDay').hide();
        oItem.slideDown();
        oItem.find('.innerspentTableLoader').show();
        $(objt.target).closest('td').siblings().closest('.highlightCell').removeClass('highlightCell')
        $(objt.target).closest('td').addClass('highlightCell');

        const batchUrl = [];
        for (const taskIndex in SpentTasks) {
          if (SpentTasks.hasOwnProperty(taskIndex)) {
            if (SpentTasks[taskIndex].projectCode !== 'Adhoc') {
              // tslint:disable
              const piObj = Object.assign({}, this.queryConfig);
              piObj.url = this.spService.getReadURL(this.globalConstantService.listNames.ProjectInformation.name, this.sharedConstant.userCapacity.getProjectInformation);
              piObj.url = piObj.url.replace('{{projectCode}}', SpentTasks[taskIndex].projectCode)
              piObj.listName = this.globalConstantService.listNames.ProjectInformation.name;
              piObj.type = 'GET';
              batchUrl.push(piObj);
            }
          }
        }

        if (batchUrl.length) {
          this.common.SetNewrelic('Shared', 'UserCapacity', 'getProInfoByPC');
          let arrResults = await this.spService.executeBatch(batchUrl);
          arrResults = arrResults.length ? arrResults.map(a => a.retItems) : [];
          let nCount = 0;
          for (const i in SpentTasks) {
            if (SpentTasks.hasOwnProperty(i)) {
              if (SpentTasks[i].projectCode !== 'Adhoc') {
                const arrProject = arrResults[i];
                if (arrProject.length > 0) {
                  SpentTasks[i].shortTitle = arrProject[0].WBJID;
                }
              }
            }
          }
        }



        oItem.find('#spentTasksPerDay').show();
        oItem.find('.innerspentTableLoader').hide();

        user.dates.map(c => delete c.TimespentbackgroundColor);
        date.TimespentbackgroundColor = '#ffeb9c';
        this.getTimeSpentColorExcel(date, date.date, user.GoLiveDate);
      }

    }
  }

  showCapacity(oCapacity) {
    this.oCapacity = oCapacity;
    this.calc(this.oCapacity);
  }

  calc(oCapacity) {
    const arrDateRange = oCapacity.arrDateFormat.length;
    this.loaderenable = false;


    if (arrDateRange <= 10) {

      setTimeout(() => {
        let tableWidth = document.getElementById('capacityTable').offsetWidth;

        tableWidth = tableWidth === 0 ? (document.getElementsByClassName("userCapacity") ? document.getElementsByClassName("userCapacity")[0].parentElement.offsetWidth : 1192) : tableWidth;

        this.pageWidth = tableWidth + 'px';

        const totalCellWidth = tableWidth - (tableWidth * 18 / 100);
        const firstCellWidth = tableWidth * 6 / 100;
        const eachColumnWidth = totalCellWidth / arrDateRange;
        const users = oCapacity.arrUserDetails;
        for (const i in users) {
          if (users.hasOwnProperty(i)) {
            let top = 0;
            this.height = '80px';
            users[i].height = '80px';
            users[i].maxHeight = (users[i].tasks.length * 18) + 27 + 'px';
            this.verticalAlign = 'top';
            for (const j in users[i].tasks) {
              if (users[i].tasks.hasOwnProperty(j)) {
                const startDate = new Date(new Date(users[i].tasks[j].StartDate).toDateString()); // format('MMM dd, yyyy'));
                let dateIndex = oCapacity.arrUserDetails[0].businessDays.findIndex(function (x) {
                  return x.valueOf() === startDate.valueOf();
                });
                let nBusinessDays = users[i].tasks[j].taskTotalDays;
                if (dateIndex < 0) {
                  const tblStartDate = new Date(users[i].businessDays[0]);
                  const taskStartDate = new Date(this.datepipe.transform(users[i].tasks[j].StartDate, 'MMM dd yyyy')); // .format('MMM dd yyyy')
                  const nDays = this.commonservice.calcBusinessDays(taskStartDate, tblStartDate) - 1;
                  nBusinessDays = nBusinessDays - nDays;
                }
                dateIndex = dateIndex < 0 ? 0 : dateIndex;
                let availableIndex = arrDateRange - dateIndex;
                availableIndex = availableIndex >= nBusinessDays ? nBusinessDays : availableIndex;
                const left = eachColumnWidth * (dateIndex) + firstCellWidth;
                const width = eachColumnWidth * availableIndex;
                users[i].tasks[j].cssWidth = width + 'px';
                users[i].tasks[j].cssLeft = left + 'px';
                users[i].tasks[j].cssTop = top + 'px';
                if (+j >= 3) {
                  users[i].tasks[j].cssHide = 'none';
                }
                top = top + 18;
              }
            }
          }
        }
        setTimeout(() => {
          this.messageService.clear('myKey1');
        }, 500);
      }, 500);

    } else {
      this.height = 'inherit';
      this.verticalAlign = 'middle';
      setTimeout(() => {
        this.messageService.clear('myKey1');
      }, 500);
    }




  }

  getMilestoneTasks(task) {

    const ref = this.dialogService.open(MilestoneTasksDialogComponent, {
      data: {
        task
      },
      header: task.title,
      width: '90vw',
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
    });
    ref.onClose.subscribe(async (tasks: any) => {
    });
  }


  collpaseTable(objt, user, type) {
    if (type === 'available') {
      const oCollpase = $(objt).closest('.TaskPerDayRow');
      oCollpase.prev().prev().find('.highlightCell').removeClass('highlightCell');
      oCollpase.slideUp();
      user.dayTasks = [];
      user.dates.map(c => delete c.backgroundColor);
    }
    else {
      const oCollpase = $(objt).closest('.SpentTaskPerDayRow');
      oCollpase.prev().find('.highlightCell').removeClass('highlightCell');
      oCollpase.slideUp();
      user.TimeSpentDayTasks = [];
      user.dates.map(c => delete c.TimespentbackgroundColor);
    }
  }


  getColor(date) {
    if (date.backgroundColor) {
      return 'orange';
    }

    switch (date.userCapacity) {
      case 'Leave':
        return '#808080';
      case 'NotAvailable':
        return '#EF3D3D';
      case 'Available':
        return '#55bf3b';
    }
  }

  getTimeSpentColorExcel(dateObj, date, GoLiveDate) {
    if (dateObj.TimespentbackgroundColor) {
      return 'orange';
    }
    if (GoLiveDate !== null && new Date(this.datepipe.transform(date, 'MM/dd/yyyy')) >= new Date(this.datepipe.transform(GoLiveDate, 'MM/dd/yyyy'))) {
      return '#ccffcc';
    }
    else {
      return '#ffffff';
    }
  }

  getTimeSpentBColor(date, GoLiveDate) {
    if (GoLiveDate !== null && new Date(this.datepipe.transform(date, 'MM/dd/yyyy')) >= new Date(this.datepipe.transform(GoLiveDate, 'MM/dd/yyyy'))) {
      return 'colorgoLive';
    }
    else {
      return 'colortrainee';
    }
  }


  async SplitfetchTasks(tasks) {

    let ReturnTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      const timeSpentForTask = tasks[i].TimeSpentPerDay ? tasks[i].TimeSpentPerDay.split(/\n/) : [];
      if (timeSpentForTask.indexOf('') > -1) {
        timeSpentForTask.splice(timeSpentForTask.indexOf(''), 1);
      }
      timeSpentForTask.forEach(element => {
        ReturnTasks.push(new Object({
          Title: tasks[i].Title,
          projectCode: tasks[i].ProjectCode,
          StartDate: tasks[i].Actual_x0020_Start_x0020_Date,
          EndDate: tasks[i].Actual_x0020_End_x0020_Date ? tasks[i].Actual_x0020_End_x0020_Date : tasks[i].DueDate,
          TimeSpentDate: new Date(element.split(':')[0]),
          TimeSpentPerDay: element.split(':')[1] + ':' + element.split(':')[2],
          Status: tasks[i].Status,
          TotalTimeSpent: tasks[i].TimeSpent.replace('.', ':'),
          SubMilestones: tasks[i].SubMilestones,
          shortTitle: '',
        }));
      });
    }
    return ReturnTasks;
  }





  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calc(this.oCapacity);
  }

}
