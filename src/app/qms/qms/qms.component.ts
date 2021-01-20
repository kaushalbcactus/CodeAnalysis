import { Component, OnInit } from "@angular/core";
import { QMSConstantsService } from "./services/qmsconstants.service";
import { GlobalService } from "../../Services/global.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MenuItem } from "primeng/api";

@Component({
  selector: "app-qms",
  templateUrl: "./qms.component.html",
  styleUrls: ["./qms.component.css"],
})
export class QMSComponent implements OnInit {
  activeItem: MenuItem;
  constructor(
    public qmsConstantsService: QMSConstantsService,
    public globalService: GlobalService,
    public activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.globalService.currentTitle = "QMS";
    }, 100);

    this.activeItem = this.qmsConstantsService.qmsTab.list.find(c=>  this.router.url.includes(c.routerLink))
      ?this.qmsConstantsService.qmsTab.list.find(c=>  this.router.url.includes(c.routerLink))
      : this.qmsConstantsService.qmsTab.list[0];

    // this.initialize();
  }

   onActivate() {
    console.log(this.activeItem)
    setTimeout(() => {
    this.activeItem = this.qmsConstantsService.qmsTab.list.find(c=>  this.router.url.includes(c.routerLink))
      ?this.qmsConstantsService.qmsTab.list.find(c=>  this.router.url.includes(c.routerLink))
      : this.qmsConstantsService.qmsTab.list[0];

      console.log(this.activeItem)
    }, 100);
  }
}
