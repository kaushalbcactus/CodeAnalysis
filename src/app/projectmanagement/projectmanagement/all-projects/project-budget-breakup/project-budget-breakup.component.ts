import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicDialogConfig, Table } from "primeng";
import { PmconstantService } from "src/app/projectmanagement/services/pmconstant.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-project-budget-breakup",
  templateUrl: "./project-budget-breakup.component.html",
  styleUrls: ["./project-budget-breakup.component.css"]
})
export class ProjectBudgetBreakupComponent implements OnInit {
  projectCode: any;
  sowCode: any;
  PBBColumns: any = [];
  PBBDetails: any = [];
  sowBudgetColumns: any = [];
  sowBudgetDetails: any = [];
  batchUrl = [];
  options = {
    data: null,
    url: "",
    type: "",
    listName: ""
  };
  PBBFilters: any = {};
  SOWBudgetFilters: any = {};

  constructor(
    public config: DynamicDialogConfig,
    private pmConstant: PmconstantService,
    private constants: ConstantsService,
    private spServices: SPOperationService,
    private common: CommonService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.projectCode = this.config.data.projectCode;
    this.sowCode = this.config.data.sowCode;
    this.PBBColumns = [
      { field: "ApprovalDate", header: "Approval Date", visibility: true },
      { field: "Status", header: "Status", visibility: true },
      { field: "OriginalBudget", header: "Total Budget ", visibility: true },
      { field: "NetBudget", header: "Revenue", visibility: true },
      { field: "OOPBudget", header: "OOP", visibility: true },
      { field: "TaxBudget", header: "Tax", visibility: true },
      { field: "BudgetHours", header: "Budget Hours", visibility: true },
      {
        field: "Reason",
        header: "Reason",
        visibility: true
      },
      {
        field: "CommentsMT",
        header: "Comments",
        visibility: true
      }
    ];
    this.sowBudgetColumns = [
      {
        field: "InternalReviewStartDate",
        header: "Internal Review Start Date",
        visibility: true
      },
      { field: "Status", header: "Status", visibility: true },
      { field: "TotalBudget", header: "Total Budget ", visibility: true },
      { field: "NetBudget", header: "Revenue", visibility: true },
      { field: "OOPBudget", header: "OOP", visibility: true },
      { field: "TaxBudget", header: "Tax", visibility: true },
      {
        field: "AddendumTotalBudget",
        header: "Addendum Total Budget",
        visibility: true
      },
      {
        field: "AddendumNetBudget",
        header: "Addendum Net Budget",
        visibility: true
      },
      {
        field: "AddendumOOPBudget",
        header: "Addendum OOP Budget",
        visibility: true
      },
      {
        field: "AddendumTaxBudget",
        header: "Addendum Tax Budget",
        visibility: true
      }
      // { field: "Currency", header: "Currency", visibility: true }
    ];
    if (this.projectCode) {
      this.getProjectBudgetBrekup();
    } else if (this.sowCode) {
      this.getSowBudgetBrekup();
    }
  }

  async getProjectBudgetBrekup() {
    const pbbGet = Object.assign({}, this.options);
    const pbbFilter = Object.assign(
      {},
      this.pmConstant.FINANCE_QUERY.PROJECT_BUDGET_BREAKUP_FOR_ALL
    );
    pbbFilter.filter = pbbFilter.filter.replace(
      /{{projectCode}}/gi,
      this.projectCode
    );
    pbbGet.url = this.spServices.getReadURL(
      this.constants.listNames.ProjectBudgetBreakup.name,
      pbbFilter
    );
    pbbGet.type = "GET";
    pbbGet.listName = this.constants.listNames.ProjectBudgetBreakup.name;
    this.batchUrl.push(pbbGet);
    const result = await this.spServices.executeBatch(this.batchUrl);
    this.PBBDetails = result[0].retItems;
    this.PBBDetails.forEach((part, index, arr) => {
      arr[index].ApprovalDate = new Date(arr[index].ApprovalDate);
    });
    this.sortData(this.PBBDetails, "ApprovalDate");
    this.colFiltersForPBB(this.PBBDetails);
  }

  async getSowBudgetBrekup() {
    const budgetGet = Object.assign({}, this.options);
    const budgetEndPoint = this.spServices.getReadURL(
      this.constants.listNames.SOWBudgetBreakup.name,
      this.pmConstant.SOW_QUERY.SOW_BUDGET_BREAKUP_ALL
    );
    budgetGet.url = budgetEndPoint.replace(
      /{{SOWCodeStr}}/gi,
      "" + this.sowCode
    );
    budgetGet.type = "GET";
    budgetGet.listName = this.constants.listNames.SOWBudgetBreakup.name;
    this.batchUrl.push(budgetGet);
    const results = await this.spServices.executeBatch(this.batchUrl);
    this.sowBudgetDetails = results[0].retItems;
    this.sowBudgetDetails.forEach((ele, index, arr) => {
      arr[index].InternalReviewStartDate = new Date(arr[index].InternalReviewStartDate);
    });
    this.sortData(this.sowBudgetDetails, "InternalReviewStartDate");
    this.colFiltersForSOW(this.sowBudgetDetails);
  }

