import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { PMObjectService } from "src/app/projectmanagement/services/pmobject.service";
import { PmconstantService } from "src/app/projectmanagement/services/pmconstant.service";
import { PMCommonService } from "src/app/projectmanagement/services/pmcommon.service";
import { AddTimelineComponent } from "../addtimeline.component";
import { ConstantsService } from "src/app/Services/constants.service";
import { Router } from "@angular/router";
import { DataService } from "src/app/Services/data.service";
import { CommonService } from "src/app/Services/common.service";
import { GlobalService } from "src/app/Services/global.service";
import { DialogService } from "primeng";
declare var $;
@Component({
  selector: "app-non-standardproject",
  templateUrl: "./non-standardproject.component.html",
  styleUrls: ["./non-standardproject.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class NonStandardprojectComponent implements OnInit {
  constructor(
    private spService: SPOperationService,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    private pmCommonService: PMCommonService,
    private constants: ConstantsService,
    private timelineObject: AddTimelineComponent,
    private commonService: CommonService,
    private dialogService: DialogService,
    private globalObject: GlobalService,
    private router: Router,
    private dataService: DataService
  ) {}
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
    url: "",
    type: "",
    listName: "",
  };
  async ngOnInit() {
    this.isNonStandardLoaderHidden = false;
    this.isNonStandardTableHidden = true;
    setTimeout(() => {
      const currentYear = new Date().getFullYear();
      const next10Year = currentYear + 10;
      const prev5Year = currentYear - 5;
      this.yearRange = "" + prev5Year + " : " + next10Year + "";
      if (
        !this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked
      ) {
        this.getProjectManagement();
        this.setFieldProperties();
      } else {
        this.setFieldProperties();
        this.setDropdownField();
      }
      if (
        this.pmObject.addProject.FinanceManagement.BilledBy ===
        this.pmConstant.PROJECT_TYPE.FTE.value
      ) {
        this.minDateValue = new Date(
          new Date().setDate(new Date().getDate() - 1)
        );
      } else {
        const todayDate = new Date();
        this.minDateValue = new Date(
          todayDate.setFullYear(
            todayDate.getFullYear(),
            todayDate.getMonth() - 60
          )
        );
      }
    }, this.pmConstant.TIME_OUT);
    this.isNonStandardLoaderHidden = true;
    this.isNonStandardTableHidden = false;

    this.constants.RuleParamterArray.find(
      (c) => c.parameterName === "Deliverable Type"
    ).value ='';

    this.getProjectRules();
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
    projectPerYearObj.url = this.spService.getReadURL(
      this.constants.listNames.ProjectPerYear.name,
      this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR
    );
    projectPerYearObj.url = projectPerYearObj.url.replace("{0}", "" + sYear);
    projectPerYearObj.listName = this.constants.listNames.ProjectPerYear.name;
    projectPerYearObj.type = "GET";
    batchUrl.push(projectPerYearObj);
    // const projectYearEndPoint = this.spService.getReadURL('' + this.constants.listNames.ProjectPerYear.name + '',
    //   this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    // const projectYearUpdatedEndPoint = projectYearEndPoint.replace('{0}', '' + sYear);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, projectYearUpdatedEndPoint);

    const clientObj = Object.assign({}, this.queryConfig);
    clientObj.url = this.spService.getReadURL(
      this.constants.listNames.ClientLegalEntity.name,
      this.pmConstant.TIMELINE_QUERY.CLIENT_LEGAL_ENTITY
    );
    clientObj.listName = this.constants.listNames.ClientLegalEntity.name;
    clientObj.type = "GET";
    batchUrl.push(clientObj);

    // const clientEndPoint = this.spService.getReadURL('' + this.constants.listNames.ClientLegalEntity.name + '',
    //   this.pmConstant.TIMELINE_QUERY.CLIENT_LEGAL_ENTITY);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, clientEndPoint);

    const deliveryTypeObj = Object.assign({}, this.queryConfig);
    deliveryTypeObj.url = this.spService.getReadURL(
      this.constants.listNames.DeliverableType.name,
      this.pmConstant.TIMELINE_QUERY.DELIVERY_TYPE
    );
    deliveryTypeObj.listName = this.constants.listNames.DeliverableType.name;
    deliveryTypeObj.type = "GET";
    batchUrl.push(deliveryTypeObj);

    // const deliveryTypeEndPoint = this.spService.getReadURL('' + this.constants.listNames.DeliverableType.name + '',
    //   this.pmConstant.TIMELINE_QUERY.DELIVERY_TYPE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, deliveryTypeEndPoint);

    const subdeliveryTypeObj = Object.assign({}, this.queryConfig);
    subdeliveryTypeObj.url = this.spService.getReadURL(
      this.constants.listNames.SubDeliverables.name,
      this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SUB_TYPE
    );
    subdeliveryTypeObj.listName = this.constants.listNames.SubDeliverables.name;
    subdeliveryTypeObj.type = "GET";
    batchUrl.push(subdeliveryTypeObj);

    // const subTypeEndPoint = this.spService.getReadURL('' + this.constants.listNames.SubDeliverables.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SUB_TYPE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, subTypeEndPoint);

    const servicesObj = Object.assign({}, this.queryConfig);
    servicesObj.url = this.spService.getReadURL(
      this.constants.listNames.Services.name,
      this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SERVICE
    );
    servicesObj.listName = this.constants.listNames.Services.name;
    servicesObj.type = "GET";
    batchUrl.push(servicesObj);

    // const servicesUrlEndPoint = this.spService.getReadURL('' + this.constants.listNames.Services.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_SERVICE);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, servicesUrlEndPoint);

    const resourcesObj = Object.assign({}, this.queryConfig);
    resourcesObj.url = this.spService.getReadURL(
      this.constants.listNames.ResourceCategorization.name,
      this.pmConstant.TIMELINE_QUERY.NON_STANDARD_RESOURCE_CATEGORIZATION
    );
    resourcesObj.listName = this.constants.listNames.ResourceCategorization.name;
    resourcesObj.type = "GET";
    batchUrl.push(resourcesObj);

    // const resoureOptionEndPoint = this.spService.getReadURL('' + this.constants.listNames.ResourceCategorization.name + '',
    //   this.pmConstant.TIMELINE_QUERY.NON_STANDARD_RESOURCE_CATEGORIZATION);
    // this.spService.getBatchBodyGet(batchContents, batchGuid, resoureOptionEndPoint);
    // this.pmObject.nonStandardPMResponse = await this.spService.getDataByApi(batchGuid, batchContents);

    this.commonService.SetNewrelic(
      "projectManagment",
      "addproj-addtimeline-nonStd",
      "GetProjPYearSubDeliverablesRCDelTypeListName"
    );

    const arrResult = await this.spService.executeBatch(batchUrl);
    this.pmObject.nonStandardPMResponse =
      arrResult.length > 0 ? arrResult.map((a) => a.retItems) : [];
    if (
      this.pmObject.nonStandardPMResponse &&
      this.pmObject.nonStandardPMResponse.length
    ) {
      const projectResult = this.pmObject.nonStandardPMResponse[0];
      if (projectResult && projectResult.length) {
        this.pmObject.oProjectManagement.oProjectPerYear =
          projectResult[0].Count + 1;
      }
      const clientlegalResult = this.pmObject.nonStandardPMResponse[1];
      if (clientlegalResult && clientlegalResult.length) {
        this.pmObject.oProjectManagement.oClientLegalEntity = clientlegalResult;
      }
      const deliveryType = this.pmObject.nonStandardPMResponse[2];
      if (deliveryType && deliveryType.length) {
        this.pmObject.oProjectManagement.oDeliverableType = deliveryType;
        this.pmObject.oProjectManagement.oDeliverableType.forEach((element) => {
          this.nonStandardDeliverableType.push({
            label: element.Title,
            value: element.Title,
          });
        });
      }
      const subType = this.pmObject.nonStandardPMResponse[3];
      if (subType && subType.length) {
        subType.forEach((element) => {
          this.nonStandardSubType.push({
            label: element.Title,
            value: element.Title,
          });
        });
      }
      const nonStandardService = this.pmObject.nonStandardPMResponse[4];
      if (nonStandardService && nonStandardService.length) {
        nonStandardService.forEach((element) => {
          this.nonStandardService.push({
            label: element.Title,
            value: element.Title,
          });
        });
      }
    }
    this.pmObject.isMainLoaderHidden = true;
  }
  async onDeliverableTypeChange() {
    this.changedProjectCode(this.selectedDeliverableType);
    const retResourceArray = this.pmObject.nonStandardPMResponse[5];
    let newArray = [];
    if (
      this.pmObject.addProject.FinanceManagement.BilledBy ===
      this.pmConstant.PROJECT_TYPE.FTE.value
    ) {
      newArray = retResourceArray.filter(
        (obj) =>
          obj.IsFTE === "Yes" &&
          obj.Account.results.length &&
          obj.Account.results.some(
            (b) =>
              b.Title ===
              this.pmObject.addProject.ProjectAttributes.ClientLegalEntity
          )
      );
    } else {
      newArray = retResourceArray;
    }
    const resourcesArray = this.pmCommonService.getResourceByMatrix(
      newArray,
      this.selectedDeliverableType
    );
    this.nonStandardResourceName = this.pmCommonService.bindGroupDropdown(
      resourcesArray
    );

    this.constants.RuleParamterArray.find(
      (c) => c.parameterName === "DeliverableType"
    ).value = this.selectedDeliverableType;

    this.getProjectRules();
  }

  onSelectedServicesChange() {}
  onSubTypeChange() {}
  onResourceChange(event) {
    this.selectedResource = event;
  }
  private changedProjectCode(deliverableType) {
    let clientLegalEntity = this.pmObject.addProject.ProjectAttributes
      .ClientLegalEntity; //$('.clientNameVal').text();
    let clientLegalEntityObject = this.pmObject.oProjectManagement.oClientLegalEntity.filter(
      function (obj) {
        return clientLegalEntity === obj.Title;
      }
    );
    let deliveryObject = this.pmObject.oProjectManagement.oDeliverableType.filter(
      function (obj) {
        return deliverableType === obj.Title;
      }
    );
    let sClientAcronym = clientLegalEntityObject[0].Acronym;
    let sDeliverableTypeCode = deliveryObject[0].Acronym;
    let oCurrentDate = new Date();
    let sProjCode = oCurrentDate.getFullYear();
    // let sProjCode = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    let sProjCount = this.pmObject.oProjectManagement.oProjectPerYear.toString();
    sProjCount = ("000" + sProjCount).slice(-4);
    if (sProjCode) {
      let sYear = sProjCode.toString().substr(2, 2);
      let sProjectCode =
        sClientAcronym + "-" + sDeliverableTypeCode + "-" + sYear + sProjCount;
      this.pmObject.addProject.ProjectAttributes.ProjectCode = sProjectCode;
    }
  }
  private validateRequiredField() {
    if (!this.selectedDeliverableType) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the delivery Type.",
        false
      );
      return false;
    }
    if (!this.selectedServices) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the service.",
        false
      );
      return false;
    }
    if (!this.selectedResource) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the resource.",
        false
      );
      return false;
    }
    if (!this.ngNonStandardProposedStartDate) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the Proposed Start Date.",
        false
      );
      return false;
    }
    if (!this.ngNonStandardProposedEndDate) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the Proposed End Date.",
        false
      );
      return false;
    }
    if (!this.nonstandardProjectBudgetHrs) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select the project budget hrs.",
        false
      );
      return false;
    }
    if (this.nonstandardProjectBudgetHrs) {
      if (parseFloat(this.nonstandardProjectBudgetHrs) <= 0) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please enter the valid Budget Hrs.",
          false
        );
        return false;
      }
      if (isNaN(parseFloat(this.nonstandardProjectBudgetHrs))) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please enter the Budget Hrs in number.",
          false
        );
        return false;
      }
    }
    if (
      this.ngNonStandardProposedStartDate &&
      this.ngNonStandardProposedEndDate
    ) {
      if (
        this.ngNonStandardProposedStartDate > this.ngNonStandardProposedEndDate
      ) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          "Proposed Start date cannot be greater than proposed end date.",
          false
        );
        return false;
      }
      if (
        this.pmObject.addProject.FinanceManagement.BilledBy ===
        this.pmConstant.PROJECT_TYPE.FTE.value
      ) {
        this.pmObject.addProject.Timeline.NonStandard.months = this.pmCommonService.getMonths(
          this.ngNonStandardProposedStartDate,
          this.ngNonStandardProposedEndDate
        );
        if (this.pmObject.addProject.Timeline.NonStandard.months.length > 12) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            "FTE Project cannot be created more than 1 year.",
            false
          );
          return false;
        }
      }
    }

    if (
      this.pmObject.OwnerAccess.selectedCMAccess &&
      this.pmObject.OwnerAccess.selectedCMAccess.length === 0
    ) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        " CM Access is required.",
        false
      );
      return false;
    }

    if (!this.pmObject.OwnerAccess.selectedDeliveryOwner || !this.pmObject.OwnerAccess.selectedCMOwner) {
        const Message = !this.pmObject.OwnerAccess.selectedCMOwner ? 'CM' : 'Delivery';
        this.commonService.showToastrMessage(this.constants.MessageType.warn,Message + ' Owner is required.Project rule not defined for '+Message+'. Please define at-least one '+ Message +' rule to create project.',false);
        return false;
      }
  
   
    return true;
  }
  disableField() {
    this.isNonStandardProposedStartDateDisabled = true;
    this.isNonStandardProposedEndDateDisabled = true;
    $("#nonstandardProjectBudgetHrs").attr("disabled", "true");
    this.isDeliveryTypeDisabled = true;
    this.isStandardSubTypeDisabled = true;
    this.isStandardServiceDisabled = true;
    this.isStandardResourceNameDisabled = true;
    $("#standardTimeline").attr("disabled", "true");
    $("#nonStandardTimeline").attr("disabled", "true");
    $("#nonstandardTimelineConfirm").attr("disabled", "true");
  }
  setFieldProperties() {
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      $("#nonStandardTimeline").attr("checked", "checked");
      this.pmObject.isStandardChecked = false;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked) {
      this.disableField();
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate) {
      this.ngNonStandardProposedStartDate = this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate) {
      this.ngNonStandardProposedEndDate = this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours) {
      this.nonstandardProjectBudgetHrs = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
    }
  }
  setDropdownField() {
    if (this.pmObject.addProject.Timeline.NonStandard.DeliverableType) {
      this.registerNonStandardDeliverableType = [
        {
          label: this.pmObject.addProject.Timeline.NonStandard.DeliverableType,
          value: this.pmObject.addProject.Timeline.NonStandard.DeliverableType,
        },
      ];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.SubDeliverable) {
      this.registerNonStandardSubType = [
        {
          label: this.pmObject.addProject.Timeline.NonStandard.SubDeliverable,
          value: this.pmObject.addProject.Timeline.NonStandard.SubDeliverable,
        },
      ];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.Service) {
      this.registerNonStandardServices = [
        {
          label: this.pmObject.addProject.Timeline.NonStandard.Service,
          value: this.pmObject.addProject.Timeline.NonStandard.Service,
        },
      ];
    }
    if (this.pmObject.addProject.Timeline.NonStandard.ResourceName) {
      const resource: any = this.pmObject.addProject.Timeline.NonStandard
        .ResourceName;
      if (resource) {
        this.registerNonStandardResourceName = [
          { label: resource.Title, value: resource.Title },
        ];
      }
    }
  }
  async nonStandardConfirm() {
    let isValid = this.validateRequiredField();

    if (
      this.pmObject.addProject.FinanceManagement.selectedFile &&
      this.pmObject.addProject.FinanceManagement.selectedFile.size === 0
    ) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        this.constants.Messages.ZeroKbFile.replace(
          "{{fileName}}",
          this.pmObject.addProject.FinanceManagement.selectedFile.name
        ),
        true
      );
      isValid = false;
    }
    if (isValid) {
      this.disableField();
      this.pmObject.addProject.Timeline.NonStandard.IsStandard = true;
      this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked = true;
      this.pmObject.addProject.Timeline.NonStandard.DeliverableType = this.selectedDeliverableType;
      this.pmObject.addProject.Timeline.NonStandard.SubDeliverable = this.selectedSubType;
      this.pmObject.addProject.Timeline.NonStandard.Service = this.selectedServices;
      this.pmObject.addProject.Timeline.NonStandard.ResourceName = this.selectedResource.value;
      this.setDropdownField();
      this.pmObject.addProject.Timeline.NonStandard.ProposedStartDate = this.ngNonStandardProposedStartDate;
      this.pmObject.addProject.Timeline.NonStandard.ProposedEndDate = this.ngNonStandardProposedEndDate;
      this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours = this.nonstandardProjectBudgetHrs;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;

      this.pmObject.addProject.ProjectAttributes.ActiveCM1 = this.pmObject.OwnerAccess.selectedCMAccess;
      this.pmObject.addProject.ProjectAttributes.ActiveCM2 = this.pmObject.OwnerAccess.selectedCMOwner;

      this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = this.pmObject.OwnerAccess.selectedDeliveryAccess;
      this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = this.pmObject.OwnerAccess.selectedDeliveryOwner;


      if(this.pmObject.addProject.ProjectAttributes.ActiveCM1.find(c=> c !== this.globalObject.currentUser.userId)){
        this.pmObject.addProject.ProjectAttributes.ActiveCM1.push(this.globalObject.currentUser.userId);
      }

      this.pmObject.isMainLoaderHidden = false;
      const newProjectCode = await this.pmCommonService.verifyAndUpdateProjectCode();
      this.pmObject.addProject.ProjectAttributes.ProjectCode = newProjectCode;
      if (newProjectCode) {
        if (this.pmObject.addProject.FinanceManagement.selectedFile) {
          let SelectedFile = [];
          this.pmObject.isMainLoaderHidden = true;
          this.commonService.SetNewrelic(
            "projectManagment",
            "nonStdConfirm",
            "UploadFiles"
          );
          const FolderName = await this.pmCommonService.getFolderName();
          SelectedFile.push(
            new Object({
              name: this.pmObject.addProject.FinanceManagement.selectedFile
                .name,
              file: this.pmObject.addProject.FinanceManagement.selectedFile,
            })
          );

          this.commonService
            .UploadFilesProgress(SelectedFile, FolderName, true)
            .then(async (uploadedfile) => {
              if (
                SelectedFile.length > 0 &&
                SelectedFile.length === uploadedfile.length
              ) {
                if (uploadedfile[0].ServerRelativeUrl) {
                  this.pmObject.addProject.FinanceManagement.SOWFileURL =
                    uploadedfile[0].ServerRelativeUrl;
                  this.pmObject.addProject.FinanceManagement.SOWFileName =
                    uploadedfile[0].Name;
                  this.pmObject.addProject.FinanceManagement.SOWFileProp =
                    uploadedfile[0];
                  this.pmObject.addSOW.isSOWCodeDisabled = false;
                  this.pmObject.addSOW.isStatusDisabled = true;
                }
              }
              this.callAddUpdateProject();
            });
        } else {
          this.callAddUpdateProject();
        }
      }
    }
  }

  async callAddUpdateProject() {
    this.pmObject.isMainLoaderHidden = false;
    await this.pmCommonService.addUpdateProject();

    this.commonService.showToastrMessage(
      this.constants.MessageType.success,
      "Project Created Successfully - " +
        this.pmObject.addProject.ProjectAttributes.ProjectCode,
      true
    );
    this.pmCommonService.reloadPMPage();
  }

  goToProjectAttributes() {
    this.pmObject.activeIndex = 2;
  }


  async getProjectRules(){
    await this.pmCommonService.FilterRules();   
  }
}
