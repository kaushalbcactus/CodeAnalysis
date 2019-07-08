import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { GlobalService } from 'src/app/Services/global.service';
declare var $;
@Component({
  selector: 'app-usercapacity',
  templateUrl: './usercapacity.component.html',
  styleUrls: ['./usercapacity.component.css']
})
export class UsercapacityComponent implements OnInit {
  public oCapacity = {
    arrUserDetails: [],
    arrDateRange : [],
    arrResources : [],
    arrDateFormat: [],
  };
  //tslint:disable
  public modalReference = null;
  private Schedules = this.constants.listNames.Schedules.name;
  private ProjectInformation = this.constants.listNames.ProjectInformation.name;
  private leaveCalendar = this.constants.listNames.LeaveCalendar.name;
  public clickedTaskTitle = '';
  public milestoneTasks = [];
  public height = '';
  public verticalAlign = '';
  constructor(
    public datepipe: DatePipe,
    private modalService: NgbModal, 
    private spService: SharepointoperationService, 
    private pmObject: PMObjectService,
    private constants: ConstantsService,
    private pmCommonService: PMCommonService,
    private sharedObject: GlobalService) { }

  ngOnInit() {
  }
  getMonday(d, NextLast, weeks) {
    d = new Date(d);
    const day = d.getDay(),
        diff = (NextLast === 'Next' ? d.getDate() + ( 7 * weeks) : NextLast === 'Last' ?
                d.getDate() - ( 7 * weeks ) : d.getDate()) - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  getDates(startDate, stopDate) {
    const objDates = {
        dateStringArray: [],
        dateArray: []
    };
    let currentDate = new Date(startDate);
    currentDate = new Date(currentDate.setHours(0,0,0,0));
    let newStopDate = new Date(stopDate);
    newStopDate = new Date(newStopDate.setHours(23,59,59,0));
    while (currentDate <= newStopDate) {
        if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
            objDates.dateArray.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return objDates;
  }
  applyFilter(startDate, endDate, selectedUsers) {
      const oCapacity = {
        arrUserDetails: [],
        arrDateRange : [],
        arrResources : [],
        arrDateFormat: []
      };
    let startDateString = this.datepipe.transform(startDate, 'yyyy-MM-dd') + 'T00:00:01.000Z';
    let endDateString = this.datepipe.transform(endDate, 'yyyy-MM-dd') + 'T23:59:00.000Z';
    const sTopStartDate = startDate;
    const sTopEndDate = endDate;
    const obj = {
      arrDateRange: [],
      arrDateFormat: []
    };
    obj.arrDateRange = this.getDates(startDate, endDate).dateArray;
    obj.arrDateFormat = this.getDates(startDate, endDate).dateArray;
    oCapacity.arrDateRange = obj.arrDateRange;
    oCapacity.arrDateFormat = obj.arrDateFormat;
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
          const userDetail = [selectedUsers[userIndex]];
          if (userDetail.length > 0) {
              oUser.uid = userDetail[0].UserName.ID;
              oUser.userName = userDetail[0].UserName.Title;
              oUser.maxHrs = userDetail[0].MaxHrs;
              batchContents = this.fetchData(oUser, startDateString, endDateString, batchGuid, batchContents);
              oCapacity.arrUserDetails.push(oUser);
          }
        }
      }
    }
    batchContents.push('--batch_' + batchGuid + '--');
    const userBatchBody = batchContents.join('\r\n');
    const arrResults = this.executeBatchRequest(batchGuid, userBatchBody);
    const batchContentsLeaves = new Array();
    for (const indexUser in oCapacity.arrUserDetails) {
      if (oCapacity.arrUserDetails.hasOwnProperty(indexUser)) {
        oCapacity.arrUserDetails[indexUser].tasks = this.fetchTasks(oCapacity.arrUserDetails[indexUser], arrResults[indexUser]);
        if (oCapacity.arrUserDetails[indexUser].tasks && oCapacity.arrUserDetails[indexUser].tasks.length) {
            oCapacity.arrUserDetails[indexUser].tasks.sort(function (a, b) {
                return b.DueDate - a.DueDate;
            });
            // tslint:disable
            // endDateString = new Date(sTopEndDate) > new Date(oCapacity.arrUserDetails[indexUser].tasks[0].DueDate.format('yyyy-MM-ddT') + "23:59:00.000Z")
            //                 ? sTopEndDate.toISOString() : oCapacity.arrUserDetails[indexUser].tasks[0].DueDate.format('yyyy-MM-ddT') + "23:59:00.000Z";
            // oCapacity.arrUserDetails[indexUser].tasks.sort(function (a, b) {
            //     return a.StartDate - b.StartDate;
            // });
            // startDateString = new Date(sTopStartDate) <new Date(oCapacity.arrUserDetails[indexUser].tasks[0].StartDate.format('yyyy-MM-ddT') + "00:00:01.000Z")
            //                   ? sTopStartDate.toISOString() : oCapacity.arrUserDetails[indexUser].tasks[0].StartDate.format('yyyy-MM-ddT') + "00:00:01.000Z";

            endDateString = new Date(sTopEndDate) > new Date(this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].DueDate,'yyyy-MM-ddT')+'23:59:00.000Z')
            ? sTopEndDate.toISOString() : this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].DueDate,'yyyy-MM-ddT') + "23:59:00.000Z";
            
            startDateString = new Date(sTopStartDate) < new Date(this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,'yyyy-MM-ddT')+'00:00:01.000Z')
            ? sTopStartDate.toISOString(): this.datepipe.transform(oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,'yyyy-MM-ddT') + '00:00:01.000Z';
            // tslint: enable
        }
        else {
            startDateString = sTopStartDate.toISOString();
            endDateString = sTopEndDate.toISOString();
        }
        var endpoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl
        +"/_api/web/lists/getbytitle('" + this.leaveCalendar+ "')/items?$select=ID,EventDate,EndDate,IsHalfDay&$top=4500&$orderby=Created&$filter=(Author/Id eq "+oCapacity.arrUserDetails[indexUser].uid+")and("+
        "(EventDate ge '"+startDateString+"' and EventDate le '"+endDateString+"') or (EndDate ge '"+startDateString+"' and EndDate le '"+endDateString+"') or (EventDate le '"+startDateString+"' and EndDate ge '"+endDateString+"'))";
        this.spService.getBatchBodyGet(batchContentsLeaves, batchGuid, endpoint);
      }
    }

    batchContentsLeaves.push('--batch_' + batchGuid + '--');
    var batchBody = batchContentsLeaves.join('\r\n');
    var arrLeaves = this.executeBatchRequest(batchGuid,batchBody);
    for(var index in oCapacity.arrUserDetails) {
      if(oCapacity.arrUserDetails.hasOwnProperty(index)) {
        this.fetchUserLeaveDetails(oCapacity,oCapacity.arrUserDetails[index], arrLeaves[index]);
        this.fetchUserCapacity(oCapacity.arrUserDetails[index]);
      }
    }
    return oCapacity;
  }
  applyFilterGlobal(startDate,endDate, selectedUsers){
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    this.pmObject.oCapacity = this.applyFilter(new Date(new Date(startDate).setHours(0, 0, 0, 0)),new Date(new Date(endDate).setHours(23, 59, 59, 0)), selectedUsers);
  }
  applyFilterLocal(startDate,endDate, selectedUsers){
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    this.oCapacity = this.applyFilter(new Date(new Date(startDate).setHours(0, 0, 0, 0)),new Date(new Date(endDate).setHours(23, 59, 59, 0)), selectedUsers);
    this.calc(this.oCapacity);
  }
  fetchData(oUser, startDateString, endDateString, batchGuid, batchContents) {
    const selectedUserID = oUser.uid;
    // tslint:disable
    const endpoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl
    +"/_api/web/lists/getbytitle('" + this.Schedules + "')/items?$select=ID,Milestone,Task,Status,Title,TimeSpent,ExpectedTime,StartDate,DueDate,TimeZone&$top=4500&$filter=(AssignedTo/Id eq "+selectedUserID+") and("+
    "(StartDate ge '"+startDateString+"' and StartDate le '"+endDateString+"') or (DueDate ge '"+startDateString+"' and DueDate le '"+endDateString+"') or (StartDate le '"+startDateString+"' and DueDate ge '"+endDateString+"')"+
    ") and Status ne 'Abandon' and Status ne 'Deleted'&$orderby=StartDate";
    // tslint:enable
    return this.spService.getBatchBodyGet(batchContents, batchGuid, endpoint);
  }

  executeBatchRequest(batchGuid, sBatchData) {
    const arrResults = [];
    const response =  this.spService.executeBatchPostRequestByRestAPI(batchGuid, sBatchData);
    const responseInLines = response.split('\n');
    // tslint:disable-next-line:prefer-for-of
    for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
      try {
            const tryParseJson = JSON.parse(responseInLines[currentLine]);
            arrResults.push(tryParseJson.d.results);
      } catch (e) {

      }
    }
    return arrResults;
  }

  fetchTasks(oUser, tasks) {
    for (const index in tasks) {
      //tslint:disable
      if (tasks.hasOwnProperty(index)) {
        tasks[index].ProjectCode = tasks[index].Title.split(' ')[0];
        tasks[index].TotalAllocated = tasks[index].Task !== 'Adhoc' ?
                                      this.pmCommonService.convertToHrsMins('' + tasks[index].ExpectedTime).replace('.', ':')
                                      : tasks[index].TimeSpent.replace('.', ':');
        const sTimeZone = tasks[index].TimeZone ===null? "+5.5" : tasks[index].TimeZone;
        const currentUserTimeZone = (new Date()).getTimezoneOffset()/60 *-1;
            tasks[index].StartDate = this.pmCommonService.calcTimeForDifferentTimeZone(new Date(tasks[index].StartDate),currentUserTimeZone, sTimeZone);
            tasks[index].DueDate = this.pmCommonService.calcTimeForDifferentTimeZone(new Date(tasks[index].DueDate),currentUserTimeZone, sTimeZone);
      }
    }
    return tasks;
  }

  fetchUserLeaveDetails(oCapacity,oUser, leaves) {
    oUser.leaves = [];
    for (const index in oCapacity.arrDateFormat) {
      if (oCapacity.arrDateFormat.hasOwnProperty(index)) {
            const temp = {
              date : oCapacity.arrDateFormat[index],
              userCapacity : oCapacity.arrDateRange[index],
              taskCount : 0,
              maxAvailableHours : oUser.maxHrs,
              totalTimeAllocated : 0,
              availableHrs : 0
            };
            oUser.dates.push(temp);
      }
    }
    if (leaves && leaves.length > 0) {
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
                const mappedArray = oUser.dates.map(function(e) { return e.userCapacity; });
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

  fetchUserCapacity(oUser) {
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
                const taskBusinessDays = this.pmCommonService.calcBusinessDays(taskStartDate, taskEndDate);
                oUser.tasks[j].taskBusinessDays = taskBusinessDays;

                let arrLeaveDays = [];
                if (oUser.leaves.length) {
                    arrLeaveDays = oUser.leaves.filter(function(obj) {
                        return obj >= taskStartDate && obj <= taskEndDate;
                    });
                }
                if (oUser.tasks[j].Task !== 'Adhoc') {
                  // tslint:disable
                    oUser.tasks[j].timeAllocatedPerDay = this.pmCommonService.convertToHrsMins('' + this.getPerDayTime(oUser.tasks[j].ExpectedTime !== null ?
                                                        oUser.tasks[j].ExpectedTime : '0', taskBusinessDays - arrLeaveDays.length));
                  // tslint:enable
                } else {
                    oUser.tasks[j].timeAllocatedPerDay = oUser.tasks[j].TimeSpent !== null ? '' + oUser.tasks[j].TimeSpent : '0.0';
                }
                if (oUser.dates[i].userCapacity === 'Leave') {
                    oUser.tasks[j].timeAllocatedPerDay = '0:0';
                }
                if (oUser.dates[i].date >= taskStartDate && oUser.dates[i].date <= taskEndDate) {
                  const totalAllocatedTime = oUser.tasks[j].Task !== 'Adhoc' ? oUser.tasks[j].ExpectedTime : oUser.tasks[j].TimeSpent;
                    // tslint:disable-next-line:align
                    taskCount++;
                    // tslint:disable
                    const objTask = {
                      title : oUser.tasks[j].Title,
                      projectCode : oUser.tasks[j].Title !== null ? oUser.tasks[j].Title.split(' ')[0] : '',
                      milestone : oUser.tasks[j].Milestone,
                      shortTitle : '',
                      milestoneDeadline : '',
                      startDate : oUser.tasks[j].StartDate,
                      dueDate : oUser.tasks[j].DueDate,
                      timeAllocatedPerDay :  oUser.tasks[j].timeAllocatedPerDay,
                      displayTimeAllocatedPerDay : oUser.tasks[j].timeAllocatedPerDay !== null ?
                      oUser.tasks[j].timeAllocatedPerDay.replace('.', ':') : oUser.tasks[j].timeAllocatedPerDay,
                      status : oUser.tasks[j].Status,
                      totalAllocatedTime : totalAllocatedTime ,
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
            totalTimeAllocatedPerDay = arrHoursMins.length > 0 ? this.pmCommonService.ajax_addHrsMins(arrHoursMins) : '0:0';
            oUser.dates[i].totalTimeAllocatedPerDay = totalTimeAllocatedPerDay;
            objTotalAllocatedPerUser.timeHrs = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
                                                    ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[0] : 0;
            objTotalAllocatedPerUser.timeMins = oUser.dates[i].totalTimeAllocatedPerDay.indexOf(':')
                                                    ? oUser.dates[i].totalTimeAllocatedPerDay.split(':')[1] : 0;
            arrTotalAllocatedPerUser.push(objTotalAllocatedPerUser);
            oUser.dates[i].availableHrs = this.pmCommonService.ajax_subtractHrsMins(
                                          this.pmCommonService.convertToHrsMins('' + oUser.dates[i].maxAvailableHours),
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
    oUser.totalAllocated = arrTotalAllocatedPerUser.length > 0 ? this.pmCommonService.ajax_addHrsMins(arrTotalAllocatedPerUser) : 0;
    oUser.totalUnAllocated = arrTotalAvailablePerUser.length > 0 ? this.pmCommonService.ajax_addHrsMins(arrTotalAvailablePerUser) : 0;
    oUser.displayTotalAllocated = oUser.totalAllocated;
    oUser.displayTotalUnAllocated = oUser.totalUnAllocated === 0 ? '0:0' : oUser.totalUnAllocated;
    oUser.dayTasks = [];
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

  fetchProjectTaskDetails(user, tasks, objt) {
    if (tasks.length > 0) {
        const oItem = $(objt.target).closest('.UserTasksRow').siblings('.TaskPerDayRow');
        oItem.hide();
        oItem.find('#TasksPerDay').hide();
        oItem.find('.innerTableLoader').show();
        oItem.slideDown();
        setTimeout(() => {
          this.bindProjectTaskDetails(tasks, objt, user);
        }, 300);
    }
  }

  bindProjectTaskDetails (tasks, objt, user) {
    if (tasks.length > 0) {
      const batchContents = new Array();
      const batchGuid = this.spService.generateUUID();
      for (const taskIndex in tasks) {
        if (tasks.hasOwnProperty(taskIndex)) {
          if (tasks[taskIndex].projectCode !== 'Adhoc') {
              // tslint:disable
              const url = this.sharedObject.sharePointPageObject.webAbsoluteUrl
              +  "/_api/web/lists/getbytitle('" + this.ProjectInformation + "')/items?$select=WBJID&&$filter=ProjectCode eq '"+tasks[taskIndex].projectCode+"'";
              this.spService.getBatchBodyGet(batchContents, batchGuid, url);
              var sSchedulesURL = this.sharedObject.sharePointPageObject.webAbsoluteUrl
              +  "/_api/web/lists/getbytitle('" + this.Schedules + "')/items?$select=ID,Task,Title,ExpectedTime,StartDate,DueDate,TimeZone,Status,AssignedToText,ContentType/Name&$expand=ContentType&$filter=startswith(Title,'"+tasks[taskIndex].projectCode+"') and Milestone eq '"+tasks[taskIndex].milestone+"' and Status ne 'Abandon' and Status ne 'Completed' and Status ne 'Deleted' and Status ne 'Auto Closed'";
              this.spService.getBatchBodyGet(batchContents, batchGuid, sSchedulesURL);
              // tslint:enable
          }
        }
      }
      if (batchContents.length) {
          batchContents.push('--batch_' + batchGuid + '--');
          const sBatchData = batchContents.join('\r\n');
          const arrResults = this.executeBatchRequest(batchGuid, sBatchData);
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
                  for (const index in miltasks) {
                    if (miltasks.hasOwnProperty(index)) {
                        //tslint:disable
                          const sTimeZone = miltasks[index].TimeZone===null ?"+5.5" : miltasks[index].TimeZone;
                          const currentUserTimeZone = (new Date()).getTimezoneOffset()/60 *-1;
                          miltasks[index].StartDate = this.pmCommonService.
                                                    calcTimeForDifferentTimeZone(new Date(miltasks[index].StartDate),currentUserTimeZone, sTimeZone);
                          miltasks[index].DueDate = this.pmCommonService.
                                                    calcTimeForDifferentTimeZone(new Date(miltasks[index].DueDate),currentUserTimeZone, sTimeZone);
                    }
                  }
                  miltasks.sort(function (a, b) {
                      return a.StartDate - b.StartDate;
                  });
                  let lastSCTask = [];
                  const scTasks = miltasks.filter(function(obj) {
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
      const oTd = $(objt.target).closest('td');
      const oUserRow = oTd.closest('.UserTasksRow');
      const oUserTaskRow = oUserRow.next();
      oUserTaskRow.find('.innerTableLoader').slideUp(function() {
          oUserTaskRow.find('#TasksPerDay').slideDown();
      });
      oTd.parent().find('.highlightCell').removeClass('highlightCell');
      oTd.addClass('highlightCell');
      $('.innerTableLoader').hide();
    }
  }

  calc(oCapacity) {
    const arrDateRange = oCapacity.arrDateFormat.length;
    if (arrDateRange <= 10) {
        const tableWidth = $('#capacityTable').width();
        const totalCellWidth = tableWidth - (tableWidth * 18 / 100);
        const firstCellWidth = (tableWidth * 6 / 100);
        const eachColumnWidth = totalCellWidth / arrDateRange;
        const users = oCapacity.arrUserDetails;
        for (const i in users) {
          if (users.hasOwnProperty(i)) {
            let top = 0;
            this.height = '75px';
            users[i].height = '75px';
            if(users[i].tasks){
              users[i].maxHeight = (users[i].tasks.length * 18) + 21 + 'px';
            }
            this.verticalAlign = 'top';
            for (const j in users[i].tasks) {
              if (users[i].tasks.hasOwnProperty(j)) {
                const startDate = new Date(new Date(users[i].tasks[j].StartDate).toDateString()); // format('MMM dd, yyyy'));
                let dateIndex = oCapacity.arrUserDetails[0].businessDays.findIndex(function(x) {
                    return x.valueOf() === startDate.valueOf();
                });
                let nBusinessDays = users[i].tasks[j].taskBusinessDays;
                if (dateIndex < 0) {
                    const tblStartDate = new Date(users[i].businessDays[0]);
                    const taskStartDate = new Date(this.datepipe.transform(users[i].tasks[j].StartDate, 'MMM dd yyyy'));
                    const nDays = this.pmCommonService.calcBusinessDays(taskStartDate, tblStartDate) - 1;
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
            this.height = 'inherit';
            this.verticalAlign = 'middle';
    }
  }
  open(content, tasks, task) {
    this.modalReference = this.modalService.open(content, { size: 'lg' });
    const selectedTask = tasks.filter(function(obj) {
      return obj.title === task.title;
    });
    this.clickedTaskTitle = task.title;
    this.milestoneTasks = selectedTask[0].milestoneTasks;
  }

  cancelScope() {
    this.modalReference.close();
    $('#txtScope').html('');
  }

  collpaseTable(objt) {
    const oCollpase =  $(objt).closest('.TaskPerDayRow');
    oCollpase.prev().find('.highlightCell').removeClass('highlightCell');
    oCollpase.slideUp();
  }

}
