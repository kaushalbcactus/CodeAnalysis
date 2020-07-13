import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { CACommonService } from 'src/app/ca/caservices/cacommon.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { SharedConstantsService } from './shared-constants.service';

@Injectable({
  providedIn: 'root'
})
export class UserCapacitycommonService {

  constructor(
    private common: CommonService, private datepipe: DatePipe,
    private commonservice: CACommonService, private global: GlobalService,
    private constant: ConstantsService, private spService: SPOperationService,
    private sharedConstant: SharedConstantsService

  ) { }

  getDates(startDate, stopDate, remove) {
    const objDates = {
      dateStringArray: [],
      dateArray: [],
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
      } else {
        objDates.dateArray.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return objDates;
  }

  fetchUserCapacity(oUser) {
    const arrTotalAllocatedPerUser = [],
      arrTotalAvailablePerUser = [];
    let bench = [];
    for (const i in oUser.dates) {
      if (oUser.dates.hasOwnProperty(i)) {
        const tasksDetails = [];

        if (
          new Date(oUser.dates[i].date).getDay() === 6 ||
          new Date(oUser.dates[i].date).getDay() === 0
        ) {
          oUser.dates[i].userCapacity = "Leave";
          oUser.dates[i].maxAvailableHours = 0;
        }
        const bLeave = oUser.dates[i].userCapacity !== "Leave" ? false : true;
        const arrHoursMins = [];
        const objTotalAllocatedPerUser = {
          timeHrs: "",
          timeMins: "",
        },
          objTotalAvailablePerUser = {
            timeHrs: "",
            timeMins: "",
          };
        let taskCount = 0,
          totalTimeAllocatedPerDay = "0",
          totalTimeAllocated = 0;
        for (const j in oUser.tasks) {
          if (oUser.tasks.hasOwnProperty(j)) {
            const taskStartDate = new Date(
              this.datepipe.transform(
                new Date(oUser.tasks[j].StartDate),
                "MMM dd, yyyy"
              )
            );
            const taskEndDate = new Date(
              this.datepipe.transform(
                new Date(oUser.tasks[j].DueDateDT),
                "MMM dd, yyyy"
              )
            );
            const taskBusinessDays = this.commonservice.calcBusinessDays(
              taskStartDate,
              taskEndDate
            );
            oUser.tasks[j].taskBusinessDays = taskBusinessDays;
            oUser.tasks[j].taskTotalDays = this.CalculateWorkingDays(
              taskStartDate,
              taskEndDate
            );

            let arrLeaveDays = [];
            if (oUser.leaves.length) {
              arrLeaveDays = oUser.leaves.filter(function (obj) {
                return obj >= taskStartDate && obj <= taskEndDate;
              });
            }

            if (oUser.tasks[j].Task === 'Adhoc') {

              oUser.tasks[j].timeAllocatedPerDay =
                oUser.tasks[j].TimeSpent !== null
                  ? "" + oUser.tasks[j].TimeSpent
                  : "0.0";

            }
            // else if(oUser.tasks[j].Task === 'ResourceBlocking'){

            //   oUser.tasks[
            //     j
            //   ].timeAllocatedPerDay = this.commonservice.convertToHrsMins(
            //     "" +
            //       this.getPerDayTime(
            //         oUser.tasks[j].ExpectedTime !== null
            //           ? oUser.tasks[j].ExpectedTime
            //           : "0",
            //         taskBusinessDays - arrLeaveDays.length
            //       )
            //   );
            // }
            else {
              if (oUser.tasks[j].AllocationPerDay) {
                let allocationPerDay = oUser.tasks[j].AllocationPerDay.split(
                  /\n/
                );
                allocationPerDay = allocationPerDay.forEach((allocation) => {
                  const arrAllocation = allocation.split(":");
                  const allocationDate =
                    arrAllocation.length &&
                      new Date(arrAllocation[0]) instanceof Date
                      ? new Date(arrAllocation[0])
                      : new Date();
                  let allocationTime =
                    arrAllocation.length > 0 ? arrAllocation[1] : "0";
                  allocationTime =
                    arrAllocation.length > 1
                      ? arrAllocation[1] + ":" + arrAllocation[2]
                      : "0";
                  if (
                    allocationDate.getTime() ===
                    new Date(oUser.dates[i].date).getTime()
                  ) {
                    oUser.tasks[j].timeAllocatedPerDay = allocationTime;
                  }
                });
                if (!oUser.tasks[j].timeAllocatedPerDay) {
                  oUser.tasks[
                    j
                  ].timeAllocatedPerDay = this.commonservice.convertToHrsMins(
                    "" +
                    this.getPerDayTime(
                      oUser.tasks[j].ExpectedTime !== null
                        ? '' + oUser.tasks[j].ExpectedTime
                        : "0",
                      taskBusinessDays - arrLeaveDays.length
                    )
                  );
                }
              } else {
                oUser.tasks[
                  j
                ].timeAllocatedPerDay = this.commonservice.convertToHrsMins(
                  "" +
                  this.getPerDayTime(
                    oUser.tasks[j].ExpectedTime !== null
                      ? '' + oUser.tasks[j].ExpectedTime
                      : "0",
                    taskBusinessDays - arrLeaveDays.length
                  )
                );
              }
            }

            if (oUser.dates[i].userCapacity === "Leave") {
              oUser.tasks[j].timeAllocatedPerDay = "0:0";
            }
            if (
              new Date(oUser.dates[i].date) >= taskStartDate &&
              new Date(oUser.dates[i].date) <= taskEndDate
            ) {
              const TotalAllocatedTime =
                oUser.tasks[j].Task !== "Adhoc"
                  ? oUser.tasks[j].ExpectedTime
                  : oUser.tasks[j].TimeSpent;
              taskCount++;
              const objTask = {
                title:
                  oUser.tasks[j].Task === "Adhoc"
                    ? oUser.tasks[j].Entity
                      ? oUser.tasks[j].CommentsMT +
                      " - " +
                      oUser.tasks[j].Entity +
                      " (" +
                      oUser.tasks[j].Task +
                      ")"
                      : oUser.tasks[j].CommentsMT +
                      " (" +
                      oUser.tasks[j].Task +
                      ")"
                    : oUser.tasks[j].Title,
                projectCode:
                  oUser.tasks[j].Task !== "ResourceBlocking" && oUser.tasks[j].Title !== null
                    ? oUser.tasks[j].Title.split(" ")[0]
                    : "",
                milestone: oUser.tasks[j].Milestone,
                SubMilestones: oUser.tasks[j].SubMilestones,
                task: oUser.tasks[j].Task,
                comments: oUser.tasks[j].CommentsMT,
                taskID: oUser.tasks[j].ID,
                shortTitle: "",
                milestoneDeadline: "",
                AssignedTo: oUser.tasks[j].AssignedTo,
                startDate: oUser.tasks[j].StartDate,
                dueDate: oUser.tasks[j].DueDate ? oUser.tasks[j].DueDate : oUser.tasks[j].DueDateDT,
                timeAllocatedPerDay: oUser.tasks[j].timeAllocatedPerDay,
                displayTimeAllocatedPerDay:
                  oUser.tasks[j].timeAllocatedPerDay !== null
                    ? oUser.tasks[j].timeAllocatedPerDay.replace(".", ":")
                    : oUser.tasks[j].timeAllocatedPerDay,
                status: oUser.tasks[j].Status,
                totalAllocatedTime: TotalAllocatedTime,
                displayTotalAllocatedTime:
                  TotalAllocatedTime !== null
                    ? oUser.tasks[j].Task !== "Adhoc"
                      ? TotalAllocatedTime
                      : TotalAllocatedTime.replace(".", ":")
                    : TotalAllocatedTime,
                parentSlot: oUser.tasks[j].parentSlot
                  ? oUser.tasks[j].parentSlot
                  : "",
                AllocationPerDay: oUser.tasks[j].AllocationPerDay,
                TaskType: oUser.tasks[j].Task
              };
              tasksDetails.push(objTask);
              const taskHrsMinObject = {
                timeHrs: "0",
                timeMins: "0",
              };
              taskHrsMinObject.timeHrs = oUser.tasks[j].timeAllocatedPerDay
                .replace(".", ":")
                .split(":")[0];
              taskHrsMinObject.timeMins = oUser.tasks[j].timeAllocatedPerDay
                .replace(".", ":")
                .split(":")[1];
              arrHoursMins.push(taskHrsMinObject);
            }
          }
        }
        oUser.dates[i].tasksDetails = tasksDetails;
        totalTimeAllocatedPerDay =
          arrHoursMins.length > 0
            ? this.commonservice.ajax_addHrsMins(arrHoursMins)
            : "0:0";
        oUser.dates[i].totalTimeAllocatedPerDay = totalTimeAllocatedPerDay;
        oUser.dates[i].totalTimeAllocated = this.common.convertFromHrsMins(
          totalTimeAllocatedPerDay
        );
        objTotalAllocatedPerUser.timeHrs = oUser.dates[
          i
        ].totalTimeAllocatedPerDay.indexOf(":")
          ? oUser.dates[i].totalTimeAllocatedPerDay.split(":")[0]
          : 0;
        objTotalAllocatedPerUser.timeMins = oUser.dates[
          i
        ].totalTimeAllocatedPerDay.indexOf(":")
          ? oUser.dates[i].totalTimeAllocatedPerDay.split(":")[1]
          : 0;
        arrTotalAllocatedPerUser.push(objTotalAllocatedPerUser);
        const av = tasksDetails.filter((k) => k.Task === "Blocking");
        if (av.length) {
          oUser.dates[i].availableHrs = "0:0";
          oUser.dates[i].displayAvailableHrs = oUser.dates[i].availableHrs;
          oUser.dates[i].displayAvailableHrsstring =
            oUser.dates[i].displayAvailableHrs.split(":")[0] +
            "h:" +
            oUser.dates[i].displayAvailableHrs.split(":")[1] +
            "m";
          oUser.dates[i].userCapacity = "NotAvailable";
        } else {
          oUser.dates[i].availableHrs = this.commonservice.ajax_subtractHrsMins(
            this.commonservice.convertToHrsMins(
              "" + oUser.dates[i].maxAvailableHours
            ),
            totalTimeAllocatedPerDay.length > 0
              ? totalTimeAllocatedPerDay.replace(":", ".")
              : 0
          );
          oUser.dates[i].displayAvailableHrs = oUser.dates[i].availableHrs;
          oUser.dates[i].displayAvailableHrsstring =
            oUser.dates[i].displayAvailableHrs.split(":")[0] +
            "h:" +
            oUser.dates[i].displayAvailableHrs.split(":")[1] +
            "m";
          if (+oUser.dates[i].availableHrs.replace(":", ".") > 0) {
            objTotalAvailablePerUser.timeHrs = oUser.dates[
              i
            ].availableHrs.split(":")[0];
            objTotalAvailablePerUser.timeMins = oUser.dates[
              i
            ].availableHrs.split(":")[1];
            arrTotalAvailablePerUser.push(objTotalAvailablePerUser);
          }
          if (+oUser.dates[i].availableHrs.replace(":", ".") <= 0) {
            oUser.dates[i].userCapacity = "NotAvailable";
          } else if (+oUser.dates[i].availableHrs.replace(":", ".") > 0) {
            oUser.dates[i].userCapacity = "Available";
          }
        }

        const allTimeSpentArray = oUser.TimeSpentTasks.filter(
          (c) =>
            c.TimeSpentDate.getTime() ===
            new Date(oUser.dates[i].date).getTime()
        )
          ? oUser.TimeSpentTasks.filter(
            (c) =>
              c.TimeSpentDate.getTime() ===
              new Date(oUser.dates[i].date).getTime()
          ).map(
            (c) =>
              new Object({
                timeHrs: c.TimeSpentPerDay.split(":")[0],
                timeMins: c.TimeSpentPerDay.split(":")[1],
              })
          )
          : [];

        oUser.dates[i].TimeSpent =
          allTimeSpentArray.length > 0
            ? this.commonservice.ajax_addHrsMins(allTimeSpentArray)
            : "0:0";
        oUser.dates[i].TimeSpentstring =
          oUser.dates[i].TimeSpent.split(":")[0] +
          "h:" +
          oUser.dates[i].TimeSpent.split(":")[1] +
          "m";
        oUser.dates[i].taskCount = taskCount;
        if (bLeave) {
          oUser.dates[i].totalTimeAllocatedPerDay = 0;
          oUser.dates[i].totalTimeAllocated = 0;
          oUser.dates[i].availableHrs = 0;
          oUser.dates[i].userCapacity = "Leave";
        }
        oUser.businessDays.push(new Date(oUser.dates[i].date));
      }

      if (
        oUser.dates[i].userCapacity == "Available" ||
        oUser.dates[i].userCapacity == "NotAvailable"
      ) {
        const calcBench = this.commonservice.ajax_subtractHrsMins(
          this.commonservice.convertToHrsMins(
            "" + oUser.dates[i].maxAvailableHours
          ),
          oUser.dates[i].TimeSpent
        );
        if (calcBench.indexOf("-") === -1) {
          bench.push(calcBench);
        }
      }
    }

    const ArrayTimespentPerDay = oUser.dates.map(
      (c) =>
        new Object({
          timeHrs: c.TimeSpent.split(":")[0],
          timeMins: c.TimeSpent.split(":")[1],
        })
    );
    oUser.Bench =
      bench.length > 0
        ? this.commonservice.ajax_addHrsMins(
          bench.map(
            (c) =>
              new Object({
                timeHrs: c.split(":")[0],
                timeMins: c.split(":")[1],
              })
          )
        )
        : "0:0";
    oUser.TotalTimeSpent =
      ArrayTimespentPerDay.length > 0
        ? this.commonservice.ajax_addHrsMins(ArrayTimespentPerDay)
        : 0;

    oUser.totalAllocated =
      arrTotalAllocatedPerUser.length > 0
        ? this.commonservice.ajax_addHrsMins(arrTotalAllocatedPerUser)
        : 0;
    oUser.totalUnAllocated =
      arrTotalAvailablePerUser.length > 0
        ? this.commonservice.ajax_addHrsMins(arrTotalAvailablePerUser)
        : 0;
    oUser.displayTotalAllocated =
      oUser.totalAllocated === 0 ? "0:0" : oUser.totalAllocated;
    oUser.displayTotalUnAllocated =
      oUser.totalUnAllocated === 0 ? "0:0" : oUser.totalUnAllocated;
    oUser.displayTotalAllocatedExport =
      oUser.displayTotalAllocated.split(":")[0] +
      "h:" +
      oUser.displayTotalAllocated.split(":")[1] +
      "m";
    oUser.displayTotalUnAllocatedExport =
      oUser.displayTotalUnAllocated.split(":")[0] +
      "h:" +
      oUser.displayTotalUnAllocated.split(":")[1] +
      "m";
    oUser.displayTotalTimeSpent =
      oUser.TotalTimeSpent === 0 ? "0:0" : oUser.TotalTimeSpent;
    oUser.displayTotalTimeSpentExport =
      oUser.displayTotalTimeSpent.split(":")[0] +
      "h:" +
      oUser.displayTotalTimeSpent.split(":")[1] +
      "m";
    oUser.dayTasks = [];
    oUser.TimeSpentDayTasks = [];
    return oUser;
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
      if (sTime.indexOf(".") > -1) {
        const arrTime = sTime.split(".");
        const nTotalMins =
          parseFloat(arrTime[0]) * 60 + parseFloat("0." + arrTime[1]) * 60;
        const nTimePerDay = Math.round(nTotalMins / numberOfBusDays);
        const nHrs = nTimePerDay / 60;
        const nMins = nTimePerDay % 60;
        return nHrs + ":" + nMins;
      } else {
        nTime = parseFloat(sTime);
        return (nTime / numberOfBusDays).toFixed(2);
      }
    }
  }

