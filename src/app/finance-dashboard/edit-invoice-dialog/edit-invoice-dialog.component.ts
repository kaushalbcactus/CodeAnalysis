import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
import { formatDate } from '@angular/common';
import { FdConstantsService } from '../fdServices/fd-constants.service';

@Component({
  selector: 'app-edit-invoice-dialog',
  templateUrl: './edit-invoice-dialog.component.html',
  styleUrls: ['./edit-invoice-dialog.component.css']
})
export class EditInvoiceDialogComponent implements OnInit {


  EditInvoiceForm: FormGroup;
  selectedRowItem: any;
  minScheduleDate: Date;
  listOfPOCNames: any[];
  projectContactsData: any;
  isEditInvoiceFormSubmit = false;
  addressTypes=[]
  yearRange: string;
  InvoiceType: any;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public common: CommonService,
    public fdConstantsService : FdConstantsService,
    private frmbuilder: FormBuilder) {
  }

  ngOnInit() {
    this.addressTypes = this.fdConstantsService.fdComponent.addressTypes;
    this.InvoiceType = this.config.data.InvoiceType;
    this.yearRange = this.common.getyearRange();
    this.selectedRowItem = this.config.data.selectedRowItem;
    this.projectContactsData = this.config.data.projectContactsData;
    if (this.InvoiceType === 'hourly') {
      this.EditInvoiceForm = this.frmbuilder.group({
        ProjectCode: [''],
        Currency: ['', Validators.required],
        POCName: ['', Validators.required],
        Rate: ['', [Validators.required, this.common.checkPositiveNumberValidator()]],
        HoursSpent: ['', [Validators.required, this.common.checkPositiveNumberValidator()]]
      });
    } else {
      this.EditInvoiceForm = this.frmbuilder.group({
        ProjectCode: [''],
        PONumber: [''],
        ScheduledType: [''],
        Amount: ['', Validators.required],
        Currency: ['', Validators.required],
        ScheduledDate: ['', Validators.required],
        POCName: ['', Validators.required],
        AddressType: ['', Validators.required],
      });

      this.getPOCNamesForEditInv(this.selectedRowItem);
    }


   
    this.setValueEditInvoiceForm();
   

  }



  setValueEditInvoiceForm() {

    if (this.InvoiceType === 'hourly') {
      this.EditInvoiceForm.patchValue({
        ProjectCode: this.selectedRowItem.ProjectCode,
        Currency: this.selectedRowItem.Currency,
        POCName : this.selectedRowItem.POCName,
        Rate: this.selectedRowItem.Rate,
        HoursSpent: this.selectedRowItem.HoursSpent,
      });
    }
    else {
      const format = 'dd MMM , yyyy';
      const myDate = new Date(this.selectedRowItem.ScheduledDate);
      const locale = 'en-IN';
      const formattedDate = formatDate(myDate, format, locale);
      this.EditInvoiceForm.patchValue({
        ProjectCode: this.selectedRowItem.ProjectCode,
        Currency: this.selectedRowItem.Currency,
        PONumber: this.selectedRowItem.PONumber,
        ScheduledType: this.InvoiceType,
        Amount: this.selectedRowItem.Amount,
        ScheduledDate: formattedDate,
        AddressType: { label: this.selectedRowItem.AddressType, value: this.selectedRowItem.AddressType }
      });
      const last3Days = this.common.getLastWorkingDay(3, new Date());
      this.minScheduleDate = last3Days;
    }



  }



  getPOCNamesForEditInv(rowItem: any) {
    this.listOfPOCNames = [];
    let rowVal: any = {};
    this.projectContactsData.filter((item) => {
      if (item.ClientLegalEntity === rowItem.ClientName) {
        this.listOfPOCNames.push(item);
        if (item.ID === rowItem.POCId) {
          rowVal = item;
        }
      }
    });
    if (Object.keys(rowVal).length) {
      this.EditInvoiceForm.patchValue({
        POCName: rowVal
      });
    }
  }


  SaveDetails() {

    if (this.EditInvoiceForm.valid) {
      this.ref.close(this.EditInvoiceForm);
    }
    else {
      this.isEditInvoiceFormSubmit = true;
    }

  }

  cancel() {
    this.ref.close();
  }
}
