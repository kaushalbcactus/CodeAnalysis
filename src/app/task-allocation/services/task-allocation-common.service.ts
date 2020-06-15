import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { IMilestoneTask } from '../interface/allocation';

@Injectable({
  providedIn: 'root'
})
export class TaskAllocationCommonService {

  constructor(public sharedObject: GlobalService,
    private commonService: CommonService,
    public datepipe: DatePipe) { }

  ganttParseObject: any = {}
  allTasks: any = {}
  attachedEvents = [];
  allocationSplitColumn = `<span class='ganttOverlayIcon' "title="Click to see allocation split">
  <i class="fa fa-info-circle" aria-hidden="true"></i></span>`;
  contextMenu = `<i class="fa fa-ellipsis-v contextMenu" data-action="contextmenu"></i>`;

  adhocStatus = [
    'Administrative Work',
    'Internal meeting'
  ]

  taskStatus = [
    'Not Saved',
    'Not Confirmed'
  ]

  getResourceByMatrix(task, allTasks) {
    let resources = this.sharedObject.oTaskAllocation.oResources;
    resources = resources.filter(e => e.TAVisibility === 'Yes');
    const prjDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const cmL1 = prjDetails.cmLevel1.results ? prjDetails.cmLevel1.results : [];
    const cmL2 = prjDetails.cmLevel2 ? prjDetails.cmLevel2 : {};
    const cm = [...cmL1, cmL2].filter(function (item, i, ar) { return ar.indexOf(item) === i; });
    const filteredResources = [];
    if (task.IsCentrallyAllocated === 'Yes') {
      const oCentralGroup = {
        userType: 'Skill',
        Title: task.skillLevel,
        Name: task.skillLevel,
        SkillText: task.skillLevel

      };
      // tslint:disable: max-line-length
      if ((!task.AssignedTo) || (task.AssignedTo && (!task.AssignedTo.hasOwnProperty('ID') || (task.AssignedTo.hasOwnProperty('ID') && task.AssignedTo.ID === -1)))) {
        task.AssignedTo = { ID: undefined, Title: oCentralGroup.Title, Email: undefined, SkillText: oCentralGroup.SkillText };
        task.pRes = oCentralGroup.Title;
        filteredResources.push(oCentralGroup);
        if (task.slotType === 'Both' && resources.length > 0) {
          this.getResourcesForTask(task, allTasks, resources, prjDetails, filteredResources);
        }
      }
      return this.sortResources(filteredResources);
    } else {
      if ((task.itemType === 'Send to client' || task.itemType === 'Client Review') && cm.length > 0) {
        for (const cmUser of cm) {
          cmUser.userType = '';
          filteredResources.push(cmUser);
        }
        return filteredResources;
      } else if (resources.length > 0) {
        this.getResourcesForTask(task, allTasks, resources, prjDetails, filteredResources);
        return this.sortResources(filteredResources);
      } else {
        return filteredResources;
      }
    }

  }

  getResourcesForTask(task, allTasks, resources, prjDetails, filteredResources) {
    const allocatedResources = [];
    let similarTasksUsers = [];
    let checkSkillLevel = false;
    const taskType = task.itemType.replace(/Slot/g, '');
    similarTasksUsers = allTasks.filter(function (objt) {
      return objt.itemType === taskType;
    });
    similarTasksUsers.forEach(element => {
      if (element.AssignedTo && element.AssignedTo.hasOwnProperty('ID')) {
        const resource = resources.filter(e => e.UserName.ID === element.AssignedTo.ID);
        const checkExclusion = this.isUserAllowed(resource[0], prjDetails);
        if (checkExclusion) {
          allocatedResources.push(element.AssignedTo.ID);
        }
      }

    });
    resources.forEach(element => {
      const checkExclusion = this.isUserAllowed(element, prjDetails);
      if (checkExclusion) {
        const taskMatchingUsers = element.Tasks.results.filter(function (objt) {
          return objt.Title === taskType;
        });
        if (taskMatchingUsers.length > 0) {
          if (task.SkillLevel && element.SkillLevel) {
            checkSkillLevel = element.SkillLevel.Title.indexOf(task.SkillLevel) > -1;
          }
          // if (checkSkillLevel) {
          const recomendedUserByDelv = element.Deliverables.results.length > 0 ?
            element.Deliverables.results.filter(function (objt) {
              return objt.Title === prjDetails.deliverable;
            }) : [];
          const recomendedUserByTa = element.TA.results.length > 0 ?
            element.TA.results.filter(function (objt) {
              return objt.Title === prjDetails.ta;
            }) : [];
          const recomendedUserByAccount = element.Account.results.length > 0 ?
            element.Account.results.filter(function (objt) {
              return objt.Title === prjDetails.account;
            }) : [];

          if (allocatedResources.includes(element.UserName.ID)) {
            element.userType = 'Allocated';
            filteredResources.push(element);
          }
          else if (recomendedUserByDelv.length > 0 || recomendedUserByTa.length > 0 || recomendedUserByAccount.length > 0) {
            if (!task.SkillLevel || (task.SkillLevel && checkSkillLevel)) {
              element.userType = 'Recommended';
              filteredResources.push(element);
            }
            else {
              element.userType = 'Other';
              filteredResources.push(element);
            }
          } else {
            element.userType = 'Other';
            filteredResources.push(element);
          }
          element.Title = element.UserName.Title;
          element.ID = element.UserName.ID;
          element.Id = element.UserName.ID;
          element.Name = element.UserName.Name;
          element.SkillText = this.getSkillName(element.SkillLevel.Title);
          // }
        }
      }
    });
  }

