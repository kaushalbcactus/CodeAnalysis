import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
@Component({
  selector: "app-client-feedback",
  templateUrl: "./client-feedback.component.html",
  styleUrls: ["./client-feedback.component.css"],
})
export class ClientFeedbackComponent implements OnInit {
  internalRouter: MenuItem;
  public navLinks = [
    { routerLink: "clientDissatisfaction", label: "Dissatisfaction" , command: (event) => {this.internalRouter = event.item} },
    { routerLink: "cfpositiveFeedback", label: "Positive" , command: (event) => {this.internalRouter = event.item}},
  ];
  // Initialize tab value
  constructor(private router: Router) {}

  ngOnInit() {
    this.internalRouter = this.navLinks.find((c) =>
      this.router.url.includes(c.routerLink)
    )
      ? this.navLinks.find((c) => this.router.url.includes(c.routerLink))
      : this.navLinks[0];
  }
}
