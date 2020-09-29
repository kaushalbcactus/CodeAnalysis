import {
  Component,
  OnInit,
  ViewEncapsulation
} from "@angular/core";
import { ConstantsService } from 'src/app/Services/constants.service';


@Component({
  selector: "app-add-access",
  templateUrl: "./add-access.component.html",
  styleUrls: ["./add-access.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AddAccessComponent implements OnInit {
  index: number = 0;
  ruleType: string = this.constants.RulesType.PROJECT;
  constructor(
    public constants : ConstantsService
  ) {}

  ngOnInit() {}

  onTabClose(event) {
    this.index = -1;
  }

  onTabOpen(event) {
    this.index = event.index;
    if (this.index === 1) {
      this.ruleType = this.constants.RulesType.SOW;
    } else if (this.index === 2) {
      this.ruleType = this.constants.RulesType.CD;
    }else if (this.index === 3) {
      this.ruleType = this.constants.RulesType.PF;
    } else {
      this.ruleType = this.constants.RulesType.PROJECT;
    }
  }
}