  async factoringTimeForAllocation(
    startDate,
    endDate,
    resource,
    excludeTasks,
    taskStatus,
    adhocStatus
  ) {
    return this.applyFilter(
      startDate,
      endDate,
      resource,
      excludeTasks,
      false,
      'All',
      taskStatus,
      adhocStatus,
    );
  }
  async applyFilter(
    startDate,
    endDate,
    selectedUsers,
    excludeTasks,
    enableDownload,
    taskFilter,
    taskStatus?,
    adhocStatus?,
  ) {
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
    let startDateString =
      this.datepipe.transform(startDate, "yyyy-MM-dd") + "T00:00:01.000Z";
    let endDateString =
      this.datepipe.transform(endDate, "yyyy-MM-dd") + "T23:59:00.000Z";
    const sTopStartDate = new Date(startDate);
    const sTopEndDate = new Date(endDate);
    const obj = {
      arrDateRange: [],
      arrDateFormat: [],
    };
    obj.arrDateRange = this.getDates(startDate, endDate, false).dateArray;
    obj.arrDateFormat = this.getDates(startDate, endDate, false).dateArray;
    oCapacity.arrDateRange = obj.arrDateRange;
    oCapacity.arrDateFormat = obj.arrDateFormat;
    // const batchGuid = this.spService.generateUUID();
    // let batchContents = new Array();
    let batchUrl = [];
    let blockResBatchUrl = [];
    let TimeSpentbatchUrl = [];
    let blockResbatchResults = [];
    let tempblockResFinalArray = [];
    let adhocTasksBatchUrl = [];
    let adhocResbatchResults = [];
    let tempAdhocResFinalArray = [];
    for (const userIndex in selectedUsers) {
      if (selectedUsers.hasOwnProperty(userIndex)) {
        if (selectedUsers[userIndex]) {
          const oUser = {
            uid: "",
            userName: "",
            maxHrs: "",
            dates: [],
            tasks: [],
            leaves: [],
            businessDays: [],
            totalAllocated: 0,
            totalUnAllocated: 0,
            TotalTimeSpent: 0,
            GoLiveDate: "",
            JoiningDate: "",
            TimeSpentTasks: [],
          };

          const userDetail = [selectedUsers[userIndex]];
          if (userDetail.length > 0) {
            oUser.uid = userDetail[0].UserNamePG.ID
              ? userDetail[0].UserNamePG.ID
              : userDetail[0].UserNamePG.Id;
            oUser.userName = userDetail[0].UserNamePG.Title;
            oUser.maxHrs = userDetail[0].UserNamePG.MaxHrs
              ? userDetail[0].UserNamePG.MaxHrs
              : userDetail[0].MaxHrs;
            oUser.GoLiveDate = userDetail[0].GoLiveDate;
            oUser.JoiningDate = userDetail[0].DateOfJoining;
            this.fetchData(oUser, startDateString, endDateString, batchUrl);
            this.fetchAdhocData(oUser, startDateString, endDateString, adhocTasksBatchUrl);
            this.fetchDataBlockResource(
              oUser,
              startDateString,
              endDateString,
              blockResBatchUrl
            );
            if (enableDownload) {
              this.fetchDataForTimeSpent(
                oUser,
                startDateString,
                endDateString,
                TimeSpentbatchUrl
              );
            }

            if (batchUrl.length === 99) {
              this.common.SetNewrelic(
                "Shared",
                "UserCapacity",
                "fetchTaskByUsers"
              );
              batchResults = await this.spService.executeBatch(batchUrl);
              console.log(batchResults);
              tempFinalArray = [...tempFinalArray, ...batchResults];
              batchUrl = [];
            }
            if (adhocTasksBatchUrl.length === 99) {
              this.common.SetNewrelic(
                "Shared",
                "UserCapacity",
                "fetchAdhocTaskByUsers"
              );
              adhocResbatchResults = await this.spService.executeBatch(adhocTasksBatchUrl);
              console.log(adhocResbatchResults);
              tempAdhocResFinalArray = [...tempAdhocResFinalArray, ...adhocResbatchResults];
              adhocTasksBatchUrl = [];
            }
            if (blockResBatchUrl.length === 99) {
              this.common.SetNewrelic(
                "Shared",
                "UserCapacity",
                "fetchBlockResourceData"
              );
              blockResbatchResults = await this.spService.executeBatch(
                blockResBatchUrl
              );
              console.log(blockResbatchResults);
              tempblockResFinalArray = [
                ...tempblockResFinalArray,
                ...blockResbatchResults,
              ];
              blockResBatchUrl = [];
            }
            if (TimeSpentbatchUrl.length === 99) {
              TimeSpentbatchResults = await this.spService.executeBatch(
                TimeSpentbatchUrl
              );
              console.log(batchResults);
              tempTimeSpentFinalArray = [
                ...tempTimeSpentFinalArray,
                ...TimeSpentbatchResults,
              ];
              TimeSpentbatchUrl = [];
            }
            oCapacity.arrUserDetails.push(oUser);
          }
        }
      }
    }
    if (batchUrl.length) {
      this.common.SetNewrelic("Shared", "UserCapacity", "fetchTaskByUsers");
      batchResults = await this.spService.executeBatch(batchUrl);
      tempFinalArray = [...tempFinalArray, ...batchResults];
    }


    if (adhocTasksBatchUrl.length) {
      this.common.SetNewrelic("Shared", "UserCapacity", "fetchAdhocTaskByUsers");
      adhocResbatchResults = await this.spService.executeBatch(adhocTasksBatchUrl);
      tempAdhocResFinalArray = [...tempAdhocResFinalArray, ...adhocResbatchResults];
    }
    if (blockResBatchUrl.length) {
      this.common.SetNewrelic(
        "Shared",
        "UserCapacity",
        "fetchBlockResourceData"
      );
      blockResbatchResults = await this.spService.executeBatch(
        blockResBatchUrl
      );
      tempblockResFinalArray = [
        ...tempblockResFinalArray,
        ...blockResbatchResults,
      ];
    }
    if (TimeSpentbatchUrl.length) {
      this.common.SetNewrelic(
        "Shared",
        "UserCapacity",
        "fetchSpentTaskByUsers"
      );

      TimeSpentbatchResults = await this.spService.executeBatch(
        TimeSpentbatchUrl
      );
      tempTimeSpentFinalArray = [
        ...tempTimeSpentFinalArray,
        ...TimeSpentbatchResults,
      ];
    }

    // let arruserResults = await this.spService.executeBatch(batchUrl);
    const arruserResults = tempFinalArray.length
      ? tempFinalArray.map((a) => a.retItems)
      : [];


    const arruserAdhocResults = tempAdhocResFinalArray.length
      ? tempAdhocResFinalArray.map((a) => a.retItems)
      : [];

    const arruserResults1 = tempTimeSpentFinalArray.length
      ? tempTimeSpentFinalArray.map((a) => a.retItems)
      : [];

    const arrBlockResResults = tempblockResFinalArray.length
      ? tempblockResFinalArray.map((a) => a.retItems)
      : [];

    arrBlockResResults.map((c) => c.map((d) => d.Task = "ResourceBlocking"));

    let batchURL = [];
    batchResults = [];
    finalArray = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };

