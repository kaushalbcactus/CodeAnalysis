import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AdminObjectService } from "../services/admin-object.service";
import { AdminConstantService } from "../services/admin-constant.service";
import { GlobalService } from "src/app/Services/global.service";
import { MenuItem } from "primeng/api";
import { Router } from "@angular/router";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  activeItem: MenuItem;
  /**
   * @description
   * Entry point for all admin module.
   */
  constructor(
    public adminObject: AdminObjectService,
    public adminConstantService: AdminConstantService,
    public globalService: GlobalService,
    private router: Router
  ) {}
  ngOnInit() {

    localStorage.clear();
    setTimeout(() => {
      this.globalService.currentTitle = "Admin";
    }, 100);

    this.adminConstantService.mainRouter = this.adminConstantService.DefaultMenu.List.find(
      (c) => this.router.url.includes(c.routerLink)
    )
      ? this.adminConstantService.DefaultMenu.List.find((c) =>
          this.router.url.includes(c.routerLink)
        )
      : this.adminConstantService.DefaultMenu.List[0];
  }
}
