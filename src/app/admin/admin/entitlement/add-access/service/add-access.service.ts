import { Injectable } from "@angular/core";
import { ConstantsService } from "src/app/Services/constants.service";
import { AdminConstantService } from "src/app/admin/services/admin-constant.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { filter, retry } from "rxjs/operators";

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
      "admin",
      "AddAccessService",
      "GetDataOnAddAccess"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);

    // Process Practice Area Data
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

    // Process CLE Data
    filterData.dbCLE =  arrResults.find(
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
          .retItems : [];


    filterData.CLE =  arrResults.find(
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
          .retItems.map( (o) =>
          new Object({
            label: o.Title,
            value: o.Title,
            Bucket : o.Bucket
          })) :[];
    
  
    filterData.CLE = filterData.CLE && filterData.CLE.length > 0 ? filterData.CLE.map(e => e["value"]).map((e, i, final) => final.indexOf(e) === i && i).filter((e) => filterData.CLE[e]).map(e => filterData.CLE[e]) :[];

    //process Sub-division data
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
    // Process Delivery data
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

    // process rule parameters
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

    // process rule parameter display
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
                  InternalName: o.InternalName,
                })
            )
        : [];

    // Process Resource categorization
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

    this.processfetchedRules(filterData, arrResults);

    return filterData;
  }

  processfetchedRules(filterData, arrResults) {
    // process Rules
    filterData.DBRULES =
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

    if (filterData.DBRULES.length > 0) {
      filterData.RULES = JSON.parse(JSON.stringify(filterData.DBRULES));
      filterData.RULES.map((c) => (c.DisplayRules = JSON.parse(c.Rule)));
      filterData.RULES.map(
        (c) => (c.edited = { UserEdited: false, IsActiveCH: false })
      );
      filterData.RULES.map((c) => (c.RuleType = "existing"));

      filterData.TEMPRULES = JSON.parse(JSON.stringify(filterData.RULES));
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
      "admin",
      "AddAccessService",
      "GetParametersQueryData"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);

    arrResults.forEach((element) => {
      parameters.find((c) => c.ListName === element.listName).dbRecords =
        element.retItems;
    });
  }

  async saveRules(filterData, type) {
    const Rules = filterData.RULES;
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      "Updating Rules.......",
      true,
      true
    );

    let batchURL = [];
    let batchResults = [];
    let EditedRuleArray = [];
    let addedRuleArray = [];
    let NewRules = 0;
    let updatedRules = 0;
    let deletedRules = 0;
    const dispalyOrderArray = Rules.map(
      (c) => c.DisplayOrder
    ).sort((one, two) => (one > two ? -1 : 1));
    Rules.forEach(async (rule, i) => {
      if (
        rule.RuleType === "existing" &&
        (rule.DisplayOrder !== dispalyOrderArray[i] ||
          rule.edited.IsActiveCH === true ||
          rule.edited.UserEdited === true)
      ) {
        const editedRule = {
          __metadata: { type: this.constants.listNames.RuleStore.type },
          OwnerPGId: rule.OwnerPG.ID,
          AccessId: rule.Access.results
            ? { results: rule.Access.results.map((c) => c.ID) }
            : { results: [] },
          IsActiveCH: rule.IsActiveCH,
          DisplayOrder: dispalyOrderArray[i],
        };
        const exRule = filterData.DBRULES.find(c=>c.ID ===rule.ID) ? filterData.DBRULES.find(c=>c.ID ===rule.ID) : rule;
        exRule.edited = rule.edited;
        EditedRuleArray.push(exRule);
        editedRule.IsActiveCH === "No" ? deletedRules++ : updatedRules++;
        let url = this.spServices.getItemURL(
          this.constants.listNames.RuleStore.name,
          +rule.ID
        );
        this.commonService.setBatchObject(
          batchURL,
          url,
          editedRule,
          this.constants.Method.PATCH,
          this.constants.listNames.RuleStore.name
        );
      } else if (rule.RuleType === "new") {
        const NewRule = {
          __metadata: { type: this.constants.listNames.RuleStore.type },
          OwnerPGId: rule.OwnerPG.ID,
          AccessId: rule.Access.results
            ? { results: rule.Access.results.map((c) => c.ID) }
            : { results: [] },
          IsActiveCH: rule.IsActiveCH,
          DisplayOrder: dispalyOrderArray[i],
          ResourceType: rule.ResourceType,
          TypeST: rule.TypeST,
          Rule: rule.Rule,
        };
        NewRules++;
        this.commonService.setBatchObject(
          batchURL,
          this.spServices.getReadURL(
            this.constants.listNames.RuleStore.name,
            null
          ),
          NewRule,
          this.constants.Method.POST,
          this.constants.listNames.RuleStore.name
        );
      }

      if (batchURL.length === 99) {
        this.commonService.SetNewrelic(
          "UpdateRuleStore",
          "AddAccessService",
          "AddAccess"
        );
        batchResults = await this.spServices.executeBatch(batchURL);
        batchURL = [];
      }
    });

    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "UpdateRuleStore",
        "AddAccessService",
        "AddAccess"
      );
      console.log(batchURL);
      batchResults = await this.spServices.executeBatch(batchURL);
    }

    if(batchResults  && batchResults.length > 0){

      addedRuleArray = batchResults.filter(c=>c.listName ==='RuleStoreCT') ? batchResults.filter(c=>c.listName ==='RuleStoreCT').map(c=>c.retItems):[];

    }

    this.commonService.clearToastrMessage();

    let Message = "";
    if (NewRules > 0) {
      Message = NewRules + " new rules added";
    }
    if (updatedRules > 0) {
      Message =
        Message === ""
          ? updatedRules + " rules updated sucessfully."
          : Message + " and " + updatedRules + " rules updated sucessfully.";
    }
    if (deletedRules > 0) {
      Message =
        Message === ""
          ? deletedRules + " rules deleted sucessfully."
          : Message + " and " + deletedRules + " rules deleted sucessfully.";
    }
    this.commonService.clearToastrMessage();
    this.commonService.showToastrMessage(
      this.constants.MessageType.success,
      Message,
      true,
      true
    );
     if(type === this.constants.RulesType.PROJECT || type === this.constants.RulesType.SOW){
       await  this.updateAllDetails(filterData, type, addedRuleArray, EditedRuleArray);
     }
      
  }

  async updateAllDetails(filterData, type, addedRuleArray, EditedRuleArray) {
    let dbItemList=[];
    let CLE = [];
    let  batchURL = [];
    let batchResults = [];

    const Message = type === this.constants.RulesType.PROJECT ? "Fetching Projects....." : "Fetching SOW....."
  
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      Message,
      true,
      true
    );
    if(type === this.constants.RulesType.PROJECT){
      this.getAllOpenProjects(batchURL);
    } else {
      this.getAllSow(batchURL);
    }
  
    this.GetRulesByType(batchURL, type);
    this.commonService.SetNewrelic(
      "getPrjectAndRules",
      "AddAccessService",
      "AddAccess"
    );
    console.log(batchURL);

    batchResults = await this.spServices.executeBatch(batchURL);
    filterData = this.processfetchedRules(filterData, batchResults);

    dbItemList =  
    batchResults.find(
      (c) => c.listName === this.constants.listNames.ProjectInformation.name
    ) &&
    batchResults.find(
      (c) => c.listName === this.constants.listNames.ProjectInformation.name
    ).retItems
      ? batchResults.find(
          (c) =>
            c.listName === this.constants.listNames.ProjectInformation.name
        ).retItems :  batchResults.find(
          (c) => c.listName === this.constants.listNames.SOW.name
        ) &&
        batchResults.find(
          (c) => c.listName === this.constants.listNames.SOW.name
        ).retItems
          ? batchResults.find(
              (c) =>
                c.listName === this.constants.listNames.SOW.name
            ).retItems :[];

   
    CLE = filterData.CLE;

    dbItemList.map(c=>c.csRuleArray = c.CSRule && filterData.RULES.filter(d=> c.CSRule.split(';#').map(c=>+c).includes(d.ID)) ? filterData.RULES.filter(d=> c.CSRule.split(';#').map(c=>+c).includes(d.ID)).sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ):[])
      
    dbItemList.map(c=>c.deliveryRuleArray = c.DeliveryRule && filterData.RULES.filter(d=> c.DeliveryRule.split(';#').map(c=>+c).includes(d.ID)) ? filterData.RULES.filter(d=> c.DeliveryRule.split(';#').map(c=>+c).includes(d.ID)).sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ) :[]);


    let AddRuleItemsCount =0;
    const disMessage = type === this.constants.RulesType.PROJECT ? 'projects' : 'sow';
    const parameter = type === this.constants.RulesType.PROJECT ? 'ProjectCode' : 'SOWCode';
    if (addedRuleArray.length > 0) {
      addedRuleArray = filterData.RULES.filter(c=> addedRuleArray.map(i=>i.ID).includes(c.ID));

      if(type === this.constants.RulesType.PROJECT){
        dbItemList = await this.fetchProjectFinanceForRule(addedRuleArray,dbItemList);
      }
     
      dbItemList = await this.addRuleToItems(addedRuleArray,dbItemList,filterData,type,parameter);

      AddRuleItemsCount = dbItemList.filter(c=>c.edited === true) ? dbItemList.filter(c=>c.edited === true).length : 0;

    
      this.commonService.clearToastrMessage();
      this.commonService.showToastrMessage(
        this.constants.MessageType.info,
        "Applied rules to "+ AddRuleItemsCount + " "+ disMessage +".",
        true,
        true
      );
    }
    else{
      this.commonService.clearToastrMessage();
    }

    if(EditedRuleArray.length > 0){
      // edited: {UserEdited : false , IsActiveCH: false},
      const RemoveRuleArray = EditedRuleArray.filter(c=>c.edited.IsActiveCH === true);
      if(RemoveRuleArray && RemoveRuleArray.length> 0){
        this.commonService.showToastrMessage(
          this.constants.MessageType.info,
          "Removing "+ RemoveRuleArray.length + " rules from" + disMessage +".",
          true,
          true
        );

        let ListOfAllItems=[];
        RemoveRuleArray.forEach(async oldrule => {
          let RuleItems=[];
          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === oldrule.ResourceType);
           if(RuleTypeObj){
             RuleItems = dbItemList.filter(c=> c[RuleTypeObj.DBParameter] && c[RuleTypeObj.DBParameter].split(';#').map(c=>+c).includes(oldrule.ID)) ? dbItemList.filter(c=> c[RuleTypeObj.DBParameter] && c[RuleTypeObj.DBParameter].split(';#').map(c=>+c).includes(oldrule.ID)).map(e=>e[parameter]):[];
             if(RuleItems && RuleItems.length > 0){
               dbItemList =  await this.UpdateItemsForRule(RuleTypeObj.listName,oldrule,dbItemList,RuleTypeObj.Level2,RuleTypeObj.Level2,RuleItems,parameter);
              }
            }
          ListOfAllItems.push.apply(ListOfAllItems,RuleItems);

        });

        ListOfAllItems= [...new Set(ListOfAllItems)];
        if(ListOfAllItems && ListOfAllItems.length > 0 ){
             
              this.commonService.showToastrMessage(
                this.constants.MessageType.info,
                "Removed rules from  "+ ListOfAllItems.length +" "+ disMessage +".",
                true,
                true
              );
        }

      }

      const UpdatedUserRuleArray = EditedRuleArray.filter(c=>c.edited.UserEdited === true);
      if(UpdatedUserRuleArray && UpdatedUserRuleArray.length > 0){
         const dbUpdatedUserRules = filterData.RULES.filter(c=> UpdatedUserRuleArray.map(d=>d.ID).includes(c.ID));
         let ListOfProjects=[];
         dbUpdatedUserRules.forEach(async updatedrule => {
          let RuleItems=[];
          const oldRule =  UpdatedUserRuleArray.find(c=>c.ID ===updatedrule.ID);
          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === updatedrule.ResourceType);
          if(RuleTypeObj){
            RuleItems = this.getItemCodes(RuleTypeObj.listName,dbItemList,oldRule,parameter);
            if(RuleItems && RuleItems.length > 0){
              dbItemList =  await this.UpdateItemsForRule(RuleTypeObj.listName,oldRule,dbItemList,RuleTypeObj.Level2,RuleTypeObj.Level2,RuleItems,parameter);
             }
           }
           ListOfProjects.push.apply(ListOfProjects,RuleItems);
          });
  
          ListOfProjects= [...new Set(ListOfProjects)];
          if(ListOfProjects && ListOfProjects.length > 0 ){
             
                this.commonService.showToastrMessage(
                  this.constants.MessageType.info,
                  "Updated rule users from  "+ ListOfProjects.length +" " + disMessage +".",
                  true,
                  true
                );
          }
      }     

      const sequenceUpdateRules = EditedRuleArray.filter(c=>c.edited.IsActiveCH === false && c.edited.UserEdited === false);
      if(sequenceUpdateRules && sequenceUpdateRules.length > 0){
        const dbsequenceUpdateRules = filterData.RULES.filter(c=> sequenceUpdateRules.map(d=>d.ID).includes(c.ID));
        dbsequenceUpdateRules.forEach(async rule => {

          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === rule.ResourceType);
          if(RuleTypeObj){
            dbItemList =  await this.changeOwnerOfItems(RuleTypeObj.listName,dbItemList,rule,RuleTypeObj.Level2,parameter);
          }     
        });
      }
    }

    this.commonService.clearToastrMessage();
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      "Updating "+ disMessage + "...",
      true,
      true
    );
    const ListOfUpdatedItems = dbItemList.filter(c=>c.edited === true);
    if(ListOfUpdatedItems && ListOfUpdatedItems.length > 0){
      await this.updateAllEditedItems(ListOfUpdatedItems,type);

      this.commonService.clearToastrMessage();
      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "All " + disMessage + " of Rules updated sucessfully.",
        false
      );
    }

  }

  getItemCodes(ruleArray, dbItemList,rule,parameter){
        // list of project code / sow codes  to remove rules  
        return dbItemList.filter(c=> c[ruleArray].find(d=>d.ID === rule.ID)) ? dbItemList.filter(c=> c[ruleArray].find(d=>d.ID === rule.ID)).map(e=>e[parameter]) :[] ;
  }


  async updateAllEditedItems(ListOfUpdatedItems,TypeName){
    let batchURL=[];
    let batchResults=[];

    const ListName = TypeName === this.constants.RulesType.PROJECT ?  this.constants.listNames.ProjectInformation.name :this.constants.listNames.SOW.name
    const ListType = TypeName === this.constants.RulesType.PROJECT ?  this.constants.listNames.ProjectInformation.type :this.constants.listNames.SOW.type
    ListOfUpdatedItems.forEach(async item => {
      const data ={
        __metadata: { type: ListType  },
        ID: item.ID,
        CMLevel1Id: item.CMLevel1 && item.CMLevel1.hasOwnProperty('results') &&
        item.CMLevel1.results.length ?  { results: item.CMLevel1.results.map((c) => c.ID) }
        : { results: [] },
        CMLevel2Id: item.CMLevel2 ? item.CMLevel2.ID : 0 ,
        DeliveryLevel1Id : item.DeliveryLevel1 && item.DeliveryLevel1.hasOwnProperty('results') &&
        item.DeliveryLevel1.results.length ?  { results: item.DeliveryLevel1.results.map((c) => c.ID) }
        : { results: [] },
        DeliveryLevel2Id: item.DeliveryLevel2 ? item.DeliveryLevel2.ID : 0 ,
        CSRule:item.csRuleArray ? item.csRuleArray.map(c=>c.ID).join(';#'):'',
        DeliveryRule: item.deliveryRuleArray ? item.deliveryRuleArray.map(c=>c.ID).join(';#'):''
      }

      let url = this.spServices.getItemURL(
        ListName,
        +item.ID
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        data,
        this.constants.Method.PATCH,
        ListName
      ); 
      if (batchURL.length === 99) {
        this.commonService.SetNewrelic(
          "updateAllEditedItems",
          "AddAccessService",
          "AddAccess"
        );
        batchResults = await this.spServices.executeBatch(batchURL);
        batchURL = [];
      }
    });

    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "updateAllEditedItems",
        "AddAccessService",
        "AddAccess"
      );
      console.log(batchURL);
      batchResults = await this.spServices.executeBatch(batchURL);
    }
  }



  async fetchProjectFinanceForRule(addedRuleArray,dbItemList){
    let  ProjectFinance=[];
  
    let  CurrencyArray =addedRuleArray.filter(c=> c.DisplayRules.filter(c=> c.DisplayName === "Currency").length > 0) ? addedRuleArray.filter(c=> c.DisplayRules.filter(c=> c.DisplayName === "Currency").length > 0).map(c=>c.DisplayRules.find(c=>c.DisplayName === 'Currency')).map(c=>c.Value):[];

    CurrencyArray= [...new Set(CurrencyArray)];

    if(CurrencyArray.length > 0){

      this.commonService.showToastrMessage(
        this.constants.MessageType.info,
        "Fetching Project Finance Details....",
        true,
        true
      );

      
      const batchURL=[];
      let batchResults=[];
      CurrencyArray.forEach(element => {
        this.commonService.setBatchObject(
          batchURL,
          this.spServices.getReadURL(
            this.constants.listNames.ProjectFinances.name,
            this.adminConstants.QUERY.GET_PROJECT_FINANCE_BY_CURRENCY
          )
          .replace(/{{currency}}/gi, element),
          null,
          this.constants.Method.GET,
          this.constants.listNames.ProjectFinances.name
        );
      });

      this.commonService.SetNewrelic(
        "GetProjectFinance",
        "AddAccessService",
        "AddAccess"
      );

      batchResults = await this.spServices.executeBatch(batchURL);
     
      if(batchResults  && batchResults.length > 0){
          ProjectFinance = batchResults.filter(c=>c.listName ==='ProjectFinancesCT') ? [...new Set(batchResults.filter(c=>c.listName ==='ProjectFinancesCT').map(c=>c.retItems).reduce((a,b)=> [...a, ...b], []))] :[];
      }
    }
    // let ApplyRuleProjectArray=[];
    if(ProjectFinance){
      dbItemList.map(c=> c.Currency = ProjectFinance.find(d=>d.Title === c.ProjectCode) ? ProjectFinance.find(d=>d.Title === c.ProjectCode).Currency :'');
    }
    return dbItemList;
  }

  async addRuleToItems(addedRuleArray,dbItemList,filterData,type,parameter){
   
    const Message = type === this.constants.RulesType.PROJECT ?  "Applying new rule to projects...." : "Applying new rule to sow...."
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      Message,
      true,
      true
    );
     dbItemList.map(c=>c.Bucket = filterData.CLE.find(d=>d.value === c.ClientLegalEntity) ? filterData.CLE.find(d=>d.value === c.ClientLegalEntity).Bucket :'');
     addedRuleArray.forEach(async Rule => {
       let allItems =  JSON.parse(JSON.stringify(dbItemList));
      Rule.DisplayRules.forEach(element => {
        if(element.InternalName ==="Title"){
          allItems = allItems.filter(c=> c['Bucket'] === element.Value);
        }else{
          allItems = allItems.filter(c=> c[element.InternalName] === element.Value);
        }
      });

     
      const AllCodeList = allItems.map(c=>c[parameter]);
     
      if(AllCodeList){
        if(dbItemList.filter(c=> AllCodeList.includes(c[parameter]))  && dbItemList.filter(c=> AllCodeList.includes(c[parameter])).length > 0){
          dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(d=> d.edited= true);
        }
        const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === Rule.ResourceType);
        if(RuleTypeObj){
          dbItemList =  await this.applyRuleToItem(RuleTypeObj.listName,Rule,dbItemList,AllCodeList,RuleTypeObj.Level2,RuleTypeObj.Level1,parameter);
        }
      }
     });

     return dbItemList;
  }

  applyRuleToItem(arrayName,Rule,dbItemList,AllCodeList,owner,access,parameter){

    dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(d=> d[arrayName].push(Rule));
    dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(d=> d[arrayName].sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ))

    dbItemList.map(c=>c[owner] = c[arrayName] && c[arrayName].length > 0 ? c[arrayName][0].OwnerPG : c[owner]);

    if(Rule.Access && Rule.Access.results){
      dbItemList.map(c=>c[access] && c[access].results ? c[access].results.push.apply(c[access].results,Rule.Access.results) : c[access]);
      dbItemList.filter(c=> c[access] && c[access].results).map(c=> c[access].results =  Array.from(new Set(c[access].results.map(a => a.ID)))
      .map(id => {
        return c[access].results.find(a => a.ID === id)
      }));
    }
    return dbItemList;
  }


  UpdateItemsForRule(arrayName,oldrule,dbItemList,owner,access,RuleItems,parameter){
       // make edited true for containing current rule
       if(dbItemList.filter(c=> RuleItems.includes(c[parameter])) && dbItemList.filter(c=> RuleItems.includes(c[parameter])).length > 0 ){
        dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d.edited= true);
       }

       if(RuleItems  && RuleItems.length > 0){
          // check current rule access user
          if(oldrule.Access && oldrule.Access.results){
            // remove access user from particular field cmlevel or delivery level
             dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(c=>c[access].results = c[access].results ? c[access].results.filter(e => !oldrule.Access.results.map(f=>f.ID).includes(e.ID)):[]);
          }

          //change owner of project 
          dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[owner] = d[arrayName] && d[arrayName].length > 0 ? d[arrayName][0].OwnerPG : d[owner]);

          // update access user with existing and new (adhoc user)
          dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[access].results = d[arrayName] && d[arrayName].length > 0 && d[arrayName].filter(e=>e.Access.hasOwnProperty('results')) ?  [...new Set([...d[access].results , ...[...new Set(d[arrayName].filter(e=>e.Access.hasOwnProperty('results')).map(f=>f.Access.results.map(i=>i)).reduce((a,b)=> [...a, ...b], []))]])] : d[access].results);

        }
       return dbItemList;
  }

  changeOwnerOfItems(arrayName,dbItemList,rule,owner,parameter){
    // make edited true for containing current rule
    if( dbItemList.filter(c=> c[arrayName].find(d=>d.Id === rule.ID)) && dbItemList.filter(c=> c[arrayName].find(d=>d.Id === rule.ID)).length > 0 ){
      dbItemList.filter(c=>c[arrayName].filter(c=>c.Id === rule.ID)).map(d=> d.edited = true);
    }
     // list of project code / Sow code containing rule  
     const RuleItems =  dbItemList.filter(c=> c[arrayName].find(d=>d.ID === rule.ID)) ? dbItemList.filter(c=> c[arrayName].find(d=>d.ID === rule.ID)).map(e=>e[parameter]) :[] ;

     if(RuleItems && RuleItems.length > 0){
         //change owner of project /Sow
         dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[owner] = d[arrayName] && d[arrayName].length > 0 ? d[arrayName][0].OwnerPG : d[owner]);
     }
     return dbItemList;
  }


  
  // UpdateRuleUsers(arrayName,oldRule,dbItemList,owner,access){

  //   const RuleContaingProjects = dbItemList.filter(c=> c[arrayName].find(d=> d.ID === oldRule.ID))? dbItemList.filter(c=> c[arrayName].find(d=> d.ID === oldRule.ID)).map(e=>e.ProjectCode):[];

  //   if(RuleContaingProjects && RuleContaingProjects.length > 0){
  //     if(oldRule.Access && oldRule.Access.results){
  //       // remove access user from particular field cmlevel or delivery level of existing rule
  //       dbItemList.filter(c=> RuleContaingProjects.includes(c.ProjectCode)).map(c=>c[access] = c[arrayName] && c[arrayName].length > 0 && c[arrayName].find(c=>c.ID === oldRule.ID) ? c[access].filter(d=> !oldRule.Access.results.map(e=>e.ID).includes(d.ID)) : c[access]);
  //     }

  //      //change owner of project 
  //      dbItemList.filter(c=> RuleContaingProjects.includes(c.ProjectCode)).map(d=> d[owner] = d[arrayName] && d[arrayName].length > 0 ? d[arrayName][0].OwnerPG : d[owner]);


  //        // update access user with existing and new (adhoc user)
  //        dbItemList.filter(c=> RuleContaingProjects.includes(c.ProjectCode)).map(d=> d[access] = d[arrayName] && d[arrayName].length > 0 && d[arrayName].filter(e=>e.Access.hasOwnProperty('results')) ?  [...new Set([...d[access] , ...[...new Set(d[arrayName].filter(e=>e.Access.hasOwnProperty('results')).map(f=>f.Access.results.map(i=>i)).reduce((a,b)=> [...a, ...b], []))]])] : d[arrayName]);

  //   }


  //   return dbItemList;
  // }

  getAllOpenProjects(batchURL) {
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.ProjectInformation.name,
        this.adminConstants.QUERY.GET_PROJECT_INFO
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.ProjectInformation.name
    );
  }

  getAllSow(batchURL){
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.SOW.name,
        this.adminConstants.QUERY.GET_All_SOW
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.SOW.name
    );
  }
}
