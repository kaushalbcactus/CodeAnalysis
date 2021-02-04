import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdminConstantService } from "src/app/admin/services/admin-constant.service";
import { CommonService } from "src/app/Services/common.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { AdminObjectService } from "src/app/admin/services/admin-object.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { ShowRuleComponent } from "./show-rule/show-rule.component";

@Component({
  selector: "app-remove-access",
  templateUrl: "./remove-access.component.html",
  styleUrls: ["./remove-access.component.css"],
})
export class RemoveAccessComponent implements OnInit {
  @ViewChild("ruleOP", { static: false }) panel: OverlayPanel;
  @ViewChild("showRuleDetailsview", { read: ViewContainerRef, static: false })
  showRuleDetailsview: ViewContainerRef;
  enableOverlayPanel: boolean = false;
  ref: any;
  loaderenable: boolean = true;
  displayColumnArray: any[];
  constructor(
    private frmbuilder: FormBuilder,
    public adminConstants: AdminConstantService,
    private commonService: CommonService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.removeAccess = frmbuilder.group({
      resourceName: ["", Validators.required],
      attributes: ["", Validators.required],
    });
  }
  removeAccess: FormGroup;
  isRemoveAccessFormSubmit: boolean = false;
  totalResourceArray = [];
  filterResource = Object.assign({});
  resourceId: number;
  isRemoveButtonDisabled: boolean = true;
  isRefreshButtonDisabled: boolean = true;
  isSearchButtonDisabled: boolean = true;
  isRuleTable: boolean = true;
  attribute: string = "";
  tableDataArray = [];
  ruleTableArray = [];
  projectCodeCols: any[];
  sowCodeCols: any[];
  qcpfCols: any[];
  rulesCols: any[];
  selectedAllRowsItem: any = [];
  selectedRowItem: any;
  allRules: any = [];

  dropDown = {
    resourceNameArray: [],
    attributesArray: [],
  };
  selectionType = [
    { label: "None", value: "None" },
    {
      label: "Highlighted",
      value: "Highlighted",
    },
    { label: "All", value: "All" },
  ];
  selectedItemType: string = this.selectionType[0].value;
  async ngOnInit() {
    this.loaderenable = true;
    this.projectCodeCols = [
      {
        field: "ID",
        header: "ID",
        visibility: false,
        Type: "",
        dbName: "",
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
        field: "BusinessVertical",
        header: "Practice Area",
        visibility: true,
        Type: "string",
        dbName: "BusinessVertical",
        options: [],
      },
      {
        field: "WBJID",
        header: "Short Title",
        visibility: true,
        Type: "",
        dbName: "WBJID",
        options: [],
      },
      {
        field: "ClientLegalEntity",
        header: "ClientLegalEntity",
        visibility: true,
        Type: "string",
        dbName: "ClientLegalEntity",
        options: [],
      },
      {
        field: "Status",
        header: "Status",
        visibility: true,
        Type: "",
        dbName: "Status",
        options: [],
      },
    ];
    this.sowCodeCols = [
      {
        field: "ID",
        header: "ID",
        visibility: false,
        Type: "",
        dbName: "",
        options: [],
      },
      {
        field: "Title",
        header: "Title",
        visibility: true,
        Type: "",
        dbName: "Title",
        options: [],
      },
      {
        field: "SOWCode",
        header: "SOW Code",
        visibility: true,
        Type: "",
        dbName: "SOWCode",
        options: [],
      },
      {
        field: "BusinessVertical",
        header: "Practice Area",
        visibility: true,
        Type: "",
        dbName: "BusinessVertical",
        options: [],
      },
      {
        field: "ClientLegalEntity",
        header: "ClientLegalEntity",
        visibility: true,
        Type: "",
        dbName: "ClientLegalEntity",
        options: [],
      },
    ];
    this.qcpfCols = [
      {
        field: "ID",
        header: "ID",
        visibility: false,
        Type: "",
        dbName: "",
        options: [],
      },
      {
        field: "Title",
        header: "Title",
        visibility: true,
        Type: "string",
        dbName: "Title",
        options: [],
      },
      {
        field: "Status",
        header: "Status",
        visibility: true,
        Type: "string",
        dbName: "Status",
        options: [],
      },
    ];

    this.rulesCols = [
      {
        field: "ID",
        header: "Rule Id",
        visibility: true,
        Type: "",
        dbName: "",
        options: [],
      },
      {
        field: "RuleText",
        header: "Rule",
        visibility: true,
        Type: "",
        dbName: "",
        options: [],
      },
      {
        field: "OwnerText",
        header: "Owner",
        visibility: true,
        Type: "",
        dbName: "",
        options: [],
      },
      {
        field: "AccessText",
        header: "Access",
        visibility: true,
        Type: "",
        dbName: "",
        options: [],
      },
    ];
    await this.loaddropdown();

    this.loaderenable = false;
  }

