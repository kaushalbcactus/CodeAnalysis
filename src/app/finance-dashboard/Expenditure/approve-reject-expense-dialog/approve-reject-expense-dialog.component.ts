import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder, FormControl } from "@angular/forms";
import { Subscription } from "rxjs";
import { FDDataShareService } from "../../fdServices/fd-shareData.service";
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';

@Component({
  selector: "app-approve-reject-expense-dialog",
  templateUrl: "./approve-reject-expense-dialog.component.html",
  styleUrls: ["./approve-reject-expense-dialog.component.css"]
})
export class ApproveRejectExpenseDialogComponent implements OnInit {
  cancelReject_form: FormGroup;
  approveExpense_form: FormGroup;
  expenseDialog: any = {
    title: '',
    text: ''
  };
  formSubmit: any = {
    isSubmit: false
  };
  submitBtn: any = {
    isClicked: false
  };
  selectedRowItem: any;
  private subscription: Subscription = new Subscription();

  billingEntityData: any = [];
  paymentModeArray = [
    { label: "BankTransfer", value: "Bank Transfer" },
    { label: "CreditCard", value: "Credit Card" },
    { label: "Cheque", value: "Cheque" }
  ];
  fileEvent: any;
  folderName: string;
  mailContentRes: any;

  get isValidApproveExpeseForm() {
    return this.approveExpense_form.controls;
  }

  get isValidCancelExpeseForm() {
    return this.cancelReject_form.controls;
  }

  constructor(
    private fb: FormBuilder,
    public fdDataShareServie: FDDataShareService,
    private config: DynamicDialogConfig,
    private dynamicDialogRef: DynamicDialogRef,
    private constant: ConstantsService,
    private fdConstantsService: FdConstantsService,
    private spServices: SPOperationService,
    private commonService: CommonService,
  ) {}

  ngOnInit() {
    this.expenseDialog = this.config.data.expenseDialog;
    this.selectedRowItem = this.config.data.selectedRowItem;
    if(this.expenseDialog.text == 'Approve') {
      this.approveExpenseFormField();
      this.addRemoveFormFieldForAE(this.selectedRowItem.RequestType);
    } else if(this.expenseDialog.text == 'Reject' || this.expenseDialog.text == 'Cancel ') {
      this.canRejExpenseFormField();
      this.expenseDialog.text === 'Cancel ' ?
            this.getApproveExpenseMailContent(this.constant.EMAIL_TEMPLATE_NAME.CANCEL_EXPENSE)
                : this.getApproveExpenseMailContent(this.constant.EMAIL_TEMPLATE_NAME.REJECT_EXPENSE);
    }
  }

  biilingEntityInfo() {
    this.subscription.add(
      this.fdDataShareServie.defaultBEData.subscribe(res => {
        if (res) {
          this.billingEntityData = res;
          console.log("BE Data ", this.billingEntityData);
        }
      })
    );
  }

  addRemoveFormFieldForAE(type: string) {
    if (type === 'Invoice Payment') {
        this.approveExpense_form.removeControl('Number');
        this.approveExpense_form.removeControl('DateSpend');
        this.approveExpense_form.removeControl('PaymentMode');
        // this.approveExpense_form.removeControl('ApproverComments');
        this.approveExpense_form.removeControl('ApproverFileUrl');
    } else if (type === 'Credit Card') {
        this.approveExpense_form.addControl('Number', new FormControl('', Validators.required));
        this.approveExpense_form.addControl('DateSpend', new FormControl('', Validators.required));
        this.approveExpense_form.addControl('PaymentMode', new FormControl('', Validators.required));
        this.approveExpense_form.addControl('ApproverComments', new FormControl('', Validators.required));
        this.approveExpense_form.addControl('ApproverFileUrl', new FormControl('', Validators.required));
    }
    this.biilingEntityInfo();
    // Get Mail Content
    this.getApproveExpenseMailContent(this.constant.EMAIL_TEMPLATE_NAME.APPROVE_EXPENSE);
}

async getApproveExpenseMailContent(type) {
  // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
  const mailContentEndpoint = {
      filter: this.fdConstantsService.fdComponent.mailContent.filter.replace('{{MailType}}', type),
      select: this.fdConstantsService.fdComponent.mailContent.select,
      top: this.fdConstantsService.fdComponent.mailContent.top,
  };

  const obj = [{
      url: this.spServices.getReadURL(this.constant.listNames.MailContent.name, mailContentEndpoint),
      type: 'GET',
      listName: this.constant.listNames.MailContent.name
  }];
  this.commonService.SetNewrelic('Finance-Dashboard', 'pending-expense', 'getApproveExpenseMailContent');
  const res = await this.spServices.executeBatch(obj);
  this.mailContentRes = res;
  console.log('Approve Mail Content res ', this.mailContentRes);
}

  approveExpenseFormField() {
    this.approveExpense_form = this.fb.group({
      PayingEntity: ["", Validators.required],
      Number: ["", Validators.required],
      DateSpend: ["", Validators.required],
      PaymentMode: ["", Validators.required],
      ApproverComments: ["", Validators.required],
      ApproverFileUrl: ["", Validators.required]
    });
  }

  canRejExpenseFormField() {
    this.cancelReject_form = this.fb.group({
      isCancel: ["", Validators.required],
      ApproverComments: ["", Validators.required]
    });
  }

  onFileChange(fileEvent, folderName: string) {
    this.fileEvent = fileEvent;
    this.folderName = folderName;
  }

  isExpenseRej() {
    this.submitBtn.isClicked =
      this.cancelReject_form.value.isCancel === "No"
        ? (this.submitBtn.isClicked = true)
        : (this.submitBtn.isClicked = false);
  }
  selectedBE(be: any) {
    console.log("BE ", be);
  }

  selectedPaymentMode(val: any) {
    console.log("Payment Mode ", val);
  }

  onSubmit(expenseType) {
    this.formSubmit.isSubmit = true;

    let currentForm;
    if(expenseType == 'Cancel Expense' || expenseType == 'Reject Expense') {
      currentForm = this.cancelReject_form;
    } else if(expenseType == 'Approve Expense') {
      currentForm = this.approveExpense_form;
    }
    let expenseObj = {
      type : expenseType,
      form : currentForm,
      event: this.fileEvent,
      folderName: this.folderName, 
      mailContent: this.mailContentRes
    }
    if(currentForm.invalid) {
      return;
    }

    this.dynamicDialogRef.close(expenseObj);
  }

  cancel() {
    this.dynamicDialogRef.close();
  }
}
