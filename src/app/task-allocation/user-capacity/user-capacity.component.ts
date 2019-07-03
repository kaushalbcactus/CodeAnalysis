import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import { DynamicDialogRef,DialogService, DynamicDialogConfig, MessageService, ConfirmationService } from 'primeng/api';
declare const _spPageContextInfo;
declare var $: any;
@Component({
  selector: 'app-user-capacity',
  templateUrl: './user-capacity.component.html',
  styleUrls: ['./user-capacity.component.css']
})
export class UserCapacityComponent implements OnInit {

  @Input() id: string;
  public oCapacity = {
    arrDateRange: [],
    arrDateFormat: [],
    arrUserDetails: []
  };
  data:any;
  private leaveCalendar = this.constants.listNames.LeaveCalendar;
  private Schedules = this.constants.listNames.Schedules;
  public sUserCapacity = this.sharedObject.oTaskAllocation.userCapacity;
  height: string;
  verticalAlign: string;
  loaderenable : boolean=false;

  constructor(public datepipe: DatePipe, 
    private spService: SharepointoperationService,
    private sharedObject: GlobalService, 
    private constants: ConstantsService,
    private commonService: CommonService,
    private taskAllocationService: TaskAllocationConstantsService,
    public config: DynamicDialogConfig) { }

  ngOnInit() {

    this.data =this.config.data;
    
    if(this.data !== undefined)
    {
    
      this.applyFilter(this.data.task,this.data.user);
      this.loaderenable =true;
    }
    
  }

  disableCapacity() {
    this.oCapacity = {
      arrDateRange: [],
      arrDateFormat: [],
      arrUserDetails: []
    };
  }
  async applyFilter(milestoneTask, selectedUsers) {
 
    this.oCapacity = {
      arrDateRange: [],
      arrDateFormat: [],
      arrUserDetails: []
    };
   
    let startDateString = this.datepipe.transform(milestoneTask.pStart, 'yyyy-MM-dd') + 'T00:00:01.000Z';
    let endDateString = this.datepipe.transform(milestoneTask.pEnd, 'yyyy-MM-dd') + 'T23:59:00.000Z';
    const sTopStartDate = milestoneTask.pStart;
   const sTopEndDate = milestoneTask.pEnd;
    const obj = {
      arrDateRange: [],
      arrDateFormat: []
    };
    obj.arrDateRange = this.getDates(milestoneTask.pStart, milestoneTask.pEnd).dateArray;
    obj.arrDateFormat = this.getDates(milestoneTask.pStart, milestoneTask.pEnd).dateArray;
    this.oCapacity.arrDateRange = obj.arrDateRange;
    this.oCapacity.arrDateFormat = obj.arrDateFormat;
    
    const batchGuid = this.spService.generateUUID();
    let batchContents = new Array();


    for (const userIndex in selectedUsers) {
    if (selectedUsers.hasOwnProperty(userIndex)) {
      if (selectedUsers[userIndex]) {
          const oUser = {
              uid : '',
              userName : '',
              maxHrs : '',
              dates: [],
              tasks: [],
              leaves: [],
              businessDays: [],
              totalAllocated : 0,
              totalUnAllocated: 0
          };
          const userDetail = this.sharedObject.oTaskAllocation.oResources.filter(function(objt) {
            const userID = selectedUsers[userIndex].UserName ? selectedUsers[userIndex].UserName.ID : selectedUsers[userIndex];
              return objt.UserName.ID === userID;
          });
          if (userDetail.length > 0) {
              oUser.uid = userDetail[0].UserName.ID;
              oUser.userName = userDetail[0].UserName.Title;
              oUser.maxHrs = userDetail[0].MaxHrs;
 
              let userCapacityCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.userCapacity);
              userCapacityCall.filter = userCapacityCall.filter.replace(/{{selectedUserID}}/gi, oUser.uid).replace(/{{startDateString}}/gi,startDateString).replace(/{{endDateString}}/gi,endDateString);


            
              const userCapacityUrl = this.spService.getReadURL('' + this.constants.listNames.Schedules + '', userCapacityCall);
              this.spService.getBatchBodyGet(batchContents, batchGuid, userCapacityUrl);
 
              this.oCapacity.arrUserDetails.push(oUser);
          }
        }
      }
    }
    // batchContents.push('--batch_' + batchGuid + '--');
    // const userBatchBody = batchContents.join('\r\n');

    const arrResults = await this.spService.getDataByApi(batchGuid, batchContents);


