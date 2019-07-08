import { Injectable } from '@angular/core';
import { PmconstantService } from './pmconstant.service';
import { PMObjectService } from './pmobject.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { GlobalService } from 'src/app/Services/global.service';
import { promise } from 'selenium-webdriver';
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
    private globalObject: GlobalService
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
      const userProp = await this.spServices.getUserInfo(this.globalObject.sharePointPageObject.userId);
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
            break;
          case this.pmConstant.resourCatConstant.DELIVERY_LEVEL_1:
            this.pmObject.oProjectCreation.Resources.deliveryLevel1.push(element.UserName);
            break;
          case this.pmConstant.resourCatConstant.DELIVERY_LEVEL_2:
            this.pmObject.oProjectCreation.Resources.deliveryLevel2.push(element.UserName);
            break;
        }
        if (element && element.Categories && element.Categories.results && element.Categories.results.length) {
          const category = element.Categories.results;
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.BUSINESS_DEVELOPMENT) > -1) {
            this.pmObject.oProjectCreation.Resources.businessDevelopment.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.WRITER) > -1) {
            this.pmObject.oProjectCreation.Resources.writers.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.REVIEWER) > -1) {
            this.pmObject.oProjectCreation.Resources.reviewers.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.QUALITY_CHECK) > -1) {
            this.pmObject.oProjectCreation.Resources.qc.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.EDITOR) > -1) {
            this.pmObject.oProjectCreation.Resources.editors.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.GRAPHICS) > -1) {
            this.pmObject.oProjectCreation.Resources.graphics.push(element.UserName);
          }
          if (category.indexOf(this.pmConstant.RESOURCES_CATEGORY.PUBLICATION_SUPPORT) > -1) {
            this.pmObject.oProjectCreation.Resources.pubSupport.push(element.UserName);
          }
        }
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
    resourceGet.url = resourceEndPoint.replace('{0}', '' + this.globalObject.sharePointPageObject.userId);
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
    const body = await this.spServices.readItems(this.constant.listNames.MailContent.name, contentFilter);
    let mailBody = body[0].Content;
    objEmailBody.forEach(element => {
      mailBody = mailBody.replace(RegExp(element.key, 'gi'), element.value);
    });
    this.spServices.sendMail(arrayTo.join(','), this.pmObject.currLoginInfo.Email, mailSubject, mailBody,
      cc.join(','));
  }
  getEmailId(tempArray) {
    const arrayTo = [];
    this.pmObject.oProjectManagement.oResourcesCat.forEach(element => {
      tempArray.forEach(tempOjb => {
        if (element.UserName && element.UserName.ID === tempOjb) {
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
    addObj.ProjectAttributes.ActiveCM1.forEach(element => {
      allOperationId.push(element);
    });
    if (addObj.ProjectAttributes.ActiveDelivery1 && addObj.ProjectAttributes.ActiveDelivery1.length) {
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
      objProjectFolder = this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + listName + '/' +
        addObj.ProjectAttributes.ProjectCode;
      objProjectTask = this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + this.constant.listNames.Schedules.name
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
      SOWCode: addObj.SOWSelect.SOWCode,
      CMLevel1Id: {
        results: addObj.ProjectAttributes.ActiveCM1
      },
      CMLevel2Id: addObj.ProjectAttributes.ActiveCM2,
      DeliveryLevel1Id: {
        results: addObj.ProjectAttributes.ActiveDelivery1
      },
      DeliveryLevel2Id: addObj.ProjectAttributes.ActiveDelivery2,
      SubDivision: addObj.ProjectAttributes.SubDivision ? addObj.ProjectAttributes.SubDivision : '',
      Priority: addObj.ProjectAttributes.Priority,
      Indication: addObj.ProjectAttributes.Indication,
      Molecule: addObj.ProjectAttributes.Molecule,
      IsPubSupport: addObj.ProjectAttributes.PUBSupportRequired ? 'Yes' : 'No',
      Description: addObj.ProjectAttributes.EndUseofDeliverable ? addObj.ProjectAttributes.EndUseofDeliverable : '',
      POC: addObj.ProjectAttributes.PointOfContact2.join(';#'),
      Authors: addObj.ProjectAttributes.Authors ? addObj.ProjectAttributes.Authors : '',
      IsStandard: addObj.Timeline.Standard.IsStandard ? 'Yes' : 'No',
      ConferenceJournal: addObj.ProjectAttributes.ConferenceJournal ? addObj.ProjectAttributes.ConferenceJournal : '',
      Comments: addObj.ProjectAttributes.Comments ? addObj.ProjectAttributes.Comments : '',
      PubSupportStatus: addObj.ProjectAttributes.PUBSupportStatus ? addObj.ProjectAttributes.PUBSupportStatus : '',
      SOWLink: addObj.FinanceManagement.SOWFileURL ? addObj.FinanceManagement.SOWFileURL : ''
    };
    if (isCreate) {
      data.Milestones = addObj.Timeline.Standard.IsStandard ? addObj.Timeline.Standard.Milestones : '';
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
          data.GraphicsId = {
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
    const folderPath: string = this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + libraryName + '/' + docFolder;
    const filePathUrl = await this.spServices.getFileUploadUrl(folderPath, selectedFile.name, false);
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
    this.pmObject.addSOW.PracticeArea = sowItem.BusinessVertical.split(';#');
    this.pmObject.addSOW.Poc = sowItem.PrimaryPOC;
    this.pmObject.addSOW.PocText = this.extractNamefromPOC([sowItem.PrimaryPOC]).join(',');
    const oldAdditonalPocArray = sowItem.AdditionalPOC ? sowItem.AdditionalPOC.split(';#') : null;
    const newAdditionalPocArray = [];
    if (oldAdditonalPocArray && oldAdditonalPocArray.length) {
      oldAdditonalPocArray.forEach(element => {
        newAdditionalPocArray.push(Number(element));
      });
    }
    this.pmObject.addSOW.PocOptional = newAdditionalPocArray;
    this.pmObject.addSOW.PocOptionalText = this.extractNamefromPOC(newAdditionalPocArray).join(',');
    this.pmObject.addSOW.SOWTitle = sowItem.Title;
    this.pmObject.addSOW.SOWCreationDate = new Date(sowItem.CreatedDate);
    this.pmObject.addSOW.SOWExpiryDate = new Date(sowItem.ExpiryDate);
    this.pmObject.addSOW.Status = sowItem.Status;
    this.pmObject.addSOW.Comments = sowItem.Comments ? sowItem.Comments : '';
    this.pmObject.addSOW.Currency = sowItem.Currency;
    this.pmObject.addSOW.Budget.Total = sowItem.TotalBudget ? sowItem.TotalBudget : 0;
    this.pmObject.addSOW.Budget.Net = sowItem.NetBudget ? sowItem.NetBudget : 0;
    this.pmObject.addSOW.Budget.OOP = sowItem.NetBudget ? sowItem.NetBudget : 0;
    this.pmObject.addSOW.Budget.Tax = sowItem.NetBudget ? sowItem.NetBudget : 0;
    const cm1Array = [];
    const delivery1Array = [];
    if (sowItem.CMLevel1.results && sowItem.CMLevel1.results.length) {
      sowItem.CMLevel1.results.forEach(element => {
        cm1Array.push(element.ID);
      });
    }
    if (sowItem.DeliveryLevel1.results && sowItem.DeliveryLevel1.results.length) {
      sowItem.DeliveryLevel1.results.forEach(element => {
        delivery1Array.push(element.ID);
      });
    }
    this.pmObject.addSOW.CM1 = cm1Array;
    this.pmObject.addSOW.CM1Text = this.extractNameFromId(cm1Array).join(',');
    this.pmObject.addSOW.CM2 = sowItem.CMLevel2.ID;
    this.pmObject.addSOW.CM2Text = this.extractNameFromId([sowItem.CMLevel2.ID]).join(',');
    this.pmObject.addSOW.DeliveryOptional = delivery1Array;
    this.pmObject.addSOW.DeliveryOptionalText = this.extractNameFromId(delivery1Array).join(',');
    this.pmObject.addSOW.Delivery = sowItem.DeliveryLevel2.ID;
    this.pmObject.addSOW.DeliveryText = this.extractNameFromId([sowItem.DeliveryLevel2.ID]).join(',');
    this.pmObject.addSOW.SOWOwner = sowItem.BD.ID;
    this.pmObject.addSOW.SOWOwnerText = sowItem.BD.hasOwnProperty('ID') ? this.extractNameFromId([sowItem.BD.ID]).join(',') : '';
  }
}
