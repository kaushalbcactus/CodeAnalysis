import { Component, OnInit } from "@angular/core";
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { CommonService } from "src/app/Services/common.service";

@Component({
  selector: "app-cm-delivey-view",
  templateUrl: "./cm-delivey-view.component.html",
  styleUrls: ["./cm-delivey-view.component.css"],
})
export class CmDeliveyViewComponent implements OnInit {
 



  constructor(
    public common: CommonService,
    public pmObject: PMObjectService,
  ) {}

  ngOnInit() {}
}
