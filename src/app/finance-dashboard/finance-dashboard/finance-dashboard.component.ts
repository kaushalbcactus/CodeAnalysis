import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { FdConstantsService } from "../fdServices/fd-constants.service";
import { GlobalService } from "src/app/Services/global.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-finance-dashboard",
  templateUrl: "./finance-dashboard.component.html",
  styleUrls: ["./finance-dashboard.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
  // Loadder
  isPSInnerLoaderHidden: boolean;

  tabMenuList: any = [];
  constructor(
    public fdConstantsService: FdConstantsService,
    public globalObject: GlobalService,
    public activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    localStorage.clear();
    this.isPSInnerLoaderHidden = false;
    setTimeout(() => {
      this.globalObject.currentTitle = "Finance Dashboard";
    }, 200);
  
 
    this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    
    this.fdConstantsService.mainRouter = this.fdConstantsService.fdComponent.tabs.topMenu.find(
      (c) => this.router.url.includes(c.routerLink)
    )
      ? this.fdConstantsService.fdComponent.tabs.topMenu.find((c) =>
          this.router.url.includes(c.routerLink)
        )
      : this.fdConstantsService.fdComponent.tabs.topMenu[0];
  }

  ngOnDestroy() {
    console.log("in on destroy");
  }
}
