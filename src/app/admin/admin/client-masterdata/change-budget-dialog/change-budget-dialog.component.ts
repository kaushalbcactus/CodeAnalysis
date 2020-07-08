import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-change-budget-dialog',
  templateUrl: './change-budget-dialog.component.html',
  styleUrls: ['./change-budget-dialog.component.css']
})
export class ChangeBudgetDialogComponent implements OnInit {
  currPOObj: any;
  isBudgetFormSubmit = false;
  changeBudgetForm: FormGroup;
  selectedValue: any;
  checkBudgetValue = false;
  modalloaderenable = true;
  budgetType = [
    { label: this.adminConstants.ACTION.ADD, value: this.adminConstants.ACTION.ADD },
    { label: this.adminConstants.ACTION.REDUCE, value: this.adminConstants.ACTION.REDUCE },
    { label: this.adminConstants.ACTION.RESTRUCTURE, value: this.adminConstants.ACTION.RESTRUCTURE }
  ];
  currencyType = [
    { label: 'AUD', value: '$' },
    { label: 'BRL', value: 'R$' },
    { label: 'CNY', value: '¥ /元' },
    { label: 'DKK', value: 'kr' },
    { label: 'EUR', value: '€' },
    { label: 'GBP', value: '£' },
    { label: 'INR', value: '₹' },
    { label: 'JPY', value: '¥' },
    { label: 'KRW', value: '₩' },
    { label: 'NTD', value: 'NT$' },
    { label: 'SGD', value: '$' },
    { label: 'USD', value: '$' },
  ]
  currency: string;
  BalancedRevenue: number;
  BalancedOOP: number;
  constructor(private frmbuilder: FormBuilder, 
    private adminCommonService: AdminCommonService,
    private adminConstants: AdminConstantService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService, ) {
    this.changeBudgetForm = this.frmbuilder.group({
      total: [0, Validators.required],
      revenue: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
    });
  }

  ngOnInit() {
    console.log(this.config.data.poObject)
    this.currPOObj = this.config.data.poObject;
    this.selectedValue = [];
    this.checkBudgetValue = false;
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.oldBudget.LastUpdated = this.currPOObj.LastUpdated;
    this.currency = this.currencyType.find(c=>c.label === this.currPOObj.Currency) ? this.currencyType.find(c=>c.label ===this.currPOObj.Currency).value : '$';
    this.changeBudgetForm.controls.total.disable();
    this.isBudgetFormSubmit = false;
    this.modalloaderenable = false;

  }




