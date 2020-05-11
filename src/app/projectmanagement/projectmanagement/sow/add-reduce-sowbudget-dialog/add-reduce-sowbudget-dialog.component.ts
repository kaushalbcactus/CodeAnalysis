import { Component, OnInit } from '@angular/core';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService, DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';

@Component({
  selector: 'app-add-reduce-sowbudget-dialog',
  templateUrl: './add-reduce-sowbudget-dialog.component.html',
  styleUrls: ['./add-reduce-sowbudget-dialog.component.css']
})
export class AddReduceSowbudgetDialogComponent implements OnInit {

  isBudgetFormSubmit = false;
  modalloaderenable = true;
  changeBudgetForm: FormGroup;
  selectedValue: any;
  budgetType = [
    { label: this.pmconstant.ACTION.ADD, value: this.pmconstant.ACTION.ADD },
    { label: this.pmconstant.ACTION.REDUCE, value: this.pmconstant.ACTION.REDUCE },
  ];
  currencyType = this.pmconstant.CURRENCY;
  currency: string;
  currSOW: any;

  constructor(
    private pmconstant: PmconstantService,
    private frmbuilder: FormBuilder,
    private messageService: MessageService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
    public pmObject: PMObjectService,
  ) {
    this.changeBudgetForm = this.frmbuilder.group({
      total: [0, Validators.required],
      net: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
    });
  }

  ngOnInit() {
    this.currSOW = this.config.data.poObject;
    this.selectedValue = [];
    // this.pmObject.oldBudget.TotalBalance= this.currPOObj.Amount;
    // this.pmObject.oldBudget.NetBalance = this.currPOObj.AmountRevenue;
    // this.pmObject.oldBudget.OOPBalance = this.currPOObj.AmountOOP;
    // this.pmObject.oldBudget.TaxBalance = this.currPOObj.AmountTax;
    // this.pmObject.oldBudget.LastUpdated = this.currPOObj.LastUpdated;
    // this.currency = this.currencyType.find(c=>c.label === this.currSOW.Currency) ? this.currencyType.find(c=>c.label ===this.currSOW.Currency).value : '$';
    // this.changeBudgetForm.controls.total.disable();
    // this.isBudgetFormSubmit = false;
    // this.modalloaderenable = false;
  }




  setTotal() {
    this.pmObject.addSOW.Budget.Net = 0;
    this.pmObject.addSOW.Budget.OOP = 0;
    this.pmObject.addSOW.Budget.Tax = 0;
    this.pmObject.addSOW.Budget.Total = 0;

    this.pmObject.addSOW.Budget.NetBalance

    // this.adminObject.po.revenue = +(this.changeBudgetForm.value.revenue).toFixed(2);
    // this.adminObject.po.oop = this.changeBudgetForm.value.oop ? +(this.changeBudgetForm.value.oop).toFixed(2) : 0;
    // this.adminObject.po.tax = this.changeBudgetForm.value.tax ? +(this.changeBudgetForm.value.tax).toFixed(2) : 0;
    // this.adminObject.po.total = +(this.adminObject.po.revenue + this.adminObject.po.oop + this.adminObject.po.tax).toFixed(2);
    // this.changeBudgetForm.get('total').setValue(this.adminObject.po.total);

  }



  async saveBudget() {
    if (!this.selectedValue.length) {
      this.messageService.add({
        key: 'adminCustom', severity: 'info',
        summary: 'Info Message', detail: 'Please define budget type.'
      });
      return;
    }
    if (this.selectedValue.length) {
      if (this.changeBudgetForm.valid) {
        this.constantsService.loader.isPSInnerLoaderHidden = false;
        switch (this.selectedValue) {
          case this.pmconstant.ACTION.ADD:
            await this.addBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
          case this.pmconstant.ACTION.REDUCE:
            await this.reduceBudget();
            this.constantsService.loader.isPSInnerLoaderHidden = true;
            break;
        }

      } else {
        this.isBudgetFormSubmit = true;
      }
    }
  }

  addBudget() {

  }

  reduceBudget() {

  }



  cancel() {
    this.ref.close();
  }
}