  /**
   * This method is used to load the resourceName dropdown
   */
  async loaddropdown() {
    const results: any = await this.loadInitData();
    const resourceCatResults = results[0].retItems;
    this.allRules = results[1].retItems;
    if (resourceCatResults && resourceCatResults.length) {
      this.totalResourceArray = resourceCatResults;
      this.dropDown.resourceNameArray = [];
      resourceCatResults.forEach((element) => {
        this.dropDown.resourceNameArray.push({
          label: element.UserNamePG.Title,
          value: element.UserNamePG.ID,
        });
      });
    }
    this.dropDown.attributesArray = [
      {
        label: this.adminConstants.ATTRIBUTES.PROJECTCODE,
        value: this.adminConstants.ATTRIBUTES.PROJECTCODE,
        tableArray: this.projectCodeCols,
      },
      {
        label: this.adminConstants.ATTRIBUTES.SOWCODE,
        value: this.adminConstants.ATTRIBUTES.SOWCODE,
        tableArray: this.sowCodeCols,
      },
      {
        label: this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION,
        value: this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION,
        tableArray: this.qcpfCols,
      },
      {
        label: this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK,
        value: this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK,
        tableArray: this.qcpfCols,
      },
    ];
  }
  /**
   * This method is used to get the resouces from ResourceCategorizationCT list
   */
  async getResourceData() {
    const getResoucesInfo = Object.assign(
      {},
      this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME
    );
    getResoucesInfo.filter = getResoucesInfo.filter.replace(
      /{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES
    );
    this.commonService.SetNewrelic(
      "admin",
      "admin-entitlement-removeAccess",
      "getResouceData",
      "GET"
    );
    const results = await this.spServices.readItems(
      this.constants.listNames.ResourceCategorization.name,
      getResoucesInfo
    );
    return results;
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. ResourceCategorization  - Get data from `ResourceCategorizationCT` list based on filter `IsActiveCH='Yes'`.
   * 2. Rules - Get data from `RulesCT` list based on filter `IsActiveCH='Yes'`.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async loadInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    const getResourceCat = Object.assign({}, options);
    const resourceFilter = Object.assign(
      {},
      this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME
    );
    resourceFilter.filter = resourceFilter.filter.replace(
      /{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES
    );
    getResourceCat.url = this.spServices.getReadURL(
      this.constants.listNames.ResourceCategorization.name,
      resourceFilter
    );
    getResourceCat.type = this.constants.Method.GET;
    getResourceCat.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(getResourceCat);

    const getActiveRules = Object.assign({}, options);
    const rulesFilter = Object.assign(
      {},
      this.adminConstants.QUERY.GET_ALL_ACTIVE_RULES
    );
    rulesFilter.filter = rulesFilter.filter.replace(
      /{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES
    );
    getActiveRules.url = this.spServices.getReadURL(
      this.constants.listNames.RuleStore.name,
      rulesFilter
    );
    getActiveRules.type = this.constants.Method.GET;
    getActiveRules.listName = this.constants.listNames.RuleStore.name;
    batchURL.push(getActiveRules);
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "admin",
        "admin-entitlement-removeAccess",
        "loadInitData",
        "GET-BATCH"
      );
      const batchResults = await this.spServices.executeBatch(batchURL);
      return batchResults;
    }
  }
  onAttributesChanged() {
    this.ruleTableArray = [];
    this.tableDataArray = [];
    this.isRefreshButtonDisabled = false;
    this.resourceId = this.removeAccess.value.resourceName;
    this.attribute =this.removeAccess.value.attributes;
    this.displayColumnArray = this.attribute
      ? this.dropDown.attributesArray.find((c) => c.label === this.attribute)
          .tableArray
      : [];
    this.isRemoveButtonDisabled = true;
    this.selectedItemType = this.selectionType[0].value;
    // extract the role of user based on selected users.
    this.totalResourceArray.forEach((resource) => {
      if (this.resourceId === resource.UserNamePG.ID) {
        return (this.filterResource = resource);
      }
    });
    if (this.filterResource && this.attribute) {
      this.isSearchButtonDisabled = false;
      this.allRules.forEach((rule) => {
        rule.RuleArray = JSON.parse(rule.Rule);
        rule.RuleText = rule.RuleArray.map((x) => x.Value).join(
          `<i style="vertical-align: middle;" class="pi pi-chevron-right rulesText"></i>`
        );
        rule.OwnerText =
          rule.OwnerPG && rule.OwnerPG.Title ? rule.OwnerPG.Title : "";
        if (this.attribute === rule.TypeST) {
          if (
            rule.Access &&
            rule.Access.results &&
            rule.Access.results.length
          ) {
            rule.AccessText = rule.Access.results.length
              ? rule.Access.results.map((x) => x.Title).join(", ")
              : "";
            rule.Access.results.forEach((element) => {
              if (element.ID === this.resourceId) {
                this.ruleTableArray.push(rule);
              }
            });
          }
          if (
            rule.OwnerPG &&
            rule.OwnerPG.ID === this.resourceId &&
            !this.ruleTableArray.find((e) => e.ID == rule.ID)
          ) {
            this.ruleTableArray.push(rule);
          }
        }
      });
    }
    if (this.ruleTableArray.length) {
      console.log("Rule Table Array", this.ruleTableArray);
      this.isRuleTable = true;
    }
  }
  /**
   * This method is used to show overlay panel
   */
  showOverlayPanel(event, rowItem, target?: string) {
    console.log("Overlay", rowItem);
    //Check the filterresource Role
    const role = this.filterResource.RoleCH;
    let csRuleIdArray = [];
    let delRuleIdArray = [];
    this.ruleTableArray = [];
    if (
      role === this.adminConstants.FILTER.CM_LEVEL_1 ||
      role === this.adminConstants.FILTER.CM_LEVEL_2
    ) {
      csRuleIdArray = rowItem.CSRule ? rowItem.CSRule.split(";#") : [];
      this.ruleTableArray = this.getRules(csRuleIdArray);
    }
    if (
      role === this.adminConstants.FILTER.DELIVERY ||
      role === this.adminConstants.FILTER.DELIVERY_LEVEL_1 ||
      role === this.adminConstants.FILTER.DELIVERY_LEVEL_2
    ) {
      delRuleIdArray = rowItem.DeliveryRule
        ? rowItem.DeliveryRule.split(";#")
        : [];
      this.ruleTableArray = this.getRules(delRuleIdArray);
    }

    this.showRuleDetailsview.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      ShowRuleComponent
    );
    const componentRef = this.showRuleDetailsview.createComponent(factory);
    componentRef.instance.ruleItems = this.ruleTableArray;
    componentRef.instance.rulesColumns = this.rulesCols;
    this.ref = componentRef;

    this.enableOverlayPanel = true;
    this.panel.show(event, target);
  }

