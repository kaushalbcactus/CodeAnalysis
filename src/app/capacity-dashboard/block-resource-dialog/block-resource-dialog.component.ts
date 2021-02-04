import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { DatePipe } from "@angular/common";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { AllocationOverlayComponent } from "src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component";
import { PreStackAllocationComponent } from "src/app/shared/pre-stack-allocation/pre-stack-allocation.component";
import { UsercapacityComponent } from "src/app/shared/usercapacity/usercapacity.component";
import { IDailyAllocationTask } from "src/app/shared/pre-stack-allocation/interface/prestack";
import { PreStackcommonService } from "src/app/shared/pre-stack-allocation/service/pre-stackcommon.service";

@Component({
  selector: "app-block-resource-dialog",
  templateUrl: "./block-resource-dialog.component.html",
  styleUrls: ["./block-resource-dialog.component.css"],
  // providers: [PreStackAllocationComponent]
  providers: [
    PreStackAllocationComponent,
    AllocationOverlayComponent,
    UsercapacityComponent,
    DialogService,
  ],
})
export class BlockResourceDialogComponent implements OnInit {
  @ViewChild("dailyAllocateOP", { static: false })
  dailyAllocateOP: AllocationOverlayComponent;
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
  readonly: boolean = false;
  blockingRecord: any;
  isViewAllocation: boolean;
  maxExpectedHrs: any;

