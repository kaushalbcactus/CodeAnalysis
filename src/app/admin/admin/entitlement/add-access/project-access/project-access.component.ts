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
import { GlobalService } from "src/app/Services/global.service";
import { OverlayPanel } from "primeng";

@Component({
  selector: "app-project-access",
  templateUrl: "./project-access.component.html",
  styleUrls: ["./project-access.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectAccessComponent implements OnInit {
  @ViewChild("showRuleDetails", { static: false }) panel: OverlayPanel;
  @ViewChild("flipcard", { static: false }) myDivElementRef: ElementRef;
  @Input() RuleType: string;
  filterData = {
    PRACTICEAREA: [],
    CLE: [],
    SUBDIVISION: [],
    DELIVERYTYPE: [],
    RULES: [],
    DBRULES: [],
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
    practiceArea: [""],
    cle: [""],
    subDivision: [""],
    deliveryType: [""],
  });

  AccessType = [
    {
      label: this.constant.RulesType.DELIVERY,
      value: this.constant.RulesType.DELIVERY,
    },
    { label: this.constant.RulesType.CM, value: this.constant.RulesType.CM },
  ];
  headerName: string = "";
  selectedAccessType: string = this.AccessType[0].value;
  PanelDetails: any;
  constructor(
    public common: CommonService,
    private constant: ConstantsService,
    public fb: FormBuilder,
    public addAccessService: AddAccessService,
    private globalObject: GlobalService
  ) {}

  ngOnInit() {
    if (this.RuleType === this.constant.RulesType.PROJECT) {
      this.headerName = "Add Project Rules";
    } else if (this.RuleType === this.constant.RulesType.SOW) {
      this.headerName = "Add SOW Rules";
    } else {
      this.headerName = "Add CD / TA Rules";
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
    console.log(this.filterData);
    this.loaderenable = false;

    this.addAccessService.getPrametersDropdownData(
      this.filterData.RULEPARAMETERS
    );

    console.log("filterData");

    console.log(this.filterData);
  }

  dragStart(event, option) {
    this.draggedOption = option;
  }

  drop(event) {
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
                      label: o["Title"],
                      value: o["Title"],
                    })
                )
              : [],
          selectedValue: "",
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
          this.GetAccessData();
        }
      }

      this.draggedOption = null;
    }
  }

  GetAccessData() {
    for (var i = 0; i < 2; i++) {
      debugger;
      const data = {
        label: i === 0 ? "ownerShip" : "accessUsers",
        selectedValue: "",
        values:
          i === 0
            ? this.constant.RulesType.DELIVERY === this.selectedAccessType
              ? this.filterData.RESOURCECATEGORIZATION.filter(
                  (c) => c.RoleCH === this.constant.RoleType.DELIVERY2
                ).map(
                  (o) =>
                    new Object({
                      label: o.UserNamePG.Title,
                      value: o.UserNamePG.Title,
                      Id: o.UserNamePG.ID,
                    })
                )
              : this.filterData.RESOURCECATEGORIZATION.filter(
                  (c) => c.RoleCH === this.constant.RoleType.CM2
                ).map(
                  (o) =>
                    new Object({
                      label: o.UserNamePG.Title,
                      value: o.UserNamePG.Title,
                      Id: o.UserNamePG.ID,
                    })
                )
            : this.constant.RulesType.DELIVERY === this.selectedAccessType
            ? this.filterData.RESOURCECATEGORIZATION.filter(
                (c) => c.RoleCH === this.constant.RoleType.DELIVERY1
              ).map(
                (o) =>
                  new Object({
                    label: o.UserNamePG.Title,
                    value: o.UserNamePG.Title,
                    Id: o.UserNamePG.ID,
                  })
              )
            : this.filterData.RESOURCECATEGORIZATION.filter(
                (c) => c.RoleCH === this.constant.RoleType.CM1
              ).map(
                (o) =>
                  new Object({
                    label: o.UserNamePG.Title,
                    value: o.UserNamePG.Title,
                    Id: o.UserNamePG.ID,
                  })
              ),
      };
      this.selectedAccessType === this.constant.RulesType.DELIVERY
        ? this.filterData.DELIVERY.push(data)
        : this.filterData.CM.push(data);
    }
  }

  onTabClose(event) {}

  onTabOpen(event) {
    if (event.index === 0) {
      this.subloaderenable = true;

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
    this.index = 1;
  }

  resetProjectFilters() {
    this.index = -1;
    this.searchRulesForm.reset();
  }

  CheckDataOnAccessType() {
    if (this.selectedOption.length > 0) {
      if (
        (this.selectedAccessType === this.constant.RulesType.DELIVERY &&
          this.filterData.DELIVERY.length === 0) ||
        (this.selectedAccessType === this.constant.RulesType.CM &&
          this.filterData.CM.length === 0)
      ) {
        this.GetAccessData();
      }
    }
  }

  checkNext(value, index) {
    console.log(value);
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
                    label: o["Title"],
                    value: o["Title"],
                  })
              )
          : [];
      }
    }
  }

  addRule() {
    console.log(this.selectedOption);
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
          InternalName: element.InternalName,
          Value: element.selectedValue,
          RefObject: "Current",
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
        edited: false,
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
      };

      console.log(RuleObj);
      this.filterData.RULES.push(RuleObj);
      this.selectedAccessType = this.constant.RulesType.DELIVERY;
      this.selectedOption = [];
      this.filterData.CM = [];
      this.filterData.DELIVERY = [];

      this.common.showToastrMessage(
        this.constant.MessageType.success,
        "New rule added sucessfully.",
        false,
        false
      );

    }
  }
  RemoveRule(rowData) {
    if (rowData.RuleType === "existing") {
      rowData.IsActiveCH = rowData.IsActiveCH === "Yes" ? "No" : "Yes";
      rowData.edited = rowData.IsActiveCH === "Yes" ? false : true;
    } else {
      const  index = this.filterData.RULES.indexOf(rowData) 
      if(index> -1){
        this.filterData.RULES.splice(index, 1);
      }
    }
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
}
