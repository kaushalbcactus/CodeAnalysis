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
        
      filterData.RULES = JSON.parse(JSON.stringify(filterData.DBRULES));
      filterData.RULES.map((c) => (c.DisplayRules = JSON.parse(c.Rule)));
      filterData.RULES.map(
        (c) => (c.edited = { UserEdited: false, IsActiveCH: false })
      );
      filterData.RULES.map((c) => (c.RuleType = "existing"));

      filterData.TEMPRULES = JSON.parse(JSON.stringify(filterData.RULES));
    
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
    let batchResultsArray=[];
    let EditedRuleArray = [];
    let addedRuleArray = [];
    let NewRules = 0;
    let updatedRules = 0;
    let deletedRules = 0;
    const dispalyOrderArray = Rules.map(
      (c) => c.DisplayOrder
    ).sort((one, two) => (one > two ? -1 : 1));


    for(let i=0; i< Rules.length;i++){

      if (
        Rules[i].RuleType === "existing" &&
        (Rules[i].DisplayOrder !== dispalyOrderArray[i] ||
          Rules[i].edited.IsActiveCH === true ||
          Rules[i].edited.UserEdited === true)
      ) {
        const editedRule = {
          __metadata: { type: this.constants.listNames.RuleStore.type },
          OwnerPGId: Rules[i].OwnerPG.ID,
          AccessId: Rules[i].Access.results
            ? { results: Rules[i].Access.results.map((c) => c.ID) }
            : { results: [] },
          IsActiveCH: Rules[i].IsActiveCH,
          DisplayOrder: dispalyOrderArray[i],
        };
        const exRule = filterData.DBRULES.find(c=>c.ID ===Rules[i].ID) ? filterData.DBRULES.find(c=>c.ID ===Rules[i].ID) : Rules[i];
        exRule.edited = Rules[i].edited;
        EditedRuleArray.push(exRule);
        editedRule.IsActiveCH === "No" ? deletedRules++ : updatedRules++;
        let url = this.spServices.getItemURL(
          this.constants.listNames.RuleStore.name,
          +Rules[i].ID
        );
        this.commonService.setBatchObject(
          batchURL,
          url,
          editedRule,
          this.constants.Method.PATCH,
          this.constants.listNames.RuleStore.name
        );
      } else if (Rules[i].RuleType === "new") {
        const NewRule = {
          __metadata: { type: this.constants.listNames.RuleStore.type },
          OwnerPGId: Rules[i].OwnerPG.ID,
          AccessId: Rules[i].Access.results
            ? { results: Rules[i].Access.results.map((c) => c.ID) }
            : { results: [] },
          IsActiveCH: Rules[i].IsActiveCH,
          DisplayOrder: dispalyOrderArray[i],
          ResourceType: Rules[i].ResourceType,
          TypeST: Rules[i].TypeST,
          Rule: Rules[i].Rule,
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

        batchResultsArray.push.apply(batchResultsArray,batchResults);
        batchURL = [];
      }

    }

    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "UpdateRuleStore",
        "AddAccessService",
        "AddAccess"
      );
     
      batchResults = await this.spServices.executeBatch(batchURL);

      batchResultsArray.push.apply(batchResultsArray,batchResults);


    }

    if(batchResultsArray  && batchResultsArray.length > 0){
      addedRuleArray = batchResultsArray.filter(c=>c.listName ==='RuleStoreCT') ? batchResultsArray.filter(c=>c.listName ==='RuleStoreCT').map(c=>c.retItems):[];
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
    //  if(type === this.constants.RulesType.PROJECT || type === this.constants.RulesType.SOW){
       await  this.updateAllDetails(filterData, type, addedRuleArray, EditedRuleArray);
    //  }
      
  }

  filterInactiveProjects(dbItemList: any ,projectData) {
    for (const index in dbItemList) {
      if (dbItemList.hasOwnProperty(index)) {
        let projectInfo = projectData.find(e=> e.ProjectCode == dbItemList[index].Title)
        if(projectInfo) {
          dbItemList.splice(index,1);
        }
      }
    }

    return dbItemList;
    
  }

  async updateAllDetails(filterData, type, addedRuleArray, EditedRuleArray) {
    let dbItemList=[];
    let CLE=[];
    let  batchURL = [];
    let batchResults = [];
    let disMessage='';
    let parameter='';
    let Message = '';
    let ActiveProjectList = [];
     
    // let AllProjects={dbList:[],ProjectCodes:[]};
    switch (type) {
      case this.constants.RulesType.PROJECT:
      this.getAllOpenProjects(batchURL);
      Message ="Fetching Projects.....";
      break;
      case this.constants.RulesType.SOW:
      this.getAllSow(batchURL);
      Message ="Fetching SOW.....";
      break;
      case this.constants.RulesType.CD:
      this.getAllQC(batchURL);
      Message ="Fetching Quality Complaints.....";
      break;
      case this.constants.RulesType.PF:
      await this.getAllPF(batchURL);
      // await this.getAllOpenProjects(batchURL);
      Message ="Fetching Positive Feedback.....";
      break;
    }

    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      Message,
      true,
      true
    );

    this.GetRulesByType(batchURL, type);
    this.commonService.SetNewrelic(
      "getPrjectAndRules",
      "AddAccessService",
      "AddAccess"
    );
 
    batchResults = await this.spServices.executeBatch(batchURL);
    filterData = this.processfetchedRules(filterData, batchResults);

    switch (type) {
      case this.constants.RulesType.PROJECT:
        dbItemList =  batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name) &&
        batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name).retItems ? 
        batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name).retItems :[];
        disMessage = 'project';
        parameter = 'ProjectCode';
      break;
      case this.constants.RulesType.SOW:
        dbItemList =  batchResults.find((c) => c.listName === this.constants.listNames.SOW.name) &&
        batchResults.find((c) => c.listName === this.constants.listNames.SOW.name).retItems ? 
        batchResults.find((c) => c.listName === this.constants.listNames.SOW.name).retItems :[];
        disMessage = 'sow';
        parameter = 'SOWCode';
      break;
      case this.constants.RulesType.CD:
        dbItemList =  batchResults.find((c) => c.listName === this.constants.listNames.QualityComplaints.name) &&
        batchResults.find((c) => c.listName === this.constants.listNames.QualityComplaints.name).retItems ? 
        batchResults.find((c) => c.listName === this.constants.listNames.QualityComplaints.name).retItems :[];
 
        // dbItemList =  results.map(o => new Object({Id: o.Id, ProjectCode: o.Title, DeliveryRule:o.DeliveryRule, ASD: o.ASD,TL : o.TL}));

        disMessage = 'quality complaints';
        parameter = 'Title';
      break;
      case this.constants.RulesType.PF:
        dbItemList =  batchResults.find((c) => c.listName === this.constants.listNames.PositiveFeedbacks.name) &&
        batchResults.find((c) => c.listName === this.constants.listNames.PositiveFeedbacks.name).retItems ? 
        batchResults.find((c) => c.listName === this.constants.listNames.PositiveFeedbacks.name).retItems :[];
        // ActiveProjectList =  batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name) &&
        // batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name).retItems ? 
        // batchResults.find((c) => c.listName === this.constants.listNames.ProjectInformation.name).retItems :[];
        // await this.filterInactiveProjects(dbItemList,ActiveProjectList);
        disMessage = 'positive feedback';
        parameter = 'Title';
      break;
    }
  
    CLE = filterData.CLE;

    if(type === this.constants.RulesType.PROJECT || type === this.constants.RulesType.SOW){
      dbItemList.map(c=>c.csRuleArray = c.CSRule && filterData.RULES.filter(d=> c.CSRule.split(';#').map(c=>+c).includes(d.ID)) ? filterData.RULES.filter(d=> c.CSRule.split(';#').map(c=>+c).includes(d.ID)).sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ):[])
    }
      
    dbItemList.map(c=>c.deliveryRuleArray = c.DeliveryRule && filterData.RULES.filter(d=> c.DeliveryRule.split(';#').map(c=>+c).includes(d.ID)) ? filterData.RULES.filter(d=> c.DeliveryRule.split(';#').map(c=>+c).includes(d.ID)).sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ) :[]);


    let AddRuleItemsCount =0;
    if (addedRuleArray.length > 0) {
      addedRuleArray = filterData.RULES.filter(c=> addedRuleArray.map(i=>i.ID).includes(c.ID));

      if(type === this.constants.RulesType.CD || type === this.constants.RulesType.PF){
        dbItemList = await this.fetchProjectForRule(dbItemList);

        if(type === this.constants.RulesType.PF){
          dbItemList= dbItemList.filter(c=> c.ProjectStatus !== this.constants.projectStatus.Cancelled && c.ProjectStatus !== this.constants.projectStatus.Closed);
        }
      }
      if(type !== this.constants.RulesType.SOW ){
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
          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === type) ? this.constants.RuleTypeParameterArray.find(c=>c.label === type).value.find(d=>d.label === oldrule.ResourceType):'';
           if(RuleTypeObj){
             RuleItems = dbItemList.filter(c=> c[RuleTypeObj.DBParameter] && c[RuleTypeObj.DBParameter].split(';#').map(c=>+c).includes(oldrule.ID)) ? dbItemList.filter(c=> c[RuleTypeObj.DBParameter] && c[RuleTypeObj.DBParameter].split(';#').map(c=>+c).includes(oldrule.ID)).map(e=>e[parameter]):[];
             if(RuleItems && RuleItems.length > 0){
               dbItemList =  await this.UpdateItemsForRule(RuleTypeObj.listName,oldrule,dbItemList,RuleTypeObj.Level2,RuleTypeObj.Level1,RuleItems,parameter,type);
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
          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === type) ? this.constants.RuleTypeParameterArray.find(c=>c.label === type).value.find(d=>d.label === updatedrule.ResourceType):'';
          if(RuleTypeObj){
            RuleItems = this.getItemCodes(RuleTypeObj.listName,dbItemList,oldRule,parameter);
            if(RuleItems && RuleItems.length > 0){
              dbItemList =  await this.UpdateItemsForRule(RuleTypeObj.listName,oldRule,dbItemList,RuleTypeObj.Level2,RuleTypeObj.Level1,RuleItems,parameter,type);
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

      if(type !== this.constants.RulesType.PF){
        const sequenceUpdateRules = EditedRuleArray.filter(c=>c.edited.IsActiveCH === false && c.edited.UserEdited === false);
        if(sequenceUpdateRules && sequenceUpdateRules.length > 0){
          const dbsequenceUpdateRules = filterData.RULES.filter(c=> sequenceUpdateRules.map(d=>d.ID).includes(c.ID));
          dbsequenceUpdateRules.forEach(async rule => {
 
          const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === type) ? this.constants.RuleTypeParameterArray.find(c=>c.label === type).value.find(d=>d.label === rule.ResourceType):'';
          if(RuleTypeObj){
            dbItemList =  await this.changeOwnerOfItems(RuleTypeObj.listName,dbItemList,rule,RuleTypeObj.Level2,parameter);
          }     
          });
        }
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
      await this.updateAllEditedItems(ListOfUpdatedItems,type, disMessage);
    } 

    this.commonService.clearToastrMessage();
    this.commonService.showToastrMessage(
      this.constants.MessageType.success,
      "All " + disMessage + " of Rules updated sucessfully.",
      false
    );

  }

  getItemCodes(ruleArray, dbItemList,rule,parameter){
        // list of project code / sow codes  to remove rules  
        return dbItemList.filter(c=> c[ruleArray].find(d=>d.ID === rule.ID)) ? dbItemList.filter(c=> c[ruleArray].find(d=>d.ID === rule.ID)).map(e=>e[parameter]) :[] ;
  }


  async updateAllEditedItems(ListOfUpdatedItems,TypeName, disMessage){
    let batchURL=[];
    let  ListName='';
    let ListType='';
    switch (TypeName) {
      case this.constants.RulesType.PROJECT:
        ListName =this.constants.listNames.ProjectInformation.name;
        ListType = this.constants.listNames.ProjectInformation.type;
      break;
      case this.constants.RulesType.SOW:
        ListName =this.constants.listNames.SOW.name;
        ListType = this.constants.listNames.SOW.type;
        break;
        case this.constants.RulesType.CD:
          ListName =this.constants.listNames.QualityComplaints.name;
          ListType = this.constants.listNames.QualityComplaints.type;
          break;
          case this.constants.RulesType.PF:
            ListName =this.constants.listNames.PositiveFeedbacks.name;
            ListType = this.constants.listNames.PositiveFeedbacks.type;
            break;
    }


    for (var i=0; i< ListOfUpdatedItems.length; i++){
      const data ={
        __metadata: { type: ListType  },
        // ID: item.ID,
        DeliveryRule: ListOfUpdatedItems[i].deliveryRuleArray ? ListOfUpdatedItems[i].deliveryRuleArray.map(c=>c.ID).join(';#'):''
      };

      if(TypeName === this.constants.RulesType.PROJECT || TypeName === this.constants.RulesType.SOW ){
        data['CSRule'] = ListOfUpdatedItems[i].csRuleArray ? ListOfUpdatedItems[i].csRuleArray.map(c=>c.ID).join(';#'):'';
        data['CMLevel1Id'] = ListOfUpdatedItems[i].CMLevel1 && ListOfUpdatedItems[i].CMLevel1.hasOwnProperty('results') &&
        ListOfUpdatedItems[i].CMLevel1.results.length ?  { results: ListOfUpdatedItems[i].CMLevel1.results.map((c) => c.ID) }
        : { results: [] };
        data['CMLevel2Id'] =  ListOfUpdatedItems[i].CMLevel2 ? ListOfUpdatedItems[i].CMLevel2.ID : -1 ;
        data['DeliveryLevel1Id'] =   ListOfUpdatedItems[i].DeliveryLevel1 && ListOfUpdatedItems[i].DeliveryLevel1.hasOwnProperty('results') &&
        ListOfUpdatedItems[i].DeliveryLevel1.results.length ?  { results: ListOfUpdatedItems[i].DeliveryLevel1.results.map((c) => c.ID) }
        : { results: [] };
        data['DeliveryLevel2Id'] =  ListOfUpdatedItems[i].DeliveryLevel2 ? ListOfUpdatedItems[i].DeliveryLevel2.ID : -1;
      } else if(TypeName === this.constants.RulesType.CD ) { 
        data['TLId'] =   ListOfUpdatedItems[i].TL && ListOfUpdatedItems[i].TL.hasOwnProperty('results') &&
        ListOfUpdatedItems[i].TL.results.length ?  { results: ListOfUpdatedItems[i].TL.results.map((c) => c.ID) }
        : { results: [] };
        data['ASDId'] =  ListOfUpdatedItems[i].ASD ? { results: [ListOfUpdatedItems[i].ASD.ID] }: { results: [] };
        data['CSId'] =  ListOfUpdatedItems[i].CSId ? { results: ListOfUpdatedItems[i].CSId.results }: { results: [] };
      }
      else {
        data['DeliveryLeadsId'] =   ListOfUpdatedItems[i].DeliveryLeads && ListOfUpdatedItems[i].DeliveryLeads.hasOwnProperty('results') &&
        ListOfUpdatedItems[i].DeliveryLeads.results.length ?  { results: ListOfUpdatedItems[i].DeliveryLeads.results.map((c) => c.ID) }
        : { results: [] };
      }
      let url = this.spServices.getItemURL(
        ListName,
        +ListOfUpdatedItems[i].ID
      );
      this.commonService.setBatchObject(
        batchURL,
        url,
        data,
        this.constants.Method.PATCH,
        ListName
      ); 
      let count = i + 1;
      this.commonService.clearToastrMessage();
      this.commonService.showToastrMessage(
        this.constants.MessageType.info,
        "Updating "+ disMessage +" " + count + " of " + ListOfUpdatedItems.length ,
        true,
        true,"Updating "+ disMessage + "..."
      );
      
      if (batchURL.length === 99) {
        this.commonService.SetNewrelic(
          "updateAllEditedItems",
          "AddAccessService",
          "AddAccess"
        );
       await this.spServices.executeBatch(batchURL);
        batchURL = [];
      }
    }
   
    if (batchURL.length) {
      this.commonService.SetNewrelic(
        "updateAllEditedItems",
        "AddAccessService",
        "AddAccess"
      );
    
     await this.spServices.executeBatch(batchURL);
    }
  }


  async fetchProjectForRule(dbItemList){
   let batchURL=[];
   let batchResults=[];
   let ProjectCodes=[];
   let ProjectInformations=[];
   ProjectCodes = dbItemList.map(c=>c.Title) ? [...new Set(dbItemList.map(c=>c.Title))]:[];
    if(ProjectCodes && ProjectCodes.length > 0){
      this.commonService.showToastrMessage(
        this.constants.MessageType.info,
        "Fetching Project Informations....",
        true,
        true
      );

      ProjectCodes.forEach(element => {
        this.commonService.setBatchObject(
          batchURL,
          this.spServices.getReadURL(
            this.constants.listNames.ProjectInformation.name,
            this.adminConstants.QUERY.GET_PROJECT_INFO_bY_PROJECTCODE
          ).replace(/{{projectcode}}/gi, element),
          null,
          this.constants.Method.GET,
          this.constants.listNames.ProjectInformation.name
        );
      }); 
      this.commonService.SetNewrelic(
        "GetProjectInformation",
        "AddAccessService",
        "AddAccess"
      );

      batchResults = await this.spServices.executeBatch(batchURL);

      if(batchResults  && batchResults.length > 0){
        ProjectInformations = batchResults.filter(c=>c.listName === this.constants.listNames.ProjectInformation.name) ? [...new Set(batchResults.filter(c=>c.listName === this.constants.listNames.ProjectInformation.name).map(c=>c.retItems).reduce((a,b)=> [...a, ...b], []))] :[];
      }
    }
    if(ProjectInformations){
      //assign practice area
      dbItemList.map(c=> c.BusinessVertical = ProjectInformations.find(d=>d.ProjectCode === c.Title) ? ProjectInformations.find(d=>d.ProjectCode === c.Title).BusinessVertical :'');

      //assign cle
      dbItemList.map(c=> c.ClientLegalEntity = ProjectInformations.find(d=>d.ProjectCode === c.Title) ? ProjectInformations.find(d=>d.ProjectCode === c.Title).ClientLegalEntity :'');

      // assign sub division
      dbItemList.map(c=> c.SubDivision = ProjectInformations.find(d=>d.ProjectCode === c.Title) ? ProjectInformations.find(d=>d.ProjectCode === c.Title).SubDivision :'');

      //assign deliverableType
      dbItemList.map(c=> c.DeliverableType = ProjectInformations.find(d=>d.ProjectCode === c.Title) ? ProjectInformations.find(d=>d.ProjectCode === c.Title).DeliverableType :'');


      dbItemList.map(c=> c.ProjectStatus = ProjectInformations.find(d=>d.ProjectCode === c.Title) ? ProjectInformations.find(d=>d.ProjectCode === c.Title).Status :'');
    }
    return dbItemList;
  }

  async fetchProjectFinanceForRule(addedRuleArray,dbItemList){
    let  ProjectFinance=[];
  
    let  CurrencyArray =addedRuleArray.filter(c=> c.DisplayRules.filter(c=> c.InternalName === "Currency").length > 0) ? addedRuleArray.filter(c=> c.DisplayRules.filter(c=> c.InternalName === "Currency").length > 0).map(c=>c.DisplayRules.find(c=>c.InternalName === 'Currency')).map(c=>c.Value):[];

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
          ProjectFinance = batchResults.filter(c=>c.listName ===this.constants.listNames.ProjectFinances.name) ? [...new Set(batchResults.filter(c=>c.listName ===this.constants.listNames.ProjectFinances.name).map(c=>c.retItems).reduce((a,b)=> [...a, ...b], []))] :[];
      }
    }
    // let ApplyRuleProjectArray=[];
    if(ProjectFinance){
      dbItemList.map(c=> c.Currency = ProjectFinance.find(d=>d.Title === c.ProjectCode) ? ProjectFinance.find(d=>d.Title === c.ProjectCode).Currency :'');
    }
    return dbItemList;
  }

  async addRuleToItems(addedRuleArray,dbItemList,filterData,type,parameter){
    let  Message ='';
    switch (type) {
      case this.constants.RulesType.PROJECT:
      Message = "Applying new rule to projects....";
      break;
      case this.constants.RulesType.SOW:
        Message = "Applying new rule to sow....";
        break;
        case this.constants.RulesType.CD:
          Message = "Applying new rule to quality complaints....";
          break;
          case this.constants.RulesType.PF:
            Message = "Applying new rule to positive feedback....";
            break;
    }
   
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
        const RuleTypeObj = this.constants.RuleTypeParameterArray.find(c=>c.label === type) ? this.constants.RuleTypeParameterArray.find(c=>c.label === type).value.find(d=>d.label === Rule.ResourceType):'';
        if(RuleTypeObj){
          dbItemList =  await this.applyRuleToItem(RuleTypeObj.listName,Rule,dbItemList,AllCodeList,RuleTypeObj.Level2,RuleTypeObj.Level1,parameter,type);
        }
      }
     });

     return dbItemList;
  }

  applyRuleToItem(arrayName,Rule,dbItemList,AllCodeList,owner,access,parameter,type){

    dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(d=> d[arrayName].push(Rule));
    dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(d=> d[arrayName].sort( function ( a, b ) { return b.DisplayOrder - a.DisplayOrder; } ))

    if(type !== this.constants.RulesType.PF){
      dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(c=>c[owner] = c[arrayName] && c[arrayName].length > 0 ? c[arrayName][0].OwnerPG : c[owner]);
    } else{
        dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(c=>c[access] && c[access].hasOwnProperty('results') && c[access].results.length ? c[access].results.push(Rule.OwnerPG) : c[access] = {results :[Rule.OwnerPG]});
    }

    if(Rule.Access && Rule.Access.results){

      dbItemList.filter(c=> AllCodeList.includes(c[parameter])).map(c=>c[access] && c[access].hasOwnProperty('results') && c[access].results.length ? c[access].results.push.apply(c[access].results,Rule.Access.results) : c[access] = {results : Rule.Access.results});
    }

    dbItemList.filter(c=> AllCodeList.includes(c[parameter])).filter(c=> c[access] && c[access].hasOwnProperty('results')).map(c=> c[access].results =  Array.from(new Set(c[access].results.map(a => a.ID)))
    .map(id => {
      return c[access].results.find(a => a.ID === id)
    }));

    return dbItemList;
  }


  UpdateItemsForRule(arrayName,oldrule,dbItemList,owner,access,RuleItems,parameter,type){
       // make edited true for containing current rule
       if(dbItemList.filter(c=> RuleItems.includes(c[parameter])) && dbItemList.filter(c=> RuleItems.includes(c[parameter])).length > 0 ){
        dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d.edited= true);
       }
       if(RuleItems  && RuleItems.length > 0){
          // check current rule access user
          if(oldrule.Access && oldrule.Access.results){
            // remove access user from particular field cmlevel or delivery level
             dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(c=>c[access].results = c[access].results ? c[access].results.filter(e => !oldrule.Access.results.map(f=>f.ID).includes(e.ID)):[]);

             if(type == this.constants.RulesType.CD){
              dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(c=>c['CSId'].results = c['CSId'].results ? c['CSId'].results.filter(e => !oldrule.Access.results.map(f=>f.ID).includes(e.ID)):[]);
             }
          }

          // update access user with existing and new (adhoc user)
          if(type == this.constants.RulesType.CD){
            dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d['CSId'].results = d[arrayName] && d[arrayName].length > 0 && d[arrayName].filter(e=>e.Access.hasOwnProperty('results')) ?  [...new Set([...d['CSId'].results , ...[...new Set(d[arrayName].filter(e=>e.Access.hasOwnProperty('results')).map(f=>f.Access.results.map(i=>i.ID)).reduce((a,b)=> [...a, ...b], []))]])] : d['CSId'].results);
          }

          dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[access].results = d[arrayName] && d[arrayName].length > 0 && d[arrayName].filter(e=>e.Access.hasOwnProperty('results')) ?  [...new Set([...d[access].results , ...[...new Set(d[arrayName].filter(e=>e.Access.hasOwnProperty('results')).map(f=>f.Access.results.map(i=>i)).reduce((a,b)=> [...a, ...b], []))]])] : d[access].results);

          if(type !== this.constants.RulesType.PF){
            //change owner of project 
            dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[owner] = d[arrayName] && d[arrayName].length > 0 ? d[arrayName][0].OwnerPG : 0);
          } else {
             // remove owner user from delivery leads for pf
            dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(c=> c[access].results = c[access].results ? c[access].results.filter(e => e.ID !== oldrule.OwnerPG.ID):[]);


          // update access user with existing and new (adhoc user)
          dbItemList.filter(c=> RuleItems.includes(c[parameter])).map(d=> d[access].results = d[arrayName] && d[arrayName].length > 0 ?  [...new Set([...d[access].results , ...[...new Set(d[arrayName].map(f=>f.OwnerPG))]])] : d[access].results);
          }
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


  getAllQC(batchURL){
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.QualityComplaints.name,
        this.adminConstants.QUERY.GET_All_QUALITY_COMPLAINTS
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.QualityComplaints.name
    );
  }

  getAllPF(batchURL){
    this.commonService.setBatchObject(
      batchURL,
      this.spServices.getReadURL(
        this.constants.listNames.PositiveFeedbacks.name,
        this.adminConstants.QUERY.GET_All_POSITIVE_FEEDBACK
      ),
      null,
      this.constants.Method.GET,
      this.constants.listNames.PositiveFeedbacks.name
    );
  }

  getInactiveProjects(batchURL){
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
