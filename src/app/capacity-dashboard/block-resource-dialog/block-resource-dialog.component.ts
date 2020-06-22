import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";

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
  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public common: CommonService,
    public constants: ConstantsService
  ) {}

  ngOnInit() {
    this.yearsRange = this.common.getyearRange();
    this.Resources = this.config.data.Resources;
    this.selectedMinDate = this.config.data.selectedMinDate;
    this.selectedMaxDate = this.config.data.selectedMaxDate;
    this.modalloaderenable = false;
    this.InitializeForm();
    this.SetDateValidation();
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

  SaveDetails() {
    if (this.BlockResourceForm.valid) {
      this.ref.close(this.BlockResourceForm);
    } else {
      this.isBlockResourceFormSubmit = true;
    }
  }

  cancel() {
    this.ref.close();
  }
}
