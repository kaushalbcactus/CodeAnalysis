import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';

import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
@Component({
  selector: 'app-finance-management',
  templateUrl: './finance-management.component.html',
  styleUrls: ['./finance-management.component.css']
})
export class FinanceManagementComponent implements OnInit, OnChanges {
  @Output() dataEvent = new EventEmitter<string>();
  @Input() manageData: any;
  clientLegalEntity;
  po: any = [];
  poInfo: any = [];
  isPOTableHidden = true;
  budgetHoursSection = false;
  isManageFinanceLoaderHidden = false;
  isFinanceLoaderHidden = false;
  isFinanceTableHidden = true;
  budgetTotal = 0;
  budgetNet = 0;
  budgetOOP = 0;
  budgetTax = 0;
  poData = [];
  budgetData = [];
  billedBy;
  public selectedActiveCM1;
  public selectedActiveCM2;
  public selectedActiveAD1;
  public selectedActiveAD2;
  public budgethours;
  public rate;
  fileReader;
  filePathUrl: any;
  constructor(
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    private pmCommon: PMCommonService,
    private commonService: CommonService,
    private constants: ConstantsService
  ) { }
  ngOnInit() {
    this.loadFinanceManagementInit();
  }
  loadFinanceManagementInit() {
    setTimeout(async () => {
      await this.pmCommon.setBilledBy();
      const sow = this.pmObject.allSOWItems.filter(objt => objt.SOWCode === this.pmObject.addProject.SOWSelect.SOWCode);
      if (sow && sow.length) {
        this.clientLegalEntity = sow[0].ClientLegalEntity;
        this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = this.clientLegalEntity;
      }
      if (this.pmObject.addProject.FinanceManagement.BilledBy) {
        this.billedBy = this.pmObject.addProject.FinanceManagement.BilledBy;
      }
      this.setHeaderColumn();
      this.budgethours = this.pmObject.addProject.Timeline.Standard.IsStandard ?
        this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours :
        this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.budgethours;
      // Setting the currency value.
      const currency = this.pmObject.allSOWItems.filter((obj) => {
        return obj.SOWCode === this.pmObject.addProject.SOWSelect.SOWCode;
      });
      if (currency && currency.length) {
        this.pmObject.addProject.FinanceManagement.Currency = currency[0].Currency;
      }
      this.isFinanceLoaderHidden = true;
      this.isFinanceTableHidden = false;
    }, this.pmConstant.TIME_OUT);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.manageData && this.manageData.length) {
      this.isPOTableHidden = false;
      this.budgetHoursSection = true;
      if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        this.rate = true;
      }
      this.budgetData = this.manageData[0].budget;
      this.poData = this.manageData[0].PO;
      this.pmObject.addProject.FinanceManagement.Rate = this.manageData[0].Rate;
      this.pmObject.addProject.FinanceManagement.OverNightRequest = this.manageData[0].OverNightRequest;
      // this.arrAdvanceInvoices = this.manageData[0].arrAdvanceInvoices;
      this.pmObject.arrAdvanceInvoices = this.manageData[0].arrAdvanceInvoices;
    }
  }
  /**
   * This method is used to set the column header.
   */
  setHeaderColumn() {
    this.po = [
      { field: 'total', header: 'Total' },
      { field: 'revenue', header: 'Revenue' },
      { field: 'oop', header: 'OOP' },
      { field: 'tax', header: 'Tax' },
    ];
    this.poInfo = [
      { field: 'inv_number', header: 'Inv Number' },
      { field: 'prf_number', header: 'Prf Number' },
      { field: 'date', header: 'Date' },
      { field: 'amount', header: 'Amount' },
      { field: 'type', header: 'Type' },
      { field: 'status', header: 'Status' },
      { field: 'poc', header: 'POC' },
      { field: 'address', header: 'Address' },
    ];
  }
  goToTimeline() {
    this.pmObject.activeIndex = 0;
  }
  /**
   * This method is used add budget to project.
   */
  showPOTable() {
    if (!this.billedBy) {

      this.commonService.showToastrMessage(this.constants.MessageType.error,'Please select Billed by.',false);
      return false;
    } else if (this.pmObject.addProject.FinanceManagement.isBudgetRateAdded) {

      this.commonService.confirmMessageDialog('Manage Finance Changes', 'Are you sure you want to change the Budget/Rate.', null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          const emptyArray = [];
          this.poData = [...emptyArray];
          this.budgetData = [...emptyArray];
          this.budgetHoursSection = false;
          this.rate = false;
          this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = false;
          this.pmObject.addProject.ProjectAttributes.BilledBy = this.pmObject.addProject.FinanceManagement.BilledBy;
          this.dataEvent.emit('true');
        }
    });
    } else {
      this.pmObject.addProject.ProjectAttributes.BilledBy = this.billedBy;
      this.dataEvent.emit('true');
    }
  }
  /**
   * This method is used to save project.
   */
  saveProject() {
    // verify the project code.
    setTimeout(() => {
      this.validateAndSave();
    }, this.pmConstant.TIME_OUT);
  }
  validateAndSave() {
    const valid = this.validateForm();
    if (valid) {
      this.pmObject.addProject.FinanceManagement.ClientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
      this.pmObject.addProject.FinanceManagement.BilledBy = this.pmObject.addProject.ProjectAttributes.BilledBy;
      this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = true;
      this.pmObject.activeIndex = 2;
    }
  }
  /**
   * This method is used to validate the form field
   */
  validateForm() {
    if (!this.pmObject.addProject.FinanceManagement.POArray.length) {

      this.commonService.showToastrMessage(this.constants.MessageType.error,'Please assign budget / rate for project.',false);
      return false;
    }
    return true;
  }
  /**
   * This method is called when file is selected
   * @param event file
   */
  onFileChange(event) {
    this.pmObject.addProject.FinanceManagement.selectedFile = null;
    if (event.target.files && event.target.files.length > 0) {
      this.pmObject.addProject.FinanceManagement.selectedFile = event.target.files[0];
    }
  }
  onBilledByChanged() {
    const emptyArray = [];
    this.poData = [...emptyArray];
    this.budgetData = [...emptyArray];
    this.pmObject.addProject.FinanceManagement.POArray = [...emptyArray];
    this.budgetHoursSection = false;
    this.rate = false;
    this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = false;
  }
}
