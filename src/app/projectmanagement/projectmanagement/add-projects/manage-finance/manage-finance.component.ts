import { Component, OnInit, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { DatePipe } from '@angular/common';
import { ConfirmationService, DynamicDialogConfig, MessageService, DynamicDialogRef } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
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
  existPOArray: any = [];
  existPOInvoiceArray: any = [];
  existPODataArray: any = [];
  isBudgetHoursDisabled = true;
  sowNumber = '';
  budgetData = [];
  budgetObj = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    budget_hours: 0
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
    isExsitPO: false
  };
  poInfoData = [];
  poAddObj = {
    poId: 0,
    inv_number: '',
    prf_number: '',
    date: new Date(),
    amount: 0,
    type: '',
    status: '',
    poc: '',
    address: '',
    isExsitInv: false
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
  totalHrs = 0;
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
  isPoOOPDisabled = false;
  isPoTaxDisabled = false;
  savePOArray = [];
  index;
  selectedOverNightRequest = 'No';
  isHourlyRateDisabled = false;
  isHourlyOverNightDisabled = false;
  isAddRateButtonHidden = false;
  projObj;
  isPOEdit = false;
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
    private messageService: MessageService
  ) {
    this.addPOForm = frmbuilder.group({
      poDate: ['', Validators.required],
      amount: ['', Validators.required],
      primarypoc: ['', Validators.required],
      address: ['', Validators.required]
    });
  }
  ngOnInit() {
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
      this.pmObject.isMainLoaderHidden = false;
      setTimeout(() => {
        this.projObj = this.config.data.projectObj;
        this.isPOEdit = true;
        // this.setBudget();
        this.editManageFinances(this.projObj);
      }, 500);
    } else {
      this.isPOEdit = false;
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
    // Get Billing Entity  ##0;
    const billingEntityGet = Object.assign({}, options);
    const billingEntityFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_OOP);
    billingEntityFilter.filter = billingEntityFilter.filter.replace(/{{projectCode}}/gi,
      projectCode).replace(/{{status}}/gi, 'Billed');
    billingEntityGet.url = this.spServices.getReadURL(this.constant.listNames.SpendingInfo.name,
      billingEntityFilter);
    billingEntityGet.type = 'GET';
    billingEntityGet.listName = this.constant.listNames.SpendingInfo.name;
    batchURL.push(billingEntityGet);
    // Get Po ##1
    const poGet = Object.assign({}, options);
    const poFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_PO);
    poFilter.filter = poFilter.filter.replace(/{{clientLegalEntity}}/gi,
      clientLegalEntity);
    poGet.url = this.spServices.getReadURL(this.constant.listNames.PO.name,
      poFilter);
    poGet.type = 'GET';
    poGet.listName = this.constant.listNames.PO.name;
    batchURL.push(poGet);
    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults && arrResults.length) {
      const tempbudgetObject = $.extend(true, {}, this.budgetObj);
      const oopResult = arrResults[0].retItems;
      if (oopResult && oopResult.length) {
        // set the OOP value and budget value.
        tempbudgetObject.total = 0;
        tempbudgetObject.oop = 0;
        tempbudgetObject.revenue = 0;
        tempbudgetObject.tax = 0;
        tempbudgetObject.budget_hours = 0;
      }
      const unfilteredPOArray = arrResults[1].retItems;
      this.poArray = unfilteredPOArray.filter(x => x.Currency === currency);
      if (this.poArray && this.poArray) {
        this.poArray.forEach((element) => {
          this.poList.push({ label: element.Number + '-' + element.Name, value: element.ID });
        });
      }
    }
  }
  /**
   * This method is used to set the default value for all the budget value.
   */
  async setBudget() {
    const arrResult = await this.getInitData(this.pmObject.addProject.ProjectAttributes.ProjectCode,
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
    if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
      this.showHourly = true;
      this.isrevenueFieldDisabled = true;
      this.isAddBudgetButtonHidden = true;
      this.isPoOOPDisabled = true;
      this.isPoTaxDisabled = true;
      this.isPoRevenueDisabled = true;
    } else {
      this.showHourly = false;
      this.isrevenueFieldDisabled = false;
      this.isAddBudgetButtonHidden = false;
      this.isPoOOPDisabled = false;
      this.isPoTaxDisabled = false;
      this.isPoRevenueDisabled = false;
    }
    this.pmObject.addProject.FinanceManagement.OverNightRequest = this.selectedOverNightRequest;
    this.budgetData.push(this.budgetObj);
    this.unassignedBudget.push(this.unassignedBudgetobj);
  }
  /**
   * This method is used to add the budget to project.
   */
  addBudgetToProject() {
    if (this.budgetHours && this.totalHrs) {
      this.error = false;
      this.errorMsg = '';
      this.budgetData = [];
      this.unassignedBudget = [];
      const tempbudgetObject = $.extend(true, {}, this.budgetObj);
      if (this.existBudgetArray.retItems && this.existBudgetArray.retItems.length) {
        tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
        tempbudgetObject.budget_hours = this.budgetHours + this.existBudgetArray.retItems[0].BudgetHrs;
        tempbudgetObject.revenue = this.totalHrs + this.existBudgetArray.retItems[0].RevenueBudget;
        tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
        tempbudgetObject.total = this.totalHrs + + this.existBudgetArray.retItems[0].Budget;
      } else {
        tempbudgetObject.oop = 0;
        tempbudgetObject.budget_hours = this.budgetHours;
        tempbudgetObject.revenue = this.totalHrs;
        tempbudgetObject.tax = 0;
        tempbudgetObject.total = this.totalHrs;
      }
      this.budgetData.push(tempbudgetObject);
      // add to assigned object.
      const unassignedObj = $.extend(true, {}, this.unassignedBudget);
      if (this.existBudgetArray && this.existBudgetArray.length) {
        unassignedObj.total = this.totalHrs + this.existBudgetArray.retItems[0].Budget;
        unassignedObj.revenue = this.totalHrs + this.existBudgetArray.retItems[0].RevenueBudget;
        unassignedObj.oop = tempbudgetObject.oop;
        unassignedObj.tax = 0;
      } else {
        unassignedObj.total = this.totalHrs;
        unassignedObj.revenue = this.totalHrs;
        unassignedObj.oop = tempbudgetObject.oop;
        unassignedObj.tax = 0;
      }
      this.unassignedBudget.push(unassignedObj);
      this.isAddBudgetButtonHidden = true;
      this.isrevenueFieldDisabled = true;
      this.totalHrs = 0;
      this.budgetHours = 0;
    } else {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGET;
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
        if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
          tempPOObj.showAdd = false;
          this.showSave = true;
        } else {
          tempPOObj.showAdd = true;
        }
        tempPOObj.showDelete = true;
        tempPOObj.scValue = 'Sheduled + Invoiced';
        tempPOObj.scTotal = 0;
        tempPOObj.scRevenue = 0;
        tempPOObj.scOOP = 0;
        tempPOObj.scTax = 0;
        tempPOObj.isExsitPO = false;
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        tempObj.Id = tempPOObj.poId;
        tempObj.poInfo.push(tempPOObj);
        if (this.existPOArray.retItems && this.existPOArray.retItems.length) {
          this.poData.unshift(tempObj);
        } else {
          this.poData.push(tempObj);
        }
        const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.selectedPo);
        const retPOInfo = this.poData[poIndex].poInfo[0];
        if (this.budgetData && this.budgetData.length && this.unassignedBudget && this.unassignedBudget.length
          && this.budgetData[0].total === this.unassignedBudget[0].total) {
          retPOInfo.poRevenue = this.budgetData[0].total;
          retPOInfo.poTotal = this.budgetData[0].total;
        } else {
          retPOInfo.poRevenue = this.unassignedBudget[0].total;
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
    if (retPOInfo.poRevenue) {
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
      this.poHeader.oop = this.poHeader.oop + retPOInfo.tax;
    }
    retPOInfo.poRevenue = 0;
    retPOInfo.poTotal = 0;
    retPOInfo.showInvoice = true;
    this.error = false;
    if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].total === 0) {
      this.poData.forEach(element => {
        element.poInfo[0].showAdd = false;
      });
      this.isPoRevenueDisabled = true;
      this.isPoOOPDisabled = true;
      this.isPoTaxDisabled = true;
      this.isAddToProjectHidden = true;
    } else {
      retPOInfo.showAdd = true;
      retPOInfo.showDelete = retPOInfo.isExsitPO ? false : true;
      this.isPoRevenueDisabled = false;
      this.isPoOOPDisabled = false;
      this.isPoTaxDisabled = false;
      this.isAddToProjectHidden = false;
    }
    this.selectedPo = '';
  }
  /**
   * This method is called when schedule invoice will trigger.
   */
  scheduleInvoice(poValue) {
    this.selectedPo = poValue.poInfo[0].poId;
    const clientLegalEntity = this.isPOEdit ? this.config.data.projectObj.ClientLegalEntity
      : this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    this.primaryPoc = [];
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
    const poIndex = this.poData.findIndex(item => item.poInfo[0].poId === this.selectedPo);
    const retPOInfo = this.poData[poIndex].poInfo[0];
    this.addInvoiceError = false;
    if (this.addPOForm.valid) {
      const tempPOObj = $.extend(true, {}, this.poAddObj);
      tempPOObj.poId = retPOInfo.poId;
      tempPOObj.inv_number = '';
      tempPOObj.prf_number = '';
      tempPOObj.date = new Date(this.datePipe.transform(this.addPOForm.value.poDate, 'MMM d, y'));
      tempPOObj.amount = this.addPOForm.value.amount;
      tempPOObj.type = 'revenue';
      tempPOObj.status = this.constant.STATUS.NOT_STARTED;
      tempPOObj.poc = this.addPOForm.value.primarypoc;
      tempPOObj.address = this.addPOForm.value.address;
      tempPOObj.isExsitInv = false;
      if (tempPOObj.amount > retPOInfo.total) {
        this.addInvoiceError = true;
        this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_GREATER;
      } else {
        retPOInfo.scTotal = retPOInfo.scTotal + this.addPOForm.value.amount;
        retPOInfo.scRevenue = retPOInfo.scRevenue + this.addPOForm.value.amount;
        retPOInfo.scOOP = retPOInfo.scOOP + 0;
        retPOInfo.scTax = retPOInfo.scTax + 0;
        this.poData[poIndex].poInfoData.push(tempPOObj);
        this.showAddInvoiceDetails = false;
        if (retPOInfo.total === retPOInfo.scTotal) {
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
    if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].total === 0) {
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
        const arrayIndex = this.poData.findIndex(x => x.Id === this.selectedPo);
        this.poData.splice(arrayIndex, 1);
        this.isAddToProjectHidden = false;
        this.unassignedBudget[0].total = this.unassignedBudget[0].total + poObj.poInfo[0].total;
        this.unassignedBudget[0].revenue = this.unassignedBudget[0].revenue + poObj.poInfo[0].total;
        this.unassignedBudget[0].oop = this.unassignedBudget[0].oop + poObj.poInfo[0].oop;
        this.unassignedBudget[0].tax = this.unassignedBudget[0].tax + poObj.poInfo[0].tax;
        // PO Header//
        this.poHeader.total = this.poHeader.total - poObj.poInfo[0].total;
        this.poHeader.revenue = this.poHeader.revenue - poObj.poInfo[0].total;
        this.poHeader.tax = this.poHeader.tax - poObj.poInfo[0].oop;
        this.poHeader.oop = this.poHeader.oop - poObj.poInfo[0].oop;
        if (this.unassignedBudget && this.unassignedBudget.length && this.unassignedBudget[0].total === 0) {
          this.isPoRevenueDisabled = true;
        } else {
          this.isPoRevenueDisabled = false;
        }
      }
    });
  }
  /***
   * This method is used to save the PO.
   */
  savePo() {
    this.savePOArray.push({ budget: this.budgetData, PO: this.poData });
    // store value into global variable.
    this.pmObject.addProject.FinanceManagement.POListArray = this.poArray;
    this.pmObject.addProject.FinanceManagement.POArray = this.poData;
    this.pmObject.addProject.FinanceManagement.BudgetArray = this.budgetData;
    this.pmObject.addProject.FinanceManagement.UnassignedArray = this.unassignedBudget;
    this.budgetOutputData.emit(this.savePOArray);
  }
  /**
   * This method is used to extract the POC Name from pocId's
   * @param ids please provide the array of poc id's
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
  async editManageFinances(projObj) {
    this.poData = [];
    this.isBudgetHoursDisabled = false;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
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
    const result = await this.spServices.executeBatch(batchURL);
    this.budgetData = [];
    this.unassignedBudget = [];
    const unassignedObj = $.extend(true, {}, this.unassignedBudget);
    this.unassignedBudget.push(unassignedObj);
    if (result && result.length) {
      this.existBudgetArray = result[0];
      this.existPOArray = result[1];
      this.existPOInvoiceArray = result[2];
      const arrResult = await this.getInitData(projObj.ProjectCode, projObj.ClientLegalEntity,
        this.existBudgetArray.retItems[0].Currency);
      const tempbudgetObject = $.extend(true, {}, this.budgetObj);
      tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
      tempbudgetObject.budget_hours = projObj.StandardBudgetHrs;
      this.budgetHours = 0;
      tempbudgetObject.revenue = this.existBudgetArray.retItems[0].RevenueBudget;
      tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
      tempbudgetObject.total = this.existBudgetArray.retItems[0].Budget;
      this.budgetData.push(tempbudgetObject);
      // add value to Po header.
      this.poHeader.total = this.existBudgetArray.retItems[0].Budget;
      this.poHeader.revenue = this.existBudgetArray.retItems[0].RevenueBudget;
      this.poHeader.tax = this.existBudgetArray.retItems[0].TaxBudget;
      this.poHeader.oop = this.existBudgetArray.retItems[0].OOPBudget;
      // add appropriate value for unassigned project.
      this.existPOArray.retItems.forEach((poItem, index) => {
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
        if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
          tempPOObj.showAdd = false;
        } else {
          tempPOObj.showAdd = true;
        }
        tempPOObj.showDelete = false;
        tempPOObj.scValue = 'Sheduled + Invoiced';
        tempPOObj.scTotal = poItem.TotalScheduled;
        tempPOObj.scRevenue = poItem.ScheduledRevenue;
        tempPOObj.scOOP = poItem.ScheduledOOP ? poItem.ScheduledOOP : 0;
        tempPOObj.scTax = 0;
        tempPOObj.isExsitPO = true;
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        tempObj.Id = poItem.POLookup;
        tempObj.poInfo.push(tempPOObj);
        this.poData.push(tempObj);
        const inoviceItems = this.existPOInvoiceArray.retItems.filter(x => x.PO === poItem.POLookup);
        inoviceItems.forEach(invoiceItem => {
          const invoiceObj = $.extend(true, {}, this.poAddObj);
          invoiceObj.poId = invoiceItem.PO;
          invoiceObj.inv_number = '';
          invoiceObj.prf_number = '';
          invoiceObj.date = new Date(this.datePipe.transform(invoiceItem.ScheduledDate, 'MMM d, y'));
          invoiceObj.amount = invoiceItem.Amount;
          invoiceObj.type = invoiceItem.ScheduleType;
          invoiceObj.status = invoiceItem.Status;
          invoiceObj.poc = invoiceItem.MainPOC;
          invoiceObj.address = invoiceItem.AddressType;
          invoiceObj.isExsitInv = true;
          this.poData[index].poInfoData.push(invoiceObj);
        });
      });
      this.existPODataArray = this.poData;
      this.showPo = true;
      this.pmObject.isMainLoaderHidden = true;
    }
  }
  async saveUpdatePO() {
    // this.pmObject.addProject.FinanceManagement.POListArray = this.poArray;
    // this.pmObject.addProject.FinanceManagement.POArray = this.poData;
    // this.pmObject.addProject.FinanceManagement.BudgetArray = this.budgetData;
    // this.pmObject.addProject.FinanceManagement.UnassignedArray = this.unassignedBudget;
    this.pmObject.isMainLoaderHidden = false;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Project Finance Update.
    const projectFinaceData = this.getProjectFinanceData(this.poData, this.budgetData, this.projObj);
    const projectFinaceUpdate = Object.assign({}, options);
    projectFinaceUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectFinances.name,
      this.existBudgetArray.retItems[0].ID);
    projectFinaceUpdate.data = projectFinaceData;
    projectFinaceUpdate.type = 'PATCH';
    projectFinaceUpdate.listName = this.constant.listNames.ProjectFinances.name;
    batchURL.push(projectFinaceUpdate);
    // Project Finance Breakup ==>  if data exist - update else create.
    const projectFinanceBreakArray = [];
    this.poData.forEach(poInfoObj => {
      const po = poInfoObj.poInfo[0];
      const projectFinanceBreakupData = this.getProjectFinanceBreakupData(po, this.projObj, poInfoObj);
      if (po.isExsitPO) {
        const projectFinaceBreakUpdate = Object.assign({}, options);
        projectFinaceBreakUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectFinanceBreakup.name, po.poId);
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
      projectFinanceBreakArray.push(projectFinanceBreakupData);
    });
    if (this.projObj.Status === this.constant.projectStatus.InDiscussion) {
      // Project Finance Update.
      // Project Finance Breakup existing - update & new to create.
      // Project Budget Breakup Update.
      // SOW Update - update
      // PO Update
      // Invoice existing  - update else create
      const projectBudgetBreakupData = this.getProjectBudgetBreakupData(this.budgetData, this.projObj, false);
      const projectBudgetBreakupUpdate = Object.assign({}, options);
      projectBudgetBreakupUpdate.url = this.spServices.getItemURL(this.constant.listNames.ProjectBudgetBreakup.name, this.projObj.ID);
      projectBudgetBreakupUpdate.data = projectBudgetBreakupData;
      projectBudgetBreakupUpdate.type = 'PATCH';
      projectBudgetBreakupUpdate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
      batchURL.push(projectBudgetBreakupUpdate);
    } else {
      // Project Finance update.
      // Project Finance Breakup existing - update & new to create.
      // Project Budget Breakup insert.
      // SOW Update - update
      // PO Update
      // Invoice existing  - update else create
      const projectBudgetBreakupData = this.getProjectBudgetBreakupData(this.budgetData, this.projObj, true);
      const projectBudgetBreakupCreate = Object.assign({}, options);
      projectBudgetBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectBudgetBreakup.name, null);
      projectBudgetBreakupCreate.data = projectBudgetBreakupData;
      projectBudgetBreakupCreate.type = 'POST';
      projectBudgetBreakupCreate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
      batchURL.push(projectBudgetBreakupCreate);
    }
    // SOW update
    const sowObj = this.pmObject.allSOWItems.filter(x => x.SOWCode === this.projObj.SOWCode);
    const sowUpdateData = this.getSOWData(this.projObj, projectFinaceData);
    const sowUpdate = Object.assign({}, options);
    sowUpdate.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, sowObj[0].ID);
    sowUpdate.data = sowUpdateData;
    sowUpdate.type = 'PATCH';
    sowUpdate.listName = this.constant.listNames.SOW.name;
    batchURL.push(sowUpdate);
    // PO Update call
    const poItemArray = this.getPOData(projectFinanceBreakArray, this.poArray);
    poItemArray.forEach(element => {
      const poItemCreate = Object.assign({}, options);
      poItemCreate.url = this.spServices.getItemURL(this.constant.listNames.PO.name, element.ID);
      poItemCreate.data = element;
      poItemCreate.type = 'PATCH';
      poItemCreate.listName = this.constant.listNames.PO.name;
      batchURL.push(poItemCreate);
    });
    // Invoice Item creation and updation
    const CSIdArray = [];
    this.projObj.CMLevel1ID.forEach(cm => {
      CSIdArray.push(cm.ID);
    });
    CSIdArray.push(this.projObj.CMLevel2ID);
    const billingEntitys = this.pmObject.oProjectCreation.oProjectInfo.billingEntity;
    const clientObj = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
      x.Title === this.projObj.ClientLegalEntity);
    const billingEntity = billingEntitys.filter(x => x.Title === this.projObj.BillingEntity);
    this.poData.forEach(poInfoObj => {
      poInfoObj.poInfoData.forEach(element => {
        const invoiceData = this.getInvoiceItemData(element, this.projObj, clientObj, billingEntity, CSIdArray);
        if (element.isExsitInv) {
          const invoiceUpdate = Object.assign({}, options);
          invoiceUpdate.url = this.spServices.getItemURL(this.constant.listNames.InvoiceLineItems.name, element.poId);
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
      });
    });
    console.log(batchURL);
    await this.spServices.executeBatch(batchURL);
    this.pmObject.isMainLoaderHidden = true;
    this.messageService.add({
      key: 'custom', severity: 'success', summary: 'Success Message',
      detail: 'Budget Updated Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode
    });
    setTimeout(() => {
      this.dynamicDialogRef.close();
    }, 500);
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
    let invoice = 0;
    let invoiceRevenue = 0;
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_STARTED) {
          invoiceSc = element.amount;
          scRevenue = element.amount;
        }
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice = element.amount;
          invoiceRevenue = element.amount;
        }
      });
    });
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinances.type },
      BudgetHrs: budgetArray[0].budget_hours
    };
    if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
      data.Budget = budgetArray[0].Rate;
      data.OOPBudget = 0;
      data.RevenueBudget = 0,
        data.TaxBudget = 0;
      data.InvoicesScheduled = 0;
      data.ScheduledRevenue = 0;
      data.Invoiced = 0;
      data.InvoicedRevenue = 0;
    } else {
      data.Budget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.RevenueBudget = budgetArray[0].revenue,
        data.TaxBudget = budgetArray[0].tax;
      data.InvoicesScheduled = invoiceSc;
      data.ScheduledRevenue = scRevenue;
      data.Invoiced = invoice;
      data.InvoicedRevenue = invoiceRevenue;
    }
    return data;
  }
  getProjectFinanceBreakupData1(poArray, projObj) {
    const pfbArray = [];
    poArray.forEach((poInfoObj) => {
      let totalScheduled = 0;
      let scRevenue = 0;
      let invoice = 0;
      let invoiceRevenue = 0;
      const po = poInfoObj.poInfo[0];
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_STARTED) {
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
      };
      if (po.isExsitPO) {
        data.ProjectNumber = projObj.ProjectCode;
        data.POLookup = po.poId;
        if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
      } else {
        if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
      }
    });
    return pfbArray;
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
    let totalScheduled = 0;
    let scRevenue = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    poInfoObj.poInfoData.forEach(element => {
      if (element.status === this.constant.STATUS.NOT_STARTED) {
        totalScheduled += element.amount;
        scRevenue += element.amount;
      }
      if (element.status === this.constant.STATUS.APPROVED) {
        invoice += element.amount;
        invoiceRevenue += element.amount;
      }
    });
    if (po.isExsitPO) {
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
        data.POLookup = po.poId;
      }
      return data;
    } else {
      data.ProjectNumber = projObj.ProjectCode;
      data.POLookup = po.poId;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
      return data;
    }
  }
  /**
   * This method is used to get Project budget breakup object.
   * @param budgetArray passed as budget array as paramaeter.
   * @param projObj the projObj as parameter.
   * @param isCreate pass true if it create or else false
   */
  getProjectBudgetBreakupData(budgetArray, projObj, isCreate) {
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectBudgetBreakup.type },
    };
    if (isCreate) {
      data.ProjectCode = projObj.ProjectCode;
      data.ProjectLookup = projObj.ID;
      data.Status = this.constant.STATUS.APPROVAL_PENDING;
      data.BudgetHours = budgetArray[0].budget_hours;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY) {
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
    const sowCode = projObj.SOWCode;
    let sowObj = this.pmObject.allSOWItems.filter(x => x.SOWCode === sowCode);
    if (sowObj && sowObj.length) {
      sowObj = sowObj[0];
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
  }
  /**
   * This method is used to get PO object.
   * @param financeBreakupArray pass the project finance breakup array as parameter.
   * @param poArray pass the po array as parameter.
   */
  getPOData(financeBreakupArray, poArray) {
    const porray = [];
    financeBreakupArray.forEach(element => {
      const poItem = poArray.filter(poObj => poObj.Id === element.POLookup);
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
  getInvoiceItemData1(projObj, poArray, billingEntitys, clientLegalEntityArray) {
    const invoiceArray = [];
    const CSIdArray = [];
    projObj.ActiveCM1.forEach(cm => {
      CSIdArray.push(cm);
    });
    CSIdArray.push(projObj.ActiveCM2);
    const clientObj = clientLegalEntityArray.filter(x => x.Title === projObj.ClientLegalEntity);
    const billingEntity = billingEntitys.filter(x => x.Title === projObj.BillingEntity);
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        if (element.isExsitInv) {
          const data: any = {
            __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
            ScheduledDate: element.date,
            Amount: element.amount,
            MainPOC: element.poc,
            AddressType: element.address,
          };
          if (element.status === this.constant.STATUS.APPROVED) {
            data.ProformaLookup = element.proformaLookup;
            data.InvoiceLookup = element.invoiceLookup;
          }
          invoiceArray.push(data);
        } else {
          const data: any = {
            __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
            Title: projObj.ProjectCode,
            ScheduledDate: element.date,
            Amount: element.amount,
            Currency: clientObj && clientObj.length ? clientObj[0].Currency : '',
            PO: element.poId,
            Status: element.status === 'Not Saved' ? 'Sheduled' : element.status,
            ScheduleType: element.type,
            MainPOC: element.poc,
            AddressType: element.address,
            Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
            SOWCode: projObj.SOWCode,
            CSId: {
              results: CSIdArray
            },
          };
          if (element.status === this.constant.STATUS.APPROVED) {
            data.ProformaLookup = element.proformaLookup;
            data.InvoiceLookup = element.invoiceLookup;
          }
          invoiceArray.push(data);
        }
      });
    });
    return invoiceArray;
  }
  /**
   * This method is used to the invoice item as object
   * @param poInvItem pass the poInvoice Item as object.
   * @param projObj pass projObject as parameter
   * @param clientObj pass the clientlegal entity as an parameter.
   * @param billingEntity pass the billingEntity as an parameter.
   * @param CSIdArray pass the CSIdArray as an parameter.
   */
  getInvoiceItemData(poInvItem, projObj, clientObj, billingEntity, CSIdArray) {
    const element = poInvItem;
    if (element.isExsitInv) {
      const data: any = {
        __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
        ScheduledDate: element.date,
        Amount: element.amount,
        MainPOC: element.poc,
        AddressType: element.address,
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
        Currency: clientObj && clientObj.length ? clientObj[0].Currency : '',
        PO: element.poId,
        Status: element.status === 'Not Saved' ? 'Sheduled' : element.status,
        ScheduleType: element.type,
        MainPOC: element.poc,
        AddressType: element.address,
        Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
        SOWCode: projObj.SOWCode,
        CSId: {
          results: CSIdArray
        },
      };
      if (element.status === this.constant.STATUS.APPROVED) {
        data.ProformaLookup = element.proformaLookup;
        data.InvoiceLookup = element.invoiceLookup;
      }
      return data;
    }
  }
}
