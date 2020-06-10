import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng";
import { ConstantsService } from "src/app/Services/constants.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { FdConstantsService } from "src/app/finance-dashboard/fdServices/fd-constants.service";
import { Subscription } from "rxjs";
import { FDDataShareService } from "src/app/finance-dashboard/fdServices/fd-shareData.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-schedule-oop-invoice-dialog",
  templateUrl: "./schedule-oop-invoice-dialog.component.html",
  styleUrls: ["./schedule-oop-invoice-dialog.component.css"],
})
export class ScheduleOopInvoiceDialogComponent implements OnInit {
  listOfPOCs: any = [];
  poNames: any = [];
  projectContactsData: any;
  selectedAllRowsItem: any;
  modalloaderenable = true;
  purchaseOrdersList: any;
  ScheduleInvoiceForm: FormGroup;
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  submitBtn: any = {
    isClicked: false,
  };
  pfListItem: any = [];
  pfbListItem: any = [];
  pbbListItem: any = [];
  hBQuery: any = [];
  projectInfoLineItem: any;
  pcmLevels: any = [];
  poItem: any;
  pocItem: any;
  projectInfoData: any;
  advanceInvArray: any[];
  arrAdvanceInvoices: any;
  PoAdvanceInvoiceList = [];
  InvoiceTypeArray: any;
  addressTypes = [];
  yearRange: string;
  private subscription: Subscription = new Subscription();

  isScheduleInvoiceFormSubmit = false;
  constructor(
    private frmbuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private datePipe: DatePipe,
    public fdDataShareServie: FDDataShareService,
    private constantsService: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
    private fdConstantsService: FdConstantsService
  ) {
    this.ScheduleInvoiceForm = this.frmbuilder.group({
      ProjectCode: [{ value: "", disabled: true }],
      PONumber: ["", Validators.required],
      ScheduledType: [{ value: "oop", disabled: true }],
      Amount: [{ value: "", disabled: true }, Validators.required],
      Currency: [{ value: "", disabled: true }, Validators.required],
      ScheduledDate: ["", Validators.required],
      POCName: ["", Validators.required],
      AddressType: ["", Validators.required],
      OOPBalance: ["", Validators.required],
      InvoiceType: ["new", Validators.required],
      InvoiceId: [""],
      InvoiceDate: [""],
      InvoiceAmount: [0],
      BalanceAmount: [0],
      TagAmount: [""],
    });
  }

  ngOnInit() {
    this.addressTypes = this.fdConstantsService.fdComponent.addressTypes;
    this.InvoiceTypeArray = [
      { label: "Tag to existing invoice", value: "existing" },
      { label: "New Schedule", value: "new" },
    ],
      (this.selectedAllRowsItem = this.config.data.selectedAllRowsItem);
    this.projectInfoData = this.config.data.projectInfoData;
    this.poInfo();
    this.projectContacts();
    const pInfo = this.getCleFromPC();
    if (pInfo) {
      this.getPONumberFromCLE(pInfo);
      this.getPOCFromPCLE(pInfo);
    }

    this.yearRange = this.common.getyearRange();
    this.setValInScheduleOop(this.selectedAllRowsItem);
    this.modalloaderenable = false;
  }

