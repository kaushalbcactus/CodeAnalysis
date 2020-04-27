import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { AddTimelineComponent } from '../addtimeline.component';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { CommonService } from 'src/app/Services/common.service';
declare var $;
@Component({
  selector: 'app-non-standardproject',
  templateUrl: './non-standardproject.component.html',
  styleUrls: ['./non-standardproject.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NonStandardprojectComponent implements OnInit {

  constructor(
    private spService: SPOperationService,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    private pmCommonService: PMCommonService,
    private constants: ConstantsService,
    private timelineObject: AddTimelineComponent,
    private messageService: MessageService,
    private commonService : CommonService,
    private router: Router,
    private dataService: DataService) { }
  public nonStandardDeliverableType = [];
  public nonStandardSubType = [];
  public nonStandardService = [];
  public nonStandardResourceName = [];
  registerNonStandardDeliverableType = [];
  registerNonStandardSubType = [];
  registerNonStandardServices = [];
  registerNonStandardResourceName = [];
  public selectedDeliverableType;
  public selectedServices;
  public selectedSubType;
  public ngModelSelectedResource;
  public isDeliveryTypeDisabled = false;
  public isStandardSubTypeDisabled = false;
  public isStandardServiceDisabled = false;
  public isStandardResourceNameDisabled = false;
  public isNonStandardProposedStartDateDisabled = false;
  public isNonStandardProposedEndDateDisabled = false;
  isNonStandardLoaderHidden = false;
  isNonStandardTableHidden = true;
  public nonstandardProjectBudgetHrs;
  public yearRange: any;
  public selectedResource;
  public ngNonStandardProposedStartDate;
  public ngNonStandardProposedEndDate;
  minDateValue;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  ngOnInit() {
    this.isNonStandardLoaderHidden = false;
    this.isNonStandardTableHidden = true;
    setTimeout(() => {
      const currentYear = new Date().getFullYear();
      const next10Year = currentYear + 10;
      const prev5Year = currentYear - 5;
      this.yearRange = '' + prev5Year + ' : ' + next10Year + '';
      if (!this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked) {
        this.getProjectManagement();
        this.setFieldProperties();
      } else {
        this.setFieldProperties();
        this.setDropdownField();
      }
      if (this.pmObject.addProject.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
        this.minDateValue = new Date(new Date().setDate(new Date().getDate() - 1));
      } else {
        const todayDate = new Date();
        this.minDateValue = new Date(todayDate.setFullYear(todayDate.getFullYear(), todayDate.getMonth() - 60));
      }
    }, this.pmConstant.TIME_OUT);
    this.isNonStandardLoaderHidden = true;
    this.isNonStandardTableHidden = false;
  }
  // tslint:disable
  private async getProjectManagement() {
    this.pmObject.isMainLoaderHidden = false;
    const batchUrl = [];
    // const batchContents = new Array();
    // const batchGuid = this.spService.generateUUID();
    const oCurrentDate = new Date();
    let sYear = oCurrentDate.getFullYear();
    //sYear = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;

    const projectPerYearObj = Object.assign({}, this.queryConfig);
    projectPerYearObj.url = this.spService.getReadURL(this.constants.listNames.ProjectPerYear.name, this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    projectPerYearObj.url = projectPerYearObj.url.replace('{0}', '' + sYear);
    projectPerYearObj.listName = this.constants.listNames.ProjectPerYear.name;
    projectPerYearObj.type = 'GET';
    batchUrl.push(projectPerYearObj);
    // const projectYearEndPoint = this.spService.getReadURL('' + this.constants.listNames.ProjectPerYear.name + '',
    //   this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    // const projectYearUpdatedEndPoint = projectYearEndPoint.replace('{0}', '' + sYear);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, projectYearUpdatedEndPoint);

    const clientObj = Object.assign({}, this.queryConfig);
    clientObj.url = this.spService.getReadURL(this.constants.listNames.ClientLegalEntity.name, this.pmConstant.TIMELINE_QUERY.CLIENT_LEGAL_ENTITY);
    clientObj.listName = this.constants.listNames.ClientLegalEntity.name;
    clientObj.type = 'GET';
    batchUrl.push(clientObj);

    // const clientEndPoint = this.spService.getReadURL('' + this.constants.listNames.ClientLegalEntity.name + '',
    //   this.pmConstant.TIMELINE_QUERY.CLIENT_LEGAL_ENTITY);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, clientEndPoint);

    const deliveryTypeObj = Object.assign({}, this.queryConfig);
    deliveryTypeObj.url = this.spService.getReadURL(this.constants.listNames.DeliverableType.name, this.pmConstant.TIMELINE_QUERY.DELIVERY_TYPE);
    deliveryTypeObj.listName = this.constants.listNames.DeliverableType.name;
    deliveryTypeObj.type = 'GET';
    batchUrl.push(deliveryTypeObj);

    // const deliveryTypeEndPoint = this.spService.getReadURL('' + this.constants.listNames.DeliverableType.name + '',
    //   this.pmConstant.TIMELINE_QUERY.DELIVERY_TYPE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, deliveryTypeEndPoint);

    const subdeliveryTypeObj = Object.assign({}, this.queryConfig);
    subdeliveryTypeObj.url = this.spService.getReadURL(this.constants.listNames.SubDeliverables.name, this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SUB_TYPE);
    subdeliveryTypeObj.listName = this.constants.listNames.SubDeliverables.name;
    subdeliveryTypeObj.type = 'GET';
    batchUrl.push(subdeliveryTypeObj);

    // const subTypeEndPoint = this.spService.getReadURL('' + this.constants.listNames.SubDeliverables.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SUB_TYPE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, subTypeEndPoint);

    const servicesObj = Object.assign({}, this.queryConfig);
    servicesObj.url = this.spService.getReadURL(this.constants.listNames.Services.name, this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SERVICE);
    servicesObj.listName = this.constants.listNames.Services.name;
    servicesObj.type = 'GET';
    batchUrl.push(servicesObj);

    // const servicesUrlEndPoint = this.spService.getReadURL('' + this.constants.listNames.Services.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SERVICE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, servicesUrlEndPoint);

    const resourcesObj = Object.assign({}, this.queryConfig);
    resourcesObj.url = this.spService.getReadURL(this.constants.listNames.ResourceCategorization.name, this.pmConstant.TIMELINE_QUERY.NON_STANDARD_RESOURCE_CATEGORIZATION);
    resourcesObj.listName = this.constants.listNames.ResourceCategorization.name;
    resourcesObj.type = 'GET';
    batchUrl.push(resourcesObj);

    // const resoureOptionEndPoint = this.spService.getReadURL('' + this.constants.listNames.ResourceCategorization.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_RESOURCE_CATEGORIZATION);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, resoureOptionEndPoint);
    // this.pmObject.nonStandardPMResponse = await this.spService.getDataByApi(batchGuid, batchContents);

    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-nonStd', 'GetProjPYearSubDeliverablesRCDelTypeListName');

    const arrResult = await this.spService.executeBatch(batchUrl);
    this.pmObject.nonStandardPMResponse = arrResult.length > 0 ? arrResult.map(a => a.retItems) : [];
    if (this.pmObject.nonStandardPMResponse && this.pmObject.nonStandardPMResponse.length) {
      const projectResult = this.pmObject.nonStandardPMResponse[0];
      if (projectResult && projectResult.length) {
        this.pmObject.oProjectManagement.oProjectPerYear = projectResult[0].Count + 1;
      }
      const clientlegalResult = this.pmObject.nonStandardPMResponse[1];
      if (clientlegalResult && clientlegalResult.length) {
        this.pmObject.oProjectManagement.oClientLegalEntity = clientlegalResult;
      }
      const deliveryType = this.pmObject.nonStandardPMResponse[2];
      if (deliveryType && deliveryType.length) {
        this.pmObject.oProjectManagement.oDeliverableType = deliveryType;
        this.pmObject.oProjectManagement.oDeliverableType.forEach(element => {
          this.nonStandardDeliverableType.push({ label: element.Title, value: element.Title });
        });
      }
      const subType = this.pmObject.nonStandardPMResponse[3];
      if (subType && subType.length) {
        subType.forEach(element => {
          this.nonStandardSubType.push({ label: element.Title, value: element.Title });
        });
      }
      const nonStandardService = this.pmObject.nonStandardPMResponse[4];
      if (nonStandardService && nonStandardService.length) {
        nonStandardService.forEach(element => {
          this.nonStandardService.push({ label: element.Title, value: element.Title });
        });
      }
    }
    this.pmObject.isMainLoaderHidden = true;
  }
  onDeliverableTypeChange() {
    this.changedProjectCode(this.selectedDeliverableType);
    const retResourceArray = this.pmObject.nonStandardPMResponse[5];
    let newArray = [];
    if (this.pmObject.addProject.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
      newArray = retResourceArray.filter(obj => obj.IsFTE === 'Yes' && obj.Account.results.length && obj.Account.results.some(b => b.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity));
    } else {
      newArray = retResourceArray;
    }
    const resourcesArray = this.pmCommonService.getResourceByMatrix(newArray, this.selectedDeliverableType);
    this.nonStandardResourceName = this.pmCommonService.bindGroupDropdown(resourcesArray);
  }
  onSelectedServicesChange() {
  }
  onSubTypeChange() {
  }
  onResourceChange(event) {
    this.selectedResource = event;
  }
  private changedProjectCode(deliverableType) {
    let clientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity; //$('.clientNameVal').text();
    let clientLegalEntityObject = this.pmObject.oProjectManagement.oClientLegalEntity.filter(function (obj) {
      return clientLegalEntity === obj.Title;
    });
    let deliveryObject = this.pmObject.oProjectManagement.oDeliverableType.filter(function (obj) {
      return deliverableType === obj.Title;
    });
    let sClientAcronym = clientLegalEntityObject[0].Acronym;
    let sDeliverableTypeCode = deliveryObject[0].Acronym;
    let oCurrentDate = new Date();
    let sYear = oCurrentDate.getFullYear();
    let sProjCode = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    let sProjCount = this.pmObject.oProjectManagement.oProjectPerYear.toString();
    sProjCount = ("000" + sProjCount).slice(-4);
    if (sProjCode) {
      let sYear = sProjCode.toString().substr(2, 2);
      let sProjectCode = sClientAcronym + "-" + sDeliverableTypeCode + "-" + sYear + sProjCount;
      this.pmObject.addProject.ProjectAttributes.ProjectCode = sProjectCode;
    }
  }
  private validateRequiredField() {
    if (!this.selectedDeliverableType) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the delivery Type.'
      });
      return false;
    }
    if (!this.selectedServices) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the service.'
      });
      return false;
    }
    if (!this.selectedResource) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the resource.'
      });
      return false;
    }
    if (!this.ngNonStandardProposedStartDate) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the Proposed Start Date.'
      });
      return false;
    }
    if (!this.ngNonStandardProposedEndDate) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the Proposed End Date.'
      });
      return false;
    }
    if (!this.nonstandardProjectBudgetHrs) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the project budget hrs.'
      });
      return false;
    }
    if (this.nonstandardProjectBudgetHrs) {
      if (parseFloat(this.nonstandardProjectBudgetHrs) <= 0) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Please enter the valid Budget Hrs.'
        });
        return false;
      }
      if (isNaN(parseFloat(this.nonstandardProjectBudgetHrs))) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Please enter the Budget Hrs in number.'
        });
        return false;
      }
    }
    if (this.ngNonStandardProposedStartDate && this.ngNonStandardProposedEndDate) {
      if (this.ngNonStandardProposedStartDate > this.ngNonStandardProposedEndDate) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Proposed Start date cannot be greater than proposed end date.'
        });
        return false;
      }
      if (this.pmObject.addProject.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
        this.pmObject.addProject.Timeline.NonStandard.months = this.pmCommonService.getMonths(this.ngNonStandardProposedStartDate, this.ngNonStandardProposedEndDate);
        if (this.pmObject.addProject.Timeline.NonStandard.months.length > 12) {
          this.messageService.add({
            key: 'custom', severity: 'error',
            summary: 'Error Message', detail: 'FTE Project cannot be created more than 1 year.'
          });
          return false;
        }
      }
    }
    return true;
  }
  disableField() {
    this.isNonStandardProposedStartDateDisabled = true;
    this.isNonStandardProposedEndDateDisabled = true;
    $('#nonstandardProjectBudgetHrs').attr("disabled", 'true');
    this.isDeliveryTypeDisabled = true;
    this.isStandardSubTypeDisabled = true;
    this.isStandardServiceDisabled = true;
    this.isStandardResourceNameDisabled = true;
    $('#standardTimeline').attr("disabled", 'true');
    $('#nonStandardTimeline').attr("disabled", 'true');
    $('#nonstandardTimelineConfirm').attr("disabled", 'true');
  }
  setFieldProperties() {
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      $('#nonStandardTimeline').attr("checked", "checked");
      this.pmObject.isStandardChecked = false;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked) {
      this.disableField();
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate) {
      this.ngNonStandardProposedStartDate = this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate) {
      this.ngNonStandardProposedEndDate = this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours) {
      this.nonstandardProjectBudgetHrs = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours
    }
  }
  setDropdownField() {
    if (this.pmObject.addProject.Timeline.NonStandard.DeliverableType) {
      this.registerNonStandardDeliverableType = [{ label: this.pmObject.addProject.Timeline.NonStandard.DeliverableType, value: this.pmObject.addProject.Timeline.NonStandard.DeliverableType }];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.SubDeliverable) {
      this.registerNonStandardSubType = [{ label: this.pmObject.addProject.Timeline.NonStandard.SubDeliverable, value: this.pmObject.addProject.Timeline.NonStandard.SubDeliverable }];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.Service) {
      this.registerNonStandardServices = [{ label: this.pmObject.addProject.Timeline.NonStandard.Service, value: this.pmObject.addProject.Timeline.NonStandard.Service }];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ResourceName) {
      const resource: any = this.pmObject.addProject.Timeline.NonStandard.ResourceName;
      if (resource) {
        this.registerNonStandardResourceName = [{ label: resource.Title, value: resource.Title }];
      }
    }
  }
  async nonStandardConfirm() {
    const isValid = this.validateRequiredField();
    if (isValid) {
      this.disableField();
      this.pmObject.addProject.Timeline.NonStandard.IsStandard = true;
      this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked = true;
      this.pmObject.addProject.Timeline.NonStandard.DeliverableType = this.selectedDeliverableType;
      this.pmObject.addProject.Timeline.NonStandard.SubDeliverable = this.selectedSubType;
      this.pmObject.addProject.Timeline.NonStandard.Service = this.selectedServices
      this.pmObject.addProject.Timeline.NonStandard.ResourceName = this.selectedResource.value;
      this.setDropdownField();
      this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate = this.ngNonStandardProposedStartDate;
      this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate = this.ngNonStandardProposedEndDate;
      this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours = this.nonstandardProjectBudgetHrs;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
      await this.pmCommonService.validateAndSave();
      this.messageService.add({
        key: 'custom', severity: 'success', summary: 'Success Message', sticky: true,
        detail: 'Project Created Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode
      });
      setTimeout(() => {
        this.pmObject.isAddProjectVisible = false;
        if (this.router.url === '/projectMgmt/allProjects') {
          this.dataService.publish('reload-project');
        } else {
          this.pmObject.allProjectItems = [];
          this.router.navigate(['/projectMgmt/allProjects']);
        }
      }, this.pmConstant.TIME_OUT);
    }
  }
  goToProjectAttributes() {
    this.pmObject.activeIndex = 2;
  }

  // goToFinanceMang() {
  //   if(this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
  //     this.pmObject.activeIndex = 3;
  //   } else {
  //     this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: 'Please register the timeline.' });
  //   }
  // }
}
