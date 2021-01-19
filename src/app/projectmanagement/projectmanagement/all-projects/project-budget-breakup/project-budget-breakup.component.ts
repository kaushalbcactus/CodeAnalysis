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
      { field: "ApprovalDate", header: "Approval Date", visibility: true ,Type:'date',dbName:'ApprovalDate' , options:[] },
      { field: "Status", header: "Status", visibility: true ,Type:'string',dbName:'Status' , options:[] },
      { field: "OriginalBudget", header: "Total Budget ", visibility: true  ,Type:'number',dbName:'OriginalBudget' , options:[]},
      { field: "NetBudget", header: "Revenue", visibility: true ,Type:'number',dbName:'NetBudget' , options:[] },
      { field: "OOPBudget", header: "OOP", visibility: true, Type:'number',dbName:'OOPBudget' , options:[] },
      { field: "TaxBudget", header: "Tax", visibility: true,Type:'number',dbName:'TaxBudget' , options:[] },
      { field: "BudgetHours", header: "Budget Hours", visibility: true, Type:'number',dbName:'BudgetHours' , options:[] },
      {
        field: "Reason",
        header: "Reason",
        visibility: true ,Type:'string',dbName:'Reason' , options:[] 
      },
      {
        field: "CommentsMT",
        header: "Comments",
        visibility: true ,Type:'string',dbName:'CommentsMT' , options:[] 
      }
    ];
    this.sowBudgetColumns = [
      {
        field: "InternalReviewStartDate",
        header: "Approval Date",
        visibility: true ,Type:'date',dbName:'InternalReviewStartDate' , options:[] 
      },
      { field: "Status", header: "Status", visibility: true ,Type:'string',dbName:'Status' , options:[] },
      { field: "TotalBudget", header: "Total Budget ", visibility: true,Type:'number',dbName:'TotalBudget' , options:[]  },
      { field: "NetBudget", header: "Revenue", visibility: true ,Type:'number',dbName:'NetBudget' , options:[] },
      { field: "OOPBudget", header: "OOP", visibility: true,Type:'number',dbName:'OOPBudget' , options:[]  },
      { field: "TaxBudget", header: "Tax", visibility: true,Type:'number',dbName:'TaxBudget' , options:[]  },
    ];
    if (this.projectCode) {
      this.PBBDetails = await this.getProjectBudgetBrekup();
      this.PBBDetails.forEach((part, index, arr) => {
        arr[index].ApprovalDate = new Date(arr[index].ApprovalDate);
      });
      this.sortData(this.PBBDetails, "ApprovalDate");
      this.PBBColumns = this.common.MainfilterForTable(this.PBBColumns,this.PBBDetails);
    } else if (this.sowCode) {
      this.sowBudgetDetails = await this.getSowBudgetBrekup();
      this.sowBudgetDetails.forEach((ele, index, arr) => {
        arr[index].InternalReviewStartDate = new Date(arr[index].InternalReviewStartDate);
      });
      this.sortData(this.sowBudgetDetails, "InternalReviewStartDate");
      this.forMultipleValues();
      this.sowBudgetColumns = this.common.MainfilterForTable(this.sowBudgetColumns,this.sowBudgetDetails);
     
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

  
  sortData(arr, field) {
    let column = field;
    arr.sort((a, b) => {
      if (a[column] === "" || a[column] === null) return -1;
      if (b[column] === "" || b[column] === null) return 0;
    });
  }
}
