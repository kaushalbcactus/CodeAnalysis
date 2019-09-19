import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../Services/data.service';

@Component({
  selector: 'app-personal-feedback',
  templateUrl: './personal-feedback.component.html',
  styleUrls: ['./personal-feedback.component.css']
})
export class PersonalFeedbackComponent implements OnInit {
  public navLinks = [ {routerLink: ['/qms/personalFeedback/internalFeedback'], label: 'Feedback For Me'},
                      {routerLink: ['/qms/personalFeedback/externalFeedback'], label: 'Client Dissatisfaction'},
                      {routerLink: ['/qms/personalFeedback/positiveFeedback'], label: 'Positive Feedback'},
                      {routerLink: ['/qms/personalFeedback/feedbackByMe'], label: 'Feedback By Me'},
                    ];
  // Initialize tab value
  public selectedTab = 'Feedback For Me';
  constructor(private router: Router, private data: DataService) { }

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
        this.router.navigate([this.router.url]);
  }
}
