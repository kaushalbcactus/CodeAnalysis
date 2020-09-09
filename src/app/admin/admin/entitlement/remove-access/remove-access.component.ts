import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdminConstantService } from "src/app/admin/services/admin-constant.service";
import { AdminCommonService } from "src/app/admin/services/admin-common.service";
import { CommonService } from "src/app/Services/common.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { TLSSocket } from 'tls';
import { async } from '@angular/core/testing';

@Component({
  selector: "app-remove-access",
  templateUrl: "./remove-access.component.html",
  styleUrls: ["./remove-access.component.css"],
})
export class RemoveAccessComponent implements OnInit {
  constructor(
    private frmbuilder: FormBuilder,
    public adminConstants: AdminConstantService,
    private adminCommonServices: AdminCommonService,
    private commonService: CommonService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    public adminObject: AdminObjectService,
    private constantsService: ConstantsService
  ) {
    this.removeAccess = frmbuilder.group({
      resourceName: ["", Validators.required],
      attributes: ["", Validators.required]
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
  isRuleTable: boolean = false;
  attribute: string = "";
  tableDataArray = [];
  ruleTableArray = [];
  projectCodeCols: any[];
  sowCodeCols: any[];
  qcCols: any[];
  pfCols: any[];
  rulesCols: any[];
  selectedAllRowsItem: any = [];
  selectedRowItem: any;
  allRules: any = [];
  projectCodeColArray = {
    ProjectCode: [],
    PracticeArea: [],
    Status: [],
    WBJID: [],
    ClientLegalEntity: []
  }
  sowCodeColArray = {
    Title: [],
    SOWCode: [],
    PracticeArea: [],
    ClientLegalEntity: []
  }
  qcColArray = {
    Title: [],
    Status: []
  }
  pfColArray = {
    Title: [],
    Status: []
  }
  dropDown = {
    resourceNameArray: [],
    attributesArray: []
  };
  ngOnInit() {
    this.loaddropdown();
    this.createTableCols();
  }
  /**
   * This method is used to load the resourceName dropdown
   */
  async loaddropdown() {
    this.adminObject.isMainLoaderHidden = false;
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
      { label: this.adminConstants.ATTRIBUTES.PROJECTCODE, value: this.adminConstants.ATTRIBUTES.PROJECTCODE },
      { label: this.adminConstants.ATTRIBUTES.SOWCODE, value: this.adminConstants.ATTRIBUTES.SOWCODE },
      { label: this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION, value: this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION },
      { label: this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK, value: this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK }
    ];
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * This method is used to get the resouces from ResourceCategorizationCT list
   */
  async getResourceData() {
    const getResoucesInfo = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
    getResoucesInfo.filter = getResoucesInfo.filter.replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES);
    this.commonService.SetNewrelic("admin", "admin-entitlement-removeAccess", "getResouceData");
    const results = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, getResoucesInfo);
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
      url: '',
      type: '',
      listName: ''
    };
    const getResourceCat = Object.assign({}, options);
    const resourceFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_ORDER_BY_USERNAME);
    resourceFilter.filter = resourceFilter.filter.replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES);
    getResourceCat.url = this.spServices.getReadURL(this.constants.listNames.ResourceCategorization.name,
      resourceFilter);
    getResourceCat.type = 'GET';
    getResourceCat.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(getResourceCat);

    const getActiveRules = Object.assign({}, options);
    const rulesFilter = Object.assign({}, this.adminConstants.QUERY.GET_ALL_ACTIVE_RULES);
    rulesFilter.filter = rulesFilter.filter.replace(/{{isActive}}/gi, this.adminConstants.LOGICAL_FIELD.YES);
    getActiveRules.url = this.spServices.getReadURL(this.constants.listNames.RuleStore.name,
      rulesFilter);
    getActiveRules.type = 'GET';
    getActiveRules.listName = this.constants.listNames.RuleStore.name;
    batchURL.push(getActiveRules);
    if (batchURL.length) {
      const batchResults = await this.spServices.executeBatch(batchURL);
      this.commonService.SetNewrelic("admin", "admin-entitlement-removeAccess", "loadInitData");
      return batchResults;
    }
  }
  onAttributesChanged() {
    this.ruleTableArray = [];
    this.tableDataArray = [];
    this.isRefreshButtonDisabled = false;
    this.isSearchButtonDisabled = false;
    this.resourceId = this.removeAccess.value.resourceName;
    this.attribute = this.removeAccess.value.attributes;
    // extract the role of user based on selected users.
    this.totalResourceArray.forEach(resource => {
      if (this.resourceId === resource.UserNamePG.ID) {
        return this.filterResource = resource;
      }
    });
    if (this.filterResource && this.attribute) {
      this.allRules.forEach(rule => {
        rule.RuleArray = JSON.parse(rule.Rule);
        rule.RuleText = rule.RuleArray.map(x => x.Value).join(",");
        rule.OwnerText = rule.OwnerPG && rule.OwnerPG.Title ? rule.OwnerPG.Title : '';
        if (this.attribute === rule.TypeST && rule.Access && rule.Access.results && rule.Access.results.length) {
          rule.AccessText = rule.Access.results.length ? rule.Access.results.map(x => x.Title).join(",") : '';
          rule.Access.results.forEach(element => {
            if (element.ID === this.resourceId) {
              this.ruleTableArray.push(rule);
            }
          });
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
  showOverlayPanel(rowItem) {
    console.log("Overlay", rowItem);
    //Check the filterresource Role
    const role = this.filterResource.RoleCH;
    let csRuleIdArray = [];
    let delRuleIdArray = [];
    this.ruleTableArray = [];
    if (role === this.adminConstants.FILTER.CM_LEVEL_1 || role === this.adminConstants.FILTER.CM_LEVEL_2) {
      csRuleIdArray = rowItem.CSRule ? rowItem.CSRule.split(',') : [];
      this.ruleTableArray = this.getRules(csRuleIdArray);
    }
    if (role === this.adminConstants.FILTER.DELIVERY || role === this.adminConstants.FILTER.DELIVERY_LEVEL_1 || role === this.adminConstants.FILTER.DELIVERY_LEVEL_2) {
      delRuleIdArray = rowItem.DeliveryRule ? rowItem.DeliveryRule.split(',') : [];
      this.ruleTableArray = this.getRules(csRuleIdArray);
    }
    this.isRuleTable = true;
  }

  getRules(ruleIdArray) {
    const tempRuleArray = [];
    ruleIdArray.forEach(element => {
      this.allRules.forEach(rule => {
        if (+element === rule.ID) {
          rule.RuleArray = JSON.parse(rule.Rule);
          rule.RuleText = rule.RuleArray.map(x => x.Value).join(",");
          rule.OwnerText = rule.OwnerPG && rule.OwnerPG.Title ? rule.OwnerPG.Title : '';
          rule.AccessText = rule.Access && rule.Access.results && rule.Access.results.length ? rule.Access.results.map(x => x.Title).join(",") : '';
          tempRuleArray.push(rule);
        }
      });
    });
    return tempRuleArray;
  }
  /**
   * This method is called when resourceName or attribute changes.
   */
  async searchAcess() {
    if (this.removeAccess.valid) {
      this.isRemoveButtonDisabled = false;
      this.isRuleTable = false;
      this.ruleTableArray = [];
      this.tableDataArray = [];
      this.adminObject.isMainLoaderHidden = false;
      this.tableDataArray = await this.getFilterData(this.attribute, this.filterResource);
      this.createColFieldValues(this.tableDataArray);
      this.adminObject.isMainLoaderHidden = true;
    } {
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
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    switch (attributes) {
      case this.adminConstants.ATTRIBUTES.PROJECTCODE:
        this.getBatchURL(options, this.constants.listNames.ProjectInformation.name, filterResource, batchURL, this.adminConstants.QUERY.GET_PROJECT_INFO_BY_USERROLE);
        break;
      case this.adminConstants.ATTRIBUTES.SOWCODE:
        this.getBatchURL(options, this.constants.listNames.SOW.name, filterResource, batchURL, this.adminConstants.QUERY.GET_SOW_BY_USERROLE);
        break;
      case this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION:
        this.getBatchURL(options, this.constants.listNames.QualityComplaints.name, filterResource, batchURL, this.adminConstants.QUERY.GET_QC_BY_USERROLE);
        break;
      case this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK:
        this.getBatchURL(options, this.constants.listNames.PositiveFeedbacks.name, filterResource, batchURL, this.adminConstants.QUERY.GET_POSITIVE_FEEDBACKS_BY_USERROLE);
    }
    if (batchURL.length) {
      this.commonService.SetNewrelic("admin", "admin-entitlement-removeAccess", "getFilterData");
      finalArray = await this.spServices.executeBatch(batchURL);
    }
    console.log("Final Results : ", finalArray)
    finalArray = finalArray && finalArray.length && finalArray[0] && finalArray[0].retItems && finalArray[0].retItems.length ? finalArray[0].retItems : [];
    finalArray.forEach(element => {
      if (filterResource.RoleCH === this.adminConstants.FILTER.CM_LEVEL_1 || filterResource.RoleCH === this.adminConstants.FILTER.CM_LEVEL_2) {
        if (!element.CSRule) {
          element.IsAdhoc = true;
        } else {
          element.IsAdhoc = false;
        }
      }
      if (filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_1 || filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_2 || filterResource.RoleCH === this.adminConstants.FILTER.DELIVERY) {
        if (!element.DeliveryRule) {
          element.IsAdhoc = true;
        } else {
          element.IsAdhoc = false;
        }
      }
    });
    return finalArray;

  }
  /**
   * This method is used to build the query based on attribute value.
   * @param options pass the query option as parameters
   * @param listName pass the list name
   * @param filterResource pass the resourceobj
   * @param batchURL pass the batchURL array
   * @param endPoint Pass the endPoint 
   */
  getBatchURL(options: any, listName: string, filterResource: any, batchURL: any, endPoint: any) {
    if (filterResource.RoleCH) {
      switch (filterResource.RoleCH) {
        case this.adminConstants.FILTER.CM_LEVEL_1:
        case this.adminConstants.FILTER.CM_LEVEL_2:
          const CM1Options = Object.assign({}, options);
          const CM1EndPoint = this.spServices.getReadURL(listName, endPoint);
          if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE || this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
            CM1Options.url = CM1EndPoint.replace('{{userRole}}', 'CMLevel1/ID eq ' + filterResource.UserNamePG.ID + '');
          }
          if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
            CM1Options.url = CM1EndPoint.replace('{{userRole}}', 'CS/ID eq ' + filterResource.UserNamePG.ID + '');
          }
          CM1Options.type = 'GET';
          CM1Options.listName = listName;
          batchURL.push(CM1Options);
          break;
        case this.adminConstants.FILTER.DELIVERY_LEVEL_1:
        case this.adminConstants.FILTER.DELIVERY_LEVEL_2:
        case this.adminConstants.FILTER.DELIVERY:
          const DeliveryLevel1Options = Object.assign({}, options);
          const DeliveryLevel1EndPoint = this.spServices.getReadURL(listName, endPoint);
          if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE || this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace('{{userRole}}', 'DeliveryLevel1/ID eq ' + filterResource.UserNamePG.ID + '');
          }
          if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace('{{userRole}}', 'TL/ID eq ' + filterResource.UserNamePG.ID + '');
          }
          if (this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
            DeliveryLevel1Options.url = DeliveryLevel1EndPoint.replace('{{userRole}}', 'DeliveryLeads/ID eq ' + filterResource.UserNamePG.ID + '');
          }
          DeliveryLevel1Options.type = 'GET';
          DeliveryLevel1Options.listName = listName
          batchURL.push(DeliveryLevel1Options);
          break;
      }
    }
  }

  /**
   * This method is used to create column, to show in table for different attributes.
   */
  createTableCols() {
    this.projectCodeCols = [
      { field: "ID", header: "ID", visibility: false },
      { field: "ProjectCode", header: "Project Code", visibility: true },
      { field: "BusinessVertical", header: "Practice Area", visibility: true },
      { field: "WBJID", header: "Short Title", visibility: true },
      { field: "ClientLegalEntity", header: "ClientLegalEntity", visibility: true },
      { field: "Status", header: "Status", visibility: true }
    ];
    this.sowCodeCols = [
      { field: "ID", header: "ID", visibility: false },
      { field: "Title", header: "Title", visibility: true },
      { field: "SOWCode", header: "SOW Code", visibility: true },
      { field: "BusinessVertical", header: "Practice Area", visibility: true },
      { field: "ClientLegalEntity", header: "ClientLegalEntity", visibility: true }
    ];
    this.qcCols = [
      { field: "ID", header: "ID", visibility: false },
      { field: "Title", header: "Title", visibility: true },
      { field: "Status", header: "Status", visibility: true }
    ];
    this.pfCols = [
      { field: "ID", header: "ID", visibility: false },
      { field: "Title", header: "Title", visibility: true },
      { field: "Status", header: "Status", visibility: true }
    ];
    this.rulesCols = [
      { field: "ID", header: "Rule Id", visibility: true },
      { field: "RuleText", header: "Rule", visibility: true },
      { field: "OwnerText", header: "Owner", visibility: true },
      { field: "AccessText", header: "Access", visibility: true },
    ];

  }
  /**
   * This method is used to create the column field array and remove the duplicates records from them.
   * @param resArray Pass the resourceArray as parameter
   */
  createColFieldValues(resArray) {
    if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
      this.projectCodeColArray.ProjectCode = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.ProjectCode, value: a.ProjectCode };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.projectCodeColArray.PracticeArea = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.BusinessVertical, value: a.BusinessVertical };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.projectCodeColArray.Status = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Status, value: a.Status };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.projectCodeColArray.WBJID = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.WBJID, value: a.WBJID };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.projectCodeColArray.ClientLegalEntity = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
    }
    if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
      this.sowCodeColArray.Title = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Title, value: a.Title };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.sowCodeColArray.SOWCode = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.SOWCode, value: a.SOWCode };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.sowCodeColArray.ClientLegalEntity = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.sowCodeColArray.PracticeArea = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.BusinessVertical, value: a.BusinessVertical };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
    }
    if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
      this.qcColArray.Title = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Title, value: a.Title };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.qcColArray.Status = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Status, value: a.Status };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
    }
    if (this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
      this.pfColArray.Title = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Title, value: a.Title };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
      this.pfColArray.Status = this.commonService.sortData(
        this.commonService.uniqueArrayObj(
          resArray
            .map((a) => {
              const b = { label: a.Status, value: a.Status };
              return b;
            })
            .filter((ele) => ele.label)
        )
      );
    }
  }
  onRowSelect(event) {
    console.log(event);
    console.log("ON Row Select", this.selectedAllRowsItem);
  }

  onRowUnselect(event) {
    console.log("ON Row UnSelect", this.selectedAllRowsItem);
  }

  selectAllRows() {
    console.log('in selectAllRows ', this.selectedAllRowsItem);
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
      this.commonService.showToastrMessage(this.constantsService.MessageType.error, 'Please Select atleast one ' + this.attribute + '.', false);
    } else {
      this.adminObject.isMainLoaderHidden = false;
      let batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      this.selectedAllRowsItem.forEach(async element => {
        element.CMLevel1IDArray = [];
        element.DeliveryLevel1IDArray = [];
        element.AllOperationresourcesIDArray = [];
        element.AllResourcesIDArray = [];
        element.TLIDArray = [];
        element.CSIDArray = [];
        element.DeliveryLeadsIDArray = [];
        switch (this.attribute) {
          case this.adminConstants.ATTRIBUTES.PROJECTCODE:
          case this.adminConstants.ATTRIBUTES.SOWCODE:
            if (element.CMLevel1 && element.CMLevel1.results && element.CMLevel1.results.length) {
              element.CMLevel1IDArray = element.CMLevel1.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
            }
            if (element.DeliveryLevel1 && element.DeliveryLevel1.results && element.DeliveryLevel1.results.length) {
              element.DeliveryLevel1IDArray = element.DeliveryLevel1.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
            }
            if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
              if (element.AllOperationresources && element.AllOperationresources.results && element.AllOperationresources.results.length) {
                element.AllOperationresourcesIDArray = element.AllOperationresources.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
              }
              this.getUserBatchURL(options, this.constants.listNames.ProjectInformation.name, this.constants.listNames.ProjectInformation.type, element, batchURL)
            } else {
              if (element.AllResources && element.AllResources.results && element.AllResources.results.length) {
                element.AllResourcesIDArray = element.AllResources.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
              }
              this.getUserBatchURL(options, this.constants.listNames.SOW.name, this.constants.listNames.SOW.type, element, batchURL)
            }
            break;
          case this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION:
            if (element.TL && element.TL.results && element.TL.results.length) {
              element.TLIDArray = element.TL.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
            }
            if (element.CS && element.CS.results && element.CS.results.length) {
              element.CSIDArray = element.CS.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
            }
            this.getUserBatchURL(options, this.constants.listNames.QualityComplaints.name, this.constants.listNames.QualityComplaints.type, element, batchURL)
            break;
          case this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK:
            if (element.DeliveryLeads && element.DeliveryLeads.results && element.DeliveryLeads.results.length) {
              element.DeliveryLeadsIDArray = element.DeliveryLeads.results.filter(x => x.ID !== this.filterResource.UserNamePG.ID).map(x => x.ID);
            }
            this.getUserBatchURL(options, this.constants.listNames.PositiveFeedbacks.name, this.constants.listNames.PositiveFeedbacks.type, element, batchURL)
            break;
        }
        if (batchURL.length === 99) {
          this.commonService.SetNewrelic('admin', 'admin-entitlement-removeAccess', 'removeUsers');
          await this.spServices.executeBatch(batchURL);
          batchURL = [];
        }
      });
      if (batchURL.length) {
        this.commonService.SetNewrelic('admin', 'admin-entitlement-removeAccess', 'removeUsers');
        await this.spServices.executeBatch(batchURL);
      }
      this.commonService.showToastrMessage(this.constantsService.MessageType.success, 'Access has removed for ' + this.attribute + ' successfully.', true);
      this.onAttributesChanged();
    }
  }
  async getUserBatchURL(options, listName, listType, element, batchURL) {
    const updateData = this.getListData(listType, element);
    const update = Object.assign({}, options);
    update.url = this.spServices.getItemURL(listName, element.ID);
    update.data = updateData;
    update.type = 'PATCH';
    update.listName = listName;
    batchURL.push(update);
    return batchURL;
  }
  getListData(listType, listObj) {
    const userObj = this.filterResource;
    const data: any = {
      __metadata: { type: listType },
    };
    if (userObj.RoleCH === this.adminConstants.FILTER.CM_LEVEL_1 || userObj.RoleCH === this.adminConstants.FILTER.CM_LEVEL_2) {
      if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
        data.CMLevel1Id = {
          results: listObj.CMLevel1IDArray
        };
        data.AllOperationresourcesId = {
          results: listObj.AllOperationresourcesIDArray
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
        data.CMLevel1Id = {
          results: listObj.CMLevel1IDArray
        };
        data.AllResourcesId = {
          results: listObj.AllResourcesIDArray
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
        data.CSId = {
          results: listObj.CSIDArray
        };
      }
    }
    if (userObj.RoleCH === this.adminConstants.FILTER.DELIVERY || userObj.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_1 || userObj.RoleCH === this.adminConstants.FILTER.DELIVERY_LEVEL_2) {
      if (this.attribute === this.adminConstants.ATTRIBUTES.PROJECTCODE) {
        data.DeliveryLevel1Id = {
          results: listObj.DeliveryLevel1IDArray
        };
        data.AllOperationresourcesId = {
          results: listObj.AllOperationresourcesIDArray
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.SOWCODE) {
        data.DeliveryLevel1Id = {
          results: listObj.DeliveryLevel1IDArray
        };
        data.AllResourcesId = {
          results: listObj.AllResourcesIDArray
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.CLIENTDISSATISFACTION) {
        data.TLId = {
          results: listObj.TLIDArray
        };
      }
      if (this.attribute === this.adminConstants.ATTRIBUTES.POSITIVEFEEDBACK) {
        data.DeliveryLeadsId = {
          results: listObj.DeliveryLeadsIDArray
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
  }
}
