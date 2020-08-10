import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-mark-as-payment-dialog',
  templateUrl: './mark-as-payment-dialog.component.html',
  styleUrls: ['./mark-as-payment-dialog.component.css']
})
export class MarkAsPaymentDialogComponent implements OnInit {



  paymentModeArray = [
    { label: 'BankTransfer', value: 'Bank Transfer' },
    { label: 'CreditCard', value: 'Credit Card' },
    { label: 'Cheque', value: 'Cheque' },
  ];
  SelectedFile: any[];
  @ViewChild("fileuploderView", { static: false }) fileuploderView: ElementRef;
  markAsPayment_form: FormGroup;
  isPaymentFormSubmit: boolean = false;
  yearRange: string;


  constructor(private frmbuilder: FormBuilder,
    private datePipe: DatePipe,
    private commonService: CommonService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public constantService: ConstantsService
  ) {

    this.markAsPayment_form = this.frmbuilder.group({
      Number: ['', Validators.required],
      DateSpend: ['', Validators.required],
      PaymentMode: ['', Validators.required],
      FileUrl: ['', Validators.required]
    });

  }

  ngOnInit() {
    const currentYear = new Date();
    this.yearRange = (currentYear.getFullYear() - 10) + ':' + (currentYear.getFullYear() + 10);
  }




  //*************************************************************************************************
  // new File uplad function updated by Maxwell
  // ************************************************************************************************

  onFileChange(event) {

    if (event.target.files && event.target.files.length > 0) {
      this.SelectedFile = [];
      const fileName = event.target.files[0].name;
      const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
      if (fileName !== sNewFileName) {
        this.markAsPayment_form.get('FileUrl').setValue('');

        this.commonService.showToastrMessage(this.constantService.MessageType.error, 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', false);
        return false;
      }
      this.SelectedFile.push(new Object({ name: sNewFileName, file: event.target.files[0] }));
      this.fileuploderView.nativeElement.getElementsByClassName('file-select-name')[0].innerText = fileName;
      this.fileuploderView.nativeElement.classList.add('active');
    }
    else {
      this.fileuploderView.nativeElement.classList.remove('active');
      this.fileuploderView.nativeElement.getElementsByClassName('file-select-name')[0].innerText = 'No file chosen...';
    }

  }


  onSubmit() {
    if (this.markAsPayment_form.valid) {
      if (this.SelectedFile && this.SelectedFile[0].file.size === 0) {
        this.commonService.showToastrMessage(this.constantService.MessageType.error, 'Unable to upload file, size of ' + this.SelectedFile[0].name + ' is 0 KB.', false);
        return;
      }
      const date = new Date();
      this.commonService.SetNewrelic('Finance-Dashboard', 'mark-as-payment', 'UploadFile');
      this.commonService.UploadFilesProgress(this.SelectedFile, 'SpendingInfoFiles/ApprovedExpenseFiles/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM'), true).then(async uploadedfile => {
        if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
          if (uploadedfile[0].hasOwnProperty('odata.error') || uploadedfile[0].hasError) {

            this.commonService.showToastrMessage(this.constantService.MessageType.error, 'File not uploaded, Folder / File Not Found', false);
          }
          else {
            this.isPaymentFormSubmit = false;
            const data = {
              paymentForm: this.markAsPayment_form,
              fileUrl: uploadedfile[0].ServerRelativeUrl
            }
            this.ref.close(data);
          }
        }
      });

    }
    else {
      this.isPaymentFormSubmit = true;
    }
  }

  Cancel() {
    this.ref.close();
  }
}
