import { Injectable } from "@angular/core";
import { ConstantsService } from "src/app/Services/constants.service";
import { AdminConstantService } from "src/app/admin/services/admin-constant.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class AddAccessService {
  constructor(
    private adminConstants: AdminConstantService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private constants: ConstantsService
  ) {}

  getDataForFilters(batchURL) {
    // Practice Area
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.PracticeArea.name,
        this.adminConstants.QUERY.GET_PRACTICE_AREA
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.PracticeArea.name
    );

    // CLE
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.ClientLegalEntity.name,
          this.adminConstants.QUERY.GET_CLIENTLEGALENTITY_BY_ACTIVE
        )
        .replace(/{{isActive}}/gi, "Yes"),
      null,
      this.constants.Method.GET,
      this.constants.listNames.ClientLegalEntity.name
    );

    //Client Sub-Division
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.ClientSubdivision.name,
          this.adminConstants.QUERY.GET_SUB_DIVISION_BY_ACTIVEONLY
        )
        .replace(/{{isActive}}/gi, "Yes"),
      null,
      this.constants.Method.GET,
      this.constants.listNames.ClientSubdivision.name
    );

    //Deliverable Type
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.DeliverableType.name,
          this.adminConstants.QUERY.GET_DELIVERABLE_TYPE_BY_ACTIVE
        )
        .replace(/{{isActive}}/gi, "Yes"),
      null,
      this.constants.Method.GET,
      this.constants.listNames.DeliverableType.name
    );

    // Resource Categorization
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.ResourceCategorization.name,
          this.adminConstants.QUERY
            .GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME
        )
        .replace(/{{isActive}}/gi, "Yes"),
      null,
      this.constants.Method.GET,
      this.constants.listNames.ResourceCategorization.name
    );

    return batchURL;
  }

  getRulesParameters(batchURL, type) {
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.RuleParameters.name,
          this.adminConstants.QUERY.GET_RULES_PARAMETER_BY_ACTIVE
        )
        .replace(/{{isActive}}/gi, "Yes")
        .replace(/{{type}}/gi, type),
      null,
      this.constants.Method.GET,
      this.constants.listNames.RuleParameters.name
    );

    return batchURL;
  }

  GetRulesByType(batchURL, type) {
    this.commonService.setBatchObject(
      batchURL,
      this.spServices
        .getReadURL(
          this.constants.listNames.RuleStore.name,
          this.adminConstants.QUERY.GET_RULES_BY_ACTIVE
        )
        .replace(/{{isActive}}/gi, "Yes")
        .replace(/{{type}}/gi, type),
      null,
      this.constants.Method.GET,
      this.constants.listNames.RuleStore.name
    );

    return batchURL;
  }

  async processData(batchURL, filterData) {
    this.commonService.SetNewrelic(
      "GetDataOnAddAccess",
      "AddAccessService",
      "AddAccess"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);
    filterData.PRACTICEAREA =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.PracticeArea.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.PracticeArea.name
      ).retItems
        ? arrResults
            .find(
              (c) => c.listName === this.constants.listNames.PracticeArea.name
            )
            .retItems.map(
              (o) =>
                new Object({
                  label: o.Title,
                  value: o.Title,
                })
            )
        : [];

    filterData.CLE =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.ClientLegalEntity.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.ClientLegalEntity.name
      ).retItems
        ? arrResults
            .find(
              (c) =>
                c.listName === this.constants.listNames.ClientLegalEntity.name
            )
            .retItems.map(
              (o) =>
                new Object({
                  label: o.Title,
                  value: o.Title,
                })
            )
        : [];

    filterData.SUBDIVISION =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.ClientSubdivision.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.ClientSubdivision.name
      ).retItems
        ? arrResults
            .find(
              (c) =>
                c.listName === this.constants.listNames.ClientSubdivision.name
            )
            .retItems.map(
              (o) =>
                new Object({
                  label: o.Title,
                  value: o.Title,
                })
            )
        : [];

    // filterData.filterSUBDIVISION = Object.assign({}, filterData.dbSUBDIVISION);

    filterData.DELIVERYTYPE =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.DeliverableType.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.DeliverableType.name
      ).retItems
        ? arrResults
            .find(
              (c) =>
                c.listName === this.constants.listNames.DeliverableType.name
            )
            .retItems.map(
              (o) =>
                new Object({
                  label: o.Title,
                  value: o.Title,
                })
            )
        : [];

    filterData.RULES =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleStore.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleStore.name
      ).retItems
        ? arrResults.find(
            (c) => c.listName === this.constants.listNames.RuleStore.name
          ).retItems
        : [];

    filterData.RULEPARAMETERS =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleParameters.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleParameters.name
      ).retItems
        ? arrResults.find(
            (c) => c.listName === this.constants.listNames.RuleParameters.name
          ).retItems
        : [];

    filterData.RULEPARAMETERSDISPLAY =
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleParameters.name
      ) &&
      arrResults.find(
        (c) => c.listName === this.constants.listNames.RuleParameters.name
      ).retItems
        ? arrResults
            .find(
              (c) => c.listName === this.constants.listNames.RuleParameters.name
            )
            .retItems.map(
              (o) =>
                new Object({
                  label: o.Title,
                  value: o.Title,
                  InternalName : o.InternalName
                })
            )
        : [];

    filterData.RESOURCECATEGORIZATION =
      arrResults.find(
        (c) =>
          c.listName === this.constants.listNames.ResourceCategorization.name
      ) &&
      arrResults.find(
        (c) =>
          c.listName === this.constants.listNames.ResourceCategorization.name
      ).retItems
        ? arrResults.find(
            (c) =>
              c.listName ===
              this.constants.listNames.ResourceCategorization.name
          ).retItems
        : [];


        
    filterData.DBRULES =
    arrResults.find(
      (c) =>
        c.listName === this.constants.listNames.RuleStore.name
    ) &&
    arrResults.find(
      (c) =>
        c.listName === this.constants.listNames.RuleStore.name
    ).retItems
      ? arrResults.find(
          (c) =>
            c.listName ===
            this.constants.listNames.RuleStore.name
        ).retItems
      : [];

      if(filterData.DBRULES.length > 0) {
        filterData.RULES = JSON.parse(JSON.stringify(filterData.DBRULES));
        filterData.RULES.map(c=>c.DisplayRules = JSON.parse(c.Rule));
        filterData.RULES.map(c=>c.edited = false);
        filterData.RULES.map(c=>c.RuleType ="existing");
      }
    return filterData;
  }

  async getPrametersDropdownData(parameters) {
    const batchURL = [];

    for (var i = 0; i < parameters.length; i++) {
      this.commonService.setBatchObject(
        batchURL,
        this.spServices.getReadURL(
          parameters[i].ListName,
          JSON.parse(parameters[i].Query)
        ),
        null,
        this.constants.Method.GET,
        parameters[i].ListName
      );
    }

    this.commonService.SetNewrelic(
      "GetParametersQueryData",
      "AddAccessService",
      "AddAccess"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);

    arrResults.forEach((element) => {
      parameters.find((c) => c.ListName === element.listName).dbRecords =
        element.retItems;
    });
  }
}
