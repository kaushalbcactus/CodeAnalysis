import { Component, OnInit, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { DatePipe } from '@angular/common';
import { ConfirmationService, DynamicDialogConfig, MessageService, DynamicDialogRef, SelectItem } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { CommonService } from 'src/app/Services/common.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';

declare var $;
@Component({
  selector: 'app-manage-finance',
  templateUrl: './manage-finance.component.html',
  styleUrls: ['./manage-finance.component.css'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class ManageFinanceComponent implements OnInit {
  @Input() billedBy: any;
  @Output() budgetOutputData = new EventEmitter<any>();
  addPOForm: FormGroup;
  existBudgetArray: any = [];
  existPBBBudgetArray: any = [];
  existPOArray: any = [];
  existPOInvoiceArray: any = [];
  existPODataArray: any = [];
  isBudgetHoursDisabled = true;
  isInvoiceEdit = false;
  sowNumber = '';
  budgetData = [];
  budgetObj = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    budget_hours: 0,
    edited: false,
    reason: '',
    reasonType: ''
  };
  poData = [];
  poObj = {
    poId: 0,
    poValue: '',
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    scTotal: 0,
    scRevenue: 0,
    scOOP: 0,
    scTax: 0,
    showDelete: false,
    showAdd: false,
    showInvoice: false,
    isExsitPO: false,
    status: '',
    edited: false
  };
  poInfoData = [];
  poAddObj = {
    poId: 0,
    inv_number: '',
    invUrl: '',
    prf_number: '',
    prfUrl: '',
    date: new Date(),
    amount: 0,
    type: '',
    status: '',
    poc: '',
    address: '',
    isExsitInv: false,
    isInvoiceItemEdit: false,
    isInvoiceItemConfirm: false,
    currency: '',
    pocText: '',
    Id: 0,
    edited: false,
    proformaLookup: -1,
    invoiceLookup: -1
  };
  poHeader = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0
  };
  poArray = [];
  unassignedBudget = [];
  unassignedBudgetobj = { total: 0, revenue: 0, oop: 0, tax: 0 };
  poList = [];
  primaryPoc = [];
  overNightRequest = [];
  address = [];
  budgetHours = 0;
  hourlyBudgetHours = 0;
  updatedBudget = 0;
  error = false;
  errorMsg = '';
  addInvoiceErrorMsg = '';
  isAddBudgetButtonHidden = false;
  isrevenueFieldDisabled = false;
  showPo = false;
  showHourly = false;
  showAddInvoiceDetails = false;
  showSave = false;
  addInvoiceError = false;
  isAddToProjectHidden = false;
  selectedPo;
  hourlyRate;
  schedulePO = {
    scheduleTotal: 0,
    scheduleRevenue: 0,
    scheduleOop: 0,
    scheduleTax: 0
  };
  isPoRevenueDisabled = false;
  savePOArray = [];
  index;
  selectedOverNightRequest = 'No';
  isHourlyRateDisabled = false;
  isHourlyOverNightDisabled = false;
  isAddRateButtonHidden = false;
  projObj;
  isPOEdit = false;
  invoiceObj;
  showUnAssigned = false;
  invoiceHeader = 'Add Invoice Line Item';
  projectType = '';
  budgetIncreaseArray: SelectItem[];
  budgetDecreaseArray: SelectItem[];
  selectedReasonType = '';
  selectedReason = '';
  showBudgetIncrease = false;
  showReduction = false;
  sowObj: any;
  newBudgetHrs = 0;
  projectStatus = '';
  arrAdvanceInvoices = [];
  relatedInvoiceLinkingPopup = false;
  advanceInvID = -1;
  existingInvDate = '';
  existingInvAmount = 0;
  invBalance = 0;
  newInvAmount = 0;
  advanceInvArray = [];
  tagExistingInvSection = false;
  updateInvoices = [];
  hideRemoveButton = false;
  constructor(
    private frmbuilder: FormBuilder,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private config: DynamicDialogConfig,
    private dynamicDialogRef: DynamicDialogRef,
    private messageService: MessageService,
    private pmCommonService: PMCommonService,
    private commonService: CommonService,
    private global: GlobalService,
    private spOperations: SpOperationsService
  ) {
    this.addPOForm = frmbuilder.group({
      poDate: ['', Validators.required],
      amount: ['', Validators.required],
      primarypoc: ['', Validators.required],
      address: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.reInitializePopup();
  }
  reInitializePopup() {
    this.pmObject.addProject.FinanceManagement.POListArray = [];
    this.pmObject.addProject.FinanceManagement.POArray = [];
    this.pmObject.addProject.FinanceManagement.BudgetArray = [];
    this.pmObject.addProject.FinanceManagement.UnassignedArray = [];
    this.sowNumber = this.pmObject.addProject.SOWSelect.SOWCode;
    this.isBudgetHoursDisabled = true;
    this.address = [
      { label: 'POC', value: 'POC' },
      { label: 'Client', value: 'Client' }
    ];
    this.overNightRequest = [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' }
    ];
    if (this.config && this.config.hasOwnProperty('data')) {
      setTimeout(() => {
        this.projObj = this.config.data.projectObj;
        this.isPOEdit = true;
        // this.setBudget();
        this.projectType = this.projObj.ProjectType;
        this.projectStatus = this.projObj.Status;
        this.editManageFinances(this.projObj);
      }, this.pmConstant.TIME_OUT);
    } else {
      this.projObj = undefined;
      this.isPOEdit = false;
      this.projectType = this.pmObject.addProject.ProjectAttributes.BilledBy;
      this.projectStatus = this.constant.projectList.status.InDiscussion;
      this.setBudget();
    }
  }

  /**
   * This method is used to get required data before loading the page.
   */
  async getInitData(projectCode, clientLegalEntity, currency) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get Po ##0
    const poGet = Object.assign({}, options);
    const poFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_PO);
    poFilter.filter = poFilter.filter.replace(/{{clientLegalEntity}}/gi,
      clientLegalEntity);
    poGet.url = this.spServices.getReadURL(this.constant.listNames.PO.name,
      poFilter);
    poGet.type = 'GET';
    poGet.listName = this.constant.listNames.PO.name;
    batchURL.push(poGet);

    // Get SOW ##1
    const sowGet = Object.assign({}, options);
    const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.SOW_CODE);
    sowFilter.filter = sowFilter.filter.replace(/{{sowcode}}/gi,
      this.projObj ? this.projObj.SOWCode : this.pmObject.addProject.SOWSelect.SOWCode);
    sowGet.url = this.spServices.getReadURL(this.constant.listNames.SOW.name,
      sowFilter);
    sowGet.type = 'GET';
    sowGet.listName = this.constant.listNames.SOW.name;
    batchURL.push(sowGet);

    // Get Advance Invoices ##2
    const invGet = Object.assign({}, options);
    const invFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.ADV_INVOICES);
    invFilter.filter = invFilter.filter.replace(/{{clientLegalEntity}}/gi,
      clientLegalEntity);
    invGet.url = this.spServices.getReadURL(this.constant.listNames.Invoices.name,
      invFilter);
    invGet.type = 'GET';
    invGet.listName = this.constant.listNames.Invoices.name;
    batchURL.push(invGet);

    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults && arrResults.length) {
      const unfilteredPOArray = arrResults[0].retItems;
      this.poArray = unfilteredPOArray.filter(x => x.Currency === currency);
      if (this.poArray && this.poArray) {
        this.poArray.forEach((element) => {
          this.poList.push({ label: element.Number + '-' + element.Name, value: element.ID });
        });
      }
      this.sowObj = arrResults[1].retItems[0];

      this.arrAdvanceInvoices = arrResults[2].retItems;
    }
  }
  /**
   * This method is used to set the default value for all the budget value.
   */
  async setBudget() {
    await this.getInitData(this.pmObject.addProject.ProjectAttributes.ProjectCode,
      this.pmObject.addProject.ProjectAttributes.ClientLegalEntity,
      this.pmObject.addProject.FinanceManagement.Currency);
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      this.budgetHours = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours;
      this.hourlyBudgetHours = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      this.budgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
      this.hourlyBudgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
    }
    if (this.projectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      this.showHourly = true;
      this.isrevenueFieldDisabled = true;
      this.isAddBudgetButtonHidden = true;
      this.isPoRevenueDisabled = true;
    } else {
      this.showHourly = false;
      this.isrevenueFieldDisabled = false;
      this.isAddBudgetButtonHidden = false;
      this.isPoRevenueDisabled = false;
    }
    this.pmObject.addProject.FinanceManagement.OverNightRequest = this.selectedOverNightRequest;
    this.budgetData.push(this.budgetObj);
    this.unassignedBudget = [];
    this.unassignedBudget.push(this.unassignedBudgetobj);
    this.showUnAssigned = this.unassignedBudgetobj.revenue ? true : false;
    this.isAddToProjectHidden = this.unassignedBudgetobj.revenue ? false : true;
  }

  assignBudgetToProject(sReason, sReasonType) {
    this.error = false;
    this.errorMsg = '';

    this.unassignedBudget = [];

    if ((this.sowObj.NetBudget - this.sowObj.RevenueLinked) < this.updatedBudget) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'SOW revenue balance is less than addendum budget.'
      });
      return;
    }

    const tempbudgetObject = $.extend(true, {}, this.budgetObj);
    if (this.existBudgetArray.retItems && this.existBudgetArray.retItems.length) {
      tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
      tempbudgetObject.budget_hours = this.budgetHours + this.existBudgetArray.retItems[0].BudgetHrs;
      tempbudgetObject.revenue = this.updatedBudget + this.existBudgetArray.retItems[0].RevenueBudget;
      tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
      tempbudgetObject.total = this.updatedBudget + this.existBudgetArray.retItems[0].Budget;
    } else {
      tempbudgetObject.oop = 0;
      tempbudgetObject.budget_hours = this.budgetHours;
      tempbudgetObject.revenue = this.updatedBudget;
      tempbudgetObject.tax = 0;
      tempbudgetObject.total = this.updatedBudget;
    }
    this.budgetData = [];
    tempbudgetObject.edited = true;
    tempbudgetObject.reason = sReason;
    tempbudgetObject.reasonType = sReasonType;
    this.budgetData.push(tempbudgetObject);
    // add to assigned object.
    const unassignedObj = $.extend(true, {}, this.unassignedBudgetobj);
    if (this.existBudgetArray && this.existBudgetArray.length) {
      unassignedObj.total = this.updatedBudget + this.existBudgetArray.retItems[0].Budget;
      unassignedObj.revenue = this.updatedBudget + this.existBudgetArray.retItems[0].RevenueBudget;
      unassignedObj.oop = tempbudgetObject.oop;
      unassignedObj.tax = 0;
    } else {
      unassignedObj.total = this.updatedBudget;
      unassignedObj.revenue = this.updatedBudget;
      unassignedObj.oop = tempbudgetObject.oop;
      unassignedObj.tax = 0;
    }
    this.unassignedBudget = [];
    this.unassignedBudget.push(unassignedObj);
    this.showUnAssigned = unassignedObj.revenue ? true : false;
    this.isAddToProjectHidden = unassignedObj.revenue ? false : true;

    this.isAddBudgetButtonHidden = true;
    this.isrevenueFieldDisabled = true;
    this.updatedBudget = 0;
    this.budgetHours = 0;
    if (unassignedObj.revenue) {
      this.poData.forEach(element => {
        element.poInfo[0].showAdd = true;
        element.poInfo[0].poTotal = unassignedObj.revenue;
        element.poInfo[0].poRevenue = unassignedObj.revenue;
      });
    }
    ///// Set Pending to PO's

    const isTotalMatched = this.isScheduledMatched();
    if (isTotalMatched) {
      this.showSave = true;
    }

  }

  async reduceBudget() {
    if (this.selectedReason && this.selectedReasonType && this.newBudgetHrs) {
      if (this.budgetData[0].budget_hours === this.newBudgetHrs) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'New and old budget hours cant be same.'
        });
        return;
      }
      if (this.budgetData[0].budget_hours < this.newBudgetHrs) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'New hours cant be more than old budget hours cant be same.'
        });
        return;
      }
      this.showReduction = false;
      this.budgetData[0].edited = true;
      const pfPFB: any = await this.saveUpdatePO();
      const subjectVal = 'Approve project budget reduction';
      const mailSubject = this.projObj.ProjectCode + ': ' + subjectVal;
      const objEmailBody = [];
      objEmailBody.push({ key: '@@ProjectCode@@', value: this.projObj.ProjectCode });
      objEmailBody.push({ key: '@@ClientName@@', value: this.projObj.ClientLegalEntity });
      objEmailBody.push({ key: '@@SiteName@@', value: this.global.sharePointPageObject.webAbsoluteUrl });
      objEmailBody.push({ key: '@@Title@@', value: this.projObj.Title });
      objEmailBody.push({ key: '@@POC@@', value: this.projObj.PrimaryPOCText[0] });
      objEmailBody.push({ key: '@@Currency@@', value: this.existBudgetArray.retItems[0].Currency });
      objEmailBody.push({ key: '@@Reason@@', value: this.selectedReasonType });
      objEmailBody.push({ key: '@@Comments@@', value: this.selectedReason });
      objEmailBody.push({ key: '@@TotalBudget@@', value: pfPFB.pfObj.Budget });
      objEmailBody.push({ key: '@@NetBudget@@', value: pfPFB.pfObj.RevenueBudget });
      objEmailBody.push({ key: '@@OOPBudget@@', value: pfPFB.pfObj.OOPBudget });
      objEmailBody.push({ key: '@@TaxBudget@@', value: pfPFB.pfObj.TaxBudget });
      objEmailBody.push({ key: '@@AddendumTotalvalue@@', value: pfPFB.pbbObj.OriginalBudget * -1 });
      objEmailBody.push({ key: '@@AddendumNetvalue@@', value: pfPFB.pbbObj.NetBudget * -1 });
      objEmailBody.push({ key: '@@AddendumOOPvalue@@', value: pfPFB.pbbObj.OOPBudget * -1 });
      objEmailBody.push({ key: '@@AddendumTaxvalue@@', value: pfPFB.pbbObj.TaxBudget * -1 });
      objEmailBody.push({ key: '@@NewTotalBudget@@', value: pfPFB.pfObj.Budget + pfPFB.pbbObj.OriginalBudget });
      objEmailBody.push({ key: '@@NewNetBudget@@', value: pfPFB.pfObj.RevenueBudget + pfPFB.pbbObj.NetBudget });
      objEmailBody.push({ key: '@@NewOOPBudget@@', value: pfPFB.pfObj.OOPBudget + pfPFB.pbbObj.OOPBudget });
      objEmailBody.push({ key: '@@NewTaxBudget@@', value: pfPFB.pfObj.TaxBudget + pfPFB.pbbObj.TaxBudget });

      let tempArray = [];
      let arrayTo = [];
      const cm1IdArray = [];
      let arrayCC = [];
      let ccIDs = [];
      this.projObj.CMLevel1ID.forEach(element => {
        cm1IdArray.push(element.ID);
      });
      arrayCC = arrayCC.concat([], cm1IdArray);
      tempArray = tempArray.concat([], this.projObj.CMLevel2ID);
      arrayTo = this.pmCommonService.getEmailId(tempArray);
      ccIDs = this.pmCommonService.getEmailId(arrayCC);
      ccIDs.push(this.pmObject.currLoginInfo.Email);
      ///// Send approval message
      this.pmCommonService.getTemplate(this.constant.EMAIL_TEMPLATE_NAME.BUDGET_REDUCTION, objEmailBody, mailSubject, arrayTo,
        ccIDs);
    } else {
      if (!this.selectedReasonType) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'Please select reason type.'
        });
        return;
      }
      if (!this.selectedReason) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'Please enter reason.'
        });
        return;
      }
      if (!this.newBudgetHrs) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'New Budget hours cant be zero.'
        });
        return;
      }

    }
  }

  async removeUnassigned() {

    const isBudgetRedAllowed = this.projObj ? true : false;
    if (!isBudgetRedAllowed) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Budget reduction allowed for created projects only.'
      });
      return;
    }
    if (this.projectStatus === this.constant.projectList.status.InDiscussion) {
      this.budgetData[0].edited = true;
      this.budgetData[0].total = this.budgetData[0].total - this.unassignedBudget[0].total;
      this.budgetData[0].revenue = this.budgetData[0].revenue - this.unassignedBudget[0].revenue;
      const pfPFB: any = await this.saveUpdatePO();
    } else {
      this.selectedReason = '';
      this.selectedReasonType = '';
      this.newBudgetHrs = 0;
      this.budgetDecreaseArray = [];
      this.budgetDecreaseArray = [
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.SCOPE_REDUCE,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.SCOPE_REDUCE
        }
        ,
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.QUALITY,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.QUALITY
        }
        ,
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.RELATIONSHIP,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.RELATIONSHIP
        },
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.INPUT_ERROR,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.INPUT_ERROR
        }
      ];
      this.showReduction = true;

    }

  }

  /**
   * This method is used to add the budget to project.
   */
  addBudgetToProject() {
    let showError = false;
    if (this.projectStatus === this.constant.projectStatus.InDiscussion) {
      if (this.updatedBudget === 0 && this.budgetHours === 0) {
        showError = true;
      } else if (this.updatedBudget < 0) {
        showError = true;
      } else if (this.updatedBudget !== 0 && this.budgetHours === 0) {
        showError = true;
      }
    } else {
      if (this.updatedBudget === 0 && this.budgetHours === 0) {
        showError = true;
      } else if (this.updatedBudget !== 0 && this.budgetHours === 0) {
        showError = true;
      } else if (this.updatedBudget < 0) {
        showError = true;
      } else {
        this.selectedReason = '';
        this.selectedReasonType = '';
        this.budgetIncreaseArray = [];
        this.budgetIncreaseArray = [
          {
            label: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.SCOPE_INCREASE,
            value: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.SCOPE_INCREASE
          },
          {
            label: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR,
            value: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR
          }
        ];
        this.showBudgetIncrease = true;
        return;
      }
    }

    if (!showError) {
      this.assignBudgetToProject('', '');
    } else {
      this.error = true;
      if (!this.budgetHours) {
        this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGETHrs;
      } else {
        this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGET;
      }
    }
  }

  increaseBudget() {
    if (this.selectedReason && this.selectedReasonType) {

      if (this.updatedBudget === 0 && this.budgetHours !== 0
        && this.selectedReasonType !== this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'Budget can only be zero if selected reason is "Input error".'
        });
        return;
      }
      this.showBudgetIncrease = false;
      this.assignBudgetToProject(this.selectedReason, this.selectedReasonType);
    } else {
      if (!this.selectedReasonType) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'Please select reason type.'
        });
        return;
      }
      if (!this.selectedReason) {
        this.messageService.add({
          key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
          detail: 'Please enter reason.'
        });
        return;
      }

    }
  }

  /**
   * This method is used to add Rate to project.
   */
  addRateToProject() {
    if (!this.hourlyRate) {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.BLANK_HOURLY_BUDGET;
    } else if (this.hourlyRate < 0) {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.NEGATIVE_HOURLY_BUDGET;
    } else {
      this.pmObject.addProject.FinanceManagement.OverNightRequest = this.selectedOverNightRequest;
      this.pmObject.addProject.FinanceManagement.Rate = this.hourlyRate;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.hourlyBudgetHours;
      this.isHourlyOverNightDisabled = true;
      this.isHourlyRateDisabled = true;
      this.isAddRateButtonHidden = true;
      this.isAddToProjectHidden = false;
    }
  }
  /**
   * This method is used to add PO to project.
   */
  addPoToProject() {
    if (this.selectedPo) {
      if (this.poData && this.poData.length && this.poData.filter(item => item.poInfo[0].poId === this.selectedPo).length) {
        this.error = true;
        this.errorMsg = this.pmConstant.ERROR.PO_ALREADY_EXIST;
      } else {
        this.showPo = true;
        this.error = false;
        const tempPOObj = $.extend(true, {}, this.poObj);
        tempPOObj.poId = this.selectedPo;
        const poValue = this.poArray.filter(x => x.ID === this.selectedPo);
        if (poValue && poValue.length) {
          tempPOObj.poValue = poValue[0].Number + ' - ' + poValue[0].Name;
        }
        tempPOObj.total = 0;
        tempPOObj.revenue = 0;
        tempPOObj.oop = 0;
        tempPOObj.tax = 0;
        if (this.projectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
          tempPOObj.showAdd = false;
          this.showSave = true;
        } else {
          tempPOObj.showAdd = true;
        }
        tempPOObj.showDelete = true;
        tempPOObj.scValue = 'Scheduled + Invoiced';
        tempPOObj.scTotal = 0;
        tempPOObj.scRevenue = 0;
        tempPOObj.scOOP = 0;
        tempPOObj.scTax = 0;
        tempPOObj.isExsitPO = false;
        tempPOObj.edited = true;
        tempPOObj.status = 'Not Saved';
        tempPOObj.poRevenue = this.unassignedBudget[0].revenue;
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        // tempObj.Id = tempPOObj.poId;

        tempObj.poInfo.push(tempPOObj);
        this.poData.forEach(element => {
          const zeroInv = element.poInfoData.filter(e => e.amount === 0);
          zeroInv.forEach(elementInv => {
            const invIndex = element.poInfoData.findIndex(item => item === elementInv);
            element.poInfoData.splice(invIndex, 1);
            elementInv.poId = tempPOObj.poId;
            tempObj.poInfoData.push(elementInv);
          });
        });

        if (this.existPOArray.retItems && this.existPOArray.retItems.length) {
          this.poData.unshift(tempObj);
        } else {
          this.poData.push(tempObj);
        }
        const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.selectedPo);
        const retPOInfo = this.poData[poIndex].poInfo[0];
        if (this.budgetData && this.budgetData.length && this.unassignedBudget && this.unassignedBudget.length
          && this.budgetData[0].total === this.unassignedBudget[0].total) {
          retPOInfo.poRevenue = this.budgetData[0].revenue;
          retPOInfo.poTotal = this.budgetData[0].total;
        } else {
          retPOInfo.poRevenue = this.unassignedBudget[0].revenue;
          retPOInfo.poTotal = this.unassignedBudget[0].total;
        }
      }
    } else {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.PO_NOT_SELECTED;
    }
  }
  /**
   * This function is used to scheduled the PO.
   */
  schedulePo(poValue) {
    this.selectedPo = poValue.poInfo[0].poId;
    const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.selectedPo);
    const retPOInfo = this.poData[poIndex].poInfo[0];
    const reservePO = this.poArray.find(item => item.ID === this.selectedPo);

    if (!retPOInfo.poRevenue) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Enter revenue amount to be assigned to PO.'
      });
    }

    if ((reservePO.AmountRevenue - reservePO.RevenueLinked) < retPOInfo.poRevenue) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'PO revenue balance should be greater than or equal to the amount to reserved on PO.'
      });
      return;
    }


    // if (retPOInfo.poRevenue) {
    if (this.unassignedBudget[0].total === 0 && this.unassignedBudget[0].revenue === 0) {
      retPOInfo.total = retPOInfo.total + retPOInfo.poRevenue + retPOInfo.oop + retPOInfo.tax;
      retPOInfo.revenue = retPOInfo.revenue + retPOInfo.poRevenue;
      retPOInfo.oop = retPOInfo.oop + retPOInfo.oop;
      retPOInfo.tax = retPOInfo.tax + retPOInfo.tax;
    }
    if (this.unassignedBudget[0].total !== 0 && this.unassignedBudget[0].revenue !== 0) {
      retPOInfo.total = retPOInfo.total + retPOInfo.poRevenue + retPOInfo.oop + retPOInfo.tax;
      retPOInfo.revenue = retPOInfo.revenue + retPOInfo.poRevenue;
      retPOInfo.oop = retPOInfo.oop + retPOInfo.oop ? retPOInfo.oop : 0;
      retPOInfo.tax = retPOInfo.tax + retPOInfo.tax ? retPOInfo.tax : 0;
      this.unassignedBudget[0].total = this.unassignedBudget[0].total - retPOInfo.poRevenue - retPOInfo.oop - retPOInfo.tax;
      this.unassignedBudget[0].revenue = this.unassignedBudget[0].revenue - retPOInfo.poRevenue;
      this.unassignedBudget[0].oop = this.unassignedBudget[0].oop - retPOInfo.oop;
      this.unassignedBudget[0].tax = this.unassignedBudget[0].tax - retPOInfo.tax;
    }
    // Add the value to Po header.
    this.poHeader.total = this.poHeader.total + retPOInfo.poRevenue;
    this.poHeader.revenue = this.poHeader.revenue + retPOInfo.poRevenue;
    this.poHeader.tax = this.poHeader.tax + retPOInfo.tax;
    this.poHeader.oop = this.poHeader.oop + retPOInfo.oop;
    // }
    retPOInfo.poRevenue = 0;
    retPOInfo.poTotal = 0;
    retPOInfo.showInvoice = true;
    retPOInfo.edited = true;
    this.error = false;
    if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].revenue === 0) {
      this.poData.forEach(element => {
        element.poInfo[0].poRevenue = 0;
        element.poInfo[0].poTotal = 0;
        element.poInfo[0].showAdd = false;
        if (element.poInfo[0].total === 0) {
          element.poInfo[0].showDelete = true;
        }
      });
      this.isPoRevenueDisabled = true;
      this.isAddToProjectHidden = true;
    } else if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].revenue !== 0) {
      this.poData.forEach(element => {
        element.poInfo[0].poRevenue = this.unassignedBudget[0].revenue;
        element.poInfo[0].poTotal = this.unassignedBudget[0].total;
        element.poInfo[0].showAdd = true;
        if (element.poInfo[0].total === 0) {
          element.poInfo[0].showDelete = true;
        }
      });
    } else {
      retPOInfo.showAdd = true;
      retPOInfo.showDelete = retPOInfo.isExsitPO ? false : true;
      this.isPoRevenueDisabled = false;
      this.isAddToProjectHidden = false;
    }
    this.selectedPo = '';
    this.budgetData[0].edited = true;
  }
  setInvData() {
    const invID = this.advanceInvID;
    const oInv = this.arrAdvanceInvoices.find(e => e.ID === invID);
    this.existingInvDate = this.datePipe.transform(oInv.InvoiceDate, 'MMM, dd, yyyy');
    this.existingInvAmount = oInv.Amount;
    this.invBalance = oInv.Amount - oInv.TaggedAmount;
  }

  tagToInv() {
    const invID = this.advanceInvID;
    const oInv = this.arrAdvanceInvoices.find(e => e.ID === invID);
    if (this.newInvAmount === 0) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Amount to be tagged cannot be zero'
      });
      return;
    }
    if (this.newInvAmount > this.invBalance) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Amount to be tagged cannot be greater than Balance Amount'
      });
      return;
    }
    if (this.newInvAmount > this.invBalance) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Amount to be tagged cannot be greater than Balance Amount'
      });
      return;
    }

    const poValue = this.poData.find(e => e.poInfo[0].poId === this.selectedPo);
    const retPOInfo = poValue.poInfo[0];
    if ((retPOInfo.revenue - retPOInfo.scRevenue) < this.newInvAmount) {
      this.messageService.add({
        key: 'manageFinance', severity: 'error', summary: 'Error Message', sticky: true,
        detail: 'Amount to be tagged cannot be greater than amount to be scheduled on PO'
      });
      return;
    }
    const tempPOObj = $.extend(true, {}, this.poAddObj);
    tempPOObj.poId = this.selectedPo;
    tempPOObj.inv_number = oInv.InvoiceNumber;
    tempPOObj.prf_number = '';
    tempPOObj.invUrl = oInv.FileURL;
    tempPOObj.prfUrl = '';
    tempPOObj.date = new Date(this.existingInvDate);
    tempPOObj.amount = this.newInvAmount;
    tempPOObj.type = 'revenue';
    tempPOObj.status = this.constant.STATUS.APPROVED;
    tempPOObj.poc = oInv.MainPOC;
    tempPOObj.pocText = this.pmCommonService.extractNamefromPOC([tempPOObj.poc]);
    tempPOObj.address = oInv.AddressType;
    tempPOObj.isExsitInv = false;
    tempPOObj.edited = true;
    tempPOObj.proformaLookup = oInv.ProformaLookup;
    tempPOObj.invoiceLookup = oInv.ID;

    retPOInfo.edited = true;
    retPOInfo.scTotal = retPOInfo.scTotal + this.newInvAmount;
    retPOInfo.scRevenue = retPOInfo.scRevenue + this.newInvAmount;
    retPOInfo.scOOP = retPOInfo.scOOP + 0;
    retPOInfo.scTax = retPOInfo.scTax + 0;
    this.tagExistingInvSection = false;

    poValue.poInfoData.push(tempPOObj);

    if (retPOInfo.revenue === retPOInfo.scRevenue) {
      retPOInfo.showAdd = false;
      retPOInfo.showDelete = false;
      retPOInfo.showInvoice = false;
    }
    const isTotalMatched = this.isScheduledMatched();
    if (isTotalMatched) {
      this.showSave = true;
    }
  }

  tagExistingInv() {
    const arrINV = this.arrAdvanceInvoices.filter(e => e.PO === this.selectedPo);
    this.advanceInvArray = [];
    arrINV.forEach(element => {
      this.advanceInvArray.push({ label: element.InvoiceNumber, value: element.ID });
    });
    this.relatedInvoiceLinkingPopup = false;
    this.tagExistingInvSection = true;
  }

  scheduleNew() {
    const poValue = this.poData.find(e => e.poInfo[0].poId === this.selectedPo);
    this.relatedInvoiceLinkingPopup = false;
    this.scheduleInvoice(poValue);
  }

  createScheduleInvoice(poValue) {
    this.selectedPo = poValue.poInfo[0].poId;
    const arrINV = this.arrAdvanceInvoices.filter(e => e.PO === this.selectedPo);
    if (arrINV.length) {
      this.relatedInvoiceLinkingPopup = true;
    } else {
      this.scheduleInvoice(poValue);
    }
  }

  /**
   * This method is called when schedule invoice will trigger.
   */
  scheduleInvoice(poValue) {
    this.isInvoiceEdit = false;
    this.invoiceHeader = 'Add Invoice Line Item';
    this.selectedPo = poValue.poInfo[0].poId;
    const clientLegalEntity = this.isPOEdit ? this.config.data.projectObj.ClientLegalEntity
      : this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    this.primaryPoc = [];
    this.addPOForm.get('amount').setValue(0);
    const poc = this.pmObject.projectContactsItems.filter((obj) =>
      obj.ClientLegalEntity === clientLegalEntity);
    if (poc && poc.length) {
      // tslint:disable-next-line:no-shadowed-variable
      poc.forEach(element => {
        this.primaryPoc.push({ label: element.FullName, value: element.ID });
      });
    }
    this.showAddInvoiceDetails = true;
  }
  /**
   * This method is used to add the invoice details.
   */
  addInvoiceDetails() {
    this.addInvoiceError = false;
    if (this.isInvoiceEdit) {
      const amount = this.addPOForm.get('amount').value;
      if (this.invoiceObj.amount !== amount) {
        //// Reduce amount on inv, po and add unassigned
        const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.invoiceObj.poId);
        const retPOInfo = this.poData[poIndex].poInfo[0];
        if (this.invoiceObj.amount > amount) {
          //// Reduce all
          retPOInfo.scRevenue = retPOInfo.scRevenue - this.invoiceObj.amount + amount;
          retPOInfo.scTotal = retPOInfo.scTotal - this.invoiceObj.amount + amount;
          this.poHeader.total = this.poHeader.total - this.invoiceObj.amount + amount;
          this.poHeader.revenue = this.poHeader.revenue - this.invoiceObj.amount + amount;
          this.unassignedBudget[0].revenue = this.unassignedBudget[0].revenue + (this.invoiceObj.amount - amount);
          this.unassignedBudget[0].total = this.unassignedBudget[0].total + (this.invoiceObj.amount - amount);
          retPOInfo.revenue = retPOInfo.revenue - this.invoiceObj.amount + amount;
          retPOInfo.total = retPOInfo.total - this.invoiceObj.amount + amount;
          retPOInfo.showAdd = true;
          retPOInfo.showDelete = false;
          if (retPOInfo.revenue === retPOInfo.scRevenue) {
            retPOInfo.showInvoice = false;
          }
          this.poData.forEach(element => {
            element.poInfo[0].poRevenue = this.unassignedBudget[0].revenue;
            element.poInfo[0].poTotal = this.unassignedBudget[0].total;
            element.poInfo[0].showAdd = true;
            if (element.poInfo[0].total === 0) {
              element.poInfo[0].showDelete = true;
            }
          });
          this.isAddToProjectHidden = this.unassignedBudget[0].revenue ? false : true;
          this.showUnAssigned = this.unassignedBudget[0].revenue ? true : false;
        } else {
          ///// Check and add
          if ((retPOInfo.revenue - (retPOInfo.scRevenue - this.invoiceObj.amount) >= amount)) {
            retPOInfo.scRevenue = retPOInfo.scRevenue - this.invoiceObj.amount + amount;
            retPOInfo.scTotal = retPOInfo.scTotal - this.invoiceObj.amount + amount;
          } else {
            this.addInvoiceError = true;
            this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_GREATER;
            return;
          }
          if (retPOInfo.revenue === retPOInfo.scRevenue) {
            retPOInfo.showAdd = false;
            retPOInfo.showDelete = false;
            retPOInfo.showInvoice = false;
          }
        }
        this.invoiceObj.amount = amount;
        //if(amount === 0) {
        this.invoiceObj.isInvoiceItemConfirm = false;
        //}
        this.invoiceObj.poc = this.addPOForm.value.primarypoc;
        this.invoiceObj.pocText = this.pmCommonService.extractNamefromPOC([this.invoiceObj.poc]);
        this.invoiceObj.address = this.addPOForm.value.address;
        this.invoiceObj.edited = true;
        retPOInfo.edited = true;
        this.showAddInvoiceDetails = false;

        const isTotalMatched = this.isScheduledMatched();
        if (isTotalMatched) {
          this.showSave = true;
        }
      } else {
        this.saveInvoiceEdit();
      }
    } else {
      const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.selectedPo);
      const retPOInfo = this.poData[poIndex].poInfo[0];
      this.addInvoiceError = false;
      if (this.addPOForm.valid) {
        if (this.addPOForm.value.amount <= 0) {
          this.addInvoiceError = true;
          this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_ZERO;
          return;
        }
        const tempPOObj = $.extend(true, {}, this.poAddObj);
        tempPOObj.poId = retPOInfo.poId;
        tempPOObj.inv_number = '';
        tempPOObj.prf_number = '';
        tempPOObj.invUrl = '';
        tempPOObj.prfUrl = '';
        tempPOObj.date = new Date(this.datePipe.transform(this.addPOForm.value.poDate, 'MMM d, y'));
        tempPOObj.amount = this.addPOForm.value.amount;
        tempPOObj.type = 'revenue';
        tempPOObj.status = this.constant.STATUS.NOT_STARTED;
        tempPOObj.poc = this.addPOForm.value.primarypoc;
        tempPOObj.pocText = this.pmCommonService.extractNamefromPOC([tempPOObj.poc]);
        tempPOObj.address = this.addPOForm.value.address;
        tempPOObj.isExsitInv = false;
        tempPOObj.edited = true;

        if (tempPOObj.amount > (retPOInfo.revenue - retPOInfo.scRevenue)) {
          this.addInvoiceError = true;
          this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_GREATER;
        } else {
          retPOInfo.edited = true;
          retPOInfo.scTotal = retPOInfo.scTotal + this.addPOForm.value.amount;
          retPOInfo.scRevenue = retPOInfo.scRevenue + this.addPOForm.value.amount;
          retPOInfo.scOOP = retPOInfo.scOOP + 0;
          retPOInfo.scTax = retPOInfo.scTax + 0;
          this.poData[poIndex].poInfoData.push(tempPOObj);
          this.showAddInvoiceDetails = false;
          if (retPOInfo.revenue === retPOInfo.scRevenue) {
            retPOInfo.showAdd = false;
            retPOInfo.showDelete = false;
            retPOInfo.showInvoice = false;
          }
          const isTotalMatched = this.isScheduledMatched();
          if (isTotalMatched) {
            this.showSave = true;
          }
        }
      } else {
        this.validateAllFormFields(this.addPOForm);
      }
    }
    this.isInvoiceEdit = false;
  }
  /***
   * This function is used to validate the form field
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  /***
   * This method is used to check whether if all the budget has been scheduled or not
   */
  isScheduledMatched() {
    // check unassigned is total is 0 & all the PO's revenue should be matched with scheduled.
    let isValid = true;
    if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].revenue === 0) {
      // tslint:disable-next-line:no-shadowed-variable
      this.poData.forEach((poInfoObj) => {
        // tslint:disable-next-line:no-shadowed-variable
        poInfoObj.poInfo.forEach(element => {
          if (element.revenue !== element.scRevenue) {
            isValid = false;
          }
        });
      });
      return isValid;
    } else {
      return false;
    }
  }
  /***
   * This method is used to remove the the particular po if delete icon is clicked.
   * @param poObj The parameter should be PO object.
   */
  removePO(poObj) {
    this.selectedPo = poObj.poInfo[0].poId;
    this.confirmationService.confirm({
      header: 'Remove PO from project',
      icon: 'pi pi-info-circle',
      message: 'Are you sure you want to remove the po from project ?',
      accept: () => {
        if (poObj.poInfo[0].status === 'Not Saved') {
          const arrayIndex = this.poData.findIndex(x => x.Id === this.selectedPo);
          this.poData.splice(arrayIndex, 1);
        } else {
          poObj.poInfo[0].status = 'Deleted';
          poObj.poInfo[0].edited = true;
          poObj.poInfoData.forEach(element => {
            element.status = 'Deleted';
            element.edited = true;
          });
        }

        this.isAddToProjectHidden = false;
        this.unassignedBudget[0].total = this.unassignedBudget[0].total + poObj.poInfo[0].total;
        this.unassignedBudget[0].revenue = this.unassignedBudget[0].revenue + poObj.poInfo[0].revenue;
        this.unassignedBudget[0].oop = this.unassignedBudget[0].oop + poObj.poInfo[0].oop;
        this.unassignedBudget[0].tax = this.unassignedBudget[0].tax + poObj.poInfo[0].tax;
        // PO Header//
        this.poHeader.total = this.poHeader.total - poObj.poInfo[0].total;
        this.poHeader.revenue = this.poHeader.revenue - poObj.poInfo[0].revenue;
        this.poHeader.tax = this.poHeader.tax - poObj.poInfo[0].tax;
        this.poHeader.oop = this.poHeader.oop - poObj.poInfo[0].oop;
        if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].total === 0) {
          this.isPoRevenueDisabled = true;
        } else {
          this.isPoRevenueDisabled = false;
        }
        const isTotalMatched = this.isScheduledMatched();
        if (isTotalMatched) {
          this.showSave = true;
        }
      }
    });
  }

  lineItemConfirmAllowed(invoice) {
    const currentDate = new Date();
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const last3Days = this.commonService.getLastWorkingDay(3, new Date());

    if (invoice.date >= last3Days && invoice.date < lastDay && invoice.amount > 0) {
      return true;
    } else {
      return false;
    }
  }


  /***
   * This method is used to save the PO.
   */



  savePo() {
    this.savePOArray.push({
      budget: this.budgetData,
      PO: this.poData,
      Rate: this.hourlyRate,
      OverNightRequest: this.selectedOverNightRequest,
      arrAdvanceInvoices: this.arrAdvanceInvoices
    });
    // store value into global variable.
    this.pmObject.addProject.FinanceManagement.POListArray = this.poArray;
    this.pmObject.addProject.FinanceManagement.POArray = this.poData;
    this.pmObject.addProject.FinanceManagement.BudgetArray = this.budgetData;
    this.pmObject.addProject.FinanceManagement.UnassignedArray = this.unassignedBudget;
    this.budgetOutputData.emit(this.savePOArray);
    this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = true;
  }
  async editManageFinances(projObj) {
    this.hideRemoveButton = false;
    this.pmObject.isMainLoaderHidden = false;
    this.poData = [];
    this.isBudgetHoursDisabled = false;
    this.sowNumber = projObj.SOWCode;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    if (this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      this.showHourly = true;
      this.isrevenueFieldDisabled = true;
      this.isAddBudgetButtonHidden = true;
      this.isPoRevenueDisabled = true;
      this.isAddRateButtonHidden = true;
      this.isHourlyRateDisabled = true;
      this.isHourlyOverNightDisabled = true;
      this.isAddBudgetButtonHidden = true;
    } else {
      this.showHourly = false;
      this.isrevenueFieldDisabled = false;
      this.isAddBudgetButtonHidden = false;
      this.isPoRevenueDisabled = false;
    }


    // Get Project Finance  ##0;
    const projectFinanceGet = Object.assign({}, options);
    const projectFinaceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE);
    projectFinaceFilter.filter = projectFinaceFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    projectFinanceGet.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinances.name,
      projectFinaceFilter);
    projectFinanceGet.type = 'GET';
    projectFinanceGet.listName = this.constant.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceGet);
    // Get Project Finance Breakup  ##1;
    const projectFinanceBreakupGet = Object.assign({}, options);
    const projectFinaceBreakupFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BREAKUP_BY_PROJECTCODE);
    projectFinaceBreakupFilter.filter = projectFinaceBreakupFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    projectFinanceBreakupGet.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinanceBreakup.name,
      projectFinaceBreakupFilter);
    projectFinanceBreakupGet.type = 'GET';
    projectFinanceBreakupGet.listName = this.constant.listNames.ProjectFinanceBreakup.name;
    batchURL.push(projectFinanceBreakupGet);
    // Get Invoice Line Items  ##2;
    const invoiceLineItemsGet = Object.assign({}, options);
    const invoiceLineItemsFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceLineItemsFilter.filter = invoiceLineItemsFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    invoiceLineItemsGet.url = this.spServices.getReadURL(this.constant.listNames.InvoiceLineItems.name,
      invoiceLineItemsFilter);
    invoiceLineItemsGet.type = 'GET';
    invoiceLineItemsGet.listName = this.constant.listNames.InvoiceLineItems.name;
    batchURL.push(invoiceLineItemsGet);


    // Get PBB  ##3;
    const pbbGet = Object.assign({}, options);
    const pbbFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.PROJECT_BUDGET_BREAKUP);
    pbbFilter.filter = pbbFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    pbbGet.url = this.spServices.getReadURL(this.constant.listNames.ProjectBudgetBreakup.name,
      pbbFilter);
    pbbGet.type = 'GET';
    pbbGet.listName = this.constant.listNames.ProjectBudgetBreakup.name;
    batchURL.push(pbbGet);

    const result = await this.spServices.executeBatch(batchURL);
    this.budgetData = [];

    if (result && result.length) {

      this.existBudgetArray = result[0];
      this.existPOArray = result[1];
      this.existPOInvoiceArray = result[2];
      this.existPBBBudgetArray = result[3];
      await this.getInitData(projObj.ProjectCode, projObj.ClientLegalEntity,
        this.existBudgetArray.retItems[0].Currency);
      const tempbudgetObject = $.extend(true, {}, this.budgetObj);
      this.budgetHours = 0;
      tempbudgetObject.revenue = this.existBudgetArray.retItems[0].RevenueBudget;
      tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
      tempbudgetObject.total = this.existBudgetArray.retItems[0].Budget;
      tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
      tempbudgetObject.budget_hours = this.existBudgetArray.retItems[0].BudgetHrs;
      this.budgetData.push(tempbudgetObject);

      let poTotal = 0;
      let poRev = 0;
      let poOOP = 0;
      let poTax = 0;

      // add appropriate value for unassigned project.
      for (let index = 0; index < this.existPOArray.retItems.length; index++) {
        const poItem = this.existPOArray.retItems[index];
        const tempPOObj = $.extend(true, {}, this.poObj);
        tempPOObj.poId = poItem.POLookup;
        const poValue = this.poArray.filter(x => x.ID === poItem.POLookup);
        if (poValue && poValue.length) {
          tempPOObj.poValue = poValue[0].Number + ' - ' + poValue[0].Name;
        }
        tempPOObj.total = poItem.Amount;
        tempPOObj.revenue = poItem.AmountRevenue;
        tempPOObj.oop = poItem.AmountOOP;
        tempPOObj.tax = poItem.AmountTax;
        tempPOObj.status = poItem.Status;
        poTotal = poTotal + tempPOObj.total;
        poRev = poRev + tempPOObj.revenue;
        poOOP = poOOP + tempPOObj.oop;
        poTax = poTax + tempPOObj.tax;

        if (this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
          tempPOObj.showAdd = false;
        } else {
          tempPOObj.showAdd = true;
        }

        if (tempPOObj.total) {
          tempPOObj.showDelete = false;
        } else {
          tempPOObj.showDelete = true;
        }
        tempPOObj.scValue = 'Scheduled + Invoiced';
        tempPOObj.scTotal = (poItem.TotalScheduled ? poItem.TotalScheduled : 0) + (poItem.TotalInvoiced ? poItem.TotalInvoiced : 0);
        tempPOObj.scRevenue = (poItem.ScheduledRevenue ? poItem.ScheduledRevenue : 0) +
          (poItem.InvoicedRevenue ? poItem.InvoicedRevenue : 0);
        tempPOObj.scOOP = (poItem.ScheduledOOP ? poItem.ScheduledOOP : 0) + (poItem.InvoicedOOP ? poItem.InvoicedOOP : 0);
        tempPOObj.scTax = 0;
        tempPOObj.isExsitPO = true;
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        tempObj.Id = poItem.ID;
        tempObj.poInfo.push(tempPOObj);
        this.poData.push(tempObj);
        const inoviceItems = this.existPOInvoiceArray.retItems.filter(x => x.PO === poItem.POLookup);
        // get Invoice number & performa number.
        const invoicePermormaNumberArray = await this.getInvoiceProformaNumber(inoviceItems);
        inoviceItems.forEach(invoiceItem => {
          const invoiceObj = $.extend(true, {}, this.poAddObj);
          const invoiceNumber = invoicePermormaNumberArray
            .filter(c => c.listName === this.constant.listNames.Invoices.name)
            .filter(x => x.retItems && x.retItems.length && x.retItems[0].ID === invoiceItem.InvoiceLookup);
          const proformaNumber = invoicePermormaNumberArray
            .filter(c => c.listName === this.constant.listNames.Proforma.name)
            .filter(d => d.retItems && d.retItems.length && d.retItems[0].ID === invoiceItem.ProformaLookup);
          invoiceObj.Id = invoiceItem.ID;
          invoiceObj.poId = invoiceItem.PO;
          invoiceObj.inv_number = invoiceNumber && invoiceNumber.length && invoiceNumber[0].retItems && invoiceNumber[0].retItems.length
            ? invoiceNumber[0].retItems[0].InvoiceNumber : '';
          if (invoiceObj.inv_number) {
            invoiceObj.invUrl = invoiceNumber && invoiceNumber.length && invoiceNumber[0].retItems && invoiceNumber[0].retItems.length
              ? invoiceNumber[0].retItems[0].FileURL : '';
          }
          invoiceObj.prf_number = proformaNumber && proformaNumber.length && proformaNumber[0].retItems && proformaNumber[0].retItems.length
            ? proformaNumber[0].retItems[0].Title : '';
          if (invoiceObj.prf_number) {
            invoiceObj.prfUrl = proformaNumber && proformaNumber.length && proformaNumber[0].retItems && proformaNumber[0].retItems.length
              ? proformaNumber[0].retItems[0].FileURL : '';
          }
          invoiceObj.date = new Date(this.datePipe.transform(invoiceItem.ScheduledDate, 'MMM d, y'));
          invoiceObj.amount = invoiceItem.Amount;
          invoiceObj.type = invoiceItem.ScheduleType;
          invoiceObj.status = invoiceItem.Status;
          invoiceObj.poc = invoiceItem.MainPOC;
          invoiceObj.pocText = invoiceItem.MainPOC ? this.pmCommonService.extractNamefromPOC([invoiceItem.MainPOC]) : '';
          invoiceObj.address = invoiceItem.AddressType;
          invoiceObj.isExsitInv = true;
          invoiceObj.currency = this.existBudgetArray.retItems[0].Currency;
          invoiceObj.proformaLookup = invoiceItem.ProformaLookup;
          invoiceObj.invoiceLookup = invoiceItem.InvoiceLookup;

          if (invoiceObj.status === 'Scheduled') {

            if (this.projectStatus === this.constant.projectStatus.Unallocated
              || this.projectStatus === this.constant.projectStatus.InProgress
              || this.projectStatus === this.constant.projectStatus.ReadyForClient
              || this.projectStatus === this.constant.projectStatus.AuditInProgress
              || this.projectStatus === this.constant.projectStatus.OnHold
              || this.projectStatus === this.constant.projectStatus.AuthorReview
              || this.projectStatus === this.constant.projectStatus.PendingClosure) {
              invoiceObj.isInvoiceItemConfirm = this.lineItemConfirmAllowed(invoiceObj);
            }
            if (this.projectStatus === this.constant.projectStatus.Unallocated
              || this.projectStatus === this.constant.projectStatus.InProgress
              || this.projectStatus === this.constant.projectStatus.ReadyForClient
              || this.projectStatus === this.constant.projectStatus.AuditInProgress
              || this.projectStatus === this.constant.projectStatus.OnHold
              || this.projectStatus === this.constant.projectStatus.AuthorReview
              || this.projectStatus === this.constant.projectStatus.PendingClosure
              || this.projectStatus === this.constant.projectStatus.InDiscussion) {
              invoiceObj.isInvoiceItemEdit = true;
            }
          }
          this.poData[index].poInfoData.push(invoiceObj);
        });
      }

      // add value to Po header.
      this.poHeader.total = poTotal;
      this.poHeader.revenue = poRev;
      this.poHeader.oop = poOOP;
      this.poHeader.tax = poTax;


      ///// Adjust
      if (this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        this.poHeader.total = null;
        tempbudgetObject.total = null;
        this.hourlyBudgetHours = tempbudgetObject.budget_hours;
        this.hourlyRate = this.existBudgetArray.retItems[0].Budget;
        if (this.existPOArray.retItems.length) {
          this.isAddToProjectHidden = true;
        }

        if (this.existBudgetArray.retItems[0].ApprovedBudget) {
          const approvedBudget = this.existBudgetArray.retItems[0].ApprovedBudget;
          this.poHeader.total = approvedBudget;
          this.poHeader.revenue = approvedBudget;
          tempbudgetObject.revenue = approvedBudget;
          tempbudgetObject.total = approvedBudget;
          this.poHeader.oop = 0;
          this.poHeader.tax = 0;
          tempbudgetObject.tax = 0;
          tempbudgetObject.oop = 0;
        } else {
          tempbudgetObject.total = 0;
          tempbudgetObject.revenue = 0;
          tempbudgetObject.tax = 0;
          tempbudgetObject.oop = 0;
          this.poHeader.total = 0;
          this.poHeader.revenue = 0;
          this.poHeader.oop = 0;
          this.poHeader.tax = 0;
        }
      }

      const unassignedObj = $.extend(true, {}, this.unassignedBudgetobj);
      this.unassignedBudget = [];

      unassignedObj.total = tempbudgetObject.total - poTotal;
      unassignedObj.revenue = tempbudgetObject.revenue - poRev;
      unassignedObj.oop = tempbudgetObject.oop - poOOP;
      unassignedObj.tax = tempbudgetObject.tax - poTax;

      if (!unassignedObj.revenue) {
        this.poData.forEach(element => {
          element.poInfo[0].showAdd = false;
        });
      }

      this.unassignedBudget.push(unassignedObj);
      this.showUnAssigned = unassignedObj.revenue ? true : false;
      this.isAddToProjectHidden = unassignedObj.revenue ? false : true;


      ///// Remove all buttons if there is approval pending
      const budgetPending = this.existPBBBudgetArray.retItems.find(e => e.Status === this.constant.projectBudgetBreakupList.status.ApprovalPending);
      if ((this.projectStatus !== this.constant.projectList.status.InDiscussion && budgetPending)
        || this.projectStatus === this.constant.projectList.status.Closed
        || this.projectStatus === this.constant.projectList.status.Cancelled) {
        this.hideRemoveButton = true;
        this.isAddRateButtonHidden = true;
        this.isAddBudgetButtonHidden = true;
        this.isAddToProjectHidden = true;
        this.poData.forEach(element => {
          element.poInfo[0].showAdd = false;
          element.poInfo[0].showDelete = false;
          element.poInfo[0].showInvoice = false;
          element.poInfoData.forEach(elementInv => {
            elementInv.isInvoiceItemEdit = false;
          });
        });
      }

      this.existPODataArray = this.poData;
      this.showPo = true;
      this.pmObject.isMainLoaderHidden = true;
    }
  }
  async getInvoiceProformaNumber(inoviceItems) {
    const uniqueInvoiceItems = this.commonService.unique(inoviceItems, 'InvoiceLookup');
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    for (const invoiceItem of uniqueInvoiceItems) {
      // Get InoviceItems  ##0;
      const inoviceGet = Object.assign({}, options);
      const invoiceFilter = Object.assign({}, this.pmConstant.QUERY.INVOICES_BY_INVOICELOOKUP);
      invoiceFilter.filter = invoiceFilter.filter.replace(/{{invoiceLookup}}/gi,
        invoiceItem.InvoiceLookup);
      inoviceGet.url = this.spServices.getReadURL(this.constant.listNames.Invoices.name,
        invoiceFilter);
      inoviceGet.type = 'GET';
      inoviceGet.listName = this.constant.listNames.Invoices.name;
      batchURL.push(inoviceGet);
      // Get Proforma  ##1;
      const proformaGet = Object.assign({}, options);
      const proformaFilter = Object.assign({}, this.pmConstant.QUERY.PROFORMA_BY_PROFORMALOOKUP);
      proformaFilter.filter = proformaFilter.filter.replace(/{{proformaLookup}}/gi,
        invoiceItem.ProformaLookup);
      proformaGet.url = this.spServices.getReadURL(this.constant.listNames.Proforma.name,
        proformaFilter);
      proformaGet.type = 'GET';
      proformaGet.listName = this.constant.listNames.Proforma.name;
      batchURL.push(proformaGet);
    }
    const invoiceProformaResult = await this.spServices.executeBatch(batchURL);
    if (invoiceProformaResult && invoiceProformaResult.length) {
      return invoiceProformaResult;
    }
  }
  confirmInvoiceItem(rowData) {
    this.invoiceObj = rowData;
    console.log(rowData);
    this.confirmationService.confirm({
      header: 'Confirm Invoice',
      icon: 'pi pi-exclamation-triangle',
      message: 'Are you sure you want to confirm the invoice ?',
      accept: () => {
        this.commitInvoiceItem(rowData);
      }
    });
  }
  async commitInvoiceItem(rowData) {
    const groupInfo = await this.spOperations.getGroupInfo('Invoice_Team');
    const approvers = groupInfo.results;
    const arrayTo = [];
    if (approvers.length) {
      for (const i in approvers) {
        if (approvers[i].Email !== undefined && approvers[i].Email !== '') {
          arrayTo.push(approvers[i].Email);
        }
      }
    }
    const data = {
      Status: this.constant.STATUS.CONFIRMED
    };
    const result = await this.spServices.updateItem(this.constant.listNames.InvoiceLineItems.name,
      rowData.Id, data, this.constant.listNames.InvoiceLineItems.type);
    const objEmailBody = [];
    const mailSubject = this.projObj.ProjectCode + '/' + this.projObj.ClientLegalEntity + ': Confirmed line item for billing';
    objEmailBody.push({
      key: '@@Val2@@',
      value: this.projObj.ProjectCode
    });
    objEmailBody.push({
      key: '@@Val3@@',
      value: this.projObj.ClientLegalEntity
    });
    const poValue = this.poArray.filter(x => x.ID === rowData.poId);
    objEmailBody.push({
      key: '@@Val4@@',
      value: poValue[0].Number
    });
    objEmailBody.push({
      key: '@@Val5@@',
      value: this.datePipe.transform(rowData.date, 'MMM dd, yyyy')
    });
    objEmailBody.push({
      key: '@@Val6@@',
      value: rowData.currency + ' ' + rowData.amount
    });
    objEmailBody.push({
      key: '@@Val7@@',
      value: this.projObj.SOWCode
    });
    let arrayCC = [];
    let tempArray = [];
    tempArray = tempArray.concat(this.projObj.CMLevel1ID,
      this.projObj.CMLevel2ID);
    arrayCC = this.pmCommonService.getEmailId(tempArray);
    arrayCC.push(this.pmObject.currLoginInfo.Email);
    this.pmCommonService.getTemplate(this.constant.EMAIL_TEMPLATE_NAME.INVOICE_CONFIRM, objEmailBody,
      mailSubject, arrayTo, arrayCC);
    this.messageService.add({
      key: 'manageFinance', severity: 'success', summary: 'Success Message', sticky: true,
      detail: 'Invoice Line Items Confirmed Successfully'
    });
    setTimeout(() => {
      this.reInitializePopup();
    }, this.pmConstant.TIME_OUT);
  }
  editInvoiceItem(rowData) {
    this.invoiceHeader = 'Edit Invoice Line Item';
    console.log(rowData);
    this.invoiceObj = rowData;
    this.primaryPoc = [];
    const poc = this.pmObject.projectContactsItems.filter((obj) =>
      obj.ClientLegalEntity === this.projObj.ClientLegalEntity);
    if (poc && poc.length) {
      poc.forEach(element => {
        this.primaryPoc.push({ label: element.FullName, value: element.ID });
      });
    }
    this.addPOForm.get('poDate').setValue(rowData.date);
    this.addPOForm.get('primarypoc').setValue(rowData.poc);
    this.addPOForm.get('address').setValue(rowData.address);
    this.addPOForm.get('amount').setValue(rowData.amount);

    this.isInvoiceEdit = true;
    this.showAddInvoiceDetails = true;
  }
  async saveInvoiceEdit() {
    const date = this.addPOForm.get('poDate').value;
    const primaryPoc = this.addPOForm.get('primarypoc').value;
    const address = this.addPOForm.get('address').value;
    const data = {
      ScheduledDate: new Date(date),
      MainPOC: primaryPoc,
      AddressType: address
    };
    const result = await this.spServices.updateItem(this.constant.listNames.InvoiceLineItems.name,
      this.invoiceObj.Id, data, this.constant.listNames.InvoiceLineItems.type);
    this.messageService.add({
      key: 'manageFinance', severity: 'success', summary: 'Success Message', sticky: true,
      detail: 'Invoice Line Items updated Successfully'
    });
    setTimeout(() => {
      this.isInvoiceEdit = false;
      this.showAddInvoiceDetails = false;
      this.reInitializePopup();
    }, this.pmConstant.TIME_OUT);
  }
  async saveUpdatePO() {
    const returnObj = {
      pfObj: {},
      pbbObj: {}
    };
    this.updateInvoices = [];
    this.pmObject.isMainLoaderHidden = false;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    // Project Finance Breakup ==>  if data exist - update else create.
    const projectFinanceBreakArray = [];
    this.poData.forEach(poInfoObj => {
      const po = poInfoObj.poInfo[0];
      if (po.edited) {
        const projectFinanceBreakupData = this.getProjectFinanceBreakupData(po, this.projObj, poInfoObj);
        if (projectFinanceBreakupData.hasOwnProperty('Status')) {
          if (po.isExsitPO) {
            const projectFinaceBreakUpdate = Object.assign({}, options);
            projectFinaceBreakUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectFinanceBreakup.name, poInfoObj.Id);
            projectFinaceBreakUpdate.data = projectFinanceBreakupData;
            projectFinaceBreakUpdate.type = 'PATCH';
            projectFinaceBreakUpdate.listName = this.constant.listNames.ProjectFinanceBreakup.name;
            batchURL.push(projectFinaceBreakUpdate);
          } else {
            const projectFinaceBreakcreate = Object.assign({}, options);
            projectFinaceBreakcreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinanceBreakup.name, null);
            projectFinaceBreakcreate.data = projectFinanceBreakupData;
            projectFinaceBreakcreate.type = 'POST';
            projectFinaceBreakcreate.listName = this.constant.listNames.ProjectFinanceBreakup.name;
            batchURL.push(projectFinaceBreakcreate);
          }
          const pfbData = Object.assign({}, projectFinanceBreakupData);
          pfbData.POID = po.poId;
          projectFinanceBreakArray.push(pfbData);
        }
      }
    });

    // Project Finance Update.
    if (this.projObj.ProjectType !== this.pmConstant.PROJECT_TYPE.HOURLY.value) {

      // PO Update call
      if (projectFinanceBreakArray.length) {
        const poItemArray = this.getPOData(projectFinanceBreakArray, this.poArray);
        poItemArray.forEach(element => {
          const poItemCreate = Object.assign({}, options);
          poItemCreate.url = this.spServices.getItemURL(this.constant.listNames.PO.name, element.ID);
          poItemCreate.data = element;
          poItemCreate.type = 'PATCH';
          poItemCreate.listName = this.constant.listNames.PO.name;
          batchURL.push(poItemCreate);
        });
      }

      if (this.budgetData[0].edited || this.unassignedBudget[0].revenue !== 0) {
        const projectFinaceData = this.getProjectFinanceData(this.poData, this.budgetData, this.projObj);
        const currentBudget = this.existBudgetArray.retItems[0];
        if (projectFinaceData.RevenueBudget !== currentBudget.RevenueBudget
          || projectFinaceData.ScheduledRevenue !== currentBudget.ScheduledRevenue
          || projectFinaceData.InvoicedRevenue !== currentBudget.InvoicedRevenue
          || projectFinaceData.BudgetHrs !== currentBudget.BudgetHrs) {
          const projectFinaceUpdate = Object.assign({}, options);
          projectFinaceUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectFinances.name,
            this.existBudgetArray.retItems[0].ID);
          projectFinaceUpdate.data = projectFinaceData;
          projectFinaceUpdate.type = 'PATCH';
          projectFinaceUpdate.listName = this.constant.listNames.ProjectFinances.name;
          batchURL.push(projectFinaceUpdate);
          returnObj.pfObj = projectFinaceData;
          if (this.projectStatus === this.constant.projectStatus.InDiscussion) {
            const projectBudgetBreakupData = this.getProjectBudgetBreakupData(this.budgetData, this.projObj, false, true);
            const projectBudgetBreakupUpdate = Object.assign({}, options);
            projectBudgetBreakupUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectBudgetBreakup.name,
              this.existPBBBudgetArray.retItems[0].ID);
            projectBudgetBreakupUpdate.data = projectBudgetBreakupData;
            projectBudgetBreakupUpdate.type = 'PATCH';
            projectBudgetBreakupUpdate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
            batchURL.push(projectBudgetBreakupUpdate);
          } else {
            let budgetArr = [];
            if (this.unassignedBudget[0].revenue === 0) {
              const existingBudget = this.existBudgetArray.retItems[0];
              budgetArr = this.budgetData;
              budgetArr[0].budget_hours = budgetArr[0].budget_hours - existingBudget.BudgetHrs;
              if (existingBudget.RevenueBudget === budgetArr[0].revenue) {
                budgetArr[0].total = 0;
                budgetArr[0].revenue = 0;
                budgetArr[0].oop = 0;
                budgetArr[0].tax = 0;
              } else {
                budgetArr[0].total = budgetArr[0].total - existingBudget.Budget;
                budgetArr[0].revenue = budgetArr[0].revenue - existingBudget.RevenueBudget;
                budgetArr[0].oop = 0;
                budgetArr[0].tax = 0;
              }
            } else {
              budgetArr = this.unassignedBudget;
              budgetArr[0].total = 0 - budgetArr[0].total;
              budgetArr[0].revenue = 0 - budgetArr[0].revenue;
              budgetArr[0].oop = 0 - budgetArr[0].oop;
              budgetArr[0].tax = 0 - budgetArr[0].tax;
              budgetArr[0].reason = this.selectedReason;
              budgetArr[0].reasonType = this.selectedReasonType;
              budgetArr[0].budget_hours = this.newBudgetHrs - this.budgetData[0].budget_hours;
            }

            if (budgetArr[0].revenue !== 0 || budgetArr[0].budget_hours !== 0) {
              const projectBudgetBreakupData = this.getProjectBudgetBreakupData(budgetArr,
                this.projObj, true, budgetArr[0].revenue < 0 ? true : false);
              const projectBudgetBreakupCreate = Object.assign({}, options);
              projectBudgetBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectBudgetBreakup.name, null);
              projectBudgetBreakupCreate.data = projectBudgetBreakupData;
              projectBudgetBreakupCreate.type = 'POST';
              projectBudgetBreakupCreate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
              batchURL.push(projectBudgetBreakupCreate);
              returnObj.pbbObj = projectBudgetBreakupData;
            }

          }
          // SOW update
          const sowObj = this.sowObj;
          const sowUpdateData = this.getSOWData(this.projObj, projectFinaceData);
          if (sowUpdateData.hasOwnProperty('TotalLinked')) {
            const sowUpdate = Object.assign({}, options);
            sowUpdate.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, sowObj.ID);
            sowUpdate.data = sowUpdateData;
            sowUpdate.type = 'PATCH';
            sowUpdate.listName = this.constant.listNames.SOW.name;
            batchURL.push(sowUpdate);
          }
        }
      }

      // Invoice Item creation and updation
      const CSIdArray = [];
      this.projObj.CMLevel1ID.forEach(cm => {
        CSIdArray.push(cm.ID);
      });
      CSIdArray.push(this.projObj.CMLevel2ID);
      this.poData.forEach(poInfoObj => {
        poInfoObj.poInfoData.forEach(element => {
          if (element.edited) {
            const invoiceData = this.getInvoiceItemData(element, this.projObj, CSIdArray);
            if (element.isExsitInv) {
              const invoiceUpdate = Object.assign({}, options);
              invoiceUpdate.url = this.spServices.getItemURL(this.constant.listNames.InvoiceLineItems.name, element.Id);
              invoiceUpdate.data = invoiceData;
              invoiceUpdate.type = 'PATCH';
              invoiceUpdate.listName = this.constant.listNames.InvoiceLineItems.name;
              batchURL.push(invoiceUpdate);
            } else {
              const invoicecreate = Object.assign({}, options);
              invoicecreate.url = this.spServices.getReadURL(this.constant.listNames.InvoiceLineItems.name, null);
              invoicecreate.data = invoiceData;
              invoicecreate.type = 'POST';
              invoicecreate.listName = this.constant.listNames.InvoiceLineItems.name;
              batchURL.push(invoicecreate);
            }
          }

        });
      });
      if (this.updateInvoices && this.updateInvoices.length) {
        this.updateInvoices.forEach(element => {
          const invoicecreate = Object.assign({}, options);
          invoicecreate.url = this.spServices.getItemURL(this.constant.listNames.Invoices.name, element.ID);
          invoicecreate.data = element;
          invoicecreate.type = 'PATCH';
          invoicecreate.listName = this.constant.listNames.Invoices.name;
          batchURL.push(invoicecreate);
        });
      }
    }

    console.log(batchURL);
    if (batchURL.length) {
      const res = await this.spServices.executeBatch(batchURL);
    }

    this.pmObject.isMainLoaderHidden = true;
    this.messageService.add({
      key: 'manageFinance', severity: 'success', summary: 'Success Message', sticky: true,
      detail: 'Budget Updated Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode
    });
    setTimeout(() => {
      this.dynamicDialogRef.close();
    }, this.pmConstant.TIME_OUT);

    return returnObj;
  }
  /**
   * This method is used to get Project Finances Update data
   * @param poArray pass the poArray as parameter
   * @param budgetArray pass the budgetArray as parameter
   * @param projObj pass the current project object.
   */
  getProjectFinanceData(poArray, budgetArray, projObj) {
    let invoiceSc = 0;
    let scRevenue = 0;
    let scOOP = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    let invoiceOOP = 0;
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice = invoice + element.amount;
          if (element.type === 'revenue') {
            invoiceRevenue = invoiceRevenue + element.amount;
          } else {
            invoiceOOP = invoiceOOP + element.amount;
          }

        } else if (element.status !== this.constant.STATUS.DELETED) {
          invoiceSc = invoiceSc + element.amount;
          if (element.type === 'revenue') {
            scRevenue = scRevenue + element.amount;
          } else {
            scOOP = scOOP + element.amount;
          }
        }

      });
    });
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinances.type },
      BudgetHrs: budgetArray[0].budget_hours
    };
    if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      data.Budget = budgetArray[0].Rate;
      data.OOPBudget = 0;
      data.RevenueBudget = 0;
      data.TaxBudget = 0;
      data.InvoicesScheduled = 0;
      data.ScheduledOOP = 0;
      data.ScheduledRevenue = 0;
      data.Invoiced = 0;
      data.InvoicedRevenue = 0;
      data.InvoicedOOP = 0;

    } else {
      data.Budget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.RevenueBudget = budgetArray[0].revenue;
      data.TaxBudget = budgetArray[0].tax;
      data.InvoicesScheduled = invoiceSc;
      data.ScheduledRevenue = scRevenue;
      data.ScheduledOOP = scOOP;
      data.Invoiced = invoice;
      data.InvoicedRevenue = invoiceRevenue;
      data.InvoicedOOP = invoiceOOP;
    }
    return data;
  }

  /**
   * This method is used to get the ProjectFinance Data
   * @param po pass the po
   * @param projObj pass the current project object as parameter.
   * @param poInfoObj pass the poInvoice object.
   */
  getProjectFinanceBreakupData(po, projObj, poInfoObj) {
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinanceBreakup.type },
    };
    data.ID = 0;
    let totalScheduled = 0;
    let scRevenue = 0;
    let scOOP = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    let invoiceOOP = 0;
    poInfoObj.poInfoData.forEach(element => {
      if (element.status === this.constant.STATUS.APPROVED) {
        invoice = invoice + element.amount;
        if (element.type === 'revenue') {
          invoiceRevenue = invoiceRevenue + element.amount;
        } else {
          invoiceOOP = invoiceOOP + element.amount;
        }

      } else if (element.status !== this.constant.STATUS.DELETED) {
        totalScheduled = totalScheduled + element.amount;
        if (element.type === 'revenue') {
          scRevenue = scRevenue + element.amount;
        } else {
          scOOP = scOOP + element.amount;
        }
      }

    });
    data.POLookup = po.status === 'Deleted' ? null : po.poId;
    if (po.isExsitPO) {
      data.ID = poInfoObj.Id;
      data.Status = po.status === 'Not Saved' ? 'Active' : po.status;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = 0;
        data.ScheduledRevenue = 0;
        data.ScheduledOOP = 0;
        data.TotalInvoiced = 0;
        data.InvoicedRevenue = 0;
        data.InvoicedOOP = 0;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      }
      return data;
    } else {
      data.ProjectNumber = projObj.ProjectCode;
      data.Status = po.status === 'Not Saved' ? 'Active' : po.status;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      }
      return data;
    }
  }
  /**
   * This method is used to get Project budget breakup object.
   * @param budgetArray passed as budget array as paramaeter.
   * @param projObj the projObj as parameter.
   * @param isCreate pass true if it create or else false
   */
  getProjectBudgetBreakupData(budgetArray, projObj, isCreate, approvalStatus) {
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectBudgetBreakup.type },
    };
    data.Reason = budgetArray[0].reasonType;
    data.Comments = budgetArray[0].reason;
    if (isCreate) {
      data.ProjectCode = projObj.ProjectCode;
      data.ProjectLookup = projObj.ID;
      if (approvalStatus) {
        data.Status = this.constant.STATUS.APPROVAL_PENDING;
      } else {
        data.Status = this.constant.STATUS.APPROVED;
        data.ApprovalDate = new Date();
      }

      data.BudgetHours = budgetArray[0].budget_hours;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
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
    } else {
      data.BudgetHours = budgetArray[0].budget_hours;

      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
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
    }
    return data;
  }

  /**
   * The method is used to get SOW object.
   * @param projObj the project object as parameter.
   * @param projectfinaceObj pass project finance object as parameter.
   */
  getSOWData(projObj, projectfinaceObj) {
    const sowObj = this.sowObj;
    let data = {};
    if (sowObj) {
      if (projectfinaceObj.RevenueBudget !== this.existBudgetArray.retItems[0].RevenueBudget
        || projectfinaceObj.ScheduledRevenue !== this.existBudgetArray.retItems[0].ScheduledRevenue
        || projectfinaceObj.InvoicedRevenue !== this.existBudgetArray.retItems[0].InvoicedRevenue) {
        data = {
          __metadata: { type: this.constant.listNames.SOW.type },
          TotalLinked: sowObj.TotalLinked + projectfinaceObj.Budget - this.existBudgetArray.retItems[0].Budget,
          RevenueLinked: sowObj.RevenueLinked + projectfinaceObj.RevenueBudget - this.existBudgetArray.retItems[0].RevenueBudget,
          OOPLinked: sowObj.OOPLinked + projectfinaceObj.OOPBudget - this.existBudgetArray.retItems[0].OOPBudget,
          TaxLinked: sowObj.TaxLinked + projectfinaceObj.TaxBudget - this.existBudgetArray.retItems[0].TaxBudget,
          TotalScheduled: sowObj.TotalScheduled + projectfinaceObj.InvoicesScheduled - this.existBudgetArray.retItems[0].InvoicesScheduled,
          ScheduledRevenue: sowObj.ScheduledRevenue + projectfinaceObj.ScheduledRevenue -
            this.existBudgetArray.retItems[0].ScheduledRevenue,
          TotalInvoiced: sowObj.TotalInvoiced + projectfinaceObj.Invoiced - this.existBudgetArray.retItems[0].Invoiced,
          InvoicedRevenue: sowObj.InvoicedRevenue + projectfinaceObj.InvoicedRevenue - this.existBudgetArray.retItems[0].InvoicedRevenue,
        };
      }

    }
    return data;
  }

  /**
   * This method is used to get PO object.
   * @param financeBreakupArray pass the project finance breakup array as parameter.
   * @param poArray pass the po array as parameter.
   */
  getPOData(financeBreakupArray, poArray) {
    const porray = [];
    const poExistingItems = this.existPOArray.retItems;
    financeBreakupArray.forEach(element => {
      const poItem = poArray.filter(poObj => poObj.Id === (element.POLookup ? element.POLookup : element.POID));
      const poExistItem = poExistingItems.find(poObj => poObj.ID === element.ID);
      if (poItem && poItem.length) {
        const data = {
          __metadata: { type: this.constant.listNames.PO.type },
          TotalLinked: poItem[0].TotalLinked + element.Amount - (poExistItem ? poExistItem.Amount ? poExistItem.Amount : 0 : 0),
          RevenueLinked: poItem[0].RevenueLinked + element.AmountRevenue -
            (poExistItem ? poExistItem.AmountRevenue ? poExistItem.AmountRevenue : 0 : 0),
          OOPLinked: poItem[0].OOPLinked + element.AmountOOP - (poExistItem ? poExistItem.AmountOOP ? poExistItem.AmountOOP : 0 : 0),
          TaxLinked: poItem[0].TaxLinked + element.AmountTax - (poExistItem ? poExistItem.AmountTax ? poExistItem.AmountTax : 0 : 0),
          TotalScheduled: poItem[0].TotalScheduled + element.TotalScheduled -
            (poExistItem ? poExistItem.TotalScheduled ? poExistItem.TotalScheduled : 0 : 0),
          ScheduledRevenue: poItem[0].ScheduledRevenue + element.ScheduledRevenue -
            (poExistItem ? poExistItem.ScheduledRevenue ? poExistItem.ScheduledRevenue : 0 : 0),
          ID: element.POLookup ? element.POLookup : element.POID
        };
        porray.push(data);
      }
    });
    return porray;
  }

  /**
   * This method is used to the invoice item as object
   * @param poInvItem pass the poInvoice Item as object.
   * @param projObj pass projObject as parameter
   * @param CSIdArray pass the CSIdArray as an parameter.
   */
  getInvoiceItemData(poInvItem, projObj, CSIdArray) {
    const element = poInvItem;
    if (element.edited && (element.status !== 'Deleted' || (element.status === 'Deleted' && element.Id !== 0))) {
      if (element.isExsitInv) {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          ScheduledDate: element.date,
          Amount: element.amount,
          MainPOC: element.poc,
          AddressType: element.address,
          Status: element.amount === 0 ? 'Deleted' : element.status,
          PO: element.amount === 0 ? null : element.poId,
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
        }
        return data;
      } else {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          Title: projObj.ProjectCode,
          ScheduledDate: element.date,
          Amount: element.amount,
          Currency: this.existBudgetArray.retItems[0].Currency,
          PO: element.amount === 0 ? null : element.poId,
          Status: element.amount === 0 ? 'Deleted' : (element.status === 'Not Saved' ? 'Scheduled' : element.status),
          ScheduleType: element.type,
          MainPOC: element.poc,
          AddressType: element.address,
          Template: this.existBudgetArray.retItems[0].Template,
          SOWCode: projObj.SOWCode,
          CSId: {
            results: CSIdArray
          },
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
          const invoice = this.arrAdvanceInvoices.find(e => e.ID === element.invoiceLookup);
          const tagAmount = invoice.TaggedAmount ? invoice.TaggedAmount + element.amount : element.amount;
          const dataInv: any = {
            __metadata: { type: this.constant.listNames.Invoices.type },
            ID: invoice.ID,
            TaggedAmount: tagAmount,
            IsTaggedFully: invoice.Amount === tagAmount ? 'Yes' : 'No'
          };
          this.updateInvoices.push(dataInv);
        }
        return data;
      }
    }

  }
}