    for (const indexUser in oCapacity.arrUserDetails) {
      if (oCapacity.arrUserDetails.hasOwnProperty(indexUser)) {
        const TempTasks = this.fetchTasks(
          oCapacity.arrUserDetails[indexUser],
          [...arruserResults[indexUser], ...arruserAdhocResults[indexUser], ...arrBlockResResults[indexUser]],
          excludeTasks,
          taskStatus,
          adhocStatus
        );
        // oCapacity.arrUserDetails[indexUser].tasks = this.fetchTasks(oCapacity.arrUserDetails[indexUser], arruserResults[indexUser]);

        oCapacity.arrUserDetails[indexUser].tasks = this.filterData(TempTasks, taskFilter);

        if (
          oCapacity.arrUserDetails[indexUser].tasks &&
          oCapacity.arrUserDetails[indexUser].tasks.length
        ) {
          oCapacity.arrUserDetails[indexUser].tasks.sort((a, b) => {
            return b.DueDateDT - a.DueDateDT;
          });

          // tslint:disable
          endDateString =
            new Date(sTopEndDate) >
              new Date(
                this.datepipe.transform(
                  oCapacity.arrUserDetails[indexUser].tasks[0].DueDateDT,
                  "yyyy-MM-ddT"
                ) + "23:59:00.000Z"
              )
              ? new Date(sTopEndDate).toISOString()
              : this.datepipe.transform(
                oCapacity.arrUserDetails[indexUser].tasks[0].DueDateDT,
                "yyyy-MM-ddT"
              ) + "23:59:00.000Z";

          startDateString =
            new Date(sTopStartDate) <
              new Date(
                this.datepipe.transform(
                  oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,
                  "yyyy-MM-ddT"
                ) + "00:00:01.000Z"
              )
              ? new Date(sTopStartDate).toISOString()
              : this.datepipe.transform(
                oCapacity.arrUserDetails[indexUser].tasks[0].StartDate,
                "yyyy-MM-ddT"
              ) + "00:00:01.000Z";
          // tslint: enable

          if (enableDownload) {
            const TimeSpentTasks = this.fetchTasks(
              oCapacity.arrUserDetails[indexUser],
              arruserResults1[indexUser]
            );
            oCapacity.arrUserDetails[
              indexUser
            ].TimeSpentTasks = await this.SplitfetchTasks(TimeSpentTasks);

            if (
              oCapacity.arrUserDetails[indexUser].TimeSpentTasks &&
              oCapacity.arrUserDetails[indexUser].TimeSpentTasks.length
            ) {
              oCapacity.arrUserDetails[indexUser].TimeSpentTasks.sort(
                (a, b) => {
                  return b.EndDate - a.EndDate;
                }
              );
            }
          }
        } else {
          startDateString = new Date(sTopStartDate).toISOString();
          endDateString = new Date(sTopEndDate).toISOString();
        }

        selectedUsers.map(
          (c) =>
            (c.ResourceUserID = c.UserNamePG.Id
              ? c.UserNamePG.Id
              : c.UserNamePG.ID)
        );

        oCapacity.arrUserDetails.map(
          (c) =>
            (c.AvailableHoursRID = selectedUsers.find(
              (c) =>
                c.ResourceUserID === oCapacity.arrUserDetails[indexUser].uid
            ).ID)
        );

        if (batchURL.length === 99) {
          this.common.SetNewrelic("Shared", "UserCapacity", "fetchTaskByUsers");
          batchResults = await this.spService.executeBatch(batchURL);
          console.log(batchResults);
          finalArray = [...finalArray, ...batchResults];
          batchURL = [];
        }

        const leaveGet = Object.assign({}, options);
        const leavesQuery = Object.assign(
          {},
          this.sharedConstant.userCapacity.leaveCalendar
        );
        leaveGet.url = this.spService.getReadURL(
          "" + this.constant.listNames.LeaveCalendar.name + "",
          leavesQuery
        );
        leaveGet.url = leaveGet.url
          .replace(/{{userId}}/gi, oCapacity.arrUserDetails[indexUser].uid)
          .replace(/{{startDateString}}/gi, startDateString)
          .replace(/{{endDateString}}/gi, endDateString);
        leaveGet.type = "GET";
        leaveGet.listName = this.constant.listNames.LeaveCalendar.name;
        batchURL.push(leaveGet);

        if (batchURL.length === 99) {
          this.common.SetNewrelic(
            "Shared",
            "UserCapacity",
            "getLeavesbyUserIdAndSDED"
          );
          batchResults = await this.spService.executeBatch(batchURL);
          console.log(batchResults);
          finalArray = [...finalArray, ...batchResults];
          batchURL = [];
        }
        const availableHrsGet = Object.assign({}, options);
        const availableHrsQuery = Object.assign(
          {},
          this.sharedConstant.userCapacity.availableHrs
        );
        availableHrsGet.url = this.spService.getReadURL(
          "" + this.constant.listNames.AvailableHours.name + "",
          availableHrsQuery
        );
        availableHrsGet.url = availableHrsGet.url
          .replace(
            /{{ResourceId}}/gi,
            oCapacity.arrUserDetails[indexUser].AvailableHoursRID
          )
          .replace(/{{startDateString}}/gi, startDateString)
          .replace(/{{endDateString}}/gi, endDateString);
        availableHrsGet.type = "GET";
        availableHrsGet.listName = this.constant.listNames.AvailableHours.name;
        batchURL.push(availableHrsGet);
      }
    }