  sortResources(filteredResources) {
    const sortedResources = [];
    const type = filteredResources.filter(function (objt) {
      return objt.userType === 'Skill';
    });
    if (type.length) {
      $.merge(sortedResources, type);
    }
    const allocated = filteredResources.filter(function (objt) {
      return objt.userType === 'Allocated';
    });
    if (allocated.length) {
      $.merge(sortedResources, allocated);
    }
    const recommended = filteredResources.filter(function (objt) {
      return objt.userType === 'Recommended';
    });
    if (recommended.length) {
      $.merge(sortedResources, recommended);
    }
    const other = filteredResources.filter(function (objt) {
      return objt.userType === 'Other';
    });
    if (other.length) {
      $.merge(sortedResources, other);
    }
    const cmL2 = filteredResources.filter(function (objt) {
      return objt.userType === '';
    });
    if (cmL2.length) {
      $.merge(sortedResources, cmL2);
    }
    return sortedResources;
  }

  getSkillName(sText) {
    let skillName = '';
    if (sText) {
      skillName = sText.replace("Jr ", "").replace("Sr", "").replace("Medium ", "")
        .replace(" Offsite", "").replace(" Onsite", "");
    }
    return skillName;
  }

  isUserAllowed(element, prjDetails) {
    const deliveryExcUsers = element ? element.DeliverableExclusion.results.length > 0 ?
      element.DeliverableExclusion.results.filter(function (objt) {
        return objt.Title === prjDetails.deliverable;
      }) : [] : [];
    const taExcUsers = element ? element.TAExclusion.results.length > 0 ? element.TAExclusion.results.filter(function (objt) {
      return objt.Title === prjDetails.ta;
    }) : [] : [];
    return deliveryExcUsers.length <= 0 && taExcUsers.length <= 0 ? true : false;
  }

  fetchTaskName(tasksString, projectCode, milestone) {
    let tasksName = null;
    if (tasksString) {
      const tasks = tasksString.split(';#');
      const tasksNames = tasks.map(element => {
        return element.replace(projectCode + ' ', '').replace(milestone + ' ', '');
      });
      tasksName = tasksNames.join(';');
    }
    return tasksName;
  }

  compareTo(currentLink, nextLink) {
    return this.compareSourceWithTarget(currentLink.target, nextLink.source);
  }

  compareSourceWithTarget(target, source) {
    if (target === source) {
      return target;
    }
    return null;
  }

  async findNextLink(target, submilestone, links) {
    const targetLinks = submilestone.task.links.filter(c => c.source === target).map(c => c.target);
    return targetLinks;
  }

