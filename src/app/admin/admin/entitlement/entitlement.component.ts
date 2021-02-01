import { Component, OnInit } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { AdminObjectService } from '../../services/admin-object.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-entitlement',
  templateUrl: './entitlement.component.html',
  styleUrls: ['./entitlement.component.css']
})
export class EntitlementComponent implements OnInit {
  constructor(
    private spServices: SPOperationService,
    private globalObject: GlobalService,
    public adminObject: AdminObjectService,
    public adminConstantService: AdminConstantService,
    public commonService: CommonService,
    private constants: ConstantsService,
    private router: Router,
    ) { }

  async ngOnInit() {
    this.constants.loader.isPSInnerLoaderHidden = true;
    await this.checkUserPresentInGroup();

    this.adminConstantService.internalRouter = this.adminConstantService.EntitleMentMenu.List.find((c) =>
    this.router.url.includes(c.routerLink)
  )
    ? this.adminConstantService.EntitleMentMenu.List.find((c) => this.router.url.includes(c.routerLink))
    : this.adminConstantService.EntitleMentMenu.List[0];
  }
  async checkUserPresentInGroup() {
    const isPresent = false;
    this.commonService.SetNewrelic('admin', 'entitlement', 'checkUserPresentInGroup', 'GET');
    const userInfo = await this.spServices.getUserInfo(this.globalObject.currentUser.userId);
    if (userInfo && userInfo.hasOwnProperty('Groups')) {
      if (userInfo.Groups && userInfo.Groups.results && userInfo.Groups.results.length) {
        console.log(userInfo.Groups.results);
      }
    }
  }
}
