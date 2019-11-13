import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';

@Injectable({
  providedIn: 'root'
})
export class TaskAllocationCommonService {

  constructor(public sharedObject: GlobalService) { }
  getResourceByMatrix(task, allTasks) {
    const resources = this.sharedObject.oTaskAllocation.oResources;
    const prjDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const cmL1 = prjDetails.cmLevel1.results ? prjDetails.cmLevel1.results : [];
    const cmL2 = prjDetails.cmLevel2 ? prjDetails.cmLevel2 : [];
    const cm = [...cmL1, ...cmL2].filter(function(item, i, ar) { return ar.indexOf(item) === i; });
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
    similarTasksUsers = allTasks.filter(function (objt) {
      return objt.itemType === task.itemType;
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
          return objt.Title === task.itemType;
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

}