  async poChange(event) {
    console.log("po event ", event.value);
    this.submitBtn.isClicked = false;
    this.modalloaderenable = true;
    this.poItem = event.value;
    this.ScheduleInvoiceForm.get("OOPBalance").setValue(0);
    this.poItem.OOPLinked = this.poItem.OOPLinked ? this.poItem.OOPLinked : 0;

    if (this.poItem) {
      this.arrAdvanceInvoices = [];
      const PoExist = this.PoAdvanceInvoiceList.find(
        (c) => c.Id === this.poItem.ID
      );
      if (!PoExist) {
        let invoiceCall = Object.assign(
          {},
          this.fdConstantsService.fdComponent.ADV_INVOICES
        );
        invoiceCall.filter = invoiceCall.filter
          .replace(/{{clientLegalEntity}}/gi, this.poItem.ClientLegalEntity)
          .replace(/{{invoiceType}}/gi, "oop");
        this.common.SetNewrelic(
          "Finance-Dashboard",
          "Expenditure-approvebillable-scheduleoop",
          "pochange-getInvoices"
        );
        const response = await this.spServices.readItems(
          this.constantsService.listNames.Invoices.name,
          invoiceCall
        );
        const arrINV = response.filter((e) => e.PO === this.poItem.ID);
        this.arrAdvanceInvoices = arrINV;
        this.PoAdvanceInvoiceList.push({
          Id: this.poItem.ID,
          advanceInvList: arrINV,
        });
      } else {
        this.arrAdvanceInvoices = PoExist.advanceInvList;
      }

      this.advanceInvArray = [];
      this.arrAdvanceInvoices.forEach((element) => {
        this.advanceInvArray.push({
          label: element.InvoiceNumber,
          value: element.ID,
        });
      });

      if (this.advanceInvArray.length > 0) {
        this.ScheduleInvoiceForm.get("InvoiceType").setValue(
          this.InvoiceTypeArray[0].value
        );
        this.UpdateValidator("existing");
      } else {
        this.ScheduleInvoiceForm.get("InvoiceType").setValue(
          this.InvoiceTypeArray[1].value
        );
        this.UpdateValidator("new");
      }

      let oopBalance = this.poItem.AmountOOP
        ? this.poItem.AmountOOP - this.poItem.OOPLinked
        : 0 - (this.poItem.OOPLinked ? this.poItem.OOPLinked : 0);
      this.ScheduleInvoiceForm.get("OOPBalance").setValue(
        parseFloat(oopBalance.toFixed(2))
      );
      const defaultPOC = this.listOfPOCs.filter(
        (item) => item.Id === this.poItem.POCLookup
      );
      if (defaultPOC.length) {
        this.ScheduleInvoiceForm.patchValue({
          POCName: defaultPOC[0],
        });
        this.pocItem = defaultPOC[0];
      } else {
        this.ScheduleInvoiceForm.controls["POCName"].setValue(null);
      }
    }
    if (
      +this.ScheduleInvoiceForm.get("OOPBalance").value >=
      this.ScheduleInvoiceForm.getRawValue().Amount
    ) {
      await this.getPfPfb();
    } else {
      this.submitBtn.isClicked = true;
      this.modalloaderenable = false;
      this.ScheduleInvoiceForm.get("OOPBalance").setValidators([
        Validators.required,
        Validators.min(+this.ScheduleInvoiceForm.get("Amount").value),
      ]);
      this.ScheduleInvoiceForm.get("OOPBalance").updateValueAndValidity();
      this.common.showToastrMessage(
        this.constantsService.MessageType.warn,
        "OOP Balance must be greater than Scheduled oop Amount.",
        false
      );
      return;
    }
  }
  pocChange(event) {
    console.log("poc event ", event.value);
    this.pocItem = event.value;
  }