  getRules(ruleIdArray) {
    const tempRuleArray = [];
    ruleIdArray.forEach((element) => {
      this.allRules.forEach((rule) => {
        if (+element === rule.ID) {
          rule.RuleArray = JSON.parse(rule.Rule);
          rule.RuleText = rule.RuleArray.map((x) => x.Value).join(
            `<i style="vertical-align: middle;" class="pi pi-chevron-right rulesText"></i>`
          );
          rule.OwnerText =
            rule.OwnerPG && rule.OwnerPG.Title ? rule.OwnerPG.Title : "";
          rule.AccessText =
            rule.Access && rule.Access.results && rule.Access.results.length
              ? rule.Access.results.map((x) => x.Title).join(", ")
              : "";
          tempRuleArray.push(rule);
        }
      });
    });
    return tempRuleArray;
  }
  /**
   * This method is called when resourceName or attribute changes.
   */
  async searchAccess() {
    debugger;
    this.selectedItemType = this.selectionType[0].value;
    if (this.removeAccess.valid) {
      this.isRuleTable = false;
      this.ruleTableArray = [];
      this.tableDataArray = [];
      this.constants.loader.isWaitDisable = false;
      this.tableDataArray = await this.getFilterData(
        this.attribute,
        this.filterResource
      );
      this.displayColumnArray = this.commonService.MainfilterForTable(
        this.displayColumnArray,
        this.tableDataArray
      );
      // this.createColFieldValues(this.tableDataArray);
      this.constants.loader.isWaitDisable = true;
    }
    {
      this.isRemoveAccessFormSubmit = true;
    }
  }
  /**
   * This method will called the required query to fetch the data from list.
   *
   * @param attributes pass the attribute as parameter.
   * @param filterResource pass the resource object as parameter.
   */
  async getFilterData(attributes: string, filterResource: any) {
    let batchURL = [];
    let finalArray = [];
    let inActiveProjectList = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    switch (attributes) {
      case this.adminConstants.ATTRIBUTES.PROJECTCODE:
        this.getBatchURL(
          options,
          this.constants.listNames.ProjectInformation.name,
          filterResource,
          batchURL,
          this.adminConstants.QUERY.GET_PROJECT_INFO_BY_USERROLE
        );
        break;
      case this.adminConstants.ATTRIBUTES.SOWCODE:
        this.getBatchURL(
          options,
          this.constants.listNames.SOW.name,
          filterResource,
          batchURL,
          this.adminConstants.QUERY.GET_SOW_BY_USERROLE
        );
        break;
      case this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION:
        this.getBatchURL(
          options,
          this.constants.listNames.QualityComplaints.name,
          filterResource,
          batchURL,
          this.adminConstants.QUERY.GET_QC_BY_USERROLE
        );
        break;
      case this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK:
        let pfUrl = this.adminConstants.QUERY
          .GET_POSITIVE_FEEDBACKS_BY_USERROLE;
        let startDate = new Date(
          new Date(new Date().setMonth(new Date().getMonth() - 12)).setHours(
            0,
            0,
            0,
            0
          )
        ).toISOString();
        let endDate = new Date().toISOString();
        pfUrl.filter = pfUrl.filter
          .replace("{{startDate}}", startDate)
          .replace("{{endDate}}", endDate);
        this.getBatchURL(
          options,
          this.constants.listNames.PositiveFeedbacks.name,
          filterResource,
          batchURL,
          pfUrl
        );
        await this.getInactiveProjects(batchURL);
    }
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "admin",
        "admin-entitlement-removeAccess",
        "getFilterData",
        "GET-BATCH"
      );
      finalArray = await this.spServices.executeBatch(batchURL);
      if (attributes === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
        inActiveProjectList =
          finalArray.find(
            (c) =>
              c.listName === this.constants.listNames.ProjectInformation.name
          ) &&
          finalArray.find(
            (c) =>
              c.listName === this.constants.listNames.ProjectInformation.name
          ).retItems
            ? finalArray.find(
                (c) =>
                  c.listName ===
                  this.constants.listNames.ProjectInformation.name
              ).retItems
            : [];
        await this.filterInactiveProjects(finalArray, inActiveProjectList);
      }
    }
    console.log("Final Results : ", finalArray);
    finalArray =
      finalArray &&
      finalArray.length &&
      finalArray[0] &&
      finalArray[0].retItems &&
      finalArray[0].retItems.length
        ? finalArray[0].retItems
        : [];
    finalArray.forEach((element) => {
      if (
        filterResource.RoleCH === this.adminConstants.FILTER.CM_LEVEL_1 ||
        filterResource.RoleCH === this.adminConstants.FILTER.CM_LEVEL_2
      ) {
        if (!element.CSRule) {
          element.IsAdhoc = true;
        } else {
          element.IsAdhoc = false;
        }
      }
      if (
        filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_1 ||
        filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_2 ||
        filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY
      ) {
        if (!element.DeliveryRule) {
          element.IsAdhoc = true;
        } else {
          element.IsAdhoc = false;
        }
      }
    });

    finalArray.forEach((e) => {
      if (e.BusinessVertical) {
        e.BusinessVertical = e.BusinessVertical.replaceAll(";#", ", ");
      }
    });

    return finalArray;
  }

  filterInactiveProjects(pfData: any, projectData) {
    for (const index in pfData[0].retItems) {
      if (pfData[0].retItems.hasOwnProperty(index)) {
        let projectInfo = projectData.find(
          (e) => e.ProjectCode == pfData[0].retItems[index].Title
        );
        if (projectInfo) {
          pfData[0].retItems.splice(index, 1);
        }
      }
    }

    return pfData;
  }

  /**
   * This method is used to build the query based on attribute value.
   * @param options pass the query option as parameters
   * @param listName pass the list name
   * @param filterResource pass the resourceobj
   * @param batchURL pass the batchURL array
   * @param endPoint Pass the endPoint
   */
  getBatchURL(
    options: any,
    listName: string,
    filterResource: any,
    batchURL: any,
    endPoint: any
  ) {
    if (filterResource.RoleCH) {
      switch (filterResource.RoleCH) {
        case this.adminConstants.FILTER.CM_LEVEL_1:
        case this.adminConstants.FILTER.CM_LEVEL_2:
          const CM1Options = Object.assign({}, options);
          const CM1EndPoint = this.spServices.getReadURL(listName, endPoint);
          if (
            this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE ||
            this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE
          ) {
            CM1Options.url = CM1EndPoint.replace(
              "{{userRole}}",
              " ( CMLevel1/ID eq " +
                filterResource.UserNamePG.ID +
                " or CMLevel2/ID eq " +
                filterResource.UserNamePG.ID +
                " )"
            );
          }
          if (
            this.attribute ===
            this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION
          ) {
            CM1Options.url = CM1EndPoint.replace(
              "{{userRole}}",
              "CS/ID eq " + filterResource.UserNamePG.ID + ""
            );
          }
          CM1Options.type = "GET";
          CM1Options.listName = listName;
          batchURL.push(CM1Options);
          break;
        case this.adminConstants.FILTER.DELIVERY_LEVEL_1:
        case this.adminConstants.FILTER.DELIVERY_LEVEL_2:
        case this.adminConstants.FILTER.DELIVERY:
          const DeliveryLevel1Options = Object.assign({}, options);
          const DeliveryLevel1EndPoint = this.spServices.getReadURL(
            listName,
            endPoint
          );
          if (
            this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE ||
            this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE
          ) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace(
              "{{userRole}}",
              " ( DeliveryLevel1/ID eq " +
                filterResource.UserNamePG.ID +
                " or DeliveryLevel2/ID eq " +
                filterResource.UserNamePG.ID +
                " )"
            );
          }
          if (
            this.attribute ===
            this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION
          ) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace(
              "{{userRole}}",
              " ( TL/ID eq " +
                filterResource.UserNamePG.ID +
                " or ASD/ID eq " +
                filterResource.UserNamePG.ID +
                " )"
            );
          }
          if (
            this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK
          ) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace(
              "{{userRole}}",
              "DeliveryLeads/ID eq " + filterResource.UserNamePG.ID + ""
            );
          }
          DeliveryLevel1Options.type = "GET";
          DeliveryLevel1Options.listName = listName;
          batchURL.push(DeliveryLevel1Options);
          break;
      }
    }
  }

  /**
   * This method is used to create column, to show in table for different attributes.
   */

  /**
   * This method is used to create the column field array and remove the duplicates records from them.
   * @param resArray Pass the resourceArray as parameter
   */
  // createColFieldValues(resArray) {
  //   if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
  //     this.projectCodeColArray.ProjectCode = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.ProjectCode, value: a.ProjectCode };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.projectCodeColArray.PracticeArea = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.BusinessVertical, value: a.BusinessVertical };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.projectCodeColArray.Status = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Status, value: a.Status };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.projectCodeColArray.WBJID = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.WBJID, value: a.WBJID };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.projectCodeColArray.ClientLegalEntity = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //   }
  //   if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
  //     this.sowCodeColArray.Title = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Title, value: a.Title };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.sowCodeColArray.SOWCode = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.SOWCode, value: a.SOWCode };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.sowCodeColArray.ClientLegalEntity = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.sowCodeColArray.PracticeArea = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.BusinessVertical, value: a.BusinessVertical };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //   }
  //   if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
  //     this.qcColArray.Title = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Title, value: a.Title };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.qcColArray.Status = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Status, value: a.Status };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //   }
  //   if (this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
  //     this.pfColArray.Title = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Title, value: a.Title };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //     this.pfColArray.Status = this.commonService.sortData(
  //       this.commonService.uniqueArrayObj(
  //         resArray
  //           .map((a) => {
  //             const b = { label: a.Status, value: a.Status };
  //             return b;
  //           })
  //           .filter((ele) => ele.label)
  //       )
  //     );
  //   }
  // }
  onRowSelect(event) {
    console.log(event);
    this.isRemoveButtonDisabled = false;
    console.log("ON Row Select", this.selectedAllRowsItem);
  }

  onRowUnselect(event) {
    if (this.selectedAllRowsItem.length) {
      this.isRemoveButtonDisabled = false;
    } else {
      this.isRemoveButtonDisabled = true;
    }
    console.log("ON Row UnSelect", this.selectedAllRowsItem);
  }

  selectRows() {
    this.selectedAllRowsItem = [];
    if (this.tableDataArray.length) {
      switch (this.selectedItemType) {
        case "None":
          this.selectedAllRowsItem = [];
          break;

        case "Highlighted":
          let adhocData = this.tableDataArray.filter((e) => e.IsAdhoc == true);
          if (adhocData.length) {
            this.selectedAllRowsItem = adhocData;
          } else {
            this.selectedAllRowsItem = [];
          }
          break;

        case "All":
          this.selectedAllRowsItem = this.tableDataArray;
          break;
      }
      console.log("in selectAllRows ", this.selectedAllRowsItem);
    }
    this.isRemoveButtonDisabled = this.selectedAllRowsItem.length
      ? false
      : true;
  }
  /**
   * This method is used to remove user from selected Attribute
   *
   * 1. If the selected Attribute ='Project Code' and Selected User role is 'CMLevel1' then user will be removed from 'CMLevel1' and 'AllOperationresources' column.
   * 2. If the selected Attribute ='Project Code' and selected User role is 'DeliveryLevel1' then user will be removed form 'DeliveryLevel1' and 'AllOperationresources' column.
   * 3. If the selected Attribute ='SOWCode' and Selected User role is 'CMLevel1' then user will be removed from 'CMLevel1' and 'AllResources' column.
   * 4. If the selected Attribute ='SOWCode' and selected User role is 'DeliveryLevel1' then user will be removed form 'DeliveryLevel1' and 'AllResources' column.
   * 5. If the selected Attribute ='ClientDissatisfaction' and Selected User role is 'CMLevel1' then user will be removed from 'CS' column.
   * 6. If the selected Attribute ='ClientDissatisfaction' and selected User role is 'DeliveryLevel1' then user will be removed form 'TL' column.
   * 7. If the selected Attribute ='Positive Feedbacks' and selected User role is 'DeliveryLevel1' then user will be removed from DeliveryLeads'.
   *
   */
  async removeUsers() {
    if (!this.selectedAllRowsItem.length) {
      this.commonService.showToastrMessage(
        this.constantsService.MessageType.error,
        "Please Select atleast one " + this.attribute + ".",
        false
      );
    } else {
      this.commonService
        .confirmMessageDialog(
          "Delete Confirmation",
          "Do you want to delete this record?",
          null,
          ["Yes", "No"],
          false
        )
        .then(async (Confirmation) => {
          if (Confirmation === "Yes") {
            this.constants.loader.isWaitDisable = false;
            let batchURL = [];
            const options = {
              data: null,
              url: "",
              type: "",
              listName: "",
            };

            for (var i = 0; i < this.selectedAllRowsItem.length; i++) {
              this.selectedAllRowsItem[i].CMLevel1IDArray = [];
              this.selectedAllRowsItem[i].DeliveryLevel1IDArray = [];
              this.selectedAllRowsItem[i].AllOperationresourcesIDArray = [];
              this.selectedAllRowsItem[i].AllResourcesIDArray = [];
              this.selectedAllRowsItem[i].TLIDArray = [];
              this.selectedAllRowsItem[i].CSIDArray = [];
              this.selectedAllRowsItem[i].DeliveryLeadsIDArray = [];
              switch (this.attribute) {
                case this.adminConstants.ATTRIBUTES.PROJECTCODE:
                case this.adminConstants.ATTRIBUTES.SOWCODE:
                  if (
                    this.selectedAllRowsItem[i].CMLevel1 &&
                    this.selectedAllRowsItem[i].CMLevel1.results &&
                    this.selectedAllRowsItem[i].CMLevel1.results.length
                  ) {
                    this.selectedAllRowsItem[
                      i
                    ].CMLevel1IDArray = this.selectedAllRowsItem[
                      i
                    ].CMLevel1.results
                      .filter((x) => x.ID !== this.filterResource.UserNamePG.ID)
                      .map((x) => x.ID);
                  }
                  if (
                    this.selectedAllRowsItem[i].DeliveryLevel1 &&
                    this.selectedAllRowsItem[i].DeliveryLevel1.results &&
                    this.selectedAllRowsItem[i].DeliveryLevel1.results.length
                  ) {
                    this.selectedAllRowsItem[
                      i
                    ].DeliveryLevel1IDArray = this.selectedAllRowsItem[
                      i
                    ].DeliveryLevel1.results
                      .filter((x) => x.ID !== this.filterResource.UserNamePG.ID)
                      .map((x) => x.ID);
                  }
                  if (
                    this.attribute ===
                    this.adminConstants.ATTRIBUTES.PROJECTCODE
                  ) {
                    if (
                      this.selectedAllRowsItem[i].AllOperationresources &&
                      this.selectedAllRowsItem[i].AllOperationresources
                        .results &&
                      this.selectedAllRowsItem[i].AllOperationresources.results
                        .length
                    ) {
                      this.selectedAllRowsItem[
                        i
                      ].AllOperationresourcesIDArray = this.selectedAllRowsItem[
                        i
                      ].AllOperationresources.results
                        .filter(
                          (x) => x.ID !== this.filterResource.UserNamePG.ID
                        )
                        .map((x) => x.ID);
                    }
                    this.getUserBatchURL(
                      options,
                      this.constants.listNames.ProjectInformation.name,
                      this.constants.listNames.ProjectInformation.type,
                      this.selectedAllRowsItem[i],
                      batchURL
                    );
                  } else {
                    if (
                      this.selectedAllRowsItem[i].AllResources &&
                      this.selectedAllRowsItem[i].AllResources.results &&
                      this.selectedAllRowsItem[i].AllResources.results.length
                    ) {
                      this.selectedAllRowsItem[
                        i
                      ].AllResourcesIDArray = this.selectedAllRowsItem[
                        i
                      ].AllResources.results
                        .filter(
                          (x) => x.ID !== this.filterResource.UserNamePG.ID
                        )
                        .map((x) => x.ID);
                    }
                    this.getUserBatchURL(
                      options,
                      this.constants.listNames.SOW.name,
                      this.constants.listNames.SOW.type,
                      this.selectedAllRowsItem[i],
                      batchURL
                    );
                  }
                  break;
                case this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION:
                  if (
                    this.selectedAllRowsItem[i].TL &&
                    this.selectedAllRowsItem[i].TL.results &&
                    this.selectedAllRowsItem[i].TL.results.length
                  ) {
                    this.selectedAllRowsItem[
                      i
                    ].TLIDArray = this.selectedAllRowsItem[i].TL.results
                      .filter((x) => x.ID !== this.filterResource.UserNamePG.ID)
                      .map((x) => x.ID);
                  }
                  if (
                    this.selectedAllRowsItem[i].CS &&
                    this.selectedAllRowsItem[i].CS.results &&
                    this.selectedAllRowsItem[i].CS.results.length
                  ) {
                    this.selectedAllRowsItem[
                      i
                    ].CSIDArray = this.selectedAllRowsItem[i].CS.results
                      .filter((x) => x.ID !== this.filterResource.UserNamePG.ID)
                      .map((x) => x.ID);
                  }
                  this.getUserBatchURL(
                    options,
                    this.constants.listNames.QualityComplaints.name,
                    this.constants.listNames.QualityComplaints.type,
                    this.selectedAllRowsItem[i],
                    batchURL
                  );
                  break;
                case this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK:
                  if (
                    this.selectedAllRowsItem[i].DeliveryLeads &&
                    this.selectedAllRowsItem[i].DeliveryLeads.results &&
                    this.selectedAllRowsItem[i].DeliveryLeads.results.length
                  ) {
                    this.selectedAllRowsItem[
                      i
                    ].DeliveryLeadsIDArray = this.selectedAllRowsItem[
                      i
                    ].DeliveryLeads.results
                      .filter((x) => x.ID !== this.filterResource.UserNamePG.ID)
                      .map((x) => x.ID);
                  }
                  this.getUserBatchURL(
                    options,
                    this.constants.listNames.PositiveFeedbacks.name,
                    this.constants.listNames.PositiveFeedbacks.type,
                    this.selectedAllRowsItem[i],
                    batchURL
                  );
                  break;
              }
              if (batchURL.length === 99) {
                this.commonService.SetNewrelic(
                  "admin",
                  "admin-entitlement-removeAccess",
                  "removeUsers",
                  "POST-BATCH"
                );
                await this.spServices.executeBatch(batchURL);
                batchURL = [];
              }
            }
            if (batchURL.length) {
              this.commonService.SetNewrelic(
                "admin",
                "admin-entitlement-removeAccess",
                "removeUsers",
                "POST-BATCH"
              );
              await this.spServices.executeBatch(batchURL);
            }
            this.commonService.showToastrMessage(
              this.constantsService.MessageType.success,
              "Access has removed for " + this.attribute + " successfully.",
              true
            );
            this.searchAccess();
          }
        });
    }
  }
  async getUserBatchURL(options, listName, listType, element, batchURL) {
    const updateData = this.getListData(listType, element);
    const update = Object.assign({}, options);
    update.url = this.spServices.getItemURL(listName, element.ID);
    update.data = updateData;
    update.type = "PATCH";
    update.listName = listName;
    batchURL.push(update);
    return batchURL;
  }
  getListData(listType, listObj) {
    const userObj = this.filterResource;
    const data: any = {
      __metadata: { type: listType },
    };
    if (
      userObj.RoleCH === this.adminConstants.FILTER.CM_LEVEL_1 ||
      userObj.RoleCH === this.adminConstants.FILTER.CM_LEVEL_2
    ) {
      if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
        data.CMLevel1Id = {
          results: listObj.CMLevel1IDArray,
        };
        data.AllOperationresourcesId = {
          results: listObj.AllOperationresourcesIDArray,
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
        data.CMLevel1Id = {
          results: listObj.CMLevel1IDArray,
        };
        data.AllResourcesId = {
          results: listObj.AllResourcesIDArray,
        };
      }
      if (
        this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION
      ) {
        data.CSId = {
          results: listObj.CSIDArray,
        };
      }
    }
    if (
      userObj.RoleCH === this.adminConstants.FILTER.DELIVERY ||
      userObj.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_1 ||
      userObj.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_2
    ) {
      if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
        data.DeliveryLevel1Id = {
          results: listObj.DeliveryLevel1IDArray,
        };
        data.AllOperationresourcesId = {
          results: listObj.AllOperationresourcesIDArray,
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
        data.DeliveryLevel1Id = {
          results: listObj.DeliveryLevel1IDArray,
        };
        data.AllResourcesId = {
          results: listObj.AllResourcesIDArray,
        };
      }
      if (
        this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION
      ) {
        data.TLId = {
          results: listObj.TLIDArray,
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
        data.DeliveryLeadsId = {
          results: listObj.DeliveryLeadsIDArray,
        };
      }
    }
    return data;
  }
  refresh() {
    this.isRemoveAccessFormSubmit = false;
    this.removeAccess.reset();
    this.tableDataArray = [];
    this.isRemoveButtonDisabled = true;
    this.isRefreshButtonDisabled = true;
    this.isSearchButtonDisabled = true;
    this.ruleTableArray = [];
    this.displayColumnArray=[];
    this.isRuleTable=true;
    this.selectedItemType = this.selectionType[0].value;
  }

  getInactiveProjects(batchURL) {
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.ProjectInformation.name,
        this.adminConstants.QUERY.GET_INACTIVE_PROJECT
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.ProjectInformation.name
    );
  }
}