    //const arrResults = this.executeBatchRequest(batchGuid, userBatchBody);
    batchContents = new Array();
    for (const indexUser in this.oCapacity.arrUserDetails) {
      if (this.oCapacity.arrUserDetails.hasOwnProperty(indexUser)) {
        this.oCapacity.arrUserDetails[indexUser].tasks = this.fetchTasks(this.oCapacity.arrUserDetails[indexUser], arrResults[indexUser]);
        if (this.oCapacity.arrUserDetails[indexUser].tasks.length) {
            this.oCapacity.arrUserDetails[indexUser].tasks.sort(function (a, b) {
                return b.DueDate - a.DueDate;
            });
            // tslint:disable
            endDateString = new Date(sTopEndDate) > new Date(this.datepipe.transform(this.oCapacity.arrUserDetails[indexUser].tasks[0].DueDate,'yyyy-MM-ddT') + "23:59:00.000Z")
                            ? sTopEndDate.toISOString() : this.datepipe.transform(this.oCapacity.arrUserDetails[indexUser].tasks[0].DueDate,'yyyy-MM-ddT') + "23:59:00.000Z";
            this.oCapacity.arrUserDetails[indexUser].tasks.sort(function (a, b) {
                return a.StartDate - b.StartDate;
            });
            startDateString = new Date(sTopStartDate) <new Date(this.datepipe.transform(this.oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,'yyyy-MM-ddT') + "00:00:01.000Z")
                              ? sTopStartDate.toISOString() : this.datepipe.transform(this.oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,'yyyy-MM-ddT') + "00:00:01.000Z";
            // tslint: enable
        }
        else {
            startDateString = sTopStartDate.toISOString();
            endDateString = sTopEndDate.toISOString();
        }

    

        let userCapacityEndPointcall = Object.assign({}, this.taskAllocationService.taskallocationComponent.userCapacityEndPoint);
        userCapacityEndPointcall.filter = userCapacityEndPointcall.filter.replace(/{{arrUserDetailsuid}}/gi,this.oCapacity.arrUserDetails[indexUser].uid).replace(/{{startDateString}}/gi,startDateString).replace(/{{endDateString}}/gi,endDateString);



        const userCapacityEndPointUrl = this.spService.getReadURL('' + this.constants.listNames.LeaveCalendar + '', userCapacityEndPointcall);
        this.spService.getBatchBodyGet(batchContents, batchGuid, userCapacityEndPointUrl);




        // var endpoint = _spPageContextInfo.webAbsoluteUrl
        // +"/_api/web/lists/getbytitle('" + this.leaveCalendar+ "')/items?$select=ID,EventDate,EndDate,IsHalfDay&$top=4500&$orderby=Created&$filter=(Author/Id eq "+this.oCapacity.arrUserDetails[indexUser].uid+")and("+
        // "(EventDate ge '"+startDateString+"' and EventDate le '"+endDateString+"') or (EndDate ge '"+startDateString+"' and EndDate le '"+endDateString+"') or (EventDate le '"+startDateString+"' and EndDate ge '"+endDateString+"'))";
        // this.spService.getBatchBodyGet(batchContentsLeaves, batchGuid, endpoint);
      }
    }


    var arrLeaves =  await this.spService.getDataByApi(batchGuid, batchContents);

