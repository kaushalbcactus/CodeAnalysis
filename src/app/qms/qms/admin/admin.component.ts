import { Component, OnInit } from "@angular/core";
import { GlobalService } from "src/app/Services/global.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { CommonService } from "src/app/Services/common.service";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  internalRouter: MenuItem;
  public hideRestrospective = true;
  public hideScorecard = true;
  public navLinks = [];
  viewMenu: boolean =false;
  constructor(
    private router: Router,
    private global: GlobalService,
    private globalConstant: ConstantsService,
    private spService: SPOperationService,
    private common: CommonService
  ) {}

  async ngOnInit() {
    this.common.SetNewrelic("QMS", "admin", "CurrentUserInfo");
    const result = await this.spService.getUserInfo(
      this.global.currentUser.userId
    );
    this.global.currentUser.groups = result.Groups.results
      ? result.Groups.results
      : [];
    const isQMSAdmin = this.global.currentUser.groups.filter(
      (u) => u.Title === this.globalConstant.Groups.QMSAdmin
    );
    const isQMSScorecardReader = this.global.currentUser.groups.filter(
      (u) => u.Title === this.globalConstant.Groups.QMSViewScorecard
    );
    if (isQMSAdmin.length) {
      this.navLinks.push({
        routerLink: "retrospectiveFeedback",
        label: "Retrospective Feedback",
        command: (event) => {
          this.internalRouter = event.item;
        },
      });
    }
    if (isQMSScorecardReader.length) {
      this.navLinks.push({
        routerLink: "scorecards",
        label: "Scorecards",
        command: (event) => {
          this.internalRouter = event.item;
        },
      });
    }

      this.internalRouter = this.navLinks.find((c) =>
      this.router.url.includes(c.routerLink)
    )
      ? this.navLinks.find((c) => this.router.url.includes(c.routerLink))
      : this.navLinks[0];
    
      this.viewMenu=true;
    
  }
}
