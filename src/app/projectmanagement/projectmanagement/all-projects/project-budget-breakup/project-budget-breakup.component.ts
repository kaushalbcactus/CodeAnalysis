import { Component, OnInit } from "@angular/core";
import { DynamicDialogConfig } from "primeng";
import { PmconstantService } from "src/app/projectmanagement/services/pmconstant.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from 'src/app/Services/common.service';

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
    private common: CommonService
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
      },
      { field: "Currency", header: "Currency", visibility: true }
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
    this.sortData(this.PBBDetails, 'ApprovalDate');
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
    this.sortData(this.sowBudgetDetails, 'InternalReviewStartDate');
    this.colFiltersForSOW(this.SOWBudgetFilters);
  }

  colFiltersForPBB(colData) {
    this.PBBFilters.ApprovalDate= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.ApprovalDate, value: a.ApprovalDate };
          return b;
        })
      )
    );
    this.PBBFilters.Status= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.Status, value: a.Status };
          return b;
        })
      )
    );
    this.PBBFilters.OriginalBudget= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.OriginalBudget, value: a.OriginalBudget };
          return b;
        })
      )
    );
    this.PBBFilters.NetBudget= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.NetBudget, value: a.NetBudget };
          return b;
        })
      )
    );
    this.PBBFilters.OOPBudget= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.OOPBudget, value: a.OOPBudget };
          return b;
        })
      )
    );
    this.PBBFilters.TaxBudget= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.TaxBudget, value: a.TaxBudget };
          return b;
        })
      )
    );
    this.PBBFilters.BudgetHours= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.BudgetHours, value: a.BudgetHours };
          return b;
        })
      )
    );
    this.PBBFilters.Reason= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.Reason, value: a.Reason };
          return b;
        })
      )
    );
    this.PBBFilters.CommentsMT= this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.CommentsMT, value: a.CommentsMT };
          return b;
        })
      )
    );
  }

  colFiltersForSOW(colData) {
    this.SOWBudgetFilters.Status = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.Status, value: a.Status };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.TotalBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.TotalBudget, value: a.TotalBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.NetBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.NetBudget, value: a.NetBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.OOPBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.OOPBudget, value: a.OOPBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.TaxBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.TaxBudget, value: a.TaxBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.AddendumTotalBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.AddendumTotalBudget, value: a.AddendumTotalBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.AddendumNetBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.AddendumNetBudget, value: a.AddendumNetBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.AddendumOOPBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.AddendumOOPBudget, value: a.AddendumOOPBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.AddendumTaxBudget = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.AddendumTaxBudget, value: a.AddendumTaxBudget };
          return b;
        })
      )
    );
    this.SOWBudgetFilters.Currency = this.common.sortData(
      this.uniqueArrayObj(
        colData.map((a) => {
          const b = { label: a.Currency, value: a.Currency };
          return b;
        })
      )
    );
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      const keys = {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
      return keys ? keys : '';
    });
  }

  sortData(arr, field) {
    arr.sort(function(a,b){
      if(a.field === "" || a.field === null) return -1;
      if(b.field === "" || b.field === null) return 0;
      let d1 = new Date(a.field).getTime();
      let d2 = new Date(b.field).getTime();
      
      return d1 < d2 ? -1 : d1 > d2 ? 1 : 0
    });
  } 
}
