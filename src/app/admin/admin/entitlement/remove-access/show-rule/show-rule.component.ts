import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-show-rule',
  templateUrl: './show-rule.component.html',
  styleUrls: ['./show-rule.component.css']
})
export class ShowRuleComponent implements OnInit,OnChanges {
  @Input() ruleItems;
  @Input() rulesColumns;
  ruleTableArray =[];
  rulesCols =[];
  constructor() { }

  ngOnChanges(changes: SimpleChanges){
    console.log(changes);
    if(!changes.ruleItems.firstChange) {
      this.ruleTableArray = changes.ruleItems.currentValue;
    }
  }

  ngOnInit() {
    this.ruleTableArray = this.ruleItems;
    this.rulesCols = this.rulesColumns;
  }
}
