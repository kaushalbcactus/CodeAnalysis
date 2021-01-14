import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { FormBuilder } from "@angular/forms";
import { AddAccessService } from "../service/add-access.service";
import { OverlayPanel, DialogService } from "primeng";
import { EditRuleUserComponent } from "../edit-rule-user/edit-rule-user.component";

@Component({
  selector: "app-project-access",
  templateUrl: "./project-access.component.html",
  styleUrls: ["./project-access.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [DialogService],
})
export class ProjectAccessComponent implements OnInit {
  @ViewChild("showRuleDetails", { static: false }) panel: OverlayPanel;
  @ViewChild("flipcard", { static: false }) myDivElementRef: ElementRef;
  @Input() RuleType: string;
  filterData = {
    PRACTICEAREA: [],
    CLE: [],
    dbCLE:[],
    SUBDIVISION: [],
    DELIVERYTYPE: [],
    RULES: [],
    DBRULES: [],
    TEMPRULES: [],
    RULEPARAMETERS: [],
    RULEPARAMETERSDISPLAY: [],
    RESOURCECATEGORIZATION: [],
    CM: [],
    DELIVERY: [],
  };
  availableOptions: any[];
  selectedOption: any[] = [];
  draggedOption: any;
  PracticeAreas: any[] = [];
  CLES: any[] = [];
  SubDivisions: any[] = [];
  DeliveryTypes: any[] = [];
  cols = [{ field: "Rules", header: "Rules" }];
  Rules = [{ temp: "test" }];
  index: number = 1;
  loaderenable: boolean = true;
  subloaderenable: boolean = true;
  searchRulesForm = this.fb.group({
    practiceArea:  [],
    cle:  [],
    subDivision:   [],
    deliveryType:  [],
  });

  FilterArrayObj =[ { label: "Practice Area", value: "practiceArea" },
  { label: "Client", value: "cle" },
  { label: "Client Subdivision", value: "subDivision" },
  { label: "Deliverable Type", value: "deliveryType" },
]

  AddAccessType = [
    {
      label: this.constant.RulesType.DELIVERY,
      value: this.constant.RulesType.DELIVERY,
    },
    { label: this.constant.RulesType.CM, value: this.constant.RulesType.CM },
  ];
  ViewAccessType = [
    { label: "All", value: "All" },
    {
      label: this.constant.RulesType.DELIVERY,
      value: this.constant.RulesType.DELIVERY,
    },
    { label: this.constant.RulesType.CM, value: this.constant.RulesType.CM },
  ];
  headerName: string = "";
  selectedAccessType: string = this.AddAccessType[0].value;
  selectedViewAccessType: string = this.ViewAccessType[0].value;
  PanelDetails: any;
  constructor(
    public common: CommonService,
    private constant: ConstantsService,
    public fb: FormBuilder,
    public addAccessService: AddAccessService,
    public dialogService: DialogService
  ) {}

  ngOnInit() {
    if (this.RuleType === this.constant.RulesType.PROJECT) {
      this.headerName = "Add Project Rules";
    } else if (this.RuleType === this.constant.RulesType.SOW) {
      this.headerName = "Add SOW Rules";
    } else if (this.RuleType === this.constant.RulesType.CD) {
      this.headerName = "Add Client Dissatisfaction Rules";
    }else {
      this.headerName = "Add Positive Feedback Rules";
    }
    this.getDataOnLoad(this.RuleType, this.filterData);
  }

  async getDataOnLoad(RuleType, filterData) {
    this.loaderenable = true;
    let batchURL = [];

    this.addAccessService.getDataForFilters(batchURL);
    this.addAccessService.getRulesParameters(batchURL, RuleType);
    this.addAccessService.GetRulesByType(batchURL, RuleType);

    this.filterData = await this.addAccessService.processData(
      batchURL,
      filterData
    );

    this.loaderenable = false;

    this.addAccessService.getPrametersDropdownData(
      this.filterData.RULEPARAMETERS
    );
    this.filterRules();
  }

  dragStart(event, option) {
    this.draggedOption = option;
  }

  drop(event) {
    if(this.selectedOption.length === 0 &&  this.filterData[this.selectedAccessType.toUpperCase()].length > 0){
      this.filterData[this.selectedAccessType.toUpperCase()].map(c=>c.selectedValue='');
    }

    if (this.draggedOption) {
      if (
        !this.selectedOption.find((c) => c.label === this.draggedOption.value)
      ) {
        const selectedOpt = this.filterData.RULEPARAMETERS.find(
          (c) => c.Title === this.draggedOption.value
        );
        const draggedObj = {
          label: this.draggedOption.value,
          placeholder: "Select " + this.draggedOption.value,
          value:
            selectedOpt && selectedOpt.dbRecords
              ? selectedOpt.dbRecords.map(
                  (o) =>
                    new Object({
                      label: o[selectedOpt.NameST],
                      value: o[selectedOpt.NameST],
                    })
                )
              : [],
          selectedValue: "",
          InternalName: selectedOpt.InternalName,
          NameST: selectedOpt.NameST,
        };

        this.selectedOption = [...this.selectedOption, draggedObj];
        if (this.selectedOption.length > 1) {
          this.checkNext(
            this.selectedOption[this.selectedOption.length - 2],
            this.selectedOption.length - 2
          );
        }
      } else {
        this.common.showToastrMessage(
          this.constant.MessageType.warn,
          "Selected option already exist.",
          false
        );
      }

      if (this.selectedOption.length > 0) {
        if (
          (this.selectedAccessType === this.constant.RulesType.DELIVERY &&
            this.filterData.DELIVERY.length === 0) ||
          (this.selectedAccessType === this.constant.RulesType.CM &&
            this.filterData.CM.length === 0)
        ) {
          this.GetAccessData(this.selectedAccessType);
        }
      }

      this.draggedOption = null;
    }
  }


  GetAccessData(RuleType) {
    for (var i = 0; i < 2; i++) {
      const data = {
        label: i === 0 ? "ownerShip" : "accessUsers",
        selectedValue: "",
        values: this.constant.RulesType.DELIVERY === RuleType ?   this.filterData.RESOURCECATEGORIZATION.filter(
          (c) => c.RoleCH === this.constant.RoleType.DELIVERY1 || c.RoleCH === this.constant.RoleType.DELIVERY2
        ).map(
          (o) =>
            new Object({
              label: o.UserNamePG.Title,
              value: o.UserNamePG.Title,
              Id: o.UserNamePG.ID,
            })
        ) :  this.filterData.RESOURCECATEGORIZATION.filter(
          (c) => c.RoleCH === this.constant.RoleType.CM1 || c.RoleCH === this.constant.RoleType.CM2
        ).map(
          (o) =>
            new Object({
              label: o.UserNamePG.Title,
              value: o.UserNamePG.Title,
              Id: o.UserNamePG.ID,
            })
        )
      };
      RuleType === this.constant.RulesType.DELIVERY
        ? this.filterData.DELIVERY.push(data)
        : this.filterData.CM.push(data);
    }
  }
  // GetAccessData(RuleType) {
  //   for (var i = 0; i < 2; i++) {
  //     const data = {
  //       label: i === 0 ? "ownerShip" : "accessUsers",
  //       selectedValue: "",
  //       values:
  //         i === 0
  //           ? this.constant.RulesType.DELIVERY === RuleType
  //             ? this.filterData.RESOURCECATEGORIZATION.filter(
  //                 (c) => c.RoleCH === this.constant.RoleType.DELIVERY2
  //               ).map(
  //                 (o) =>
  //                   new Object({
  //                     label: o.UserNamePG.Title,
  //                     value: o.UserNamePG.Title,
  //                     Id: o.UserNamePG.ID,
  //                   })
  //               )
  //             : this.filterData.RESOURCECATEGORIZATION.filter(
  //                 (c) => c.RoleCH === this.constant.RoleType.CM2
  //               ).map(
  //                 (o) =>
  //                   new Object({
  //                     label: o.UserNamePG.Title,
  //                     value: o.UserNamePG.Title,
  //                     Id: o.UserNamePG.ID,
  //                   })
  //               )
  //           : this.constant.RulesType.DELIVERY === RuleType
  //           ? this.filterData.RESOURCECATEGORIZATION.filter(
  //               (c) => c.RoleCH === this.constant.RoleType.DELIVERY1
  //             ).map(
  //               (o) =>
  //                 new Object({
  //                   label: o.UserNamePG.Title,
  //                   value: o.UserNamePG.Title,
  //                   Id: o.UserNamePG.ID,
  //                 })
  //             )
  //           : this.filterData.RESOURCECATEGORIZATION.filter(
  //               (c) => c.RoleCH === this.constant.RoleType.CM1
  //             ).map(
  //               (o) =>
  //                 new Object({
  //                   label: o.UserNamePG.Title,
  //                   value: o.UserNamePG.Title,
  //                   Id: o.UserNamePG.ID,
  //                 })
  //             ),
  //     };
  //     RuleType === this.constant.RulesType.DELIVERY
  //       ? this.filterData.DELIVERY.push(data)
  //       : this.filterData.CM.push(data);
  //   }
  // }

  onTabClose(event) {}

  onTabOpen(event) {
    if (event.index === 0) {
      this.subloaderenable = true;
      this.selectedOption = [];
      this.filterData.DELIVERY = [];
      this.filterData.CM = [];
      this.subloaderenable = false;
    } else {
    }
  }

  dragEnd(event) {
    this.draggedOption = null;
  }

  cleanData() {
    this.selectedOption = [];
    this.filterData.DELIVERY = [];
    this.filterData.CM = [];
  }

  onSubmit() {
  this.index = -1;
    this.filterRules();
    setTimeout(() => {
      this.index = 1;
    }, 200);
   
  }

  resetProjectFilters() {
    this.index = 1;
    this.searchRulesForm.reset();
    this.selectedViewAccessType = this.ViewAccessType[0].value;
    this.filterRules();
  }

  CheckDataOnAccessType() {
    if (this.selectedOption.length > 0) {
      if (
        (this.selectedAccessType === this.constant.RulesType.DELIVERY &&
          this.filterData.DELIVERY.length === 0) ||
        (this.selectedAccessType === this.constant.RulesType.CM &&
          this.filterData.CM.length === 0)
      ) {
        this.GetAccessData(this.selectedAccessType);
      }
    }
  }

  checkNext(value, index) {
  
    const Dependency = this.filterData.RULEPARAMETERS.find(
      (c) => c.Title === value.label
    ).Dependency;
    if (Dependency && this.selectedOption.length > index) {
      if (
        this.selectedOption[index + 1] &&
        this.selectedOption[index + 1].label === Dependency.split(":")[0]
      ) {
        this.selectedOption[
          index + 1
        ].value = this.filterData.RULEPARAMETERS.find(
          (c) => c.Title === this.selectedOption[index + 1].label
        ).dbRecords
          ? this.filterData.RULEPARAMETERS.find(
              (c) => c.Title === this.selectedOption[index + 1].label
            )
              .dbRecords.filter(
                (c) => c[Dependency.split(":")[1]] === value.selectedValue
              )
              .map(
                (o) =>
                  new Object({
                    label: o[value.NameST],
                    value: o[value.NameST],
                  })
              )
          : [];
      }
    }
  }

  addRule() {
    this.resetProjectFilters();
    const unSelectedValue = this.selectedOption.find(
      (c) => c.selectedValue === ""
    );
    if (unSelectedValue) {
      this.common.showToastrMessage(
        this.constant.MessageType.warn,
        "Please select " + unSelectedValue.label.toLowerCase(),
        false,
        false
      );
    } else if (
      this.filterData[this.selectedAccessType.toUpperCase()].find(
        (c) => c.label === "ownerShip"
      ).selectedValue === ""
    ) {
      this.common.showToastrMessage(
        this.constant.MessageType.warn,
        "Please select owner for " + this.selectedAccessType,
        false,
        false
      );
    } else {
      let ruleArray = [];
      const OwnerPG = this.filterData[
        this.selectedAccessType.toUpperCase()
      ].find((c) => c.label === "ownerShip");
      const AccessUsers = this.filterData[
        this.selectedAccessType.toUpperCase()
      ].find((c) => c.label === "accessUsers");

      this.selectedOption.forEach((element) => {
        const obj = {
          DisplayName: element.label,
          InternalName: element.InternalName.split(":")[1],
          Value: element.selectedValue,
          RefObject: element.InternalName.split(":")[0],
        };
        ruleArray.push(obj);
      });

      const RuleObj = {
        ID: -1,
        TypeST: this.RuleType,
        ResourceType: this.selectedAccessType,
        IsActiveCH: "Yes",
        OwnerPG: {
          ID: OwnerPG.values.find((c) => c.label === OwnerPG.selectedValue).Id,
          Title: OwnerPG.values.find((c) => c.label === OwnerPG.selectedValue)
            .value,
        },
        RuleType: "new",
        edited: {UserEdited : false , IsActiveCH: false},
        Access:
          AccessUsers.selectedValue !== ""
            ? {
                results: AccessUsers.values
                  .filter((c) => AccessUsers.selectedValue.includes(c.label))
                  .map(
                    (o) =>
                      new Object({
                        ID: o.Id,
                        Title: o.value,
                      })
                  ),
              }
            : {},
        DisplayRules: ruleArray,
        Rule: JSON.stringify(ruleArray),
        DisplayOrder: this.filterData.RULES && this.filterData.RULES.length && this.filterData.RULES.length > 0 ?
          Math.max.apply(
            null,
            this.filterData.RULES.map((c) => c.DisplayOrder)
          ) + 1 : 1,
      };

      if(this.filterData.RULES.find((c) => c.ResourceType === RuleObj.ResourceType  &&  RuleObj.DisplayRules.map(d=>d.Value).sort().join(',') === c.DisplayRules.map(d=>d.Value).sort().join(','))) {
        this.common.showToastrMessage(
          this.constant.MessageType.warn,
          "Unable to add rule, rule already exist.",
          false,
          false
        );
        return false;
      } else {
        this.reArrangeRules(RuleObj);
      }

      this.selectedAccessType = this.constant.RulesType.DELIVERY;
      this.selectedOption = [];
      this.filterData.CM = [];
      this.filterData.DELIVERY = [];
      this.index = -1;
      setTimeout(() => {
        this.index = 1;
      }, 200);

      this.common.showToastrMessage(
        this.constant.MessageType.success,
        "New rule added sucessfully.",
        false,
        false
      );

      this.common.showToastrMessage(
        this.constant.MessageType.warn,
        "Rules are not saved. Please save",
        false,
        false
      );
    }
  }

  reArrangeRules(RuleObj) {
    if (this.filterData.RULES.length > 0) {

      let listArray = this.filterData.RULES.filter(
        (c) => c.DisplayRules[0].Value === RuleObj.DisplayRules[0].Value
      );
       if(listArray  && listArray.length > 0) {
        let index = -1;
        if(this.filterData.RULES.find((c) => c.DisplayRules.length >= RuleObj.DisplayRules.length)){
          index =  this.filterData.RULES.indexOf(this.filterData.RULES.find(
            (c) => c.DisplayRules[0].Value === RuleObj.DisplayRules[0].Value
          ));
        }
  
        this.filterData.RULES = [
          ...this.filterData.RULES.filter(
            (c) => c.DisplayRules[0].Value !== RuleObj.DisplayRules[0].Value
          ),
        ];
      
        listArray = [...this.InsertObjAtPosition(listArray, RuleObj)];
        for (var i = listArray.length - 1; i >= 0; i--) {
          this.filterData.RULES.splice(index > -1 ? index : 0, 0, listArray[i]);
        }
       }
       else {
         let RulesList =[]; 
        if(this.filterData.RULES[0].DisplayRules.length > RuleObj.DisplayRules.length){
          const RuleList = this.filterData.RULES.filter((c) => c.DisplayRules.length >= RuleObj.DisplayRules.length);
          const otherArrayList =  this.filterData.RULES.filter(c=> !RuleList.includes(c));
  
          RuleList.forEach(element => {
             listArray = this.filterData.RULES.filter(
              (c) => c.DisplayRules[0].Value === element.DisplayRules[0].Value
            );
            RulesList.push.apply(RulesList,listArray);  
          });
          RulesList.push(RuleObj);
          RulesList.push.apply(RulesList,otherArrayList);

          this.filterData.RULES = [...new Set(RulesList)];
        } else {
          this.filterData.RULES.splice(0, 0, RuleObj);
        }
      }
    } else {
      this.filterData.RULES.splice(0, 0, RuleObj);
    }
    this.filterData.RULES = [...this.filterData.RULES];
    this.filterRules();
  }

  InsertObjAtPosition(RULES, RuleObj) {
    if (RULES.find((c) => c.DisplayRules.length >= RuleObj.DisplayRules.length)) {
      let index =RULES.indexOf(RULES.find((c) => c.DisplayRules.length === RuleObj.DisplayRules.length))
      if(index > -1){
        RULES.splice(index, 0, RuleObj);
      }
      else{
        RULES.push(RuleObj);
      }
    } else {
      RULES.splice(0, 0, RuleObj);
    }
    return RULES;
  }

 
  // Remove Rule code
  RemoveRule(rowData) {
    this.common.clearToastrMessage();
    if (rowData.RuleType === "existing") {
      this.filterData.RULES.find((c) => c.ID === rowData.ID).IsActiveCH =
        this.filterData.RULES.find((c) => c.ID === rowData.ID).IsActiveCH ===
        "Yes"
          ? "No"
          : "Yes";
      
      rowData.IsActiveCH = rowData.IsActiveCH === "Yes" ? "No" : "Yes";

      this.filterData.RULES.find((c) => c.ID === rowData.ID).edited.IsActiveCH = rowData.IsActiveCH === "Yes" ? false : true;
      rowData.edited.IsActiveCH = rowData.IsActiveCH === "Yes" ? false : true;

      this.common.showToastrMessage(
        this.constant.MessageType.success,
        rowData.IsActiveCH === "Yes"
          ? "Rule recover sucessfully."
          : "Rule deleted sucessfully, Please click on recover icon to recover rule.",
        false,
        false
      );
      
      if(rowData.IsActiveCH !== "Yes") {
        this.common.showToastrMessage(
          this.constant.MessageType.warn,
          "Rules are not saved. Please save",
          false,
          false
        );
      }
    } else {
      const index = this.filterData.TEMPRULES.indexOf(rowData);
      if (index > -1) {
        this.filterData.TEMPRULES.splice(index, 1);
        this.filterData.RULES.splice(
          this.filterData.RULES.indexOf(
            this.filterData.RULES.find((c) => c === rowData)),
          1
        );
        this.common.showToastrMessage(
          this.constant.MessageType.success,
          "New added rule deleted sucessfully.",
          false,
          false
        );
      }
    }
    this.filterData.RULES = [...this.filterData.RULES];
    this.filterRules();
  }

  // display data on i icon click
  showDetails(event, value, target?: string) {
    if (this.panel.visible === true) {
      this.panel.hide();
    }
    setTimeout(() => {
      this.panel.show(event, target);
      this.PanelDetails = {
        OwnerPG: value.OwnerPG,
        Access:
          value.Access && value.Access.results
            ? value.Access.results.map((c) => c.Title).join(", ")
            : [],
      };
    }, 100);
  }

  //to edit rule user :   used dynamic dialog
  EditRule(dbRule) {
    if (
      (dbRule.ResourceType === this.constant.RulesType.DELIVERY &&
        this.filterData.DELIVERY.length === 0) ||
      (dbRule.ResourceType === this.constant.RulesType.CM &&
        this.filterData.CM.length === 0)
    ) {
      this.GetAccessData(dbRule.ResourceType);
    }
    const ref = this.dialogService.open(EditRuleUserComponent, {
      header: "Edit " + dbRule.ResourceType + " Rule",
      closable: false,
      width: "70vw",
      contentStyle: { "min-height": "30vh", "overflow-y": "visible" },
      data: {
        rule: dbRule,
        UserAccess:
          dbRule.ResourceType === this.constant.RulesType.CM
            ? this.filterData.CM
            : this.filterData.DELIVERY,
      },
    });
    ref.onClose.subscribe((rule) => {
      if (rule) {
        const OwnerPG = this.filterData[dbRule.ResourceType.toUpperCase()].find(
          (c) => c.label === "ownerShip"
        );
        const AccessUsers = this.filterData[
          dbRule.ResourceType.toUpperCase()
        ].find((c) => c.label === "accessUsers");

        dbRule.OwnerPG = {
          ID: OwnerPG.values.find((c) => c.label === OwnerPG.selectedValue).Id,
          Title: OwnerPG.values.find((c) => c.label === OwnerPG.selectedValue)
            .value,
        };
        dbRule.Access =
          AccessUsers.selectedValue !== ""
            ? {
                results: AccessUsers.values
                  .filter((c) => AccessUsers.selectedValue.includes(c.label))
                  .map(
                    (o) =>
                      new Object({
                        ID: o.Id,
                        Title: o.value,
                      })
                  ),
              }
            : {};
        dbRule.edited.UserEdited = dbRule.RuleType === "existing" ? true : false;
        this.common.showToastrMessage(
          this.constant.MessageType.success,
          "Current rule users updated sucessfully.",
          false,
          false
        );

        this.common.showToastrMessage(
          this.constant.MessageType.warn,
          "Rules are not saved. Please save",
          false,
          false
        );

        this.filterData.CM = [];
        this.filterData.DELIVERY = [];
        const index = this.filterData.RULES.indexOf(
          this.filterData.RULES.find((c) => c.ID === dbRule.ID)
        );
        if (index > -1) {
          this.filterData.RULES[index] = dbRule;
        }
        this.filterData.RULES = [...this.filterData.RULES];
        this.filterRules();
      }
    });
  }

  filterRules() {
    let  AllRules = JSON.parse(JSON.stringify(this.filterData.RULES));
      this.FilterArrayObj.forEach(element => {
        if(this.searchRulesForm.value[element.value] && this.searchRulesForm.value[element.value].length > 0) {
          AllRules = AllRules.filter( c=>  c.DisplayRules.filter(d=> d.DisplayName === element.label && this.searchRulesForm.value[element.value].includes(d.Value)).length > 0)   
       }
      });
    
    
    if (
      this.selectedViewAccessType === this.constant.RulesType.DELIVERY ||
      this.selectedViewAccessType === this.constant.RulesType.CM
    ) {
      this.filterData.TEMPRULES = [
        ...AllRules.filter(
          (c) => c.ResourceType === this.selectedViewAccessType
        ),
      ];
    } else {
      this.filterData.TEMPRULES = [...AllRules];
    }
  }

  async SaveRules() {
    this.loaderenable = true;
    this.resetProjectFilters();
    await this.addAccessService.saveRules(this.filterData,this.RuleType);


    this.loaderenable = false;
   
  }


  onRowReorder(event){
    let dragMainIndex= -1;
    const DragObj = this.filterData.RULES.find(c=> c.DisplayOrder === this.filterData.TEMPRULES[event.dropIndex].DisplayOrder  && c.ID === this.filterData.TEMPRULES[event.dropIndex].ID);
    if(DragObj){
      dragMainIndex = this.filterData.RULES.indexOf(DragObj);
    }
    const IndexDropObj = this.filterData.RULES.indexOf(this.filterData.RULES.find(c=> c.DisplayOrder === this.filterData.TEMPRULES[event.dragIndex].DisplayOrder  && c.ID === this.filterData.TEMPRULES[event.dragIndex].ID)); 
    
    if (dragMainIndex > -1) {
      this.filterData.RULES.splice(dragMainIndex, 1);

      if(IndexDropObj > -1){
        this.filterData.RULES.splice(IndexDropObj,0, DragObj);
      }
    }
  }


  removeOption(value){
    this.selectedOption.splice(this.selectedOption.indexOf(this.selectedOption.find(c=>c === value)),1)
  }
}
