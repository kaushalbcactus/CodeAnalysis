import { Component, OnInit } from '@angular/core';
import { CAGlobalService } from './caservices/caglobal.service';
@Component({
  selector: 'app-ca',
  templateUrl: './ca.component.html',
  styleUrls: ['./ca.component.css']
})
export class CaComponent implements OnInit {

  constructor(public globalService: CAGlobalService) { }

  
  ngOnInit() {
    this.globalService.isUnallocatedChecked = false;
    this.globalService.isAllocatedChecked = false;
  }

}