  getCleFromPC() {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode === this.selectedAllRowsItem[0].ProjectCode) {
        return x;
      }
    });
    return found ? found : "";
  }

  getPONumberFromCLE(cli) {
    this.purchaseOrdersList.map((x) => {
      if (x.ClientLegalEntity === cli.ClientLegalEntity) {
        if (this.matchCurrency(x)) {
          this.poNames.push(x);
        }
      }
    });
    console.log(this.poNames);
  }

  matchCurrency(po) {
    const found = this.selectedAllRowsItem.find((item) => {
      if (item.ClientCurrency === po.Currency) {
        return item;
      }
    });
    return found ? found : "";
  }

  getPOCFromPCLE(cle) {
    this.listOfPOCs = [];
    for (let i = 0; i < this.projectContactsData.length; i++) {
      const element = this.projectContactsData[i];
      if (element ? element.ClientLegalEntity : "") {
        if (element.ClientLegalEntity === cle.ClientLegalEntity) {
          this.listOfPOCs.push(element);
        }
      }
    }
    console.log("listOfPOCs ", this.listOfPOCs);
  }

  async getPfPfb() {
    this.modalloaderenable = true;
    this.hBQuery = [];
    const batchUrl = [];
    // const batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    this.projectInfoLineItem = this.getPInfoByPC();
    this.pcmLevels = [];
    if (this.projectInfoLineItem) {
      for (
        let i = 0;
        i < this.projectInfoLineItem.CMLevel1.results.length;
        i++
      ) {
        const element = this.projectInfoLineItem.CMLevel1.results[i];
        this.pcmLevels.push(element);
      }
      this.pcmLevels.push(this.projectInfoLineItem.CMLevel2);
      // console.log('this.pcmLevels ', this.pcmLevels);
    }

    // PF
    const pfObj = Object.assign({}, this.queryConfig);
    pfObj.url = this.spServices.getReadURL(
      this.constantsService.listNames.ProjectFinances.name,
      this.fdConstantsService.fdComponent.projectFinances
    );
    pfObj.url = pfObj.url.replace(
      "{{ProjectCode}}",
      this.ScheduleInvoiceForm.getRawValue().ProjectCode
    );
    pfObj.listName = this.constantsService.listNames.ProjectFinances.name;
    pfObj.type = "GET";
    batchUrl.push(pfObj);

    // PFB
    const pfbObj = Object.assign({}, this.queryConfig);
    pfbObj.url = this.spServices.getReadURL(
      this.constantsService.listNames.ProjectFinanceBreakup.name,
      this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO
    );
    pfbObj.url = pfbObj.url
      .replace(
        "{{ProjectCode}}",
        this.ScheduleInvoiceForm.getRawValue().ProjectCode
      )
      .replace("{{PO}}", this.poItem.Id);
    pfbObj.listName = this.constantsService.listNames.ProjectFinanceBreakup.name;
    pfbObj.type = "GET";
    batchUrl.push(pfbObj);

    // PBB
    const pbbObj = Object.assign({}, this.queryConfig);
    pbbObj.url = this.spServices.getReadURL(
      this.constantsService.listNames.ProjectBudgetBreakup.name,
      this.fdConstantsService.fdComponent.projectBudgetBreakup
    );
    pbbObj.url = pbbObj.url.replace(
      "{{ProjectCode}}",
      this.ScheduleInvoiceForm.getRawValue().ProjectCode
    );
    pbbObj.listName = this.constantsService.listNames.ProjectBudgetBreakup.name;
    pbbObj.type = "GET";
    batchUrl.push(pbbObj);

    this.common.SetNewrelic(
      "Finance-Dashboard",
      "approved-billable",
      "GetPFPFBPBB"
    );
    const res = await this.spServices.executeBatch(batchUrl);
    const arrResults = res.length ? res.map((a) => a.retItems) : [];
    if (arrResults.length) {
      this.pfListItem = arrResults[0];
      this.pfbListItem = arrResults[1];
      this.pbbListItem = arrResults[2];
    }
    this.modalloaderenable = false;
  }

  getPInfoByPC() {
    const found = this.projectInfoData.find((x) => {
      if (
        x.ProjectCode === this.ScheduleInvoiceForm.getRawValue().ProjectCode
      ) {
        return x;
      }
    });
    return found ? found : "";
  }

  setValInScheduleOop(selectedLineItems: any) {
    let amt = 0;
    for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
      const element = this.selectedAllRowsItem[i];
      amt += parseFloat(
        element.ClientAmount ? element.ClientAmount : element.TotalInvoice
      );
    }
    if (selectedLineItems.length) {
      console.log("", this.selectedAllRowsItem[0].ProjectCode);
      this.ScheduleInvoiceForm.controls["ProjectCode"].setValue(
        this.selectedAllRowsItem[0].ProjectCode
      );
      this.ScheduleInvoiceForm.controls["ScheduledType"].setValue("oop");
      this.ScheduleInvoiceForm.controls["Currency"].setValue(
        this.selectedAllRowsItem[0].ClientCurrency
          ? this.selectedAllRowsItem[0].ClientCurrency
          : this.selectedAllRowsItem[0].Currency
      );
      this.ScheduleInvoiceForm.controls["Amount"].setValue(amt);
      console.log(
        "this.ScheduleInvoiceForm ",
        this.ScheduleInvoiceForm.getRawValue()
      );
    }
  }

  poInfo() {
    this.subscription.add(
      this.fdDataShareServie.defaultPoData.subscribe((res) => {
        if (res) {
          this.purchaseOrdersList = res;
          console.log("PO Data ", this.purchaseOrdersList);
        }
      })
    );
  }

  projectContacts() {
    this.subscription.add(
      this.fdDataShareServie.defaultPCData.subscribe((res) => {
        if (res) {
          this.projectContactsData = res;
          console.log("this.projectContactsData ", this.projectContactsData);
        }
      })
    );
  }

  setInvData() {
    const oInv = this.arrAdvanceInvoices.find(
      (e) => e.ID === this.ScheduleInvoiceForm.get("InvoiceId").value
    );
    this.ScheduleInvoiceForm.get("InvoiceDate").setValue(
      oInv ? this.datePipe.transform(oInv.InvoiceDate, "MMM, dd, yyyy") : ""
    );
    this.ScheduleInvoiceForm.get("InvoiceAmount").setValue(
      oInv ? oInv.Amount : ""
    );
    this.ScheduleInvoiceForm.get("BalanceAmount").setValue(
      oInv ? oInv.Amount - oInv.TaggedAmount : ""
    );
    this.ScheduleInvoiceForm.get("TagAmount").setValue(
      this.ScheduleInvoiceForm.get("Amount").value
    );
    this.ScheduleInvoiceForm.get("TagAmount").setValidators([
      Validators.required,
      this.common.checkGTZeroNumberValidator(),
      Validators.max(oInv ? oInv.Amount - oInv.TaggedAmount : 0),
    ]);
    this.ScheduleInvoiceForm.get("TagAmount").updateValueAndValidity();
  }

  UpdateValidator(value: string) {
    if (value === "new") {
      this.ScheduleInvoiceForm.get("ScheduledDate").setValidators([
        Validators.required,
      ]);
      this.ScheduleInvoiceForm.get("POCName").setValidators([
        Validators.required,
      ]);
      this.ScheduleInvoiceForm.get("AddressType").setValidators([
        Validators.required,
      ]);
      this.ScheduleInvoiceForm.get("TagAmount").clearValidators();
      this.ScheduleInvoiceForm.get("InvoiceId").clearValidators();
    } else if (value === "existing") {
      this.ScheduleInvoiceForm.get("ScheduledDate").clearValidators();
      this.ScheduleInvoiceForm.get("POCName").clearValidators();
      this.ScheduleInvoiceForm.get("AddressType").clearValidators();
      this.ScheduleInvoiceForm.get("TagAmount").setValidators([
        Validators.required,
        this.common.checkGTZeroNumberValidator(),
      ]);
      this.ScheduleInvoiceForm.get("InvoiceId").setValidators([
        Validators.required,
      ]);
      this.setInvData();
    }

    this.ScheduleInvoiceForm.get("ScheduledDate").updateValueAndValidity();
    this.ScheduleInvoiceForm.get("POCName").updateValueAndValidity();
    this.ScheduleInvoiceForm.get("AddressType").updateValueAndValidity();
    this.ScheduleInvoiceForm.get("TagAmount").updateValueAndValidity();
    this.ScheduleInvoiceForm.get("InvoiceId").updateValueAndValidity();
  }

  SaveDetails() {
    if (this.ScheduleInvoiceForm.valid) {
      const data = {
        poItem: this.poItem,
        pfListItem: this.pfListItem,
        pfbListItem: this.pfbListItem,
        projectInfoLineItem: this.projectInfoLineItem,
        pcmLevels: this.pcmLevels,
        ScheduleInvoiceForm: this.ScheduleInvoiceForm,
        Invoice:
          this.arrAdvanceInvoices.length > 0
            ? this.arrAdvanceInvoices.find(
                (e) => e.ID === this.ScheduleInvoiceForm.get("InvoiceId").value
              )
            : null,
      };
      this.ref.close(data);
    } else {
      this.isScheduleInvoiceFormSubmit = true;
    }
  }

  cancel() {
    this.ref.close();
  }
}