  /**
   * Construct a method to save the budget in `PO` and `POBudgetBreakup` list.
   *
   * @description
   *
   * This method is used to save the data based on action in `PO` and `POBudgetBreakup` list.
   *
   * @Note
   *
   * 1. User should select the action need to perform.
   * 2. If `Action='Add'` it will add budget to the existing budget.
   * 3. If `Action='Reduce'` it will subtract budget from the existing budget.
   * 4. If `Action='Restructure'` it will adjust budget from one category to another category with total as zero.
   */
  async saveBudget() {
    if (!this.selectedValue.length) {
      this.checkBudgetValue = true;
      this.common.showToastrMessage(this.constantsService.MessageType.info,'Please define budget type.',false);
    } else {
      this.checkBudgetValue = false;
    }
    if (this.selectedValue.length) {
      if (this.changeBudgetForm.valid) {
        this.constantsService.loader.isPSInnerLoaderHidden = false;
        switch (this.selectedValue) {
          case this.adminConstants.ACTION.ADD:
            await this.addBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
          case this.adminConstants.ACTION.REDUCE:
            await this.reduceBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
          case this.adminConstants.ACTION.RESTRUCTURE:
            await this.restructureBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
        }

      } else {
        this.isBudgetFormSubmit = true;
      }
    }
  }
  /**
   * Construct a method to add budget to existing budget.
   *
   * @description
   *
   * This method is used to add the budget to existing budget.
   * It will make one entry in `PO`list and another one in `POBudgetBreakup` list.
   *
   *  @Note
   *
   * 1. Revenue should be positive number.
   * 2. OOP should be positive number.
   * 3. Tax should be positive number.
   * 4. Total should not be less than zero.
   *
   * @example
   *
   * It will add Amount to Amount, AmountRevenue to AmountRevenue, AmountOOP to AmountOOP and AmountTax
   *  to AmountTax column in `PO` and `POBudgetBreakup` list.
   * Total = AmountRevenue + AmountOOP + AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async addBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (this.adminObject.newBudget.AmountRevenue < 0) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Revenue should be Positive Number',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP < 0) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'OOP should be Positive Number',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountTax < 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Tax should be Positive Number',false);
      return false;
    }
    if (this.adminObject.newBudget.Amount < 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Total should be Positive Number',false);
      return false;
    }
    this.ref.close(true);
  }
  /**
   * Construct a method to subtract the budget from existing budget.
   *
   * @description
   *
   * This method is used to subtract the budget from existing budget.
   * It will make update the item in `PO`list and create one item in `POBudgetBreakup` list with `-` sign.
   *
   * @Note
   *
   * 1. Revenue amount should be negative number.
   * 2. OOP amount should be negative number.
   * 3. Tax amount should be negative number.
   * 4. Total should be in negative number.
   * 5. Total Amount must be less than or equal to existing Total.
   * 6. Revenue must be less than or equal to existing Revenue
   * 7. OOP must be less than or equal to existing OOP Value.
   * 8. Tax Amount must be less than or equal to existing Tax
   *
   * @example
   *
   * Let say existing revenue is $100 so user cannot subtract -101 from revenu budget which is same for
   * Total, OOP and Tax.
   *
   * Total = AmountRevenue - AmountOOP - AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async reduceBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (this.adminObject.newBudget.AmountRevenue > 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Revenue amount should be negative number',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP > 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'OOP amount should be negative number',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountTax > 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Tax amount should be negative number',false);
      return false;
    }
    if (this.adminObject.newBudget.Amount > 0) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Total should be negative number',false);
      return false;
    }

    if (Math.abs(this.adminObject.newBudget.AmountRevenue) > this.currPOObj.BalancedRevenue) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Can\'t reduce Revenue amount by '+Math.abs(this.adminObject.newBudget.AmountRevenue)+' as the Linked/Invoice Balance is ' + this.currPOObj.BalancedRevenue ,false);
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountOOP) > this.currPOObj.BalancedOOP) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Can\'t reduce OOP amount by '+Math.abs(this.adminObject.newBudget.AmountOOP)+' as the Linked/Invoice Balance is ' + this.currPOObj.BalancedOOP ,false);
      return false;
    }

    if (Math.abs(this.adminObject.newBudget.Amount) > this.adminObject.oldBudget.Amount) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Total Amount must be less than or equal to existing Total',false);
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountRevenue) > this.adminObject.oldBudget.AmountRevenue) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Revenue must be less than or equal to existing Revenue',false);
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountOOP) > this.adminObject.oldBudget.AmountOOP) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'OOP must be less than or equal to existing OOP Value',false);
      return false;
    }
    if (Math.abs(this.adminObject.newBudget.AmountTax) > this.adminObject.oldBudget.AmountTax) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Tax Amount must be less than or equal to existing Tax',false);
      return false;
    }
    this.ref.close(true);
  }
  /**
   * Construct a method to add budget from one category to another category without affecting the total budget.
   *
   * @description
   *
   * This method is used to transfer the amount form one category to another category without changing the total amount.
   * It will make update the item in `PO`list and create one item in `POBudgetBreakup` list with
   * one of the column with positive amount and another with negative amount.
   *
   * @Note
   *
   * 1. Total amount should be zero.
   * 2. Total Amount must be less than or equal to existing Total.
   * 3. Revenue must be less than or equal to existing Revenue
   * 4. OOP must be less than or equal to existing OOP Value.
   * 5. Tax Amount must be less than or equal to existing Tax
   *
   * @example
   *
   * Possible transfer bugdget case is
   *
   * 1. Revenue to OOP.
   * 2. Revenue to Tax.
   * 3. OOP to Revenue.
   * 4. OOP to Tax.
   * 5. Tax to Revenue.
   * 6. Tax to OOP.
   *
   * Case1:
   *
   * Let assume, I want to transfer $50 from existing $100 from revenue to OOP.
   * Then,
   * Revenue will have -50 and
   * OOP will have +50
   * Here I cannot add more than $100 because existing revenue is only $100.
   * Above example is applies to each category if they want to tranfer the amount.
   *
   * Total = +-AmountRevenue +- AmountOOP +- AmountTax;
   *
   * @returns  It will return false if validation fails.
   */
  async restructureBudget() {
    this.adminObject.oldBudget.Amount = this.currPOObj.Amount;
    this.adminObject.oldBudget.AmountRevenue = this.currPOObj.AmountRevenue;
    this.adminObject.oldBudget.AmountOOP = this.currPOObj.AmountOOP;
    this.adminObject.oldBudget.AmountTax = this.currPOObj.AmountTax;
    this.adminObject.newBudget.Amount = this.changeBudgetForm.controls.total.value;
    this.adminObject.newBudget.AmountRevenue = this.changeBudgetForm.controls.revenue.value;
    this.adminObject.newBudget.AmountOOP = this.changeBudgetForm.controls.oop.value;
    this.adminObject.newBudget.AmountTax = this.changeBudgetForm.controls.tax.value;
    if (Math.abs(this.adminObject.newBudget.Amount) > this.adminObject.oldBudget.Amount) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Total Amount must be less than or equal to existing Total',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountRevenue < 0 && Math.abs(this.adminObject.newBudget.AmountRevenue) > this.currPOObj.BalancedRevenue) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Can\'t reduce Revenue amount by '+Math.abs(this.adminObject.newBudget.AmountRevenue)+' as the Linked/Invoice Balance is ' + this.currPOObj.BalancedRevenue ,false);
      return false;
    }

    if (this.adminObject.newBudget.AmountOOP < 0 && Math.abs(this.adminObject.newBudget.AmountOOP) > this.currPOObj.BalancedOOP) {
      this.common.showToastrMessage(this.constantsService.MessageType.error,'Can\'t reduce OOP amount by '+Math.abs(this.adminObject.newBudget.AmountOOP)+' as the Linked/Invoice Balance is ' + this.currPOObj.BalancedOOP ,false);
      return false;
    }

    if (this.adminObject.newBudget.AmountRevenue < 0 && Math.abs(this.adminObject.newBudget.AmountRevenue) > this.adminObject.oldBudget.AmountRevenue) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Revenue must be less than or equal to existing Revenue',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountOOP < 0 && Math.abs(this.adminObject.newBudget.AmountOOP) > this.adminObject.oldBudget.AmountOOP) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'OOP must be less than or equal to existing OOP Value',false);
      return false;
    }
    if (this.adminObject.newBudget.AmountTax < 0 && Math.abs(this.adminObject.newBudget.AmountTax) > this.adminObject.oldBudget.AmountTax) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Tax Amount must be less than or equal to existing Tax',false);
      return false;
    }
    if (this.adminObject.newBudget.Amount !== 0) {

      this.common.showToastrMessage(this.constantsService.MessageType.error,'Total Should be Zero',false);
      return false;
    }
    this.ref.close(true);
  }


  cancel() {
    this.ref.close();
  }


  setPOTotal() {
    this.adminObject.po.revenue = 0;
    this.adminObject.po.oop = 0;
    this.adminObject.po.tax = 0;
    this.adminObject.po.total = 0;

      this.adminObject.po.revenue = +(this.changeBudgetForm.value.revenue).toFixed(2);
      this.adminObject.po.oop = this.changeBudgetForm.value.oop ? +(this.changeBudgetForm.value.oop).toFixed(2) : 0;
      this.adminObject.po.tax = this.changeBudgetForm.value.tax ? +(this.changeBudgetForm.value.tax).toFixed(2) : 0;
      this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
      this.changeBudgetForm.get('total').setValue(this.adminObject.po.total);
    
  }

}