  colFiltersForPBB(colData) {
    this.PBBFilters.ApprovalDate = this.common.sortData(
      this.uniqueArrayObj(
        colData
          .map(a => {
            let b = {
              label: this.datePipe.transform(
                a.ApprovalDate,
                "MMM dd, yyyy"
              ),
              value: new Date(
               a.ApprovalDate
              )
            };
            return b;
          })
          .filter(ele => ele.label)
      )
    );
    this.PBBFilters.Status = this.common.sortData(
      this.uniqueArrayObj(
        colData.map(a => {
          const b = { label: a.Status, value: a.Status };
          return b;
        })
      )
    );
    const OriginalBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.OriginalBudget, value: a.OriginalBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.PBBFilters.OriginalBudget = this.common.customSort(
      OriginalBudget,
      "label",
      1
    );
    const NetBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.NetBudget, value: a.NetBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.PBBFilters.NetBudget = this.common.customSort(NetBudget, "label", 1);
    const OOPBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.OOPBudget, value: a.OOPBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.PBBFilters.OOPBudget = this.common.customSort(OOPBudget, "label", 1);
    const TaxBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.TaxBudget, value: a.TaxBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.PBBFilters.TaxBudget = this.common.customSort(TaxBudget, "label", 1);
    const BudgetHours = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.BudgetHours, value: a.BudgetHours };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.PBBFilters.BudgetHours = this.common.customSort(
      BudgetHours,
      "label",
      1
    );
    this.PBBFilters.Reason = this.common.sortData(
      this.uniqueArrayObj(
        colData.map(a => {
          const b = { label: a.Reason, value: a.Reason };
          return b;
        })
      )
    );
    this.PBBFilters.CommentsMT = this.common.sortData(
      this.uniqueArrayObj(
        colData.map(a => {
          const b = { label: a.CommentsMT, value: a.CommentsMT };
          return b;
        })
      )
    );
  }

  colFiltersForSOW(colData) {
    this.SOWBudgetFilters.InternalReviewStartDate = this.common.sortData(
      this.uniqueArrayObj(
        colData
          .map(a => {
            let b = {
              label: this.datePipe.transform(
                a.InternalReviewStartDate,
                "MMM dd, yyyy"
              ),
              value: new Date(               
                  a.InternalReviewStartDate,
                )
            };
            return b;
          })
          .filter(ele => ele.label)
      )
    );
    this.SOWBudgetFilters.Status = this.common.sortData(
      this.uniqueArrayObj(
        colData.map(a => {
          const b = { label: a.Status, value: a.Status };
          return b;
        })
      )
    );
    const TotalBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.TotalBudget, value: a.TotalBudget };
          return b;
        })
        .filter(ele => ele.label)
    );

    this.SOWBudgetFilters.TotalBudget = this.common.customSort(
      TotalBudget,
      "label",
      1
    );
    const NetBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.NetBudget, value: a.NetBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.NetBudget = this.common.customSort(
      NetBudget,
      "label",
      1
    );
    const OOPBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.OOPBudget, value: a.OOPBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.OOPBudget = this.common.customSort(
      OOPBudget,
      "label",
      1
    );
    const TaxBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.TaxBudget, value: a.TaxBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.TaxBudget = this.common.customSort(
      TaxBudget,
      "label",
      1
    );
    const AddendumTotalBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = {
            label: a.AddendumTotalBudget,
            value: a.AddendumTotalBudget
          };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.AddendumTotalBudget = this.common.customSort(
      AddendumTotalBudget,
      "label",
      1
    );
    const AddendumNetBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.AddendumNetBudget, value: a.AddendumNetBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.AddendumNetBudget = this.common.customSort(
      AddendumNetBudget,
      "label",
      1
    );
    const AddendumOOPBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.AddendumOOPBudget, value: a.AddendumOOPBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.AddendumOOPBudget = this.common.customSort(
      AddendumOOPBudget,
      "label",
      1
    );
    const AddendumTaxBudget = this.uniqueArrayObj(
      colData
        .map(a => {
          const b = { label: a.AddendumTaxBudget, value: a.AddendumTaxBudget };
          return b;
        })
        .filter(ele => ele.label)
    );
    this.SOWBudgetFilters.AddendumTaxBudget = this.common.customSort(
      AddendumTaxBudget,
      "label",
      1
    );
    // this.SOWBudgetFilters.Currency = this.common.sortData(
    //   this.uniqueArrayObj(
    //     colData.map(a => {
    //       const b = { label: a.Currency, value: a.Currency };
    //       return b;
    //     })
    //   )
    // );
  }

  uniqueArrayObj(array: any) {
    let sts: any = "";
    return (sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      const keys = {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
      return keys ? keys : "";
    }));
  }

  sortData(arr, field) {
    arr.sort(function(a, b) {
      if (a.field === "" || a.field === null) return -1;
      if (b.field === "" || b.field === null) return 0;
      let d1 = new Date(a.field).getTime();
      let d2 = new Date(b.field).getTime();

      return d1 < d2 ? -1 : d1 > d2 ? 1 : 0;
    });
  }
}
