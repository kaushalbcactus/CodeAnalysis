import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CAConstantService } from './caconstant.service';
import { SPOperationService } from '../../../Services/spoperation.service';
import { CAGlobalService } from './caglobal.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';

@Injectable({
  providedIn: 'root'
})
export class CACommonService {
  constructor(private caConstantService: CAConstantService,
    private globalConstantService: ConstantsService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    private caGlobalService: CAGlobalService,
    private globalService: GlobalService) { }
  /**
     * This method is used to convert 24 hour format to 12 hours.
     * @param date
     */
  convertTime24to12(date) {
    const checkDate = date.jsdate;
    if (checkDate) {
      date = new Date(date.jsdate);
    } else {
      date = new Date(date);
    }
    let hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const am_pm = date.getHours() >= 12 ? 'PM' : 'AM';
    hours = hours < 10 ? '0' + hours : hours;
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const time = hours + ':' + minutes + ' ' + am_pm;
    return time;
  }
  /**
   * This method is used to calculate the different timezone.
   * @param date
   * @param prevOffset
   * @param currentOffset
   */
  calcTimeForDifferentTimeZone(date, prevOffset, currentOffset) {
    const prevTimezone = parseFloat(prevOffset) * 60 * -1;
    const utc = date.getTime() + (prevTimezone * 60000);
    // create new Date object for different city
    // using supplied offset
    const newDate = new Date(utc + (3600000 * currentOffset));
    // return time as a string newDate.toLocaleString()
    return newDate;
  }
  /**
   * This method is used to calculate the business day between two dates.
   * @param dDate1
   * @param dDate2
   */
  calcBusinessDays(dDate1, dDate2) {         // input given as Date objects
    let iWeeks, iDateDiff, iAdjust = 0;
    dDate1 = new Date(this.datePipe.transform(dDate1, 'MMM dd, yyyy'));
    dDate2 = new Date(this.datePipe.transform(dDate2, 'MMM dd, yyyy'));
    if (dDate2 < dDate1) {
      return -1;
    }                                               // error code if dates transposed
    let iWeekday1 = dDate1.getDay();                // day of week
    let iWeekday2 = dDate2.getDay();
    iWeekday1 = (iWeekday1 === 0) ? 7 : iWeekday1;   // change Sunday from 0 to 7
    iWeekday2 = (iWeekday2 === 0) ? 7 : iWeekday2;
    if ((iWeekday1 > 5) && (iWeekday2 > 5)) {
      iAdjust = 1;  // adjustment if both days on weekend
    }
    iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1;    // only count weekdays
    iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
    // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
    iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000);
    if (iWeekday1 <= iWeekday2) {
      iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1);
    } else {
      iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2);
    }
    iDateDiff -= iAdjust;                            // take into account both days on weekend
    return (iDateDiff + 1);                         // add 1 because dates are inclusive
  }
  /**
   * This method is used to convert hours into mins.
   * @param hours
   */
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
  /**
   * This method is used to replace the salutation for resources or users.
   * @param sText '
   */
  getSkillName(sText) {
    let skillName = '';
    if (sText) {
      skillName = sText.replace('Jr ', '').replace('Sr', '').replace('Medium ', '')
        .replace(' Offsite', '').replace(' Onsite', '');
    }
    return skillName;
  }
  /**
   * This method is used to calculate the difference between two time.
   * @param elem1
   * @param elem2
   */
  ajax_subtractHrsMins(elem1, elem2) {
    let result = 0;
    let negative = false;
    let total = 0;
    elem1 = elem1.indexOf('.') > -1 || elem1.indexOf(':') > -1 ? elem1 : elem1 + '.00';
    elem2 = elem2.indexOf('.') > -1 || elem1.indexOf(':') > -1 ? elem2 : elem2 + '.00';
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
      result = total / 60;
    }
    return this.convertToHrsMins('' + result);
  }
  /**
   * This method is used to add the time.
   * @param arrayTotalTimeSpent
   */
  ajax_addHrsMins(arrayTotalTimeSpent) {
    let totalTime = '';
    let totalHrs: any = 0;
    let totalMins: any = 0;
    for (const i in arrayTotalTimeSpent) {
      if (arrayTotalTimeSpent.hasOwnProperty(i)) {
        totalHrs = +(totalHrs) + +(arrayTotalTimeSpent[i].timeHrs);
        totalMins = +(totalMins) + +(arrayTotalTimeSpent[i].timeMins);
        if (totalMins >= 60) {
          totalHrs++;
          totalMins = totalMins - 60;
        }
      }
    }
    totalMins = totalMins < 10 ? '0' + totalMins : totalMins;
    totalTime = totalHrs + ':' + totalMins;
    return totalTime;
  }
  /**
   * This method is used to create the date in date, hrs, min, am/pm format.
   * @param sDates
   * @param sHrs
   * @param sMins
   * @param sAMPM
   */
  createDate(sDates, sHrs, sMins, sAMPM) {
    let sDate = '';
    sDate = sDates + ' ' + sHrs + ':' + sMins + ':00 ' + sAMPM;
    return sDate;
  }
  /**
   * This method is used to send the email to particualr user with subject and body.
   * @param to
   * @param from
   * @param cc
   * @param templateName
   * @param objEmailBody
   * @param mailSubject
   */
  async triggerMail(to, from, cc, templateName, objEmailBody, mailSubject) {
    const mailContent = this.globalConstantService.listNames.MailContent.name;
    const mailQuery = this.caConstantService.mailContent;
    mailQuery.filter = mailQuery.filter.replace('{0}', templateName);
    //tslint:disable
    // tslint:enable
    const body = await this.spServices.readItems(mailContent, mailQuery);
    // let mailBody = JSON.parse(body._body).d.results[0].Content;
    let mailBody = body.length ? body[0].Content : [];
    for (const data of objEmailBody) {
      mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
    }
    //  cc = [fromEmail];
    this.spServices.sendMail(to, from, mailSubject, mailBody, cc);
  }
  /**
   * This method is to give the unique value with seperator.
   * @param sVal
   * @param sSeparator
   */
  getUniqueValues(sVal, sSeparator) {
    const arrValues = sVal.split(sSeparator);
    let uniqueNames = [];
    $.each(arrValues, function (i, el) {
      //tslint:disable
      if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    uniqueNames = this.cleanArray(uniqueNames);
    return uniqueNames.join(sSeparator);
  }
  /**
   * This method is used to clean the array.
   * @param actual 
   */
  cleanArray(actual) {
    const newArray = new Array();
    for (let i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  //////// CA common

  /**
   * This method is used to get all the items required for unallocated and allocated task.
   * @param resourceCategorizationList 
   * @param projectInformationList 
   * @param scheduleList 
   * @param scheduleQueryOptions 
   */
  async getItems(resourceCategorizationList, projectInformationList, scheduleList, scheduleQueryOptions) {
    const batchGuid = this.spServices.generateUUID();
    const batchContents = new Array();
    const resourceEndPoint = this.spServices.getReadURL('' + resourceCategorizationList + '', this.caConstantService.resourceQueryOptions);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, resourceEndPoint);
    const projectEndPoint = this.spServices.getReadURL('' + projectInformationList + '', this.caConstantService.projectOnLoad);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, projectEndPoint);
    let schedulesItemEndPoint = this.spServices.getReadURL('' + scheduleList + '', scheduleQueryOptions);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, schedulesItemEndPoint);
    batchContents.push('--batch_' + batchGuid + '--');
    const userBatchBody = batchContents.join('\r\n');
    const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
    return arrResults;
  }


  async getProjectDetailsByCode(projectInformationList, projectCode) {
    const batchGuid = this.spServices.generateUUID();
    const batchContents = new Array();
    const Project = Object.assign({}, this.caConstantService.projectQueryOptions);
    Project.filterByCode = Project.filterByCode.replace(/{{projectCode}}/gi, projectCode);
    Project.filter = Project.filterByCode;

    const projectEndPoint = this.spServices.getReadURL('' + projectInformationList + '', Project);
    this.spServices.getBatchBodyGet(batchContents, batchGuid, projectEndPoint);
    batchContents.push('--batch_' + batchGuid + '--');
    const userBatchBody = batchContents.join('\r\n');
    const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
    return arrResults[0][0];
  }
  /**
   * This method will create and object for unallocated and allocated task and assigned the value to it.
   * @param taskCounter 
   * @param schedulesItemFetch 
   * @param task 
   * @param projects 
   * @param resourceList 
   * @param completeTaskArray 
   * @param scTempArrays 
   */
  getCaProperties(taskCounter, schedulesItemFetch, task, projects, resourceList, completeTaskArray, scTempArrays) {

    let scObj = $.extend(true, {}, this.caGlobalService.caObject);
    taskCounter++;
    let projectItem = projects.filter(function (proj) { return proj.ProjectCode === task.ProjectCode });
    if (taskCounter <= 30) {
      const projectAdded = schedulesItemFetch.filter(function (proj) { return (proj.projectCode === task.ProjectCode && proj.milestone === task.Milestone) });
      if (projectAdded.length === 0) {
        const queryObj = {
          projectCode: task.ProjectCode,
          milestone: task.Milestone
        }
        schedulesItemFetch.push(queryObj);
      }
    }
    const resourcesList = $.extend(true, [], resourceList);
    const resPool = this.getResourceByMatrix(resourcesList, task.Task, task.SkillLevel, projectItem[0].ClientLegalEntity, projectItem[0].TA, projectItem[0].DeliverableType);
    scObj.id = task.ID;
    scObj.clientName = projectItem[0].ClientLegalEntity;
    scObj.projectCode = task.ProjectCode;
    scObj.projectManagementURL = scObj.projectName = projectItem[0].WBJID;
    scObj.milestone = task.Milestone;
    scObj.SubMilestones = task.SubMilestones;
    scObj.task = task.Task;
    scObj.timezone = task.TimeZone;
    scObj.title = task.Title;
    scObj.taskName = $.trim(task.Title.replace(scObj.projectCode + '', '').replace(scObj.milestone + '', ''));
    scObj.deliveryType = projectItem[0].DeliverableType;
    scObj.estimatedTime = task.ExpectedTime;
    scObj.startTime = task.StartDate;
    scObj.endTime = task.DueDate;
    scObj.startDate = new Date(task.StartDate);
    scObj.dueDate = new Date(task.DueDate);
    scObj.startDateText = this.datePipe.transform(scObj.startDate, 'd MMM, yyyy, hh:mm a');
    scObj.dueDateText = this.datePipe.transform(scObj.dueDate, 'd MMM, yyyy, hh:mm a');
    scObj.nextTaskStartDate = new Date(); // nextTaskItem[0].StartDate;
    scObj.lastTaskEndDate = new Date(); // prevTaskItem[0].StartDate;
    scObj.sendToClientDate = new Date(); // sentToClientItem[0].StartDate;
    scObj.nextTaskStartDateText = '';
    scObj.lastTaskEndDateText = '';
    scObj.sendToClientDateText = '';
    scObj.NextTasks = task.NextTasks ? task.NextTasks : '';
    scObj.PrevTasks = task.PrevTasks ? task.PrevTasks : '';
    scObj.taskScope = task.Comments;
    scObj.prevTaskComments = '';
    scObj.allocatedResource = '';
    scObj.assignedTo = task.AssignedTo.Title;
    scObj.isAllocatedSelectHidden = true;
    scObj.isAssignedToHidden = false;
    scObj.isEditEnabled = true;
    scObj.editImageUrl = this.globalService.imageSrcURL.editImageURL;
    scObj.taskScopeImageUrl = this.globalService.imageSrcURL.scopeImageURL;
    scObj.taskDeleteImageUrl = this.globalService.imageSrcURL.cancelImageURL;
    scObj.resources = $.extend(true, [], resPool);
    scObj.selectedResources = [];
    scObj.mileStoneTask = [];
    scObj.projectTask = [];
    scTempArrays.clientLegalEntityTempArray.push({ label: scObj.clientName, value: scObj.clientName });
    scTempArrays.projectCodeTempArray.push({ label: scObj.projectCode, value: scObj.projectCode });
    scTempArrays.milestoneTempArray.push({ label: scObj.milestone, value: scObj.milestone });
    scTempArrays.taskTempArray.push({ label: scObj.task, value: scObj.task });
    scTempArrays.deliveryTypeTempArray.push({ label: scObj.deliveryType, value: scObj.deliveryType });
    scTempArrays.allocatedTempArray.push({ label: scObj.estimatedTime, value: scObj.estimatedTime });
    scTempArrays.startTimeTempArray.push({ label: scObj.startDateText, value: scObj.startDateText });
    scTempArrays.endTimeTempArray.push({ label: scObj.dueDateText, value: scObj.dueDateText });
    const resExt = $.extend(true, [], resPool);
    for (const retRes of resExt) {
      retRes.timeAvailable = 0;
      retRes.Color = 'green';
      scObj.selectedResources.push(retRes);
    }
    completeTaskArray.push(scObj);
  }
  /**
   * This method is used to get all the milestones and all the tasks within the milestones. 
   * @param scheduleList 
   * @param arrTasks 
   */
  public async getMilestoneSchedules(scheduleList, arrTasks) {
    const schedulesItemEndPoint = this.spServices.getReadURL('' + scheduleList + '', this.caConstantService.scheduleMilestoneQueryOptions);
    const batchGuid = this.spServices.generateUUID();
    const batchContents = new Array();
    for (const task of arrTasks) {
      const schedulesItemEndPointUpdated = schedulesItemEndPoint.replace('{0}', task.projectCode).replace('{1}', task.milestone).replace('{2}', task.projectCode);
      this.spServices.getBatchBodyGet(batchContents, batchGuid, schedulesItemEndPointUpdated);
    }
    batchContents.push('--batch_' + batchGuid + '--');
    const userBatchBody = batchContents.join('\r\n');
    const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
    for (const count in arrTasks) {
      arrTasks[count].MilestoneTasks = arrResults[count];
    }
    return arrTasks;
  }
  /**
   * This method will fired when sorting or pagination action performed.
   * @param event 
   * @param completeTaskArray 
   * @param filterColumns 
   */
  lazyLoadTask(event, completeTaskArray, filterColumns) {
    this.filterAction(event.sortField, event.sortOrder, event.globalFilter, event.filters, event.first, event.rows, completeTaskArray, filterColumns);
  }

  /**
   * This method is used filter the task based on selected filter.
   * @param sortField 
   * @param sortOrder 
   * @param globalFilter 
   * @param localFilter 
   * @param first 
   * @param rows 
   * @param completeTaskArray 
   * @param filterColumns 
   */
  filterAction(sortField, sortOrder, globalFilter, localFilter, first, rows, completeTaskArray, filterColumns) {
    this.caGlobalService.loading = true;
    let data = completeTaskArray;
    setTimeout(() => {
      if (data) {
        if (sortField) {
          this.customSort(data, sortField, sortOrder);
        }
        if (globalFilter) {
          data = data.filter(row => this.globalFilter(row, globalFilter, filterColumns))
        }
        if (!$.isEmptyObject(localFilter)) {
          data = data.filter(row => this.filterLocal(row, localFilter));
        }
        let items = data.slice(first, (first + rows));
        if (items.length) {
          let localSchedulItemFetch = [];
          for (let item of items) {
            let MilestoneTasks = item.mileStoneTask;
            if (!MilestoneTasks.length) {
              const queryObj = {
                projectCode: item.projectCode,
                milestone: item.milestone
              }
              localSchedulItemFetch.push(queryObj);
            }
          }
          if (localSchedulItemFetch.length) {
            this.getScheduleItems(localSchedulItemFetch, items);
          }
        }
        this.caGlobalService.totalRecords = data.length;
        this.caGlobalService.dataSource = items;
        this.caGlobalService.loading = false;
        setTimeout(() => {
          this.setHeader();
        }, 500);
      }
    }, 1000);
  }

  /**
   * This method is used to filter the data on column basis.
   * @param row 
   * @param filter 
   */
  filterLocal(row, filter) {
    let isInFilter = false;
    let noFilter = true;
    for (var columnName in filter) {
      if (columnName != 'global') {
        if (row[columnName] == null) {
          return;
        }
        noFilter = false;
        let rowValue: String = row[columnName].toString().toLowerCase();
        let filterMatchMode: String = filter[columnName].matchMode;
        if (filterMatchMode.includes("contains") && rowValue.includes(filter[columnName].value.toLowerCase())) {
          isInFilter = true;
        } else if (filterMatchMode.includes("startsWith") && rowValue.startsWith(filter[columnName].value.toLowerCase())) {
          isInFilter = true;
        } else if (filterMatchMode.includes("in") && filter[columnName].value.includes(row[columnName])) {
          isInFilter = true;
        }
        else
          return false;
      }
    }
    if (noFilter) { isInFilter = true; }
    return isInFilter;
  }
  /**
   * This will method is used to filter the data globally.
   * @param row 
   * @param value 
   * @param filterColumns 
   */
  globalFilter(row, value, filterColumns) {
    for (let i = 0; i < filterColumns.length; i++) {
      let column = filterColumns[i];
      if (row[column.field] == null) {
        continue;
      }
      let rowValue: String = row[column.field].toString().toLowerCase();
      if (rowValue.includes(value.toLowerCase())) {
        return true;
      }
    }
    return false;
  }
  /**
   * This method is used to sort the column data either ascending or descending.
   * @param data 
   * @param fieldName 
   * @param order 
   */
  customSort(data, fieldName: string, order: number) {
    data.sort((row1, row2) => {
      const val1 = row1[fieldName];
      const val2 = row2[fieldName];
      if (val1 === val2) {
        return 0;
      }
      let result = -1;
      if (val1 > val2) {
        result = 1;
      }
      if (order < 0) {
        result = -result;
      }
      return result;
    });
  }
  /**
   * This method will get all the items from schedule list.
   * @param localSchedulItemFetch 
   * @param items 
   */
  async getScheduleItems(localSchedulItemFetch, items) {
    const arrMilestoneTasks = await this.getMilestoneSchedules(this.globalConstantService.listNames.Schedules.name, localSchedulItemFetch);
    for (const task of items) {
      this.getMiscDates(task, arrMilestoneTasks);
    }
  }

  /**
   * This method is used to seperate the resource based on their role.
   * @param filterResource 
   * @param task 
   * @param skillLevel 
   * @param clientLegalEntity 
   * @param ta 
   * @param deliverableType 
   */
  getResourceByMatrix(filterResource, task, skillLevel, clientLegalEntity, ta, deliverableType) {
    const deliverable = deliverableType;
    const resources = filterResource;
    const filteredResources = [];
    if (resources && resources.length) {
      resources.forEach(element => {
        const resSkill = this.getSkillName(element.SkillLevel.Title);
        const deliveryExcUsers = element.DeliverableExclusion.results.length > 0 ?
          element.DeliverableExclusion.results.filter(function (objt) {
            return objt.Title !== deliverable;
          }) : ['IncludeAll'];
        const taExcUsers = element.TAExclusion.results.length > 0 ? element.TAExclusion.results.filter(function (objt) {
          return objt.Title !== ta;
        }) : ['IncludeAll'];
        const tasks = element.Tasks.results.length > 0 ? element.Tasks.results.filter(function (objt) {
          return objt.Title === task;
        }) : [];
        if (deliveryExcUsers.length > 0 && taExcUsers.length > 0 && tasks.length > 0) {
          const recomendedUserByDelv = element.Deliverables.results.length > 0 ?
            element.Deliverables.results.filter(function (objt) {
              return objt.Title === deliverable;
            }) : [];
          const recomendedUserByTa = element.TA.results.length > 0 ?
            element.TA.results.filter(function (objt) {
              return objt.Title === ta;
            }) : [];
          const recomendedUserByAccount = element.Account.results.length > 0 ?
            element.Account.results.filter(function (objt) {
              return objt.Title === clientLegalEntity;
            }) : [];
          if ((recomendedUserByDelv.length > 0 || recomendedUserByTa.length > 0
            || recomendedUserByAccount.length > 0) && skillLevel === $.trim(resSkill)) {
            element.userType = 'Recommended';
            filteredResources.push(element);
          } else {
            element.userType = 'Other';
            filteredResources.push(element);
          }
          element.Title = element.UserName.Title;
        }
      });
      return filteredResources;
    }
  }
  /**
   * This method is used to sort resources either ascending or descending with multiple property.
   * @param filteredResources 
   * @param task 
   */
  sortResources(filteredResources, task) {
    if (task.projectTask) {
      const projectTaskFilter = task.projectTask.filter(function (projObj) {
        return projObj.projectCode === task.projectCode;
      });
      let completedTask;
      if (projectTaskFilter.length) {
        completedTask = projectTaskFilter[0].MilestoneTasks.filter(function (tasobj) {
          return tasobj.Status === 'Completed' && task.task === tasobj.Task;
        });
      }
      const sortedResources = [];
      const recommended = filteredResources.filter(function (objt) {
        return objt.userType === 'Recommended' || objt.userType === 'Best Fit';
      });
      if (recommended.length) {
        for (const user of recommended) {
          user.userType = 'Recommended';
          if (completedTask[0] && user.UserName.ID === completedTask[0].AssignedTo.ID) {
            user.isUserTaskCompleted = 1;
          } else {
            user.isUserTaskCompleted = 0;
          }
        }
        recommended.sort(function (a, b) {
          return b['isUserTaskCompleted'] - a['isUserTaskCompleted'] || b['timeAvailable'] - a['timeAvailable'] || a['Title'] - b['Title'];
        });
        recommended[0].userType = 'Best Fit';
        $.merge(sortedResources, recommended);
      }
      const other = filteredResources.filter(function (objt) {
        return objt.userType === 'Other';
      });
      if (other.length) {
        other.sort(function (a, b) {
          return b['timeAvailable'] - a['timeAvailable'] || a['Title'] - b['Title'];
        });
        $.merge(sortedResources, other);
      }
      return sortedResources;
    }
    else {
      return filteredResources;
    }
  }

  /**
   * This method is used to get the Next, Previous, SCTask and Previous to SCTask date.
   * @param task 
   * @param arrMilestoneTasks 
   */
  getMiscDates(task, arrMilestoneTasks) {
    task.projectTask = arrMilestoneTasks;
    const oReturnedProjectMil = arrMilestoneTasks.filter(function (milTask) { return (milTask.projectCode === task.projectCode && milTask.milestone === task.milestone) });
    if (oReturnedProjectMil && oReturnedProjectMil.length) {
      const milTasks = oReturnedProjectMil[0].MilestoneTasks;
      task.mileStoneTask = milTasks;
      const nextTasks = [];
      milTasks.forEach(milTask => {
        let taskArr = [];
        taskArr = milTask.PrevTasks ? milTask.PrevTasks.split(";#") : [];
        if (taskArr.indexOf(task.title) > -1) {
          nextTasks.push(milTask);
        }
      });
      if (nextTasks.length) {
        nextTasks.sort(function (a, b) {
          return a.StartDate - b.StartDate;
        });
        task.nextTaskStartDate = nextTasks[0].StartDate;
        task.nextTaskStartDateText = this.datePipe.transform(task.nextTaskStartDate, 'd MMM, yyyy, hh:mm a');

      }
      const prevTasks = [];
      milTasks.forEach(milTask => {
        let taskArr = [];
        taskArr = milTask.NextTasks ? milTask.NextTasks.split(";#") : [];
        if (taskArr.indexOf(task.title) > -1) {
          prevTasks.push(milTask);
        }
      });
      prevTasks.forEach(milTask => {
        task.prevTaskComments = task.prevTaskComments ? task.prevTaskComments + "<br/>" + milTask.TaskComments : milTask.TaskComments;
      });
      let currentTraverseTask = task.title;
      let scTask = this.getSCTask(currentTraverseTask, milTasks);
    
      if (scTask && scTask.length) {
        task.sendToClientDate = scTask[0].StartDate;
        task.sendToClientDateText = this.datePipe.transform(task.sendToClientDate, 'd MMM, yyyy, hh:mm a');
        const prevTasks = [];
        milTasks.forEach(milTask => {
          let taskArr = [];
          taskArr = milTask.NextTasks ? milTask.NextTasks.split(";#") : [];
          if (taskArr.indexOf(scTask[0].Title) > -1) {
            prevTasks.push(milTask);
          }
        });
        if (prevTasks.length) {
          prevTasks.sort(function (a, b) {
            return b.DueDate - a.DueDate;
          });
          task.lastTaskEndDate = prevTasks[0].DueDate;
          task.lastTaskEndDateText = this.datePipe.transform(task.lastTaskEndDate, 'd MMM, yyyy, hh:mm a');
        }
      }
    }
  }
  /**
   * This method is used to get the sc task start date by traversing the milestone.
   * @param currentTraverseTask 
   * @param milTasks 
   */
  getSCTask(currentTraverseTask, milTasks) {
    const currentMilTask = milTasks.filter(function (milTask) {
      return milTask.Title === currentTraverseTask;
    });
    if (currentMilTask && currentMilTask.length) {
      if (currentMilTask[0].Task !== 'Send to client' && currentMilTask[0].Status !== 'Deleted') {
        let taskArr = [];
        taskArr = currentMilTask[0].NextTasks ? currentMilTask[0].NextTasks.split(";#") : [];
        if (taskArr && taskArr.length) {
          currentTraverseTask = taskArr[0];
          return this.getSCTask(currentTraverseTask, milTasks);
        }
      } else {
        return currentMilTask;
      }
    }
  }
  /**
   * This method is used to show the comments when user click on task scope option.
   * @param task 
   * @param popupTaskScopeContent 
   * @param completeTaskArray 
   * @param modalService 
   */
  getAllocateTaskScope(task, popupTaskScopeContent, completeTaskArray, modalService) {
    const index = completeTaskArray.findIndex(item => item.id === task.id);
    this.caGlobalService.taskScope = this.stripHtml(completeTaskArray[index].taskScope ? completeTaskArray[index].taskScope.replace(/<br\s*\/?>/gi, '\n') : '');
    this.caGlobalService.taskPreviousComment = this.stripHtml(completeTaskArray[index].prevTaskComments ? completeTaskArray[index].prevTaskComments.replace(/<br\s*\/?>/gi, '\n') : '');
    this.caGlobalService.curTaskScope = completeTaskArray[index];
    modalService.open(popupTaskScopeContent, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  stripHtml(html) {
    // Create a new div element
    let temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
  }
  /**
   * This method is used to remove the duplicate from array based on property.
   * @param array 
   * @param param 
   */
  unique(array, param) {
    return array.filter(function (item, pos, array) {
      return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
    })
  }
  /**
   * This method is used to resize the header for different size of screen.
   */
  setHeader() {
    const headerMaxHeight = $('.ui-table-scrollable-header').height();
    const headertableHeight = $('.ui-table-scrollable-header-box').height();
    const diffHeight = headerMaxHeight - headertableHeight;
    $('.ui-table-scrollable-body').css('margin-top', -diffHeight);
  }
  /**
   * This method is used to update the comments in for particular task in schedule list.
   * @param task 
   * @param comments 
   */
  saveTaskScopeComments(task, comments) {
    const options = { 'Comments': comments };
    this.spServices.update(this.globalConstantService.listNames.Schedules.name, task.id, options, 'SP.Data.SchedulesListItem');
  }
  /**
   * This method is used to sort the array using multiple properties.
   * @param array 
   * @param attrs 
   */
  sortByAttribute(array, ...attrs) {
    // generate an array of predicate-objects contains
    // property getter, and descending indicator
    let predicates = attrs.map(pred => {
      let descending = pred.charAt(0) === '-' ? -1 : 1;
      pred = pred.replace(/^-/, '');
      return {
        getter: o => o[pred],
        descend: descending
      };
    });
    // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
    return array.map(item => {
      return {
        src: item,
        compareValues: predicates.map(predicate => predicate.getter(item))
      };
    })
      .sort((o1, o2) => {
        let i = -1, result = 0;
        while (++i < predicates.length) {
          if (o1.compareValues[i].toLowerCase() < o2.compareValues[i].toLowerCase()) result = -1;
          if (o1.compareValues[i].toLowerCase() > o2.compareValues[i].toLowerCase()) result = 1;
          if (result *= predicates[i].descend) break;
        }
        return result;
      })
      .map(item => item.src);
  }

  sortByDate(array, prop) {
    array.sort(function (a, b) {
      a = new Date(a[prop]).getTime();
      b = new Date(b[prop]).getTime();
      return a - b;
    });
    return array;
  }


  // added by Maxwell
  async ResourceAllocation(task, projectInformationList) {

    debugger;
    const project = await this.getProjectDetailsByCode(projectInformationList, task.projectCode);

    let writers = [], arrWriterIDs = [],
      //arrWriterNames = [],
      qualityChecker = [],
      arrQualityCheckerIds = [],
      //arrQCNames = [],
      editors = [], arrEditorsIds = [],
      //arrEditorsNames = [],
      graphics = [], arrGraphicsIds = [],
      //arrGraphicsNames = [],
      pubSupport = [], arrPubSupportIds = [],
      //arrPubSupportNames = [],
      reviewers = [], arrReviewers = [],
      //arrReviewesNames = [],
      arrPrimaryResourcesIds = [];

    arrWriterIDs = this.getIDFromItem(project.Writers);
    arrReviewers = this.getIDFromItem(project.Reviewers);
    arrEditorsIds = this.getIDFromItem(project.Editors);
    arrQualityCheckerIds = this.getIDFromItem(project.QC);
    arrGraphicsIds = this.getIDFromItem(project.GraphicsMembers);
    arrPubSupportIds = this.getIDFromItem(project.PSMembers);
    arrPrimaryResourcesIds = this.getIDFromItem(project.PrimaryResMembers);

    if (task.allocatedResource && task.allocatedResource !== -1) {
      switch (task.task) {
        case 'QC':
        case 'Review-QC':
        case 'Inco-QC':
          arrQualityCheckerIds.push(task.allocatedResource);
          break;
        case 'Edit':
        case 'Review-Edit':
        case 'Inco-Edit':
        case 'Galley':
          arrEditorsIds.push(task.allocatedResource);
          break;
        case 'Graphics':
        case 'Review-Graphics':
        case 'Inco-Graphics':
          arrGraphicsIds.push(task.allocatedResource);
          break;
      }
    }

    const updatedResources = {
      editor: { results: [...arrEditorsIds] },
      graphicsMembers: { results: [...arrGraphicsIds] },
      qualityChecker: { results: [...arrQualityCheckerIds] },
      allDeliveryRes: []
    };

    updatedResources.allDeliveryRes = [...arrWriterIDs, ...updatedResources.editor.results,
    ...updatedResources.graphicsMembers.results, ...updatedResources.qualityChecker.results,
    ...arrReviewers, ...arrPubSupportIds,
    ...arrPrimaryResourcesIds];

    let updateProjectRes = {};
    updateProjectRes = {
      EditorsId: { results: updatedResources.editor.results },
      AllDeliveryResourcesId: { results: updatedResources.allDeliveryRes },
      QCId: { results: updatedResources.qualityChecker.results },
      GraphicsMembersId: { results: updatedResources.graphicsMembers.results },
    };
    this.spServices.update(projectInformationList, project.ID, updateProjectRes, 'SP.Data.ProjectInformationListItem');
  }



  getIDFromItem(objItem) {
    let arrData = [];
    if (objItem.hasOwnProperty('results')) {
      arrData = objItem.results.map(a => a.ID);
    }

    return arrData;
  }
}