import { Component, OnInit } from '@angular/core';
import { CAGlobalService } from './caservices/caglobal.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-ca',
  templateUrl: './ca.component.html',
  styleUrls: ['./ca.component.css']
})
export class CaComponent implements OnInit {

  constructor(public globalService: CAGlobalService) { }
  items: MenuItem[];

  ngOnInit() {
    // this.globalService.isUnallocatedChecked = false;
    // this.globalService.isAllocatedChecked = false;

    this.items = [
      { label: 'Unallocated', routerLink: ['unallocated'] },
      { label: 'Allocated', routerLink: ['allocated'] },

    ];

  }

}
