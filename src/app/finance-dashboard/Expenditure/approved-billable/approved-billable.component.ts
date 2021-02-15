import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  ApplicationRef,
  NgZone,
} from "@angular/core";
import { SPOperationService } from "../../../Services/spoperation.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ConstantsService } from "../../../Services/constants.service";
import { GlobalService } from "../../../Services/global.service";
import { FdConstantsService } from "../../fdServices/fd-constants.service";
import { CommonService } from "../../../Services/common.service";
import { FDDataShareService } from "../../fdServices/fd-shareData.service";
import { DatePipe, PlatformLocation, LocationStrategy } from "@angular/common";
import { Subscription } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import { DialogService } from "primeng/dynamicdialog";
import { ScheduleOopInvoiceDialogComponent } from "./schedule-oop-invoice-dialog/schedule-oop-invoice-dialog.component";
import { MarkAsPaymentDialogComponent } from "../mark-as-payment-dialog/mark-as-payment-dialog.component";
import { ApproveRejectExpenseDialogComponent } from '../approve-reject-expense-dialog/approve-reject-expense-dialog.component';

@Component({
  selector: "app-approved-billable",
  templateUrl: "./approved-billable.component.html",
  styleUrls: ["./approved-billable.component.css"],
})
export class ApprovedBillableComponent implements OnInit, OnDestroy {
  yearRange: string;
  invoice: any;
  SOW: any;
  sowList: any = [];
  scheduleInvoiceType: string;
  scheduleInvoiceForm: any;
  constructor(
    private fb: FormBuilder,
    private spServices: SPOperationService,
    public constantService: ConstantsService,
    private globalService: GlobalService,
    private fdConstantsService: FdConstantsService,
    private commonService: CommonService,
    public fdDataShareServie: FDDataShareService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    public dialogService: DialogService,
    zone: NgZone
  ) {
    this.subscription.add(
      this.fdDataShareServie.getDateRange().subscribe((date) => {
        this.DateRange = date;
        console.log("this.DateRange ", this.DateRange);
        this.getRequiredData();
      })
    );

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });
  }

  tempClick: any;
  approvedBillableRes: any = [];
  approvedBillableCols: any[];

  // Lodder
  isLoaderenable: boolean = true;
  selectedRowData: any = [];

  // Date Range
  rangeDates: Date[];

  // subscription: Subscription;
  DateRange: any = {
    startDate: "",
    endDate: "",
  };

  freelancerVendersRes: any = [];
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  // List of Subscribers
  private subscription: Subscription = new Subscription();

  // @ViewChild("ab", { static: false }) approvedBTable: Table;

  // Project Info
  projectInfoData: any = [];

  // Purchase Order Number
  purchaseOrdersList: any = [];

  // Project COntacts
  projectContactsData: any = [];

  // Billing ENtity Data
  billingEntityData: any = [];

  // Resource Categorization
  rcData: any = [];

  appBillableColArray = {
    ProjectCode: [],
    SOWCode: [],
    Category: [],
    ExpenseType: [],
    ClientAmount: [],
    ClientCurrency: [],
    VendorName: [],
    RequestType: [],
    DateCreated: [],
    ModifiedBy: [],
    ModifiedDate: [],
    Number: [],
    PaymentDate: [],
    Modified: [],
    Created: [],
    PaymentMode: [],
    PayingEntity: [],
    Status: [],
  };

  selectedAllRows: boolean = false;
  selectedCategories: boolean = false;

  // CLick on Table Check box to Select All Row Item
  selectedAllRowsItem: any = [];

  rightSideBar: boolean = false;
  items: any[];

  rowItemDetails: any;
  listOfPOCs: any = [];

  // Project PO
  poNames: any = [];
  pcFound: boolean = false;
  vfUnique: boolean = false;
  poItem: any;
  pfListItem: any = [];
  pfbListItem: any = [];
  pbbListItem: any = [];
  hBQuery: any = [];
  projectInfoLineItem: any;
  pcmLevels: any = [];

  // Upload File
  updateSpeLineItems: any = [];

  isOptionFilter: boolean;

  cancelRejectDialog: any = {
    title: '',
    text: ''
  };
  expenseForm: any;
  mailContentRes: any;
  selectedProjectInfo: any;
  cleForselectedPI: any;
  cmLevelIdList: any = [];
  selectedPI: any = [];
  cleData: any = [];
  currentUserInfoData: any;
  groupITInfo: any;
  groupInfo: any;
  resCatEmails: any = [];


  async ngOnInit() {
    const currentYear = new Date();
    this.yearRange =
      currentYear.getFullYear() - 10 + ":" + (currentYear.getFullYear() + 10);

    this.fdConstantsService.fdComponent.hideDatesSection = false;
    this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
    this.groupInfo = await this.fdDataShareServie.getGroupInfo();
    this.groupITInfo = await this.fdDataShareServie.getITInfo();
    // SetDefault Values
    if (this.fdDataShareServie.expenseDateRange.startDate) {
      this.DateRange = this.fdDataShareServie.expenseDateRange;
    } else {
      const last3Days = this.commonService.getLastWorkingDay(65, new Date());
      this.rangeDates = [last3Days, new Date()];
      this.DateRange.startDate = new Date(
        this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00"
      ).toISOString();
      this.DateRange.endDate = new Date(
        this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00"
      ).toISOString();
      this.fdDataShareServie.expenseDateRange = this.DateRange;
    }

    this.createABCols();
    this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
    await this.projectInfo();

    this.resourceCInfo();
  }
  async projectInfo() {
    await this.fdDataShareServie.checkProjectsAvailable();
    this.subscription.add(
      this.fdDataShareServie.defaultPIData.subscribe((res) => {
        if (res) {
          this.projectInfoData = res;
          console.log("PI Data ", this.projectInfoData);
          this.getRequiredData();
        }
      })
    );
  }

  cleInfo() {
    this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
      if (res) {
        this.cleData = res;
        console.log('Client Legal Entity ', this.cleData);
      }
    }));
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

  biilingEntityInfo() {
    this.subscription.add(
      this.fdDataShareServie.defaultBEData.subscribe((res) => {
        if (res) {
          this.billingEntityData = res;
          console.log("BE Data ", this.billingEntityData);
        }
      })
    );
  }
  resourceCInfo() {
    this.subscription.add(
      this.fdDataShareServie.defaultRCData.subscribe((res) => {
        if (res) {
          this.rcData = res;
          console.log("Resource Categorization ", this.rcData);
        }
      })
    );
  }

  createABCols() {
    this.approvedBillableCols = [
      // { field: '', header: '' },
      { field: "Number", header: "Ref. Number", visibility: true, Type: 'string', dbName: 'Number', options: [] },
      { field: "ProjectCode", header: "Project Code", visibility: true, Type: 'string', dbName: 'ProjectCode', options: [] },
      { field: "VendorName", header: "Vendor Name", visibility: true, Type: 'string', dbName: 'VendorName', options: [] },
      { field: "ExpenseType", header: "Expense Type", visibility: true, Type: 'string', dbName: 'ExpenseType', options: [] },
      { field: "ClientCurrency", header: "Client Currency", visibility: true, Type: 'string', dbName: 'ClientCurrency', options: [] },
      { field: "ClientAmount", header: "Client Amount", visibility: true, Type: 'string', dbName: 'ClientAmount', options: [] },
      { field: "Status", header: "Status", visibility: true, Type: 'string', dbName: 'Status', options: [] },
      { field: "Category", header: "Category", visibility: false, Type: 'string', dbName: 'Category', options: [] },
      { field: "PaymentMode", header: "Payment Mode", visibility: false, Type: 'string', dbName: 'PaymentMode', options: [] },
      { field: "RequestType", header: "Request Type", visibility: false, Type: 'string', dbName: 'RequestType', options: [] },
      { field: "DateSpend", header: "Date Spend", visibility: false, Type: 'string', dbName: 'DateSpend', options: [] },
      { field: "ClientLegalEntity", header: "Client Legal Entity", visibility: false, Type: 'string', dbName: 'ClientLegalEntity', options: [] },
      { field: "SOWCode", header: "SOW Code", visibility: false, Type: 'string', dbName: 'SOWCode', options: [] },
      { field: "SOWName", header: "SOW Name", visibility: false, Type: 'string', dbName: 'SOWName', options: [] },
      { field: "Notes", header: "Notes", visibility: false, Type: 'string', dbName: 'Notes', options: [] },
      { field: "FileURL", header: "File URL", visibility: false, Type: 'string', dbName: 'FileURL', options: [] },
      { field: "ClientApprovalFileURL", header: "Client Approval File URL", visibility: false, Type: 'string', dbName: 'ClientApprovalFileURL', options: [] },
      { field: "ApproverComments", header: "Approver Comments", visibility: false, Type: 'string', dbName: 'ApproverComments', options: [] },
      { field: "ApproverFileUrl", header: "Approver File Url", visibility: false, Type: 'string', dbName: 'ApproverFileUrl', options: [] },
      { field: "PayingEntity", header: "Paying Entity", visibility: false, Type: 'string', dbName: 'PayingEntity', options: [] }
    ];
  }

  // On load get Required Data
  async getRequiredData() {
    let speInfoObj;
    const groups = this.globalService.userInfo.Groups.results.map(
      (x) => x.LoginName
    );
    if (
      groups.indexOf("Invoice_Team") > -1 ||
      groups.indexOf("Managers") > -1 ||
      groups.indexOf("ExpenseApprovers") > -1
    ) {
      speInfoObj = Object.assign(
        {},
        this.fdConstantsService.fdComponent.spendingInfoForBillable
      );
      speInfoObj.filter = speInfoObj.filter
        .replace("{{StartDate}}", this.DateRange.startDate)
        .replace("{{EndDate}}", this.DateRange.endDate);
    } else {
      speInfoObj = Object.assign(
        {},
        this.fdConstantsService.fdComponent.spendingInfoForBillableCS
      );
      speInfoObj.filter = speInfoObj.filter
        .replace("{{StartDate}}", this.DateRange.startDate)
        .replace("{{EndDate}}", this.DateRange.endDate)
        .replace(
          "{{UserID}}",
          this.globalService.currentUser.userId.toString()
        );
    }
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "approve-billable",
      "GetSpendingInfo",
      "GET"
    );
    const res = await this.spServices.readItems(
      this.constantService.listNames.SpendingInfo.name,
      speInfoObj
    );
    const arrResults = res.length ? res : [];
    this.formatData(arrResults);
  }

  getVendorNameById(ele) {
    const found = this.freelancerVendersRes.find((x) => {
      if (x.ID === ele.VendorFreelancer) {
        return x;
      }
    });
    return found ? found.Title : "";
  }

  async formatData(data: any[]) {
    this.approvedBillableRes = [];
    this.selectedAllRowsItem = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(
        this.projectInfoData,
        element
      );
      const sowItem = await this.getSowDetails(sowCodeFromPI.SOWCode);
      this.approvedBillableRes.push({
        Id: element.ID,
        ProjectCode: element.Title,
        SOWCode: sowCodeFromPI.SOWCode,
        SOWName: sowItem && sowItem.Title ? sowItem.Title : "",
        ClientLegalEntity: sowCodeFromPI.ClientLegalEntity,
        Category: element.Category,
        Number: element.Number,
        ExpenseType: element.SpendType,
        Amount: parseFloat(element.Amount).toFixed(2),
        ClientAmount: parseFloat(element.ClientAmount).toFixed(2),
        ClientCurrency: element.ClientCurrency,
        VendorName: this.getVendorNameById(element),
        Notes: element.Notes,
        SOW: sowItem,
        RequestType: element.RequestType,
        PaymentMode: element.PaymentMode,
        PayingEntity: element.PayingEntity,
        Status: element.Status,
        DateSpend: this.datePipe.transform(
          element.DateSpend,
          "MMM d, y, hh:mm a"
        ),
        Created: this.datePipe.transform(element.Created, "MMM d, y, hh:mm a"),
        Modified: this.datePipe.transform(
          element.Modified,
          "MMM d, y, hh:mm a"
        ),
        CreatedBy: element.Author ? element.Author.Title : "",
        ModifiedBy: element.Editor ? element.Editor.Title : "",
        // ModifiedDate: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
        ApproverComments: element.ApproverComments,
        ApproverFileUrl: element.ApproverFileUrl,
        FileURL: element.FileURL,
        ClientApprovalFileURL: element.ClientApprovalFileURL,

        VendorFreelancer: element.VendorFreelancer,
        // AuthorId: element.AuthorId,
        DollarAmount: element.DollarAmount,
        InvoiceID: element.InvoiceID,
        POLookup: element.POLookup,
        // Created: element.Created,
        // PONumber: this.getPONumber(element),
        // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM d, y, hh:mm a'),
        AccessId: element.AccessId,
        CategoryST: element.CategoryST,
        Currency: element.Currency,
        NotesMT: element.NotesMT,
        SpendType: element.SpendType
      });
    }
    this.approvedBillableRes = [...this.approvedBillableRes];
    //this.createColFieldValues(this.approvedBillableRes);
    this.approvedBillableCols = this.approvedBillableRes && this.approvedBillableRes.length > 0 ? this.commonService.MainfilterForTable(this.approvedBillableCols, this.approvedBillableRes) : this.approvedBillableCols.filter(c=>c.visibility === true);
    this.isLoaderenable = false;
  }

  createColFieldValues(resArray) {
    this.appBillableColArray.ProjectCode = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ProjectCode, value: a.ProjectCode };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.Category = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.Category, value: a.Category };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.ExpenseType = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ExpenseType, value: a.ExpenseType };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    const clientAmount = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = {
            label: parseFloat(a.ClientAmount),
            value: a.ClientAmount,
          };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.appBillableColArray.ClientAmount = this.fdDataShareServie.customSort(
      clientAmount,
      1,
      "label"
    );
    this.appBillableColArray.ClientCurrency = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ClientCurrency, value: a.ClientCurrency };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );

    this.appBillableColArray.VendorName = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.VendorName, value: a.VendorName };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.RequestType = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.RequestType, value: a.RequestType };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );

    this.appBillableColArray.PaymentMode = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.PaymentMode, value: a.PaymentMode };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.PayingEntity = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.PayingEntity, value: a.PayingEntity };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.Status = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.Status, value: a.Status };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );

    this.appBillableColArray.Number = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.Number, value: a.Number };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.appBillableColArray.PaymentDate = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.DateSpend, value: a.DateSpend };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.appBillableColArray.Modified = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.Modified, value: a.Modified };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.appBillableColArray.Created = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.Created, value: a.Created };
          return b;
        })
        .filter((ele) => ele.label)
    );

    this.appBillableColArray.SOWCode = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.SOWCode, value: a.SOWCode };
          return b;
        })
        .filter((ele) => ele.label)
    );
    // this.appBillableColArray.DateCreated = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DateCreated, value: a.DateCreated }; return b; }).filter(ele => ele.label));
    // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
    // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
  }

  uniqueArrayObj(array: any) {
    let sts: any = "";
    return (sts = Array.from(new Set(array.map((s) => s.label))).map(
      (label1) => {
        return {
          label: label1,
          value: array.find((s) => s.label === label1).value,
        };
      }
    ));
  }

  selectAll(data) {
    console.log(data);
    this.selectedAllRows = !this.selectedAllRows;
    this.selectedCategories = !this.selectedCategories;
  }

  selectOneByOne(oneRow, isChecked) {
    // this.selectedCategories = !this.selectedCategories
    console.log("one Row ", oneRow);
    console.log("isChecked ", isChecked);
  }

  selectAllRows() {
    console.log("in selectAllRows ", this.selectedAllRowsItem);
  }

  // selectedRowItemData: any = [];
  onRowSelect(event) {
    console.log(event);
    // this.selectedRowItemData.push(event.data);
    console.log("this.selectedAllRowsItem ", this.selectedAllRowsItem);
  }

  onRowUnselect(event) {
    console.log("this.selectedAllRowsItem ", this.selectedAllRowsItem);
  }

  openTableAtt(data, popUpData) {
    this.items = [];
    console.log("this.selectedAllRowsItem ", this.selectedAllRowsItem);
    const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
    if (groups.indexOf('ExpenseApprovers') > -1 || groups.indexOf('Managers') > -1) {
      if (data.Status == 'Approved' || data.Status == 'Approved Payment Pending') {
        this.items = [
          { label: 'Reject Expense', command: (e) => this.openMenuContent(e, data) }
        ];
      }
    }
    this.items.push({
      label: "Details",
      command: (e) => this.openMenuContent(e, data),
    });
  }
  openMenuContent(event, data) {
    console.log(JSON.stringify(data));
    this.rowItemDetails = data;
    if (event.item.label == "Details") {
      this.rightSideBar = !this.rightSideBar;
    }
    else if (event.item.label == "Reject Expense") {
      this.cancelRejectDialog.title = event.item.label;
      this.cancelRejectDialog.text = event.item.label.replace(' Expense', '');
      this.approveRejectExpenseDialog();
    }
  }

  approveRejectExpenseDialog() {
    const ref = this.dialogService.open(ApproveRejectExpenseDialogComponent, {
      data: {
        expenseDialog: this.cancelRejectDialog,
        selectedRowItem: this.rowItemDetails
      },
      header: this.cancelRejectDialog.title,
      contentStyle: { height: '450px !important' },
      width: '50%',
      closable: false,
    });
    ref.onClose.subscribe(async expense => {
      if (expense) {
        this.expenseForm = expense.form;
        this.mailContentRes = expense.mailContent;
        await this.rejectSubmit(expense.type, expense.form);
      }
    })
  }

  rejectSubmit(type: string, expenseForm) {
    const batchUrl = [];
    if (type === 'Reject Expense') {

      // console.log('form is submitting ..... expenseForm ', expenseForm.value);
      const speInfoObj = {
        ApproverComments: expenseForm.value.ApproverComments,
        Status: 'Rejected'
      };
      speInfoObj['__metadata'] = { type: this.constantService.listNames.SpendingInfo.type };
      // let data = [];
      const rejectExpenseObj = Object.assign({}, this.queryConfig);
      rejectExpenseObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +this.rowItemDetails.Id);
      rejectExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
      rejectExpenseObj.type = 'PATCH';
      rejectExpenseObj.data = speInfoObj;
      batchUrl.push(rejectExpenseObj);
      this.submitForm(batchUrl, type);
    }
  }

  openPopup(modal: string) {
    console.log("selectedAllRowsItem ", this.selectedAllRowsItem);
    if (!this.selectedAllRowsItem.length) {
      this.commonService.showToastrMessage(
        this.constantService.MessageType.info,
        "Please select at least 1 Projects & try again",
        false
      );
      return;
    }

    console.log(this.selectedAllRowsItem);
    // if (this.pcFound) {
    if (modal === "scheduleOopModal") {
      this.checkUniquePC();
      if (this.pcFound) {
        const sts = this.checkApprovedStatus();
        if (sts) {
          this.scheduleInvoiceType = "";
          const ref = this.dialogService.open(
            ScheduleOopInvoiceDialogComponent,
            {
              header: "Schedule OOP Invoice",
              width: "70vw",
              data: {
                type: "approve-billable",
                selectedAllRowsItem: this.selectedAllRowsItem,
                projectInfoData: this.projectInfoData,
              },
              contentStyle: { "overflow-y": "visible" },
              closable: false,
            }
          );

          ref.onClose.subscribe((scheduleInvoice: any) => {
            if (scheduleInvoice) {
              this.SOW = this.selectedAllRowsItem[0].SOW;
              this.poItem = scheduleInvoice.poItem;
              this.pfListItem = scheduleInvoice.pfListItem;
              this.pfbListItem = scheduleInvoice.pfbListItem;
              this.projectInfoLineItem = scheduleInvoice.projectInfoLineItem;
              this.pcmLevels = scheduleInvoice.pcmLevels;
              this.invoice = scheduleInvoice.Invoice;
              const ScheduleInvoiceForm = scheduleInvoice.ScheduleInvoiceForm;
              this.scheduleInvoiceForm = scheduleInvoice.ScheduleInvoiceForm;
              this.scheduleInvoiceType = ScheduleInvoiceForm.get(
                "InvoiceType"
              ).value;
              this.onSubmit(
                ScheduleInvoiceForm,
                ScheduleInvoiceForm.get("InvoiceType").value,
                "scheduledOOP"
              );
            }
          });
        } else {
          this.commonService.showToastrMessage(
            this.constantService.MessageType.info,
            "Please select only those Projects whose scheduling is pending.",
            false
          );
        }
      } else {
        this.commonService.showToastrMessage(
          this.constantService.MessageType.info,
          "Please select same Projects.",
          false
        );
      }
    } else if (modal === "markAsPaymentModal") {
      this.checkUniqueVF();
      if (this.vfUnique) {
        const sts = this.checkPPStatus();
        console.log("Sts ", sts);
        if (sts) {
          const ref = this.dialogService.open(MarkAsPaymentDialogComponent, {
            header: "Mark As Payment",
            width: "70vw",
            contentStyle: { "overflow-y": "visible" },
            closable: false,
          });
          ref.onClose.subscribe((paymentDetails: any) => {
            if (paymentDetails) {
              this.isLoaderenable = true;
              this.MarkAsPayment(
                paymentDetails.paymentForm,
                "markAsPayment_form",
                paymentDetails.fileUrl
              );
            }
          });
        } else {
          this.commonService.showToastrMessage(
            this.constantService.MessageType.warn,
            "Please select only those Projects whose payment is pending.",
            false
          );
        }
      } else {
        this.commonService.showToastrMessage(
          this.constantService.MessageType.warn,
          "Please select same Vendor/Freelance name.",
          false
        );
      }
    }
  }

  checkApprovedStatus() {
    let sts = true;
    for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
      const element = this.selectedAllRowsItem[j];
      if (!element.Status.includes("Approved")) {
        sts = false;
        break;
      } else {
        sts = true;
      }
    }
    return sts;
  }

  checkPPStatus() {
    let ppSts = true;
    for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
      const element = this.selectedAllRowsItem[j];
      if (!element.Status.includes("Payment Pending")) {
        ppSts = false;
        break;
      } else {
        ppSts = true;
      }
    }
    return ppSts;
  }

  checkUniquePC() {
    for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
      const element = this.selectedAllRowsItem[i];
      const selectedPC = this.selectedAllRowsItem[0].ProjectCode;
      // element.Status.includes('Approved')
      if (element.ProjectCode !== selectedPC) {
        this.pcFound = false;
        break;
      } else {
        this.pcFound = true;
      }
    }
  }
  checkUniqueVF() {
    for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
      const element = this.selectedAllRowsItem[i];
      const vfId = this.selectedAllRowsItem[0].VendorFreelancer;
      if (element.VendorFreelancer !== vfId) {
        this.vfUnique = false;
        break;
      } else {
        this.vfUnique = true;
      }
    }
  }

  // PO
  getPOData(expenseData, amt) {
    const poLinkedAmt =
      parseFloat(expenseData.OOPLinked ? expenseData.OOPLinked : 0) +
      parseFloat(amt);
    const poTotalLinkedAmt =
      parseFloat(expenseData.TotalLinked ? expenseData.TotalLinked : 0) +
      parseFloat(amt);
    const poScheduledOOP =
      parseFloat(expenseData.ScheduledOOP ? expenseData.ScheduledOOP : 0) +
      parseFloat(amt);
    const poTotalScheduled =
      parseFloat(expenseData.TotalScheduled ? expenseData.TotalScheduled : 0) +
      parseFloat(amt);
    return {
      __metadata: { type: this.constantService.listNames.PO.type },
      OOPLinked: poLinkedAmt.toFixed(2),
      TotalLinked: poTotalLinkedAmt.toFixed(2),
      ScheduledOOP: poScheduledOOP.toFixed(2),
      TotalScheduled: poTotalScheduled.toFixed(2),
    };
  }

  // PF
  getPFData(ScheduleInvoiceForm, InvoiceType: string) {
    let Amount = InvoiceType === 'new' ? parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : parseFloat(ScheduleInvoiceForm.getRawValue().TagAmount);
    const oldScheduledOOP = this.pfListItem[0].ScheduledOOP
      ? this.pfListItem[0].ScheduledOOP
      : 0;
    const oldTotalScheduled = this.pfListItem[0].InvoicesScheduled
      ? this.pfListItem[0].InvoicesScheduled
      : 0;
    const totalBudget = this.pfListItem[0].Budget
      ? parseFloat(this.pfListItem[0].Budget) +
      Amount
      : 0 + Amount;
    const oopBudget = this.pfListItem[0].OOPBudget
      ? parseFloat(this.pfListItem[0].OOPBudget) +
      Amount
      : 0 + Amount;
    const pfScheduledOOP =
      parseFloat(oldScheduledOOP) +
      Amount;
    const pfTotalScheduled =
      parseFloat(oldTotalScheduled) +
      Amount;

    const totalInvoiced = this.pfListItem[0].Invoiced
      ? parseFloat(this.pfListItem[0].Invoiced) +
      Amount
      : 0 + Amount;
    const oopInvoiced = this.pfListItem[0].InvoicedOOP
      ? parseFloat(this.pfListItem[0].InvoicedOOP) +
      Amount
      : 0 + Amount;

    if (InvoiceType === "new") {
      return {
        __metadata: {
          type: this.constantService.listNames.ProjectFinances.type,
        },
        ScheduledOOP: pfScheduledOOP,
        InvoicesScheduled: pfTotalScheduled,
        Budget: totalBudget,
        OOPBudget: oopBudget,
      };
    } else {
      return {
        __metadata: {
          type: this.constantService.listNames.ProjectFinances.type,
        },
        Invoiced: totalInvoiced,
        InvoicedOOP: oopInvoiced,
        Budget: totalBudget,
        OOPBudget: oopBudget,
      };
    }
  }

  // PFB
  getPFBData(ScheduleInvoiceForm, InvoiceType: string) {
    let Amount = InvoiceType === 'new' ? parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : parseFloat(ScheduleInvoiceForm.getRawValue().TagAmount);
    let pfbAmountOOP = Amount;
    let pfbAmount = Amount;
    let pfbScheduledOOP = Amount;
    let pfbTotalScheduled = Amount
    let totalInvoiced = Amount;
    let oopInvoiced = Amount;
    if (this.pfbListItem.length > 0) {
      const oldScheduledOOP = this.pfbListItem[0].ScheduledOOP
        ? this.pfbListItem[0].ScheduledOOP
        : 0;
      const oldTotalScheduled = this.pfbListItem[0].TotalScheduled
        ? this.pfbListItem[0].TotalScheduled
        : 0;
      const oldAmountOOP = this.pfbListItem[0].AmountOOP
        ? this.pfbListItem[0].AmountOOP
        : 0;
      const oldTotalAmount = this.pfbListItem[0].Amount
        ? this.pfbListItem[0].Amount
        : 0;
      const oldtotalInvoiced = this.pfbListItem[0].TotalInvoiced
        ? this.pfbListItem[0].TotalInvoiced
        : 0;
      const oldoopInvoiced = this.pfbListItem[0].InvoicedOOP
        ? this.pfbListItem[0].InvoicedOOP
        : 0;
      pfbScheduledOOP =
        parseFloat(oldScheduledOOP) + Amount;
      pfbTotalScheduled =
        parseFloat(oldTotalScheduled) + Amount;
      pfbAmountOOP =
        parseFloat(oldAmountOOP) + Amount;
      pfbAmount =
        parseFloat(oldTotalAmount) + Amount;
      totalInvoiced =
        parseFloat(oldtotalInvoiced) + Amount;
      oopInvoiced =
        parseFloat(oldoopInvoiced) + Amount;
    }

    let Data;
    if (InvoiceType === "new") {
      Data = {
        ScheduledOOP: pfbScheduledOOP,
        TotalScheduled: pfbTotalScheduled,
      };
    } else {
      Data = {
        TotalInvoiced: totalInvoiced,
        InvoicedOOP: oopInvoiced,
      };
    }
    Data["__metadata"] = {
      type: this.constantService.listNames.ProjectFinanceBreakup.type,
    };
    Data["Amount"] = pfbAmount;
    Data["AmountOOP"] = pfbAmountOOP;
    if (!this.pfbListItem.length) {
      Data["POLookup"] = ScheduleInvoiceForm.getRawValue().PONumber.Id;
      Data["ProjectNumber"] = ScheduleInvoiceForm.getRawValue().ProjectCode;
      Data[
        "Status"
      ] = this.constantService.projectFinanceBreakupList.status.Active;
    }
    return Data;
  }

  // PBB
  getPBBData(ScheduleInvoiceForm, InvoiceType) {
    return {
      __metadata: {
        type: this.constantService.listNames.ProjectBudgetBreakup.type,
      },
      ProjectLookup: this.projectInfoLineItem.Id,
      Status: this.constantService.STATUS.APPROVED,
      ApprovalDate: new Date().toISOString(),
      OriginalBudget: InvoiceType === 'new' ? parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : parseFloat(ScheduleInvoiceForm.getRawValue().TagAmount),
      OOPBudget: InvoiceType === 'new' ? parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : parseFloat(ScheduleInvoiceForm.getRawValue().TagAmount),
      ProjectCode: ScheduleInvoiceForm.getRawValue().ProjectCode,
    };
  }

  selectedPaymentMode(val: any) {
    console.log("Payment Mode ", val);
  }

  MarkAsPayment(markAsPayment_form, type: string, fileUploadedUrl) {
    const batchURL = [];
    for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
      const element = this.selectedAllRowsItem[j];
      const speInfoObj = {
        __metadata: { type: this.constantService.listNames.SpendingInfo.type },
        Number: markAsPayment_form.value.Number,
        DateSpend: markAsPayment_form.value.DateSpend,
        PaymentMode: markAsPayment_form.value.PaymentMode.value,
        ApproverFileUrl: fileUploadedUrl,
        Status: element.Status.replace(" Payment Pending", ""),
      };
      const url = this.spServices.getItemURL(
        this.constantService.listNames.SpendingInfo.name,
        element.Id
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        speInfoObj,
        this.constantService.Method.PATCH,
        this.constantService.listNames.SpendingInfo.name
      );
    }
    this.submitForm(batchURL, type);
  }

  // batchContents: any = [];
  async submitForm(dataEndpointArray, type: string) {
    console.log("Form is submitting");

    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "approve-billable",
      "formSubmitForSelectedRow",
      "POST-BATCH"
    );
    const res = await this.spServices.executeBatch(dataEndpointArray);

    const arrResults = res;
    console.log("--oo ", arrResults);
    if (type === "scheduledOOP") {
      this.updateStsToBilled(arrResults);
    } else if (type === "updateScheduledOopLineItem") {
      const message =
        this.scheduleInvoiceType === "new"
          ? "OOP line item is scheduled."
          : "OOP line item tagged to invoice.";
      this.commonService.showToastrMessage(
        this.constantService.MessageType.success,
        message,
        false
      );
      this.reFetchData();
    } else if (type === "markAsPayment_form") {
      this.commonService.showToastrMessage(
        this.constantService.MessageType.success,
        "Payment marked.",
        true
      );
      this.reFetchData();
    } else if (type === "Reject Expense") {
      this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Submitted.', false);
      // this.displayModal = false;
      this.sendMailToSelectedLineItems(type);
      // this.reFetchData();
    }
  }

  sendMailToSelectedLineItems(type: string) {
    const element = this.rowItemDetails;
    this.getPIorClient(element);
    this.sendApproveCanRejExpMail(element, type);
  }

  getPIorClient(rowItem) {
    if (rowItem.ProjectCode && rowItem.ClientLegalEntity) {
      const pc = rowItem.ProjectCode;
      console.log('Project Code is ', pc);
      this.selectedProjectInfo = this.getPIByTitle(pc);
      console.log('this.selectedProjectInfo ', this.selectedProjectInfo);
      this.getResCatByCMLevel();
      this.cleForselectedPI = this.getCleByPC(pc);
    } else {
      this.cleForselectedPI = this.getCleByPC(rowItem.ProjectCode);
      console.log('this.cleForselectedPI ', this.cleForselectedPI);
      this.getResCatByCMLevel();
    }
  }

  getResCatByCMLevel() {
    this.cmLevelIdList = [];
    for (let l = 0; l < this.selectedPI.length; l++) {
      const elements = this.selectedPI[l];
      if (Array.isArray(elements)) {
        for (let e = 0; e < elements.length; e++) {
          const ele = elements[e];
          this.cmLevelIdList.push(ele);
        }
      } else {
        this.cmLevelIdList.push(elements);
      }
    }
    console.log('this.cmLevelIdList ', this.cmLevelIdList);
    this.resCatEmails = [];
    this.resourceCatData();
  }

  resourceCatData() {
    for (let c = 0; c < this.cmLevelIdList.length; c++) {
      const element = this.cmLevelIdList[c];
      // this.resCatEmails.push(this.getResourceData(element))
      const item = this.getResourceData(element);
      item ? this.resCatEmails.push(item) : '';
      // if (item) {
      //     this.resCatEmails.push(item);
      // }
    }
    console.log('resCatEmails ', this.resCatEmails);
  }

  getResourceData(ele) {
    const found = this.rcData.find((x) => {
      if (x.UserNamePG.ID === ele.ID) {
        return x;
      }
    });
    return found ? found : '';
  }

  getCleByPC(title) {
    const found = this.cleData.find((x) => {
      if (x.Title === title) {
        if (x.CMLevel1.hasOwnProperty('results')) {
          this.selectedPI = x.CMLevel1.results;
        }
        return x;
      }
    });
    return found ? found : '';
  }

  getPIByTitle(title) {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode === title) {
        if (x.CMLevel1.hasOwnProperty('results')) {
          this.selectedPI = x.CMLevel1.results;
        }
        console.log('this.selectedPI ', this.selectedPI);
        return x;
      }
    });
    return found ? found : '';
  }

  getAuthor(id) {
    const found = this.rcData.find((x) => {
      if (x.UserNamePG.ID === id) {
        return x;
      }
    });
    return found ? found : '';
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }

  sendApproveCanRejExpMail(expense, type: string) {
    // let isCleData = this.getCleByPC(expense.projectCode);
    const isCleData = this.cleForselectedPI;
    const author = this.getAuthor(expense.AuthorId);
    const val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.ProjectCode + ' (' + isCleData.ClientLegalEntity + ')' : expense.ProjectCode;

    // var mailTemplate =  data.Status === "Approved" ? "ApproveExpense" :  data.Status === "Cancelled" ? "CancelExpense" : "RejectExpense";
    const mailSubject = expense.ProjectCode + ' : Expense Rejected';

    let mailContent = this.mailContentRes[0].retItems[0].ContentMT;
    mailContent = this.replaceContent(mailContent, '@@Val1@@', val1);
    mailContent = this.replaceContent(mailContent, '@@Val2@@', expense.Category);
    mailContent = this.replaceContent(mailContent, '@@Val4@@', expense.ExpenseType);
    mailContent = this.replaceContent(mailContent, '@@Val5@@', expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
    mailContent = this.replaceContent(mailContent, '@@Val6@@', expense.ClientAmount ? expense.ClientCurrency + ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
    mailContent = this.replaceContent(mailContent, '@@Val7@@', expense.Notes);
    mailContent = this.replaceContent(mailContent, '@@Val10@@', this.expenseForm.value.ApproverComments ? this.expenseForm.value.ApproverComments : this.expenseForm.value.ApproverComments);

    mailContent = this.replaceContent(mailContent, '@@Val0@@', expense.Id);
    mailContent = this.replaceContent(mailContent, '@@Val13@@', author.hasOwnProperty('UserNamePG') ? author.UserNamePG.Title : 'Member');
    mailContent = this.replaceContent(mailContent, '@@Val14@@', this.currentUserInfoData.Title);

    const ccUser = this.getCCList(type, expense);
    // ccUser.push(this.currentUserInfoData.Email);
    const tos = this.getTosList(type, expense);
    this.commonService.SetNewrelic('Finance-Dashboard', 'approve-billable', 'sendApproveCanRejExpMail', 'POST');
    this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
    this.reFetchData();
  }

  getCCList(type: string, expense) {
    let arrayCC = [];
    const itApprovers = this.groupITInfo.results;
    const approvers = this.groupInfo.results;
    if (type === 'Reject Expense') {
      // Current User
      arrayCC.push(this.currentUserInfoData.Email);
      // Expense Approver Member
      if (approvers.length) {
        for (const i in approvers) {
          if (approvers[i].Email !== undefined && approvers[i].Email !== '') {
            arrayCC.push(approvers[i].Email);
          }
        }
      }
      // Invoice Team Member
      if (itApprovers.length) {
        arrayCC = arrayCC.concat(this.fdDataShareServie.getITMember(itApprovers));
      }
    }

    arrayCC = arrayCC.filter(this.onlyUnique);
    console.log('arrayCC ', arrayCC);
    return arrayCC;
  }

  getTosList(type: string, expense) {
    let arrayTo = [];
    const approvers = this.groupInfo.results;
    if (type === 'Reject Expense' || type === 'Approve Expense') {
      // Creator
      arrayTo.push(expense.AuthorEMail);

      // CS Team Member
      if (this.resCatEmails.length) {
        arrayTo = arrayTo.concat(this.fdDataShareServie.getCSMember(this.resCatEmails));
      }

    } else if (type === 'Cancel Expense') {
      // Expense Approver Member
      if (approvers.length) {
        for (const i in approvers) {
          if (approvers[i].Email !== undefined && approvers[i].Email !== '') {
            arrayTo.push(approvers[i].Email);
          }
        }
      }
    }
    // arrayTo.push(this.currentUserInfoData.Email);
    arrayTo = arrayTo.filter(this.onlyUnique);
    console.log('arrayTo ', arrayTo);
    return arrayTo;
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }



  updateStsToBilled(arrRet: any) {
    const batchURL = [];
    let pendingAmount = this.scheduleInvoiceForm ? this.scheduleInvoiceForm.getRawValue().Amount - this.scheduleInvoiceForm.getRawValue().TagAmount : 0;
    for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
      const element = this.selectedAllRowsItem[j];
      const clientAmt = element.ClientAmount - pendingAmount;
      const amt = element.Amount - pendingAmount;
      const spObj = {
        __metadata: { type: this.constantService.listNames.SpendingInfo.type },
        Status: element.Status.replace("Approved", "Billed"),
        InvoiceID: arrRet[0].retItems.ID.toString(),
      };
      if (this.scheduleInvoiceType !== 'new') {
        spObj['ClientAmount'] = clientAmt.toString();
        spObj['Amount'] = amt.toString();
      }
      const url = this.spServices.getItemURL(
        this.constantService.listNames.SpendingInfo.name,
        element.Id
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        spObj,
        this.constantService.Method.PATCH,
        this.constantService.listNames.SpendingInfo.name
      );
    }
    console.log("this.updateSpeLineItems ", this.updateSpeLineItems);
    this.submitForm(batchURL, "updateScheduledOopLineItem");
  }

  async reFetchData() {
    this.sowList = [];
    await this.fdDataShareServie.getClePO("approved");
    this.getRequiredData();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  // @HostListener("document:click", ["$event"])
  // clickout(event) {
  //   if (event.target.className === "pi pi-ellipsis-v") {
  //     if (this.tempClick) {
  //       this.tempClick.style.display = "none";
  //       if (
  //         this.tempClick !== event.target.parentElement.children[0].children[0]
  //       ) {
  //         this.tempClick = event.target.parentElement.children[0].children[0];
  //         this.tempClick.style.display = "";
  //       } else {
  //         this.tempClick = undefined;
  //       }
  //     } else {
  //       this.tempClick = event.target.parentElement.children[0].children[0];
  //       this.tempClick.style.display = "";
  //     }
  //   } else {
  //     if (this.tempClick) {
  //       this.tempClick.style.display = "none";
  //       this.tempClick = undefined;
  //     }
  //   }
  // }
  // optionFilter(event: any) {
  //   if (event.target.value) {
  //     this.isOptionFilter = false;
  //   }
  // }

  // ngAfterViewChecked() {
  //   if (this.approvedBillableRes.length && this.isOptionFilter) {
  //     const obj = {
  //       tableData: this.approvedBTable,
  //       colFields: this.appBillableColArray,
  //     };
  //     if (obj.tableData.filteredValue) {
  //       this.commonService.updateOptionValues(obj);
  //     } else if (
  //       obj.tableData.filteredValue === null ||
  //       obj.tableData.filteredValue === undefined
  //     ) {
  //       this.createColFieldValues(obj.tableData.value);
  //       this.isOptionFilter = false;
  //     }
  //   }
  //   this.cdr.detectChanges();
  // }

  onSubmit(scheduleOopInvoice_form, InvoiceType: string, type: string) {
    const batchURL = [];
    let finalAddEArray = []
    let pendingAmount = this.scheduleInvoiceForm ? InvoiceType === 'new' ? 0 : this.scheduleInvoiceForm.getRawValue().Amount - this.scheduleInvoiceForm.getRawValue().TagAmount : 0;
    if (pendingAmount !== 0) {
      for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
        const element = this.selectedAllRowsItem[j];
        finalAddEArray.push({
          Title: element.ProjectCode,
          Number: element.Number,
          SpendType: element.SpendType,
          Currency: element.Currency,
          Amount: pendingAmount.toString(),
          ClientCurrency: element.ClientCurrency,
          ClientAmount: pendingAmount.toString(),
          Status: 'Approved',
          FileURL: element.FileURL,
          ClientApprovalFileURL: element.ClientApprovalFileURL,
          NotesMT: element.Notes,
          CategoryST: element.CategoryST,
          AccessId: element.AccessId,
          RequestType: element.RequestType,
          VendorFreelancer: element.VendorFreelancer,
          PayingEntity: element.PayingEntity,
          ApproverComments: element.ApproverComments,
          DateSpend: element.DateSpend,
          PaymentMode: element.PaymentMode
        });
      }

      for (let j = 0; j < finalAddEArray.length; j++) {
        const element = finalAddEArray[j];
        element['__metadata'] = { type: this.constantService.listNames.SpendingInfo.type };
        const addExpenseObj = Object.assign({}, this.queryConfig);
        addExpenseObj.url = this.spServices.getReadURL(this.constantService.listNames.SpendingInfo.name);
        addExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
        addExpenseObj.type = 'POST';
        addExpenseObj.data = element;
        batchURL.push(addExpenseObj);
      }
    }
    let url = this.spServices.getReadURL(
      this.constantService.listNames.InvoiceLineItems.name,
      null
    );
    this.commonService.setBatchObject(
      batchURL,
      url,
      this.getInvLineItemData(scheduleOopInvoice_form, InvoiceType),
      this.constantService.Method.POST,
      this.constantService.listNames.InvoiceLineItems.name
    );

    if (InvoiceType === "new") {
      url = this.spServices.getItemURL(
        this.constantService.listNames.PO.name,
        this.poItem.ID
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        this.getPOData(
          this.poItem,
          scheduleOopInvoice_form.getRawValue().Amount
        ),
        this.constantService.Method.PATCH,
        this.constantService.listNames.PO.name
      );
    } else {
      const TaggedAmount = InvoiceType === 'new' ? (parseFloat(this.invoice.TaggedAmount) +
        parseFloat(scheduleOopInvoice_form.getRawValue().Amount)) :
        (parseFloat(this.invoice.TaggedAmount) +
          parseFloat(scheduleOopInvoice_form.getRawValue().TagAmount));
      const invoiceData = {
        __metadata: { type: this.constantService.listNames.Invoices.type },
        TaggedAmount: TaggedAmount,
        IsTaggedFully: this.invoice.Amount === TaggedAmount ? "Yes" : "No",
      };
      url = this.spServices.getItemURL(
        this.constantService.listNames.Invoices.name,
        scheduleOopInvoice_form.getRawValue().InvoiceId
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        invoiceData,
        this.constantService.Method.PATCH,
        this.constantService.listNames.Invoices.name
      );
    }

    // PFBB
    url = this.spServices.getReadURL(
      this.constantService.listNames.ProjectBudgetBreakup.name,
      null
    );
    this.commonService.setBatchObject(
      batchURL,
      url,
      this.getPBBData(scheduleOopInvoice_form, InvoiceType),
      this.constantService.Method.POST,
      this.constantService.listNames.ProjectBudgetBreakup.name
    );

    //ProjectFinances update
    url = this.spServices.getItemURL(
      this.constantService.listNames.ProjectFinances.name,
      this.pfListItem[0].Id
    );
    this.commonService.setBatchObject(
      batchURL,
      url,
      this.getPFData(scheduleOopInvoice_form, InvoiceType),
      this.constantService.Method.PATCH,
      this.constantService.listNames.ProjectFinances.name
    );

    // ProjectFinanceBreakup add/update

    url =
      this.pfbListItem.length > 0
        ? this.spServices.getItemURL(
          this.constantService.listNames.ProjectFinanceBreakup.name,
          this.pfbListItem[0].Id
        )
        : this.spServices.getReadURL(
          this.constantService.listNames.ProjectFinanceBreakup.name,
          null
        );
    const Type =
      this.pfbListItem.length > 0
        ? this.constantService.Method.PATCH
        : this.constantService.Method.POST;
    this.commonService.setBatchObject(
      batchURL,
      url,
      this.getPFBData(scheduleOopInvoice_form, InvoiceType),
      Type,
      this.constantService.listNames.ProjectFinanceBreakup.name
    );

    // sowUpdate

    url = this.spServices.getItemURL(
      this.constantService.listNames.SOW.name,
      this.SOW.ID
    );
    this.commonService.setBatchObject(
      batchURL,
      url,
      this.getsowData(scheduleOopInvoice_form, InvoiceType),
      this.constantService.Method.PATCH,
      this.constantService.listNames.SOW.name
    );

    console.log(batchURL);
    this.submitForm(batchURL, type);
  }

  getsowData(scheduleOopInvoice_form, InvoiceType: string) {
    const Amount = InvoiceType === "new" ? parseFloat(scheduleOopInvoice_form.getRawValue().Amount) : parseFloat(scheduleOopInvoice_form.getRawValue().TagAmount);
    const Data = {
      __metadata: { type: this.constantService.listNames.SOW.type },
      TotalLinked: this.SOW.TotalLinked
        ? parseFloat(this.SOW.TotalLinked) + Amount
        : Amount,
      OOPLinked: this.SOW.OOPLinked
        ? parseFloat(this.SOW.OOPLinked) + Amount
        : Amount,
    };

    if (InvoiceType === "new") {
      Data["TotalScheduled"] = this.SOW.TotalScheduled
        ? parseFloat(this.SOW.TotalScheduled) + Amount
        : Amount;
      Data["ScheduledOOP"] = this.SOW.ScheduledOOP
        ? parseFloat(this.SOW.ScheduledOOP) + Amount
        : Amount;
    } else {
      Data["TotalInvoiced"] = this.SOW.TotalInvoiced
        ? parseFloat(this.SOW.TotalInvoiced) + Amount
        : Amount;
      Data["InvoicedOOP"] = this.SOW.InvoicedOOP
        ? parseFloat(this.SOW.InvoicedOOP) + Amount
        : Amount;
    }
    return Data;
  }

  getInvLineItemData(scheduleOopInvoice_form, InvoiceType: string) {
    const Data = {
      __metadata: {
        type: this.constantService.listNames.InvoiceLineItems.type,
      },
      Title: scheduleOopInvoice_form.getRawValue().ProjectCode,
      PO: scheduleOopInvoice_form.getRawValue().PONumber.Id,
      ScheduleType: scheduleOopInvoice_form.getRawValue().ScheduledType,
      ScheduledDate:
        InvoiceType === "new"
          ? scheduleOopInvoice_form.getRawValue().ScheduledDate
          : this.invoice.InvoiceDate,
      Amount: InvoiceType === "new" ? scheduleOopInvoice_form.getRawValue().Amount : scheduleOopInvoice_form.getRawValue().TagAmount,
      AddressType:
        InvoiceType === "new"
          ? scheduleOopInvoice_form.getRawValue().AddressType.value
          : this.invoice.AddressType,
      Currency: scheduleOopInvoice_form.getRawValue().Currency,
      MainPOC:
        InvoiceType === "new"
          ? scheduleOopInvoice_form.getRawValue().POCName.Id
          : this.invoice.MainPOC,
      SOWCode: this.projectInfoLineItem.SOWCode,
      AccessId: { results: this.pcmLevels.map((x) => x.ID) },
      Template: this.pfListItem[0].Template,
      Status:
        InvoiceType === "new"
          ? this.constantService.STATUS.SCHEDUELD
          : this.constantService.STATUS.APPROVED,
    };
    if (InvoiceType !== "new") {
      Data["ProformaLookup"] = this.invoice.ProformaLookup;
      Data["InvoiceLookup"] = scheduleOopInvoice_form.getRawValue().InvoiceId;
      Data["TaggedDate"] = new Date();
    }
    return Data;
  }

  async getSowDetails(sowCode) {
    if (this.sowList.length === 0) {
      const res = await this.spServices.readItems(
        this.constantService.listNames.SOW.name,
        this.fdConstantsService.fdComponent.sowList
      );
      this.sowList = res.length ? res : [];
    }

    return this.sowList.find((c) => c.SOWCode === sowCode)
      ? this.sowList.find((c) => c.SOWCode === sowCode)
      : "";
  }
}
