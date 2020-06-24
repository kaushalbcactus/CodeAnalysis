import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';

@Component({
  selector: "app-block-resource-dialog",
  templateUrl: "./block-resource-dialog.component.html",
  styleUrls: ["./block-resource-dialog.component.css"],
})
export class BlockResourceDialogComponent implements OnInit {
  modalloaderenable: boolean = true;
  BlockResourceForm: FormGroup;
  isBlockResourceFormSubmit: boolean;
  EDminDateValue: any;
  selectedMinDate: any;
  selectedMaxDate: any;
  EDmaxDateValue: Date;
  SDmaxDateValue: Date;
  SDminDateValue: Date;
  yearsRange: string;
  Resources: any;
  readonly: boolean=false;
  blockingRecord: any;
  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public common: CommonService,
    public constants: ConstantsService,
    public datepipe : DatePipe,
    public spServices: SPOperationService
  ) {}

  ngOnInit() {
    this.yearsRange = this.common.getyearRange();
    this.Resources = this.config.data.Resources;
    this.InitializeForm();
    if(this.config.data.type ==='EditBlocking'){
      this.readonly = true;
      this.blockingRecord=this.config.data.data;
      this.EditForm();
    }
    else{
      this.selectedMinDate = this.config.data.selectedMinDate < new Date(this.datepipe.transform(new Date(),'MM/dd/yyyy')) ? new Date(this.datepipe.transform(new Date(),'MM/dd/yyyy')) : this.config.data.selectedMinDate   ;
      this.selectedMaxDate = this.config.data.selectedMaxDate;
      this.SetDateValidation();
    }
    this.modalloaderenable = false;
  }
  EditForm(){
    this.BlockResourceForm.patchValue({
      Resource: this.Resources.find(c=>c.label === this.blockingRecord.AssignedTo.Title) ? this.Resources.find(c=>c.label === this.blockingRecord.AssignedTo.Title) :'',
      Title : this.blockingRecord.title,
      StartDate:this.blockingRecord.startDate,
      EndDate:this.blockingRecord.dueDate,
      ExpectedTime : this.blockingRecord.totalAllocatedTime
    })
  }

  InitializeForm() {
    this.BlockResourceForm = this.formBuilder.group({
      Resource: ["", Validators.required],
      Title: ["", Validators.required],
      StartDate: ["", Validators.required],
      EndDate: ["", Validators.required],
      ExpectedTime: ["", Validators.required],
    });
  }

  SetDateValidation(dateType?: string) {
    if (dateType === "startDate" && this.BlockResourceForm.value.StartDate !=="") {
      this.EDminDateValue = new Date(this.BlockResourceForm.value.StartDate);
      this.EDmaxDateValue = new Date(this.selectedMaxDate);
    } else if (dateType === "endDate" && this.BlockResourceForm.value.EndDate !=="") {
      this.SDminDateValue = new Date(this.selectedMinDate);
      this.SDmaxDateValue = new Date(this.BlockResourceForm.value.EndDate);
    } else {
      this.SDminDateValue = new Date(this.selectedMinDate);
      this.SDmaxDateValue = new Date(this.selectedMaxDate);
      this.EDminDateValue = new Date(this.selectedMinDate);
      this.EDmaxDateValue = new Date(this.selectedMaxDate);
    }
  }

  // setBudgetHoursValidation() {
  //   this.BlockResourceForm.get("ExpectedTime").setValidators([
  //     Validators.required,
  //     this.common.checkGTZeroNumberValidator(),
  //     Validators.max(this.BlockResourceForm.value.Resource.value.MaxHrs),
  //   ]);
  //   this.BlockResourceForm.get("ExpectedTime").updateValueAndValidity();
  // }



  async SaveDetails() {
    if (this.BlockResourceForm.valid) {
      if(this.config.data.type ==='EditBlocking'){
        this.common.showToastrMessage(this.constants.MessageType.info,'updating....',true,true);
        this.ref.close(this.BlockResourceForm);
      }else{
        this.common.showToastrMessage(this.constants.MessageType.info,'adding...',true,true);
        const validation = await this.validateBlocking(this.datepipe.transform(this.BlockResourceForm.value.StartDate, 'MM/dd/yyyy')
        , this.datepipe.transform(this.BlockResourceForm.value.EndDate,'MM/dd/yyyy'));
        if (validation) {
          this.ref.close(this.BlockResourceForm);
        } else {
          this.common.clearToastrMessage();
          this.common.showToastrMessage(this.constants.MessageType.warn, 'Blocking resource already exist between ' +
            this.datepipe.transform(this.BlockResourceForm.value.StartDate, 'MMM dd, yyyy') + ' and ' + this.datepipe.transform(this.BlockResourceForm.value.EndDate, 'MMM dd, yyyy'), false);
        }
      } 
  }
  else {
    this.isBlockResourceFormSubmit = true;
  }
}


async validateBlocking(startDate, endDate) {
  let validation = true;
  const batchURL=[];

  const blockingResource= {
    select: 'ID,StartDate,EndDateDT,Status,Title',
    filter: '(AssignedTo/Id eq {{assignToId}} and Status eq \'Active\' ) and ((StartDate ge \'{{startDateString}}\' and StartDate le \'{{endDateString}}\') or (EndDateDT ge \'{{startDateString}}\' and EndDateDT le \'{{endDateString}}\') or (StartDate le \'{{startDateString}}\' and EndDateDT ge \'{{endDateString}}\'))',
    orderby: 'Created',
    top: 4500
  };

  const url = this.spServices.getReadURL(
    this.constants.listNames.Blocking.name,
    blockingResource
  );
  this.common.setBatchObject(
    batchURL,
    url
      .replace("{{assignToId}}", this.BlockResourceForm.value.Resource.value.UserNamePG.Id)
      .replace(/{{startDateString}}/gi, startDate)
      .replace(/{{endDateString}}/gi, endDate),
    null,
    this.constants.Method.GET,
    this.constants.listNames.Blocking.name
  );
  this.common.SetNewrelic('CapacityDashboard', 'BlockResourceDialogComponent', 'ValidateBlocking');
  const arrResults = await this.spServices.executeBatch(batchURL);

  if (arrResults) {
    if (arrResults[0].retItems.length > 0) {
      validation = false;
    }
  }
  return validation;
}

  cancel() {
    this.ref.close();
  }
}
