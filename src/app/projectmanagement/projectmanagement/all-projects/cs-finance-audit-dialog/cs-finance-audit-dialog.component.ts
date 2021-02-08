import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import {
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService,
} from "primeng/dynamicdialog";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { AuditProjectDialogComponent } from "../audit-project-dialog/audit-project-dialog.component";
import { ConstantsService } from "src/app/Services/constants.service";
import { PMObjectService } from "src/app/projectmanagement/services/pmobject.service";
import { PMCommonService } from "src/app/projectmanagement/services/pmcommon.service";
import { PmconstantService } from "src/app/projectmanagement/services/pmconstant.service";
import { GlobalService } from "src/app/Services/global.service";
import { Table } from "primeng/table";

@Component({
  selector: "app-cs-finance-audit-dialog",
  templateUrl: "./cs-finance-audit-dialog.component.html",
  styleUrls: ["./cs-finance-audit-dialog.component.css"],
  providers: [DialogService],
})
export class CsFinanceAuditDialogComponent implements OnInit {
  projectUpdated = false;
  @ViewChild("csfinanceAuditTable", { static: false })
  csfinanceAuditTable: Table;
  projectList: any;
  checked = false;
  public allProjects = {
    SOWCode: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    ProjectType: [],
    Status: [],
    TA: [],
    Molecule: [],
    PrimaryResources: [],
    POC: [],
  };

  options = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  selectedProjects = [];

  displayedColumns: any[] = [
    {
      field: "SOWCode",
      header: "Sow Code",
      visibility: true,
      Type: "string",
      dbName: "SOWCode",
      options: [],
    },
    {
      field: "ProjectCode",
      header: "Project Code",
      visibility: true,
      Type: "string",
      dbName: "ProjectCode",
      options: [],
    },
    {
      field: "ShortTitle",
      header: "Short Title",
      visibility: true,
      Type: "string",
      dbName: "ShortTitle",
      options: [],
    },
    {
      field: "ClientLegalEntity",
      header: "Client Legal Entity",
      visibility: true,
      Type: "string",
      dbName: "ClientLegalEntity",
      options: [],
    },
    {
      field: "ProjectType",
      header: "Project Type",
      visibility: true,
      Type: "string",
      dbName: "ProjectType",
      options: [],
    },
    {
      field: "PrimaryResources",
      header: "Primary Resources",
      visibility: true,
      Type: "string",
      dbName: "Status",
      options: [],
    },
    {
      field: "POC",
      header: "POC",
      visibility: true,
      Type: "string",
      dbName: "POC",
      options: [],
    },
    {
      field: "TA",
      header: "TA",
      visibility: true,
      Type: "string",
      dbName: "TA",
      options: [],
    },
    {
      field: "Molecule",
      header: "Molecule",
      visibility: true,
      Type: "string",
      dbName: "Molecule",
      options: [],
    },
  ];
  modalloaderenable = true;
  AuditType = "";
  EmailTemplate: any;
  dbProjectList: never[];
  buttonloader = false;
  ErrorProjectCodes = [];
  constructor(
    public config: DynamicDialogConfig,
    public csref: DynamicDialogRef,
    public dialogService: DialogService,
    public pmObject: PMObjectService,
    private globalObject: GlobalService,
    private constants: ConstantsService,
    public pmCommonService: PMCommonService,
    private cdr: ChangeDetectorRef,
    private pmConstant: PmconstantService,
    private spServices: SPOperationService,
    private commonService: CommonService
  ) {}

  async ngOnInit() {
    this.projectList = this.config.data.projectList;
    this.dbProjectList = this.projectList.slice(0);
    this.AuditType = this.config.data.AuditListType;
    this.displayedColumns = await this.commonService.MainfilterForTable(
      this.displayedColumns,
      this.projectList
    );
    // this.createColFieldValues(this.projectList);
  }