  getDate(startDate) {
    return new Date(startDate !== '' ? startDate.date.year + '/' + (startDate.date.month < 10 ?
      '0' + startDate.date.month : startDate.date.month) + '/' + (startDate.date.day < 10
        ? '0' + startDate.date.day : startDate.date.day) : '');
  }
  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }
  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
  }

  convertDate(task) {
    var converteddateObject: any = {}

    converteddateObject.convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(task.StartDate),
      this.sharedObject.currentUser.timeZone, task.assignedUserTimeZone);

    converteddateObject.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(converteddateObject.convertedStartDate,
      task.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

    converteddateObject.convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(task.DueDate),
      this.sharedObject.currentUser.timeZone, task.assignedUserTimeZone);

    converteddateObject.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(converteddateObject.convertedEndDate,
      task.assignedUserTimeZone, this.sharedObject.currentUser.timeZone);

    return converteddateObject
  }

  milestoneObject(milestone, task?) {
    milestone.start_date = task ? new Date(task.start_date) : new Date(milestone.start_date);
    milestone.end_date = task ? new Date(task.end_date) : new Date(milestone.end_date);
    milestone.pUserStart = task ? new Date(task.pUserStart) : new Date(milestone.pUserStart);
    milestone.pUserEnd = task ? new Date(task.pUserEnd) : new Date(milestone.pUserEnd);
    milestone.pUserStartDatePart = this.getDatePart(milestone.pUserStart);
    milestone.pUserStartTimePart = this.getTimePart(milestone.pUserStart);
    milestone.pUserEndDatePart = this.getDatePart(milestone.pUserEnd);
    milestone.pUserEndTimePart = this.getTimePart(milestone.pUserEnd);
    milestone.editMode = false;
    milestone.edited = false;
    milestone.tat = task ? task.tat : milestone.tat;
    milestone.tatVal = this.commonService.calcBusinessDays(new Date(milestone.start_date), new Date(milestone.end_date));
    milestone.AssignedTo = task ? task.AssignedTo : milestone.AssignedTo;
    // milestone.allowStart = task ? task.allowStart : milestone.allowStart;
    milestone.budgetHours = task ? task.budgetHours : milestone.budgetHours;
    milestone.slotColor = task ? task.slotColor : milestone.slotColor;
    milestone.DisableCascade = task ? task.DisableCascade : milestone.DisableCascade;
    milestone.allocationColor = '';
    milestone.showAllocationSplit = task ? task.showAllocationSplit : false;
    milestone.allocationPerDay = task ? task.allocationPerDay : '';
    milestone.allocationTypeLoader = false;
    return milestone;
  }

  generateDateFromParts() {

  }

  ganttDataObject(data, milestoneObj?, NextSubMilestone?, milestone?, hrsMinObject?) {

    var milestoneSubmilestones = data.SubMilestones ? data.SubMilestones !== null ? data.SubMilestones.replace(/#/gi, "").split(';') : [] : [];

    var dbSubMilestones: Array<any> = milestoneSubmilestones.length > 0 ? milestoneSubmilestones.map(o => new Object({ subMile: o.split(':')[0], position: o.split(':')[1], status: o.split(':')[2] })) : [];

    let convertedDate = this.convertDate(data);
    // tslint:disable: object-literal-key-quotes
    let ganttObject : IMilestoneTask = {
      pUserStart: data.type == 'submilestone' ? null :
        data.type == 'task' ? new Date(convertedDate.convertedStartDate) :
          new Date(data.startDate !== "" ? data.startDate.date.year + "/" + (data.startDate.date.month < 10 ? "0" + data.startDate.date.month : data.startDate.date.month) + "/" + (data.startDate.date.day < 10 ? "0" + data.startDate.date.day : data.startDate.date.day) : ''),
      pUserEnd: data.type == 'submilestone' ? null :
        data.type == 'task' ? new Date(convertedDate.convertedEndDate) :
          new Date(data.endDate !== "" ? data.endDate.date.year + "/" + (data.endDate.date.month < 10 ? "0" + data.endDate.date.month : data.endDate.date.month) + "/" + (data.endDate.date.day < 10 ? "0" + data.endDate.date.day : data.endDate.date.day) : ''),
      pUserStartDatePart : data.type == 'submilestone' ? null : data.type == 'task' ? this.getDatePart(convertedDate.convertedStartDate) : this.getDate(data.startDate),
      pUserStartTimePart : data.type == 'task' ? this.getTimePart(convertedDate.convertedStartDate) : '',
      pUserEndDatePart : data.type == 'submilestone' ? null : data.type == 'task' ? this.getDatePart(convertedDate.convertedEndDate) : this.getDate(data.endDate),
      pUserEndTimePart : data.type == 'task' ? this.getTimePart(convertedDate.convertedEndDate) : '',
      status : data.Status,
      id : data.Id,
      text: data.type == 'submilestone' ? milestoneObj.isCurrent && NextSubMilestone.position === data.position && NextSubMilestone.status === data.status ? data.subMile + ' (Next)' : milestoneObj.isNext && NextSubMilestone.position === data.position && NextSubMilestone.status === data.status ? data.subMile + ' (Next)' : data.subMile :
        data.type == 'task' ? data.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + data.Milestone + ' ', '') :
          this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === data.Title ? data.Title + " (Current)" : this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === data.Title ? dbSubMilestones.length > 0 ?  data.Title : data.Title + ' (Next)' : data.Title,
      title :  data.type == 'submilestone' ? data.subMile :
      data.type == 'task' ? data.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + data.Milestone + ' ', '') :
        data.Title,
      milestone : data.type == 'milestone' ? '' : data.Milestone,
      start_date : data.type == 'submilestone' ? null :
        data.type == 'task' ? new Date(convertedDate.jsLocalStartDate) :
          new Date(data.startDate !== "" ? data.startDate.date.year + "/" + (data.startDate.date.month < 10 ? "0" + data.startDate.date.month : data.startDate.date.month) + "/" + (data.startDate.date.day < 10 ? "0" + data.startDate.date.day : data.startDate.date.day) : ''),
      end_date : data.type == 'submilestone' ? null :
        data.type == 'task' ? new Date(convertedDate.jsLocalEndDate) :
          new Date(data.endDate !== "" ? data.endDate.date.year + "/" + (data.endDate.date.month < 10 ? "0" + data.endDate.date.month : data.endDate.date.month) + "/" + (data.endDate.date.day < 10 ? "0" + data.endDate.date.day : data.endDate.date.day) : ''),
      user : data.AssignedTo ? data.AssignedTo.Title !== undefined ? data.AssignedTo.Title : '' : '  ',
      open : data.type == 'task' ? data.IsCentrallyAllocated === 'Yes' ? 0 : 1 : this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === data.Title ? 1 : 0,
      parent : data.type == 'submilestone' ? milestone.Id : data.type == 'task' ? data.Task === 'Client Review' ? 0 : data.ParentSlot ? data.ParentSlot : milestone.Id : 0,
      res_id : data.type == 'task' ? data.AssignedTo ? data.AssignedTo : '' : '',
      // owner_id : data.type == 'task' ? data.AssignedTo ? data.AssignedTo.ID : '' : '',
      nextTask : data.type == 'task' ? this.fetchTaskName(data.NextTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, data.Milestone) : '',
      previousTask : data.type == 'task' ? this.fetchTaskName(data.PrevTasks, this.sharedObject.oTaskAllocation.oProjectDetails.projectCode, data.Milestone) : '',
      budgetHours : data.type == 'task' ? data.ExpectedTime : data.ExpectedTime ? data.ExpectedTime.toString() : '0',
      spentTime : data.Task == 'Client Review' ? '' : data.type == 'task' ? this.commonService.addHrsMins([hrsMinObject]) : '0:0',
      // allowStart : true,//data.type == 'task' ? data.AllowCompletion === true || data.AllowCompletion === 'Yes' ? true : false : false,
      tat : data.type == 'submilestone' ? false : data.type == 'task' ? data.TATStatus === true || data.TATStatus === 'Yes' ? true : false : true,
      tatVal : data.type == 'submilestone' ? 0 : data.type == 'task' ? this.commonService.calcBusinessDays(convertedDate.jsLocalStartDate, convertedDate.jsLocalEndDate)
        : this.commonService.calcBusinessDays(new Date(data.Actual_x0020_Start_x0020_Date), new Date(data.Actual_x0020_End_x0020_Date)),
      milestoneStatus : (data.type == 'task' || data.type == 'submilestone') ? milestone.Status : '',
      type : data.type,
      editMode :  false,
      scope : data.type == 'task' ? data.Comments : null,
      isCurrent : data.type == 'task' ? this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === milestone.Title ? true : false : data.type == 'submilestone' ? milestoneObj.isCurrent && NextSubMilestone.position === data.position && NextSubMilestone.status === data.status ? true : false : this.sharedObject.oTaskAllocation.oProjectDetails.currentMilestone === data.Title ? true : false,
      isNext : data.type == 'submilestone' ? milestoneObj.isNext && NextSubMilestone.position === data.position && NextSubMilestone.status === data.status ? true : false : this.sharedObject.oTaskAllocation.oProjectDetails.nextMilestone === data.Title ? true : false,
      // isFuture : data.type == 'submilestone' ? false : this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones !== undefined
      // ? this.sharedObject.oTaskAllocation.oProjectDetails.futureMilestones.indexOf(data.Title)
      //   > -1 ? true : false : false,
      assignedUsers : data.type == 'task' ? data.assignedUsers : '',
      AssignedTo : data.type == 'task' ? data.AssignedTo.ID ? data.AssignedTo : '' : '',
      userCapacityEnable : false,
      position : data.position,
      color : data.color,
      itemType : (data.type == 'milestone' || data.type == 'submilestone') ? data.type : data.Task,
      slotType : data.type == 'task' ? data.IsCentrallyAllocated === 'Yes' ? 'Slot' : 'Task' : '',
      edited : false,
      added : false,
      slotColor : 'white',
      IsCentrallyAllocated : (data.type == 'milestone' || data.type == 'submilestone' || data.Task == 'Client Review') ? 'No' : data.IsCentrallyAllocated,
      submilestone : data.SubMilestones,
      skillLevel : data.SkillLevel,
      CentralAllocationDone : data.CentralAllocationDone,
      ActiveCA : data.ActiveCA,
      assignedUserTimeZone : data.assignedUserTimeZone,
      parentSlot : data.ParentSlot ? data.ParentSlot : '',
      DisableCascade : (data.DisableCascade && data.DisableCascade === 'Yes') ? true : false,
      deallocateSlot : false,
      taskFullName : data.Title,
      subMilestonePresent : dbSubMilestones.length > 0 ? true : false,
      allocationPerDay : data.AllocationPerDay ? data.AllocationPerDay : '',
      allocationColor : '',
      showAllocationSplit : data.AllocationPerDay ? true : false,
      allocationTypeLoader : false,
      ganttOverlay: data.AllocationPerDay ? this.allocationSplitColumn : '',
      ganttMenu: ''
    };
    return ganttObject;
  }

  getTasksFromMilestones(milestone, includeSubTasks, data, getMilSubMil?) {
    let tasks = [];
    if (getMilSubMil) {
      tasks.push(milestone.data);
    }
    if (milestone.children && milestone.children.length) {
      const submilestone = milestone.children[0];
      if (submilestone.data.type === 'task') {
        tasks = this.getTasksSubTasks(tasks, includeSubTasks, milestone);
      } else if (submilestone.children && submilestone.children.length) {
        milestone.children.forEach(submil => {
          if (getMilSubMil) {
            tasks.push(submil.data);
          }
          tasks = this.getTasksSubTasks(tasks, includeSubTasks, submil);
        });
      }
    }
    // const milData = bOld ? originalData : updatedData;

    const clTask = milestone.data.type === 'milestone' || milestone.data.type === 'task' ? data.filter((obj) => {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.data.title.split(' (')[0];
    }) : milestone.parent ? data.filter((obj) => {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.parent.data.title.split(' (')[0];
    }) : [];

    if (clTask.length && !getMilSubMil) {
      tasks.push(clTask[0].data);
    }
    return this.commonService.removeEmptyItems(tasks);
  }

  getTasksSubTasks(tasks, includeSubTasks, milestone) {
    const milTasks = milestone.children.map(e => e.data);
    tasks = [...tasks, ...milTasks];
    if (includeSubTasks) {
      const subTask = milestone.children.map(e => (e.children ? e.children.map(c => c.data) : null));
      tasks = [...tasks, ...subTask];
    }
    return tasks;
  }
  setMinutesAfterDrag(date) {
    let time: any = this.getTimePart(date);
    time = time.split(':')
    let h = parseInt(time[0])
    let m = parseInt(time[1].split(' ')[0])
    let ampm = time[1].split(' ')[1]
    let minutes = (Math.round(m / 15) * 15) % 60;
    return h + ':' + minutes + ' ' + ampm;
  }

  setMaxBudgetHrs(task) {
    let time: any = this.commonService.getHrsAndMins(task.start_date, task.end_date);
    if(task.tat) {
      let businessDays = this.commonService.calcBusinessDays(task.start_date, task.end_date);
      return businessDays * 24;
    } else {
      return time.maxBudgetHrs;
    }
  }
}
