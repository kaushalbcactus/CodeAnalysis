import { Injectable } from '@angular/core';
import { PmconstantService } from './pmconstant.service';
import { PMObjectService } from './pmobject.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { GlobalService } from 'src/app/Services/global.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';

declare var $;
@Injectable({
  providedIn: 'root'
})
export class PMCommonService {
  yearRange;
  constructor(
    private pmConstant: PmconstantService,
    private pmObject: PMObjectService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private commonService: CommonService,
    private globalObject: GlobalService,
    public messageService: MessageService,
    private router: Router,
    private dataService: DataService
  ) {
  }
  validateForm(index) {
    return false;
  }
  getResourceByMatrix(filterResource, deliverableType) {
    const clientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    const ta = this.pmObject.addProject.ProjectAttributes.TherapeuticArea;
    const deliverable = deliverableType;
    const resources = filterResource;
    const filteredResources = [];
    const checkSkillLevel = true;
    if (resources && resources.length) {
      resources.forEach(element => {
        const deliveryExcUsers = element.DeliverableExclusion.results.length > 0 ?
          // tslint:disable-next-line:only-arrow-functions
          element.DeliverableExclusion.results.filter(objt => objt.Title === deliverable) : ['IncludeAll'];
        // tslint:disable-next-line:only-arrow-functions
        const taExcUsers = element.TAExclusion.results.length > 0 ?
          element.TAExclusion.results.filter(objt => objt.Title === ta) : ['IncludeAll'];
        if (deliveryExcUsers.length > 0 && taExcUsers.length > 0) {
          if (checkSkillLevel) {
            const recomendedUserByDelv = element.Deliverables.results.length > 0 ?
              element.Deliverables.results.filter(objt => objt.Title === deliverable) : [];
            const recomendedUserByTa = element.TA.results.length > 0 ?
              element.TA.results.filter(objt => objt.Title === ta) : [];
            const recomendedUserByAccount = element.Account.results.length > 0 ?
              element.Account.results.filter(objt => objt.Title === clientLegalEntity) : [];
            if (recomendedUserByDelv.length > 0 || recomendedUserByTa.length > 0 || recomendedUserByAccount.length > 0) {
              element.userType = 'Recomended';
              filteredResources.push(element);
            } else {
              element.userType = 'Other';
              filteredResources.push(element);
            }
            element.Title = element.UserName.Title;
          }
        }
      });
      return filteredResources;
    }
  }
  calcBusinessDays(dDate1, dDate2) {         // input given as Date objects
    // tslint:disable-next-line:one-variable-per-declaration
    let iWeeks, iDateDiff, iAdjust = 0;
    // dDate1 = new Date(dDate1.format('MMM dd, yyyy'));
    // dDate2 = new Date(dDate2.format('MMM dd, yyyy'));
    dDate1 = new Date(dDate1);
    dDate2 = new Date(dDate2);
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
  addTime(date, h, m) {
    const checkDate = date.jsdate;
    if (checkDate) {
      date = new Date(date.jsdate);
    } else {
      date = new Date(date);
    }
    let tempM = m;
    if (!tempM) {
      tempM = '0';
    } else if (tempM && tempM === '25') {
      tempM = '15';
    } else if (tempM && tempM === '5') {
      tempM = '30';
    } else if (tempM && tempM === '75') {
      tempM = '45';
    }
    // tslint:disable-next-line:radix
    h = parseInt(h);
    // tslint:disable-next-line:radix
    m = parseInt(tempM);
    const totalHrs = date.getHours() + h;
    if (totalHrs > this.pmConstant.task.PER_DAY_MAX_HOURS) {
      // tslint:disable-next-line:max-line-length
      const excessHrs = date.getMinutes() > 0 ? totalHrs - this.pmConstant.task.PER_DAY_MAX_HOURS - 1 : totalHrs - this.pmConstant.task.PER_DAY_MAX_HOURS;
      const excessMins = date.getMinutes() > 0 ? 0 + m + date.getMinutes() : 0 + m;
      date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDate() + 1);
      date.setHours(9 + excessHrs);
      date.setMinutes(excessMins);
      date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDate() + 0);
    } else {
      date.setHours(date.getHours() + h);
      date.setMinutes(date.getMinutes() + m);
    }
    let newHours = 0;
    let newMin = 0;
    if (date.getHours() >= this.pmConstant.task.PER_DAY_MAX_END_HOURS && date.getMinutes() > 0) {
      newHours = date.getHours() - this.pmConstant.task.PER_DAY_MAX_END_HOURS;
      newMin = date.getMinutes();
      if (date.getDay() === 5) {
        date = new Date(date.setDate(date.getDate() + 3));
      } else if (date.getDay() === 6) {
        date = new Date(date.setDate(date.getDate() + 2));
      } else if (date.getDay() === 0) {
        date = new Date(date.setDate(date.getDate() + 1));
      } else {
        date = new Date(date.setDate(date.getDate() + 1));
      }
      date.setHours(9 + newHours);
      date.setMinutes(newMin);
    }
    return date;
  }
  calcTimeForDifferentTimeZone(date, prevOffset, currentOffset) {
    date = new Date(date);
    const prevTimezone = parseFloat(prevOffset) * 60 * -1;
    const utc = date.getTime() + (prevTimezone * 60000);
    // create new Date object for different city
    // using supplied offset
    const newDate = new Date(utc + (3600000 * currentOffset));
    // return time as a string newDate.toLocaleString()
    return newDate;
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
  bindGroupDropdown(dropArray) {
    const typeArray = [];
    const recomendedArray = [];
    const OtherArray = [];
    const finalArray = [];
    dropArray.forEach(element => {
      switch (element.userType) {
        case this.pmConstant.USERTYPE.TYPE: {
          typeArray.push({ label: element.Title, value: element });
          break;
        }
        case this.pmConstant.USERTYPE.RECOMENDED: {
          recomendedArray.push({ label: element.Title, value: element });
          break;
        }
        case this.pmConstant.USERTYPE.OTHER: {
          OtherArray.push({ label: element.Title, value: element });
          break;
        }
      }
    });
    if (typeArray && typeArray.length) {
      finalArray.push({ label: this.pmConstant.USERTYPE.TYPE, items: typeArray });
    }
    if (recomendedArray && recomendedArray.length) {
      finalArray.push({ label: this.pmConstant.USERTYPE.RECOMENDED, items: recomendedArray });
    }
    if (OtherArray && OtherArray.length) {
      finalArray.push({ label: this.pmConstant.USERTYPE.OTHER, items: OtherArray });
    }
    return finalArray;
  }
  toISODateString(dt) {
    try {
      const tzoffset = (new Date(dt)).getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(new Date(dt).getTime() - tzoffset)).toISOString().slice(0, -5) + 'Z';
      return localISOTime;
    } catch (err) {
      return '';
    }
  }

  async resolveMain(): Promise<any> {
    return '';
  }


  async getUserProperties(): Promise<any> {
    if (this.pmObject.projectContactsItems.length === 0) {
      this.commonService.SetNewrelic('Project-Management', 'pmcommon', 'getUserInfo');
      const userProp = await this.spServices.getUserInfo(this.globalObject.currentUser.userId);
      this.pmObject.currLoginInfo = userProp;
      if (userProp && userProp.Groups && userProp.Groups.results && userProp.Groups.results.length) {
        userProp.Groups.results.forEach(element => {
          switch (element.Title) {
            case this.constant.Groups.MANAGERS:
              this.pmObject.userRights.isMangers = true;
              this.pmObject.isUserAllowed = false;
              break;
            case this.constant.Groups.PROJECT_FULL_ACCESS:
              this.pmObject.userRights.isHaveProjectFullAccess = true;
              this.pmObject.isUserAllowed = false;
              break;
            case this.constant.Groups.INVOICE_TEAM:
              this.pmObject.userRights.isInvoiceTeam = true;
              this.pmObject.isUserAllowed = false;
              break;
            case this.constant.Groups.SOW_CREATION_MANAGERS:
              this.pmObject.userRights.isHaveSOWBudgetManager = true;
              this.pmObject.isUserAllowed = false;
              break;
            case this.constant.Groups.SOW_FULL_ACCESS:
              this.pmObject.userRights.isHaveSOWFullAccess = true;
              this.pmObject.isUserAllowed = false;
              break;
          }
        });
      }
      await this.checkUserRole();
    }
    return '';
  }
  /***
   * This method is used to get all the data based on user rights.
   */
  async checkUserRole() {
    const arrResults = await this.getItems();
    if (arrResults && arrResults.length) {
      this.pmObject.resourceCatItems = arrResults[0].retItems;
      if (this.pmObject.resourceCatItems.length) {
        if (this.pmObject.resourceCatItems[0].Role === this.pmConstant.resourCatConstant.CMLevel1 ||
          this.pmObject.resourceCatItems[0].Role === this.pmConstant.resourCatConstant.CMLevel2) {
          this.pmObject.isUserAllowed = false;
          // this.bindMenuItems();
        }
      }
      this.pmObject.oProjectCreation.oProjectInfo.billingEntity = arrResults[1].retItems;
      this.pmObject.oProjectCreation.oProjectInfo.practiceArea = [];
      arrResults[2].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.practiceArea.push({ label: element.Title, value: element.Title });
      });
      this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities = arrResults[3].retItems;

      this.pmObject.oProjectCreation.oProjectInfo.currency = [];
      arrResults[4].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.currency.push({ label: element.Title, value: element.Title });
      });
      this.pmObject.oProjectCreation.oProjectInfo.molecule = []; // getListItemsByColumn('Molecules', defaultQuery, "Title");
      arrResults[5].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.molecule.push({ label: element.Title, value: element.Title });
      });
      this.pmObject.oProjectCreation.oProjectInfo.projectType = []; // getListItemsByColumn('ProjectType', defaultQuery, "Title");
      arrResults[6].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.projectType.push({ label: element.Title, value: element.Title });
      });
      this.pmObject.oProjectCreation.oProjectInfo.subDeliverable = []; // getListItemsByColumn('SubDeliverables', defaultQuery, "Title");
      arrResults[7].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.subDeliverable.push({ label: element.Title, value: element.Title });
      });
      this.pmObject.oProjectCreation.oProjectInfo.ta = []; // getListItemsByColumn('TA', defaultQuery, "Title");
      arrResults[8].retItems.forEach(element => {
        this.pmObject.oProjectCreation.oProjectInfo.ta.push({ label: element.Title, value: element.Title });
      });
      if (arrResults[9].retItems && arrResults[9].retItems.length) {
        this.pmObject.oProjectManagement.oResourcesCat = arrResults[9].retItems;
      }
      this.setResources(arrResults[9].retItems);
      this.pmObject.projectContactsItems = arrResults[10].retItems;
    }
  }

  setResources(resourcesArray: any) {
    this.pmObject.oProjectCreation.Resources.cmLevel1 = [];
    this.pmObject.oProjectCreation.Resources.cmLevel2 = [];
    this.pmObject.oProjectCreation.Resources.deliveryLevel1 = [];
    this.pmObject.oProjectCreation.Resources.deliveryLevel2 = [];
    this.pmObject.oProjectCreation.Resources.businessDevelopment = [];
    this.pmObject.oProjectCreation.Resources.writers = [];
    this.pmObject.oProjectCreation.Resources.reviewers = [];
    this.pmObject.oProjectCreation.Resources.qc = [];
    this.pmObject.oProjectCreation.Resources.editors = [];
    this.pmObject.oProjectCreation.Resources.graphics = [];
    this.pmObject.oProjectCreation.Resources.pubSupport = [];
    this.pmObject.oProjectCreation.Resources.primaryRes = [];
    if (resourcesArray && resourcesArray.length) {
      resourcesArray.forEach(element => {
        const role = element.Role;
        switch (role) {
          case this.pmConstant.resourCatConstant.CMLevel1:
            this.pmObject.oProjectCreation.Resources.cmLevel1.push(element.UserName);
            break;
          case this.pmConstant.resourCatConstant.CMLevel2:
            this.pmObject.oProjectCreation.Resources.cmLevel2.push(element.UserName);
            this.pmObject.oProjectCreation.Resources.businessDevelopment.push(element.UserName);
            break;
          case this.pmConstant.resourCatConstant.DELIVERY_LEVEL_1:
            this.pmObject.oProjectCreation.Resources.deliveryLevel1.push(element.UserName);
            break;
          case this.pmConstant.resourCatConstant.DELIVERY_LEVEL_2:
            this.pmObject.oProjectCreation.Resources.deliveryLevel2.push(element.UserName);
            break;
          case this.pmConstant.resourCatConstant.BUSINESS_DEVELOPMENT:
            this.pmObject.oProjectCreation.Resources.businessDevelopment.push(element.UserName);
            break;
        }
        // if (element && element.Categories && element.Categories.results && element.Categories.results.length) {
        //   const category = element.Categories.results;
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.BUSINESS_DEVELOPMENT) > -1) {
        //     this.pmObject.oProjectCreation.Resources.businessDevelopment.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.WRITER) > -1) {
        //     this.pmObject.oProjectCreation.Resources.writers.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.REVIEWER) > -1) {
        //     this.pmObject.oProjectCreation.Resources.reviewers.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.QUALITY_CHECK) > -1) {
        //     this.pmObject.oProjectCreation.Resources.qc.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.EDITOR) > -1) {
        //     this.pmObject.oProjectCreation.Resources.editors.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.GRAPHICS) > -1) {
        //     this.pmObject.oProjectCreation.Resources.graphics.push(element.UserName);
        //   }
        //   if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.PUBLICATION_SUPPORT) > -1) {
        //     this.pmObject.oProjectCreation.Resources.pubSupport.push(element.UserName);
        //   }
        // }
      });
    }
  }

  /**
   * This method is used to get all the items for particular user.
   */
  async getItems() {
    const nextFiveDate = this.commonService.calcBusinessDate('Next', 5);
    const pastFiveFilterDate = this.commonService.calcBusinessDate('Past', 5);
    const startDate = new Date(pastFiveFilterDate.startDate.setHours(0, 0, 0, 0));
    const endDate = new Date(nextFiveDate.endDate.setHours(23, 59, 59, 0));
    const startDateString = new Date(this.commonService.formatDate(startDate) + ' 00:00:00').toISOString();
    const endDateString = new Date(this.commonService.formatDate(endDate) + ' 23:59:00').toISOString();
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get the all the Resources  ##0
    const resourceGet = Object.assign({}, options);
    const resourceEndPoint = this.spServices.getReadURL('' + this.constant.listNames.ResourceCategorization.name + '',
      this.pmConstant.resourceQueryOptions);
    resourceGet.url = resourceEndPoint.replace('{0}', '' + this.globalObject.currentUser.userId);
    resourceGet.type = 'GET';
    resourceGet.listName = this.constant.listNames.ResourceCategorization.name;
    batchURL.push(resourceGet);
    // Get Billing Entity  ##1
    const billingEndPoint = Object.assign({}, options);
    billingEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.BillingEntity.name + '',
      this.pmConstant.DROP_DOWN_QUERY.BILLING_ENTITY);
    billingEndPoint.type = 'GET';
    billingEndPoint.listName = this.constant.listNames.BillingEntity.name;
    batchURL.push(billingEndPoint);
    // Get Practice Area  ##2
    const practiceAreaEndPoint = Object.assign({}, options);
    practiceAreaEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.BusinessVerticals.name + '',
      this.pmConstant.DROP_DOWN_QUERY.PRACTICE_AREA);
    practiceAreaEndPoint.type = 'GET',
      practiceAreaEndPoint.listName = this.constant.listNames.BusinessVerticals.name;
    batchURL.push(practiceAreaEndPoint);
    // Get Client Legal Entity ##3
    const clientLegalEntityEndPoint = Object.assign({}, options);
    clientLegalEntityEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.ClientLegalEntity.name + '',
      this.pmConstant.DROP_DOWN_QUERY.CLIENT_LEGAL_ENTITY);
    clientLegalEntityEndPoint.type = 'GET',
      clientLegalEntityEndPoint.listName = this.constant.listNames.ClientLegalEntity.name;
    batchURL.push(clientLegalEntityEndPoint);
    // Get Budget Rate Master ## 4
    const budgetRateMasterEndPoint = Object.assign({}, options);
    budgetRateMasterEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.BudgetRateMaster.name + '',
      this.pmConstant.DROP_DOWN_QUERY.BUDGET_RATE_MASTER);
    budgetRateMasterEndPoint.type = 'GET',
      budgetRateMasterEndPoint.listName = this.constant.listNames.BudgetRateMaster.name;
    batchURL.push(budgetRateMasterEndPoint);
    // Get Molecules ## 5
    const moleculesEndPoint = Object.assign({}, options);
    moleculesEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.Molecules.name + '',
      this.pmConstant.DROP_DOWN_QUERY.MOLECULES);
    moleculesEndPoint.type = 'GET';
    moleculesEndPoint.listName = this.constant.listNames.Molecules.name;
    batchURL.push(moleculesEndPoint);
    // Get projectType ## 6
    const projectTypeEndPoint = Object.assign({}, options);
    projectTypeEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.ProjectType.name + '',
      this.pmConstant.DROP_DOWN_QUERY.PROJECT_TYPE);
    projectTypeEndPoint.type = 'GET';
    projectTypeEndPoint.listName = this.constant.listNames.ProjectType.name;
    batchURL.push(projectTypeEndPoint);
    // Get subdeliverables ## 7
    const subdeliverablesEndPoint = Object.assign({}, options);
    subdeliverablesEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.SubDeliverables.name + '',
      this.pmConstant.DROP_DOWN_QUERY.SUBDELIVERABLES);
    subdeliverablesEndPoint.type = 'GET';
    subdeliverablesEndPoint.listName = this.constant.listNames.SubDeliverables.name;
    batchURL.push(subdeliverablesEndPoint);
    // Get TA ## 8
    const taEndPoint = Object.assign({}, options);
    taEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.TA.name + '',
      this.pmConstant.DROP_DOWN_QUERY.TA);
    taEndPoint.type = 'GET';
    taEndPoint.listName = this.constant.listNames.TA.name;
    batchURL.push(taEndPoint);
    // Get Resources. ##9
    const resourCatEndPoint = Object.assign({}, options);
    resourCatEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.ResourceCategorization.name + '',
      this.pmConstant.TIMELINE_QUERY.STANDARD_RESOURCES_CATEGORIZATION);
    resourCatEndPoint.type = 'GET';
    resourCatEndPoint.listName = this.constant.listNames.ResourceCategorization.name;
    batchURL.push(resourCatEndPoint);
    // Get projectContancts ##10
    const projectContactsEndPoint = Object.assign({}, options);
    projectContactsEndPoint.url = this.spServices.getReadURL('' + this.constant.listNames.ProjectContacts.name + '',
      this.pmConstant.DROP_DOWN_QUERY.PROJECT_CONTANTCS);
    projectContactsEndPoint.type = 'GET';
    projectContactsEndPoint.listName = this.constant.listNames.ProjectContacts.name;
    batchURL.push(projectContactsEndPoint);
    this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'getTARCProConactsSubDeliverablesProjTypeMoleculeCLEBusinessVerticleBillingEntity');
    const arrResults = await this.spServices.executeBatch(batchURL);
    return arrResults;
  }
  /**
   * This function is used to extract the name from Id.
   * @param arrayOfIds array of Id's
   */
  extractNameFromId(arrayOfIds) {
    const tempArray = [];
    this.pmObject.oProjectManagement.oResourcesCat.forEach(element => {
      arrayOfIds.forEach(tempOjb => {
        if (element.UserName && tempOjb.hasOwnProperty('ID') && element.UserName.ID === tempOjb.ID) {
          tempArray.push(element.UserName.Title);
        } else if (element.UserName && element.UserName.ID === tempOjb) {
          tempArray.push(element.UserName.Title);
        }
      });
    });
    return tempArray;
  }
  /**
   * This function is used to extract the POC FUll name from Id.
   * @param arrayOfIds array of Id's
   */
  extractNamefromPOC(ids) {
    const tempArray = [];
    this.pmObject.projectContactsItems.forEach((element) => {
      ids.forEach(tempOjb => {
        if (element.ID === tempOjb) {
          tempArray.push(element.FullName);
        }
      });
    });
    return tempArray;
  }
  async getTemplate(templateName, objEmailBody, mailSubject, arrayTo, cc?) {
    const contentFilter = Object.assign({}, this.pmConstant.SOW_QUERY.CONTENT_QUERY);
    // tslint:disable-next-line:max-line-length
    contentFilter.filter = contentFilter.filter.replace(/{{templateName}}/gi, templateName);
    this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetMailContent');
    const body = await this.spServices.readItems(this.constant.listNames.MailContent.name, contentFilter);
    let mailBody = body[0].Content;
    objEmailBody.forEach(element => {
      mailBody = mailBody.replace(RegExp(element.key, 'gi'), element.value);
    });
    this.commonService.SetNewrelic('ProjectManagement', 'pmcommon', 'SendMail');
    this.spServices.sendMail(arrayTo.join(','), this.pmObject.currLoginInfo.Email, mailSubject, mailBody,
      cc.join(','));
  }
  getEmailId(tempArray) {
    const arrayTo = [];
    this.pmObject.oProjectManagement.oResourcesCat.forEach(element => {
      tempArray.forEach(tempOjb => {
        if (tempOjb && tempOjb.hasOwnProperty('ID') && element.UserName && element.UserName.ID === tempOjb.ID) {
          arrayTo.push(element.UserName.EMail);
        } else if (tempOjb && element.UserName.ID === tempOjb) {
          arrayTo.push(element.UserName.EMail);
        }
      });
    });
    return arrayTo;
  }
  /**
   * This function is used to get the project data object.
   */
  getProjectData(addObj, isCreate) {
    let objProjectFolder = '';
    let objProjectTask = '';
    const allOperationId = [];
    allOperationId.push(this.pmObject.currLoginInfo.Id);
    addObj.ProjectAttributes.ActiveCM1 = addObj.ProjectAttributes.ActiveCM1.filter((el) => {
      return el != null;
    });
    addObj.ProjectAttributes.ActiveCM1.forEach(element => {
      allOperationId.push(element);
    });
    if (addObj.ProjectAttributes.ActiveDelivery1 && addObj.ProjectAttributes.ActiveDelivery1.length) {
      addObj.ProjectAttributes.ActiveDelivery1 = addObj.ProjectAttributes.ActiveDelivery1.filter((el) => {
        return el != null;
      });
      addObj.ProjectAttributes.ActiveDelivery1.forEach(element => {
        allOperationId.push(element);
      });
    }
    allOperationId.push(addObj.ProjectAttributes.ActiveCM2);
    allOperationId.push(addObj.ProjectAttributes.ActiveDelivery2);
    const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
      x.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity);
    if (clientInfo && clientInfo.length) {
      const listName = clientInfo[0].ListName;
      objProjectFolder = this.globalObject.sharePointPageObject.serverRelativeUrl + '/' + listName + '/' +
        addObj.ProjectAttributes.ProjectCode;
      objProjectTask = this.globalObject.sharePointPageObject.serverRelativeUrl + '/' + this.constant.listNames.Schedules.name
        + '/' + addObj.ProjectAttributes.ProjectCode;
    }
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectInformation.type },
      AllOperationresourcesId: {
        results: allOperationId
      },
      Title: addObj.ProjectAttributes.ProjectTitle,
      TA: addObj.ProjectAttributes.TherapeuticArea,
      PrimaryPOC: addObj.ProjectAttributes.PointOfContact1,
      BillingEntity: addObj.ProjectAttributes.BillingEntity,
      BusinessVertical: addObj.ProjectAttributes.PracticeArea,
      WBJID: addObj.ProjectAttributes.AlternateShortTitle,
      SOWBoxLink: addObj.ProjectAttributes.SOWBoxLink,
      CMLevel1Id: {
        results: addObj.ProjectAttributes.ActiveCM1
      },
      CMLevel2Id: addObj.ProjectAttributes.ActiveCM2,
      DeliveryLevel1Id: {
        results: addObj.ProjectAttributes.ActiveDelivery1 && addObj.ProjectAttributes.ActiveDelivery1.length
          ? addObj.ProjectAttributes.ActiveDelivery1 : []
      },
      DeliveryLevel2Id: addObj.ProjectAttributes.ActiveDelivery2,
      SubDivision: addObj.ProjectAttributes.SubDivision ? addObj.ProjectAttributes.SubDivision : '',
      Priority: addObj.ProjectAttributes.Priority,
      Indication: addObj.ProjectAttributes.Indication,
      Molecule: addObj.ProjectAttributes.Molecule,
      IsPubSupport: addObj.ProjectAttributes.PUBSupportRequired ? 'Yes' : 'No',
      Description: addObj.ProjectAttributes.EndUseofDeliverable ? addObj.ProjectAttributes.EndUseofDeliverable : '',
      POC: addObj.ProjectAttributes.PointOfContact2 ? addObj.ProjectAttributes.PointOfContact2.join(';#') : '',
      Authors: addObj.ProjectAttributes.Authors ? addObj.ProjectAttributes.Authors : '',
      IsStandard: addObj.Timeline.Standard.IsStandard ? 'Yes' : 'No',
      ConferenceJournal: addObj.ProjectAttributes.ConferenceJournal ? addObj.ProjectAttributes.ConferenceJournal : '',
      Comments: addObj.ProjectAttributes.Comments ? addObj.ProjectAttributes.Comments : '',
      PubSupportStatus: addObj.ProjectAttributes.PUBSupportStatus ? addObj.ProjectAttributes.PUBSupportStatus : '',
      SOWLink: addObj.FinanceManagement.SOWFileURL ? addObj.FinanceManagement.SOWFileURL : '',
      SlideCount: addObj.ProjectAttributes.SlideCount,
      PageCount: addObj.ProjectAttributes.PageCount,
      ReferenceCount: addObj.ProjectAttributes.ReferenceCount,
      AnnotationBinder: addObj.ProjectAttributes.AnnotationBinder === true ? 'Yes' : 'No'
    };
    if (isCreate) {
      data.SOWCode = addObj.SOWSelect.SOWCode;
      // data.Milestones = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.Milestones : '';
      data.Milestones = '';
      if (addObj.Timeline.Standard.IsStandard) {
        data.Milestones = Array.from(new Set(addObj.Timeline.Standard.Milestones)).join(';#');
      }
      // changes for FTE Projects.
      if (addObj.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
        const monthNameArray = this.pmObject.addProject.Timeline.NonStandard.months.map(a => a.monthName);
        data.Milestones = monthNameArray.join(';#');
      }
      //data.Milestones = addObj.Timeline.Standard.IsStandard ? Array.from(new Set(addObj.Timeline.Standard.Milestones)).join(';#') : '';
      data.DeliverableType = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.DeliverableType :
        addObj.Timeline.NonStandard.DeliverableType;
      data.ProjectType = addObj.ProjectAttributes.BilledBy;
      data.ProjectCode = addObj.ProjectAttributes.ProjectCode;
      data.ClientLegalEntity = addObj.ProjectAttributes.ClientLegalEntity;
      data.Status = addObj.ProjectAttributes.ProjectStatus;
      data.SubDeliverable = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.SubDeliverable :
        addObj.Timeline.NonStandard.SubDeliverable;
      data.ProposedStartDate = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.ProposedStartDate :
        addObj.Timeline.NonStandard.ProposedStartDate,
        data.ProposedEndDate = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.ProposedEndDate :
          addObj.Timeline.NonStandard.ProposedEndDate;
      data.ProjectFolder = objProjectFolder;
      data.ProjectTask = objProjectTask;
      data.ServiceLevel = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.Service :
        addObj.Timeline.NonStandard.Service;
      data.OvernightRequest = addObj.FinanceManagement.OverNightRequest ? addObj.FinanceManagement.OverNightRequest : '';
      data.StandardService = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.Service : addObj.Timeline.NonStandard.Service;
      data.StandardBudgetHrs = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.StandardProjectBugetHours :
        addObj.Timeline.NonStandard.ProjectBudgetHours;
    }
    const arrId = [];
    const primaryResourceId = [];
    const resource: any = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.Resource :
      addObj.Timeline.NonStandard.ResourceName;
    if (resource && resource.hasOwnProperty('userType') && resource.userType !== 'Type') {
      primaryResourceId.push(resource.UserName.ID);
      const skillLevel = resource.SkillLevel.Title.replace(' Offsite', '').replace(' Onsite', '').replace('Jr ', '').replace('Sr ', '');
      switch (skillLevel) {
        case this.constant.SKILL_LEVEL.WRITER:
          data.WritersId = {
            results: [resource.UserName.ID]
          };
          break;
        case this.constant.SKILL_LEVEL.EDITOR:
          data.EditorsId = {
            results: [resource.UserName.ID]
          };
          break;
        case this.constant.SKILL_LEVEL.GRAPHICS:
          data.GraphicsMembersId = {
            results: [resource.UserName.ID]
          };
          break;
        case this.constant.SKILL_LEVEL.QC:
          data.QCId = {
            results: [resource.UserName.ID]
          };
          break;
      }
      arrId.push(resource.UserName.ID);
    }
    const reviewer: any = addObj.Timeline.Standard.Reviewer;
    if (addObj.Timeline.Standard.IsStandard &&
      reviewer && reviewer.hasOwnProperty('userType') && reviewer.userType !== 'Type') {
      data.ReviewersId = {
        results: [reviewer.UserName.ID]
      };
      arrId.push(reviewer.UserName.ID);
    }
    if (arrId && arrId.length) {
      data.AllDeliveryResourcesId = {
        results: arrId
      };
    }
    if (primaryResourceId && primaryResourceId.length) {
      data.PrimaryResMembersId = {
        results: primaryResourceId
      };
    }
    return data;
  }
  /***
   * this method is used to upload the file.
   */
  async submitFile(selectedFile, fileReader) {
    const docFolder = 'Finance/SOW';
    let libraryName = '';
    const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
      x.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity);
    if (clientInfo && clientInfo.length) {
      libraryName = clientInfo[0].ListName;
    }
    const folderPath: string = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + libraryName + '/' + docFolder;
    const filePathUrl = await this.spServices.getFileUploadUrl(folderPath, selectedFile.name, true);
    this.commonService.SetNewrelic('projectmanagement', 'pmcommon-submitFile', 'uploadFile');
    const res = await this.spServices.uploadFile(filePathUrl, fileReader.result);
    if (res.hasOwnProperty('ServerRelativeUrl') && res.hasOwnProperty('Name') && !res.hasOwnProperty('hasError')) {
      this.pmObject.addProject.FinanceManagement.SOWFileURL = res.ServerRelativeUrl;
      this.pmObject.addProject.FinanceManagement.SOWFileName = res.Name;
      this.pmObject.addProject.FinanceManagement.SOWFileProp = res;
    }
    return res;
  }
  setGlobalVariable(sowItem) {
    this.pmObject.addSOW.ID = sowItem.hasOwnProperty('ID') ? sowItem.ID : 0;
    this.pmObject.addSOW.ClientLegalEntity = sowItem.ClientLegalEntity;
    this.pmObject.addSOW.SOWCode = sowItem.SOWCode;
    this.pmObject.addSOW.BillingEntity = sowItem.BillingEntity;
    const PracticeArea = sowItem.BusinessVertical ? sowItem.BusinessVertical.split(';#') : [];
    this.pmObject.addSOW.PracticeArea = PracticeArea;
    this.pmObject.addSOW.Poc = sowItem.PrimaryPOC;
    this.pmObject.addSOW.PocText = this.extractNamefromPOC([sowItem.PrimaryPOC]).join(', ');
    const oldAdditonalPocArray = sowItem.AdditionalPOC ? sowItem.AdditionalPOC.split(';#') : null;
    const newAdditionalPocArray = [];
    if (oldAdditonalPocArray && oldAdditonalPocArray.length) {
      oldAdditonalPocArray.forEach(element => {
        newAdditionalPocArray.push(Number(element));
      });
    }
    this.pmObject.addSOW.PocOptional = newAdditionalPocArray;
    this.pmObject.addSOW.PocOptionalText = this.extractNamefromPOC(newAdditionalPocArray).join(', ');
    this.pmObject.addSOW.SOWTitle = sowItem.Title;
    this.pmObject.addSOW.SOWCreationDate = new Date(sowItem.CreatedDate);
    this.pmObject.addSOW.SOWExpiryDate = new Date(sowItem.ExpiryDate);
    this.pmObject.addSOW.Status = sowItem.Status;
    this.pmObject.addSOW.Comments = sowItem.Comments ? sowItem.Comments : '';
    this.pmObject.addSOW.Currency = sowItem.Currency;
    this.pmObject.addSOW.SOWDocument = sowItem.SOWLink ? sowItem.SOWLink : '';
    if (this.pmObject.addSOW.SOWDocument) {
      if (this.pmObject.addSOW.SOWDocument.indexOf(this.globalObject.sharePointPageObject.webRelativeUrl) === -1) {
        const client = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(e => e.Title === sowItem.ClientLegalEntity);
        this.pmObject.addSOW.SOWDocument = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + client.ListName + '/Finance/SOW/' +
          this.pmObject.addSOW.SOWDocument;
      }
    }


    this.pmObject.addSOW.Budget.Total = sowItem.TotalBudget ? sowItem.TotalBudget : 0;
    this.pmObject.addSOW.Budget.Net = sowItem.NetBudget ? sowItem.NetBudget : 0;
    this.pmObject.addSOW.Budget.OOP = sowItem.OOPBudget ? sowItem.OOPBudget : 0;
    this.pmObject.addSOW.Budget.Tax = sowItem.TaxBudget ? sowItem.TaxBudget : 0;
    this.pmObject.addSOW.Budget.TotalBalance = (sowItem.TotalBudget ? sowItem.TotalBudget : 0)
      - (sowItem.TotalLinked ? sowItem.TotalLinked : 0);
    this.pmObject.addSOW.Budget.TotalBalance = parseFloat(this.pmObject.addSOW.Budget.TotalBalance.toFixed(2));
    this.pmObject.addSOW.Budget.NetBalance = (sowItem.NetBudget ? sowItem.NetBudget : 0)
      - (sowItem.RevenueLinked ? sowItem.RevenueLinked : 0);
    this.pmObject.addSOW.Budget.NetBalance = parseFloat(this.pmObject.addSOW.Budget.NetBalance.toFixed(2));
    this.pmObject.addSOW.Budget.OOPBalance = (sowItem.OOPBudget ? sowItem.OOPBudget : 0) - (sowItem.OOPLinked ? sowItem.OOPLinked : 0);
    this.pmObject.addSOW.Budget.OOPBalance = parseFloat(this.pmObject.addSOW.Budget.OOPBalance.toFixed(2));
    this.pmObject.addSOW.Budget.TaxBalance = (sowItem.TaxBudget ? sowItem.TaxBudget : 0) - (sowItem.TaxLinked ? sowItem.TaxLinked : 0);
    this.pmObject.addSOW.Budget.TaxBalance = parseFloat(this.pmObject.addSOW.Budget.TaxBalance.toFixed(2));
    let cm1Array = [];
    let delivery1Array = [];
    if (sowItem.CMLevel1.results && sowItem.CMLevel1.results.length) {
      cm1Array = this.getIds(sowItem.CMLevel1.results);
    }
    if (sowItem.DeliveryLevel1.results && sowItem.DeliveryLevel1.results.length) {
      delivery1Array = this.getIds(sowItem.DeliveryLevel1.results);
    }
    this.pmObject.addSOW.CM1 = cm1Array;
    this.pmObject.addSOW.CM1Text = this.extractNameFromId(cm1Array).join(', ');
    this.pmObject.addSOW.CM2 = sowItem.CMLevel2.ID;
    this.pmObject.addSOW.CM2Text = this.extractNameFromId([sowItem.CMLevel2.ID]).join(', ');
    this.pmObject.addSOW.Delivery = delivery1Array;
    this.pmObject.addSOW.DeliveryText = this.extractNameFromId(delivery1Array).join(', ');
    this.pmObject.addSOW.DeliveryOptional = sowItem.DeliveryLevel2.ID;
    this.pmObject.addSOW.DeliveryOptionalText = this.extractNameFromId([sowItem.DeliveryLevel2.ID]).join(', ');
    this.pmObject.addSOW.SOWOwner = sowItem.BD.ID;
    this.pmObject.addSOW.SOWOwnerText = sowItem.BD ?
      sowItem.BD.hasOwnProperty('ID') ? this.extractNameFromId([sowItem.BD.ID]).join(', ') : '' : '';
  }
  convertToExcelFile(cnf1) {
    if (Array.isArray(cnf1._selection)) {
      if (cnf1._selection.length) {
        cnf1.exportCSV({ selectionOnly: true });
      } else {
        cnf1.exportCSV();
      }
    } else {
      cnf1.exportCSV();
    }
  }
  getIds(array) {
    const tempArray = [];
    array.forEach(element => {
      tempArray.push(element.ID);
    });
    return tempArray;
  }
  async getProjects(bPM) {

    let arrResults: any = [];

    const allProjects = localStorage.getItem('allProjects');
    if (allProjects) {
      arrResults = JSON.parse(allProjects);
      localStorage.removeItem('allProjects');
    } else {
      if (this.pmObject.userRights.isMangers || this.pmObject.userRights.isHaveProjectFullAccess || this.pmObject.userRights.isInvoiceTeam) {
        const projectManageFilter = Object.assign({}, this.pmConstant.PM_QUERY.ALL_PROJECT_INFORMATION);
        this.commonService.SetNewrelic('projectManagment', 'PmCommon-FullAccess', 'GetProjectInfo');
        arrResults = await this.spServices.readItems(this.constant.listNames.ProjectInformation.name, projectManageFilter);
      } else {
        let projectManageFilter: any;
        if (bPM) {
          projectManageFilter = Object.assign({}, this.pmConstant.PM_QUERY.USER_SPECIFIC_PROJECT_INFORMATION);
          projectManageFilter.filter = projectManageFilter.filter.replace('{{UserID}}', this.globalObject.currentUser.userId.toString());
        } else {
          projectManageFilter = Object.assign({}, this.pmConstant.PM_QUERY.USER_SPECIFIC_PROJECT_INFORMATION_MY);
          projectManageFilter.filter = projectManageFilter.filter.replace(/{{UserID}}/gi, this.globalObject.currentUser.userId.toString());
        }
        this.commonService.SetNewrelic('projectManagment', 'PmCommon-getProjects', 'readItems');
        arrResults = await this.spServices.readItems(this.constant.listNames.ProjectInformation.name, projectManageFilter);
      }
    }

    return arrResults;
  }
  /**
   * This method is used to reset all the global variable for project.
   */
  resetAddProject() {
    this.pmObject.activeIndex = 0;
    this.pmObject.addProject.SOWSelect.SOWCode = '';
    this.pmObject.addProject.SOWSelect.sowTotalBalance = 0;
    this.pmObject.addProject.SOWSelect.sowNetBalance = 0;
    this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = '';
    this.pmObject.addProject.ProjectAttributes.SubDivision = '';
    this.pmObject.addProject.ProjectAttributes.BillingEntity = '';
    this.pmObject.addProject.ProjectAttributes.BilledBy = '';
    this.pmObject.addProject.ProjectAttributes.PracticeArea = '';
    this.pmObject.addProject.ProjectAttributes.ProjectStatus = '';
    this.pmObject.addProject.ProjectAttributes.PointOfContact1 = '';
    this.pmObject.addProject.ProjectAttributes.PointOfContact2 = [];
    this.pmObject.addProject.ProjectAttributes.ProjectCode = '';
    this.pmObject.addProject.ProjectAttributes.Molecule = '';
    this.pmObject.addProject.ProjectAttributes.TherapeuticArea = '';
    this.pmObject.addProject.ProjectAttributes.Indication = '';
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = false;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = '';
    this.pmObject.addProject.ProjectAttributes.ProjectTitle = '';
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = '';
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = '';
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = '';
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = '';
    this.pmObject.addProject.ProjectAttributes.Authors = '';
    this.pmObject.addProject.ProjectAttributes.Comments = '';
    this.pmObject.addProject.ProjectAttributes.SlideCount = 0;
    this.pmObject.addProject.ProjectAttributes.ReferenceCount = 0;
    this.pmObject.addProject.ProjectAttributes.PageCount = 0;
    this.pmObject.addProject.ProjectAttributes.AnnotationBinder = false;
    this.pmObject.addProject.Timeline.Standard.IsStandard = false;
    this.pmObject.addProject.Timeline.Standard.Service = {};
    this.pmObject.addProject.Timeline.Standard.Resource = {};
    this.pmObject.addProject.Timeline.Standard.Reviewer = {};
    this.pmObject.addProject.Timeline.Standard.ProposedStartDate = null;
    this.pmObject.addProject.Timeline.Standard.ProposedEndDate = null;
    this.pmObject.addProject.Timeline.Standard.StandardBudgetHrs = 0;
    this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours = 0;
    this.pmObject.addProject.Timeline.Standard.OverallTat = 0;
    this.pmObject.addProject.Timeline.Standard.IsRegisterButtonClicked = false;
    this.pmObject.addProject.Timeline.Standard.standardArray = [];
    this.pmObject.addProject.Timeline.NonStandard.IsStandard = false;
    this.pmObject.addProject.Timeline.NonStandard.DeliverableType = '';
    this.pmObject.addProject.Timeline.NonStandard.SubDeliverable = '';
    this.pmObject.addProject.Timeline.NonStandard.Service = '';
    this.pmObject.addProject.Timeline.NonStandard.ResourceName = {};
    this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate = null;
    this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate = null;
    this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked = false;
    this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours = 0;
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = [];
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = [];
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = '';
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = '';
    this.pmObject.addProject.FinanceManagement.BilledBy = '';
    this.pmObject.addProject.FinanceManagement.ClientLegalEntity = '';
    this.pmObject.addProject.FinanceManagement.selectedFile = '';
    this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = false;
    this.pmObject.addProject.FinanceManagement.POArray = [];
    this.pmObject.addProject.SOWSelect.GlobalFilterValue = '';

  }
  async setBilledBy() {
    // this.pmObject.billedBy = [
    //   { label: this.pmConstant.PROJECT_TYPE.DELIVERABLE.display, value: this.pmConstant.PROJECT_TYPE.DELIVERABLE.value },
    //   { label: this.pmConstant.PROJECT_TYPE.HOURLY.display, value: this.pmConstant.PROJECT_TYPE.HOURLY.value }
    // ];
    this.pmObject.billedBy = [];
    // get items from project contacts type.
    const contentFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_PROJECT_TYPE);
    // tslint:disable-next-line:max-line-length
    contentFilter.filter = contentFilter.filter.replace(/{{isActive}}/gi, 'Yes');
    this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjType');
    const sResults = await this.spServices.readItems(this.constant.listNames.ProjectType.name, contentFilter);
    if (sResults && sResults.length) {
      const tempResult = [];
      sResults.forEach(element => {
        tempResult.push({ label: element.Title.split('-')[0], value: element.Title });
      });
      this.pmObject.billedBy = tempResult;
    }
  }
  async validateAndSave() {
    this.pmObject.isMainLoaderHidden = false;
    const newProjectCode = await this.verifyAndUpdateProjectCode();
    this.pmObject.addProject.ProjectAttributes.ProjectCode = newProjectCode;
    if (newProjectCode) {
      if (this.pmObject.addProject.FinanceManagement.selectedFile) {
        const fileUploadResult = await this.submitFile(this.pmObject.addProject.FinanceManagement.selectedFile, this.pmObject.fileReader);
        if (fileUploadResult.hasOwnProperty('ServerRelativeUrl')) {
          this.pmObject.addSOW.isSOWCodeDisabled = false;
          this.pmObject.addSOW.isStatusDisabled = true;
        }
      }
      await this.addUpdateProject();
    }
  }
  /**
   * This method is used to verify the project code.
   */
  async verifyAndUpdateProjectCode() {
    let projectCode = this.pmObject.addProject.ProjectAttributes.ProjectCode;
    let currenValue = 0;
    let Id = -1;
    const codeSplit = projectCode.split('-');
    const codeValue = codeSplit[2];
    const year = codeValue.substring(0, 2);
    const oCurrentDate = new Date();
    let sYear = oCurrentDate.getFullYear();
    sYear = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    const contentFilter = Object.assign({}, this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    // tslint:disable-next-line:max-line-length
    contentFilter.filter = contentFilter.filter.replace(/{{Id}}/gi, sYear.toString());
    this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectPerYear');
    const sResults = await this.spServices.readItems(this.constant.listNames.ProjectPerYear.name, contentFilter);
    if (sResults && sResults.length) {
      currenValue = parseInt(sResults[0].Count, 10);
      Id = sResults[0].ID;
      currenValue += 1;
      let currentCount = '000' + currenValue;
      currentCount = currentCount.substring(currentCount.length - 4);
      codeSplit[2] = year + currentCount;
      projectCode = codeSplit.join('-');
      const projectYearOptions = {
        Count: currenValue
      };
      await this.spServices.updateItem(this.constant.listNames.ProjectPerYear.name, Id, projectYearOptions,
        this.constant.listNames.ProjectPerYear.type);
      return projectCode;
    }
  }
  /**
   * This function is used to add and Update the project.
   */
  async addUpdateProject() {
    this.pmObject.updateInvoices = [];
    const batchURL = [];
    let counter = 0;
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Create Main Summary Call ## 15
    const summaryObj = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Title: this.pmObject.addProject.ProjectAttributes.ProjectCode,
      FileSystemObjectType: 1,
      ContentTypeId: '0x0120'
    };
    const createSummaryObj = Object.assign({}, options);
    createSummaryObj.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
    createSummaryObj.data = summaryObj;
    createSummaryObj.type = 'POST';
    createSummaryObj.listName = this.constant.listNames.Schedules.name;
    batchURL.push(createSummaryObj);
    counter += 1;
    // Create Folder Call ## 1 - 14
    const folderArray = this.createFolderArray(this.pmObject.addProject.ProjectAttributes.ClientLegalEntity,
      this.pmObject.addProject.ProjectAttributes.ProjectCode);
    folderArray.forEach(element => {
      const data = {
        __metadata: { type: 'SP.Folder' },
        ServerRelativeUrl: element
      };
      const createForderObj = Object.assign({}, options);
      createForderObj.data = data;
      createForderObj.listName = element;
      createForderObj.type = 'POST';
      createForderObj.url = this.spServices.getFolderCreationURL();
      counter += 1;
      batchURL.push(createForderObj);
    });
    // Add data to ProjectInformation call ##16
    const projectInformationData = this.getProjectData(this.pmObject.addProject, true);
    const projectCreate = Object.assign({}, options);
    projectCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectInformation.name, null);
    projectCreate.data = projectInformationData;
    projectCreate.type = 'POST';
    projectCreate.listName = this.constant.listNames.ProjectInformation.name;
    batchURL.push(projectCreate);
    counter += 1;
    // Add data to ProjectFinances call ##17
    const projectFinanceData = this.getProjectFinancesData();
    const projectFinanceCreate = Object.assign({}, options);
    projectFinanceCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinances.name, null);
    projectFinanceCreate.data = projectFinanceData;
    projectFinanceCreate.type = 'POST';
    projectFinanceCreate.listName = this.constant.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceCreate);
    counter += 1;
    // Add data to projectFinanceBreakup call ##18
    const projectFinanceBreakArray = this.getProjectFinanceBreakupData();
    projectFinanceBreakArray.forEach(element => {
      const projectFinanceBreakupCreate = Object.assign({}, options);
      projectFinanceBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinanceBreakup.name, null);
      projectFinanceBreakupCreate.data = element;
      projectFinanceBreakupCreate.type = 'POST';
      projectFinanceBreakupCreate.listName = this.constant.listNames.ProjectFinanceBreakup.name;
      batchURL.push(projectFinanceBreakupCreate);
      counter += 1;
    });
    if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.DELIVERABLE.value ||
      this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
      //  Add data to  InvoiceLineItem call ## 19
      const invoiceLineItemArray = this.getInvoiceLineItemData();
      invoiceLineItemArray.forEach(element => {
        const createForderObj: any = Object.assign({}, options);
        createForderObj.url = this.spServices.getReadURL(this.constant.listNames.InvoiceLineItems.name, null);
        createForderObj.data = element;
        createForderObj.listName = this.constant.listNames.InvoiceLineItems.name;
        createForderObj.type = 'POST';
        batchURL.push(createForderObj);
        counter += 1;
      });
      // Add data to  SOWItem call ## 20
      const sowItemData = this.getSowItemData(projectFinanceData);
      const selectSOWItem: any = this.pmObject.addProject.SOWSelect.SOWSelectedItem;
      const sowItemCreate = Object.assign({}, options);
      sowItemCreate.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, selectSOWItem.ID);
      sowItemCreate.data = sowItemData;
      sowItemCreate.type = 'PATCH';
      sowItemCreate.listName = this.constant.listNames.SOW.name;
      batchURL.push(sowItemCreate);
      counter += 1;
      // Add data to POItem call ## 21
      const poItemArray = this.getPoItemData(projectFinanceBreakArray);
      poItemArray.forEach(element => {
        const poItemCreate = Object.assign({}, options);
        poItemCreate.url = this.spServices.getItemURL(this.constant.listNames.PO.name, element.ID);
        poItemCreate.data = element;
        poItemCreate.type = 'PATCH';
        poItemCreate.listName = this.constant.listNames.PO.name;
        batchURL.push(poItemCreate);
      });
      if (this.pmObject.updateInvoices && this.pmObject.updateInvoices.length) {
        this.pmObject.updateInvoices.forEach(element => {
          const invoicecreate = Object.assign({}, options);
          invoicecreate.url = this.spServices.getItemURL(this.constant.listNames.Invoices.name, element.ID);
          invoicecreate.data = element;
          invoicecreate.type = 'PATCH';
          invoicecreate.listName = this.constant.listNames.Invoices.name;
          batchURL.push(invoicecreate);
        });
      }
    }
    this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetSchedulesProjInfoPoInvoicesProFinanceBreakupInvoiceLineItem');
    const res = await this.spServices.executeBatch(batchURL);
    console.log(res);
    if (res && res.length) {
      await this.addItemToScheduleList(res);
    }
  }
  /**
   * This method is used to create the folder url based on clientlegal entity and projectcode.
   * @param ClientLegalEnity pass the clientlegalentity.
   * @param projectCode pass the project code.
   */
  createFolderArray(ClientLegalEnity, projectCode) {
    const legalEntity = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(e => e.Title === ClientLegalEnity);
    const listName = legalEntity.ListName;
    const arrFolders = [
      listName + '/' + projectCode,
      listName + '/' + projectCode + '/Communications',
      listName + '/' + projectCode + '/Drafts',
      listName + '/' + projectCode + '/Emails',
  //    listName + '/' + projectCode + '/Graphics',
      listName + '/' + projectCode + '/Miscellaneous',
      listName + '/' + projectCode + '/Publication Support',
      listName + '/' + projectCode + '/References',
      listName + '/' + projectCode + '/Source Documents',
      listName + '/' + projectCode + '/Drafts/Client',
      listName + '/' + projectCode + '/Drafts/Internal',
      listName + '/' + projectCode + '/Publication Support/Author List Emails',
      listName + '/' + projectCode + '/Publication Support/Forms',
      listName + '/' + projectCode + '/Publication Support/Published Papers'
    ];
    return arrFolders;
  }
  /**
   * This function is used to set the projectfinanaces object
   */
  getProjectFinancesData() {
    const addObj = this.pmObject.addProject;
    const billingEntitys = this.pmObject.oProjectCreation.oProjectInfo.billingEntity;
    const billingEntity = billingEntitys.filter(x => x.Title === this.pmObject.addProject.ProjectAttributes.BillingEntity);
    const budgetArray = this.pmObject.addProject.FinanceManagement.BudgetArray;
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    let invoiceSc = 0;
    let scRevenue = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_SAVED) {
          invoiceSc = invoiceSc + element.amount;
          scRevenue = scRevenue + element.amount;
        }
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice = invoice + element.amount;
          invoiceRevenue = invoiceRevenue + element.amount;
        }
      });
    });
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinances.type },
      Title: addObj.ProjectAttributes.ProjectCode,
      Realization: '50',
      Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
      Currency: addObj.FinanceManagement.Currency,
      BudgetHrs: addObj.FinanceManagement.BudgetHours
    };
    if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      data.Budget = addObj.FinanceManagement.Rate;
      data.OOPBudget = 0;
      data.RevenueBudget = 0;
      data.TaxBudget = 0;
      data.InvoicesScheduled = 0;
      data.ScheduledRevenue = 0;
      data.Invoiced = 0;
      data.InvoicedRevenue = 0;
    } else {
      data.Budget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.RevenueBudget = budgetArray[0].revenue;
      data.TaxBudget = budgetArray[0].tax;
      data.InvoicesScheduled = invoiceSc;
      data.ScheduledRevenue = scRevenue;
      data.Invoiced = invoice;
      data.InvoicedRevenue = invoiceRevenue;
    }
    return data;
  }
  /**
   * This function is used to set the projectFinanceBreakup object
   */
  getProjectFinanceBreakupData() {
    const addObj = this.pmObject.addProject;
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    const pfbArray = [];
    poArray.forEach((poInfoObj) => {
      let totalScheduled = 0;
      let scRevenue = 0;
      let invoice = 0;
      let invoiceRevenue = 0;
      const po = poInfoObj.poInfo[0];
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_SAVED) {
          totalScheduled += element.amount;
          scRevenue += element.amount;
        }
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice += element.amount;
          invoiceRevenue += element.amount;
        }
      });
      const data: any = {
        __metadata: { type: this.constant.listNames.ProjectFinanceBreakup.type },
        ProjectNumber: addObj.ProjectAttributes.ProjectCode,
        POLookup: po.poId
      };
      if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = 0;
        data.ScheduledRevenue = 0;
        data.TotalInvoiced = 0;
        data.InvoicedRevenue = 0;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
      }
      pfbArray.push(data);
    });
    return pfbArray;
  }
  /**
   * This method is used to get the Invoice line item object.
   */
  getInvoiceLineItemData() {
    const addObj = this.pmObject.addProject;
    const invoiceArray = [];
    const CSIdArray = [];
    addObj.ProjectAttributes.ActiveCM1.forEach(cm => {
      CSIdArray.push(cm);
    });
    CSIdArray.push(addObj.ProjectAttributes.ActiveCM2);
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    const billingEntitys = this.pmObject.oProjectCreation.oProjectInfo.billingEntity;
    const billingEntity = billingEntitys.filter(x => x.Title === this.pmObject.addProject.ProjectAttributes.BillingEntity);
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          Title: addObj.ProjectAttributes.ProjectCode,
          ScheduledDate: element.date,
          Amount: element.amount,
          Currency: addObj.FinanceManagement.Currency,
          PO: element.poId,
          Status: element.status === 'Not Saved' ? 'Scheduled' : element.status,
          ScheduleType: element.type,
          MainPOC: element.poc,
          AddressType: element.address,
          Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
          SOWCode: addObj.SOWSelect.SOWCode,
          CSId: {
            results: CSIdArray
          },
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
          const invoice = this.pmObject.arrAdvanceInvoices.find(e => e.ID === element.invoiceLookup);
          const tagAmount = invoice.TaggedAmount ? invoice.TaggedAmount + element.amount : element.amount;
          const dataInv: any = {
            __metadata: { type: this.constant.listNames.Invoices.type },
            ID: invoice.ID,
            TaggedAmount: tagAmount,
            IsTaggedFully: invoice.Amount === tagAmount ? 'Yes' : 'No'
          };
          this.pmObject.updateInvoices.push(dataInv);
        }
        invoiceArray.push(data);
      });
    });
    return invoiceArray;
  }
  getSowItemData(projectfinaceObj) {
    const sowObj: any = this.pmObject.addProject.SOWSelect.SOWSelectedItem;
    const data = {
      __metadata: { type: this.constant.listNames.SOW.type },
      TotalLinked: sowObj.TotalLinked + projectfinaceObj.Budget,
      RevenueLinked: sowObj.RevenueLinked + projectfinaceObj.RevenueBudget,
      OOPLinked: sowObj.OOPLinked + projectfinaceObj.OOPBudget,
      TaxLinked: sowObj.TaxLinked + projectfinaceObj.TaxBudget,
      TotalScheduled: sowObj.TotalScheduled + projectfinaceObj.InvoicesScheduled,
      ScheduledRevenue: sowObj.ScheduledRevenue + projectfinaceObj.ScheduledRevenue,
      TotalInvoiced: sowObj.TotalInvoiced + projectfinaceObj.Invoiced,
      InvoicedRevenue: sowObj.InvoicedRevenue + projectfinaceObj.InvoicedRevenue,
    };
    return data;
  }
  getPoItemData(financeBreakupArray) {
    const porray = [];
    const poArray = this.pmObject.addProject.FinanceManagement.POListArray;
    financeBreakupArray.forEach(element => {
      const poItem = poArray.filter(poObj => poObj.ID === element.POLookup);
      if (poItem && poItem.length) {
        const data = {
          __metadata: { type: this.constant.listNames.PO.type },
          TotalLinked: poItem[0].TotalLinked + element.Amount,
          RevenueLinked: poItem[0].RevenueLinked + element.AmountRevenue,
          OOPLinked: poItem[0].OOPLinked + element.AmountOOP,
          TaxLinked: poItem[0].TaxLinked + element.AmountTax,
          TotalScheduled: poItem[0].TotalScheduled + element.TotalScheduled,
          ScheduledRevenue: poItem[0].ScheduledRevenue + element.ScheduledRevenue,
          ID: element.POLookup
        };
        porray.push(data);
      }
    });
    return porray;
  }
  async addItemToScheduleList(response) {
    let batchResults = [];
    this.pmObject.milestoneArray = [];
    this.pmObject.taskArray = [];
    let batchURL = [];
    let finalArray = [];
    let counter = 0;
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // create the projectBugetBreakup after project informations items created.
    const projectBudgetBreakupData = this.getProjectBudgetBreakupData(response);
    const projectBudgetBreakupCreate = Object.assign({}, options);
    projectBudgetBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectBudgetBreakup.name, null);
    projectBudgetBreakupCreate.data = projectBudgetBreakupData;
    projectBudgetBreakupCreate.type = 'POST';
    projectBudgetBreakupCreate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
    batchURL.push(projectBudgetBreakupCreate);
    // This call is used to rename the ProjectCode.
    const projectCodeMoveUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/_api/Web/Lists/getByTitle(\'' + this.constant.listNames.Schedules.name + '\')/Items' +
      '(' + response[0].retItems.ID + ')';
    const projectCodeMoveData = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      FileLeafRef: response[0].retItems.Title
    };
    const moveMilewithDataObj = Object.assign({}, options);
    moveMilewithDataObj.url = projectCodeMoveUrl;
    moveMilewithDataObj.data = projectCodeMoveData;
    moveMilewithDataObj.type = 'PATCH';
    moveMilewithDataObj.listName = this.constant.listNames.Schedules.name;
    batchURL.push(moveMilewithDataObj);
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      const milestones = this.pmObject.addProject.Timeline.Standard.standardArray;
      const projectCode = this.pmObject.addProject.ProjectAttributes.ProjectCode;
      for (let milestoneIndex = 0; milestoneIndex < milestones.length; milestoneIndex = milestoneIndex + 2) {
        if (batchURL.length < 100) {
          const milestoneObj = milestones[milestoneIndex];
          this.pmObject.milestoneArray.push(milestoneObj.data);
          const milestonedata = this.getMilestoneData(milestoneObj, projectCode);
          const milestoneCreate = Object.assign({}, options);
          milestoneCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
          milestoneCreate.data = milestonedata;
          milestoneCreate.type = 'POST';
          milestoneCreate.listName = this.constant.listNames.Schedules.name;
          counter += 1;
          batchURL.push(milestoneCreate);
          // create the milestone folder.
          const milestoneFolderBody = {
            __metadata: { type: 'SP.Folder' },
            ServerRelativeUrl: response[11].listName + '/' + milestoneObj.data.Name
          };
          const createForderObj = Object.assign({}, options);
          createForderObj.data = milestoneFolderBody;
          // createForderObj.listName = element;
          createForderObj.type = 'POST';
          createForderObj.url = this.spServices.getFolderCreationURL();
          counter += 1;
          batchURL.push(createForderObj);

          if (milestoneObj.SubMilestones) {
            // tslint:disable-next-line:prefer-for-of
            for (let subMilestoneIndex = 0; subMilestoneIndex < milestoneObj.children.length; subMilestoneIndex++) {
              const submilestone = milestoneObj.children[subMilestoneIndex];
              // tslint:disable-next-line:forin
              for (const taskIndex in submilestone.children) {
                const task = submilestone.children[taskIndex];
                this.pmObject.taskArray.push(task.data);
                const taskdata = this.getTaskData(task, projectCode, milestoneObj, submilestone);
                const taskCreate = Object.assign({}, options);
                taskCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
                taskCreate.data = taskdata;
                taskCreate.type = 'POST';
                taskCreate.listName = this.constant.listNames.Schedules.name;
                counter += 1;
                batchURL.push(taskCreate);
              }
            }
          } else {
            // tslint:disable-next-line:forin
            for (const taskIndex in milestoneObj.children) {
              const task = milestoneObj.children[taskIndex];
              this.pmObject.taskArray.push(task.data);
              const taskdata = this.getTaskData(task, projectCode, milestoneObj, null);
              const taskCreate = Object.assign({}, options);
              taskCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
              taskCreate.data = taskdata;
              taskCreate.type = 'POST';
              taskCreate.listName = this.constant.listNames.Schedules.name;
              counter += 1;
              batchURL.push(taskCreate);
            }
          }
          const taskObj = milestones[milestoneIndex + 1];
          taskObj.data.Hours = 0;
          taskObj.data.UseTaskDays = 'Yes';
          taskObj.data.TaskDays = taskObj.data.Days;
          taskObj.data.TaskName = taskObj.data.Name;
          taskObj.data.Task = taskObj.data.Name;
          taskObj.data.NextTasks = '';
          taskObj.data.PrevTasks = projectCode + ' ' + milestoneObj.MilestoneName + ' SC';
          taskObj.data.Skill = 'CS';
          taskObj.data.assignedUserTimeZone = (new Date()).getTimezoneOffset() / 60 * -1;
          taskObj.data.userId = this.globalObject.currentUser.userId;
          const crData = this.getTaskData(taskObj, projectCode, milestoneObj, null);
          const crCreate = Object.assign({}, options);
          crCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
          crCreate.data = crData;
          crCreate.type = 'POST';
          crCreate.listName = this.constant.listNames.Schedules.name;
          counter += 1;
          batchURL.push(crCreate);
          if (batchURL.length === 99) {
            this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectBudgetBreakupSchedules');
            batchResults = await this.spServices.executeBatch(batchURL);
            console.log(batchResults);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
      if (batchURL.length) {
        this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectBudgetBreakupSchedules');
        batchResults = await this.spServices.executeBatch(batchURL);
        finalArray = [...finalArray, ...batchResults];
      }
    } else {
      this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectBudgetBreakupSchedules');
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }
    // Logic for creating Milestone and Task for FTE-Writing.
    if (this.pmObject.addProject.FinanceManagement.BilledBy ===
      this.pmConstant.PROJECT_TYPE.FTE.value) {
      batchResults = await this.createFTEMilestones(response);
      finalArray = [...finalArray, ...batchResults];
    }
    await this.moveMilestoneAndTask(finalArray);
  }
  async moveMilestoneAndTask(results) {
    if (results && results.length && (this.pmObject.addProject.Timeline.Standard.IsStandard ||
      this.pmObject.addProject.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value)) {
      let batchURL = [];
      let batchResults = [];
      let finalArray = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      for (const response of results) {
        if (batchURL.length < 100) {
          const fileUrl = this.globalObject.sharePointPageObject.serverRelativeUrl +
            '/Lists/' + this.constant.listNames.Schedules.name + '/' + response.retItems.ID + '_.000';
          let moveFileUrl = this.globalObject.sharePointPageObject.serverRelativeUrl +
            '/Lists/' + this.constant.listNames.Schedules.name + '/' +
            this.pmObject.addProject.ProjectAttributes.ProjectCode;
          if (response.retItems.Milestone === 'Select one') {
            moveFileUrl = moveFileUrl + '/' + response.retItems.ID + '_.000';
            const milestoneURL = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/Web/Lists/getByTitle(\'' + this.constant.listNames.Schedules.name + '\')/Items' +
              '(' + response.retItems.ID + ')';
            const moveData = {
              __metadata: { type: this.constant.listNames.Schedules.type },
              FileLeafRef: response.retItems.Title
            };
            const url = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/web/getfolderbyserverrelativeurl(\'' + fileUrl + '\')/moveto(newurl=\'' + moveFileUrl + '\')';
            const moveMileObj = Object.assign({}, options);
            moveMileObj.url = url;
            moveMileObj.type = 'POST';
            moveMileObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveMileObj);
            const moveMilewithDataObj = Object.assign({}, options);
            moveMilewithDataObj.url = milestoneURL;
            moveMilewithDataObj.data = moveData;
            moveMilewithDataObj.type = 'PATCH';
            moveMilewithDataObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveMilewithDataObj);
          } else {
            moveFileUrl = moveFileUrl + '/' + response.retItems.Milestone + '/' + response.retItems.ID + '_.000';
            const url = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/web/getfilebyserverrelativeurl(\'' + fileUrl + '\')/moveto(newurl=\'' + moveFileUrl + '\',flags=1)';
            const moveTaskObj = Object.assign({}, options);
            moveTaskObj.url = url;
            moveTaskObj.type = 'POST';
            moveTaskObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveTaskObj);
          }
          if (batchURL.length === 99) {
            this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetSchedules');
            batchResults = await this.spServices.executeBatch(batchURL);
            console.log(batchResults);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
      if (batchURL.length) {
        this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetSchedules');
        batchResults = await this.spServices.executeBatch(batchURL);
        console.log(batchResults);
        finalArray = [...finalArray, ...batchResults];
      }
    }
    this.pmObject.isMainLoaderHidden = true;
    // this.messageService.add({
    //   key: 'custom', severity: 'success', summary: 'Success Message', sticky: true,
    //   detail: 'Project Created Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode
    // });
    // setTimeout(() => {
    //   this.pmObject.isAddProjectVisible = false;
    //   if (this.router.url === '/projectMgmt/allProjects') {
    //     this.dataService.publish('reload-project');
    //   } else {
    //     this.pmObject.allProjectItems = [];
    //     this.router.navigate(['/projectMgmt/allProjects']);
    //   }
    // }, this.pmConstant.TIME_OUT);
  }
  async createFTEMilestones(response) {
    const monthObjArray = this.pmObject.addProject.Timeline.NonStandard.months;
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const batchURL = [];
    const projectCode = this.pmObject.addProject.ProjectAttributes.ProjectCode;
    monthObjArray.forEach(element => {
      const milestonedata = this.getFTEMilestoneData(element, projectCode);
      const milestoneCreate = Object.assign({}, options);
      milestoneCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
      milestoneCreate.data = milestonedata;
      milestoneCreate.type = 'POST';
      milestoneCreate.listName = this.constant.listNames.Schedules.name;
      batchURL.push(milestoneCreate);
      // create the milestone folder.
      const milestoneFolderBody = {
        __metadata: { type: 'SP.Folder' },
        ServerRelativeUrl: response[11].listName + '/' + element.monthName
      };
      const createForderObj = Object.assign({}, options);
      createForderObj.data = milestoneFolderBody;
      // createForderObj.listName = element;
      createForderObj.type = 'POST';
      createForderObj.url = this.spServices.getFolderCreationURL();
      batchURL.push(createForderObj);
      // create FTE Task.
      const taskBlockingdata = this.getFTETask(element, projectCode, this.pmConstant.task.BLOCKING);
      const taskBlockingCreate = Object.assign({}, options);
      taskBlockingCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
      taskBlockingCreate.data = taskBlockingdata;
      taskBlockingCreate.type = 'POST';
      taskBlockingCreate.listName = this.constant.listNames.Schedules.name;
      batchURL.push(taskBlockingCreate);

      // create Meeting Task
      const taskMeetingdata = this.getFTETask(element, projectCode, this.pmConstant.task.MEETING);
      const taskMeetingCreate = Object.assign({}, options);
      taskMeetingCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
      taskMeetingCreate.data = taskMeetingdata;
      taskMeetingCreate.type = 'POST';
      taskMeetingCreate.listName = this.constant.listNames.Schedules.name;
      batchURL.push(taskMeetingCreate);
      // Create Training Task
      const taskTrainingdata = this.getFTETask(element, projectCode, this.pmConstant.task.TRAINING);
      const taskTrainingCreate = Object.assign({}, options);
      taskTrainingCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
      taskTrainingCreate.data = taskTrainingdata;
      taskTrainingCreate.type = 'POST';
      taskTrainingCreate.listName = this.constant.listNames.Schedules.name;
      batchURL.push(taskTrainingCreate);
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetSchedules');
      const results = await this.spServices.executeBatch(batchURL);
      return results;
    }
  }
  getFTEMilestoneData(fteObj, projectCode) {
    const data = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: fteObj.monthStartDay,
      Actual_x0020_End_x0020_Date: fteObj.monthEndDay,
      StartDate: fteObj.monthStartDay,
      DueDate: fteObj.monthEndDay,
      Status: this.constant.STATUS.NOT_CONFIRMED,
      ProjectCode: projectCode,
      Title: fteObj.monthName,
      FileSystemObjectType: 1,
      ContentTypeId: '0x0120'
    };
    return data;
  }
  getFTETask(fteObj, projectCode, taskType) {
    const businessDay = this.commonService.calcBusinessDays(fteObj.monthStartDay, fteObj.monthEndDay);
    const resourceObj: any = this.pmObject.addProject.Timeline.NonStandard.ResourceName;
    let data: any;
    if (taskType === this.pmConstant.task.BLOCKING) {
      data = {
        __metadata: { type: this.constant.listNames.Schedules.type },
        StartDate: fteObj.monthStartDay,
        DueDate: fteObj.monthEndDay,
        ExpectedTime: '' + businessDay * resourceObj.MaxHrs,
        TimeZone: '' + resourceObj.TimeZone.Title,
        TATBusinessDays: businessDay,
        Status: this.constant.STATUS.NOT_CONFIRMED,
        Title: projectCode + ' ' + fteObj.monthName + ' ' + this.pmConstant.task.BLOCKING,
        ProjectCode: projectCode,
        Task: this.pmConstant.task.BLOCKING,
        Milestone: fteObj.monthName,
        AssignedToId: resourceObj.UserName.ID,
        IsCentrallyAllocated: 'No',
        ActiveCA: 'No'
      };
    }
    if (taskType === this.pmConstant.task.MEETING) {
      data = {
        __metadata: { type: this.constant.listNames.Schedules.type },
        StartDate: fteObj.monthStartDay,
        DueDate: fteObj.monthEndDay,
        ExpectedTime: '' + 0,
        TimeZone: '' + resourceObj.TimeZone.Title,
        TATBusinessDays: 0,
        Status: this.constant.STATUS.NOT_CONFIRMED,
        Title: projectCode + ' ' + fteObj.monthName + ' ' + this.pmConstant.task.MEETING,
        ProjectCode: projectCode,
        Task: this.pmConstant.task.MEETING,
        Milestone: fteObj.monthName,
        AssignedToId: resourceObj.UserName.ID,
        IsCentrallyAllocated: 'No',
        ActiveCA: 'No'
      };
    }
    if (taskType === this.pmConstant.task.TRAINING) {
      data = {
        __metadata: { type: this.constant.listNames.Schedules.type },
        StartDate: fteObj.monthStartDay,
        DueDate: fteObj.monthEndDay,
        ExpectedTime: '' + 0,
        TimeZone: '' + resourceObj.TimeZone.Title,
        TATBusinessDays: 0,
        Status: this.constant.STATUS.NOT_CONFIRMED,
        Title: projectCode + ' ' + fteObj.monthName + ' ' + this.pmConstant.task.TRAINING,
        ProjectCode: projectCode,
        Task: this.pmConstant.task.TRAINING,
        Milestone: fteObj.monthName,
        AssignedToId: resourceObj.UserName.ID,
        IsCentrallyAllocated: 'No',
        ActiveCA: 'No'
      };
    }
    return data;
  }
  /**
   * This function is used to get the milestone obj.
   * @param milestoneObj milestone object
   * @param projectCode projectcode.
   */
  getMilestoneData(mileobj, projectCode) {
    const milestoneObj = mileobj.data;
    const data = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: milestoneObj.StartDate,
      Actual_x0020_End_x0020_Date: milestoneObj.EndDate,
      StartDate: milestoneObj.StartDate,
      DueDate: milestoneObj.EndDate,
      ExpectedTime: '' + milestoneObj.Hours,
      Status: this.constant.STATUS.NOT_CONFIRMED,
      TATBusinessDays: milestoneObj.Days,
      ProjectCode: projectCode,
      Title: milestoneObj.Name,
      FileSystemObjectType: 1,
      ContentTypeId: '0x0120',
      SubMilestones: milestoneObj.strSubMilestone,
    };
    return data;
  }
  /**
   * This function is ued to get the task obj.
   * @param task task object
   * @param projectCode projectcode.
   */
  getTaskData(milestoneTask, projectCode, milestoneObj, subMilestoneObj) {
    milestoneTask = milestoneTask.data;
    milestoneTask.taskExist = true;
    const startDate = this.calcTimeForDifferentTimeZone(milestoneTask.StartDate,
      milestoneTask.assignedUserTimeZone, (new Date()).getTimezoneOffset() / 60 * -1);
    const endDate = this.calcTimeForDifferentTimeZone(milestoneTask.EndDate,
      milestoneTask.assignedUserTimeZone, (new Date()).getTimezoneOffset() / 60 * -1);
    const data: any = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      StartDate: startDate,
      DueDate: endDate,
      ExpectedTime: '' + milestoneTask.Hours,
      TimeZone: '' + milestoneTask.assignedUserTimeZone,
      AllowCompletion: 'No',
      TATStatus: milestoneTask.UseTaskDays,
      TATBusinessDays: milestoneTask.TaskDays,
      Status: this.constant.STATUS.NOT_CONFIRMED,
      SubMilestones: milestoneTask.SubMilestone,
      Title: projectCode + ' ' + milestoneObj.MilestoneName + ' ' + milestoneTask.TaskName.replace('Send to client', 'SC'),
      ProjectCode: projectCode,
      Task: milestoneTask.Task,
      Milestone: milestoneObj.MilestoneName,
      SkillLevel: milestoneTask.Skill,
    };
    if (milestoneTask.userId > 0) {
      data.AssignedToId = milestoneTask.userId;
    }
    if (milestoneTask.Task === 'Send to client') {
      data.AssignedToId = this.globalObject.currentUser.userId;
    }
    if (milestoneTask.hasOwnProperty('PreviousTask')) {
      let sNextTask = '';
      let sPrevTask = '';
      let arrTask;
      if (milestoneObj.SubMilestones) {
        arrTask = subMilestoneObj.children.filter((obj) => {
          return obj.data.PreviousTask.indexOf(milestoneTask.Title) > -1;
        });
      } else {
        arrTask = milestoneObj.children.filter((obj) => {
          return obj.data.PreviousTask.indexOf(milestoneTask.Title) > -1;
        });
      }
      if (arrTask.length) {
        for (const oTask of arrTask) {
          sNextTask = sNextTask ?
            sNextTask + ';#' + projectCode + ' ' + milestoneObj.MilestoneName + ' ' + oTask.data.TaskName.replace('Send to client', 'SC')
            : projectCode + ' ' + milestoneObj.MilestoneName + ' ' + oTask.data.TaskName.replace('Send to client', 'SC');
        }
      } else {
        if (milestoneTask.Task === 'Send to client') {
          sNextTask = projectCode + ' ' + milestoneObj.MilestoneName + ' ' + 'Client Review';
        }
      }
      const arrPrevTasks = milestoneTask.PreviousTask;
      for (const sPrev of arrPrevTasks) {
        let arrTasks;
        if (milestoneObj.SubMilestones) {
          arrTasks = subMilestoneObj.children.filter((obj) => {
            return obj.data.Title === sPrev;
          });
        } else {
          arrTasks = milestoneObj.children.filter((obj) => {
            return obj.data.Title === sPrev;
          });
        }
        if (arrTasks.length) {
          sPrevTask = sPrevTask ? sPrevTask + ';#' + projectCode + ' ' + milestoneObj.MilestoneName + ' ' + arrTasks[0].data.TaskName
            : projectCode + ' ' + milestoneObj.MilestoneName + ' ' + arrTasks[0].data.TaskName;
        }
      }
      data.NextTasks = sNextTask;
      data.PrevTasks = sPrevTask;
    } else {
      data.NextTasks = milestoneTask.NextTasks;
      data.PrevTasks = milestoneTask.PrevTasks;
    }
    if (milestoneTask.Skill === 'Editor' || milestoneTask.Skill === 'QC' || milestoneTask.Skill === 'Graphics') {
      const clientLegal = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
        x.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity);
      if (clientLegal && clientLegal.length && clientLegal[0].IsCentrallyAllocated === 'Yes') {
        data.IsCentrallyAllocated = 'Yes';
      } else {
        data.IsCentrallyAllocated = 'No';
      }
    } else {
      data.IsCentrallyAllocated = 'No';
    }

    return data;
  }
  /**
   * This function is used to set the projectBudgetBreakup object
   */
  getProjectBudgetBreakupData(res) {
    const addObj = this.pmObject.addProject;
    const budgetArray = this.pmObject.addProject.FinanceManagement.BudgetArray;
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectBudgetBreakup.type },
      ProjectCode: addObj.ProjectAttributes.ProjectCode,
      ProjectLookup: res[15].retItems.ID,
      Status: this.constant.STATUS.APPROVAL_PENDING,
      BudgetHours: addObj.FinanceManagement.BudgetHours
    };
    if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      data.OriginalBudget = 0;
      data.OOPBudget = 0;
      data.NetBudget = 0;
      data.TaxBudget = 0;
    } else {
      data.OriginalBudget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.NetBudget = budgetArray[0].revenue;
      data.TaxBudget = budgetArray[0].tax;
    }
    return data;
  }

  async getAllBudget(projectArray) {
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    let batchResults = [];
    let finalArray = [];
    if (projectArray && projectArray.length) {
      for (const element of projectArray) {
        if (batchURL.length < 100) {
          const projectFinanceGet = Object.assign({}, options);
          const projectFinanceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
          projectFinanceFilter.filter = projectFinanceFilter.filter.replace(/{{projectCode}}/gi,
            element.ProjectCode);
          projectFinanceGet.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinances.name,
            projectFinanceFilter);
          projectFinanceGet.type = 'GET';
          projectFinanceGet.listName = this.constant.listNames.ProjectFinances.name;
          batchURL.push(projectFinanceGet);
          if (batchURL.length === 99) {
            this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectFinance');
            batchResults = await this.spServices.executeBatch(batchURL);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
      if (batchURL.length) {
        this.commonService.SetNewrelic('projectManagment', 'PmCommon', 'GetProjectFinance');
        batchResults = await this.spServices.executeBatch(batchURL);
        finalArray = [...finalArray, ...batchResults];
      }
    }
    console.log('batch length: ' + batchURL.length);
    return finalArray;
  }
  customSort(data, order: number, fieldName?: string) {
    data.sort((row1, row2) => {
      const val1 = fieldName ? row1[fieldName] : row1;
      const val2 = fieldName ? row2[fieldName] : row2;
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
    return data;
  }
  monthDifference(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
  }
  getMonths(fromDate, toDate) { /// https://jsfiddle.net/fvkcxsdb/1/
    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth();
    const toYear = toDate.getFullYear();
    const toMonth = toDate.getMonth();
    const months = [];
    const monthNames = this.pmConstant.MONTH_NAMES;
    for (let year = fromYear; year <= toYear; year++) {
      let month = year === fromYear ? fromMonth : 0;
      const monthLimit = year === toYear ? toMonth : 11;
      for (; month <= monthLimit; month++) {
        // const monthStartDay = new Date(year, month, 1);
        // const monthEndDay = new Date(year, month + 1, 0);
        let monthStartDay = new Date();
        let monthEndDay = new Date();
        if (month === fromMonth) {
          monthStartDay = new Date(year, month, fromDate.getDate());
        } else {
          monthStartDay = new Date(year, month, 1);
        }
        if (month === toMonth) {
          monthEndDay = new Date(year, month, toDate.getDate());
        } else {
          monthEndDay = new Date(year, month + 1, 0);
        }
        const monthName = monthNames[month];
        monthEndDay.setHours(23, 45);
        months.push({ year, month, monthName, monthStartDay, monthEndDay });
      }
    }
    return months;
  }


  async getEmailTemplate(TemplateName) {
    this.commonService.SetNewrelic('ProjectManagement', 'PmCommon', 'GetEmailTemplate');
    this.pmConstant.SOW_QUERY.CONTENT_QUERY.filter = this.pmConstant.SOW_QUERY.CONTENT_QUERY.filter.replace(/{{templateName}}/gi, TemplateName);
    const templateData = await this.spServices.readItems(this.constant.listNames.MailContent.name,
      this.pmConstant.SOW_QUERY.CONTENT_QUERY);
    return templateData.length > 0 ? templateData[0] : [];
  }
  

  // SendEmail(){
  //   var EmailTemplate = this.Emailtemplate.Content;
  //   var objEmailBody = [];

  //   objEmailBody.push({
  //     "key": "@@Val1@@",
  //     "value": task.ProjectCode
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val2@@",
  //     "value": element.SubMilestones ? element.SubMilestones !== "Default" ? element.Title + " - " +
  //       element.SubMilestones : element.Title : element.Title
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val3@@",
  //     "value": element.AssignedTo.Title
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val4@@",
  //     "value": element.Task
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val5@@",
  //     "value": element.Milestone
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val6@@",
  //     "value": element.StartDate
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val7@@",
  //     "value": element.DueDate
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val8@@",
  //     "value": task.TaskComments ? task.TaskComments : ''
  //   });
  //   objEmailBody.push({
  //     "key": "@@Val0@@",
  //     "value": element.ID
  //   });

  //   objEmailBody.forEach(obj => {
  //     EmailTemplate = EmailTemplate.replace(RegExp(obj.key, 'gi'), obj.value);
  //   });

  //   EmailTemplate = EmailTemplate.replace(RegExp("'", 'gi'), '');
  //   EmailTemplate = EmailTemplate.replace(/\\/g, '\\\\');
  //   mailSubject = mailSubject.replace(RegExp("'", 'gi'), '');
  //   const sendEmailObj = {
  //     __metadata: { type: this.constants.listNames.SendEmail.type },
  //     Title: mailSubject,
  //     MailBody: EmailTemplate,
  //     Subject: mailSubject,
  //     ToEmailId: element.AssignedTo.EMail,
  //     FromEmailId: this.sharedObject.currentUser.email,
  //     CCEmailId: this.sharedObject.currentUser.email
  //   };
  //   const createSendEmailObj = Object.assign({}, this.queryConfig);
  //   createSendEmailObj.url = this.spServices.getReadURL(this.constants.listNames.SendEmail.name, null);
  //   createSendEmailObj.data = sendEmailObj;
  //   createSendEmailObj.type = 'POST';
  //   createSendEmailObj.listName = this.constants.listNames.SendEmail.name;
  //   batchUrl.push(createSendEmailObj);
  // }
}
