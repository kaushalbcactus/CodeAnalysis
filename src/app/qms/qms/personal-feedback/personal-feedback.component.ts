import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../Services/data.service';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { QMSCommonService } from '../services/qmscommon.service';
import { CommonService } from 'src/app/Services/common.service';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-personal-feedback',
  templateUrl: './personal-feedback.component.html',
  styleUrls: ['./personal-feedback.component.css']
})
export class PersonalFeedbackComponent implements OnInit {
  internalRouter : MenuItem
  public navLinks = [
    { routerLink: 'internalFeedback', label: 'Feedback For Me' , command: (event) => {this.internalRouter = event.item} },
    { routerLink: 'externalFeedback', label: 'Client Dissatisfaction' , command: (event) => {this.internalRouter = event.item} },
    { routerLink: 'positiveFeedback', label: 'Positive Feedback' , command: (event) => {this.internalRouter = event.item} },
    { routerLink: 'feedbackByMe', label: 'Feedback By Me', command: (event) => {this.internalRouter = event.item} },
  ];
  // Initialize tab value
  public selectedTab = 'Feedback For Me';
  constructor(
    private router: Router,
    private data: DataService,
    private qmsConstatsService: QMSConstantsService,
    private qmsCommonService: QMSCommonService,
    private common: CommonService
  ) { }

  ngOnInit() {
    this.internalRouter = this.navLinks.find(c=>  this.router.url.includes(c.routerLink))
      ?this.navLinks.find(c=>  this.router.url.includes(c.routerLink))
      : this.navLinks[0];
  }

  /**
   * Receive emit of Filters component and call child component function to pass filter object
   *
   * @param {*} obj - Emitted obect from filter component
   * @memberof PersonalFeedbackComponent
   */
  personalFeedbackCalled(filterObj) {
    this.data.changeFilterObj(filterObj);
    switch (this.router.url) {
      case '/qms/personalFeedback/internalFeedback':
        this.qmsCommonService.selectedComponent.initialisePFInternal();
        break;
      case '/qms/personalFeedback/externalFeedback':
        this.qmsCommonService.selectedComponent.initialisePFCD();
        break;
      case '/qms/personalFeedback/positiveFeedback':
        this.qmsCommonService.selectedComponent.initialisePFPositive();
        break;
      case '/qms/personalFeedback/feedbackByMe':
        this.qmsCommonService.selectedComponent.initialiseFeedback();
        break;
    }

  }
}
