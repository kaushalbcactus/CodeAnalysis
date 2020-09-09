import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-rule',
  templateUrl: './show-rule.component.html',
  styleUrls: ['./show-rule.component.css']
})
export class ShowRuleComponent implements OnInit {
  @Input() ruleItems;
  @Input() rulesColumns;
  ruleTableArray =[];
  rulesCols =[];
  constructor() { }

  ngOnInit() {
    debugger
    this.ruleTableArray = this.ruleItems;
    this.rulesCols = this.rulesColumns;
    
  }

}
