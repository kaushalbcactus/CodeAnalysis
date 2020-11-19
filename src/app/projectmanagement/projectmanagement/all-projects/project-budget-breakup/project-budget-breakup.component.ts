import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
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

  async ngOnInit() {
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
        header: "Approval Date",
        visibility: true
      },
      { field: "Status", header: "Status", visibility: true },
      { field: "TotalBudget", header: "Total Budget ", visibility: true },
      { field: "NetBudget", header: "Revenue", visibility: true },
      { field: "OOPBudget", header: "OOP", visibility: true },
      { field: "TaxBudget", header: "Tax", visibility: true },
      // {
      //   field: "AddendumTotalBudget",
      //   header: "Addendum Total Budget",
      //   visibility: false
      // },
      // {
      //   field: "AddendumNetBudget",
      //   header: "Addendum Net Budget",
      //   visibility: false
      // },
      // {
      //   field: "AddendumOOPBudget",
      //   header: "Addendum OOP Budget",
      //   visibility: false
      // },
      // {
      //   field: "AddendumTaxBudget",
      //   header: "Addendum Tax Budget",
      //   visibility: false
      // }
      // { field: "Currency", header: "Currency", visibility: true }
    ];
    if (this.projectCode) {
      this.PBBDetails = await this.getProjectBudgetBrekup();
      this.PBBDetails.forEach((part, index, arr) => {
        arr[index].ApprovalDate = new Date(arr[index].ApprovalDate);
      });
      this.sortData(this.PBBDetails, "ApprovalDate");
      this.colFiltersForPBB(this.PBBDetails);
    } else if (this.sowCode) {
      this.sowBudgetDetails = await this.getSowBudgetBrekup();
      this.sowBudgetDetails.forEach((ele, index, arr) => {
        arr[index].InternalReviewStartDate = new Date(arr[index].InternalReviewStartDate);
      });
      this.sortData(this.sowBudgetDetails, "InternalReviewStartDate");
      this.forMultipleValues();
      this.colFiltersForSOW(this.sowBudgetDetails);
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
    return result[0].retItems;
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
    return results[0].retItems;    
  }

  forMultipleValues() {
    if(this.sowBudgetDetails.length > 1) {
      for(let i= 0;i < this.sowBudgetDetails.length - 1;i++) {
        let element = this.sowBudgetDetails[i];
        
        element.TotalBudget = element.AddendumTotalBudget 
        element.NetBudget = element.AddendumNetBudget
        element.OOPBudget = element.AddendumOOPBudget 
        element.TaxBudget = element.AddendumTaxBudget
      }
    } 
  }

  colFiltersForPBB(colData) {
    this.PBBFilters.ApprovalDate = this.common.sortData(
      this.uniqueArrayObj(colData,'ApprovalDate',"Date")
    );
    this.PBBFilters.Status = this.common.sortData(
      this.uniqueArrayObj(colData,'Status')
    );
    const OriginalBudget = this.uniqueArrayObj(colData,'OriginalBudget')
    this.PBBFilters.OriginalBudget = this.common.customSort(
      OriginalBudget,
      "label",
      1
    );
    const NetBudget = this.uniqueArrayObj(colData,'NetBudget')
    this.PBBFilters.NetBudget = this.common.customSort(NetBudget, "label", 1);
    const OOPBudget = this.uniqueArrayObj(colData,'OOPBudget')
    this.PBBFilters.OOPBudget = this.common.customSort(OOPBudget, "label", 1);
    const TaxBudget = this.uniqueArrayObj(colData,'TaxBudget')
    this.PBBFilters.TaxBudget = this.common.customSort(TaxBudget, "label", 1);
    const BudgetHours = this.uniqueArrayObj(colData,'BudgetHours');
    this.PBBFilters.BudgetHours = this.common.customSort(
      BudgetHours,
      "label",
      1
    );
    this.PBBFilters.Reason = this.common.sortData(
      this.uniqueArrayObj(colData,'Reason')
    );
    this.PBBFilters.CommentsMT = this.common.sortData(
      this.uniqueArrayObj(colData,'CommentsMT')
    );
  }

  colFiltersForSOW(colData) {
    this.SOWBudgetFilters.InternalReviewStartDate = this.common.sortData(
      this.uniqueArrayObj(colData,'InternalReviewStartDate',"Date")
    );
    this.SOWBudgetFilters.Status = this.common.sortData(
      this.uniqueArrayObj(colData,'Status')
    );
    const TotalBudget = this.uniqueArrayObj(colData,'TotalBudget');
    this.SOWBudgetFilters.TotalBudget = this.common.customSort(
      TotalBudget,
      "label",
      1
    );
    const NetBudget = this.uniqueArrayObj(colData,'NetBudget');
    this.SOWBudgetFilters.NetBudget = this.common.customSort(
      NetBudget,
      "label",
      1
    );
    const OOPBudget = this.uniqueArrayObj(colData,'OOPBudget');
    this.SOWBudgetFilters.OOPBudget = this.common.customSort(
      OOPBudget,
      "label",
      1
    );
    const TaxBudget = this.uniqueArrayObj(colData,'TaxBudget');
    this.SOWBudgetFilters.TaxBudget = this.common.customSort(
      TaxBudget,
      "label",
      1
    );
    const AddendumTotalBudget = this.uniqueArrayObj(colData,'AddendumTotalBudget');
    this.SOWBudgetFilters.AddendumTotalBudget = this.common.customSort(
      AddendumTotalBudget,
      "label",
      1
    );
    const AddendumNetBudget = this.uniqueArrayObj(colData,'AddendumNetBudget');
    this.SOWBudgetFilters.AddendumNetBudget = this.common.customSort(
      AddendumNetBudget,
      "label",
      1
    );
    const AddendumOOPBudget = this.uniqueArrayObj(colData,'AddendumOOPBudget');
    this.SOWBudgetFilters.AddendumOOPBudget = this.common.customSort(
      AddendumOOPBudget,
      "label",
      1
    );
    const AddendumTaxBudget = this.uniqueArrayObj(colData,'AddendumTaxBudget');
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

  uniqueArrayObj(array: any,field, date?) {
    // let column = field;

    debugger
    // return [...new Set(array.map(element => element[field]))].map(a => {
    //   const b = date == 'Date' ? { label: this.datePipe.transform(a,"MMM dd, yyyy"), value: a } : { label: a, value: a }
    //   // const b = { label: a, value: a };
    //   return b;
    // })
    // .filter(ele => ele.label)
  }

  sortData(arr, field) {
    let column = field;
    arr.sort((a, b) => {
      if (a[column] === "" || a[column] === null) return -1;
      if (b[column] === "" || b[column] === null) return 0;
      // let d1 = new Date(a[column]).getTime();
      // let d2 = new Date(b[column]).getTime();

      // return d1 < d2 ? -1 : d1 > d2 ? 1 : 0;
    });
  }
}
