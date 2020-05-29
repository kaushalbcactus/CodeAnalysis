import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-date-user-capacity',
  templateUrl: './date-user-capacity.component.html',
  styleUrls: ['./date-user-capacity.component.css']
})
export class DateUserCapacityComponent implements OnInit {
  @Input() tasks: any;
  constructor() { }

  ngOnInit() {
    this.tasks = [...this.tasks];
  }

}
