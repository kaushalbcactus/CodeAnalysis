import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(public globalService: GlobalService) { }

  ngOnInit() {
  }

}
