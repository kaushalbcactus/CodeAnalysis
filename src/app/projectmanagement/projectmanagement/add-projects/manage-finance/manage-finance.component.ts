import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { PMObjectService } from "src/app/projectmanagement/services/pmobject.service";
import { PmconstantService } from "src/app/projectmanagement/services/pmconstant.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { DatePipe } from "@angular/common";
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
  SelectItem,
} from "primeng";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { PMCommonService } from "src/app/projectmanagement/services/pmcommon.service";
import { CommonService } from "src/app/Services/common.service";
import { GlobalService } from "src/app/Services/global.service";
import { DataService } from "src/app/Services/data.service";
import { Router } from "@angular/router";
import { PoChangeDialogComponent } from "./po-change-dialog/po-change-dialog.component";

declare var $;
@Component({
  selector: "app-manage-finance",
  templateUrl: "./manage-finance.component.html",
  styleUrls: ["./manage-finance.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [DialogService],
})
export class ManageFinanceComponent implements OnInit {
  @Input() billedBy: any;
  @Output() budgetOutputData = new EventEmitter<any>();
  addPOForm: FormGroup;
  reasonsArray = [];
  existBudgetArray: any = [];
  existPBBBudgetArray: any = [];
  existPOArray: any = [];
  existPOInvoiceArray: any = [];
  existPODataArray: any = [];
  isBudgetHoursDisabled = true;
  isInvoiceEdit = false;
  sowNumber = "";
  budgetData = [];
  budgetObj = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    budget_hours: 0,
    edited: false,
    reason: "",
    reasonType: "",
  };
  poData = [];
  poObj = {
    poId: 0,
    poValue: "",
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
    scTotal: 0,
    scRevenue: 0,
    scOOP: 0,
    scTax: 0,
    showDelete: false,
    showAdd: false,
    showInvoice: false,
    isExsitPO: false,
    status: "",
    edited: false,
  };
  poInfoData = [];
  poAddObj = {
    poId: 0,
    inv_number: "",
    invUrl: "",
    prf_number: "",
    prfUrl: "",
    date: new Date(),
    amount: 0,
    type: "",
    status: "",
    poc: "",
    address: "",
    isExsitInv: false,
    isInvoiceItemEdit: false,
    isInvoiceItemConfirm: false,
    currency: "",
    pocText: "",
    Id: 0,
    edited: false,
    proformaLookup: -1,
    invoiceLookup: -1,
  };
  poHeader = {
    total: 0,
    revenue: 0,
    oop: 0,
    tax: 0,
  };
  poArray = [];
  unassignedBudget = [];
  unassignedBudgetobj = { total: 0, revenue: 0, oop: 0, tax: 0 };
  poList = [];
  primaryPoc = [];
  overNightRequest = [];
  address = [];
  budgetHours = 0;
  hourlyBudgetHours = 0;
  updatedBudget = 0;
  error = false;
  errorMsg = "";
  addInvoiceErrorMsg = "";
  isAddBudgetButtonHidden = false;
  isrevenueFieldDisabled = false;
  showPo = false;
  showHourly = false;
  showAddInvoiceDetails = false;
  showSave = false;
  addInvoiceError = false;
  isAddToProjectHidden = false;
  selectedPo;
  hourlyRate;
  schedulePO = {
    scheduleTotal: 0,
    scheduleRevenue: 0,
    scheduleOop: 0,
    scheduleTax: 0,
  };
  isPoRevenueDisabled = false;
  savePOArray = [];
  index;
  selectedOverNightRequest = "No";
  isHourlyRateDisabled = false;
  isHourlyOverNightDisabled = false;
  isAddRateButtonHidden = false;
  projObj;
  isPOEdit = false;
  invoiceObj;
  showUnAssigned = false;
  invoiceHeader = "Add Invoice Line Item";
  projectType = "";
  budgetIncreaseArray: SelectItem[];
  budgetDecreaseArray: SelectItem[];
  selectedReasonType = "";
  selectedReason = "";
  showBudgetIncrease = false;
  showReduction = false;
  sowObj: any;
  newBudgetHrs = 0;
  projectStatus = "";
  arrAdvanceInvoices = [];
  // relatedInvoiceLinkingPopup = false;
  advanceInvID = -1;
  existingInvDate = "";
  existingInvAmount = 0;
  invBalance = 0;
  newInvAmount = 0;
  advanceInvArray = [];
  tagExistingInvSection = false;
  updateInvoices = [];
  hideRemoveButton = false;
  disableAddBudget = false;
  @Output() maximizeDialog = new EventEmitter<any>();
  dbProposedDate: any;
  selectedProposedEndDate: Date;
  maxEndDate: Date;
  minDate: any;
  BudgetType: string = "";
  spendingInfoDetails: any = [];
  allPbbDetails: any = [];
  invoiceType: any = "revenue";
  sowList: any;
  currentId: any;
  enableCheckList: boolean = false;
  PoReplaceLineItemList: any = [];
  ReplacePOList: any = [];
  hideMoveLineItem: boolean = false;
  constructor(
    private frmbuilder: FormBuilder,
    public pmObject: PMObjectService,
    public pmConstant: PmconstantService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private datePipe: DatePipe,
    private config: DynamicDialogConfig,
    private dynamicDialogRef: DynamicDialogRef,
    private pmCommonService: PMCommonService,
    private commonService: CommonService,
    private global: GlobalService,
    private router: Router,
    private dataService: DataService,
    public dialogService: DialogService
  ) {
    this.addPOForm = frmbuilder.group({
      poDate: ["", Validators.required],
      amount: ["", Validators.required],
      primarypoc: ["", Validators.required],
      address: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.reInitializePopup();
  }

  async reInitializePopup() {
    this.sowList = [];
    this.poList = [];
    this.pmObject.addProject.FinanceManagement.POListArray = [];
    this.pmObject.addProject.FinanceManagement.POArray = [];
    this.pmObject.addProject.FinanceManagement.BudgetArray = [];
    this.pmObject.addProject.FinanceManagement.UnassignedArray = [];
    this.sowNumber = this.pmObject.addProject.SOWSelect.SOWCode;
    this.isBudgetHoursDisabled = true;
    this.address = [
      { label: "POC", value: "POC" },
      { label: "Client", value: "Client" },
    ];
    this.overNightRequest = [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ];
    if (this.config && this.config.hasOwnProperty("data")) {
      setTimeout(async () => {
        this.projObj = this.config.data.projectObj;
        if (
          this.projObj.Status === "Pending Closure" &&
          this.projObj.ProjectType.substr(
            this.projObj.ProjectType.lastIndexOf("-") + 1
          ) === "Writing"
        ) {
          this.disableAddBudget = true;
        }
        this.isPOEdit = true;
        // this.setBudget();
        this.projectType = this.projObj.ProjectType;
        this.hideMoveLineItem =
          this.projectType === this.pmConstant.PROJECT_TYPE.HOURLY.value
            ? true
            : false;
        this.projectStatus = this.projObj.Status;
        await this.editManageFinances(this.projObj);
      }, this.pmConstant.TIME_OUT);
    } else {
      this.hideMoveLineItem = true;
      this.projObj = undefined;
      this.isPOEdit = false;
      this.projectType = this.pmObject.addProject.ProjectAttributes.BilledBy;
      this.projectStatus = this.constant.projectList.status.InDiscussion;
      await this.setBudget();
    }
  }

  /**
   * This method is used to get required data before loading the page.
   */
  async getInitData(projectCode, clientLegalEntity, currency) {
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    // Get Po ##0

    const poFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.GET_FinancePO
    );
    poFilter.filter = poFilter.filter
      .replace(/{{clientLegalEntity}}/gi, clientLegalEntity)
      .replace(/{{currency}}/gi, currency);

    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(this.constant.listNames.PO.name, poFilter),
      null,
      this.constant.Method.GET,
      this.constant.listNames.PO.name
    );

    // Get SOW ##1
    const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.SOW_CODE);
    sowFilter.filter = sowFilter.filter.replace(
      /{{sowcode}}/gi,
      this.projObj
        ? this.projObj.SOWCode
        : this.pmObject.addProject.SOWSelect.SOWCode
    );
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(this.constant.listNames.SOW.name, sowFilter),
      null,
      this.constant.Method.GET,
      this.constant.listNames.SOW.name
    );

    // Get Advance Invoices ##2
    const invFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.ADV_INVOICES
    );
    invFilter.filter = invFilter.filter.replace(
      /{{clientLegalEntity}}/gi,
      clientLegalEntity
    );
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.Invoices.name,
        invFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.Invoices.name
    );

    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "GetPOSowInvoices",
      "GET-BATCH"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults && arrResults.length) {
      const unfilteredPOArray = arrResults[0].retItems;
      this.poArray = unfilteredPOArray;
      if (this.poArray && this.poArray) {
        this.poArray.forEach((element) => {
          this.poList.push({
            label: element.Number + " - " + element.NameST,
            value: element.ID,
          });
        });
      }
      this.sowObj = arrResults[1].retItems[0];

      this.arrAdvanceInvoices = arrResults[2].retItems;
    }
  }

  /**
   * This method is used to set the default value for all the budget value.
   */
  async setBudget() {
    await this.getInitData(
      this.pmObject.addProject.ProjectAttributes.ProjectCode,
      this.pmObject.addProject.ProjectAttributes.ClientLegalEntity,
      this.pmObject.addProject.FinanceManagement.Currency
    );
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      this.budgetHours = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours;
      this.hourlyBudgetHours = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours;
    }
    if (this.pmObject.addProject.Timeline.NonStandard.IsStandard) {
      this.budgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
      this.hourlyBudgetHours = this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
    }
    if (this.projectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      this.showHourly = true;
      this.isrevenueFieldDisabled = true;
      this.isAddBudgetButtonHidden = true;
      this.isPoRevenueDisabled = true;
    } else {
      this.showHourly = false;
      this.isrevenueFieldDisabled = false;
      this.isAddBudgetButtonHidden = false;
      this.isPoRevenueDisabled = false;
    }
    this.pmObject.addProject.FinanceManagement.OverNightRequest = this.selectedOverNightRequest;
    this.budgetData.push(this.budgetObj);
    this.unassignedBudget = [];
    this.unassignedBudget.push(this.unassignedBudgetobj);
    this.showUnAssigned = this.unassignedBudgetobj.revenue ? true : false;
    this.isAddToProjectHidden = this.unassignedBudgetobj.revenue ? false : true;
  }

  assignBudgetToProject(sReason, sReasonType) {
    this.error = false;
    this.errorMsg = "";

    this.unassignedBudget = [];

    if (
      this.sowObj.NetBudget - this.sowObj.RevenueLinked <
      this.updatedBudget
    ) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "SOW revenue balance is less than addendum budget.",
        true
      );
      return;
    }

    const tempbudgetObject = $.extend(true, {}, this.budgetObj);
    if (
      this.existBudgetArray.retItems &&
      this.existBudgetArray.retItems.length
    ) {
      tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
      tempbudgetObject.budget_hours =
        this.budgetHours + this.existBudgetArray.retItems[0].BudgetHrs;
      tempbudgetObject.revenue =
        this.updatedBudget + this.existBudgetArray.retItems[0].RevenueBudget;
      tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
      tempbudgetObject.total =
        this.updatedBudget + this.existBudgetArray.retItems[0].Budget;
    } else {
      tempbudgetObject.oop = 0;
      tempbudgetObject.budget_hours = this.budgetHours;
      tempbudgetObject.revenue = this.updatedBudget;
      tempbudgetObject.tax = 0;
      tempbudgetObject.total = this.updatedBudget;
    }
    this.budgetData = [];
    tempbudgetObject.edited = true;
    tempbudgetObject.reason = sReason;
    tempbudgetObject.reasonType = sReasonType;
    this.budgetData.push(tempbudgetObject);
    // add to assigned object.
    const unassignedObj = $.extend(true, {}, this.unassignedBudgetobj);
    if (this.existBudgetArray && this.existBudgetArray.length) {
      unassignedObj.total =
        this.updatedBudget + this.existBudgetArray.retItems[0].Budget;
      unassignedObj.revenue =
        this.updatedBudget + this.existBudgetArray.retItems[0].RevenueBudget;
      unassignedObj.oop = 0;
      unassignedObj.tax = 0;
    } else {
      unassignedObj.total = this.updatedBudget;
      unassignedObj.revenue = this.updatedBudget;
      unassignedObj.oop = 0;
      unassignedObj.tax = 0;
    }
    this.unassignedBudget = [];
    this.unassignedBudget.push(unassignedObj);
    this.showUnAssigned = unassignedObj.revenue ? true : false;
    this.isAddToProjectHidden =
      unassignedObj.revenue || !this.projObj ? false : true;

    this.isAddBudgetButtonHidden = true;
    this.isrevenueFieldDisabled = true;
    this.updatedBudget = 0;
    this.budgetHours = 0;
    if (unassignedObj.revenue) {
      this.poData.forEach((element) => {
        element.poInfo[0].showAdd = true;
        element.poInfo[0].poTotal = unassignedObj.revenue;
        element.poInfo[0].poRevenue = unassignedObj.revenue;
      });
    }
    ///// Set Pending to PO's

    const isTotalMatched = this.isScheduledMatched();
    if (isTotalMatched) {
      this.showSave = true;
    }
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  async getTosList() {
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "getTosList",
      "GET"
    );
    const approvers = await this.spServices.getGroupInfo("ExpenseApprovers");
    let arrayTo = [];
    if (approvers.results) {
      if (approvers.results.length) {
        for (const a in approvers.results) {
          if (
            approvers.results[a].Email !== undefined &&
            approvers.results[a].Email !== ""
          ) {
            arrayTo.push(approvers.results[a].Email);
          }
        }
      }
    }
    arrayTo = arrayTo.filter(this.onlyUnique);
    console.log("arrayTo ", arrayTo);
    return arrayTo;
  }

  async reduceBudget() {
    if (this.selectedReason && this.selectedReasonType && this.newBudgetHrs) {
      if (this.newBudgetHrs <= 0) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.error,
          "Budget hours cannot be less than or equal to 0.",
          true
        );
        return;
      }
      if (this.newBudgetHrs > this.budgetData[0].budget_hours) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.error,
          "New budget hours can not be greater than old budget hours.",
          true
        );
        return;
      }
      if (
        this.budgetData[0].budget_hours === this.newBudgetHrs &&
        this.selectedReasonType !==
          this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.INPUT_ERROR
      ) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.error,
          "New and old budget hours cant be same.",
          true
        );
        return;
      }
      if (this.budgetData[0].budget_hours < this.newBudgetHrs) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.error,
          "New hours cant be more than old budget hours cant be same.",
          true
        );
        return;
      }
      this.showReduction = false;
      this.budgetData[0].edited = true;
      const pfPFB: any = await this.saveUpdatePO("ReduceBudget");
      const subjectVal = "Approve project budget reduction";
      const mailSubject = this.projObj.ProjectCode + ": " + subjectVal;
      const objEmailBody = [];
      objEmailBody.push({
        key: "@@ProjectCode@@",
        value: this.projObj.ProjectCode,
      });
      objEmailBody.push({
        key: "@@ClientName@@",
        value: this.projObj.ClientLegalEntity,
      });
      objEmailBody.push({
        key: "@@SiteName@@",
        value: this.global.sharePointPageObject.webAbsoluteUrl,
      });
      objEmailBody.push({ key: "@@Title@@", value: this.projObj.Title });
      objEmailBody.push({
        key: "@@POC@@",
        value: this.projObj.PrimaryPOCText[0],
      });
      objEmailBody.push({
        key: "@@Currency@@",
        value: this.existBudgetArray.retItems[0].Currency,
      });
      objEmailBody.push({ key: "@@Reason@@", value: this.selectedReasonType });
      objEmailBody.push({ key: "@@Comments@@", value: this.selectedReason });
      objEmailBody.push({ key: "@@TotalBudget@@", value: pfPFB.pfObj.Budget });
      objEmailBody.push({
        key: "@@NetBudget@@",
        value: pfPFB.pfObj.RevenueBudget,
      });
      objEmailBody.push({ key: "@@OOPBudget@@", value: pfPFB.pfObj.OOPBudget });
      objEmailBody.push({ key: "@@TaxBudget@@", value: pfPFB.pfObj.TaxBudget });
      objEmailBody.push({
        key: "@@AddendumTotalvalue@@",
        value: pfPFB.pbbObj.OriginalBudget * -1,
      });
      objEmailBody.push({
        key: "@@AddendumNetvalue@@",
        value: pfPFB.pbbObj.NetBudget * -1,
      });
      objEmailBody.push({
        key: "@@AddendumOOPvalue@@",
        value: pfPFB.pbbObj.OOPBudget * -1,
      });
      objEmailBody.push({
        key: "@@AddendumTaxvalue@@",
        value: pfPFB.pbbObj.TaxBudget * -1,
      });
      objEmailBody.push({
        key: "@@NewTotalBudget@@",
        value: pfPFB.pfObj.Budget + pfPFB.pbbObj.OriginalBudget,
      });
      objEmailBody.push({
        key: "@@NewNetBudget@@",
        value: pfPFB.pfObj.RevenueBudget + pfPFB.pbbObj.NetBudget,
      });
      objEmailBody.push({
        key: "@@NewOOPBudget@@",
        value: pfPFB.pfObj.OOPBudget + pfPFB.pbbObj.OOPBudget,
      });
      objEmailBody.push({
        key: "@@NewTaxBudget@@",
        value: pfPFB.pfObj.TaxBudget + pfPFB.pbbObj.TaxBudget,
      });

      let tempArray = [];
      let arrayTo = [];
      const cm1IdArray = [];
      let arrayCC = [];
      let ccIDs = [];
      this.projObj.CMLevel1ID.forEach((element) => {
        cm1IdArray.push(element.ID);
      });
      arrayCC = arrayCC.concat([], cm1IdArray);
      tempArray = tempArray.concat([], this.projObj.CMLevel2ID);
      arrayTo = this.pmCommonService.getEmailId(tempArray);

      const tempUserArray = await this.getTosList();
      arrayTo = arrayTo.concat(tempUserArray);
      arrayTo = arrayTo.filter(this.onlyUnique);
      ccIDs = this.pmCommonService.getEmailId(arrayCC);
      ccIDs.push(this.pmObject.currLoginInfo.Email);
      ///// Send approval message
      this.pmCommonService.getTemplate(
        this.constant.EMAIL_TEMPLATE_NAME.BUDGET_REDUCTION,
        objEmailBody,
        mailSubject,
        arrayTo,
        ccIDs
      );
    } else {
      if (!this.selectedReasonType) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.warn,
          "Please select reason type.",
          true
        );
        return;
      }
      if (!this.selectedReason) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.warn,
          "Please enter reason.",
          true
        );
        return;
      }
      if (!this.newBudgetHrs) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.warn,
          "New Budget hours cant be zero.",
          true
        );
        return;
      }
    }
  }

  async removeUnassigned() {
    const isBudgetRedAllowed = this.projObj ? true : false;
    if (!isBudgetRedAllowed) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "Budget reduction allowed for created projects only.",
        true
      );
      return;
    }
    if (this.projectStatus === this.constant.projectList.status.InDiscussion) {
      this.budgetData[0].edited = true;
      this.budgetData[0].total =
        this.budgetData[0].total - this.unassignedBudget[0].total;
      this.budgetData[0].revenue =
        this.budgetData[0].revenue - this.unassignedBudget[0].revenue;
      const pfPFB: any = await this.saveUpdatePO("");
    } else {
      this.selectedReason = "";
      this.selectedReasonType = "";
      this.newBudgetHrs = 0;
      this.selectedProposedEndDate = new Date(this.projObj.ProposedEndDate);
      this.minDate =
        new Date(
          this.datePipe.transform(
            this.projObj.ProposedStartDate,
            "MMM dd, yyyy"
          )
        ) < new Date()
          ? new Date()
          : this.projObj.ProposedStartDate;
      this.dbProposedDate = new Date(
        this.datePipe.transform(this.projObj.ProposedEndDate, "MMM dd, yyyy")
      );
      this.budgetDecreaseArray = [];
      this.budgetDecreaseArray = [
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.SCOPE_REDUCE,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.SCOPE_REDUCE,
        },
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.QUALITY,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.QUALITY,
        },
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.RELATIONSHIP,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.RELATIONSHIP,
        },
        {
          label: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.INPUT_ERROR,
          value: this.pmConstant.PROJECT_BUDGET_DECREASE_REASON.INPUT_ERROR,
        },
      ];
      this.showReduction = true;
    }
  }

  /**
   * This method is used to add the budget to project.
   */
  addBudgetToProject() {
    let showError = false;
    if (this.projectStatus === this.constant.projectStatus.InDiscussion) {
      if (this.projObj) {
        if (this.updatedBudget === 0 && this.budgetHours === 0) {
          showError = true;
        } else if (this.updatedBudget < 0) {
          showError = true;
        } else if (this.updatedBudget !== 0 && this.budgetHours === 0) {
          showError = true;
        }
      } else {
        if (this.updatedBudget < 0) {
          this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGET;
          return;
        }
      }
    } else {
      if (this.updatedBudget === 0 && this.budgetHours === 0) {
        showError = true;
      } else if (this.updatedBudget !== 0 && this.budgetHours === 0) {
        showError = true;
      } else if (this.updatedBudget < 0) {
        showError = true;
      } else {
        this.selectedProposedEndDate = new Date(this.projObj.ProposedEndDate);
        this.dbProposedDate = new Date(this.projObj.ProposedEndDate);
        this.maxEndDate = new Date(
          this.projObj.ProposedStartDate.getFullYear() + 1,
          this.projObj.ProposedStartDate.getMonth(),
          0
        );
        this.selectedReason = "";
        this.selectedReasonType = "";
        this.budgetIncreaseArray = [];
        this.budgetIncreaseArray = [
          {
            label: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON
              .SCOPE_INCREASE,
            value: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON
              .SCOPE_INCREASE,
          },
          {
            label: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR,
            value: this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR,
          },
        ];
        this.showBudgetIncrease = true;
        return;
      }
    }

    if (!showError) {
      this.assignBudgetToProject("", "");
    } else {
      this.error = true;
      if (!this.budgetHours) {
        this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGETHrs;
      } else {
        this.errorMsg = this.pmConstant.ERROR.ADD_PROJECT_TO_BUDGET;
      }
    }
    this.enableCheckList = false;
  }

  increaseBudget() {
    if (this.selectedReason && this.selectedReasonType) {
      if (
        this.updatedBudget === 0 &&
        this.budgetHours !== 0 &&
        this.selectedReasonType !==
          this.pmConstant.PROJECT_BUDGET_INCREASE_REASON.INPUT_ERROR
      ) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.error,
          'Budget can only be zero if selected reason is "Input error".',
          true
        );
        return;
      }
      this.showBudgetIncrease = false;
      this.BudgetType = "IncreaseBudget";
      this.assignBudgetToProject(this.selectedReason, this.selectedReasonType);
    } else {
      if (!this.selectedReasonType) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.warn,
          "Please select reason type.",
          true
        );
        return;
      }
      if (!this.selectedReason) {
        this.commonService.showToastrMessage(
          this.constant.MessageType.warn,
          "Please enter reason.",
          true
        );
        return;
      }
    }
  }

  /**
   * This method is used to add Rate to project.
   */
  addRateToProject() {
    if (!this.hourlyRate) {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.BLANK_HOURLY_BUDGET;
    } else if (this.hourlyRate < 0) {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.NEGATIVE_HOURLY_BUDGET;
    } else {
      this.pmObject.addProject.FinanceManagement.OverNightRequest = this.selectedOverNightRequest;
      this.pmObject.addProject.FinanceManagement.Rate = this.hourlyRate;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.hourlyBudgetHours;
      this.isHourlyOverNightDisabled = true;
      this.isHourlyRateDisabled = true;
      this.isAddRateButtonHidden = true;
      this.isAddToProjectHidden = false;
    }
  }

  /**
   * This method is used to add PO to project.
   */
  addPoToProject() {
    if (this.selectedPo) {
      if (
        this.poData &&
        this.poData.length &&
        this.poData.filter((item) => item.poInfo[0].poId === this.selectedPo)
          .length
      ) {
        this.error = true;
        this.errorMsg = this.pmConstant.ERROR.PO_ALREADY_EXIST;
      } else {
        if (this.poData && this.poData.length) {
          this.maximizeDialog.next(); // Maxmize finance dialog
        }
        this.showPo = true;
        this.error = false;
        const tempPOObj = this.getPOObjectDetails(this.selectedPo);
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        // tempObj.Id = tempPOObj.poId;

        tempObj.poInfo.push(tempPOObj);
        this.poData.forEach((element) => {
          const zeroInv = element.poInfoData.filter((e) => e.amount === 0);
          zeroInv.forEach((elementInv) => {
            const invIndex = element.poInfoData.findIndex(
              (item) => item === elementInv
            );
            element.poInfoData.splice(invIndex, 1);
            elementInv.poId = tempPOObj.poId;
            elementInv.status = "Scheduled";
            tempObj.poInfoData.push(elementInv);
          });
        });

        if (this.existPOArray.retItems && this.existPOArray.retItems.length) {
          this.poData.unshift(tempObj);
        } else {
          this.poData.push(tempObj);
        }
        this.poData = [...this.poData];
        const poIndex = this.poData.findIndex(
          (item) => item.poInfo[0].poId === this.selectedPo
        );
        const retPOInfo = this.poData[poIndex].poInfo[0];
        if (
          this.budgetData &&
          this.budgetData.length &&
          this.unassignedBudget &&
          this.unassignedBudget.length &&
          this.budgetData[0].total === this.unassignedBudget[0].total
        ) {
          retPOInfo.poRevenue = this.budgetData[0].revenue;
          retPOInfo.poTotal = this.budgetData[0].total;
        } else {
          retPOInfo.poRevenue = this.unassignedBudget[0].revenue;
          retPOInfo.poTotal = this.unassignedBudget[0].total;
        }
      }
    } else {
      this.error = true;
      this.errorMsg = this.pmConstant.ERROR.PO_NOT_SELECTED;
    }
  }

  getPOObjectDetails(selectedPo) {
    const tempPOObj = $.extend(true, {}, this.poObj);
    tempPOObj.poId = selectedPo;
    const poValue = this.poArray.filter((x) => x.ID === selectedPo);
    if (poValue && poValue.length) {
      tempPOObj.poValue = poValue[0].Number + " - " + poValue[0].NameST;
    }
    tempPOObj.total = 0;
    tempPOObj.revenue = 0;
    tempPOObj.oop = 0;
    tempPOObj.tax = 0;
    if (this.projectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      tempPOObj.showAdd = false;
      this.showSave = true;
    } else {
      tempPOObj.showAdd = true;
    }
    tempPOObj.showDelete = true;
    tempPOObj.scValue = "Scheduled + Invoiced";
    tempPOObj.scTotal = 0;
    tempPOObj.scRevenue = 0;
    tempPOObj.scOOP = 0;
    tempPOObj.scTax = 0;
    tempPOObj.isExsitPO = false;
    tempPOObj.edited = true;
    tempPOObj.status = "Not Saved";
    tempPOObj.poRevenue =
      this.invoiceType == "revenue" ? this.unassignedBudget[0].revenue : 0;
    tempPOObj.poOOP =
      this.invoiceType == "oop" ? this.unassignedBudget[0].oop : 0;

    return tempPOObj;
  }

  /**
   * This function is used to scheduled the PO.
   */
  schedulePo(poValue) {
    this.selectedPo = poValue.poInfo[0].poId;
    const poIndex = this.poData.findIndex(
      (item) => item.poInfo[0].poId === this.selectedPo
    );
    const retPOInfo = this.poData[poIndex].poInfo[0];
    const reservePO = this.poArray.find((item) => item.ID === this.selectedPo);
    const poExistItem =
      this.existPOArray && this.existPOArray.retItems
        ? this.existPOArray.retItems.find(
            (poObj) => poObj.Id === this.poData[poIndex].Id
          )
        : null;
    if (
      this.invoiceType == "revenue" ? !retPOInfo.poRevenue : !retPOInfo.poOOP
    ) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "Enter " + this.invoiceType + " amount to be assigned to PO.",
        true
      );
    }

    const nAvailableToTag =
      this.invoiceType == "revenue"
        ? reservePO.AmountRevenue -
          reservePO.RevenueLinked +
          (poExistItem ? poExistItem.AmountRevenue - retPOInfo.revenue : 0)
        : reservePO.AmountOOP -
          reservePO.OOPLinked +
          (poExistItem ? poExistItem.AmountOOP - retPOInfo.oop : 0);

    const available =
      this.invoiceType == "revenue"
        ? nAvailableToTag < retPOInfo.poRevenue
        : nAvailableToTag < retPOInfo.poOOP;

    if (available) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "PO " +
          this.invoiceType +
          " balance should be greater than or equal to the amount to reserved on PO.",
        true
      );
      return;
    }

    // if (retPOInfo.poRevenue) {
    if (
      this.unassignedBudget[0].total === 0 &&
      (this.unassignedBudget[0].revenue === 0 ||
        this.unassignedBudget[0].oop === 0)
    ) {
      retPOInfo.revenue = retPOInfo.revenue + retPOInfo.poRevenue;
      retPOInfo.oop = retPOInfo.oop + (retPOInfo.poOOP ? retPOInfo.poOOP : 0);
      retPOInfo.total = retPOInfo.revenue + retPOInfo.oop + retPOInfo.tax;
      retPOInfo.tax = retPOInfo.tax + (retPOInfo.tax ? retPOInfo.tax : 0);
    }
    if (
      this.unassignedBudget[0].total !== 0 &&
      (this.unassignedBudget[0].revenue !== 0 ||
        this.unassignedBudget[0].oop !== 0)
    ) {
      retPOInfo.revenue = retPOInfo.revenue + retPOInfo.poRevenue;
      retPOInfo.oop = retPOInfo.oop + (retPOInfo.poOOP ? retPOInfo.poOOP : 0);
      retPOInfo.total = retPOInfo.revenue + retPOInfo.oop + retPOInfo.tax;
      retPOInfo.tax = retPOInfo.tax + (retPOInfo.tax ? retPOInfo.tax : 0);
      this.unassignedBudget[0].total =
        this.unassignedBudget[0].total -
        retPOInfo.poRevenue -
        (retPOInfo.poOOP ? retPOInfo.poOOP : 0); //- retPOInfo.tax;
      this.unassignedBudget[0].revenue =
        this.unassignedBudget[0].revenue - retPOInfo.poRevenue;
      this.unassignedBudget[0].oop =
        this.unassignedBudget[0].oop - (retPOInfo.poOOP ? retPOInfo.poOOP : 0);
      // this.unassignedBudget[0].tax = this.unassignedBudget[0].tax - retPOInfo.tax;
    }
    // Add the value to Po header.
    this.poHeader.total = parseFloat(
      (
        this.poHeader.total +
        retPOInfo.poRevenue +
        (retPOInfo.poOOP ? retPOInfo.poOOP : 0)
      ).toFixed(2)
    );
    this.poHeader.revenue = this.poHeader.revenue + retPOInfo.poRevenue;
    // this.poHeader.tax = this.poHeader.tax + retPOInfo.tax;
    this.poHeader.oop =
      this.poHeader.oop + (retPOInfo.poOOP ? retPOInfo.poOOP : 0);
    // }
    retPOInfo.poRevenue = 0;
    retPOInfo.poOOP = 0;
    retPOInfo.poTotal = 0;
    retPOInfo.showInvoice = this.invoiceType == "revenue" ? true : false;
    retPOInfo.edited = true;
    this.error = false;
    if (
      this.unassignedBudget &&
      this.unassignedBudget.length &&
      this.unassignedBudget[0].revenue === 0 &&
      this.unassignedBudget[0].oop === 0
    ) {
      this.poData.forEach((element) => {
        element.poInfo[0].poRevenue = 0;
        element.poInfo[0].poTotal = 0;
        element.poInfo[0].poOOP = 0;
        element.poInfo[0].showAdd = false;
        if (element.poInfo[0].total === 0) {
          element.poInfo[0].showDelete = true;
        } else {
          element.poInfo[0].showDelete = false;
        }
        const invLineItem = element.poInfoData.filter(
          (e) => e.amount === 0 && e.type == "oop"
        );
        invLineItem.forEach((elementInv) => {
          const invIndex = element.poInfoData.findIndex(
            (item) => item === elementInv
          );
          element.poInfoData.splice(invIndex, 1);
          elementInv.poId = this.selectedPo;
          this.poData[poIndex].poInfoData.push(elementInv);
        });
      });
      this.isPoRevenueDisabled = true;
      this.isAddToProjectHidden = true;
    } else if (
      this.unassignedBudget &&
      this.unassignedBudget.length &&
      this.unassignedBudget[0].revenue !== 0 &&
      this.unassignedBudget[0].oop !== 0
    ) {
      this.poData.forEach((element) => {
        element.poInfo[0].poRevenue = this.unassignedBudget[0].revenue;
        element.poInfo[0].poTotal = this.unassignedBudget[0].total;
        element.poInfo[0].poOOP = this.unassignedBudget[0].oop;
        element.poInfo[0].showAdd = true;
        if (element.poInfo[0].total === 0) {
          element.poInfo[0].showDelete = true;
        } else {
          element.poInfo[0].showDelete = false;
        }
      });
    } else {
      retPOInfo.showAdd = true;
      retPOInfo.showDelete = retPOInfo.isExsitPO ? false : true;
      this.isPoRevenueDisabled = false;
      this.isAddToProjectHidden = false;
    }
    this.selectedPo = "";
    this.budgetData[0].edited = true;

    const isTotalMatched = this.isScheduledMatched();
    if (isTotalMatched) {
      this.showSave = true;
    } else {
      this.showSave = false;
    }
  }

  setInvData() {
    const invID = this.advanceInvID;
    const oInv = this.arrAdvanceInvoices.find((e) => e.ID === invID);
    this.existingInvDate = this.datePipe.transform(
      oInv.InvoiceDate,
      "MMM, dd, yyyy"
    );
    this.existingInvAmount = oInv.Amount;
    this.invBalance = oInv.Amount - oInv.TaggedAmount;
  }

  tagToInv() {
    const invID = this.advanceInvID;
    const oInv = this.arrAdvanceInvoices.find((e) => e.ID === invID);
    if (this.newInvAmount === 0) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "Amount to be tagged cannot be zero.",
        true
      );
      return;
    }
    if (this.newInvAmount > this.invBalance) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "Amount to be tagged cannot be greater than Balance Amount.",
        true
      );
      return;
    }

    const poValue = this.poData.find(
      (e) => e.poInfo[0].poId === this.selectedPo
    );
    const retPOInfo = poValue.poInfo[0];
    if (retPOInfo.revenue - retPOInfo.scRevenue < this.newInvAmount) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.error,
        "Amount to be tagged cannot be greater than amount to be scheduled on PO",
        true
      );
      return;
    }
    const tempPOObj = $.extend(true, {}, this.poAddObj);
    tempPOObj.poId = this.selectedPo;
    tempPOObj.inv_number = oInv.InvoiceNumber;
    tempPOObj.auxiliaryInvoiceName = oInv.AuxiliaryInvoiceName;
    tempPOObj.prf_number = "";
    tempPOObj.invUrl = oInv.FileURL;
    tempPOObj.prfUrl = "";
    tempPOObj.date = new Date(this.existingInvDate);
    tempPOObj.amount = this.newInvAmount;
    tempPOObj.type = "revenue";
    tempPOObj.status = this.constant.STATUS.APPROVED;
    tempPOObj.poc = oInv.MainPOC;
    tempPOObj.pocText = this.pmCommonService.extractNamefromPOC([
      tempPOObj.poc,
    ]);
    tempPOObj.address = oInv.AddressType;
    tempPOObj.isExsitInv = false;
    tempPOObj.edited = true;
    tempPOObj.proformaLookup = oInv.ProformaLookup;
    tempPOObj.invoiceLookup = oInv.ID;

    retPOInfo.edited = true;
    retPOInfo.scTotal = retPOInfo.scTotal + this.newInvAmount;
    retPOInfo.scRevenue = retPOInfo.scRevenue + this.newInvAmount;
    retPOInfo.scOOP = retPOInfo.scOOP + 0;
    retPOInfo.scTax = retPOInfo.scTax + 0;
    this.tagExistingInvSection = false;

    poValue.poInfoData.push(tempPOObj);

    if (
      retPOInfo.oop === retPOInfo.scOOP ||
      retPOInfo.revenue === retPOInfo.scRevenue
    ) {
      retPOInfo.showAdd = false;
      retPOInfo.showDelete = false;
      retPOInfo.showInvoice = false;
    }
    const isTotalMatched = this.isScheduledMatched();
    if (isTotalMatched) {
      this.showSave = true;
    }
  }

  createScheduleInvoice(poValue) {
    this.selectedPo = poValue.poInfo[0].poId;
    const arrINV = this.arrAdvanceInvoices.filter(
      (e) => e.PO === this.selectedPo
    );
    if (arrINV.length) {
      // this.relatedInvoiceLinkingPopup = true;
      this.commonService
        .confirmMessageDialog(
          "Advance invoice tagging decision",
          " There is an advance invoice existing on this PO. Do you want to tag the project to that invoice or create a new schedule ?",
          "Note: Ideally the project should be tagged to the advance invoice rather than scheduling new invoice on the PO.",
          ["Tag to existing", "Schedule New Invoice", "Cancel"],
          false
        )
        .then(async (Confirmation) => {
          if (Confirmation === "Tag to existing") {
            const arrINV = this.arrAdvanceInvoices.filter(
              (e) => e.PO === this.selectedPo
            );
            this.advanceInvArray = [];
            arrINV.forEach((element) => {
              this.advanceInvArray.push({
                label: element.InvoiceNumber,
                value: element.ID,
              });
            });
            this.tagExistingInvSection = true;
          } else if (Confirmation === "Schedule New Invoice") {
            const poValue = this.poData.find(
              (e) => e.poInfo[0].poId === this.selectedPo
            );
            this.scheduleInvoice(poValue);
          }
        });
    } else {
      this.scheduleInvoice(poValue);
    }
  }

  /**
   * This method is called when schedule invoice will trigger.
   */
  scheduleInvoice(poValue) {
    this.isInvoiceEdit = false;
    this.invoiceHeader = "Add Invoice Line Item";
    this.selectedPo = poValue.poInfo[0].poId;
    const clientLegalEntity = this.isPOEdit
      ? this.config.data.projectObj.ClientLegalEntity
      : this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    this.primaryPoc = [];
    this.addPOForm.get("amount").setValue(0);
    const poc = this.pmObject.projectContactsItems.filter(
      (obj) => obj.ClientLegalEntity === clientLegalEntity
    );
    if (poc && poc.length) {
      // tslint:disable-next-line:no-shadowed-variable
      poc.forEach((element) => {
        this.primaryPoc.push({ label: element.FullNameCC, value: element.ID });
      });
    }
    this.showAddInvoiceDetails = true;
  }

  /**
   * This method is used to add the invoice details.
   */
  addInvoiceDetails() {
    this.addInvoiceError = false;
    if (this.isInvoiceEdit) {
      this.selectedPo = this.invoiceObj.poId;
      const poIndex = this.poData.findIndex(
        (item) => item.poInfo[0].poId === this.selectedPo
      );
      const poInfo = this.poData[poIndex].poInfo[0];
      const amount = this.addPOForm.get("amount").value;
      if (this.invoiceType == "oop" && amount !== 0 && !poInfo.edited) {
        this.addInvoiceError = true;
        this.addInvoiceErrorMsg = "OOP amount should be zero.";
        return;
      }
      if (this.invoiceObj.amount !== amount) {
        //// Reduce amount on inv, po and add unassigned
        const poIndex = this.poData.findIndex(
          (item) => item.poInfo[0].poId === this.invoiceObj.poId
        );
        const retPOInfo = this.poData[poIndex].poInfo[0];
        if (this.invoiceObj.amount > amount) {
          //// Reduce all
          this.invoiceType == "revenue"
            ? (retPOInfo.scRevenue =
                retPOInfo.scRevenue - this.invoiceObj.amount + amount)
            : (retPOInfo.scOOP =
                retPOInfo.scOOP - this.invoiceObj.amount + amount);
          retPOInfo.scTotal = parseFloat(
            (retPOInfo.scTotal - this.invoiceObj.amount + amount).toFixed(2)
          );
          let poHeaderTotal = (
            this.poHeader.total -
            this.invoiceObj.amount +
            amount
          ).toFixed(2);
          this.poHeader.total = parseFloat(poHeaderTotal);
          this.invoiceType == "revenue"
            ? (this.poHeader.revenue =
                this.poHeader.revenue - this.invoiceObj.amount + amount)
            : (this.poHeader.oop =
                this.poHeader.oop - this.invoiceObj.amount + amount);
          this.invoiceType == "revenue"
            ? (this.unassignedBudget[0].revenue =
                this.unassignedBudget[0].revenue +
                (this.invoiceObj.amount - amount))
            : (this.unassignedBudget[0].oop =
                this.unassignedBudget[0].oop +
                (this.invoiceObj.amount - amount));
          this.unassignedBudget[0].total =
            this.unassignedBudget[0].total + (this.invoiceObj.amount - amount);
          this.invoiceType == "revenue"
            ? (retPOInfo.revenue =
                retPOInfo.revenue - this.invoiceObj.amount + amount)
            : (retPOInfo.oop = retPOInfo.oop - this.invoiceObj.amount + amount);
          retPOInfo.total = parseFloat(
            (retPOInfo.total - this.invoiceObj.amount + amount).toFixed(2)
          );
          retPOInfo.showAdd = true;
          retPOInfo.showDelete = false;
          if (
            retPOInfo.oop === retPOInfo.scOOP ||
            retPOInfo.revenue === retPOInfo.scRevenue
          ) {
            retPOInfo.showInvoice = false;
          }
          this.poData.forEach((element) => {
            element.poInfo[0].poOOP = this.unassignedBudget[0].oop;
            element.poInfo[0].poRevenue = this.unassignedBudget[0].revenue;
            element.poInfo[0].poTotal = this.unassignedBudget[0].total;
            element.poInfo[0].showAdd = true;
            if (element.poInfo[0].total === 0) {
              element.poInfo[0].showDelete = true;
            }
          });
          this.isAddToProjectHidden =
            this.invoiceType == "revenue"
              ? this.unassignedBudget[0].revenue
                ? false
                : true
              : this.unassignedBudget[0].oop
              ? false
              : true;
          this.showUnAssigned = this.unassignedBudget[0].revenue ? true : false;
        } else {
          ///// Check and add
          if (
            this.invoiceType == "revenue"
              ? retPOInfo.revenue -
                  (retPOInfo.scRevenue - this.invoiceObj.amount) >=
                amount
              : retPOInfo.oop - (retPOInfo.scOOP - this.invoiceObj.amount) >=
                amount
          ) {
            this.invoiceType == "revenue"
              ? (retPOInfo.scRevenue =
                  retPOInfo.scRevenue - this.invoiceObj.amount + amount)
              : (retPOInfo.scOOP =
                  retPOInfo.scOOP - this.invoiceObj.amount + amount);
            retPOInfo.scTotal =
              retPOInfo.scTotal - this.invoiceObj.amount + amount;
          } else {
            this.addInvoiceError = true;
            this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_GREATER;
            return;
          }
          if (
            retPOInfo.oop === retPOInfo.scOOP &&
            retPOInfo.revenue === retPOInfo.scRevenue
          ) {
            retPOInfo.showAdd = false;
            retPOInfo.showDelete = false;
            retPOInfo.showInvoice = false;
          }
        }
        this.invoiceObj.amount = amount;
        this.invoiceObj.isInvoiceItemConfirm = false;
        this.invoiceObj.poc = this.addPOForm.value.primarypoc;
        this.invoiceObj.pocText = this.pmCommonService.extractNamefromPOC([
          this.invoiceObj.poc,
        ]);
        this.invoiceObj.address = this.addPOForm.value.address;
        this.invoiceObj.edited = true;
        retPOInfo.edited = true;
        this.showAddInvoiceDetails = false;

        const isTotalMatched = this.isScheduledMatched();
        if (isTotalMatched) {
          this.showSave = true;
        }
      } else {
        this.saveInvoiceEdit();
      }
    } else {
      const poIndex = this.poData.findIndex(
        (item) => item.poInfo[0].poId === this.selectedPo
      );
      const retPOInfo = this.poData[poIndex].poInfo[0];
      this.addInvoiceError = false;
      if (this.addPOForm.valid) {
        if (this.addPOForm.value.amount <= 0) {
          this.addInvoiceError = true;
          this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_ZERO;
          return;
        }
        const tempPOObj = $.extend(true, {}, this.poAddObj);
        tempPOObj.poId = retPOInfo.poId;
        tempPOObj.inv_number = "";
        tempPOObj.prf_number = "";
        tempPOObj.invUrl = "";
        tempPOObj.prfUrl = "";
        tempPOObj.date = new Date(
          this.datePipe.transform(this.addPOForm.value.poDate, "MMM d, y")
        );
        tempPOObj.amount = this.addPOForm.value.amount;
        tempPOObj.type = this.invoiceType;
        tempPOObj.status = this.constant.STATUS.NOT_SAVED;
        tempPOObj.poc = this.addPOForm.value.primarypoc;
        tempPOObj.pocText = this.pmCommonService.extractNamefromPOC([
          tempPOObj.poc,
        ]);
        tempPOObj.address = this.addPOForm.value.address;
        tempPOObj.isExsitInv = false;
        tempPOObj.edited = true;

        if (
          this.invoiceType == "revenue"
            ? tempPOObj.amount > retPOInfo.revenue - retPOInfo.scRevenue
            : tempPOObj.amount > retPOInfo.oop - retPOInfo.scOOP
        ) {
          this.addInvoiceError = true;
          this.addInvoiceErrorMsg = this.pmConstant.ERROR.INVOICE_AMOUNT_GREATER;
        } else {
          retPOInfo.edited = true;
          retPOInfo.scTotal = retPOInfo.scTotal + this.addPOForm.value.amount;
          retPOInfo.scRevenue =
            retPOInfo.scRevenue +
            (this.invoiceType == "revenue" ? this.addPOForm.value.amount : 0);
          retPOInfo.scOOP =
            retPOInfo.scOOP +
            (this.invoiceType == "oop" ? this.addPOForm.value.amount : 0);
          retPOInfo.scTax = retPOInfo.scTax + 0;
          this.poData[poIndex].poInfoData.push(tempPOObj);
          this.showAddInvoiceDetails = false;
          if (
            retPOInfo.oop === retPOInfo.scOOP &&
            retPOInfo.revenue === retPOInfo.scRevenue
          ) {
            retPOInfo.showAdd = false;
            retPOInfo.showDelete = false;
            retPOInfo.showInvoice = false;
          }
          const isTotalMatched = this.isScheduledMatched();
          if (isTotalMatched) {
            this.showSave = true;
          }
        }
      } else {
        this.validateAllFormFields(this.addPOForm);
      }
    }
    this.isInvoiceEdit = false;
    this.hideMoveLineItem = this.hideMoveLineItem === true ? false : true;
  }

  /***
   * This function is used to validate the form field
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /***
   * This method is used to check whether if all the budget has been scheduled or not
   */
  isScheduledMatched() {
    // check unassigned is total is 0 & all the PO's revenue should be matched with scheduled.
    let isValid = true;
    if (
      this.unassignedBudget &&
      this.unassignedBudget.length &&
      this.unassignedBudget[0].revenue === 0
    ) {
      // tslint:disable-next-line:no-shadowed-variable
      this.poData.forEach((poInfoObj) => {
        // tslint:disable-next-line:no-shadowed-variable
        poInfoObj.poInfo.forEach((element) => {
          element.revenue = element.revenue ? element.revenue : 0;
          element.scRevenue = element.scRevenue ? element.scRevenue : 0;
          element.oop = element.oop ? element.oop : 0;
          element.scOOP = element.scOOP ? element.scOOP : 0;
          if (
            element.revenue !== element.scRevenue ||
            element.oop !== element.scOOP
          ) {
            isValid = false;
          }
        });
      });
      return isValid;
    } else {
      return false;
    }
  }

  /***
   * This method is used to remove the the particular po if delete icon is clicked.
   * @param poObj The parameter should be PO object.
   */
  removePO(poObj) {
    this.selectedPo = poObj.poInfo[0].poId;

    this.commonService
      .confirmMessageDialog(
        "Remove PO from project",
        "Are you sure you want to remove the po from project ?",
        null,
        ["Yes", "No"],
        false
      )
      .then(async (Confirmation) => {
        if (Confirmation === "Yes") {
          if (poObj.poInfo[0].status === "Not Saved") {
            const arrayIndex = this.poData.findIndex(
              (x) => x.Id === this.selectedPo
            );
            this.poData.splice(arrayIndex, 1);
          } else {
            poObj.poInfo[0].status = "Deleted";
            poObj.poInfo[0].edited = true;
            poObj.poInfoData.forEach((element) => {
              element.status = "Deleted";
              element.edited = true;
            });
          }

          this.isAddToProjectHidden = false;
          this.unassignedBudget[0].total =
            this.unassignedBudget[0].total + poObj.poInfo[0].total;
          this.unassignedBudget[0].revenue =
            this.unassignedBudget[0].revenue + poObj.poInfo[0].revenue;
          this.unassignedBudget[0].oop =
            this.unassignedBudget[0].oop + poObj.poInfo[0].oop;
          this.unassignedBudget[0].tax =
            this.unassignedBudget[0].tax + poObj.poInfo[0].tax;
          // PO Header//
          this.poHeader.total = this.poHeader.total - poObj.poInfo[0].total;
          this.poHeader.revenue =
            this.poHeader.revenue - poObj.poInfo[0].revenue;
          this.poHeader.tax = this.poHeader.tax - poObj.poInfo[0].tax;
          this.poHeader.oop = this.poHeader.oop - poObj.poInfo[0].oop;
          if (
            this.unassignedBudget &&
            this.unassignedBudget.length &&
            this.unassignedBudget[0].total === 0
          ) {
            this.isPoRevenueDisabled = true;
          } else {
            this.isPoRevenueDisabled = false;
          }
          const isTotalMatched = this.isScheduledMatched();
          if (isTotalMatched) {
            this.showSave = true;
          }
        }
      });
  }

  async cancelOOP(rowData) {
    this.commonService
      .confirmMessageDialog(
        "Delete OOP",
        "Are you sure you want to delete oop",
        null,
        ["Yes", "No"],
        false
      )
      .then(async (Confirmation) => {
        if (Confirmation === "Yes") {
          const sowItem = await this.getSowDetails(this.projObj.SOWCode);
          await this.getSpendingDetails(rowData);
          let poItem = this.poArray.filter((e) => e.ID == rowData.poId);
          const batchUrl = [];
          let invLineItem = {
            __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
            Status: "Deleted",
          };
          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getItemURL(
              this.constant.listNames.InvoiceLineItems.name,
              +rowData.Id
            ),
            invLineItem,
            this.constant.Method.PATCH,
            this.constant.listNames.InvoiceLineItems.name
          );

          let spendInfo = {
            __metadata: { type: this.constant.listNames.SpendingInfo.type },
            Status: "Approved",
          };

          this.spendingInfoDetails.retItems.forEach((spending) => {
            this.commonService.setBatchObject(
              batchUrl,
              this.spServices.getItemURL(
                this.constant.listNames.SpendingInfo.name,
                +spending.Id
              ),
              spendInfo,
              this.constant.Method.PATCH,
              this.constant.listNames.SpendingInfo.name
            );
          });

          const poLinkedAmt = poItem[0].OOPLinked
            ? parseFloat(poItem[0].OOPLinked) - parseFloat(rowData.amount)
            : 0;
          const poTotalLinkedAmt = poItem[0].TotalLinked
            ? parseFloat(poItem[0].TotalLinked) - parseFloat(rowData.amount)
            : 0;
          const poScheduledOOP = poItem[0].ScheduledOOP
            ? parseFloat(poItem[0].ScheduledOOP) - parseFloat(rowData.amount)
            : 0;
          const poTotalScheduled = poItem[0].TotalScheduled
            ? parseFloat(poItem[0].TotalScheduled) - parseFloat(rowData.amount)
            : 0;

          let poData = {
            __metadata: { type: this.constant.listNames.PO.type },
            OOPLinked: parseFloat(poLinkedAmt.toFixed(2)),
            TotalLinked: parseFloat(poTotalLinkedAmt.toFixed(2)),
            ScheduledOOP: parseFloat(poScheduledOOP.toFixed(2)),
            TotalScheduled: parseFloat(poTotalScheduled.toFixed(2)),
          };

          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getItemURL(
              this.constant.listNames.PO.name,
              rowData.poId
            ),
            poData,
            this.constant.Method.PATCH,
            this.constant.listNames.PO.name
          );

          let pbb = {
            __metadata: {
              type: this.constant.listNames.ProjectBudgetBreakup.type,
            },
            ProjectLookup: this.projObj.ID,
            Status: this.constant.STATUS.APPROVED,
            ApprovalDate: new Date().toISOString(),
            OriginalBudget: -parseFloat(rowData.amount),
            OOPBudget: -parseFloat(rowData.amount),
            ProjectCode: this.projObj.ProjectCode,
          };

          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getReadURL(
              this.constant.listNames.ProjectBudgetBreakup.name,
              null
            ),
            pbb,
            this.constant.Method.POST,
            this.constant.listNames.ProjectBudgetBreakup.name
          );

          const oldScheduledOOP = this.existBudgetArray.retItems[0].ScheduledOOP
            ? this.existBudgetArray.retItems[0].ScheduledOOP
            : 0;
          const oldTotalScheduled = this.existBudgetArray.retItems[0]
            .InvoicesScheduled
            ? this.existBudgetArray.retItems[0].InvoicesScheduled
            : 0;

          let pfdata = {
            __metadata: {
              type: this.constant.listNames.ProjectFinances.type,
            },
            ScheduledOOP:
              parseFloat(oldScheduledOOP) - parseFloat(rowData.amount),
            InvoicesScheduled:
              parseFloat(oldTotalScheduled) - parseFloat(rowData.amount),
            Budget: this.existBudgetArray.retItems[0].Budget
              ? parseFloat(this.existBudgetArray.retItems[0].Budget) -
                parseFloat(rowData.amount)
              : 0,
            OOPBudget: this.existBudgetArray.retItems[0].OOPBudget
              ? parseFloat(this.existBudgetArray.retItems[0].OOPBudget) -
                parseFloat(rowData.amount)
              : 0,
          };

          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getItemURL(
              this.constant.listNames.ProjectFinances.name,
              this.existBudgetArray.retItems[0].Id
            ),
            pfdata,
            this.constant.Method.PATCH,
            this.constant.listNames.ProjectFinances.name
          );

          let pfbAmountOOP = parseFloat(rowData.amount);
          let pfbAmount = parseFloat(rowData.amount);
          let pfbScheduledOOP = parseFloat(rowData.amount);
          let pfbTotalScheduled = parseFloat(rowData.amount);

          for (let i = 0; i < this.existPOArray.retItems.length; i++) {
            let element = this.existPOArray.retItems[i];
            if (element.POLookup == rowData.poId) {
              this.currentId = element.Id;
              pfbScheduledOOP = element.ScheduledOOP
                ? parseFloat(element.ScheduledOOP) - parseFloat(rowData.amount)
                : 0;
              pfbTotalScheduled = element.TotalScheduled
                ? parseFloat(element.TotalScheduled) -
                  parseFloat(rowData.amount)
                : 0;
              pfbAmountOOP = element.AmountOOP
                ? parseFloat(element.AmountOOP) - parseFloat(rowData.amount)
                : 0;
              pfbAmount = element.Amount
                ? parseFloat(element.Amount) - parseFloat(rowData.amount)
                : 0;
            }
          }

          let pfbdata = {
            __metadata: {
              type: this.constant.listNames.ProjectFinanceBreakup.type,
            },
            Amount: pfbAmount,
            AmountOOP: pfbAmountOOP,
            ScheduledOOP: pfbScheduledOOP,
            TotalScheduled: pfbTotalScheduled,
          };

          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getItemURL(
              this.constant.listNames.ProjectFinanceBreakup.name,
              this.currentId
            ),
            pfbdata,
            this.constant.Method.PATCH,
            this.constant.listNames.ProjectFinanceBreakup.name
          );

          let sowdata = {
            __metadata: {
              type: this.constant.listNames.SOW.type,
            },
            TotalLinked: sowItem.TotalLinked
              ? parseFloat(sowItem.TotalLinked) - rowData.amount
              : rowData.amount,
            OOPLinked: sowItem.OOPLinked
              ? parseFloat(sowItem.OOPLinked) - rowData.amount
              : rowData.amount,
            TotalScheduled: sowItem.TotalScheduled
              ? parseFloat(sowItem.TotalScheduled) - rowData.amount
              : rowData.amount,
            ScheduledOOP: sowItem.ScheduledOOP
              ? parseFloat(sowItem.ScheduledOOP) - rowData.amount
              : rowData.amount,
          };

          this.commonService.setBatchObject(
            batchUrl,
            this.spServices.getItemURL(
              this.constant.listNames.SOW.name,
              sowItem.ID
            ),
            sowdata,
            this.constant.Method.PATCH,
            this.constant.listNames.SOW.name
          );

          await this.spServices.executeBatch(batchUrl);
          this.commonService.showToastrMessage(
            this.constant.MessageType.success,
            "OOP line item is Cancelled",
            true
          );
          setTimeout(() => {
            this.reInitializePopup();
          }, this.pmConstant.TIME_OUT);
        }
      });
  }

  async getSowDetails(sowCode) {
    if (this.sowList.length === 0) {
      const res = await this.spServices.readItems(
        this.constant.listNames.SOW.name,
        this.pmConstant.FINANCE_QUERY.sowList
      );
      this.sowList = res.length ? res : [];
    }

    return this.sowList.find((c) => c.SOWCode === sowCode)
      ? this.sowList.find((c) => c.SOWCode === sowCode)
      : "";
  }

  lineItemConfirmAllowed(invoice) {
    invoice.reasonsArray = [];
    const POObj = this.poArray.find((c) => c.Id === invoice.poId);
    const currentDate = new Date();
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    const last3Days = this.commonService.getLastWorkingDay(3, new Date());
    if (
      invoice.date >= last3Days &&
      invoice.date < lastDay &&
      invoice.amount > 0 &&
      POObj.POCategory !== "Client PO Pending" &&
      new Date(POObj.POExpiryDate) >=
        new Date(new Date(this.datePipe.transform(new Date(), "MMM dd , yyyy")))
    ) {
      return true;
    } else {
      if (invoice.date < last3Days) {
        invoice.reasonsArray.push(
          "Invoice date should be greater than " +
            this.datePipe.transform(last3Days, "MMM dd,yyyy")
        );
      }
      if (invoice.date >= lastDay) {
        invoice.reasonsArray.push(
          "Invoice date should be less than " +
            this.datePipe.transform(lastDay, "MMM dd,yyyy")
        );
      }
      if (invoice.amount <= 0) {
        this.reasonsArray.push("Invoice amount should be greater than 0");
      }
      if (
        new Date(POObj.POExpiryDate) <
        new Date(new Date(this.datePipe.transform(new Date(), "MMM dd , yyyy")))
      ) {
        invoice.reasonsArray.push(
          "Po expiry date should be greater than or equal to today"
        );
      }
      if (POObj.POCategory === "Client PO Pending") {
        invoice.reasonsArray.push(
          "Po category should not be equal to Client PO Pending"
        );
      }
      return false;
    }
  }

  /***
   * This method is used to save the PO.
   */
  savePo() {
    this.savePOArray.push({
      budget: this.budgetData,
      PO: this.poData,
      Rate: this.hourlyRate,
      OverNightRequest: this.selectedOverNightRequest,
      arrAdvanceInvoices: this.arrAdvanceInvoices,
    });
    // store value into global variable.
    this.pmObject.addProject.FinanceManagement.POListArray = this.poArray;
    this.pmObject.addProject.FinanceManagement.POArray = this.poData;
    this.pmObject.addProject.FinanceManagement.BudgetArray = this.budgetData;
    this.pmObject.addProject.FinanceManagement.UnassignedArray = this.unassignedBudget;
    this.budgetOutputData.emit(this.savePOArray);
    this.pmObject.addProject.FinanceManagement.isBudgetRateAdded = true;
    this.pmObject.addProject.FinanceManagement.BilledBy = this.projectType;
  }

  ////////// Refactor
  async editManageFinances(projObj) {
    this.hideRemoveButton = false;
    this.pmObject.isMainLoaderHidden = false;
    this.poData = [];
    this.isBudgetHoursDisabled = false;
    this.sowNumber = projObj.SOWCode;
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };

    if (
      this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value
    ) {
      this.showHourly = true;
      this.isrevenueFieldDisabled = true;
      this.isAddBudgetButtonHidden = true;
      this.isPoRevenueDisabled = true;
      this.isAddRateButtonHidden = true;
      this.isHourlyRateDisabled = true;
      this.isHourlyOverNightDisabled = true;
      // this.isAddBudgetButtonHidden = true;
    } else {
      this.showHourly = false;
      this.isrevenueFieldDisabled = false;
      this.isAddBudgetButtonHidden = false;
      this.isPoRevenueDisabled = false;
    }

    // Get Project Finance  ##0;
    const pfFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BY_PROJECTCODE
    );
    pfFilter.filter = pfFilter.filter.replace(
      /{{projectCode}}/gi,
      projObj.ProjectCode
    );

    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.ProjectFinances.name,
        pfFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.ProjectFinances.name
    );

    // Get Project Finance Breakup  ##1;
    const pfbFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.PROJECT_FINANCE_BREAKUP_BY_PROJECTCODE
    );
    pfbFilter.filter = pfbFilter.filter.replace(
      /{{projectCode}}/gi,
      projObj.ProjectCode
    );
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.ProjectFinanceBreakup.name,
        pfbFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.ProjectFinanceBreakup.name
    );

    // Get Invoice Line Items  ##2;
    const iliFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE
    );
    iliFilter.filter = iliFilter.filter.replace(
      /{{projectCode}}/gi,
      projObj.ProjectCode
    );
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.InvoiceLineItems.name,
        iliFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.InvoiceLineItems.name
    );

    // Get PBB  ##3;
    const pbbFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.PROJECT_BUDGET_BREAKUP
    );
    pbbFilter.filter = pbbFilter.filter.replace(
      /{{projectCode}}/gi,
      projObj.ProjectCode
    );

    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.ProjectBudgetBreakup.name,
        pbbFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.ProjectBudgetBreakup.name
    );

    // Get PBB Get All ##4;
    const pbbFilterALL = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.PROJECT_BUDGET_BREAKUP_FOR_ALL
    );
    pbbFilterALL.filter = pbbFilterALL.filter.replace(
      /{{projectCode}}/gi,
      projObj.ProjectCode
    );

    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.ProjectBudgetBreakup.name,
        pbbFilterALL
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.ProjectBudgetBreakup.name
    );

    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "GET-PF-PFB-PBB-ILI",
      "GET-BATCH"
    );
    const result = await this.spServices.executeBatch(batchURL);
    this.budgetData = [];

    if (result && result.length) {
      this.existBudgetArray = result[0];
      this.existPOArray = result[1];
      this.existPOInvoiceArray = result[2];
      this.existPBBBudgetArray = result[3];
      // this.spendingInfoDetails = result[4];
      this.allPbbDetails = result[4];
      await this.getInitData(
        projObj.ProjectCode,
        projObj.ClientLegalEntity,
        this.existBudgetArray.retItems[0].Currency
      );
      const tempbudgetObject = $.extend(true, {}, this.budgetObj);
      this.budgetHours = 0;
      tempbudgetObject.revenue = this.existBudgetArray.retItems[0].RevenueBudget;
      tempbudgetObject.tax = this.existBudgetArray.retItems[0].TaxBudget;
      tempbudgetObject.total = this.existBudgetArray.retItems[0].Budget;
      tempbudgetObject.oop = this.existBudgetArray.retItems[0].OOPBudget;
      tempbudgetObject.budget_hours = this.existBudgetArray.retItems[0].BudgetHrs;
      this.budgetData.push(tempbudgetObject);

      let poTotal = 0;
      let poRev = 0;
      let poOOP = 0;
      let poTax = 0;
      const poValueArray = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < this.existPOArray.retItems.length; index++) {
        const poItem = this.existPOArray.retItems[index];
        const poValue = this.poArray.filter((x) => x.ID === poItem.POLookup);
        if (poValue.length === 0) {
          poValueArray.push(poItem.POLookup);
        }
      }
      if (poValueArray) {
        const batchURLs = [];
        poValueArray.forEach((POelement) => {
          const poCloseGetFilter = Object.assign(
            {},
            this.pmConstant.FINANCE_QUERY.GET_ClosePO
          );
          poCloseGetFilter.filter = poCloseGetFilter.filter.replace(
            /{{Id}}/gi,
            POelement
          );
          this.commonService.setBatchObject(
            batchURLs,
            this.spServices.getReadURL(
              this.constant.listNames.PO.name,
              poCloseGetFilter
            ),
            null,
            this.constant.Method.GET,
            this.constant.listNames.PO.name
          );
        });
        this.commonService.SetNewrelic(
          "projectManagment",
          "manage-finance",
          "GetListNames",
          "GET-BATCH"
        );
        const POresult = await this.spServices.executeBatch(batchURLs);
        this.poArray.push.apply(
          this.poArray,
          POresult.map((c) => c.retItems[0])
        );
      }

      // add appropriate value for unassigned project.
      for (let index = 0; index < this.existPOArray.retItems.length; index++) {
        const poItem = this.existPOArray.retItems[index];
        const tempPOObj = $.extend(true, {}, this.poObj);
        tempPOObj.poId = poItem.POLookup;
        const poValue = this.poArray.filter((x) => x.ID === poItem.POLookup);
        if (poValue && poValue.length) {
          tempPOObj.poValue = poValue[0].Number + " - " + poValue[0].NameST;
        }
        tempPOObj.total = poItem.Amount;
        tempPOObj.revenue = poItem.AmountRevenue;
        tempPOObj.oop = poItem.AmountOOP;
        tempPOObj.tax = poItem.AmountTax;
        tempPOObj.status = poItem.Status;
        poTotal = poTotal + tempPOObj.total;
        poRev = poRev + tempPOObj.revenue;
        poOOP = poOOP + tempPOObj.oop;
        poTax = poTax + tempPOObj.tax;

        if (
          this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value
        ) {
          tempPOObj.showAdd = false;
        } else {
          tempPOObj.showAdd = true;
        }

        if (tempPOObj.total) {
          tempPOObj.showDelete = false;
        } else {
          tempPOObj.showDelete = true;
        }
        tempPOObj.scValue = "Scheduled + Invoiced";
        tempPOObj.scTotal =
          (poItem.TotalScheduled ? poItem.TotalScheduled : 0) +
          (poItem.TotalInvoiced ? poItem.TotalInvoiced : 0);
        tempPOObj.scRevenue =
          (poItem.ScheduledRevenue ? poItem.ScheduledRevenue : 0) +
          (poItem.InvoicedRevenue ? poItem.InvoicedRevenue : 0);
        tempPOObj.scOOP =
          (poItem.ScheduledOOP ? poItem.ScheduledOOP : 0) +
          (poItem.InvoicedOOP ? poItem.InvoicedOOP : 0);
        tempPOObj.scTax = 0;
        tempPOObj.isExsitPO = true;
        const tempObj: any = { Id: 0, poInfo: [], poInfoData: [] };
        tempObj.Id = poItem.ID;
        tempObj.poInfo.push(tempPOObj);
        this.poData.push(tempObj);
        const inoviceItems = this.existPOInvoiceArray.retItems.filter(
          (x) => x.PO === poItem.POLookup
        );
        // get Invoice number & performa number.
        let count = 0;
        const invoicePermormaNumberArray = await this.getInvoiceProformaNumber(
          inoviceItems
        );
        inoviceItems.forEach((invoiceItem) => {
          const invoiceObj = $.extend(true, {}, this.poAddObj);
          const invoiceNumber = invoicePermormaNumberArray
            .filter((c) => c.listName === this.constant.listNames.Invoices.name)
            .filter(
              (x) =>
                x.retItems &&
                x.retItems.length &&
                x.retItems[0].ID === invoiceItem.InvoiceLookup
            );
          const proformaNumber = invoicePermormaNumberArray
            .filter((c) => c.listName === this.constant.listNames.Proforma.name)
            .filter(
              (d) =>
                d.retItems &&
                d.retItems.length &&
                d.retItems[0].ID === invoiceItem.ProformaLookup
            );
          invoiceObj.Id = invoiceItem.ID;
          invoiceObj.lineitemCount = "lineitem" + count++;
          invoiceObj.poId = invoiceItem.PO;
          invoiceObj.inv_number =
            invoiceNumber &&
            invoiceNumber.length &&
            invoiceNumber[0].retItems &&
            invoiceNumber[0].retItems.length
              ? invoiceNumber[0].retItems[0].InvoiceNumber
              : "";
          if (invoiceObj.inv_number) {
            invoiceObj.invUrl =
              invoiceNumber &&
              invoiceNumber.length &&
              invoiceNumber[0].retItems &&
              invoiceNumber[0].retItems.length
                ? invoiceNumber[0].retItems[0].FileURL
                : "";
            invoiceObj.auxiliaryInvoiceName =
              invoiceNumber &&
              invoiceNumber.length &&
              invoiceNumber[0].retItems &&
              invoiceNumber[0].retItems.length
                ? invoiceNumber[0].retItems[0].AuxiliaryInvoiceName
                : "";
          }
          invoiceObj.prf_number =
            proformaNumber &&
            proformaNumber.length &&
            proformaNumber[0].retItems &&
            proformaNumber[0].retItems.length
              ? proformaNumber[0].retItems[0].Title
              : "";
          if (invoiceObj.prf_number) {
            invoiceObj.prfUrl =
              proformaNumber &&
              proformaNumber.length &&
              proformaNumber[0].retItems &&
              proformaNumber[0].retItems.length
                ? proformaNumber[0].retItems[0].FileURL
                : "";
          }
          invoiceObj.date = new Date(
            this.datePipe.transform(invoiceItem.ScheduledDate, "MMM d, y")
          );
          invoiceObj.amount = invoiceItem.Amount;
          invoiceObj.type = invoiceItem.ScheduleType;
          invoiceObj.status = invoiceItem.Status;
          invoiceObj.poc = invoiceItem.MainPOC;
          invoiceObj.pocText = invoiceItem.MainPOC
            ? this.pmCommonService.extractNamefromPOC([invoiceItem.MainPOC])
            : "";
          invoiceObj.address = invoiceItem.AddressType;
          invoiceObj.isExsitInv = true;
          invoiceObj.currency = this.existBudgetArray.retItems[0].Currency;
          invoiceObj.proformaLookup = invoiceItem.ProformaLookup;
          invoiceObj.invoiceLookup = invoiceItem.InvoiceLookup;
          this.reasonsArray = [];
          if (
            invoiceObj.status === "Scheduled" &&
            invoiceObj.type === "revenue"
          ) {
            if (
              this.projectStatus === this.constant.projectStatus.Unallocated ||
              this.projectStatus === this.constant.projectStatus.InProgress ||
              this.projectStatus ===
                this.constant.projectStatus.ReadyForClient ||
              this.projectStatus ===
                this.constant.projectStatus.AuditInProgress ||
              this.projectStatus === this.constant.projectStatus.AuthorReview ||
              this.projectStatus === this.constant.projectStatus.PendingClosure
            ) {
              invoiceObj.isInvoiceItemConfirm = this.lineItemConfirmAllowed(
                invoiceObj
              );
            } else {
              invoiceObj.reasonsArray = [];
              invoiceObj.reasonsArray.push(
                "Project status should not be " + this.projectStatus
              );
            }
            if (
              this.projectStatus === this.constant.projectStatus.Unallocated ||
              this.projectStatus === this.constant.projectStatus.InProgress ||
              this.projectStatus ===
                this.constant.projectStatus.ReadyForClient ||
              this.projectStatus ===
                this.constant.projectStatus.AuditInProgress ||
              this.projectStatus === this.constant.projectStatus.OnHold ||
              this.projectStatus === this.constant.projectStatus.AuthorReview ||
              this.projectStatus ===
                this.constant.projectStatus.PendingClosure ||
              this.projectStatus === this.constant.projectStatus.InDiscussion
            ) {
              invoiceObj.isInvoiceItemEdit = true;
            }
          }
          this.poData[index].poInfoData.push(invoiceObj);
        });
      }

      // add value to Po header.
      this.poHeader.total = poTotal;
      this.poHeader.revenue = poRev;
      this.poHeader.oop = poOOP;
      this.poHeader.tax = poTax;

      ///// Adjust
      if (
        this.projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value
      ) {
        this.poHeader.total = null;
        tempbudgetObject.total = null;
        this.hourlyBudgetHours = tempbudgetObject.budget_hours;
        this.hourlyRate = this.existBudgetArray.retItems[0].Budget;
        if (this.existPOArray.retItems.length) {
          this.isAddToProjectHidden = true;
        }

        if (this.existBudgetArray.retItems[0].ApprovedBudget) {
          const approvedBudget = this.existBudgetArray.retItems[0]
            .ApprovedBudget;
          this.poHeader.total = approvedBudget;
          this.poHeader.revenue = approvedBudget;
          tempbudgetObject.revenue = approvedBudget;
          tempbudgetObject.total = approvedBudget;
          this.poHeader.oop = 0;
          this.poHeader.tax = 0;
          tempbudgetObject.tax = 0;
          tempbudgetObject.oop = 0;
        } else {
          tempbudgetObject.total = 0;
          tempbudgetObject.revenue = 0;
          tempbudgetObject.tax = 0;
          tempbudgetObject.oop = 0;
          this.poHeader.total = 0;
          this.poHeader.revenue = 0;
          this.poHeader.oop = 0;
          this.poHeader.tax = 0;
        }
      }

      const unassignedObj = $.extend(true, {}, this.unassignedBudgetobj);
      this.unassignedBudget = [];

      unassignedObj.total = tempbudgetObject.total - poTotal;
      unassignedObj.revenue = tempbudgetObject.revenue - poRev;
      unassignedObj.oop = tempbudgetObject.oop - poOOP;
      unassignedObj.tax = tempbudgetObject.tax - poTax;

      if (!unassignedObj.revenue) {
        this.poData.forEach((element) => {
          element.poInfo[0].showAdd = false;
        });
      }

      this.unassignedBudget.push(unassignedObj);
      this.showUnAssigned = unassignedObj.revenue ? true : false;
      this.isAddToProjectHidden = unassignedObj.revenue ? false : true;

      ///// Remove all buttons if there is approval pending
      const budgetPending = this.existPBBBudgetArray.retItems.find(
        (e) =>
          e.Status ===
          this.constant.projectBudgetBreakupList.status.ApprovalPending
      );
      if (
        (this.projectStatus !== this.constant.projectList.status.InDiscussion &&
          budgetPending) ||
        this.projectStatus === this.constant.projectList.status.Closed ||
        this.projectStatus === this.constant.projectList.status.Cancelled
      ) {
        this.hideRemoveButton = true;
        this.isAddRateButtonHidden = true;
        this.isAddBudgetButtonHidden = true;
        this.isAddToProjectHidden = true;
        this.poData.forEach((element) => {
          element.poInfo[0].showAdd = false;
          element.poInfo[0].showDelete = false;
          element.poInfo[0].showInvoice = false;
          element.poInfoData.forEach((elementInv) => {
            elementInv.isInvoiceItemEdit = false;
          });
        });
      }
      this.existPODataArray = this.poData;
      this.showPo = true;
      this.pmObject.isMainLoaderHidden = true;
    }
  }

  async getInvoiceProformaNumber(invoiceItems) {
    const uniqueInvoiceItems = this.commonService.unique(
      invoiceItems,
      "InvoiceLookup"
    );
    const uniqueProforma = this.commonService.unique(
      invoiceItems,
      "ProformaLookup"
    );
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    for (const invoiceItem of uniqueInvoiceItems) {
      // Get InoviceItems  ##0;
      const invoiceFilter = Object.assign(
        {},
        this.pmConstant.QUERY.INVOICES_BY_INVOICELOOKUP
      );
      invoiceFilter.filter = invoiceFilter.filter.replace(
        /{{invoiceLookup}}/gi,
        invoiceItem.InvoiceLookup
      );
      this.commonService.setBatchObject(
        batchURL,
        this.spServices.getReadURL(
          this.constant.listNames.Invoices.name,
          invoiceFilter
        ),
        null,
        this.constant.Method.GET,
        this.constant.listNames.Invoices.name
      );
    }
    for (const invoiceItem of uniqueProforma) {
      // Get Proforma  ##1;
      const proformaFilter = Object.assign(
        {},
        this.pmConstant.QUERY.PROFORMA_BY_PROFORMALOOKUP
      );
      proformaFilter.filter = proformaFilter.filter.replace(
        /{{proformaLookup}}/gi,
        invoiceItem.ProformaLookup
      );
      this.commonService.setBatchObject(
        batchURL,
        this.spServices.getReadURL(
          this.constant.listNames.Proforma.name,
          proformaFilter
        ),
        null,
        this.constant.Method.GET,
        this.constant.listNames.Proforma.name
      );
    }
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "GetInvoicesAndProforma",
      "GET-BATCH"
    );
    const invoiceProformaResult = await this.spServices.executeBatch(batchURL);
    if (invoiceProformaResult && invoiceProformaResult.length) {
      return invoiceProformaResult;
    }
  }

  async getSpendingDetails(data) {
    const batchURL = [];
    const spendingInfoFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.SPENDING_INFO
    );
    spendingInfoFilter.filter = spendingInfoFilter.filter
      .replace(/{{Title}}/gi, this.projObj.ProjectCode)
      .replace(/{{InvoiceID}}/gi, data.Id);

    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constant.listNames.SpendingInfo.name,
        spendingInfoFilter
      ),
      null,
      this.constant.Method.GET,
      this.constant.listNames.SpendingInfo.name
    );
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "getSpendingDetails",
      "GET"
    );
    const result = await this.spServices.executeBatch(batchURL);
    if (result && result.length) {
      this.spendingInfoDetails = result[0];
    }
  }

  confirmInvoiceItem(rowData) {
    this.invoiceObj = rowData;
    console.log(rowData);

    this.hideMoveLineItem = this.hideMoveLineItem === false ? true : false;
    this.commonService
      .confirmMessageDialog(
        "Confirm Invoice",
        "Are you sure you want to confirm the invoice ?",
        null,
        ["Yes", "No"],
        false
      )
      .then(async (Confirmation) => {
        if (Confirmation === "Yes") {
          this.commitInvoiceItem(rowData);
        } else {
          this.hideMoveLineItem =
            this.hideMoveLineItem === false ? true : false;
        }
      });
  }

  async commitInvoiceItem(rowData) {
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "commitInvoiceItem",
      "GET"
    );
    const groupInfo = await this.spServices.getGroupInfo("Invoice_Team");
    const approvers = groupInfo.results;
    const arrayTo = [];
    if (approvers.length) {
      for (const i in approvers) {
        if (approvers[i].Email !== undefined && approvers[i].Email !== "") {
          arrayTo.push(approvers[i].Email);
        }
      }
    }
    const data = {
      Status: this.constant.STATUS.CONFIRMED,
    };
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "UpdateInvoiceLineItem",
      "POST"
    );
    const result = await this.spServices.updateItem(
      this.constant.listNames.InvoiceLineItems.name,
      rowData.Id,
      data,
      this.constant.listNames.InvoiceLineItems.type
    );
    const objEmailBody = [];
    const mailSubject =
      this.projObj.ProjectCode +
      "/" +
      this.projObj.ClientLegalEntity +
      ": Confirmed line item for billing";
    objEmailBody.push({
      key: "@@Val2@@",
      value: this.projObj.ProjectCode,
    });
    objEmailBody.push({
      key: "@@Val3@@",
      value: this.projObj.ClientLegalEntity,
    });
    const poValue = this.poArray.filter((x) => x.ID === rowData.poId);
    objEmailBody.push({
      key: "@@Val4@@",
      value: poValue[0].Number,
    });
    objEmailBody.push({
      key: "@@Val5@@",
      value: this.datePipe.transform(rowData.date, "MMM dd, yyyy"),
    });
    objEmailBody.push({
      key: "@@Val6@@",
      value: rowData.currency + " " + rowData.amount,
    });
    objEmailBody.push({
      key: "@@Val7@@",
      value: this.projObj.SOWCode,
    });
    let arrayCC = [];
    let tempArray = [];
    tempArray = tempArray.concat(
      this.projObj.CMLevel1ID,
      this.projObj.CMLevel2ID
    );
    arrayCC = this.pmCommonService.getEmailId(tempArray);
    arrayCC.push(this.pmObject.currLoginInfo.Email);
    this.pmCommonService.getTemplate(
      this.constant.EMAIL_TEMPLATE_NAME.INVOICE_CONFIRM,
      objEmailBody,
      mailSubject,
      arrayTo,
      arrayCC
    );
    this.commonService.showToastrMessage(
      this.constant.MessageType.success,
      "Invoice Line Items Confirmed Successfully",
      true
    );
    setTimeout(() => {
      this.reInitializePopup();
    }, this.pmConstant.TIME_OUT);
  }

  editInvoiceItem(rowData) {
    this.hideMoveLineItem = this.hideMoveLineItem === false ? true : false;
    this.invoiceHeader = "Edit Invoice Line Item";
    console.log(rowData);
    this.invoiceObj = rowData;
    this.primaryPoc = [];
    const poc = this.pmObject.projectContactsItems.filter(
      (obj) => obj.ClientLegalEntity === this.projObj.ClientLegalEntity
    );
    if (poc && poc.length) {
      poc.forEach((element) => {
        this.primaryPoc.push({ label: element.FullNameCC, value: element.ID });
      });
    }
    this.invoiceType = rowData.type;
    this.addPOForm.get("poDate").setValue(rowData.date);
    this.addPOForm.get("primarypoc").setValue(rowData.poc);
    this.addPOForm.get("address").setValue(rowData.address);
    this.addPOForm.get("amount").setValue(rowData.amount);

    this.isInvoiceEdit = true;
    this.showAddInvoiceDetails = true;
  }

  async saveInvoiceEdit() {
    const date = this.addPOForm.get("poDate").value;
    const primaryPoc = this.addPOForm.get("primarypoc").value;
    const address = this.addPOForm.get("address").value;
    const data = {
      ScheduledDate: new Date(date),
      MainPOC: primaryPoc,
      AddressType: address,
    };
    this.commonService.SetNewrelic(
      "projectManagment",
      "manage-finance",
      "UpdateInvoiceLineitem",
      "POST"
    );
    const result = await this.spServices.updateItem(
      this.constant.listNames.InvoiceLineItems.name,
      this.invoiceObj.Id,
      data,
      this.constant.listNames.InvoiceLineItems.type
    );

    this.commonService.showToastrMessage(
      this.constant.MessageType.success,
      "Invoice Line Items updated Successfully.",
      true
    );
    setTimeout(() => {
      this.isInvoiceEdit = false;
      this.showAddInvoiceDetails = false;
      this.reInitializePopup();
    }, this.pmConstant.TIME_OUT);
  }

  saveEditedPo() {
    this.saveUpdatePO(this.BudgetType);
  }

  /////////// Refactor
  async saveUpdatePO(budgetType) {
    const returnObj = {
      pfObj: {},
      pbbObj: {},
    };

    console.log(budgetType);
    this.updateInvoices = [];
    this.pmObject.isMainLoaderHidden = false;
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    let FTEUpdate = false;
    // Project Finance Breakup ==>  if data exist - update else create.
    const projectFinanceBreakArray = [];
    this.poData.forEach((poInfoObj) => {
      const po = poInfoObj.poInfo[0];
      if (po.edited) {
        const projectFinanceBreakupData = this.getProjectFinanceBreakupData(
          po,
          this.projObj,
          poInfoObj
        );
        if (projectFinanceBreakupData.hasOwnProperty("Status")) {
          if (po.isExsitPO) {
            this.commonService.setBatchObject(
              batchURL,
              this.spServices.getItemURL(
                this.constant.listNames.ProjectFinanceBreakup.name,
                poInfoObj.Id
              ),
              projectFinanceBreakupData,
              this.constant.Method.PATCH,
              this.constant.listNames.ProjectFinanceBreakup.name
            );
          } else {
            this.commonService.setBatchObject(
              batchURL,
              this.spServices.getReadURL(
                this.constant.listNames.ProjectFinanceBreakup.name,
                null
              ),
              projectFinanceBreakupData,
              this.constant.Method.POST,
              this.constant.listNames.ProjectFinanceBreakup.name
            );
          }
          const pfbData = Object.assign({}, projectFinanceBreakupData);
          pfbData.POID = po.poId;
          projectFinanceBreakArray.push(pfbData);
        }
      }
    });

    // Project Finance Update.
    if (
      this.projObj.ProjectType !== this.pmConstant.PROJECT_TYPE.HOURLY.value
    ) {
      // PO Update call
      if (projectFinanceBreakArray.length) {
        const poItemArray = this.getPOData(
          projectFinanceBreakArray,
          this.poArray
        );
        poItemArray.forEach((element) => {
          this.commonService.setBatchObject(
            batchURL,
            this.spServices.getItemURL(
              this.constant.listNames.PO.name,
              +element.ID
            ),
            element,
            this.constant.Method.PATCH,
            this.constant.listNames.PO.name
          );
        });
      }

      if (this.budgetData[0].edited || this.unassignedBudget[0].revenue !== 0) {
        const projectFinanceData = this.getProjectFinanceData(
          this.poData,
          this.budgetData,
          this.projObj
        );
        const currentBudget = this.existBudgetArray.retItems[0];
        if (
          projectFinanceData.RevenueBudget !== currentBudget.RevenueBudget ||
          projectFinanceData.ScheduledRevenue !==
            currentBudget.ScheduledRevenue ||
          projectFinanceData.InvoicedRevenue !==
            currentBudget.InvoicedRevenue ||
          projectFinanceData.BudgetHrs !== currentBudget.BudgetHrs ||
          this.unassignedBudget[0].revenue !== 0
        ) {
          this.commonService.setBatchObject(
            batchURL,
            this.spServices.getItemURL(
              this.constant.listNames.ProjectFinances.name,
              +this.existBudgetArray.retItems[0].ID
            ),
            projectFinanceData,
            this.constant.Method.PATCH,
            this.constant.listNames.ProjectFinances.name
          );

          returnObj.pfObj = projectFinanceData;
          if (this.projectStatus === this.constant.projectStatus.InDiscussion) {
            const projectBudgetBreakupData = this.getProjectBudgetBreakupData(
              this.budgetData,
              this.projObj,
              false,
              true
            );

            this.commonService.setBatchObject(
              batchURL,
              this.spServices.getItemURL(
                this.constant.listNames.ProjectBudgetBreakup.name,
                +this.existPBBBudgetArray.retItems[0].ID
              ),
              projectBudgetBreakupData,
              this.constant.Method.PATCH,
              this.constant.listNames.ProjectBudgetBreakup.name
            );
          } else {
            let budgetArr = [];
            if (this.unassignedBudget[0].revenue === 0) {
              const existingBudget = this.existBudgetArray.retItems[0];
              budgetArr = this.budgetData;
              budgetArr[0].budget_hours =
                budgetArr[0].budget_hours - existingBudget.BudgetHrs;
              if (existingBudget.RevenueBudget === budgetArr[0].revenue) {
                budgetArr[0].total = 0;
                budgetArr[0].revenue = 0;
                budgetArr[0].oop = 0;
                budgetArr[0].tax = 0;
              } else {
                budgetArr[0].total = budgetArr[0].total - existingBudget.Budget;
                budgetArr[0].revenue =
                  budgetArr[0].revenue - existingBudget.RevenueBudget;
                budgetArr[0].oop = 0;
                budgetArr[0].tax = 0;
              }
            } else {
              budgetArr = this.unassignedBudget;
              budgetArr[0].total = 0 - budgetArr[0].total;
              budgetArr[0].revenue = 0 - budgetArr[0].revenue;
              budgetArr[0].oop = 0 - budgetArr[0].oop;
              budgetArr[0].tax = 0 - budgetArr[0].tax;
              budgetArr[0].reason = this.selectedReason;
              budgetArr[0].reasonType = this.selectedReasonType;
              budgetArr[0].budget_hours =
                this.newBudgetHrs - this.budgetData[0].budget_hours;
            }

            if (budgetArr[0].revenue !== 0 || budgetArr[0].budget_hours !== 0) {
              const projectBudgetBreakupData = this.getProjectBudgetBreakupData(
                budgetArr,
                this.projObj,
                true,
                budgetArr[0].revenue < 0 ? true : false
              );
              returnObj.pbbObj = projectBudgetBreakupData;
              this.commonService.setBatchObject(
                batchURL,
                this.spServices.getReadURL(
                  this.constant.listNames.ProjectBudgetBreakup.name,
                  null
                ),
                projectBudgetBreakupData,
                this.constant.Method.POST,
                this.constant.listNames.ProjectBudgetBreakup.name
              );
            }
          }
          // SOW update
          const sowObj = this.sowObj;
          const sowUpdateData = this.getSOWData(
            this.projObj,
            projectFinanceData
          );
          if (sowUpdateData.hasOwnProperty("TotalLinked")) {
            this.commonService.setBatchObject(
              batchURL,
              this.spServices.getItemURL(
                this.constant.listNames.SOW.name,
                +sowObj.ID
              ),
              sowUpdateData,
              this.constant.Method.PATCH,
              this.constant.listNames.SOW.name
            );
          }
        }
      }

      // Invoice Item creation and updation
      const CSIdArray = [];
      this.projObj.CMLevel1ID.forEach((cm) => {
        CSIdArray.push(cm.ID);
      });
      CSIdArray.push(this.projObj.CMLevel2ID);
      this.poData.forEach((poInfoObj) => {
        poInfoObj.poInfoData.forEach((element) => {
          if (element.edited) {
            const invoiceData = this.getInvoiceItemData(
              element,
              this.projObj,
              CSIdArray
            );
            if (element.isExsitInv) {
              this.commonService.setBatchObject(
                batchURL,
                this.spServices.getItemURL(
                  this.constant.listNames.InvoiceLineItems.name,
                  element.Id
                ),
                invoiceData,
                this.constant.Method.PATCH,
                this.constant.listNames.InvoiceLineItems.name
              );
            } else {
              this.commonService.setBatchObject(
                batchURL,
                this.spServices.getReadURL(
                  this.constant.listNames.InvoiceLineItems.name,
                  null
                ),
                invoiceData,
                this.constant.Method.POST,
                this.constant.listNames.InvoiceLineItems.name
              );
            }
          }
        });
      });
      if (this.updateInvoices && this.updateInvoices.length) {
        this.updateInvoices.forEach((element) => {
          this.commonService.setBatchObject(
            batchURL,
            this.spServices.getItemURL(
              this.constant.listNames.Invoices.name,
              element.ID
            ),
            element,
            this.constant.Method.PATCH,
            this.constant.listNames.Invoices.name
          );
        });
      }

      if (
        this.projectType === this.pmConstant.PROJECT_TYPE.FTE.value &&
        this.projectStatus !== this.constant.projectList.status.InDiscussion &&
        budgetType
      ) {
        // if (this.projectType === this.pmConstant.PROJECT_TYPE.FTE.value && this.projectStatus !== this.constant.projectList.status.InDiscussion && this.datePipe.transform(new Date(this.dbProposedDate), 'MMM dd, yyyy') !== this.datePipe.transform(new Date(this.selectedProposedEndDate), 'MMM dd, yyyy')) {

        const months =
          budgetType === "IncreaseBudget"
            ? this.pmCommonService.getMonths(
                this.dbProposedDate,
                this.selectedProposedEndDate
              )
            : this.pmCommonService.getMonths(
                this.selectedProposedEndDate,
                this.dbProposedDate
              );

        const ProjectMilestones = this.projObj.Milestones.split(";#");

        if (months) {
          let milestoneCall = Object.assign(
            {},
            this.pmConstant.FINANCE_QUERY.GET_SCHEDULES_BY_PROJECTCODE
          );
          milestoneCall.filter = milestoneCall.filter.replace(
            /{{projectCode}}/gi,
            this.projObj.ProjectCode
          );
          this.commonService.SetNewrelic(
            "projectManagment",
            "manage-finance",
            "AddUpdatePO-GetSchedules",
            "GET"
          );
          const response = await this.spServices.readItems(
            this.constant.listNames.Schedules.name,
            milestoneCall
          );
          let Resources;

          const selectedDateMonth = this.pmConstant.MONTH_NAMES[
            this.selectedProposedEndDate.getMonth()
          ];

          const dbProposedDateMonth = this.pmConstant.MONTH_NAMES[
            this.dbProposedDate.getMonth()
          ];
          for (let i = 0; i < months.length; i++) {
            if (!Resources) {
              let resouceCall = Object.assign(
                {},
                this.pmConstant.FINANCE_QUERY.GET_RESOUCEBYID
              );
              resouceCall.filter = resouceCall.filter.replace(
                /{{Id}}/gi,
                this.projObj.PrimaryResourcesId[0].Id
              );
              this.commonService.SetNewrelic(
                "projectManagment",
                "manage-finance",
                "AddUpdatePO-GetResource",
                "GET"
              );
              Resources = await this.spServices.readItems(
                this.constant.listNames.ResourceCategorization.name,
                resouceCall
              );
            }

            if (budgetType === "IncreaseBudget") {
              const milestone = response.find(
                (c) =>
                  c.FileSystemObjectType === 1 &&
                  c.Title === months[i].monthName
              );
              if (milestone) {
                const milestoneUpdate = Object.assign({}, options);
                milestoneUpdate.data = {
                  __metadata: { type: this.constant.listNames.Schedules.type },
                  Actual_x0020_End_x0020_Date: months[i].monthEndDay,
                  DueDateDT: months[i].monthEndDay,
                };

                if (milestone.Title !== dbProposedDateMonth) {
                  milestoneUpdate.data.Status = this.constant.STATUS.NOT_CONFIRMED;
                  milestoneUpdate.data.Actual_x0020_Start_x0020_Date =
                    months[i].monthStartDay;
                  milestoneUpdate.data.StartDate = months[i].monthStartDay;
                }

                this.commonService.setBatchObject(
                  batchURL,
                  this.spServices.getItemURL(
                    this.constant.listNames.Schedules.name,
                    milestone.Id
                  ),
                  milestoneUpdate.data,
                  this.constant.Method.PATCH,
                  this.constant.listNames.Schedules.name
                );

                const milestoneTasks = response.filter(
                  (c) =>
                    c.FileSystemObjectType === 0 &&
                    c.Milestone === milestone.Title
                );

                milestoneTasks.forEach((task) => {
                  const taskUpdate = Object.assign({}, options);
                  taskUpdate.data = {
                    __metadata: {
                      type: this.constant.listNames.Schedules.type,
                    },
                    DueDateDT: months[i].monthEndDay,
                  };

                  if (
                    task.Actual_x0020_End_x0020_Date &&
                    (task.Task === "Training" || task.Task === "Meeting")
                  ) {
                    taskUpdate.data.Actual_x0020_End_x0020_Date =
                      months[i].monthEndDay;
                  } else if (task.Task === "Blocking") {
                    const businessDay = this.commonService.calcBusinessDays(
                      task.StartDate,
                      months[i].monthEndDay
                    );
                    taskUpdate.data.ExpectedTime =
                      "" + businessDay * Resources[0].MaxHrs;
                  }

                  if (milestone.Title !== dbProposedDateMonth) {
                    taskUpdate.data.Status = this.constant.STATUS.NOT_CONFIRMED;
                    taskUpdate.data.Actual_x0020_Start_x0020_Date =
                      months[i].monthStartDay;
                    taskUpdate.data.StartDate = months[i].monthStartDay;
                  }

                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getItemURL(
                      this.constant.listNames.Schedules.name,
                      task.Id
                    ),
                    taskUpdate.data,
                    this.constant.Method.PATCH,
                    this.constant.listNames.Schedules.name
                  );
                });
              } else {
                const milestonedata = this.pmCommonService.getFTEMilestoneData(
                  months[i],
                  this.projObj.ProjectCode
                );

                this.commonService.setBatchObject(
                  batchURL,
                  this.spServices.getReadURL(
                    this.constant.listNames.Schedules.name,
                    null
                  ),
                  milestonedata,
                  this.constant.Method.POST,
                  this.constant.listNames.Schedules.name
                );
                // create the milestone folder.

                const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(
                  (x) => x.Title === this.projObj.ClientLegalEntity
                );
                if (clientInfo && clientInfo.length) {
                  const listName = clientInfo[0].ListName;
                  const milestoneFolderBody = {
                    __metadata: { type: "SP.Folder" },
                    ServerRelativeUrl:
                      listName +
                      "/" +
                      this.projObj.ProjectCode +
                      "/Drafts/Client/" +
                      months[i].monthName,
                  };
                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getFolderCreationURL(),
                    milestoneFolderBody,
                    this.constant.Method.POST,
                    listName
                  );
                }

                // create FTE Task.
                months[i].Resources = Resources[0];
                const taskBlockingdata = this.pmCommonService.getFTETask(
                  months[i],
                  this.projObj.ProjectCode,
                  this.pmConstant.task.BLOCKING
                );
                this.commonService.setBatchObject(
                  batchURL,
                  this.spServices.getReadURL(
                    this.constant.listNames.Schedules.name,
                    null
                  ),
                  taskBlockingdata,
                  this.constant.Method.POST,
                  this.constant.listNames.Schedules.name
                );

                // create Meeting Task
                const taskMeetingdata = this.pmCommonService.getFTETask(
                  months[i],
                  this.projObj.ProjectCode,
                  this.pmConstant.task.MEETING
                );
                this.commonService.setBatchObject(
                  batchURL,
                  this.spServices.getReadURL(
                    this.constant.listNames.Schedules.name,
                    null
                  ),
                  taskMeetingdata,
                  this.constant.Method.POST,
                  this.constant.listNames.Schedules.name
                );
                // Create Training Task
                const taskTrainingdata = this.pmCommonService.getFTETask(
                  months[i],
                  this.projObj.ProjectCode,
                  this.pmConstant.task.TRAINING
                );
                this.commonService.setBatchObject(
                  batchURL,
                  this.spServices.getReadURL(
                    this.constant.listNames.Schedules.name,
                    null
                  ),
                  taskTrainingdata,
                  this.constant.Method.POST,
                  this.constant.listNames.Schedules.name
                );
              }
              if (!ProjectMilestones.find((c) => c === months[i].monthName)) {
                ProjectMilestones.push(months[i].monthName);
              }
            } else if (budgetType === "ReduceBudget") {
              const milestone = response.find(
                (c) =>
                  c.FileSystemObjectType === 1 &&
                  c.Title === months[i].monthName
              );
              if (milestone) {
                if (milestone.Title === selectedDateMonth) {
                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getItemURL(
                      this.constant.listNames.Schedules.name,
                      milestone.Id
                    ),
                    {
                      __metadata: {
                        type: this.constant.listNames.Schedules.type,
                      },
                      Actual_x0020_End_x0020_Date: new Date(
                        this.selectedProposedEndDate.setHours(23, 45)
                      ),
                      DueDateDT: new Date(
                        this.selectedProposedEndDate.setHours(23, 45)
                      ),
                    },
                    this.constant.Method.PATCH,
                    this.constant.listNames.Schedules.name
                  );

                  const milestoneTasks = response.filter(
                    (c) =>
                      c.FileSystemObjectType === 0 &&
                      c.Milestone === milestone.Title
                  );
                  milestoneTasks.forEach((task) => {
                    const taskUpdate = Object.assign({}, options);
                    taskUpdate.data = {
                      __metadata: {
                        type: this.constant.listNames.Schedules.type,
                      },
                      DueDateDT: new Date(
                        this.selectedProposedEndDate.setHours(23, 45)
                      ),
                    };
                    if (task.Task === "Blocking") {
                      const businessDay = this.commonService.calcBusinessDays(
                        task.StartDate,
                        months[i].monthEndDay
                      );
                      taskUpdate.data.ExpectedTime =
                        "" + businessDay * Resources[0].MaxHrs;
                    }

                    this.commonService.setBatchObject(
                      batchURL,
                      this.spServices.getItemURL(
                        this.constant.listNames.Schedules.name,
                        task.Id
                      ),
                      taskUpdate.data,
                      this.constant.Method.PATCH,
                      this.constant.listNames.Schedules.name
                    );
                  });
                } else {
                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getItemURL(
                      this.constant.listNames.Schedules.name,
                      milestone.Id
                    ),
                    {
                      __metadata: {
                        type: this.constant.listNames.Schedules.type,
                      },
                      Status: "Deleted",
                    },
                    this.constant.Method.PATCH,
                    this.constant.listNames.Schedules.name
                  );

                  const milestoneTasks = response.filter(
                    (c) =>
                      c.FileSystemObjectType === 0 &&
                      c.Milestone === milestone.Title
                  );
                  milestoneTasks.forEach((task) => {
                    this.commonService.setBatchObject(
                      batchURL,
                      this.spServices.getItemURL(
                        this.constant.listNames.Schedules.name,
                        task.Id
                      ),
                      {
                        __metadata: {
                          type: this.constant.listNames.Schedules.type,
                        },
                        Status: "Deleted",
                      },
                      this.constant.Method.PATCH,
                      this.constant.listNames.Schedules.name
                    );
                  });
                }
              }
              if (
                ProjectMilestones.find(
                  (c) =>
                    c === months[i].monthName &&
                    selectedDateMonth !== months[i].monthName
                )
              ) {
                ProjectMilestones.splice(
                  ProjectMilestones.indexOf(months[i].monthName),
                  1
                );
              }
            }
          }
        }
        const projectInfoData: any = {
          __metadata: { type: this.constant.listNames.ProjectInformation.type },
          ProposedEndDate: new Date(
            this.datePipe.transform(
              this.selectedProposedEndDate,
              "MMM dd, yyyy"
            )
          ),
          Milestones: ProjectMilestones.join(";#"),
        };

        this.commonService.setBatchObject(
          batchURL,
          this.spServices.getItemURL(
            this.constant.listNames.ProjectInformation.name,
            this.projObj.ID
          ),
          projectInfoData,
          this.constant.Method.PATCH,
          this.constant.listNames.ProjectInformation.name
        );
        FTEUpdate = true;
      }
    }

    console.log(batchURL);
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "projectManagment",
        "manageFinance",
        "addupdateSchedulesFTEBudget",
        "POST-BATCH"
      );
      const res = await this.spServices.executeBatch(batchURL);
    }
    this.pmObject.isMainLoaderHidden = true;

    this.commonService.showToastrMessage(
      this.constant.MessageType.success,
      "Budget Updated Successfully - " +
        this.pmObject.addProject.ProjectAttributes.ProjectCode,
      true
    );
    setTimeout(() => {
      this.dynamicDialogRef.close();
      if (FTEUpdate) {
        if (this.router.url === "/projectMgmt/allProjects") {
          this.dataService.publish("reload-project");
        } else {
          this.pmObject.allProjectItems = [];
          this.router.navigate(["/projectMgmt/allProjects"]);
        }
      }
    }, this.pmConstant.TIME_OUT);
    return returnObj;
  }

  /**
   * This method is used to get Project Finances Update data
   * @param poArray pass the poArray as parameter
   * @param budgetArray pass the budgetArray as parameter
   * @param projObj pass the current project object.
   */
  getProjectFinanceData(poArray, budgetArray, projObj) {
    let invoiceSc = 0;
    let scRevenue = 0;
    let scOOP = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    let invoiceOOP = 0;
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach((element) => {
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice = invoice + element.amount;
          if (element.type === "revenue") {
            invoiceRevenue = invoiceRevenue + element.amount;
          } else {
            invoiceOOP = invoiceOOP + element.amount;
          }
        } else if (element.status !== this.constant.STATUS.DELETED) {
          invoiceSc = invoiceSc + element.amount;
          if (element.type === "revenue") {
            scRevenue = scRevenue + element.amount;
          } else {
            scOOP = scOOP + element.amount;
          }
        }
      });
    });
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinances.type },
      BudgetHrs: budgetArray[0].budget_hours,
    };
    if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      data.Budget = budgetArray[0].Rate;
      data.OOPBudget = 0;
      data.RevenueBudget = 0;
      data.TaxBudget = 0;
      data.InvoicesScheduled = 0;
      data.ScheduledOOP = 0;
      data.ScheduledRevenue = 0;
      data.Invoiced = 0;
      data.InvoicedRevenue = 0;
      data.InvoicedOOP = 0;
    } else {
      data.Budget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.RevenueBudget = budgetArray[0].revenue;
      data.TaxBudget = budgetArray[0].tax;
      data.InvoicesScheduled = invoiceSc;
      data.ScheduledRevenue = scRevenue;
      data.ScheduledOOP = scOOP;
      data.Invoiced = invoice;
      data.InvoicedRevenue = invoiceRevenue;
      data.InvoicedOOP = invoiceOOP;
    }
    return data;
  }

  /**
   * This method is used to get the ProjectFinance Data
   * @param po pass the po
   * @param projObj pass the current project object as parameter.
   * @param poInfoObj pass the poInvoice object.
   */
  getProjectFinanceBreakupData(po, projObj, poInfoObj) {
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinanceBreakup.type },
    };
    data.ID = 0;
    let totalScheduled = 0;
    let scRevenue = 0;
    let scOOP = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    let invoiceOOP = 0;
    poInfoObj.poInfoData.forEach((element) => {
      if (element.status === this.constant.STATUS.APPROVED) {
        invoice = invoice + element.amount;
        if (element.type === "revenue") {
          invoiceRevenue = invoiceRevenue + element.amount;
        } else {
          invoiceOOP = invoiceOOP + element.amount;
        }
      } else if (element.status !== this.constant.STATUS.DELETED) {
        totalScheduled = totalScheduled + element.amount;
        if (element.type === "revenue") {
          scRevenue = scRevenue + element.amount;
        } else {
          scOOP = scOOP + element.amount;
        }
      }
    });
    data.POLookup = po.status === "Deleted" ? null : po.poId;
    if (po.isExsitPO) {
      data.ID = poInfoObj.Id;
      data.Status = po.status === "Not Saved" ? "Active" : po.status;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = 0;
        data.ScheduledRevenue = 0;
        data.ScheduledOOP = 0;
        data.TotalInvoiced = 0;
        data.InvoicedRevenue = 0;
        data.InvoicedOOP = 0;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      }
      return data;
    } else {
      data.ProjectNumber = projObj.ProjectCode;
      data.Status = po.status === "Not Saved" ? "Active" : po.status;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.ScheduledOOP = scOOP;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
        data.InvoicedOOP = invoiceOOP;
      }
      return data;
    }
  }

  /**
   * This method is used to get Project budget breakup object.
   * @param budgetArray passed as budget array as paramaeter.
   * @param projObj the projObj as parameter.
   * @param isCreate pass true if it create or else false
   */
  getProjectBudgetBreakupData(budgetArray, projObj, isCreate, approvalStatus) {
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectBudgetBreakup.type },
    };
    data.Reason = budgetArray[0].reasonType;
    data.CommentsMT = budgetArray[0].reason;
    if (isCreate) {
      data.ProjectCode = projObj.ProjectCode;
      data.ProjectLookup = projObj.ID;
      if (approvalStatus) {
        data.Status = this.constant.STATUS.APPROVAL_PENDING;
      } else {
        data.Status = this.constant.STATUS.APPROVED;
        data.ApprovalDate = new Date();
      }

      data.BudgetHours = budgetArray[0].budget_hours;
      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.OriginalBudget = 0;
        data.OOPBudget = 0;
        data.NetBudget = 0;
        data.TaxBudget = 0;
      } else {
        data.OriginalBudget = budgetArray[0].total;
        data.OOPBudget = budgetArray[0].oop;
        data.NetBudget = budgetArray[0].revenue;
        data.TaxBudget = budgetArray[0].tax;
      }
    } else {
      data.BudgetHours = budgetArray[0].budget_hours;

      if (projObj.ProjectType === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
        data.OriginalBudget = 0;
        data.OOPBudget = 0;
        data.NetBudget = 0;
        data.TaxBudget = 0;
      } else {
        data.OriginalBudget = budgetArray[0].total;
        data.OOPBudget = budgetArray[0].oop;
        data.NetBudget = budgetArray[0].revenue;
        data.TaxBudget = budgetArray[0].tax;
      }
    }
    return data;
  }

  /**
   * The method is used to get SOW object.
   * @param projObj the project object as parameter.
   * @param projectfinanceObj pass project finance object as parameter.
   */
  getSOWData(projObj, projectfinanceObj) {
    const sowObj = this.sowObj;
    let data = {};
    if (sowObj) {
      if (
        projectfinanceObj.RevenueBudget !==
          this.existBudgetArray.retItems[0].RevenueBudget ||
        projectfinanceObj.ScheduledRevenue !==
          this.existBudgetArray.retItems[0].ScheduledRevenue ||
        projectfinanceObj.InvoicedRevenue !==
          this.existBudgetArray.retItems[0].InvoicedRevenue
      ) {
        data = {
          __metadata: { type: this.constant.listNames.SOW.type },
          TotalLinked:
            sowObj.TotalLinked +
            projectfinanceObj.Budget -
            this.existBudgetArray.retItems[0].Budget,
          RevenueLinked:
            sowObj.RevenueLinked +
            projectfinanceObj.RevenueBudget -
            this.existBudgetArray.retItems[0].RevenueBudget,
          OOPLinked:
            sowObj.OOPLinked +
            projectfinanceObj.OOPBudget -
            this.existBudgetArray.retItems[0].OOPBudget,
          TaxLinked:
            sowObj.TaxLinked +
            projectfinanceObj.TaxBudget -
            this.existBudgetArray.retItems[0].TaxBudget,
          TotalScheduled:
            sowObj.TotalScheduled +
            projectfinanceObj.InvoicesScheduled -
            this.existBudgetArray.retItems[0].InvoicesScheduled,
          ScheduledRevenue:
            sowObj.ScheduledRevenue +
            projectfinanceObj.ScheduledRevenue -
            this.existBudgetArray.retItems[0].ScheduledRevenue,
          TotalInvoiced:
            sowObj.TotalInvoiced +
            projectfinanceObj.Invoiced -
            this.existBudgetArray.retItems[0].Invoiced,
          InvoicedRevenue:
            sowObj.InvoicedRevenue +
            projectfinanceObj.InvoicedRevenue -
            this.existBudgetArray.retItems[0].InvoicedRevenue,
        };
      }
    }
    return data;
  }

  /**
   * This method is used to get PO object.
   * @param financeBreakupArray pass the project finance breakup array as parameter.
   * @param poArray pass the po array as parameter.
   */
  getPOData(financeBreakupArray, poArray) {
    const porray = [];
    const poExistingItems = this.existPOArray.retItems;
    financeBreakupArray.forEach((element) => {
      const poItem = poArray.filter(
        (poObj) =>
          poObj.Id === (element.POLookup ? element.POLookup : element.POID)
      );
      const poExistItem = poExistingItems.find(
        (poObj) => poObj.ID === element.ID
      );
      if (poItem && poItem.length) {
        const data = {
          __metadata: { type: this.constant.listNames.PO.type },
          TotalLinked:
            poItem[0].TotalLinked +
            element.Amount -
            (poExistItem ? (poExistItem.Amount ? poExistItem.Amount : 0) : 0),
          RevenueLinked:
            poItem[0].RevenueLinked +
            element.AmountRevenue -
            (poExistItem
              ? poExistItem.AmountRevenue
                ? poExistItem.AmountRevenue
                : 0
              : 0),
          OOPLinked:
            poItem[0].OOPLinked +
            element.AmountOOP -
            (poExistItem
              ? poExistItem.AmountOOP
                ? poExistItem.AmountOOP
                : 0
              : 0),
          TaxLinked:
            poItem[0].TaxLinked +
            element.AmountTax -
            (poExistItem
              ? poExistItem.AmountTax
                ? poExistItem.AmountTax
                : 0
              : 0),
          TotalScheduled:
            poItem[0].TotalScheduled +
            element.TotalScheduled -
            (poExistItem
              ? poExistItem.TotalScheduled
                ? poExistItem.TotalScheduled
                : 0
              : 0),
          ScheduledRevenue:
            poItem[0].ScheduledRevenue +
            element.ScheduledRevenue -
            (poExistItem
              ? poExistItem.ScheduledRevenue
                ? poExistItem.ScheduledRevenue
                : 0
              : 0),
          ScheduledOOP:
            poItem[0].ScheduledOOP +
            element.ScheduledOOP -
            (poExistItem
              ? poExistItem.ScheduledOOP
                ? poExistItem.ScheduledOOP
                : 0
              : 0),
          ID: element.POLookup ? element.POLookup : element.POID,
        };
        porray.push(data);
      }
    });
    return porray;
  }

  /**
   * This method is used to the invoice item as object
   * @param poInvItem pass the poInvoice Item as object.
   * @param projObj pass projObject as parameter
   * @param CSIdArray pass the CSIdArray as an parameter.
   */
  getInvoiceItemData(poInvItem, projObj, CSIdArray) {
    const element = poInvItem;
    if (
      element.edited &&
      (element.status !== "Deleted" ||
        (element.status === "Deleted" && element.Id !== 0))
    ) {
      if (element.isExsitInv) {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          ScheduledDate: element.date,
          Amount: element.amount,
          MainPOC: element.poc,
          AddressType: element.address,
          Status: element.amount === 0 ? "Deleted" : element.status,
          PO: element.amount === 0 ? null : element.poId,
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
          data.TaggedDate = new Date();
        }
        return data;
      } else {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          Title: projObj.ProjectCode,
          ScheduledDate: element.date,
          Amount: element.amount,
          Currency: this.existBudgetArray.retItems[0].Currency,
          PO: element.amount === 0 ? null : element.poId,
          Status:
            element.amount === 0
              ? "Deleted"
              : element.status === "Not Saved"
              ? "Scheduled"
              : element.status,
          ScheduleType: element.type,
          MainPOC: element.poc,
          AddressType: element.address,
          Template: this.existBudgetArray.retItems[0].Template,
          SOWCode: projObj.SOWCode,
          AccessId: {
            results: CSIdArray,
          },
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
          data.TaggedDate = new Date();
          const invoice = this.arrAdvanceInvoices.find(
            (e) => e.ID === element.invoiceLookup
          );
          const tagAmount = invoice.TaggedAmount
            ? invoice.TaggedAmount + element.amount
            : element.amount;
          const dataInv: any = {
            __metadata: { type: this.constant.listNames.Invoices.type },
            ID: invoice.ID,
            TaggedAmount: tagAmount,
            IsTaggedFully: invoice.Amount === tagAmount ? "Yes" : "No",
          };
          this.updateInvoices.push(dataInv);
        }
        return data;
      }
    }
  }

  enableMovePO() {
    if (
      this.poData
        .map((c) => c.poInfoData)
        .reduce((a, b) => [...a, ...b], [])
        .filter((d) => d.status === "Scheduled").length > 0
    ) {
      this.enableCheckList = this.enableCheckList === true ? false : true;
      if (!this.enableCheckList) {
        this.poData.map((c) => c.poInfoData.map((c) => (c.selected = false)));
        this.PoReplaceLineItemList = [];
      }
    } else {
      this.commonService.showToastrMessage(
        this.constant.MessageType.info,
        "No Scheduled Line Items Found to move.",
        false
      );
    }
  }

  changePO() {
    if (this.PoReplaceLineItemList.length === 0) {
      this.commonService.showToastrMessage(
        this.constant.MessageType.warn,
        "Please select line item.",
        false
      );
      return false;
    }
    const ExisitingPOList = this.poData.map((c) =>
      c.poInfo.map((d) => d.poValue)
    )
      ? this.poData
          .map((c) => c.poInfo.map((d) => d.poValue))
          .reduce((a, b) => [...a, ...b], [])
      : [];
    // const ReplacePOList = this.poList.filter(c=> !this.PoReplaceLineItemList.map(c=>c.PODetails.poValue).includes(c.label));

    const ReplacePOList = this.poList.filter(
      (c) => !ExisitingPOList.includes(c.label)
    );

    if (this.poList && this.poList.length > 0) {
      const ref = this.dialogService.open(PoChangeDialogComponent, {
        data: {
          POList: this.poList,
          LineItems: this.PoReplaceLineItemList,
        },

        header: "Change PO",
        width: "90%",
        closable: false,
        styleClass: "POChangedialog",
      });
      ref.onClose.subscribe(async (data) => {
        if (data) {
          this.pmObject.isMainLoaderHidden = false;
          console.log("selected data");
          console.log(data); //LineItems

          const batchURL = [];
          const projectFinanceBreakArray = [];
          const POInfo = this.getPOObjectDetails(data.selectedPO);
          const allLineItems = data.LineItems.map((c) => c.LineItem);

          allLineItems.forEach((item) => {
            POInfo.scTotal = POInfo.scTotal + item.amount;
            POInfo.scRevenue =
              POInfo.scRevenue + (item.type == "revenue" ? item.amount : 0);
            POInfo.scOOP =
              POInfo.scOOP + (item.type == "oop" ? item.amount : 0);
            POInfo.scTax = POInfo.scTax + 0;
            POInfo.total = POInfo.total + item.amount;
            POInfo.revenue =
              item.type == "revenue"
                ? POInfo.revenue + item.amount
                : POInfo.revenue;
            POInfo.oop =
              item.type == "oop" ? POInfo.oop + item.amount : POInfo.oop;
          });

          allLineItems.forEach((element) => {
            const invData = {
              __metadata: {
                type: this.constant.listNames.InvoiceLineItems.type,
              },
              PO: data.selectedPO,
            };
            this.commonService.setBatchObject(
              batchURL,
              this.spServices.getItemURL(
                this.constant.listNames.InvoiceLineItems.name,
                +element.Id
              ),
              invData,
              this.constant.Method.PATCH,
              this.constant.listNames.InvoiceLineItems.name
            );
          });

          const PODataTemp = [];
          // { Id: 0, poInfo: [], poInfoData: [] };
          this.poData.forEach((element) => {
            const POlineItems = element.poInfoData.filter(
              (c) => !allLineItems.map((d) => d.Id).includes(c.Id)
            );
            element.poInfo[0].total = POlineItems.map((c) => c.amount).reduce(
              (a, b) => a + b,
              0
            );
            element.poInfo[0].revenue = POlineItems.filter(
              (c) => c.type === "revenue"
            )
              .map((c) => c.amount)
              .reduce((a, b) => a + b, 0);
            element.poInfo[0].oop = POlineItems.filter((c) => c.type === "oop")
              .map((c) => c.amount)
              .reduce((a, b) => a + b, 0);
            PODataTemp.push({
              Id: element.Id,
              poInfo: element.poInfo[0],
              poInfoData: POlineItems,
            });
          });

          if(!(this.poData.filter(e=> e.poInfo.find((d) => d.poId == data.selectedPO)).length)){
            PODataTemp.push({ Id: 0, poInfo: POInfo, poInfoData: allLineItems });
          } else  {
            PODataTemp.forEach(e=> {
              if(e.poInfo.poId == data.selectedPO) {
                  e.poInfo.scTotal = e.poInfo.scTotal + POInfo.scTotal;
                  e.poInfo.scRevenue = e.poInfo.scRevenue + POInfo.scRevenue;
                  e.poInfo.scOOP = e.poInfo.scOOP + POInfo.scOOP;
                  e.poInfo.scTax = e.poInfo.scTax + POInfo.scTax;
                  e.poInfo.total = e.poInfo.total + POInfo.total;
                  e.poInfo.revenue = e.poInfo.revenue + POInfo.revenue;
                  e.poInfo.oop = e.poInfo.oop + POInfo.oop;
                  e.poInfoData.push(...allLineItems);
              }        
            })
          }

          PODataTemp.forEach((element) => {
            const projectFinanceBreakupData = this.getProjectFinanceBreakupData(
              element.poInfo,
              this.projObj,
              element
            );
            if (element.poInfoData && element.poInfoData.length > 0) {
              if (projectFinanceBreakupData.hasOwnProperty("Status")) {
                if (element.poInfo.isExsitPO) {
                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getItemURL(
                      this.constant.listNames.ProjectFinanceBreakup.name,
                      +element.Id
                    ),
                    projectFinanceBreakupData,
                    this.constant.Method.PATCH,
                    this.constant.listNames.ProjectFinanceBreakup.name
                  );
                } else {
                  this.commonService.setBatchObject(
                    batchURL,
                    this.spServices.getReadURL(
                      this.constant.listNames.ProjectFinanceBreakup.name,
                      null
                    ),
                    projectFinanceBreakupData,
                    this.constant.Method.POST,
                    this.constant.listNames.ProjectFinanceBreakup.name
                  );
                }
              }
            } else {
              this.commonService.setBatchObject(
                batchURL,
                this.spServices.getItemURL(
                  this.constant.listNames.ProjectFinanceBreakup.name,
                  +element.Id
                ),
                {
                  __metadata: {
                    type: this.constant.listNames.ProjectFinanceBreakup.type,
                  },
                  Status: this.constant.STATUS.DELETED,
                },
                this.constant.Method.PATCH,
                this.constant.listNames.ProjectFinanceBreakup.name
              );
            }

            const pfbData = Object.assign({}, projectFinanceBreakupData);
            pfbData.POID = POInfo.poId;
            projectFinanceBreakArray.push(pfbData);
          });

          if (projectFinanceBreakArray.length) {
            const poItemArray = this.getPOData(
              projectFinanceBreakArray,
              this.poArray
            );
            poItemArray.forEach((element) => {
              this.commonService.setBatchObject(
                batchURL,
                this.spServices.getItemURL(
                  this.constant.listNames.PO.name,
                  +element.ID
                ),
                element,
                this.constant.Method.PATCH,
                this.constant.listNames.PO.name
              );
            });
          }
          // console.log(batchURL);
          await this.spServices.executeBatch(batchURL);

          this.enableCheckList = this.enableCheckList === true ? false : true;
          if (!this.enableCheckList) {
            this.poData.map((c) =>
              c.poInfoData.map((c) => (c.selected = false))
            );

            this.PoReplaceLineItemList = [];
          }
          this.commonService.showToastrMessage(
            this.constant.MessageType.success,
            "Line items moved to new PO successfully.",
            true
          );
          setTimeout(() => {
            this.reInitializePopup();
          }, this.pmConstant.TIME_OUT);
        }
      });
    } else {
      this.commonService.showToastrMessage(
        this.constant.MessageType.warn,
        "Unable to move to new PO, PO doesn't exist.",
        false
      );
      return false;
    }
  }

  addRemoveItem(rowData, poInfo) {
    if (rowData.selected) {
      this.PoReplaceLineItemList.push({ LineItem: rowData, PODetails: poInfo });
    } else {
      const index = this.PoReplaceLineItemList.indexOf(
        this.PoReplaceLineItemList.find((c) => c.LineItem.Id === rowData.Id)
      );
      if (index > -1) {
        this.PoReplaceLineItemList.splice(index, 1);
      }
    }
  }
}
