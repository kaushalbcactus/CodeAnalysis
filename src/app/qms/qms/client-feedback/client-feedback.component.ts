import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-feedback',
  templateUrl: './client-feedback.component.html',
  styleUrls: ['./client-feedback.component.css']
})
export class ClientFeedbackComponent implements OnInit {
  public navLinks = [ {routerLink: ['/qms/clientFeedback/cfpositiveFeedback'], label: 'Positive'},
                      {routerLink: ['/qms/clientFeedback/clientDissatisfaction'], label: 'Dissatisfaction'},
                    ];
  // Initialize tab value
  public selectedTab = 'externalFeedback';
  constructor() { }

  ngOnInit() {
  }

}
