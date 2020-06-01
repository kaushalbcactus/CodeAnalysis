import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { DatePipe, formatDate } from '@angular/common';
import { FdConstantsService } from 'src/app/finance-dashboard/fdServices/fd-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-approve-billing-dialog',
  templateUrl: './approve-billing-dialog.component.html',
  styleUrls: ['./approve-billing-dialog.component.css']
})
export class ApproveBillingDialogComponent implements OnInit {

  ApproveInvoiceForm: FormGroup;
  isApproveInvoiceFormSubmit = false;
  arrAdvanceInvoices: any[];
  PoAdvanceInvoiceList: any;
  poItem: any;
  selectedRowItem: any;
  advanceInvArray: any = [];
  InvoiceTypeArray: any;
  modalloaderenable = true;
  yearRange: string;
  constructor(private frmbuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private datePipe: DatePipe,
    // public fdDataShareServie: FDDataShareService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
    private fdConstantsService: FdConstantsService
  ) {

    this.ApproveInvoiceForm = this.frmbuilder.group({
      BudgetHrs: ['', Validators.required],
      HoursSpent: ['', Validators.required],
      approvalDate: ['', Validators.required],
      InvoiceType: ['new', Validators.required],
      InvoiceId: [''],
      InvoiceDate: [''],
      InvoiceAmount: [0],
      BalanceAmount: [0],
      TagAmount: [''],
    });

  }

  ngOnInit() {

    this.yearRange = this.common.getyearRange();
    const format = 'dd MMM , yyyy';
    const myDate = new Date();
    const locale = 'en-IN';
    const formattedDate = formatDate(myDate, format, locale);

    this.InvoiceTypeArray = this.fdConstantsService.fdComponent.InvoiceTypeArray;
    this.selectedRowItem = this.config.data.selectedRowItem;
    this.poItem = this.selectedRowItem.PO;
    this.checkAdvanceInvoice();
    console.log(this.selectedRowItem)
    this.ApproveInvoiceForm.get('approvalDate').setValue(formattedDate)
    this.ApproveInvoiceForm.get('BudgetHrs').setValue(this.selectedRowItem.BudgetHrs)
    this.ApproveInvoiceForm.get('HoursSpent').setValue(this.selectedRowItem.HoursSpent)


  }


  async checkAdvanceInvoice() {
    this.arrAdvanceInvoices = [];
    let invoiceCall = Object.assign({}, this.fdConstantsService.fdComponent.ADV_INVOICES);
    invoiceCall.filter = invoiceCall.filter.replace(/{{clientLegalEntity}}/gi,
      this.poItem.ClientLegalEntity).replace(/{{invoiceType}}/gi,'revenue');
    this.common.SetNewrelic('Finance-Dashboard', 'Expenditure-approvebillable-scheduleoop', 'pochange-getInvoices');
    const response = await this.spServices.readItems(this.constantsService.listNames.Invoices.name, invoiceCall);
    const arrINV = response.filter(e => e.PO === this.poItem.ID);
    this.arrAdvanceInvoices = arrINV;

    this.arrAdvanceInvoices.forEach(element => {
      this.advanceInvArray.push({ label: element.InvoiceNumber, value: element.ID });
    });

    if (this.advanceInvArray.length > 0) {
      this.ApproveInvoiceForm.get('InvoiceType').setValue(this.InvoiceTypeArray[0].value)
      this.UpdateValidator('existing');
    }
    else {
      this.ApproveInvoiceForm.get('InvoiceType').setValue(this.InvoiceTypeArray[1].value)
      this.UpdateValidator('new');
    }
    this.modalloaderenable = false;

  }


  UpdateValidator(value: string) {

    if (value === 'new') {
      this.ApproveInvoiceForm.get('approvalDate').setValidators([Validators.required]);
      this.ApproveInvoiceForm.get('TagAmount').clearValidators();
      this.ApproveInvoiceForm.get('InvoiceId').clearValidators();
    }
    else if (value === 'existing') {

      this.ApproveInvoiceForm.get('approvalDate').clearValidators();
      this.ApproveInvoiceForm.get('TagAmount').setValidators([Validators.required, this.common.checkGTZeroNumberValidator()]);
      this.ApproveInvoiceForm.get('InvoiceId').setValidators([Validators.required]);
      this.setInvData();
    }

    this.ApproveInvoiceForm.get('approvalDate').updateValueAndValidity();
    this.ApproveInvoiceForm.get('TagAmount').updateValueAndValidity();
    this.ApproveInvoiceForm.get('InvoiceId').updateValueAndValidity();
  }

  setInvData() {

    const oInv = this.arrAdvanceInvoices.find(e => e.ID === this.ApproveInvoiceForm.get('InvoiceId').value);
    this.ApproveInvoiceForm.get('InvoiceDate').setValue(oInv ? this.datePipe.transform(oInv.InvoiceDate, 'MMM, dd, yyyy') : '')
    this.ApproveInvoiceForm.get('InvoiceAmount').setValue(oInv ? oInv.Amount : '');
    this.ApproveInvoiceForm.get('BalanceAmount').setValue(oInv ? (oInv.Amount - oInv.TaggedAmount) : '');
    this.ApproveInvoiceForm.get('TagAmount').setValue(parseFloat(this.selectedRowItem.TotalInvoice));
    this.ApproveInvoiceForm.get('TagAmount').setValidators([Validators.required, this.common.checkGTZeroNumberValidator(), Validators.max(oInv ? (oInv.Amount - oInv.TaggedAmount) : 0)]);
    this.ApproveInvoiceForm.get('TagAmount').updateValueAndValidity();
  }

  SaveDetails() {

    if (this.ApproveInvoiceForm.valid) {
      if ((this.ApproveInvoiceForm.get('TagAmount').value <= this.config.data.sowObj.availableSOWBudget) && (this.ApproveInvoiceForm.get('TagAmount').value <= this.config.data.poLookupDataObj.availablePOBudget)) {

        const data ={
          ApproveInvoiceForm : this.ApproveInvoiceForm,
          Invoice: this.arrAdvanceInvoices.length > 0 ? this.arrAdvanceInvoices.find(e => e.ID === this.ApproveInvoiceForm.get('InvoiceId').value) : null
        }

        this.ref.close(data);
      } else {

        this.common.showToastrMessage(this.constantsService.MessageType.info,'Project budget cannot be more than SOW available budget or PO available budget.',false);
        return;
      }
    }
    else {
      this.isApproveInvoiceFormSubmit = true;
    }

  }


  cancel() {
    this.ref.close();
  }

}
