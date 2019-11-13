import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../Services/data.service';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { MessageService } from 'primeng/api';

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
    private messageService: MessageService
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
  }
}