    if (batchURL.length) {
      this.common.SetNewrelic(
        "Shared",
        "UserCapacity",
        "getLeavesbyUserIdAndSDEDAndAHbyUserID"
      );
      batchResults = await this.spService.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }
    finalArray = finalArray.length ? finalArray : [];
    if (finalArray) {
      const UserLeaves = finalArray.filter(
        (c) =>
          c.listName === this.constant.listNames.LeaveCalendar.name
      );
      const UserAvailableHrs = finalArray.filter(
        (c) =>
          c.listName ===
          this.constant.listNames.AvailableHours.name
      );

      for (var index in oCapacity.arrUserDetails) {
        if (oCapacity.arrUserDetails.hasOwnProperty(index)) {
          await this.fetchUserLeaveDetails(
            oCapacity,
            oCapacity.arrUserDetails[index],
            UserLeaves[index].retItems,
            UserAvailableHrs[index].retItems
          );
          this.fetchUserCapacity(oCapacity.arrUserDetails[index]);
        }
      }
    }
    return oCapacity;
  }

  fetchData(oUser, startDateString, endDateString, batchUrl) {
    const selectedUserID = oUser.uid;
    // const invObj = Object.assign({}, this.queryConfig);
    let url = this.spService.getReadURL(
      this.constant.listNames.Schedules.name,
      this.sharedConstant.userCapacity.fetchTasks
    );
    url = url
      .replace("{{userID}}", selectedUserID)
      .replace(/{{startDateString}}/gi, startDateString)
      .replace(/{{endDateString}}/gi, endDateString);

    this.common.setBatchObject(batchUrl, url, null, this.constant.Method.GET, this.constant.listNames.Schedules.name);
    // invObj.listName = this.constant.listNames.Schedules.name;
    // invObj.type = "GET";
    // batchUrl.push(invObj);
    return batchUrl;
  }


  fetchAdhocData(oUser, startDateString, endDateString, batchUrl) {
    const selectedUserID = oUser.uid;
    const AdhocTasksurl = this.spService.getReadURL(
      this.constant.listNames.AdhocTask.name,
      this.sharedConstant.userCapacity.fetchAdhocTasks
    );

    this.common.setBatchObject(batchUrl, AdhocTasksurl
      .replace("{{userID}}", selectedUserID)
      .replace(/{{startDateString}}/gi, startDateString)
      .replace(/{{endDateString}}/gi, endDateString), null, this.constant.Method.GET, this.constant.listNames.AdhocTask.name)

    return batchUrl;
  }

  fetchDataBlockResource(
    oUser,
    startDateString,
    endDateString,
    blockResBatchUrl
  ) {
    const url = this.spService.getReadURL(
      this.constant.listNames.Blocking.name,
      this.sharedConstant.userCapacity.fetchBlockResource
    );
    this.common.setBatchObject(
      blockResBatchUrl,
      url
        .replace("{{userID}}", oUser.uid)
        .replace(/{{startDateString}}/gi, startDateString)
        .replace(/{{endDateString}}/gi, endDateString),
      null,
      this.constant.Method.GET,
      this.constant.listNames.Blocking.name
    );

    return blockResBatchUrl;
  }

  fetchDataForTimeSpent(
    oUser,
    startDateString,
    endDateString,
    TimeSpentbatchUrl
  ) {
    const selectedUserID = oUser.uid;
    //const invObj = Object.assign({}, this.queryConfig);
    // tslint:disable-next-line: max-line-length
    let url = this.spService.getReadURL(
      this.constant.listNames.Schedules.name,
      this.sharedConstant.userCapacity.fetchSpentTimeTasks
    );
    url = url
      .replace("{{userID}}", selectedUserID)
      .replace(/{{startDateString}}/gi, startDateString)
      .replace(/{{endDateString}}/gi, endDateString);
    this.common.setBatchObject(TimeSpentbatchUrl, url, null, this.constant.Method.GET, this.constant.listNames.Schedules.name);
    // invObj.listName = this.constant.listNames.Schedules.name;
    // invObj.type = "GET";
    // TimeSpentbatchUrl.push(invObj);
    return TimeSpentbatchUrl;
  }

  fetchTasks(oUser, tasks, excludeTasks?, taskStatus?, adhocStatus?) {
    const filteredTasks = [];
    for (const index in tasks) {
      if (tasks.hasOwnProperty(index)) {
        if (excludeTasks && excludeTasks.length) {
          if (
            !excludeTasks.find(
              (t) => tasks[index].ID && t.ID === tasks[index].ID
            ) &&
            !(
              taskStatus.find((status) => tasks[index].Status === status) ||
              adhocStatus.find((status) => tasks[index].Comments === status)
            )
          ) {
            tasks[index].TotalAllocated =
              tasks[index].Task !== "Adhoc"
                ? this.commonservice
                  .convertToHrsMins("" + tasks[index].ExpectedTime)
                  .replace(".", ":")
                : tasks[index].TimeSpent.replace(".", ":");
            const sTimeZone =
              tasks[index].TimeZoneNM === null ? "+5.5" : tasks[index].TimeZoneNM;
            const currentUserTimeZone =
              (new Date().getTimezoneOffset() / 60) * -1;
            tasks[
              index
            ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].StartDate),
              currentUserTimeZone,
              sTimeZone
            );
            tasks[
              index
            ].DueDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].DueDateDT),
              currentUserTimeZone,
              sTimeZone
            );
            filteredTasks.push(tasks[index]);
          }
        } else if (
          tasks[index].Task == "Adhoc" &&
          adhocStatus &&
          adhocStatus.length
        ) {
          if (!adhocStatus.find((status) => tasks[index].Comments === status)) {
            tasks[index].TotalAllocated = tasks[index].TimeSpent.replace(
              ".",
              ":"
            );
            const sTimeZone =
              tasks[index].TimeZoneNM === null ? "+5.5" : tasks[index].TimeZoneNM;
            const currentUserTimeZone =
              (new Date().getTimezoneOffset() / 60) * -1;
            tasks[
              index
            ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].StartDate),
              currentUserTimeZone,
              sTimeZone
            );
            tasks[
              index
            ].DueDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].DueDateDT),
              currentUserTimeZone,
              sTimeZone
            );
            filteredTasks.push(tasks[index]);
          }
        } else if (taskStatus && taskStatus.length) {
          if (!taskStatus.find((status) => tasks[index].Status === status)) {
            tasks[index].TotalAllocated =
              tasks[index].Task !== "Adhoc"
                ? this.commonservice
                  .convertToHrsMins("" + tasks[index].ExpectedTime)
                  .replace(".", ":")
                : tasks[index].TimeSpent.replace(".", ":");
            const sTimeZone =
              tasks[index].TimeZoneNM === null ? "+5.5" : tasks[index].TimeZoneNM;
            const currentUserTimeZone =
              (new Date().getTimezoneOffset() / 60) * -1;
            tasks[
              index
            ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].StartDate),
              currentUserTimeZone,
              sTimeZone
            );
            tasks[
              index
            ].DueDate = this.commonservice.calcTimeForDifferentTimeZone(
              new Date(tasks[index].DueDateDT),
              currentUserTimeZone,
              sTimeZone
            );
            filteredTasks.push(tasks[index]);
          }
        }
        //  else if(tasks[index].Task ==='ResourceBlocking'){
        //   tasks[index].TotalAllocated =
        //    this.commonservice.convertToHrsMins("" + tasks[index].ExpectedTime)
        //           .replace(".", ":")

        //   const sTimeZone =
        //     tasks[index].TimeZoneNM === null ? "+5.5" : tasks[index].TimeZoneNM;
        //   const currentUserTimeZone =
        //     (new Date().getTimezoneOffset() / 60) * -1;
        //   tasks[
        //     index
        //   ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
        //     new Date(tasks[index].StartDate),
        //     currentUserTimeZone,
        //     sTimeZone
        //   );
        //   tasks[
        //     index
        //   ].DueDate = this.commonservice.calcTimeForDifferentTimeZone(
        //     new Date(tasks[index].EndDateDT),
        //     currentUserTimeZone,
        //     sTimeZone
        //   );
        //   filteredTasks.push(tasks[index]);
        // }
        else {
          tasks[index].TotalAllocated =
            tasks[index].Task !== "Adhoc"
              ? this.commonservice
                .convertToHrsMins("" + tasks[index].ExpectedTime)
                .replace(".", ":")
              : tasks[index].TimeSpent.replace(".", ":");
          const sTimeZone =
            tasks[index].TimeZoneNM === null ? "+5.5" : tasks[index].TimeZoneNM;
          const currentUserTimeZone =
            (new Date().getTimezoneOffset() / 60) * -1;
          tasks[
            index
          ].StartDate = this.commonservice.calcTimeForDifferentTimeZone(
            new Date(tasks[index].StartDate),
            currentUserTimeZone,
            sTimeZone
          );
          tasks[
            index
          ].DueDate = this.commonservice.calcTimeForDifferentTimeZone(
            new Date(tasks[index].DueDateDT),
            currentUserTimeZone,
            sTimeZone
          );
          filteredTasks.push(tasks[index]);
        }
      }
    }
    return filteredTasks;
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
          userCapacity: AvailableHrs.find(
            (c) => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()
          )
            ? AvailableHrs.find(
              (c) =>
                c.date.getTime() === oCapacity.arrDateFormat[index].getTime()
            ).availableHrs === 0
              ? "Leave"
              : oCapacity.arrDateRange[index]
            : oCapacity.arrDateRange[index],
          taskCount: 0,
          maxAvailableHours: AvailableHrs.find(
            (c) => c.date.getTime() === oCapacity.arrDateFormat[index].getTime()
          )
            ? AvailableHrs.find(
              (c) =>
                c.date.getTime() === oCapacity.arrDateFormat[index].getTime()
            ).availableHrs
            : oUser.maxHrs,
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
          arrLeaves = $.merge(
            arrLeaves,
            this.getDates(leaves[i].EventDate, leaves[i].EndDate, true)
              .dateArray
          );
          if (!leaves[i].IsHalfDay) {
            arrLeavesDates = $.merge(
              arrLeavesDates,
              this.getDates(leaves[i].EventDate, leaves[i].EndDate, true)
                .dateArray
            );
          }
          for (const j in arrLeaves) {
            if (arrLeaves.hasOwnProperty(j)) {
              // const sLeaveIndex = oUser.dates.map(function(e) { return e.userCapacity; }).indexOf(arrLeaves[j]);
              const mappedArray = oUser.dates.map(function (e) {
                return e.userCapacity;
              });
              const sLeaveIndex = mappedArray
                .map(Number)
                .indexOf(+arrLeaves[j]);
              if (sLeaveIndex > -1) {
                if (leaves[i].IsHalfDay) {
                  oUser.dates[sLeaveIndex].maxAvailableHours =
                    oUser.maxHrs > 0 ? +(oUser.maxHrs / 2) : 0;
                } else {
                  oUser.dates[sLeaveIndex].userCapacity = "Leave";
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

  async calculateAvailableHours(availableHrs) {
    const availableHrsArray = [];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    availableHrs.forEach((element) => {
      const date = new Date(element.WeekStartDate);
      while (date <= new Date(element.WeekEndDate)) {
        const leaveHrs = element[days[date.getDay()] + "Leave"]
          ? element[days[date.getDay()] + "Leave"]
          : 0;
        const availableHrsDay = element[days[date.getDay()]] - leaveHrs;

        availableHrsArray.push({
          date: new Date(date),
          availableHrs: availableHrsDay,
        });
        date.setDate(date.getDate() + 1);
      }
    });

    return availableHrsArray;
  }

  async SplitfetchTasks(tasks) {
    let ReturnTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].Task === "Adhoc") {
        ReturnTasks.push(
          new Object({
            Title: tasks[i].Title,
            projectCode: tasks[i].ProjectCode,
            StartDate: tasks[i].StartDate,
            EndDate: tasks[i].DueDateDT,
            TimeSpentDate: new Date(
              this.datepipe.transform(tasks[i].StartDate, "MM/dd/yyyy")
            ),
            TimeSpentPerDay: tasks[i].TimeSpent.replace(".", ":"),
            Status: tasks[i].Status,
            TotalTimeSpent: tasks[i].TimeSpent
              ? tasks[i].TimeSpent.replace(".", ":")
              : "0:0",
            SubMilestones: tasks[i].SubMilestones,
            shortTitle: "",
          })
        );
      } else {
        const timeSpentForTask = tasks[i].TimeSpentPerDay
          ? tasks[i].TimeSpentPerDay.split(/\n/)
          : [];
        if (timeSpentForTask.indexOf("") > -1) {
          timeSpentForTask.splice(timeSpentForTask.indexOf(""), 1);
        }
        timeSpentForTask.forEach((element) => {
          ReturnTasks.push(
            new Object({
              Title: tasks[i].Title,
              projectCode: tasks[i].ProjectCode,
              StartDate: tasks[i].Actual_x0020_Start_x0020_Date,
              EndDate: tasks[i].Actual_x0020_End_x0020_Date
                ? tasks[i].Actual_x0020_End_x0020_Date
                : tasks[i].DueDate,
              TimeSpentDate: new Date(element.split(":")[0]),
              TimeSpentPerDay:
                element.split(":")[1] + ":" + element.split(":")[2],
              Status: tasks[i].Status,
              TotalTimeSpent: tasks[i].TimeSpent
                ? tasks[i].TimeSpent.replace(".", ":")
                : "0:0",
              SubMilestones: tasks[i].SubMilestones,
              shortTitle: "",
            })
          );
        });
      }
    }
    return ReturnTasks;
  }

  filterData(TempTasks, taskStatus) {
    let taskArray = [];
    taskArray =
      taskStatus === "Confirmed"
        ? TempTasks.filter(
          (c) =>
            c.Status === "Completed" ||
            c.Status === "Not Started" ||
            c.Status === "In Progress" ||
            c.Status === "Auto Closed"
        )
        : taskStatus === "NotConfirmed"
          ? TempTasks.filter(
            (c) =>
              c.Status === "Not Confirmed" ||
              c.Status === "Planned" ||
              c.Status === "Blocked"
          )
          : taskStatus === "Adhoc"
            ? TempTasks.filter(
              (c) =>
                c.Task === "Adhoc"
            )
            : TempTasks;

    return taskArray;
  }


  getTimeSpentColorExcel(dateObj, date, GoLiveDate) {
    if (dateObj.TimespentbackgroundColor) {
      return "orange";
    }
    if (
      GoLiveDate !== null &&
      new Date(this.datepipe.transform(date, "MM/dd/yyyy")) >=
      new Date(this.datepipe.transform(GoLiveDate, "MM/dd/yyyy"))
    ) {
      return "#ccffcc";
    } else {
      return "#ffffff";
    }
  }

  getTimeSpentBColor(date, GoLiveDate) {
    if (
      GoLiveDate !== null &&
      new Date(this.datepipe.transform(date, "MM/dd/yyyy")) >=
      new Date(this.datepipe.transform(GoLiveDate, "MM/dd/yyyy"))
    ) {
      return "colorgoLive";
    } else {
      return "colortrainee";
    }
  }
}