  task: any;
  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public common: CommonService,
    public constants: ConstantsService,
    public datepipe: DatePipe,
    public spServices: SPOperationService,
    private dailyAllocation: PreStackAllocationComponent,
    private dialogService: DialogService,
    private prestackService: PreStackcommonService
  ) {
    this.BlockResourceForm = this.formBuilder.group({
      Resource: ["", Validators.required],
      Title: ["", Validators.required],
      StartDate: ["", Validators.required],
      EndDate: ["", Validators.required],
      ExpectedTime: [
        "",
        [Validators.required, this.common.checkGTZeroNumberValidator()],
      ],
      allocationPerDay: [""],
    });
  }

  ngOnInit() {
    this.task = {
      id: 0,
      taskFullName: "",
      Task: "ResourceBlocking",
      pUserStartDatePart: null,
      pUserEndDatePart: null,
      pUserStart: null,
      pUserEnd: null,
      budgetHours: 0,
      pUserStartTimePart: "",
      pUserEndTimePart: "",
      status: "",
      allocationPerDay: "",
      Resource: "",
    };
    this.yearsRange = this.common.getyearRange();
    this.Resources = this.config.data.Resources;
    if (this.config.data.type === "EditBlocking") {
      this.readonly = true;
      this.blockingRecord = this.config.data.data;
      this.EditForm();
    } else {
      this.selectedMinDate =
        this.config.data.selectedMinDate <
        new Date(this.datepipe.transform(new Date(), "MM/dd/yyyy"))
          ? new Date(this.datepipe.transform(new Date(), "MM/dd/yyyy"))
          : this.config.data.selectedMinDate;
      this.selectedMaxDate = this.config.data.selectedMaxDate;
      this.SetDateValidation();
    }
    this.modalloaderenable = false;
    this.BlockResourceForm.valueChanges.subscribe(async (blockResource) => {
      await this.updateValue(blockResource);
      this.validateBudgetHours();
      this.isViewAllocationBtn();
      if (this.task.budgetHours > 0 && this.task.Resource) {
        await this.prestackService.calcPrestackAllocation(
          [this.BlockResourceForm.value.Resource],
          this.task
        );
      }
    });
  }
  async EditForm() {
    this.BlockResourceForm.patchValue({
      Resource: this.Resources.find(
        (c) => c.label === this.blockingRecord.AssignedTo.Title
      )
        ? this.Resources.find(
            (c) => c.label === this.blockingRecord.AssignedTo.Title
          )
        : "",
      Title: this.blockingRecord.title,
      StartDate: this.blockingRecord.startDate,
      EndDate: this.blockingRecord.dueDate,
      ExpectedTime: this.blockingRecord.totalAllocatedTime,
      allocationPerDay: this.blockingRecord.AllocationPerDay,
    });
    await this.updateValue(this.BlockResourceForm.value);
    this.validateBudgetHours();
    this.isViewAllocationBtn();
  }

  async SetDateValidation(dateType?: string) {
    if (
      dateType === "startDate" &&
      this.BlockResourceForm.value.StartDate === ""
    ) {
      this.common.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select start date.",
        false
      );
    } else if (
      dateType === "startDate" &&
      this.BlockResourceForm.value.StartDate !== ""
    ) {
      this.EDminDateValue = new Date(this.BlockResourceForm.value.StartDate);
      this.EDmaxDateValue = new Date(this.selectedMaxDate);
    } else if (
      dateType === "endDate" &&
      this.BlockResourceForm.value.EndDate === ""
    ) {
      this.common.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select end date.",
        false
      );
    } else if (
      dateType === "endDate" &&
      this.BlockResourceForm.value.EndDate !== ""
    ) {
      this.SDminDateValue = new Date(this.selectedMinDate);
      this.SDmaxDateValue = new Date(this.BlockResourceForm.value.EndDate);
      this.BlockResourceForm.get("EndDate").setValue(
        new Date(
          this.datepipe.transform(
            this.BlockResourceForm.value.EndDate,
            "yyyy-MM-dd"
          ) + "T23:45:00.000"
        )
      );
    } else {
      this.SDminDateValue = new Date(this.selectedMinDate);
      this.SDmaxDateValue = new Date(this.selectedMaxDate);
      this.EDminDateValue = new Date(this.selectedMinDate);
      this.EDmaxDateValue = new Date(this.selectedMaxDate);
    }
  }

  updateValue(blockResource) {
    const EndDate = blockResource.EndDate
      ? new Date(
          this.datepipe.transform(blockResource.EndDate, "yyyy-MM-dd") +
            "T23:45:00.000"
        )
      : null;
    this.task = {
      id: this.blockingRecord ? this.blockingRecord.taskID : 0,
      taskFullName: blockResource.Title,
      Task: "ResourceBlocking",
      pUserStartDatePart: blockResource.StartDate
        ? this.common.getDatePart(blockResource.StartDate)
        : null,
      pUserEndDatePart: EndDate ? this.common.getDatePart(EndDate) : null,
      pUserStart: blockResource.StartDate ? blockResource.StartDate : null,
      pUserEnd: EndDate,
      budgetHours: blockResource.ExpectedTime,
      pUserStartTimePart: blockResource.StartDate
        ? this.common.getTimePart(blockResource.StartDate)
        : "",
      pUserEndTimePart: EndDate ? this.common.getTimePart(EndDate) : "",
      status: "Active",
      allocationPerDay: blockResource.allocationPerDay,
      Resource: blockResource.Resource ? blockResource.Resource : "",
    };
  }

  async SaveDetails() {
    if (this.BlockResourceForm.valid) {
      if (this.config.data.type === "EditBlocking") {
        this.common.showToastrMessage(
          this.constants.MessageType.info,
          "updating....",
          true,
          true
        );
        this.ref.close(this.task);
      } else {
        this.common.showToastrMessage(
          this.constants.MessageType.info,
          "adding...",
          true,
          true
        );
        this.task.Resource = this.BlockResourceForm.value.Resource;
        this.ref.close(this.task);
      }
    } else {
      this.isBlockResourceFormSubmit = true;
    }
  }

  viewAllocation(allocationType) {
    if (this.BlockResourceForm.value.Resource) {
      const milestoneTask = this.task;
      let header = this.BlockResourceForm.value.Title;
      header =
        header +
        " - " +
        this.BlockResourceForm.value.Resource.UserNamePG.Title;
      const ref = this.dialogService.open(PreStackAllocationComponent, {
        data: {
          ID: milestoneTask.id,
          task: milestoneTask.taskFullName,
          startDate: milestoneTask.pUserStartDatePart,
          endDate: milestoneTask.pUserEndDatePart,
          startTime: milestoneTask.pUserStartTimePart,
          endTime: milestoneTask.pUserEndTimePart,
          budgetHrs: milestoneTask.budgetHours.toString(),
          resource: [this.BlockResourceForm.value.Resource],
          status: milestoneTask.status,
          strAllocation: milestoneTask.allocationPerDay,
          strTimeSpent: "",
          allocationType,
        } as IDailyAllocationTask,
        width: "90vw",

        header,
        contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
        closable: false,
      });
      ref.onClose.subscribe((allocation: any) => {
        this.prestackService.setAllocationPerDay(allocation, milestoneTask);
        if (allocation.allocationAlert) {
          this.common.showToastrMessage(
            this.constants.MessageType.warn,
            "Resource is over allocated.",
            false
          );
        }
      });
    } else {
      this.common.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select resource",
        false
      );
    }
  }

  isViewAllocationBtn() {
    if (
      this.task.budgetHours &&
      this.task.Resource &&
      this.task.pUserStartDatePart.getTime() !==
        this.task.pUserEndDatePart.getTime()
    ) {
      this.isViewAllocation = true;
    } else {
      this.isViewAllocation = false;
    }
  }

  validateBudgetHours() {
    let time: any = this.common.getHrsAndMins(
      this.task.pUserStart,
      this.task.pUserEnd
    );
    let bhrs = this.common
      .convertToHrsMins("" + this.task.budgetHours)
      .replace(".", ":");
    let businessDays = this.common.calcBusinessDays(
      this.task.pUserStart,
      this.task.pUserEnd
    );
    this.maxExpectedHrs = businessDays * 24;

    let hrs = parseInt(bhrs.split(":")[0]);
    let min = parseInt(bhrs.split(":")[1]);

    let bHrsTime: any = new Date();
    bHrsTime = bHrsTime.setHours(hrs, min, 0, 0);

    if (bHrsTime > time.maxTime) {
      let budgetHrs: number = 0;
      this.task.budgetHours = 0;
      this.BlockResourceForm.get("ExpectedTime").setValue(budgetHrs);
      this.common.showToastrMessage(
        this.constants.MessageType.error,
        "Expected time is set to zero because given expected time is greater than blocking time period.",
        false
      );
    }
  }

  showOverlayPanel(event, dailyAllocateOP) {
    const target = event.target;
    const allocationPerDay = this.task.allocationPerDay
      ? this.task.allocationPerDay
      : "";
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
  }

  hideOverlayPanel(dailyAllocateOP) {
    dailyAllocateOP.hideOverlay();
  }

  cancel() {
    this.ref.close();
  }
}
