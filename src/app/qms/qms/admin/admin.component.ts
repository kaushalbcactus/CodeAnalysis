import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public hideRestrospective = true;
  public hideScorecard = true;
  public navLinks = [];
  constructor(private global: GlobalService, private globalConstant: ConstantsService, private spService: SPOperationService,
              private common: CommonService) { }

  async ngOnInit() {
    this.common.SetNewrelic('QMS', 'admin', 'CurrentUserInfo');
    const result = await this.spService.getUserInfo(this.global.currentUser.userId);
    this.global.currentUser.groups = result.Groups.results ? result.Groups.results : [];
    const isQMSAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSAdmin);
    const isQMSScorecardReader = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSViewScorecard);
    if (isQMSAdmin.length) {
      this.navLinks.push({ routerLink: ['/qms/adminView/retrospectiveFeedback'], label: 'Retrospective Feedback', value: 'Retrospective Feedback' });
    }
    if (isQMSScorecardReader.length) {
      this.navLinks.push({ routerLink: ['/qms/adminView/scorecards'], label: 'Scorecards', value: 'Scorecards' });
    }
  }
}
