import { Component, OnInit } from '@angular/core';
import { QMSConstantsService } from './services/qmsconstants.service';
import { GlobalService } from '../../Services/global.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-qms',
  templateUrl: './qms.component.html',
  styleUrls: ['./qms.component.css']
})

export class QMSComponent implements OnInit {
  constructor(
    public qmsConstantsService: QMSConstantsService,
    public globalService: GlobalService,
    public activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.globalService.currentTitle = 'QMS';
    // this.initialize();
  }
}
