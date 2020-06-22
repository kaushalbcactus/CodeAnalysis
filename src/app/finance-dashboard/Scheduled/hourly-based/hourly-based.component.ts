import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
  ApplicationRef,
  NgZone,
  ChangeDetectorRef,
} from "@angular/core";
import { Calendar, Table, DialogService } from "primeng";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "src/app/Services/global.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { FdConstantsService } from "../../fdServices/fd-constants.service";
import {
  formatDate,
  DatePipe,
  PlatformLocation,
  LocationStrategy,
} from "@angular/common";
import { FDDataShareService } from "../../fdServices/fd-shareData.service";
import { CommonService } from "src/app/Services/common.service";
import { TimelineHistoryComponent } from "./../../../timeline/timeline-history/timeline-history.component";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { ApproveBillingDialogComponent } from "./approve-billing-dialog/approve-billing-dialog.component";
import { EditInvoiceDialogComponent } from "../../edit-invoice-dialog/edit-invoice-dialog.component";

@Component({
  selector: "app-hourly-based",
  templateUrl: "./hourly-based.component.html",
  styleUrls: ["./hourly-based.component.css"],
})
export class HourlyBasedComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private globalService: GlobalService,
    private spServices: SPOperationService,
    private constantService: ConstantsService,
    private fdConstantsService: FdConstantsService,
    public fdDataShareServie: FDDataShareService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone,
    public dialogService: DialogService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });
  }

  get isValidEdithourlyForm() {
    return this.editHourly_form.controls;
  }
  confirmInvoiceType: string;
  tempClick: any;
  hourlyBasedRes: any = [];

  hourlyBasedCols: any[];

  // Edit hourly Form
  editHourly_form: FormGroup;
  // loader
  isPSInnerLoaderHidden: boolean = true;

  // Show Hide Requesr Expense Modal
  showHideREModal: boolean = false;

  // Right side bar
  rightSideBar: boolean = false;

  formSubmit: any = {
    isSubmit: false,
  };
  submitBtn: any = {
    isClicked: false,
  };
  projectInfoData: any = [];

  // For Mail
  // currentUserInfoData: any;
  groupInfo: any;
  groupITInfo: any;
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  hBQuery: any = [];
  // List of Subscribers
  private subscription: Subscription = new Subscription();

  minScheduleDate: Date = new Date();
  @ViewChild("timelineRef", { static: false })
  timeline: TimelineHistoryComponent;
  @ViewChild("hb", { static: false }) hourlyTable: Table;
  // Purchase Order Number
  purchaseOrdersList: any = [];

  // Project COntacts
  projectContactsData: any = [];

  // Client Legal Entity
  cleData: any = [];

  // Resource Categorization
  rcData: any = [];

  projectCodes: any = [];

  hourlyBasedColArray = {
    ProjectCode: [],
    ShortTitle: [],
    SOWValue: [],
    ProjectMileStone: [],
    ClientLegalEntity: [],
    PONumber: [],
    POName: [],
    Rate: [],
    HoursSpent: [],
    Currency: [],
    POCName: [],
    TotalInvoice: [],
  };

  // CLick on Table Check box to Select All Row Item
  selectedAllRowsItem: any = [];
  selectedRowItemPC: any;

  items: any[];
  hourlyDialog: any = {
    title: "",
    text: "",
  };

  hourlyModal: boolean = false;
  confirmationModal: boolean = false;
  selectedRowItem: any;

  // ProjectInfo line item by Selected Row Item
  projectInfoLineItem: any;
  poLineItem: any;

  projectBudgetBreakupData: any;
  ProjectFinanceBreakupData: any;
  sowData: any;
  sowObj: any = {};
  poLookupDataObj: any = {};
  pcmLevels: any = [];
  batchContents: any = [];
  // Send Mail

  // Mail Content
  mailContentRes: any;

  selectedProjectInof: any;
  cleForselectedPI: any;

  selectedPI: any = [];
  cmLevelIdList: any = [];
  resCatEmails: any = [];
  isOptionFilter: boolean;

  async ngOnInit() {
    this.createHBCCols();
    // this.getHourlyBasedData();
    this.createHourlyFormField();
    // this.createHourlyConfirmFormField();

    // Get Projects & PC
    await this.projectInfo();
    this.poInfo();
    this.projectContacts();
    // GEt Client Legal Entity
    // this.cleInfo();
    this.resourceCInfo();

    console.log(this.globalService.currentUser.email);
    // For Mail
    // this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
    // console.log('this.currentUserInfoData  ', this.currentUserInfoData);

    //commented by maxwell as not in use

    // this.groupInfo = await this.fdDataShareServie.getGroupInfo();
    // console.log('this.groupInfo  ', this.groupInfo);
    this.groupITInfo = await this.fdDataShareServie.getITInfo();
    console.log("this.groupITInfo  ", this.groupITInfo);
  }

  // Project Info
  async projectInfo() {
    this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
    // Check PI list
    await this.fdDataShareServie.checkProjectsAvailable();
    this.subscription.add(
      this.fdDataShareServie.defaultPIData.subscribe((res) => {
        if (res) {
          this.projectInfoData = res;
          console.log("this.projectInfoData ", this.projectInfoData);
          this.getPCForSentToAMForApproval();
        }
      })
    );
  }

  updateCalendarUI(calendar: Calendar) {
    calendar.updateUI();
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
          // this.getPCForSentToAMForApproval();
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

  createHourlyFormField() {
    this.editHourly_form = this.fb.group({
      ProjectCode: [{ value: "", disabled: true }, Validators.required],
      // PONumber: [{ value: '', disabled: true }, Validators.required],
      POCName: [{ value: "", disabled: true }, Validators.required],
      Currency: [{ value: "", disabled: true }, Validators.required],
      Rate: ["", Validators.required],
      HoursSpent: ["", Validators.required],
      // ScheduledDate: ['', Validators.required],
      // AddressType: ['', Validators.required],
    });
  }

  createHBCCols() {
    this.hourlyBasedCols = [
      { field: "ProjectCode", header: "Project Code", visibility: true },
      { field: "ProjectTitle", header: "Project Title", visibility: false },
      { field: "ShortTitle", header: "Short Title", visibility: true },
      { field: "SOWValue", header: "SOW Code/ Name", visibility: true },
      {
        field: "ProjectMileStone",
        header: "Project Milestone",
        visibility: true,
      },
      { field: "ClientLegalEntity", header: "Client", visibility: true },
      { field: "PONumber", header: "PO Number", visibility: true },
      { field: "POName", header: "PO Name", visibility: true },
      { field: "POCName", header: "POC Name", visibility: true },
      { field: "Currency", header: "Currency", visibility: true },
      { field: "Rate", header: "Rate", visibility: true },
      { field: "HoursSpent", header: "Hrs", visibility: true },
      { field: "TotalInvoice", header: "Total Invoice", visibility: true },

      {
        field: "ProposedEndDate",
        header: "Proposed End Date",
        visibility: false,
      },
      { field: "Modified", header: "Modified", visibility: false },
      { field: "SOWName", header: "SOW Name", visibility: false },
      { field: "SOWCode", header: "SOW Code", visibility: false },
      { field: "Invoiced", header: "Invoiced", visibility: false },
      { field: "", header: "", visibility: true },
    ];
  }

  getPCForSentToAMForApproval() {
    this.projectCodes = [];
    for (let i = 0; i < this.projectInfoData.length; i++) {
      const element = this.projectInfoData[i];
      if (
        element.Status ===
        this.constantService.projectStatus.SentToAMForApproval
      ) {
        this.projectCodes.push(element);
      }
    }
    console.log("projectCodes ", this.projectCodes);
    if (this.projectCodes) {
      this.getRequiredData();
    }
  }

  async getRequiredData() {
    this.hourlyBasedRes = [];
    this.hBQuery = [];
    const batchUrl = [];
    this.projectCodes.forEach((element) => {
      const prjObj = Object.assign({}, this.queryConfig);
      prjObj.url = this.spServices.getReadURL(
        this.constantService.listNames.ProjectFinances.name,
        this.fdConstantsService.fdComponent.projectFinances
      );
      prjObj.url = prjObj.url.replace("{{ProjectCode}}", element.ProjectCode);
      prjObj.listName = this.constantService.listNames.ProjectFinances.name;
      prjObj.type = "GET";
      batchUrl.push(prjObj);
    });
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "Schedule-hourlyBased",
      "getPFbyProjectCode"
    );
    const res = await this.spServices.executeBatch(batchUrl);
    const arrResults = res.length ? res.map((a) => a.retItems) : [];
    this.formatData(arrResults);
    this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
  }

  async formatData(data: any[]) {
    this.hourlyBasedRes = [];
    console.log("Project Finance Data ", data);
    for (let p = 0; p < this.projectCodes.length; p++) {
      for (let pf = 0; pf < data.length; pf++) {
        if (this.projectCodes[p].ProjectCode === data[pf][0].Title) {
          const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(
            this.projectCodes[p].SOWCode
          );
          const poDetail = await this.getPONumber(this.projectCodes[p]);
          const piInfo = await this.getMilestones(this.projectCodes[p]);
          const poc = this.getPOCName(this.projectCodes[p].PrimaryPOC);
          this.hourlyBasedRes.push({
            Id: this.projectCodes[p].ID,
            ProjectCode: this.projectCodes[p].ProjectCode,
            ProjectTitle: piInfo.Title ? piInfo.Title : "",
            ShortTitle: piInfo && piInfo.WBJID ? piInfo.WBJID : "",
            SOWCode: this.projectCodes[p].SOWCode,
            SOWValue: this.projectCodes[p].SOWCode + " / " + sowItem.Title,
            SOWName: sowItem.Title,
            ProjectMileStone: piInfo.Milestone ? piInfo.Milestone : "",
            ClientLegalEntity: this.projectCodes[p].ClientLegalEntity,
            ProposedEndDate: this.datePipe.transform(
              this.projectCodes[p].ProposedEndDate,
              "MMM dd, yyyy, hh:mm a"
            ),
            POCName: poc ? poc.FName + " " + poc.LName : "",
            POC: poc,
            PO: poDetail,
            POName: poDetail.Name,
            PONumber: poDetail.Number,
            PFID: data[pf][0].ID,
            Currency: data[pf][0].Currency,
            Rate: parseFloat(data[pf][0].Budget).toFixed(2),
            HoursSpent: parseFloat(data[pf][0].HoursSpent.toFixed(2)),
            BudgetHrs: data[pf][0].BudgetHrs,
            Template: data[pf][0].Template,
            TotalInvoice: this.updateTotal(
              data[pf][0].Budget,
              data[pf][0].HoursSpent
            ),
            Modified: data[pf][0].Modified,
            ApprovedBudget: data[pf][0].ApprovedBudget,
            RevenueBudget: data[pf][0].RevenueBudget,
            OOPBudget: data[pf][0].OOPBudget,
            TaxBudget: data[pf][0].TaxBudget,
            InvoicesScheduled: data[pf][0].InvoicesScheduled,
            ScheduledRevenue: data[pf][0].ScheduledRevenue,
            ScheduledOOP: data[pf][0].ScheduledOOP,
            Invoiced: data[pf][0].Invoiced,
            InvoicedRevenue: data[pf][0].InvoicedRevenue,
            InvoicedOOP: data[pf][0].InvoicedOOP,
            InvoicedTax: data[pf][0].InvoicedTax,
            BillableExpenses: data[pf][0].BillableExpenses,
            NonBillableExpenses: data[pf][0].NonBillableExpenses,
            Realization: data[pf][0].Realization,
          });
        }
      }
    }
    this.hourlyBasedRes = [...this.hourlyBasedRes];
    this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    // console.log('hourlyBasedRes data ', this.hourlyBasedRes);
    this.createColFieldValues(this.hourlyBasedRes);
  }

  updateTotal(rate, hrs) {
    return (rate * hrs).toFixed(2);
  }

  // Project Current Milestones
  getMilestones(pc: any) {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode === pc.ProjectCode) {
        return x;
      }
    });
    return found ? found : "";
  }

  // Project Client
  getCLE(pc: any) {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode == pc.Title) {
        return x.ClientLegalEntity;
      }
    });
    return found ? found.ClientLegalEntity : "";
  }

  // Project PO
  async getPONumber(pf) {
    // Get Finance Brekup List
    const pfbObj = Object.assign(
      {},
      this.fdConstantsService.fdComponent.projectFinanceBreakupForPO
    );
    pfbObj.filter = pfbObj.filter.replace("{{ProjectCode}}", pf.ProjectCode);
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "Schedule-hourlyBased",
      "GetPoNO"
    );
    const res = await this.spServices.readItems(
      this.constantService.listNames.ProjectFinanceBreakup.name,
      pfbObj
    );
    // const res = await this.getProjectBudgetBreakup(endPoints, 'poDetails');
    const poByPfb = res.length ? res[0] : { POLookup: "" };
    const found = this.purchaseOrdersList.find((x) => {
      if (x.ID === poByPfb.POLookup) {
        return x;
      }
    });
    return found ? found : "";
  }

  getPODetailsByPF(poId) {
    const found = this.purchaseOrdersList.find((x) => {
      if (x.ID === poId.PO) {
        return x;
      }
    });
    return found ? found : "";
  }

  getPOCName(poc: any) {
    const found = this.projectContactsData.find((x) => {
      if (x.ID === poc) {
        return x;
      }
    });
    return found ? found : "";
  }

  createColFieldValues(resArray) {
    this.hourlyBasedColArray.ProjectCode = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ProjectCode, value: a.ProjectCode };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.ShortTitle = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ShortTitle, value: a.ShortTitle };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.SOWValue = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.SOWValue, value: a.SOWValue };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.ProjectMileStone = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.ProjectMileStone, value: a.ProjectMileStone };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.ClientLegalEntity = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = {
              label: a.ClientLegalEntity,
              value: a.ClientLegalEntity,
            };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.PONumber = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.PONumber, value: a.PONumber };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.POName = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.POName, value: a.POName };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.Currency = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.Currency, value: a.Currency };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );
    this.hourlyBasedColArray.POCName = this.commonService.sortData(
      this.uniqueArrayObj(
        resArray
          .map((a) => {
            const b = { label: a.POCName, value: a.POCName };
            return b;
          })
          .filter((ele) => ele.label)
      )
    );

    const rate = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: parseFloat(a.Rate), value: a.Rate };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.hourlyBasedColArray.Rate = this.fdDataShareServie.customSort(
      rate,
      1,
      "label"
    );
    const hoursSpent = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.HoursSpent, value: a.HoursSpent };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.hourlyBasedColArray.HoursSpent = this.fdDataShareServie.customSort(
      hoursSpent,
      1,
      "label"
    );
    const totalInvoice = this.uniqueArrayObj(
      resArray
        .map((a) => {
          const b = { label: a.TotalInvoice, value: a.TotalInvoice };
          return b;
        })
        .filter((ele) => ele.label)
    );
    this.hourlyBasedColArray.TotalInvoice = this.fdDataShareServie.customSort(
      totalInvoice,
      1,
      "label"
    );
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

  // Open popups
  openPopup(data, popUpData) {
    console.log("Row data  ", data);
    // console.log('pubSupportSts  ', pubSupportSts);

    this.items = [
      {
        label: "Confirm Project",
        command: (e) => this.openMenuContent(e, data),
      },
      {
        label: "Edit Line item",
        command: (e) => this.openMenuContent(e, data),
      },
      {
        label: "View Project Details",
        command: (e) => this.openMenuContent(e, data),
      },
      { label: "Details", command: (e) => this.openMenuContent(e, data) },
      { label: "Show History", command: (e) => this.openMenuContent(e, data) },
    ];
  }

  async openMenuContent(event, data) {
    this.selectedRowItem = data;
    console.log(event);
    this.hourlyDialog.title = event.item.label;
    if (this.hourlyDialog.title.toLowerCase() === "confirm project") {
      await this.getSelectedLineItemDetails();
      if (new Date(this.poLookupDataObj.ExpiryDate) < new Date()) {
        this.commonService.showToastrMessage(
          this.constantService.MessageType.info,
          "PO is expired.",
          false
        );
        return;
      }
      this.confirmInvoiceType = "";
      const ref = this.dialogService.open(ApproveBillingDialogComponent, {
        header: "Approve for billing",
        width: "65vw",
        data: {
          selectedRowItem: this.selectedRowItem,
          projectInfoData: this.projectInfoData,
          purchaseOrdersList: this.purchaseOrdersList,
          sowObj: this.sowObj,
          poLookupDataObj: this.poLookupDataObj,
        },
        contentStyle: { "overflow-y": "visible" },
        closable: false,
      });

      ref.onClose.subscribe((confirmInvoice: any) => {
        if (confirmInvoice) {
          this.onSubmit(confirmInvoice, "confirmInvoice");
        }
      });
      this.getConfirmMailContent("ConfirmInvoice");
      this.getPIByTitle(this.selectedRowItem);
    } else if (this.hourlyDialog.title === "Edit Line item") {
      const ref = this.dialogService.open(EditInvoiceDialogComponent, {
        header: "Edit Line item",
        width: "75vw",
        data: {
          InvoiceType: "hourly",
          projectContactsData: this.projectContactsData,
          selectedRowItem: this.selectedRowItem,
        },
        contentStyle: { "max-height": "80vh", "overflow-y": "auto" },
        closable: false,
      });
      ref.onClose.subscribe((editInvoice: any) => {
        if (editInvoice) {
          const batchURL = this.fdDataShareServie.EditInvoiceDialogProcess(
            "hourly",
            this.selectedRowItem,
            editInvoice
          );
          this.commonService.SetNewrelic(
            "Finance-Dashboard",
            "Schedule-hourlyBased",
            "updatePFLItem"
          );
          this.submitForm(null, batchURL, "editInvoice");
        }
      });
    } else if (
      this.hourlyDialog.title.toLowerCase() === "view project details"
    ) {
      this.goToProjectDetails(this.selectedRowItem);
    } else if (this.hourlyDialog.title.toLowerCase() === "show history") {
      this.timeline.showTimeline(data.Id, "FD", "Rolling");
    } else if (event.item.label === "Details") {
      this.rightSideBar = !this.rightSideBar;
      return;
    }
  }

  async getSelectedLineItemDetails() {
    const batchUrl = [];
    // Get Project Budget Brekup
    let url = this.spServices.getReadURL(
      this.constantService.listNames.ProjectBudgetBreakup.name,
      this.fdConstantsService.fdComponent.projectBudgetBreakup
    );
    url = url.replace("{{ProjectCode}}", this.selectedRowItem.ProjectCode);
    this.commonService.setBatchObject(
      batchUrl,
      url,
      null,
      "GET",
      this.constantService.listNames.ProjectBudgetBreakup.name
    );

    // Get Finance Brekup List
    url = this.spServices.getReadURL(
      this.constantService.listNames.ProjectFinanceBreakup.name,
      this.fdConstantsService.fdComponent.projectFinanceBreakup
    );
    url = url.replace("{{ProjectCode}}", this.selectedRowItem.ProjectCode);
    this.commonService.setBatchObject(
      batchUrl,
      url,
      null,
      "GET",
      this.constantService.listNames.ProjectFinanceBreakup.name
    );

    // Get SOW
    url = this.spServices.getReadURL(
      this.constantService.listNames.SOW.name,
      this.fdConstantsService.fdComponent.sowByProjectCode
    );
    url = url.replace("{{SOWCode}}", this.selectedRowItem.SOWCode);
    this.commonService.setBatchObject(
      batchUrl,
      url,
      null,
      "GET",
      this.constantService.listNames.SOW.name
    );

    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "Schedule-hourlyBased",
      "getPFBPFBBSow"
    );

    const res = await this.spServices.executeBatch(batchUrl);
    const arrResults = res.length ? res.map((a) => a.retItems) : [];
    if (arrResults.length) {
      console.log("arrResults ", arrResults);
      this.projectBudgetBreakupData = arrResults[0][0];
      this.ProjectFinanceBreakupData = arrResults[1][0];
      if (this.ProjectFinanceBreakupData) {
        this.poLookupDataObj = {};
        const poObj = this.getPODetails(
          this.ProjectFinanceBreakupData.POLookup
            ? this.ProjectFinanceBreakupData.POLookup
            : ""
        );
        console.log("poobj ", poObj);
        this.getPOObj(poObj);
      }
      this.sowData = arrResults[2][0];
      if (this.sowData) {
        this.getSOWObj(this.sowData);
      }
    }
  }

  // Go to Project Details Page
  goToProjectDetails(data: any) {
    console.log(data);
    window.open(
      this.globalService.sharePointPageObject.webAbsoluteUrl +
        "/dashboard#/projectMgmt/allProjects?ProjectCode=" +
        data.ProjectCode
    );
  }

  getProjectInfoLineItem() {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode == this.selectedRowItem.ProjectCode) {
        return x;
      }
    });
    return found ? found : "";
  }

  getPODetails(polookup) {
    const found = this.purchaseOrdersList.find((x) => {
      if (x.ID === polookup) {
        return x;
      }
    });
    return found ? found : "";
  }

  getPOObj(poObj) {
    this.poLookupDataObj.ID = poObj.ID;
    this.poLookupDataObj.ExpiryDate = poObj.POExpiryDate;
    this.poLookupDataObj.TotalLinked = poObj.TotalLinked
      ? poObj.TotalLinked
      : 0;
    this.poLookupDataObj.RevenueLinked = poObj.RevenueLinked
      ? poObj.RevenueLinked
      : 0;
    this.poLookupDataObj.AmountRevenue = poObj.AmountRevenue
      ? poObj.AmountRevenue
      : 0;
    this.poLookupDataObj.TotalScheduled = poObj.TotalScheduled
      ? poObj.TotalScheduled
      : 0;
    this.poLookupDataObj.ScheduledRevenue = poObj.ScheduledRevenue
      ? poObj.ScheduledRevenue
      : 0;
    this.poLookupDataObj.Number = poObj.Number;
    this.poLookupDataObj.availablePOBudget =
      parseFloat(poObj.AmountRevenue ? poObj.AmountRevenue : 0) -
      parseFloat(poObj.RevenueLinked ? poObj.RevenueLinked : 0);
    console.log(this.poLookupDataObj);
    return this.poLookupDataObj;
  }

  getSOWObj(sow: any) {
    this.sowObj.availableSOWBudget =
      parseFloat(sow.NetBudget ? sow.NetBudget : 0) -
      parseFloat(sow.RevenueLinked ? sow.RevenueLinked : 0);
    this.sowData.TotalLinked = sow.TotalLinked ? sow.TotalLinked : 0;
    this.sowData.ScheduledRevenue = sow.ScheduledRevenue
      ? sow.ScheduledRevenue
      : 0;
    this.sowData.TotalScheduled = sow.TotalScheduled ? sow.TotalScheduled : 0;
    this.sowData.RevenueLinked = sow.RevenueLinked ? sow.RevenueLinked : 0;
  }
  updateSelectedLineItem(invoiceform) {
    const Invoiceform = invoiceform.ApproveInvoiceForm;
    this.isPSInnerLoaderHidden = false;
    const batchUrl = [];
    const rate = this.selectedRowItem.Rate ? this.selectedRowItem.Rate : 0;
    const hrs = this.selectedRowItem.HoursSpent
      ? this.selectedRowItem.HoursSpent
      : 0;
    const totalVal = rate * hrs;

    // PI Id
    const piId = this.getProjectId(this.selectedRowItem);
    this.pcmLevels = [];
    if (piId) {
      for (let i = 0; i < piId.CMLevel1.results.length; i++) {
        const element = piId.CMLevel1.results[i];
        this.pcmLevels.push(element);
      }
      this.pcmLevels.push(piId.CMLevel2);
    }

    // Update ProjectInformation
    const piData = {
      __metadata: {
        type: this.constantService.listNames.ProjectInformation.type,
      },
      Status: this.constantService.projectStatus.AuditInProgress,
      ProposeClosureDate: new Date(),
      IsApproved: "Yes",
    };

    let url = this.spServices.getItemURL(
      this.constantService.listNames.ProjectInformation.name,
      +piId.Id
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      piData,
      this.constantService.Method.PATCH,
      this.constantService.listNames.ProjectInformation.name
    );

    // Update ProjectFinanceBreakup
    url = this.spServices.getItemURL(
      this.constantService.listNames.ProjectFinanceBreakup.name,
      +this.ProjectFinanceBreakupData.ID
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      this.getpfbData(Invoiceform, totalVal),
      this.constantService.Method.PATCH,
      this.constantService.listNames.ProjectFinanceBreakup.name
    );

    // Project Finance

    url = this.spServices.getItemURL(
      this.constantService.listNames.ProjectFinances.name,
      +this.selectedRowItem.PFID
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      this.getpfData(Invoiceform, totalVal, hrs),
      this.constantService.Method.PATCH,
      this.constantService.listNames.ProjectFinances.name
    );

    ///Update ProjectBudgetBreakup
    let pbbData = {
      __metadata: {
        type: this.constantService.listNames.ProjectBudgetBreakup.type,
      },
      OriginalBudget: totalVal,
      NetBudget: totalVal,
      Status: this.constantService.STATUS.APPROVED,
      ApprovalDate: Invoiceform.value.approvalDate,
      BudgetHours: hrs,
    };

    url = this.spServices.getItemURL(
      this.constantService.listNames.ProjectBudgetBreakup.name,
      +this.projectBudgetBreakupData.ID
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      pbbData,
      this.constantService.Method.PATCH,
      this.constantService.listNames.ProjectBudgetBreakup.name
    );

    // Update SOW

    url = this.spServices.getItemURL(
      this.constantService.listNames.SOW.name,
      +this.sowData.ID
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      this.getSowData(totalVal, Invoiceform.value.InvoiceType),
      this.constantService.Method.PATCH,
      this.constantService.listNames.SOW.name
    );

    if (Invoiceform.value.InvoiceType === "new") {
      // Update PO Linked
      const updatedPOTotalLinkedValue =
        parseFloat(this.poLookupDataObj.TotalLinked) + totalVal;
      const updatedPORevenueLinked =
        parseFloat(this.poLookupDataObj.RevenueLinked) + totalVal;
      const updatedPOTotalScheduled =
        parseFloat(this.poLookupDataObj.TotalScheduled) + totalVal;
      const updatedScheduledRevenue =
        parseFloat(this.poLookupDataObj.ScheduledRevenue) + totalVal;

      // update PO

      const poData = {
        __metadata: { type: this.constantService.listNames.PO.type },
        TotalLinked: updatedPOTotalLinkedValue,
        RevenueLinked: updatedPORevenueLinked,
        TotalScheduled: updatedPOTotalScheduled,
        ScheduledRevenue: updatedScheduledRevenue,
      };

      url = this.spServices.getItemURL(
        this.constantService.listNames.PO.name,
        +this.poLookupDataObj.ID
      );
      this.commonService.setBatchObject(
        batchUrl,
        url,
        poData,
        this.constantService.Method.PATCH,
        this.constantService.listNames.PO.name
      );
    } else {
      const TaggedAmount =
        parseFloat(invoiceform.Invoice.TaggedAmount) + totalVal;
      const invoiceData = {
        __metadata: { type: this.constantService.listNames.Invoices.type },
        TaggedAmount: TaggedAmount,
        IsTaggedFully:
          invoiceform.Invoice.Amount === TaggedAmount ? "Yes" : "No",
      };
      url = this.spServices.getItemURL(
        this.constantService.listNames.Invoices.name,
        invoiceform.Invoice.ID
      );
      this.commonService.setBatchObject(
        batchUrl,
        url,
        invoiceData,
        this.constantService.Method.PATCH,
        this.constantService.listNames.Invoices.name
      );
    }

    // Add InvoiceLineItem
    url = this.spServices.getReadURL(
      this.constantService.listNames.InvoiceLineItems.name
    );
    this.commonService.setBatchObject(
      batchUrl,
      url,
      this.getInvoiceLineItemData(invoiceform, piId, totalVal),
      this.constantService.Method.POST,
      this.constantService.listNames.InvoiceLineItems.name
    );

    const item = this.projectInfoData.find((x) => {
      return x.ProjectCode === this.selectedRowItem.ProjectCode;
    });

    const projIndex = this.projectInfoData.findIndex((x) => {
      return x.ProjectCode === this.selectedRowItem.ProjectCode;
    });
    item.Status = this.constantService.SOW_STATUS.AUDIT_IN_PROGRESS;
    this.projectInfoData.splice(projIndex, 1, item);
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "Schedule-hourlyBased",
      "updatePOPBBPFBSow"
    );
    this.submitForm(Invoiceform, batchUrl, "confirmInvoice");
  }

  getpfbData(Invoiceform, totalVal) {
    const pfbData = {
      __metadata: {
        type: this.constantService.listNames.ProjectFinanceBreakup.type,
      },
      Amount: totalVal,
      AmountRevenue: totalVal,
    };
    if (Invoiceform.value.InvoiceType === "new") {
      pfbData["TotalScheduled"] = totalVal;
      pfbData["ScheduledRevenue"] = totalVal;
    } else {
      pfbData["InvoicedRevenue"] = totalVal;
      pfbData["TotalInvoiced"] = totalVal;
    }
    return pfbData;
  }

  getpfData(Invoiceform, totalVal, hrs) {
    const pfData = {
      __metadata: { type: this.constantService.listNames.ProjectFinances.type },
      ApprovedBudget: totalVal,
      BudgetHrs: hrs,
    };
    if (Invoiceform.value.InvoiceType === "new") {
      pfData["InvoicesScheduled"] = totalVal;
      pfData["ScheduledRevenue"] = totalVal;
    } else {
      pfData["InvoicedRevenue"] = totalVal;
      pfData["Invoiced"] = totalVal;
    }

    return pfData;
  }

  getInvoiceLineItemData(invoiceform, piId, totalVal) {
    const Invoiceform = invoiceform.ApproveInvoiceForm;
    const Invoice = invoiceform.Invoice;
    const InvoiceType = Invoiceform.value.InvoiceType;
    const iliData = {
      __metadata: {
        type: this.constantService.listNames.InvoiceLineItems.type,
      },
      Title: this.selectedRowItem.ProjectCode,
      Status:
        InvoiceType === "new"
          ? this.constantService.STATUS.CONFIRMED
          : this.constantService.STATUS.APPROVED,
      ScheduledDate:
        InvoiceType === "new"
          ? Invoiceform.value.approvalDate
          : Invoice.InvoiceDate,
      Amount: totalVal,
      Currency: this.selectedRowItem.Currency,
      PO: this.poLookupDataObj.ID,
      MainPOC: InvoiceType === "new" ? piId.PrimaryPOC : Invoice.MainPOC,
      ScheduleType: "revenue",
      AddressType: InvoiceType === "new" ? "Client" : Invoice.AddressType,
      Template: this.selectedRowItem.Template,
      CSId: { results: this.pcmLevels.map((x) => x.ID) },
      SOWCode: this.selectedRowItem.SOWCode,
    };

    if (InvoiceType !== "new") {
      iliData["ProformaLookup"] = Invoice.ProformaLookup;
      iliData["InvoiceLookup"] = Invoiceform.value.InvoiceId;
    }
    return iliData;
  }

  getSowData(totalVal: number, InvoiceType: string) {
    const sowData = {
      __metadata: { type: this.constantService.listNames.SOW.type },
      TotalLinked: this.sowData.TotalLinked
        ? parseFloat(this.sowData.TotalLinked) + totalVal
        : totalVal,
      RevenueLinked: this.sowData.RevenueLinked
        ? parseFloat(this.sowData.RevenueLinked) + totalVal
        : totalVal,
    };
    if (InvoiceType === "new") {
      sowData["ScheduledRevenue"] = this.sowData.ScheduledRevenue
        ? parseFloat(this.sowData.ScheduledRevenue) + totalVal
        : totalVal;
      sowData["TotalScheduled"] = this.sowData.TotalScheduled
        ? parseFloat(this.sowData.TotalScheduled) + totalVal
        : totalVal;
    } else {
      sowData["InvoicedRevenue"] = this.sowData.InvoicedRevenue
        ? parseFloat(this.sowData.InvoicedRevenue) + totalVal
        : 0;
      sowData["TotalInvoiced"] = this.sowData.TotalInvoiced
        ? parseFloat(this.sowData.TotalInvoiced) + totalVal
        : totalVal;
    }
    return sowData;
  }

  getProjectId(pc: any) {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode === pc.ProjectCode) {
        return x;
      }
    });
    return found ? found : "";
  }

  async onSubmit(Invoiceform, type: string) {
    this.formSubmit.isSubmit = true;

    if (type === "confirmInvoice") {
      this.isPSInnerLoaderHidden = false;
      this.submitBtn.isClicked = true;
      this.updateSelectedLineItem(Invoiceform);
    }
  }

  updateHourlyData() {
    const found = this.hourlyBasedRes.find((ele) => {
      if (ele.ProjectCode === this.selectedRowItem.ProjectCode) {
        this.selectedRowItem.Rate = ele.Rate = this.editHourly_form.value.Rate;
        this.selectedRowItem.HoursSpent = ele.HoursSpent = this.editHourly_form.value.HoursSpent;
        this.selectedRowItem.TotalInvoice = ele.TotalInvoice =
          ele.Rate * ele.HoursSpent;
      }
    });
    this.hourlyModal = false;
    return found;
  }

  async submitForm(invoiceform, batchUrl, type: string) {
    const res = await this.spServices.executeBatch(batchUrl);
    const arrResults = res.length ? res.map((a) => a.retItems) : [];
    console.log("--oo ", arrResults);
    if (type === "confirmInvoice") {
      const message =
        this.confirmInvoiceType === "new"
          ? " Invoice line item is confirmed."
          : "Invoice line item tagged to invoice.";
      this.commonService.showToastrMessage(
        this.constantService.MessageType.success,
        message,
        false
      );
      this.sendConfirmInvoiceMail(invoiceform);
    } else if (type === "editInvoice") {
      this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
      this.commonService.showToastrMessage(
        this.constantService.MessageType.success,
        "Invoice Updated.",
        false
      );

      this.reFetchData("edit");
    }
  }

  async getConfirmMailContent(type) {
    // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
    const mailContentEndpoint = {
      filter: this.fdConstantsService.fdComponent.mailContent.filter.replace(
        "{{MailType}}",
        type
      ),
      select: this.fdConstantsService.fdComponent.mailContent.select,
      top: this.fdConstantsService.fdComponent.mailContent.top,
    };

    const ProposeCMailContentEndpoint = {
      filter: this.fdConstantsService.fdComponent.mailContent.filter.replace(
        "{{MailType}}",
        "AuditProject"
      ),
      select: this.fdConstantsService.fdComponent.mailContent.select,
      top: this.fdConstantsService.fdComponent.mailContent.top,
    };

    const obj = [
      {
        url: this.spServices.getReadURL(
          this.constantService.listNames.MailContent.name,
          mailContentEndpoint
        ),
        type: "GET",
        listName: this.constantService.listNames.MailContent.name,
      },
      {
        url: this.spServices.getReadURL(
          this.constantService.listNames.MailContent.name,
          ProposeCMailContentEndpoint
        ),
        type: "GET",
        listName: this.constantService.listNames.MailContent.name,
      },
    ];
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "Schedule-hourlyBased",
      "getEmailTemplates"
    );
    const res = await this.spServices.executeBatch(obj);
    this.mailContentRes = res;
    console.log("Approve Mail Content res ", this.mailContentRes);
  }

  getPIByTitle(title) {
    const found = this.projectInfoData.find((x) => {
      if (x.ProjectCode == title.ProjectCode) {
        if (x.CMLevel1.hasOwnProperty("results")) {
          this.selectedPI = x.CMLevel1.results;
        }
        console.log("this.selectedPI ", this.selectedPI);
        this.getResCatByCMLevel();
        return x;
      }
    });
    return found ? found : "";
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
    console.log("this.cmLevelIdList ", this.cmLevelIdList);
    this.resCatEmails = [];
    this.resourceCatData();
  }

  resourceCatData() {
    for (let c = 0; c < this.cmLevelIdList.length; c++) {
      const element = this.cmLevelIdList[c];
      const item = this.getResourceData(element);
      item ? this.resCatEmails.push(item) : "";
    }
    console.log("resCatEmails ", this.resCatEmails);
  }

  getResourceData(ele) {
    const found = this.rcData.find((x) => {
      if (x.UserNamePG.ID === ele.ID) {
        return x;
      }
    });
    return found ? found : "";
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, "g"), value);
  }

  sendConfirmInvoiceMail(Invoiceform) {
    const sharepointPageObject = this.globalService.sharePointPageObject;
    // Confirmation Mail
    const mailSubject =
      this.selectedRowItem.ProjectCode +
      "/" +
      this.selectedRowItem.ClientLegalEntity +
      ": Confirmed line item for billing";
    let mailContent = this.mailContentRes[0].retItems[0].Content;
    mailContent = this.replaceContent(
      mailContent,
      "@@Val1@@",
      "Hello Invoice Team"
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val2@@",
      this.selectedRowItem.ProjectCode
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val3@@",
      this.selectedRowItem.ClientLegalEntity
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val4@@",
      this.selectedRowItem.PONumber
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val5@@",
      this.datePipe.transform(Invoiceform.value.approvalDate, "MMM dd, yyyy")
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val6@@",
      this.selectedRowItem.Currency +
        " " +
        this.selectedRowItem.Rate * this.selectedRowItem.HoursSpent
    );
    mailContent = this.replaceContent(
      mailContent,
      "@@Val7@@",
      this.selectedRowItem.SOWCode
    );

    // Propose Closure Mail Content
    const pcmailSubject =
      this.selectedRowItem.ProjectCode +
      "(" +
      this.selectedRowItem.Id +
      "): " +
      "Propose closure for project";
    let pcmailContent = this.mailContentRes[1].retItems[0].Content;
    pcmailContent = this.replaceContent(pcmailContent, "@@Val3@@", "All");
    pcmailContent = this.replaceContent(
      pcmailContent,
      "@@Val1@@",
      this.selectedRowItem.ProjectCode
    );
    pcmailContent = this.replaceContent(
      pcmailContent,
      "@@Val2@@",
      this.selectedRowItem.ClientLegalEntity
    );
    pcmailContent = this.replaceContent(
      pcmailContent,
      "@@Val5@@",
      this.selectedRowItem.HoursSpent
    );
    pcmailContent = this.replaceContent(
      pcmailContent,
      "@@Val6@@",
      sharepointPageObject.webAbsoluteUrl + "/dashboard#/financeDashboard"
    );

    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "HourlyBased-invoiceTeam",
      "SendMail"
    );
    this.spServices.sendMail(
      this.getTosList("i").join(","),
      this.globalService.currentUser.email,
      mailSubject,
      mailContent,
      this.getCCList("i").join(",")
    );
    this.commonService.SetNewrelic(
      "Finance-Dashboard",
      "HourlyBased-proposeClosure",
      "SendMail"
    );
    this.spServices.sendMail(
      this.getTosList("pc").join(","),
      this.globalService.currentUser.email,
      pcmailSubject,
      pcmailContent,
      this.getCCList("pc").join(",")
    );
    this.confirmationModal = false;
    this.reFetchData("confirm");
  }

  getTosList(type: string) {
    const itApprovers = this.groupITInfo.results;
    let arrayTo = [];
    if (type === "i") {
      if (itApprovers.length) {
        for (const i in itApprovers) {
          if (
            itApprovers[i].Email !== undefined &&
            itApprovers[i].Email !== ""
          ) {
            arrayTo.push(itApprovers[i].Email);
          }
        }
      }
    } else if (type === "pc") {
      // CS Member
      arrayTo = arrayTo.concat(
        this.fdDataShareServie.getCSMember(this.resCatEmails)
      );
    }

    arrayTo = arrayTo.filter(this.onlyUnique);
    console.log("arrayTo ", arrayTo);
    return arrayTo;
  }

  getCCList(type: string) {
    let arrayCC = [];
    if (type === "i") {
      // Current User
      arrayCC.push(this.globalService.currentUser.email);
      // CS Member
      arrayCC = arrayCC.concat(
        this.fdDataShareServie.getCSMember(this.resCatEmails)
      );
    } else if (type === "pc") {
      // Current User
      arrayCC.push(this.globalService.currentUser.email);
    }
    arrayCC = arrayCC.filter(this.onlyUnique);
    console.log("arrayCC ", arrayCC);
    return arrayCC;
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  reFetchData(type: string) {
    setTimeout(async () => {
      if (type !== "edit") {
        this.purchaseOrdersList = [];
        this.cleData = [];
        this.projectInfoData = [];
        // Refetch PO/CLE Data
        await this.fdDataShareServie.getClePO("hourly");
        // Fetch latest PO & CLE
        // this.poInfo();
        // this.cleInfo();
        // this.projectInfo();
        // this.getPCForSentToAMForApproval();
      } else {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        this.getPCForSentToAMForApproval();
      }
      this.isPSInnerLoaderHidden = true;
    }, 300);
  }

  onlyNumberKey(event) {
    // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  @HostListener("document:click", ["$event"])
  clickout(event) {
    if (event.target.className === "pi pi-ellipsis-v") {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
        if (
          this.tempClick !== event.target.parentElement.children[0].children[0]
        ) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = "";
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = "";
      }
    } else {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
        this.tempClick = undefined;
      }
    }
  }
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.hourlyBasedRes.length && this.isOptionFilter) {
      const obj = {
        tableData: this.hourlyTable,
        colFields: this.hourlyBasedColArray,
      };
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (
        obj.tableData.filteredValue === null ||
        obj.tableData.filteredValue === undefined
      ) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }
}