    for(var index in this.oCapacity.arrUserDetails) {
      if(this.oCapacity.arrUserDetails.hasOwnProperty(index)) {
        this.fetchUserLeaveDetails(this.oCapacity.arrUserDetails[index], arrLeaves[index]);
        this.fetchUserCapacity(this.oCapacity.arrUserDetails[index],milestoneTask.pStart,milestoneTask.pEnd);
      }
    }
    if(this.oCapacity.arrUserDetails.length>0)
    {

      setTimeout(() => {
        this.calc();
       
        // $('#capacityTable').show();
        // $('.Loader').slideUp();
        // $('.capacityDashboard').show();
        // $(".TaskPerDayRow").hide();
        // $(".less").hide();
      }, 100);
    }
  }


  // fetchData(oUser, startDateString, endDateString, batchGuid, batchContents) {
  //   const selectedUserID = oUser.uid;
  //   // tslint:disable
  //   const endpoint = _spPageContextInfo.webAbsoluteUrl
  //   +"/_api/web/lists/getbytitle('" + this.Schedules + "')/items?$select=ID,Milestone,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDate,TimeZone&$top=4500&$filter=(AssignedTo/Id eq "+selectedUserID+") and("+
  //   "(StartDate ge '"+startDateString+"' and StartDate le '"+endDateString+"') or (DueDate ge '"+startDateString+"' and DueDate le '"+endDateString+"') or (StartDate le '"+startDateString+"' and DueDate ge '"+endDateString+"')"+
  //   ") and Status ne 'Abandon' and Status ne 'Deleted'&$orderby=StartDate";
  //   // tslint:enable
  //   return this.spService.getBatchBodyGet(batchContents, batchGuid, endpoint);
  // }

 
  fetchTasks(oUser, tasks) {
    for (const index in tasks) {
      if (tasks.hasOwnProperty(index)) {
        tasks[index].ProjectCode = tasks[index].Title.split(' ')[0];
        tasks[index].ExpectedTime = tasks[index].ExpectedTime ? tasks[index].ExpectedTime : '0';
        tasks[index].TotalAllocated = tasks[index].Task !== 'Adhoc' ?
                                      this.commonService.convertToHrsMins('' + tasks[index].ExpectedTime).replace('.', ':')
                                      : tasks[index].TimeSpent.replace('.', ':');
        const sTimeZone = tasks[index].TimeZone;
            tasks[index].StartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(tasks[index].StartDate),
            this.sharedObject.currentUser.timeZone, sTimeZone);
            tasks[index].DueDate = this.commonService.calcTimeForDifferentTimeZone(new Date(tasks[index].DueDate),
            this.sharedObject.currentUser.timeZone, sTimeZone);
      }
    }
    return tasks;
  }



  fetchUserLeaveDetails(oUser, leaves) {
    oUser.leaves = [];
    for (const index in this.oCapacity.arrDateFormat) {
      if (this.oCapacity.arrDateFormat.hasOwnProperty(index)) {
            const temp = {
              date : this.oCapacity.arrDateFormat[index],
              userCapacity : this.oCapacity.arrDateRange[index],
              taskCount : 0,
              maxAvailableHours : oUser.maxHrs,
              totalTimeAllocated : 0,
              availableHrs : 0
            };
            oUser.dates.push(temp);
      }
    }
    if (leaves.length > 0) {
        for (const i in leaves) {
          if (leaves.hasOwnProperty(i)) {
            let arrLeaves = [];
            let arrLeavesDates = [];
            arrLeaves = $.merge(arrLeaves, this.getDates(leaves[i].EventDate, leaves[i].EndDate).dateArray);
            if (!leaves[i].IsHalfDay) {
                arrLeavesDates = $.merge(arrLeavesDates, this.getDates(leaves[i].EventDate, leaves[i].EndDate).dateArray);
            }
            for (const j in arrLeaves) {
              if (arrLeaves.hasOwnProperty(j)) {
                //const sLeaveIndex = oUser.dates.map(function(e) { return e.userCapacity; }).indexOf(arrLeaves[j]);
                const mappedArray = oUser.dates.map(function(e) { return e.userCapacity; });
                const sLeaveIndex = mappedArray.map(Number).indexOf(+arrLeaves[j]); 
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
                const taskBusinessDays = this.commonService.calcBusinessDays(taskStartDate, taskEndDate);
                oUser.tasks[j].taskBusinessDays = taskBusinessDays;

                let arrLeaveDays = [];
                if (oUser.leaves.length) {
                    arrLeaveDays = oUser.leaves.filter(function(obj) {
                        return obj >= taskStartDate && obj <= taskEndDate;
                    });
                }
                if (oUser.tasks[j].Task !== 'Adhoc') {
                  // tslint:disable
                    oUser.tasks[j].timeAllocatedPerDay = this.commonService.convertToHrsMins('' + this.getPerDayTime(oUser.tasks[j].ExpectedTime !== null ?
                                                        oUser.tasks[j].ExpectedTime : '0', taskBusinessDays - arrLeaveDays.length));
                  // tslint:enable
                } else {
                    oUser.tasks[j].timeAllocatedPerDay = oUser.tasks[j].TimeSpent !== null ? '' + oUser.tasks[j].TimeSpent.replace('.', ':') : '0:0';
                }
                if (oUser.dates[i].userCapacity === 'Leave') {
                    oUser.tasks[j].timeAllocatedPerDay = '0:0';
                }
                if (oUser.dates[i].date >= taskStartDate && oUser.dates[i].date <= taskEndDate) {
                  const totalAllocatedTime = oUser.tasks[j].Task !== 'Adhoc' ? oUser.tasks[j].ExpectedTime : oUser.tasks[j].TimeSpent;
                    taskCount++;
                    const objTask = {
                      title : oUser.tasks[j].Title,
                      projectCode : oUser.tasks[j].Title !== null ? oUser.tasks[j].Title.split(' ')[0] : '',
                      milestone : oUser.tasks[j].Milestone,
                      shortTitle : '',
                      milestoneDeadline : '',
                      startDate : oUser.tasks[j].StartDate,
                      dueDate : oUser.tasks[j].DueDate,
                      timeAllocatedPerDay :  oUser.tasks[j].timeAllocatedPerDay.replace('.', ':'),
                      displayTimeAllocatedPerDay : oUser.tasks[j].timeAllocatedPerDay !== null ?
                      oUser.tasks[j].timeAllocatedPerDay.replace('.', ':') : oUser.tasks[j].timeAllocatedPerDay,
                      status : oUser.tasks[j].Status,
                      totalAllocatedTime : totalAllocatedTime.replace('.', ':') ,
                      displayTotalAllocatedTime : totalAllocatedTime !== null ? oUser.tasks[j].Task !== 'Adhoc' ?
                        totalAllocatedTime : totalAllocatedTime.replace('.', ':') : totalAllocatedTime
                    };
                    tasksDetails.push(objTask);
                    const taskHrsMinObject = {
                      timeHrs: '0',
                      timeMins: '0'
                    };
                    taskHrsMinObject.timeHrs = oUser.tasks[j].timeAllocatedPerDay.split(':')[0];
                    taskHrsMinObject.timeMins = oUser.tasks[j].timeAllocatedPerDay.split(':')[1];
                    arrHoursMins.push(taskHrsMinObject);
                }
              }
            }
            oUser.dates[i].tasksDetails = tasksDetails;
            totalTimeAllocatedPerDay = arrHoursMins.length > 0 ? this.commonService.ajax_addHrsMins(arrHoursMins) : '0:0';
            oUser.dates[i].totalTimeAllocatedPerDay = totalTimeAllocatedPerDay;
            objTotalAllocatedPerUser.timeHrs = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
                                                    ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[0] : 0;
            objTotalAllocatedPerUser.timeMins = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
                                                    ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[1] : 0;
            arrTotalAllocatedPerUser.push(objTotalAllocatedPerUser);
            oUser.dates[i].availableHrs = this.commonService.ajax_subtractHrsMins(
                                          this.commonService.convertToHrsMins('' + oUser.dates[i].maxAvailableHours),
                                          totalTimeAllocatedPerDay.length > 0 ? totalTimeAllocatedPerDay.replace(':', '.') : 0);
            oUser.dates[i].displayAvailableHrs = oUser.dates[i].availableHrs.toString();
            if (+oUser.dates[i].availableHrs.replace(':', '.') > 0) {
                objTotalAvailablePerUser.timeHrs = oUser.dates[i].availableHrs.split(':')[0];
                objTotalAvailablePerUser.timeMins = oUser.dates[i].availableHrs.split(':')[1];
                arrTotalAvailablePerUser.push(objTotalAvailablePerUser);
            }
            oUser.dates[i].taskCount = taskCount;
            if (+oUser.dates[i].availableHrs.replace(':', '.') <= 0) {
                oUser.dates[i].userCapacity = 'NotAvailable';
            } else if (+oUser.dates[i].availableHrs.replace(':', '.') > 0) {
                oUser.dates[i].userCapacity = 'Available';
            }
        if (bLeave) {
            oUser.dates[i].totalTimeAllocatedPerDay = 0;
            oUser.dates[i].availableHrs = 0;
            oUser.dates[i].userCapacity = 'Leave';
        }
        oUser.businessDays.push(oUser.dates[i].date);
      }
    }
    oUser.totalAllocated = arrTotalAllocatedPerUser.length > 0 ? this.commonService.ajax_addHrsMins(arrTotalAllocatedPerUser) : '0';
    oUser.totalUnAllocated = arrTotalAvailablePerUser.length > 0 ? this.commonService.ajax_addHrsMins(arrTotalAvailablePerUser) : '0';
    oUser.displayTotalAllocated = oUser.totalAllocated;
    this.sUserCapacity.totalAllocated = oUser.totalAllocated;
    oUser.displayTotalUnAllocated = oUser.totalUnAllocated;
    this.sUserCapacity.totalUnallocated = oUser.totalUnAllocated;
    oUser.dayTasks = [];
  }

  ajax_subtractHrsMins(elem1, elem2) {
      let result = 0;
      let negative = false;
      let total = 0;
      elem1 = elem1.indexOf('.') > -1 ||  elem1.indexOf(':') > -1 ? elem1 : elem1 + '.00';
      elem2 = elem2.indexOf('.') > -1 ||  elem1.indexOf(':') > -1 ? elem2 : elem2 + '.00';
      const totalMinsElem1 = elem1.indexOf('.') > -1 ? +(elem1.split('.')[0]) * 60 + +(elem1.split('.')[1]) :
                             +(elem1.split(':')[0]) * 60 + +(elem1.split(':')[1]);
      const totalMinsElem2 = elem2.indexOf('.') > -1 ? +(elem2.split('.')[0]) * 60 + +(elem2.split('.')[1]) :
                             +(elem2.split(':')[0]) * 60 + +(elem2.split(':')[1]);
      if (totalMinsElem2 > totalMinsElem1) {
        negative = true;
        total = totalMinsElem2 - totalMinsElem1;
      } else {
        negative = false;
        total = totalMinsElem1 - totalMinsElem2;
      }
      if (negative) {
          result = -total / 60;
      } else {
          result = total / 60 ;
      }
      return this.convertToHrsMins('' + result);
    }


    convertToHrsMins(hours) {
      if (hours != null) {
          if (hours.indexOf(':') > -1 || hours.indexOf('.') > -1) {
              hours = parseFloat(hours).toFixed(2).toString();
              const hrs = hours.indexOf(':') > -1 ? hours.split(':')[0] : hours.split('.')[0];
              let mins = hours.indexOf(':') > -1 ? hours.split(':')[1] : hours.split('.')[1];
              mins = mins * (60 / 100);
              mins = mins < 10 && mins > 0 ? '0' + Math.round(mins) : Math.round(mins);
              return hrs + ':' + mins;
          } else if (hours.indexOf('.') === -1 || hours.indexOf(':') === -1) {
              return hours + ':0';
          }
      } else {
          return '0:0';
      }
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

  getDates(startDate, stopDate) {

   
    const objDates = {
        dateStringArray: [],
        dateArray: []
    };

    let currentDate = new Date(startDate);
    currentDate = new Date(currentDate.setHours(0,0,0,0));
    let newStopDate = new Date(stopDate);
    newStopDate = new Date(newStopDate.setHours(23,59,59,0)); 

    while (currentDate <= newStopDate) {
        if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
            objDates.dateArray.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return objDates;
  }

  
  calc() {
    const arrDateRange = this.oCapacity.arrDateFormat.length;
    if (arrDateRange <= 10) {
        const tableWidth = $('.UserTasksRow').width();
        const totalCellWidth = tableWidth - (tableWidth * 18 / 100);
        const firstCellWidth = (tableWidth * 6 / 100);
        const eachColumnWidth = totalCellWidth / arrDateRange;
        const users = this.oCapacity.arrUserDetails;
        for (const i in users) {
          if (users.hasOwnProperty(i)) {
            let top = 0;
            this.height = '75px';
            users[i].height = '75px';
            users[i].maxHeight = (users[i].tasks.length * 18) + 21 + 'px';
            this.verticalAlign = 'top';
            for (const j in users[i].tasks) {
              if (users[i].tasks.hasOwnProperty(j)) {
                const startDate = new Date(new Date(users[i].tasks[j].StartDate).toDateString()); // format('MMM dd, yyyy'));
                let dateIndex = this.oCapacity.arrUserDetails[0].businessDays.findIndex(function(x) {
                    return x.valueOf() === startDate.valueOf();
                });
                let nBusinessDays = users[i].tasks[j].taskBusinessDays;
                if (dateIndex < 0) {
                    const tblStartDate = new Date(users[i].businessDays[0]);
                    const taskStartDate = new Date(this.datepipe.transform(users[i].tasks[j].StartDate,'MMM dd yyyy'));
                    const nDays = this.commonService.calcBusinessDays(taskStartDate, tblStartDate) - 1;
                    nBusinessDays = nBusinessDays - nDays;
                }
                dateIndex = dateIndex < 0 ? 0 : dateIndex;
                let availableIndex = arrDateRange - dateIndex;
                availableIndex =  availableIndex >= nBusinessDays ? nBusinessDays : availableIndex;
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
    } else {
          //  this.height = 'inherit';
         //   this.verticalAlign = 'middle';
    }

    this.loaderenable =false;
  }

  gettaskCSS(i: string) {
    return i;
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

}
