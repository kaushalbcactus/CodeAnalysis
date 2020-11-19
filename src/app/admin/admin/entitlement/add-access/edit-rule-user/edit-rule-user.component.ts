import { Component, OnInit } from "@angular/core";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";

@Component({
  selector: "app-edit-rule-user",
  templateUrl: "./edit-rule-user.component.html",
  styleUrls: ["./edit-rule-user.component.css"],
})
export class EditRuleUserComponent implements OnInit {
  rule: any;
  RuleTypeDD: any;
  rules=[];
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    this.rule = this.config.data.rule;
    this.rules.push(this.rule);
    this.RuleTypeDD = this.config.data.UserAccess;
    this.RuleTypeDD[0].selectedValue = this.rule.OwnerPG.Title;
    this.RuleTypeDD[1].selectedValue = this.rule.Access.results
      ? this.rule.Access.results.map((c) => c.Title)
      : "";
  }

  saveDetails() {
    const data = {
      rule: this.rule,
      accessDetails: this.RuleTypeDD,
    };

    this.ref.close(data);
  }

  cancel() {
    this.ref.close();
  }
}