  async ngAfterViewInit() {
    if (this.config.data.tableData.filters.ProjectCode[0].value) {
      await this.PrefilterData("ProjectCode", "in");
    }
    if (this.config.data.tableData.filters.SOWCode[0].value) {
      await this.PrefilterData("SOWCode", "in");
    }
    if (this.config.data.tableData.filters.ShortTitle[0].value) {
      await this.PrefilterData("ShortTitle", "in");
    }
    if (this.config.data.tableData.filters.ClientLegalEntity[0].value) {
      await this.PrefilterData("ClientLegalEntity", "in");
    }
    if (this.config.data.tableData.filters.ProjectType[0].value) {
      await this.PrefilterData("ProjectType", "in");
    }
    if (this.config.data.tableData.filters.POC[0].value) {
      await this.PrefilterData("POC", "in");
    }
    if (this.config.data.tableData.filters.PrimaryResources[0].value) {
      await this.PrefilterData("PrimaryResources", "contains");
    }
    if (this.config.data.tableData.filters.TA[0].value) {
      await this.PrefilterData("TA", "in");
    }
    if (this.config.data.tableData.filters.Molecule[0].value) {
      await this.PrefilterData("Molecule", "in");
    }
    setTimeout(() => {
      this.modalloaderenable = false;
    }, 300);
  }

  PrefilterData(Type: string, filterType) {
    const data = this.displayedColumns
      .find((c) => c.dbName === Type)
      .options.map((c) => c.value)
      .filter((c) =>
        this.config.data.tableData.filters[Type][0].value.includes(c)
      );
    this.csfinanceAuditTable.filter(data, Type, filterType);
    setTimeout(() => {
      this.csfinanceAuditTable.filters[Type] = null;
      this.csfinanceAuditTable.filters[Type] = [
        {
          matchMode: filterType,
          operator: "and",
          value: data,
        },
      ];
    }, 200);
  }

  // **************************************************************************************
  // To Close dialog
  // **************************************************************************************
  cancel() {
    if (this.projectUpdated) {
      this.csref.close(this.projectUpdated);
    } else {
      this.csref.close();
    }
  }

  // **************************************************************************************
  // On row checkbox select for finance (maximum 10 rows are allowed)
  // **************************************************************************************

