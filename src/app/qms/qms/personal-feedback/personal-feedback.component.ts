import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../Services/data.service';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { MessageService } from 'primeng/api';
import { QMSCommonService } from '../services/qmscommon.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-personal-feedback',
  templateUrl: './personal-feedback.component.html',
  styleUrls: ['./personal-feedback.component.css']
})
export class PersonalFeedbackComponent implements OnInit {
  public navLinks = [
    { routerLink: ['internalFeedback'], label: 'Feedback For Me' },
    { routerLink: ['externalFeedback'], label: 'Client Dissatisfaction' },
    { routerLink: ['positiveFeedback'], label: 'Positive Feedback' },
    { routerLink: ['feedbackByMe'], label: 'Feedback By Me' },
  ];
  // Initialize tab value
  public selectedTab = 'Feedback For Me';
  constructor(
    private router: Router,
    private data: DataService,
    private qmsConstatsService: QMSConstantsService,
    private messageService: MessageService,
    private qmsCommonService: QMSCommonService,
    private common: CommonService
  ) { }

  ngOnInit() {
  }

  /**
   * Receive emit of Filters component and call child component function to pass filter object
   *
   * @param {*} obj - Emitted obect from filter component
   * @memberof PersonalFeedbackComponent
   */
  personalFeedbackCalled(filterObj) {
    this.data.changeFilterObj(filterObj);
    //this.router.navigate([this.router.url]);
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
