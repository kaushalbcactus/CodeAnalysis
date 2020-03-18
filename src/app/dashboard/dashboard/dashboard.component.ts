import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../Services/global.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // value: number = 30;
  constructor(public globalService: GlobalService) { }

  ngOnInit() {
    this.globalService.currentTitle = "Dashboard"
  }

}
