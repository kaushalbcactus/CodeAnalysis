import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-feedback',
  templateUrl: './client-feedback.component.html',
  styleUrls: ['./client-feedback.component.css']
})
export class ClientFeedbackComponent implements OnInit {
  public navLinks = [  {routerLink: ['/qms/clientFeedback/clientDissatisfaction'], label: 'Dissatisfaction'},
                       {routerLink: ['/qms/clientFeedback/cfpositiveFeedback'], label: 'Positive'},
                    ];
  // Initialize tab value
  public selectedTab = 'externalFeedback';
  constructor() { }

  ngOnInit() {
  }

}
