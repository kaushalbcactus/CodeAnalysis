import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-conflict-allocations',
  templateUrl: './conflict-allocations.component.html',
  styleUrls: ['./conflict-allocations.component.css']
})
export class ConflictAllocationsComponent implements OnInit {
  resources: any;
  constructor(public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.resources = this.config.data;
    console.log(this.resources);
  }

}