  onRowSelect() {
    if (this.selectedProjects.length > 10) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        "Maximum 10 projects allowed for audit.",
        false
      );
    } else if (this.selectedProjects.length === 10) {
      this.checked = true;
    } else {
      false;
    }
  }

  onRowUnselect() {
    if (this.selectedProjects.length >= 10) {
      this.checked = true;
    } else {
      this.checked = false;
    }
  }

  // **************************************************************************************
  // Audit project button click
  // **************************************************************************************

  async AuditProjects(AuditType) {
    if (AuditType === "CS") {
      const addRollingProjectArray = [
        {
          checked: false,
          parameter: "All project attributes are correct",
          comments: "",
          hideCheckBox: false,
        },
        {
          checked: false,
          parameter: "Final documents uploaded for all the tasks",
          comments: "",
          hideCheckBox: false,
        },
        {
          checked: false,
          parameter: "Is the project budget and budget hours correct?",
          comments: "",
          hideCheckBox: false,
        },
        {
          checked: false,
          parameter: "Is the pub support status updated to submitted?",
          comments: "",
          hideCheckBox: false,
        },
        {
          checked: false,
          parameter: "Are the CM Lvl 2 and Delivery Lvl 2 correct?",
          comments: "",
          hideCheckBox: false,
        },
        {
          checked: false,
          parameter: "Check if any CDs are open?",
          comments: "Select One",
          hideCheckBox: true,
        },
        {
          checked: false,
          parameter: "Has ER been fully accrued before proposing closure?",
          comments: "Select One",
          hideCheckBox: true,
        },
      ];

      const expenseInvoiceLineItems = await this.getInvoceExpense(
        this.selectedProjects
      );
      const InvoiceLineItems = [].concat(
        ...expenseInvoiceLineItems
          .filter(
            (c) => c.listName === this.constants.listNames.InvoiceLineItems.name
          )
          .map((c) => c.retItems)
      );

      let UniqueInvalidInvoices = [];

      if (InvoiceLineItems) {
        if (InvoiceLineItems.filter((c) => c.Status === "Scheduled")) {
          UniqueInvalidInvoices = InvoiceLineItems.filter(
            (c) => c.Status == "Scheduled"
          )
            .map((c) => c.Title)
            .filter(
              (item, index) =>
                InvoiceLineItems.filter((c) => c.Status == "Scheduled")
                  .map((c) => c.Title)
                  .indexOf(item) === index
            );
        }
      }
      const ExpenseLineItems = [].concat(
        ...expenseInvoiceLineItems
          .filter(
            (c) => c.listName === this.constants.listNames.SpendingInfo.name
          )
          .map((c) => c.retItems)
      );

      let UniqueInvalidExpenses = [];
      if (ExpenseLineItems) {
        const AllBillable = ExpenseLineItems.filter(
          (c) => c.CategoryST === "Billable"
        );
        let UniqueInvalidBilledExpenses = [];
        let UniqueInvalidNonBilledExpenses = [];
        if (AllBillable) {
          UniqueInvalidBilledExpenses = AllBillable.filter(
            (c) =>
              c.Status.indexOf("Billed") === -1 &&
              c.Status !== "Rejected" &&
              c.Status !== "Cancelled"
          )
            ? AllBillable.filter(
                (c) =>
                  c.Status.indexOf("Billed") === -1 &&
                  c.Status !== "Rejected" &&
                  c.Status !== "Cancelled"
              )
                .map((c) => c.Title)
                .filter(
                  (item, index) =>
                    AllBillable.filter(
                      (c) =>
                        c.Status.indexOf("Billed") === -1 &&
                        c.Status !== "Rejected" &&
                        c.Status !== "Cancelled"
                    )
                      .map((c) => c.Title)
                      .indexOf(item) === index
                )
            : [];
        }
        const AllNonBillable = ExpenseLineItems.filter(
          (c) => c.CategoryST === "Non Billable"
        );
        if (AllNonBillable) {
          UniqueInvalidNonBilledExpenses = AllNonBillable.filter(
            (c) =>
              c.Status.indexOf("Approved") === -1 &&
              c.Status !== "Rejected" &&
              c.Status !== "Cancelled"
          )
            ? AllNonBillable.filter(
                (c) =>
                  c.Status.indexOf("Approved") === -1 &&
                  c.Status !== "Rejected" &&
                  c.Status !== "Cancelled"
              )
                .map((c) => c.Title)
                .filter(
                  (item, index) =>
                    AllNonBillable.filter(
                      (c) =>
                        c.Status.indexOf("Approved") === -1 &&
                        c.Status !== "Rejected" &&
                        c.Status !== "Cancelled"
                    )
                      .map((c) => c.Title)
                      .indexOf(item) === index
                )
            : [];
        }

        UniqueInvalidExpenses = []
          .concat(UniqueInvalidBilledExpenses, UniqueInvalidNonBilledExpenses)
          .filter(
            (item, index) =>
              []
                .concat(
                  UniqueInvalidBilledExpenses,
                  UniqueInvalidNonBilledExpenses
                )
                .indexOf(item) === index
          );
      }

      if (
        UniqueInvalidExpenses.length > 0 ||
        UniqueInvalidInvoices.length > 0
      ) {
        if (UniqueInvalidInvoices.length > 0) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            UniqueInvalidInvoices.join(", ") + " line item is not Confirmed.",
            true
          );
        }

        if (UniqueInvalidExpenses.length > 0) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            UniqueInvalidExpenses.join(", ") +
              " expense not scheduled / confirmed.",
            true
          );
        }

        this.ErrorProjectCodes.push.apply(this.ErrorProjectCodes, [
          ...new Set([].concat(UniqueInvalidInvoices, UniqueInvalidExpenses)),
        ]);
        this.selectedProjects = this.selectedProjects.filter(
          (c) => !this.ErrorProjectCodes.includes(c.ProjectCode)
        );
        this.checked = this.selectedProjects.length >= 10 ? true : false;
        this.modalloaderenable = false;
        this.buttonloader = false;
      } else {
        this.ErrorProjectCodes = [];
        this.modalloaderenable = false;
        this.buttonloader = false;
        const ref = this.dialogService.open(AuditProjectDialogComponent, {
          header: " Audit Projects",
          width: "60vw",
          data: addRollingProjectArray,
          closable: false,
        });
        ref.onClose.subscribe(async (Auditproj: any) => {
          if (Auditproj) {
            this.modalloaderenable = true;
            const piUdpate = {
              AuditCheckList: Auditproj,
              Status: this.constants.projectStatus.PendingClosure,
              PrevStatus: this.constants.projectStatus.AuditInProgress,
              __metadata: {
                type: this.constants.listNames.ProjectInformation.type,
              },
            };

            await this.UpdateProjects(piUdpate);

            this.commonService.showToastrMessage(
              this.constants.MessageType.success,
              "Selected Projects Updated Successfully.",
              false
            );
          }
        });
      }
    } else {
      this.buttonloader = true;
      this.modalloaderenable = true;
      const dbExpenseInvoiceArray = await this.getInvoceExpense(
        this.selectedProjects
      );
      let dbInvoiceLineItems = [];
      let dbExpenseLineItems = [];
      if (dbExpenseInvoiceArray) {
        dbInvoiceLineItems = [].concat(
          ...dbExpenseInvoiceArray
            .filter(
              (c) =>
                c.listName === this.constants.listNames.InvoiceLineItems.name
            )
            .map((c) => c.retItems)
        );
        dbExpenseLineItems = [].concat(
          ...dbExpenseInvoiceArray
            .filter(
              (c) => c.listName === this.constants.listNames.SpendingInfo.name
            )
            .map((c) => c.retItems)
        );
      }

      let UniqueInvalidInvoices = [];
      if (dbInvoiceLineItems) {
        if (dbInvoiceLineItems.filter((c) => c.Status !== "Approved")) {
          UniqueInvalidInvoices = dbInvoiceLineItems
            .filter((c) => c.Status !== "Approved")
            .map((c) => c.Title)
            .filter(
              (item, index) =>
                dbInvoiceLineItems
                  .filter((c) => c.Status !== "Approved")
                  .map((c) => c.Title)
                  .indexOf(item) === index
            );
        }
      }
      let UniqueInvalidExpenses = [];
      if (dbExpenseLineItems) {
        const AllBillable = dbExpenseLineItems.filter(
          (c) => c.CategoryST === "Billable"
        );
        let UniqueInvalidBilledExpenses = [];
        let UniqueInvalidNonBilledExpenses = [];
        if (AllBillable) {
          UniqueInvalidBilledExpenses = AllBillable.filter(
            (c) =>
              c.Status.indexOf("Billed") === -1 &&
              c.Status !== "Rejected" &&
              c.Status !== "Cancelled"
          )
            ? AllBillable.filter(
                (c) =>
                  c.Status.indexOf("Billed") === -1 &&
                  c.Status !== "Rejected" &&
                  c.Status !== "Cancelled"
              )
                .map((c) => c.Title)
                .filter(
                  (item, index) =>
                    AllBillable.filter(
                      (c) =>
                        c.Status.indexOf("Billed") === -1 &&
                        c.Status !== "Rejected" &&
                        c.Status !== "Cancelled"
                    )
                      .map((c) => c.Title)
                      .indexOf(item) === index
                )
            : [];
        }
        const AllNonBillable = dbExpenseLineItems.filter(
          (c) => c.CategoryST === "Non Billable"
        );
        if (AllNonBillable) {
          UniqueInvalidNonBilledExpenses = AllNonBillable.filter(
            (c) =>
              c.Status.indexOf("Approved") === -1 &&
              c.Status !== "Rejected" &&
              c.Status !== "Cancelled"
          )
            ? AllNonBillable.filter(
                (c) =>
                  c.Status.indexOf("Approved") === -1 &&
                  c.Status !== "Rejected" &&
                  c.Status !== "Cancelled"
              )
                .map((c) => c.Title)
                .filter(
                  (item, index) =>
                    AllNonBillable.filter(
                      (c) =>
                        c.Status.indexOf("Approved") === -1 &&
                        c.Status !== "Rejected" &&
                        c.Status !== "Cancelled"
                    )
                      .map((c) => c.Title)
                      .indexOf(item) === index
                )
            : [];
        }

        UniqueInvalidExpenses = []
          .concat(UniqueInvalidBilledExpenses, UniqueInvalidNonBilledExpenses)
          .filter(
            (item, index) =>
              []
                .concat(
                  UniqueInvalidBilledExpenses,
                  UniqueInvalidNonBilledExpenses
                )
                .indexOf(item) === index
          );
      }
      const errorMessage = [];
      if (
        UniqueInvalidExpenses.length > 0 ||
        UniqueInvalidInvoices.length > 0
      ) {
        if (UniqueInvalidInvoices.length > 0) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            UniqueInvalidInvoices.join(", ") + " line items are not invoiced.",
            true
          );
        }

        if (UniqueInvalidExpenses.length > 0) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            UniqueInvalidExpenses.join(", ") + " expense are not invoiced.",
            true
          );
        }

        this.ErrorProjectCodes.push.apply(this.ErrorProjectCodes, [
          ...new Set([].concat(UniqueInvalidInvoices, UniqueInvalidExpenses)),
        ]);
        this.selectedProjects = this.selectedProjects.filter(
          (c) => !this.ErrorProjectCodes.includes(c.ProjectCode)
        );
        this.checked = this.selectedProjects.length >= 10 ? true : false;
        this.modalloaderenable = false;
        this.buttonloader = false;
      } else {
        this.ErrorProjectCodes = [];
        const addRollingProjectArray = [
          {
            checked: false,
            parameter: "All invoices are generated",
            comments: "",
            hideCheckBox: false,
          },
          {
            checked: false,
            parameter: "All expenses are billed",
            comments: "",
            hideCheckBox: false,
          },
        ];
        this.modalloaderenable = false;
        this.buttonloader = false;
        const ref = this.dialogService.open(AuditProjectDialogComponent, {
          header: " Audit Projects",
          width: "65vw",
          data: addRollingProjectArray,
          closable: false,
        });
        ref.onClose.subscribe(async (Auditproj: any) => {
          if (Auditproj) {
            this.modalloaderenable = true;
            const piUdpate = {
              FinanceAuditCheckList: Auditproj,
              Status: this.constants.projectStatus.Closed,
              ActualEndDate: new Date(),
              PrevStatus: this.constants.projectStatus.PendingClosure,
              __metadata: {
                type: this.constants.listNames.ProjectInformation.type,
              },
            };
            await this.UpdateProjects(piUdpate);

            this.commonService.showToastrMessage(
              this.constants.MessageType.success,
              "Selected projects closed successfully.",
              false
            );
          }
        });
      }
    }
  }
  // **************************************************************************************
  // Update project on audit comment dialog
  // **************************************************************************************

  async UpdateProjects(piUdpate) {
    let batchResults = [];
    let batchURL = [];
    let finalArray = [];

    this.selectedProjects.forEach(async (element) => {
      const ProjectUpdate = Object.assign({}, this.options);
      ProjectUpdate.data = piUdpate;
      ProjectUpdate.listName = this.constants.listNames.ProjectInformation.name;
      ProjectUpdate.type = "PATCH";
      ProjectUpdate.url = this.spServices.getItemURL(
        this.constants.listNames.ProjectInformation.name,
        element.ID
      );
      batchURL.push(ProjectUpdate);

      if (batchURL.length === 99) {
        this.commonService.SetNewrelic(
          "projectManagment",
          "cs-finance-auditdialog",
          "UpdateProjectFinanceAuditToClosed",
          "POST-BATCH"
        );
        batchResults = await this.spServices.executeBatch(batchURL);

        finalArray = [...finalArray, ...batchResults];
        batchURL = [];
        this.projectUpdated = true;
      }
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "projectManagment",
        "cs-finance-auditdialog",
        "UpdateProjectFinanceAuditToClosed",
        "POST-BATCH"
      );
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
      this.projectUpdated = true;
    }

    this.projectList = this.projectList.filter(
      (c) => !this.selectedProjects.includes(c)
    );

    this.displayedColumns = await this.commonService.MainfilterForTable(
      this.displayedColumns,
      this.projectList
    );

    if (this.csfinanceAuditTable.filteredValue) {
      this.updateTableFilterOption();
    }
    this.modalloaderenable = false;
    if (
      this.selectedProjects.length === this.dbProjectList.length ||
      this.projectList.length === 0
    ) {
      this.csref.close(this.projectUpdated);
    }
    this.selectedProjects = [];
  }

  // **************************************************************************************
  //  Get invoices of selected project for audit check
  // **************************************************************************************

  async getInvoceExpense(selectedProjects) {
    let batchURL = [];
    let batchResults = [];
    let finalArray = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };

    selectedProjects.forEach(async (element) => {
      const invoiceGet = Object.assign({}, options);
      const invoiceFilter = Object.assign(
        {},
        this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE
      );
      invoiceFilter.filter = invoiceFilter.filter.replace(
        /{{projectCode}}/gi,
        element.ProjectCode
      );
      invoiceGet.url = this.spServices.getReadURL(
        this.constants.listNames.InvoiceLineItems.name,
        invoiceFilter
      );
      invoiceGet.type = "GET";
      invoiceGet.listName = this.constants.listNames.InvoiceLineItems.name;
      batchURL.push(invoiceGet);

      const expanseGet = Object.assign({}, options);
      const expanseQuery = Object.assign(
        {},
        this.pmConstant.FINANCE_QUERY.GET_OOP
      );
      expanseQuery.filter = expanseQuery.filterByProjectCode.replace(
        /{{projectCode}}/gi,
        element.ProjectCode
      );
      const expanseEndPoint = this.spServices.getReadURL(
        "" + this.constants.listNames.SpendingInfo.name + "",
        expanseQuery
      );
      expanseGet.url = expanseEndPoint.replace(
        "{0}",
        "" + this.globalObject.currentUser.userId
      );
      expanseGet.type = "GET";
      expanseGet.listName = this.constants.listNames.SpendingInfo.name;
      batchURL.push(expanseGet);

      if (batchURL.length === 98) {
        this.commonService.SetNewrelic(
          "projectManagment",
          "cs-finance-auditdialog",
          "getProjectsExpenseInvoiceLineItem",
          "GET-BATCH"
        );
        batchResults = await this.spServices.executeBatch(batchURL);

        finalArray = [...finalArray, ...batchResults];
        batchURL = [];
        this.projectUpdated = true;
      }
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "projectManagment",
        "cs-finance-auditdialog",
        "getProjectsExpenseInvoiceLineItem",
        "GET-BATCH"
      );
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }
    return finalArray;
  }

  // **************************************************************************************
  // header checkbox select for multiple select in  Finance Audit
  // **************************************************************************************

  MultipleSelectRows(AuditType) {
    setTimeout(() => {
      if (this.csfinanceAuditTable.filteredValue) {
        if (
          this.csfinanceAuditTable.filteredValue.length > 10 &&
          !this.checked
        ) {
          this.selectedProjects = this.csfinanceAuditTable.filteredValue.slice(
            this.csfinanceAuditTable.first,
            this.csfinanceAuditTable.first + 10
          );
          this.checked = true;
        } else if (this.checked === true) {
          this.selectedProjects = [];
          this.checked = false;
        }
      } else {
        if (this.projectList.length > 10 && !this.checked) {
          this.selectedProjects = this.projectList.slice(
            this.csfinanceAuditTable.first,
            this.csfinanceAuditTable.first + 10
          );
          this.checked = true;
        } else if (this.checked === true) {
          this.selectedProjects = [];
          this.checked = false;
        }
      }
    }, 100);
  }

  updateTableFilterOption() {
    // Need to check
    // if (this.allProjectRef.filters.ProjectCode) {
    //   this.columnFilter.ProjectCode = this.allProjects.ProjectCode.map(c => c.value).filter(c => this.allProjectRef.filters.ProjectCode.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.ProjectCode, 'ProjectCode', 'in')
    // }
    // if (this.allProjectRef.filters.SOWCode) {
    //   this.columnFilter.SOWCode = this.allProjects.SOWCode.map(c => c.value).filter(c => this.allProjectRef.filters.SOWCode.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.SOWCode, 'SOWCode', 'in')
    // }
    // if (this.allProjectRef.filters.ShortTitle) {
    //   this.columnFilter.ShortTitle = this.allProjects.ShortTitle.map(c => c.value).filter(c => this.allProjectRef.filters.ShortTitle.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.ShortTitle, 'ShortTitle', 'in')
    // }
    // if (this.allProjectRef.filters.ClientLegalEntity) {
    //   this.columnFilter.ClientLegalEntity = this.allProjects.ClientLegalEntity.map(c => c.value).filter(c => this.allProjectRef.filters.ClientLegalEntity.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.ClientLegalEntity, 'ClientLegalEntity', 'in')
    // }
    // if (this.allProjectRef.filters.ProjectType) {
    //   this.columnFilter.ProjectType = this.allProjects.ProjectType.map(c => c.value).filter(c => this.allProjectRef.filters.ProjectType.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.ProjectType, 'ProjectType', 'in')
    // }
    // if (this.allProjectRef.filters.POC) {
    //   this.columnFilter.POC = this.allProjects.POC.map(c => c.value).filter(c => this.allProjectRef.filters.POC.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.POC, 'POC', 'in');
    // }
    // if (this.allProjectRef.filters.PrimaryResources) {
    //   this.columnFilter.PrimaryResources = this.allProjectRef.filters.PrimaryResources.value;
    //   this.allProjectRef.filter(this.columnFilter.PrimaryResources, 'PrimaryResources', 'in')
    // }
    // if (this.allProjectRef.filters.TA) {
    //   this.columnFilter.TA = this.allProjects.TA.map(c => c.value).filter(c => this.allProjectRef.filters.TA.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.TA, 'TA', 'in')
    // }
    // if (this.allProjectRef.filters.Molecule) {
    //   this.columnFilter.Molecule = this.allProjects.Molecule.map(c => c.value).filter(c => this.allProjectRef.filters.Molecule.value.includes(c));
    //   this.allProjectRef.filter(this.columnFilter.Molecule, 'Molecule', 'in')
    // }
  }

  GetTaskBackrgoundColor(projectCode) {
    return this.ErrorProjectCodes.find((c) => c === projectCode)
      ? "#ffcacf"
      : "";
  }
}
