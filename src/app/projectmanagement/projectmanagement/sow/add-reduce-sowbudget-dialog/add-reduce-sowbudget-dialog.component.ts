import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';

@Component({
  selector: 'app-add-reduce-sowbudget-dialog',
  templateUrl: './add-reduce-sowbudget-dialog.component.html',
  styleUrls: ['./add-reduce-sowbudget-dialog.component.css']
})
export class AddReduceSowbudgetDialogComponent implements OnInit {


  @ViewChild("fileuploderView", { static: false }) fileuploderView: ElementRef;
  isBudgetFormSubmit = false;
  modalloaderenable = true;
  changeBudgetForm: FormGroup;
  budgetType = [
    { label: this.pmconstant.ACTION.ADD, value: this.pmconstant.ACTION.ADD },
    { label: this.pmconstant.ACTION.REDUCE, value: this.pmconstant.ACTION.REDUCE },
    { label: this.pmconstant.ACTION.RESTRUCTURE, value: this.pmconstant.ACTION.RESTRUCTURE },
  ];
  currencyType = this.pmconstant.CURRENCY;
  currency: string;
  currSOW: any;
  selectedFile: any;

  constructor(
    private pmconstant: PmconstantService,
    private frmbuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
    public pmObject: PMObjectService,
    public pmService: PMCommonService,
  ) {
    this.changeBudgetForm = this.frmbuilder.group({
      selectedValue: ['', Validators.required],
      total: [0, Validators.required],
      net: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
      sowDocument: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.currSOW = this.config.data.sowObject;
    this.pmObject.addSOW.Budget.TotalBalance = this.currSOW.TotalBudget;
    this.pmObject.addSOW.Budget.NetBalance = this.currSOW.NetBudget;
    this.pmObject.addSOW.Budget.OOPBalance = this.currSOW.OOPBudget;
    this.pmObject.addSOW.Budget.TaxBalance = this.currSOW.TaxBudget;
    this.pmObject.addSOW.Budget.LastUpdated = this.currSOW.ModifiedDate;
    this.currency = this.currencyType.find(c => c.label === this.currSOW.Currency) ? this.currencyType.find(c => c.label === this.currSOW.Currency).value : '$';
    this.isBudgetFormSubmit = false;
    this.modalloaderenable = false;
  }


  // ***************************************************************************************************
  //  this function is called to set total on other fields input
  // ***************************************************************************************************


  setTotal() {
    this.pmObject.addSOW.Budget.Net = 0;
    this.pmObject.addSOW.Budget.OOP = 0;
    this.pmObject.addSOW.Budget.Tax = 0;
    this.pmObject.addSOW.Budget.Total = 0;

    this.pmObject.addSOW.Budget.Net = this.changeBudgetForm.value.net ? +(this.changeBudgetForm.value.net) : 0

    this.pmObject.addSOW.Budget.OOP = this.changeBudgetForm.value.oop ? +(this.changeBudgetForm.value.oop) : 0
    this.pmObject.addSOW.Budget.Tax = this.changeBudgetForm.value.tax ? +(this.changeBudgetForm.value.tax) : 0
    this.pmObject.addSOW.Budget.Total = +(this.pmObject.addSOW.Budget.Net + this.pmObject.addSOW.Budget.OOP + this.pmObject.addSOW.Budget.Tax).toFixed(2);
    this.changeBudgetForm.get('total').setValue(this.pmObject.addSOW.Budget.Total);
  }


  //***************************************************************************************************
  // To check all error for updating budget & close dialog and pass data to   process 
  // ***************************************************************************************************


  async saveBudget() {
    if (!this.changeBudgetForm.value.selectedValue) {

      this.common.showToastrMessage(this.constantsService.MessageType.warn,'Please define budget type.',false);
      return;
    }
    else {
      if (this.changeBudgetForm.valid) {
        let sowItemResult = [];
        if (this.selectedFile && this.selectedFile.size === 0) {

          this.common.showToastrMessage(this.constantsService.MessageType.error,this.constantsService.Messages.ZeroKbFile.replace('{{fileName}}',this.selectedFile.name),false);
          return;
        }
        if (this.changeBudgetForm.value.selectedValue === this.pmconstant.ACTION.RESTRUCTURE && Math.abs(this.changeBudgetForm.value.total) > this.pmObject.addSOW.Budget.TotalBalance) {
          this.common.showToastrMessage(this.constantsService.MessageType.error,'Total Amount must be less than or equal to existing Total.',false);
          return false;
        } 
        // else if (this.changeBudgetForm.value.selectedValue === this.pmconstant.ACTION.RESTRUCTURE && Math.abs(this.changeBudgetForm.value.net) > this.pmObject.addSOW.Budget.NetBalance) {

        //   this.common.showToastrMessage(this.constantsService.MessageType.error,'Net amount must be less than or equal to existing net amount.',false);
        //   return false;
        // } else if (this.changeBudgetForm.value.selectedValue === this.pmconstant.ACTION.RESTRUCTURE && Math.abs(this.changeBudgetForm.value.oop) > this.pmObject.addSOW.Budget.OOPBalance) {

        //   this.common.showToastrMessage(this.constantsService.MessageType.error,'OOP must be less than or equal to existing OOP Value.',false);
        //   return false;
        // } else if (this.changeBudgetForm.value.selectedValue === this.pmconstant.ACTION.RESTRUCTURE && Math.abs(this.changeBudgetForm.value.tax) > this.pmObject.addSOW.Budget.TaxBalance) {

        //   this.common.showToastrMessage(this.constantsService.MessageType.error,'Tax Amount must be less than or equal to existing Tax',false);
        //   return false;
        // }
        this.constantsService.loader.isPSInnerLoaderHidden = false;
        const sowItemFilter = Object.assign({}, this.pmconstant.SOW_QUERY.SOW_BY_ID);
        sowItemFilter.filter = sowItemFilter.filter.replace(/{{Id}}/gi, this.currSOW.ID);
        this.common.SetNewrelic('projectManagment', 'add-reduce-SowBudget', 'getSow');
        sowItemResult = await this.spServices.readItems(this.constantsService.listNames.SOW.name, sowItemFilter);

        if (sowItemResult[0].SOWLink && sowItemResult[0].SOWLink.indexOf(this.selectedFile.name) > -1) {

          this.common.showToastrMessage(this.constantsService.MessageType.error,'Addendum SOW document name same as original document name.',false);
          this.constantsService.loader.isPSInnerLoaderHidden = true;
          return;
        }
        else {

          if (sowItemResult && sowItemResult.length) {
            this.pmObject.addSOW.Budget.Total = sowItemResult[0].TotalBudget ? sowItemResult[0].TotalBudget : 0;
            this.pmObject.addSOW.Budget.Net = sowItemResult[0].NetBudget ? sowItemResult[0].NetBudget : 0;
            this.pmObject.addSOW.Budget.OOP = sowItemResult[0].OOPBudget ? sowItemResult[0].OOPBudget : 0;
            this.pmObject.addSOW.Budget.Tax = sowItemResult[0].TaxBudget ? sowItemResult[0].TaxBudget : 0;
            this.pmService.setGlobalVariable(sowItemResult[0]);
          }

          const BudgetData = {
            budgetType: this.changeBudgetForm.value.selectedValue,
            selectedFile: this.selectedFile,
            BudgetDetails: this.changeBudgetForm.value,

          }
          this.ref.close(BudgetData);
        }
      } else {
        this.isBudgetFormSubmit = true;
      }
    }
  }

  //***************************************************************************************************
  // To change the existing file or select new file
  // ***************************************************************************************************


  onFileChange(event) {
    this.selectedFile = null;
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.changeBudgetForm.get('sowDocument').setValue(this.selectedFile.name);
      this.fileuploderView.nativeElement.getElementsByClassName('file-select-name')[0].innerText = this.selectedFile.name;
      this.fileuploderView.nativeElement.classList.add('active');
    }
    else {
      this.fileuploderView.nativeElement.classList.remove('active');
      this.fileuploderView.nativeElement.getElementsByClassName('file-select-name')[0].innerText = 'No file chosen...';
      this.changeBudgetForm.get('sowDocument').setValue('');
    }
  }

  //***************************************************************************************************
  //  update validator based on selected type add / reduce
  // ***************************************************************************************************


  UpdateValidator(value) {
    if (value === this.pmconstant.ACTION.ADD) {
      this.changeBudgetForm.get('total').setValidators([this.common.checkPositiveNumberValidator()]);
      this.changeBudgetForm.get('oop').setValidators([this.common.checkPositiveNumberValidator()]);
      this.changeBudgetForm.get('net').setValidators([this.common.checkPositiveNumberValidator()]);
      this.changeBudgetForm.get('tax').setValidators([this.common.checkPositiveNumberValidator()]);
    }
    else if (value === this.pmconstant.ACTION.REDUCE) {
      this.changeBudgetForm.get('total').setValidators([this.common.checkNegativerNumberValidator(), Validators.min(-this.pmObject.addSOW.Budget.TotalBalance)]);
      this.changeBudgetForm.get('oop').setValidators([this.common.checkNegativerNumberValidator(), Validators.min(-this.pmObject.addSOW.Budget.OOPBalance)]);
      this.changeBudgetForm.get('net').setValidators([this.common.checkNegativerNumberValidator(), Validators.min(-this.pmObject.addSOW.Budget.NetBalance)]);
      this.changeBudgetForm.get('tax').setValidators([this.common.checkNegativerNumberValidator(), Validators.min(-this.pmObject.addSOW.Budget.TaxBalance)]);
    }
    else {
      this.changeBudgetForm.get('total').setValidators([this.common.checkZeroNumberValidator()]);
      this.changeBudgetForm.get('oop').clearValidators();
      this.changeBudgetForm.get('net').clearValidators();
      this.changeBudgetForm.get('tax').clearValidators();
    }
    this.changeBudgetForm.get('total').updateValueAndValidity();
    this.changeBudgetForm.get('oop').updateValueAndValidity();
    this.changeBudgetForm.get('net').updateValueAndValidity();
    this.changeBudgetForm.get('tax').updateValueAndValidity();
  }

  //***************************************************************************************************
  // To close dialog / discard changes 
  // ***************************************************************************************************
  cancel() {
    this.ref.close();
  }
}
